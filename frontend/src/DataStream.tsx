import React, { useState, useEffect } from 'react';

const DataStream: React.FC = () => {
  const [streamData, setStreamData] = useState<number[]>([]);
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const newValue = Math.random() * 100;
      setCurrentValue(newValue);
      setStreamData(prev => {
        const updated = [...prev, newValue];
        return updated.slice(-20); // Keep last 20 values
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="data-stream-container">
      <h3 className="stream-title">📡 LIVE X-RAY FLUX STREAM</h3>
      <div className="stream-value">
        <span className="value">{currentValue.toFixed(1)}</span>
        <span className="unit">W/m²</span>
      </div>
      <div className="stream-graph">
        {streamData.map((value, index) => (
          <div
            key={index}
            className="stream-bar"
            style={{
              height: `${value}%`,
              backgroundColor: value > 70 ? '#ff4444' : value > 40 ? '#ffaa00' : '#44ff44'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default DataStream;