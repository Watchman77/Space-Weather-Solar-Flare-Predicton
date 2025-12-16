import React, { useState } from 'react';
import SolarMonitor from './components/SolarMonitor';
import PredictionDashboard from './components/PredictionDashboard';
import ResearchMetrics from './components/ResearchMetrics';
import './App.css';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'monitor' | 'predictions' | 'research'>('monitor');

  return (
    <div className="app-container">
      {/* 🔥 FIRE HEADER - THE ORIGINAL BADASS VERSION 🔥 */}
      <header className="app-header">
        <div className="header-content">
          <div className="title-section">
            <h1 className="main-title">
              ⚡ SOLAR FLARE PREDICTION ENGINE
            </h1>
            <p className="subtitle">
              Real-time ML Forecasting • Live Space Weather Monitoring • Advanced Analytics
            </p>
          </div>
          
          {/* FIRE NAVIGATION */}
          <nav className="navigation">
            <button
              onClick={() => setActiveTab('monitor')}
              className={`nav-btn ${activeTab === 'monitor' ? 'nav-btn-active' : ''}`}
            >
              📡 Live Monitor
            </button>
            <button
              onClick={() => setActiveTab('predictions')}
              className={`nav-btn ${activeTab === 'predictions' ? 'nav-btn-active' : ''}`}
            >
              🔮 Predictions
            </button>
            <button
              onClick={() => setActiveTab('research')}
              className={`nav-btn ${activeTab === 'research' ? 'nav-btn-active' : ''}`}
            >
              📊 Research
            </button>
          </nav>
        </div>
      </header>
      {/* Main Content */}
      <main className="main-content">
        {activeTab === 'monitor' && <SolarMonitor />}
        {activeTab === 'predictions' && <PredictionDashboard />}
        {activeTab === 'research' && <ResearchMetrics />}
      </main>

      {/* FIRE FOOTER */}
      <footer className="app-footer">
        <div className="footer-content">
          <p>🚀 Solar Flare Prediction System • Advanced ML Forecasting • Space Weather Research</p>
          <p className="footer-sub">Real-time Monitoring • Live Data Streams • {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default App;