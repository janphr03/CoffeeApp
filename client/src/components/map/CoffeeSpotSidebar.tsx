import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { OpeningHoursService, OpeningHoursStatus } from '../../services/openingHoursService';
import { useFavoritesCount } from '../../hooks/useFavoritesCount';
import { FavoritesCountDisplay } from '../common/FavoritesCountDisplay';
import { generateSpotId, generateAddSpotData } from '../../utils/spotIdUtils';

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
  // OSM properties für Favoriten
  osmType?: 'node' | 'way' | 'relation';
  osmId?: number;
  amenity?: string;
  tags?: Record<string, string>;
}

interface CoffeeSpotSidebarProps {
  coffeeSpots: CoffeeSpot[];
  onSpotClick: (spot: CoffeeSpot) => void;
  isLoadingCafes?: boolean;
  searchRadius?: number;
  hasUserLocation?: boolean;
  selectedSpotId?: number | null;
}

const CoffeeSpotSidebar: React.FC<CoffeeSpotSidebarProps> = ({ 
  coffeeSpots, 
  onSpotClick,
  isLoadingCafes = false,
  searchRadius = 2,
  hasUserLocation = false,
  selectedSpotId
}) => {
  const { user } = useAuth();
  const { addToFavorites, removeFromFavorites, isFavorited } = useFavorites();

  const handleFavoriteClick = async (spot: CoffeeSpot, event: React.MouseEvent) => {
    event.stopPropagation(); // Verhindert das Auslösen von onSpotClick
    
    if (!user) {
      // User ist nicht eingeloggt - Hinweis anzeigen
      alert('Sie müssen sich anmelden oder registrieren, um dieses Café zu Ihren Favoriten hinzuzufügen.');
      return;
    }

    // Erstelle eindeutige Spot-ID für OSM-Daten
    const spotId = generateSpotId(spot);
    
    try {
      if (isFavorited(spotId)) {
        // Spot ist bereits favorisiert - entfernen
        const success = await removeFromFavorites(spotId);
        if (!success) {
          alert('Fehler beim Entfernen aus Favoriten.');
        }
      } else {
        // Spot zu Favoriten hinzufügen
        const spotData = generateAddSpotData(spot);
        const success = await addToFavorites(spotData);
        
        if (!success) {
          alert('Fehler beim Hinzufügen zu Favoriten.');
        }
      }
    } catch (error) {
      console.error('Fehler bei Favoriten-Operation:', error);
      alert('Ein Fehler ist aufgetreten.');
    }
  };

  const NoLocationPrompt = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="bg-blue-50 rounded-lg p-8 mb-4 w-full">
        <div className="text-6xl text-blue-400 mb-4">📍</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Standort erforderlich
        </h3>
        <p className="text-gray-500 text-sm">
          Aktivieren Sie Ihren Standort, um Cafés in Ihrer Nähe zu entdecken
        </p>
      </div>
      <div className="bg-gray-100 rounded-lg p-6 w-full">
        <div className="text-4xl text-gray-400 mb-2">➡️</div>
        <p className="text-gray-500 text-xs">
          Nutzen Sie den Standort-Schalter rechts
        </p>
      </div>
    </div>
  );

  const CoffeeSpotsList = () => (
    <div className="h-full overflow-y-auto">
      {/* Ladeindikator */}
      {isLoadingCafes && (
        <div className="p-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-coffee-brown">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-coffee-brown"></div>
            <span className="text-sm">Suche Cafés in der Nähe...</span>
          </div>
        </div>
      )}

      {/* Info über Datenquelle */}
      {hasUserLocation && !isLoadingCafes && coffeeSpots.length > 0 && (
        <div className="p-4 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center space-x-2 text-blue-700">
            <span className="text-sm">📍</span>
            <span className="text-xs">
              {coffeeSpots.length} Cafés in {searchRadius}km Umkreis gefunden
            </span>
          </div>
        </div>
      )}

      <div className="p-4 space-y-3">
        {coffeeSpots.map((spot) => {
          // Öffnungszeiten-Status berechnen
          const openingStatus: OpeningHoursStatus = OpeningHoursService.evaluateOpeningHours(spot.openingHours);
          
          // Spot-ID für Favoriten erstellen
          const spotId = generateSpotId(spot);
          const isSpotFavorited = isFavorited(spotId);
          
          return (
          <div
            key={spot.id}
            className={`bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 cursor-pointer transition-colors relative ${
              selectedSpotId === spot.id ? 'selected-spot' : ''
            } ${isSpotFavorited ? 'ring-2 ring-yellow-400' : ''}`}
            onClick={() => onSpotClick(spot)}
          >
            {/* Favoriten-Button */}
            <button
              onClick={(e) => handleFavoriteClick(spot, e)}
              className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold transition-colors ${
                !user 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : isSpotFavorited
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-green-500 hover:bg-green-600'
              }`}
              title={
                !user 
                  ? 'Anmelden erforderlich' 
                  : isSpotFavorited 
                  ? 'Aus Favoriten entfernen' 
                  : 'Zu Favoriten hinzufügen'
              }
              style={{ fontSize: '18px', lineHeight: '1', paddingBottom: '5px' }}
            >
              {!user ? '+' : isSpotFavorited ? '−' : '+'}
            </button>

            <div className="flex justify-between items-start mb-2 pr-10">
              <h3 className="font-semibold text-gray-800 text-sm">
                {spot.name}
              </h3>
              <FavoritesCountDisplay 
                spotId={generateSpotId(spot)}
              />
            </div>
            
            <p className="text-xs text-gray-600 mb-2">
              {spot.address}
            </p>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                {spot.distance && (
                  <span className="text-xs text-gray-500">
                    {spot.distance}
                  </span>
                )}
                {spot.priceLevel && (
                  <span className="text-xs text-gray-500">
                    {'€'.repeat(spot.priceLevel)}
                  </span>
                )}
              </div>
              <span className={`text-xs px-2 py-1 rounded ${
                openingStatus.status === 'open'
                  ? 'bg-green-100 text-green-800' 
                  : openingStatus.status === 'closed'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {openingStatus.statusText}
              </span>
            </div>
          </div>
          );
        })}
        
        {/* Keine Cafés gefunden */}
        {!isLoadingCafes && coffeeSpots.length === 0 && hasUserLocation && (
          <div className="text-center p-8">
            <div className="text-4xl text-gray-400 mb-4">☕</div>
            <p className="text-gray-600 text-sm mb-2">
              Keine Cafés in {searchRadius}km Umkreis gefunden
            </p>
            <p className="text-gray-500 text-xs">
              Versuchen Sie einen anderen Standort
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-full flex flex-col">
      {/* Header mit Logo (da obere Navigation entfernt wurde) */}
      <div className="p-4 border-b border-gray-200 text-center">
        <Link to="/" className="inline-block mb-3">
          <div className="text-2xl font-bold text-coffee-cream">
            ☕ CoffeeSpots
          </div>
        </Link>
        <h2 className="text-lg font-semibold text-gray-800">
          Cafés in der Nähe
        </h2>
        {hasUserLocation && (
          <p className="text-sm text-gray-600 mt-1">
            {coffeeSpots.length} Cafés gefunden
          </p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {hasUserLocation ? <CoffeeSpotsList /> : <NoLocationPrompt />}
      </div>
    </div>
  );
};

export default CoffeeSpotSidebar;