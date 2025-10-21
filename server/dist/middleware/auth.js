"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireEmailVerification = exports.requireRole = exports.optionalAuth = exports.requireAuth = exports.authenticateToken = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const User_1 = __importDefault(require("../models/User"));
const errorHandler_1 = require("./errorHandler");
const generateToken = (user) => {
    const payload = {
        userId: user._id,
        email: user.email,
        role: user.role
    };
    return jsonwebtoken_1.default.sign(payload, database_1.config.jwt.secret, { expiresIn: '7d' });
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, database_1.config.jwt.secret);
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw (0, errorHandler_1.createError)('Token expirado', 401);
        }
        else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw (0, errorHandler_1.createError)('Token inválido', 401);
        }
        else {
            throw (0, errorHandler_1.createError)('Erro ao verificar token', 401);
        }
    }
};
exports.verifyToken = verifyToken;
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({
                success: false,
                message: 'Token de acesso requerido'
            });
            return;
        }
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.substring(7)
            : authHeader;
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Token de acesso requerido'
            });
            return;
        }
        const decoded = (0, exports.verifyToken)(token);
        const isMongoAvailable = () => {
            try {
                const mongoose = require('mongoose');
                return mongoose.connection.readyState === 1;
            }
            catch (error) {
                return false;
            }
        };
        let user;
        if (isMongoAvailable()) {
            user = await User_1.default.findById(decoded.userId).select('+password');
        }
        else {
            const { MockUser } = require('../services/MockUserService');
            user = await MockUser.findById(decoded.userId);
        }
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Usuário não encontrado'
            });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: error.message || 'Token inválido'
        });
        return;
    }
};
exports.authenticateToken = authenticateToken;
exports.requireAuth = exports.authenticateToken;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return next();
        }
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.substring(7)
            : authHeader;
        if (!token) {
            return next();
        }
        const isMongoAvailable = () => {
            try {
                const mongoose = require('mongoose');
                return mongoose.connection.readyState === 1;
            }
            catch (error) {
                return false;
            }
        };
        const decoded = (0, exports.verifyToken)(token);
        let user;
        if (isMongoAvailable()) {
            user = await User_1.default.findById(decoded.userId);
        }
        else {
            const { MockUser } = require('../services/MockUserService');
            user = await MockUser.findById(decoded.userId);
        }
        if (user) {
            req.user = user;
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Acesso negado. Faça login primeiro.'
            });
            return;
        }
        const userRoles = Array.isArray(roles) ? roles : [roles];
        if (!userRoles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: 'Acesso negado. Permissões insuficientes.'
            });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
const requireEmailVerification = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Acesso negado. Faça login primeiro.'
        });
        return;
    }
    if (!req.user.isEmailVerified) {
        res.status(403).json({
            success: false,
            message: 'Email não verificado. Verifique seu email antes de continuar.',
            requiresEmailVerification: true
        });
        return;
    }
    next();
};
exports.requireEmailVerification = requireEmailVerification;
//# sourceMappingURL=auth.js.map