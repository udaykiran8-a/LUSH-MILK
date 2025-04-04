
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
      // Enhanced color scheme with more vibrant colors
      const colorOptions = [
        `hsla(${Math.random() * 20 + 25}, 95%, 65%, 0.8)`, // Brighter orange/red tones
        `hsla(${Math.random() * 40 + 140}, 85%, 55%, 0.8)`, // Vibrant green tones
        `hsla(${Math.random() * 20 + 35}, 100%, 75%, 0.8)`, // Brighter golden tones
        `hsla(${Math.random() * 15 + 355}, 95%, 70%, 0.8)`, // Rich pink tones
        `hsla(${Math.random() * 30 + 195}, 90%, 65%, 0.8)`, // Deep blue tones
        `hsla(${Math.random() * 40 + 260}, 90%, 70%, 0.8)`, // Purple tones
        `hsla(${Math.random() * 30 + 290}, 90%, 75%, 0.8)`, // Magenta tones
      ];
      
      // Create multiple ripples for a more dramatic effect
      const rippleCount = Math.floor(Math.random() * 3) + 4; // 4-6 ripples per click for more drama
      
      for (let i = 0; i < rippleCount; i++) {
        const delay = i * 80; // Stagger the ripples, slightly faster
        
        const newRipple = {
          x: e.clientX + (Math.random() * 30 - 15), // Wider spread
          y: e.clientY + (Math.random() * 30 - 15), // Wider spread
          size: Math.random() * 160 + 120, // Larger size between 120 and 280
          color: colorOptions[Math.floor(Math.random() * colorOptions.length)],
          id: counter + i,
        };
        
        setTimeout(() => {
          setRipples((prev) => [...prev, newRipple]);
        }, delay);
      }
      
      setCounter((prev) => prev + rippleCount);
      
      // Remove the ripples after animation
      setTimeout(() => {
        setRipples((prev) => prev.filter((ripple) => ripple.id < counter));
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
            boxShadow: `0 0 40px ${ripple.color}` // Enhanced glow
          }}
        />
      ))}
    </div>
  );
};

export default ClickAnimation;
