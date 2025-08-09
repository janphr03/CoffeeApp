import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import InteractiveMap from '../components/map/InteractiveMap';
import CoffeeSpotSidebar from '../components/map/CoffeeSpotSidebar';
import RightSidebar from '../components/map/RightSidebar';
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const isLoggedIn = !!user; // Verwende AuthContext
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

  const handleLocationChange = (newLocation: [number, number]) => {
    setMapCenter(newLocation);
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
    // Zur Startseite navigieren
    navigate('/');
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Linke Sidebar: Coffee Spots */}
      <CoffeeSpotSidebar
        isLoggedIn={isLoggedIn}
        coffeeSpots={coffeeSpots}
        onSpotClick={handleSpotClick}
      />

      {/* Mittlere Sektion: Map */}
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

      {/* Rechte Sidebar: Authentication & Standort */}
      <RightSidebar onLocationChange={handleLocationChange} />
    </div>
  );
};

export default MapPage;
