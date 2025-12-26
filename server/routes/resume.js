import express from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { authenticateToken } from '../middleware/auth.js';
import { parseResumeBuffer } from '../services/parser.js';
import { incrementMetric } from '../services/metrics.js';
import { getFirestore, getStorageBucket, getTimestamp } from '../services/firestore.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT are allowed.'));
    }
  }
});

function buildParsedText(parsedData) {
  const experience = (parsedData?.experience || []).map((exp) => {
    return [exp.title, exp.company, exp.description].filter(Boolean).join(' - ');
  }).filter(Boolean);

  const education = (parsedData?.education || []).map((edu) => {
    return [edu.degree, edu.details].filter(Boolean).join(' - ');
  }).filter(Boolean);

  return {
    summary: parsedData?.summary || '',
    experience,
    skills: parsedData?.skills || [],
    education
  };
}

async function parseResumeFromStorage(storagePath, originalFormat) {
  if (!storagePath || !originalFormat) return null;
  try {
    const bucket = getStorageBucket();
    const [buffer] = await bucket.file(storagePath).download();
    return parseResumeBuffer(buffer, `.${originalFormat}`);
  } catch (error) {
    return null;
  }
}

// Upload and parse resume
router.post('/upload', authenticateToken, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { name } = req.body;
    const ext = path.extname(req.file.originalname).toLowerCase();
    const originalFormat = ext.replace('.', '');
    const resumeId = crypto.randomUUID();
    const userId = req.user.id;
    const storagePath = `resumes/${userId}/${resumeId}`;

    const bucket = getStorageBucket();
    await bucket.file(storagePath).save(req.file.buffer, {
      resumable: false,
      contentType: req.file.mimetype
    });

    const { parsedData } = await parseResumeBuffer(req.file.buffer, ext);
    const parsedText = buildParsedText(parsedData);
    const Timestamp = getTimestamp();
    const createdAt = Timestamp.now();

    const db = getFirestore();
    await db.collection('resumes').doc(resumeId).set({
      userId,
      name: name || 'My Resume',
      storagePath,
      originalFormat,
      parsedText,
      template_id: 'premium_professional',
      template_config: {},
      is_favorite: false,
      createdAt,
      updatedAt: createdAt
    });

    await incrementMetric('resumes_uploaded');

    res.json({
      id: resumeId,
      name: name || 'My Resume',
      parsedData,
      template_id: 'premium_professional'
    });
  } catch (error) {
    console.error('Upload error:', error?.message || error);
    res.status(500).json({ error: 'Failed to upload resume' });
  }
});

// Get all resumes for user
router.get('/', authenticateToken, (req, res) => {
  (async () => {
    try {
      const db = getFirestore();
      const snapshot = await db.collection('resumes')
        .where('userId', '==', req.user.id)
        .orderBy('createdAt', 'desc')
        .get();

      const resumes = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          template_id: data.template_id,
          template_config: data.template_config || {},
          is_favorite: data.is_favorite || 0,
          created_at: data.createdAt?.seconds || null,
          updated_at: data.updatedAt?.seconds || null
        };
      });

      res.json({ resumes });
    } catch (error) {
      console.error('Get resumes error:', error?.message || error);
      res.status(500).json({ error: 'Failed to get resumes' });
    }
  })();
});

// Get single resume
router.get('/:id', authenticateToken, (req, res) => {
  (async () => {
    try {
      const db = getFirestore();
      const doc = await db.collection('resumes').doc(req.params.id).get();
      if (!doc.exists) {
        return res.status(404).json({ error: 'Resume not found' });
      }
      const data = doc.data();
      if (data.userId !== req.user.id) {
        return res.status(404).json({ error: 'Resume not found' });
      }

      let parsedData = null;
      if (data.storagePath && data.originalFormat) {
        const parsed = await parseResumeFromStorage(data.storagePath, data.originalFormat);
        parsedData = parsed?.parsedData || null;
      }

      res.json({
        id: doc.id,
        name: data.name,
        template_id: data.template_id,
        template_config: data.template_config || {},
        parsed_data: parsedData || {
          summary: data.parsedText?.summary || '',
          experience: [],
          skills: data.parsedText?.skills || [],
          education: []
        },
        created_at: data.createdAt?.seconds || null,
        updated_at: data.updatedAt?.seconds || null
      });
    } catch (error) {
      console.error('Get resume error:', error?.message || error);
      res.status(500).json({ error: 'Failed to get resume' });
    }
  })();
});

// Update resume
router.put('/:id', authenticateToken, (req, res) => {
  (async () => {
    try {
      const { name, parsed_data, template_id, template_config, job_id } = req.body;
      const db = getFirestore();
      const docRef = db.collection('resumes').doc(req.params.id);
      const doc = await docRef.get();
      if (!doc.exists || doc.data().userId !== req.user.id) {
        return res.status(404).json({ error: 'Resume not found' });
      }

      const updates = {};
      if (name) updates.name = name;
      if (template_id) updates.template_id = template_id;
      if (template_config) {
        if (typeof template_config === 'string') {
          try {
            updates.template_config = JSON.parse(template_config);
          } catch (error) {
            return res.status(400).json({ error: 'Invalid template_config JSON' });
          }
        } else {
          updates.template_config = template_config;
        }
      }

      if (parsed_data) {
        const jobKey = job_id || 'manual';
        updates[`optimizedVersions.${jobKey}`] = {
          template: template_id || doc.data().template_id || 'premium_professional',
          industryVariant: updates.template_config?.variant || doc.data().template_config?.variant || null,
          content: parsed_data,
          atsScore: parsed_data?.atsScore || null,
          createdAt: getTimestamp().now()
        };
      }

      updates.updatedAt = getTimestamp().now();
      await docRef.set(updates, { merge: true });

      res.json({ success: true });
    } catch (error) {
      console.error('Update resume error:', error?.message || error);
      res.status(500).json({ error: 'Failed to update resume' });
    }
  })();
});

// Delete resume
router.delete('/:id', authenticateToken, (req, res) => {
  (async () => {
    try {
      const db = getFirestore();
      const docRef = db.collection('resumes').doc(req.params.id);
      const doc = await docRef.get();
      if (!doc.exists || doc.data().userId !== req.user.id) {
        return res.status(404).json({ error: 'Resume not found' });
      }

      const data = doc.data();
      if (data.storagePath) {
        const bucket = getStorageBucket();
        await bucket.file(data.storagePath).delete().catch(() => {});
      }

      const analysesSnap = await db.collection('analyses')
        .where('userId', '==', req.user.id)
        .where('resumeId', '==', req.params.id)
        .get();

      const exportsSnap = await db.collection('exports')
        .where('userId', '==', req.user.id)
        .where('resumeId', '==', req.params.id)
        .get();

      const batch = db.batch();
      analysesSnap.docs.forEach((docItem) => batch.delete(docItem.ref));
      exportsSnap.docs.forEach((docItem) => batch.delete(docItem.ref));
      batch.delete(docRef);
      await batch.commit();

      res.json({ success: true });
    } catch (error) {
      console.error('Delete resume error:', error?.message || error);
      res.status(500).json({ error: 'Failed to delete resume' });
    }
  })();
});

// Toggle favorite
router.patch('/:id/favorite', authenticateToken, (req, res) => {
  (async () => {
    try {
      const db = getFirestore();
      const docRef = db.collection('resumes').doc(req.params.id);
      const doc = await docRef.get();
      if (!doc.exists || doc.data().userId !== req.user.id) {
        return res.status(404).json({ error: 'Resume not found' });
      }

      const current = doc.data().is_favorite ? 1 : 0;
      const next = current ? 0 : 1;
      await docRef.set({
        is_favorite: next,
        updatedAt: getTimestamp().now()
      }, { merge: true });

      res.json({ is_favorite: !!next });
    } catch (error) {
      console.error('Toggle favorite error:', error?.message || error);
      res.status(500).json({ error: 'Failed to toggle favorite' });
    }
  })();
});

export default router;
