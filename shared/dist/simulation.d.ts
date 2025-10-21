import { University } from './index';
export interface SimulationQuestion {
    questionId: string;
    userAnswer?: string;
    isCorrect?: boolean;
    timeSpent?: number;
}
export interface SimulationResult {
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    accuracy: number;
    totalTimeSpent: number;
    averageTimePerQuestion: number;
    completedAt: Date;
    questionsBreakdown: SimulationQuestion[];
}
export interface SimulationSession {
    userId: string;
    startedAt: Date;
    lastActivityAt: Date;
    currentQuestionIndex: number;
    userAnswers: SimulationQuestion[];
    timeRemaining: number;
    isPaused: boolean;
}
export interface SimulationSettings {
    timeLimit: number;
    questionsCount: number;
    randomizeQuestions: boolean;
    randomizeAlternatives: boolean;
    showResultsImmediately: boolean;
    allowReviewAnswers: boolean;
    subjects?: string[];
    universities?: University[];
    difficulty?: ('easy' | 'medium' | 'hard')[];
}
export interface Simulation {
    _id: string;
    title: string;
    description?: string;
    createdBy: string;
    settings: SimulationSettings;
    status: 'draft' | 'active' | 'completed' | 'paused';
    questions: string[];
    currentSession?: SimulationSession;
    result?: SimulationResult;
    isPublic: boolean;
    tags: string[];
    category: 'geral' | 'especifico' | 'revisao' | 'vestibular';
    estimatedDuration: number;
    progress?: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface SimulationFilters {
    category?: 'geral' | 'especifico' | 'revisao' | 'vestibular';
    subjects?: string[];
    universities?: University[];
    difficulty?: ('easy' | 'medium' | 'hard')[];
    status?: 'draft' | 'active' | 'completed' | 'paused';
    isPublic?: boolean;
    createdBy?: string;
    page?: number;
    limit?: number;
    search?: string;
}
export interface SimulationsResponse {
    data: Simulation[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalSimulations: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
export interface SimulationStats {
    total: number;
    active: number;
    completed: number;
    byCategory: {
        geral: number;
        especifico: number;
        revisao: number;
        vestibular: number;
    };
}
export interface CreateSimulationData {
    title: string;
    description?: string;
    settings: SimulationSettings;
    questions?: string[];
    isPublic?: boolean;
    tags?: string[];
    category: 'geral' | 'especifico' | 'revisao' | 'vestibular';
}
export interface ApiResponse<T> {
    data: T;
    message?: string;
    error?: string;
}
export type TimerStatus = 'stopped' | 'running' | 'paused' | 'finished';
export interface TimerState {
    timeRemaining: number;
    status: TimerStatus;
    warnings: {
        halfTime: boolean;
        tenMinutes: boolean;
        oneMinute: boolean;
    };
}
export declare const SIMULATION_CATEGORIES: readonly [{
    readonly value: "geral";
    readonly label: "Geral";
}, {
    readonly value: "especifico";
    readonly label: "Específico";
}, {
    readonly value: "revisao";
    readonly label: "Revisão";
}, {
    readonly value: "vestibular";
    readonly label: "Vestibular";
}];
export declare const SIMULATION_STATUS: readonly [{
    readonly value: "draft";
    readonly label: "Rascunho";
}, {
    readonly value: "active";
    readonly label: "Ativo";
}, {
    readonly value: "completed";
    readonly label: "Concluído";
}, {
    readonly value: "paused";
    readonly label: "Pausado";
}];
export declare const SIMULATION_DIFFICULTIES: readonly [{
    readonly value: "easy";
    readonly label: "Fácil";
}, {
    readonly value: "medium";
    readonly label: "Médio";
}, {
    readonly value: "hard";
    readonly label: "Difícil";
}];
//# sourceMappingURL=simulation.d.ts.map