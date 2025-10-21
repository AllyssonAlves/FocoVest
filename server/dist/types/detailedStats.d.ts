export interface UserStatistics {
    totalSimulations: number;
    totalQuestions: number;
    correctAnswers: number;
    averageScore: number;
    timeSpent: number;
    streakDays: number;
    lastSimulationDate?: string;
}
export interface BasicStats {
    totalSimulations: number;
    totalQuestions: number;
    correctAnswers: number;
    averageScore: number;
    timeSpent: number;
    streakDays: number;
    lastSimulationDate?: string;
}
export interface AdvancedStats {
    avgQuestionsPerSimulation: number;
    avgTimePerQuestion: number;
    efficiencyRate: number;
    studyFrequency: number;
    performanceTrend: 'excellent' | 'good' | 'average' | 'needs_improvement' | 'stable';
    daysSinceJoined: number;
    activeInLast7Days: boolean;
    activeInLast30Days: boolean;
}
export interface ProgressStats {
    currentLevel: number;
    experience: number;
    xpToNextLevel: number;
    completionRate: number;
    studyConsistency: number;
}
export interface Recommendations {
    suggestedStudyTime: string;
    focusAreas: string[];
    nextGoal: string;
}
export interface DetailedStats {
    basic: BasicStats;
    advanced: AdvancedStats;
    progress: ProgressStats;
    recommendations: Recommendations;
}
export interface DetailedStatsResponse {
    success: boolean;
    data?: DetailedStats;
    message?: string;
}
export interface UserForStats {
    _id: string;
    email: string;
    level?: number;
    experience?: number;
    statistics?: UserStatistics;
    createdAt: string | Date;
}
export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
    iat: number;
    exp: number;
}
//# sourceMappingURL=detailedStats.d.ts.map