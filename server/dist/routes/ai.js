"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const AIRecommendationService_1 = require("../services/AIRecommendationService");
const AIQuestionGeneratorService_1 = require("../services/AIQuestionGeneratorService");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.get('/recommendations', async (req, res) => {
    try {
        console.log('🎯 API: Solicitação de recomendações IA para usuário:', req.user?.id);
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'ID do usuário não encontrado'
            });
        }
        const recommendations = await AIRecommendationService_1.aiRecommendationService.generateRecommendations(userId);
        return res.json({
            success: true,
            data: {
                recommendations,
                generatedAt: new Date().toISOString(),
                userId
            },
            message: 'Recomendações geradas com sucesso'
        });
    }
    catch (error) {
        console.error('❌ Erro ao gerar recomendações:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor ao gerar recomendações'
        });
    }
});
router.get('/error-patterns', async (req, res) => {
    try {
        console.log('🔍 API: Análise de padrões de erro para usuário:', req.user?.id);
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'ID do usuário não encontrado'
            });
        }
        const errorPatterns = await AIRecommendationService_1.aiRecommendationService.analyzeErrorPatterns(userId);
        return res.json({
            success: true,
            data: {
                patterns: errorPatterns,
                totalPatterns: errorPatterns.length,
                analysisDate: new Date().toISOString()
            },
            message: 'Padrões de erro analisados com sucesso'
        });
    }
    catch (error) {
        console.error('❌ Erro ao analisar padrões de erro:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor ao analisar padrões'
        });
    }
});
router.get('/study-patterns', async (req, res) => {
    try {
        console.log('📈 API: Análise de padrões de estudo para usuário:', req.user?.id);
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'ID do usuário não encontrado'
            });
        }
        const studyPattern = await AIRecommendationService_1.aiRecommendationService.analyzeStudyPatterns(userId);
        return res.json({
            success: true,
            data: {
                pattern: studyPattern,
                analysisDate: new Date().toISOString()
            },
            message: 'Padrões de estudo analisados com sucesso'
        });
    }
    catch (error) {
        console.error('❌ Erro ao analisar padrões de estudo:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor ao analisar padrões'
        });
    }
});
router.get('/subject-analysis', async (req, res) => {
    try {
        console.log('📚 API: Análise de matérias para usuário:', req.user?.id);
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'ID do usuário não encontrado'
            });
        }
        const subjectAnalysis = await AIRecommendationService_1.aiRecommendationService.analyzeSubjectPerformance(userId);
        return res.json({
            success: true,
            data: {
                subjects: subjectAnalysis,
                totalSubjects: subjectAnalysis.length,
                highPrioritySubjects: subjectAnalysis.filter(s => s.priority === 'high').length,
                analysisDate: new Date().toISOString()
            },
            message: 'Análise de matérias concluída com sucesso'
        });
    }
    catch (error) {
        console.error('❌ Erro ao analisar matérias:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor ao analisar matérias'
        });
    }
});
router.get('/study-schedule', async (req, res) => {
    try {
        console.log('📅 API: Geração de cronograma para usuário:', req.user?.id);
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'ID do usuário não encontrado'
            });
        }
        const schedule = await AIRecommendationService_1.aiRecommendationService.generateStudySchedule(userId);
        return res.json({
            success: true,
            data: {
                schedule,
                generatedAt: new Date().toISOString()
            },
            message: 'Cronograma personalizado gerado com sucesso'
        });
    }
    catch (error) {
        console.error('❌ Erro ao gerar cronograma:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor ao gerar cronograma'
        });
    }
});
router.get('/performance-prediction', async (req, res) => {
    try {
        console.log('🔮 API: Predição de performance para usuário:', req.user?.id);
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'ID do usuário não encontrado'
            });
        }
        const timeframe = req.query.timeframe || 'month';
        const prediction = await AIRecommendationService_1.aiRecommendationService.predictPerformance(userId, timeframe);
        return res.json({
            success: true,
            data: {
                prediction,
                timeframe,
                generatedAt: new Date().toISOString()
            },
            message: 'Predição de performance gerada com sucesso'
        });
    }
    catch (error) {
        console.error('❌ Erro ao gerar predição:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor ao gerar predição'
        });
    }
});
router.post('/generate-question', async (req, res) => {
    try {
        console.log('🎲 API: Geração de questão IA:', req.body);
        const { subject, topic, difficulty, university, method = 'hybrid' } = req.body;
        if (!subject) {
            return res.status(400).json({
                success: false,
                message: 'Matéria é obrigatória'
            });
        }
        const question = await AIQuestionGeneratorService_1.aiQuestionGenerator.generateQuestion(subject, topic, difficulty, university, method);
        return res.json({
            success: true,
            data: {
                question,
                generatedAt: new Date().toISOString()
            },
            message: 'Questão gerada com sucesso'
        });
    }
    catch (error) {
        console.error('❌ Erro ao gerar questão:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor ao gerar questão'
        });
    }
});
router.post('/generate-question-batch', async (req, res) => {
    try {
        console.log('📦 API: Geração em lote de questões IA:', req.body);
        const { count = 5, subjects, difficulties, universities } = req.body;
        if (count > 50) {
            return res.status(400).json({
                success: false,
                message: 'Máximo de 50 questões por lote'
            });
        }
        const questions = await AIQuestionGeneratorService_1.aiQuestionGenerator.generateQuestionBatch(count, {
            subjects,
            difficulties,
            universities
        });
        return res.json({
            success: true,
            data: {
                questions,
                totalGenerated: questions.length,
                requestedCount: count,
                generatedAt: new Date().toISOString()
            },
            message: `${questions.length} questões geradas com sucesso`
        });
    }
    catch (error) {
        console.error('❌ Erro ao gerar lote de questões:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor ao gerar questões'
        });
    }
});
router.get('/question-patterns', async (req, res) => {
    try {
        console.log('📊 API: Análise de padrões de questões');
        const patterns = await AIQuestionGeneratorService_1.aiQuestionGenerator.analyzeExistingQuestions();
        return res.json({
            success: true,
            data: {
                patterns,
                analysisDate: new Date().toISOString()
            },
            message: 'Padrões de questões analisados com sucesso'
        });
    }
    catch (error) {
        console.error('❌ Erro ao analisar padrões de questões:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor ao analisar padrões'
        });
    }
});
router.delete('/clear-cache', async (req, res) => {
    try {
        console.log('🧹 API: Limpeza de cache IA solicitada por:', req.user?.id);
        AIRecommendationService_1.aiRecommendationService.clearCache();
        return res.json({
            success: true,
            message: 'Cache de IA limpo com sucesso',
            clearedAt: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('❌ Erro ao limpar cache:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor ao limpar cache'
        });
    }
});
exports.default = router;
//# sourceMappingURL=ai.js.map