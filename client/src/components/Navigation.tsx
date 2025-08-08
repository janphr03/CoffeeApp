import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = (): void => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string): void => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  return (
    <nav 
      className={`fixed w-full top-0 left-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-gray-900 bg-opacity-90 shadow-lg' : ''
      }`}
    >
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-coffee-cream">
          ☕ CoffeeSpots
        </Link>
        
        <div className="flex items-center space-x-6">
          <ul className="hidden md:flex space-x-8 text-gray-200">
            <li>
              <button 
                onClick={() => scrollToSection('hero')} 
                className="hover:text-coffee-brown transition-colors"
              >
                Home
              </button>
            </li>
            <li>
              <button 
                onClick={() => scrollToSection('about')} 
                className="hover:text-coffee-brown transition-colors"
              >
                About
              </button>
            </li>
            <li>
              <button 
                onClick={() => scrollToSection('features')} 
                className="hover:text-coffee-brown transition-colors"
              >
                Features
              </button>
            </li>
            <li>
              <button 
                onClick={() => scrollToSection('testi')} 
                className="hover:text-coffee-brown transition-colors"
              >
                Testimonials
              </button>
            </li>
            <li>
              <button 
                onClick={() => scrollToSection('contact')} 
                className="hover:text-coffee-brown transition-colors"
              >
                Contact
              </button>
            </li>
          </ul>
          
          {/* Login Button */}
          <Link
            to="/login"
            className="hidden md:flex items-center space-x-2 text-gray-200 hover:text-coffee-brown transition-colors"
          >
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-sm">👤</span>
            </div>
            <span className="text-sm">Login</span>
          </Link>
        </div>
        
        <button 
          className="md:hidden text-2xl text-gray-200"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-coffee-dark">
          <ul className="space-y-2 p-4 text-gray-200">
            <li>
              <button 
                onClick={() => scrollToSection('hero')} 
                className="block hover:text-coffee-brown w-full text-left"
              >
                Home
              </button>
            </li>
            <li>
              <button 
                onClick={() => scrollToSection('about')} 
                className="block hover:text-coffee-brown w-full text-left"
              >
                About
              </button>
            </li>
            <li>
              <button 
                onClick={() => scrollToSection('features')} 
                className="block hover:text-coffee-brown w-full text-left"
              >
                Features
              </button>
            </li>
            <li>
              <button 
                onClick={() => scrollToSection('testi')} 
                className="block hover:text-coffee-brown w-full text-left"
              >
                Testimonials
              </button>
            </li>
            <li>
              <button 
                onClick={() => scrollToSection('contact')} 
                className="block hover:text-coffee-brown w-full text-left"
              >
                Contact
              </button>
            </li>
            <li>
              <Link 
                to="/login"
                className="block hover:text-coffee-brown w-full text-left pt-2 border-t border-gray-600"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
