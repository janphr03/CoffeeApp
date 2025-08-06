import React, { useState } from 'react';
import axios from 'axios';

interface LoginProps {
  onLogin: (user: any) => void;
  onSwitchToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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

    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', formData, {
        withCredentials: true
      });

      if (response.data.success) {
        onLogin(response.data.user);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-black bg-opacity-70 p-8 rounded-xl">
      <h2 className="text-3xl font-bold text-coffee-light mb-6 text-center font-playfair">
        Anmelden
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 rounded bg-black bg-opacity-50 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-coffee-brown transition-all"
        />
        <input
          type="password"
          name="password"
          placeholder="Passwort"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 rounded bg-black bg-opacity-50 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-coffee-brown transition-all"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-coffee-brown to-coffee-darkBrown hover:from-coffee-darkBrown hover:to-coffee-brown text-white font-semibold px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
        >
          {loading ? 'Anmeldung...' : 'Anmelden'}
        </button>
      </form>

      <p className="mt-4 text-center text-gray-300">
        Noch kein Konto?{' '}
        <button
          onClick={onSwitchToRegister}
          className="text-coffee-brown hover:text-coffee-light transition-colors"
        >
          Registrieren
        </button>
      </p>
    </div>
  );
};

export default Login;