import mongoose, { Document, Schema } from 'mongoose';

export interface IAlternativa {
  letra: string;
  texto: string;
  correta: boolean;
}

export interface IEstatisticas {
  totalResolucoes: number;
  totalAcertos: number;
  tempoMedioResposta: number;
}

export interface IQuestao extends Document {
  universidade: 'UVA' | 'UECE' | 'UFC' | 'URCA' | 'IFCE';
  materia: string;
  assunto: string;
  enunciado: string;
  alternativas: IAlternativa[];
  tipo: 'multipla_escolha' | 'verdadeiro_falso' | 'dissertativa';
  dificuldade: 'facil' | 'medio' | 'dificil';
  ano?: number;
  fonte?: string;
  explicacao?: string;
  tags?: string[];
  
  // Sistema de verificação
  verificada: boolean;
  verificadoPor?: mongoose.Types.ObjectId;
  verificadoEm?: Date;
  
  // Metadados de criação
  criadoPor?: mongoose.Types.ObjectId;
  iaGerada: boolean;
  questaoReferencia?: mongoose.Types.ObjectId;
  promptUtilizado?: string;
  
  // Estatísticas de uso
  estatisticas: IEstatisticas;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Virtuals
  taxaAcerto: number;
  dificuldadeReal: string;
}

const AlternativaSchema = new Schema<IAlternativa>({
  letra: {
    type: String,
    required: true,
    enum: ['A', 'B', 'C', 'D', 'E']
  },
  texto: {
    type: String,
    required: true,
    trim: true
  },
  correta: {
    type: Boolean,
    required: true,
    default: false
  }
});

const EstatisticasSchema = new Schema<IEstatisticas>({
  totalResolucoes: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAcertos: {
    type: Number,
    default: 0,
    min: 0
  },
  tempoMedioResposta: {
    type: Number,
    default: 0,
    min: 0
  }
}, { _id: false });

const QuestaoSchema = new Schema<IQuestao>({
  universidade: {
    type: String,
    required: true,
    enum: ['UVA', 'UECE', 'UFC', 'URCA', 'IFCE'],
    index: true
  },
  
  materia: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  
  assunto: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  
  enunciado: {
    type: String,
    required: true,
    trim: true
  },
  
  alternativas: {
    type: [AlternativaSchema],
    required: true,
    validate: {
      validator: function(alternativas: IAlternativa[]) {
        // Verificar se tem entre 2 e 5 alternativas
        if (alternativas.length < 2 || alternativas.length > 5) {
          return false;
        }
        
        // Verificar se tem exatamente uma alternativa correta
        const corretas = alternativas.filter(alt => alt.correta);
        return corretas.length === 1;
      },
      message: 'Deve ter entre 2 e 5 alternativas com exatamente uma correta'
    }
  },
  
  tipo: {
    type: String,
    required: true,
    enum: ['multipla_escolha', 'verdadeiro_falso', 'dissertativa'],
    default: 'multipla_escolha'
  },
  
  dificuldade: {
    type: String,
    required: true,
    enum: ['facil', 'medio', 'dificil'],
    index: true
  },
  
  ano: {
    type: Number,
    min: 1990,
    max: new Date().getFullYear(),
    index: true
  },
  
  fonte: {
    type: String,
    trim: true
  },
  
  explicacao: {
    type: String,
    trim: true
  },
  
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Sistema de verificação
  verificada: {
    type: Boolean,
    default: false,
    index: true
  },
  
  verificadoPor: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  
  verificadoEm: {
    type: Date
  },
  
  // Metadados de criação
  criadoPor: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  
  iaGerada: {
    type: Boolean,
    default: false,
    index: true
  },
  
  questaoReferencia: {
    type: Schema.Types.ObjectId,
    ref: 'Questao'
  },
  
  promptUtilizado: {
    type: String,
    trim: true
  },
  
  // Estatísticas de uso
  estatisticas: {
    type: EstatisticasSchema,
    default: () => ({
      totalResolucoes: 0,
      totalAcertos: 0,
      tempoMedioResposta: 0
    })
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices compostos para melhor performance
QuestaoSchema.index({ universidade: 1, materia: 1 });
QuestaoSchema.index({ universidade: 1, dificuldade: 1 });
QuestaoSchema.index({ materia: 1, assunto: 1 });
QuestaoSchema.index({ verificada: 1, universidade: 1 });
QuestaoSchema.index({ iaGerada: 1, verificada: 1 });

// Índice de texto para busca
QuestaoSchema.index({
  enunciado: 'text',
  'alternativas.texto': 'text',
  assunto: 'text',
  tags: 'text'
});

// Virtual para taxa de acerto
QuestaoSchema.virtual('taxaAcerto').get(function(this: IQuestao) {
  if (this.estatisticas.totalResolucoes === 0) return 0;
  return (this.estatisticas.totalAcertos / this.estatisticas.totalResolucoes) * 100;
});

// Virtual para nível de dificuldade baseado na taxa de acerto
QuestaoSchema.virtual('dificuldadeReal').get(function(this: any) {
  const totalResolucoes = this.estatisticas?.totalResolucoes || 0;
  if (totalResolucoes === 0) return 'medio';
  
  const taxa = (this.estatisticas.totalAcertos / totalResolucoes) * 100;
  if (taxa >= 70) return 'facil';
  if (taxa >= 40) return 'medio';
  return 'dificil';
});

// Middleware para validação antes de salvar
QuestaoSchema.pre('save', function(this: IQuestao, next) {
  // Garantir que apenas uma alternativa seja marcada como correta
  const alternativasCorretas = this.alternativas.filter(alt => alt.correta);
  
  if (alternativasCorretas.length !== 1) {
    next(new Error('Deve haver exatamente uma alternativa correta'));
    return;
  }
  
  // Garantir que as letras das alternativas estejam em ordem
  const letras = ['A', 'B', 'C', 'D', 'E'];
  this.alternativas.forEach((alt, index) => {
    alt.letra = letras[index];
  });
  
  next();
});

// Método estático para buscar questões para simulado
QuestaoSchema.statics.buscarParaSimulado = function(
  filtros: any,
  quantidade: number
) {
  return this.aggregate([
    { 
      $match: { 
        ...filtros, 
        verificada: true 
      } 
    },
    { $sample: { size: quantidade } }
  ]);
};

// Método estático para obter estatísticas
QuestaoSchema.statics.obterEstatisticasGerais = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalQuestoes: { $sum: 1 },
        questoesVerificadas: {
          $sum: { $cond: [{ $eq: ['$verificada', true] }, 1, 0] }
        },
        questoesIA: {
          $sum: { $cond: [{ $eq: ['$iaGerada', true] }, 1, 0] }
        },
        porUniversidade: {
          $push: {
            k: '$universidade',
            v: 1
          }
        },
        porMateria: {
          $push: {
            k: '$materia',
            v: 1
          }
        },
        porDificuldade: {
          $push: {
            k: '$dificuldade',
            v: 1
          }
        }
      }
    },
    {
      $project: {
        totalQuestoes: 1,
        questoesVerificadas: 1,
        questoesIA: 1,
        porUniversidade: { $arrayToObject: '$porUniversidade' },
        porMateria: { $arrayToObject: '$porMateria' },
        porDificuldade: { $arrayToObject: '$porDificuldade' }
      }
    }
  ]);
};

export default mongoose.model<IQuestao>('Questao', QuestaoSchema);