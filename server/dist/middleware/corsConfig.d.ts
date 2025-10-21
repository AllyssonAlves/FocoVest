import cors from 'cors';
import { Request } from 'express';
export declare const devCorsOptions: cors.CorsOptions;
export declare const corsLogger: (req: Request, res: any, next: any) => void;
export declare const getCorsOptions: () => cors.CorsOptions;
export declare const corsConfig: cors.CorsOptions;
declare const _default: (req: cors.CorsRequest, res: {
    statusCode?: number | undefined;
    setHeader(key: string, value: string): any;
    end(): any;
}, next: (err?: any) => any) => void;
export default _default;
//# sourceMappingURL=corsConfig.d.ts.map