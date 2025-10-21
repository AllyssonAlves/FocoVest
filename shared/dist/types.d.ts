export interface User {
    _id: string;
    name: string;
    email: string;
    password?: string;
    avatar?: string;
    university?: University;
    course?: string;
    graduationYear?: number;
    level: number;
    experience: number;
    achievements: Achievement[];
    statistics: UserStatistics;
    createdAt: Date;
    updatedAt: Date;
}
export interface UserStatistics {
    totalSimulations: number;
    totalQuestions: number;
    correctAnswers: number;
    averageScore: number;
    timeSpent: number;
    streak: number;
    bestScore: number;
    subjectStats: SubjectStatistics[];
}
export interface SubjectStatistics {
    subject: Subject;
    totalQuestions: number;
    correctAnswers: number;
    accuracy: number;
    averageTime: number;
}
export interface Question {
    _id: string;
    text: string;
    options: QuestionOption[];
    correctAnswer: string;
    explanation?: string;
    subject: Subject;
    topic: string;
    difficulty: Difficulty;
    university: University;
    year: number;
    source?: string;
    images?: string[];
    createdBy?: string;
    tags?: string[];
    statistics: QuestionStatistics;
    createdAt: Date;
    updatedAt: Date;
}
export interface QuestionOption {
    id: string;
    text: string;
    isCorrect?: boolean;
}
export interface QuestionStatistics {
    totalAttempts: number;
    correctAttempts: number;
    accuracy: number;
    averageTime: number;
}
export interface Simulation {
    _id: string;
    title: string;
    description?: string;
    type: SimulationType;
    questions: Question[];
    duration: number;
    totalQuestions: number;
    university?: University;
    subject?: Subject;
    difficulty?: Difficulty;
    isActive: boolean;
    createdBy?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface SimulationAttempt {
    _id: string;
    user: string;
    simulation: string;
    answers: UserAnswer[];
    startTime: Date;
    endTime?: Date;
    duration: number;
    score: number;
    accuracy: number;
    isCompleted: boolean;
    timeSpent: number[];
    createdAt: Date;
}
export interface UserAnswer {
    questionId: string;
    selectedOption: string;
    isCorrect: boolean;
    timeSpent: number;
    markedForReview?: boolean;
}
export interface Ranking {
    _id: string;
    user: User;
    score: number;
    position: number;
    university?: University;
    subject?: Subject;
    period: RankingPeriod;
    achievements: Achievement[];
}
export interface Achievement {
    _id: string;
    name: string;
    description: string;
    icon: string;
    points: number;
    category: AchievementCategory;
    requirements: string[];
    unlockedAt?: Date;
}
export declare enum University {
    UVA = "UVA",
    UECE = "UECE",
    UFC = "UFC",
    URCA = "URCA",
    IFCE = "IFCE",
    ENEM = "ENEM"
}
export declare enum UserRole {
    STUDENT = "STUDENT",
    ADMIN = "ADMIN",
    MODERATOR = "MODERATOR"
}
export declare enum Subject {
    MATHEMATICS = "MATHEMATICS",
    PORTUGUESE = "PORTUGUESE",
    LITERATURE = "LITERATURE",
    PHYSICS = "PHYSICS",
    CHEMISTRY = "CHEMISTRY",
    BIOLOGY = "BIOLOGY",
    HISTORY = "HISTORY",
    GEOGRAPHY = "GEOGRAPHY",
    PHILOSOPHY = "PHILOSOPHY",
    SOCIOLOGY = "SOCIOLOGY",
    ENGLISH = "ENGLISH",
    SPANISH = "SPANISH",
    ARTS = "ARTS",
    PHYSICAL_EDUCATION = "PHYSICAL_EDUCATION"
}
export declare enum Difficulty {
    EASY = "EASY",
    MEDIUM = "MEDIUM",
    HARD = "HARD",
    EXPERT = "EXPERT"
}
export declare enum SimulationType {
    GENERAL = "GENERAL",
    SUBJECT_SPECIFIC = "SUBJECT_SPECIFIC",
    UNIVERSITY_SPECIFIC = "UNIVERSITY_SPECIFIC",
    CUSTOM = "CUSTOM",
    ADAPTIVE = "ADAPTIVE"
}
export declare enum RankingPeriod {
    DAILY = "DAILY",
    WEEKLY = "WEEKLY",
    MONTHLY = "MONTHLY",
    ALL_TIME = "ALL_TIME"
}
export declare enum AchievementCategory {
    SIMULATION = "SIMULATION",
    ACCURACY = "ACCURACY",
    STREAK = "STREAK",
    TIME = "TIME",
    SOCIAL = "SOCIAL",
    SPECIAL = "SPECIAL"
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    university?: University;
    course?: string;
    graduationYear?: number;
}
export interface AuthResponse {
    user: Omit<User, 'password'>;
    token: string;
    refreshToken: string;
}
export type CreateUserRequest = Omit<User, '_id' | 'createdAt' | 'updatedAt' | 'statistics' | 'achievements'>;
export type UpdateUserRequest = Partial<Pick<User, 'name' | 'avatar' | 'university' | 'course' | 'graduationYear'>>;
export type CreateQuestionRequest = Omit<Question, '_id' | 'createdAt' | 'updatedAt' | 'statistics'>;
export type UpdateQuestionRequest = Partial<CreateQuestionRequest>;
export type CreateSimulationRequest = Omit<Simulation, '_id' | 'createdAt' | 'updatedAt' | 'questions'> & {
    questionIds?: string[];
};
export interface ValidationError {
    field: string;
    message: string;
}
//# sourceMappingURL=types.d.ts.map