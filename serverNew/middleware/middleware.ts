import { Request, Response, NextFunction } from 'express';

// Erweiterung des express-session Moduls um zusätzliche Felder in der SessionData-Definition
declare module 'express-session' {
  interface SessionData {
    userId?: string;    // ID des eingeloggten Benutzers (optional)
    username?: string;  // Benutzername des eingeloggten Benutzers (optional)
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  // Prüfen, ob eine Session existiert und ob userId gesetzt ist (d.h. Benutzer ist eingeloggt)
  if (req.session && req.session.userId) {
    return next(); // Wenn eingeloggt → nächsten Middleware-/Routen-Handler aufrufen
  } else {
    // Wenn nicht eingeloggt → HTTP 401 (Unauthorized) zurückgeben
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in.'
    });
  }
};
