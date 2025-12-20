import { useState } from 'react';
import api from '../../utils/api';
import './Resume.css';

export default function ResumeUpload({ onBack, onComplete }) {
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      if (!name) {
        setName(e.dataTransfer.files[0].name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      if (!name) {
        setName(e.target.files[0].name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('name', name || file.name);

    try {
      const response = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onComplete(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="resume-upload">
      <button onClick={onBack} className="btn-back">← Back to Dashboard</button>

      <div className="upload-card">
        <h1>Upload Your Resume</h1>
        <p className="subtitle">Supported formats: PDF, DOC, DOCX, TXT</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div
            className={`drop-zone ${dragActive ? 'active' : ''} ${file ? 'has-file' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="file-info">
                <span className="file-icon">📄</span>
                <strong>{file.name}</strong>
                <p>{(file.size / 1024).toFixed(2)} KB</p>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="btn-remove"
                >
                  Remove
                </button>
              </div>
            ) : (
              <>
                <span className="upload-icon">📤</span>
                <p className="drop-text">Drag and drop your resume here</p>
                <p className="or-text">or</p>
                <label className="btn-browse">
                  Browse Files
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileChange}
                    hidden
                  />
                </label>
              </>
            )}
          </div>

          <div className="form-group">
            <label>Resume Name (optional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Software Engineer Resume"
            />
          </div>

          <button type="submit" className="btn-submit" disabled={!file || uploading}>
            {uploading ? 'Uploading...' : 'Upload Resume'}
          </button>
        </form>
      </div>
    </div>
  );
}
