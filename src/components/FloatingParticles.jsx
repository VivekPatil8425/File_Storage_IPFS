import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const FloatingParticles = ({ count = 50 }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const generateParticles = () => {
      const newParticles = [];
      for (let i = 0; i < count; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 4 + 2,
          duration: Math.random() * 20 + 10,
          delay: Math.random() * 5,
          color: ['#a855f7', '#3b82f6', '#06b6d4'][Math.floor(Math.random() * 3)]
        });
      }
      setParticles(newParticles);
    };

    generateParticles();
    
    const handleResize = () => {
      generateParticles();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full opacity-60"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          }}
          initial={{
            x: particle.x,
            y: particle.y,
          }}
          animate={{
            x: [
              particle.x,
              particle.x + (Math.random() - 0.5) * 200,
              particle.x + (Math.random() - 0.5) * 200,
              particle.x
            ],
            y: [
              particle.y,
              particle.y + (Math.random() - 0.5) * 200,
              particle.y + (Math.random() - 0.5) * 200,
              particle.y
            ],
            scale: [1, 1.2, 0.8, 1],
            opacity: [0.3, 0.8, 0.3, 0.3],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Network connection lines */}
      <svg className="absolute inset-0 w-full h-full">
        {particles.slice(0, 10).map((particle, index) => (
          <motion.line
            key={`line-${particle.id}`}
            x1={particle.x}
            y1={particle.y}
            x2={particles[(index + 1) % 10]?.x || 0}
            y2={particles[(index + 1) % 10]?.y || 0}
            stroke="rgba(168, 85, 247, 0.2)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: [0, 1, 0],
              opacity: [0, 0.5, 0]
            }}
            transition={{
              duration: 8,
              delay: index * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>
    </div>
  );
};

export default FloatingParticles;
