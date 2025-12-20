import express from 'express';
import { db } from '../database/init.js';
import { authenticateToken } from '../middleware/auth.js';
import { fetchLinkedInJob, parseJobDescription } from '../services/linkedin.js';

const router = express.Router();

// Fetch job from LinkedIn URL
router.post('/fetch', authenticateToken, async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL required' });
    }

    // Fetch and parse LinkedIn job
    const jobData = await fetchLinkedInJob(url);

    // Save to database
    const result = db.prepare(`
      INSERT INTO jobs (user_id, title, company, url, description, parsed_data)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      req.user.id,
      jobData.title,
      jobData.company || null,
      url,
      jobData.description,
      JSON.stringify(jobData.parsed)
    );

    res.json({
      id: result.lastInsertRowid,
      ...jobData
    });
  } catch (error) {
    console.error('Fetch job error:', error);
    res.status(500).json({ error: 'Failed to fetch job posting' });
  }
});

// Create job from manual input
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, company, description } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Job description required' });
    }

    // Parse job description
    const parsed = await parseJobDescription(description);

    // Save to database
    const result = db.prepare(`
      INSERT INTO jobs (user_id, title, company, description, parsed_data)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      req.user.id,
      title || 'Untitled Position',
      company || null,
      description,
      JSON.stringify(parsed)
    );

    res.json({
      id: result.lastInsertRowid,
      title: title || 'Untitled Position',
      company,
      description,
      parsed
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// Get all jobs for user
router.get('/', authenticateToken, (req, res) => {
  try {
    const jobs = db.prepare(`
      SELECT id, title, company, url, created_at
      FROM jobs
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(req.user.id);

    res.json({ jobs });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Failed to get jobs' });
  }
});

// Get single job
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const job = db.prepare(`
      SELECT * FROM jobs WHERE id = ? AND user_id = ?
    `).get(req.params.id, req.user.id);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({
      ...job,
      parsed: JSON.parse(job.parsed_data || '{}')
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ error: 'Failed to get job' });
  }
});

// Delete job
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const result = db.prepare('DELETE FROM jobs WHERE id = ? AND user_id = ?')
      .run(req.params.id, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

export default router;
