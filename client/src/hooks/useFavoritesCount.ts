// Custom Hook für das Laden der Favoriten-Anzahl
import { useState, useEffect } from 'react';
import { getFavoritesCount } from '../services/api';
import { favoritesCountUpdatedEvent } from '../contexts/FavoritesContext';

interface UseFavoritesCountResult {
  favoritesCount: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useFavoritesCount = (spotId: string): UseFavoritesCountResult => {
  const [favoritesCount, setFavoritesCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavoritesCount = async () => {
    if (!spotId) {
      setFavoritesCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log(`Lade Favoriten-Anzahl für Spot-ID: "${spotId}"`);
      const result = await getFavoritesCount(spotId);
      console.log(`Favoriten-Anzahl-Ergebnis für "${spotId}":`, result);
      
      if (result.success) {
        setFavoritesCount(result.count);
        console.log(`Favoriten-Anzahl gesetzt: ${result.count} für Spot "${spotId}"`);
      } else {
        setError(result.error || 'Fehler beim Laden der Favoriten-Anzahl');
        setFavoritesCount(0);
        console.warn(`Fehler beim Laden der Favoriten-Anzahl für "${spotId}":`, result.error);
      }
    } catch (err: any) {
      setError(err.message || 'Unbekannter Fehler');
      setFavoritesCount(0);
      console.error(`Exception beim Laden der Favoriten-Anzahl für "${spotId}":`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavoritesCount();
  }, [spotId]);

  // Event Listener für Favoriten-Updates
  useEffect(() => {
    const handleFavoritesUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { spotId: updatedSpotId } = customEvent.detail;
      
      // Wenn dieser Spot aktualisiert wurde, neu laden
      if (updatedSpotId === spotId) {
        console.log(`Favoriten-Anzahl für Spot ${spotId} wird neu geladen...`);
        fetchFavoritesCount();
      }
    };

    favoritesCountUpdatedEvent.addEventListener('favoritesUpdated', handleFavoritesUpdate);

    return () => {
      favoritesCountUpdatedEvent.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
    };
  }, [spotId]);

  const refetch = () => {
    fetchFavoritesCount();
  };

  return {
    favoritesCount,
    loading,
    error,
    refetch
  };
};
