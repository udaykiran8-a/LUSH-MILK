
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
      
      // Increased sparkle frequency - reduced threshold from 0.7 to 0.4
      if (Math.random() > 0.4) {
        const colors = [
          "#FF5733", // Orange
          "#FFC300", // Gold
          "#36D7B7", // Turquoise
          "#9B59B6", // Purple
          "#FF5E8D", // Pink
          "#3498DB", // Blue
          "#1ABC9C", // Teal
          "#F97316", // Bright Orange
          "#D946EF", // Magenta Pink
          "#8B5CF6", // Vivid Purple
          "#0EA5E9", // Ocean Blue
        ];
        
        // Create multiple sparkles per movement for a more dramatic effect
        const sparkleCount = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < sparkleCount; i++) {
          const newSparkle = {
            x: e.clientX + (Math.random() * 30 - 15),
            y: e.clientY + (Math.random() * 30 - 15),
            color: colors[Math.floor(Math.random() * colors.length)],
            id: counter + i,
          };
          
          setSparkles((prev) => [...prev, newSparkle]);
        }
        
        setCounter((prev) => prev + sparkleCount);
        
        // Remove the sparkles after animation
        setTimeout(() => {
          setSparkles((prev) => prev.filter((sparkle) => sparkle.id < counter));
        }, 800);
      }
    };

    window.addEventListener('mousemove', updateMousePosition);
    
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, [counter, cursorX, cursorY]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      {/* Enhanced rainbow cursor */}
      <motion.div
        className="fixed top-0 left-0 w-10 h-10 pointer-events-none z-[100]"
        style={{
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 opacity-70 blur-[3px] animate-pulse-light"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white"></div>
      </motion.div>
      
      {/* More falling sparkles with varied sizes */}
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute rounded-full"
          initial={{ 
            x: sparkle.x,
            y: sparkle.y,
            scale: Math.random() * 0.5 + 0.5,
            opacity: 0.9
          }}
          animate={{ 
            y: sparkle.y + 40,
            scale: 0,
            opacity: 0
          }}
          transition={{ 
            duration: Math.random() * 0.4 + 0.6,
            ease: "easeOut"
          }}
          style={{
            width: Math.random() * 5 + 2 + "px",
            height: Math.random() * 5 + 2 + "px",
            backgroundColor: sparkle.color,
            boxShadow: `0 0 8px ${sparkle.color}`,
          }}
        />
      ))}
    </div>
  );
};

export default CursorSparkle;
