import express from 'express';
import { db } from '../database/init.js';
import { authenticateToken, checkSubscription } from '../middleware/auth.js';
import { generatePDF } from '../services/pdf-generator.js';
import { generateDOCX } from '../services/docx-generator.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Export resume as PDF
router.post('/pdf/:resume_id', authenticateToken, checkSubscription, async (req, res) => {
  try {
    const resume = db.prepare('SELECT * FROM resumes WHERE id = ? AND user_id = ?')
      .get(req.params.resume_id, req.user.id);

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const parsedData = JSON.parse(resume.parsed_data || '{}');
    const templateConfig = JSON.parse(resume.template_config || '{}');

    // Generate PDF
    const pdfPath = await generatePDF(parsedData, resume.template_id, templateConfig);

    // Save export record
    db.prepare(`
      INSERT INTO exports (user_id, resume_id, format, file_path)
      VALUES (?, ?, ?, ?)
    `).run(req.user.id, resume.id, 'pdf', pdfPath);

    // Send file
    res.download(pdfPath, `${resume.name}.pdf`, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      // Clean up file after sending
      fs.unlinkSync(pdfPath);
    });
  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// Export resume as DOCX
router.post('/docx/:resume_id', authenticateToken, checkSubscription, async (req, res) => {
  try {
    const resume = db.prepare('SELECT * FROM resumes WHERE id = ? AND user_id = ?')
      .get(req.params.resume_id, req.user.id);

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const parsedData = JSON.parse(resume.parsed_data || '{}');
    const templateConfig = JSON.parse(resume.template_config || '{}');

    // Generate DOCX
    const docxPath = await generateDOCX(parsedData, resume.template_id, templateConfig);

    // Save export record
    db.prepare(`
      INSERT INTO exports (user_id, resume_id, format, file_path)
      VALUES (?, ?, ?, ?)
    `).run(req.user.id, resume.id, 'docx', docxPath);

    // Send file
    res.download(docxPath, `${resume.name}.docx`, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      // Clean up file after sending
      fs.unlinkSync(docxPath);
    });
  } catch (error) {
    console.error('DOCX export error:', error);
    res.status(500).json({ error: 'Failed to generate DOCX' });
  }
});

// Get export history
router.get('/history', authenticateToken, (req, res) => {
  try {
    const exports = db.prepare(`
      SELECT
        e.id,
        e.format,
        e.created_at,
        r.name as resume_name
      FROM exports e
      JOIN resumes r ON e.resume_id = r.id
      WHERE e.user_id = ?
      ORDER BY e.created_at DESC
      LIMIT 50
    `).all(req.user.id);

    res.json({ exports });
  } catch (error) {
    console.error('Get export history error:', error);
    res.status(500).json({ error: 'Failed to get export history' });
  }
});

export default router;
