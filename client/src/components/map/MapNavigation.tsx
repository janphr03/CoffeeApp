import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { logoutUser } from '../../services/api';

interface MapNavigationProps {
  isLoggedIn: boolean;
  onToggleLogin: () => void;
}

const MapNavigation: React.FC<MapNavigationProps> = ({ isLoggedIn, onToggleLogin }) => {
  const { user, logout } = useAuth();

  const handleLogout = async (): Promise<void> => {
    try {
      console.log('🚪 Logout von Map-Seite...');
      
      // **SCHRITT 1: Backend über Logout benachrichtigen**
      await logoutUser();
      
      // **SCHRITT 2: User aus Context entfernen**
      logout();
      
      console.log('✅ Logout erfolgreich!');
    } catch (error) {
      console.error('❌ Logout-Fehler:', error);
      // Auch bei Fehlern den User lokal ausloggen
      logout();
    }
  };

  // Minimale Navigation entsprechend Wireframe - nur für mobile Ansicht falls nötig
  return null; // Navigation wird jetzt in der Sidebar gehandhabt
};

export default MapNavigation;
