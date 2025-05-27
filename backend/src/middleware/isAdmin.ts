// src/middleware/isAdmin.ts
import { Request, Response, NextFunction } from 'express';

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.isAdmin !== true) {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};

