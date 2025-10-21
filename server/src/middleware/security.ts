import { Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import { body, validationResult, query, param } from 'express-validator'

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

// Middleware para validação de entrada
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Dados inválidos fornecidos',
      errors: errors.array().map(error => ({
        field: error.type === 'field' ? error.path : 'unknown',
        message: error.msg,
        value: error.type === 'field' ? error.value : undefined
      }))
    })
    return
  }
  next()
}

// Validações para registro
export const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Nome deve conter apenas letras e espaços'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email deve ter um formato válido')
    .isLength({ max: 255 })
    .withMessage('Email muito longo'),
  
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Senha deve ter entre 8 e 128 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número'),
  
  body('university')
    .optional()
    .isIn(['UVA', 'UECE', 'UFC', 'URCA', 'IFCE', 'ENEM'])
    .withMessage('Universidade deve ser uma das opções válidas'),
  
  body('course')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Curso deve ter no máximo 100 caracteres'),
  
  body('graduationYear')
    .optional()
    .isInt({ min: new Date().getFullYear(), max: new Date().getFullYear() + 10 })
    .withMessage('Ano de graduação deve estar entre o ano atual e 10 anos no futuro'),
  
  handleValidationErrors
]

// Validações para login
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email deve ter um formato válido'),
  
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória')
    .isLength({ max: 128 })
    .withMessage('Senha muito longa'),
  
  handleValidationErrors
]

// Validações para simulados
export const validateSimulationCreation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Título deve ter entre 3 e 200 caracteres'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Descrição deve ter entre 10 e 1000 caracteres'),
  
  body('settings.timeLimit')
    .isInt({ min: 1, max: 600 })
    .withMessage('Tempo limite deve estar entre 1 e 600 minutos'),
  
  body('settings.questionsCount')
    .isInt({ min: 1, max: 200 })
    .withMessage('Número de questões deve estar entre 1 e 200'),
  
  body('settings.subjects')
    .isArray({ min: 1 })
    .withMessage('Pelo menos uma matéria deve ser selecionada'),
  
  body('settings.universities')
    .isArray({ min: 1 })
    .withMessage('Pelo menos uma universidade deve ser selecionada'),
  
  handleValidationErrors
]

// Validação de IDs
export const validateId = [
  param('id')
    .matches(/^[0-9a-fA-F]{24}$|^mock_\d+$|^\d+$/)
    .withMessage('ID inválido'),
  
  handleValidationErrors
]

// Validação de consultas
export const validateQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número positivo'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve estar entre 1 e 100'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Busca deve ter no máximo 100 caracteres'),
  
  handleValidationErrors
]

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
    console.log(`🚨 Tentativa suspeita detectada - IP: ${req.ip}, Path: ${req.path}, Body:`, req.body)
  }

  if (req.query && checkSuspicious(req.query)) {
    console.log(`🚨 Query suspeita detectada - IP: ${req.ip}, Path: ${req.path}, Query:`, req.query)
  }

  next()
}