import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { OpeningHoursService, OpeningHoursStatus } from '../../services/openingHoursService';

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

interface FavoritesSidebarProps {
  favorites: CoffeeSpot[];
  onSpotClick: (spot: CoffeeSpot) => void;
  onRemoveFromFavorites: (spotId: number) => void;
  onAddNewFavorite: () => void;
  isLoading?: boolean;
}

const FavoritesSidebar: React.FC<FavoritesSidebarProps> = ({ 
  favorites, 
  onSpotClick,
  onRemoveFromFavorites,
  onAddNewFavorite,
  isLoading = false
}) => {
  const { user } = useAuth();

  const handleRemoveClick = (spotId: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Verhindert das Auslösen von onSpotClick
    onRemoveFromFavorites(spotId);
  };

  const renderPriceLevel = (level?: number) => {
    if (!level) return null;
    
    const euros = [];
    for (let i = 0; i < level; i++) {
      euros.push(<span key={i} className="text-green-600">€</span>);
    }
    
    while (euros.length < 3) {
      euros.push(<span key={euros.length} className="text-gray-300">€</span>);
    }
    
    return euros;
  };

  const getOpeningStatus = (openingHours?: string): OpeningHoursStatus => {
    return OpeningHoursService.evaluateOpeningHours(openingHours);
  };

  return (
    <div className="w-80 bg-white shadow-lg overflow-hidden flex flex-col h-full">
      {/* Logo Section */}
      <div className="p-4 border-b border-gray-200 text-center">
        <Link to="/" className="inline-block mb-3">
          <div className="text-2xl font-bold text-coffee-cream">
            ☕ CoffeeSpots
          </div>
        </Link>
      </div>
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Meine Favoriten</h1>
            <p className="text-blue-100 mt-1">
              {user ? `${favorites.length} gespeicherte Spots` : 'Anmeldung erforderlich'}
            </p>
          </div>
          <div className="text-3xl">⭐</div>
        </div>
      </div>

      {/* Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {/* User Status */}
        {!user && (
          <div className="p-4 bg-yellow-50 border-b border-yellow-200">
            <p className="text-yellow-800 text-sm">
              <Link to="/login" className="text-yellow-600 hover:text-yellow-700 font-medium">
                Melden Sie sich an
              </Link>
              , um Ihre Favoriten zu sehen.
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Favoriten werden geladen...</p>
          </div>
        )}

        {/* No Favorites State */}
        {!isLoading && user && favorites.length === 0 && (
          <div className="p-6 text-center">
            <div className="text-6xl mb-4">☕</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Noch keine Favoriten</h3>
            <p className="text-gray-600 text-sm">
              Entdecken Sie tolle Cafés auf der Karte und fügen Sie sie zu Ihren Favoriten hinzu!
            </p>
          </div>
        )}

        {/* Favorites List */}
        {!isLoading && user && favorites.length > 0 && (
          <div className="p-4 space-y-3">
            {favorites.map((spot) => {
              const openingStatus = getOpeningStatus(spot.openingHours);
              
              return (
                <div
                  key={spot.id}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 cursor-pointer transition-colors relative"
                  onClick={() => onSpotClick(spot)}
                >
                  {/* Remove Button */}
                  <button
                    onClick={(e) => handleRemoveClick(spot.id, e)}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors font-bold"
                    title="Aus Favoriten entfernen"
                    style={{ fontSize: '18px', lineHeight: '1', paddingBottom: '5px' }}
                  >
                    −
                  </button>

                  <div className="flex justify-between items-start mb-2 pr-10">
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
                        <div className="flex items-center">
                          {renderPriceLevel(spot.priceLevel)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center">
                      <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                        openingStatus.isOpen ? 'bg-green-400' : 'bg-red-400'
                      }`}></span>
                      <span className={`text-xs ${
                        openingStatus.isOpen ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {openingStatus.isOpen ? 'Geöffnet' : 'Geschlossen'}
                      </span>
                    </div>
                  </div>

                  {/* Opening Hours */}
                  {spot.openingHours && (
                    <div className="mt-2 text-xs text-gray-500">
                      🕒 {spot.openingHours}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sticky Add Button at Bottom */}
      {user && (
        <div className="border-t border-gray-200 p-4 bg-white">
          <button
            onClick={onAddNewFavorite}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-lg">+</span>
            <span>Spot hinzufügen</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default FavoritesSidebar;
