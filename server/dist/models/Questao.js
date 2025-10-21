"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const AlternativaSchema = new mongoose_1.Schema({
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
const EstatisticasSchema = new mongoose_1.Schema({
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
const QuestaoSchema = new mongoose_1.Schema({
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
            validator: function (alternativas) {
                if (alternativas.length < 2 || alternativas.length > 5) {
                    return false;
                }
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
    verificada: {
        type: Boolean,
        default: false,
        index: true
    },
    verificadoPor: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    verificadoEm: {
        type: Date
    },
    criadoPor: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    iaGerada: {
        type: Boolean,
        default: false,
        index: true
    },
    questaoReferencia: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Questao'
    },
    promptUtilizado: {
        type: String,
        trim: true
    },
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
QuestaoSchema.index({ universidade: 1, materia: 1 });
QuestaoSchema.index({ universidade: 1, dificuldade: 1 });
QuestaoSchema.index({ materia: 1, assunto: 1 });
QuestaoSchema.index({ verificada: 1, universidade: 1 });
QuestaoSchema.index({ iaGerada: 1, verificada: 1 });
QuestaoSchema.index({
    enunciado: 'text',
    'alternativas.texto': 'text',
    assunto: 'text',
    tags: 'text'
});
QuestaoSchema.virtual('taxaAcerto').get(function () {
    if (this.estatisticas.totalResolucoes === 0)
        return 0;
    return (this.estatisticas.totalAcertos / this.estatisticas.totalResolucoes) * 100;
});
QuestaoSchema.virtual('dificuldadeReal').get(function () {
    const totalResolucoes = this.estatisticas?.totalResolucoes || 0;
    if (totalResolucoes === 0)
        return 'medio';
    const taxa = (this.estatisticas.totalAcertos / totalResolucoes) * 100;
    if (taxa >= 70)
        return 'facil';
    if (taxa >= 40)
        return 'medio';
    return 'dificil';
});
QuestaoSchema.pre('save', function (next) {
    const alternativasCorretas = this.alternativas.filter(alt => alt.correta);
    if (alternativasCorretas.length !== 1) {
        next(new Error('Deve haver exatamente uma alternativa correta'));
        return;
    }
    const letras = ['A', 'B', 'C', 'D', 'E'];
    this.alternativas.forEach((alt, index) => {
        alt.letra = letras[index];
    });
    next();
});
QuestaoSchema.statics.buscarParaSimulado = function (filtros, quantidade) {
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
QuestaoSchema.statics.obterEstatisticasGerais = function () {
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
exports.default = mongoose_1.default.model('Questao', QuestaoSchema);
//# sourceMappingURL=Questao.js.map