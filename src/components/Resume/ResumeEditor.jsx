import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import './Resume.css';

export default function ResumeEditor({ resume, job, analysis, onBack, onSave }) {
  const { user } = useAuth();
  const [optimizedResume, setOptimizedResume] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [editMode, setEditMode] = useState('view');
  const [editedData, setEditedData] = useState(null);

  useEffect(() => {
    if (analysis && job) {
      generateOptimized();
    }
  }, []);

  const generateOptimized = async () => {
    setGenerating(true);
    try {
      const response = await api.post('/analysis/optimize', {
        resume_id: resume.id,
        job_id: job.id
      });
      setOptimizedResume(response.data.optimizedResume);
      setEditedData(response.data.optimizedResume);
    } catch (error) {
      console.error('Optimization failed:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.put(`/resumes/${resume.id}`, {
        parsed_data: editedData
      });
      onSave({ ...resume, parsed_data: JSON.stringify(editedData) });
    } catch (error) {
      alert('Failed to save resume');
    }
  };

  const handleExport = async (format) => {
    if (user.subscription_tier === 'free') {
      alert('Premium subscription required for exports');
      return;
    }

    try {
      const response = await api.post(`/export/${format}/${resume.id}`, {}, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${resume.name}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Export failed');
    }
  };

  if (generating) {
    return (
      <div className="editor-loading">
        <div className="spinner"></div>
        <h2>Optimizing your resume...</h2>
        <p>Our AI is tailoring your resume to match the job posting</p>
      </div>
    );
  }

  if (!optimizedResume) {
    return (
      <div className="editor-empty">
        <button onClick={onBack} className="btn-back">← Back</button>
        <p>Failed to generate optimized resume</p>
      </div>
    );
  }

  return (
    <div className="resume-editor">
      <div className="editor-header">
        <button onClick={onBack} className="btn-back">← Back</button>
        <h1>Optimized Resume</h1>
        <div className="editor-actions">
          <button onClick={() => setEditMode('edit')} className={editMode === 'edit' ? 'active' : ''}>
            Edit
          </button>
          <button onClick={() => setEditMode('view')} className={editMode === 'view' ? 'active' : ''}>
            Preview
          </button>
        </div>
      </div>

      {optimizedResume.changes && (
        <div className="changes-summary">
          <h3>✨ Changes Made:</h3>
          <ul>
            {optimizedResume.changes.map((change, i) => (
              <li key={i}>{change}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="editor-content">
        {editMode === 'view' ? (
          <div className="resume-preview">
            <div className="resume-header">
              <h2>{optimizedResume.name}</h2>
              <p className="resume-title">{optimizedResume.title}</p>
              <p className="contact-info">
                {[optimizedResume.email, optimizedResume.phone, optimizedResume.location].filter(Boolean).join(' | ')}
              </p>
            </div>

            {optimizedResume.summary && (
              <section>
                <h3>Professional Summary</h3>
                <p>{optimizedResume.summary}</p>
              </section>
            )}

            {optimizedResume.experience?.length > 0 && (
              <section>
                <h3>Experience</h3>
                {optimizedResume.experience.map((exp, i) => (
                  <div key={i} className="experience-item">
                    <h4>{exp.title}</h4>
                    <p className="company">{exp.company} | {exp.period}</p>
                    <ul>
                      {exp.bullets?.map((bullet, j) => (
                        <li key={j}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </section>
            )}

            {optimizedResume.skills?.length > 0 && (
              <section>
                <h3>Skills</h3>
                <div className="skills-tags">
                  {optimizedResume.skills.map((skill, i) => (
                    <span key={i} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </section>
            )}

            {optimizedResume.education?.length > 0 && (
              <section>
                <h3>Education</h3>
                {optimizedResume.education.map((edu, i) => (
                  <div key={i} className="education-item">
                    <h4>{edu.degree}</h4>
                    <p>{edu.school} | {edu.year}</p>
                    {edu.details && <p>{edu.details}</p>}
                  </div>
                ))}
              </section>
            )}
          </div>
        ) : (
          <div className="resume-edit">
            <textarea
              value={JSON.stringify(editedData, null, 2)}
              onChange={(e) => {
                try {
                  setEditedData(JSON.parse(e.target.value));
                } catch (err) {
                  // Invalid JSON, keep editing
                }
              }}
              className="edit-textarea"
            />
          </div>
        )}
      </div>

      <div className="editor-footer">
        <button onClick={handleSave} className="btn-save">
          Save Changes
        </button>
        <div className="export-buttons">
          <button onClick={() => handleExport('pdf')} className="btn-export">
            Export PDF
          </button>
          <button onClick={() => handleExport('docx')} className="btn-export">
            Export DOCX
          </button>
        </div>
      </div>
    </div>
  );
}
