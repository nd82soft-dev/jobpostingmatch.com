import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';

// Parse resume file
export async function parseResume(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const buffer = fs.readFileSync(filePath);
  return parseResumeBuffer(buffer, ext);
}

export async function parseResumeBuffer(buffer, ext) {
  let text = '';

  try {
    if (ext === '.pdf') {
      const pdfData = await pdfParse(buffer);
      text = pdfData.text;
    } else if (ext === '.docx' || ext === '.doc') {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (ext === '.txt') {
      text = buffer.toString('utf-8');
    } else {
      throw new Error('Unsupported file format');
    }

    const parsedData = parseResumeText(text);
    return { text, parsedData };
  } catch (error) {
    console.error('Parse error:', error);
    throw new Error('Failed to parse resume');
  }
}

// Parse resume text into structured format
function parseResumeText(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);

  const data = {
    name: '',
    email: '',
    phone: '',
    location: '',
    title: '',
    summary: '',
    experience: [],
    education: [],
    skills: []
  };

  // Extract email
  const emailMatch = text.match(/[\w\.-]+@[\w\.-]+\.\w+/);
  if (emailMatch) data.email = emailMatch[0];

  // Extract phone
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) data.phone = phoneMatch[0];

  // Extract name (usually first line or before contact info)
  if (lines.length > 0) {
    data.name = lines[0];
  }

  // Extract sections
  let currentSection = null;
  let sectionContent = [];

  const sectionKeywords = {
    experience: ['experience', 'work history', 'employment', 'professional experience'],
    education: ['education', 'academic', 'qualifications'],
    skills: ['skills', 'technical skills', 'core competencies', 'technologies'],
    summary: ['summary', 'profile', 'objective', 'about']
  };

  lines.forEach((line, i) => {
    const lowerLine = line.toLowerCase();

    // Check if this is a section header
    let foundSection = null;
    for (const [section, keywords] of Object.entries(sectionKeywords)) {
      if (keywords.some(keyword => lowerLine === keyword || lowerLine.startsWith(keyword))) {
        foundSection = section;
        break;
      }
    }

    if (foundSection) {
      // Save previous section
      if (currentSection && sectionContent.length > 0) {
        processSectionContent(data, currentSection, sectionContent.join('\n'));
      }
      currentSection = foundSection;
      sectionContent = [];
    } else if (currentSection) {
      sectionContent.push(line);
    } else if (i < 5 && !data.title && line.length < 50) {
      // Potential job title in first few lines
      data.title = line;
    }
  });

  // Process last section
  if (currentSection && sectionContent.length > 0) {
    processSectionContent(data, currentSection, sectionContent.join('\n'));
  }

  return data;
}

function processSectionContent(data, section, content) {
  if (section === 'summary') {
    data.summary = content.trim();
  } else if (section === 'skills') {
    // Extract skills (comma-separated or bullet points)
    const skills = content
      .split(/[,•\-\n]/)
      .map(s => s.trim())
      .filter(s => s && s.length > 1 && s.length < 50);
    data.skills = [...new Set(skills)]; // Remove duplicates
  } else if (section === 'experience') {
    // Parse experience entries
    const entries = content.split(/\n\n+/);
    entries.forEach(entry => {
      const lines = entry.split('\n').filter(l => l.trim());
      if (lines.length >= 2) {
        const experience = {
          title: lines[0],
          company: lines[1],
          description: lines.slice(2).join('\n')
        };
        data.experience.push(experience);
      }
    });
  } else if (section === 'education') {
    const entries = content.split(/\n\n+/);
    entries.forEach(entry => {
      const lines = entry.split('\n').filter(l => l.trim());
      if (lines.length >= 1) {
        data.education.push({
          degree: lines[0],
          details: lines.slice(1).join('\n')
        });
      }
    });
  }
}

export function extractText(parsedData) {
  const sections = [];

  if (parsedData.name) sections.push(parsedData.name);
  if (parsedData.title) sections.push(parsedData.title);
  if (parsedData.email) sections.push(parsedData.email);
  if (parsedData.phone) sections.push(parsedData.phone);
  if (parsedData.location) sections.push(parsedData.location);

  if (parsedData.summary) {
    sections.push('\nPROFESSIONAL SUMMARY');
    sections.push(parsedData.summary);
  }

  if (parsedData.experience?.length > 0) {
    sections.push('\nWORK EXPERIENCE');
    parsedData.experience.forEach(exp => {
      sections.push(`\n${exp.title}`);
      if (exp.company) sections.push(exp.company);
      if (exp.description) sections.push(exp.description);
    });
  }

  if (parsedData.skills?.length > 0) {
    sections.push('\nSKILLS');
    sections.push(parsedData.skills.join(', '));
  }

  if (parsedData.education?.length > 0) {
    sections.push('\nEDUCATION');
    parsedData.education.forEach(edu => {
      sections.push(`\n${edu.degree}`);
      if (edu.details) sections.push(edu.details);
    });
  }

  return sections.join('\n');
}
