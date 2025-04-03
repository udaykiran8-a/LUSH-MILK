
import React from 'react';

interface CulturalBackgroundProps {
  variant?: 'kolam' | 'rangoli' | 'temple';
  opacity?: number;
  children: React.ReactNode;
}

const CulturalBackground: React.FC<CulturalBackgroundProps> = ({ 
  variant = 'kolam',
  opacity = 0.1,
  children 
}) => {
  let backgroundClass = '';
  let decorationElements = null;
  
  switch (variant) {
    case 'kolam':
      backgroundClass = 'bg-kolam-pattern';
      break;
    case 'rangoli':
      backgroundClass = 'bg-rangoli-pattern';
      break;
    case 'temple':
      backgroundClass = 'relative overflow-hidden';
      decorationElements = (
        <>
          <div className="absolute top-0 left-0 w-full h-16 bg-contain bg-repeat-x" 
               style={{
                 backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 20\" height=\"20\" width=\"100\"%3E%3Cpath d=\"M0,10 L10,0 L20,10 L30,0 L40,10 L50,0 L60,10 L70,0 L80,10 L90,0 L100,10 L100,20 L0,20 Z\" fill=\"%23a78b7133\" /%3E%3C/svg%3E')",
                 opacity: opacity * 1.5
               }}></div>
          <div className="absolute bottom-0 left-0 w-full h-16 bg-contain bg-repeat-x" 
               style={{
                 backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 20\" height=\"20\" width=\"100\"%3E%3Cpath d=\"M0,10 L10,0 L20,10 L30,0 L40,10 L50,0 L60,10 L70,0 L80,10 L90,0 L100,10 L100,20 L0,20 Z\" fill=\"%23a78b7133\" /%3E%3C/svg%3E')",
                 opacity: opacity * 1.5,
                 transform: 'rotate(180deg)'
               }}></div>
          <div className="absolute left-0 top-0 h-full w-16 bg-contain bg-repeat-y"
               style={{
                 backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 20 100\" height=\"100\" width=\"20\"%3E%3Cpath d=\"M10,0 L0,10 L10,20 L0,30 L10,40 L0,50 L10,60 L0,70 L10,80 L0,90 L10,100 L20,100 L20,0 Z\" fill=\"%23a78b7133\" /%3E%3C/svg%3E')",
                 opacity: opacity * 1.5
               }}></div>
          <div className="absolute right-0 top-0 h-full w-16 bg-contain bg-repeat-y"
               style={{
                 backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 20 100\" height=\"100\" width=\"20\"%3E%3Cpath d=\"M10,0 L0,10 L10,20 L0,30 L10,40 L0,50 L10,60 L0,70 L10,80 L0,90 L10,100 L20,100 L20,0 Z\" fill=\"%23a78b7133\" /%3E%3C/svg%3E')",
                 opacity: opacity * 1.5,
                 transform: 'rotate(180deg)'
               }}></div>
        </>
      );
      break;
    default:
      backgroundClass = 'bg-kolam-pattern';
  }

  return (
    <div className={`relative ${backgroundClass}`} style={{ opacity }}>
      {decorationElements}
      {children}
    </div>
  );
};

export default CulturalBackground;
