
import React from 'react';

interface CulturalBackgroundProps {
  variant?: 'kolam' | 'rangoli' | 'temple';
  opacity?: number;
  children: React.ReactNode;
}

const CulturalBackground: React.FC<CulturalBackgroundProps> = ({ 
  variant = 'kolam',
  opacity = 0.15, // Increased default opacity
  children 
}) => {
  let backgroundClass = '';
  let decorationElements = null;
  
  switch (variant) {
    case 'kolam':
      backgroundClass = 'bg-kolam-pattern';
      // Add subtle kolam border element
      decorationElements = (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32 opacity-30">
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <path d="M50,10 L90,50 L50,90 L10,50 Z" fill="none" stroke="#7CA982" strokeWidth="1" />
              <path d="M50,20 L80,50 L50,80 L20,50 Z" fill="none" stroke="#7CA982" strokeWidth="1" />
              <path d="M50,30 L70,50 L50,70 L30,50 Z" fill="none" stroke="#7CA982" strokeWidth="1" />
              <circle cx="50" cy="50" r="4" fill="#7CA982" />
              <circle cx="50" cy="10" r="2" fill="#7CA982" />
              <circle cx="50" cy="90" r="2" fill="#7CA982" />
              <circle cx="10" cy="50" r="2" fill="#7CA982" />
              <circle cx="90" cy="50" r="2" fill="#7CA982" />
            </svg>
          </div>
        </div>
      );
      break;
    case 'rangoli':
      backgroundClass = 'bg-rangoli-pattern';
      // Add more prominent rangoli decorations
      decorationElements = (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -bottom-10 -right-10 w-64 h-64 opacity-20">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path d="M100,10 A90,90 0 0,1 100,190 A90,90 0 0,1 100,10 Z" fill="none" stroke="#C17A67" strokeWidth="1" />
              <path d="M100,30 A70,70 0 0,1 100,170 A70,70 0 0,1 100,30 Z" fill="none" stroke="#C17A67" strokeWidth="1" />
              <path d="M100,50 A50,50 0 0,1 100,150 A50,50 0 0,1 100,50 Z" fill="none" stroke="#C17A67" strokeWidth="1" />
              <path d="M100,70 A30,30 0 0,1 100,130 A30,30 0 0,1 100,70 Z" fill="none" stroke="#C17A67" strokeWidth="1" />
              <path d="M10,100 L190,100" stroke="#C17A67" strokeWidth="1" />
              <path d="M100,10 L100,190" stroke="#C17A67" strokeWidth="1" />
              <path d="M30,30 L170,170" stroke="#C17A67" strokeWidth="1" />
              <path d="M30,170 L170,30" stroke="#C17A67" strokeWidth="1" />
            </svg>
          </div>
          <div className="absolute -top-10 -left-10 w-64 h-64 opacity-20">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path d="M100,10 A90,90 0 0,1 100,190 A90,90 0 0,1 100,10 Z" fill="none" stroke="#C17A67" strokeWidth="1" />
              <path d="M100,30 A70,70 0 0,1 100,170 A70,70 0 0,1 100,30 Z" fill="none" stroke="#C17A67" strokeWidth="1" />
              <path d="M100,50 A50,50 0 0,1 100,150 A50,50 0 0,1 100,50 Z" fill="none" stroke="#C17A67" strokeWidth="1" />
              <path d="M100,70 A30,30 0 0,1 100,130 A30,30 0 0,1 100,70 Z" fill="none" stroke="#C17A67" strokeWidth="1" />
              <path d="M10,100 L190,100" stroke="#C17A67" strokeWidth="1" />
              <path d="M100,10 L100,190" stroke="#C17A67" strokeWidth="1" />
              <path d="M30,30 L170,170" stroke="#C17A67" strokeWidth="1" />
              <path d="M30,170 L170,30" stroke="#C17A67" strokeWidth="1" />
            </svg>
          </div>
        </div>
      );
      break;
    case 'temple':
      backgroundClass = 'relative overflow-hidden';
      decorationElements = (
        <>
          <div className="absolute top-0 left-0 w-full h-20 bg-contain bg-repeat-x" 
               style={{
                 backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 20\" height=\"20\" width=\"100\"%3E%3Cpath d=\"M0,10 L10,0 L20,10 L30,0 L40,10 L50,0 L60,10 L70,0 L80,10 L90,0 L100,10 L100,20 L0,20 Z\" fill=\"%23C17A67\" fill-opacity=\"0.4\" /%3E%3C/svg%3E')",
                 opacity: opacity * 2
               }}></div>
          <div className="absolute bottom-0 left-0 w-full h-20 bg-contain bg-repeat-x" 
               style={{
                 backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 20\" height=\"20\" width=\"100\"%3E%3Cpath d=\"M0,10 L10,0 L20,10 L30,0 L40,10 L50,0 L60,10 L70,0 L80,10 L90,0 L100,10 L100,20 L0,20 Z\" fill=\"%23C17A67\" fill-opacity=\"0.4\" /%3E%3C/svg%3E')",
                 opacity: opacity * 2,
                 transform: 'rotate(180deg)'
               }}></div>
          <div className="absolute left-0 top-0 h-full w-20 bg-contain bg-repeat-y"
               style={{
                 backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 20 100\" height=\"100\" width=\"20\"%3E%3Cpath d=\"M10,0 L0,10 L10,20 L0,30 L10,40 L0,50 L10,60 L0,70 L10,80 L0,90 L10,100 L20,100 L20,0 Z\" fill=\"%23C17A67\" fill-opacity=\"0.4\" /%3E%3C/svg%3E')",
                 opacity: opacity * 2
               }}></div>
          <div className="absolute right-0 top-0 h-full w-20 bg-contain bg-repeat-y"
               style={{
                 backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 20 100\" height=\"100\" width=\"20\"%3E%3Cpath d=\"M10,0 L0,10 L10,20 L0,30 L10,40 L0,50 L10,60 L0,70 L10,80 L0,90 L10,100 L20,100 L20,0 Z\" fill=\"%23C17A67\" fill-opacity=\"0.4\" /%3E%3C/svg%3E')",
                 opacity: opacity * 2,
                 transform: 'rotate(180deg)'
               }}></div>
          
          {/* Add center temple silhouette */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 opacity-10 pointer-events-none">
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <path d="M50,10 L60,20 L60,40 L70,40 L70,60 L80,60 L80,90 L20,90 L20,60 L30,60 L30,40 L40,40 L40,20 L50,10 Z" fill="#8E603F" />
              <path d="M45,30 L55,30 L55,90 L45,90 Z" fill="#F8F4E3" />
              <path d="M35,50 L45,50 L45,60 L35,60 Z" fill="#F8F4E3" />
              <path d="M55,50 L65,50 L65,60 L55,60 Z" fill="#F8F4E3" />
            </svg>
          </div>
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
