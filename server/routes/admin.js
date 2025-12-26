import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getMetricsSummary } from '../services/metrics.js';

const router = express.Router();

function resolveRange(range, startDate, endDate) {
  const today = new Date();
  const end = endDate ? new Date(endDate) : today;
  const start = new Date(end);

  switch (range) {
    case 'day':
      break;
    case 'week':
      start.setDate(end.getDate() - 6);
      break;
    case 'two_weeks':
      start.setDate(end.getDate() - 13);
      break;
    case 'quarter':
      start.setDate(end.getDate() - 89);
      break;
    case 'year':
      start.setDate(end.getDate() - 364);
      break;
    case 'custom':
      return {
        start: startDate ? new Date(startDate) : end,
        end
      };
    default:
      break;
  }

  return { start, end };
}

router.get('/metrics', authenticateToken, async (req, res) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'ndodds64@yahoo.com';
  if (req.user?.email !== adminEmail) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { range = 'week', startDate, endDate } = req.query;
  const { start, end } = resolveRange(range, startDate, endDate);
  const startDay = start.toISOString().slice(0, 10);
  const endDay = end.toISOString().slice(0, 10);

  const data = await getMetricsSummary({ startDay, endDay });
  res.json({
    range,
    startDay,
    endDay,
    ...data
  });
});

export default router;
