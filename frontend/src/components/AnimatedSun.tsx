import React, { useEffect, useRef } from 'react';

const AnimatedSun: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 400;

    const sunSpots = [
      { x: 120, y: 150, size: 15, activity: 0.8 },
      { x: 250, y: 200, size: 25, activity: 0.9 },
      { x: 180, y: 280, size: 20, activity: 0.7 },
      { x: 300, y: 120, size: 18, activity: 0.6 }
    ];

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw sun
      const gradient = ctx.createRadialGradient(200, 200, 0, 200, 200, 180);
      gradient.addColorStop(0, '#FFD700');
      gradient.addColorStop(0.7, '#FF8C00');
      gradient.addColorStop(1, '#FF4500');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(200, 200, 180, 0, Math.PI * 2);
      ctx.fill();

      // Animate sunspots
      const time = Date.now() * 0.001;
      
      sunSpots.forEach((spot, index) => {
        const pulse = Math.sin(time * 2 + index) * 0.2 + 0.8;
        const activePulse = Math.sin(time * 3 + index) * 0.3 + 0.7;
        
        // Sunspot core
        ctx.fillStyle = spot.activity > 0.8 ? '#8B0000' : '#4B0082';
        ctx.beginPath();
        ctx.arc(spot.x, spot.y, spot.size * pulse, 0, Math.PI * 2);
        ctx.fill();
        
        // Active region glow for high activity
        if (spot.activity > 0.7) {
          ctx.fillStyle = `rgba(255, 69, 0, ${0.3 * activePulse})`;
          ctx.beginPath();
          ctx.arc(spot.x, spot.y, spot.size * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Solar flares animation
      if (Math.sin(time * 0.5) > 0.8) {
        ctx.strokeStyle = `rgba(255, 215, 0, ${Math.sin(time * 5) * 0.5 + 0.5})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(350, 150);
        ctx.lineTo(450, 100);
        ctx.stroke();
      }

      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  return (
    <div className="sun-container">
      <canvas 
        ref={canvasRef} 
        className="animated-sun"
        style={{ 
          borderRadius: '50%',
          boxShadow: '0 0 50px rgba(255, 165, 0, 0.5)'
        }}
      />
      <div className="sun-stats">
        <div className="stat-item">
          <span className="stat-label">Active Regions:</span>
          <span className="stat-value">4</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Magnetic Complexity:</span>
          <span className="stat-value">High</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Flare Probability:</span>
          <span className="stat-value highlight">68%</span>
        </div>
      </div>
    </div>
  );
};

export default AnimatedSun;