import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { analyzeResumeMatch, generateOptimizedResume } from '../services/ai-analyzer.js';
import { incrementMetric } from '../services/metrics.js';
import { getFirestore, getStorageBucket, getTimestamp } from '../services/firestore.js';
import { parseResumeBuffer } from '../services/parser.js';

const router = express.Router();

// Analyze resume against job
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { resume_id, job_id } = req.body;

    if (!resume_id || !job_id) {
      return res.status(400).json({ error: 'Resume ID and Job ID required' });
    }

    const db = getFirestore();
    const resumeDoc = await db.collection('resumes').doc(resume_id).get();
    if (!resumeDoc.exists || resumeDoc.data().userId !== req.user.id) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const jobDoc = await db.collection('jobs').doc(job_id).get();
    if (!jobDoc.exists || jobDoc.data().userId !== req.user.id) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const resume = resumeDoc.data();
    const job = jobDoc.data();

    let resumeText = '';
    let parsedData = null;
    if (resume.storagePath && resume.originalFormat) {
      try {
        const bucket = getStorageBucket();
        const [buffer] = await bucket.file(resume.storagePath).download();
        const parsed = await parseResumeBuffer(buffer, `.${resume.originalFormat}`);
        resumeText = parsed.text;
        parsedData = parsed.parsedData;
      } catch (error) {
        resumeText = '';
        parsedData = null;
      }
    }
    if (!resumeText && resume.parsedText) {
      const fallbackParts = [
        resume.parsedText.summary || '',
        ...(resume.parsedText.experience || []),
        ...(resume.parsedText.skills || []),
        ...(resume.parsedText.education || [])
      ];
      resumeText = fallbackParts.filter(Boolean).join('\n');
    }

    // Perform AI analysis
    const analysis = await analyzeResumeMatch(
      resumeText,
      parsedData || {},
      job.description,
      job.parsed_data || {}
    );

    const Timestamp = getTimestamp();
    const analysisRef = db.collection('analyses').doc();
    await analysisRef.set({
      userId: req.user.id,
      resumeId: resume_id,
      jobId: job_id,
      overall_score: analysis.overallScore,
      skills_score: analysis.skillsScore,
      experience_score: analysis.experienceScore,
      keyword_score: analysis.keywordScore,
      analysis_data: analysis,
      resume_name: resume.name,
      job_title: job.title,
      company: job.company || null,
      created_at: Timestamp.now()
    });

    res.json({
      id: analysisRef.id,
      ...analysis
    });
  } catch (error) {
    console.error('Analysis error:', error?.message || error);
    res.status(500).json({ error: 'Failed to analyze resume' });
  }
});

// Generate optimized resume
router.post('/optimize', authenticateToken, async (req, res) => {
  try {
    const { resume_id, job_id } = req.body;

    const db = getFirestore();
    const resumeDoc = await db.collection('resumes').doc(resume_id).get();
    const jobDoc = await db.collection('jobs').doc(job_id).get();

    if (!resumeDoc.exists || resumeDoc.data().userId !== req.user.id) {
      return res.status(404).json({ error: 'Resume or job not found' });
    }
    if (!jobDoc.exists || jobDoc.data().userId !== req.user.id) {
      return res.status(404).json({ error: 'Resume or job not found' });
    }

    const resume = resumeDoc.data();
    const job = jobDoc.data();

    let resumeText = '';
    let parsedData = null;
    if (resume.storagePath && resume.originalFormat) {
      try {
        const bucket = getStorageBucket();
        const [buffer] = await bucket.file(resume.storagePath).download();
        const parsed = await parseResumeBuffer(buffer, `.${resume.originalFormat}`);
        resumeText = parsed.text;
        parsedData = parsed.parsedData;
      } catch (error) {
        resumeText = '';
        parsedData = null;
      }
    }
    if (!resumeText && resume.parsedText) {
      const fallbackParts = [
        resume.parsedText.summary || '',
        ...(resume.parsedText.experience || []),
        ...(resume.parsedText.skills || []),
        ...(resume.parsedText.education || [])
      ];
      resumeText = fallbackParts.filter(Boolean).join('\n');
    }

    const analysisSnap = await db.collection('analyses')
      .where('resumeId', '==', resume_id)
      .where('jobId', '==', job_id)
      .orderBy('created_at', 'desc')
      .limit(1)
      .get();

    const analysis = analysisSnap.empty ? null : analysisSnap.docs[0].data().analysis_data;

    // Generate optimized resume
    const optimizedResume = await generateOptimizedResume(
      resumeText,
      parsedData || {},
      job.description,
      job.parsed_data || {},
      analysis
    );

    const Timestamp = getTimestamp();
    const templateConfig = resume.template_config || {};
    await db.collection('resumes').doc(resume_id).set({
      optimizedVersions: {
        [job_id]: {
          template: resume.template_id || 'premium_professional',
          industryVariant: templateConfig.variant || null,
          content: optimizedResume,
          atsScore: optimizedResume?.atsScore || null,
          createdAt: Timestamp.now()
        }
      },
      updatedAt: Timestamp.now()
    }, { merge: true });

    await incrementMetric('optimized_resumes');
    res.json({ optimizedResume });
  } catch (error) {
    console.error('Optimization error:', error?.message || error);
    res.status(500).json({ error: 'Failed to optimize resume' });
  }
});

// Get analysis history
router.get('/history', authenticateToken, (req, res) => {
  (async () => {
    try {
      const db = getFirestore();
      const snapshot = await db.collection('analyses')
        .where('userId', '==', req.user.id)
        .orderBy('created_at', 'desc')
        .limit(50)
        .get();

      const analyses = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          overall_score: data.overall_score,
          created_at: data.created_at?.seconds || null,
          resume_name: data.resume_name || 'Resume',
          job_title: data.job_title || 'Job',
          company: data.company || null
        };
      });

      res.json({ analyses });
    } catch (error) {
      console.error('Get history error:', error?.message || error);
      res.status(500).json({ error: 'Failed to get analysis history' });
    }
  })();
});

// Get specific analysis
router.get('/:id', authenticateToken, (req, res) => {
  (async () => {
    try {
      const db = getFirestore();
      const doc = await db.collection('analyses').doc(req.params.id).get();
      if (!doc.exists || doc.data().userId !== req.user.id) {
        return res.status(404).json({ error: 'Analysis not found' });
      }
      const data = doc.data();
      res.json({
        ...data,
        data: data.analysis_data
      });
    } catch (error) {
      console.error('Get analysis error:', error?.message || error);
      res.status(500).json({ error: 'Failed to get analysis' });
    }
  })();
});

export default router;
