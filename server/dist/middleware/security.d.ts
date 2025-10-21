import { Request, Response, NextFunction } from 'express';
export declare const securityMiddleware: (req: import("http").IncomingMessage, res: import("http").ServerResponse, next: (err?: unknown) => void) => void;
export declare const handleValidationErrors: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateRegister: (((req: Request, res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
export declare const validateLogin: (((req: Request, res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
export declare const validateSimulationCreation: (((req: Request, res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
export declare const validateId: (((req: Request, res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
export declare const validateQuery: (((req: Request, res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
export declare const sanitizeInput: (req: Request, res: Response, next: NextFunction) => void;
export declare const securityLogger: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=security.d.ts.map