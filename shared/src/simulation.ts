import { University } from './index'

// Interfaces para questões dentro do simulado
export interface SimulationQuestion {
  questionId: string
  userAnswer?: string
  isCorrect?: boolean
  timeSpent?: number // em segundos
}

// Interface para resultados do simulado
export interface SimulationResult {
  score: number // pontuação final (0-100)
  correctAnswers: number
  totalQuestions: number
  accuracy: number // percentual de acertos
  totalTimeSpent: number // tempo total em segundos
  averageTimePerQuestion: number
  completedAt: Date
  questionsBreakdown: SimulationQuestion[]
}

// Interface para sessão atual do simulado
export interface SimulationSession {
  userId: string
  startedAt: Date
  lastActivityAt: Date
  currentQuestionIndex: number
  userAnswers: SimulationQuestion[]
  timeRemaining: number // em segundos
  isPaused: boolean
}

// Interface para configurações do simulado
export interface SimulationSettings {
  timeLimit: number // em minutos
  questionsCount: number
  randomizeQuestions: boolean
  randomizeAlternatives: boolean
  showResultsImmediately: boolean
  allowReviewAnswers: boolean
  subjects?: string[] // filtrar por matérias
  universities?: University[] // filtrar por universidades
  difficulty?: ('easy' | 'medium' | 'hard')[] // filtrar por dificuldade
}

// Interface principal do simulado
export interface Simulation {
  _id: string
  title: string
  description?: string
  createdBy: string
  
  // Configurações do simulado
  settings: SimulationSettings
  
  // Estado do simulado
  status: 'draft' | 'active' | 'completed' | 'paused'
  
  // Questões selecionadas para este simulado
  questions: string[] // IDs das questões
  
  // Dados do usuário atual (se simulado em andamento)
  currentSession?: SimulationSession
  
  // Resultados finais
  result?: SimulationResult
  
  // Metadados
  isPublic: boolean
  tags: string[]
  category: 'geral' | 'especifico' | 'revisao' | 'vestibular'
  estimatedDuration: number // em minutos
  
  // Propriedades computadas
  progress?: number // percentual de progresso (0-100)
  
  createdAt: Date
  updatedAt: Date
}

// Interface para filtros de simulados
export interface SimulationFilters {
  category?: 'geral' | 'especifico' | 'revisao' | 'vestibular'
  subjects?: string[]
  universities?: University[]
  difficulty?: ('easy' | 'medium' | 'hard')[]
  status?: 'draft' | 'active' | 'completed' | 'paused'
  isPublic?: boolean
  createdBy?: string
  page?: number
  limit?: number
  search?: string
}

// Interface para resultado paginado de simulados
export interface SimulationsResponse {
  data: Simulation[]
  pagination: {
    currentPage: number
    totalPages: number
    totalSimulations: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Interface para estatísticas de simulados
export interface SimulationStats {
  total: number
  active: number
  completed: number
  byCategory: {
    geral: number
    especifico: number
    revisao: number
    vestibular: number
  }
}

// Interface para criar novo simulado
export interface CreateSimulationData {
  title: string
  description?: string
  settings: SimulationSettings
  questions?: string[]
  isPublic?: boolean
  tags?: string[]
  category: 'geral' | 'especifico' | 'revisao' | 'vestibular'
}

// Interface para resposta da API
export interface ApiResponse<T> {
  data: T
  message?: string
  error?: string
}

// Tipos para estados do cronômetro
export type TimerStatus = 'stopped' | 'running' | 'paused' | 'finished'

// Interface para estado do cronômetro
export interface TimerState {
  timeRemaining: number // em segundos
  status: TimerStatus
  warnings: {
    halfTime: boolean
    tenMinutes: boolean
    oneMinute: boolean
  }
}

// Constantes para categorias
export const SIMULATION_CATEGORIES = [
  { value: 'geral', label: 'Geral' },
  { value: 'especifico', label: 'Específico' },
  { value: 'revisao', label: 'Revisão' },
  { value: 'vestibular', label: 'Vestibular' }
] as const

// Constantes para status
export const SIMULATION_STATUS = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'active', label: 'Ativo' },
  { value: 'completed', label: 'Concluído' },
  { value: 'paused', label: 'Pausado' }
] as const

// Constantes para dificuldades
export const SIMULATION_DIFFICULTIES = [
  { value: 'easy', label: 'Fácil' },
  { value: 'medium', label: 'Médio' },
  { value: 'hard', label: 'Difícil' }
] as const