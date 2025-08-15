import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import InteractiveMap from '../components/map/InteractiveMap';
import CoffeeSpotSidebar from '../components/map/CoffeeSpotSidebar';
import RightSidebar from '../components/map/RightSidebar';
import { loadNearbyCafes, NearbyCafe } from '../services/overpassApi';
import { useAuth } from '../contexts/AuthContext';
import { useUserLocation } from '../contexts/LocationContext';
import { logoutUser } from '../services/api';
import { useAuthRedirect } from '../hooks/useAuthRedirect';

interface CoffeeSpot {
  id: number;
  name: string;
  address: string;
  rating: number;
  lat: number;
  lng: number;
  isOpen: boolean;
  distance?: string;
  priceLevel?: number;
  openingHours?: string;
  // OSM-Daten für eindeutige Identifikation
  osmType?: 'node' | 'way' | 'relation';
  osmId?: number;
  amenity?: string;
  tags?: Record<string, string>;
}

const MapPage: React.FC = () => {
  const [showMap, setShowMap] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    // Einfach 300ms warten, dann Map rendern
    const timer = setTimeout(() => {
      setShowMap(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { loginUrl } = useAuthRedirect();
  const { 
    userLocation, 
    isLocationEnabled, 
    locationStatus, 
    isLoading: isLocationLoading, 
    enableLocation, 
    disableLocation 
  } = useUserLocation();
  const [mapCenter, setMapCenter] = useState<[number, number]>([52.5200, 13.4050]); // Berlin
  const [nearbyCafes, setNearbyCafes] = useState<CoffeeSpot[]>([]);
  const [isLoadingCafes, setIsLoadingCafes] = useState(false);
  const [selectedSpotId, setSelectedSpotId] = useState<number | null>(null);
  const mapRef = useRef<any>(null);

  // Konfigurierbare Parameter für Café-Suche
  const SEARCH_RADIUS_KM = 10;
  const MAX_CAFES = 10;


 // Konvertiert Grad in Radianten
  const toRadians = useCallback((degrees: number): number => {
    return degrees * (Math.PI / 180);
  }, []);

  // Berechnet die Entfernung zwischen zwei Punkten und formatiert sie
  const calculateDistance = useCallback((lat1: number, lng1: number, lat2: number, lng2: number): string => {
    const R = 6371; // Erdradius in km
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
  }, [toRadians]);

  // Lädt Cafés in der Nähe des angegebenen Standorts
  const loadNearbyCafesLocal = useCallback(async (lat: number, lng: number) => {
    setIsLoadingCafes(true);
    try {
      console.log(`Lade Cafés in ${SEARCH_RADIUS_KM}km Radius um [${lat}, ${lng}]...`);

      const nearbyData = await loadNearbyCafes(
          lat,
          lng,
          SEARCH_RADIUS_KM,
          MAX_CAFES
      );

      // Konvertiere NearbyCafe zu CoffeeSpot Format
      const convertedCafes: CoffeeSpot[] = nearbyData.map((cafe: NearbyCafe) => ({
        id: cafe.id,
        name: cafe.name,
        address: cafe.address || 'Adresse nicht verfügbar',
        rating: 0, // Wird durch FavoritesCountDisplay ersetzt
        lat: cafe.lat,
        lng: cafe.lng,
        isOpen: true, // Wird durch OpeningHoursService überschrieben
        distance: calculateDistance(lat, lng, cafe.lat, cafe.lng),
        priceLevel: 2, // Default Preisniveau
        openingHours: cafe.tags?.opening_hours, // Öffnungszeiten aus Overpass API
        // OSM-Daten für eindeutige Identifikation
        osmType: cafe.osmType,
        osmId: cafe.osmId,
        amenity: cafe.amenity,
        tags: cafe.tags
      }));

      setNearbyCafes(convertedCafes);
      console.log(`${convertedCafes.length} Cafés erfolgreich geladen`);

    } catch (error) {
      console.error('Fehler beim Laden der Cafés:', error);
      setNearbyCafes([]);
      // Hier könnte eine Benutzer-Benachrichtigung hinzugefügt werden
    } finally {
      setIsLoadingCafes(false);
    }
  }, [calculateDistance]); // calculateDistance als Dependency hinzugefügt

  // Coffee Spots: Nur echte Café-Daten von der Overpass API
  const coffeeSpots: CoffeeSpot[] = nearbyCafes;

  // **SCHRITT: Location Context synchronisieren - OHNE PARENT CALLBACKS**
  useEffect(() => {
    if (isLocationEnabled && userLocation) {
      console.log('Location Context aktiviert, lade Cafés für:', userLocation);
      setMapCenter(userLocation);

      // **WICHTIG: Café-Loading throtteln um 429-Fehler zu vermeiden**
      const timer = setTimeout(() => {
        loadNearbyCafesLocal(userLocation[0], userLocation[1]);
      }, 1000); // 1 Sekunde Verzögerung

      return () => clearTimeout(timer);
    } else if (!isLocationEnabled) {
      console.log('Location Context deaktiviert, zurück zu Default');
      setMapCenter([52.5200, 13.4050]); // Berlin
      setNearbyCafes([]);
    }
  }, [isLocationEnabled, userLocation, loadNearbyCafesLocal]); // Alle Dependencies hinzugefügt

  // **ENTFERNT: handleLocationChange und handleUserLocationUpdate werden nicht mehr verwendet**
  // Der LocationContext verwaltet alles zentral
  const handleLocationChange = (newLocation: [number, number]) => {
    // Diese Funktion wird nicht mehr verwendet, da LocationContext direkt mapCenter setzt
    console.log('Map-Position Callback (wird ignoriert):', newLocation);
  };

  const handleUserLocationUpdate = async (location: [number, number] | null) => {
    // Diese Funktion wird nicht mehr verwendet, da LocationContext direkt verwaltet wird
    console.log('User-Location Callback (wird ignoriert):', location);
  };

  const handleSpotClick = (spot: CoffeeSpot) => {
    // Karte zu dem angeklickten Spot zentrieren
    setMapCenter([spot.lat, spot.lng]);

    // Optional: Zoom level anpassen
    if (mapRef.current) {
      mapRef.current.setView([spot.lat, spot.lng], 16);
    }
  };

  const handleCloseMap = () => {
    // Zur Startseite navigieren
    navigate('/');
  };

  const handleFavoritesClick = () => {
    if (!user) {
      // User ist nicht eingeloggt - Hinweis anzeigen
      alert('Sie müssen sich anmelden oder registrieren, um Ihre Favoriten anzuzeigen.');
    } else {
      // User ist eingeloggt - zur Favoriten-Seite weiterleiten
      console.log('User eingeloggt, weiterleitung zu Favoriten für User:', user.username);
      navigate('/favorites');
    }
  };

  // Mobile Auth Handler
  const handleMobileLogout = async (): Promise<void> => {
    try {
      console.log('🚪 Mobile Logout...');
      await logoutUser();
      logout();
      console.log('✅ Mobile Logout erfolgreich!');
    } catch (error) {
      console.error('❌ Mobile Logout-Fehler:', error);
      logout();
    }
  };

  // Mobile Location Handler  
  const handleMobileLocationToggle = async () => {
    if (!isLocationEnabled) {
      console.log('🗺️ Mobile: Standorterkennung aktivieren...');
      try {
        await enableLocation();
        console.log('✅ Mobile: Location erfolgreich aktiviert');
      } catch (error) {
        console.error('❌ Mobile: Fehler beim Aktivieren der Location:', error);
      }
    } else {
      console.log('🚫 Mobile: Standorterkennung deaktivieren...');
      disableLocation();
      console.log('✅ Mobile: Location erfolgreich deaktiviert');
    }
  };

  return (
      <div className="h-screen flex flex-col md:flex-row bg-gray-50 overflow-hidden">
        {/* Mobile Top Bar - nur bei sm und kleiner */}
        <div className="md:hidden bg-white border-b border-gray-200 flex items-center justify-between p-4 z-50">
          {/* Linke Seite: Burger Menu + Logo */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="p-2 text-coffee-brown hover:text-coffee-darkBrown transition-colors"
            >
              <span className="text-xl">☰</span>
            </button>
            <Link to="/" className="text-lg font-bold text-coffee-cream flex items-center">
              ☕ CoffeeSpots
            </Link>
          </div>
          
          {/* Rechte Seite: Auth + Location */}
          <div className="flex items-center space-x-3">
            {/* Auth Button */}
            {user ? (
              <button
                onClick={handleMobileLogout}
                className="w-10 h-10 bg-coffee-brown hover:bg-coffee-darkBrown rounded-full flex items-center justify-center transition-colors"
                title={`Abmelden (${user.username})`}
              >
                <span className="text-sm font-bold text-white">
                  {user.username[0].toUpperCase()}
                </span>
              </button>
            ) : (
              <Link
                to={loginUrl}
                className="w-10 h-10 bg-coffee-brown hover:bg-coffee-darkBrown rounded-full flex items-center justify-center transition-colors"
                title="Anmelden"
              >
                <span className="text-sm text-white">👤</span>
              </Link>
            )}
            
            {/* Location Button */}
            <button
              onClick={handleMobileLocationToggle}
              disabled={isLocationLoading}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors relative ${
                isLocationEnabled ? 'bg-coffee-brown hover:bg-coffee-darkBrown' : 'bg-gray-400 hover:bg-gray-500'
              }`}
              title={`Standorterkennung ${isLocationEnabled ? 'deaktivieren' : 'aktivieren'}`}
            >
              <span className="text-lg">📍</span>
              {isLocationLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Linke Sidebar: Coffee Spots */}
        <div className={`flex-shrink-0 overflow-y-auto overflow-x-hidden transition-transform duration-300 ${
          isMobileSidebarOpen 
            ? 'md:relative md:translate-x-0 fixed inset-y-0 left-0 translate-x-0 z-50' 
            : 'md:relative md:translate-x-0 fixed inset-y-0 left-0 -translate-x-full'
        } md:block`}>
          <CoffeeSpotSidebar
              coffeeSpots={coffeeSpots}
              onSpotClick={(spot) => {
                setSelectedSpotId(spot.id);
                handleSpotClick(spot);
                // Mobile: Sidebar nach Spot-Click schließen
                setIsMobileSidebarOpen(false);
              }}
              isLoadingCafes={isLoadingCafes}
              searchRadius={SEARCH_RADIUS_KM}
              hasUserLocation={userLocation !== null}
              selectedSpotId={selectedSpotId}
          />
        </div>

        {/* Mittlere Sektion: Map mit Zoom-Verhalten */}
        <div className="flex-1 relative overflow-hidden">
          {/* Loading Overlay - nur während showMap false */}
          {!showMap && (
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-50">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-coffee-brown border-t-transparent mx-auto mb-4"></div>
                  <p className="text-gray-700 text-lg font-medium">Map wird initialisiert...</p>
                  <p className="text-gray-500 text-sm mt-2">Einen Moment bitte</p>
                </div>
              </div>
          )}

          {/* Map - nur anzeigen wenn ready */}
          {showMap && (
              <InteractiveMap
                  coffeeSpots={coffeeSpots}
                  center={mapCenter}
                  zoom={13}
                  userLocation={userLocation}
                  selectedSpotId={selectedSpotId}
                  onSpotClick={(spot) => {
                    setSelectedSpotId(spot.id);
                  }}
              />
          )}

          {/* Map schließen Button */}
          <button
              onClick={handleCloseMap}
              className="absolute bottom-6 left-6 bg-gradient-to-r from-coffee-brown to-coffee-darkBrown hover:from-coffee-darkBrown hover:to-coffee-brown text-white font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 z-[1000] w-14 h-14 p-0 flex items-center justify-center lg:w-auto lg:h-auto lg:px-8 lg:py-3 rounded-full"
              title="Map schließen"
          >
            <span className="block lg:hidden text-xl">✖️</span>
            <span className="hidden lg:block">Map schließen</span>
          </button>

          {/* Favoriten Button - rechte untere Ecke */}
          <button
              onClick={handleFavoritesClick}
              className={`absolute bottom-6 right-6 shadow-lg transition-all duration-200 z-[1000] border text-white font-medium w-14 h-14 p-0 flex items-center justify-center lg:w-auto lg:h-auto lg:px-4 lg:py-2 rounded-full ${
                  user
                      ? 'bg-green-500 hover:bg-green-600 border-green-600'
                      : 'bg-red-500 hover:bg-red-600 border-red-600'
              }`}
              title={user ? 'Favoriten anzeigen' : 'Anmelden erforderlich'}
          >
             <span className="block lg:hidden text-xl">⭐</span>
             <span className="hidden lg:block">Favoriten anzeigen</span>
          </button>
        </div>

        {/* Rechte Sidebar: Authentication & Standort - nur ab md */}
        <div className="flex-shrink-0 overflow-hidden hidden md:block">
          <RightSidebar
              onLocationChange={handleLocationChange}
              onUserLocationUpdate={handleUserLocationUpdate}
          />
        </div>
      </div>
  );
};

export default MapPage;