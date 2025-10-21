export declare const formatDuration: (seconds: number) => string;
export declare const formatScore: (score: number, total: number) => string;
export declare const calculateAccuracy: (correct: number, total: number) => number;
export declare const calculateLevel: (experience: number) => number;
export declare const experienceForNextLevel: (experience: number) => number;
export declare const formatNumber: (num: number) => string;
export declare const generateId: () => string;
export declare const shuffleArray: <T>(array: T[]) => T[];
export declare const debounce: <T extends (...args: any[]) => void>(func: T, wait: number) => ((...args: Parameters<T>) => void);
export declare const throttle: <T extends (...args: any[]) => void>(func: T, limit: number) => ((...args: Parameters<T>) => void);
export declare const deepClone: <T>(obj: T) => T;
export declare const isValidEmail: (email: string) => boolean;
export declare const validatePassword: (password: string) => {
    isValid: boolean;
    errors: string[];
};
export declare const formatDate: (date: Date | string) => string;
export declare const formatDateTime: (date: Date | string) => string;
export declare const timeAgo: (date: Date | string) => string;
export declare const sleep: (ms: number) => Promise<void>;
export declare const objectToQueryString: (obj: Record<string, any>) => string;
export declare const storage: {
    set: (key: string, value: any) => void;
    get: <T = any>(key: string) => T | null;
    remove: (key: string) => void;
    clear: () => void;
};
//# sourceMappingURL=utils.d.ts.map