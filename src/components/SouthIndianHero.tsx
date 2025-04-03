
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface SouthIndianHeroProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  backgroundImage?: string;
}

const SouthIndianHero: React.FC<SouthIndianHeroProps> = ({
  title,
  subtitle,
  ctaText,
  ctaLink,
  secondaryCtaText,
  secondaryCtaLink,
  backgroundImage = "https://images.unsplash.com/photo-1628088062854-d1870b4553da?q=80&w=2070&auto=format&fit=crop"
}) => {
  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-4 overflow-hidden">
      <div 
        className="absolute inset-0 z-0" 
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      ></div>
      
      {/* Temple silhouette */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32 bg-contain bg-bottom bg-repeat-x z-10"
        style={{
          backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1440 320\" fill=\"%23000000\" fill-opacity=\"0.5\"%3E%3Cpath d=\"M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,208C672,213,768,203,864,181.3C960,160,1056,128,1152,128C1248,128,1344,160,1392,176L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z\"%3E%3C/path%3E%3Cpath d=\"M720,280 L720,200 L680,200 L680,240 L640,240 L640,200 L600,200 L600,240 L560,240 L560,200 L520,200 L520,280 L480,280 L480,200 L440,200 L440,240 L400,240 L400,280 L360,280 L360,240 L320,240 L320,200 L280,200 L280,280 L240,280 L240,200 L200,200 L200,240 L160,240 L160,200 L120,200 L120,240 L80,240 L80,200 L40,200 L40,280 L0,280 L0,320 L1440,320 L1440,280 L1400,280 L1400,200 L1360,200 L1360,240 L1320,240 L1320,200 L1280,200 L1280,240 L1240,240 L1240,200 L1200,200 L1200,280 L1160,280 L1160,200 L1120,200 L1120,240 L1080,240 L1080,280 L1040,280 L1040,240 L1000,240 L1000,200 L960,200 L960,280 L920,280 L920,200 L880,200 L880,240 L840,240 L840,200 L800,200 L800,240 L760,240 L760,200 L720,200 Z\" fill=\"%23000000\" fill-opacity=\"0.7\"%3E%3C/path%3E%3C/svg%3E')",
        }}
      ></div>
      
      {/* Decorative elements - Kolam pattern borders */}
      <div className="absolute top-10 left-10 right-10 bottom-10 border-8 border-white/10 z-10 pointer-events-none"></div>
      <div className="absolute top-12 left-12 right-12 bottom-12 border-2 border-dashed border-white/20 z-10 pointer-events-none"></div>
      
      {/* Content */}
      <div className="relative z-20 max-w-4xl mx-auto text-white animate-fade-in">
        <img 
          src="/lovable-uploads/3907e856-b011-4bd0-8422-7cff5037d830.png" 
          alt="LushMilk Logo" 
          className="h-20 w-20 mx-auto mb-4"
        />
        <h1 className="text-4xl md:text-6xl font-bold mb-4">{title}</h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">{subtitle}</p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          <Button asChild className="btn-primary">
            <Link to={ctaLink}>{ctaText}</Link>
          </Button>
          {secondaryCtaText && secondaryCtaLink && (
            <Button asChild variant="outline" className="border-white text-white hover:bg-white/20 hover:text-white">
              <Link to={secondaryCtaLink}>{secondaryCtaText}</Link>
            </Button>
          )}
        </div>
        
        <div className="flex flex-wrap justify-center gap-6 text-white/90">
          <span className="flex items-center gap-1 text-lg">
            <span className="w-2 h-2 rounded-full bg-lushmilk-cream"></span>
            Farm Fresh
          </span>
          <span className="flex items-center gap-1 text-lg">
            <span className="w-2 h-2 rounded-full bg-lushmilk-cream"></span>
            No Preservatives
          </span>
          <span className="flex items-center gap-1 text-lg">
            <span className="w-2 h-2 rounded-full bg-lushmilk-cream"></span>
            Direct from Farmers
          </span>
        </div>
        
        {/* Decorative element - small kolam pattern */}
        <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 w-40 h-40 opacity-30 pointer-events-none">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M50,10 L90,50 L50,90 L10,50 Z" fill="none" stroke="white" strokeWidth="1" />
            <path d="M50,20 L80,50 L50,80 L20,50 Z" fill="none" stroke="white" strokeWidth="1" />
            <path d="M50,30 L70,50 L50,70 L30,50 Z" fill="none" stroke="white" strokeWidth="1" />
            <path d="M50,10 L50,90" fill="none" stroke="white" strokeWidth="1" />
            <path d="M10,50 L90,50" fill="none" stroke="white" strokeWidth="1" />
            <path d="M25,25 L75,75" fill="none" stroke="white" strokeWidth="1" />
            <path d="M25,75 L75,25" fill="none" stroke="white" strokeWidth="1" />
            <circle cx="50" cy="50" r="5" fill="white" />
          </svg>
        </div>
      </div>
    </section>
  );
};

export default SouthIndianHero;
