import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Interface für User-Daten definieren
interface User {
  id: string;
  username: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

// Interface für den Context definieren
interface AuthContextType {
  user: User | null;               // Aktueller Benutzer (null = nicht eingeloggt)
  isLoggedIn: boolean;            // Boolean für einfache Prüfung
  login: (userData: User, redirectTo?: string) => void; // Funktion zum Einloggen mit optionaler Weiterleitung
  logout: () => void;             // Funktion zum Ausloggen
  loading: boolean;               // Loading-Status für API-Calls
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider-Komponente erstellen
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Beim App-Start prüfen, ob Benutzer eingeloggt ist
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Backend-Anfrage um Session-Status zu prüfen
  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/status', {
        method: 'GET',
        credentials: 'include', // Wichtig: Session-Cookies mitsenden
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Fehler beim Prüfen des Auth-Status:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Login Funktion
  const login = (userData: User, redirectTo?: string) => {
    setUser(userData);
    
    // Weiterleitung nach erfolgreichem Login
    if (redirectTo) {
      window.location.href = redirectTo;
    }
  };

  // Logout Funktion
  const logout = async () => {
    try {
      await fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Fehler beim Logout:', error);
    } finally {
      setUser(null);
    }
  };

  // Context-Wert zusammenstellen
  const value: AuthContextType = {
    user,
    isLoggedIn: !!user, // !! wandelt user in boolean um
    login,
    logout,
    loading,
  };

  // Provider rendern
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook für einfachen Abruf des Login-Status
// durch const { isLoggedIn } = useAuth(); kann überall in der App geprüft werden, ob der User eingeloggt ist
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth muss innerhalb eines AuthProvider verwendet werden');
  }
  return context;
};

export default AuthContext;
