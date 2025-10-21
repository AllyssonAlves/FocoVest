import express, { Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth'
import { aiRecommendationService } from '../services/AIRecommendationService'
import { aiQuestionGenerator } from '../services/AIQuestionGeneratorService'

// Extend Request interface to include user
interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
  }
}

const router = express.Router()

// Middleware de autenticação para todas as rotas
router.use(authenticateToken)

/**
 * @route GET /api/ai/recommendations
 * @desc Obter recomendações personalizadas baseadas em IA
 * @access Private
 */
router.get('/recommendations', async (req: AuthRequest, res: Response) => {
  try {
    console.log('🎯 API: Solicitação de recomendações IA para usuário:', req.user?.id)
    
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'ID do usuário não encontrado'
      })
    }

    const recommendations = await aiRecommendationService.generateRecommendations(userId)
    
    return res.json({
      success: true,
      data: {
        recommendations,
        generatedAt: new Date().toISOString(),
        userId
      },
      message: 'Recomendações geradas com sucesso'
    })
    
  } catch (error) {
    console.error('❌ Erro ao gerar recomendações:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao gerar recomendações'
    })
  }
})

/**
 * @route GET /api/ai/error-patterns
 * @desc Analisar padrões de erro do usuário
 * @access Private
 */
router.get('/error-patterns', async (req: AuthRequest, res: Response) => {
  try {
    console.log('🔍 API: Análise de padrões de erro para usuário:', req.user?.id)
    
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'ID do usuário não encontrado'
      })
    }

    const errorPatterns = await aiRecommendationService.analyzeErrorPatterns(userId)
    
    return res.json({
      success: true,
      data: {
        patterns: errorPatterns,
        totalPatterns: errorPatterns.length,
        analysisDate: new Date().toISOString()
      },
      message: 'Padrões de erro analisados com sucesso'
    })
    
  } catch (error) {
    console.error('❌ Erro ao analisar padrões de erro:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao analisar padrões'
    })
  }
})

/**
 * @route GET /api/ai/study-patterns
 * @desc Analisar padrões de estudo do usuário
 * @access Private
 */
router.get('/study-patterns', async (req: AuthRequest, res: Response) => {
  try {
    console.log('📈 API: Análise de padrões de estudo para usuário:', req.user?.id)
    
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'ID do usuário não encontrado'
      })
    }

    const studyPattern = await aiRecommendationService.analyzeStudyPatterns(userId)
    
    return res.json({
      success: true,
      data: {
        pattern: studyPattern,
        analysisDate: new Date().toISOString()
      },
      message: 'Padrões de estudo analisados com sucesso'
    })
    
  } catch (error) {
    console.error('❌ Erro ao analisar padrões de estudo:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao analisar padrões'
    })
  }
})

/**
 * @route GET /api/ai/subject-analysis
 * @desc Análise de performance por matéria
 * @access Private
 */
router.get('/subject-analysis', async (req: AuthRequest, res: Response) => {
  try {
    console.log('📚 API: Análise de matérias para usuário:', req.user?.id)
    
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'ID do usuário não encontrado'
      })
    }

    const subjectAnalysis = await aiRecommendationService.analyzeSubjectPerformance(userId)
    
    return res.json({
      success: true,
      data: {
        subjects: subjectAnalysis,
        totalSubjects: subjectAnalysis.length,
        highPrioritySubjects: subjectAnalysis.filter(s => s.priority === 'high').length,
        analysisDate: new Date().toISOString()
      },
      message: 'Análise de matérias concluída com sucesso'
    })
    
  } catch (error) {
    console.error('❌ Erro ao analisar matérias:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao analisar matérias'
    })
  }
})

/**
 * @route GET /api/ai/study-schedule
 * @desc Gerar cronograma personalizado de estudos
 * @access Private
 */
router.get('/study-schedule', async (req: AuthRequest, res: Response) => {
  try {
    console.log('📅 API: Geração de cronograma para usuário:', req.user?.id)
    
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'ID do usuário não encontrado'
      })
    }

    const schedule = await aiRecommendationService.generateStudySchedule(userId)
    
    return res.json({
      success: true,
      data: {
        schedule,
        generatedAt: new Date().toISOString()
      },
      message: 'Cronograma personalizado gerado com sucesso'
    })
    
  } catch (error) {
    console.error('❌ Erro ao gerar cronograma:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao gerar cronograma'
    })
  }
})

/**
 * @route GET /api/ai/performance-prediction
 * @desc Predição de performance futura
 * @access Private
 */
router.get('/performance-prediction', async (req: AuthRequest, res: Response) => {
  try {
    console.log('🔮 API: Predição de performance para usuário:', req.user?.id)
    
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'ID do usuário não encontrado'
      })
    }

    const timeframe = req.query.timeframe as 'week' | 'month' | 'semester' || 'month'
    const prediction = await aiRecommendationService.predictPerformance(userId, timeframe)
    
    return res.json({
      success: true,
      data: {
        prediction,
        timeframe,
        generatedAt: new Date().toISOString()
      },
      message: 'Predição de performance gerada com sucesso'
    })
    
  } catch (error) {
    console.error('❌ Erro ao gerar predição:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao gerar predição'
    })
  }
})

/**
 * @route POST /api/ai/generate-question
 * @desc Gerar nova questão com IA
 * @access Private
 */
router.post('/generate-question', async (req: AuthRequest, res: Response) => {
  try {
    console.log('🎲 API: Geração de questão IA:', req.body)
    
    const {
      subject,
      topic,
      difficulty,
      university,
      method = 'hybrid'
    } = req.body

    if (!subject) {
      return res.status(400).json({
        success: false,
        message: 'Matéria é obrigatória'
      })
    }

    const question = await aiQuestionGenerator.generateQuestion(
      subject,
      topic,
      difficulty,
      university,
      method
    )
    
    return res.json({
      success: true,
      data: {
        question,
        generatedAt: new Date().toISOString()
      },
      message: 'Questão gerada com sucesso'
    })
    
  } catch (error) {
    console.error('❌ Erro ao gerar questão:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao gerar questão'
    })
  }
})

/**
 * @route POST /api/ai/generate-question-batch
 * @desc Gerar lote de questões com IA
 * @access Private
 */
router.post('/generate-question-batch', async (req: AuthRequest, res: Response) => {
  try {
    console.log('📦 API: Geração em lote de questões IA:', req.body)
    
    const {
      count = 5,
      subjects,
      difficulties,
      universities
    } = req.body

    if (count > 50) {
      return res.status(400).json({
        success: false,
        message: 'Máximo de 50 questões por lote'
      })
    }

    const questions = await aiQuestionGenerator.generateQuestionBatch(count, {
      subjects,
      difficulties,
      universities
    })
    
    return res.json({
      success: true,
      data: {
        questions,
        totalGenerated: questions.length,
        requestedCount: count,
        generatedAt: new Date().toISOString()
      },
      message: `${questions.length} questões geradas com sucesso`
    })
    
  } catch (error) {
    console.error('❌ Erro ao gerar lote de questões:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao gerar questões'
    })
  }
})

/**
 * @route GET /api/ai/question-patterns
 * @desc Analisar padrões das questões existentes
 * @access Private
 */
router.get('/question-patterns', async (req: AuthRequest, res: Response) => {
  try {
    console.log('📊 API: Análise de padrões de questões')
    
    const patterns = await aiQuestionGenerator.analyzeExistingQuestions()
    
    return res.json({
      success: true,
      data: {
        patterns,
        analysisDate: new Date().toISOString()
      },
      message: 'Padrões de questões analisados com sucesso'
    })
    
  } catch (error) {
    console.error('❌ Erro ao analisar padrões de questões:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao analisar padrões'
    })
  }
})

/**
 * @route DELETE /api/ai/clear-cache
 * @desc Limpar cache das análises de IA
 * @access Private
 */
router.delete('/clear-cache', async (req: AuthRequest, res: Response) => {
  try {
    console.log('🧹 API: Limpeza de cache IA solicitada por:', req.user?.id)
    
    aiRecommendationService.clearCache()
    
    return res.json({
      success: true,
      message: 'Cache de IA limpo com sucesso',
      clearedAt: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Erro ao limpar cache:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao limpar cache'
    })
  }
})

export default router