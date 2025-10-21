import rateLimit from 'express-rate-limit'
import { Request, Response } from 'express'

// Rate limiter geral para a API
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'development' ? 10000 : 100, // 10000 em dev, 100 em prod
  message: {
    success: false,
    message: 'Muitas requisições deste IP, tente novamente em 15 minutos.',
    retryAfter: 15 * 60
  },
  standardHeaders: true, // Retorna informações de rate limit nos headers
  legacyHeaders: false, // Desabilita headers X-RateLimit-*
  skip: (req: Request) => {
    // Skip rate limiting em desenvolvimento para localhost
    if (process.env.NODE_ENV === 'development' && 
        (req.ip === '::1' || req.ip === '127.0.0.1' || req.ip?.includes('localhost'))) {
      return true
    }
    return false
  },
  handler: (req: Request, res: Response) => {
    console.log(`⚠️ Rate limit atingido para IP: ${req.ip} - Path: ${req.path}`)
    res.status(429).json({
      success: false,
      message: 'Muitas requisições deste IP, tente novamente em 15 minutos.',
      retryAfter: 15 * 60
    })
  }
})

// Rate limiter específico para autenticação (mais restritivo)
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas de login por IP a cada 15 minutos
  message: {
    success: false,
    message: 'Muitas tentativas de login, tente novamente em 15 minutos.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Não contar requests bem-sucedidos
  handler: (req: Request, res: Response) => {
    console.log(`🚨 Rate limit de auth atingido para IP: ${req.ip}`)
    res.status(429).json({
      success: false,
      message: 'Muitas tentativas de login falharam. Tente novamente em 15 minutos.',
      retryAfter: 15 * 60
    })
  }
})

// Rate limiter para criação de conta
export const registerRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // máximo 3 contas por IP por hora
  message: {
    success: false,
    message: 'Muitas contas criadas deste IP, tente novamente em 1 hora.',
    retryAfter: 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    console.log(`🚨 Rate limit de registro atingido para IP: ${req.ip}`)
    res.status(429).json({
      success: false,
      message: 'Limite de criação de contas atingido. Tente novamente em 1 hora.',
      retryAfter: 60 * 60
    })
  }
})

// Rate limiter para simulados (mais flexível para uso normal)
export const simulationRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: process.env.NODE_ENV === 'development' ? 5000 : 20, // 5000 em dev, 20 em prod
  message: {
    success: false,
    message: 'Muitas requisições de simulados, aguarde alguns minutos.',
    retryAfter: 5 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    // Skip rate limiting em desenvolvimento para localhost
    if (process.env.NODE_ENV === 'development' && 
        (req.ip === '::1' || req.ip === '127.0.0.1' || req.ip?.includes('localhost'))) {
      return true
    }
    return false
  }
})

// Store para rate limiting por usuário (além de IP)
interface UserRateLimitStore {
  [userId: string]: {
    count: number
    resetTime: number
  }
}

const userRateLimitStore: UserRateLimitStore = {}

// Rate limiter por usuário para simulados
export const userSimulationRateLimit = (req: any, res: Response, next: any) => {
  if (!req.user || !req.user._id) {
    return next() // Se não há usuário autenticado, pula
  }

  const userId = req.user._id.toString()
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minuto
  const maxRequests = 10 // máximo 10 simulados por minuto por usuário

  if (!userRateLimitStore[userId] || now > userRateLimitStore[userId].resetTime) {
    userRateLimitStore[userId] = {
      count: 1,
      resetTime: now + windowMs
    }
    return next()
  }

  if (userRateLimitStore[userId].count >= maxRequests) {
    return res.status(429).json({
      success: false,
      message: 'Limite de simulados por minuto atingido. Aguarde um pouco.',
      retryAfter: Math.ceil((userRateLimitStore[userId].resetTime - now) / 1000)
    })
  }

  userRateLimitStore[userId].count++
  next()
}

// Limpeza periódica do store de rate limiting de usuários
setInterval(() => {
  const now = Date.now()
  Object.keys(userRateLimitStore).forEach(userId => {
    if (now > userRateLimitStore[userId].resetTime) {
      delete userRateLimitStore[userId]
    }
  })
}, 5 * 60 * 1000) // Limpeza a cada 5 minutos