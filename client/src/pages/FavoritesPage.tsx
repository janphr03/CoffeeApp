import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import InteractiveMap from '../components/map/InteractiveMap';
import FavoritesSidebar from '../components/map/FavoritesSidebar';
import RightSidebar from '../components/map/RightSidebar';
import { useAuth } from '../contexts/AuthContext';
import { useUserLocation } from '../contexts/LocationContext';
import { useFavorites, FavoriteSpot } from '../contexts/FavoritesContext';

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
  const { favoriteSpots: dbFavorites, isLoading: isLoadingFavorites, removeFromFavorites } = useFavorites();
  const [mapCenter, setMapCenter] = useState<[number, number]>([52.5200, 13.4050]); // Berlin
  const [favoriteSpots, setFavoriteSpots] = useState<CoffeeSpot[]>([]);

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
   * Konvertiert FavoriteSpot zu CoffeeSpot Format
   */
  const convertFavoriteToSpot = useCallback((favorite: FavoriteSpot, userLat?: number, userLng?: number): CoffeeSpot => {
    // Extrahiere ID aus der _id (Format: "type:id")
    const idParts = favorite._id.split(':');
    const spotId = parseInt(idParts[1]) || 0;
    
    // Berechne Entfernung wenn User-Location verfügbar
    let distance: string | undefined;
    if (userLat && userLng) {
      distance = calculateDistance(userLat, userLng, favorite.lat, favorite.lon);
    }
    
    return {
      id: spotId,
      name: favorite.name,
      address: favorite.address,
      rating: 4.0, // Standard-Bewertung da nicht in DB gespeichert
      lat: favorite.lat,
      lng: favorite.lon,
      isOpen: true, // Standard-Wert
      distance,
      priceLevel: 2, // Standard-Preis-Level
      openingHours: favorite.tags.opening_hours || undefined
    };
  }, [calculateDistance]);

  /**
   * Konvertiert DB-Favoriten zu UI-Format und sortiert nach Entfernung
   */
  const processDbFavorites = useCallback(() => {
    if (!dbFavorites.length) {
      setFavoriteSpots([]);
      return;
    }

    console.log('🔄 Verarbeite DB-Favoriten:', dbFavorites);
    
    // Konvertiere zu CoffeeSpot Format
    const convertedSpots = dbFavorites.map(favorite => 
      convertFavoriteToSpot(
        favorite, 
        userLocation?.[0], 
        userLocation?.[1]
      )
    );

    // Sortiere nach Entfernung (wenn User-Location verfügbar)
    const sortedSpots = convertedSpots.sort((a, b) => {
      if (!a.distance || !b.distance) return 0;
      
      const distanceA = parseFloat(a.distance.replace('km', '').replace('m', '')) * 
                       (a.distance.includes('km') ? 1 : 0.001);
      const distanceB = parseFloat(b.distance.replace('km', '').replace('m', '')) * 
                       (b.distance.includes('km') ? 1 : 0.001);
      
      return distanceA - distanceB;
    });

    setFavoriteSpots(sortedSpots);
    console.log(`✅ ${sortedSpots.length} Favoriten verarbeitet und sortiert`);
  }, [dbFavorites, userLocation, convertFavoriteToSpot]);

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

  // **DB-Favoriten verarbeiten wenn sie sich ändern**
  useEffect(() => {
    processDbFavorites();
  }, [processDbFavorites]);

  const handleSpotClick = (spot: CoffeeSpot) => {
    // Karte zu dem angeklickten Spot zentrieren
    console.log('📍 Klick auf Favorit:', spot.name);
    setMapCenter([spot.lat, spot.lng]);
  };

  /**
   * Entfernt einen Spot aus den Favoriten
   */
  const handleRemoveFromFavorites = async (spotId: number) => {
    console.log('🗑️ Entferne Spot aus Favoriten:', spotId);
    
    // Finde den Spot um die richtige _id zu bekommen
    const spotToRemove = favoriteSpots.find(spot => spot.id === spotId);
    if (!spotToRemove) {
      console.error('Spot nicht gefunden:', spotId);
      return;
    }

    // Erstelle die Spot-ID im DB-Format
    const dbSpotId = `node:${spotId}`;
    
    const success = await removeFromFavorites(dbSpotId);
    if (!success) {
      alert('Fehler beim Entfernen des Favoriten');
    }
  };

  /**
   * Öffnet Dialog zum Hinzufügen neuer Favoriten (Placeholder)
   */
  const handleAddNewFavorite = () => {
    console.log('➕ Öffne Dialog zum Hinzufügen neuer Favoriten');
    navigate('/map');
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

        {/* Rechte Sidebar */}
        <RightSidebar />
      </div>
    </div>
  );
};

export default FavoritesPage;
