import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    console.log('Login submitted:', formData);
    // Hier würde normalerweise die Login-Verarbeitung stattfinden
    alert('Login erfolgreich! (Demo)');
    navigate('/map');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-coffee-dark">
      {/* Hintergrundbild */}
      <div 
        className="fixed top-0 left-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: 'url(/frames2/frame_250.jpg)',
          filter: 'brightness(0.3)',
          zIndex: -1,
          pointerEvents: 'none'
        }}
      />
      
      <div className="bg-black bg-opacity-70 p-8 rounded-xl shadow-2xl w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-coffee-light font-playfair mb-2">
            Willkommen zurück
          </h1>
          <p className="text-gray-300">
            Melden Sie sich an, um Coffee Spots zu entdecken
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              E-Mail-Adresse
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-coffee-brown transition-all"
              placeholder="ihre@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Passwort
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-coffee-brown transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-coffee-brown to-coffee-darkBrown hover:from-coffee-darkBrown hover:to-coffee-brown text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Anmelden
          </button>
        </form>

        {/* Links */}
        <div className="mt-6 text-center space-y-3">
          <p className="text-gray-400 text-sm">
            Noch kein Konto?{' '}
            <Link 
              to="/register" 
              className="text-coffee-brown hover:text-coffee-light transition-colors"
            >
              Jetzt registrieren
            </Link>
          </p>
          
          <Link 
            to="/" 
            className="block text-gray-400 hover:text-coffee-brown transition-colors text-sm"
          >
            ← Zurück zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
