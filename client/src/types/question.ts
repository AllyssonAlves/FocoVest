// Tipos para questões
export interface Alternative {
  letter: 'A' | 'B' | 'C' | 'D' | 'E'
  text: string
  isCorrect?: boolean // Só disponível para admins/criadores
}

export interface Question {
  _id: string
  title: string
  statement: string
  alternatives: Alternative[]
  explanation?: string // Só visível após resposta
  subject: string
  university: string
  examYear: number
  difficulty: 'easy' | 'medium' | 'hard'
  topics: string[]
  createdAt: string
  updatedAt: string
  isActive: boolean
}

export interface QuestionFilters {
  subject?: string
  university?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  topics?: string[]
  search?: string
  page?: number
  limit?: number
}

export interface QuestionsResponse {
  success: boolean
  data: Question[]
  pagination: {
    currentPage: number
    totalPages: number
    totalQuestions: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface QuestionResponse {
  success: boolean
  data: Question
}

export interface QuestionStats {
  totalQuestions: number
  bySubject: Array<{ _id: string; count: number }>
  byUniversity: Array<{ _id: string; count: number }>
  byDifficulty: Array<{ _id: string; count: number }>
}

// Constantes
export const SUBJECTS = [
  'Matemática',
  'Português', 
  'Física',
  'Química',
  'Biologia',
  'História',
  'Geografia',
  'Literatura',
  'Inglês',
  'Filosofia',
  'Sociologia',
  'Artes',
  'Educação Física'
] as const

export const UNIVERSITIES = [
  'UVA',
  'UECE', 
  'UFC',
  'URCA',
  'IFCE',
  'ENEM'
] as const

export const DIFFICULTIES = [
  { value: 'easy', label: 'Fácil' },
  { value: 'medium', label: 'Médio' },
  { value: 'hard', label: 'Difícil' }
] as const