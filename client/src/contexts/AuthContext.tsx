import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// **SCHRITT 1: Interface für User-Daten definieren**
interface User {
  id: string;
  username: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

// **SCHRITT 2: Interface für den Context definieren**
interface AuthContextType {
  user: User | null;               // Aktueller Benutzer (null = nicht eingeloggt)
  isLoggedIn: boolean;            // Boolean für einfache Prüfung
  login: (userData: User) => void; // Funktion zum Einloggen
  logout: () => void;             // Funktion zum Ausloggen
  loading: boolean;               // Loading-Status für API-Calls
}

// **SCHRITT 3: Context erstellen**
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// **SCHRITT 4: Provider-Komponente erstellen**
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // **SCHRITT 5: Beim App-Start prüfen, ob Benutzer eingeloggt ist**
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // **SCHRITT 6: Backend-Anfrage um Session-Status zu prüfen**
  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:3000/auth/status', {
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

  // **SCHRITT 7: Login-Funktion**
  const login = (userData: User) => {
    setUser(userData);
  };

  // **SCHRITT 8: Logout-Funktion**
  const logout = async () => {
    try {
      await fetch('http://localhost:3000/auth/logout', {
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

  // **SCHRITT 9: Context-Wert zusammenstellen**
  const value: AuthContextType = {
    user,
    isLoggedIn: !!user, // !! wandelt user in boolean um
    login,
    logout,
    loading,
  };

  // **SCHRITT 10: Provider rendern**
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// **SCHRITT 11: Custom Hook für einfache Nutzung**
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth muss innerhalb eines AuthProvider verwendet werden');
  }
  return context;
};

export default AuthContext;
