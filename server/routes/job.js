import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { parseJobDescription } from '../services/jobParser.js';
import { getFirestore, getTimestamp } from '../services/firestore.js';

const router = express.Router();

// Create job from manual input
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, company, description } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Job description required' });
    }

    // Parse job description
    const parsed = await parseJobDescription(description);

    const db = getFirestore();
    const Timestamp = getTimestamp();
    const createdAt = Timestamp.now();
    const jobRef = db.collection('jobs').doc();
    await jobRef.set({
      userId: req.user.id,
      title: title || 'Untitled Position',
      company: company || null,
      description,
      parsed_data: parsed,
      createdAt
    });

    res.json({
      id: jobRef.id,
      title: title || 'Untitled Position',
      company,
      description,
      parsed
    });
  } catch (error) {
    console.error('Create job error:', error?.message || error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// Get all jobs for user
router.get('/', authenticateToken, (req, res) => {
  (async () => {
    try {
      const db = getFirestore();
      const snapshot = await db.collection('jobs')
        .where('userId', '==', req.user.id)
        .orderBy('createdAt', 'desc')
        .get();

      const jobs = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          company: data.company || null,
          url: data.url || null,
          created_at: data.createdAt?.seconds || null
        };
      });

      res.json({ jobs });
    } catch (error) {
      console.error('Get jobs error:', error?.message || error);
      res.status(500).json({ error: 'Failed to get jobs' });
    }
  })();
});

// Get single job
router.get('/:id', authenticateToken, (req, res) => {
  (async () => {
    try {
      const db = getFirestore();
      const doc = await db.collection('jobs').doc(req.params.id).get();
      if (!doc.exists || doc.data().userId !== req.user.id) {
        return res.status(404).json({ error: 'Job not found' });
      }
      const data = doc.data();
      res.json({
        id: doc.id,
        title: data.title,
        company: data.company || null,
        description: data.description,
        parsed: data.parsed_data || {}
      });
    } catch (error) {
      console.error('Get job error:', error?.message || error);
      res.status(500).json({ error: 'Failed to get job' });
    }
  })();
});

// Delete job
router.delete('/:id', authenticateToken, (req, res) => {
  (async () => {
    try {
      const db = getFirestore();
      const docRef = db.collection('jobs').doc(req.params.id);
      const doc = await docRef.get();
      if (!doc.exists || doc.data().userId !== req.user.id) {
        return res.status(404).json({ error: 'Job not found' });
      }

      const analysesSnap = await db.collection('analyses')
        .where('userId', '==', req.user.id)
        .where('jobId', '==', req.params.id)
        .get();

      const batch = db.batch();
      analysesSnap.docs.forEach((analysisDoc) => batch.delete(analysisDoc.ref));
      batch.delete(docRef);
      await batch.commit();

      res.json({ success: true });
    } catch (error) {
      console.error('Delete job error:', error?.message || error);
      res.status(500).json({ error: 'Failed to delete job' });
    }
  })();
});

export default router;
