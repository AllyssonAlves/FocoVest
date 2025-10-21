"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.objectToQueryString = exports.sleep = exports.timeAgo = exports.formatDateTime = exports.formatDate = exports.validatePassword = exports.isValidEmail = exports.deepClone = exports.throttle = exports.debounce = exports.shuffleArray = exports.generateId = exports.formatNumber = exports.experienceForNextLevel = exports.calculateLevel = exports.calculateAccuracy = exports.formatScore = exports.formatDuration = void 0;
const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
    }
    else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    }
    else {
        return `${secs}s`;
    }
};
exports.formatDuration = formatDuration;
const formatScore = (score, total) => {
    if (total === 0)
        return '0%';
    const percentage = Math.round((score / total) * 100);
    return `${percentage}%`;
};
exports.formatScore = formatScore;
const calculateAccuracy = (correct, total) => {
    if (total === 0)
        return 0;
    return Math.round((correct / total) * 100);
};
exports.calculateAccuracy = calculateAccuracy;
const calculateLevel = (experience) => {
    return Math.floor(experience / 100) + 1;
};
exports.calculateLevel = calculateLevel;
const experienceForNextLevel = (experience) => {
    const currentLevel = (0, exports.calculateLevel)(experience);
    return (currentLevel * 100) - experience;
};
exports.experienceForNextLevel = experienceForNextLevel;
const formatNumber = (num) => {
    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
    }
    else if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
};
exports.formatNumber = formatNumber;
const generateId = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
};
exports.generateId = generateId;
const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};
exports.shuffleArray = shuffleArray;
const debounce = (func, wait) => {
    let timeout = null;
    return (...args) => {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => func(...args), wait);
    };
};
exports.debounce = debounce;
const throttle = (func, limit) => {
    let inThrottle = false;
    return (...args) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
};
exports.throttle = throttle;
const deepClone = (obj) => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    if (obj instanceof Array) {
        return obj.map(item => (0, exports.deepClone)(item));
    }
    if (typeof obj === 'object') {
        const copy = {};
        Object.keys(obj).forEach(key => {
            copy[key] = (0, exports.deepClone)(obj[key]);
        });
        return copy;
    }
    return obj;
};
exports.deepClone = deepClone;
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.isValidEmail = isValidEmail;
const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
        errors.push('Senha deve ter pelo menos 8 caracteres');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Senha deve conter pelo menos uma letra minúscula');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Senha deve conter pelo menos uma letra maiúscula');
    }
    if (!/\d/.test(password)) {
        errors.push('Senha deve conter pelo menos um número');
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};
exports.validatePassword = validatePassword;
const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
};
exports.formatDate = formatDate;
const formatDateTime = (date) => {
    const d = new Date(date);
    return d.toLocaleString('pt-BR');
};
exports.formatDateTime = formatDateTime;
const timeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffMinutes < 1) {
        return 'agora mesmo';
    }
    else if (diffMinutes < 60) {
        return `${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''} atrás`;
    }
    else if (diffHours < 24) {
        return `${diffHours} hora${diffHours > 1 ? 's' : ''} atrás`;
    }
    else if (diffDays < 7) {
        return `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`;
    }
    else {
        return (0, exports.formatDate)(past);
    }
};
exports.timeAgo = timeAgo;
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
exports.sleep = sleep;
const objectToQueryString = (obj) => {
    const params = new URLSearchParams();
    Object.entries(obj).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            params.append(key, String(value));
        }
    });
    return params.toString();
};
exports.objectToQueryString = objectToQueryString;
exports.storage = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        }
        catch (error) {
            console.warn('Failed to save to localStorage:', error);
        }
    },
    get: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        }
        catch (error) {
            console.warn('Failed to read from localStorage:', error);
            return null;
        }
    },
    remove: (key) => {
        try {
            localStorage.removeItem(key);
        }
        catch (error) {
            console.warn('Failed to remove from localStorage:', error);
        }
    },
    clear: () => {
        try {
            localStorage.clear();
        }
        catch (error) {
            console.warn('Failed to clear localStorage:', error);
        }
    }
};
//# sourceMappingURL=utils.js.map