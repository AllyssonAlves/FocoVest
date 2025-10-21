import mongoose, { Document } from 'mongoose';
import { University } from '../../../shared/dist/types';
export interface ISimulationQuestion {
    questionId: string;
    userAnswer?: string;
    isCorrect?: boolean;
    timeSpent?: number;
}
export interface ISimulationResult {
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    accuracy: number;
    totalTimeSpent: number;
    averageTimePerQuestion: number;
    completedAt: Date;
    questionsBreakdown: ISimulationQuestion[];
}
export interface ISimulation extends Document {
    title: string;
    description?: string;
    createdBy: mongoose.Types.ObjectId;
    settings: {
        timeLimit: number;
        questionsCount: number;
        randomizeQuestions: boolean;
        randomizeAlternatives: boolean;
        showResultsImmediately: boolean;
        allowReviewAnswers: boolean;
        subjects?: string[];
        universities?: University[];
        difficulty?: ('easy' | 'medium' | 'hard')[];
    };
    status: 'draft' | 'active' | 'completed' | 'paused';
    questions: string[];
    currentSession?: {
        userId: mongoose.Types.ObjectId;
        startedAt: Date;
        lastActivityAt: Date;
        currentQuestionIndex: number;
        userAnswers: ISimulationQuestion[];
        timeRemaining: number;
        isPaused: boolean;
    };
    result?: ISimulationResult;
    isPublic: boolean;
    tags: string[];
    category: 'geral' | 'especifico' | 'revisao' | 'vestibular';
    estimatedDuration: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ISimulation, {}, {}, {}, mongoose.Document<unknown, {}, ISimulation, {}, {}> & ISimulation & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Simulation.d.ts.map