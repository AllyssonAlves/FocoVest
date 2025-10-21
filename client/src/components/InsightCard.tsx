import { motion } from 'framer-motion'
import {
  SparklesIcon,
  ArrowTrendingUpIcon,
  AcademicCapIcon,
  FireIcon
} from '@heroicons/react/24/outline'
import {
  TrophyIcon as TrophyIconSolid
} from '@heroicons/react/24/solid'

interface InsightCardProps {
  insight: {
    type: 'achievement' | 'improvement' | 'encouragement' | 'goal'
    title: string
    description: string
    metric?: string
    value?: number
    icon: string
  }
  index: number
  className?: string
}

export default function InsightCard({ insight, index, className = '' }: InsightCardProps) {
  const getInsightIcon = (icon: string) => {
    const iconMap: Record<string, JSX.Element> = {
      '🏆': <TrophyIconSolid className="w-6 h-6 text-yellow-500" />,
      '📈': <ArrowTrendingUpIcon className="w-6 h-6 text-green-500" />,
      '💪': <SparklesIcon className="w-6 h-6 text-blue-500" />,
      '🎓': <AcademicCapIcon className="w-6 h-6 text-purple-500" />,
      '🎯': <SparklesIcon className="w-6 h-6 text-red-500" />,
      '🔥': <FireIcon className="w-6 h-6 text-orange-500" />
    }
    return iconMap[icon] || <SparklesIcon className="w-6 h-6 text-gray-500" />
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'achievement': return 'border-yellow-500 bg-yellow-50'
      case 'improvement': return 'border-blue-500 bg-blue-50'
      case 'encouragement': return 'border-green-500 bg-green-50'
      case 'goal': return 'border-purple-500 bg-purple-50'
      default: return 'border-gray-500 bg-gray-50'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'achievement': return 'Conquista'
      case 'improvement': return 'Melhoria'
      case 'encouragement': return 'Motivação'
      case 'goal': return 'Meta'
      default: return 'Insight'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`${getTypeColor(insight.type)} rounded-lg shadow-sm border-l-4 p-4 hover:shadow-md transition-shadow ${className}`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          {getInsightIcon(insight.icon)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 text-sm">{insight.title}</h3>
            <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-full">
              {getTypeLabel(insight.type)}
            </span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{insight.description}</p>
          
          {insight.value && (
            <div className="mt-3 flex items-center space-x-2">
              {insight.metric && (
                <span className="text-xs text-gray-500">{insight.metric}:</span>
              )}
              <div className="text-lg font-bold text-blue-600">
                {typeof insight.value === 'number' ? insight.value.toFixed(1) : insight.value}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}