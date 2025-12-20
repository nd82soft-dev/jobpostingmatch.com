import { useState } from 'react';
import api from '../../utils/api';
import './Job.css';

export default function JobInput({ onBack, onComplete }) {
  const [jobInput, setJobInput] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobCompany, setJobCompany] = useState('');
  const [isUrl, setIsUrl] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const value = e.target.value;
    setJobInput(value);
    setIsUrl(value.startsWith('http'));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;

      if (isUrl) {
        // Fetch from LinkedIn URL
        response = await api.post('/jobs/fetch', { url: jobInput });
      } else {
        // Create from manual input
        response = await api.post('/jobs', {
          title: jobTitle,
          company: jobCompany,
          description: jobInput
        });
      }

      onComplete(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process job posting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="job-input">
      <button onClick={onBack} className="btn-back">← Back to Dashboard</button>

      <div className="job-card">
        <h1>Add Job Posting</h1>
        <p className="subtitle">
          {isUrl ? 'Paste LinkedIn job URL' : 'Paste job description or fill in details'}
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="job-form">
          <div className="form-group">
            <label>Job URL or Description</label>
            <textarea
              value={jobInput}
              onChange={handleInputChange}
              placeholder="https://www.linkedin.com/jobs/view/... or paste full job description"
              rows={isUrl ? 2 : 10}
              required
            />
            {isUrl && (
              <p className="hint">
                ✅ LinkedIn URL detected - we'll fetch the job details automatically
              </p>
            )}
          </div>

          {!isUrl && (
            <>
              <div className="form-group">
                <label>Job Title (optional)</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>

              <div className="form-group">
                <label>Company (optional)</label>
                <input
                  type="text"
                  value={jobCompany}
                  onChange={(e) => setJobCompany(e.target.value)}
                  placeholder="e.g., Tech Company Inc."
                />
              </div>
            </>
          )}

          <button type="submit" className="btn-submit" disabled={!jobInput.trim() || loading}>
            {loading ? 'Processing...' : 'Add Job Posting'}
          </button>
        </form>
      </div>
    </div>
  );
}
