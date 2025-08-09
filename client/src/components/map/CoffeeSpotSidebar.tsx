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
  isLoggedIn: boolean;
  coffeeSpots: CoffeeSpot[];
  onSpotClick: (spot: CoffeeSpot) => void;
}

const CoffeeSpotSidebar: React.FC<CoffeeSpotSidebarProps> = ({ 
  isLoggedIn, 
  coffeeSpots, 
  onSpotClick 
}) => {
  const LoginPrompt = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="bg-gray-100 rounded-lg p-8 mb-4 w-full">
        <div className="text-6xl text-gray-400 mb-4">🔒</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Anmeldung erforderlich
        </h3>
        <p className="text-gray-500 text-sm">
          Melden Sie sich an, um Coffee Spots in Ihrer Nähe zu entdecken
        </p>
      </div>
      <div className="bg-gray-100 rounded-lg p-8 mb-4 w-full">
        <div className="text-6xl text-gray-400 mb-4">🔒</div>
      </div>
      <div className="bg-gray-100 rounded-lg p-8 w-full">
        <div className="text-6xl text-gray-400 mb-4">🔒</div>
      </div>
    </div>
  );

  const CoffeeSpotsList = () => (
    <div className="h-full overflow-y-auto">
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
          Ihre Spots
        </h2>
        {isLoggedIn && (
          <p className="text-sm text-gray-600 mt-1">
            {coffeeSpots.length} Spots in Ihrer Nähe
          </p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1">
        {isLoggedIn ? <CoffeeSpotsList /> : <LoginPrompt />}
      </div>
    </div>
  );
};

export default CoffeeSpotSidebar;
