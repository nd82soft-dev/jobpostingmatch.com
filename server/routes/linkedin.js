import express from 'express';
import { authenticateToken, checkSubscription } from '../middleware/auth.js';
import { optimizeLinkedInProfile } from '../services/linkedin-optimizer.js';

const router = express.Router();

router.post('/optimize', authenticateToken, checkSubscription, async (req, res) => {
  try {
    const {
      job_title,
      job_description,
      headline,
      about,
      experience,
      skills,
      location
    } = req.body || {};

    if (!job_title || !job_description) {
      return res.status(400).json({ error: 'Target role and job description are required.' });
    }

    const output = await optimizeLinkedInProfile({
      job_title,
      job_description,
      headline,
      about,
      experience,
      skills,
      location
    });

    res.json({ output });
  } catch (error) {
    console.error('LinkedIn optimization error:', error?.message || error);
    res.status(500).json({ error: 'Failed to optimize LinkedIn profile' });
  }
});

export default router;
