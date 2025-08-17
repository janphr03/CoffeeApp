// Registrierungsformular für neue Benutzerkonten
import React, { useState } from 'react';
import axios from 'axios';

interface RegisterProps {
  onRegister: (user: any) => void;
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onSwitchToLogin }) => {
  // Formular-Zustand mit Username, E-Mail und Passwort-Bestätigung
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Frontend-Validierung: Passwörter müssen übereinstimmen
    if (formData.password !== formData.confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      setLoading(false);
      return;
    }

    try {
      interface RegisterResponse {
        success: boolean;
        user: any;
        message?: string;
      }

      // Registrierungs-Request an Backend (ohne confirmPassword)
      const response = await axios.post<RegisterResponse>('http://localhost:3000/api/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        onRegister(response.data.user);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-black bg-opacity-70 p-8 rounded-xl">
      <h2 className="text-3xl font-bold text-coffee-light mb-6 text-center">
        Registrieren
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Benutzername Eingabefeld */}
        <input
          type="text"
          name="username"
          placeholder="Benutzername"
          value={formData.username}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 rounded bg-black bg-opacity-50 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-coffee-brown transition-all"
        />
        {/* E-Mail Eingabefeld */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 rounded bg-black bg-opacity-50 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-coffee-brown transition-all"
        />
        {/* Passwort Eingabefeld mit Mindestlänge */}
        <input
          type="password"
          name="password"
          placeholder="Passwort (mindestens 6 Zeichen)"
          value={formData.password}
          onChange={handleChange}
          required
          minLength={6}
          className="w-full px-4 py-2 rounded bg-black bg-opacity-50 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-coffee-brown transition-all"
        />
        {/* Passwort-Bestätigung für Frontend-Validierung */}
        <input
          type="password"
          name="confirmPassword"
          placeholder="Passwort bestätigen"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 rounded bg-black bg-opacity-50 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-coffee-brown transition-all"
        />
        {/* Registrierungs-Button mit Loading-State */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-coffee-brown to-coffee-darkBrown hover:from-coffee-darkBrown hover:to-coffee-brown text-white font-semibold px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
        >
          {loading ? 'Registrierung...' : 'Registrieren'}
        </button>
      </form>

      {/* Wechsel zur Anmeldung */}
      <p className="mt-4 text-center text-gray-300">
        Bereits ein Konto?{' '}
        <button
          onClick={onSwitchToLogin}
          className="text-coffee-brown hover:text-coffee-light transition-colors"
        >
          Anmelden
        </button>
      </p>
    </div>
  );
};

export default Register;
