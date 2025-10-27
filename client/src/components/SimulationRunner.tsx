import { useState, useEffect } from 'react'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ClockIcon,
  PauseIcon,
  PlayIcon,
  CheckCircleIcon,
  BookmarkIcon,
  FlagIcon
} from '@heroicons/react/24/outline'
import { 
  useSimulationSession, 
  SimulationConfig
} from '../hooks/useSimulationSession'

// Função utilitária para formatar tempo (recebe segundos)
const formatTime = (seconds?: number): string => {
  if (!seconds || isNaN(seconds) || seconds <= 0) {
    return 'Tempo livre'
  }
  
  const minutes = Math.floor(seconds / 60)
  
  if (minutes < 60) {
    return `${minutes} min`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  
  return `${hours}h ${remainingMinutes}min`
}

// Função para formatar tempo restante do timer (HH:MM:SS ou MM:SS)
const formatTimeRemaining = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

interface SimulationRunnerProps {
  simulation: SimulationConfig
  onComplete?: (results: {
    score: number
    correctAnswers: number
    totalQuestions: number
    timeSpent: Record<string, number>
    answers: Record<string, string>
  }) => void
  onExit?: () => void
}

export default function SimulationRunner({ 
  simulation, 
  onComplete, 
  onExit 
}: SimulationRunnerProps) {
  
  // Estado da sessão
  const [sessionState, sessionControls] = useSimulationSession(simulation, {
    warningThreshold: 300, // 5 minutos
    criticalThreshold: 60  // 1 minuto
  })

  // Estados locais do componente
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [showFinishConfirm, setShowFinishConfirm] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  
  // Log de debug para verificar estado
  console.log('🔄 SimulationRunner renderizado:', {
    isPaused: sessionState.isPaused,
    isStarted: sessionState.isStarted,
    timeRemaining: sessionState.totalTimeRemaining,
    currentQuestion: sessionState.currentQuestionIndex + 1,
    totalQuestions: simulation.questionsCount
  })

  // Monitorar mudanças no tempo (só loga a cada 10 segundos para reduzir spam)
  useEffect(() => {
    // Log de tempo apenas em desenvolvimento a cada minuto
    if (import.meta.env.DEV && sessionState.totalTimeRemaining > 0 && sessionState.totalTimeRemaining % 60 === 0) {
      console.log('⏱️ Tempo restante:', `${Math.floor(sessionState.totalTimeRemaining / 60)}min`)
    }
  }, [sessionState.totalTimeRemaining])

  // Carregar progresso salvo ao montar
  useEffect(() => {
    const hasProgress = sessionControls.loadProgress()
    if (hasProgress && import.meta.env.DEV) {
      console.log('📥 Progresso anterior carregado')
    }
  }, [])

  // Sincronizar resposta selecionada com estado da sessão
  useEffect(() => {
    const currentQuestion = sessionControls.getCurrentQuestion()
    if (currentQuestion) {
      const answer = sessionState.answers[currentQuestion._id] || ''
      setSelectedAnswer(answer)
    }
  }, [sessionState.currentQuestionIndex, sessionState.answers])

  // Manipuladores de eventos
  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswer(answerId)
    const currentQuestion = sessionControls.getCurrentQuestion()
    if (currentQuestion) {
      sessionControls.selectAnswer(currentQuestion._id, answerId)
    }
  }

  const handleNext = () => {
    if (sessionControls.canGoNext()) {
      sessionControls.nextQuestion()
    } else {
      // Última questão - mostrar confirmação de finalização
      setShowFinishConfirm(true)
    }
  }

  const handlePrevious = () => {
    sessionControls.previousQuestion()
  }

  const handlePauseResume = () => {
    console.log('🎮 Botão Pausar/Continuar clicado. Estado atual:', sessionState.isPaused)
    if (sessionState.isPaused) {
      sessionControls.resumeSimulation()
    } else {
      sessionControls.pauseSimulation()
    }
  }

  const handleFinish = () => {
    sessionControls.finishSimulation()
    
    if (onComplete) {
      const results = {
        score: sessionState.accuracy,
        correctAnswers: sessionState.correctAnswers,
        totalQuestions: simulation.questions.length,
        timeSpent: sessionState.timeSpent,
        answers: sessionState.answers
      }
      onComplete(results)
    }
  }

  const handleExit = () => {
    if (onExit) {
      onExit()
    }
  }

  // Se não iniciado, mostrar tela de início
  if (!sessionState.isStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {simulation.title}
            </h1>
            
            {simulation.description && (
              <p className="text-gray-600 mb-6">
                {simulation.description}
              </p>
            )}
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {simulation.questionsCount}
                </div>
                <div className="text-gray-600">Questões</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {formatTime(simulation.timeLimit)}
                </div>
                <div className="text-gray-600">Tempo Limite</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => {
                  console.log('🚀 Clicou em Iniciar Simulado')
                  sessionControls.startSimulation()
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Iniciar Simulado
              </button>
              
              <button
                onClick={handleExit}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Se completado, mostrar resultados
  if (sessionState.isCompleted) {
    const progress = sessionControls.getQuestionProgress()
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Simulado Concluído!
            </h1>
            
            <p className="text-gray-600 mb-8">
              Parabéns por completar o {simulation.title}
            </p>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {sessionState.correctAnswers}/{progress.total}
                </div>
                <div className="text-gray-600">Acertos</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {sessionState.accuracy.toFixed(1)}%
                </div>
                <div className="text-gray-600">Aproveitamento</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={handleFinish}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Ver Resultados Detalhados
              </button>
              
              <button
                onClick={handleExit}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Finalizar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = sessionControls.getCurrentQuestion()
  const progress = sessionControls.getQuestionProgress()
  
  console.log('📊 Progresso calculado:', progress)
  console.log('❓ Questão atual:', currentQuestion ? `${sessionState.currentQuestionIndex + 1}/${simulation.questionsCount}` : 'Nenhuma')
  
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando questão...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header com Timer e Controles */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-semibold text-gray-900">
                {simulation.title}
              </h1>
              <span className="text-gray-400">|</span>
              <span className="text-sm text-gray-600">
                Questão {sessionState.currentQuestionIndex + 1} de {simulation.questionsCount}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Timer Compacto */}
              <div className="flex items-center space-x-2">
                <ClockIcon className="h-5 w-5 text-gray-500" />
                {sessionState.totalTimeRemaining > 0 ? (
                  <span className={`text-sm font-mono ${
                    sessionState.totalTimeRemaining < 60 ? 'text-red-600 font-bold' :
                    sessionState.totalTimeRemaining < 300 ? 'text-yellow-600' :
                    'text-gray-700'
                  }`}>
                    {formatTimeRemaining(sessionState.totalTimeRemaining)}
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">Tempo livre</span>
                )}
              </div>
              
              {/* Controles */}
              <button
                onClick={handlePauseResume}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
              >
                {sessionState.isPaused ? (
                  <PlayIcon className="h-4 w-4" />
                ) : (
                  <PauseIcon className="h-4 w-4" />
                )}
                <span className="text-sm">
                  {sessionState.isPaused ? 'Continuar' : 'Pausar'}
                </span>
              </button>
              
              <button
                onClick={() => {
                  console.log('🚪 Botão Sair clicado')
                  setShowExitConfirm(true)
                }}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm"
              >
                Sair
              </button>
            </div>
          </div>
          
          {/* Barra de Progresso */}
          <div className="mt-3">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progresso</span>
              <span>{progress.answered} de {progress.total} respondidas</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((sessionState.currentQuestionIndex + 1) / simulation.questionsCount) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8">
            {/* Informações da Questão */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex space-x-2">
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  {currentQuestion.subject}
                </span>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  {currentQuestion.university}
                </span>
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                  {currentQuestion.difficulty}
                </span>
              </div>
              
              <div className="flex space-x-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <BookmarkIcon className="h-5 w-5 text-gray-400" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <FlagIcon className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>
            
            {/* Texto da Questão */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Questão {sessionState.currentQuestionIndex + 1}
              </h2>
              <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                {currentQuestion.questionText}
              </p>
            </div>
            
            {/* Alternativas */}
            <div className="space-y-3 mb-8">
              {currentQuestion.alternatives.map((alternative, index) => {
                const letter = String.fromCharCode(65 + index) // A, B, C, D, E
                const isSelected = selectedAnswer === alternative.id
                
                return (
                  <label
                    key={alternative.id}
                    className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      id={`answer-${alternative.id}`}
                      name="answer"
                      value={alternative.id}
                      checked={isSelected}
                      onChange={() => handleAnswerSelect(alternative.id)}
                      className="mt-1 text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-start space-x-2">
                        <span className="font-semibold text-gray-700 min-w-[20px]">
                          {letter})
                        </span>
                        <span className="text-gray-800">
                          {alternative.text}
                        </span>
                      </div>
                    </div>
                  </label>
                )
              })}
            </div>
            
            {/* Navegação */}
            <div className="flex justify-between items-center">
              <button
                onClick={handlePrevious}
                disabled={!sessionControls.canGoPrevious()}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 rounded-lg transition-colors"
              >
                <ChevronLeftIcon className="h-4 w-4" />
                <span>Anterior</span>
              </button>
              
              <div className="text-sm text-gray-500">
                Tempo na questão: {Math.floor((sessionState.timeSpent[currentQuestion._id] || 0) / 60)}m {((sessionState.timeSpent[currentQuestion._id] || 0) % 60)}s
              </div>
              
              <button
                onClick={handleNext}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <span>
                  {sessionControls.canGoNext() ? 'Próxima' : 'Finalizar'}
                </span>
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Confirmação de Saída */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Sair do Simulado?
            </h3>
            <p className="text-gray-600 mb-6">
              Seu progresso será salvo automaticamente e você poderá continuar mais tarde.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
              >
                Continuar
              </button>
              <button
                onClick={handleExit}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Finalização */}
      {showFinishConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Finalizar Simulado?
            </h3>
            <p className="text-gray-600 mb-4">
              Você respondeu {progress.answered} de {progress.total} questões.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Tem certeza que deseja finalizar? Esta ação não pode ser desfeita.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowFinishConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
              >
                Continuar
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Finalizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay de Pausa */}
      {sessionState.isPaused && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-8 text-center">
            <PauseIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Simulado Pausado
            </h3>
            <p className="text-gray-600 mb-6">
              O simulado está pausado. Clique em continuar para retomar.
            </p>
            <button
              onClick={handlePauseResume}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Continuar Simulado
            </button>
          </div>
        </div>
      )}
    </div>
  )
}