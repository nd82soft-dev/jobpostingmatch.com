import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

export default function Dashboard({ onNavigate, onSelectResume, onSelectJob }) {
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resumesRes, jobsRes, analysesRes] = await Promise.all([
        api.get('/resumes'),
        api.get('/jobs'),
        api.get('/analysis/history')
      ]);
      setResumes(resumesRes.data.resumes || []);
      setJobs(jobsRes.data.jobs || []);
      setAnalyses(analysesRes.data.analyses || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAnalysis = async () => {
    if (!selectedResumeId || !selectedJobId) {
      alert('Please select both a resume and a job posting');
      return;
    }

    const resume = resumes.find(r => r.id === selectedResumeId);
    const job = jobs.find(j => j.id === selectedJobId);

    onSelectResume(resume);
    onSelectJob(job);
    onNavigate('analysis');
  };

  const deleteResume = async (id) => {
    if (!confirm('Delete this resume?')) return;
    try {
      await api.delete(`/resumes/${id}`);
      setResumes(resumes.filter(r => r.id !== id));
    } catch (error) {
      alert('Failed to delete resume');
    }
  };

  const deleteJob = async (id) => {
    if (!confirm('Delete this job posting?')) return;
    try {
      await api.delete(`/jobs/${id}`);
      setJobs(jobs.filter(j => j.id !== id));
    } catch (error) {
      alert('Failed to delete job');
    }
  };

  if (loading) {
    return <div className="loading">Loading your workspace...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Welcome back, {user.name || 'there'}!</h1>
          <p>Create job-specific resumes that get you interviews</p>
        </div>
        {user.subscription_tier === 'free' && (
          <button className="btn-upgrade">
            Upgrade to Premium
          </button>
        )}
      </header>

      <div className="dashboard-actions">
        <button onClick={() => onNavigate('upload')} className="action-card">
          <span className="action-icon">📄</span>
          <h3>Upload Resume</h3>
          <p>Add a new resume to analyze</p>
        </button>

        <button onClick={() => onNavigate('job-input')} className="action-card">
          <span className="action-icon">💼</span>
          <h3>Add Job Posting</h3>
          <p>Paste a job description</p>
        </button>

        {selectedResumeId && selectedJobId && (
          <button onClick={handleStartAnalysis} className="action-card action-primary">
            <span className="action-icon">🎯</span>
            <h3>Analyze Match</h3>
            <p>Compare resume to job posting</p>
          </button>
        )}
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-section">
          <h2>Your Resumes ({resumes.length})</h2>
          {resumes.length === 0 ? (
            <p className="empty-state">No resumes yet. Upload one to get started!</p>
          ) : (
            <div className="items-list">
              {resumes.map(resume => (
                <div
                  key={resume.id}
                  className={`item-card ${selectedResumeId === resume.id ? 'selected' : ''}`}
                  onClick={() => setSelectedResumeId(resume.id)}
                >
                  <div className="item-info">
                    <h4>{resume.name}</h4>
                    <p className="item-meta">
                      {new Date(resume.created_at * 1000).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="item-actions">
                    <button onClick={(e) => { e.stopPropagation(); deleteResume(resume.id); }}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-section">
          <h2>Job Postings ({jobs.length})</h2>
          {jobs.length === 0 ? (
            <p className="empty-state">No job postings yet. Add one to start matching!</p>
          ) : (
            <div className="items-list">
              {jobs.map(job => (
                <div
                  key={job.id}
                  className={`item-card ${selectedJobId === job.id ? 'selected' : ''}`}
                  onClick={() => setSelectedJobId(job.id)}
                >
                  <div className="item-info">
                    <h4>{job.title}</h4>
                    {job.company && <p className="item-company">{job.company}</p>}
                    <p className="item-meta">
                      {new Date(job.created_at * 1000).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="item-actions">
                    <button onClick={(e) => { e.stopPropagation(); deleteJob(job.id); }}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {analyses.length > 0 && (
        <section className="dashboard-section">
          <h2>Recent Analyses</h2>
          <div className="analyses-list">
            {analyses.slice(0, 5).map(analysis => (
              <div key={analysis.id} className="analysis-item">
                <div>
                  <strong>{analysis.resume_name}</strong> vs {analysis.job_title}
                  {analysis.company && ` at ${analysis.company}`}
                </div>
                <div className="analysis-score">
                  Score: {analysis.overall_score}%
                </div>
                <div className="analysis-date">
                  {new Date(analysis.created_at * 1000).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

