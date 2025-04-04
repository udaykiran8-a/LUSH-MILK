
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
      // Enhanced color scheme with more vibrant colors and better contrast
      const colorOptions = [
        `hsla(${Math.random() * 20 + 25}, 95%, 65%, 0.9)`, // Brighter orange/red tones
        `hsla(${Math.random() * 40 + 140}, 85%, 55%, 0.9)`, // Vibrant green tones
        `hsla(${Math.random() * 20 + 35}, 100%, 75%, 0.9)`, // Brighter golden tones
        `hsla(${Math.random() * 15 + 355}, 95%, 70%, 0.9)`, // Rich pink tones
        `hsla(${Math.random() * 30 + 195}, 90%, 65%, 0.9)`, // Deep blue tones
        `hsla(${Math.random() * 40 + 260}, 90%, 70%, 0.9)`, // Purple tones
      ];
      
      // Create more ripples for a dramatic effect
      const rippleCount = Math.floor(Math.random() * 4) + 5; // 5-8 ripples per click for more drama
      
      for (let i = 0; i < rippleCount; i++) {
        const delay = i * 60; // Faster stagger for more responsive feel
        const size = Math.random() * 40 + 80; // Varied sizes for more natural feel
        
        const newRipple = {
          x: e.clientX + (Math.random() * 30 - 15), // Wider spread
          y: e.clientY + (Math.random() * 30 - 15), // Wider spread
          size: size,
          color: colorOptions[Math.floor(Math.random() * colorOptions.length)],
          id: counter + i,
        };
        
        setTimeout(() => {
          setRipples((prev) => [...prev, newRipple]);
        }, delay);
      }
      
      setCounter((prev) => prev + rippleCount);
      
      // Remove ripples after animation completes
      setTimeout(() => {
        setRipples((prev) => prev.filter((_, i) => i >= rippleCount));
      }, 1000);
    };

    document.addEventListener('click', handleClick);
    
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [counter]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="absolute rounded-full animate-ripple"
          style={{
            left: ripple.x - ripple.size / 2,
            top: ripple.y - ripple.size / 2,
            width: ripple.size,
            height: ripple.size,
            backgroundColor: ripple.color,
            transform: 'scale(0)',
            opacity: 0.9,
            animation: 'ripple 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards',
            boxShadow: `0 0 ${ripple.size/4}px ${ripple.color}`, // Enhanced glow
            zIndex: 9999,
          }}
        />
      ))}
    </div>
  );
};

export default ClickAnimation;
