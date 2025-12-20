import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, UnderlineType } from 'docx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generateDOCX(resumeData, templateId = 'modern', customConfig = {}) {
  try {
    const fileName = `resume-${Date.now()}.docx`;
    const outputPath = path.join(__dirname, '../../uploads', fileName);

    // Ensure uploads directory exists
    const uploadDir = path.dirname(outputPath);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const sections = [];

    // Header - Name
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: resumeData.name || 'Your Name',
            bold: true,
            size: 32,
            color: '1f2937'
          })
        ],
        spacing: { after: 100 }
      })
    );

    // Title
    if (resumeData.title) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: resumeData.title,
              size: 24,
              color: '666666'
            })
          ],
          spacing: { after: 100 }
        })
      );
    }

    // Contact Info
    const contactInfo = [
      resumeData.email,
      resumeData.phone,
      resumeData.location
    ].filter(Boolean).join(' | ');

    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: contactInfo,
            size: 20,
            color: '333333'
          })
        ],
        spacing: { after: 200 }
      })
    );

    // Professional Summary
    if (resumeData.summary) {
      sections.push(createSectionHeader('PROFESSIONAL SUMMARY'));
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: resumeData.summary,
              size: 22
            })
          ],
          spacing: { after: 200 }
        })
      );
    }

    // Work Experience
    if (resumeData.experience && resumeData.experience.length > 0) {
      sections.push(createSectionHeader('WORK EXPERIENCE'));

      resumeData.experience.forEach((exp, index) => {
        // Position title
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: exp.title || exp.position || 'Position',
                bold: true,
                size: 24
              })
            ],
            spacing: { before: index > 0 ? 150 : 0, after: 80 }
          })
        );

        // Company and period
        const expInfo = [exp.company, exp.period].filter(Boolean).join(' | ');
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: expInfo,
                size: 20,
                color: '666666',
                italics: true
              })
            ],
            spacing: { after: 80 }
          })
        );

        // Bullets or description
        if (exp.bullets && exp.bullets.length > 0) {
          exp.bullets.forEach(bullet => {
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: bullet,
                    size: 22
                  })
                ],
                bullet: { level: 0 },
                spacing: { after: 60 }
              })
            );
          });
        } else if (exp.description) {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: exp.description,
                  size: 22
                })
              ],
              spacing: { after: 100 }
            })
          );
        }
      });

      sections.push(new Paragraph({ spacing: { after: 100 } }));
    }

    // Skills
    if (resumeData.skills && resumeData.skills.length > 0) {
      sections.push(createSectionHeader('SKILLS'));
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: resumeData.skills.join(' • '),
              size: 22
            })
          ],
          spacing: { after: 200 }
        })
      );
    }

    // Education
    if (resumeData.education && resumeData.education.length > 0) {
      sections.push(createSectionHeader('EDUCATION'));

      resumeData.education.forEach((edu, index) => {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: edu.degree,
                bold: true,
                size: 24
              })
            ],
            spacing: { before: index > 0 ? 150 : 0, after: 80 }
          })
        );

        const eduInfo = [edu.school, edu.year].filter(Boolean).join(' | ');
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: eduInfo,
                size: 20,
                color: '666666',
                italics: true
              })
            ],
            spacing: { after: 80 }
          })
        );

        if (edu.details) {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: edu.details,
                  size: 22
                })
              ],
              spacing: { after: 100 }
            })
          );
        }
      });
    }

    // Create document
    const doc = new Document({
      sections: [{
        properties: {},
        children: sections
      }]
    });

    // Generate and save
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(outputPath, buffer);

    return outputPath;
  } catch (error) {
    console.error('DOCX generation error:', error);
    throw error;
  }
}

function createSectionHeader(text) {
  return new Paragraph({
    children: [
      new TextRun({
        text: text,
        bold: true,
        size: 26,
        color: '8b5cf6'
      })
    ],
    spacing: { before: 200, after: 100 },
    border: {
      bottom: {
        color: '8b5cf6',
        space: 1,
        value: 'single',
        size: 6
      }
    }
  });
}
