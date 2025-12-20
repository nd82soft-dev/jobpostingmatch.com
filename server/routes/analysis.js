import express from 'express';
import { db } from '../database/init.js';
import { authenticateToken } from '../middleware/auth.js';
import { analyzeResumeMatch, generateOptimizedResume } from '../services/ai-analyzer.js';

const router = express.Router();

// Analyze resume against job
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { resume_id, job_id } = req.body;

    if (!resume_id || !job_id) {
      return res.status(400).json({ error: 'Resume ID and Job ID required' });
    }

    // Get resume
    const resume = db.prepare('SELECT * FROM resumes WHERE id = ? AND user_id = ?')
      .get(resume_id, req.user.id);

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    // Get job
    const job = db.prepare('SELECT * FROM jobs WHERE id = ? AND user_id = ?')
      .get(job_id, req.user.id);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Perform AI analysis
    const analysis = await analyzeResumeMatch(
      resume.content,
      JSON.parse(resume.parsed_data || '{}'),
      job.description,
      JSON.parse(job.parsed_data || '{}')
    );

    // Save analysis
    const result = db.prepare(`
      INSERT INTO analyses (user_id, resume_id, job_id, overall_score, skills_score, experience_score, keyword_score, analysis_data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.user.id,
      resume_id,
      job_id,
      analysis.overallScore,
      analysis.skillsScore,
      analysis.experienceScore,
      analysis.keywordScore,
      JSON.stringify(analysis)
    );

    res.json({
      id: result.lastInsertRowid,
      ...analysis
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze resume' });
  }
});

// Generate optimized resume
router.post('/optimize', authenticateToken, async (req, res) => {
  try {
    const { resume_id, job_id } = req.body;

    // Get resume and job
    const resume = db.prepare('SELECT * FROM resumes WHERE id = ? AND user_id = ?')
      .get(resume_id, req.user.id);

    const job = db.prepare('SELECT * FROM jobs WHERE id = ? AND user_id = ?')
      .get(job_id, req.user.id);

    if (!resume || !job) {
      return res.status(404).json({ error: 'Resume or job not found' });
    }

    // Get existing analysis if available
    const existingAnalysis = db.prepare(`
      SELECT analysis_data FROM analyses
      WHERE resume_id = ? AND job_id = ?
      ORDER BY created_at DESC LIMIT 1
    `).get(resume_id, job_id);

    const analysis = existingAnalysis
      ? JSON.parse(existingAnalysis.analysis_data)
      : null;

    // Generate optimized resume
    const optimizedResume = await generateOptimizedResume(
      resume.content,
      JSON.parse(resume.parsed_data || '{}'),
      job.description,
      JSON.parse(job.parsed_data || '{}'),
      analysis
    );

    res.json({ optimizedResume });
  } catch (error) {
    console.error('Optimization error:', error);
    res.status(500).json({ error: 'Failed to optimize resume' });
  }
});

// Get analysis history
router.get('/history', authenticateToken, (req, res) => {
  try {
    const analyses = db.prepare(`
      SELECT
        a.id,
        a.overall_score,
        a.created_at,
        r.name as resume_name,
        j.title as job_title,
        j.company
      FROM analyses a
      JOIN resumes r ON a.resume_id = r.id
      JOIN jobs j ON a.job_id = j.id
      WHERE a.user_id = ?
      ORDER BY a.created_at DESC
      LIMIT 50
    `).all(req.user.id);

    res.json({ analyses });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to get analysis history' });
  }
});

// Get specific analysis
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const analysis = db.prepare(`
      SELECT * FROM analyses WHERE id = ? AND user_id = ?
    `).get(req.params.id, req.user.id);

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json({
      ...analysis,
      data: JSON.parse(analysis.analysis_data)
    });
  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({ error: 'Failed to get analysis' });
  }
});

export default router;
