import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import ResumeUpload from './components/Resume/ResumeUpload';
import JobInput from './components/Job/JobInput';
import Analysis from './components/Analysis/Analysis';
import ResumeEditor from './components/Resume/ResumeEditor';
import TemplateCustomizer from './components/Template/TemplateCustomizer';
import './App.css';

function AppContent() {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedResume, setSelectedResume] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  const renderView = () => {
    if (!user) {
      return showRegister ? (
        <Register onSwitchToLogin={() => setShowRegister(false)} />
      ) : (
        <Login onSwitchToRegister={() => setShowRegister(true)} />
      );
    }

    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            onNavigate={setCurrentView}
            onSelectResume={setSelectedResume}
            onSelectJob={setSelectedJob}
          />
        );
      case 'upload':
        return (
          <ResumeUpload
            onBack={() => setCurrentView('dashboard')}
            onComplete={(resume) => {
              setSelectedResume(resume);
              setCurrentView('dashboard');
            }}
          />
        );
      case 'job-input':
        return (
          <JobInput
            onBack={() => setCurrentView('dashboard')}
            onComplete={(job) => {
              setSelectedJob(job);
              setCurrentView('dashboard');
            }}
          />
        );
      case 'analysis':
        return (
          <Analysis
            resume={selectedResume}
            job={selectedJob}
            onBack={() => setCurrentView('dashboard')}
            onAnalysisComplete={setAnalysisData}
            onOptimize={() => setCurrentView('editor')}
          />
        );
      case 'editor':
        return (
          <ResumeEditor
            resume={selectedResume}
            job={selectedJob}
            analysis={analysisData}
            onBack={() => setCurrentView('analysis')}
            onSave={(updated) => {
              setSelectedResume(updated);
              setCurrentView('dashboard');
            }}
          />
        );
      case 'customize':
        return (
          <TemplateCustomizer
            resume={selectedResume}
            onBack={() => setCurrentView('dashboard')}
            onSave={(updated) => {
              setSelectedResume(updated);
              setCurrentView('dashboard');
            }}
          />
        );
      default:
        return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="app">
      {user && (
        <nav className="top-nav">
          <div className="nav-content">
            <h1 className="nav-logo">ResumePro AI</h1>
            <div className="nav-actions">
              <span className="user-email">{user.email}</span>
              {user.subscription_tier === 'premium' && (
                <span className="premium-badge">Premium</span>
              )}
              <button onClick={logout} className="btn-logout">
                Logout
              </button>
            </div>
          </div>
        </nav>
      )}
      <main className="main-content">
        {renderView()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
