"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthService_1 = require("../services/AuthService");
const auth_1 = require("../middleware/auth");
const security_1 = require("../middleware/security");
const rateLimiting_1 = require("../middleware/rateLimiting");
const monitoring_1 = require("../middleware/monitoring");
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
router.post('/login', security_1.validateLogin, security_1.handleValidationErrors, (0, monitoring_1.userActionLogger)('login'), async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await AuthService_1.AuthService.login({ email, password });
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
router.get('/me', auth_1.requireAuth, async (req, res) => {
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
router.post('/refresh-token', auth_1.requireAuth, async (req, res) => {
    try {
        const result = await AuthService_1.AuthService.refreshToken(req.user);
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
        return res.status(200).json({
            success: true,
            message: 'Logout realizado com sucesso'
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