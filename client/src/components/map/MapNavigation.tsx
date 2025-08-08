import React from 'react';
import { Link } from 'react-router-dom';

interface MapNavigationProps {
  isLoggedIn: boolean;
  onToggleLogin: () => void;
}

const MapNavigation: React.FC<MapNavigationProps> = ({ isLoggedIn, onToggleLogin }) => {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 p-4">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="text-2xl">☕</div>
          <span className="text-xl font-semibold text-gray-800">
            Coffee Spots
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Standort Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Standort</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked={false} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coffee-brown"></div>
            </label>
          </div>

          {/* Login Button */}
          <button
            onClick={onToggleLogin}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-sm">👤</span>
            </div>
            <span className="text-sm">
              {isLoggedIn ? 'Logout' : 'Login'}
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default MapNavigation;
