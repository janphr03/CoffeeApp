import { Request, Response, NextFunction } from 'express';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    username?: string;
  }
}


export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session.userId) {
    return next();
  } else {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required. Please log in.' 
    });
  }
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
// Diese Middleware prüft nicht auf Authentifizierung und leitet einfach weiter.
// Kann verwendet werden, um optional zu prüfen, ob ein User eingeloggt ist.
  next();
};