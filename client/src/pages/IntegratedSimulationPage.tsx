import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  PlayIcon, 
  ClockIcon, 
  BookOpenIcon,
  AcademicCapIcon,
  BeakerIcon,
  ArrowLeftIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { 
  useRealSimulation 
} from '../services/realSimulationService'
import { SimulationConfig } from '../hooks/useSimulationSession'
import SimulationRunner from '../components/SimulationRunner'
import { SUBJECTS, UNIVERSITIES } from '@shared/constants'
import { useAuth } from '../contexts/AuthContext'
import { SimulationResults } from '../services/UserService'

type SimulationMode = 'menu' | 'running' | 'results'

export default function IntegratedSimulationPage() {
  const navigate = useNavigate()
  const { simulationId } = useParams<{ simulationId: string }>()
  const { updateStatistics } = useAuth()
  
  // Estado da página
  const [mode, setMode] = useState<SimulationMode>('menu')
  const [currentSimulation, setCurrentSimulation] = useState<SimulationConfig | null>(null)
  const [results, setResults] = useState<SimulationResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Serviços
  const simulationService = useRealSimulation()

  // Carregar simulação específica se ID fornecido
  useEffect(() => {
    if (simulationId && simulationId !== 'new') {
      loadSpecificSimulation(simulationId)
    }
  }, [simulationId])

  // Carregar simulação específica
  const loadSpecificSimulation = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const simulation = await simulationService.fetchSimulation(id)
      setCurrentSimulation(simulation)
      setMode('running')
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao carregar simulação')
    } finally {
      setLoading(false)
    }
  }

  // Criar e iniciar simulado
  const startSimulation = async (type: 'quick' | 'subject' | 'university', value?: string) => {
    try {
      setLoading(true)
      setError(null)
      
      let simulation: SimulationConfig

      switch (type) {
        case 'quick':
          simulation = await simulationService.createQuickSimulation()
          break
        case 'subject':
          if (!value) throw new Error('Matéria não especificada')
          simulation = await simulationService.createSubjectSimulation(value)
          break
        case 'university':
          if (!value) throw new Error('Universidade não especificada')
          simulation = await simulationService.createUniversitySimulation(value)
          break
        default:
          throw new Error('Tipo de simulado não suportado')
      }

      setCurrentSimulation(simulation)
      setMode('running')
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao criar simulação')
    } finally {
      setLoading(false)
    }
  }

  // Manipuladores de eventos
  const handleSimulationComplete = async (simulationResults: SimulationResults) => {
    try {
      console.log('🎯 IntegratedSimulationPage: Simulado concluído, salvando estatísticas...')
      
      // Salvar estatísticas no backend
      await updateStatistics(simulationResults)
      
      console.log('✅ IntegratedSimulationPage: Estatísticas salvas com sucesso')
      
      setResults(simulationResults)
      setMode('results')
    } catch (error) {
      console.error('❌ Erro ao salvar estatísticas:', error)
      // Mesmo com erro nas estatísticas, mostrar os resultados
      setResults(simulationResults)
      setMode('results')
      
      // Opcional: Mostrar toast/notificação de erro
      // toast.error('Erro ao salvar estatísticas, mas os resultados estão disponíveis')
    }
  }

  const handleBackToMenu = () => {
    setMode('menu')
    setCurrentSimulation(null)
    setResults(null)
    setError(null)
  }

  const handleExitToHome = () => {
    navigate('/')
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Preparando simulado...</p>
          <p className="text-sm text-gray-500 mt-2">Carregando questões do servidor</p>
        </div>
      </div>
    )
  }

  // Modo de execução
  if (mode === 'running' && currentSimulation) {
    return (
      <SimulationRunner
        simulation={currentSimulation}
        onComplete={handleSimulationComplete}
        onExit={handleBackToMenu}
      />
    )
  }

  // Funções helper para acessar dados de forma segura
  const getUserAnswer = (questionId: string): string | undefined => {
    if (!results) return undefined
    
    if (Array.isArray(results.answers)) {
      // Se for array, procurar por índice ou outro método (não implementado)
      return undefined
    } else {
      // Se for Record<string, string>
      return (results.answers as Record<string, string>)[questionId]
    }
  }

  const getTimeSpent = (questionId: string): number => {
    if (!results) return 0
    
    if (typeof results.timeSpent === 'number') {
      return results.timeSpent / (currentSimulation?.questions.length || 1)
    } else {
      return (results.timeSpent as Record<string, number>)[questionId] || 0
    }
  }

  // Tela de resultados
  if (mode === 'results' && results && currentSimulation) {
    const totalTimeSpent = typeof results.timeSpent === 'number' 
      ? results.timeSpent 
      : Object.values(results.timeSpent as Record<string, number>).reduce((sum, time) => sum + time, 0)
    const averageTimePerQuestion = totalTimeSpent / results.totalQuestions
    
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChartBarIcon className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Simulado Concluído!
              </h1>
              <p className="text-gray-600">
                {currentSimulation.title}
              </p>
            </div>

            {/* Métricas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {results.score.toFixed(1)}%
                </div>
                <div className="text-gray-600">Aproveitamento</div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {results.correctAnswers}/{results.totalQuestions}
                </div>
                <div className="text-gray-600">Acertos</div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {Math.floor(totalTimeSpent / 60)}m
                </div>
                <div className="text-gray-600">Tempo Total</div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {Math.floor(averageTimePerQuestion)}s
                </div>
                <div className="text-gray-600">Tempo/Questão</div>
              </div>
            </div>

            {/* Análise Detalhada */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Performance por Questão */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Performance por Questão
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {currentSimulation.questions.map((question, index) => {
                    const userAnswer = getUserAnswer(question._id)
                    const isCorrect = userAnswer === question.correctAnswer
                    const timeSpent = getTimeSpent(question._id)
                    
                    return (
                      <div key={question._id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-600">
                            Q{index + 1}
                          </span>
                          <div className={`w-3 h-3 rounded-full ${
                            isCorrect ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          <span className="text-sm text-gray-700">
                            {question.subject}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {Math.floor(timeSpent / 60)}m {timeSpent % 60}s
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Estatísticas por Matéria */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Performance por Matéria
                </h3>
                <div className="space-y-3">
                  {(() => {
                    const subjectStats: Record<string, { correct: number; total: number }> = {}
                    
                    currentSimulation.questions.forEach(question => {
                      const subject = question.subject
                      if (!subjectStats[subject]) {
                        subjectStats[subject] = { correct: 0, total: 0 }
                      }
                      subjectStats[subject].total++
                      
                      const userAnswer = getUserAnswer(question._id)
                      if (userAnswer === question.correctAnswer) {
                        subjectStats[subject].correct++
                      }
                    })

                    return Object.entries(subjectStats).map(([subject, stats]) => {
                      const percentage = (stats.correct / stats.total) * 100
                      
                      return (
                        <div key={subject} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              {subject}
                            </span>
                            <span className="text-sm text-gray-600">
                              {stats.correct}/{stats.total} ({percentage.toFixed(0)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })
                  })()}
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleBackToMenu}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <PlayIcon className="h-5 w-5" />
                <span>Novo Simulado</span>
              </button>
              
              <button
                onClick={handleExitToHome}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                <span>Voltar ao Início</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Menu principal de simulados
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🎯 Simulados Integrados com Backend
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Escolha seu tipo de simulado. Todas as questões são carregadas diretamente do servidor 
              com timer integrado e auto-save automático.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Erro</h3>
              <p className="text-red-700">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-sm text-red-600 hover:text-red-800"
              >
                Tentar Novamente
              </button>
            </div>
          )}

          {/* Opções de Simulado */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Simulado Rápido */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BeakerIcon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Simulado Rápido
                </h3>
                <p className="text-gray-600 mb-4">
                  10 questões aleatórias em 10 minutos
                </p>
                <div className="space-y-2 text-sm text-gray-500 mb-6">
                  <div className="flex justify-between">
                    <span>Questões:</span>
                    <span>10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tempo:</span>
                    <span>10 min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Matérias:</span>
                    <span>Todas</span>
                  </div>
                </div>
                <button
                  onClick={() => startSimulation('quick')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Iniciar Rápido
                </button>
              </div>
            </div>

            {/* Simulado por Matéria */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpenIcon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Por Matéria
                </h3>
                <p className="text-gray-600 mb-4">
                  15 questões de uma matéria específica
                </p>
                
                <select 
                  id="subject-select"
                  className="w-full mb-4 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  defaultValue=""
                >
                  <option value="">Escolha a matéria</option>
                  {SUBJECTS.map(subject => (
                    <option key={subject.value} value={subject.value}>
                      {subject.label}
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={() => {
                    const select = document.getElementById('subject-select') as HTMLSelectElement
                    if (select.value) {
                      startSimulation('subject', select.value)
                    }
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Iniciar por Matéria
                </button>
              </div>
            </div>

            {/* Simulado por Universidade */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AcademicCapIcon className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Por Universidade
                </h3>
                <p className="text-gray-600 mb-4">
                  20 questões de uma universidade específica
                </p>
                
                <select 
                  id="university-select"
                  className="w-full mb-4 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  defaultValue=""
                >
                  <option value="">Escolha a universidade</option>
                  {UNIVERSITIES.map(university => (
                    <option key={university.value} value={university.value}>
                      {university.label}
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={() => {
                    const select = document.getElementById('university-select') as HTMLSelectElement
                    if (select.value) {
                      startSimulation('university', select.value)
                    }
                  }}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Iniciar por Universidade
                </button>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              🚀 Funcionalidades Integradas
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <ClockIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-800">Timer Integrado</h4>
                <p className="text-sm text-gray-600">Cronômetro com estados visuais</p>
              </div>
              
              <div className="text-center">
                <BookOpenIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-800">Auto-Save</h4>
                <p className="text-sm text-gray-600">Progresso salvo automaticamente</p>
              </div>
              
              <div className="text-center">
                <ChartBarIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-800">Analytics</h4>
                <p className="text-sm text-gray-600">Estatísticas detalhadas</p>
              </div>
              
              <div className="text-center">
                <AcademicCapIcon className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-800">Backend Real</h4>
                <p className="text-sm text-gray-600">Questões do servidor</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}