import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  FlagIcon,
  ExclamationTriangleIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline'
import { Question } from '@shared/types'
import { Simulation } from '@shared/simulation'
import { simulationService } from '../services/simulationService'
import { useAuth } from '../contexts/AuthContext'
import TimerDisplay from './TimerDisplay'

interface QuestionAnswer {
  questionId: string
  selectedOption?: string
  isMarked: boolean
  timeSpent: number
}

interface SimulationState {
  simulation: Simulation | null
  questions: Question[]
  currentQuestionIndex: number
  answers: Map<string, QuestionAnswer>
  isFinished: boolean
  startTime: number
  isPaused: boolean
}

export default function SimulationTaker() {
  const { simulationId } = useParams<{ simulationId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [state, setState] = useState<SimulationState>({
    simulation: null,
    questions: [],
    currentQuestionIndex: 0,
    answers: new Map(),
    isFinished: false,
    startTime: Date.now(),
    isPaused: false
  })

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load simulation data
  useEffect(() => {
    const loadSimulation = async () => {
      if (!simulationId) {
        setError('ID do simulado não fornecido')
        setIsLoading(false)
        return
      }

      try {
        const simulationResponse = await simulationService.getSimulationById(simulationId)
        const simulation = simulationResponse.data
        
        // Para este exemplo, vamos usar questões mock
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
        
        setState(prev => ({
          ...prev,
          simulation,
          questions: mockQuestions,
          startTime: Date.now()
        }))
      } catch (err) {
        setError('Erro ao carregar simulado')
        console.error('Error loading simulation:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadSimulation()
  }, [simulationId])

  const getCurrentQuestion = (): Question | null => {
    return state.questions[state.currentQuestionIndex] || null
  }

  const getCurrentAnswer = (): QuestionAnswer | undefined => {
    const currentQuestion = getCurrentQuestion()
    return currentQuestion ? state.answers.get(currentQuestion._id) : undefined
  }

  const selectOption = (optionIndex: string) => {
    const currentQuestion = getCurrentQuestion()
    if (!currentQuestion) return

    setState(prev => {
      const newAnswers = new Map(prev.answers)
      const existingAnswer = newAnswers.get(currentQuestion._id)
      
      newAnswers.set(currentQuestion._id, {
        questionId: currentQuestion._id,
        selectedOption: optionIndex,
        isMarked: existingAnswer?.isMarked || false,
        timeSpent: existingAnswer?.timeSpent || 0
      })

      return {
        ...prev,
        answers: newAnswers
      }
    })
  }

  const toggleMark = () => {
    const currentQuestion = getCurrentQuestion()
    if (!currentQuestion) return

    setState(prev => {
      const newAnswers = new Map(prev.answers)
      const existingAnswer = newAnswers.get(currentQuestion._id)
      
      newAnswers.set(currentQuestion._id, {
        questionId: currentQuestion._id,
        selectedOption: existingAnswer?.selectedOption,
        isMarked: !existingAnswer?.isMarked,
        timeSpent: existingAnswer?.timeSpent || 0
      })

      return {
        ...prev,
        answers: newAnswers
      }
    })
  }

  const navigateToQuestion = (index: number) => {
    if (index >= 0 && index < state.questions.length) {
      setState(prev => ({
        ...prev,
        currentQuestionIndex: index
      }))
    }
  }

  const previousQuestion = () => {
    navigateToQuestion(state.currentQuestionIndex - 1)
  }

  const nextQuestion = () => {
    navigateToQuestion(state.currentQuestionIndex + 1)
  }

  const handleTimerTimeUp = () => {
    finishSimulation()
  }

  const handleTimerPause = () => {
    setState(prev => ({ ...prev, isPaused: true }))
  }

  const handleTimerResume = () => {
    setState(prev => ({ ...prev, isPaused: false }))
  }

  const finishSimulation = async () => {
    if (!state.simulation || !user) return

    try {
      // Para cada resposta, enviar individualmente
      for (const [questionId, answer] of state.answers.entries()) {
        if (answer.selectedOption) {
          await simulationService.submitAnswer(
            state.simulation._id,
            questionId,
            answer.selectedOption
          )
        }
      }

      // Finalizar o simulado
      await simulationService.completeSimulation(state.simulation._id)
      
      setState(prev => ({
        ...prev,
        isFinished: true
      }))

      // Navigate to results page
      navigate(`/simulations/${simulationId}/results`)
    } catch (err) {
      setError('Erro ao finalizar simulado')
      console.error('Error finishing simulation:', err)
    }
  }

  const getAnsweredCount = (): number => {
    return Array.from(state.answers.values()).filter(answer => answer.selectedOption).length
  }

  const getMarkedCount = (): number => {
    return Array.from(state.answers.values()).filter(answer => answer.isMarked).length
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando simulado...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar simulado</h2>
          <p className="text-gray-600 mb-4">{error}</p>
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

  if (!state.simulation || state.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <QuestionMarkCircleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Simulado não encontrado</h2>
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

  const currentQuestion = getCurrentQuestion()
  const currentAnswer = getCurrentAnswer()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-medium text-gray-900">
                {state.simulation.title}
              </h1>
              <span className="text-sm text-gray-500">
                Questão {state.currentQuestionIndex + 1} de {state.questions.length}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {/* Timer */}
              {state.simulation && (
                <TimerDisplay
                  initialTime={state.simulation.settings.timeLimit * 60}
                  onTimeUp={handleTimerTimeUp}
                  onPause={handleTimerPause}
                  onResume={handleTimerResume}
                  compact
                  size="sm"
                  showControls={false}
                  warningThreshold={300}
                  criticalThreshold={60}
                />
              )}

              {/* Finish Button */}
              <button
                onClick={finishSimulation}
                className="btn-danger"
              >
                Finalizar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Question Panel */}
          <div className="lg:col-span-3">
            {currentQuestion && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                {/* Question Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                      {currentQuestion.subject}
                    </span>
                    <span className="text-sm text-gray-500">
                      {currentQuestion.university}
                    </span>
                    {currentQuestion.year && (
                      <span className="text-sm text-gray-500">
                        {currentQuestion.year}
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={toggleMark}
                    className={`p-2 rounded-lg transition-colors ${
                      currentAnswer?.isMarked
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-400 hover:text-gray-600'
                    }`}
                    title={currentAnswer?.isMarked ? 'Desmarcar questão' : 'Marcar questão'}
                  >
                    <FlagIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Question Statement */}
                <div className="mb-6">
                  <div className="prose max-w-none text-gray-900">
                    {currentQuestion.text}
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    const optionLetter = String.fromCharCode(65 + index) // A, B, C, D, E
                    const isSelected = currentAnswer?.selectedOption === optionLetter
                    
                    return (
                      <button
                        key={index}
                        onClick={() => selectOption(optionLetter)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <span className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                            isSelected
                              ? 'border-blue-500 bg-blue-500 text-white'
                              : 'border-gray-300 text-gray-500'
                          }`}>
                            {optionLetter}
                          </span>
                          <span className="text-gray-900">{option.text}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                  <button
                    onClick={previousQuestion}
                    disabled={state.currentQuestionIndex === 0}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                    <span>Anterior</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {getAnsweredCount()} de {state.questions.length} respondidas
                    </span>
                    {getMarkedCount() > 0 && (
                      <span className="text-sm text-yellow-600">
                        • {getMarkedCount()} marcadas
                      </span>
                    )}
                  </div>

                  <button
                    onClick={nextQuestion}
                    disabled={state.currentQuestionIndex === state.questions.length - 1}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span>Próxima</span>
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-4 sticky top-24">
              <h3 className="font-medium text-gray-900 mb-4">Navegação</h3>
              
              {/* Question Grid */}
              <div className="grid grid-cols-5 gap-2 mb-6">
                {state.questions.map((question, index) => {
                  const answer = state.answers.get(question._id)
                  const isCurrent = index === state.currentQuestionIndex
                  const isAnswered = !!answer?.selectedOption
                  const isMarked = !!answer?.isMarked
                  
                  return (
                    <button
                      key={question._id}
                      onClick={() => navigateToQuestion(index)}
                      className={`w-8 h-8 text-xs font-medium rounded transition-colors relative ${
                        isCurrent
                          ? 'bg-blue-600 text-white'
                          : isAnswered
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {index + 1}
                      {isMarked && (
                        <FlagIcon className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500" />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-600 rounded"></div>
                  <span className="text-gray-600">Atual</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
                  <span className="text-gray-600">Respondida</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
                  <span className="text-gray-600">Não respondida</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FlagIcon className="h-4 w-4 text-yellow-500" />
                  <span className="text-gray-600">Marcada</span>
                </div>
              </div>

              {/* Progress */}
              <div className="mt-6 pt-4 border-t">
                <div className="text-sm text-gray-600 mb-2">
                  Progresso: {Math.round((getAnsweredCount() / state.questions.length) * 100)}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(getAnsweredCount() / state.questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}