import mongoose, { Schema, Document } from 'mongoose'

export interface IAlternative {
  letter: 'A' | 'B' | 'C' | 'D' | 'E'
  text: string
  isCorrect: boolean
}

export interface IQuestion extends Document {
  title: string
  statement: string
  alternatives: IAlternative[]
  explanation: string
  subject: string
  university: string
  examYear: number
  difficulty: 'easy' | 'medium' | 'hard'
  topics: string[]
  createdAt: Date
  updatedAt: Date
  createdBy: mongoose.Types.ObjectId
  isActive: boolean
}

const AlternativeSchema = new Schema<IAlternative>({
  letter: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'E'],
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  isCorrect: {
    type: Boolean,
    required: true,
    default: false
  }
})

const QuestionSchema = new Schema<IQuestion>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  statement: {
    type: String,
    required: true,
    trim: true
  },
  alternatives: {
    type: [AlternativeSchema],
    required: true,
    validate: {
      validator: function(alternatives: IAlternative[]) {
        // Deve ter entre 2 e 5 alternativas
        if (alternatives.length < 2 || alternatives.length > 5) {
          return false
        }
        
        // Deve ter exatamente uma alternativa correta
        const correctCount = alternatives.filter(alt => alt.isCorrect).length
        return correctCount === 1
      },
      message: 'Deve ter entre 2-5 alternativas com exatamente uma correta'
    }
  },
  explanation: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    enum: [
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
    ]
  },
  university: {
    type: String,
    required: true,
    enum: ['UVA', 'UECE', 'UFC', 'URCA', 'IFCE', 'ENEM']
  },
  examYear: {
    type: Number,
    required: true,
    min: 2000,
    max: new Date().getFullYear()
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  topics: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Índices para otimizar buscas
QuestionSchema.index({ subject: 1, university: 1 })
QuestionSchema.index({ difficulty: 1 })
QuestionSchema.index({ examYear: -1 })
QuestionSchema.index({ topics: 1 })
QuestionSchema.index({ createdAt: -1 })

export default mongoose.model<IQuestion>('Question', QuestionSchema)