import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from '../database/init.js';
import { authenticateToken } from '../middleware/auth.js';
import { parseResume } from '../services/parser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
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

// Upload and parse resume
router.post('/upload', authenticateToken, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { name } = req.body;
    const filePath = req.file.path;

    // Parse the resume
    const { text, parsedData } = await parseResume(filePath);

    // Save to database
    const result = db.prepare(`
      INSERT INTO resumes (user_id, name, content, parsed_data, template_id)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      req.user.id,
      name || 'My Resume',
      text,
      JSON.stringify(parsedData),
      'modern'
    );

    // Delete uploaded file after parsing
    fs.unlinkSync(filePath);

    res.json({
      id: result.lastInsertRowid,
      name: name || 'My Resume',
      content: text,
      parsedData,
      template_id: 'modern'
    });
  } catch (error) {
    console.error('Upload error:', error);
    // Clean up file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to upload resume' });
  }
});

// Get all resumes for user
router.get('/', authenticateToken, (req, res) => {
  try {
    const resumes = db.prepare(`
      SELECT id, name, template_id, is_favorite, created_at, updated_at
      FROM resumes
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(req.user.id);

    res.json({ resumes });
  } catch (error) {
    console.error('Get resumes error:', error);
    res.status(500).json({ error: 'Failed to get resumes' });
  }
});

// Get single resume
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const resume = db.prepare(`
      SELECT * FROM resumes WHERE id = ? AND user_id = ?
    `).get(req.params.id, req.user.id);

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    res.json({
      ...resume,
      parsed_data: JSON.parse(resume.parsed_data || '{}'),
      template_config: JSON.parse(resume.template_config || '{}')
    });
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({ error: 'Failed to get resume' });
  }
});

// Update resume
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const { name, content, parsed_data, template_id, template_config } = req.body;

    const resume = db.prepare('SELECT id FROM resumes WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user.id);

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    db.prepare(`
      UPDATE resumes
      SET name = COALESCE(?, name),
          content = COALESCE(?, content),
          parsed_data = COALESCE(?, parsed_data),
          template_id = COALESCE(?, template_id),
          template_config = COALESCE(?, template_config),
          updated_at = strftime('%s', 'now')
      WHERE id = ?
    `).run(
      name || null,
      content || null,
      parsed_data ? JSON.stringify(parsed_data) : null,
      template_id || null,
      template_config ? JSON.stringify(template_config) : null,
      req.params.id
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Update resume error:', error);
    res.status(500).json({ error: 'Failed to update resume' });
  }
});

// Delete resume
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const result = db.prepare('DELETE FROM resumes WHERE id = ? AND user_id = ?')
      .run(req.params.id, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({ error: 'Failed to delete resume' });
  }
});

// Toggle favorite
router.patch('/:id/favorite', authenticateToken, (req, res) => {
  try {
    const resume = db.prepare('SELECT is_favorite FROM resumes WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user.id);

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    db.prepare('UPDATE resumes SET is_favorite = ? WHERE id = ?')
      .run(resume.is_favorite ? 0 : 1, req.params.id);

    res.json({ is_favorite: !resume.is_favorite });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ error: 'Failed to toggle favorite' });
  }
});

export default router;
