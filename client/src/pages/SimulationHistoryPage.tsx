import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChartBarIcon,
  ClockIcon,
  TrophyIcon,
  CalendarIcon,
  EyeIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  StarIcon,
  FireIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { 
  TrophyIcon as TrophyIconSolid 
} from '@heroicons/react/24/solid'

interface SimulationHistory {
  id: string
  simulationId: string
  simulationTitle: string
  university: string
  category: string
  difficulty: 'facil' | 'medio' | 'dificil'
  completedAt: string
  duration: number // tempo gasto em minutos
  totalQuestions: number
  correctAnswers: number
  score: number // porcentagem
  rank: number // posição no ranking
  totalParticipants: number
  isPersonalBest: boolean
  timeSpent: number // tempo real gasto
}

const SimulationHistoryPage: React.FC = () => {
  const navigate = useNavigate()
  const [history, setHistory] = useState<SimulationHistory[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterUniversity, setFilterUniversity] = useState('')
  const [filterDifficulty, setFilterDifficulty] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'score' | 'duration'>('recent')

  // Dados mockados do histórico
  const mockHistory: SimulationHistory[] = [
    {
      id: '1',
      simulationId: 'sim1',
      simulationTitle: 'Simulado UVA - Matemática Básica',
      university: 'UVA',
      category: 'Exatas',
      difficulty: 'medio',
      completedAt: '2024-10-18T14:30:00Z',
      duration: 120,
      totalQuestions: 30,
      correctAnswers: 25,
      score: 83.3,
      rank: 12,
      totalParticipants: 156,
      isPersonalBest: true,
      timeSpent: 95
    },
    {
      id: '2',
      simulationId: 'sim2',
      simulationTitle: 'UECE - Redação e Literatura',
      university: 'UECE',
      category: 'Linguagens',
      difficulty: 'dificil',
      completedAt: '2024-10-16T16:45:00Z',
      duration: 180,
      totalQuestions: 25,
      correctAnswers: 18,
      score: 72.0,
      rank: 34,
      totalParticipants: 89,
      isPersonalBest: false,
      timeSpent: 165
    },
    {
      id: '3',
      simulationId: 'sim3',
      simulationTitle: 'URCA - História e Geografia',
      university: 'URCA',
      category: 'Humanas',
      difficulty: 'medio',
      completedAt: '2024-10-14T10:20:00Z',
      duration: 150,
      totalQuestions: 35,
      correctAnswers: 28,
      score: 80.0,
      rank: 8,
      totalParticipants: 67,
      isPersonalBest: false,
      timeSpent: 142
    },
    {
      id: '4',
      simulationId: 'sim4',
      simulationTitle: 'UFC - Ciências da Natureza',
      university: 'UFC',
      category: 'Ciências',
      difficulty: 'dificil',
      completedAt: '2024-10-12T19:15:00Z',
      duration: 240,
      totalQuestions: 45,
      correctAnswers: 32,
      score: 71.1,
      rank: 45,
      totalParticipants: 234,
      isPersonalBest: false,
      timeSpent: 198
    },
    {
      id: '5',
      simulationId: 'sim5',
      simulationTitle: 'IFCE - Conhecimentos Gerais',
      university: 'IFCE',
      category: 'Geral',
      difficulty: 'facil',
      completedAt: '2024-10-10T08:30:00Z',
      duration: 90,
      totalQuestions: 20,
      correctAnswers: 17,
      score: 85.0,
      rank: 3,
      totalParticipants: 45,
      isPersonalBest: true,
      timeSpent: 78
    }
  ]

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setHistory(mockHistory)
      setLoading(false)
    }, 800)
  }, [])

  // Calcular estatísticas
  const stats = {
    totalSimulations: history.length,
    averageScore: history.reduce((acc, h) => acc + h.score, 0) / history.length || 0,
    bestScore: Math.max(...history.map(h => h.score)) || 0,
    totalHours: Math.round(history.reduce((acc, h) => acc + h.timeSpent, 0) / 60 * 10) / 10,
    personalBests: history.filter(h => h.isPersonalBest).length
  }

  // Filtrar e ordenar histórico
  const filteredHistory = history
    .filter(h => {
      if (searchTerm && !h.simulationTitle.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      if (filterUniversity && h.university !== filterUniversity) return false
      if (filterDifficulty && h.difficulty !== filterDifficulty) return false
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        case 'score':
          return b.score - a.score
        case 'duration':
          return a.timeSpent - b.timeSpent
        default:
          return 0
      }
    })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'facil': return 'text-green-600 bg-green-100'
      case 'medio': return 'text-yellow-600 bg-yellow-100'
      case 'dificil': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}min`
    }
    return `${mins}min`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ChartBarIcon className="w-8 h-8 text-blue-600" />
            Meu Histórico
          </h1>
          <p className="mt-2 text-gray-600">
            Acompanhe seu progresso e performance nos simulados
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ChartBarIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Simulados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSimulations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <StarIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Média Geral</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageScore.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <TrophyIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Melhor Nota</p>
                <p className="text-2xl font-bold text-gray-900">{stats.bestScore.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tempo Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalHours}h</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <FireIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Records Pessoais</p>
                <p className="text-2xl font-bold text-gray-900">{stats.personalBests}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Busca */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar no histórico..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtros */}
            <div className="flex items-center gap-4">
              <select
                value={filterUniversity}
                onChange={(e) => setFilterUniversity(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas Universidades</option>
                <option value="UVA">UVA</option>
                <option value="UECE">UECE</option>
                <option value="UFC">UFC</option>
                <option value="URCA">URCA</option>
                <option value="IFCE">IFCE</option>
              </select>

              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas Dificuldades</option>
                <option value="facil">Fácil</option>
                <option value="medio">Médio</option>
                <option value="dificil">Difícil</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="recent">Mais Recente</option>
                <option value="score">Melhor Nota</option>
                <option value="duration">Menor Tempo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista do histórico */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            <ChartBarIcon className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Nenhum simulado no histórico
            </h3>
            <p className="text-gray-600 mb-6">
              Complete alguns simulados para ver seu progresso aqui.
            </p>
            <button
              onClick={() => navigate('/simulations')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Fazer Simulados
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {item.simulationTitle}
                        </h3>
                        
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                          {item.university}
                        </span>
                        
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getDifficultyColor(item.difficulty)}`}>
                          {item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)}
                        </span>
                        
                        {item.isPersonalBest && (
                          <div className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                            <TrophyIconSolid className="w-3 h-3" />
                            <span className="text-xs font-medium">Record Pessoal</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{formatDate(item.completedAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          <span>{formatDuration(item.timeSpent)} / {formatDuration(item.duration)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircleIcon className="w-4 h-4" />
                          <span>{item.correctAnswers}/{item.totalQuestions} questões</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Nota:</span>
                          <span className={`text-lg font-bold ${getScoreColor(item.score)}`}>
                            {item.score.toFixed(1)}%
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Ranking:</span>
                          <span className="text-sm font-medium text-gray-900">
                            #{item.rank} de {item.totalParticipants}
                          </span>
                        </div>
                        
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {item.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => navigate(`/simulations/${item.simulationId}/results`)}
                        className="text-blue-600 hover:text-blue-700 p-2 rounded-lg transition-colors"
                        title="Ver detalhes"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={() => navigate(`/integrated-simulation/${item.simulationId}`)}
                        className="text-green-600 hover:text-green-700 p-2 rounded-lg transition-colors"
                        title="Refazer simulado"
                      >
                        <ArrowPathIcon className="w-5 h-5" />
                      </button>
                      
                      <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SimulationHistoryPage