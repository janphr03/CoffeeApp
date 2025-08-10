import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { logoutUser } from '../../services/api';

interface RightSidebarProps {
  onLocationChange?: (location: [number, number]) => void;
  onUserLocationUpdate?: (location: [number, number] | null) => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ onLocationChange, onUserLocationUpdate }) => {
  const { user, logout } = useAuth();
  const [locationEnabled, setLocationEnabled] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string>('Standorterkennung ist deaktiviert');
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  const handleLocationToggle = () => {
    if (!locationEnabled) {
      // **SCHRITT 1: Standorterkennung aktivieren**
      console.log('🗺️ Standorterkennung wird aktiviert...');
      requestUserLocation();
    } else {
      // **SCHRITT 2: Standorterkennung deaktivieren**
      console.log('🚫 Standorterkennung wird deaktiviert...');
      setLocationEnabled(false);
      setLocationStatus('Standorterkennung ist deaktiviert');
      setIsLoading(false);
      
      // Map zurück zu Standard-Position (Berlin)
      if (onLocationChange) {
        onLocationChange([52.5200, 13.4050]);
      }
      
      // User-Marker entfernen
      if (onUserLocationUpdate) {
        onUserLocationUpdate(null);
      }
    }
  };

  const requestUserLocation = () => {
    // **SCHRITT 3: Browser Geolocation API prüfen**
    if (!navigator.geolocation) {
      console.error('❌ Geolocation wird von diesem Browser nicht unterstützt');
      setLocationStatus('Standorterkennung nicht verfügbar');
      return;
    }

    setIsLoading(true);
    setLocationStatus('Standort wird ermittelt...');

    // **SCHRITT 4: Standort anfordern**
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // **ERFOLG: Standort erhalten**
        const { latitude, longitude } = position.coords;
        const userLocation: [number, number] = [latitude, longitude];
        
        console.log('✅ Standort erfolgreich ermittelt:', { latitude, longitude });
        
        setLocationEnabled(true);
        setIsLoading(false);
        setLocationStatus(`Standort: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        
        // **SCHRITT 5: Map auf User-Standort zentrieren**
        if (onLocationChange) {
          onLocationChange(userLocation);
        }
        
        // **SCHRITT 6: User-Marker setzen**
        if (onUserLocationUpdate) {
          onUserLocationUpdate(userLocation);
        }
      },
      (error) => {
        // **FEHLER: Standort konnte nicht ermittelt werden**
        console.error('❌ Standorterkennung fehlgeschlagen:', error);
        
        setIsLoading(false);
        setLocationEnabled(false);
        
        // Verschiedene Fehlermeldungen je nach Fehlertyp
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationStatus('Standortzugriff verweigert');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationStatus('Standort nicht verfügbar');
            break;
          case error.TIMEOUT:
            setLocationStatus('Zeitüberschreitung bei Standortermittlung');
            break;
          default:
            setLocationStatus('Unbekannter Fehler bei Standortermittlung');
            break;
        }
      },
      {
        // **SCHRITT 7: Geolocation-Optionen**
        enableHighAccuracy: true, // Hohe Genauigkeit anfordern
        timeout: 10000, // 10 Sekunden Timeout
        maximumAge: 600000 // Cache für 10 Minuten (600.000 ms)
      }
    );
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
              to="/login"
              className="block w-full text-center bg-coffee-brown hover:bg-coffee-darkBrown text-white rounded-lg py-2 px-3 transition-colors text-sm"
            >
              Anmelden
            </Link>
            <Link
              to="/register"
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
              locationEnabled ? 'bg-coffee-brown' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                locationEnabled ? 'translate-x-6' : 'translate-x-1'
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
