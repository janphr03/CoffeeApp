import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Interfaces für Location-Daten definieren
interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
}

interface LocationContextType {
  isLocationEnabled: boolean;
  userLocation: [number, number] | null;
  locationStatus: string;
  isLoading: boolean;
  enableLocation: () => Promise<void>;
  disableLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Provider-Komponente erstellen
interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [isLocationEnabled, setIsLocationEnabled] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>('Standorterkennung ist deaktiviert');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Session Storage Keys
  const LOCATION_ENABLED_KEY = 'coffee_app_location_enabled';
  const LOCATION_DATA_KEY = 'coffee_app_location_data';

  // Location-Status aus Session Storage laden
  const loadLocationFromSession = useCallback(() => {
    try {
      const isEnabled = sessionStorage.getItem(LOCATION_ENABLED_KEY) === 'true';
      const locationDataString = sessionStorage.getItem(LOCATION_DATA_KEY);
      
      if (isEnabled && locationDataString) {
        const locationData: LocationData = JSON.parse(locationDataString);
        
        // Prüfen, ob die Daten nicht zu alt sind (max. 30 Minuten)
        const now = Date.now();
        const maxAge = 30 * 60 * 1000; // 30 Minuten in Millisekunden
        
        if (now - locationData.timestamp < maxAge) {
          console.log('Gespeicherte Location aus Session geladen:', locationData);
          setIsLocationEnabled(true);
          setUserLocation([locationData.latitude, locationData.longitude]);
          setLocationStatus(`Standort: ${locationData.latitude.toFixed(4)}, ${locationData.longitude.toFixed(4)}`);
        } else {
          console.log('Gespeicherte Location ist zu alt, wird gelöscht');
          clearLocationSession();
        }
      }
    } catch (error) {
      console.error('Fehler beim Laden der Location aus Session:', error);
      clearLocationSession();
    }
  }, []); // Leere Dependencies, da alle benötigten Funktionen stabil sind

  // Beim App-Start gespeicherten Location-Status laden
  useEffect(() => {
    loadLocationFromSession();
  }, [loadLocationFromSession]);

  // Location-Daten in Session Storage speichern
  const saveLocationToSession = (latitude: number, longitude: number, accuracy?: number) => {
    try {
      const locationData: LocationData = {
        latitude,
        longitude,
        timestamp: Date.now(),
        accuracy
      };
      
      sessionStorage.setItem(LOCATION_ENABLED_KEY, 'true');
      sessionStorage.setItem(LOCATION_DATA_KEY, JSON.stringify(locationData));
      console.log('Location in Session gespeichert:', locationData);
    } catch (error) {
      console.error('Fehler beim Speichern der Location in Session:', error);
    }
  };

  // Session Storage löschen
  const clearLocationSession = () => {
    sessionStorage.removeItem(LOCATION_ENABLED_KEY);
    sessionStorage.removeItem(LOCATION_DATA_KEY);
    console.log('Location-Session gelöscht');
  };

  // Browser Geolocation anfordern
  const requestGeolocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation wird von diesem Browser nicht unterstützt'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 Minuten Cache
        }
      );
    });
  };

  // Location aktivieren
  const enableLocation = async (): Promise<void> => {
    setIsLoading(true);
    setLocationStatus('Standort wird ermittelt...');

    try {
      const position = await requestGeolocation();
      const { latitude, longitude, accuracy } = position.coords;
      
      console.log('Standort erfolgreich ermittelt:', { latitude, longitude, accuracy });
      
      // State aktualisieren
      setIsLocationEnabled(true);
      setUserLocation([latitude, longitude]);
      setLocationStatus(`Standort: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      
      // In Session speichern
      saveLocationToSession(latitude, longitude, accuracy);
      
    } catch (error: any) {
      console.error('Standorterkennung fehlgeschlagen:', error);
      
      setIsLocationEnabled(false);
      setUserLocation(null);
      
      // Spezifische Fehlermeldungen
      if (error.code === 1) {
        setLocationStatus('Standortzugriff verweigert');
      } else if (error.code === 2) {
        setLocationStatus('Standort nicht verfügbar');
      } else if (error.code === 3) {
        setLocationStatus('Zeitüberschreitung bei Standortermittlung');
      } else {
        setLocationStatus('Fehler bei Standortermittlung');
      }
      
      clearLocationSession();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Location deaktivieren
  const disableLocation = (): void => {
    console.log('Standorterkennung wird deaktiviert');
    
    setIsLocationEnabled(false);
    setUserLocation(null);
    setLocationStatus('Standorterkennung ist deaktiviert');
    setIsLoading(false);
    
    clearLocationSession();
  };

  // Context-Wert zusammenstellen
  const value: LocationContextType = {
    isLocationEnabled,
    userLocation,
    locationStatus,
    isLoading,
    enableLocation,
    disableLocation
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

// Wieder Custom Hook für einfache Nutzung
export const useUserLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useUserLocation muss innerhalb eines LocationProvider verwendet werden');
  }
  return context;
};

export default LocationContext;
