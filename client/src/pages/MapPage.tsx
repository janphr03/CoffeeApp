import React, { useState, useRef } from 'react';
import InteractiveMap from '../components/map/InteractiveMap';
import CoffeeSpotSidebar from '../components/map/CoffeeSpotSidebar';
import MapNavigation from '../components/map/MapNavigation';
import { MapContainer } from 'react-leaflet';

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

const MapPage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([52.5200, 13.4050]); // Berlin
  const mapRef = useRef<any>(null);

  // Demo Coffee Spots (nur sichtbar wenn eingeloggt)
  const coffeeSpots: CoffeeSpot[] = isLoggedIn ? [
    {
      id: 1,
      name: "Café Central",
      address: "Unter den Linden 5, 10117 Berlin",
      rating: 4.5,
      lat: 52.5170,
      lng: 13.3888,
      isOpen: true,
      distance: "0.3 km",
      priceLevel: 2
    },
    {
      id: 2,
      name: "Coffee Fellows",
      address: "Friedrichstraße 101, 10117 Berlin",
      rating: 4.2,
      lat: 52.5195,
      lng: 13.3885,
      isOpen: true,
      distance: "0.5 km",
      priceLevel: 2
    },
    {
      id: 3,
      name: "Starbucks",
      address: "Potsdamer Platz 3, 10785 Berlin",
      rating: 3.8,
      lat: 52.5096,
      lng: 13.3760,
      isOpen: false,
      distance: "1.2 km",
      priceLevel: 3
    },
    {
      id: 4,
      name: "Röststätte Berlin",
      address: "Hackescher Markt 2, 10178 Berlin",
      rating: 4.7,
      lat: 52.5225,
      lng: 13.4025,
      isOpen: true,
      distance: "0.8 km",
      priceLevel: 2
    },
    {
      id: 5,
      name: "The Barn",
      address: "Auguststraße 58, 10119 Berlin",
      rating: 4.6,
      lat: 52.5265,
      lng: 13.3965,
      isOpen: true,
      distance: "1.0 km",
      priceLevel: 3
    }
  ] : [];

  const handleToggleLogin = () => {
    setIsLoggedIn(!isLoggedIn);
  };

  const handleSpotClick = (spot: CoffeeSpot) => {
    // Karte zu dem angeklickten Spot zentrieren
    setMapCenter([spot.lat, spot.lng]);
    
    // Optional: Zoom level anpassen
    if (mapRef.current) {
      mapRef.current.setView([spot.lat, spot.lng], 16);
    }
  };

  const handleCloseMap = () => {
    // Hier könnten Sie zur vorherigen Seite zurückkehren
    window.history.back();
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Navigation */}
      <MapNavigation 
        isLoggedIn={isLoggedIn} 
        onToggleLogin={handleToggleLogin} 
      />

      {/* Main Content */}
      <div className="flex-1 flex relative">
        {/* Sidebar */}
        <CoffeeSpotSidebar
          isLoggedIn={isLoggedIn}
          coffeeSpots={coffeeSpots}
          onSpotClick={handleSpotClick}
        />

        {/* Map Container */}
        <div className="flex-1 relative">
          <InteractiveMap
            coffeeSpots={coffeeSpots}
            center={mapCenter}
            zoom={13}
          />
          
          {/* Close Map Button */}
          <button
            onClick={handleCloseMap}
            className="absolute bottom-6 left-6 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-full shadow-lg transition-all duration-200 z-[1000] border border-gray-200"
          >
            Close Map
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
