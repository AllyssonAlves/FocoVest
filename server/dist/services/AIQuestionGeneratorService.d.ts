interface GeneratedQuestion {
    question: string;
    alternatives: string[];
    correctAnswer: number;
    explanation: string;
    subject: string;
    topic: string;
    difficulty: 'easy' | 'medium' | 'hard';
    university: string;
    confidence: number;
    generationMethod: 'template' | 'ai_pattern' | 'hybrid';
}
export declare class AIQuestionGeneratorService {
    private readonly UNIVERSITY_PATTERNS;
    private readonly QUESTION_TEMPLATES;
    analyzeExistingQuestions(): Promise<{
        subjectDistribution: Record<string, number>;
        difficultyDistribution: Record<string, number>;
        topicFrequency: Record<string, number>;
        averageAlternatives: number;
    }>;
    private generateFromTemplate;
    private generateAlternatives;
    generateFromAIPattern(subject: string, topic: string, difficulty: 'easy' | 'medium' | 'hard', university?: string): Promise<GeneratedQuestion>;
    private generateContextualQuestion;
    private generateSpecificQuestion;
    private generateSmartAlternatives;
    generateQuestion(subject: string, topic?: string, difficulty?: 'easy' | 'medium' | 'hard', university?: string, method?: 'template' | 'ai_pattern' | 'hybrid'): Promise<GeneratedQuestion>;
    private selectRandomDifficulty;
    private selectRandomTopic;
    private getTopicSubject;
    private hasTemplate;
    private selectTemplate;
    generateQuestionBatch(count: number, criteria?: {
        subjects?: string[];
        difficulties?: ('easy' | 'medium' | 'hard')[];
        universities?: string[];
    }): Promise<GeneratedQuestion[]>;
}
export declare const aiQuestionGenerator: AIQuestionGeneratorService;
export {};
//# sourceMappingURL=AIQuestionGeneratorService.d.ts.map