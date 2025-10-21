import { Router } from 'express'
import { mockUserDB } from '../services/MockUserService'
import { statisticsCacheService } from '../services/StatisticsCacheService'
import { userComparisonService } from '../services/UserComparisonService'

const router = Router()

// GET /api/users/detailed-stats-cached - Estatísticas com cache
router.get('/detailed-stats-cached', async (req, res) => {
  try {
    console.log('🔍 GET /api/users/detailed-stats-cached - Buscando estatísticas com cache')
    
    // Verificar se há token de autenticação
    const authHeader: string | undefined = req.header('Authorization')
    console.log('🔐 Header Authorization:', authHeader ? 'PRESENTE' : 'AUSENTE')
    
    if (!authHeader) {
      console.log('❌ Token de autenticação não fornecido')
      return res.status(401).json({ 
        success: false, 
        message: 'Token de acesso necessário' 
      })
    }

    const token: string = authHeader.replace('Bearer ', '')
    console.log('🎟️  Token extraído (primeiros 50 chars):', token.substring(0, 50) + '...')
    
    // Decodificar token JWT usando middleware existente
    let decoded: any
    try {
      const { verifyToken } = require('../middleware/auth')
      decoded = verifyToken(token)
      console.log('✅ Token decodificado com sucesso:', { 
        userId: decoded.userId, 
        email: decoded.email 
      })
    } catch (error: any) {
      console.log('❌ Erro ao decodificar token:', error.message)
      return res.status(401).json({ 
        success: false, 
        message: 'Token inválido' 
      })
    }

    const userId: string = decoded.userId
    console.log('🆔 Buscando estatísticas em cache para usuário:', userId)

    try {
      // Usar o cache para obter estatísticas detalhadas
      const cachedStats = await statisticsCacheService.getUserDetailedStatistics(userId)
      
      if (!cachedStats) {
        console.log('❌ Usuário não encontrado para ID:', userId)
        return res.status(404).json({
          success: false, 
          message: 'Usuário não encontrado'
        })
      }

      console.log('✅ Estatísticas detalhadas obtidas do cache para usuário:', userId)
      console.log('📊 Cache calculado em:', cachedStats.calculatedAt)
      
      return res.json({
        success: true,
        data: {
          basic: cachedStats.basic,
          advanced: cachedStats.advanced,
          progress: cachedStats.progress,
          recommendations: cachedStats.recommendations
        },
        meta: {
          cachedAt: cachedStats.calculatedAt,
          source: 'cache'
        }
      })
      
    } catch (cacheError: any) {
      console.error('❌ Erro ao obter estatísticas do cache:', cacheError.message)
      return res.status(500).json({
        success: false,
        message: 'Erro ao processar estatísticas'
      })
    }

  } catch (error: any) {
    console.error('Erro ao buscar estatísticas com cache:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

// GET /api/users/cache-metrics - Métricas do cache (desenvolvimento)
router.get('/cache-metrics', async (req, res) => {
  try {
    console.log('📊 GET /api/users/cache-metrics - Obtendo métricas do cache')
    
    const metrics = statisticsCacheService.getCacheMetrics()
    
    return res.json({
      success: true,
      data: {
        ...metrics,
        hitRateFormatted: `${metrics.hitRate.toFixed(2)}%`,
        memoryUsageFormatted: `${(metrics.memoryUsage / 1024).toFixed(2)} KB`
      }
    })
  } catch (error) {
    console.error('Erro ao obter métricas do cache:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

// POST /api/users/cache-warmup - Warm-up do cache (desenvolvimento)
router.post('/cache-warmup', async (req, res) => {
  try {
    console.log('🔥 POST /api/users/cache-warmup - Iniciando warm-up do cache')
    
    await statisticsCacheService.warmupCache()
    
    return res.json({
      success: true,
      message: 'Cache warm-up executado com sucesso'
    })
  } catch (error) {
    console.error('Erro no warm-up do cache:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro no warm-up do cache'
    })
  }
})

// DELETE /api/users/cache-invalidate - Invalidar cache (desenvolvimento)
router.delete('/cache-invalidate', async (req, res) => {
  try {
    console.log('🗑️ DELETE /api/users/cache-invalidate - Invalidando cache')
    
    statisticsCacheService.invalidateAllCache()
    
    return res.json({
      success: true,
      message: 'Cache invalidado com sucesso'
    })
  } catch (error) {
    console.error('Erro ao invalidar cache:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro ao invalidar cache'
    })
  }
})

// GET /api/users/comparison - Comparação completa com outros usuários
router.get('/comparison', async (req, res) => {
  try {
    console.log('📊 GET /api/users/comparison - Obtendo comparação com outros usuários')
    
    // Verificar se há token de autenticação
    const authHeader: string | undefined = req.header('Authorization')
    
    if (!authHeader) {
      console.log('❌ Token de autenticação não fornecido')
      return res.status(401).json({ 
        success: false, 
        message: 'Token de acesso necessário' 
      })
    }

    const token: string = authHeader.replace('Bearer ', '')
    
    // Decodificar token JWT
    let decoded: any
    try {
      const { verifyToken } = require('../middleware/auth')
      decoded = verifyToken(token)
      console.log('✅ Token decodificado para comparação:', { 
        userId: decoded.userId, 
        email: decoded.email 
      })
    } catch (error: any) {
      console.log('❌ Erro ao decodificar token:', error.message)
      return res.status(401).json({ 
        success: false, 
        message: 'Token inválido' 
      })
    }

    const userId: string = decoded.userId
    console.log('📊 Calculando comparação para usuário:', userId)

    try {
      // Obter comparação completa do usuário
      const comparison = await userComparisonService.getUserComparison(userId)
      
      if (!comparison) {
        console.log('❌ Dados de comparação não encontrados para usuário:', userId)
        return res.status(404).json({
          success: false, 
          message: 'Dados de comparação não encontrados'
        })
      }

      console.log('✅ Comparação calculada com sucesso para usuário:', userId)
      console.log('📊 Posição global:', comparison.rankingPositions.globalPosition)
      console.log('📈 Percentil global:', comparison.rankingPositions.globalPercentile + '%')
      
      return res.json({
        success: true,
        data: comparison
      })
      
    } catch (comparisonError: any) {
      console.error('❌ Erro ao calcular comparação:', comparisonError.message)
      return res.status(500).json({
        success: false,
        message: 'Erro ao processar comparação'
      })
    }

  } catch (error: any) {
    console.error('Erro ao obter comparação de usuários:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

// GET /api/users/ranking-position - Posição simplificada nos rankings
router.get('/ranking-position', async (req, res) => {
  try {
    console.log('🏆 GET /api/users/ranking-position - Obtendo posição nos rankings')
    
    const authHeader: string | undefined = req.header('Authorization')
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token de acesso necessário' 
      })
    }

    const token: string = authHeader.replace('Bearer ', '')
    
    let decoded: any
    try {
      const { verifyToken } = require('../middleware/auth')
      decoded = verifyToken(token)
    } catch (error: any) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token inválido' 
      })
    }

    const userId: string = decoded.userId

    try {
      const comparison = await userComparisonService.getUserComparison(userId)
      
      if (!comparison) {
        return res.status(404).json({
          success: false, 
          message: 'Dados de ranking não encontrados'
        })
      }

      // Retornar apenas dados de posição
      return res.json({
        success: true,
        data: {
          user: comparison.user,
          rankings: comparison.rankingPositions,
          keyInsights: comparison.insights.slice(0, 3), // Apenas os 3 principais insights
          calculatedAt: comparison.calculatedAt
        }
      })
      
    } catch (error: any) {
      console.error('❌ Erro ao obter posição nos rankings:', error.message)
      return res.status(500).json({
        success: false,
        message: 'Erro ao processar ranking'
      })
    }

  } catch (error: any) {
    console.error('Erro ao obter posição nos rankings:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

// GET /api/users/percentile-comparison - Comparação de percentis por métrica
router.get('/percentile-comparison', async (req, res) => {
  try {
    console.log('📈 GET /api/users/percentile-comparison - Obtendo comparação de percentis')
    
    const authHeader: string | undefined = req.header('Authorization')
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token de acesso necessário' 
      })
    }

    const token: string = authHeader.replace('Bearer ', '')
    
    let decoded: any
    try {
      const { verifyToken } = require('../middleware/auth')
      decoded = verifyToken(token)
    } catch (error: any) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token inválido' 
      })
    }

    const userId: string = decoded.userId

    try {
      const comparison = await userComparisonService.getUserComparison(userId)
      
      if (!comparison) {
        return res.status(404).json({
          success: false, 
          message: 'Dados de comparação não encontrados'
        })
      }

      // Retornar apenas comparações de métricas
      return res.json({
        success: true,
        data: {
          user: comparison.user,
          metrics: comparison.metricComparisons,
          goals: comparison.goals,
          summary: {
            overallPercentile: comparison.rankingPositions.globalPercentile,
            excellentMetrics: comparison.metricComparisons.filter(m => m.category === 'excellent').length,
            improvementAreas: comparison.metricComparisons.filter(m => m.category === 'below_average' || m.category === 'needs_improvement').length
          },
          calculatedAt: comparison.calculatedAt
        }
      })
      
    } catch (error: any) {
      console.error('❌ Erro ao obter comparação de percentis:', error.message)
      return res.status(500).json({
        success: false,
        message: 'Erro ao processar percentis'
      })
    }

  } catch (error: any) {
    console.error('Erro ao obter comparação de percentis:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

// DELETE /api/users/comparison-cache - Invalidar cache de comparação
router.delete('/comparison-cache', async (req, res) => {
  try {
    console.log('🗑️ DELETE /api/users/comparison-cache - Invalidando cache de comparação')
    
    const authHeader: string | undefined = req.header('Authorization')
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token de acesso necessário' 
      })
    }

    const token: string = authHeader.replace('Bearer ', '')
    
    let decoded: any
    try {
      const { verifyToken } = require('../middleware/auth')
      decoded = verifyToken(token)
    } catch (error: any) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token inválido' 
      })
    }

    const userId: string = decoded.userId
    
    // Invalidar cache específico do usuário
    userComparisonService.invalidateUserComparison(userId)
    
    return res.json({
      success: true,
      message: 'Cache de comparação invalidado com sucesso'
    })

  } catch (error: any) {
    console.error('Erro ao invalidar cache de comparação:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

// GET /api/users/profile
router.get('/profile', async (req, res) => {
  try {
    console.log('GET /api/users/profile - Buscando perfil do usuário')
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token de acesso necessário' 
      })
    }

    // Decodificar token (simplificado para desenvolvimento)
    const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
    const user = await mockUserDB.findById(decoded.userId)
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      })
    }

    // Remover senha antes de retornar
    const { password, ...userProfile } = user
    
    return res.json({
      success: true,
      data: userProfile
    })
  } catch (error) {
    console.error('Erro ao buscar perfil:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// PUT /api/users/profile
router.put('/profile', async (req, res) => {
  try {
    console.log('PUT /api/users/profile - Atualizando perfil do usuário')
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token de acesso necessário' 
      })
    }

    // Decodificar token
    const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
    const userId = decoded.userId

    const updateData = req.body
    const updatedUser = await mockUserDB.findByIdAndUpdate(userId, updateData)
    
    if (!updatedUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      })
    }

    // Remover senha antes de retornar
    const { password, ...userProfile } = updatedUser
    
    return res.json({
      success: true,
      data: userProfile
    })
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// PUT /api/users/statistics - Endpoint específico para atualizar estatísticas
router.put('/statistics', async (req, res) => {
  try {
    console.log('PUT /api/users/statistics - Atualizando estatísticas do usuário')
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token de acesso necessário' 
      })
    }

    // Decodificar token
    const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
    const userId = decoded.userId

    const { simulationResults } = req.body
    
    if (!simulationResults) {
      return res.status(400).json({
        success: false,
        message: 'Dados do simulado são obrigatórios'
      })
    }

    // Buscar usuário atual
    const currentUser = await mockUserDB.findById(userId)
    if (!currentUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      })
    }

    // Calcular novas estatísticas
    const currentStats = currentUser.statistics || {
      totalSimulations: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      averageScore: 0,
      timeSpent: 0,
      streakDays: 0,
      lastSimulationDate: null
    }

    const newStats = {
      totalSimulations: currentStats.totalSimulations + 1,
      totalQuestions: currentStats.totalQuestions + simulationResults.totalQuestions,
      correctAnswers: currentStats.correctAnswers + simulationResults.correctAnswers,
      timeSpent: currentStats.timeSpent + simulationResults.timeSpent,
      lastSimulationDate: new Date().toISOString(),
      streakDays: currentStats.streakDays, // Manter por enquanto
      averageScore: 0 // Será calculado abaixo
    }

    // Calcular média de pontuação
    newStats.averageScore = Math.round((newStats.correctAnswers / newStats.totalQuestions) * 100)

    // Atualizar usuário
    const updatedUser = await mockUserDB.findByIdAndUpdate(userId, {
      statistics: newStats,
      experience: currentUser.experience + simulationResults.score * 10, // Dar XP baseado na pontuação
      updatedAt: new Date()
    })

    if (!updatedUser) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar estatísticas'
      })
    }

    console.log('✅ Estatísticas atualizadas:', newStats)

    return res.json({
      success: true,
      data: {
        statistics: updatedUser.statistics,
        experience: updatedUser.experience
      }
    })
  } catch (error) {
    console.error('Erro ao atualizar estatísticas:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

import { 
  DetailedStats, 
  DetailedStatsResponse, 
  UserForStats, 
  JWTPayload,
  UserStatistics,
  AdvancedStats,
  ProgressStats,
  Recommendations 
} from '../types/detailedStats'

// GET /api/users/detailed-stats - Buscar estatísticas detalhadas
router.get('/detailed-stats', async (req, res) => {
  try {
    console.log('🔍 GET /api/users/detailed-stats - Buscando estatísticas detalhadas')
    
    // Verificar se há token de autenticação
    const authHeader: string | undefined = req.header('Authorization')
    console.log('🔐 Header Authorization:', authHeader ? 'PRESENTE' : 'AUSENTE')
    
    if (!authHeader) {
      console.log('❌ Token de autenticação não fornecido')
      const response: DetailedStatsResponse = {
        success: false, 
        message: 'Token de acesso necessário'
      }
      return res.status(401).json(response)
    }

    const token: string = authHeader.replace('Bearer ', '')
    console.log('🎟️  Token extraído (primeiros 50 chars):', token.substring(0, 50) + '...')
    
    // Decodificar token JWT usando middleware existente
    let decoded: JWTPayload
    try {
      const { verifyToken } = require('../middleware/auth')
      decoded = verifyToken(token) as JWTPayload
      console.log('✅ Token decodificado com sucesso:', { 
        userId: decoded.userId, 
        email: decoded.email, 
        tipo_userId: typeof decoded.userId 
      })
    } catch (error: any) {
      console.log('❌ Erro ao decodificar token:', error.message)
      const response: DetailedStatsResponse = {
        success: false, 
        message: 'Token inválido'
      }
      return res.status(401).json(response)
    }

    const userId: string = decoded.userId
    console.log('🆔 Buscando usuário com ID:', userId, '(tipo:', typeof userId, ')')

    // Buscar usuário no MockDB
    const user: UserForStats | null = await mockUserDB.findById(userId)
    if (!user) {
      console.log('❌ Usuário não encontrado para ID:', userId)
      const response: DetailedStatsResponse = {
        success: false, 
        message: 'Usuário não encontrado'
      }
      return res.status(404).json(response)
    }

    console.log('✅ Usuário encontrado:', user.email, '- Processando estatísticas...')

    // Calcular estatísticas avançadas
    const stats: UserStatistics = user.statistics || {
      totalSimulations: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      averageScore: 0,
      timeSpent: 0,
      streakDays: 0,
      lastSimulationDate: undefined
    }
    const now: Date = new Date()
    const createdAt: Date = new Date(user.createdAt)
    const daysSinceJoined: number = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
    
    // Calcular frequência de estudo
    const avgSimulationsPerWeek: number = stats.totalSimulations && daysSinceJoined > 0 
      ? (stats.totalSimulations / daysSinceJoined) * 7 
      : 0

    // Calcular tendência de performance
    const recentPerformance: number = stats.averageScore || 0
    let performanceTrend: 'excellent' | 'good' | 'average' | 'needs_improvement' | 'stable' = 'stable'
    if (recentPerformance >= 85) performanceTrend = 'excellent'
    else if (recentPerformance >= 70) performanceTrend = 'good'
    else if (recentPerformance >= 50) performanceTrend = 'average'
    else performanceTrend = 'needs_improvement'

    // Estatísticas por período (últimos 7 dias, 30 dias)
    const last7Days: boolean = stats.lastSimulationDate ? 
      (now.getTime() - new Date(stats.lastSimulationDate).getTime()) / (1000 * 60 * 60 * 24) <= 7 : false
    const last30Days: boolean = stats.lastSimulationDate ? 
      (now.getTime() - new Date(stats.lastSimulationDate).getTime()) / (1000 * 60 * 60 * 24) <= 30 : false

    const detailedStats: DetailedStats = {
      // Estatísticas básicas
      basic: {
        totalSimulations: stats.totalSimulations || 0,
        totalQuestions: stats.totalQuestions || 0,
        correctAnswers: stats.correctAnswers || 0,
        averageScore: stats.averageScore || 0,
        timeSpent: stats.timeSpent || 0,
        streakDays: stats.streakDays || 0,
        lastSimulationDate: stats.lastSimulationDate
      },

      // Métricas avançadas
      advanced: {
        avgQuestionsPerSimulation: stats.totalSimulations > 0 ? 
          Math.round(stats.totalQuestions / stats.totalSimulations) : 0,
        avgTimePerQuestion: stats.totalQuestions > 0 ? 
          Math.round(stats.timeSpent / stats.totalQuestions) : 0,
        efficiencyRate: stats.timeSpent > 0 ? 
          Number(((stats.correctAnswers / (stats.timeSpent / 3600)).toFixed(2))) : 0,
        studyFrequency: Number(avgSimulationsPerWeek.toFixed(1)),
        performanceTrend,
        daysSinceJoined,
        activeInLast7Days: last7Days,
        activeInLast30Days: last30Days
      },

      // Análise de progresso
      progress: {
        currentLevel: user.level || 1,
        experience: user.experience || 0,
        xpToNextLevel: Math.max(0, ((Math.floor((user.experience || 0) / 1000) + 1) * 1000) - (user.experience || 0)),
        completionRate: stats.totalQuestions > 0 ? 
          Number(((stats.correctAnswers / stats.totalQuestions) * 100).toFixed(1)) : 0,
        studyConsistency: stats.streakDays > 0 ? 
          Math.min(100, (stats.streakDays / 30) * 100) : 0 // Consistência baseada em 30 dias
      },

      // Recomendações baseadas em performance
      recommendations: {
        suggestedStudyTime: stats.averageScore < 70 ? 'Aumente o tempo de estudo' :
                           stats.averageScore < 85 ? 'Mantenha o ritmo atual' : 'Excelente performance!',
        focusAreas: stats.averageScore < 60 ? ['Revisar conceitos básicos', 'Fazer mais simulados'] :
                   stats.averageScore < 80 ? ['Praticar questões específicas', 'Revisar erros'] :
                   ['Manter consistência', 'Focar em questões avançadas'],
        nextGoal: stats.totalSimulations < 10 ? 'Complete 10 simulados' :
                 stats.averageScore < 70 ? 'Alcance 70% de aproveitamento' :
                 stats.streakDays < 7 ? 'Mantenha 7 dias consecutivos' :
                 'Mantenha a excelência!'
      }
    }

    console.log('✅ Estatísticas detalhadas calculadas para usuário:', user._id)
    
    const response: DetailedStatsResponse = {
      success: true,
      data: detailedStats
    }
    
    return res.json(response)

  } catch (error) {
    console.error('Erro ao buscar estatísticas detalhadas:', error)
    const response: DetailedStatsResponse = {
      success: false,
      message: 'Internal server error'
    }
    return res.status(500).json(response)
  }
})

export default router