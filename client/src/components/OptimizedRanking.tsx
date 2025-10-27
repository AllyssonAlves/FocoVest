import React, { memo, useMemo, useCallback } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Trophy, Medal, Award, TrendingUp, Users, Clock } from 'lucide-react'

// Tipos locais para evitar dependências externas
interface User {
  id: string
  name: string
  email: string
  avatar?: string
  university?: string
  level?: number
  statistics?: {
    averageScore: number
    totalSimulations: number
    totalQuestions: number
    correctAnswers: number
    streakDays: number
    timeSpent: number
  }
}



interface RankingItemProps {
  user: User
  position: number
  isCurrentUser?: boolean
  onUserClick?: (userId: string) => void
}

// Componente individual do ranking otimizado com memo
const RankingItem = memo<RankingItemProps>(({ user, position, isCurrentUser, onUserClick }) => {
  const handleClick = useCallback(() => {
    onUserClick?.(user.id)
  }, [user.id, onUserClick])

  const positionIcon = useMemo(() => {
    switch (position) {
      case 1: return <Trophy className="w-6 h-6 text-yellow-500" />
      case 2: return <Medal className="w-6 h-6 text-gray-400" />
      case 3: return <Award className="w-6 h-6 text-amber-600" />
      default: return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-600">#{position}</span>
    }
  }, [position])

  const cardClasses = useMemo(() => 
    `relative p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-lg cursor-pointer ${
      isCurrentUser 
        ? 'bg-blue-50 border-blue-300 shadow-md' 
        : 'bg-white border-gray-200 hover:border-blue-300'
    }`, 
    [isCurrentUser]
  )

  const scoreColor = useMemo(() => {
    const score = user.statistics?.averageScore || 0
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-blue-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-gray-600'
  }, [user.statistics?.averageScore])

  return (
    <div className={cardClasses} onClick={handleClick}>
      {isCurrentUser && (
        <div className="absolute -top-2 -right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
          Você
        </div>
      )}
      
      <div className="flex items-center gap-4">
        {/* Posição */}
        <div className="flex-shrink-0">
          {positionIcon}
        </div>

        {/* Avatar */}
        <div className="flex-shrink-0">
          <img
            src={user.avatar || '/default-avatar.png'}
            alt={user.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
            loading="lazy"
          />
        </div>

        {/* Informações do usuário */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
          <p className="text-sm text-gray-500 truncate">{user.university}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              Nível {user.level || 1}
            </span>
            {user.statistics?.streakDays && user.statistics.streakDays > 0 && (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded flex items-center gap-1">
                🔥 {user.statistics.streakDays}
              </span>
            )}
          </div>
        </div>

        {/* Estatísticas */}
        <div className="flex-shrink-0 text-right">
          <div className={`text-lg font-bold ${scoreColor}`}>
            {(user.statistics?.averageScore || 0).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500">
            {user.statistics?.totalSimulations || 0} simulados
          </div>
          <div className="text-xs text-gray-400">
            {user.statistics?.totalQuestions || 0} questões
          </div>
        </div>
      </div>
    </div>
  )
})

RankingItem.displayName = 'RankingItem'

interface RankingListProps {
  users: User[]
  currentUserId?: string
  onUserClick?: (userId: string) => void
  loading?: boolean
  error?: string | null
}

// Lista virtualizada do ranking para performance otimizada
const RankingList = memo<RankingListProps>(({ users, currentUserId, onUserClick, loading, error }) => {
  const parentRef = React.useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: users.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120, // Altura estimada de cada item
    overscan: 5, // Renderizar 5 itens extras fora da tela para scroll suave
  })

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-20 rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-2">❌ Erro ao carregar ranking</div>
        <div className="text-gray-500 text-sm">{error}</div>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>Nenhum usuário encontrado no ranking</p>
      </div>
    )
  }

  const virtualItems = virtualizer.getVirtualItems()

  return (
    <div
      ref={parentRef}
      className="h-[600px] overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem) => {
          const user = users[virtualItem.index]
          const position = virtualItem.index + 1
          
          return (
            <div
              key={user.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <div className="p-2">
                <RankingItem
                  user={user}
                  position={position}
                  isCurrentUser={user.id === currentUserId}
                  onUserClick={onUserClick}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})

RankingList.displayName = 'RankingList'

interface RankingStatsProps {
  statistics: {
    totalUsers: number
    totalSimulations: number
    averageGlobalScore: number
    maxStreak: number
  }
}

// Componente de estatísticas otimizado
const RankingStats = memo<RankingStatsProps>(({ statistics }) => {
  const statCards = useMemo(() => [
    {
      icon: <Users className="w-6 h-6 text-blue-500" />,
      label: 'Total de Usuários',
      value: statistics.totalUsers.toLocaleString(),
      color: 'bg-blue-50 border-blue-200'
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-green-500" />,
      label: 'Simulados Realizados',
      value: statistics.totalSimulations.toLocaleString(),
      color: 'bg-green-50 border-green-200'
    },
    {
      icon: <Trophy className="w-6 h-6 text-yellow-500" />,
      label: 'Média Global',
      value: `${statistics.averageGlobalScore.toFixed(1)}%`,
      color: 'bg-yellow-50 border-yellow-200'
    },
    {
      icon: <Clock className="w-6 h-6 text-purple-500" />,
      label: 'Maior Sequência',
      value: `${statistics.maxStreak} dias`,
      color: 'bg-purple-50 border-purple-200'
    }
  ], [statistics])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, index) => (
        <div key={index} className={`p-4 rounded-lg border-2 ${stat.color}`}>
          <div className="flex items-center gap-3">
            {stat.icon}
            <div>
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
})

RankingStats.displayName = 'RankingStats'

export { RankingItem, RankingList, RankingStats }