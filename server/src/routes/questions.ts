import { Router, Request, Response } from 'express'
import Question, { IQuestion } from '../models/Question'
import { requireAuth, AuthRequest } from '../middleware/auth'
import HybridQuestionService from '../services/HybridQuestionService'

const router = Router()
const questionService = new HybridQuestionService()

interface QuestionQuery {
  subject?: string
  university?: string
  difficulty?: string
  topics?: string
  search?: string
  page?: string
  limit?: string
}

// GET /api/questions - Listar questões com filtros
router.get('/', async (req: Request<{}, {}, {}, QuestionQuery>, res: Response) => {
  try {
    const page = parseInt(req.query.page || '1')
    const limit = parseInt(req.query.limit || '20')
    
    const filters: any = {}
    
    if (req.query.subject) {
      filters.subject = req.query.subject
    }
    
    if (req.query.university) {
      filters.university = req.query.university
    }
    
    if (req.query.difficulty) {
      filters.difficulty = req.query.difficulty
    }
    
    if (req.query.topics) {
      filters.topics = req.query.topics.split(',')
    }

    console.log('🔍 Filtros aplicados:', filters)
    
    const result = await questionService.getQuestions(filters, page, limit)
    
    console.log('📊 Resultado da busca:', {
      total: result.totalQuestions,
      page: result.currentPage,
      totalPages: result.totalPages
    })
    
    return res.json({
      success: true,
      data: result
    })
  } catch (error: any) {
    console.error('❌ Erro ao buscar questões:', error)
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    })
  }
})

// GET /api/questions/:id - Buscar questão específica
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    console.log('🔍 Buscando questão ID:', id)
    
    const question = await questionService.getQuestionById(id)
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Questão não encontrada'
      })
    }

    // Verificar se há propriedades diferentes entre IQuestion e IQuestao
    const questionData = question as any
    
    // Tentar acessar propriedades de ambos os tipos
    const alternatives = questionData.alternatives || questionData.alternativas || []
    const correctAnswer = alternatives.find((alt: any) => alt.isCorrect || alt.correta)
    
    const responseData = {
      ...questionData,
      correctAnswer: correctAnswer?.letter || correctAnswer?.id || null
    }

    console.log('✅ Questão encontrada:', questionData.title || questionData._id)
    console.log('🎯 Resposta correta:', correctAnswer?.letter || correctAnswer?.id)
    
    return res.json({
      success: true,
      data: responseData
    })
  } catch (error: any) {
    console.error('❌ Erro ao buscar questão:', error)
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    })
  }
})

// POST /api/questions - Criar nova questão (requer autenticação)
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id

    const questionData = {
      title: req.body.title,
      enunciado: req.body.enunciado,
      alternativas: req.body.alternativas,
      gabarito: req.body.gabarito,
      explanation: req.body.explanation,
      subject: req.body.subject,
      difficulty: req.body.difficulty,
      university: req.body.university,
      topics: req.body.topics || [],
      year: req.body.year,
      createdBy: userId
    }

    // Validação básica
    if (!questionData.title || !questionData.enunciado || !questionData.alternativas || 
        !questionData.gabarito || !questionData.subject) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: title, enunciado, alternativas, gabarito, subject'
      })
    }

    console.log('📝 Criando nova questão:', questionData.title)
    
    const question = await questionService.createQuestion(questionData)
    
    console.log('✅ Questão criada com sucesso:', question)
    
    return res.status(201).json({
      success: true,
      data: question,
      message: 'Questão criada com sucesso'
    })
  } catch (error: any) {
    console.error('❌ Erro ao criar questão:', error)
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    })
  }
})

// PUT /api/questions/:id - Atualizar questão (requer autenticação)
router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    console.log('📝 Atualizando questão ID:', id)
    
    const question = await questionService.updateQuestion(id, req.body, userId)
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Questão não encontrada'
      })
    }
    
    console.log('✅ Questão atualizada com sucesso')
    
    return res.json({
      success: true,
      data: question,
      message: 'Questão atualizada com sucesso'
    })
  } catch (error: any) {
    console.error('❌ Erro ao atualizar questão:', error)
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    })
  }
})

// DELETE /api/questions/:id - Remover questão (requer autenticação)
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    console.log('🗑️  Removendo questão ID:', id)
    
    const success = await questionService.deleteQuestion(id, userId)
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Questão não encontrada'
      })
    }
    
    console.log('✅ Questão removida com sucesso')
    
    return res.json({
      success: true,
      message: 'Questão removida com sucesso'
    })
  } catch (error: any) {
    console.error('❌ Erro ao remover questão:', error)
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    })
  }
})

// GET /api/questions/stats/overview - Estatísticas das questões
router.get('/stats/overview', async (req: Request, res: Response) => {
  try {
    console.log('📊 Buscando estatísticas das questões...')
    
    const stats = await questionService.getQuestionStats()
    
    console.log('✅ Estatísticas calculadas:', stats)
    
    return res.json({
      success: true,
      data: stats
    })
  } catch (error: any) {
    console.error('❌ Erro ao calcular estatísticas:', error)
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    })
  }
})

export default router