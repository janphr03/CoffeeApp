import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import InteractiveMap from '../components/map/InteractiveMap';
import FavoritesSidebar from '../components/map/FavoritesSidebar';
import RightSidebar from '../components/map/RightSidebar';
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
}

const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userLocation, isLocationEnabled } = useUserLocation();
  const [mapCenter, setMapCenter] = useState<[number, number]>([52.5200, 13.4050]); // Berlin
  const [favoriteSpots, setFavoriteSpots] = useState<CoffeeSpot[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);

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
   * Lädt die Favoriten des eingeloggten Benutzers
   */
  const loadUserFavorites = useCallback(async () => {
    if (!user) {
      console.log('👤 Kein User eingeloggt, keine Favoriten geladen');
      setFavoriteSpots([]);
      return;
    }

    setIsLoadingFavorites(true);
    try {
      console.log('⭐ Lade Favoriten für User:', user.username);
      
      // TODO: API-Call zum Backend um Favoriten zu laden
      // Placeholder: Mock-Daten für Entwicklung
      const mockFavorites: CoffeeSpot[] = [
        {
          id: 1,
          name: "Café Central",
          address: "Unter den Linden 1, Berlin",
          rating: 4.5,
          lat: 52.5170,
          lng: 13.3889,
          isOpen: true,
          distance: userLocation ? calculateDistance(userLocation[0], userLocation[1], 52.5170, 13.3889) : "unbekannt",
          priceLevel: 2,
          openingHours: "Mo-Fr 07:00-19:00"
        },
        {
          id: 2,
          name: "Roastery Coffee",
          address: "Friedrichstr. 45, Berlin", 
          rating: 4.8,
          lat: 52.5069,
          lng: 13.3892,
          isOpen: true,
          distance: userLocation ? calculateDistance(userLocation[0], userLocation[1], 52.5069, 13.3892) : "unbekannt",
          priceLevel: 3,
          openingHours: "Mo-Sa 08:00-18:00"
        }
      ];

      setFavoriteSpots(mockFavorites);
      console.log(`✅ ${mockFavorites.length} Favoriten erfolgreich geladen`);
      
    } catch (error) {
      console.error('❌ Fehler beim Laden der Favoriten:', error);
      setFavoriteSpots([]);
    } finally {
      setIsLoadingFavorites(false);
    }
  }, [user, userLocation, calculateDistance]);

  // **Location Context synchronisieren**
  useEffect(() => {
    if (isLocationEnabled && userLocation) {
      console.log('📍 Location Context aktiviert, setze Map Center:', userLocation);
      setMapCenter(userLocation);
    } else if (!isLocationEnabled) {
      console.log('📍 Location Context deaktiviert, zurück zu Default');
      setMapCenter([52.5200, 13.4050]); // Berlin
    }
  }, [isLocationEnabled, userLocation]);

  // **Favoriten beim Laden der Seite und bei User-Änderungen laden**
  useEffect(() => {
    loadUserFavorites();
  }, [loadUserFavorites]);

  const handleSpotClick = (spot: CoffeeSpot) => {
    // Karte zu dem angeklickten Spot zentrieren
    console.log('📍 Klick auf Favorit:', spot.name);
    setMapCenter([spot.lat, spot.lng]);
  };

  /**
   * Entfernt einen Spot aus den Favoriten (Placeholder)
   */
  const handleRemoveFromFavorites = (spotId: number) => {
    console.log('🗑️ Entferne Spot aus Favoriten:', spotId);
    
    // TODO: API-Call zum Backend um Favorit zu entfernen
    // Placeholder: Lokale Aktualisierung
    setFavoriteSpots(prev => prev.filter(spot => spot.id !== spotId));
    
    // TODO: Success/Error Handling
    console.log('✅ Spot erfolgreich aus Favoriten entfernt');
  };

  /**
   * Öffnet Dialog zum Hinzufügen neuer Favoriten (Placeholder)
   */
  const handleAddNewFavorite = () => {
    console.log('➕ Öffne Dialog zum Hinzufügen neuer Favoriten');
    
    // TODO: Modal/Dialog öffnen mit Spot-Suche
    // Placeholder: Einfacher Alert
    alert('Favoriten hinzufügen - Feature kommt in der nächsten Version!');
  };

  /**
   * Navigation zurück zur Startseite
   */
  const handleCloseMap = () => {
    console.log('🏠 Navigiere zurück zur Startseite');
    navigate('/');
  };

  /**
   * Navigation zurück zur Map-Seite
   */
  const handleCloseFavorites = () => {
    console.log('🗺️ Navigiere zurück zur Map-Seite');
    navigate('/map');
  };

  // Redirect wenn nicht eingeloggt
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Anmeldung erforderlich</h2>
          <p className="text-gray-600 mb-6">Sie müssen angemeldet sein, um Ihre Favoriten zu sehen.</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Zur Anmeldung
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Hauptcontainer für Sidebar und Map */}
      <div className="flex h-full">
        {/* Linke Sidebar - Favoriten */}
        <FavoritesSidebar
          favorites={favoriteSpots}
          onSpotClick={handleSpotClick}
          onRemoveFromFavorites={handleRemoveFromFavorites}
          onAddNewFavorite={handleAddNewFavorite}
          isLoading={isLoadingFavorites}
        />

        {/* Map Container */}
        <div className="flex-1 relative">
          <InteractiveMap 
            center={mapCenter}
            zoom={13}
            coffeeSpots={favoriteSpots}
            userLocation={userLocation}
          />

          {/* Map Controls - Unten Links: Zurück zur Startseite */}
          <div className="absolute bottom-6 left-6 z-[1000]">
            <button
              onClick={handleCloseMap}
              className="bg-gradient-to-r from-coffee-brown to-coffee-darkBrown hover:from-coffee-darkBrown hover:to-coffee-brown text-white font-semibold px-8 py-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Map schließen
            </button>
          </div>

          {/* Map Controls - Unten Rechts: Zurück zur Map */}
          <div className="absolute bottom-6 right-6 z-[1000]">
            <button
              onClick={handleCloseFavorites}
              className="bg-green-500 hover:bg-green-600 border-green-600 px-4 py-2 rounded-full shadow-lg transition-all duration-200 border text-white font-medium"
              title="Zurück zur Map-Seite"
            >
              ⭐ Favoriten schließen
            </button>
          </div>
        </div>

        {/* Rechte Sidebar - Location Toggle */}
        <RightSidebar />
      </div>
    </div>
  );
};

export default FavoritesPage;
