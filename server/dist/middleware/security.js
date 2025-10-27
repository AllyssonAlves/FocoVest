"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityLogger = exports.sanitizeInput = exports.validateQuery = exports.validateId = exports.validateSimulationCreation = exports.validateLogin = exports.validateRegister = exports.handleValidationErrors = exports.securityMiddleware = void 0;
const helmet_1 = __importDefault(require("helmet"));
const secureValidation_1 = require("./secureValidation");
const logger_1 = require("../utils/logger");
exports.securityMiddleware = (0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'", "http://localhost:3000", "http://localhost:5000"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: []
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: false,
    referrerPolicy: { policy: "no-referrer" },
    xssFilter: true
});
const handleValidationErrors = (errors) => {
    return (req, res, next) => {
        if (errors.length > 0) {
            res.status(400).json({
                success: false,
                message: 'Dados inválidos fornecidos',
                errors: errors.map(error => ({
                    field: error.field,
                    message: error.message,
                    value: error.value
                }))
            });
            return;
        }
        next();
    };
};
exports.handleValidationErrors = handleValidationErrors;
exports.validateRegister = (0, secureValidation_1.validate)(new secureValidation_1.SecureValidator()
    .field('name').required().isString().minLength(2).maxLength(100).matches(/^[a-zA-ZÀ-ÿ\s]+$/).build()
    .field('email').required().isEmail().maxLength(255).build()
    .field('password').required().isPassword().minLength(8).maxLength(128).build()
    .field('university').optional().isString().custom((value) => {
    const valid = ['UVA', 'UECE', 'UFC', 'URCA', 'IFCE', 'ENEM'];
    return !value || valid.includes(value) || 'Universidade deve ser uma das opções válidas';
}).build()
    .field('course').optional().isString().maxLength(100).build()
    .field('graduationYear').optional().isNumber().custom((value) => {
    const currentYear = new Date().getFullYear();
    const num = Number(value);
    return !value || (num >= currentYear && num <= currentYear + 10) ||
        'Ano de graduação deve estar entre o ano atual e 10 anos no futuro';
}).build());
exports.validateLogin = (0, secureValidation_1.validate)(new secureValidation_1.SecureValidator()
    .field('email').required().isEmail().build()
    .field('password').required().isString().minLength(6).maxLength(128).build()
    .field('rememberMe').optional().isBoolean().build()
    .field('deviceInfo').optional().custom((value) => {
    if (value && typeof value === 'object') {
        const { userAgent, platform, language, browser, os, ip } = value;
        if (userAgent && (typeof userAgent !== 'string' || userAgent.length > 500)) {
            return 'UserAgent deve ser uma string válida (máximo 500 caracteres)';
        }
        if (platform && (typeof platform !== 'string' || platform.length > 100)) {
            return 'Platform deve ser uma string válida (máximo 100 caracteres)';
        }
        if (language && (typeof language !== 'string' || language.length > 20)) {
            return 'Language deve ser uma string válida (máximo 20 caracteres)';
        }
        if (browser && (typeof browser !== 'string' || browser.length > 100)) {
            return 'Browser deve ser uma string válida (máximo 100 caracteres)';
        }
        if (os && (typeof os !== 'string' || os.length > 100)) {
            return 'OS deve ser uma string válida (máximo 100 caracteres)';
        }
        if (ip && (typeof ip !== 'string' || ip.length > 45)) {
            return 'IP deve ser uma string válida (máximo 45 caracteres)';
        }
        return true;
    }
    return true;
}).build());
exports.validateSimulationCreation = (0, secureValidation_1.validate)(new secureValidation_1.SecureValidator()
    .field('title').required().isString().minLength(3).maxLength(200).build()
    .field('description').required().isString().minLength(10).maxLength(1000).build()
    .field('settings').required().custom((settings) => {
    if (!settings || typeof settings !== 'object')
        return 'Settings é obrigatório';
    const timeLimit = Number(settings.timeLimit);
    if (!timeLimit || timeLimit < 1 || timeLimit > 600) {
        return 'Tempo limite deve estar entre 1 e 600 minutos';
    }
    const questionsCount = Number(settings.questionsCount);
    if (!questionsCount || questionsCount < 1 || questionsCount > 200) {
        return 'Número de questões deve estar entre 1 e 200';
    }
    if (!Array.isArray(settings.subjects) || settings.subjects.length === 0) {
        return 'Pelo menos uma matéria deve ser selecionada';
    }
    if (!Array.isArray(settings.universities) || settings.universities.length === 0) {
        return 'Pelo menos uma universidade deve ser selecionada';
    }
    return true;
}).build());
exports.validateId = (0, secureValidation_1.validate)(new secureValidation_1.SecureValidator()
    .field('id').required().isString()
    .matches(/^[0-9a-fA-F]{24}$|^mock_\d+$|^\d+$/)
    .build());
exports.validateQuery = (0, secureValidation_1.validate)(new secureValidation_1.SecureValidator()
    .field('page').optional().isNumber().custom((value) => {
    const num = Number(value);
    return !value || num >= 1 || 'Página deve ser um número positivo';
}).build()
    .field('limit').optional().isNumber().custom((value) => {
    const num = Number(value);
    return !value || (num >= 1 && num <= 100) || 'Limite deve estar entre 1 e 100';
}).build()
    .field('search').optional().isString().maxLength(100).build());
const sanitizeInput = (req, res, next) => {
    const sanitize = (obj) => {
        if (typeof obj === 'string') {
            return obj.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        }
        if (Array.isArray(obj)) {
            return obj.map(sanitize);
        }
        if (obj && typeof obj === 'object') {
            const sanitized = {};
            for (const key in obj) {
                sanitized[key] = sanitize(obj[key]);
            }
            return sanitized;
        }
        return obj;
    };
    if (req.body) {
        req.body = sanitize(req.body);
    }
    if (req.query) {
        req.query = sanitize(req.query);
    }
    next();
};
exports.sanitizeInput = sanitizeInput;
const securityLogger = (req, res, next) => {
    const suspiciousPatterns = [
        /script/i,
        /javascript/i,
        /eval\(/i,
        /onload/i,
        /onerror/i
    ];
    const checkSuspicious = (data) => {
        const str = JSON.stringify(data).toLowerCase();
        return suspiciousPatterns.some(pattern => pattern.test(str));
    };
    if (req.body && checkSuspicious(req.body)) {
        const requestLogger = (0, logger_1.createRequestLogger)(req);
        requestLogger.securityEvent('Suspicious request body detected', 'medium', { body: req.body });
    }
    if (req.query && checkSuspicious(req.query)) {
        const requestLogger = (0, logger_1.createRequestLogger)(req);
        requestLogger.securityEvent('Suspicious query detected', 'medium', { query: req.query });
    }
    next();
};
exports.securityLogger = securityLogger;
//# sourceMappingURL=security.js.map