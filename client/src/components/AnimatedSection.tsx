import React, { useEffect, useRef, useState } from 'react';

interface AnimatedSectionProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({ id, children, className = "" }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const currentSection = sectionRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (currentSection) {
      observer.observe(currentSection);
    }

    return () => {
      if (currentSection) {
        observer.unobserve(currentSection);
      }
    };
  }, []);

  return (
    <section
      id={id}
      ref={sectionRef}
      className={`relative ${className} ${
        isVisible 
          ? 'opacity-100 transform translate-z-0 scale-100' 
          : 'opacity-0 transform translate-z-[-200px] scale-95'
      } transition-all duration-1000 ease-out`}
    >
      {/* Overlay für bessere Lesbarkeit */}
      <div className="absolute inset-0 bg-black bg-opacity-40 pointer-events-none z-0"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </section>
  );
};

export default AnimatedSection;
