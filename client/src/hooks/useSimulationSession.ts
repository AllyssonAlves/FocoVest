import { useState, useEffect, useCallback, useRef } from 'react'
import { useTimer, TimerConfig } from './useTimer'
import { 
  SimulationProgress, 
  useSimulationProgress 
} from '../services/simulationProgressService'

// Tipos específicos do hook
export interface Question {
  _id: string
  questionText: string
  alternatives: Array<{
    id: string
    text: string
  }>
  correctAnswer: string
  subject: string
  university: string
  difficulty: 'easy' | 'medium' | 'hard'
  explanation?: string
}

export interface SimulationConfig {
  _id: string
  title: string
  description?: string
  timeLimit: number // em segundos
  questionsCount: number
  questions: Question[]
  allowReview: boolean
  autoSubmit: boolean
}

export interface SimulationSessionState {
  // Estado do simulado
  simulation: SimulationConfig
  currentQuestionIndex: number
  answers: Record<string, string> // questionId -> selectedOption
  timeSpent: Record<string, number> // questionId -> seconds spent
  
  // Estado da sessão
  isStarted: boolean
  isPaused: boolean
  isCompleted: boolean
  startedAt: Date | null
  
  // Métricas
  totalTimeRemaining: number
  questionStartTime: number
  correctAnswers: number
  accuracy: number
}

export interface SimulationSessionControls {
  // Navegação
  goToQuestion: (index: number) => void
  nextQuestion: () => void
  previousQuestion: () => void
  
  // Respostas
  selectAnswer: (questionId: string, answer: string) => void
  clearAnswer: (questionId: string) => void
  
  // Controles da sessão
  startSimulation: () => void
  pauseSimulation: () => void
  resumeSimulation: () => void
  finishSimulation: () => void
  
  // Utilitários
  getCurrentQuestion: () => Question | null
  getQuestionProgress: () => { answered: number; total: number }
  canGoNext: () => boolean
  canGoPrevious: () => boolean
  
  // Auto-save
  saveProgress: () => void
  loadProgress: () => boolean
  
  // Timer controls
  timerControls: any
}

export function useSimulationSession(
  simulation: SimulationConfig,
  timerConfig?: Partial<TimerConfig>
): [SimulationSessionState, SimulationSessionControls] {
  
  // Serviços
  const progressService = useSimulationProgress(simulation._id)
  
  // Estado principal
  const [sessionState, setSessionState] = useState<SimulationSessionState>(() => ({
    simulation,
    currentQuestionIndex: 0,
    answers: {},
    timeSpent: {},
    isStarted: false,
    isPaused: false,
    isCompleted: false,
    startedAt: null,
    totalTimeRemaining: simulation.timeLimit,
    questionStartTime: Date.now(),
    correctAnswers: 0,
    accuracy: 0
  }))

  // Timer principal do simulado
  const [, timerControls] = useTimer({
    initialTime: simulation.timeLimit, // Usar o tempo original do simulado
    onTimeUp: () => {
      console.log('⏰ Tempo do simulado esgotado!')
      finishSimulation()
    },
    onTick: (timeRemaining) => {
      // Log com timestamp para verificar velocidade real
      if (timeRemaining % 10 === 0) {
        console.log('🔄 onTick:', timeRemaining, 'às', new Date().toLocaleTimeString())
      }
      setSessionState(prev => ({
        ...prev,
        totalTimeRemaining: timeRemaining
      }))
    },
    ...timerConfig
  })

  // Referências para cálculo de tempo por questão
  const questionStartTimeRef = useRef<number>(Date.now())
  const lastSaveRef = useRef<number>(Date.now())

  // Atualizar tempo gasto na questão atual
  useEffect(() => {
    if (!sessionState.isStarted || sessionState.isPaused || sessionState.isCompleted) return

    const interval = setInterval(() => {
      const currentQuestion = getCurrentQuestion()
      
      if (currentQuestion) {
        setSessionState(prev => ({
          ...prev,
          timeSpent: {
            ...prev.timeSpent,
            [currentQuestion._id]: (prev.timeSpent[currentQuestion._id] || 0) + 1
          }
        }))
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [sessionState.isStarted, sessionState.isPaused, sessionState.isCompleted, sessionState.currentQuestionIndex])

  // Auto-save periódico
  useEffect(() => {
    if (!sessionState.isStarted || sessionState.isCompleted) return

    const interval = setInterval(() => {
      saveProgress()
    }, 10000) // Auto-save a cada 10 segundos

    return () => clearInterval(interval)
  }, [sessionState.isStarted, sessionState.isCompleted])

  // Navegação
  const goToQuestion = useCallback((index: number) => {
    if (index < 0 || index >= simulation.questions.length) return
    
    setSessionState(prev => ({
      ...prev,
      currentQuestionIndex: index
    }))
    
    questionStartTimeRef.current = Date.now()
    saveProgress()
  }, [simulation.questions.length])

  const nextQuestion = useCallback(() => {
    if (sessionState.currentQuestionIndex < simulation.questions.length - 1) {
      goToQuestion(sessionState.currentQuestionIndex + 1)
    }
  }, [sessionState.currentQuestionIndex, simulation.questions.length, goToQuestion])

  const previousQuestion = useCallback(() => {
    if (sessionState.currentQuestionIndex > 0) {
      goToQuestion(sessionState.currentQuestionIndex - 1)
    }
  }, [sessionState.currentQuestionIndex, goToQuestion])

  // Respostas
  const selectAnswer = useCallback((questionId: string, answer: string) => {
    setSessionState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: answer
      }
    }))
    
    // Auto-save após responder
    setTimeout(() => saveProgress(), 100)
  }, [])

  const clearAnswer = useCallback((questionId: string) => {
    setSessionState(prev => {
      const newAnswers = { ...prev.answers }
      delete newAnswers[questionId]
      
      return {
        ...prev,
        answers: newAnswers
      }
    })
    
    setTimeout(() => saveProgress(), 100)
  }, [])

  // Controles da sessão
  const startSimulation = useCallback(() => {
    setSessionState(prev => ({
      ...prev,
      isStarted: true,
      isPaused: false,
      startedAt: new Date()
    }))
    
    questionStartTimeRef.current = Date.now()
    timerControls.start()
    
    console.log('🚀 Simulado iniciado:', simulation.title)
    console.log('⏰ Timer iniciado com:', sessionState.totalTimeRemaining, 'segundos')
    console.log('🎯 Timer controls:', timerControls)
  }, [timerControls, simulation.title])

  const pauseSimulation = useCallback(() => {
    setSessionState(prev => ({
      ...prev,
      isPaused: true
    }))
    
    timerControls.pause()
    saveProgress()
    
    console.log('⏸️ Simulado pausado')
  }, [timerControls])

  const resumeSimulation = useCallback(() => {
    setSessionState(prev => ({
      ...prev,
      isPaused: false
    }))
    
    questionStartTimeRef.current = Date.now()
    timerControls.resume()
    
    console.log('▶️ Simulado retomado')
  }, [timerControls])

  const finishSimulation = useCallback(() => {
    // Calcular métricas finais
    const answeredQuestions = Object.keys(sessionState.answers).length
    let correctCount = 0
    
    simulation.questions.forEach(question => {
      const userAnswer = sessionState.answers[question._id]
      if (userAnswer === question.correctAnswer) {
        correctCount++
      }
    })
    
    const accuracy = simulation.questions.length > 0 ? (correctCount / simulation.questions.length) * 100 : 0
    
    setSessionState(prev => ({
      ...prev,
      isCompleted: true,
      isPaused: false,
      correctAnswers: correctCount,
      accuracy
    }))
    
    timerControls.stop()
    
    // Salvar resultado final e limpar auto-save
    saveProgress()
    progressService.stopAutoSave()
    
    console.log('✅ Simulado finalizado:', {
      answered: answeredQuestions,
      correct: correctCount,
      accuracy: `${accuracy.toFixed(1)}%`
    })
  }, [sessionState.answers, simulation.questions, timerControls, progressService])

  // Utilitários
  const getCurrentQuestion = useCallback((): Question | null => {
    return simulation.questions[sessionState.currentQuestionIndex] || null
  }, [simulation.questions, sessionState.currentQuestionIndex])

  const getQuestionProgress = useCallback(() => {
    const answered = Object.keys(sessionState.answers).length
    return {
      answered,
      total: simulation.questions.length
    }
  }, [sessionState.answers, simulation.questions.length])

  const canGoNext = useCallback(() => {
    return sessionState.currentQuestionIndex < simulation.questions.length - 1
  }, [sessionState.currentQuestionIndex, simulation.questions.length])

  const canGoPrevious = useCallback(() => {
    return sessionState.currentQuestionIndex > 0
  }, [sessionState.currentQuestionIndex])

  // Auto-save
  const saveProgress = useCallback(() => {
    const progress: SimulationProgress = {
      simulationId: simulation._id,
      startedAt: sessionState.startedAt || new Date(),
      lastSavedAt: new Date(),
      currentQuestionIndex: sessionState.currentQuestionIndex,
      answers: sessionState.answers,
      timeSpent: sessionState.timeSpent,
      totalTimeRemaining: sessionState.totalTimeRemaining,
      questionTimeRemaining: 0, // TODO: Implementar timer por questão
      isPaused: sessionState.isPaused,
      isCompleted: sessionState.isCompleted
    }
    
    progressService.saveProgress(progress)
    lastSaveRef.current = Date.now()
  }, [
    simulation._id,
    sessionState.startedAt,
    sessionState.currentQuestionIndex,
    sessionState.answers,
    sessionState.timeSpent,
    sessionState.totalTimeRemaining,
    sessionState.isPaused,
    sessionState.isCompleted,
    progressService
  ])

  // Carregar progresso salvo
  const loadProgress = useCallback((): boolean => {
    const savedProgress = progressService.loadProgress()
    
    if (!savedProgress || savedProgress.isCompleted) {
      return false
    }
    
    setSessionState(prev => ({
      ...prev,
      currentQuestionIndex: savedProgress.currentQuestionIndex,
      answers: savedProgress.answers,
      timeSpent: savedProgress.timeSpent,
      totalTimeRemaining: savedProgress.totalTimeRemaining,
      isPaused: savedProgress.isPaused,
      isStarted: true,
      startedAt: savedProgress.startedAt
    }))
    
    // Configurar timer com tempo restante
    timerControls.reset()
    timerControls.setTime?.(savedProgress.totalTimeRemaining)
    
    if (!savedProgress.isPaused) {
      timerControls.start()
    }
    
    questionStartTimeRef.current = Date.now()
    
    console.log('📥 Progresso carregado:', savedProgress.simulationId)
    return true
  }, [progressService, timerControls])

  // Controles combinados
  const controls: SimulationSessionControls = {
    goToQuestion,
    nextQuestion,
    previousQuestion,
    selectAnswer,
    clearAnswer,
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    finishSimulation,
    getCurrentQuestion,
    getQuestionProgress,
    canGoNext,
    canGoPrevious,
    saveProgress,
    loadProgress,
    timerControls
  }

  // Retornar estado da sessão (que já tem totalTimeRemaining atualizado pelo onTick)
  return [sessionState, controls]
}