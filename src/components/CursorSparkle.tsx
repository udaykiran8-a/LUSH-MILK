
import React, { useState, useEffect } from 'react';
import { useMotionValue, useSpring, motion } from 'framer-motion';

interface SparkleProps {
  x: number;
  y: number;
  color: string;
  id: number;
}

const CursorSparkle = () => {
  const [sparkles, setSparkles] = useState<SparkleProps[]>([]);
  const [counter, setCounter] = useState(0);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const springConfig = { damping: 25, stiffness: 300 };
  const springX = useSpring(cursorX, springConfig);
  const springY = useSpring(cursorY, springConfig);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      
      // Create new sparkles occasionally
      if (Math.random() > 0.7) {
        const colors = [
          "#FF5733", // Orange
          "#FFC300", // Gold
          "#36D7B7", // Turquoise
          "#9B59B6", // Purple
          "#FF5E8D", // Pink
          "#3498DB", // Blue
          "#1ABC9C", // Teal
        ];
        
        const newSparkle = {
          x: e.clientX + (Math.random() * 20 - 10),
          y: e.clientY + (Math.random() * 20 - 10),
          color: colors[Math.floor(Math.random() * colors.length)],
          id: counter,
        };
        
        setSparkles((prev) => [...prev, newSparkle]);
        setCounter((prev) => prev + 1);
        
        // Remove the sparkle after animation
        setTimeout(() => {
          setSparkles((prev) => prev.filter((sparkle) => sparkle.id !== newSparkle.id));
        }, 600);
      }
    };

    window.addEventListener('mousemove', updateMousePosition);
    
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, [counter, cursorX, cursorY]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      {/* Custom cursor */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[100]"
        style={{
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 opacity-70 blur-[2px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white"></div>
      </motion.div>
      
      {/* Falling sparkles */}
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute w-2 h-2 rounded-full"
          initial={{ 
            x: sparkle.x,
            y: sparkle.y,
            scale: 0.5,
            opacity: 0.8
          }}
          animate={{ 
            y: sparkle.y + 30,
            scale: 0,
            opacity: 0
          }}
          transition={{ 
            duration: 0.6,
            ease: "easeOut"
          }}
          style={{
            backgroundColor: sparkle.color,
            boxShadow: `0 0 5px ${sparkle.color}`,
          }}
        />
      ))}
    </div>
  );
};

export default CursorSparkle;
