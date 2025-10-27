import { Request, Response, NextFunction } from 'express';
interface SecurityRequest extends Request {
    fingerprint?: string;
    rateLimitInfo?: {
        remaining: number;
        resetTime: Date;
    };
    securityLog?: {
        timestamp: Date;
        ip: string;
        userAgent: string;
        endpoint: string;
        method: string;
    };
}
interface SecurityOptions {
    enableCSRF?: boolean;
    enableRateLimit?: boolean;
    enableSlowDown?: boolean;
    enableFingerprinting?: boolean;
    trustedProxies?: string[];
    allowedOrigins?: string[];
}
export declare const deviceFingerprinting: (req: SecurityRequest, res: Response, next: NextFunction) => void;
export declare const maliciousPatternDetection: (req: SecurityRequest, res: Response, next: NextFunction) => void;
export declare const csrfProtection: (req: SecurityRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const createRateLimit: (options: {
    windowMs?: number;
    max?: number;
    message?: string;
    skipSuccessfulRequests?: boolean;
}) => import("express-rate-limit").RateLimitRequestHandler;
export declare const createSlowDown: (options: {
    windowMs?: number;
    delayAfter?: number;
    delayMs?: number;
}) => any;
export declare const securityLogger: (req: SecurityRequest, res: Response, next: NextFunction) => void;
export declare const setupSecurity: (app: any, options?: SecurityOptions) => void;
export declare const validators: {
    email: (req: Request, res: Response, next: NextFunction) => void;
    password: (req: Request, res: Response, next: NextFunction) => void;
    name: (req: Request, res: Response, next: NextFunction) => void;
    university: (req: Request, res: Response, next: NextFunction) => void;
};
export declare const handleValidationErrors: (req: Request, res: Response, next: NextFunction) => void;
declare const _default: {
    setupSecurity: (app: any, options?: SecurityOptions) => void;
    createRateLimit: (options: {
        windowMs?: number;
        max?: number;
        message?: string;
        skipSuccessfulRequests?: boolean;
    }) => import("express-rate-limit").RateLimitRequestHandler;
    createSlowDown: (options: {
        windowMs?: number;
        delayAfter?: number;
        delayMs?: number;
    }) => any;
    csrfProtection: (req: SecurityRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
    maliciousPatternDetection: (req: SecurityRequest, res: Response, next: NextFunction) => void;
    deviceFingerprinting: (req: SecurityRequest, res: Response, next: NextFunction) => void;
    securityLogger: (req: SecurityRequest, res: Response, next: NextFunction) => void;
    validators: {
        email: (req: Request, res: Response, next: NextFunction) => void;
        password: (req: Request, res: Response, next: NextFunction) => void;
        name: (req: Request, res: Response, next: NextFunction) => void;
        university: (req: Request, res: Response, next: NextFunction) => void;
    };
    handleValidationErrors: (req: Request, res: Response, next: NextFunction) => void;
};
export default _default;
//# sourceMappingURL=advancedSecurity.d.ts.map