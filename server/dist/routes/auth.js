"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthService_1 = require("../services/AuthService");
const auth_1 = require("../middleware/auth");
const security_1 = require("../middleware/security");
const rateLimiting_1 = require("../middleware/rateLimiting");
const monitoring_1 = require("../middleware/monitoring");
const TokenBlacklistService_1 = require("../services/TokenBlacklistService");
const router = (0, express_1.Router)();
router.post('/register', rateLimiting_1.registerRateLimit, security_1.validateRegister, security_1.handleValidationErrors, (0, monitoring_1.userActionLogger)('registration'), async (req, res) => {
    try {
        const { name, email, password, university, course, graduationYear } = req.body;
        const result = await AuthService_1.AuthService.register({
            name,
            email,
            password,
            university,
            course,
            graduationYear
        });
        return res.status(201).json(result);
    }
    catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Erro interno do servidor'
        });
    }
});
router.post('/login', rateLimiting_1.authRateLimit, security_1.validateLogin, security_1.handleValidationErrors, (0, monitoring_1.userActionLogger)('login'), async (req, res) => {
    try {
        const { email, password, rememberMe, deviceInfo } = req.body;
        const result = await AuthService_1.AuthService.login({
            email,
            password,
            rememberMe,
            deviceInfo
        }, req);
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Erro interno do servidor'
        });
    }
});
router.post('/verify-email', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token de verificação é obrigatório'
            });
        }
        const result = await AuthService_1.AuthService.verifyEmail(token);
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Erro interno do servidor'
        });
    }
});
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email é obrigatório'
            });
        }
        const result = await AuthService_1.AuthService.forgotPassword(email);
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Erro interno do servidor'
        });
    }
});
router.post('/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.status(400).json({
                success: false,
                message: 'Token e nova senha são obrigatórios'
            });
        }
        const result = await AuthService_1.AuthService.resetPassword(token, password);
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Erro interno do servidor'
        });
    }
});
router.post('/change-password', auth_1.requireAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Senha atual e nova senha são obrigatórias'
            });
        }
        const result = await AuthService_1.AuthService.changePassword(req.user._id.toString(), currentPassword, newPassword);
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Erro interno do servidor'
        });
    }
});
router.get('/me', TokenBlacklistService_1.checkTokenBlacklist, auth_1.requireAuth, async (req, res) => {
    try {
        const user = req.user;
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            university: user.university,
            course: user.course,
            graduationYear: user.graduationYear,
            role: user.role,
            level: user.level,
            experience: user.experience,
            statistics: user.statistics,
            isEmailVerified: user.isEmailVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
        return res.status(200).json({
            success: true,
            message: 'Dados do usuário obtidos com sucesso',
            data: { user: userResponse }
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Erro interno do servidor'
        });
    }
});
router.post('/refresh-token', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token é obrigatório'
            });
        }
        const user = await AuthService_1.AuthService.validateRefreshToken(refreshToken);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token inválido ou expirado'
            });
        }
        const result = await AuthService_1.AuthService.refreshToken(user);
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Erro interno do servidor'
        });
    }
});
router.post('/logout', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        const { refreshToken, userId } = req.body;
        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token é obrigatório para logout'
            });
        }
        const result = await AuthService_1.AuthService.logout(token, refreshToken, userId);
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});
router.post('/logout-all', TokenBlacklistService_1.checkTokenBlacklist, auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const result = await AuthService_1.AuthService.logoutAllDevices(userId);
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});
router.get('/sessions', TokenBlacklistService_1.checkTokenBlacklist, auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const result = await AuthService_1.AuthService.getUserSessions(userId);
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});
router.get('/security-alerts', TokenBlacklistService_1.checkTokenBlacklist, auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const limit = parseInt(req.query.limit) || 10;
        const { SecurityNotificationService } = await Promise.resolve().then(() => __importStar(require('../services/SecurityNotificationService')));
        const alerts = await SecurityNotificationService.getUserSecurityAlerts(userId, limit);
        const stats = await SecurityNotificationService.getSecurityStats(userId);
        return res.status(200).json({
            success: true,
            data: {
                alerts,
                stats
            }
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map