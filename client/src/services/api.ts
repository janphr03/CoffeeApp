// **API Service für Backend-Kommunikation**
// Diese Datei enthält alle Funktionen für HTTP-Requests an das Backend

const API_BASE_URL = 'http://localhost:3000';

// **SCHRITT 1: Generische Fetch-Funktion mit Error-Handling**
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log(`🔄 API Request: ${options.method || 'GET'} ${url}`);
  
  const defaultOptions: RequestInit = {
    credentials: 'include', // Session-Cookies immer mitsenden
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const finalOptions = { ...defaultOptions, ...options };

  try {
    console.log('📤 Sending request with options:', finalOptions);
    
    const response = await fetch(url, finalOptions);
    
    console.log(`📨 Response Status: ${response.status} ${response.statusText}`);
    console.log('📨 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    // Prüfe, ob die Response JSON ist
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const textData = await response.text();
      console.warn('⚠️ Non-JSON response received:', textData);
      data = { message: textData || 'Unbekannte Antwort vom Server' };
    }
    
    console.log('📋 Response Data:', data);
    
    return {
      success: response.ok,
      status: response.status,
      data: data,
    };
  } catch (error: any) {
    console.error(`💥 API Request Error for ${endpoint}:`, error);
    
    // Detaillierte Fehleranalyse
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('🚫 Netzwerkfehler - Ist das Backend erreichbar?');
      console.error('🔍 Überprüfe: http://localhost:3000');
    }
    
    return {
      success: false,
      status: 0,
      data: { 
        message: 'Netzwerkfehler. Bitte versuchen Sie es später erneut.',
        error: error.message 
      },
    };
  }
};

// **SCHRITT 2: Login-Funktion**
export interface LoginCredentials {
  identifier: string; // Username oder Email
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    username: string;
    email: string;
    createdAt?: string;
    updatedAt?: string;
  };
}

export const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  console.log('🔑 Login-Anfrage wird gesendet:', { identifier: credentials.identifier });
  
  // Vor dem Login-Versuch Backend-Verbindung testen
  const isBackendReachable = await testBackendConnection();
  if (!isBackendReachable) {
    return {
      success: false,
      message: 'Backend ist nicht erreichbar. Bitte stellen Sie sicher, dass der Server auf Port 3000 läuft.',
    };
  }
  
  const result = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  console.log('📨 Login-Antwort erhalten:', result);
  return result.data;
};

// **SCHRITT 3: Registrierung-Funktion**
export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    username: string;
    email: string;
    createdAt?: string;
    updatedAt?: string;
  };
}

export const registerUser = async (credentials: RegisterCredentials): Promise<RegisterResponse> => {
  console.log('📝 Registrierung-Anfrage wird gesendet:', { 
    username: credentials.username, 
    email: credentials.email 
  });
  
  const result = await apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  console.log('📨 Registrierung-Antwort erhalten:', result);
  return result.data;
};

// **SCHRITT 4: Session-Status prüfen**
export interface AuthStatusResponse {
  success: boolean;
  user?: {
    id: string;
    username: string;
    email: string;
    createdAt?: string;
    updatedAt?: string;
  };
}

export const checkAuthStatus = async (): Promise<AuthStatusResponse> => {
  console.log(' Auth-Status wird geprüft...');
  
  const result = await apiRequest('/api/auth/status', {
    method: 'GET',
  });

  console.log(' Auth-Status-Antwort erhalten:', result);
  return result.data;
};

// **SCHRITT 5: Logout-Funktion**
export interface LogoutResponse {
  success: boolean;
  message: string;
}

export const logoutUser = async (): Promise<LogoutResponse> => {
  console.log('🚪 Logout-Anfrage wird gesendet...');
  
  const result = await apiRequest('/api/auth/logout', {
    method: 'POST',
  });

  console.log(' Logout-Antwort erhalten:', result);
  return result.data;
};

// **SCHRITT 6: Coffee Spots laden (später implementiert)**
export const getCoffeeSpots = async () => {
  const result = await apiRequest('/api/spots', {
    method: 'GET',
  });
  
  return result.data;
};

// **DEBUGGING: Test-Funktion für Backend-Verbindung**
export const testBackendConnection = async (): Promise<boolean> => {
  try {
    console.log('🔍 Teste Backend-Verbindung...');
    
    const result = await apiRequest('/', {
      method: 'GET',
    });
    
    if (result.success) {
      console.log(' Backend-Verbindung erfolgreich!');
      return true;
    } else {
      console.log(' Backend antwortet mit Fehler:', result.status);
      return false;
    }
  } catch (error) {
    console.error(' Backend-Verbindungstest fehlgeschlagen:', error);
    return false;
  }
};

// Automatischer Backend-Test beim Laden der Datei (nur in Development)
if (process.env.NODE_ENV === 'development') {
  testBackendConnection();
}
