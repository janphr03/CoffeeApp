import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  coffeeSpots, 
  center = [52.5200, 13.4050], // Berlin als Standard
  zoom = 13 
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
      </MapContainer>
    </div>
  );
};

export default InteractiveMap;
