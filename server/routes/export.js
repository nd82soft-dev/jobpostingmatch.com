import express from 'express';
import { authenticateToken, checkSubscription } from '../middleware/auth.js';
import { generatePDF } from '../services/pdf-generator.js';
import { generateDOCX } from '../services/docx-generator.js';
import { incrementMetric } from '../services/metrics.js';
import { getFirestore, getStorageBucket, getTimestamp } from '../services/firestore.js';
import { parseResumeBuffer } from '../services/parser.js';
import fs from 'fs';

const router = express.Router();

function pickLatestOptimized(optimizedVersions) {
  if (!optimizedVersions) return null;
  let latest = null;
  let latestSeconds = 0;
  Object.values(optimizedVersions).forEach((version) => {
    const seconds = version?.createdAt?.seconds || 0;
    if (seconds > latestSeconds) {
      latest = version;
      latestSeconds = seconds;
    }
  });
  return latest;
}

async function resolveResumeData(resume) {
  const optimized = pickLatestOptimized(resume.optimizedVersions);
  if (optimized?.content) {
    return optimized.content;
  }

  if (resume.storagePath && resume.originalFormat) {
    try {
      const bucket = getStorageBucket();
      const [buffer] = await bucket.file(resume.storagePath).download();
      const parsed = await parseResumeBuffer(buffer, `.${resume.originalFormat}`);
      const data = parsed.parsedData || {};
      if (!data.name && resume.name) {
        data.name = resume.name;
      }
      return data;
    } catch (error) {
      // Fall through to parsedText fallback.
    }
  }

  return {
    name: resume.name || 'Your Name',
    summary: resume.parsedText?.summary || '',
    skills: resume.parsedText?.skills || [],
    experience: [],
    education: []
  };
}

async function recordExport(db, userId, resumeId, format) {
  const Timestamp = getTimestamp();
  await db.collection('exports').add({
    userId,
    resumeId,
    format,
    created_at: Timestamp.now()
  });
}

// Export resume as PDF
router.post('/pdf/:resume_id', authenticateToken, checkSubscription, async (req, res) => {
  try {
    const db = getFirestore();
    const resumeDoc = await db.collection('resumes').doc(req.params.resume_id).get();
    if (!resumeDoc.exists || resumeDoc.data().userId !== req.user.id) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const resume = resumeDoc.data();
    const resumeData = await resolveResumeData(resume);
    const templateConfig = resume.template_config || {};
    const templateId = resume.template_id || 'premium_professional';

    const pdfPath = await generatePDF(resumeData, templateId, templateConfig);
    await recordExport(db, req.user.id, resumeDoc.id, 'pdf');
    await incrementMetric('exports_pdf');

    const fileBase = resume.name || 'resume';
    res.download(pdfPath, `${fileBase}.pdf`, (err) => {
      if (err) {
        console.error('Download error:', err?.message || err);
      }
      fs.unlinkSync(pdfPath);
    });
  } catch (error) {
    console.error('PDF export error:', error?.message || error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// Export resume as DOCX
router.post('/docx/:resume_id', authenticateToken, checkSubscription, async (req, res) => {
  try {
    const db = getFirestore();
    const resumeDoc = await db.collection('resumes').doc(req.params.resume_id).get();
    if (!resumeDoc.exists || resumeDoc.data().userId !== req.user.id) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const resume = resumeDoc.data();
    const resumeData = await resolveResumeData(resume);
    const templateConfig = resume.template_config || {};
    const templateId = resume.template_id || 'premium_professional';

    const docxPath = await generateDOCX(resumeData, templateId, templateConfig);
    await recordExport(db, req.user.id, resumeDoc.id, 'docx');
    await incrementMetric('exports_docx');

    const fileBase = resume.name || 'resume';
    res.download(docxPath, `${fileBase}.docx`, (err) => {
      if (err) {
        console.error('Download error:', err?.message || err);
      }
      fs.unlinkSync(docxPath);
    });
  } catch (error) {
    console.error('DOCX export error:', error?.message || error);
    res.status(500).json({ error: 'Failed to generate DOCX' });
  }
});

// Get export history
router.get('/history', authenticateToken, (req, res) => {
  (async () => {
    try {
      const db = getFirestore();
      const snapshot = await db.collection('exports')
        .where('userId', '==', req.user.id)
        .orderBy('created_at', 'desc')
        .limit(50)
        .get();

      const exportsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          format: data.format,
          created_at: data.created_at?.seconds || null,
          resume_id: data.resumeId
        };
      });

      res.json({ exports: exportsData });
    } catch (error) {
      console.error('Get export history error:', error?.message || error);
      res.status(500).json({ error: 'Failed to get export history' });
    }
  })();
});

export default router;
