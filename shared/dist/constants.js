import { University, Subject, Difficulty } from './types';
export const APP_NAME = 'FocoVest';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Plataforma de simulados para vestibulares';
export const UNIVERSITIES = [
    { value: University.UFC, label: 'Universidade Federal do Ceará' },
    { value: University.UECE, label: 'Universidade Estadual do Ceará' },
    { value: University.UVA, label: 'Universidade Estadual Vale do Acaraú' },
    { value: University.URCA, label: 'Universidade Regional do Cariri' },
    { value: University.IFCE, label: 'Instituto Federal do Ceará' },
    { value: 'ENEM', label: 'Exame Nacional do Ensino Médio (ENEM)' }
];
export const SUBJECTS = [
    { value: Subject.MATHEMATICS, label: 'Matemática' },
    { value: Subject.PORTUGUESE, label: 'Português' },
    { value: Subject.LITERATURE, label: 'Literatura' },
    { value: Subject.PHYSICS, label: 'Física' },
    { value: Subject.CHEMISTRY, label: 'Química' },
    { value: Subject.BIOLOGY, label: 'Biologia' },
    { value: Subject.HISTORY, label: 'História' },
    { value: Subject.GEOGRAPHY, label: 'Geografia' },
    { value: Subject.PHILOSOPHY, label: 'Filosofia' },
    { value: Subject.SOCIOLOGY, label: 'Sociologia' },
    { value: Subject.ENGLISH, label: 'Inglês' },
    { value: Subject.SPANISH, label: 'Espanhol' },
    { value: Subject.ARTS, label: 'Artes' },
    { value: Subject.PHYSICAL_EDUCATION, label: 'Educação Física' }
];
export const UNIVERSITY_NAMES = {
    [University.UVA]: 'Universidade Estadual Vale do Acaraú',
    [University.UECE]: 'Universidade Estadual do Ceará',
    [University.UFC]: 'Universidade Federal do Ceará',
    [University.URCA]: 'Universidade Regional do Cariri',
    [University.IFCE]: 'Instituto Federal do Ceará',
    [University.ENEM]: 'Exame Nacional do Ensino Médio (ENEM)'
};
export const SUBJECT_NAMES = {
    [Subject.MATHEMATICS]: 'Matemática',
    [Subject.PORTUGUESE]: 'Português',
    [Subject.LITERATURE]: 'Literatura',
    [Subject.PHYSICS]: 'Física',
    [Subject.CHEMISTRY]: 'Química',
    [Subject.BIOLOGY]: 'Biologia',
    [Subject.HISTORY]: 'História',
    [Subject.GEOGRAPHY]: 'Geografia',
    [Subject.PHILOSOPHY]: 'Filosofia',
    [Subject.SOCIOLOGY]: 'Sociologia',
    [Subject.ENGLISH]: 'Inglês',
    [Subject.SPANISH]: 'Espanhol',
    [Subject.ARTS]: 'Artes',
    [Subject.PHYSICAL_EDUCATION]: 'Educação Física'
};
export const DIFFICULTY_NAMES = {
    [Difficulty.EASY]: 'Fácil',
    [Difficulty.MEDIUM]: 'Médio',
    [Difficulty.HARD]: 'Difícil',
    [Difficulty.EXPERT]: 'Expert'
};
export const DIFFICULTY_COLORS = {
    [Difficulty.EASY]: '#22c55e',
    [Difficulty.MEDIUM]: '#f59e0b',
    [Difficulty.HARD]: '#ef4444',
    [Difficulty.EXPERT]: '#8b5cf6'
};
export const SUBJECT_COLORS = {
    [Subject.MATHEMATICS]: '#3b82f6',
    [Subject.PORTUGUESE]: '#ef4444',
    [Subject.LITERATURE]: '#8b5cf6',
    [Subject.PHYSICS]: '#06b6d4',
    [Subject.CHEMISTRY]: '#10b981',
    [Subject.BIOLOGY]: '#22c55e',
    [Subject.HISTORY]: '#f59e0b',
    [Subject.GEOGRAPHY]: '#84cc16',
    [Subject.PHILOSOPHY]: '#6366f1',
    [Subject.SOCIOLOGY]: '#ec4899',
    [Subject.ENGLISH]: '#14b8a6',
    [Subject.SPANISH]: '#f97316',
    [Subject.ARTS]: '#a855f7',
    [Subject.PHYSICAL_EDUCATION]: '#059669'
};
export const SIMULATION_SETTINGS = {
    MIN_QUESTIONS: 5,
    MAX_QUESTIONS: 100,
    DEFAULT_QUESTIONS: 20,
    MIN_DURATION: 5,
    MAX_DURATION: 300,
    DEFAULT_DURATION: 60
};
export const LEVEL_SETTINGS = {
    EXPERIENCE_PER_LEVEL: 100,
    MAX_LEVEL: 100,
    EXPERIENCE_REWARDS: {
        CORRECT_ANSWER: 10,
        SIMULATION_COMPLETION: 50,
        PERFECT_SIMULATION: 100,
        STREAK_BONUS: 5,
        DAILY_LOGIN: 25
    }
};
export const ACHIEVEMENT_REQUIREMENTS = {
    FIRST_SIMULATION: { simulations: 1 },
    SIMULATION_MASTER: { simulations: 100 },
    ACCURACY_EXPERT: { accuracy: 90 },
    SPEED_DEMON: { avgTime: 30 },
    STREAK_WARRIOR: { streak: 7 },
    KNOWLEDGE_SEEKER: { totalQuestions: 1000 }
};
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        REFRESH: '/api/auth/refresh',
        LOGOUT: '/api/auth/logout',
        FORGOT_PASSWORD: '/api/auth/forgot-password',
        RESET_PASSWORD: '/api/auth/reset-password'
    },
    USERS: {
        PROFILE: '/api/users/profile',
        UPDATE: '/api/users/profile',
        STATISTICS: '/api/users/statistics',
        ACHIEVEMENTS: '/api/users/achievements'
    },
    QUESTIONS: {
        LIST: '/api/questions',
        CREATE: '/api/questions',
        GET: (id) => `/api/questions/${id}`,
        UPDATE: (id) => `/api/questions/${id}`,
        DELETE: (id) => `/api/questions/${id}`,
        SEARCH: '/api/questions/search'
    },
    SIMULATIONS: {
        LIST: '/api/simulations',
        CREATE: '/api/simulations',
        GET: (id) => `/api/simulations/${id}`,
        START: (id) => `/api/simulations/${id}/start`,
        SUBMIT: (id) => `/api/simulations/${id}/submit`,
        RESULTS: (id) => `/api/simulations/${id}/results`
    },
    RANKINGS: {
        GENERAL: '/api/rankings/general',
        BY_UNIVERSITY: (university) => `/api/rankings/university/${university}`,
        BY_SUBJECT: (subject) => `/api/rankings/subject/${subject}`
    }
};
export const REGEX_PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    NAME: /^[a-zA-ZÀ-ÿ\s]{2,50}$/,
    USERNAME: /^[a-zA-Z0-9_]{3,20}$/
};
export const STORAGE_KEYS = {
    AUTH_TOKEN: 'focovest_token',
    REFRESH_TOKEN: 'focovest_refresh_token',
    USER_DATA: 'focovest_user',
    THEME: 'focovest_theme',
    LANGUAGE: 'focovest_language'
};
//# sourceMappingURL=constants.js.map