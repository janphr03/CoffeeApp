import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LocationProvider } from './contexts/LocationContext';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import FavoritesPage from './pages/FavoritesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import './App.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <LocationProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </Router>
      </LocationProvider>
    </AuthProvider>
  );
};

export default App;
