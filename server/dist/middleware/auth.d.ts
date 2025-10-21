import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/User';
export interface AuthRequest extends Request {
    user?: IUser;
}
export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
    iat: number;
    exp: number;
}
export declare const generateToken: (user: IUser) => string;
export declare const verifyToken: (token: string) => JWTPayload;
export declare const authenticateToken: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const requireAuth: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const optionalAuth: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const requireRole: (roles: string | string[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const requireEmailVerification: (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map