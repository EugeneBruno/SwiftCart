// src/middleware/isAdmin.ts
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';

export const isAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.isAdmin !== true) {
    res.status(403).json({ message: 'Access denied. Admin only.' });
    return;
  }
  next();
};
