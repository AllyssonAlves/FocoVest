import User from '../models/User'
import { cacheService } from './CacheService'

/**
 * Serviço otimizado para estatísticas usando agregações MongoDB
 * Resolve o problema de queries N+1 identificado na análise
 */
export class OptimizedStatisticsService {
  private static CACHE_TTL = 300 // 5 minutos

  /**
   * Estatísticas globais otimizadas com agregação
   */
  static async getGlobalStatistics() {
    const cacheKey = 'optimized_global_stats'
    
    return await cacheService.getOrSet(cacheKey, async () => {
      console.log('📊 Calculando estatísticas globais com agregação otimizada...')
      
      const pipeline = [
        {
          $match: { 
            'statistics.totalSimulations': { $gt: 0 } // Apenas usuários ativos
          }
        },
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            totalSimulations: { $sum: '$statistics.totalSimulations' },
            totalQuestions: { $sum: '$statistics.totalQuestions' },
            totalCorrectAnswers: { $sum: '$statistics.correctAnswers' },
            totalTimeSpent: { $sum: '$statistics.timeSpent' },
            avgScore: { $avg: '$statistics.averageScore' },
            maxStreak: { $max: '$statistics.streakDays' }
          }
        },
        {
          $project: {
            _id: 0,
            totalUsers: 1,
            totalSimulations: 1,
            totalQuestions: 1,
            totalCorrectAnswers: 1,
            totalTimeSpent: 1,
            averageGlobalScore: { $round: ['$avgScore', 2] },
            maxStreak: 1,
            calculatedAt: '$$NOW'
          }
        }
      ]

      const [result] = await User.aggregate(pipeline)
      
      return result || {
        totalUsers: 0,
        totalSimulations: 0,
        totalQuestions: 0,
        totalCorrectAnswers: 0,
        totalTimeSpent: 0,
        averageGlobalScore: 0,
        maxStreak: 0,
        calculatedAt: new Date()
      }
    }, this.CACHE_TTL)
  }

  /**
   * Ranking otimizado com agregação e limite
   */
  static async getOptimizedRanking(university?: string, limit: number = 10) {
    const cacheKey = `optimized_ranking_${university || 'all'}_${limit}`
    
    return await cacheService.getOrSet(cacheKey, async () => {
      console.log('🏆 Calculando ranking com agregação otimizada...')
      
      const matchStage: any = {
        'statistics.totalSimulations': { $gt: 0 }
      }
      
      if (university) {
        matchStage.university = university
      }

      const pipeline = [
        { $match: matchStage },
        {
          $project: {
            name: 1,
            email: 1,
            university: 1,
            avatar: 1,
            level: 1,
            averageScore: '$statistics.averageScore',
            totalSimulations: '$statistics.totalSimulations',
            totalQuestions: '$statistics.totalQuestions',
            correctAnswers: '$statistics.correctAnswers',
            streakDays: '$statistics.streakDays',
            // Calcular pontuação composta
            compositeScore: {
              $add: [
                { $multiply: ['$statistics.averageScore', 0.7] },
                { $multiply: [{ $min: ['$statistics.totalSimulations', 50] }, 0.3] }
              ]
            }
          }
        },
        { $sort: { compositeScore: -1 as const, averageScore: -1 as const, totalSimulations: -1 as const } },
        { $limit: limit },
        {
          $addFields: {
            position: { $add: [{ $indexOfArray: [[], null] }, 1] }
          }
        }
      ]

      const ranking = await User.aggregate(pipeline)
      
      // Adicionar posições
      return ranking.map((user, index) => ({
        ...user,
        position: index + 1
      }))
    }, this.CACHE_TTL)
  }

  /**
   * Estatísticas por universidade otimizadas
   */
  static async getUniversityStatistics() {
    const cacheKey = 'optimized_university_stats'
    
    return await cacheService.getOrSet(cacheKey, async () => {
      console.log('🏫 Calculando estatísticas por universidade...')
      
      const pipeline = [
        {
          $match: {
            university: { $exists: true, $ne: null },
            'statistics.totalSimulations': { $gt: 0 }
          }
        },
        {
          $group: {
            _id: '$university',
            totalUsers: { $sum: 1 },
            avgScore: { $avg: '$statistics.averageScore' },
            totalSimulations: { $sum: '$statistics.totalSimulations' },
            totalQuestions: { $sum: '$statistics.totalQuestions' },
            bestUser: {
              $first: {
                $cond: [
                  { $eq: ['$statistics.averageScore', { $max: '$statistics.averageScore' }] },
                  { name: '$name', score: '$statistics.averageScore' },
                  null
                ]
              }
            }
          }
        },
        {
          $project: {
            university: '$_id',
            _id: 0,
            totalUsers: 1,
            avgScore: { $round: ['$avgScore', 2] },
            totalSimulations: 1,
            totalQuestions: 1,
            avgQuestionsPerUser: { $round: [{ $divide: ['$totalQuestions', '$totalUsers'] }, 0] },
            bestUser: 1
          }
        },
        { $sort: { avgScore: -1 as const } }
      ]

      return await User.aggregate(pipeline)
    }, this.CACHE_TTL)
  }

  /**
   * Buscar usuários similares com agregação otimizada
   */
  static async findSimilarUsers(userId: string, limit: number = 5) {
    const cacheKey = `similar_users_${userId}_${limit}`
    
    return await cacheService.getOrSet(cacheKey, async () => {
      console.log('👥 Buscando usuários similares...')
      
      // Primeiro buscar o usuário de referência
      const targetUser = await User.findById(userId, {
        'statistics.averageScore': 1,
        'statistics.totalSimulations': 1,
        university: 1
      })

      if (!targetUser) return []

      const scoreRange = 10 // ±10 pontos
      const simulationRange = 5 // ±5 simulados

      const pipeline = [
        {
          $match: {
            _id: { $ne: targetUser._id },
            university: targetUser.university, // Mesma universidade
            'statistics.averageScore': {
              $gte: Math.max(0, (targetUser.statistics?.averageScore || 0) - scoreRange),
              $lte: Math.min(100, (targetUser.statistics?.averageScore || 0) + scoreRange)
            },
            'statistics.totalSimulations': {
              $gte: Math.max(0, (targetUser.statistics?.totalSimulations || 0) - simulationRange),
              $lte: (targetUser.statistics?.totalSimulations || 0) + simulationRange
            }
          }
        },
        {
          $addFields: {
            similarity: {
              $subtract: [
                100,
                {
                  $add: [
                    { $abs: { $subtract: ['$statistics.averageScore', targetUser.statistics?.averageScore || 0] } },
                    { $multiply: [
                      { $abs: { $subtract: ['$statistics.totalSimulations', targetUser.statistics?.totalSimulations || 0] } },
                      2
                    ]}
                  ]
                }
              ]
            }
          }
        },
        {
          $project: {
            name: 1,
            email: 1,
            university: 1,
            avatar: 1,
            averageScore: '$statistics.averageScore',
            totalSimulations: '$statistics.totalSimulations',
            similarity: { $round: ['$similarity', 1] }
          }
        },
        { $sort: { similarity: -1 as const } },
        { $limit: limit }
      ]

      return await User.aggregate(pipeline)
    }, this.CACHE_TTL)
  }

  /**
   * Limpar cache quando necessário
   */
  static clearCache(pattern?: string) {
    if (pattern) {
      cacheService.invalidatePattern(pattern)
    } else {
      // Limpar apenas caches de estatísticas
      const patterns = [
        'optimized_global_stats',
        'optimized_ranking_*',
        'optimized_university_stats',
        'similar_users_*'
      ]
      patterns.forEach(p => cacheService.invalidatePattern(p))
    }
  }

  /**
   * Pré-aquecer caches críticos
   */
  static async warmupCriticalCaches() {
    console.log('🔥 Pré-aquecendo caches otimizados...')
    
    try {
      await Promise.all([
        this.getGlobalStatistics(),
        this.getOptimizedRanking(),
        this.getOptimizedRanking('UFC'),
        this.getOptimizedRanking('UECE'),
        this.getUniversityStatistics()
      ])
      console.log('✅ Caches críticos pré-aquecidos')
    } catch (error) {
      console.error('❌ Erro ao pré-aquecer caches:', error)
    }
  }
}

export default OptimizedStatisticsService