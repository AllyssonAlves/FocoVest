import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config/database'
import User, { IUser } from '../models/User'
import { createError } from './errorHandler'
import { tokenBlacklistService } from '../services/TokenBlacklistService'

// Estender a interface Request para incluir o usuário
export interface AuthRequest extends Request {
  user?: IUser
}

export interface JWTPayload {
  userId: string
  email: string
  role: string
  iat: number
  exp: number
}

export const generateToken = (user: IUser): string => {
  const payload = {
    userId: user._id,
    email: user.email,
    role: user.role
  }
  
  return jwt.sign(payload, config.jwt.secret, { expiresIn: '7d' })
}

export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, config.jwt.secret) as JWTPayload
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw createError('Token expirado', 401)
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw createError('Token inválido', 401)
    } else {
      throw createError('Erro ao verificar token', 401)
    }
  }
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: 'Token de acesso requerido'
      })
      return
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : authHeader

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token de acesso requerido'
      })
      return
    }

    // Verificar se o token está na blacklist
    if (tokenBlacklistService.isTokenBlacklisted(token)) {
      res.status(401).json({
        success: false,
        message: 'Token foi invalidado. Faça login novamente.',
        code: 'TOKEN_BLACKLISTED'
      })
      return
    }

    // Verificar o token
    const decoded = verifyToken(token)

    // Verificar se MongoDB está disponível
    const isMongoAvailable = () => {
      try {
        const mongoose = require('mongoose')
        return mongoose.connection.readyState === 1
      } catch (error) {
        return false
      }
    }

    // Buscar o usuário no banco de dados
    let user: IUser | null
    
    if (isMongoAvailable()) {
      user = await User.findById(decoded.userId).select('+password')
    } else {
      // Usar MockUser quando MongoDB não estiver disponível
      const { MockUser } = require('../services/MockUserService')
      user = await MockUser.findById(decoded.userId)
    }
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Usuário não encontrado'
      })
      return
    }

    // Adicionar usuário à requisição
    req.user = user
    next()
    
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.message || 'Token inválido'
    })
    return
  }
}

export const requireAuth = authenticateToken

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader) {
      return next() // Continuar sem usuário
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : authHeader

    if (!token) {
      return next() // Continuar sem usuário
    }

    // Verificar se MongoDB está disponível
    const isMongoAvailable = () => {
      try {
        const mongoose = require('mongoose')
        return mongoose.connection.readyState === 1
      } catch (error) {
        return false
      }
    }

    // Tentar verificar o token
    const decoded = verifyToken(token)
    
    let user: IUser | null
    
    if (isMongoAvailable()) {
      user = await User.findById(decoded.userId)
    } else {
      // Usar MockUser quando MongoDB não estiver disponível
      const { MockUser } = require('../services/MockUserService')
      user = await MockUser.findById(decoded.userId)
    }
    
    if (user) {
      req.user = user
    }
    
    next()
    
  } catch (error) {
    // Em caso de erro, continuar sem usuário
    next()
  }
}

export const requireRole = (roles: string | string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Acesso negado. Faça login primeiro.'
      })
      return
    }

    const userRoles = Array.isArray(roles) ? roles : [roles]
    
    if (!userRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Acesso negado. Permissões insuficientes.'
      })
      return
    }

    next()
  }
}

export const requireEmailVerification = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Acesso negado. Faça login primeiro.'
    })
    return
  }

  if (!req.user.isEmailVerified) {
    res.status(403).json({
      success: false,
      message: 'Email não verificado. Verifique seu email antes de continuar.',
      requiresEmailVerification: true
    })
    return
  }

  next()
}