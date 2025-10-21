import { Router, Request, Response } from 'express'
import Question, { IQuestion } from '../models/Question'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { mockQuestionService } from '../services/MockQuestionService'

const router = Router()

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
    const { 
      subject, 
      university, 
      difficulty, 
      topics, 
      search, 
      page = '1', 
      limit = '10' 
    } = req.query

    // Usar MockDB se MongoDB não estiver disponível
    if (process.env.NODE_ENV === 'development') {
      const result = await mockQuestionService.getQuestions({
        subject,
        university,
        difficulty: difficulty as 'easy' | 'medium' | 'hard',
        topics: topics ? topics.split(',') : undefined,
        search,
        page: parseInt(page),
        limit: parseInt(limit)
      })

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
      })
    }

    // Construir filtros para MongoDB
    const filters: any = { isActive: true }
    
    if (subject) filters.subject = subject
    if (university) filters.university = university
    if (difficulty) filters.difficulty = difficulty
    if (topics) filters.topics = { $in: topics.split(',') }
    
    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { statement: { $regex: search, $options: 'i' } },
        { explanation: { $regex: search, $options: 'i' } }
      ]
    }

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    const [questions, totalQuestions] = await Promise.all([
      Question.find(filters)
        .select('-__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('createdBy', 'name email'),
      Question.countDocuments(filters)
    ])

    const totalPages = Math.ceil(totalQuestions / limitNum)

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
    })
  } catch (error) {
    console.error('Error fetching questions:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

// GET /api/questions/:id - Buscar questão por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    console.log('🔍 Buscando questão com ID:', id)

    // Usar MockDB se MongoDB não estiver disponível
    if (process.env.NODE_ENV === 'development') {
      const question = await mockQuestionService.getQuestionById(id)
      
      if (!question) {
        console.log('❌ Questão não encontrada:', id)
        return res.status(404).json({
          success: false,
          message: 'Questão não encontrada'
        })
      }

      // Adicionar o campo correctAnswer baseado na alternativa correta
      const correctAlternative = question.alternatives.find(alt => alt.isCorrect)
      const questionWithCorrectAnswer = {
        ...question.toObject ? question.toObject() : question,
        correctAnswer: correctAlternative?.letter || null
      }

      console.log('✅ Questão encontrada:', question.title || question._id)
      console.log('🎯 Resposta correta:', correctAlternative?.letter)
      
      return res.json({
        success: true,
        data: questionWithCorrectAnswer
      })
    }

    const question = await Question.findById(id)
      .select('-__v')
      .populate('createdBy', 'name email')

    if (!question || !question.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Questão não encontrada'
      })
    }

    // Adicionar campo correctAnswer baseado na alternativa correta
    const correctAlternative = question.alternatives.find(alt => alt.isCorrect)
    const correctAnswer = correctAlternative?.letter || null
    
    console.log(`[Question ${question._id}] Correct answer detected:`, correctAnswer)

    const questionWithCorrectAnswer = {
      ...question.toObject(),
      correctAnswer
    }

    return res.json({
      success: true,
      data: questionWithCorrectAnswer
    })
  } catch (error) {
    console.error('Error fetching question:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

// POST /api/questions - Criar nova questão
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const questionData = {
      ...req.body,
      createdBy: req.user?._id
    }

    // Usar MockDB se MongoDB não estiver disponível
    if (process.env.NODE_ENV === 'development') {
      const question = await mockQuestionService.createQuestion(questionData)
      
      return res.status(201).json({
        success: true,
        data: question,
        message: 'Questão criada com sucesso'
      })
    }

    const question = new Question(questionData)
    await question.save()

    return res.status(201).json({
      success: true,
      data: question,
      message: 'Questão criada com sucesso'
    })
  } catch (error: any) {
    console.error('Error creating question:', error)
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: Object.values(error.errors).map((err: any) => err.message)
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

// PUT /api/questions/:id - Atualizar questão
router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user?._id?.toString()

    // Usar MockDB se MongoDB não estiver disponível
    if (process.env.NODE_ENV === 'development') {
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        })
      }
      
      const question = await mockQuestionService.updateQuestion(id, req.body, userId)
      
      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Questão não encontrada'
        })
      }

      return res.json({
        success: true,
        data: question,
        message: 'Questão atualizada com sucesso'
      })
    }

    const question = await Question.findById(id)

    if (!question || !question.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Questão não encontrada'
      })
    }

    // Verificar se o usuário é o criador da questão
    if (question.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Não autorizado para editar esta questão'
      })
    }

    Object.assign(question, req.body)
    await question.save()

    return res.json({
      success: true,
      data: question,
      message: 'Questão atualizada com sucesso'
    })
  } catch (error: any) {
    console.error('Error updating question:', error)
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: Object.values(error.errors).map((err: any) => err.message)
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

// DELETE /api/questions/:id - Deletar questão (soft delete)
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user?._id?.toString()

    // Usar MockDB se MongoDB não estiver disponível
    if (process.env.NODE_ENV === 'development') {
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        })
      }
      
      const success = await mockQuestionService.deleteQuestion(id, userId)
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Questão não encontrada'
        })
      }

      return res.json({
        success: true,
        message: 'Questão removida com sucesso'
      })
    }

    const question = await Question.findById(id)

    if (!question || !question.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Questão não encontrada'
      })
    }

    // Verificar se o usuário é o criador da questão
    if (question.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Não autorizado para remover esta questão'
      })
    }

    question.isActive = false
    await question.save()

    return res.json({
      success: true,
      message: 'Questão removida com sucesso'
    })
  } catch (error) {
    console.error('Error deleting question:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

// GET /api/questions/stats/summary - Estatísticas das questões
router.get('/stats/summary', async (req: Request, res: Response) => {
  try {
    // Usar MockDB se MongoDB não estiver disponível
    if (process.env.NODE_ENV === 'development') {
      const stats = await mockQuestionService.getQuestionStats()
      
      return res.json({
        success: true,
        data: stats
      })
    }

    const [
      totalQuestions,
      questionsBySubject,
      questionsByUniversity,
      questionsByDifficulty
    ] = await Promise.all([
      Question.countDocuments({ isActive: true }),
      Question.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$subject', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Question.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$university', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Question.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$difficulty', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ])

    return res.json({
      success: true,
      data: {
        totalQuestions,
        bySubject: questionsBySubject,
        byUniversity: questionsByUniversity,
        byDifficulty: questionsByDifficulty
      }
    })
  } catch (error) {
    console.error('Error fetching question stats:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

export default router