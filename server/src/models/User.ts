import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'
import { University, UserRole } from '../../../shared/dist/types'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  avatar?: string
  university?: University
  course?: string
  graduationYear?: number
  role: UserRole
  level: number
  experience: number
  achievements: mongoose.Types.ObjectId[]
  statistics: {
    totalSimulations: number
    totalQuestions: number
    correctAnswers: number
    averageScore: number
    timeSpent: number
    streakDays: number
    lastSimulationDate?: Date
  }
  isEmailVerified: boolean
  emailVerificationToken?: string
  passwordResetToken?: string
  passwordResetExpires?: Date
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
  generateEmailVerificationToken(): string
  generatePasswordResetToken(): string
}

const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    maxlength: [100, 'Nome deve ter no máximo 100 caracteres']
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email deve ter um formato válido']
  },
  password: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: [8, 'Senha deve ter pelo menos 8 caracteres'],
    select: false // Por padrão não incluir a senha nas consultas
  },
  avatar: {
    type: String,
    default: null
  },
  university: {
    type: String,
    enum: Object.values(University),
    default: null
  },
  course: {
    type: String,
    trim: true,
    maxlength: [100, 'Curso deve ter no máximo 100 caracteres']
  },
  graduationYear: {
    type: Number,
    min: [new Date().getFullYear(), 'Ano de graduação deve ser no futuro'],
    max: [new Date().getFullYear() + 10, 'Ano de graduação deve ser realista']
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.STUDENT
  },
  level: {
    type: Number,
    default: 1,
    min: 1,
    max: 100
  },
  experience: {
    type: Number,
    default: 0,
    min: 0
  },
  achievements: [{
    type: Schema.Types.ObjectId,
    ref: 'Achievement'
  }],
  statistics: {
    totalSimulations: {
      type: Number,
      default: 0,
      min: 0
    },
    totalQuestions: {
      type: Number,
      default: 0,
      min: 0
    },
    correctAnswers: {
      type: Number,
      default: 0,
      min: 0
    },
    averageScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    timeSpent: {
      type: Number,
      default: 0,
      min: 0
    },
    streakDays: {
      type: Number,
      default: 0,
      min: 0
    },
    lastSimulationDate: {
      type: Date,
      default: null
    }
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Índices para performance
UserSchema.index({ university: 1 })
UserSchema.index({ 'statistics.averageScore': -1 })
UserSchema.index({ experience: -1 })

// Virtual para calcular o progresso do nível
UserSchema.virtual('levelProgress').get(function(this: IUser) {
  const baseXP = 1000
  const currentLevelXP = baseXP * Math.pow(1.5, this.level - 1)
  const nextLevelXP = baseXP * Math.pow(1.5, this.level)
  const progressXP = this.experience - currentLevelXP
  const requiredXP = nextLevelXP - currentLevelXP
  
  return {
    current: Math.max(0, progressXP),
    required: requiredXP,
    percentage: Math.min(100, Math.max(0, (progressXP / requiredXP) * 100))
  }
})

// Middleware para hash da senha antes de salvar
UserSchema.pre('save', async function(this: IUser, next) {
  // Só fazer hash se a senha foi modificada
  if (!this.isModified('password')) return next()
  
  try {
    // Hash da senha com salt rounds 12
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password as string, salt)
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Middleware para atualizar nível baseado na experiência
UserSchema.pre('save', function(this: IUser, next) {
  if (this.isModified('experience')) {
    const baseXP = 1000
    let newLevel = 1
    
    // Calcular nível baseado na experiência
    while (this.experience >= baseXP * Math.pow(1.5, newLevel - 1)) {
      newLevel++
      if (newLevel > 100) break // Nível máximo
    }
    
    this.level = Math.min(100, newLevel)
  }
  next()
})

// Método para comparar senhas
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    throw new Error('Erro ao comparar senhas')
  }
}

// Método para gerar token de verificação de email
UserSchema.methods.generateEmailVerificationToken = function(): string {
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  this.emailVerificationToken = token
  return token
}

// Método para gerar token de reset de senha
UserSchema.methods.generatePasswordResetToken = function(): string {
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  this.passwordResetToken = token
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutos
  return token
}

export default mongoose.model<IUser>('User', UserSchema)