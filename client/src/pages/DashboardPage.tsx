import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import RankingService, { RankingUser, UserRanking } from '../services/RankingService'
import {
  TrophyIcon,
  ChartBarIcon,
  AcademicCapIcon,
  ClockIcon,
  FireIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  PlayIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

interface DashboardStats {
  totalSimulations: number
  totalQuestions: number
  correctAnswers: number
  averageScore: number
  timeSpent: number
  streakDays: number
  nextLevelXP: number
  currentLevelXP: number
  maxLevelXP: number
}

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const [userRanking, setUserRanking] = useState<UserRanking | null>(null)
  const [topRanking, setTopRanking] = useState<RankingUser[]>([])
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    setIsLoadingData(true)
    try {
      // Carregar dados em paralelo
      const [rankingData, topUsers] = await Promise.all([
        RankingService.getUserRanking(),
        RankingService.getGlobalRanking(5)
      ])

      setUserRanking(rankingData)
      setTopRanking(topUsers)

      // Calcular estatísticas da dashboard
      if (user?.statistics) {
        const stats = user.statistics
        const currentLevel = user.level || 1
        const currentXP = user.experience || 0
        
        // Cálculo de XP para próximo nível (exemplo: cada nível precisa de level * 100 XP)
        const maxLevelXP = currentLevel * 200
        const currentLevelXP = currentXP % maxLevelXP
        const nextLevelXP = maxLevelXP - currentLevelXP

        setDashboardStats({
          totalSimulations: stats.totalSimulations || 0,
          totalQuestions: stats.totalQuestions || 0,
          correctAnswers: stats.correctAnswers || 0,
          averageScore: stats.averageScore || 0,
          timeSpent: Math.round((stats.timeSpent || 0) / 60), // Converter para minutos
          streakDays: stats.streakDays || 0,
          nextLevelXP,
          currentLevelXP,
          maxLevelXP
        })
      }
    } catch (error) {
      console.error('Erro ao carregar dados da dashboard:', error)
    } finally {
      setIsLoadingData(false)
    }
  }

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}min`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}min`
  }

  if (isLoading || isLoadingData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-64 mb-6"></div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="card">
                <div className="h-6 bg-gray-300 rounded w-48 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Acesso Negado</h1>
        <p className="text-gray-600 mb-6">Faça login para acessar sua dashboard.</p>
        <Link to="/login" className="btn-primary">
          Fazer Login
        </Link>
      </div>
    )
  }

  const progressPercentage = dashboardStats && dashboardStats.maxLevelXP ? 
    ((dashboardStats?.currentLevelXP || 0) / dashboardStats.maxLevelXP) * 100 : 0
  const accuracyPercentage = dashboardStats?.totalQuestions && dashboardStats.totalQuestions > 0 
    ? ((dashboardStats?.correctAnswers || 0) / dashboardStats.totalQuestions) * 100 
    : 0

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center md:text-left"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Olá, {user.name.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-600">
          Bem-vindo de volta à sua jornada de estudos
        </p>
      </motion.div>

      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-sm font-medium">Simulados</p>
              <p className="text-3xl font-bold">{dashboardStats?.totalSimulations || 0}</p>
              <p className="text-primary-200 text-sm mt-1">Realizados</p>
            </div>
            <AcademicCapIcon className="w-12 h-12 text-primary-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card bg-gradient-to-br from-green-500 to-green-600 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Precisão</p>
              <p className="text-3xl font-bold">{accuracyPercentage.toFixed(1)}%</p>
              <p className="text-green-200 text-sm mt-1">
                {dashboardStats?.correctAnswers || 0}/{dashboardStats?.totalQuestions || 0} acertos
              </p>
            </div>
            <ChartBarIcon className="w-12 h-12 text-green-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Tempo Estudado</p>
              <p className="text-3xl font-bold">{formatTime(dashboardStats?.timeSpent || 0)}</p>
              <p className="text-orange-200 text-sm mt-1">Total</p>
            </div>
            <ClockIcon className="w-12 h-12 text-orange-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Sequência</p>
              <p className="text-3xl font-bold">{dashboardStats?.streakDays || 0}</p>
              <p className="text-purple-200 text-sm mt-1">Dias seguidos</p>
            </div>
            <FireIcon className="w-12 h-12 text-purple-200" />
          </div>
        </motion.div>
      </div>

      {/* Nível e Progresso */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <StarIcon className="w-6 h-6 mr-2 text-yellow-500" />
            Nível {user.level || 1}
          </h2>
          <span className="text-sm text-gray-600">
            {dashboardStats?.nextLevelXP || 0} XP para o próximo nível
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div 
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-sm text-gray-600">
          <span>{dashboardStats?.currentLevelXP || 0} XP</span>
          <span>{dashboardStats?.maxLevelXP || 200} XP</span>
        </div>
      </motion.div>

      {/* Ranking e Ações Rápidas */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Ranking */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <TrophyIcon className="w-6 h-6 mr-2 text-yellow-500" />
            Seu Ranking
          </h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Posição Global</span>
              <span className="font-bold text-primary-600">
                #{userRanking?.globalPosition || '--'}
              </span>
            </div>
            
            {user.university && (
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Posição na {user.university}</span>
                <span className="font-bold text-secondary-600">
                  #{userRanking?.universityPosition || '--'}
                </span>
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Top 5 Global</h3>
            <div className="space-y-2">
              {topRanking.slice(0, 3).map((user, index) => (
                <div key={user._id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      'bg-orange-400 text-white'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="text-sm">{user.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">{user.statistics.averageScore.toFixed(1)}%</span>
                </div>
              ))}
            </div>
            
            <Link 
              to="/ranking" 
              className="block mt-4 text-center text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Ver ranking completo →
            </Link>
          </div>
        </motion.div>

        {/* Ações Rápidas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <ArrowTrendingUpIcon className="w-6 h-6 mr-2 text-green-500" />
            Ações Rápidas
          </h2>
          
          <div className="space-y-3">
            <Link 
              to="/simulations" 
              className="flex items-center p-4 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors group"
            >
              <PlayIcon className="w-8 h-8 text-primary-600 mr-3 group-hover:scale-110 transition-transform" />
              <div>
                <h3 className="font-medium text-primary-900">Fazer Simulado</h3>
                <p className="text-sm text-primary-600">Continue seus estudos</p>
              </div>
            </Link>
            
            <Link 
              to="/simulations/create" 
              className="flex items-center p-4 bg-secondary-50 hover:bg-secondary-100 rounded-lg transition-colors group"
            >
              <PlusIcon className="w-8 h-8 text-secondary-600 mr-3 group-hover:scale-110 transition-transform" />
              <div>
                <h3 className="font-medium text-secondary-900">Criar Simulado</h3>
                <p className="text-sm text-secondary-600">Personalizado para você</p>
              </div>
            </Link>
            
            <Link 
              to="/ranking" 
              className="flex items-center p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors group"
            >
              <UserGroupIcon className="w-8 h-8 text-yellow-600 mr-3 group-hover:scale-110 transition-transform" />
              <div>
                <h3 className="font-medium text-yellow-900">Ver Ranking</h3>
                <p className="text-sm text-yellow-600">Compare seu progresso</p>
              </div>
            </Link>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg text-white">
            <h3 className="font-medium mb-2">💡 Dica do Dia</h3>
            <p className="text-sm opacity-90">
              Faça simulados regulares para manter seu progresso constante. 
              Consistência é a chave para o sucesso!
            </p>
          </div>
        </motion.div>
      </div>

      {/* Meta Semanal/Mensal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="card"
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <ChartBarIcon className="w-6 h-6 mr-2 text-blue-500" />
          Meta da Semana
        </h2>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {dashboardStats?.totalSimulations || 0}/5
            </div>
            <div className="text-sm text-blue-700">Simulados</div>
            <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${Math.min(((dashboardStats?.totalSimulations || 0) / 5) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {dashboardStats?.streakDays || 0}/7
            </div>
            <div className="text-sm text-green-700">Dias Seguidos</div>
            <div className="w-full bg-green-200 rounded-full h-2 mt-2">
              <div 
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${Math.min(((dashboardStats?.streakDays || 0) / 7) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {formatTime(dashboardStats?.timeSpent || 0)}/180min
            </div>
            <div className="text-sm text-purple-700">Tempo de Estudo</div>
            <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
              <div 
                className="bg-purple-500 h-2 rounded-full"
                style={{ width: `${Math.min(((dashboardStats?.timeSpent || 0) / 180) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}