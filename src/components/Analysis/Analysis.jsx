import { useState, useEffect } from 'react';
import api from '../../utils/api';
import './Analysis.css';

export default function Analysis({ resume, job, onBack, onAnalysisComplete, onOptimize }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    if (resume && job) {
      performAnalysis();
    }
  }, [resume, job]);

  const performAnalysis = async () => {
    setAnalyzing(true);
    try {
      const response = await api.post('/analysis', {
        resume_id: resume.id,
        job_id: job.id
      });
      setAnalysis(response.data);
      onAnalysisComplete(response.data);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  if (analyzing) {
    return (
      <div className="analysis-loading">
        <div className="spinner"></div>
        <h2>Analyzing Your Resume...</h2>
        <p>Our AI is comparing your resume against the job requirements</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="analysis-empty">
        <button onClick={onBack} className="btn-back">← Back</button>
        <p>No analysis data available</p>
      </div>
    );
  }

  return (
    <div className="analysis-container">
      <button onClick={onBack} className="btn-back">← Back to Dashboard</button>

      <h1>Resume Match Analysis</h1>

      {/* Overall Score */}
      <div className="score-card">
        <h2>Overall Match Score</h2>
        <div className="score-circle">
          <svg viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="80" fill="none" stroke="#e5e7eb" strokeWidth="20" />
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke={getScoreColor(analysis.overallScore)}
              strokeWidth="20"
              strokeDasharray={`${analysis.overallScore * 5.03} 502.4`}
              strokeLinecap="round"
              transform="rotate(-90 100 100)"
            />
          </svg>
          <div className="score-value">{analysis.overallScore}</div>
        </div>
        <p className="summary">{analysis.summary}</p>
      </div>

      {/* Detailed Scores */}
      <div className="scores-grid">
        <div className="score-item">
          <h3>Skills Match</h3>
          <div className="score-big" style={{ color: getScoreColor(analysis.skillsScore) }}>
            {analysis.skillsScore}
          </div>
        </div>
        <div className="score-item">
          <h3>Experience Fit</h3>
          <div className="score-big" style={{ color: getScoreColor(analysis.experienceScore) }}>
            {analysis.experienceScore}
          </div>
        </div>
        <div className="score-item">
          <h3>Keywords</h3>
          <div className="score-big" style={{ color: getScoreColor(analysis.keywordScore) }}>
            {analysis.keywordScore}
          </div>
        </div>
      </div>

      {/* Strengths & Gaps */}
      <div className="insights-grid">
        <div className="insights-card">
          <h3>✅ Strengths</h3>
          <ul>
            {analysis.strengths?.map((strength, i) => (
              <li key={i}>{strength}</li>
            ))}
          </ul>
        </div>
        <div className="insights-card gaps">
          <h3>❌ Gaps</h3>
          <ul>
            {analysis.gaps?.map((gap, i) => (
              <li key={i}>{gap}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommendations */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <div className="recommendations">
          <h2>Actionable Recommendations</h2>
          {analysis.recommendations.map((rec, i) => (
            <div key={i} className="recommendation-card">
              <h3>{rec.section}</h3>
              <div className="rec-section">
                <strong className="issue">Issue:</strong>
                <p>{rec.issue}</p>
              </div>
              <div className="rec-section">
                <strong className="why">Why it matters:</strong>
                <p>{rec.why}</p>
              </div>
              <div className="rec-section">
                <strong className="suggestion">Suggestion:</strong>
                <p>{rec.suggestion}</p>
              </div>
              {rec.example && (
                <div className="rec-example">
                  <strong>Example:</strong>
                  <pre>{rec.example}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Missing Skills */}
      {analysis.missingSkills && analysis.missingSkills.length > 0 && (
        <div className="missing-skills">
          <h3>Missing Skills</h3>
          <div className="skill-tags">
            {analysis.missingSkills.map((skill, i) => (
              <span key={i} className="skill-tag missing">{skill}</span>
            ))}
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="action-footer">
        <button onClick={onOptimize} className="btn-optimize">
          Generate Optimized Resume
        </button>
      </div>
    </div>
  );
}
