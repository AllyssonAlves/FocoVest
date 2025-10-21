import { University, Subject } from './types';
export declare const APP_NAME = "FocoVest";
export declare const APP_VERSION = "1.0.0";
export declare const APP_DESCRIPTION = "Plataforma de simulados para vestibulares";
export declare const UNIVERSITIES: {
    value: string;
    label: string;
}[];
export declare const SUBJECTS: {
    value: Subject;
    label: string;
}[];
export declare const UNIVERSITY_NAMES: {
    UVA: string;
    UECE: string;
    UFC: string;
    URCA: string;
    IFCE: string;
    ENEM: string;
};
export declare const SUBJECT_NAMES: {
    MATHEMATICS: string;
    PORTUGUESE: string;
    LITERATURE: string;
    PHYSICS: string;
    CHEMISTRY: string;
    BIOLOGY: string;
    HISTORY: string;
    GEOGRAPHY: string;
    PHILOSOPHY: string;
    SOCIOLOGY: string;
    ENGLISH: string;
    SPANISH: string;
    ARTS: string;
    PHYSICAL_EDUCATION: string;
};
export declare const DIFFICULTY_NAMES: {
    EASY: string;
    MEDIUM: string;
    HARD: string;
    EXPERT: string;
};
export declare const DIFFICULTY_COLORS: {
    EASY: string;
    MEDIUM: string;
    HARD: string;
    EXPERT: string;
};
export declare const SUBJECT_COLORS: {
    MATHEMATICS: string;
    PORTUGUESE: string;
    LITERATURE: string;
    PHYSICS: string;
    CHEMISTRY: string;
    BIOLOGY: string;
    HISTORY: string;
    GEOGRAPHY: string;
    PHILOSOPHY: string;
    SOCIOLOGY: string;
    ENGLISH: string;
    SPANISH: string;
    ARTS: string;
    PHYSICAL_EDUCATION: string;
};
export declare const SIMULATION_SETTINGS: {
    MIN_QUESTIONS: number;
    MAX_QUESTIONS: number;
    DEFAULT_QUESTIONS: number;
    MIN_DURATION: number;
    MAX_DURATION: number;
    DEFAULT_DURATION: number;
};
export declare const LEVEL_SETTINGS: {
    EXPERIENCE_PER_LEVEL: number;
    MAX_LEVEL: number;
    EXPERIENCE_REWARDS: {
        CORRECT_ANSWER: number;
        SIMULATION_COMPLETION: number;
        PERFECT_SIMULATION: number;
        STREAK_BONUS: number;
        DAILY_LOGIN: number;
    };
};
export declare const ACHIEVEMENT_REQUIREMENTS: {
    FIRST_SIMULATION: {
        simulations: number;
    };
    SIMULATION_MASTER: {
        simulations: number;
    };
    ACCURACY_EXPERT: {
        accuracy: number;
    };
    SPEED_DEMON: {
        avgTime: number;
    };
    STREAK_WARRIOR: {
        streak: number;
    };
    KNOWLEDGE_SEEKER: {
        totalQuestions: number;
    };
};
export declare const API_ENDPOINTS: {
    AUTH: {
        LOGIN: string;
        REGISTER: string;
        REFRESH: string;
        LOGOUT: string;
        FORGOT_PASSWORD: string;
        RESET_PASSWORD: string;
    };
    USERS: {
        PROFILE: string;
        UPDATE: string;
        STATISTICS: string;
        ACHIEVEMENTS: string;
    };
    QUESTIONS: {
        LIST: string;
        CREATE: string;
        GET: (id: string) => string;
        UPDATE: (id: string) => string;
        DELETE: (id: string) => string;
        SEARCH: string;
    };
    SIMULATIONS: {
        LIST: string;
        CREATE: string;
        GET: (id: string) => string;
        START: (id: string) => string;
        SUBMIT: (id: string) => string;
        RESULTS: (id: string) => string;
    };
    RANKINGS: {
        GENERAL: string;
        BY_UNIVERSITY: (university: University) => string;
        BY_SUBJECT: (subject: Subject) => string;
    };
};
export declare const REGEX_PATTERNS: {
    EMAIL: RegExp;
    PASSWORD: RegExp;
    NAME: RegExp;
    USERNAME: RegExp;
};
export declare const STORAGE_KEYS: {
    AUTH_TOKEN: string;
    REFRESH_TOKEN: string;
    USER_DATA: string;
    THEME: string;
    LANGUAGE: string;
};
//# sourceMappingURL=constants.d.ts.map