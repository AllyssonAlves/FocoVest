import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { UserRole } from '../../../shared/dist/types';

export const adminMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Acesso negado. Faça login primeiro.'
    });
    return;
  }

  if (req.user.role !== UserRole.ADMIN) {
    res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas administradores podem realizar esta ação.'
    });
    return;
  }

  next();
};