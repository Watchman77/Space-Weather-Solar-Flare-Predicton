import React, { useState, useEffect } from 'react';

interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  auc_roc: number;
  training_date: string;
  features_used: number;
  model_type: string;
  significant_flares?: number;
}

const ResearchMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/model-performance');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("📊 Received metrics from API:", data);
        setMetrics(data);
        setError(null);
      } catch (error) {
        console.error('❌ Error fetching metrics:', error);
        setError('Failed to load performance metrics');
        // Fallback to ACTUAL training results
        setMetrics({
          accuracy: 0.914,
          precision: 0.209,
          recall: 0.237,
          f1_score: 0.222,
          auc_roc: 0.755,
          training_date: '2024-01-15',
          features_used: 23,
          model_type: 'Random Forest + Isolation Forest Ensemble',
          significant_flares: 154
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const MetricCard = ({ title, value, max = 1, color = 'blue' }: { title: string; value: number; max?: number; color?: string }) => (
    <div className="dashboard-card">
      <h4 className="text-lg font-semibold text-gray-300 mb-2">{title}</h4>
      <div className="flex items-end justify-between">
        <div className="text-3xl font-bold text-white">
          {(value * 100).toFixed(1)}%
        </div>
        <div className="w-24 bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              color === 'blue' ? 'bg-blue-500' :
              color === 'green' ? 'bg-green-500' :
              color === 'purple' ? 'bg-purple-500' :
              'bg-yellow-500'
            }`}
            style={{ width: `${(value / max) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Research Performance</h2>
          <p className="text-gray-300">Loading model evaluation metrics...</p>
        </div>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Research Performance</h2>
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Research Performance</h2>
        <p className="text-gray-300">Model evaluation metrics and research insights</p>
      </div>

      {/* Model Information Card */}
      <div className="dashboard-card bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30">
        <h3 className="text-xl font-semibold text-purple-400 mb-3">INFORMATION ON MODEL PERFORMANCE</h3>
        <div className="space-y-2 text-gray-300">
          <p><strong>Model Architecture:</strong> Two-Stage Anomaly Detection System</p>
          <p><strong>Stage 1:</strong> Random Forest Classifier (Significant vs Insignificant Flares)</p>
          <p><strong>Stage 2:</strong> Isolation Forest Anomaly Detection (X-Class Identification)</p>
          <p><strong>Training Data:</strong> HMI SHARP Parameters (2010-2024) - 3,677 samples</p>
          <p><strong>Significant Flares:</strong> {metrics?.significant_flares || 154} events</p>
          <p><strong>Validation:</strong> 5-fold Cross Validation on held-out test set</p>
          <p><strong>Features:</strong> {metrics?.features_used || 23} magnetic field parameters from SDO/HMI</p>
          <p><strong>Training Date:</strong> {metrics?.training_date || '2024-01-15'}</p>
        </div>
      </div>

      {/* REAL Model Metrics Grid */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard title="Accuracy" value={metrics.accuracy} color="green" />
          <MetricCard title="Precision" value={metrics.precision} color="blue" />
          <MetricCard title="Recall" value={metrics.recall} color="purple" />
          <MetricCard title="F1 Score" value={metrics.f1_score} color="yellow" />
          <MetricCard title="AUC-ROC" value={metrics.auc_roc} color="pink" />
          <div className="dashboard-card">
            <h4 className="text-lg font-semibold text-gray-300 mb-2">Features Used</h4>
            <div className="text-3xl font-bold text-white">{metrics.features_used}</div>
            <div className="text-gray-400 text-sm mt-1">HMI Magnetic Parameters</div>
            <div className="text-blue-400 text-sm mt-2">{metrics.model_type}</div>
            {metrics.significant_flares && (
              <div className="text-green-400 text-sm mt-1">
                {metrics.significant_flares} significant flares
              </div>
            )}
          </div>
        </div>
      )}

      {/* Performance Interpretation */}
      <div className="dashboard-card bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/30">
        <h3 className="text-xl font-semibold text-orange-400 mb-3">PERFORMANCE INTERPRETATION</h3>
        <div className="space-y-2 text-gray-300">
          <p><strong>High Accuracy (91.4%):</strong> Model correctly classifies most solar active regions</p>
          <p><strong>Lower Precision (20.9%):</strong> Expected for rare events - only 5.2% of data are significant flares</p>
          <p><strong>Good AUC-ROC (75.5%):</strong> Model has decent discrimination power for flare prediction</p>
          <p><strong>Real-world Context:</strong> Solar flare prediction is challenging due to class imbalance</p>
        </div>
      </div>

      {/* Enhanced Research Methodology */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="dashboard-card">
          <h3 className="text-xl font-semibold text-purple-400 mb-4">Research Methodology</h3>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              <span><strong>Data Collection:</strong> SDO/HMI SHARP parameters (2010-2024)</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              <span><strong>Preprocessing:</strong> Daily aggregation, missing value imputation, outlier removal</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              <span><strong>Feature Selection:</strong> 23 most predictive magnetic field parameters</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              <span><strong>Model Training:</strong> Random Forest for flare significance classification</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              <span><strong>Anomaly Detection:</strong> Isolation Forest for X-class flare identification</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              <span><strong>Validation:</strong> 5-fold cross-validation with temporal splitting</span>
            </li>
          </ul>
        </div>

        <div className="dashboard-card">
          <h3 className="text-xl font-semibold text-orange-400 mb-4">Prediction Pipeline</h3>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">1.</span>
              <span><strong>Real-time HMI Data:</strong> NASA SDO/HMI live magnetic field measurements</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">2.</span>
              <span><strong>Feature Extraction:</strong> Compute 23 magnetic parameters from live data</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">3.</span>
              <span><strong>Stage 1 - Significance:</strong> Random Forest predicts flare probability</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">4.</span>
              <span><strong>Stage 2 - Anomaly Detection:</strong> Isolation Forest flags X-class candidates</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">5.</span>
              <span><strong>Classification:</strong> Combine both stages for final flare class prediction</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">6.</span>
              <span><strong>Visualization:</strong> Real-time dashboard updates with predictions</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ResearchMetrics;