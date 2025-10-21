export const formatDuration = (seconds) => {
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
export const formatScore = (score, total) => {
    if (total === 0)
        return '0%';
    const percentage = Math.round((score / total) * 100);
    return `${percentage}%`;
};
export const calculateAccuracy = (correct, total) => {
    if (total === 0)
        return 0;
    return Math.round((correct / total) * 100);
};
export const calculateLevel = (experience) => {
    return Math.floor(experience / 100) + 1;
};
export const experienceForNextLevel = (experience) => {
    const currentLevel = calculateLevel(experience);
    return (currentLevel * 100) - experience;
};
export const formatNumber = (num) => {
    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
    }
    else if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
};
export const generateId = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
};
export const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};
export const debounce = (func, wait) => {
    let timeout = null;
    return (...args) => {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => func(...args), wait);
    };
};
export const throttle = (func, limit) => {
    let inThrottle = false;
    return (...args) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
};
export const deepClone = (obj) => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    if (obj instanceof Array) {
        return obj.map(item => deepClone(item));
    }
    if (typeof obj === 'object') {
        const copy = {};
        Object.keys(obj).forEach(key => {
            copy[key] = deepClone(obj[key]);
        });
        return copy;
    }
    return obj;
};
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
export const validatePassword = (password) => {
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
export const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
};
export const formatDateTime = (date) => {
    const d = new Date(date);
    return d.toLocaleString('pt-BR');
};
export const timeAgo = (date) => {
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
        return formatDate(past);
    }
};
export const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
export const objectToQueryString = (obj) => {
    const params = new URLSearchParams();
    Object.entries(obj).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            params.append(key, String(value));
        }
    });
    return params.toString();
};
export const storage = {
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