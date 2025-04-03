
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
      // Create a new ripple
      const newRipple = {
        x: e.clientX,
        y: e.clientY,
        size: Math.random() * 100 + 50, // Random size between 50 and 150
        color: `hsla(${Math.random() * 40 + 15}, 70%, 60%, 0.6)`, // Random color in our theme palette
        id: counter,
      };
      
      setRipples((prev) => [...prev, newRipple]);
      setCounter((prev) => prev + 1);
      
      // Remove the ripple after animation
      setTimeout(() => {
        setRipples((prev) => prev.filter((ripple) => ripple.id !== newRipple.id));
      }, 1000);
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
            opacity: 0.8,
            animation: 'ripple 1s linear forwards',
          }}
        />
      ))}
    </div>
  );
};

export default ClickAnimation;
