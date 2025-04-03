
import React, { useState, useEffect } from 'react';

interface RippleProps {
  x: number;
  y: number;
  size: number;
  color: string;
  id: number;
}

const ClickAnimation = () => {
  const [ripples, setRipples] = useState<RippleProps[]>([]);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Create a new ripple with enhanced color scheme
      const colorOptions = [
        `hsla(${Math.random() * 20 + 25}, 90%, 60%, 0.7)`, // Brighter orange/red tones
        `hsla(${Math.random() * 40 + 140}, 80%, 50%, 0.7)`, // Vibrant green tones
        `hsla(${Math.random() * 20 + 35}, 100%, 70%, 0.7)`, // Brighter golden tones
        `hsla(${Math.random() * 15 + 355}, 90%, 65%, 0.7)`, // Rich pink tones
        `hsla(${Math.random() * 30 + 195}, 85%, 60%, 0.7)`, // Deep blue tones
      ];
      
      const newRipple = {
        x: e.clientX,
        y: e.clientY,
        size: Math.random() * 120 + 120, // Larger size between 120 and 240
        color: colorOptions[Math.floor(Math.random() * colorOptions.length)],
        id: counter,
      };
      
      setRipples((prev) => [...prev, newRipple]);
      setCounter((prev) => prev + 1);
      
      // Remove the ripple after animation
      setTimeout(() => {
        setRipples((prev) => prev.filter((ripple) => ripple.id !== newRipple.id));
      }, 1200);
    };

    document.addEventListener('click', handleClick);
    
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [counter]);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="absolute rounded-full animate-ripple pointer-events-none"
          style={{
            left: ripple.x - ripple.size / 2,
            top: ripple.y - ripple.size / 2,
            width: ripple.size,
            height: ripple.size,
            backgroundColor: ripple.color,
            transform: 'scale(0)',
            opacity: 0.9,
            animation: 'ripple 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards',
            boxShadow: `0 0 20px ${ripple.color}`
          }}
        />
      ))}
    </div>
  );
};

export default ClickAnimation;
