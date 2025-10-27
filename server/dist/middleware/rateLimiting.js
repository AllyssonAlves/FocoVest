"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSimulationRateLimit = exports.simulationRateLimit = exports.registerRateLimit = exports.authRateLimit = exports.generalRateLimit = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.generalRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'development' ? 10000 : 100,
    message: {
        success: false,
        message: 'Muitas requisições deste IP, tente novamente em 15 minutos.',
        retryAfter: 15 * 60
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        if (process.env.NODE_ENV === 'development' &&
            (req.ip === '::1' || req.ip === '127.0.0.1' || req.ip?.includes('localhost'))) {
            return true;
        }
        return false;
    },
    handler: (req, res) => {
        console.log(`⚠️ Rate limit atingido para IP: ${req.ip} - Path: ${req.path}`);
        res.status(429).json({
            success: false,
            message: 'Muitas requisições deste IP, tente novamente em 15 minutos.',
            retryAfter: 15 * 60
        });
    }
});
exports.authRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'development' ? 100 : 5,
    message: {
        success: false,
        message: 'Muitas tentativas de login, tente novamente em 15 minutos.',
        retryAfter: 15 * 60
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    skip: (req) => {
        if (process.env.NODE_ENV === 'development' &&
            (req.ip === '::1' || req.ip === '127.0.0.1' || req.ip?.includes('localhost'))) {
            return true;
        }
        return false;
    },
    handler: (req, res) => {
        console.log(`🚨 Rate limit de auth atingido para IP: ${req.ip}`);
        res.status(429).json({
            success: false,
            message: 'Muitas tentativas de login falharam. Tente novamente em 15 minutos.',
            retryAfter: 15 * 60
        });
    }
});
exports.registerRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: {
        success: false,
        message: 'Muitas contas criadas deste IP, tente novamente em 1 hora.',
        retryAfter: 60 * 60
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        console.log(`🚨 Rate limit de registro atingido para IP: ${req.ip}`);
        res.status(429).json({
            success: false,
            message: 'Limite de criação de contas atingido. Tente novamente em 1 hora.',
            retryAfter: 60 * 60
        });
    }
});
exports.simulationRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 5 * 60 * 1000,
    max: process.env.NODE_ENV === 'development' ? 5000 : 20,
    message: {
        success: false,
        message: 'Muitas requisições de simulados, aguarde alguns minutos.',
        retryAfter: 5 * 60
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        if (process.env.NODE_ENV === 'development' &&
            (req.ip === '::1' || req.ip === '127.0.0.1' || req.ip?.includes('localhost'))) {
            return true;
        }
        return false;
    }
});
const userRateLimitStore = {};
const userSimulationRateLimit = (req, res, next) => {
    if (!req.user || !req.user._id) {
        return next();
    }
    const userId = req.user._id.toString();
    const now = Date.now();
    const windowMs = 60 * 1000;
    const maxRequests = 10;
    if (!userRateLimitStore[userId] || now > userRateLimitStore[userId].resetTime) {
        userRateLimitStore[userId] = {
            count: 1,
            resetTime: now + windowMs
        };
        return next();
    }
    if (userRateLimitStore[userId].count >= maxRequests) {
        return res.status(429).json({
            success: false,
            message: 'Limite de simulados por minuto atingido. Aguarde um pouco.',
            retryAfter: Math.ceil((userRateLimitStore[userId].resetTime - now) / 1000)
        });
    }
    userRateLimitStore[userId].count++;
    next();
};
exports.userSimulationRateLimit = userSimulationRateLimit;
setInterval(() => {
    const now = Date.now();
    Object.keys(userRateLimitStore).forEach(userId => {
        if (now > userRateLimitStore[userId].resetTime) {
            delete userRateLimitStore[userId];
        }
    });
}, 5 * 60 * 1000);
//# sourceMappingURL=rateLimiting.js.map