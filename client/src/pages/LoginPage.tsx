import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { loginUser, LoginCredentials } from '../services/api';

interface LoginFormData {
  identifier: string; // Username oder Email (wie im Backend erwartet)
  password: string;
}

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    identifier: '',
    password: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Redirect-URL aus URL-Parameter oder state extrahieren
  const from = (location.state as any)?.from?.pathname || new URLSearchParams(location.search).get('redirect') || '/';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Fehler zurücksetzen wenn Benutzer tippt
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔑 Login-Versuch mit:', { identifier: formData.identifier });
      
      // **SCHRITT 1: Daten an Backend senden**
      const response = await loginUser(formData as LoginCredentials);
      
      console.log('📨 Backend-Antwort:', response);

      // **SCHRITT 2: Response auswerten**
      if (response.success && response.user) {
        console.log('✅ Login erfolgreich!');
        
        // **SCHRITT 3: User-Daten in Context speichern**
        login(response.user);
        
        // **SCHRITT 4: Zur ursprünglichen Seite oder Startseite weiterleiten**
        navigate(from, { replace: true }); // replace: true verhindert History-Einträge
      } else {
        // **SCHRITT 5: Fehler anzeigen**
        console.log('❌ Login fehlgeschlagen:', response.message);
        setError(response.message || 'Login fehlgeschlagen');
      }
    } catch (error) {
      console.error('💥 Unerwarteter Fehler beim Login:', error);
      setError('Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
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

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-600 bg-opacity-20 border border-red-600 rounded-lg">
            <p className="text-red-300 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-gray-300 mb-2">
              E-Mail oder Benutzername
            </label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              value={formData.identifier}
              onChange={handleInputChange}
              required
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-coffee-brown transition-all disabled:opacity-50"
              placeholder="ihre@email.com oder username"
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
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-coffee-brown transition-all disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-coffee-brown to-coffee-darkBrown hover:from-coffee-darkBrown hover:to-coffee-brown text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? '🔄 Anmelden...' : 'Anmelden'}
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
