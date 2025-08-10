import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import InteractiveMap from '../components/map/InteractiveMap';
import CoffeeSpotSidebar from '../components/map/CoffeeSpotSidebar';
import RightSidebar from '../components/map/RightSidebar';
import { loadNearbyCafes, NearbyCafe } from '../services/overpassApi';

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
}

const MapPage: React.FC = () => {
  const navigate = useNavigate();
  const [mapCenter, setMapCenter] = useState<[number, number]>([52.5200, 13.4050]); // Berlin
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [nearbyCafes, setNearbyCafes] = useState<CoffeeSpot[]>([]);
  const [isLoadingCafes, setIsLoadingCafes] = useState(false);
  const mapRef = useRef<any>(null);

  // Konfigurierbare Parameter für Café-Suche
  const SEARCH_RADIUS_KM = 10;
  const MAX_CAFES = 10;

  // Coffee Spots: Nur echte Café-Daten von der Overpass API
  const coffeeSpots: CoffeeSpot[] = nearbyCafes;

  const handleLocationChange = (newLocation: [number, number]) => {
    console.log('🗺️ Map wird auf neue Position zentriert:', newLocation);
    setMapCenter(newLocation);
  };

  const handleUserLocationUpdate = async (location: [number, number] | null) => {
    console.log('📍 User-Standort aktualisiert:', location);
    setUserLocation(location);
    
    // Automatisch Cafés in der Nähe laden, wenn Standort aktiviert wird
    if (location) {
      await loadNearbyCafesLocal(location[0], location[1]);
    } else {
      // Wenn Standort deaktiviert wird, zurück zu Demo-Daten
      setNearbyCafes([]);
    }
  };

  /**
   * Lädt Cafés in der Nähe des angegebenen Standorts
   */
  const loadNearbyCafesLocal = async (lat: number, lng: number) => {
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
        rating: 4.0, // Default rating, könnte später aus anderen APIs geholt werden
        lat: cafe.lat,
        lng: cafe.lng,
        isOpen: true, // Default: geöffnet (könnte später aus Öffnungszeiten ermittelt werden)
        distance: calculateDistance(lat, lng, cafe.lat, cafe.lng),
        priceLevel: 2 // Default Preisniveau
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
  };

  /**
   * Berechnet die Entfernung zwischen zwei Punkten und formatiert sie
   */
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): string => {
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
  };

  const toRadians = (degrees: number): number => {
    return degrees * (Math.PI / 180);
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

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Linke Sidebar: Coffee Spots */}
      <CoffeeSpotSidebar
        coffeeSpots={coffeeSpots}
        onSpotClick={handleSpotClick}
        isLoadingCafes={isLoadingCafes}
        searchRadius={SEARCH_RADIUS_KM}
        hasUserLocation={userLocation !== null}
      />

      {/* Mittlere Sektion: Map */}
      <div className="flex-1 relative">
        <InteractiveMap
          coffeeSpots={coffeeSpots}
          center={mapCenter}
          zoom={13}
          userLocation={userLocation}
        />
        
        {/* Close Map Button */}
        <button
          onClick={handleCloseMap}
          className="absolute bottom-6 left-6 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-full shadow-lg transition-all duration-200 z-[1000] border border-gray-200"
        >
          Close Map
        </button>
      </div>

      {/* Rechte Sidebar: Authentication & Standort */}
                  <RightSidebar 
              onLocationChange={handleLocationChange} 
              onUserLocationUpdate={handleUserLocationUpdate}
            />
    </div>
  );
};

export default MapPage;
