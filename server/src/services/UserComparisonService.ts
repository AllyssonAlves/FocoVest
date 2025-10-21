import { mockUserDB } from './MockUserService'
import { cacheService } from './CacheService'

/**
 * Interface para dados básicos de comparação do usuário
 */
interface UserComparisonData {
  userId: string
  name: string
  email: string
  university?: string
  course?: string
  statistics: {
    averageScore: number
    totalSimulations: number
    totalQuestions: number
    correctAnswers: number
    timeSpent: number
    streakDays: number
  }
  level: number
  experience: number
  createdAt: string
}

/**
 * Interface para posição do usuário em rankings
 */
interface UserRankingPosition {
  globalPosition: number
  totalUsers: number
  globalPercentile: number
  universityPosition?: number
  totalUniversityUsers?: number
  universityPercentile?: number
  coursePosition?: number
  totalCourseUsers?: number
  coursePercentile?: number
}

/**
 * Interface para comparação detalhada de métricas
 */
interface MetricComparison {
  metric: string
  userValue: number
  average: number
  median: number
  percentile: number
  rank: number
  totalUsers: number
  betterThanPercent: number
  category: 'excellent' | 'above_average' | 'average' | 'below_average' | 'needs_improvement'
}

/**
 * Interface para insights comparativos
 */
interface ComparativeInsight {
  type: 'achievement' | 'improvement' | 'encouragement' | 'goal'
  title: string
  description: string
  metric?: string
  value?: number
  comparison?: string
  icon: string
}

/**
 * Interface para comparação completa do usuário
 */
interface UserComparison {
  user: {
    id: string
    name: string
    university?: string
    course?: string
  }
  rankingPositions: UserRankingPosition
  metricComparisons: MetricComparison[]
  insights: ComparativeInsight[]
  similarUsers: Array<{
    id: string
    name: string
    university?: string
    similarity: number
    performance: 'better' | 'similar' | 'worse'
  }>
  goals: Array<{
    metric: string
    current: number
    target: number
    percentileTarget: number
    timeEstimate?: string
  }>
  calculatedAt: string
}

/**
 * Serviço de Comparação de Usuários
 * 
 * Funcionalidades:
 * - Cálculo de percentis e rankings
 * - Comparação por múltiplas métricas
 * - Análise por universidade e curso
 * - Geração de insights personalizados
 * - Identificação de usuários similares
 * - Definição de metas baseadas em percentis
 */
class UserComparisonService {
  private static readonly CACHE_TTL = 300 // 5 minutos

  /**
   * Obter comparação completa do usuário
   */
  async getUserComparison(userId: string): Promise<UserComparison | null> {
    const cacheKey = `user_comparison:${userId}`
    
    return await cacheService.getOrSet(cacheKey, async () => {
      console.log(`📊 UserComparison: Calculando comparação para usuário ${userId}...`)
      
      const users = await mockUserDB.getAllUsers()
      const currentUser = users.find((u: any) => u._id === userId)
      
      if (!currentUser) {
        console.log(`❌ UserComparison: Usuário ${userId} não encontrado`)
        return null
      }

      // Preparar dados para comparação
      const comparisonData = this.prepareComparisonData(users)
      const userComparisonData = comparisonData.find(u => u.userId === userId)
      
      if (!userComparisonData) {
        return null
      }

      // Calcular posições nos rankings
      const rankingPositions = this.calculateRankingPositions(userComparisonData, comparisonData)
      
      // Comparar métricas individuais
      const metricComparisons = this.calculateMetricComparisons(userComparisonData, comparisonData)
      
      // Gerar insights personalizados
      const insights = this.generateInsights(userComparisonData, rankingPositions, metricComparisons)
      
      // Encontrar usuários similares
      const similarUsers = this.findSimilarUsers(userComparisonData, comparisonData)
      
      // Definir metas baseadas em percentis
      const goals = this.generateGoals(userComparisonData, comparisonData, metricComparisons)

      const comparison: UserComparison = {
        user: {
          id: currentUser._id,
          name: currentUser.name,
          university: currentUser.university,
          course: currentUser.course
        },
        rankingPositions,
        metricComparisons,
        insights,
        similarUsers,
        goals,
        calculatedAt: new Date().toISOString()
      }

      console.log(`✅ UserComparison: Comparação calculada para ${currentUser.name}`)
      return comparison

    }, UserComparisonService.CACHE_TTL)
  }

  /**
   * Preparar dados de todos os usuários para comparação
   */
  private prepareComparisonData(users: any[]): UserComparisonData[] {
    return users
      .filter((user: any) => user.statistics && user.statistics.totalSimulations > 0)
      .map((user: any) => ({
        userId: user._id,
        name: user.name,
        email: user.email,
        university: user.university,
        course: user.course,
        statistics: {
          averageScore: user.statistics?.averageScore || 0,
          totalSimulations: user.statistics?.totalSimulations || 0,
          totalQuestions: user.statistics?.totalQuestions || 0,
          correctAnswers: user.statistics?.correctAnswers || 0,
          timeSpent: user.statistics?.timeSpent || 0,
          streakDays: user.statistics?.streakDays || 0
        },
        level: user.level || 1,
        experience: user.experience || 0,
        createdAt: user.createdAt
      }))
  }

  /**
   * Calcular posições em rankings globais, por universidade e curso
   */
  private calculateRankingPositions(user: UserComparisonData, allUsers: UserComparisonData[]): UserRankingPosition {
    // Ranking global por score médio
    const globalRanking = [...allUsers]
      .sort((a, b) => {
        // Priorizar score médio, depois total de simulados
        if (Math.abs(a.statistics.averageScore - b.statistics.averageScore) < 0.1) {
          return b.statistics.totalSimulations - a.statistics.totalSimulations
        }
        return b.statistics.averageScore - a.statistics.averageScore
      })

    const globalPosition = globalRanking.findIndex(u => u.userId === user.userId) + 1
    const globalPercentile = ((allUsers.length - globalPosition + 1) / allUsers.length) * 100

    // Ranking por universidade
    let universityPosition: number | undefined
    let totalUniversityUsers: number | undefined
    let universityPercentile: number | undefined

    if (user.university) {
      const universityUsers = allUsers.filter(u => u.university === user.university)
      if (universityUsers.length > 1) {
        const universityRanking = [...universityUsers]
          .sort((a, b) => b.statistics.averageScore - a.statistics.averageScore)
        
        universityPosition = universityRanking.findIndex(u => u.userId === user.userId) + 1
        totalUniversityUsers = universityUsers.length
        universityPercentile = ((universityUsers.length - universityPosition + 1) / universityUsers.length) * 100
      }
    }

    // Ranking por curso
    let coursePosition: number | undefined
    let totalCourseUsers: number | undefined
    let coursePercentile: number | undefined

    if (user.course) {
      const courseUsers = allUsers.filter(u => u.course === user.course)
      if (courseUsers.length > 1) {
        const courseRanking = [...courseUsers]
          .sort((a, b) => b.statistics.averageScore - a.statistics.averageScore)
        
        coursePosition = courseRanking.findIndex(u => u.userId === user.userId) + 1
        totalCourseUsers = courseUsers.length
        coursePercentile = ((courseUsers.length - coursePosition + 1) / courseUsers.length) * 100
      }
    }

    return {
      globalPosition,
      totalUsers: allUsers.length,
      globalPercentile: Math.round(globalPercentile * 10) / 10,
      universityPosition,
      totalUniversityUsers,
      universityPercentile: universityPercentile ? Math.round(universityPercentile * 10) / 10 : undefined,
      coursePosition,
      totalCourseUsers,
      coursePercentile: coursePercentile ? Math.round(coursePercentile * 10) / 10 : undefined
    }
  }

  /**
   * Calcular comparações para múltiplas métricas
   */
  private calculateMetricComparisons(user: UserComparisonData, allUsers: UserComparisonData[]): MetricComparison[] {
    const metrics = [
      {
        key: 'averageScore',
        name: 'Score Médio',
        getValue: (u: UserComparisonData) => u.statistics.averageScore
      },
      {
        key: 'totalSimulations',
        name: 'Total de Simulados',
        getValue: (u: UserComparisonData) => u.statistics.totalSimulations
      },
      {
        key: 'correctAnswers',
        name: 'Questões Corretas',
        getValue: (u: UserComparisonData) => u.statistics.correctAnswers
      },
      {
        key: 'streakDays',
        name: 'Sequência de Dias',
        getValue: (u: UserComparisonData) => u.statistics.streakDays
      },
      {
        key: 'experience',
        name: 'Experiência (XP)',
        getValue: (u: UserComparisonData) => u.experience
      }
    ]

    return metrics.map(metric => {
      const values = allUsers.map(metric.getValue).sort((a, b) => a - b)
      const userValue = metric.getValue(user)
      
      // Calcular estatísticas
      const average = values.reduce((a, b) => a + b, 0) / values.length
      const median = values[Math.floor(values.length / 2)]
      
      // Calcular percentil
      const rank = values.filter(v => v < userValue).length + 1
      const percentile = (rank / values.length) * 100
      const betterThanPercent = ((values.filter(v => v < userValue).length) / values.length) * 100

      // Determinar categoria
      let category: MetricComparison['category']
      if (percentile >= 90) category = 'excellent'
      else if (percentile >= 70) category = 'above_average'
      else if (percentile >= 40) category = 'average'
      else if (percentile >= 20) category = 'below_average'
      else category = 'needs_improvement'

      return {
        metric: metric.name,
        userValue: Math.round(userValue * 100) / 100,
        average: Math.round(average * 100) / 100,
        median: Math.round(median * 100) / 100,
        percentile: Math.round(percentile * 10) / 10,
        rank,
        totalUsers: values.length,
        betterThanPercent: Math.round(betterThanPercent * 10) / 10,
        category
      }
    })
  }

  /**
   * Gerar insights personalizados baseados na comparação
   */
  private generateInsights(
    user: UserComparisonData, 
    rankings: UserRankingPosition, 
    metrics: MetricComparison[]
  ): ComparativeInsight[] {
    const insights: ComparativeInsight[] = []

    // Insight sobre posição geral
    if (rankings.globalPercentile >= 80) {
      insights.push({
        type: 'achievement',
        title: 'Performance Excelente!',
        description: `Você está melhor que ${rankings.globalPercentile.toFixed(1)}% dos usuários da plataforma`,
        icon: '🏆'
      })
    } else if (rankings.globalPercentile >= 50) {
      insights.push({
        type: 'encouragement',
        title: 'Acima da Média',
        description: `Você está melhor que ${rankings.globalPercentile.toFixed(1)}% dos usuários. Continue assim!`,
        icon: '📈'
      })
    } else {
      insights.push({
        type: 'improvement',
        title: 'Espaço para Crescer',
        description: `Há margem para melhoria. Você está melhor que ${rankings.globalPercentile.toFixed(1)}% dos usuários`,
        icon: '💪'
      })
    }

    // Insight sobre universidade
    if (rankings.universityPercentile && rankings.universityPosition) {
      if (rankings.universityPercentile >= 70) {
        insights.push({
          type: 'achievement',
          title: `Destaque na ${user.university}`,
          description: `Você está em ${rankings.universityPosition}º lugar entre ${rankings.totalUniversityUsers} estudantes da sua universidade`,
          icon: '🎓'
        })
      }
    }

    // Insights sobre métricas específicas
    const scoreMetric = metrics.find(m => m.metric === 'Score Médio')
    if (scoreMetric && scoreMetric.category === 'excellent') {
      insights.push({
        type: 'achievement',
        title: 'Score Excepcional',
        description: `Seu score médio de ${scoreMetric.userValue.toFixed(1)}% está melhor que ${scoreMetric.betterThanPercent.toFixed(1)}% dos usuários`,
        metric: 'Score Médio',
        value: scoreMetric.userValue,
        icon: '🎯'
      })
    }

    const streakMetric = metrics.find(m => m.metric === 'Sequência de Dias')
    if (streakMetric && streakMetric.userValue >= 7) {
      insights.push({
        type: 'achievement',
        title: 'Consistência Admirável',
        description: `${streakMetric.userValue} dias consecutivos de estudo - você está melhor que ${streakMetric.betterThanPercent.toFixed(1)}% dos usuários`,
        metric: 'Sequência de Dias',
        value: streakMetric.userValue,
        icon: '🔥'
      })
    }

    // Meta motivacional
    const weakestMetric = metrics
      .filter(m => m.category === 'below_average' || m.category === 'needs_improvement')
      .sort((a, b) => a.percentile - b.percentile)[0]

    if (weakestMetric) {
      insights.push({
        type: 'goal',
        title: 'Próximo Objetivo',
        description: `Melhorar em ${weakestMetric.metric} pode elevar sua posição geral`,
        metric: weakestMetric.metric,
        icon: '🎯'
      })
    }

    return insights
  }

  /**
   * Encontrar usuários com performance similar
   */
  private findSimilarUsers(user: UserComparisonData, allUsers: UserComparisonData[]): UserComparison['similarUsers'] {
    const otherUsers = allUsers.filter(u => u.userId !== user.userId)
    
    const similarities = otherUsers.map(otherUser => {
      // Calcular similaridade baseada em múltiplas métricas
      const scoreRatio = Math.min(user.statistics.averageScore, otherUser.statistics.averageScore) / 
                         Math.max(user.statistics.averageScore, otherUser.statistics.averageScore)
      
      const simulationsRatio = Math.min(user.statistics.totalSimulations, otherUser.statistics.totalSimulations) / 
                              Math.max(user.statistics.totalSimulations, otherUser.statistics.totalSimulations)
      
      const experienceRatio = Math.min(user.experience, otherUser.experience) / 
                             Math.max(user.experience, otherUser.experience)

      // Média ponderada da similaridade
      const similarity = (scoreRatio * 0.5 + simulationsRatio * 0.3 + experienceRatio * 0.2) * 100

      // Determinar performance relativa
      let performance: 'better' | 'similar' | 'worse'
      const scoreDiff = otherUser.statistics.averageScore - user.statistics.averageScore
      if (Math.abs(scoreDiff) <= 5) performance = 'similar'
      else if (scoreDiff > 0) performance = 'better'
      else performance = 'worse'

      return {
        user: otherUser,
        similarity,
        performance
      }
    })

    // Retornar os 5 usuários mais similares
    return similarities
      .filter(s => s.similarity >= 60) // Pelo menos 60% de similaridade
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5)
      .map(s => ({
        id: s.user.userId,
        name: s.user.name,
        university: s.user.university,
        similarity: Math.round(s.similarity * 10) / 10,
        performance: s.performance
      }))
  }

  /**
   * Gerar metas baseadas em percentis alvo
   */
  private generateGoals(
    user: UserComparisonData, 
    allUsers: UserComparisonData[], 
    metrics: MetricComparison[]
  ): UserComparison['goals'] {
    const goals: UserComparison['goals'] = []

    // Meta para chegar ao percentil 75 na métrica mais fraca
    const improvableMetrics = metrics
      .filter(m => m.percentile < 75 && (m.metric === 'Score Médio' || m.metric === 'Total de Simulados'))
      .sort((a, b) => a.percentile - b.percentile)

    if (improvableMetrics.length > 0) {
      const targetMetric = improvableMetrics[0]
      const allValues = allUsers.map(u => {
        if (targetMetric.metric === 'Score Médio') return u.statistics.averageScore
        if (targetMetric.metric === 'Total de Simulados') return u.statistics.totalSimulations
        return 0
      }).sort((a, b) => a - b)

      const percentil75Index = Math.floor(allValues.length * 0.75)
      const target = allValues[percentil75Index]

      goals.push({
        metric: targetMetric.metric,
        current: targetMetric.userValue,
        target: Math.round(target * 100) / 100,
        percentileTarget: 75,
        timeEstimate: this.estimateTimeToGoal(targetMetric.metric, targetMetric.userValue, target)
      })
    }

    // Meta de consistency (streak)
    const streakMetric = metrics.find(m => m.metric === 'Sequência de Dias')
    if (streakMetric && streakMetric.userValue < 14) {
      goals.push({
        metric: 'Sequência de Dias',
        current: streakMetric.userValue,
        target: 14,
        percentileTarget: 80,
        timeEstimate: '2 semanas'
      })
    }

    return goals
  }

  /**
   * Estimar tempo para atingir meta
   */
  private estimateTimeToGoal(metric: string, current: number, target: number): string {
    const difference = target - current

    if (metric === 'Score Médio') {
      if (difference <= 5) return '1-2 semanas'
      if (difference <= 10) return '3-4 semanas'
      return '1-2 meses'
    }

    if (metric === 'Total de Simulados') {
      const simuladosNeeded = Math.ceil(difference)
      if (simuladosNeeded <= 5) return '1 semana'
      if (simuladosNeeded <= 15) return '2-3 semanas'
      return '1 mês'
    }

    return 'Algumas semanas'
  }

  /**
   * Invalidar cache de comparação para usuário específico
   */
  invalidateUserComparison(userId: string): void {
    cacheService.delete(`user_comparison:${userId}`)
    console.log(`🗑️ UserComparison: Cache invalidado para usuário ${userId}`)
  }

  /**
   * Invalidar todo o cache de comparações
   */
  invalidateAllComparisons(): void {
    cacheService.invalidatePattern('user_comparison:.*')
    console.log('🧹 UserComparison: Todo cache de comparações invalidado')
  }
}

// Instância singleton do serviço
export const userComparisonService = new UserComparisonService()

export default UserComparisonService
export type { 
  UserComparison, 
  UserRankingPosition, 
  MetricComparison, 
  ComparativeInsight 
}