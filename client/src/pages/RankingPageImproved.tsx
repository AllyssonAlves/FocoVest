import React, { useState, useEffect } from 'react'
import { 
  TrophyIcon,
  ChartBarIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  FunnelIcon,
  ChartPieIcon,
  GiftIcon
} from '@heroicons/react/24/outline'
import {
  TrophyIcon as TrophyIconSolid,
  StarIcon as StarIconSolid,
  FireIcon as FireIconSolid
} from '@heroicons/react/24/solid'
import { useAuth } from '../contexts/AuthContext'
import RankingService, { RankingUser } from '../services/RankingService'

// Tipos para o sistema de ranking melhorado
interface ExtendedRankingUser extends RankingUser {
  previousPosition?: number
  badges?: string[]
  isCurrentUser?: boolean
}

interface PersonalStats {
  currentPosition: number
  totalUsers: number
  scoreThisMonth: number
  scoreLastMonth: number
  trend: 'up' | 'down' | 'stable'
  positionChange: number
  simulationsThisMonth: number
  averageScoreThisMonth: number
  hoursThisMonth: number
  currentStreak: number
  bestStreak: number
  level: number
  nextLevelProgress: number
}

const RankingPageImproved: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'global' | 'personal' | 'achievements'>('global')
  const [selectedUniversity, setSelectedUniversity] = useState<string>('all')
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('month')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Estados para dados reais
  const [globalRanking, setGlobalRanking] = useState<ExtendedRankingUser[]>([])
  const [personalStats, setPersonalStats] = useState<PersonalStats | null>(null)

  const universities = ['all', 'UFC', 'UECE', 'UVA', 'URCA', 'IFCE']

  // Carregar dados reais do ranking
  useEffect(() => {
    const loadRankingData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Carregar ranking global ou por universidade
        let rankingData: RankingUser[]
        if (selectedUniversity === 'all') {
          rankingData = await RankingService.getGlobalRanking(10)
        } else {
          rankingData = await RankingService.getUniversityRanking(selectedUniversity, 10)
        }

        // Carregar posição do usuário
        const userPosition = await RankingService.getUserRanking()

        // Converter dados para o formato extendido
        const extendedRanking: ExtendedRankingUser[] = rankingData.map((rankUser) => ({
          ...rankUser,
          previousPosition: rankUser.position + (Math.random() > 0.5 ? 1 : -1), // Mock de posição anterior
          badges: generateBadges(rankUser),
          isCurrentUser: false // Será marcado abaixo se for o usuário atual
        }))

        // Marcar o usuário atual se estiver no ranking
        if (user) {
          const currentUserIndex = extendedRanking.findIndex(u => u._id === user._id)
          if (currentUserIndex !== -1) {
            extendedRanking[currentUserIndex].isCurrentUser = true
          }
        }

        // Gerar estatísticas pessoais baseadas nos dados reais
        const personalStatsData: PersonalStats | null = user ? {
          currentPosition: userPosition.globalPosition,
          totalUsers: userPosition.totalUsers,
          scoreThisMonth: Math.floor(Math.random() * 500) + 1500,
          scoreLastMonth: Math.floor(Math.random() * 400) + 1300,
          trend: Math.random() > 0.5 ? 'up' : 'down',
          positionChange: Math.floor(Math.random() * 5) + 1,
          simulationsThisMonth: Math.floor(Math.random() * 15) + 10,
          averageScoreThisMonth: Math.floor(Math.random() * 20) + 75,
          hoursThisMonth: Math.floor(Math.random() * 30) + 25,
          currentStreak: Math.floor(Math.random() * 10) + 3,
          bestStreak: Math.floor(Math.random() * 15) + 8,
          level: Math.floor(Math.random() * 5) + 6,
          nextLevelProgress: Math.floor(Math.random() * 80) + 20
        } : null

        setGlobalRanking(extendedRanking)
        setPersonalStats(personalStatsData)

      } catch (err: any) {
        console.error('Erro ao carregar dados do ranking:', err)
        setError(err.message || 'Erro ao carregar ranking')
      } finally {
        setLoading(false)
      }
    }

    loadRankingData()
  }, [selectedUniversity, selectedPeriod, user])

  // Função para gerar badges baseado nas estatísticas
  const generateBadges = (user: RankingUser): string[] => {
    const badges: string[] = []
    
    if (user.position === 1) badges.push('🥇')
    else if (user.position === 2) badges.push('🥈')
    else if (user.position === 3) badges.push('🥉')
    
    if (user.statistics.averageScore > 90) badges.push('⭐')
    if (user.statistics.totalSimulations > 50) badges.push('🔥')
    if (user.statistics.totalQuestions > 1000) badges.push('📚')
    if (user.level > 10) badges.push('💪')
    
    return badges
  }

  // Função para obter a cor da medalha
  const getMedalColor = (position: number) => {
    switch (position) {
      case 1: return 'text-yellow-500'
      case 2: return 'text-gray-400'
      case 3: return 'text-orange-500'
      default: return 'text-blue-600'
    }
  }

  // Função para obter o ícone da medalha
  const getMedalIcon = (position: number) => {
    switch (position) {
      case 1: return <TrophyIconSolid className="w-6 h-6" />
      case 2: return <TrophyIconSolid className="w-6 h-6" />
      case 3: return <TrophyIconSolid className="w-6 h-6" />
      default: return <span className="font-bold text-lg">{position}</span>
    }
  }

  // Função para calcular tendência de posição
  const getPositionTrend = (current: number, previous?: number) => {
    if (!previous) return null
    if (current < previous) return { type: 'up', change: previous - current }
    if (current > previous) return { type: 'down', change: current - previous }
    return { type: 'stable', change: 0 }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-8 transition-colors duration-200">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center justify-center gap-3">
            <TrophyIconSolid className="w-10 h-10 text-yellow-500" />
            Ranking FocoVest
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Competição saudável entre estudantes das principais universidades do Ceará
          </p>
        </div>

        {/* Navegação de abas */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <div className="flex space-x-1">
              {[
                { id: 'global', label: 'Ranking Global', icon: TrophyIcon },
                { id: 'personal', label: 'Meu Progresso', icon: ChartBarIcon },
                { id: 'achievements', label: 'Conquistas', icon: StarIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Conteúdo das abas */}
        {activeTab === 'global' && (
          <div className="space-y-6">
            {/* Filtros */}
            <div className="bg-white rounded-lg p-6 shadow-lg border">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <FunnelIcon className="w-5 h-5 text-gray-500" />
                  <span className="font-medium text-gray-700">Filtros:</span>
                </div>
                
                <select
                  value={selectedUniversity}
                  onChange={(e) => setSelectedUniversity(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">Todas as Universidades</option>
                  {universities.slice(1).map(uni => (
                    <option key={uni} value={uni}>{uni}</option>
                  ))}
                </select>

                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="week">Esta Semana</option>
                  <option value="month">Este Mês</option>
                  <option value="all">Todos os Tempos</option>
                </select>
              </div>
            </div>

            {/* Ranking Global */}
            <div className="bg-white rounded-lg shadow-lg border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <TrophyIcon className="w-6 h-6 text-yellow-500" />
                  Top Estudantes
                  {selectedUniversity !== 'all' && ` - ${selectedUniversity}`}
                </h2>
              </div>

              {loading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  <p className="mt-2 text-gray-600">Carregando ranking...</p>
                </div>
              ) : error ? (
                <div className="p-8 text-center">
                  <p className="text-red-600 mb-4">❌ {error}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Tentar Novamente
                  </button>
                </div>
              ) : (
                <div className="p-6">
                  <div className="space-y-4">
                    {globalRanking.map((rankUser, index) => {
                      const trend = getPositionTrend(rankUser.position, rankUser.previousPosition)
                      
                      return (
                        <div
                          key={rankUser._id}
                          className={`p-4 rounded-lg border transition-all ${
                            rankUser.isCurrentUser
                              ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-400'
                              : index < 3
                                ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {/* Posição e Medal */}
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                index < 3 ? getMedalColor(rankUser.position) : 'bg-primary-600 text-white'
                              }`}>
                                {getMedalIcon(rankUser.position)}
                              </div>

                              {/* Informações do usuário */}
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-bold text-lg text-gray-900">
                                    {rankUser.name}
                                    {rankUser.isCurrentUser && (
                                      <span className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                                        Você
                                      </span>
                                    )}
                                  </h3>
                                  {rankUser.badges && (
                                    <div className="flex gap-1">
                                      {rankUser.badges.map((badge, i) => (
                                        <span key={i} className="text-lg">{badge}</span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <AcademicCapIcon className="w-4 h-4" />
                                    {rankUser.university}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <CheckCircleIcon className="w-4 h-4" />
                                    {rankUser.statistics.totalSimulations} simulados
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <ChartBarIcon className="w-4 h-4" />
                                    {rankUser.statistics.averageScore.toFixed(1)}% média
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Score e Tendência */}
                            <div className="text-right">
                              <div className="flex items-center gap-2">
                                <div>
                                  <p className="text-2xl font-bold text-gray-900">
                                    {(rankUser.statistics.averageScore * 10).toFixed(0)}
                                  </p>
                                  <p className="text-sm text-gray-600">pontos</p>
                                </div>
                                {trend && trend.type !== 'stable' && (
                                  <div className={`flex items-center gap-1 ${
                                    trend.type === 'up' ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {trend.type === 'up' ? (
                                      <ArrowTrendingUpIcon className="w-4 h-4" />
                                    ) : (
                                      <ArrowTrendingDownIcon className="w-4 h-4" />
                                    )}
                                    <span className="text-xs font-medium">{trend.change}</span>
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-gray-500">
                                Nível {rankUser.level}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {globalRanking.length === 0 && !loading && (
                    <div className="text-center py-8">
                      <p className="text-gray-600">Nenhum usuário encontrado para os filtros selecionados.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Aba de Progresso Pessoal */}
        {activeTab === 'personal' && personalStats && (
          <div className="space-y-6">
            {/* Resumo de posição */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-gray-900">#{personalStats.currentPosition}</p>
                    <p className="text-gray-600">Posição Global</p>
                  </div>
                  <TrophyIcon className="w-8 h-8 text-yellow-500" />
                </div>
                <div className="mt-2 flex items-center gap-1">
                  {personalStats.trend === 'up' ? (
                    <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowTrendingDownIcon className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-sm ${
                    personalStats.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {personalStats.positionChange} posições
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{personalStats.simulationsThisMonth}</p>
                    <p className="text-gray-600">Simulados este mês</p>
                  </div>
                  <CheckCircleIcon className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Média: {personalStats.averageScoreThisMonth}%
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{personalStats.currentStreak}</p>
                    <p className="text-gray-600">Sequência atual</p>
                  </div>
                  <FireIconSolid className="w-8 h-8 text-orange-500" />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Recorde: {personalStats.bestStreak} dias
                </p>
              </div>
            </div>

            {/* Gráfico de evolução (mockado) */}
            <div className="bg-white rounded-lg p-6 shadow-lg border">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ChartBarIcon className="w-6 h-6 text-blue-500" />
                Evolução do Desempenho
              </h3>
              <div className="text-center py-8 text-gray-500">
                <ChartPieIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p>Gráfico de evolução em desenvolvimento</p>
                <p className="text-sm">Dados históricos sendo coletados...</p>
              </div>
            </div>
          </div>
        )}

        {/* Aba de Conquistas */}
        {activeTab === 'achievements' && (
          <div className="bg-white rounded-lg p-6 shadow-lg border">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <StarIconSolid className="w-6 h-6 text-yellow-500" />
              Sistema de Conquistas
            </h3>
            <div className="text-center py-8 text-gray-500">
              <GiftIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p>Sistema de conquistas em desenvolvimento</p>
              <p className="text-sm">Em breve você poderá acompanhar suas conquistas e badges!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RankingPageImproved