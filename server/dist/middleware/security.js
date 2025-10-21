"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityLogger = exports.sanitizeInput = exports.validateQuery = exports.validateId = exports.validateSimulationCreation = exports.validateLogin = exports.validateRegister = exports.handleValidationErrors = exports.securityMiddleware = void 0;
const helmet_1 = __importDefault(require("helmet"));
const express_validator_1 = require("express-validator");
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
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            success: false,
            message: 'Dados inválidos fornecidos',
            errors: errors.array().map(error => ({
                field: error.type === 'field' ? error.path : 'unknown',
                message: error.msg,
                value: error.type === 'field' ? error.value : undefined
            }))
        });
        return;
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
exports.validateRegister = [
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Nome deve ter entre 2 e 100 caracteres')
        .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
        .withMessage('Nome deve conter apenas letras e espaços'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email deve ter um formato válido')
        .isLength({ max: 255 })
        .withMessage('Email muito longo'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8, max: 128 })
        .withMessage('Senha deve ter entre 8 e 128 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número'),
    (0, express_validator_1.body)('university')
        .optional()
        .isIn(['UVA', 'UECE', 'UFC', 'URCA', 'IFCE', 'ENEM'])
        .withMessage('Universidade deve ser uma das opções válidas'),
    (0, express_validator_1.body)('course')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Curso deve ter no máximo 100 caracteres'),
    (0, express_validator_1.body)('graduationYear')
        .optional()
        .isInt({ min: new Date().getFullYear(), max: new Date().getFullYear() + 10 })
        .withMessage('Ano de graduação deve estar entre o ano atual e 10 anos no futuro'),
    exports.handleValidationErrors
];
exports.validateLogin = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email deve ter um formato válido'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Senha é obrigatória')
        .isLength({ max: 128 })
        .withMessage('Senha muito longa'),
    exports.handleValidationErrors
];
exports.validateSimulationCreation = [
    (0, express_validator_1.body)('title')
        .trim()
        .isLength({ min: 3, max: 200 })
        .withMessage('Título deve ter entre 3 e 200 caracteres'),
    (0, express_validator_1.body)('description')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Descrição deve ter entre 10 e 1000 caracteres'),
    (0, express_validator_1.body)('settings.timeLimit')
        .isInt({ min: 1, max: 600 })
        .withMessage('Tempo limite deve estar entre 1 e 600 minutos'),
    (0, express_validator_1.body)('settings.questionsCount')
        .isInt({ min: 1, max: 200 })
        .withMessage('Número de questões deve estar entre 1 e 200'),
    (0, express_validator_1.body)('settings.subjects')
        .isArray({ min: 1 })
        .withMessage('Pelo menos uma matéria deve ser selecionada'),
    (0, express_validator_1.body)('settings.universities')
        .isArray({ min: 1 })
        .withMessage('Pelo menos uma universidade deve ser selecionada'),
    exports.handleValidationErrors
];
exports.validateId = [
    (0, express_validator_1.param)('id')
        .matches(/^[0-9a-fA-F]{24}$|^mock_\d+$|^\d+$/)
        .withMessage('ID inválido'),
    exports.handleValidationErrors
];
exports.validateQuery = [
    (0, express_validator_1.query)('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Página deve ser um número positivo'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limite deve estar entre 1 e 100'),
    (0, express_validator_1.query)('search')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Busca deve ter no máximo 100 caracteres'),
    exports.handleValidationErrors
];
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
        console.log(`🚨 Tentativa suspeita detectada - IP: ${req.ip}, Path: ${req.path}, Body:`, req.body);
    }
    if (req.query && checkSuspicious(req.query)) {
        console.log(`🚨 Query suspeita detectada - IP: ${req.ip}, Path: ${req.path}, Query:`, req.query);
    }
    next();
};
exports.securityLogger = securityLogger;
//# sourceMappingURL=security.js.map