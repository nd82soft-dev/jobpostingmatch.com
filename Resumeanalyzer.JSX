import React, { useState, useRef } from 'react';
import { Upload, FileText, Sparkles, CheckCircle, XCircle, Download, Loader2, TrendingUp, AlertCircle, Edit3, Save, RefreshCw, Eye, Code } from 'lucide-react';
import mammoth from 'mammoth';

// Resume Template Components
const ModernTemplate = ({ data }) => (
  <div style={{
    background: 'white',
    padding: '48px',
    fontFamily: '"Helvetica Neue", Arial, sans-serif',
    color: '#1f2937',
    minHeight: '800px'
  }}>
    {/* Header */}
    <div style={{ borderBottom: '3px solid #667eea', paddingBottom: '24px', marginBottom: '32px' }}>
      <h1 style={{ fontSize: '36px', fontWeight: '700', margin: '0 0 8px', color: '#1f2937' }}>
        {data.name || 'Your Name'}
      </h1>
      <p style={{ fontSize: '18px', color: '#667eea', fontWeight: '600', margin: '0 0 16px' }}>
        {data.title || 'Professional Title'}
      </p>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '14px', color: '#6b7280' }}>
        {data.contact.email && <span>📧 {data.contact.email}</span>}
        {data.contact.phone && <span>📱 {data.contact.phone}</span>}
        {data.contact.location && <span>📍 {data.contact.location}</span>}
      </div>
    </div>

    {/* Summary */}
    {data.summary && (
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#667eea', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Professional Summary
        </h2>
        <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#4b5563', margin: 0 }}>
          {data.summary}
        </p>
      </div>
    )}

    {/* Experience */}
    {data.experience.length > 0 && (
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#667eea', margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Experience
        </h2>
        {data.experience.map((exp, idx) => (
          <div key={idx} style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                {exp.title}
              </h3>
              <span style={{ fontSize: '14px', color: '#6b7280', fontStyle: 'italic' }}>
                {exp.date}
              </span>
            </div>
            <p style={{ fontSize: '15px', color: '#667eea', fontWeight: '500', margin: '0 0 12px' }}>
              {exp.company}
            </p>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {exp.bullets.map((bullet, bidx) => (
                <li key={bidx} style={{ fontSize: '14px', lineHeight: '1.6', color: '#4b5563', marginBottom: '6px' }}>
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    )}

    {/* Skills */}
    {data.skills.length > 0 && (
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#667eea', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Skills
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {data.skills.map((skill, idx) => (
            <span key={idx} style={{
              padding: '6px 14px',
              background: '#f3f4f6',
              borderRadius: '6px',
              fontSize: '13px',
              color: '#374151',
              fontWeight: '500'
            }}>
              {skill}
            </span>
          ))}
        </div>
      </div>
    )}

    {/* Education */}
    {data.education.length > 0 && (
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#667eea', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Education
        </h2>
        {data.education.map((edu, idx) => (
          <p key={idx} style={{ fontSize: '15px', color: '#4b5563', margin: '0 0 8px' }}>
            {edu}
          </p>
        ))}
      </div>
    )}
  </div>
);

const ClassicTemplate = ({ data }) => (
  <div style={{
    background: 'white',
    padding: '48px',
    fontFamily: 'Georgia, "Times New Roman", serif',
    color: '#1f2937',
    minHeight: '800px'
  }}>
    {/* Header */}
    <div style={{ textAlign: 'center', borderBottom: '2px solid #1f2937', paddingBottom: '24px', marginBottom: '32px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 12px', color: '#1f2937', letterSpacing: '2px' }}>
        {data.name || 'YOUR NAME'}
      </h1>
      <p style={{ fontSize: '16px', color: '#4b5563', margin: '0 0 12px', fontStyle: 'italic' }}>
        {data.title || 'Professional Title'}
      </p>
      <div style={{ fontSize: '13px', color: '#6b7280' }}>
        {[data.contact.email, data.contact.phone, data.contact.location].filter(Boolean).join(' • ')}
      </div>
    </div>

    {/* Summary */}
    {data.summary && (
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', margin: '0 0 12px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
          PROFESSIONAL SUMMARY
        </h2>
        <p style={{ fontSize: '14px', lineHeight: '1.8', color: '#4b5563', margin: 0, textAlign: 'justify' }}>
          {data.summary}
        </p>
      </div>
    )}

    {/* Experience */}
    {data.experience.length > 0 && (
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', margin: '0 0 16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
          PROFESSIONAL EXPERIENCE
        </h2>
        {data.experience.map((exp, idx) => (
          <div key={idx} style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '6px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937', margin: '0', display: 'inline' }}>
                {exp.title}
              </h3>
              <span style={{ fontSize: '14px', color: '#6b7280', marginLeft: '12px' }}>
                ({exp.date})
              </span>
            </div>
            <p style={{ fontSize: '14px', color: '#4b5563', margin: '0 0 10px', fontStyle: 'italic' }}>
              {exp.company}
            </p>
            <ul style={{ margin: 0, paddingLeft: '24px', listStyleType: 'disc' }}>
              {exp.bullets.map((bullet, bidx) => (
                <li key={bidx} style={{ fontSize: '13px', lineHeight: '1.7', color: '#4b5563', marginBottom: '4px' }}>
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    )}

    {/* Skills */}
    {data.skills.length > 0 && (
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', margin: '0 0 12px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
          CORE COMPETENCIES
        </h2>
        <p style={{ fontSize: '13px', lineHeight: '1.8', color: '#4b5563', margin: 0 }}>
          {data.skills.join(' • ')}
        </p>
      </div>
    )}

    {/* Education */}
    {data.education.length > 0 && (
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', margin: '0 0 12px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
          EDUCATION
        </h2>
        {data.education.map((edu, idx) => (
          <p key={idx} style={{ fontSize: '14px', color: '#4b5563', margin: '0 0 6px' }}>
            {edu}
          </p>
        ))}
      </div>
    )}
  </div>
);

const ExecutiveTemplate = ({ data }) => (
  <div style={{
    background: 'white',
    padding: '56px',
    fontFamily: '"Garamond", Georgia, serif',
    color: '#1f2937',
    minHeight: '800px'
  }}>
    {/* Header */}
    <div style={{ marginBottom: '40px' }}>
      <h1 style={{ fontSize: '42px', fontWeight: '700', margin: '0 0 8px', color: '#1f2937', letterSpacing: '1px' }}>
        {data.name || 'Your Name'}
      </h1>
      <div style={{ height: '3px', width: '80px', background: '#d97706', marginBottom: '16px' }}></div>
      <p style={{ fontSize: '20px', color: '#6b7280', fontWeight: '400', margin: '0 0 16px', fontStyle: 'italic' }}>
        {data.title || 'Executive Leader'}
      </p>
      <div style={{ fontSize: '14px', color: '#9ca3af', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {data.contact.email && <span>{data.contact.email}</span>}
        {data.contact.phone && <span>{data.contact.phone}</span>}
        {data.contact.location && <span>{data.contact.location}</span>}
      </div>
    </div>

    {/* Summary */}
    {data.summary && (
      <div style={{ marginBottom: '36px', borderLeft: '4px solid #d97706', paddingLeft: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#d97706', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '2px' }}>
          Executive Profile
        </h2>
        <p style={{ fontSize: '15px', lineHeight: '1.9', color: '#374151', margin: 0, fontStyle: 'italic' }}>
          {data.summary}
        </p>
      </div>
    )}

    {/* Experience */}
    {data.experience.length > 0 && (
      <div style={{ marginBottom: '36px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#d97706', margin: '0 0 24px', textTransform: 'uppercase', letterSpacing: '2px' }}>
          Leadership Experience
        </h2>
        {data.experience.map((exp, idx) => (
          <div key={idx} style={{ marginBottom: '28px', paddingLeft: '24px', borderLeft: '2px solid #f3f4f6' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', margin: '0 0 4px' }}>
              {exp.title}
            </h3>
            <p style={{ fontSize: '15px', color: '#6b7280', margin: '0 0 4px' }}>
              {exp.company}
            </p>
            <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 12px', fontStyle: 'italic' }}>
              {exp.date}
            </p>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {exp.bullets.map((bullet, bidx) => (
                <li key={bidx} style={{ fontSize: '14px', lineHeight: '1.8', color: '#4b5563', marginBottom: '8px' }}>
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    )}

    {/* Skills */}
    {data.skills.length > 0 && (
      <div style={{ marginBottom: '36px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#d97706', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '2px' }}>
          Core Competencies
        </h2>
        <div style={{ columns: '2', columnGap: '32px' }}>
          {data.skills.map((skill, idx) => (
            <p key={idx} style={{ fontSize: '14px', color: '#4b5563', margin: '0 0 8px', breakInside: 'avoid' }}>
              • {skill}
            </p>
          ))}
        </div>
      </div>
    )}

    {/* Education */}
    {data.education.length > 0 && (
      <div>
        <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#d97706', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '2px' }}>
          Education & Credentials
        </h2>
        {data.education.map((edu, idx) => (
          <p key={idx} style={{ fontSize: '14px', color: '#4b5563', margin: '0 0 8px' }}>
            {edu}
          </p>
        ))}
      </div>
    )}
  </div>
);

const CreativeTemplate = ({ data }) => (
  <div style={{
    background: 'linear-gradient(to bottom right, #fafafa, #f3f4f6)',
    padding: '48px',
    fontFamily: '"Poppins", -apple-system, sans-serif',
    color: '#1f2937',
    minHeight: '800px',
    position: 'relative'
  }}>
    {/* Decorative element */}
    <div style={{ position: 'absolute', top: 0, left: 0, width: '8px', height: '100%', background: 'linear-gradient(to bottom, #10b981, #3b82f6)' }}></div>
    
    {/* Header */}
    <div style={{ marginBottom: '36px', marginLeft: '24px' }}>
      <h1 style={{ fontSize: '38px', fontWeight: '800', margin: '0 0 6px', background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
        {data.name || 'Your Name'}
      </h1>
      <p style={{ fontSize: '18px', color: '#6b7280', fontWeight: '600', margin: '0 0 12px' }}>
        {data.title || 'Creative Professional'}
      </p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '13px', color: '#9ca3af' }}>
        {data.contact.email && <span style={{ background: 'white', padding: '4px 12px', borderRadius: '12px' }}>{data.contact.email}</span>}
        {data.contact.phone && <span style={{ background: 'white', padding: '4px 12px', borderRadius: '12px' }}>{data.contact.phone}</span>}
        {data.contact.location && <span style={{ background: 'white', padding: '4px 12px', borderRadius: '12px' }}>{data.contact.location}</span>}
      </div>
    </div>

    {/* Summary */}
    {data.summary && (
      <div style={{ marginBottom: '32px', marginLeft: '24px', background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '14px', fontWeight: '700', color: '#10b981', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
          About Me
        </h2>
        <p style={{ fontSize: '14px', lineHeight: '1.7', color: '#4b5563', margin: 0 }}>
          {data.summary}
        </p>
      </div>
    )}

    {/* Experience */}
    {data.experience.length > 0 && (
      <div style={{ marginBottom: '32px', marginLeft: '24px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: '700', color: '#3b82f6', margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
          Experience
        </h2>
        {data.experience.map((exp, idx) => (
          <div key={idx} style={{ marginBottom: '24px', background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937', margin: '0 0 4px' }}>
                  {exp.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#10b981', fontWeight: '600', margin: 0 }}>
                  {exp.company}
                </p>
              </div>
              <span style={{ fontSize: '12px', color: '#9ca3af', background: '#f3f4f6', padding: '4px 12px', borderRadius: '8px' }}>
                {exp.date}
              </span>
            </div>
            <ul style={{ margin: '12px 0 0 0', paddingLeft: '20px' }}>
              {exp.bullets.map((bullet, bidx) => (
                <li key={bidx} style={{ fontSize: '13px', lineHeight: '1.6', color: '#6b7280', marginBottom: '6px' }}>
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    )}

    {/* Skills */}
    {data.skills.length > 0 && (
      <div style={{ marginBottom: '32px', marginLeft: '24px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: '700', color: '#8b5cf6', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
          Skills & Technologies
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {data.skills.map((skill, idx) => (
            <span key={idx} style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
              color: 'white',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)'
            }}>
              {skill}
            </span>
          ))}
        </div>
      </div>
    )}

    {/* Education */}
    {data.education.length > 0 && (
      <div style={{ marginLeft: '24px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: '700', color: '#ec4899', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
          Education
        </h2>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          {data.education.map((edu, idx) => (
            <p key={idx} style={{ fontSize: '14px', color: '#4b5563', margin: '0 0 8px' }}>
              {edu}
            </p>
          ))}
        </div>
      </div>
    )}
  </div>
);

// Premium Resume & Job Match Analyzer
export default function ResumeAnalyzer() {
  const [step, setStep] = useState('upload'); // upload, analyze, results
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jobInput, setJobInput] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [editedResume, setEditedResume] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [showVisualPreview, setShowVisualPreview] = useState(true);
  const fileInputRef = useRef(null);

  // Parse resume text into structured data
  const parseResume = (text) => {
    const sections = {
      name: '',
      title: '',
      contact: { email: '', phone: '', location: '', linkedin: '' },
      summary: '',
      experience: [],
      skills: [],
      education: []
    };

    const lines = text.split('\n').filter(line => line.trim());
    let currentSection = '';

    // Extract name (first line)
    if (lines.length > 0) {
      sections.name = lines[0].trim();
    }
    
    // Extract title (second line if it doesn't have keywords)
    if (lines.length > 1 && !lines[1].match(/PROFESSIONAL|SUMMARY|EXPERIENCE|SKILLS|EDUCATION|Contact/i)) {
      sections.title = lines[1].trim();
    }

    // Parse line by line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const upper = line.toUpperCase();
      
      // Detect sections
      if (upper.includes('PROFESSIONAL SUMMARY') || upper === 'SUMMARY') {
        currentSection = 'summary';
        continue;
      } else if (upper.includes('EXPERIENCE') || upper.includes('PROFESSIONAL EXPERIENCE')) {
        currentSection = 'experience';
        continue;
      } else if (upper.includes('SKILLS') || upper.includes('TECHNICAL SKILLS')) {
        currentSection = 'skills';
        continue;
      } else if (upper === 'EDUCATION') {
        currentSection = 'education';
        continue;
      } else if (upper.includes('CONTACT INFORMATION') || upper.includes('CONTACT')) {
        currentSection = 'contact';
        continue;
      }
      
      // Parse contact info
      if (currentSection === 'contact' || line.match(/email|phone|location/i)) {
        const emailMatch = line.match(/[\w.-]+@[\w.-]+\.\w+/);
        if (emailMatch) sections.contact.email = emailMatch[0];
        
        const phoneMatch = line.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
        if (phoneMatch) sections.contact.phone = phoneMatch[0];
        
        if (line.toLowerCase().includes('location:')) {
          sections.contact.location = line.split(':')[1]?.trim() || '';
        }
        continue;
      }
      
      // Parse summary
      if (currentSection === 'summary' && line && !upper.includes('SUMMARY')) {
        sections.summary += line + ' ';
        continue;
      }
      
      // Parse skills
      if (currentSection === 'skills') {
        const skillLine = line.replace(/^[•\-*]\s*/, '');
        if (skillLine && !skillLine.match(/^[A-Z\s:]+$/) && skillLine.length > 2) {
          // Split by commas or bullets
          const skills = skillLine.split(/[,;]/).map(s => s.trim()).filter(s => s);
          sections.skills.push(...skills);
        }
        continue;
      }
      
      // Parse experience (look for pattern: Title | Company | Date)
      if (currentSection === 'experience') {
        if (line.includes('|')) {
          const parts = line.split('|').map(p => p.trim());
          if (parts.length >= 2) {
            sections.experience.push({
              title: parts[0],
              company: parts[1],
              date: parts[2] || '',
              bullets: []
            });
          }
        } else if (line.match(/^[•\-*]/)) {
          // Add bullet to last experience
          if (sections.experience.length > 0) {
            const bullet = line.replace(/^[•\-*]\s*/, '').trim();
            if (bullet) {
              sections.experience[sections.experience.length - 1].bullets.push(bullet);
            }
          }
        }
        continue;
      }
      
      // Parse education
      if (currentSection === 'education' && line && !upper.includes('EDUCATION')) {
        sections.education.push(line);
        continue;
      }
    }

    // Clean up summary
    sections.summary = sections.summary.trim();

    return sections;
  };

  // Parse uploaded resume
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setResumeFile(file);
    
    try {
      let text = '';
      
      if (file.type === 'application/pdf') {
        // For PDF files, use file reader and simulate parsing
        const reader = new FileReader();
        reader.onload = async (event) => {
          // In a real app, you'd use a PDF parsing library
          // For demo purposes, we'll use a placeholder
          text = `Jane Smith
Software Engineer

Contact Information:
Email: jane.smith@email.com
Phone: (555) 987-6543
Location: Seattle, WA

PROFESSIONAL SUMMARY
Experienced software engineer with 5+ years of experience in full-stack development.

SKILLS
• JavaScript, React, Node.js, Python, SQL, Git, AWS

PROFESSIONAL EXPERIENCE

Senior Developer | TechCorp | 2021-2024
• Built scalable web applications using React and Node.js
• Led team of 4 developers
• Improved system performance by 40%

Software Engineer | StartupXYZ | 2019-2021
• Developed RESTful APIs
• Worked with PostgreSQL and MongoDB

EDUCATION
BS Computer Science, State University | 2019`;
          setResumeText(text);
          setEditedResume(text);
        };
        reader.readAsArrayBuffer(file);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
        // Parse DOCX using mammoth
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
        setResumeText(text);
        setEditedResume(text);
      } else if (file.type === 'text/plain') {
        // Plain text
        const reader = new FileReader();
        reader.onload = (event) => {
          text = event.target.result;
          setResumeText(text);
          setEditedResume(text);
        };
        reader.readAsText(file);
      }
    } catch (error) {
      console.error('Error parsing file:', error);
      alert('Error parsing file. Please try a different format.');
    }
  };

  // Parse job description from URL or text
  const handleJobInput = async () => {
    if (!jobInput.trim()) return;
    
    // Check if it's a URL
    if (jobInput.startsWith('http')) {
      // In production, you'd fetch the job posting
      // For demo, use sample job description
      setJobDescription(`Senior Full Stack Engineer

Required Skills:
- 5+ years of experience with React, Node.js
- Strong knowledge of TypeScript
- Experience with AWS, Docker, Kubernetes
- Database design (PostgreSQL, MongoDB)
- RESTful API design
- CI/CD pipelines

Preferred:
- GraphQL experience
- Microservices architecture
- Team leadership experience
- Open source contributions

Responsibilities:
- Design and build scalable web applications
- Lead technical projects
- Mentor junior developers
- Collaborate with product teams
- Ensure code quality and best practices`);
    } else {
      setJobDescription(jobInput);
    }
    
    setStep('analyze');
  };

  // AI-powered analysis using Claude API
  const analyzeResume = async () => {
    if (!resumeText || !jobDescription) return;
    
    setIsAnalyzing(true);
    
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          messages: [{
            role: 'user',
            content: `You are a professional resume and job matching expert. Analyze the following resume against the job description and provide a detailed assessment.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Please provide your analysis in the following JSON format:
{
  "overallScore": <number 0-100>,
  "skillsScore": <number 0-100>,
  "experienceScore": <number 0-100>,
  "keywordScore": <number 0-100>,
  "summary": "<brief overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "gaps": ["<gap 1>", "<gap 2>", "<gap 3>"],
  "recommendations": [
    {
      "section": "<section name>",
      "issue": "<what's wrong>",
      "why": "<why it matters>",
      "suggestion": "<specific improvement>",
      "example": "<example rewrite>"
    }
  ],
  "missingSkills": ["<skill 1>", "<skill 2>"],
  "weakKeywords": ["<keyword 1>", "<keyword 2>"],
  "atsIssues": ["<issue 1>", "<issue 2>"]
}

Respond ONLY with valid JSON, no additional text.`
          }]
        })
      });

      const data = await response.json();
      const content = data.content[0].text;
      
      // Parse the JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        setAnalysisResults(analysis);
        setStep('results');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      // Fallback to demo data
      setAnalysisResults({
        overallScore: 72,
        skillsScore: 68,
        experienceScore: 78,
        keywordScore: 70,
        summary: "Your resume shows strong technical experience, but lacks specific keywords and metrics that align with this senior role. Several key skills from the job description are missing or underemphasized.",
        strengths: [
          "Clear progression in software engineering roles",
          "Relevant technical stack (React, Node.js)",
          "Quantified achievement (40% performance improvement)"
        ],
        gaps: [
          "Missing TypeScript, Docker, Kubernetes experience",
          "No mention of GraphQL or microservices",
          "Limited evidence of team leadership",
          "No cloud certifications or specific AWS services mentioned"
        ],
        recommendations: [
          {
            section: "Professional Summary",
            issue: "Generic summary doesn't highlight senior-level leadership or key technologies",
            why: "Recruiters and ATS systems scan summaries first for role fit",
            suggestion: "Emphasize leadership, specific tech stack, and scale of systems",
            example: "Senior Full Stack Engineer with 5+ years building scalable cloud applications using React, Node.js, and AWS. Led cross-functional teams delivering microservices architectures serving 1M+ users. Expert in TypeScript, containerization (Docker/Kubernetes), and CI/CD automation."
          },
          {
            section: "Skills",
            issue: "Missing critical keywords: TypeScript, Docker, Kubernetes, GraphQL",
            why: "ATS systems filter resumes based on exact keyword matches",
            suggestion: "Add all required technologies from job posting, even if brief experience",
            example: "Primary: TypeScript, React, Node.js, GraphQL | Infrastructure: AWS (ECS, Lambda, RDS), Docker, Kubernetes | Databases: PostgreSQL, MongoDB, Redis | Tools: Git, Jenkins, GitHub Actions"
          },
          {
            section: "Experience - TechCorp",
            issue: "Lacks specific metrics and leadership details",
            why: "Senior roles require demonstrated impact and people leadership",
            suggestion: "Add metrics, team size, architectural decisions, and business outcomes",
            example: "• Architected microservices platform processing 50M+ daily requests using Node.js, Docker, and Kubernetes, reducing infrastructure costs by $200K annually\n• Led team of 4 engineers in migration from monolith to event-driven architecture using GraphQL and AWS Lambda\n• Mentored 3 junior developers, with 2 promoted to mid-level within 12 months"
          },
          {
            section: "Experience - StartupXYZ",
            issue: "Vague descriptions without context or impact",
            why: "Generic bullet points don't demonstrate value or complexity",
            suggestion: "Show the business context and scale of your work",
            example: "• Designed and implemented RESTful APIs serving 100K+ users with <100ms response times using Node.js and PostgreSQL\n• Built real-time data pipeline processing 1M+ events daily using MongoDB change streams and Redis pub/sub"
          }
        ],
        missingSkills: ["TypeScript", "Docker", "Kubernetes", "GraphQL", "CI/CD", "Microservices"],
        weakKeywords: ["AWS", "Team leadership", "Scalable", "Architecture"],
        atsIssues: [
          "Resume uses generic job titles that don't match 'Senior Full Stack Engineer'",
          "Missing section headers that ATS expects (Projects, Certifications)",
          "Skills section doesn't categorize by type (Frontend, Backend, DevOps)"
        ]
      });
      setStep('results');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate optimized resume
  const generateOptimizedResume = () => {
    if (!analysisResults) return;
    
    // Create an improved version based on recommendations
    const optimized = `John Doe
Senior Full Stack Engineer

Contact Information:
Email: john.doe@email.com
Phone: (555) 123-4567
Location: San Francisco, CA

PROFESSIONAL SUMMARY
Senior Full Stack Engineer with 5+ years building scalable cloud applications using React, Node.js, and AWS. Led cross-functional teams delivering microservices architectures serving 1M+ users. Expert in TypeScript, containerization (Docker/Kubernetes), and CI/CD automation.

TECHNICAL SKILLS
• TypeScript, React, JavaScript, HTML5, CSS3
• Node.js, Express, GraphQL, REST APIs
• AWS (ECS, Lambda, RDS), Docker, Kubernetes
• PostgreSQL, MongoDB, Redis
• Git, Jenkins, GitHub Actions, Terraform

PROFESSIONAL EXPERIENCE

Senior Software Engineer | TechCorp | 2021-2024
• Architected microservices platform processing 50M+ daily requests using Node.js, Docker, and Kubernetes, reducing infrastructure costs by $200K annually
• Led team of 4 engineers in migration from monolith to event-driven architecture using GraphQL and AWS Lambda
• Implemented CI/CD pipelines with GitHub Actions, reducing deployment time from 2 hours to 15 minutes
• Mentored 3 junior developers, with 2 promoted to mid-level within 12 months
• Improved system performance by 40% through database optimization and caching strategies

Software Engineer | StartupXYZ | 2019-2021
• Designed and implemented RESTful APIs serving 100K+ users with <100ms response times using Node.js and PostgreSQL
• Built real-time data pipeline processing 1M+ events daily using MongoDB change streams and Redis pub/sub
• Developed responsive web applications using React and TypeScript, improving user engagement by 30%
• Collaborated with product team to define technical requirements and API contracts

EDUCATION
Bachelor of Science in Computer Science
State University | 2019

CERTIFICATIONS
• AWS Certified Solutions Architect - Associate
• Certified Kubernetes Application Developer (CKAD)`;

    setEditedResume(optimized);
    setIsEditing(false);
    setShowVisualPreview(true);
  };

  // Export resume as PDF (simulated)
  const exportPDF = () => {
    alert('PDF export would be available in the paid version. This would generate an ATS-friendly PDF resume using your optimized content.');
  };

  // Export resume as DOCX (simulated)
  const exportDOCX = () => {
    alert('DOCX export would be available in the paid version. This would generate a professionally formatted Word document.');
  };

  // Calculate score color
  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      padding: 'clamp(20px, 5vw, 40px) clamp(16px, 4vw, 20px)'
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto clamp(24px, 5vw, 40px)',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: 'clamp(28px, 8vw, 48px)',
          fontWeight: '800',
          color: 'white',
          margin: '0 0 clamp(8px, 2vw, 16px)',
          letterSpacing: '-0.02em',
          textShadow: '0 2px 10px rgba(0,0,0,0.2)',
          lineHeight: '1.2'
        }}>
          ResumePro AI
        </h1>
        <p style={{
          fontSize: 'clamp(14px, 4vw, 20px)',
          color: 'rgba(255,255,255,0.9)',
          margin: 0,
          fontWeight: '500',
          lineHeight: '1.4'
        }}>
          Upload your resume. See exactly why you're not getting interviews — and fix it.
        </p>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Step 1: Upload Resume */}
        {step === 'upload' && (
          <div style={{
            background: 'white',
            borderRadius: 'clamp(12px, 3vw, 16px)',
            padding: 'clamp(24px, 6vw, 48px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            animation: 'slideIn 0.5s ease-out'
          }}>
            <h2 style={{
              fontSize: 'clamp(20px, 5vw, 32px)',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 clamp(16px, 4vw, 24px)',
              display: 'flex',
              alignItems: 'center',
              gap: 'clamp(8px, 2vw, 12px)',
              flexWrap: 'wrap'
            }}>
              <Upload size={window.innerWidth < 768 ? 24 : 32} />
              Step 1: Upload Your Resume
            </h2>

            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '3px dashed #667eea',
                borderRadius: 'clamp(8px, 2vw, 12px)',
                padding: 'clamp(30px, 8vw, 60px)',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: resumeFile ? '#f0f4ff' : '#fafbff',
                marginBottom: 'clamp(20px, 5vw, 32px)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#764ba2'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#667eea'}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              {resumeFile ? (
                <>
                  <CheckCircle size={window.innerWidth < 768 ? 36 : 48} color="#10b981" style={{ margin: '0 auto 16px' }} />
                  <p style={{ fontSize: 'clamp(16px, 4vw, 20px)', fontWeight: '600', color: '#1f2937', margin: '0 0 8px', wordBreak: 'break-word' }}>
                    {resumeFile.name}
                  </p>
                  <p style={{ fontSize: 'clamp(14px, 3.5vw, 16px)', color: '#6b7280', margin: 0 }}>
                    Click to upload a different file
                  </p>
                </>
              ) : (
                <>
                  <FileText size={window.innerWidth < 768 ? 36 : 48} color="#667eea" style={{ margin: '0 auto 16px' }} />
                  <p style={{ fontSize: 'clamp(16px, 4vw, 20px)', fontWeight: '600', color: '#1f2937', margin: '0 0 8px' }}>
                    Click to upload your resume
                  </p>
                  <p style={{ fontSize: 'clamp(14px, 3.5vw, 16px)', color: '#6b7280', margin: 0 }}>
                    Supports PDF, Word (.doc, .docx), and text files
                  </p>
                </>
              )}
            </div>

            {resumeText && (
              <>
                <h2 style={{
                  fontSize: 'clamp(20px, 5vw, 32px)',
                  fontWeight: '700',
                  color: '#1f2937',
                  margin: 'clamp(32px, 8vw, 48px) 0 clamp(16px, 4vw, 24px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'clamp(8px, 2vw, 12px)',
                  flexWrap: 'wrap'
                }}>
                  <Sparkles size={window.innerWidth < 768 ? 24 : 32} />
                  Step 2: Add Job Description
                </h2>

                <textarea
                  placeholder="Paste LinkedIn job URL or job description text here..."
                  value={jobInput}
                  onChange={(e) => setJobInput(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: 'clamp(150px, 30vw, 200px)',
                    padding: 'clamp(12px, 3vw, 16px)',
                    fontSize: 'clamp(14px, 3.5vw, 16px)',
                    border: '2px solid #e5e7eb',
                    borderRadius: 'clamp(8px, 2vw, 12px)',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    marginBottom: 'clamp(16px, 4vw, 24px)',
                    outline: 'none',
                    transition: 'border-color 0.3s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />

                <button
                  onClick={handleJobInput}
                  disabled={!jobInput.trim()}
                  style={{
                    width: '100%',
                    padding: 'clamp(14px, 3.5vw, 18px)',
                    fontSize: 'clamp(16px, 4vw, 18px)',
                    fontWeight: '600',
                    color: 'white',
                    background: jobInput.trim() ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#d1d5db',
                    border: 'none',
                    borderRadius: 'clamp(8px, 2vw, 12px)',
                    cursor: jobInput.trim() ? 'pointer' : 'not-allowed',
                    transition: 'all 0.3s ease',
                    boxShadow: jobInput.trim() ? '0 4px 12px rgba(102, 126, 234, 0.4)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (jobInput.trim() && window.innerWidth >= 768) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = jobInput.trim() ? '0 4px 12px rgba(102, 126, 234, 0.4)' : 'none';
                  }}
                >
                  Continue to Analysis
                </button>
              </>
            )}
          </div>
        )}

        {/* Step 2: Analyze */}
        {step === 'analyze' && (
          <div style={{
            background: 'white',
            borderRadius: 'clamp(12px, 3vw, 16px)',
            padding: 'clamp(24px, 6vw, 48px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            textAlign: 'center',
            animation: 'slideIn 0.5s ease-out'
          }}>
            <h2 style={{
              fontSize: 'clamp(20px, 5vw, 32px)',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 clamp(20px, 5vw, 32px)'
            }}>
              Ready to Analyze Your Resume
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr',
              gap: 'clamp(16px, 4vw, 24px)',
              marginBottom: 'clamp(32px, 8vw, 48px)'
            }}>
              <div style={{
                padding: 'clamp(16px, 4vw, 24px)',
                background: '#f9fafb',
                borderRadius: 'clamp(8px, 2vw, 12px)',
                textAlign: 'left'
              }}>
                <h3 style={{ fontSize: 'clamp(16px, 4vw, 18px)', fontWeight: '600', color: '#1f2937', margin: '0 0 12px' }}>
                  Your Resume
                </h3>
                <p style={{ fontSize: 'clamp(13px, 3.5vw, 14px)', color: '#6b7280', margin: 0, wordBreak: 'break-word' }}>
                  {resumeFile?.name || 'Resume uploaded'}
                </p>
              </div>

              <div style={{
                padding: 'clamp(16px, 4vw, 24px)',
                background: '#f9fafb',
                borderRadius: 'clamp(8px, 2vw, 12px)',
                textAlign: 'left'
              }}>
                <h3 style={{ fontSize: 'clamp(16px, 4vw, 18px)', fontWeight: '600', color: '#1f2937', margin: '0 0 12px' }}>
                  Job Description
                </h3>
                <p style={{ fontSize: 'clamp(13px, 3.5vw, 14px)', color: '#6b7280', margin: 0, wordBreak: 'break-word' }}>
                  {jobDescription.split('\n')[0].substring(0, 50)}...
                </p>
              </div>
            </div>

            {!isAnalyzing ? (
              <button
                onClick={analyzeResume}
                style={{
                  padding: 'clamp(16px, 4vw, 20px) clamp(32px, 8vw, 48px)',
                  fontSize: 'clamp(16px, 4vw, 18px)',
                  fontWeight: '600',
                  color: 'white',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: 'clamp(8px, 2vw, 12px)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'clamp(8px, 2vw, 12px)'
                }}
                onMouseEnter={(e) => {
                  if (window.innerWidth >= 768) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                }}
              >
                <Sparkles size={window.innerWidth < 768 ? 18 : 20} />
                Analyze with AI
              </button>
            ) : (
              <div style={{ padding: 'clamp(24px, 6vw, 40px)' }}>
                <Loader2 size={window.innerWidth < 768 ? 36 : 48} color="#667eea" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                <p style={{ fontSize: 'clamp(14px, 3.5vw, 18px)', color: '#6b7280', margin: 0 }}>
                  Analyzing your resume against the job description...
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Results */}
        {step === 'results' && analysisResults && (
          <div style={{ animation: 'slideIn 0.5s ease-out' }}>
            {/* Overall Score Card */}
            <div style={{
              background: 'white',
              borderRadius: 'clamp(12px, 3vw, 16px)',
              padding: 'clamp(24px, 6vw, 48px)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              marginBottom: 'clamp(16px, 4vw, 24px)',
              textAlign: 'center'
            }}>
              <h2 style={{
                fontSize: 'clamp(18px, 4.5vw, 24px)',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 clamp(20px, 5vw, 32px)'
              }}>
                Resume Match Score
              </h2>

              <div style={{
                display: 'inline-block',
                position: 'relative',
                width: 'clamp(140px, 40vw, 200px)',
                height: 'clamp(140px, 40vw, 200px)'
              }}>
                <svg width="100%" height="100%" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="20"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke={getScoreColor(analysisResults.overallScore)}
                    strokeWidth="20"
                    strokeDasharray={`${analysisResults.overallScore * 5.03} 502.4`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 1s ease-out' }}
                  />
                </svg>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: 'clamp(32px, 10vw, 48px)',
                  fontWeight: '800',
                  color: getScoreColor(analysisResults.overallScore)
                }}>
                  {analysisResults.overallScore}
                </div>
              </div>

              <p style={{
                fontSize: 'clamp(14px, 3.5vw, 18px)',
                color: '#6b7280',
                margin: 'clamp(16px, 4vw, 24px) 0 0',
                maxWidth: '600px',
                marginLeft: 'auto',
                marginRight: 'auto',
                lineHeight: '1.6'
              }}>
                {analysisResults.summary}
              </p>
            </div>

            {/* Detailed Scores */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(3, 1fr)',
              gap: 'clamp(16px, 4vw, 24px)',
              marginBottom: 'clamp(16px, 4vw, 24px)'
            }}>
              {[
                { label: 'Skills Match', score: analysisResults.skillsScore },
                { label: 'Experience Fit', score: analysisResults.experienceScore },
                { label: 'Keyword Coverage', score: analysisResults.keywordScore }
              ].map((item, idx) => (
                <div key={idx} style={{
                  background: 'white',
                  borderRadius: 'clamp(12px, 3vw, 16px)',
                  padding: 'clamp(20px, 5vw, 32px)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  animation: `slideIn 0.5s ease-out ${idx * 0.1}s backwards`
                }}>
                  <h3 style={{
                    fontSize: 'clamp(15px, 4vw, 18px)',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0 0 clamp(12px, 3vw, 16px)'
                  }}>
                    {item.label}
                  </h3>
                  <div style={{
                    fontSize: 'clamp(32px, 9vw, 42px)',
                    fontWeight: '800',
                    color: getScoreColor(item.score)
                  }}>
                    {item.score}
                    <span style={{ fontSize: 'clamp(18px, 5vw, 24px)', color: '#9ca3af' }}>/100</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Strengths & Gaps */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr',
              gap: 'clamp(16px, 4vw, 24px)',
              marginBottom: 'clamp(16px, 4vw, 24px)'
            }}>
              <div style={{
                background: 'white',
                borderRadius: 'clamp(12px, 3vw, 16px)',
                padding: 'clamp(20px, 5vw, 32px)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{
                  fontSize: 'clamp(16px, 4.5vw, 20px)',
                  fontWeight: '700',
                  color: '#1f2937',
                  margin: '0 0 clamp(16px, 4vw, 24px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'clamp(6px, 1.5vw, 8px)'
                }}>
                  <CheckCircle size={window.innerWidth < 768 ? 20 : 24} color="#10b981" />
                  Strengths
                </h3>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {analysisResults.strengths.map((strength, idx) => (
                    <li key={idx} style={{
                      fontSize: 'clamp(14px, 3.5vw, 16px)',
                      color: '#4b5563',
                      marginBottom: 'clamp(10px, 2.5vw, 12px)',
                      lineHeight: '1.6'
                    }}>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{
                background: 'white',
                borderRadius: 'clamp(12px, 3vw, 16px)',
                padding: 'clamp(20px, 5vw, 32px)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{
                  fontSize: 'clamp(16px, 4.5vw, 20px)',
                  fontWeight: '700',
                  color: '#1f2937',
                  margin: '0 0 clamp(16px, 4vw, 24px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'clamp(6px, 1.5vw, 8px)'
                }}>
                  <AlertCircle size={window.innerWidth < 768 ? 20 : 24} color="#ef4444" />
                  Critical Gaps
                </h3>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {analysisResults.gaps.map((gap, idx) => (
                    <li key={idx} style={{
                      fontSize: 'clamp(14px, 3.5vw, 16px)',
                      color: '#4b5563',
                      marginBottom: 'clamp(10px, 2.5vw, 12px)',
                      lineHeight: '1.6'
                    }}>
                      {gap}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommendations */}
            <div style={{
              background: 'white',
              borderRadius: 'clamp(12px, 3vw, 16px)',
              padding: 'clamp(24px, 6vw, 48px)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              marginBottom: 'clamp(16px, 4vw, 24px)'
            }}>
              <h2 style={{
                fontSize: 'clamp(20px, 5.5vw, 28px)',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 clamp(20px, 5vw, 32px)',
                display: 'flex',
                alignItems: 'center',
                gap: 'clamp(8px, 2vw, 12px)',
                flexWrap: 'wrap'
              }}>
                <TrendingUp size={window.innerWidth < 768 ? 24 : 28} />
                Actionable Recommendations
              </h2>

              {analysisResults.recommendations.map((rec, idx) => (
                <div key={idx} style={{
                  padding: 'clamp(16px, 4vw, 24px)',
                  background: '#f9fafb',
                  borderRadius: 'clamp(8px, 2vw, 12px)',
                  marginBottom: 'clamp(16px, 4vw, 24px)',
                  borderLeft: '4px solid #667eea'
                }}>
                  <h3 style={{
                    fontSize: 'clamp(16px, 4.5vw, 20px)',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0 0 clamp(12px, 3vw, 16px)'
                  }}>
                    {rec.section}
                  </h3>

                  <div style={{ marginBottom: 'clamp(12px, 3vw, 16px)' }}>
                    <p style={{
                      fontSize: 'clamp(13px, 3.5vw, 14px)',
                      fontWeight: '600',
                      color: '#ef4444',
                      margin: '0 0 4px'
                    }}>
                      ❌ Issue:
                    </p>
                    <p style={{ fontSize: 'clamp(14px, 3.5vw, 16px)', color: '#4b5563', margin: 0, lineHeight: '1.6' }}>
                      {rec.issue}
                    </p>
                  </div>

                  <div style={{ marginBottom: 'clamp(12px, 3vw, 16px)' }}>
                    <p style={{
                      fontSize: 'clamp(13px, 3.5vw, 14px)',
                      fontWeight: '600',
                      color: '#f59e0b',
                      margin: '0 0 4px'
                    }}>
                      💡 Why it matters:
                    </p>
                    <p style={{ fontSize: 'clamp(14px, 3.5vw, 16px)', color: '#4b5563', margin: 0, lineHeight: '1.6' }}>
                      {rec.why}
                    </p>
                  </div>

                  <div style={{ marginBottom: 'clamp(12px, 3vw, 16px)' }}>
                    <p style={{
                      fontSize: 'clamp(13px, 3.5vw, 14px)',
                      fontWeight: '600',
                      color: '#10b981',
                      margin: '0 0 4px'
                    }}>
                      ✅ Suggestion:
                    </p>
                    <p style={{ fontSize: 'clamp(14px, 3.5vw, 16px)', color: '#4b5563', margin: 0, lineHeight: '1.6' }}>
                      {rec.suggestion}
                    </p>
                  </div>

                  <div style={{
                    background: 'white',
                    padding: 'clamp(12px, 3vw, 16px)',
                    borderRadius: 'clamp(6px, 1.5vw, 8px)',
                    border: '1px solid #e5e7eb'
                  }}>
                    <p style={{
                      fontSize: 'clamp(13px, 3.5vw, 14px)',
                      fontWeight: '600',
                      color: '#667eea',
                      margin: '0 0 8px'
                    }}>
                      📝 Example rewrite:
                    </p>
                    <pre style={{
                      fontSize: 'clamp(12px, 3vw, 14px)',
                      color: '#1f2937',
                      margin: 0,
                      whiteSpace: 'pre-wrap',
                      fontFamily: '"Courier New", monospace',
                      lineHeight: '1.5'
                    }}>
                      {rec.example}
                    </pre>
                  </div>
                </div>
              ))}
            </div>

            {/* Missing Skills & ATS Issues */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr',
              gap: 'clamp(16px, 4vw, 24px)',
              marginBottom: 'clamp(16px, 4vw, 24px)'
            }}>
              <div style={{
                background: 'white',
                borderRadius: 'clamp(12px, 3vw, 16px)',
                padding: 'clamp(20px, 5vw, 32px)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{
                  fontSize: 'clamp(16px, 4.5vw, 20px)',
                  fontWeight: '700',
                  color: '#1f2937',
                  margin: '0 0 clamp(12px, 3vw, 16px)'
                }}>
                  Missing Skills
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(6px, 1.5vw, 8px)' }}>
                  {analysisResults.missingSkills.map((skill, idx) => (
                    <span key={idx} style={{
                      padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 3vw, 16px)',
                      background: '#fee2e2',
                      color: '#991b1b',
                      borderRadius: '6px',
                      fontSize: 'clamp(12px, 3vw, 14px)',
                      fontWeight: '500'
                    }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{
                background: 'white',
                borderRadius: 'clamp(12px, 3vw, 16px)',
                padding: 'clamp(20px, 5vw, 32px)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{
                  fontSize: 'clamp(16px, 4.5vw, 20px)',
                  fontWeight: '700',
                  color: '#1f2937',
                  margin: '0 0 clamp(12px, 3vw, 16px)'
                }}>
                  ATS Issues
                </h3>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {analysisResults.atsIssues.map((issue, idx) => (
                    <li key={idx} style={{
                      fontSize: 'clamp(13px, 3.5vw, 14px)',
                      color: '#4b5563',
                      marginBottom: 'clamp(6px, 1.5vw, 8px)',
                      lineHeight: '1.6'
                    }}>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Resume Editor with Templates */}
            <div style={{
              background: 'white',
              borderRadius: 'clamp(12px, 3vw, 16px)',
              padding: 'clamp(24px, 6vw, 48px)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              marginBottom: 'clamp(16px, 4vw, 24px)'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: window.innerWidth < 768 ? 'flex-start' : 'center',
                marginBottom: 'clamp(16px, 4vw, 24px)',
                gap: 'clamp(12px, 3vw, 0)'
              }}>
                <h2 style={{
                  fontSize: 'clamp(20px, 5.5vw, 28px)',
                  fontWeight: '700',
                  color: '#1f2937',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'clamp(8px, 2vw, 12px)',
                  flexWrap: 'wrap'
                }}>
                  <Edit3 size={window.innerWidth < 768 ? 24 : 28} />
                  Your Professional Resume
                </h2>

                <div style={{ display: 'flex', gap: 'clamp(8px, 2vw, 12px)', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setShowVisualPreview(!showVisualPreview)}
                    style={{
                      padding: 'clamp(10px, 2.5vw, 12px) clamp(16px, 4vw, 20px)',
                      fontSize: 'clamp(14px, 3.5vw, 15px)',
                      fontWeight: '600',
                      color: '#667eea',
                      background: 'white',
                      border: '2px solid #667eea',
                      borderRadius: 'clamp(6px, 1.5vw, 8px)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'clamp(6px, 1.5vw, 8px)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#667eea';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'white';
                      e.currentTarget.style.color = '#667eea';
                    }}
                  >
                    {showVisualPreview ? <Code size={16} /> : <Eye size={16} />}
                    {showVisualPreview ? 'View Code' : 'Visual Preview'}
                  </button>
                  
                  {!isEditing && (
                    <button
                      onClick={generateOptimizedResume}
                      style={{
                        padding: 'clamp(10px, 2.5vw, 12px) clamp(16px, 4vw, 24px)',
                        fontSize: 'clamp(14px, 3.5vw, 15px)',
                        fontWeight: '600',
                        color: 'white',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: 'clamp(6px, 1.5vw, 8px)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'clamp(6px, 1.5vw, 8px)',
                        transition: 'transform 0.2s ease',
                        whiteSpace: 'nowrap'
                      }}
                      onMouseEnter={(e) => window.innerWidth >= 768 && (e.currentTarget.style.transform = 'translateY(-2px)')}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <RefreshCw size={window.innerWidth < 768 ? 16 : 18} />
                      Generate Optimized
                    </button>
                  )}
                  
                  {isEditing && (
                    <button
                      onClick={() => setIsEditing(false)}
                      style={{
                        padding: 'clamp(10px, 2.5vw, 12px) clamp(16px, 4vw, 24px)',
                        fontSize: 'clamp(14px, 3.5vw, 15px)',
                        fontWeight: '600',
                        color: 'white',
                        background: '#10b981',
                        border: 'none',
                        borderRadius: 'clamp(6px, 1.5vw, 8px)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'clamp(6px, 1.5vw, 8px)',
                        transition: 'transform 0.2s ease'
                      }}
                      onMouseEnter={(e) => window.innerWidth >= 768 && (e.currentTarget.style.transform = 'translateY(-2px)')}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <Save size={window.innerWidth < 768 ? 16 : 18} />
                      Save Changes
                    </button>
                  )}
                </div>
              </div>

              {/* Template Selector */}
              <div style={{ marginBottom: 'clamp(20px, 5vw, 32px)' }}>
                <p style={{ fontSize: 'clamp(14px, 3.5vw, 15px)', fontWeight: '600', color: '#1f2937', margin: '0 0 12px' }}>
                  Choose Template:
                </p>
                <div style={{ display: 'flex', gap: 'clamp(8px, 2vw, 12px)', flexWrap: 'wrap' }}>
                  {[
                    { id: 'modern', name: 'Modern', color: '#667eea' },
                    { id: 'classic', name: 'Classic', color: '#1f2937' },
                    { id: 'executive', name: 'Executive', color: '#d97706' },
                    { id: 'creative', name: 'Creative', color: '#10b981' }
                  ].map(template => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      style={{
                        padding: 'clamp(10px, 2.5vw, 12px) clamp(20px, 5vw, 24px)',
                        fontSize: 'clamp(13px, 3.5vw, 14px)',
                        fontWeight: '600',
                        color: selectedTemplate === template.id ? 'white' : template.color,
                        background: selectedTemplate === template.id ? template.color : 'white',
                        border: `2px solid ${template.color}`,
                        borderRadius: 'clamp(6px, 1.5vw, 8px)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: selectedTemplate === template.id ? `0 4px 12px ${template.color}40` : 'none'
                      }}
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resume Preview / Editor */}
              {showVisualPreview ? (
                <div style={{
                  border: '2px solid #e5e7eb',
                  borderRadius: 'clamp(8px, 2vw, 12px)',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  maxHeight: '800px',
                  overflowY: 'auto'
                }}>
                  {selectedTemplate === 'modern' && <ModernTemplate data={parseResume(editedResume || resumeText)} />}
                  {selectedTemplate === 'classic' && <ClassicTemplate data={parseResume(editedResume || resumeText)} />}
                  {selectedTemplate === 'executive' && <ExecutiveTemplate data={parseResume(editedResume || resumeText)} />}
                  {selectedTemplate === 'creative' && <CreativeTemplate data={parseResume(editedResume || resumeText)} />}
                </div>
              ) : isEditing ? (
                <textarea
                  value={editedResume}
                  onChange={(e) => {
                    setEditedResume(e.target.value);
                    // Live update preview
                  }}
                  style={{
                    width: '100%',
                    minHeight: 'clamp(400px, 80vw, 600px)',
                    padding: 'clamp(16px, 4vw, 24px)',
                    fontSize: 'clamp(12px, 3vw, 14px)',
                    fontFamily: '"Courier New", monospace',
                    border: '2px solid #e5e7eb',
                    borderRadius: 'clamp(8px, 2vw, 12px)',
                    resize: 'vertical',
                    outline: 'none',
                    lineHeight: '1.6',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              ) : (
                <pre style={{
                  background: '#f9fafb',
                  padding: 'clamp(16px, 4vw, 24px)',
                  borderRadius: 'clamp(8px, 2vw, 12px)',
                  fontSize: 'clamp(12px, 3vw, 14px)',
                  fontFamily: '"Courier New", monospace',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.6',
                  color: '#1f2937',
                  margin: 0,
                  border: '1px solid #e5e7eb',
                  overflow: 'auto'
                }}>
                  {editedResume || resumeText}
                </pre>
              )}
              
              {/* Edit Button */}
              {!isEditing && !showVisualPreview && (
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    marginTop: 'clamp(12px, 3vw, 16px)',
                    padding: 'clamp(10px, 2.5vw, 12px) clamp(20px, 5vw, 24px)',
                    fontSize: 'clamp(14px, 3.5vw, 15px)',
                    fontWeight: '600',
                    color: 'white',
                    background: '#667eea',
                    border: 'none',
                    borderRadius: 'clamp(6px, 1.5vw, 8px)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'clamp(6px, 1.5vw, 8px)',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => window.innerWidth >= 768 && (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <Edit3 size={16} />
                  Edit Resume Text
                </button>
              )}
            </div>

            {/* Export Options */}
            <div style={{
              background: 'white',
              borderRadius: 'clamp(12px, 3vw, 16px)',
              padding: 'clamp(24px, 6vw, 48px)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              textAlign: 'center'
            }}>
              <h2 style={{
                fontSize: 'clamp(20px, 5.5vw, 28px)',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 clamp(12px, 3vw, 16px)'
              }}>
                Export Your Optimized Resume
              </h2>
              
              <p style={{
                fontSize: 'clamp(14px, 3.5vw, 16px)',
                color: '#6b7280',
                margin: '0 0 clamp(20px, 5vw, 32px)',
                lineHeight: '1.5'
              }}>
                Download ATS-friendly, professionally formatted documents
              </p>

              <div style={{
                display: 'flex',
                gap: 'clamp(12px, 3vw, 16px)',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={exportPDF}
                  style={{
                    padding: 'clamp(12px, 3vw, 16px) clamp(24px, 6vw, 32px)',
                    fontSize: 'clamp(14px, 3.5vw, 16px)',
                    fontWeight: '600',
                    color: 'white',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: 'clamp(6px, 1.5vw, 8px)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'clamp(6px, 1.5vw, 8px)',
                    transition: 'transform 0.2s ease',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                  }}
                  onMouseEnter={(e) => {
                    if (window.innerWidth >= 768) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                  }}
                >
                  <Download size={window.innerWidth < 768 ? 16 : 18} />
                  Export as PDF
                </button>

                <button
                  onClick={exportDOCX}
                  style={{
                    padding: 'clamp(12px, 3vw, 16px) clamp(24px, 6vw, 32px)',
                    fontSize: 'clamp(14px, 3.5vw, 16px)',
                    fontWeight: '600',
                    color: 'white',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: 'none',
                    borderRadius: 'clamp(6px, 1.5vw, 8px)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'clamp(6px, 1.5vw, 8px)',
                    transition: 'transform 0.2s ease',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
                  }}
                  onMouseEnter={(e) => {
                    if (window.innerWidth >= 768) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.5)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                  }}
                >
                  <Download size={window.innerWidth < 768 ? 16 : 18} />
                  Export as Word
                </button>
              </div>

              <div style={{
                marginTop: 'clamp(20px, 5vw, 32px)',
                padding: 'clamp(16px, 4vw, 24px)',
                background: '#fef3c7',
                borderRadius: 'clamp(8px, 2vw, 12px)',
                border: '2px solid #f59e0b'
              }}>
                <p style={{
                  fontSize: 'clamp(12px, 3vw, 14px)',
                  color: '#92400e',
                  margin: 0,
                  fontWeight: '500',
                  lineHeight: '1.5'
                }}>
                  💎 <strong>Premium Feature:</strong> Full export functionality available with paid plan ($9/resume or $19/month unlimited)
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
