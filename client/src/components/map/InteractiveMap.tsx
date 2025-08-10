import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../../contexts/AuthContext';

// Fix für Leaflet Icons in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

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

interface InteractiveMapProps {
  coffeeSpots: CoffeeSpot[];
  center: [number, number];
  zoom: number;
  userLocation?: [number, number] | null;
}

// MapController Komponente für programmatische Kartenkontrolle
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    console.log('🗺️ Map wird auf neue Position zentriert:', center);
    map.setView(center, zoom);
  }, [map, center, zoom]);
  
  return null;
};

const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  coffeeSpots, 
  center = [52.5200, 13.4050], // Berlin als Standard
  zoom = 13,
  userLocation = null
}) => {
  const { user } = useAuth();

  const handleFavoriteClick = (spot: CoffeeSpot, event: React.MouseEvent) => {
    event.stopPropagation(); // Verhindert das Schließen des Popups
    
    if (!user) {
      // User ist nicht eingeloggt - Hinweis anzeigen
      alert('Sie müssen sich anmelden oder registrieren, um dieses Café zu Ihren Favoriten hinzuzufügen.');
    } else {
      // User ist eingeloggt - Platzhalter-Funktionalität
      console.log('Favorit hinzufügen für:', spot.name);
      alert('Favoriten-Feature wird bald verfügbar sein!');
    }
  };
  // Standard rote Marker für Cafés (wie Google Maps)
  const redMarkerIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  // Custom User Location Icon erstellen (blauer Punkt)
  const userLocationIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3B82F6" width="24" height="24">
        <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="#ffffff" stroke-width="3"/>
        <circle cx="12" cy="12" r="3" fill="#ffffff"/>
      </svg>
    `),
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });

  return (
    <div className="h-full w-full relative">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ 
          height: '100%', 
          width: '100%',
          position: 'relative',
          zIndex: 0
        }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* MapController für programmatische Kartenkontrolle */}
        <MapController center={center} zoom={zoom} />
        
        {coffeeSpots.map((spot) => (
          <Marker 
            key={spot.id} 
            position={[spot.lat, spot.lng]}
            icon={redMarkerIcon}
          >
            {/* Hover-Tooltip */}
            <Tooltip direction="top" offset={[0, -20]} opacity={0.9}>
              <div className="text-center">
                <div className="font-semibold text-sm">{spot.name}</div>
                <div className="text-xs text-gray-600">
                  ★ {spot.rating} {spot.distance && `• ${spot.distance}`}
                </div>
              </div>
            </Tooltip>
            
            {/* Klick-Popup (bleibt geöffnet bis geschlossen) */}
            <Popup>
              <div className="p-2 min-w-[200px] relative">
                {/* Favoriten-Button */}
                <button
                  onClick={(e) => handleFavoriteClick(spot, e)}
                  className={`absolute top-1 right-1 w-7 h-7 rounded-full flex items-center justify-center text-white font-bold transition-colors ${
                    user 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                  title={user ? 'Zu Favoriten hinzufügen' : 'Anmelden erforderlich'}
                  style={{ fontSize: '16px', lineHeight: '1', paddingTop: '2px' }}
                >
                  +
                </button>

                <h3 className="font-bold text-coffee-brown text-lg mb-1 pr-8">
                  {spot.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {spot.address}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-yellow-500">★</span>
                    <span className="ml-1 text-sm font-semibold">{spot.rating}</span>
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
            </Popup>
          </Marker>
        ))}

        {/* User Location Marker */}
        {userLocation && (
          <Marker 
            position={userLocation}
            icon={userLocationIcon}
          >
            <Popup>
              <div className="p-2 min-w-[150px] text-center">
                <h3 className="font-bold text-blue-600 text-lg mb-1">
                  📍 Ihr Standort
                </h3>
                <p className="text-sm text-gray-600">
                  Sie befinden sich hier
                </p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default InteractiveMap;
