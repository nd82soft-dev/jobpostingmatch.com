import { useState } from 'react';
import api from '../../utils/api';
import './Template.css';

const TEMPLATES = {
  modern: { name: 'Modern', accent: '#8b5cf6', font: 'Helvetica' },
  classic: { name: 'Classic', accent: '#000000', font: 'Georgia' },
  executive: { name: 'Executive', accent: '#d97706', font: 'Garamond' },
  creative: { name: 'Creative', accent: '#10b981', font: 'Poppins' }
};

const ACCENT_COLORS = [
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Orange', value: '#d97706' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Pink', value: '#ec4899' }
];

const FONTS = [
  { name: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Garamond', value: 'Garamond, serif' },
  { name: 'Poppins', value: 'Poppins, sans-serif' }
];

export default function TemplateCustomizer({ resume, onBack, onSave }) {
  const resumeParsed = typeof resume?.parsed_data === 'string'
    ? JSON.parse(resume.parsed_data)
    : resume?.parsed_data || {};

  const currentConfig = typeof resume?.template_config === 'string'
    ? JSON.parse(resume.template_config)
    : resume?.template_config || {};

  const [templateId, setTemplateId] = useState(resume?.template_id || 'modern');
  const [accentColor, setAccentColor] = useState(currentConfig.accentColor || TEMPLATES[templateId]?.accent);
  const [font, setFont] = useState(currentConfig.font || TEMPLATES[templateId]?.font);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/resumes/${resume.id}`, {
        template_id: templateId,
        template_config: JSON.stringify({ accentColor, font })
      });
      onSave({ ...resume, template_id: templateId, template_config: { accentColor, font } });
    } catch (error) {
      alert('Failed to save template settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="template-customizer">
      <button onClick={onBack} className="btn-back">← Back</button>

      <div className="customizer-container">
        <div className="customizer-panel">
          <h1>Customize Template</h1>

          <div className="control-group">
            <h3>Template Style</h3>
            <div className="template-grid">
              {Object.entries(TEMPLATES).map(([id, template]) => (
                <button
                  key={id}
                  className={`template-btn ${templateId === id ? 'active' : ''}`}
                  onClick={() => {
                    setTemplateId(id);
                    setAccentColor(template.accent);
                    setFont(template.font);
                  }}
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>

          <div className="control-group">
            <h3>Accent Color</h3>
            <div className="color-grid">
              {ACCENT_COLORS.map((color) => (
                <button
                  key={color.value}
                  className={`color-btn ${accentColor === color.value ? 'active' : ''}`}
                  style={{ background: color.value }}
                  onClick={() => setAccentColor(color.value)}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="control-group">
            <h3>Font Family</h3>
            <select value={font} onChange={(e) => setFont(e.target.value)} className="font-select">
              {FONTS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <button onClick={handleSave} className="btn-save-template" disabled={saving}>
            {saving ? 'Saving...' : 'Save Template Settings'}
          </button>
        </div>

        <div className="preview-panel">
          <h2>Preview</h2>
          <div className="resume-preview" style={{ fontFamily: font }}>
            <div className="preview-header" style={{ borderColor: accentColor }}>
              <h1 style={{ color: '#1f2937' }}>{resumeParsed.name || 'Your Name'}</h1>
              <p style={{ color: accentColor }}>{resumeParsed.title || 'Professional Title'}</p>
            </div>

            <div className="preview-section">
              <h3 style={{ color: accentColor, borderColor: accentColor }}>PROFESSIONAL SUMMARY</h3>
              <p>{resumeParsed.summary || 'Your professional summary will appear here...'}</p>
            </div>

            <div className="preview-section">
              <h3 style={{ color: accentColor, borderColor: accentColor }}>SKILLS</h3>
              <div className="preview-skills">
                {(resumeParsed.skills || ['JavaScript', 'React', 'Node.js']).map((skill, i) => (
                  <span key={i} className="preview-skill" style={{ borderColor: accentColor, color: accentColor }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
