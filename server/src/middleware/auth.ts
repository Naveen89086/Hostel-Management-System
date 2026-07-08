import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AuthRequest, JwtPayload } from '../types';
import { AppError } from './errorHandler';

export const protect = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return next(new AppError('Not authorized. No token provided.', 401));
    }

    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    // Check Maintenance Mode
    const settings = await import('../models/Settings').then(m => m.default.findOne());
    if (settings?.maintenanceMode && req.user.role !== 'admin') {
      return next(new AppError('The system is currently under maintenance. Please try again later.', 403));
    }

    next();
  } catch (error) {
    return next(new AppError('Not authorized. Invalid token.', 401));
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError('Not authorized to access this resource.', 403)
      );
    }
    next();
  };
};
