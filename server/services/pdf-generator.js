import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Template configurations
const TEMPLATES = {
  modern: {
    accentColor: '#8b5cf6',
    headerColor: '#1f2937',
    font: 'Helvetica',
    headingFont: 'Helvetica-Bold'
  },
  classic: {
    accentColor: '#000000',
    headerColor: '#000000',
    font: 'Times-Roman',
    headingFont: 'Times-Bold'
  },
  executive: {
    accentColor: '#d97706',
    headerColor: '#1f2937',
    font: 'Times-Roman',
    headingFont: 'Times-Bold'
  },
  creative: {
    accentColor: '#8b5cf6',
    headerColor: '#4f46e5',
    font: 'Helvetica',
    headingFont: 'Helvetica-Bold'
  }
};

export async function generatePDF(resumeData, templateId = 'modern', customConfig = {}) {
  return new Promise((resolve, reject) => {
    try {
      const template = { ...TEMPLATES[templateId] || TEMPLATES.modern, ...customConfig };
      const fileName = `resume-${Date.now()}.pdf`;
      const outputPath = path.join(__dirname, '../../uploads', fileName);

      // Ensure uploads directory exists
      const uploadDir = path.dirname(outputPath);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const doc = new PDFDocument({
        size: 'LETTER',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      let y = 50;

      // Header - Name and Title
      doc.font(template.headingFont).fontSize(24);
      doc.fillColor(template.headerColor);
      doc.text(resumeData.name || 'Your Name', 50, y);
      y += 30;

      if (resumeData.title) {
        doc.font(template.font).fontSize(14);
        doc.fillColor('#666666');
        doc.text(resumeData.title, 50, y);
        y += 20;
      }

      // Contact Information
      doc.font(template.font).fontSize(10);
      doc.fillColor('#333333');
      const contactInfo = [
        resumeData.email,
        resumeData.phone,
        resumeData.location
      ].filter(Boolean).join(' | ');
      doc.text(contactInfo, 50, y);
      y += 30;

      // Professional Summary
      if (resumeData.summary) {
        y = addSection(doc, 'PROFESSIONAL SUMMARY', y, template);
        doc.font(template.font).fontSize(10).fillColor('#333333');
        doc.text(resumeData.summary, 50, y, { width: 500, align: 'left' });
        y = doc.y + 20;
      }

      // Work Experience
      if (resumeData.experience && resumeData.experience.length > 0) {
        y = addSection(doc, 'WORK EXPERIENCE', y, template);

        resumeData.experience.forEach((exp, index) => {
          if (y > 700) {
            doc.addPage();
            y = 50;
          }

          doc.font(template.headingFont).fontSize(12).fillColor('#000000');
          doc.text(exp.title || exp.position || 'Position', 50, y);
          y += 15;

          doc.font(template.font).fontSize(10).fillColor('#666666');
          const expInfo = [exp.company, exp.period].filter(Boolean).join(' | ');
          doc.text(expInfo, 50, y);
          y += 15;

          // Bullets
          if (exp.bullets && exp.bullets.length > 0) {
            exp.bullets.forEach(bullet => {
              if (y > 700) {
                doc.addPage();
                y = 50;
              }

              doc.font(template.font).fontSize(10).fillColor('#333333');
              doc.text('•', 60, y);
              doc.text(bullet, 80, y, { width: 470 });
              y = doc.y + 5;
            });
          } else if (exp.description) {
            doc.font(template.font).fontSize(10).fillColor('#333333');
            doc.text(exp.description, 60, y, { width: 490 });
            y = doc.y + 5;
          }

          y += 15;
        });
      }

      // Skills
      if (resumeData.skills && resumeData.skills.length > 0) {
        if (y > 650) {
          doc.addPage();
          y = 50;
        }

        y = addSection(doc, 'SKILLS', y, template);
        doc.font(template.font).fontSize(10).fillColor('#333333');
        doc.text(resumeData.skills.join(' • '), 50, y, { width: 500 });
        y = doc.y + 20;
      }

      // Education
      if (resumeData.education && resumeData.education.length > 0) {
        if (y > 650) {
          doc.addPage();
          y = 50;
        }

        y = addSection(doc, 'EDUCATION', y, template);

        resumeData.education.forEach(edu => {
          doc.font(template.headingFont).fontSize(11).fillColor('#000000');
          doc.text(edu.degree, 50, y);
          y += 15;

          doc.font(template.font).fontSize(10).fillColor('#666666');
          const eduInfo = [edu.school, edu.year].filter(Boolean).join(' | ');
          doc.text(eduInfo, 50, y);
          y += 12;

          if (edu.details) {
            doc.font(template.font).fontSize(10).fillColor('#333333');
            doc.text(edu.details, 50, y, { width: 500 });
            y = doc.y + 10;
          }

          y += 10;
        });
      }

      doc.end();

      stream.on('finish', () => {
        resolve(outputPath);
      });

      stream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
}

function addSection(doc, title, y, template) {
  doc.font(template.headingFont).fontSize(12);
  doc.fillColor(template.accentColor);
  doc.text(title, 50, y);

  // Add line under section title
  doc.moveTo(50, y + 15)
    .lineTo(550, y + 15)
    .strokeColor(template.accentColor)
    .lineWidth(2)
    .stroke();

  return y + 25;
}
