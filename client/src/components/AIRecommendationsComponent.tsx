import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CpuChipIcon as BrainCircuitIcon,
  LightBulbIcon,
  ClockIcon,
  BookOpenIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  CalendarDaysIcon,
  FlagIcon as TargetIcon,
  ChartBarIcon,
  ArrowPathIcon as RefreshCwIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext'

// Interfaces
interface AIRecommendation {
  type: 'study_schedule' | 'subject_focus' | 'question_practice' | 'review_material'
  priority: 'urgent' | 'high' | 'medium' | 'low'
  title: string
  description: string
  actionItems: string[]
  estimatedTime: number
  expectedImprovement: number
  reasoning: string
}

interface ErrorPattern {
  subject: string
  topic: string
  frequency: number
  lastOccurrence: string
  difficulty: 'easy' | 'medium' | 'hard'
}

interface StudyPattern {
  preferredTimeSlots: number[]
  averageSessionDuration: number
  mostProductiveHours: number[]
  consistencyScore: number
  weeklyPattern: number[]
}

interface SubjectAnalysis {
  subject: string
  performance: number
  improvement: number
  weakPoints: string[]
  strongPoints: string[]
  priority: 'high' | 'medium' | 'low'
  recommendedStudyTime: number
}

export default function AIRecommendationsComponent() {
  const { token, isAuthenticated } = useAuth()
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [errorPatterns, setErrorPatterns] = useState<ErrorPattern[]>([])
  const [studyPattern, setStudyPattern] = useState<StudyPattern | null>(null)
  const [subjectAnalysis, setSubjectAnalysis] = useState<SubjectAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadAIData()
  }, [])

  const loadAIData = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!isAuthenticated || !token) {
        setError('Usuário não autenticado')
        return
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      // Carregar todas as análises em paralelo
      const [
        recommendationsRes,
        errorPatternsRes,
        studyPatternsRes,
        subjectAnalysisRes
      ] = await Promise.all([
        fetch('/api/ai/recommendations', { headers }),
        fetch('/api/ai/error-patterns', { headers }),
        fetch('/api/ai/study-patterns', { headers }),
        fetch('/api/ai/subject-analysis', { headers })
      ])

      const [
        recommendationsData,
        errorPatternsData,
        studyPatternsData,
        subjectAnalysisData
      ] = await Promise.all([
        recommendationsRes.json(),
        errorPatternsRes.json(),
        studyPatternsRes.json(),
        subjectAnalysisRes.json()
      ])

      if (recommendationsData.success) {
        setRecommendations(recommendationsData.data.recommendations)
      }

      if (errorPatternsData.success) {
        setErrorPatterns(errorPatternsData.data.patterns)
      }

      if (studyPatternsData.success) {
        setStudyPattern(studyPatternsData.data.pattern)
      }

      if (subjectAnalysisData.success) {
        setSubjectAnalysis(subjectAnalysisData.data.subjects)
      }

    } catch (err) {
      setError('Erro ao carregar análises de IA')
      console.error('Erro ao carregar dados de IA:', err)
    } finally {
      setLoading(false)
    }
  }

  const refreshAnalysis = async () => {
    setRefreshing(true)
    await loadAIData()
    setRefreshing(false)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'study_schedule': return <CalendarDaysIcon className="w-5 h-5" />
      case 'subject_focus': return <BookOpenIcon className="w-5 h-5" />
      case 'question_practice': return <TargetIcon className="w-5 h-5" />
      case 'review_material': return <RefreshCwIcon className="w-5 h-5" />
      default: return <LightBulbIcon className="w-5 h-5" />
    }
  }

  const formatHour = (hour: number) => `${hour}:00`

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <BrainCircuitIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro nas Análises de IA</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={refreshAnalysis}
          className="btn-primary"
        >
          Tentar Novamente
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BrainCircuitIcon className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Recomendações da IA</h2>
            <p className="text-gray-600">Análises personalizadas para otimizar seus estudos</p>
          </div>
        </div>
        <button
          onClick={refreshAnalysis}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <RefreshCwIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Atualizar</span>
        </button>
      </div>

      {/* Recomendações Principais */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <SparklesIcon className="w-5 h-5 mr-2 text-yellow-500" />
          Recomendações Personalizadas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((rec, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`border rounded-lg p-6 ${getPriorityColor(rec.priority)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getTypeIcon(rec.type)}
                  <div>
                    <h4 className="font-semibold">{rec.title}</h4>
                    <span className="text-xs font-medium uppercase tracking-wide">
                      {rec.priority}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">+{rec.expectedImprovement}%</div>
                  <div className="text-xs text-gray-500">{rec.estimatedTime}min</div>
                </div>
              </div>
              
              <p className="text-sm mb-4">{rec.description}</p>
              
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Ações recomendadas:</h5>
                <ul className="text-sm space-y-1">
                  {rec.actionItems.map((action, actionIndex) => (
                    <li key={actionIndex} className="flex items-start">
                      <span className="text-xs mt-1 mr-2">•</span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-4 pt-4 border-t border-current border-opacity-20">
                <p className="text-xs italic">{rec.reasoning}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Análise de Padrões */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Padrões de Erro */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ArrowTrendingUpIcon className="w-5 h-5 mr-2 text-red-500" />
            Padrões de Erro
          </h3>
          <div className="bg-white rounded-lg shadow p-6">
            {errorPatterns.length > 0 ? (
              <div className="space-y-4">
                {errorPatterns.map((pattern, index) => (
                  <div key={index} className="border-l-4 border-red-400 pl-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{pattern.subject}</h4>
                        <p className="text-sm text-gray-600">{pattern.topic}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-red-600">
                          {pattern.frequency} erros
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(pattern.lastOccurrence).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Nenhum padrão de erro significativo detectado
              </p>
            )}
          </div>
        </section>

        {/* Horários Produtivos */}
        {studyPattern && (
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ClockIcon className="w-5 h-5 mr-2 text-blue-500" />
              Horários Mais Produtivos
            </h3>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Melhores Horários</h4>
                  <div className="flex flex-wrap gap-2">
                    {studyPattern.mostProductiveHours.map((hour, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {formatHour(hour)}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Sessão Média</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {studyPattern.averageSessionDuration} minutos
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Consistência</h4>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-600 h-3 rounded-full"
                      style={{ width: `${studyPattern.consistencyScore * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {(studyPattern.consistencyScore * 100).toFixed(0)}% consistente
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Análise por Matéria */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ChartBarIcon className="w-5 h-5 mr-2 text-purple-500" />
          Performance por Matéria
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjectAnalysis.map((subject, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-lg shadow p-4 border-l-4 ${
                subject.priority === 'high' ? 'border-red-500' :
                subject.priority === 'medium' ? 'border-yellow-500' :
                'border-green-500'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-semibold text-gray-900">{subject.subject}</h4>
                <div className="flex items-center">
                  {subject.improvement > 0 ? (
                    <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowTrendingUpIcon className="w-4 h-4 text-red-500 rotate-180" />
                  )}
                  <span className={`text-xs ml-1 ${
                    subject.improvement > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {subject.improvement > 0 ? '+' : ''}{subject.improvement}%
                  </span>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Performance</span>
                  <span className="font-medium">{subject.performance}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      subject.performance >= 80 ? 'bg-green-500' :
                      subject.performance >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${subject.performance}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-2 text-xs">
                {subject.weakPoints.length > 0 && (
                  <div>
                    <span className="font-medium text-red-600">Pontos fracos:</span>
                    <p className="text-gray-600">{subject.weakPoints.join(', ')}</p>
                  </div>
                )}
                {subject.strongPoints.length > 0 && (
                  <div>
                    <span className="font-medium text-green-600">Pontos fortes:</span>
                    <p className="text-gray-600">{subject.strongPoints.join(', ')}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Tempo recomendado</span>
                  <span className="font-medium">{Math.floor(subject.recommendedStudyTime / 60)}h/semana</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}