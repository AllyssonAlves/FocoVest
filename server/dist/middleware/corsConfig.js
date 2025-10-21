"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsConfig = exports.getCorsOptions = exports.corsLogger = exports.devCorsOptions = void 0;
const cors_1 = __importDefault(require("cors"));
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://focovest.com',
    'https://www.focovest.com',
    'https://focovest-platform.vercel.app',
];
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) {
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            console.log(`🚨 CORS blocked origin: ${origin}`);
            callback(new Error('Acesso negado pela política CORS'), false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'X-API-Key',
        'X-User-Agent'
    ],
    exposedHeaders: [
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining',
        'X-RateLimit-Reset'
    ],
    optionsSuccessStatus: 200,
    preflightContinue: false,
    maxAge: 86400
};
exports.devCorsOptions = {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['*'],
    exposedHeaders: [
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining',
        'X-RateLimit-Reset'
    ]
};
const corsLogger = (req, res, next) => {
    const origin = req.get('origin');
    if (origin && process.env.NODE_ENV === 'development') {
        console.log(`🌐 CORS request from: ${origin}`);
    }
    next();
};
exports.corsLogger = corsLogger;
const getCorsOptions = () => {
    return process.env.NODE_ENV === 'production' ? corsOptions : exports.devCorsOptions;
};
exports.getCorsOptions = getCorsOptions;
exports.corsConfig = process.env.NODE_ENV === 'production'
    ? corsOptions
    : exports.devCorsOptions;
exports.default = (0, cors_1.default)(exports.corsConfig);
//# sourceMappingURL=corsConfig.js.map