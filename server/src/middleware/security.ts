import { Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import { SecureValidator, validate, ValidationError } from './secureValidation'
import { createRequestLogger } from '../utils/logger'

// Configuração do Helmet para segurança
export const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "http://localhost:3000", "http://localhost:5000"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false, // Pode interferir com alguns recursos
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: false,
  referrerPolicy: { policy: "no-referrer" },
  xssFilter: true
})

// Middleware para validação de entrada usando o sistema seguro
export const handleValidationErrors = (errors: ValidationError[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Dados inválidos fornecidos',
        errors: errors.map(error => ({
          field: error.field,
          message: error.message,
          value: error.value
        }))
      })
      return
    }
    next()
  }
}

// Validações para registro usando sistema seguro
export const validateRegister = validate(
  new SecureValidator()
    .field('name').required().isString().minLength(2).maxLength(100).matches(/^[a-zA-ZÀ-ÿ\s]+$/).build()
    .field('email').required().isEmail().maxLength(255).build()
    .field('password').required().isPassword().minLength(8).maxLength(128).build()
    .field('university').optional().isString().custom((value) => {
      const valid = ['UVA', 'UECE', 'UFC', 'URCA', 'IFCE', 'ENEM']
      return !value || valid.includes(value) || 'Universidade deve ser uma das opções válidas'
    }).build()
    .field('course').optional().isString().maxLength(100).build()
    .field('graduationYear').optional().isNumber().custom((value) => {
      const currentYear = new Date().getFullYear()
      const num = Number(value)
      return !value || (num >= currentYear && num <= currentYear + 10) || 
        'Ano de graduação deve estar entre o ano atual e 10 anos no futuro'
    }).build()
)

// Validações para login usando sistema seguro
export const validateLogin = validate(
  new SecureValidator()
    .field('email').required().isEmail().build()
    .field('password').required().isString().minLength(6).maxLength(128).build()
    .field('rememberMe').optional().isBoolean().build()
    .field('deviceInfo').optional().custom((value: any) => {
      if (value && typeof value === 'object') {
        const { userAgent, platform, language, browser, os, ip } = value
        
        // Validar strings básicas
        if (userAgent && (typeof userAgent !== 'string' || userAgent.length > 500)) {
          return 'UserAgent deve ser uma string válida (máximo 500 caracteres)'
        }
        if (platform && (typeof platform !== 'string' || platform.length > 100)) {
          return 'Platform deve ser uma string válida (máximo 100 caracteres)'
        }
        if (language && (typeof language !== 'string' || language.length > 20)) {
          return 'Language deve ser uma string válida (máximo 20 caracteres)'
        }
        if (browser && (typeof browser !== 'string' || browser.length > 100)) {
          return 'Browser deve ser uma string válida (máximo 100 caracteres)'
        }
        if (os && (typeof os !== 'string' || os.length > 100)) {
          return 'OS deve ser uma string válida (máximo 100 caracteres)'
        }
        if (ip && (typeof ip !== 'string' || ip.length > 45)) {
          return 'IP deve ser uma string válida (máximo 45 caracteres)'
        }
        
        return true
      }
      return true
    }).build()
)

// Validações para simulados usando sistema seguro
export const validateSimulationCreation = validate(
  new SecureValidator()
    .field('title').required().isString().minLength(3).maxLength(200).build()
    .field('description').required().isString().minLength(10).maxLength(1000).build()
    .field('settings').required().custom((settings) => {
      if (!settings || typeof settings !== 'object') return 'Settings é obrigatório'
      
      const timeLimit = Number(settings.timeLimit)
      if (!timeLimit || timeLimit < 1 || timeLimit > 600) {
        return 'Tempo limite deve estar entre 1 e 600 minutos'
      }
      
      const questionsCount = Number(settings.questionsCount)
      if (!questionsCount || questionsCount < 1 || questionsCount > 200) {
        return 'Número de questões deve estar entre 1 e 200'
      }
      
      if (!Array.isArray(settings.subjects) || settings.subjects.length === 0) {
        return 'Pelo menos uma matéria deve ser selecionada'
      }
      
      if (!Array.isArray(settings.universities) || settings.universities.length === 0) {
        return 'Pelo menos uma universidade deve ser selecionada'
      }
      
      return true
    }).build()
)

// Validação de IDs usando sistema seguro
export const validateId = validate(
  new SecureValidator()
    .field('id').required().isString()
    .matches(/^[0-9a-fA-F]{24}$|^mock_\d+$|^\d+$/)
    .build()
)

// Validação de consultas usando sistema seguro
export const validateQuery = validate(
  new SecureValidator()
    .field('page').optional().isNumber().custom((value) => {
      const num = Number(value)
      return !value || num >= 1 || 'Página deve ser um número positivo'
    }).build()
    .field('limit').optional().isNumber().custom((value) => {
      const num = Number(value)
      return !value || (num >= 1 && num <= 100) || 'Limite deve estar entre 1 e 100'
    }).build()
    .field('search').optional().isString().maxLength(100).build()
)

// Middleware para sanitização de dados
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Função recursiva para sanitizar objetos
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitize)
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {}
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key])
      }
      return sanitized
    }
    
    return obj
  }

  if (req.body) {
    req.body = sanitize(req.body)
  }
  
  if (req.query) {
    req.query = sanitize(req.query)
  }
  
  next()
}

// Middleware para logging de segurança
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  // Log de tentativas suspeitas
  const suspiciousPatterns = [
    /script/i,
    /javascript/i,
    /eval\(/i,
    /onload/i,
    /onerror/i
  ]

  const checkSuspicious = (data: any): boolean => {
    const str = JSON.stringify(data).toLowerCase()
    return suspiciousPatterns.some(pattern => pattern.test(str))
  }

  if (req.body && checkSuspicious(req.body)) {
    const requestLogger = createRequestLogger(req)
    requestLogger.securityEvent('Suspicious request body detected', 'medium', { body: req.body })
  }

  if (req.query && checkSuspicious(req.query)) {
    const requestLogger = createRequestLogger(req)
    requestLogger.securityEvent('Suspicious query detected', 'medium', { query: req.query })
  }

  next()
}