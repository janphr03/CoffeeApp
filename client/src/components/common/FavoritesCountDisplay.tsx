// Komponente für die Anzeige der Favoriten-Anzahl (ersetzt Rating)
import React from 'react';
import { useFavoritesCount } from '../../hooks/useFavoritesCount';

interface FavoritesCountDisplayProps {
  spotId: string;
  className?: string;
}

export const FavoritesCountDisplay: React.FC<FavoritesCountDisplayProps> = ({ 
  spotId, 
  className = "" 
}) => {
  const { favoritesCount, loading, error } = useFavoritesCount(spotId);

  if (loading) {
    return (
      <div className={`flex items-center ${className}`}>
        <span className="text-yellow-500 text-sm">★</span>
        <span className="ml-1 text-sm font-semibold text-gray-400">
          ...
        </span>
      </div>
    );
  }

  if (error) {
    // Bei Fehler zeige 0 Favoriten
    return (
      <div className={`flex items-center ${className}`}>
        <span className="text-yellow-500 text-sm">★</span>
        <span className="ml-1 text-sm font-semibold text-gray-700">
          0
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      <span className="text-yellow-500 text-sm">★</span>
      <span className="ml-1 text-sm font-semibold text-gray-700">
        {favoritesCount}
      </span>
    </div>
  );
};
