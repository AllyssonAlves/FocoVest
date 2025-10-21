import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, 
  Users, 
  Settings,
  ChevronRight,
  ArrowLeft,
  Check,
  Play,
  Filter
} from 'lucide-react'

// Simulando os tipos que não existem ainda - agora usando diretamente as strings

// Simulando as constantes que não existem
const UNIVERSITIES = [
  { value: 'UFC', label: 'Universidade Federal do Ceará' },
  { value: 'UECE', label: 'Universidade Estadual do Ceará' },
  { value: 'UVA', label: 'Universidade Estadual Vale do Acaraú' },
  { value: 'URCA', label: 'Universidade Regional do Cariri' },
  { value: 'IFCE', label: 'Instituto Federal do Ceará' },
  { value: 'ENEM', label: 'Exame Nacional do Ensino Médio (ENEM)' }
]

const SUBJECTS = [
  { value: 'MATHEMATICS', label: 'Matemática' },
  { value: 'PORTUGUESE', label: 'Português' },
  { value: 'LITERATURE', label: 'Literatura' },
  { value: 'PHYSICS', label: 'Física' },
  { value: 'CHEMISTRY', label: 'Química' },
  { value: 'BIOLOGY', label: 'Biologia' },
  { value: 'HISTORY', label: 'História' },
  { value: 'GEOGRAPHY', label: 'Geografia' },
  { value: 'PHILOSOPHY', label: 'Filosofia' },
  { value: 'SOCIOLOGY', label: 'Sociologia' },
  { value: 'ENGLISH', label: 'Inglês' },
  { value: 'SPANISH', label: 'Espanhol' },
  { value: 'ARTS', label: 'Artes' },
  { value: 'PHYSICAL_EDUCATION', label: 'Educação Física' }
]

const DIFFICULTY_NAMES = {
  'EASY': 'Fácil',
  'MEDIUM': 'Médio', 
  'HARD': 'Difícil'
}

interface SimulationConfig {
  title: string
  description: string
  category: 'geral' | 'especifico' | 'revisao' | 'vestibular' | 'enem'
  universities: string[]
  subjects: string[]
  difficulties: string[]
  questionsCount: number
  timeLimit: number // em minutos
  randomizeQuestions: boolean
  randomizeAlternatives: boolean
  showResultsImmediately: boolean
  allowReviewAnswers: boolean
  examYearRange: {
    start: number
    end: number
  }
  topics: string[]
  isPublic: boolean
}

const defaultConfig: SimulationConfig = {
  title: '',
  description: '',
  category: 'geral',
  universities: [],
  subjects: [],
  difficulties: ['EASY', 'MEDIUM', 'HARD'],
  questionsCount: 20,
  timeLimit: 60,
  randomizeQuestions: true,
  randomizeAlternatives: false,
  showResultsImmediately: true,
  allowReviewAnswers: true,
  examYearRange: {
    start: 2018,
    end: new Date().getFullYear()
  },
  topics: [],
  isPublic: false
}

const steps = [
  { id: 1, title: 'Informações Básicas', icon: BookOpen },
  { id: 2, title: 'Universidades & Matérias', icon: Users },
  { id: 3, title: 'Configurações', icon: Settings },
  { id: 4, title: 'Finalizar', icon: Check }
]

const categories = [
  { 
    value: 'geral' as const, 
    label: 'Simulado Geral', 
    description: 'Questões diversas de múltiplas matérias',
    icon: '📚'
  },
  { 
    value: 'especifico' as const, 
    label: 'Matéria Específica', 
    description: 'Foco em uma matéria específica',
    icon: '🎯'
  },
  { 
    value: 'revisao' as const, 
    label: 'Revisão', 
    description: 'Questões para revisar conteúdos',
    icon: '🔄'
  },
  { 
    value: 'vestibular' as const, 
    label: 'Vestibular', 
    description: 'Simulado completo de vestibular',
    icon: '🎓'
  },
  { 
    value: 'enem' as const, 
    label: 'ENEM', 
    description: 'Formato ENEM nacional',
    icon: '🇧🇷'
  }
]

const CreateSimulationPage: React.FC = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [config, setConfig] = useState<SimulationConfig>(defaultConfig)
  const [isCreating, setIsCreating] = useState(false)
  const [questionsPreview, setQuestionsPreview] = useState<number>(0)

  // Calcular número estimado de questões disponíveis
  useEffect(() => {
    // TODO: Implementar chamada à API para contar questões disponíveis
    // baseado nos filtros selecionados
    const estimatedQuestions = Math.floor(Math.random() * 500) + 100
    setQuestionsPreview(estimatedQuestions)
  }, [config.universities, config.subjects, config.difficulties, config.examYearRange])

  const updateConfig = (updates: Partial<SimulationConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleCreate = async () => {
    setIsCreating(true)
    try {
      // Converter config para o formato esperado pelo backend
      const simulationData = {
        title: config.title,
        description: config.description,
        category: config.category,
        settings: {
          timeLimit: config.timeLimit,
          questionsCount: config.questionsCount,
          randomizeQuestions: config.randomizeQuestions,
          randomizeAlternatives: config.randomizeAlternatives,
          showResultsImmediately: config.showResultsImmediately,
          allowReviewAnswers: config.allowReviewAnswers,
          subjects: config.subjects,
          universities: config.universities,
          difficulty: config.difficulties
        },
        isPublic: config.isPublic,
        tags: [
          config.category,
          ...config.universities,
          ...config.subjects.map(s => SUBJECTS.find(sub => sub.value === s)?.label.toLowerCase() || s)
        ].filter(Boolean),
        examYearRange: config.examYearRange
      }

      console.log('Criando simulado:', simulationData)
      
      // TODO: Integrar com o simulationService quando estiver pronto
      // const response = await simulationService.createSimulation(simulationData)
      
      // Simular criação por enquanto
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Redirecionar para a lista de simulados
      navigate('/simulations')
    } catch (error) {
      console.error('Erro ao criar simulado:', error)
      alert('Erro ao criar simulado. Tente novamente.')
    } finally {
      setIsCreating(false)
    }
  }

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isActive = currentStep === step.id
          const isCompleted = currentStep > step.id
          
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all
                  ${isActive ? 'bg-blue-600 border-blue-600 text-white' : 
                    isCompleted ? 'bg-green-600 border-green-600 text-white' :
                    'bg-gray-100 border-gray-300 text-gray-400'}
                `}>
                  <Icon size={20} />
                </div>
                <span className={`mt-2 text-sm font-medium ${
                  isActive ? 'text-blue-600' : 
                  isCompleted ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-px mx-4 ${
                  isCompleted ? 'bg-green-600' : 'bg-gray-300'
                }`} />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Informações Básicas do Simulado
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título do Simulado *
            </label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => updateConfig({ title: e.target.value })}
              placeholder="Ex: Simulado UFC - Matemática e Física"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={config.description}
              onChange={(e) => updateConfig({ description: e.target.value })}
              placeholder="Descreva o objetivo do simulado..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Simulado *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <motion.div
                  key={category.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => updateConfig({ category: category.value })}
                  className={`
                    p-4 border-2 rounded-lg cursor-pointer transition-all
                    ${config.category === category.value 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="text-2xl mb-2">{category.icon}</div>
                  <h3 className="font-semibold text-gray-900">{category.label}</h3>
                  <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Universidades & Matérias
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Universidades
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {UNIVERSITIES.map((university) => (
              <label key={university.value} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.universities.includes(university.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateConfig({ 
                        universities: [...config.universities, university.value] 
                      })
                    } else {
                      updateConfig({ 
                        universities: config.universities.filter(u => u !== university.value) 
                      })
                    }
                  }}
                  className="mr-3 h-4 w-4 text-blue-600 rounded"
                />
                <div>
                  <div className="font-medium text-gray-900">{university.value}</div>
                  <div className="text-sm text-gray-600">{university.label}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Matérias
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {SUBJECTS.map((subject) => (
              <label key={subject.value} className="flex items-center p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.subjects.includes(subject.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateConfig({ 
                        subjects: [...config.subjects, subject.value] 
                      })
                    } else {
                      updateConfig({ 
                        subjects: config.subjects.filter(s => s !== subject.value) 
                      })
                    }
                  }}
                  className="mr-2 h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-sm font-medium text-gray-900">{subject.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Período dos Exames
          </label>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">De:</label>
              <input
                type="number"
                min="2010"
                max={new Date().getFullYear()}
                value={config.examYearRange.start}
                onChange={(e) => updateConfig({
                  examYearRange: {
                    ...config.examYearRange,
                    start: parseInt(e.target.value)
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Até:</label>
              <input
                type="number"
                min="2010"
                max={new Date().getFullYear()}
                value={config.examYearRange.end}
                onChange={(e) => updateConfig({
                  examYearRange: {
                    ...config.examYearRange,
                    end: parseInt(e.target.value)
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {questionsPreview > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center text-blue-800">
              <Filter className="mr-2" size={20} />
              <span className="font-medium">
                Aproximadamente {questionsPreview} questões disponíveis com estes filtros
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Configurações do Simulado
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Questões
            </label>
            <input
              type="number"
              min="5"
              max="100"
              value={config.questionsCount}
              onChange={(e) => updateConfig({ questionsCount: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tempo Limite (minutos)
            </label>
            <input
              type="number"
              min="10"
              max="240"
              value={config.timeLimit}
              onChange={(e) => updateConfig({ timeLimit: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Nível de Dificuldade
            </label>
            <div className="space-y-2">
              {Object.entries(DIFFICULTY_NAMES).map(([key, label]) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.difficulties.includes(key)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateConfig({ 
                          difficulties: [...config.difficulties, key] 
                        })
                      } else {
                        updateConfig({ 
                          difficulties: config.difficulties.filter(d => d !== key) 
                        })
                      }
                    }}
                    className="mr-2 h-4 w-4 text-blue-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-900">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Opções Avançadas</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.randomizeQuestions}
                  onChange={(e) => updateConfig({ randomizeQuestions: e.target.checked })}
                  className="mr-3 h-4 w-4 text-blue-600 rounded"
                />
                <div>
                  <div className="font-medium text-gray-900">Embaralhar Questões</div>
                  <div className="text-sm text-gray-600">As questões aparecerão em ordem aleatória</div>
                </div>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.randomizeAlternatives}
                  onChange={(e) => updateConfig({ randomizeAlternatives: e.target.checked })}
                  className="mr-3 h-4 w-4 text-blue-600 rounded"
                />
                <div>
                  <div className="font-medium text-gray-900">Embaralhar Alternativas</div>
                  <div className="text-sm text-gray-600">As alternativas aparecerão em ordem aleatória</div>
                </div>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.showResultsImmediately}
                  onChange={(e) => updateConfig({ showResultsImmediately: e.target.checked })}
                  className="mr-3 h-4 w-4 text-blue-600 rounded"
                />
                <div>
                  <div className="font-medium text-gray-900">Mostrar Resultado Imediatamente</div>
                  <div className="text-sm text-gray-600">Exibir resultado ao finalizar</div>
                </div>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.allowReviewAnswers}
                  onChange={(e) => updateConfig({ allowReviewAnswers: e.target.checked })}
                  className="mr-3 h-4 w-4 text-blue-600 rounded"
                />
                <div>
                  <div className="font-medium text-gray-900">Permitir Revisar Respostas</div>
                  <div className="text-sm text-gray-600">Aluno pode revisar antes de finalizar</div>
                </div>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.isPublic}
                  onChange={(e) => updateConfig({ isPublic: e.target.checked })}
                  className="mr-3 h-4 w-4 text-blue-600 rounded"
                />
                <div>
                  <div className="font-medium text-gray-900">Simulado Público</div>
                  <div className="text-sm text-gray-600">Outros usuários podem acessar</div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )

  const renderStep4 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Revisar e Finalizar
      </h2>

      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-gray-900">Título</h3>
            <p className="text-gray-700">{config.title}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Categoria</h3>
            <p className="text-gray-700">
              {categories.find(c => c.value === config.category)?.label}
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Universidades</h3>
            <p className="text-gray-700">
              {config.universities.length > 0 
                ? config.universities.join(', ') 
                : 'Todas'
              }
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Matérias</h3>
            <p className="text-gray-700">
              {config.subjects.length > 0 
                ? SUBJECTS.filter(s => config.subjects.includes(s.value))
                    .map(s => s.label).join(', ')
                : 'Todas'
              }
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Questões</h3>
            <p className="text-gray-700">{config.questionsCount} questões</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Tempo</h3>
            <p className="text-gray-700">{config.timeLimit} minutos</p>
          </div>
        </div>

        {config.description && (
          <div>
            <h3 className="font-semibold text-gray-900">Descrição</h3>
            <p className="text-gray-700">{config.description}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCreate}
          disabled={isCreating || !config.title}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-4 rounded-lg font-semibold text-lg flex items-center space-x-2 shadow-lg"
        >
          {isCreating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              <span>Criando Simulado...</span>
            </>
          ) : (
            <>
              <Play size={20} />
              <span>Criar Simulado</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  )

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1()
      case 2: return renderStep2()
      case 3: return renderStep3()
      case 4: return renderStep4()
      default: return null
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1: return config.title.trim() !== '' && config.category !== undefined
      case 2: return true // Sempre pode prosseguir (permite "todas" as opções)
      case 3: return config.questionsCount > 0 && config.timeLimit > 0
      case 4: return true
      default: return false
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Voltar
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Criar Novo Simulado</h1>
          <p className="text-gray-600 mt-2">
            Configure seu simulado personalizado escolhendo universidades, matérias e configurações
          </p>
        </div>

        {renderStepIndicator()}

        <div className="bg-white rounded-lg shadow-lg p-8">
          <AnimatePresence mode="wait">
            {renderCurrentStep()}
          </AnimatePresence>

          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center px-6 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={20} className="mr-2" />
              Anterior
            </button>

            {currentStep < steps.length ? (
              <button
                onClick={nextStep}
                disabled={!canProceed()}
                className="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold"
              >
                Próximo
                <ChevronRight size={20} className="ml-2" />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateSimulationPage