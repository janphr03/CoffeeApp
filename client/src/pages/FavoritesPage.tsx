import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import InteractiveMap from '../components/map/InteractiveMap';
import FavoritesSidebar from '../components/map/FavoritesSidebar';
import RightSidebar from '../components/map/RightSidebar';
import { useAuth } from '../contexts/AuthContext';
import { useUserLocation } from '../contexts/LocationContext';
import { useFavorites, FavoriteSpot } from '../contexts/FavoritesContext';
import { useAuthRedirect } from '../hooks/useAuthRedirect';
import { logoutUser } from '../services/api';

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
  const { user, logout } = useAuth();
  const { userLocation, isLocationEnabled, enableLocation, disableLocation, isLoading } = useUserLocation();
  const { favoriteSpots: dbFavorites, isLoading: isLoadingFavorites, removeFromFavorites } = useFavorites();
  const { loginUrl } = useAuthRedirect();
  const [mapCenter, setMapCenter] = useState<[number, number]>([52.5200, 13.4050]); // Berlin
  const [favoriteSpots, setFavoriteSpots] = useState<CoffeeSpot[]>([]);
  
  // Mobile state management
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Toggle mobile sidebar
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Close mobile sidebar when clicking on a spot
  const handleSpotClickWithClose = (spot: CoffeeSpot) => {
    handleSpotClick(spot);
    setIsMobileSidebarOpen(false);
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
    // Extrahiere ID aus der _id (Format: "userId:osmType:osmId")
    const idParts = favorite._id.split(':');
    // Skip userId, nimm osmType und osmId
    const osmType = idParts[1] as 'node' | 'way' | 'relation';
    const osmId = parseInt(idParts[2]) || 0;
    const spotId = osmId; // Für Kompatibilität
    
    // Berechne Entfernung wenn User-Location verfügbar
    let distance: string | undefined;
    if (userLat && userLng) {
      distance = calculateDistance(userLat, userLng, favorite.lat, favorite.lon);
    }
    
    return {
      id: spotId,
      name: favorite.name,
      address: favorite.address,
      rating: 0, // Wird durch FavoritesCountDisplay ersetzt
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

    console.log('Verarbeite DB-Favoriten:', dbFavorites);
    
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
    console.log(`${sortedSpots.length} Favoriten verarbeitet und sortiert`);
  }, [dbFavorites, userLocation, convertFavoriteToSpot]);

  // **Location Context synchronisieren**
  useEffect(() => {
    if (isLocationEnabled && userLocation) {
      console.log('Location Context aktiviert, setze Map Center:', userLocation);
      setMapCenter(userLocation);
    } else if (!isLocationEnabled) {
      console.log('Location Context deaktiviert, zurück zu Default');
      setMapCenter([52.5200, 13.4050]); // Berlin
    }
  }, [isLocationEnabled, userLocation]);

  // DB-Favoriten verarbeiten wenn sie sich ändern
  useEffect(() => {
    processDbFavorites();
  }, [processDbFavorites]);

  const handleSpotClick = (spot: CoffeeSpot) => {
    // Karte zu dem angeklickten Spot zentrieren
    console.log('Klick auf Favorit:', spot.name);
    setMapCenter([spot.lat, spot.lng]);
  };

  // Entfernt einen Spot aus den Favoriten
  const handleRemoveFromFavorites = async (spotId: number) => {
    console.log('Entferne Spot aus Favoriten:', spotId);
    
    // Finde den Original-Favoriten-Eintrag um die richtige DB _id zu bekommen
    const favoriteEntry = dbFavorites.find(favorite => {
      const idParts = favorite._id.split(':');
      const osmId = parseInt(idParts[2]) || 0;
      return osmId === spotId;
    });
    
    if (!favoriteEntry) {
      console.error('Favoriten-Eintrag nicht gefunden für Spot-ID:', spotId);
      return;
    }
    
    // Extrahiere osmType:osmId aus der DB _id (entferne userId prefix)
    const idParts = favoriteEntry._id.split(':');
    const osmType = idParts[1];
    const osmId = idParts[2];
    const dbSpotId = `${osmType}:${osmId}`;
    
    console.log(`Entferne Favorit mit Spot-ID: "${dbSpotId}" (Original DB-ID: "${favoriteEntry._id}")`);
    
    const success = await removeFromFavorites(dbSpotId);
    if (!success) {
      alert('Fehler beim Entfernen des Favoriten');
    }
  };

  // Navigation zurück zur Startseite
  const handleCloseMap = () => {
    console.log('Navigiere zurück zur Startseite');
    navigate('/');
  };

  // Navigation zurück zur Map-Seite
  const handleCloseFavorites = () => {
    console.log('Navigiere zurück zur Map-Seite');
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
    <div className="h-screen flex flex-col md:flex-row bg-gray-50 overflow-hidden">
      {/* Mobile Top Bar - visible below md (768px) */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Burger Menu Button */}
          <button
            onClick={toggleMobileSidebar}
            className="p-2 text-coffee-brown hover:text-coffee-darkBrown transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {/* Logo */}
          <div className="text-lg font-bold text-coffee-cream">
            ☕ CoffeeSpots
          </div>
        </div>
        
        {/* Right side controls */}
        <div className="flex items-center space-x-3">
          {/* Location Button */}
          <button
            onClick={handleMobileLocationToggle}
            disabled={isLoading}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors relative ${
              isLocationEnabled ? 'bg-coffee-brown hover:bg-coffee-darkBrown' : 'bg-gray-400 hover:bg-gray-500'
            }`}
            title={`Standorterkennung ${isLocationEnabled ? 'deaktivieren' : 'aktivieren'}`}
          >
            <span className="text-lg">📍</span>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </button>
          
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
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar - Favorites */}
      <div className={`flex-shrink-0 overflow-y-auto overflow-x-hidden transition-transform duration-300 ${
        isMobileSidebarOpen 
          ? 'md:relative md:translate-x-0 fixed inset-y-0 left-0 translate-x-0 z-50' 
          : 'md:relative md:translate-x-0 fixed inset-y-0 left-0 -translate-x-full'
      } md:block`}>
        <FavoritesSidebar
          favorites={favoriteSpots}
          onSpotClick={handleSpotClickWithClose}
          onRemoveFromFavorites={handleRemoveFromFavorites}
          isLoading={isLoadingFavorites}
        />
      </div>
        
      {/* Map Container */}
      <div className="flex-1 relative overflow-hidden">
        <InteractiveMap 
          center={mapCenter}
          zoom={13}
          coffeeSpots={favoriteSpots}
          userLocation={userLocation}
        />

        {/* Map Controls - Bottom Left: Close Map */}
        <div className="absolute bottom-6 left-6 z-[1000]">
          <button
            onClick={handleCloseMap}
            className="bg-gradient-to-r from-coffee-brown to-coffee-darkBrown hover:from-coffee-darkBrown hover:to-coffee-brown text-white font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 w-14 h-14 p-0 flex items-center justify-center lg:w-auto lg:h-auto lg:px-8 lg:py-3 rounded-full"
            title="Map schließen"
          >
            <span className="lg:inline hidden">Map schließen</span>
            <span className="lg:hidden inline text-xl">🏠</span>
          </button>
        </div>

        {/* Map Controls - Bottom Right: Close Favorites */}
        <div className="absolute bottom-6 right-6 z-[1000]">
          <button
            onClick={handleCloseFavorites}
            className="bg-green-500 hover:bg-green-600 border-green-600 shadow-lg transition-all duration-200 border text-white font-medium w-14 h-14 p-0 flex items-center justify-center lg:w-auto lg:h-auto lg:px-4 lg:py-2 rounded-full"
            title="Zurück zur Map-Seite"
          >
            <span className="lg:inline hidden">Favoriten schließen</span>
            <span className="lg:hidden inline text-xl">🗺️</span>
          </button>
        </div>
      </div>

      {/* Right Sidebar - Hidden on mobile, visible from md up */}
      <div className="hidden md:block">
        <RightSidebar />
      </div>
    </div>
  );
};

export default FavoritesPage;
