import React, { useState, useEffect } from 'react'
import { 
  TrophyIcon,
  ChartBarIcon,
  UserGroupIcon,
  FireIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  FunnelIcon,
  SparklesIcon,
  GiftIcon
} from '@heroicons/react/24/outline'
import {
  TrophyIcon as TrophyIconSolid
} from '@heroicons/react/24/solid'
import AchievementsSection from '../components/AchievementsSection'

// Tipos para o sistema de ranking
interface RankingUser {
  id: string
  name: string
  avatar?: string
  score: number
  level: number
  university: string
  position: number
  previousPosition?: number
  simulationsCompleted: number
  averageScore: number
  totalHours: number
  streak: number
  badges: string[]
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

interface EvolutionData {
  date: string
  score: number
  position: number
  simulationsCompleted: number
}

const RankingPageNew: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'global' | 'personal' | 'achievements'>('global')
  const [selectedUniversity, setSelectedUniversity] = useState<string>('all')
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('month')
  const [loading, setLoading] = useState(false)

  // Dados mockados do ranking global
  const globalRanking: RankingUser[] = [
    {
      id: '1',
      name: 'Ana Silva',
      score: 2450,
      level: 12,
      university: 'UFC',
      position: 1,
      previousPosition: 2,
      simulationsCompleted: 45,
      averageScore: 87.5,
      totalHours: 68,
      streak: 15,
      badges: ['🥇', '🔥', '📚', '⭐'],
      isCurrentUser: false
    },
    {
      id: '2', 
      name: 'João Pedro',
      score: 2380,
      level: 11,
      university: 'UECE',
      position: 2,
      previousPosition: 1,
      simulationsCompleted: 42,
      averageScore: 85.2,
      totalHours: 61,
      streak: 12,
      badges: ['🥈', '💪', '📊'],
      isCurrentUser: false
    },
    {
      id: '3',
      name: 'Maria Santos',
      score: 2310,
      level: 11,
      university: 'UVA',
      position: 3,
      previousPosition: 4,
      simulationsCompleted: 39,
      averageScore: 83.8,
      totalHours: 55,
      streak: 8,
      badges: ['🥉', '📈', '🎯'],
      isCurrentUser: false
    },
    {
      id: '4',
      name: 'Carlos Lima',
      score: 2280,
      level: 10,
      university: 'URCA',
      position: 4,
      previousPosition: 3,
      simulationsCompleted: 38,
      averageScore: 82.1,
      totalHours: 52,
      streak: 5,
      badges: ['🏆', '⚡'],
      isCurrentUser: false
    },
    {
      id: '5',
      name: 'Você',
      score: 1850,
      level: 8,
      university: 'UFC',
      position: 12,
      previousPosition: 15,
      simulationsCompleted: 28,
      averageScore: 78.3,
      totalHours: 41,
      streak: 7,
      badges: ['🌟', '📚'],
      isCurrentUser: true
    }
  ]

  // Dados pessoais do usuário
  const personalStats: PersonalStats = {
    currentPosition: 12,
    totalUsers: 1247,
    scoreThisMonth: 450,
    scoreLastMonth: 320,
    trend: 'up',
    positionChange: 3,
    simulationsThisMonth: 8,
    averageScoreThisMonth: 82.1,
    hoursThisMonth: 12.5,
    currentStreak: 7,
    bestStreak: 12,
    level: 8,
    nextLevelProgress: 65
  }

  // Dados de evolução (últimos 30 dias)
  const evolutionData: EvolutionData[] = [
    { date: '2024-09-20', score: 1520, position: 25, simulationsCompleted: 15 },
    { date: '2024-09-25', score: 1620, position: 22, simulationsCompleted: 18 },
    { date: '2024-09-30', score: 1720, position: 18, simulationsCompleted: 22 },
    { date: '2024-10-05', score: 1780, position: 16, simulationsCompleted: 25 },
    { date: '2024-10-10', score: 1820, position: 14, simulationsCompleted: 26 },
    { date: '2024-10-15', score: 1850, position: 12, simulationsCompleted: 28 },
  ]

  const universities = ['all', 'UFC', 'UECE', 'UVA', 'URCA', 'IFCE']
  
  useEffect(() => {
    setLoading(true)
    setTimeout(() => setLoading(false), 800)
  }, [selectedUniversity, selectedPeriod])

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
    if (position <= 3) {
      return <TrophyIconSolid className={`w-6 h-6 ${getMedalColor(position)}`} />
    }
    return <span className="w-6 h-6 flex items-center justify-center bg-gray-100 text-gray-600 rounded-full text-sm font-bold">{position}</span>
  }

  // Função para renderizar o trend de posição
  const renderPositionTrend = (current: number, previous?: number) => {
    if (!previous) return null
    
    const change = previous - current
    if (change > 0) {
      return (
        <div className="flex items-center text-green-600 text-xs">
          <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
          +{change}
        </div>
      )
    } else if (change < 0) {
      return (
        <div className="flex items-center text-red-600 text-xs">
          <ArrowTrendingDownIcon className="w-3 h-3 mr-1" />
          {change}
        </div>
      )
    }
    return <div className="text-xs text-gray-500">-</div>
  }

  // Renderizar ranking global
  const renderGlobalRanking = () => (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filtros:</span>
        </div>
        
        <select
          value={selectedUniversity}
          onChange={(e) => setSelectedUniversity(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todas Universidades</option>
          {universities.slice(1).map(uni => (
            <option key={uni} value={uni}>{uni}</option>
          ))}
        </select>

        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value as any)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="week">Esta Semana</option>
          <option value="month">Este Mês</option>
          <option value="all">Todos os Tempos</option>
        </select>
      </div>

      {/* Pódio - Top 3 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8">
        <h3 className="text-xl font-bold text-center mb-8 text-gray-800">🏆 Pódio dos Champions</h3>
        
        <div className="flex justify-center items-end gap-8">
          {/* 2º Lugar */}
          <div className="text-center">
            <div className="bg-white rounded-lg p-4 shadow-md border-2 border-gray-300 mb-4">
              <TrophyIconSolid className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <div className="font-bold text-lg">{globalRanking[1]?.name}</div>
              <div className="text-sm text-gray-600">{globalRanking[1]?.university}</div>
              <div className="text-xl font-bold text-gray-600 mt-2">{globalRanking[1]?.score}</div>
              <div className="flex justify-center gap-1 mt-2">
                {globalRanking[1]?.badges.map((badge, i) => (
                  <span key={i} className="text-sm">{badge}</span>
                ))}
              </div>
            </div>
            <div className="text-sm text-gray-600">Nível {globalRanking[1]?.level}</div>
          </div>

          {/* 1º Lugar */}
          <div className="text-center transform scale-110">
            <div className="bg-white rounded-lg p-6 shadow-lg border-4 border-yellow-400 mb-4 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                CAMPEÃO
              </div>
              <TrophyIconSolid className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
              <div className="font-bold text-xl">{globalRanking[0]?.name}</div>
              <div className="text-sm text-gray-600">{globalRanking[0]?.university}</div>
              <div className="text-2xl font-bold text-yellow-600 mt-2">{globalRanking[0]?.score}</div>
              <div className="flex justify-center gap-1 mt-2">
                {globalRanking[0]?.badges.map((badge, i) => (
                  <span key={i} className="text-lg">{badge}</span>
                ))}
              </div>
            </div>
            <div className="text-sm text-gray-600">Nível {globalRanking[0]?.level}</div>
          </div>

          {/* 3º Lugar */}
          <div className="text-center">
            <div className="bg-white rounded-lg p-4 shadow-md border-2 border-orange-400 mb-4">
              <TrophyIconSolid className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="font-bold text-lg">{globalRanking[2]?.name}</div>
              <div className="text-sm text-gray-600">{globalRanking[2]?.university}</div>
              <div className="text-xl font-bold text-orange-600 mt-2">{globalRanking[2]?.score}</div>
              <div className="flex justify-center gap-1 mt-2">
                {globalRanking[2]?.badges.map((badge, i) => (
                  <span key={i} className="text-sm">{badge}</span>
                ))}
              </div>
            </div>
            <div className="text-sm text-gray-600">Nível {globalRanking[2]?.level}</div>
          </div>
        </div>
      </div>

      {/* Lista completa do ranking */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Ranking Completo</h3>
          <p className="text-sm text-gray-600">Top performers da plataforma</p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {globalRanking.map((player) => (
            <div 
              key={player.id}
              className={`p-4 hover:bg-gray-50 transition-colors ${
                player.isCurrentUser ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getMedalIcon(player.position)}
                    {renderPositionTrend(player.position, player.previousPosition)}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className={`font-semibold ${player.isCurrentUser ? 'text-blue-700' : 'text-gray-900'}`}>
                        {player.name}
                        {player.isCurrentUser && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full ml-2">
                            Você
                          </span>
                        )}
                      </h4>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {player.university}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span>Nível {player.level}</span>
                      <span>{player.simulationsCompleted} simulados</span>
                      <span>{player.averageScore}% média</span>
                      <span>🔥 {player.streak} dias</span>
                    </div>
                    
                    <div className="flex gap-1 mt-1">
                      {player.badges.map((badge, i) => (
                        <span key={i} className="text-sm">{badge}</span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-xl font-bold ${player.isCurrentUser ? 'text-blue-700' : 'text-gray-900'}`}>
                    {player.score.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">pontos</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // Renderizar evolução pessoal
  const renderPersonalEvolution = () => (
    <div className="space-y-6">
      {/* Cartões de estatísticas pessoais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrophyIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Posição Atual</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-gray-900">#{personalStats.currentPosition}</p>
                {personalStats.positionChange > 0 && (
                  <div className="flex items-center text-green-600 text-sm">
                    <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                    +{personalStats.positionChange}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pontos Este Mês</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-gray-900">{personalStats.scoreThisMonth}</p>
                <div className="text-green-600 text-sm">
                  +{personalStats.scoreThisMonth - personalStats.scoreLastMonth}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <SparklesIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Nível Atual</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-gray-900">{personalStats.level}</p>
                <div className="text-xs text-gray-500">{personalStats.nextLevelProgress}% próximo</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <FireIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sequência Atual</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-gray-900">{personalStats.currentStreak}</p>
                <div className="text-xs text-gray-500">dias</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progresso do nível */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Progresso do Nível</h3>
          <span className="text-sm text-gray-600">Nível {personalStats.level}</span>
        </div>
        
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${personalStats.nextLevelProgress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>Nível {personalStats.level}</span>
            <span>{personalStats.nextLevelProgress}%</span>
            <span>Nível {personalStats.level + 1}</span>
          </div>
        </div>
      </div>

      {/* Gráfico de evolução */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Evolução dos Últimos 30 Dias</h3>
        
        <div className="space-y-4">
          {evolutionData.map((data, index) => {
            const prevData = evolutionData[index - 1]
            const scoreChange = prevData ? data.score - prevData.score : 0
            const positionChange = prevData ? prevData.position - data.position : 0
            
            return (
              <div key={data.date} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">
                    {new Date(data.date).toLocaleDateString('pt-BR', { 
                      day: '2-digit', 
                      month: 'short' 
                    })}
                  </div>
                  <div className="text-sm text-gray-600">
                    {data.simulationsCompleted} simulados
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{data.score}</div>
                    <div className="text-xs text-gray-500">pontos</div>
                    {scoreChange > 0 && (
                      <div className="text-xs text-green-600">+{scoreChange}</div>
                    )}
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">#{data.position}</div>
                    <div className="text-xs text-gray-500">posição</div>
                    {positionChange > 0 && (
                      <div className="text-xs text-green-600 flex items-center">
                        <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
                        +{positionChange}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Comparação com outros usuários */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Comparação com Outros Usuários</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-2">25%</div>
            <div className="text-sm text-gray-600">dos usuários estão abaixo de você</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-2">78.3%</div>
            <div className="text-sm text-gray-600">sua média vs 72.1% geral</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-2">41h</div>
            <div className="text-sm text-gray-600">tempo total de estudos</div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <TrophyIcon className="w-8 h-8 text-blue-600" />
            Rankings & Evolução
          </h1>
          <p className="mt-2 text-gray-600">
            Acompanhe os melhores da plataforma e sua evolução pessoal
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navegação entre abas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 mb-8 flex">
          <button
            onClick={() => setActiveTab('global')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'global'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <UserGroupIcon className="w-5 h-5" />
            Ranking Geral
          </button>
          <button
            onClick={() => setActiveTab('personal')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'personal'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <ChartBarIcon className="w-5 h-5" />
            Minha Evolução
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'achievements'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <GiftIcon className="w-5 h-5" />
            Conquistas
          </button>
        </div>

        {/* Conteúdo */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'global' && renderGlobalRanking()}
            {activeTab === 'personal' && renderPersonalEvolution()}
            {activeTab === 'achievements' && <AchievementsSection />}
          </>
        )}
      </div>
    </div>
  )
}

export default RankingPageNew