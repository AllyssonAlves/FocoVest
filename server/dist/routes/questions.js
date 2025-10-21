"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Question_1 = __importDefault(require("../models/Question"));
const auth_1 = require("../middleware/auth");
const MockQuestionService_1 = require("../services/MockQuestionService");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const { subject, university, difficulty, topics, search, page = '1', limit = '10' } = req.query;
        if (process.env.NODE_ENV === 'development') {
            const result = await MockQuestionService_1.mockQuestionService.getQuestions({
                subject,
                university,
                difficulty: difficulty,
                topics: topics ? topics.split(',') : undefined,
                search,
                page: parseInt(page),
                limit: parseInt(limit)
            });
            return res.json({
                success: true,
                data: result.questions,
                pagination: {
                    currentPage: result.currentPage,
                    totalPages: result.totalPages,
                    totalQuestions: result.totalQuestions,
                    hasNext: result.hasNext,
                    hasPrev: result.hasPrev
                }
            });
        }
        const filters = { isActive: true };
        if (subject)
            filters.subject = subject;
        if (university)
            filters.university = university;
        if (difficulty)
            filters.difficulty = difficulty;
        if (topics)
            filters.topics = { $in: topics.split(',') };
        if (search) {
            filters.$or = [
                { title: { $regex: search, $options: 'i' } },
                { statement: { $regex: search, $options: 'i' } },
                { explanation: { $regex: search, $options: 'i' } }
            ];
        }
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const [questions, totalQuestions] = await Promise.all([
            Question_1.default.find(filters)
                .select('-__v')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .populate('createdBy', 'name email'),
            Question_1.default.countDocuments(filters)
        ]);
        const totalPages = Math.ceil(totalQuestions / limitNum);
        return res.json({
            success: true,
            data: questions,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalQuestions,
                hasNext: pageNum < totalPages,
                hasPrev: pageNum > 1
            }
        });
    }
    catch (error) {
        console.error('Error fetching questions:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🔍 Buscando questão com ID:', id);
        if (process.env.NODE_ENV === 'development') {
            const question = await MockQuestionService_1.mockQuestionService.getQuestionById(id);
            if (!question) {
                console.log('❌ Questão não encontrada:', id);
                return res.status(404).json({
                    success: false,
                    message: 'Questão não encontrada'
                });
            }
            const correctAlternative = question.alternatives.find(alt => alt.isCorrect);
            const questionWithCorrectAnswer = {
                ...question.toObject ? question.toObject() : question,
                correctAnswer: correctAlternative?.letter || null
            };
            console.log('✅ Questão encontrada:', question.title || question._id);
            console.log('🎯 Resposta correta:', correctAlternative?.letter);
            return res.json({
                success: true,
                data: questionWithCorrectAnswer
            });
        }
        const question = await Question_1.default.findById(id)
            .select('-__v')
            .populate('createdBy', 'name email');
        if (!question || !question.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Questão não encontrada'
            });
        }
        const correctAlternative = question.alternatives.find(alt => alt.isCorrect);
        const correctAnswer = correctAlternative?.letter || null;
        console.log(`[Question ${question._id}] Correct answer detected:`, correctAnswer);
        const questionWithCorrectAnswer = {
            ...question.toObject(),
            correctAnswer
        };
        return res.json({
            success: true,
            data: questionWithCorrectAnswer
        });
    }
    catch (error) {
        console.error('Error fetching question:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});
router.post('/', auth_1.requireAuth, async (req, res) => {
    try {
        const questionData = {
            ...req.body,
            createdBy: req.user?._id
        };
        if (process.env.NODE_ENV === 'development') {
            const question = await MockQuestionService_1.mockQuestionService.createQuestion(questionData);
            return res.status(201).json({
                success: true,
                data: question,
                message: 'Questão criada com sucesso'
            });
        }
        const question = new Question_1.default(questionData);
        await question.save();
        return res.status(201).json({
            success: true,
            data: question,
            message: 'Questão criada com sucesso'
        });
    }
    catch (error) {
        console.error('Error creating question:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Dados inválidos',
                errors: Object.values(error.errors).map((err) => err.message)
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});
router.put('/:id', auth_1.requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id?.toString();
        if (process.env.NODE_ENV === 'development') {
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuário não autenticado'
                });
            }
            const question = await MockQuestionService_1.mockQuestionService.updateQuestion(id, req.body, userId);
            if (!question) {
                return res.status(404).json({
                    success: false,
                    message: 'Questão não encontrada'
                });
            }
            return res.json({
                success: true,
                data: question,
                message: 'Questão atualizada com sucesso'
            });
        }
        const question = await Question_1.default.findById(id);
        if (!question || !question.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Questão não encontrada'
            });
        }
        if (question.createdBy.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Não autorizado para editar esta questão'
            });
        }
        Object.assign(question, req.body);
        await question.save();
        return res.json({
            success: true,
            data: question,
            message: 'Questão atualizada com sucesso'
        });
    }
    catch (error) {
        console.error('Error updating question:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Dados inválidos',
                errors: Object.values(error.errors).map((err) => err.message)
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});
router.delete('/:id', auth_1.requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id?.toString();
        if (process.env.NODE_ENV === 'development') {
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuário não autenticado'
                });
            }
            const success = await MockQuestionService_1.mockQuestionService.deleteQuestion(id, userId);
            if (!success) {
                return res.status(404).json({
                    success: false,
                    message: 'Questão não encontrada'
                });
            }
            return res.json({
                success: true,
                message: 'Questão removida com sucesso'
            });
        }
        const question = await Question_1.default.findById(id);
        if (!question || !question.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Questão não encontrada'
            });
        }
        if (question.createdBy.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Não autorizado para remover esta questão'
            });
        }
        question.isActive = false;
        await question.save();
        return res.json({
            success: true,
            message: 'Questão removida com sucesso'
        });
    }
    catch (error) {
        console.error('Error deleting question:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});
router.get('/stats/summary', async (req, res) => {
    try {
        if (process.env.NODE_ENV === 'development') {
            const stats = await MockQuestionService_1.mockQuestionService.getQuestionStats();
            return res.json({
                success: true,
                data: stats
            });
        }
        const [totalQuestions, questionsBySubject, questionsByUniversity, questionsByDifficulty] = await Promise.all([
            Question_1.default.countDocuments({ isActive: true }),
            Question_1.default.aggregate([
                { $match: { isActive: true } },
                { $group: { _id: '$subject', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            Question_1.default.aggregate([
                { $match: { isActive: true } },
                { $group: { _id: '$university', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            Question_1.default.aggregate([
                { $match: { isActive: true } },
                { $group: { _id: '$difficulty', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ])
        ]);
        return res.json({
            success: true,
            data: {
                totalQuestions,
                bySubject: questionsBySubject,
                byUniversity: questionsByUniversity,
                byDifficulty: questionsByDifficulty
            }
        });
    }
    catch (error) {
        console.error('Error fetching question stats:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});
exports.default = router;
//# sourceMappingURL=questions.js.map