// Utilitários de segurança para sanitização e validação
import DOMPurify from 'dompurify'

// Sanitização de HTML para prevenir XSS
export const sanitizeHTML = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: []
  })
}

// Sanitização de strings simples
export const sanitizeString = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove brackets
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/data:/gi, '') // Remove data: URLs
    .trim()
}

// Validação de email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

// Validação de senha forte
export const isStrongPassword = (password: string): boolean => {
  const minLength = 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  
  return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
}

// Validação de nome de usuário
export const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/
  return usernameRegex.test(username)
}

// Sanitização de URL
export const sanitizeURL = (url: string): string => {
  try {
    const urlObj = new URL(url)
    // Só permite HTTP e HTTPS
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return ''
    }
    return urlObj.toString()
  } catch {
    return ''
  }
}

// Rate limiting para formulários
class RateLimiter {
  private attempts: Map<string, { count: number; timestamp: number }> = new Map()
  private maxAttempts: number
  private windowMs: number

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const record = this.attempts.get(identifier)

    if (!record) {
      this.attempts.set(identifier, { count: 1, timestamp: now })
      return true
    }

    if (now - record.timestamp > this.windowMs) {
      this.attempts.set(identifier, { count: 1, timestamp: now })
      return true
    }

    if (record.count >= this.maxAttempts) {
      return false
    }

    record.count++
    return true
  }

  getRemainingTime(identifier: string): number {
    const record = this.attempts.get(identifier)
    if (!record || record.count < this.maxAttempts) return 0
    
    const elapsed = Date.now() - record.timestamp
    return Math.max(0, this.windowMs - elapsed)
  }
}

export const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000) // 5 tentativas por 15 min
export const registerRateLimiter = new RateLimiter(3, 60 * 60 * 1000) // 3 tentativas por hora

// Validação de entrada para prevenir SQL injection (mesmo sendo NoSQL)
export const sanitizeInput = (input: any): any => {
  if (typeof input === 'string') {
    return sanitizeString(input)
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(input)) {
      // Remove propriedades perigosas
      if (!['$where', '$regex', '$ne', '$gt', '$lt'].includes(key)) {
        sanitized[sanitizeString(key)] = sanitizeInput(value)
      }
    }
    return sanitized
  }
  
  return input
}

// Validação de tamanho de arquivo
export const isValidFileSize = (file: File, maxSizeMB: number = 5): boolean => {
  return file.size <= maxSizeMB * 1024 * 1024
}

// Validação de tipo de arquivo
export const isValidFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type)
}

// Geração de tokens seguros
export const generateSecureToken = (length: number = 32): string => {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Validação de token JWT (cliente)
export const isValidJWTFormat = (token: string): boolean => {
  const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/
  return jwtRegex.test(token)
}