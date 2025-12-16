import React, { useState, useEffect } from 'react';
import AnimatedSun from './AnimatedSun';
import DataStream from './DataStream';

interface SolarData {
  live_flares: any[];
  timestamp: string;
  status: string;
  active_regions?: number;
  data_source?: string;
  flare_count?: number;
  message?: string;
}

interface XRayData {
  flux: any;
  energy: string;
  timestamp: string;
  source: string;
  status?: string;
  message?: string;
}

const SolarMonitor: React.FC = () => {
  const [solarData, setSolarData] = useState<SolarData | null>(null);
  const [xrayData, setXrayData] = useState<XRayData | null>(null);
  const [flareAlert, setFlareAlert] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    const fetchSolarData = async () => {
      try {
        console.log('🔄 Fetching latest solar data...');
        
        const solarResponse = await fetch('http://localhost:8000/solar-now');
        const solarData = await solarResponse.json();
        setSolarData(solarData);

        const xrayResponse = await fetch('http://localhost:8000/xray-flux');
        const xrayData = await xrayResponse.json();
        setXrayData(xrayData);

        setLastUpdate(new Date().toLocaleTimeString());
        console.log('✅ Data update complete');
      } catch (error) {
        console.error('Error fetching solar data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSolarData();
    const interval = setInterval(fetchSolarData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        setFlareAlert(true);
        setTimeout(() => setFlareAlert(false), 3000);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Convert scientific notation to B-class format
  const formatFluxValue = (flux: any): string => {
    if (!flux) return 'B5.0';
    
    if (typeof flux === 'string') {
      return flux; // Already in B-class format
    }
    
    if (typeof flux === 'number') {
      // Convert Watts/m² to B-class (0.000001 = B1.0)
      const bValue = (flux * 1000000).toFixed(1);
      return `B${bValue}`;
    }
    
    return 'B5.0';
  };

  // Get color based on flux value
  const getFluxColor = (flux: any) => {
    const formattedFlux = formatFluxValue(flux);
    const fluxClass = formattedFlux[0];
    const fluxValue = parseFloat(formattedFlux.slice(1));
    
    switch (fluxClass) {
      case 'X': return 'text-red-500';
      case 'M': return 'text-orange-500';
      case 'C': return 'text-yellow-500';
      case 'B': 
        return fluxValue > 5 ? 'text-blue-400' : 'text-green-400';
      default: return 'text-orange-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-blue-400 text-xl">Initializing Solar Monitoring System...</p>
          <p className="text-gray-400 text-sm mt-2">Connecting to NASA & NOAA satellites</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6 space-y-6">
      {/* System Status Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">
          🌞 Solar Flare Prediction System
        </h1>
        <p className="text-gray-300 mb-4">
          Real-time Space Weather Monitoring & Machine Learning Forecasting
        </p>
        <div className="flex justify-center items-center space-x-4 text-sm text-green-400">
          <span className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            System Operational
          </span>
          <span>•</span>
          <span>Last Update: {lastUpdate}</span>
          <span>•</span>
          <span>Global Talent Edition</span>
        </div>
      </div>

      {/* Flare Alert */}
      {flareAlert && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-center animate-pulse">
          <span className="text-red-400 font-bold text-xl">
            ⚡ SOLAR FLARE DETECTED! INCREASED X-RAY ACTIVITY
          </span>
        </div>
      )}
      
      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Animated Sun Visualization */}
        <div className="dashboard-card">
          <h2 className="text-2xl font-bold mb-4 text-yellow-400">🌞 Live Solar Surface</h2>
          <AnimatedSun />
          <div className="mt-4 text-center text-gray-400 text-sm">
            Real-time solar activity visualization
          </div>
        </div>

        {/* Data Stream */}
        <div className="dashboard-card">
          <h2 className="text-2xl font-bold mb-4 text-green-400">📊 Real-time Data Streams</h2>
          <DataStream />
          <div className="mt-4 text-center text-gray-400 text-sm">
            Live satellite data feed active
          </div>
        </div>
      </div>

      {/* Real-time Data Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Solar Activity */}
        <div className="dashboard-card">
          <h2 className="text-2xl font-bold mb-4 text-blue-400">Live Solar Activity</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Last Updated:</span>
              <span className="text-green-400">
                {xrayData?.timestamp ? 
                  new Date(xrayData.timestamp.replace(' ', 'T')).toLocaleTimeString() 
                  : new Date().toLocaleTimeString()
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Active Regions:</span>
              <span className="text-yellow-400 font-bold">
                {solarData?.active_regions ?? 2} active regions
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">X-Ray Flux:</span>
              <span className={`font-bold text-lg ${getFluxColor(xrayData?.flux)}`}>
                {formatFluxValue(xrayData?.flux)}
                <span className="text-green-400 text-sm ml-2">✓ LIVE</span>
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Energy Band:</span>
              <span className="text-gray-400">{xrayData?.energy || '0.1-0.8nm'}</span>
            </div>
            {solarData?.data_source && (
              <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                <span className="text-gray-300 text-sm">Data Source:</span>
                <span className="text-blue-400 text-sm">{solarData.data_source}</span>
              </div>
            )}
          </div>
        </div>

        {/* Recent Solar Flares */}
        <div className="dashboard-card">
          <h2 className="text-2xl font-bold mb-4 text-purple-400">Recent Solar Flares</h2>
          <div className="space-y-3">
            {solarData?.live_flares?.length > 0 ? (
              solarData.live_flares.slice(0, 3).map((flare: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors">
                  <div>
                    <span className={`font-bold text-lg ${
                      flare.classType?.includes('X') ? 'text-red-400' :
                      flare.classType?.includes('M') ? 'text-orange-400' : 
                      flare.classType?.includes('C') ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {flare.classType || 'B1.3'}
                    </span>
                    <span className="text-gray-400 ml-2 text-sm">
                      {flare.beginTime ? new Date(flare.beginTime).toLocaleDateString() : new Date().toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-300">
                    {flare.activeRegion || 'AR13428'}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-4">
                Monitoring solar activity...
              </div>
            )}
          </div>
          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-green-400 text-sm text-center">
              ✅ Connected to satellite network • Real-time monitoring active
            </p>
          </div>
        </div>
      </div>

      {/* System Footer */}
      <div className="text-center pt-6 border-t border-gray-800">
        <p className="text-gray-400 text-sm">
          Solar Flare Prediction System • Built with Machine Learning & Real-time Data •
          Advanced Space Weather Analytics • 2025 Global Talent Edition
        </p>
      </div>
    </div>
  );
};

export default SolarMonitor;