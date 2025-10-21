import { Router, Request, Response } from 'express'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { mockUserDB } from '../services/MockUserService'

// Usar a instância global do mockUserDB

const router = Router()

// GET /api/rankings - Ranking global
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10
    
    // Obter todos os usuários ordenados por estatísticas
    const users = mockUserDB.getAllUsers()
    
    // Calcular score composto para ranking
    const rankedUsers = users
      .map(user => {
        const stats = user.statistics
        const scoreWeight = stats.averageScore || 0
        const simulationsWeight = (stats.totalSimulations || 0) * 5
        const accuracyWeight = stats.totalQuestions > 0 
          ? ((stats.correctAnswers || 0) / stats.totalQuestions) * 100 
          : 0
        
        // Score composto: média ponderada
        const compositeScore = (scoreWeight * 0.4) + (simulationsWeight * 0.3) + (accuracyWeight * 0.3)
        
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
        }
      })
      .sort((a, b) => b.compositeScore - a.compositeScore)
      .slice(0, limit)
      .map((user, index) => ({
        ...user,
        position: index + 1
      }))

    res.json({
      success: true,
      data: rankedUsers
    })

  } catch (error: any) {
    console.error('Erro ao buscar ranking global:', error)
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})



// GET /api/rankings/:university - Ranking por universidade
router.get('/:university', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { university } = req.params
    const limit = parseInt(req.query.limit as string) || 10
    
    // Obter usuários da universidade específica
    const users = mockUserDB.getAllUsers()
    const universityUsers = users.filter(user => 
      user.university && user.university.toLowerCase() === university.toLowerCase()
    )
    
    if (universityUsers.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: `Nenhum usuário encontrado para a universidade ${university}`
      })
    }
    
    // Calcular ranking da universidade
    const rankedUsers = universityUsers
      .map(user => {
        const stats = user.statistics
        const scoreWeight = stats.averageScore || 0
        const simulationsWeight = (stats.totalSimulations || 0) * 5
        const accuracyWeight = stats.totalQuestions > 0 
          ? ((stats.correctAnswers || 0) / stats.totalQuestions) * 100 
          : 0
        
        const compositeScore = (scoreWeight * 0.4) + (simulationsWeight * 0.3) + (accuracyWeight * 0.3)
        
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
        }
      })
      .sort((a, b) => b.compositeScore - a.compositeScore)
      .slice(0, limit)
      .map((user, index) => ({
        ...user,
        position: index + 1
      }))

    return res.json({
      success: true,
      data: rankedUsers
    })

  } catch (error: any) {
    console.error(`Erro ao buscar ranking da universidade ${req.params.university}:`, error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

// GET /api/rankings/user/position - Posição do usuário no ranking
router.get('/user/position', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = String(req.user!._id)
    
    // Obter todos os usuários para calcular posições
    const users = mockUserDB.getAllUsers()
    
    // Calcular ranking global
    const globalRanked = users
      .map(user => {
        const stats = user.statistics
        const scoreWeight = stats.averageScore || 0
        const simulationsWeight = (stats.totalSimulations || 0) * 5
        const accuracyWeight = stats.totalQuestions > 0 
          ? ((stats.correctAnswers || 0) / stats.totalQuestions) * 100 
          : 0
        
        const compositeScore = (scoreWeight * 0.4) + (simulationsWeight * 0.3) + (accuracyWeight * 0.3)
        
        return {
          _id: user._id,
          compositeScore,
          university: user.university
        }
      })
      .sort((a, b) => b.compositeScore - a.compositeScore)
    
    // Encontrar posição global do usuário
    const globalPosition = globalRanked.findIndex(user => user._id === userId) + 1
    
    // Calcular posição na universidade (se aplicável)
    const currentUser = mockUserDB.getUserById(userId)
    let universityPosition: number | undefined
    let universityUsers: number | undefined

    if (currentUser?.university) {
      const universityRanked = globalRanked
        .filter(user => user.university === currentUser.university)

      universityPosition = universityRanked.findIndex(user => user._id === userId) + 1
      universityUsers = universityRanked.length
    }

    const result = {
      globalPosition: globalPosition || 0,
      totalUsers: users.length,
      universityPosition,
      universityUsers
    }

    res.json({
      success: true,
      data: result
    })

  } catch (error: any) {
    console.error('Erro ao buscar posição do usuário:', error)
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

export default router