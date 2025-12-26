import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { recordVisit } from '../services/metrics.js';

const router = express.Router();

router.post('/visit', (req, res) => {
  (async () => {
    try {
      const anonId = req.body?.anonId;
      await recordVisit({ anonId });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to record visit' });
    }
  })();
});

router.post('/visit/auth', authenticateToken, (req, res) => {
  (async () => {
    try {
      const anonId = req.body?.anonId;
      await recordVisit({ anonId, userId: req.user.id });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to record visit' });
    }
  })();
});

export default router;
