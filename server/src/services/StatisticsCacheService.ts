import { cacheService } from './CacheService'
import { mockUserDB } from './MockUserService'
import { UserStatistics } from '../types/detailedStats'

// Tipo para usuário do MockDB
interface MockUserType {
  _id: string
  name: string
  email: string
  university?: string
  statistics?: UserStatistics
  level?: number
  experience?: number
  createdAt: string
}

/**
 * Interface para estatísticas globais em cache
 */
interface GlobalStatsCache {
  totalUsers: number
  totalSimulations: number
  totalQuestions: number
  averageGlobalScore: number
  totalStudyTime: number
  activeUsersLast7Days: number
  activeUsersLast30Days: number
  calculatedAt: string
}

/**
 * Interface para estatísticas de ranking em cache
 */
interface RankingStatsCache {
  topPerformers: Array<{
    userId: string
    name: string
    email: string
    averageScore: number
    totalSimulations: number
    position: number
  }>
  universityRankings: Record<string, any[]>
  calculatedAt: string
}

/**
 * Interface para estatísticas detalhadas do usuário em cache
 */
interface DetailedUserStatsCache {
  userId: string
  basic: UserStatistics
  advanced: {
    avgQuestionsPerSimulation: number
    avgTimePerQuestion: number
    efficiencyRate: number
    studyFrequency: number
    performanceTrend: string
    daysSinceJoined: number
    activeInLast7Days: boolean
    activeInLast30Days: boolean
  }
  progress: {
    currentLevel: number
    experience: number
    xpToNextLevel: number
    completionRate: number
    studyConsistency: number
  }
  recommendations: {
    suggestedStudyTime: string
    focusAreas: string[]
    nextGoal: string
  }
  calculatedAt: string
}

/**
 * Serviço de Cache para Estatísticas
 * 
 * Gerencia cache específico para diferentes tipos de estatísticas:
 * - Estatísticas globais da plataforma
 * - Rankings e leaderboards
 * - Estatísticas detalhadas por usuário
 * - Métricas agregadas por universidade/matéria
 */
class StatisticsCacheService {
  // TTL específicos para diferentes tipos de dados
  private static readonly GLOBAL_STATS_TTL = 600 // 10 minutos
  private static readonly RANKING_STATS_TTL = 300 // 5 minutos  
  private static readonly USER_STATS_TTL = 180   // 3 minutos
  private static readonly AGGREGATED_STATS_TTL = 900 // 15 minutos

  /**
   * Cache de estatísticas globais
   */
  async getGlobalStatistics(): Promise<GlobalStatsCache> {
    const key = 'global_statistics'
    
    return await cacheService.getOrSet(key, async () => {
      console.log('📊 StatisticsCache: Calculando estatísticas globais...')
      
      const users = await mockUserDB.getAllUsers()
      
      let totalSimulations = 0
      let totalQuestions = 0
      let totalCorrectAnswers = 0
      let totalStudyTime = 0
      let activeUsersLast7Days = 0
      let activeUsersLast30Days = 0

      const now = new Date()
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      for (const user of users) {
        const stats = user.statistics || {}
        
        totalSimulations += stats.totalSimulations || 0
        totalQuestions += stats.totalQuestions || 0
        totalCorrectAnswers += stats.correctAnswers || 0
        totalStudyTime += stats.timeSpent || 0

        // Verificar atividade recente
        if (stats.lastSimulationDate) {
          const lastActivity = new Date(stats.lastSimulationDate)
          if (lastActivity >= sevenDaysAgo) activeUsersLast7Days++
          if (lastActivity >= thirtyDaysAgo) activeUsersLast30Days++
        }
      }

      const averageGlobalScore = totalQuestions > 0 
        ? (totalCorrectAnswers / totalQuestions) * 100 
        : 0

      const globalStats: GlobalStatsCache = {
        totalUsers: users.length,
        totalSimulations,
        totalQuestions,
        averageGlobalScore: Math.round(averageGlobalScore * 100) / 100,
        totalStudyTime: Math.round(totalStudyTime / 60), // em minutos
        activeUsersLast7Days,
        activeUsersLast30Days,
        calculatedAt: new Date().toISOString()
      }

      console.log('✅ StatisticsCache: Estatísticas globais calculadas', globalStats)
      return globalStats

    }, StatisticsCacheService.GLOBAL_STATS_TTL)
  }

  /**
   * Cache de estatísticas de ranking
   */
  async getRankingStatistics(): Promise<RankingStatsCache> {
    const key = 'ranking_statistics'
    
    return await cacheService.getOrSet(key, async () => {
      console.log('🏆 StatisticsCache: Calculando estatísticas de ranking...')
      
      const users = await mockUserDB.getAllUsers()
      
      // Calcular top performers
      const topPerformers = users
        .map((user: MockUserType) => ({
          userId: user._id,
          name: user.name,
          email: user.email,
          averageScore: user.statistics?.averageScore || 0,
          totalSimulations: user.statistics?.totalSimulations || 0,
          position: 0 // será calculado após ordenação
        }))
        .filter((user: any) => user.totalSimulations > 0) // Apenas usuários com simulados
        .sort((a: any, b: any) => {
          // Ordenar por score médio, depois por número de simulados
          if (Math.abs(a.averageScore - b.averageScore) < 0.1) {
            return b.totalSimulations - a.totalSimulations
          }
          return b.averageScore - a.averageScore
        })
        .slice(0, 10) // Top 10
        .map((user: any, index: number) => ({ ...user, position: index + 1 }))

      // Calcular rankings por universidade
      const universityRankings: Record<string, any[]> = {}
      const usersByUniversity: Record<string, typeof users> = {}

      for (const user of users) {
        const university = user.university || 'Não informada'
        if (!usersByUniversity[university]) {
          usersByUniversity[university] = []
        }
        usersByUniversity[university].push(user)
      }

      for (const [university, universityUsers] of Object.entries(usersByUniversity)) {
        universityRankings[university] = universityUsers
          .map((user: MockUserType) => ({
            userId: user._id,
            name: user.name,
            averageScore: user.statistics?.averageScore || 0,
            totalSimulations: user.statistics?.totalSimulations || 0
          }))
          .filter((user: any) => user.totalSimulations > 0)
          .sort((a: any, b: any) => b.averageScore - a.averageScore)
          .slice(0, 5) // Top 5 por universidade
      }

      const rankingStats: RankingStatsCache = {
        topPerformers,
        universityRankings,
        calculatedAt: new Date().toISOString()
      }

      console.log('✅ StatisticsCache: Estatísticas de ranking calculadas', {
        topPerformersCount: topPerformers.length,
        universitiesCount: Object.keys(universityRankings).length
      })

      return rankingStats

    }, StatisticsCacheService.RANKING_STATS_TTL)
  }

  /**
   * Cache de estatísticas detalhadas por usuário
   */
  async getUserDetailedStatistics(userId: string): Promise<DetailedUserStatsCache | null> {
    const key = `user_detailed_stats:${userId}`
    
    return await cacheService.getOrSet(key, async () => {
      console.log(`👤 StatisticsCache: Calculando estatísticas detalhadas para usuário ${userId}...`)
      
      const user = await mockUserDB.findById(userId)
      if (!user) {
        console.log(`❌ StatisticsCache: Usuário ${userId} não encontrado`)
        return null
      }

      const stats = user.statistics || {
        totalSimulations: 0,
        totalQuestions: 0,
        correctAnswers: 0,
        averageScore: 0,
        timeSpent: 0,
        streakDays: 0
      }

      const now = new Date()
      const createdAt = new Date(user.createdAt)
      const daysSinceJoined = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))

      // Cálculos avançados
      const avgQuestionsPerSimulation = stats.totalSimulations > 0 
        ? Math.round(stats.totalQuestions / stats.totalSimulations) 
        : 0

      const avgTimePerQuestion = stats.totalQuestions > 0 
        ? Math.round(stats.timeSpent / stats.totalQuestions) 
        : 0

      const efficiencyRate = stats.timeSpent > 0 
        ? Number(((stats.correctAnswers / (stats.timeSpent / 3600)).toFixed(2))) 
        : 0

      const studyFrequency = stats.totalSimulations && daysSinceJoined > 0
        ? Number(((stats.totalSimulations / daysSinceJoined) * 7).toFixed(1))
        : 0

      // Determinar tendência de performance
      let performanceTrend = 'stable'
      if (stats.averageScore >= 85) performanceTrend = 'excellent'
      else if (stats.averageScore >= 70) performanceTrend = 'good'
      else if (stats.averageScore >= 50) performanceTrend = 'average'
      else performanceTrend = 'needs_improvement'

      // Atividade recente
      const last7Days = stats.lastSimulationDate ? 
        (now.getTime() - new Date(stats.lastSimulationDate).getTime()) / (1000 * 60 * 60 * 24) <= 7 : false
      const last30Days = stats.lastSimulationDate ? 
        (now.getTime() - new Date(stats.lastSimulationDate).getTime()) / (1000 * 60 * 60 * 24) <= 30 : false

      // Cálculos de progresso
      const currentLevel = user.level || 1
      const currentXP = user.experience || 0
      const maxLevelXP = currentLevel * 200
      const currentLevelXP = currentXP % maxLevelXP
      const xpToNextLevel = maxLevelXP - currentLevelXP

      const completionRate = stats.totalQuestions > 0 
        ? Number(((stats.correctAnswers / stats.totalQuestions) * 100).toFixed(1)) 
        : 0

      const studyConsistency = stats.streakDays > 0 
        ? Math.min(100, (stats.streakDays / 30) * 100) 
        : 0

      // Recomendações
      const suggestedStudyTime = stats.averageScore < 70 ? 'Aumente o tempo de estudo' :
                                stats.averageScore < 85 ? 'Mantenha o ritmo atual' : 
                                'Excelente performance!'

      const focusAreas = stats.averageScore < 60 ? ['Revisar conceitos básicos', 'Fazer mais simulados'] :
                        stats.averageScore < 80 ? ['Praticar questões específicas', 'Revisar erros'] :
                        ['Manter consistência', 'Focar em questões avançadas']

      const nextGoal = stats.totalSimulations < 10 ? 'Complete 10 simulados' :
                      stats.averageScore < 70 ? 'Alcance 70% de aproveitamento' :
                      stats.streakDays < 7 ? 'Mantenha 7 dias consecutivos' :
                      'Mantenha a excelência!'

      const detailedStats: DetailedUserStatsCache = {
        userId: user._id,
        basic: stats,
        advanced: {
          avgQuestionsPerSimulation,
          avgTimePerQuestion,
          efficiencyRate,
          studyFrequency,
          performanceTrend,
          daysSinceJoined,
          activeInLast7Days: last7Days,
          activeInLast30Days: last30Days
        },
        progress: {
          currentLevel,
          experience: currentXP,
          xpToNextLevel,
          completionRate,
          studyConsistency
        },
        recommendations: {
          suggestedStudyTime,
          focusAreas,
          nextGoal
        },
        calculatedAt: new Date().toISOString()
      }

      console.log(`✅ StatisticsCache: Estatísticas detalhadas calculadas para ${user.name}`)
      return detailedStats

    }, StatisticsCacheService.USER_STATS_TTL)
  }

  /**
   * Invalidar cache de usuário específico
   */
  invalidateUserCache(userId: string): void {
    const patterns = [
      `user_detailed_stats:${userId}`,
      'global_statistics',
      'ranking_statistics'
    ]

    patterns.forEach(pattern => {
      cacheService.delete(pattern)
    })

    console.log(`🗑️  StatisticsCache: Cache invalidado para usuário ${userId}`)
  }

  /**
   * Invalidar todo o cache de estatísticas
   */
  invalidateAllCache(): void {
    cacheService.invalidatePattern('.*_statistics.*')
    cacheService.invalidatePattern('user_detailed_stats:.*')
    console.log('🧹 StatisticsCache: Todo cache de estatísticas invalidado')
  }

  /**
   * Obter métricas do cache
   */
  getCacheMetrics() {
    return cacheService.getMetrics()
  }

  /**
   * Pré-aquecer cache com dados mais utilizados
   */
  async warmupCache(): Promise<void> {
    console.log('🔥 StatisticsCache: Iniciando warm-up do cache...')
    
    try {
      // Carregar estatísticas globais e de ranking
      await Promise.all([
        this.getGlobalStatistics(),
        this.getRankingStatistics()
      ])

      // Carregar estatísticas dos top 5 usuários
      const users = await mockUserDB.getAllUsers()
      const topUsers = users
        .sort((a: MockUserType, b: MockUserType) => (b.statistics?.averageScore || 0) - (a.statistics?.averageScore || 0))
        .slice(0, 5)

      await Promise.all(
        topUsers.map((user: MockUserType) => this.getUserDetailedStatistics(user._id))
      )

      console.log('✅ StatisticsCache: Warm-up concluído com sucesso')
    } catch (error) {
      console.error('❌ StatisticsCache: Erro no warm-up do cache:', error)
    }
  }
}

// Instância singleton do serviço de cache de estatísticas
export const statisticsCacheService = new StatisticsCacheService()

export default StatisticsCacheService
export type { 
  GlobalStatsCache, 
  RankingStatsCache, 
  DetailedUserStatsCache 
}