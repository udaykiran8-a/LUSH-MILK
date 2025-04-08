
import React, { useState, useEffect, useRef } from 'react';
import { useMotionValue, useSpring, motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

interface SparkleProps {
  x: number;
  y: number;
  color: string;
  id: string;
}

const CursorSparkle = () => {
  const [sparkles, setSparkles] = useState<SparkleProps[]>([]);
  const [counter, setCounter] = useState(0);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const isMobile = useIsMobile();
  const lastTouchRef = useRef<{ x: number, y: number } | null>(null);
  
  const springConfig = { damping: 25, stiffness: 300 };
  const springX = useSpring(cursorX, springConfig);
  const springY = useSpring(cursorY, springConfig);

  const createSparkles = (x: number, y: number) => {
    if (Math.random() > 0.4) {
      const colors = [
        "#FF5733", "#FFC300", "#36D7B7", "#9B59B6", "#FF5E8D", 
        "#3498DB", "#1ABC9C", "#F97316", "#D946EF", "#8B5CF6", "#0EA5E9"
      ];
      
      const sparkleCount = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < sparkleCount; i++) {
        const timestamp = Date.now();
        const newSparkle = {
          x: x + (Math.random() * 30 - 15),
          y: y + (Math.random() * 30 - 15),
          color: colors[Math.floor(Math.random() * colors.length)],
          id: `${timestamp}-${counter + i}`,
        };
        
        setSparkles((prev) => [...prev, newSparkle]);
      }
      
      setCounter((prev) => prev + sparkleCount);
      
      setTimeout(() => {
        setSparkles((prev) => {
          if (prev.length > 20) {
            return prev.slice(prev.length - 20);
          }
          return prev;
        });
      }, 800);
    }
  };

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      createSparkles(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        const touch = e.touches[0];
        cursorX.set(touch.clientX);
        cursorY.set(touch.clientY);
        
        // Only create sparkles if the touch has moved a minimum distance
        // This prevents creating too many sparkles when the user is just tapping
        if (lastTouchRef.current) {
          const dx = touch.clientX - lastTouchRef.current.x;
          const dy = touch.clientY - lastTouchRef.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 10) {
            createSparkles(touch.clientX, touch.clientY);
            lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
          }
        } else {
          lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        const touch = e.touches[0];
        cursorX.set(touch.clientX);
        cursorY.set(touch.clientY);
        lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
        createSparkles(touch.clientX, touch.clientY);
      }
    };

    const handleTouchEnd = () => {
      lastTouchRef.current = null;
    };

    window.addEventListener('mousemove', updateMousePosition);
    
    // Add touch event listeners for mobile
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [counter, cursorX, cursorY]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      {/* Only show cursor on non-mobile devices */}
      {!isMobile && (
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
      )}
      
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
