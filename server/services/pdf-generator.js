import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FONT_PRIMARY = 'Helvetica';
const FONT_BOLD = 'Helvetica-Bold';

const COLORS = {
  text: '#1f2937',
  muted: '#4b5563',
  black: '#000000'
};

const MARGINS = {
  top: 0.6 * 72,
  bottom: 0.6 * 72,
  left: 0.7 * 72,
  right: 0.7 * 72
};

const SECTION_GAP = 16;
const BULLET_GAP = 7;

function clampSummary(summary) {
  if (!summary) return '';
  const maxChars = 320;
  return summary.length > maxChars ? `${summary.slice(0, maxChars).trim()}...` : summary;
}

function groupSkills(skills) {
  const groups = {
    'CORE CAPABILITIES': [],
    'SYSTEMS & PLATFORMS': [],
    'TOOLS & PRACTICES': [],
    'LANGUAGES & DATA': []
  };

  const languageMatch = /(python|c#|java|sql|json|xml|html|css)/i;
  const systemMatch = /(windows|aws|docker|kubernetes|linux|active directory|sql server|mongodb)/i;
  const toolsMatch = /(servicenow|salesforce|zendesk|devops|jira|bug|release|git)/i;

  (skills || []).forEach((skill) => {
    if (languageMatch.test(skill)) {
      groups['LANGUAGES & DATA'].push(skill);
    } else if (systemMatch.test(skill)) {
      groups['SYSTEMS & PLATFORMS'].push(skill);
    } else if (toolsMatch.test(skill)) {
      groups['TOOLS & PRACTICES'].push(skill);
    } else {
      groups['CORE CAPABILITIES'].push(skill);
    }
  });

  return groups;
}

function getSectionOrder(variant) {
  if (variant === 'tech_saas') {
    return ['summary', 'skills', 'experience', 'education'];
  }
  if (variant === 'industrial') {
    return ['summary', 'experience', 'certifications', 'skills', 'education'];
  }
  if (variant === 'leadership') {
    return ['summary', 'experience', 'skills', 'education'];
  }
  return ['summary', 'experience', 'skills', 'education'];
}

export async function generatePDF(resumeData, templateId = 'premium_professional', customConfig = {}) {
  return new Promise((resolve, reject) => {
    try {
      const variant = customConfig.variant || 'general';
      const fileName = `resume-${Date.now()}.pdf`;
      const outputPath = path.join(__dirname, '../../uploads', fileName);

      const uploadDir = path.dirname(outputPath);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const doc = new PDFDocument({
        size: 'LETTER',
        margins: MARGINS
      });

      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      doc.font(FONT_PRIMARY);
      doc.lineGap(4);

      let y = MARGINS.top;
      const left = MARGINS.left;
      const width = doc.page.width - MARGINS.left - MARGINS.right;

      doc.font(FONT_BOLD).fontSize(19).fillColor(COLORS.black);
      doc.text(resumeData.name || 'Your Name', left, y);
      y = doc.y + 6;

      if (resumeData.title) {
        doc.font(FONT_PRIMARY).fontSize(12).fillColor(COLORS.text);
        doc.text(resumeData.title, left, y, { width });
        y = doc.y + 6;
      }

      const contactInfo = [resumeData.location, resumeData.phone, resumeData.email]
        .filter(Boolean)
        .join(' | ');
      if (contactInfo) {
        doc.font(FONT_PRIMARY).fontSize(9.5).fillColor(COLORS.muted);
        doc.text(contactInfo, left, y, { width });
        y = doc.y + SECTION_GAP;
      }

      const sections = getSectionOrder(variant);

      sections.forEach((section) => {
        if (section === 'summary' && resumeData.summary) {
          y = addSectionHeader(doc, 'PROFESSIONAL SUMMARY', y, left);
          doc.font(FONT_PRIMARY).fontSize(11).fillColor(COLORS.text);
          doc.text(clampSummary(resumeData.summary), left, y, { width, lineGap: 4 });
          y = doc.y + SECTION_GAP;
        }

        if (section === 'experience' && resumeData.experience?.length) {
          y = addSectionHeader(doc, 'EXPERIENCE', y, left);
          resumeData.experience.forEach((exp) => {
            if (y > 700) {
              doc.addPage();
              y = MARGINS.top;
            }

            doc.font(FONT_BOLD).fontSize(11).fillColor(COLORS.black);
            doc.text(`${exp.title || exp.position || 'Position'} - ${exp.company || ''}`.trim(), left, y, { width });
            y = doc.y + 4;

            if (exp.period) {
              doc.font(FONT_PRIMARY).fontSize(9.5).fillColor(COLORS.muted);
              doc.text(exp.period, left, y, { width });
              y = doc.y + 6;
            }

            const bullets = exp.bullets?.slice(0, 5) || [];
            bullets.forEach((bullet) => {
              doc.font(FONT_PRIMARY).fontSize(11).fillColor(COLORS.text);
              doc.text('-', left + 4, y);
              doc.text(bullet, left + 16, y, { width: width - 16 });
              y = doc.y + BULLET_GAP;
            });

            y += SECTION_GAP - 6;
          });
        }

        if (section === 'skills' && resumeData.skills?.length) {
          y = addSectionHeader(doc, 'SKILLS', y, left);
          const grouped = groupSkills(resumeData.skills);
          Object.entries(grouped).forEach(([group, items]) => {
            if (!items.length) return;
            doc.font(FONT_BOLD).fontSize(10.5).fillColor(COLORS.black);
            doc.text(group, left, y, { width });
            y = doc.y + 4;
            doc.font(FONT_PRIMARY).fontSize(10.5).fillColor(COLORS.text);
            doc.text(items.join(', '), left, y, { width });
            y = doc.y + 10;
          });
          y += SECTION_GAP - 6;
        }

        if (section === 'certifications' && resumeData.certifications?.length) {
          y = addSectionHeader(doc, 'CERTIFICATIONS', y, left);
          doc.font(FONT_PRIMARY).fontSize(11).fillColor(COLORS.text);
          resumeData.certifications.forEach((cert) => {
            doc.text(`- ${cert}`, left, y, { width });
            y = doc.y + BULLET_GAP;
          });
          y += SECTION_GAP - 6;
        }

        if (section === 'education' && resumeData.education?.length) {
          y = addSectionHeader(doc, 'EDUCATION', y, left);
          resumeData.education.forEach((edu) => {
            doc.font(FONT_BOLD).fontSize(11).fillColor(COLORS.black);
            doc.text(edu.degree || 'Degree', left, y, { width });
            y = doc.y + 4;

            const eduInfo = [edu.school, edu.year].filter(Boolean).join(' | ');
            doc.font(FONT_PRIMARY).fontSize(9.5).fillColor(COLORS.muted);
            doc.text(eduInfo, left, y, { width });
            y = doc.y + 10;
          });
          y += SECTION_GAP - 6;
        }
      });

      doc.end();

      stream.on('finish', () => resolve(outputPath));
      stream.on('error', (error) => reject(error));
    } catch (error) {
      reject(error);
    }
  });
}

function addSectionHeader(doc, title, y, left) {
  doc.font(FONT_BOLD).fontSize(11).fillColor(COLORS.black);
  doc.text(title, left, y);
  return doc.y + 10;
}
