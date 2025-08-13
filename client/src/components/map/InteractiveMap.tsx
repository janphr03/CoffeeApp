import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../../contexts/AuthContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { OpeningHoursService, OpeningHoursStatus } from '../../services/openingHoursService';

// Fix für Leaflet Icons in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Erstelle spezielle Icons für ausgewählte Spots
const createSelectedIcon = () => {
  return new L.Icon({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    iconSize: [35, 55], // Größer als normal
    iconAnchor: [17, 55],
    popupAnchor: [1, -44],
    shadowSize: [55, 55],
    className: 'selected-marker' // CSS-Klasse für Styling
  });
};

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
  // OSM properties für Favoriten
  osmType?: 'node' | 'way' | 'relation';
  osmId?: number;
  amenity?: string;
  tags?: Record<string, string>;
}

interface InteractiveMapProps {
  coffeeSpots: CoffeeSpot[];
  center: [number, number];
  zoom: number;
  userLocation?: [number, number] | null;
  selectedSpotId?: number | null;
  onSpotClick?: (spot: CoffeeSpot) => void;
  onMapReady?: () => void;
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
  userLocation = null,
  selectedSpotId = null,
  onSpotClick,
  onMapReady
}) => {
  const { user } = useAuth();
  const { addToFavorites, removeFromFavorites, isFavorited } = useFavorites();

  const handleFavoriteClick = async (spot: CoffeeSpot, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (!user) {
      alert('Sie müssen sich anmelden oder registrieren, um dieses Café zu Ihren Favoriten hinzuzufügen.');
      return;
    }

    // Erstelle eindeutige Spot-ID für OSM-Daten
    const spotId = `${spot.osmType || 'node'}:${spot.osmId || spot.id}`;
    
    try {
      if (isFavorited(spotId)) {
        // Spot ist bereits favorisiert - entfernen
        const success = await removeFromFavorites(spotId);
        if (!success) {
          alert('Fehler beim Entfernen aus Favoriten.');
        }
      } else {
        // Spot zu Favoriten hinzufügen
        const success = await addToFavorites({
          osmType: spot.osmType || 'node',
          osmId: spot.osmId || spot.id,
          elementLat: spot.lat,
          elementLng: spot.lng,
          name: spot.name,
          amenity: spot.amenity || 'cafe',
          address: spot.address,
          tags: spot.tags || {}
        });
        
        if (!success) {
          alert('Fehler beim Hinzufügen zu Favoriten.');
        }
      }
    } catch (error) {
      console.error('Fehler bei Favoriten-Operation:', error);
      alert('Ein Fehler ist aufgetreten.');
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

  // Gelbe Marker für Favoriten
  const yellowMarkerIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
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
        whenReady={onMapReady}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* MapController für programmatische Kartenkontrolle */}
        <MapController center={center} zoom={zoom} />
        
        {coffeeSpots.map((spot) => {
          // Öffnungszeiten-Status berechnen
          const openingStatus: OpeningHoursStatus = OpeningHoursService.evaluateOpeningHours(spot.openingHours);
          const isSelected = selectedSpotId === spot.id;
          
          // Prüfe, ob Spot favorisiert ist
          const spotId = `${spot.osmType || 'node'}:${spot.osmId || spot.id}`;
          const isSpotFavorited = isFavorited(spotId);
          
          // Bestimme das passende Icon
          let markerIcon;
          if (isSelected) {
            markerIcon = createSelectedIcon();
          } else if (isSpotFavorited) {
            markerIcon = yellowMarkerIcon; // Gelb für Favoriten
          } else {
            markerIcon = redMarkerIcon; // Standard rot
          }
          
          return (
          <Marker 
            key={spot.id} 
            position={[spot.lat, spot.lng]}
            icon={markerIcon}
            zIndexOffset={isSelected ? 1000 : (isSpotFavorited ? 500 : 0)}
            eventHandlers={{
              click: () => {
                if (onSpotClick) {
                  onSpotClick(spot);
                }
              }
            }}
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
                    !user 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : isSpotFavorited
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                  title={
                    !user 
                      ? 'Anmelden erforderlich' 
                      : isSpotFavorited 
                      ? 'Aus Favoriten entfernen' 
                      : 'Zu Favoriten hinzufügen'
                  }
                  style={{ fontSize: '16px', lineHeight: '1', paddingTop: '2px' }}
                >
                  {!user ? '+' : isSpotFavorited ? '−' : '+'}
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
                    openingStatus.status === 'open'
                      ? 'bg-green-100 text-green-800' 
                      : openingStatus.status === 'closed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {openingStatus.statusText}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
          );
        })}

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
