interface ErrorPattern {
    subject: string;
    topic: string;
    frequency: number;
    lastOccurrence: Date;
    difficulty: 'easy' | 'medium' | 'hard';
    similarQuestions: string[];
}
interface StudyPattern {
    userId: string;
    preferredTimeSlots: number[];
    averageSessionDuration: number;
    mostProductiveHours: number[];
    consistencyScore: number;
    weeklyPattern: number[];
}
interface SubjectAnalysis {
    subject: string;
    performance: number;
    improvement: number;
    weakPoints: string[];
    strongPoints: string[];
    priority: 'high' | 'medium' | 'low';
    recommendedStudyTime: number;
}
interface AIRecommendation {
    type: 'study_schedule' | 'subject_focus' | 'question_practice' | 'review_material';
    priority: 'urgent' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    actionItems: string[];
    estimatedTime: number;
    expectedImprovement: number;
    reasoning: string;
}
interface StudyScheduleRecommendation {
    optimalStudyTimes: Array<{
        hour: number;
        duration: number;
        subjects: string[];
        effectiveness: number;
    }>;
    weeklyPlan: Array<{
        day: string;
        sessions: Array<{
            time: string;
            subject: string;
            duration: number;
            type: 'practice' | 'review' | 'new_content';
        }>;
    }>;
    adaptiveBreaks: Array<{
        duration: number;
        frequency: number;
        type: 'short' | 'medium' | 'long';
    }>;
}
export declare class AIRecommendationService {
    private readonly LEARNING_PATTERNS_CACHE;
    private readonly ERROR_PATTERNS_CACHE;
    analyzeErrorPatterns(userId: string): Promise<ErrorPattern[]>;
    analyzeStudyPatterns(userId: string): Promise<StudyPattern>;
    analyzeSubjectPerformance(userId: string): Promise<SubjectAnalysis[]>;
    generateRecommendations(userId: string): Promise<AIRecommendation[]>;
    generateStudySchedule(userId: string): Promise<StudyScheduleRecommendation>;
    predictPerformance(userId: string, timeframe: 'week' | 'month' | 'semester'): Promise<{
        expectedImprovement: number;
        confidenceLevel: number;
        criticalFactors: string[];
        recommendations: string[];
    }>;
    clearCache(): void;
}
export declare const aiRecommendationService: AIRecommendationService;
export {};
//# sourceMappingURL=AIRecommendationService.d.ts.map