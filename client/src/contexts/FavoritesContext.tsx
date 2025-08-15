import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getFavoriteSpots, addSpotToFavorites, removeSpotFromFavorites } from '../services/api';

// Event für Favoriten-Anzahl-Updates
export const favoritesCountUpdatedEvent = new EventTarget();

// Spot-Interface (kompatibel mit CoffeeSpot)
interface FavoriteSpot {
  _id: string;
  userId: string;
  lat: number;
  lon: number;
  name: string;
  amenity: string;
  address: string;
  tags: Record<string, string>;
  addedAt: string;
  updatedAt: string;
}

// Spot-Data für das Hinzufügen von Favoriten
interface AddSpotData {
  osmType: 'node' | 'way' | 'relation';
  osmId: number;
  elementLat: number;
  elementLng: number;
  name: string;
  amenity: string;
  address: string;
  tags?: Record<string, string>;
}

interface FavoritesContextType {
  favoriteSpots: FavoriteSpot[];
  isLoading: boolean;
  error: string | null;
  addToFavorites: (spotData: AddSpotData) => Promise<boolean>;
  removeFromFavorites: (spotId: string) => Promise<boolean>;
  isFavorited: (spotId: string) => boolean;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [favoriteSpots, setFavoriteSpots] = useState<FavoriteSpot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Favoriten vom Backend laden
  const loadFavorites = async () => {
    if (!user) {
      setFavoriteSpots([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Lade Favoriten für User:', user.username);
      const response = await getFavoriteSpots();
      
      if (response.success) {
        console.log('Favoriten geladen:', response.spots);
        setFavoriteSpots(response.spots || []);
      } else {
        console.error('Fehler beim Laden der Favoriten:', response);
        setError('Fehler beim Laden der Favoriten');
        setFavoriteSpots([]);
      }
    } catch (error) {
      console.error('Exception beim Laden der Favoriten:', error);
      setError('Fehler beim Laden der Favoriten');
      setFavoriteSpots([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Spot zu Favoriten hinzufügen
  const addToFavorites = async (spotData: AddSpotData): Promise<boolean> => {
    if (!user) {
      setError('Sie müssen angemeldet sein');
      return false;
    }

    try {
      console.log('Füge Spot zu Favoriten hinzu:', spotData);
      const response = await addSpotToFavorites(spotData);

      if (response.success) {
        console.log('Spot zu Favoriten hinzugefügt');
        // Favoriten neu laden um aktuell zu bleiben
        await loadFavorites();
        
        // Event für Favoriten-Anzahl-Update auslösen
        const spotId = `${spotData.osmType}:${spotData.osmId}`;
        favoritesCountUpdatedEvent.dispatchEvent(new CustomEvent('favoritesUpdated', {
          detail: { spotId, action: 'added' }
        }));
        
        return true;
      } else {
        console.error('Fehler beim Hinzufügen:', response);
        setError('Fehler beim Hinzufügen zu Favoriten');
        return false;
      }
    } catch (error) {
      console.error('Exception beim Hinzufügen:', error);
      setError('Fehler beim Hinzufügen zu Favoriten');
      return false;
    }
  };

  // Spot aus Favoriten entfernen
  const removeFromFavorites = async (spotId: string): Promise<boolean> => {
    if (!user) {
      setError('Sie müssen angemeldet sein');
      return false;
    }

    try {
      console.log('Entferne Spot aus Favoriten:', spotId);
      const response = await removeSpotFromFavorites(spotId);

      if (response.success) {
        console.log('Spot aus Favoriten entfernt');
        // Favoriten neu laden um aktuell zu bleiben
        await loadFavorites();
        
        // Event für Favoriten-Anzahl-Update auslösen
        favoritesCountUpdatedEvent.dispatchEvent(new CustomEvent('favoritesUpdated', {
          detail: { spotId, action: 'removed' }
        }));
        
        return true;
      } else {
        console.error('Fehler beim Entfernen:', response);
        setError('Fehler beim Entfernen aus Favoriten');
        return false;
      }
    } catch (error) {
      console.error('Exception beim Entfernen:', error);
      setError('Fehler beim Entfernen aus Favoriten');
      return false;
    }
  };

  // Prüft, ob ein Spot favorisiert ist
  const isFavorited = (spotId: string): boolean => {
    if (!user) return false;
    
    // Die Database-IDs haben jetzt das Format "userId:osmType:osmId"
    // Wir suchen nach Favoriten, die mit "userId:spotId" enden
    const userSpotId = `${user.id}:${spotId}`;
    return favoriteSpots.some(spot => spot._id === userSpotId);
  };

  // Öffentliche Refresh-Funktion
  const refreshFavorites = loadFavorites;

  // Effekt: Favoriten laden wenn User sich ändert
  useEffect(() => {
    loadFavorites();
  }, [user]); // loadFavorites wird nicht als Abhängigkeit hinzugefügt, um Endlosschleifen zu vermeiden

  const value: FavoritesContextType = {
    favoriteSpots,
    isLoading,
    error,
    addToFavorites,
    removeFromFavorites,
    isFavorited,
    refreshFavorites,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export type { FavoriteSpot, AddSpotData };
