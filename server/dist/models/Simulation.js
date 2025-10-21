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
const types_1 = require("../../../shared/dist/types");
const SimulationQuestionSchema = new mongoose_1.Schema({
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
}, { _id: false });
const SimulationResultSchema = new mongoose_1.Schema({
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
}, { _id: false });
const CurrentSessionSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, { _id: false });
const SimulationSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
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
                enum: Object.values(types_1.University)
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
});
SimulationSchema.index({ createdBy: 1, status: 1 });
SimulationSchema.index({ isPublic: 1, status: 1 });
SimulationSchema.index({ 'settings.subjects': 1 });
SimulationSchema.index({ 'settings.universities': 1 });
SimulationSchema.index({ category: 1 });
SimulationSchema.index({ tags: 1 });
SimulationSchema.virtual('progress').get(function () {
    if (!this.currentSession)
        return 0;
    return Math.round((this.currentSession.currentQuestionIndex / this.questions.length) * 100);
});
SimulationSchema.methods.isExpired = function () {
    if (!this.currentSession)
        return false;
    const timeElapsed = (Date.now() - this.currentSession.startedAt.getTime()) / 1000 / 60;
    return timeElapsed >= this.settings.timeLimit;
};
SimulationSchema.methods.getTimeRemaining = function () {
    if (!this.currentSession)
        return this.settings.timeLimit * 60;
    const timeElapsed = (Date.now() - this.currentSession.startedAt.getTime()) / 1000;
    const timeLimit = this.settings.timeLimit * 60;
    return Math.max(0, timeLimit - timeElapsed);
};
SimulationSchema.pre('save', function () {
    if (this.currentSession && this.isModified('currentSession')) {
        this.currentSession.lastActivityAt = new Date();
    }
});
exports.default = mongoose_1.default.model('Simulation', SimulationSchema);
//# sourceMappingURL=Simulation.js.map