// Utility functions for the FocoVest platform

// Format time duration
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  } else {
    return `${secs}s`
  }
}

// Format score percentage
export const formatScore = (score: number, total: number): string => {
  if (total === 0) return '0%'
  const percentage = Math.round((score / total) * 100)
  return `${percentage}%`
}

// Calculate accuracy
export const calculateAccuracy = (correct: number, total: number): number => {
  if (total === 0) return 0
  return Math.round((correct / total) * 100)
}

// Calculate level from experience
export const calculateLevel = (experience: number): number => {
  return Math.floor(experience / 100) + 1
}

// Calculate experience for next level
export const experienceForNextLevel = (experience: number): number => {
  const currentLevel = calculateLevel(experience)
  return (currentLevel * 100) - experience
}

// Format large numbers (1000 -> 1K, 1000000 -> 1M)
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

// Generate random ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Shuffle array (Fisher-Yates algorithm)
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Debounce function
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle function
export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Deep clone object
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T
  }
  
  if (typeof obj === 'object') {
    const copy = {} as T
    Object.keys(obj).forEach(key => {
      (copy as any)[key] = deepClone((obj as any)[key])
    })
    return copy
  }
  
  return obj
}

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate password strength
export const validatePassword = (password: string): {
  isValid: boolean
  errors: string[]
} => {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Senha deve ter pelo menos 8 caracteres')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra minúscula')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Senha deve conter pelo menos um número')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Format date to Brazilian format
export const formatDate = (date: Date | string): string => {
  const d = new Date(date)
  return d.toLocaleDateString('pt-BR')
}

// Format date and time to Brazilian format
export const formatDateTime = (date: Date | string): string => {
  const d = new Date(date)
  return d.toLocaleString('pt-BR')
}

// Calculate time ago
export const timeAgo = (date: Date | string): string => {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffMinutes < 1) {
    return 'agora mesmo'
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''} atrás`
  } else if (diffHours < 24) {
    return `${diffHours} hora${diffHours > 1 ? 's' : ''} atrás`
  } else if (diffDays < 7) {
    return `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`
  } else {
    return formatDate(past)
  }
}

// Sleep function for async operations
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Convert object to query string
export const objectToQueryString = (obj: Record<string, any>): string => {
  const params = new URLSearchParams()
  
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      params.append(key, String(value))
    }
  })
  
  return params.toString()
}

// Local storage helpers
export const storage = {
  set: (key: string, value: any): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      // Silenciar erros de localStorage em produção
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        console.warn('Failed to save to localStorage:', error)
      }
    }
  },
  
  get: <T = any>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        console.warn('Failed to read from localStorage:', error)
      }
      return null
    }
  },
  
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        console.warn('Failed to remove from localStorage:', error)
      }
    }
  },
  
  clear: (): void => {
    try {
      localStorage.clear()
    } catch (error) {
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        console.warn('Failed to clear localStorage:', error)
      }
    }
  }
}