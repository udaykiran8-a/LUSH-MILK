
import React from 'react';

interface SouthIndianAccentProps {
  type: 'kolam' | 'rangoli' | 'temple' | 'lamp';
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
  animated?: boolean;
}

const SouthIndianAccent: React.FC<SouthIndianAccentProps> = ({
  type,
  size = 'md',
  color = '#C17A67',
  className = '',
  animated = true
}) => {
  const sizeClass = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const animationClass = animated ? 'animate-float' : '';

  const renderSvg = () => {
    switch (type) {
      case 'kolam':
        return (
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M50,10 L90,50 L50,90 L10,50 Z" fill="none" stroke={color} strokeWidth="1.5" />
            <path d="M50,20 L80,50 L50,80 L20,50 Z" fill="none" stroke={color} strokeWidth="1.5" />
            <path d="M50,30 L70,50 L50,70 L30,50 Z" fill="none" stroke={color} strokeWidth="1.5" />
            <path d="M50,10 L50,90" fill="none" stroke={color} strokeWidth="1" />
            <path d="M10,50 L90,50" fill="none" stroke={color} strokeWidth="1" />
            <path d="M25,25 L75,75" fill="none" stroke={color} strokeWidth="1" />
            <path d="M25,75 L75,25" fill="none" stroke={color} strokeWidth="1" />
            <circle cx="50" cy="50" r="5" fill={color} />
            <circle cx="50" cy="10" r="2" fill={color} />
            <circle cx="90" cy="50" r="2" fill={color} />
            <circle cx="50" cy="90" r="2" fill={color} />
            <circle cx="10" cy="50" r="2" fill={color} />
          </svg>
        );
      case 'rangoli':
        return (
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="1" />
            <circle cx="50" cy="50" r="30" fill="none" stroke={color} strokeWidth="1" />
            <circle cx="50" cy="50" r="20" fill="none" stroke={color} strokeWidth="1" />
            <circle cx="50" cy="50" r="10" fill="none" stroke={color} strokeWidth="1" />
            <path d="M10,50 L90,50" stroke={color} strokeWidth="1" />
            <path d="M50,10 L50,90" stroke={color} strokeWidth="1" />
            <path d="M22,22 L78,78" stroke={color} strokeWidth="1" />
            <path d="M22,78 L78,22" stroke={color} strokeWidth="1" />
            <circle cx="50" cy="50" r="3" fill={color} />
            <circle cx="50" cy="20" r="2" fill={color} />
            <circle cx="50" cy="80" r="2" fill={color} />
            <circle cx="20" cy="50" r="2" fill={color} />
            <circle cx="80" cy="50" r="2" fill={color} />
          </svg>
        );
      case 'temple':
        return (
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M50,10 L60,20 L60,40 L70,40 L70,60 L80,60 L80,90 L20,90 L20,60 L30,60 L30,40 L40,40 L40,20 L50,10 Z" fill={color} />
            <path d="M45,30 L55,30 L55,90 L45,90 Z" fill="white" opacity="0.8" />
            <path d="M35,50 L45,50 L45,60 L35,60 Z" fill="white" opacity="0.8" />
            <path d="M55,50 L65,50 L65,60 L55,60 Z" fill="white" opacity="0.8" />
          </svg>
        );
      case 'lamp':
        return (
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M40,90 L60,90 L55,70 L45,70 Z" fill={color} />
            <path d="M45,70 L55,70 L53,50 L47,50 Z" fill={color} />
            <ellipse cx="50" cy="45" rx="15" ry="8" fill={color} />
            <ellipse cx="50" cy="40" rx="10" ry="5" fill="orange" />
            <path d="M50,30 L50,10" stroke={color} strokeWidth="1" />
            <path d="M45,15 L55,15" stroke={color} strokeWidth="1" />
            <path d="M47,10 L53,10" stroke={color} strokeWidth="1" />
            {animated && (
              <>
                <circle cx="50" cy="25" r="1.5" fill="yellow">
                  <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
                </circle>
                <path d="M45,25 L55,25" stroke="yellow" strokeWidth="0.5" opacity="0.7">
                  <animate attributeName="opacity" values="0.3;0.7;0.3" dur="1.5s" repeatCount="indefinite" />
                </path>
              </>
            )}
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`${sizeClass[size]} ${animationClass} ${className}`}>
      {renderSvg()}
    </div>
  );
};

export default SouthIndianAccent;
