import { motion } from 'framer-motion'
import {
  ChartBarIcon,
  UserGroupIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import {
  TrophyIcon as TrophyIconSolid
} from '@heroicons/react/24/solid'
import { useUserComparison } from '../hooks/useUserComparison'
import PercentileBar from './PercentileBar'
import InsightCard from './InsightCard'

// Interfaces para dados de comparação
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



interface UserComparisonComponentProps {
  className?: string
}

export default function UserComparisonComponent({ className = '' }: UserComparisonComponentProps) {
  const { data: comparison, loading, error, refetch } = useUserComparison()

  const getCategoryColor = (category: MetricComparison['category']) => {
    switch (category) {
      case 'excellent': return 'text-green-600 bg-green-50'
      case 'above_average': return 'text-blue-600 bg-blue-50'
      case 'average': return 'text-yellow-600 bg-yellow-50'
      case 'below_average': return 'text-orange-600 bg-orange-50'
      case 'needs_improvement': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getCategoryIcon = (category: MetricComparison['category']) => {
    switch (category) {
      case 'excellent': return <TrophyIconSolid className="w-5 h-5 text-green-600" />
      case 'above_average': return <ArrowTrendingUpIcon className="w-5 h-5 text-blue-600" />
      case 'average': return <ChartBarIcon className="w-5 h-5 text-yellow-600" />
      case 'below_average': return <ArrowTrendingDownIcon className="w-5 h-5 text-orange-600" />
      case 'needs_improvement': return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
      default: return <ChartBarIcon className="w-5 h-5 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="space-y-6">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao Carregar Comparação</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={refetch}
          className="btn-primary"
        >
          Tentar Novamente
        </button>
      </div>
    )
  }

  if (!comparison) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Dados Insuficientes</h3>
        <p className="text-gray-600">Complete alguns simulados para ver sua comparação com outros usuários</p>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header com Posição Geral */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Sua Posição no Ranking</h2>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-3xl font-bold">#{comparison.rankingPositions.globalPosition}</div>
                <div className="text-sm opacity-90">de {comparison.rankingPositions.totalUsers} usuários</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{comparison.rankingPositions.globalPercentile.toFixed(1)}%</div>
                <div className="text-sm opacity-90">percentil</div>
              </div>
            </div>
          </div>
          <TrophyIconSolid className="w-16 h-16 text-yellow-300" />
        </div>
        
        {comparison.rankingPositions.universityPosition && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex items-center justify-between text-sm">
              <span>Na sua universidade:</span>
              <span className="font-semibold">
                #{comparison.rankingPositions.universityPosition} de {comparison.rankingPositions.totalUniversityUsers}
                ({comparison.rankingPositions.universityPercentile?.toFixed(1)}%)
              </span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Insights Principais */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {comparison.insights.slice(0, 3).map((insight, index) => (
          <InsightCard
            key={index}
            insight={insight}
            index={index}
          />
        ))}
      </motion.div>

      {/* Comparação de Métricas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow"
      >
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <ChartBarIcon className="w-5 h-5 mr-2" />
            Comparação Detalhada de Métricas
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {comparison.metricComparisons.map((metric, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(metric.category)}
                    <span className="font-medium text-gray-900">{metric.metric}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(metric.category)}`}>
                    {metric.category.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Seu Valor</div>
                    <div className="font-semibold text-blue-600">{metric.userValue}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Média</div>
                    <div className="font-medium">{metric.average}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Percentil</div>
                    <div className="font-semibold text-green-600">{metric.percentile.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Melhor que</div>
                    <div className="font-semibold text-purple-600">{metric.betterThanPercent.toFixed(1)}%</div>
                  </div>
                </div>

                {/* Barra de progresso visual com componente dedicado */}
                <div className="mt-3">
                  <PercentileBar
                    percentile={metric.percentile}
                    label={`Percentil: ${metric.percentile.toFixed(1)}%`}
                    value={metric.userValue}
                    showTooltip={true}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Metas e Usuários Similares */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Metas */}
        {comparison.goals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow"
          >
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <SparklesIcon className="w-5 h-5 mr-2" />
                Suas Próximas Metas
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {comparison.goals.map((goal, index) => (
                  <div key={index} className="border-l-4 border-green-500 pl-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{goal.metric}</h4>
                      <span className="text-sm text-gray-500">{goal.timeEstimate}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Atual: <span className="font-semibold">{goal.current}</span></span>
                      <span>Meta: <span className="font-semibold text-green-600">{goal.target}</span></span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(goal.current / goal.target) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Percentil alvo: {goal.percentileTarget}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Usuários Similares */}
        {comparison.similarUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow"
          >
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <UserGroupIcon className="w-5 h-5 mr-2" />
                Usuários Similares
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {comparison.similarUsers.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      {user.university && (
                        <div className="text-sm text-gray-500">{user.university}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-blue-600">
                        {user.similarity.toFixed(1)}% similar
                      </div>
                      <div className={`text-xs ${
                        user.performance === 'better' ? 'text-green-600' :
                        user.performance === 'similar' ? 'text-blue-600' : 'text-orange-600'
                      }`}>
                        {user.performance === 'better' ? 'Melhor' :
                         user.performance === 'similar' ? 'Similar' : 'Atrás'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer com atualização */}
      <div className="text-center text-sm text-gray-500">
        Dados atualizados em: {new Date(comparison.calculatedAt).toLocaleString('pt-BR')}
      </div>
    </div>
  )
}