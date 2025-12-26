import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MARGIN_TWIPS = 0.7 * 1440;
const LINE_SPACING = 336;
const SECTION_GAP = 240;
const BULLET_GAP = 120;

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

export async function generateDOCX(resumeData, templateId = 'premium_professional', customConfig = {}) {
  try {
    const variant = customConfig.variant || 'general';
    const fileName = `resume-${Date.now()}.docx`;
    const outputPath = path.join(__dirname, '../../uploads', fileName);

    const uploadDir = path.dirname(outputPath);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const sections = [];

    sections.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [
          new TextRun({
            text: resumeData.name || 'Your Name',
            bold: true,
            size: 38
          })
        ],
        spacing: { after: 80 }
      })
    );

    if (resumeData.title) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: resumeData.title,
              size: 24
            })
          ],
          spacing: { after: 80 }
        })
      );
    }

    const contactInfo = [resumeData.location, resumeData.phone, resumeData.email]
      .filter(Boolean)
      .join(' | ');
    if (contactInfo) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: contactInfo,
              size: 19,
              color: '4b5563'
            })
          ],
          spacing: { after: SECTION_GAP }
        })
      );
    }

    const order = getSectionOrder(variant);

    order.forEach((section) => {
      if (section === 'summary' && resumeData.summary) {
        sections.push(createSectionHeader('PROFESSIONAL SUMMARY'));
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: clampSummary(resumeData.summary),
                size: 22
              })
            ],
            spacing: { after: SECTION_GAP }
          })
        );
      }

      if (section === 'experience' && resumeData.experience?.length) {
        sections.push(createSectionHeader('EXPERIENCE'));

        resumeData.experience.forEach((exp, index) => {
          const title = exp.title || exp.position || 'Position';
          const company = exp.company ? ` - ${exp.company}` : '';
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${title}${company}`,
                  bold: true,
                  size: 22
                })
              ],
              spacing: { before: index > 0 ? 120 : 0, after: 60 }
            })
          );

          if (exp.period) {
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: exp.period,
                    size: 19,
                    color: '4b5563'
                  })
                ],
                spacing: { after: 80 }
              })
            );
          }

          const bullets = exp.bullets?.slice(0, 5) || [];
          bullets.forEach((bullet) => {
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: bullet,
                    size: 22
                  })
                ],
                bullet: { level: 0 },
                indent: { left: 360, hanging: 180 },
                spacing: { after: BULLET_GAP }
              })
            );
          });
        });

        sections.push(new Paragraph({ spacing: { after: SECTION_GAP } }));
      }

      if (section === 'skills' && resumeData.skills?.length) {
        sections.push(createSectionHeader('SKILLS'));
        const grouped = groupSkills(resumeData.skills);

        Object.entries(grouped).forEach(([group, items]) => {
          if (!items.length) return;
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: group,
                  bold: true,
                  size: 20
                })
              ],
              spacing: { after: 40 }
            })
          );
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: items.join(', '),
                  size: 22
                })
              ],
              spacing: { after: 120 }
            })
          );
        });

        sections.push(new Paragraph({ spacing: { after: SECTION_GAP } }));
      }

      if (section === 'certifications' && resumeData.certifications?.length) {
        sections.push(createSectionHeader('CERTIFICATIONS'));
        resumeData.certifications.forEach((cert) => {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: cert,
                  size: 22
                })
              ],
              bullet: { level: 0 },
              indent: { left: 360, hanging: 180 },
              spacing: { after: BULLET_GAP }
            })
          );
        });
        sections.push(new Paragraph({ spacing: { after: SECTION_GAP } }));
      }

      if (section === 'education' && resumeData.education?.length) {
        sections.push(createSectionHeader('EDUCATION'));
        resumeData.education.forEach((edu, index) => {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: edu.degree || 'Degree',
                  bold: true,
                  size: 22
                })
              ],
              spacing: { before: index > 0 ? 120 : 0, after: 60 }
            })
          );

          const eduInfo = [edu.school, edu.year].filter(Boolean).join(' | ');
          if (eduInfo) {
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: eduInfo,
                    size: 19,
                    color: '4b5563'
                  })
                ],
                spacing: { after: 80 }
              })
            );
          }
        });
      }
    });

    const doc = new Document({
      styles: {
        default: {
          document: {
            run: {
              font: 'Calibri',
              size: 22,
              color: '000000'
            },
            paragraph: {
              spacing: {
                line: LINE_SPACING
              }
            }
          }
        }
      },
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: MARGIN_TWIPS,
                right: MARGIN_TWIPS,
                bottom: MARGIN_TWIPS,
                left: MARGIN_TWIPS
              }
            }
          },
          children: sections
        }
      ]
    });

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
    heading: HeadingLevel.HEADING_2,
    children: [
      new TextRun({
        text,
        bold: true,
        size: 22
      })
    ],
    spacing: { before: 160, after: 80 }
  });
}
