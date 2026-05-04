import { NextFunction, Request, Response } from 'express';
import status from 'http-status';
import AppError from '../errorHelpers/AppError';
import { auth } from '../lib/auth';
import { fromNodeHeaders } from 'better-auth/node';

const requireAuth = (...requiredRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      if (!session || !session.user) {
        throw new AppError(status.UNAUTHORIZED, 'You are not authorized');
      }

      const userRole = (session.user as any).role;

      if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
        throw new AppError(status.FORBIDDEN, 'You do not have permission to access this route');
      }

      (req as any).user = session.user;
      next();
    } catch (error: any) {
      next(error);
    }
  };
};

export default requireAuth;
