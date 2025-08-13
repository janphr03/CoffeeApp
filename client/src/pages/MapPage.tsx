import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import InteractiveMap from '../components/map/InteractiveMap';
import CoffeeSpotSidebar from '../components/map/CoffeeSpotSidebar';
import RightSidebar from '../components/map/RightSidebar';
import { loadNearbyCafes, NearbyCafe } from '../services/overpassApi';
import { useAuth } from '../contexts/AuthContext';
import { useUserLocation } from '../contexts/LocationContext';

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

  useEffect(() => {
    // Einfach 300ms warten, dann Map rendern
    const timer = setTimeout(() => {
      setShowMap(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const navigate = useNavigate();
  const { user } = useAuth();
  const { userLocation, isLocationEnabled } = useUserLocation();
  const [mapCenter, setMapCenter] = useState<[number, number]>([52.5200, 13.4050]); // Berlin
  const [nearbyCafes, setNearbyCafes] = useState<CoffeeSpot[]>([]);
  const [isLoadingCafes, setIsLoadingCafes] = useState(false);
  const [selectedSpotId, setSelectedSpotId] = useState<number | null>(null);
  const mapRef = useRef<any>(null);

  // Konfigurierbare Parameter für Café-Suche
  const SEARCH_RADIUS_KM = 10;
  const MAX_CAFES = 10;

  /**
   * Konvertiert Grad in Radianten
   */
  const toRadians = useCallback((degrees: number): number => {
    return degrees * (Math.PI / 180);
  }, []);

  /**
   * Berechnet die Entfernung zwischen zwei Punkten und formatiert sie
   */
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

  /**
   * Lädt Cafés in der Nähe des angegebenen Standorts
   */
  const loadNearbyCafesLocal = useCallback(async (lat: number, lng: number) => {
    setIsLoadingCafes(true);
    try {
      console.log(`🔍 Lade Cafés in ${SEARCH_RADIUS_KM}km Radius um [${lat}, ${lng}]...`);

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
      console.log(`✅ ${convertedCafes.length} Cafés erfolgreich geladen`);

    } catch (error) {
      console.error('❌ Fehler beim Laden der Cafés:', error);
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
      console.log('📍 Location Context aktiviert, lade Cafés für:', userLocation);
      setMapCenter(userLocation);

      // **WICHTIG: Café-Loading throtteln um 429-Fehler zu vermeiden**
      const timer = setTimeout(() => {
        loadNearbyCafesLocal(userLocation[0], userLocation[1]);
      }, 1000); // 1 Sekunde Verzögerung

      return () => clearTimeout(timer);
    } else if (!isLocationEnabled) {
      console.log('📍 Location Context deaktiviert, zurück zu Default');
      setMapCenter([52.5200, 13.4050]); // Berlin
      setNearbyCafes([]);
    }
  }, [isLocationEnabled, userLocation, loadNearbyCafesLocal]); // Alle Dependencies hinzugefügt

  // **ENTFERNT: handleLocationChange und handleUserLocationUpdate werden nicht mehr verwendet**
  // Der LocationContext verwaltet alles zentral
  const handleLocationChange = (newLocation: [number, number]) => {
    // Diese Funktion wird nicht mehr verwendet, da LocationContext direkt mapCenter setzt
    console.log('🗺️ Map-Position Callback (wird ignoriert):', newLocation);
  };

  const handleUserLocationUpdate = async (location: [number, number] | null) => {
    // Diese Funktion wird nicht mehr verwendet, da LocationContext direkt verwaltet wird
    console.log('📍 User-Location Callback (wird ignoriert):', location);
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
      console.log('⭐ User eingeloggt, weiterleitung zu Favoriten für User:', user.username);
      navigate('/favorites');
    }
  };

  return (
      <div className="h-screen flex bg-gray-50 overflow-hidden">
        {/* Linke Sidebar: Coffee Spots mit eigenem Scroll */}
        <div className="flex-shrink-0 overflow-y-auto overflow-x-hidden">
          <CoffeeSpotSidebar
              coffeeSpots={coffeeSpots}
              onSpotClick={(spot) => {
                setSelectedSpotId(spot.id);
                handleSpotClick(spot);
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
              className="absolute bottom-6 left-6 bg-gradient-to-r from-coffee-brown to-coffee-darkBrown hover:from-coffee-darkBrown hover:to-coffee-brown text-white font-semibold px-8 py-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 z-[1000]"
          >
            Map schließen
          </button>

          {/* Favoriten Button - rechte untere Ecke */}
          <button
              onClick={handleFavoritesClick}
              className={`absolute bottom-6 right-6 px-4 py-2 rounded-full shadow-lg transition-all duration-200 z-[1000] border text-white font-medium ${
                  user
                      ? 'bg-green-500 hover:bg-green-600 border-green-600'
                      : 'bg-red-500 hover:bg-red-600 border-red-600'
              }`}
              title={user ? 'Favoriten anzeigen' : 'Anmelden erforderlich'}
          >
            ⭐ Favoriten anzeigen
          </button>
        </div>

        {/* Rechte Sidebar: Authentication & Standort ohne Scroll */}
        <div className="flex-shrink-0 overflow-hidden">
          <RightSidebar
              onLocationChange={handleLocationChange}
              onUserLocationUpdate={handleUserLocationUpdate}
          />
        </div>
      </div>
  );
};

export default MapPage;