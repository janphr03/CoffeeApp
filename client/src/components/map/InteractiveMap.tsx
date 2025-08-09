import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
  // Custom Coffee Icon erstellen
  const coffeeIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#A67B5B" width="24" height="24">
        <path d="M2 21h18v-2H2v2zM20 8h-2V5h2v3zM20 3h-4v8.9c0 .57-.34 1.1-.86 1.3L15 13.3c-.72.3-1.3.97-1.5 1.77-1.13-.07-2.07-.92-2.39-2H9.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h1.61c.32-1.08 1.26-1.93 2.39-2 .2-.8.78-1.47 1.5-1.77l.14-.06c.52-.2.86-.73.86-1.3V3z"/>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
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
            icon={coffeeIcon}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-coffee-brown text-lg mb-1">
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
