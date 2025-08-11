import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useUserLocation } from '../../contexts/LocationContext';
import { logoutUser } from '../../services/api';
import { useAuthRedirect } from '../../hooks/useAuthRedirect';

interface RightSidebarProps {
  onLocationChange?: (location: [number, number]) => void;
  onUserLocationUpdate?: (location: [number, number] | null) => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ onLocationChange, onUserLocationUpdate }) => {
  const { user, logout } = useAuth();
  const { loginUrl, registerUrl } = useAuthRedirect();
  const { 
    isLocationEnabled, 
    locationStatus, 
    isLoading, 
    enableLocation, 
    disableLocation 
  } = useUserLocation();

  const handleLogout = async (): Promise<void> => {
    try {
      console.log('🚪 Logout von rechter Sidebar...');
      await logoutUser();
      logout();
      console.log('✅ Logout erfolgreich!');
    } catch (error) {
      console.error('❌ Logout-Fehler:', error);
      logout();
    }
  };

  const handleLocationToggle = async () => {
    if (!isLocationEnabled) {
      // **SCHRITT 1: Standorterkennung aktivieren**
      console.log('🗺️ Standorterkennung wird aktiviert...');
      try {
        await enableLocation();
        console.log('✅ Location erfolgreich aktiviert');
      } catch (error) {
        console.error('❌ Fehler beim Aktivieren der Location:', error);
      }
    } else {
      // **SCHRITT 2: Standorterkennung deaktivieren**
      console.log('🚫 Standorterkennung wird deaktiviert...');
      disableLocation();
      console.log('✅ Location erfolgreich deaktiviert');
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 h-full flex flex-col overflow-hidden">
      {/* Oberer Bereich: Authentication */}
      <div className="p-4 border-b border-gray-200">
        {user ? (
          // Eingeloggt: User-Info und Logout
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-coffee-brown rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {user.username[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800">
                  {user.username}
                </div>
                <div className="text-xs text-gray-500">
                  {user.email}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-sm text-coffee-brown hover:text-coffee-darkBrown border border-coffee-brown hover:border-coffee-darkBrown rounded-lg py-2 px-3 transition-colors"
            >
              Abmelden
            </button>
          </div>
        ) : (
          // Nicht eingeloggt: Login-Button
          <div className="space-y-3">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl text-gray-400">👤</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Melden Sie sich an, um personalisierte Coffee Spots zu entdecken
              </p>
            </div>
            <Link
              to={loginUrl}
              className="block w-full text-center bg-coffee-brown hover:bg-coffee-darkBrown text-white rounded-lg py-2 px-3 transition-colors text-sm"
            >
              Anmelden
            </Link>
            <Link
              to={registerUrl}
              className="block w-full text-center text-coffee-brown hover:text-coffee-darkBrown border border-coffee-brown hover:border-coffee-darkBrown rounded-lg py-2 px-3 transition-colors text-sm"
            >
              Registrieren
            </Link>
          </div>
        )}
      </div>

      {/* Mittlerer Bereich: Flexibler Platz */}
      <div className="flex-1 p-4">
        {/* Zusätzliche Features können hier hinzugefügt werden */}
        <div className="text-sm text-gray-500 text-center">
          {/* Placeholder für zukünftige Features */}
        </div>
      </div>

      {/* Unterer Bereich: Standort-Regler */}
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">
          📍 Standorterkennung
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">
            Meinen Standort verwenden
          </span>
          <button
            onClick={handleLocationToggle}
            disabled={isLoading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-coffee-brown focus:ring-offset-2 disabled:opacity-50 ${
              isLocationEnabled ? 'bg-coffee-brown' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isLocationEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {locationStatus}
        </p>
      </div>
    </div>
  );
};

export default RightSidebar;
