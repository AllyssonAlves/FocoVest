"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const MockUserService_1 = require("../services/MockUserService");
const router = (0, express_1.Router)();
router.get('/profile', async (req, res) => {
    try {
        console.log('GET /api/users/profile - Buscando perfil do usuário');
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token de acesso necessário'
            });
        }
        const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        const user = await MockUserService_1.mockUserDB.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }
        const { password, ...userProfile } = user;
        return res.json({
            success: true,
            data: userProfile
        });
    }
    catch (error) {
        console.error('Erro ao buscar perfil:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.put('/profile', async (req, res) => {
    try {
        console.log('PUT /api/users/profile - Atualizando perfil do usuário');
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token de acesso necessário'
            });
        }
        const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        const userId = decoded.userId;
        const updateData = req.body;
        const updatedUser = await MockUserService_1.mockUserDB.findByIdAndUpdate(userId, updateData);
        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }
        const { password, ...userProfile } = updatedUser;
        return res.json({
            success: true,
            data: userProfile
        });
    }
    catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.put('/statistics', async (req, res) => {
    try {
        console.log('PUT /api/users/statistics - Atualizando estatísticas do usuário');
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token de acesso necessário'
            });
        }
        const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        const userId = decoded.userId;
        const { simulationResults } = req.body;
        if (!simulationResults) {
            return res.status(400).json({
                success: false,
                message: 'Dados do simulado são obrigatórios'
            });
        }
        const currentUser = await MockUserService_1.mockUserDB.findById(userId);
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }
        const currentStats = currentUser.statistics || {
            totalSimulations: 0,
            totalQuestions: 0,
            correctAnswers: 0,
            averageScore: 0,
            timeSpent: 0,
            streakDays: 0,
            lastSimulationDate: null
        };
        const newStats = {
            totalSimulations: currentStats.totalSimulations + 1,
            totalQuestions: currentStats.totalQuestions + simulationResults.totalQuestions,
            correctAnswers: currentStats.correctAnswers + simulationResults.correctAnswers,
            timeSpent: currentStats.timeSpent + simulationResults.timeSpent,
            lastSimulationDate: new Date().toISOString(),
            streakDays: currentStats.streakDays,
            averageScore: 0
        };
        newStats.averageScore = Math.round((newStats.correctAnswers / newStats.totalQuestions) * 100);
        const updatedUser = await MockUserService_1.mockUserDB.findByIdAndUpdate(userId, {
            statistics: newStats,
            experience: currentUser.experience + simulationResults.score * 10,
            updatedAt: new Date()
        });
        if (!updatedUser) {
            return res.status(500).json({
                success: false,
                message: 'Erro ao atualizar estatísticas'
            });
        }
        console.log('✅ Estatísticas atualizadas:', newStats);
        return res.json({
            success: true,
            data: {
                statistics: updatedUser.statistics,
                experience: updatedUser.experience
            }
        });
    }
    catch (error) {
        console.error('Erro ao atualizar estatísticas:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map