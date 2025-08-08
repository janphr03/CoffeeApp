import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { logoutUser } from '../../services/api';

interface MapNavigationProps {
  isLoggedIn: boolean;
  onToggleLogin: () => void;
}

const MapNavigation: React.FC<MapNavigationProps> = ({ isLoggedIn, onToggleLogin }) => {
  const { user, logout } = useAuth();

  const handleLogout = async (): Promise<void> => {
    try {
      console.log('🚪 Logout von Map-Seite...');
      
      // **SCHRITT 1: Backend über Logout benachrichtigen**
      await logoutUser();
      
      // **SCHRITT 2: User aus Context entfernen**
      logout();
      
      console.log('✅ Logout erfolgreich!');
    } catch (error) {
      console.error('❌ Logout-Fehler:', error);
      // Auch bei Fehlern den User lokal ausloggen
      logout();
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-coffee-dark bg-opacity-90 backdrop-blur-sm z-50 shadow-lg border-b border-coffee-brown">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-coffee-cream font-playfair">
          ☕ CoffeeSpots
        </Link>
        
        {/* Center Links */}
        <div className="hidden md:flex space-x-6">
          <Link 
            to="/" 
            className="text-gray-300 hover:text-coffee-brown transition-colors"
          >
            Home
          </Link>
          <span className="text-coffee-brown">Map</span>
        </div>

        {/* Authentication Area */}
        <div className="flex items-center space-x-4">
          {user ? (
            // **Eingeloggter User: User-Info und Logout**
            <>
              <div className="hidden sm:flex items-center space-x-2 text-gray-300">
                <div className="w-8 h-8 bg-coffee-brown rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {user.username[0].toUpperCase()}
                  </span>
                </div>
                <span className="text-sm">Hallo, {user.username}!</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-300 hover:text-coffee-brown transition-colors text-sm px-3 py-1 border border-gray-600 rounded-lg hover:border-coffee-brown"
              >
                Logout
              </button>
            </>
          ) : (
            // **Nicht eingeloggt: Login-Button**
            <Link
              to="/login"
              className="flex items-center space-x-2 text-gray-300 hover:text-coffee-brown transition-colors px-3 py-1 border border-gray-600 rounded-lg hover:border-coffee-brown"
            >
              <span className="text-sm">👤</span>
              <span className="text-sm">Login</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default MapNavigation;
