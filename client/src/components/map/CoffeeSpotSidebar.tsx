import React from 'react';
import { Link } from 'react-router-dom';

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

interface CoffeeSpotSidebarProps {
  coffeeSpots: CoffeeSpot[];
  onSpotClick: (spot: CoffeeSpot) => void;
  isLoadingCafes?: boolean;
  searchRadius?: number;
  hasUserLocation?: boolean;
}

const CoffeeSpotSidebar: React.FC<CoffeeSpotSidebarProps> = ({ 
  coffeeSpots, 
  onSpotClick,
  isLoadingCafes = false,
  searchRadius = 10,
  hasUserLocation = false
}) => {
  const NoLocationPrompt = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="bg-blue-50 rounded-lg p-8 mb-4 w-full">
        <div className="text-6xl text-blue-400 mb-4">�</div>
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
        {coffeeSpots.map((spot) => (
          <div
            key={spot.id}
            className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
            onClick={() => onSpotClick(spot)}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-800 text-sm">
                {spot.name}
              </h3>
              <div className="flex items-center">
                <span className="text-yellow-500 text-sm">★</span>
                <span className="ml-1 text-sm font-semibold text-gray-700">
                  {spot.rating}
                </span>
              </div>
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
                spot.isOpen 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {spot.isOpen ? 'Geöffnet' : 'Geschlossen'}
              </span>
            </div>
          </div>
        ))}
        
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
      <div className="p-4 border-b border-gray-200">
        <Link to="/" className="flex items-center mb-3">
          <div className="text-xl font-bold text-coffee-brown font-playfair">
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
      <div className="flex-1">
        {hasUserLocation ? <CoffeeSpotsList /> : <NoLocationPrompt />}
      </div>
    </div>
  );
};

export default CoffeeSpotSidebar;
