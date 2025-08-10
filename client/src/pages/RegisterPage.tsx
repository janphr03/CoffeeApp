import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { registerUser, RegisterCredentials } from '../services/api';
import { useAuthRedirect } from '../hooks/useAuthRedirect';

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { loginUrl } = useAuthRedirect();

  // Redirect-URL aus URL-Parameter oder state extrahieren
  const from = (location.state as any)?.from?.pathname || new URLSearchParams(location.search).get('redirect') || '/';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Fehler zurücksetzen wenn Benutzer tippt
    if (error) setError('');
    if (success) setSuccess('');
    if (fieldErrors[e.target.name]) {
      setFieldErrors({
        ...fieldErrors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    // Benutzername validieren
    if (formData.username.length < 3) {
      errors.username = 'Benutzername muss mindestens 3 Zeichen lang sein';
    }

    // Email validieren
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse ein';
    }

    // Passwort validieren
    if (formData.password.length < 6) {
      errors.password = 'Passwort muss mindestens 6 Zeichen lang sein';
    }

    // Passwort bestätigen
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwörter stimmen nicht überein';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    // **SCHRITT 1: Frontend-Validierung**
    if (!validateForm()) {
      console.log('❌ Formular-Validierung fehlgeschlagen');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('🔐 Registrierung wird gestartet für:', formData.username);
      
      // **SCHRITT 2: Registrierungs-Daten an Backend senden**
      const registerData: RegisterCredentials = {
        username: formData.username,
        email: formData.email,
        password: formData.password
      };
      
      const response = await registerUser(registerData);
      
      console.log('📨 Backend-Antwort bei Registrierung:', response);

      // **SCHRITT 3: Response auswerten**
      if (response.success) {
        console.log('✅ Registrierung erfolgreich!');
        console.log('📋 User-Daten empfangen:', response.user);
        
        // **SCHRITT 4: Erfolgsmeldung anzeigen**
        setSuccess('Registrierung erfolgreich! Sie werden zur Anmeldung weitergeleitet...');

        // **SCHRITT 5: User zur Login-Page weiterleiten**      
        console.log('Weiterleitung zur Login-Seite');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 1500);
        
      } else {
        // **SCHRITT 6: Spezifische Backend-Fehler anzeigen**
        console.log('❌ Registrierung fehlgeschlagen:', response.message);
        setError(response.message || 'Registrierung fehlgeschlagen');
      }
    } catch (error: any) {
      console.error('💥 Unerwarteter Fehler bei Registrierung:', error);
      
      // Spezifische Fehlerbehandlung
      if (error.message.includes('E-Mail bereits registriert')) {
        setFieldErrors({ email: 'Diese E-Mail-Adresse ist bereits registriert' });
      } else if (error.message.includes('Benutzername bereits vergeben')) {
        setFieldErrors({ username: 'Dieser Benutzername ist bereits vergeben' });
      } else {
        setError('Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
      }
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
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-600 bg-opacity-20 border border-red-600 rounded-lg">
            <p className="text-red-300 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-600 bg-opacity-20 border border-green-600 rounded-lg">
            <p className="text-green-300 text-sm text-center">{success}</p>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-coffee-light font-playfair mb-2">
            Jetzt registrieren
          </h1>
          <p className="text-gray-300">
            Entdecken Sie die besten Coffee Spots in Ihrer Nähe
          </p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
              Benutzername
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              disabled={loading || !!success}
              className={`w-full px-4 py-3 rounded-lg bg-gray-800 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 ${
                fieldErrors.username ? 'border border-red-500 focus:ring-red-500' : 'focus:ring-coffee-brown'
              }`}
              placeholder="IhrBenutzername"
            />
            {fieldErrors.username && (
              <p className="text-red-400 text-xs mt-1">{fieldErrors.username}</p>
            )}
          </div>

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
              disabled={loading || !!success}
              className={`w-full px-4 py-3 rounded-lg bg-gray-800 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 ${
                fieldErrors.email ? 'border border-red-500 focus:ring-red-500' : 'focus:ring-coffee-brown'
              }`}
              placeholder="ihre@email.com"
            />
            {fieldErrors.email && (
              <p className="text-red-400 text-xs mt-1">{fieldErrors.email}</p>
            )}
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
              disabled={loading || !!success}
              className={`w-full px-4 py-3 rounded-lg bg-gray-800 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 ${
                fieldErrors.password ? 'border border-red-500 focus:ring-red-500' : 'focus:ring-coffee-brown'
              }`}
              placeholder="••••••••"
            />
            {fieldErrors.password && (
              <p className="text-red-400 text-xs mt-1">{fieldErrors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
              Passwort bestätigen
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              disabled={loading || !!success}
              className={`w-full px-4 py-3 rounded-lg bg-gray-800 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 ${
                fieldErrors.confirmPassword ? 'border border-red-500 focus:ring-red-500' : 'focus:ring-coffee-brown'
              }`}
              placeholder="••••••••"
            />
            {fieldErrors.confirmPassword && (
              <p className="text-red-400 text-xs mt-1">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !!success}
            className="w-full bg-gradient-to-r from-coffee-brown to-coffee-darkBrown hover:from-coffee-darkBrown hover:to-coffee-brown text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading 
              ? '🔄 Registrierung läuft...' 
              : success 
                ? '✅ Erfolgreich!' 
                : 'Account erstellen'
            }
          </button>
        </form>

        {/* Links */}
        <div className="mt-6 text-center space-y-3">
          <p className="text-gray-400 text-sm">
            Bereits ein Konto?{' '}
            <Link 
              to={loginUrl} 
              className="text-coffee-brown hover:text-coffee-light transition-colors"
            >
              Jetzt anmelden
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

export default RegisterPage;
