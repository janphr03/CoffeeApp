import { useLocation } from 'react-router-dom';

/**
 * Custom Hook für Login-Redirects
 * Erstellt Links zur Login/Register-Seite mit der aktuellen Seite als Redirect-Parameter
 */
export const useAuthRedirect = () => {
  const location = useLocation();
  
  // Aktuelle URL (ohne /login oder /register) als Redirect-Parameter
  const currentPath = location.pathname;
  const isAuthPage = currentPath === '/login' || currentPath === '/register';
  
  // Bei Auth-Seiten zur Startseite redirecten, sonst zur aktuellen Seite
  const redirectTo = isAuthPage ? '/' : currentPath;
  
  return {
    loginUrl: `/login?redirect=${encodeURIComponent(redirectTo)}`,
    registerUrl: `/register?redirect=${encodeURIComponent(redirectTo)}`,
    loginState: { from: { pathname: redirectTo } },
    registerState: { from: { pathname: redirectTo } }
  };
};
