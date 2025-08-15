import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { logoutUser } from '../services/api';
import { useAuthRedirect } from '../hooks/useAuthRedirect';

const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const { user, logout } = useAuth();
  const { loginUrl } = useAuthRedirect();

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

  const handleLogout = async (): Promise<void> => {
    try {
      console.log('🚪 Logout-Prozess gestartet...');
      
      // **SCHRITT 1: Backend über Logout benachrichtigen**
      await logoutUser();
      
      // **SCHRITT 2: User aus Context entfernen**
      logout();
      
      console.log('Logout erfolgreich!');
    } catch (error) {
      console.error('Logout-Fehler:', error);
      // Auch bei Fehlern den User lokal ausloggen
      logout();
    }
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
              <Link 
                to="/map"
                className="hover:text-coffee-brown transition-colors"
              >
                Map
              </Link>
            </li>
            {user && (
              <li>
                <Link 
                  to="/favorites"
                  className="hover:text-coffee-brown transition-colors"
                >
                  Favoriten
                </Link>
              </li>
            )}
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
          
          {/* Authentication Buttons */}
          {user ? (
            // **User ist eingeloggt: Zeige User-Info und Logout**
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-200">
                <div className="w-8 h-8 bg-coffee-brown rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {user.username[0].toUpperCase()}
                  </span>
                </div>
                <span className="text-sm">Hallo, {user.username}!</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-200 hover:text-coffee-brown transition-colors text-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            // **User ist nicht eingeloggt: Zeige Login-Button**
            <Link
              to={loginUrl}
              className="hidden md:flex items-center space-x-2 text-gray-200 hover:text-coffee-brown transition-colors"
            >
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-sm">👤</span>
              </div>
              <span className="text-sm">Login</span>
            </Link>
          )}
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
              <Link 
                to="/map"
                className="block hover:text-coffee-brown w-full text-left"
                onClick={() => setIsOpen(false)}
              >
                Map
              </Link>
            </li>
            {user && (
              <li>
                <Link 
                  to="/favorites"
                  className="block hover:text-coffee-brown w-full text-left"
                  onClick={() => setIsOpen(false)}
                >
                  Favoriten
                </Link>
              </li>
            )}
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
            {/* Mobile Authentication */}
            {user ? (
              <>
                <li className="pt-2 border-t border-gray-600">
                  <div className="text-gray-300 text-sm">
                    Eingeloggt als: <span className="text-coffee-brown">{user.username}</span>
                  </div>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="block hover:text-coffee-brown w-full text-left"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link 
                  to={loginUrl}
                  className="block hover:text-coffee-brown w-full text-left pt-2 border-t border-gray-600"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
