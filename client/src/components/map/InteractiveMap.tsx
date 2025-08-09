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
  // Standard Leaflet Marker für Cafés (rote Marker wie bei Google Maps)
  // Wir verwenden die Standard-Leaflet-Icons, die automatisch rot sind

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
            // Verwende Standard-Leaflet-Marker (rot)
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
