import mongoose, { Document, Schema } from 'mongoose'
import { University } from '../../../shared/dist/types'

export interface ISimulationQuestion {
  questionId: string
  userAnswer?: string
  isCorrect?: boolean
  timeSpent?: number // em segundos
}

export interface ISimulationResult {
  score: number // pontuação final (0-100)
  correctAnswers: number
  totalQuestions: number
  accuracy: number // percentual de acertos
  totalTimeSpent: number // tempo total em segundos
  averageTimePerQuestion: number
  completedAt: Date
  questionsBreakdown: ISimulationQuestion[]
}

export interface ISimulation extends Document {
  title: string
  description?: string
  createdBy: mongoose.Types.ObjectId
  
  // Configurações do simulado
  settings: {
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
  
  // Estado do simulado
  status: 'draft' | 'active' | 'completed' | 'paused'
  
  // Questões selecionadas para este simulado
  questions: string[] // IDs das questões
  
  // Dados do usuário atual (se simulado em andamento)
  currentSession?: {
    userId: mongoose.Types.ObjectId
    startedAt: Date
    lastActivityAt: Date
    currentQuestionIndex: number
    userAnswers: ISimulationQuestion[]
    timeRemaining: number // em segundos
    isPaused: boolean
  }
  
  // Resultados finais
  result?: ISimulationResult
  
  // Metadados
  isPublic: boolean
  tags: string[]
  category: 'geral' | 'especifico' | 'revisao' | 'vestibular'
  estimatedDuration: number // em minutos
  
  createdAt: Date
  updatedAt: Date
}

const SimulationQuestionSchema = new Schema({
  questionId: {
    type: String,
    required: true
  },
  userAnswer: {
    type: String
  },
  isCorrect: {
    type: Boolean
  },
  timeSpent: {
    type: Number,
    min: 0
  }
}, { _id: false })

const SimulationResultSchema = new Schema({
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  correctAnswers: {
    type: Number,
    required: true,
    min: 0
  },
  totalQuestions: {
    type: Number,
    required: true,
    min: 1
  },
  accuracy: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  totalTimeSpent: {
    type: Number,
    required: true,
    min: 0
  },
  averageTimePerQuestion: {
    type: Number,
    required: true,
    min: 0
  },
  completedAt: {
    type: Date,
    required: true
  },
  questionsBreakdown: [SimulationQuestionSchema]
}, { _id: false })

const CurrentSessionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startedAt: {
    type: Date,
    required: true
  },
  lastActivityAt: {
    type: Date,
    required: true
  },
  currentQuestionIndex: {
    type: Number,
    required: true,
    min: 0
  },
  userAnswers: [SimulationQuestionSchema],
  timeRemaining: {
    type: Number,
    required: true,
    min: 0
  },
  isPaused: {
    type: Boolean,
    default: false
  }
}, { _id: false })

const SimulationSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'Título é obrigatório'],
    trim: true,
    maxlength: [200, 'Título deve ter no máximo 200 caracteres']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Descrição deve ter no máximo 1000 caracteres']
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  settings: {
    timeLimit: {
      type: Number,
      required: true,
      min: [5, 'Tempo mínimo é 5 minutos'],
      max: [300, 'Tempo máximo é 300 minutos']
    },
    questionsCount: {
      type: Number,
      required: true,
      min: [1, 'Mínimo 1 questão'],
      max: [100, 'Máximo 100 questões']
    },
    randomizeQuestions: {
      type: Boolean,
      default: true
    },
    randomizeAlternatives: {
      type: Boolean,
      default: false
    },
    showResultsImmediately: {
      type: Boolean,
      default: true
    },
    allowReviewAnswers: {
      type: Boolean,
      default: true
    },
    subjects: [{
      type: String,
      enum: ['Matemática', 'Português', 'Física', 'Química', 'Biologia', 'História', 'Geografia']
    }],
    universities: [{
      type: String,
      enum: Object.values(University)
    }],
    difficulty: [{
      type: String,
      enum: ['easy', 'medium', 'hard']
    }]
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'paused'],
    default: 'draft'
  },
  questions: [{
    type: String,
    required: true
  }],
  currentSession: CurrentSessionSchema,
  result: SimulationResultSchema,
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    enum: ['geral', 'especifico', 'revisao', 'vestibular'],
    default: 'geral'
  },
  estimatedDuration: {
    type: Number,
    min: 1
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Índices para performance
SimulationSchema.index({ createdBy: 1, status: 1 })
SimulationSchema.index({ isPublic: 1, status: 1 })
SimulationSchema.index({ 'settings.subjects': 1 })
SimulationSchema.index({ 'settings.universities': 1 })
SimulationSchema.index({ category: 1 })
SimulationSchema.index({ tags: 1 })

// Virtual para calcular progresso
SimulationSchema.virtual('progress').get(function(this: ISimulation) {
  if (!this.currentSession) return 0
  return Math.round((this.currentSession.currentQuestionIndex / this.questions.length) * 100)
})

// Método para verificar se simulado expirou
SimulationSchema.methods.isExpired = function(this: ISimulation): boolean {
  if (!this.currentSession) return false
  const timeElapsed = (Date.now() - this.currentSession.startedAt.getTime()) / 1000 / 60 // em minutos
  return timeElapsed >= this.settings.timeLimit
}

// Método para calcular tempo restante
SimulationSchema.methods.getTimeRemaining = function(this: ISimulation): number {
  if (!this.currentSession) return this.settings.timeLimit * 60
  const timeElapsed = (Date.now() - this.currentSession.startedAt.getTime()) / 1000 // em segundos
  const timeLimit = this.settings.timeLimit * 60 // converter para segundos
  return Math.max(0, timeLimit - timeElapsed)
}

// Middleware para atualizar lastActivityAt
SimulationSchema.pre('save', function(this: ISimulation) {
  if (this.currentSession && this.isModified('currentSession')) {
    this.currentSession.lastActivityAt = new Date()
  }
})

export default mongoose.model<ISimulation>('Simulation', SimulationSchema)