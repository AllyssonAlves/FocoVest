import { Request, Response, NextFunction } from 'express';
declare class MetricsSystem {
    private metrics;
    private startTime;
    recordRequest(req: Request, statusCode: number, responseTime: number): void;
    recordActiveUser(userId: string): void;
    recordUserAction(action: 'registration' | 'login'): void;
    recordError(error: string, endpoint: string, userId?: string): void;
    private updatePerformanceMetrics;
    getMetrics(): {
        timestamp: string;
        uptime: number;
        requests: {
            total: number;
            success: number;
            error: number;
            successRate: string;
            avgResponseTime: string;
            topEndpoints: [string, number][];
            methodDistribution: {
                [k: string]: number;
            };
        };
        users: {
            activeNow: number;
            totalRegistrations: number;
            totalLogins: number;
        };
        performance: {
            memoryUsage: {
                rss: string;
                heapUsed: string;
                heapTotal: string;
            };
            uptime: string;
        };
        errors: {
            total: number;
            recent: {
                timestamp: Date;
                error: string;
                endpoint: string;
                userId?: string;
            }[];
        };
    };
    reset(): void;
}
export declare const metricsSystem: MetricsSystem;
export declare const requestLogger: (req: Request, res: Response, next: NextFunction) => void;
export declare const morganLogger: (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: import("http").ServerResponse<import("http").IncomingMessage>, callback: (err?: Error) => void) => void;
export declare const userActionLogger: (action: "registration" | "login") => (req: Request, res: Response, next: NextFunction) => void;
export declare const errorLogger: (error: Error, req: Request, res: Response, next: NextFunction) => void;
export declare const metricsEndpoint: (req: Request, res: Response) => Response<any, Record<string, any>>;
export {};
//# sourceMappingURL=monitoring.d.ts.map