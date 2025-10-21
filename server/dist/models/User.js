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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const types_1 = require("../../../shared/dist/types");
const UserSchema = new mongoose_1.Schema({
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
        select: false
    },
    avatar: {
        type: String,
        default: null
    },
    university: {
        type: String,
        enum: Object.values(types_1.University),
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
        enum: Object.values(types_1.UserRole),
        default: types_1.UserRole.STUDENT
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
            type: mongoose_1.Schema.Types.ObjectId,
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
});
UserSchema.index({ university: 1 });
UserSchema.index({ 'statistics.averageScore': -1 });
UserSchema.index({ experience: -1 });
UserSchema.virtual('levelProgress').get(function () {
    const baseXP = 1000;
    const currentLevelXP = baseXP * Math.pow(1.5, this.level - 1);
    const nextLevelXP = baseXP * Math.pow(1.5, this.level);
    const progressXP = this.experience - currentLevelXP;
    const requiredXP = nextLevelXP - currentLevelXP;
    return {
        current: Math.max(0, progressXP),
        required: requiredXP,
        percentage: Math.min(100, Math.max(0, (progressXP / requiredXP) * 100))
    };
});
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    try {
        const salt = await bcryptjs_1.default.genSalt(12);
        this.password = await bcryptjs_1.default.hash(this.password, salt);
        next();
    }
    catch (error) {
        next(error);
    }
});
UserSchema.pre('save', function (next) {
    if (this.isModified('experience')) {
        const baseXP = 1000;
        let newLevel = 1;
        while (this.experience >= baseXP * Math.pow(1.5, newLevel - 1)) {
            newLevel++;
            if (newLevel > 100)
                break;
        }
        this.level = Math.min(100, newLevel);
    }
    next();
});
UserSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcryptjs_1.default.compare(candidatePassword, this.password);
    }
    catch (error) {
        throw new Error('Erro ao comparar senhas');
    }
};
UserSchema.methods.generateEmailVerificationToken = function () {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    this.emailVerificationToken = token;
    return token;
};
UserSchema.methods.generatePasswordResetToken = function () {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    this.passwordResetToken = token;
    this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
    return token;
};
exports.default = mongoose_1.default.model('User', UserSchema);
//# sourceMappingURL=User.js.map