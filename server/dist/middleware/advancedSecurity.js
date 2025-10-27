"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleValidationErrors = exports.validators = exports.setupSecurity = exports.securityLogger = exports.createSlowDown = exports.createRateLimit = exports.csrfProtection = exports.maliciousPatternDetection = exports.deviceFingerprinting = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_slow_down_1 = __importDefault(require("express-slow-down"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const secureValidation_1 = require("./secureValidation");
const crypto_1 = __importDefault(require("crypto"));
const csrfTokens = new Map();
const CSRF_TOKEN_LIFETIME = 30 * 60 * 1000;
const MALICIOUS_PATTERNS = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+\b)/i,
    /(;\s*--|\|\||&&)/i,
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /\.\.[\/\\]/g,
    /[;&|`$(){}[\]]/g
];
const generateFingerprint = (req) => {
    const components = [
        req.ip,
        req.get('User-Agent') || '',
        req.get('Accept-Language') || '',
        req.get('Accept-Encoding') || '',
        req.get('Accept') || ''
    ];
    return crypto_1.default
        .createHash('sha256')
        .update(components.join('|'))
        .digest('hex')
        .substring(0, 16);
};
const deviceFingerprinting = (req, res, next) => {
    req.fingerprint = generateFingerprint(req);
    res.setHeader('X-Device-Fingerprint', req.fingerprint);
    next();
};
exports.deviceFingerprinting = deviceFingerprinting;
const maliciousPatternDetection = (req, res, next) => {
    const checkValue = (value, source) => {
        for (const pattern of MALICIOUS_PATTERNS) {
            if (pattern.test(value)) {
                console.warn(`🚨 Padrão malicioso detectado em ${source}:`, {
                    pattern: pattern.toString(),
                    value: value.substring(0, 100),
                    ip: req.ip,
                    userAgent: req.get('User-Agent'),
                    timestamp: new Date().toISOString()
                });
                res.status(400).json({
                    error: 'Requisição contém dados suspeitos',
                    code: 'MALICIOUS_PATTERN_DETECTED'
                });
                return true;
            }
        }
        return false;
    };
    Object.entries(req.params).forEach(([key, value]) => {
        if (typeof value === 'string') {
            checkValue(value, `params.${key}`);
        }
    });
    Object.entries(req.query).forEach(([key, value]) => {
        if (typeof value === 'string') {
            checkValue(value, `query.${key}`);
        }
    });
    if (req.body && typeof req.body === 'object') {
        const checkObject = (obj, prefix = 'body') => {
            Object.entries(obj).forEach(([key, value]) => {
                if (typeof value === 'string') {
                    checkValue(value, `${prefix}.${key}`);
                }
                else if (value && typeof value === 'object') {
                    checkObject(value, `${prefix}.${key}`);
                }
            });
        };
        checkObject(req.body);
    }
    next();
};
exports.maliciousPatternDetection = maliciousPatternDetection;
const csrfProtection = (req, res, next) => {
    const now = Date.now();
    for (const [key, value] of csrfTokens.entries()) {
        if (now - value.timestamp > CSRF_TOKEN_LIFETIME) {
            csrfTokens.delete(key);
        }
    }
    if (req.method === 'GET') {
        const token = crypto_1.default.randomBytes(32).toString('hex');
        const sessionId = req.fingerprint || req.ip || 'unknown';
        csrfTokens.set(sessionId, {
            token,
            timestamp: now
        });
        res.setHeader('X-CSRF-Token', token);
        return next();
    }
    const clientToken = req.get('X-CSRF-Token') || (req.body && req.body._csrf);
    const sessionId = req.fingerprint || req.ip || 'unknown';
    const storedToken = csrfTokens.get(sessionId);
    if (!clientToken || !storedToken || clientToken !== storedToken.token) {
        console.warn('🚨 Token CSRF inválido ou ausente:', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            endpoint: req.path,
            method: req.method,
            timestamp: new Date().toISOString()
        });
        return res.status(403).json({
            error: 'Token CSRF inválido ou ausente',
            code: 'INVALID_CSRF_TOKEN'
        });
    }
    next();
};
exports.csrfProtection = csrfProtection;
const createRateLimit = (options) => {
    return (0, express_rate_limit_1.default)({
        windowMs: options.windowMs || 15 * 60 * 1000,
        max: options.max || 100,
        message: {
            error: options.message || 'Muitas requisições. Tente novamente mais tarde.',
            code: 'RATE_LIMIT_EXCEEDED'
        },
        standardHeaders: true,
        legacyHeaders: false,
        skipSuccessfulRequests: options.skipSuccessfulRequests || false,
        handler: (req, res) => {
            console.warn('🚨 Rate limit excedido:', {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                endpoint: req.path,
                method: req.method,
                timestamp: new Date().toISOString()
            });
            res.status(429).json({
                error: 'Muitas requisições. Tente novamente mais tarde.',
                code: 'RATE_LIMIT_EXCEEDED',
                retryAfter: Math.ceil(options.windowMs / 1000)
            });
        }
    });
};
exports.createRateLimit = createRateLimit;
const createSlowDown = (options) => {
    return (0, express_slow_down_1.default)({
        windowMs: options.windowMs || 15 * 60 * 1000,
        delayAfter: options.delayAfter || 50,
        delayMs: options.delayMs || 100,
        maxDelayMs: 20000,
    });
};
exports.createSlowDown = createSlowDown;
const securityLogger = (req, res, next) => {
    req.securityLog = {
        timestamp: new Date(),
        ip: req.ip || 'unknown',
        userAgent: req.get('User-Agent') || 'Unknown',
        endpoint: req.path,
        method: req.method
    };
    const suspiciousPatterns = [
        /admin/i,
        /wp-admin/i,
        /phpmyadmin/i,
        /\.php$/,
        /\.asp$/,
        /\.jsp$/,
        /\/etc\/passwd/,
        /\/proc\//
    ];
    if (suspiciousPatterns.some(pattern => pattern.test(req.path))) {
        console.warn('🚨 Tentativa de acesso suspeito:', req.securityLog);
    }
    const suspiciousUserAgents = [
        /bot/i,
        /crawler/i,
        /spider/i,
        /scanner/i,
        /curl/i,
        /wget/i
    ];
    const userAgent = req.get('User-Agent') || '';
    if (suspiciousUserAgents.some(pattern => pattern.test(userAgent))) {
        console.warn('🚨 User-Agent suspeito detectado:', {
            userAgent,
            ip: req.ip,
            endpoint: req.path,
            timestamp: new Date().toISOString()
        });
    }
    next();
};
exports.securityLogger = securityLogger;
const setupSecurity = (app, options = {}) => {
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:"],
                fontSrc: ["'self'"],
                connectSrc: ["'self'"],
                frameSrc: ["'none'"],
                objectSrc: ["'none'"],
            },
        },
        crossOriginEmbedderPolicy: false
    }));
    app.use((0, cors_1.default)({
        origin: options.allowedOrigins || process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
        credentials: true,
        optionsSuccessStatus: 200
    }));
    app.use((0, compression_1.default)());
    if (options.trustedProxies?.length) {
        app.set('trust proxy', options.trustedProxies);
    }
    app.use(exports.securityLogger);
    if (options.enableFingerprinting !== false) {
        app.use(exports.deviceFingerprinting);
    }
    app.use(exports.maliciousPatternDetection);
    if (options.enableCSRF !== false) {
        app.use(exports.csrfProtection);
    }
    if (options.enableRateLimit !== false) {
        app.use((0, exports.createRateLimit)({
            windowMs: 15 * 60 * 1000,
            max: 100
        }));
    }
    if (options.enableSlowDown !== false) {
        app.use((0, exports.createSlowDown)({
            windowMs: 15 * 60 * 1000,
            delayAfter: 50,
            delayMs: 100
        }));
    }
};
exports.setupSecurity = setupSecurity;
exports.validators = {
    email: (0, secureValidation_1.validate)(new secureValidation_1.SecureValidator()
        .field('email').required().isEmail().maxLength(255).build()),
    password: (0, secureValidation_1.validate)(new secureValidation_1.SecureValidator()
        .field('password').required().isPassword().minLength(8).maxLength(128)
        .custom((value) => {
        const hasSpecial = /[@$!%*?&]/.test(value);
        return hasSpecial || 'Senha deve incluir pelo menos um caractere especial (@$!%*?&)';
    }).build()),
    name: (0, secureValidation_1.validate)(new secureValidation_1.SecureValidator()
        .field('name').required().isString().minLength(2).maxLength(100)
        .matches(/^[a-zA-ZÀ-ÿ\s]+$/).build()),
    university: (0, secureValidation_1.validate)(new secureValidation_1.SecureValidator()
        .field('university').optional().isString().maxLength(100)
        .matches(/^[a-zA-ZÀ-ÿ\s\-\.]+$/).build())
};
const handleValidationErrors = (req, res, next) => {
    next();
};
exports.handleValidationErrors = handleValidationErrors;
exports.default = {
    setupSecurity: exports.setupSecurity,
    createRateLimit: exports.createRateLimit,
    createSlowDown: exports.createSlowDown,
    csrfProtection: exports.csrfProtection,
    maliciousPatternDetection: exports.maliciousPatternDetection,
    deviceFingerprinting: exports.deviceFingerprinting,
    securityLogger: exports.securityLogger,
    validators: exports.validators,
    handleValidationErrors: exports.handleValidationErrors
};
//# sourceMappingURL=advancedSecurity.js.map