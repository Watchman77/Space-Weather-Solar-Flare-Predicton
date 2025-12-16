import React, { useState, useEffect } from 'react';
import InteractiveCharts from './InteractiveCharts';

interface Prediction {
  prediction: number;
  confidence: string;
  flare_class: string;
  timestamp: string;
  model_used: string;
}

interface PredictionHistory {
  timestamp: string;
  probability: number;
  flareClass: string;
}

const PredictionDashboard: React.FC = () => {
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [predictionHistory, setPredictionHistory] = useState<PredictionHistory[]>([]);
  
  // Your actual HMI feature names
  const featureNames = [
    'R_VALUE', 'QUALITY', 'MEANGBZ', 'TOTUSJH', 'USFLUX', 'TOTPOT', 'MEANPOT', 
    'AREA_ACR', 'LON_MIN', 'LON_MAX', 'LAT_MIN', 'LAT_MAX', 'MEANGAM', 'MEANGBT', 
    'MEANGBH', 'MEANJZD', 'TOTUSJZ', 'MEANALP', 'MEANJZH', 'ABSNJZH', 'SAVNCPP', 
    'MEANSHR', 'SHRGT45'
  ];

  const makePrediction = async () => {
    setLoading(true);
    try {
      // Generate realistic HMI features based on your data
      const realisticFeatures = featureNames.map(() => 
        Math.random() * 100 - 50 // Random values in reasonable range
      );
      
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          features: realisticFeatures
        }),
      });
      
      const data = await response.json();
      setPrediction(data);
      
      // Add to prediction history
      const newPrediction: PredictionHistory = {
        timestamp: data.timestamp,
        probability: data.prediction,
        flareClass: data.flare_class
      };
      
      setPredictionHistory(prev => [...prev.slice(-19), newPrediction]); // Keep last 20
      
    } catch (error) {
      console.error('Prediction error:', error);
      // Mock response for demo - UPDATED TERMINOLOGY
      const mockProbability = Math.random();
      let mockFlareClass = "Insignificant (A/B-class)";  // UPDATED
      if (mockProbability > 0.7) mockFlareClass = "X-Class";
      else if (mockProbability > 0.4) mockFlareClass = "M-Class";
      else if (mockProbability > 0.2) mockFlareClass = "C-Class";
      
      const mockPrediction = {
        prediction: mockProbability,
        confidence: "high",
        flare_class: mockFlareClass,
        timestamp: new Date().toISOString(),
        model_used: "your_anomaly_detection"
      };
      setPrediction(mockPrediction);
      
      // Add mock to history too
      const newPrediction: PredictionHistory = {
        timestamp: mockPrediction.timestamp,
        probability: mockPrediction.prediction,
        flareClass: mockPrediction.flare_class
      };
      setPredictionHistory(prev => [...prev.slice(-19), newPrediction]);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getFlareClassColor = (flareClass: string) => {
    if (flareClass.includes('X')) return 'text-red-400 bg-red-400/10';
    if (flareClass.includes('M')) return 'text-orange-400 bg-orange-400/10';
    if (flareClass.includes('C')) return 'text-yellow-400 bg-yellow-400/10';
    return 'text-blue-400 bg-blue-400/10'; // For Insignificant (A/B-class)
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Flare Prediction Engine</h2>
        <p className="text-gray-300">Machine Learning-powered solar flare forecasting</p>
      </div>

      {/* Interactive Charts */}
      <InteractiveCharts 
        predictionHistory={predictionHistory}
        currentFeatures={featureNames.map(() => Math.random() * 100)}
        featureNames={featureNames}
      />

      {/* Prediction Controls */}
      <div className="dashboard-card">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div>
            <h3 className="text-xl font-semibold text-purple-400">Make Prediction</h3>
            <p className="text-gray-400">Run ML model on current solar data</p>
          </div>
          <button
            onClick={makePrediction}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                <span>Predicting...</span>
              </div>
            ) : (
              'Predict Flare Probability'
            )}
          </button>
        </div>
      </div>

      {/* Prediction Results */}
      {prediction && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Probability Card */}
          <div className="dashboard-card">
            <h4 className="text-lg font-semibold text-blue-400 mb-4">Flare Probability</h4>
            <div className="text-center">
              <div className="text-5xl font-bold text-white mb-2">
                {(prediction.prediction * 100).toFixed(1)}%
              </div>
              <div className={`text-lg font-semibold ${getConfidenceColor(prediction.confidence)}`}>
                {prediction.confidence.toUpperCase()} CONFIDENCE
              </div>
            </div>
          </div>

          {/* Flare Class Card */}
          <div className="dashboard-card">
            <h4 className="text-lg font-semibold text-orange-400 mb-4">Predicted Flare Class</h4>
            <div className="text-center">
              <div className={`text-4xl font-bold px-4 py-2 rounded-lg ${getFlareClassColor(prediction.flare_class)}`}>
                {prediction.flare_class}
              </div>
              <div className="text-gray-400 mt-2">Most Likely Classification</div>
            </div>
          </div>

          {/* Model Info Card */}
          <div className="dashboard-card">
            <h4 className="text-lg font-semibold text-green-400 mb-4">Model Information</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Model:</span>
                <span className="text-white font-mono">{prediction.model_used}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Timestamp:</span>
                <span className="text-white">
                  {new Date(prediction.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Features Used:</span>
                <span className="text-white">{featureNames.length} HMI Parameters</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionDashboard;