"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const MockUserService_1 = require("../services/MockUserService");
const router = (0, express_1.Router)();
router.get('/', auth_1.requireAuth, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const users = MockUserService_1.mockUserDB.getAllUsers();
        const rankedUsers = users
            .map(user => {
            const stats = user.statistics;
            const scoreWeight = stats.averageScore || 0;
            const simulationsWeight = (stats.totalSimulations || 0) * 5;
            const accuracyWeight = stats.totalQuestions > 0
                ? ((stats.correctAnswers || 0) / stats.totalQuestions) * 100
                : 0;
            const compositeScore = (scoreWeight * 0.4) + (simulationsWeight * 0.3) + (accuracyWeight * 0.3);
            return {
                _id: user._id,
                name: user.name,
                university: user.university,
                statistics: {
                    totalSimulations: stats.totalSimulations || 0,
                    averageScore: stats.averageScore || 0,
                    correctAnswers: stats.correctAnswers || 0,
                    totalQuestions: stats.totalQuestions || 0
                },
                level: user.level || 1,
                experience: user.experience || 0,
                compositeScore
            };
        })
            .sort((a, b) => b.compositeScore - a.compositeScore)
            .slice(0, limit)
            .map((user, index) => ({
            ...user,
            position: index + 1
        }));
        res.json({
            success: true,
            data: rankedUsers
        });
    }
    catch (error) {
        console.error('Erro ao buscar ranking global:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});
router.get('/:university', auth_1.requireAuth, async (req, res) => {
    try {
        const { university } = req.params;
        const limit = parseInt(req.query.limit) || 10;
        const users = MockUserService_1.mockUserDB.getAllUsers();
        const universityUsers = users.filter(user => user.university && user.university.toLowerCase() === university.toLowerCase());
        if (universityUsers.length === 0) {
            return res.json({
                success: true,
                data: [],
                message: `Nenhum usuário encontrado para a universidade ${university}`
            });
        }
        const rankedUsers = universityUsers
            .map(user => {
            const stats = user.statistics;
            const scoreWeight = stats.averageScore || 0;
            const simulationsWeight = (stats.totalSimulations || 0) * 5;
            const accuracyWeight = stats.totalQuestions > 0
                ? ((stats.correctAnswers || 0) / stats.totalQuestions) * 100
                : 0;
            const compositeScore = (scoreWeight * 0.4) + (simulationsWeight * 0.3) + (accuracyWeight * 0.3);
            return {
                _id: user._id,
                name: user.name,
                university: user.university,
                statistics: {
                    totalSimulations: stats.totalSimulations || 0,
                    averageScore: stats.averageScore || 0,
                    correctAnswers: stats.correctAnswers || 0,
                    totalQuestions: stats.totalQuestions || 0
                },
                level: user.level || 1,
                experience: user.experience || 0,
                compositeScore
            };
        })
            .sort((a, b) => b.compositeScore - a.compositeScore)
            .slice(0, limit)
            .map((user, index) => ({
            ...user,
            position: index + 1
        }));
        return res.json({
            success: true,
            data: rankedUsers
        });
    }
    catch (error) {
        console.error(`Erro ao buscar ranking da universidade ${req.params.university}:`, error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});
router.get('/user/position', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = String(req.user._id);
        const users = MockUserService_1.mockUserDB.getAllUsers();
        const globalRanked = users
            .map(user => {
            const stats = user.statistics;
            const scoreWeight = stats.averageScore || 0;
            const simulationsWeight = (stats.totalSimulations || 0) * 5;
            const accuracyWeight = stats.totalQuestions > 0
                ? ((stats.correctAnswers || 0) / stats.totalQuestions) * 100
                : 0;
            const compositeScore = (scoreWeight * 0.4) + (simulationsWeight * 0.3) + (accuracyWeight * 0.3);
            return {
                _id: user._id,
                compositeScore,
                university: user.university
            };
        })
            .sort((a, b) => b.compositeScore - a.compositeScore);
        const globalPosition = globalRanked.findIndex(user => user._id === userId) + 1;
        const currentUser = MockUserService_1.mockUserDB.getUserById(userId);
        let universityPosition;
        let universityUsers;
        if (currentUser?.university) {
            const universityRanked = globalRanked
                .filter(user => user.university === currentUser.university);
            universityPosition = universityRanked.findIndex(user => user._id === userId) + 1;
            universityUsers = universityRanked.length;
        }
        const result = {
            globalPosition: globalPosition || 0,
            totalUsers: users.length,
            universityPosition,
            universityUsers
        };
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('Erro ao buscar posição do usuário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});
exports.default = router;
//# sourceMappingURL=rankings.js.map