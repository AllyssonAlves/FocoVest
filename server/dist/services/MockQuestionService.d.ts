import { IQuestion } from '../models/Question';
export interface QuestionFilters {
    subject?: string;
    university?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    topics?: string[];
    search?: string;
    page?: number;
    limit?: number;
}
export interface QuestionResult {
    questions: IQuestion[];
    currentPage: number;
    totalPages: number;
    totalQuestions: number;
    hasNext: boolean;
    hasPrev: boolean;
}
declare class MockQuestionService {
    private questions;
    private nextId;
    constructor();
    private initializeMockData;
    private generateId;
    getQuestions(filters?: QuestionFilters): Promise<QuestionResult>;
    getQuestionById(id: string): Promise<IQuestion | null>;
    createQuestion(questionData: Partial<IQuestion>): Promise<IQuestion>;
    updateQuestion(id: string, updates: Partial<IQuestion>, userId: string): Promise<IQuestion | null>;
    deleteQuestion(id: string, userId: string): Promise<boolean>;
    getQuestionStats(): Promise<any>;
}
export declare const mockQuestionService: MockQuestionService;
export {};
//# sourceMappingURL=MockQuestionService.d.ts.map