import { Response } from 'express';
export declare const generalRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const authRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const registerRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const simulationRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const userSimulationRateLimit: (req: any, res: Response, next: any) => any;
//# sourceMappingURL=rateLimiting.d.ts.map