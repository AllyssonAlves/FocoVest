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
const AlternativeSchema = new mongoose_1.Schema({
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
});
const QuestionSchema = new mongoose_1.Schema({
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
            validator: function (alternatives) {
                if (alternatives.length < 2 || alternatives.length > 5) {
                    return false;
                }
                const correctCount = alternatives.filter(alt => alt.isCorrect).length;
                return correctCount === 1;
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});
QuestionSchema.index({ subject: 1, university: 1 });
QuestionSchema.index({ difficulty: 1 });
QuestionSchema.index({ examYear: -1 });
QuestionSchema.index({ topics: 1 });
QuestionSchema.index({ createdAt: -1 });
exports.default = mongoose_1.default.model('Question', QuestionSchema);
//# sourceMappingURL=Question.js.map