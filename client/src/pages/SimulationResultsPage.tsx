import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TrophyIcon,
  ChartBarIcon,
  ArrowLeftIcon,
  PlayIcon
} from '@heroicons/react/24/outline'
import { Simulation, SimulationResult } from '@shared/simulation'
import { Question } from '@shared/types'
import { simulationService } from '../services/simulationService'

export default function SimulationResults() {
  const { simulationId } = useParams<{ simulationId: string }>()
  const navigate = useNavigate()

  const [simulation, setSimulation] = useState<Simulation | null>(null)
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadResults = async () => {
      if (!simulationId) {
        setError('ID do simulado não fornecido')
        setIsLoading(false)
        return
      }

      try {
        const [simulationResponse, resultResponse] = await Promise.all([
          simulationService.getSimulationById(simulationId),
          simulationService.getSimulationResult(simulationId)
        ])

        setSimulation(simulationResponse.data)
        setResult(resultResponse.data)

        // Mock questions para demonstração
        const mockQuestions: Question[] = [
          {
            _id: '1',
            text: 'Qual é a capital do Brasil?',
            options: [
              { id: 'A', text: 'São Paulo' },
              { id: 'B', text: 'Rio de Janeiro' },
              { id: 'C', text: 'Brasília' },
              { id: 'D', text: 'Belo Horizonte' }
            ],
            correctAnswer: 'C',
            explanation: 'Brasília é a capital federal do Brasil desde 1960.',
            subject: 'Geografia' as any,
            topic: 'Capitais',
            difficulty: 'easy' as any,
            university: 'UFC' as any,
            year: 2023,
            statistics: {
              totalAttempts: 100,
              correctAttempts: 80,
              accuracy: 0.8,
              averageTime: 30
            },
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]

        setQuestions(mockQuestions)
      } catch (err) {
        setError('Erro ao carregar resultados')
        console.error('Error loading results:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadResults()
  }, [simulationId])

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}m ${secs}s`
  }

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number): string => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando resultados...</p>
        </div>
      </div>
    )
  }

  if (error || !simulation || !result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar resultados</h2>
          <p className="text-gray-600 mb-4">{error || 'Resultados não encontrados'}</p>
          <button
            onClick={() => navigate('/simulations')}
            className="btn-primary"
          >
            Voltar aos Simulados
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/simulations')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Voltar aos Simulados
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Resultado do Simulado</h1>
          <p className="text-gray-600">{simulation.title}</p>
        </div>

        {/* Score Overview */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Score */}
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${getScoreBgColor(result.score)}`}>
                <TrophyIcon className={`h-10 w-10 ${getScoreColor(result.score)}`} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {result.score.toFixed(1)}%
              </h3>
              <p className="text-gray-600">Pontuação Final</p>
            </div>

            {/* Accuracy */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-4">
                <ChartBarIcon className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {result.correctAnswers}/{result.totalQuestions}
              </h3>
              <p className="text-gray-600">Questões Corretas</p>
            </div>

            {/* Time */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 mb-4">
                <ClockIcon className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {formatTime(result.totalTimeSpent)}
              </h3>
              <p className="text-gray-600">Tempo Total</p>
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas Detalhadas</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Acertos:</span>
                <span className="font-medium">{(result.accuracy * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tempo médio por questão:</span>
                <span className="font-medium">{formatTime(result.averageTimePerQuestion)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Data de conclusão:</span>
                <span className="font-medium">
                  {new Date(result.completedAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance por Matéria</h3>
            <div className="space-y-3">
              {/* Mock data for subject performance */}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Geografia</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-green-500 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                  <span className="text-sm font-medium">80%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">História</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-yellow-500 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <span className="text-sm font-medium">65%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Matemática</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-red-500 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  <span className="text-sm font-medium">45%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Question Review */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Revisão das Questões</h3>
          <div className="space-y-6">
            {result.questionsBreakdown.map((questionResult, index) => {
              const question = questions.find(q => q._id === questionResult.questionId)
              if (!question) return null

              return (
                <div key={questionResult.questionId} className="border-b pb-6 last:border-b-0">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="text-md font-medium text-gray-900">
                      Questão {index + 1}
                    </h4>
                    <div className="flex items-center space-x-2">
                      {questionResult.isCorrect ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircleIcon className="h-5 w-5 text-red-500" />
                      )}
                      <span className={`text-sm font-medium ${
                        questionResult.isCorrect ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {questionResult.isCorrect ? 'Correto' : 'Incorreto'}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-900 mb-4">{question.text}</p>

                  <div className="space-y-2 mb-4">
                    {question.options.map((option, optionIndex) => {
                      const optionLetter = String.fromCharCode(65 + optionIndex)
                      const isCorrect = option.id === question.correctAnswer
                      const isUserAnswer = option.id === questionResult.userAnswer
                      
                      return (
                        <div
                          key={option.id}
                          className={`p-3 rounded-lg border ${
                            isCorrect 
                              ? 'border-green-300 bg-green-50' 
                              : isUserAnswer 
                              ? 'border-red-300 bg-red-50' 
                              : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                              isCorrect 
                                ? 'border-green-500 bg-green-500 text-white' 
                                : isUserAnswer 
                                ? 'border-red-500 bg-red-500 text-white' 
                                : 'border-gray-300 text-gray-500'
                            }`}>
                              {optionLetter}
                            </span>
                            <span className="text-gray-900">{option.text}</span>
                            {isCorrect && (
                              <CheckCircleIcon className="h-4 w-4 text-green-500 ml-auto" />
                            )}
                            {isUserAnswer && !isCorrect && (
                              <XCircleIcon className="h-4 w-4 text-red-500 ml-auto" />
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {question.explanation && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-medium text-blue-900 mb-2">Explicação:</h5>
                      <p className="text-blue-800">{question.explanation}</p>
                    </div>
                  )}

                  {questionResult.timeSpent && (
                    <div className="mt-4 text-sm text-gray-500">
                      Tempo gasto: {formatTime(questionResult.timeSpent)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => navigate('/simulations')}
            className="btn-secondary"
          >
            Ver Outros Simulados
          </button>
          <button
            onClick={() => navigate(`/integrated-simulation/${simulationId}`)}
            className="btn-primary flex items-center space-x-2"
          >
            <PlayIcon className="h-4 w-4" />
            <span>Refazer Simulado</span>
          </button>
        </div>
      </div>
    </div>
  )
}