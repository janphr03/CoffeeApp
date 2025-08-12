import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

interface Spot {
  _id: string;
  userId: string;
  location: string;
  createdAt: string;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [newLocation, setNewLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addingSpot, setAddingSpot] = useState(false);

  useEffect(() => {
    fetchSpots();
  }, []);

  interface FetchSpotsResponse {
    success: boolean;
    spots: Spot[];
    message?: string;
  }

  const fetchSpots = async () => {
    setLoading(true);
    try {
      const response = await axios.get<FetchSpotsResponse>('http://localhost:3000/api/spots', {
        withCredentials: true
      });
      
      const data = response.data as FetchSpotsResponse;
      if (data.success) {
        setSpots(data.spots);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error fetching spots');
    } finally {
      setLoading(false);
    }
  };

  const addSpot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocation.trim()) return;

    setAddingSpot(true);
    try {
      const response = await axios.post<{ success: boolean; spot: Spot }>('http://localhost:3000/api/spots', {
        location: newLocation
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        setSpots([...spots, response.data.spot]);
        setNewLocation('');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error adding spot');
    } finally {
      setAddingSpot(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3000/api/auth/logout', {}, {
        withCredentials: true
      });
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      onLogout(); // Logout anyway
    }
  };

  return (
    <div className="min-h-screen bg-coffee-dark text-gray-200 p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-coffee-light font-playfair">
              ☕ Coffee Dashboard
            </h1>
            <p className="text-gray-300 mt-2">
              Willkommen zurück, {user.username}!
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-full transition-all duration-300"
          >
            Abmelden
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-200">
            {error}
          </div>
        )}

        {/* Add new spot */}
        <div className="bg-black bg-opacity-50 p-6 rounded-xl mb-8">
          <h2 className="text-2xl font-bold text-coffee-light mb-4 font-playfair">
            Neuen Coffee Spot hinzufügen
          </h2>
          <form onSubmit={addSpot} className="flex gap-4">
            <input
              type="text"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              placeholder="Ort eingeben..."
              className="flex-1 px-4 py-2 rounded bg-black bg-opacity-50 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-coffee-brown transition-all"
            />
            <button
              type="submit"
              disabled={addingSpot}
              className="bg-gradient-to-r from-coffee-brown to-coffee-darkBrown hover:from-coffee-darkBrown hover:to-coffee-brown text-white font-semibold px-6 py-2 rounded-full transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
            >
              {addingSpot ? 'Hinzufügen...' : 'Hinzufügen'}
            </button>
          </form>
        </div>

        {/* Spots list */}
        <div className="bg-black bg-opacity-50 p-6 rounded-xl">
          <h2 className="text-2xl font-bold text-coffee-light mb-4 font-playfair">
            Deine Coffee Spots
          </h2>
          
          {loading ? (
            <p className="text-gray-300">Lade deine Spots...</p>
          ) : spots.length === 0 ? (
            <p className="text-gray-300">
              Du hast noch keine Coffee Spots hinzugefügt. Füge deinen ersten Spot oben hinzu!
            </p>
          ) : (
            <div className="grid gap-4">
              {spots.map((spot) => (
                <div key={spot._id} className="bg-black bg-opacity-30 p-4 rounded-lg border border-coffee-brown border-opacity-30">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-coffee-light">
                      📍 {spot.location}
                    </h3>
                    <span className="text-sm text-gray-400">
                      {new Date(spot.createdAt).toLocaleDateString('de-DE')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info section */}
        <div className="mt-8 p-4 bg-green-500 bg-opacity-20 border border-green-500 rounded text-green-200">
          <h3 className="font-semibold mb-2">🎉 Authentication erfolgreich!</h3>
          <p className="text-sm">
            Du bist angemeldet und kannst geschützte Inhalte sehen. Session Cookies sorgen dafür, 
            dass du angemeldet bleibst, auch wenn du die Seite neu lädst.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;