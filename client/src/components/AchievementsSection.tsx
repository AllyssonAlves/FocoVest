import React from 'react'
import {
  TrophyIcon,
  BoltIcon,
  ClockIcon,
  CheckCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import {
  TrophyIcon as TrophyIconSolid,
  StarIcon as StarIconSolid,
  FireIcon as FireIconSolid
} from '@heroicons/react/24/solid'

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  progress: number
  maxProgress: number
  completed: boolean
  unlockedAt?: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  category: 'score' | 'streak' | 'time' | 'simulation' | 'special'
}

interface Badge {
  id: string
  emoji: string
  name: string
  description: string
  earnedAt: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

const AchievementsSection: React.FC = () => {
  // Conquistas disponíveis
  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'Primeira Vitória',
      description: 'Complete seu primeiro simulado',
      icon: <CheckCircleIcon className="w-6 h-6" />,
      progress: 1,
      maxProgress: 1,
      completed: true,
      unlockedAt: '2024-10-01',
      rarity: 'common',
      category: 'simulation'
    },
    {
      id: '2',
      title: 'Sequência de Fogo',
      description: 'Mantenha uma sequência de 7 dias',
      icon: <FireIconSolid className="w-6 h-6" />,
      progress: 7,
      maxProgress: 7,
      completed: true,
      unlockedAt: '2024-10-15',
      rarity: 'rare',
      category: 'streak'
    },
    {
      id: '3',
      title: 'Scholar',
      description: 'Acumule 50 horas de estudo',
      icon: <ClockIcon className="w-6 h-6" />,
      progress: 41,
      maxProgress: 50,
      completed: false,
      rarity: 'epic',
      category: 'time'
    },
    {
      id: '4',
      title: 'Top 10',
      description: 'Entre no top 10 do ranking geral',
      icon: <TrophyIconSolid className="w-6 h-6" />,
      progress: 12,
      maxProgress: 10,
      completed: false,
      rarity: 'legendary',
      category: 'score'
    },
    {
      id: '5',
      title: 'Perfeccionista',
      description: 'Obtenha 100% em um simulado',
      icon: <StarIconSolid className="w-6 h-6" />,
      progress: 0,
      maxProgress: 1,
      completed: false,
      rarity: 'epic',
      category: 'simulation'
    },
    {
      id: '6',
      title: 'Maratonista',
      description: 'Complete 25 simulados',
      icon: <BoltIcon className="w-6 h-6" />,
      progress: 28,
      maxProgress: 25,
      completed: true,
      unlockedAt: '2024-10-18',
      rarity: 'rare',
      category: 'simulation'
    }
  ]

  // Badges conquistados
  const badges: Badge[] = [
    {
      id: '1',
      emoji: '🌟',
      name: 'Iniciante',
      description: 'Completou o primeiro simulado',
      earnedAt: '2024-10-01',
      rarity: 'common'
    },
    {
      id: '2',
      emoji: '📚',
      name: 'Estudioso',
      description: 'Completou 10 simulados',
      earnedAt: '2024-10-10',
      rarity: 'common'
    },
    {
      id: '3',
      emoji: '🔥',
      name: 'Em Chamas',
      description: 'Sequência de 7 dias',
      earnedAt: '2024-10-15',
      rarity: 'rare'
    },
    {
      id: '4',
      emoji: '⚡',
      name: 'Velocista',
      description: 'Completou simulado em menos de 50% do tempo',
      earnedAt: '2024-10-12',
      rarity: 'epic'
    }
  ]

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50'
      case 'rare': return 'border-blue-300 bg-blue-50'
      case 'epic': return 'border-purple-300 bg-purple-50'
      case 'legendary': return 'border-yellow-300 bg-yellow-50'
      default: return 'border-gray-300 bg-gray-50'
    }
  }

  const getRarityTextColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-700'
      case 'rare': return 'text-blue-700'
      case 'epic': return 'text-purple-700'
      case 'legendary': return 'text-yellow-700'
      default: return 'text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* Badges conquistados */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-blue-600" />
          Suas Conquistas
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          {badges.map(badge => (
            <div 
              key={badge.id}
              className={`p-4 rounded-lg border-2 text-center transition-all hover:scale-105 ${getRarityColor(badge.rarity)}`}
              title={badge.description}
            >
              <div className="text-3xl mb-2">{badge.emoji}</div>
              <div className={`text-xs font-medium ${getRarityTextColor(badge.rarity)}`}>
                {badge.name}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(badge.earnedAt).toLocaleDateString('pt-BR')}
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <div className="text-sm text-gray-600">
            Você conquistou <span className="font-semibold text-blue-600">{badges.length}</span> badges até agora!
          </div>
        </div>
      </div>

      {/* Conquistas disponíveis */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <TrophyIcon className="w-5 h-5 text-blue-600" />
          Conquistas Disponíveis
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map(achievement => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                achievement.completed 
                  ? `${getRarityColor(achievement.rarity)} shadow-sm`
                  : 'border-gray-200 bg-gray-50 opacity-75'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  achievement.completed 
                    ? getRarityTextColor(achievement.rarity)
                    : 'text-gray-400'
                }`}>
                  {achievement.icon}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-medium ${
                      achievement.completed 
                        ? getRarityTextColor(achievement.rarity)
                        : 'text-gray-500'
                    }`}>
                      {achievement.title}
                    </h4>
                    
                    {achievement.completed && (
                      <div className="text-green-600">
                        <CheckCircleIcon className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {achievement.description}
                  </p>
                  
                  {!achievement.completed && (
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progresso</span>
                        <span>{achievement.progress}/{achievement.maxProgress}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ 
                            width: `${Math.min((achievement.progress / achievement.maxProgress) * 100, 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {achievement.completed && achievement.unlockedAt && (
                    <div className="text-xs text-gray-500">
                      Conquistado em {new Date(achievement.unlockedAt).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                  
                  <div className="mt-2">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      getRarityColor(achievement.rarity)
                    } ${getRarityTextColor(achievement.rarity)}`}>
                      {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AchievementsSection