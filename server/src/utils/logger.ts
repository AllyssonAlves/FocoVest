/**
 * Sistema de Logging Estruturado
 * Substitui console.log por logging profissional com níveis e contexto
 */

import winston from 'winston'
import { Request } from 'express'

// Configuração do logger Winston
const createLogger = () => {
  const isDevelopment = process.env.NODE_ENV !== 'production'
  
  return winston.createLogger({
    level: isDevelopment ? 'debug' : 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.prettyPrint()
    ),
    defaultMeta: { service: 'focovest-server' },
    transports: [
      // Console output
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      }),
      
      // File logging em produção
      ...(isDevelopment ? [] : [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
      ])
    ]
  })
}

export const logger = createLogger()

// Interface para contexto de request
interface RequestContext {
  requestId?: string
  userId?: string
  ip?: string
  userAgent?: string
  method?: string
  path?: string
}

// Classe para logging com contexto
export class ContextualLogger {
  private context: RequestContext

  constructor(context: RequestContext = {}) {
    this.context = context
  }

  private formatMessage(message: string, meta: any = {}) {
    return {
      message,
      ...this.context,
      ...meta,
      timestamp: new Date().toISOString()
    }
  }

  debug(message: string, meta?: any): void {
    logger.debug(this.formatMessage(message, meta))
  }

  info(message: string, meta?: any): void {
    logger.info(this.formatMessage(message, meta))
  }

  warn(message: string, meta?: any): void {
    logger.warn(this.formatMessage(message, meta))
  }

  error(message: string, error?: Error | any, meta?: any): void {
    logger.error(this.formatMessage(message, {
      error: error?.message,
      stack: error?.stack,
      ...meta
    }))
  }

  // Métodos específicos para diferentes tipos de eventos
  apiRequest(method: string, path: string, statusCode: number, responseTime: number): void {
    this.info('API Request', {
      method,
      path,
      statusCode,
      responseTime: `${responseTime}ms`,
      type: 'api-request'
    })
  }

  cacheEvent(event: 'hit' | 'miss' | 'set' | 'evicted', key: string, meta?: any): void {
    this.debug(`Cache ${event.toUpperCase()}`, {
      cacheKey: key,
      type: 'cache-event',
      ...meta
    })
  }

  securityEvent(event: string, severity: 'low' | 'medium' | 'high', meta?: any): void {
    this.warn(`Security Event: ${event}`, {
      severity,
      type: 'security-event',
      ...meta
    })
  }

  performanceMetric(metric: string, value: number, unit: string = 'ms'): void {
    this.info('Performance Metric', {
      metric,
      value,
      unit,
      type: 'performance'
    })
  }

  authEvent(event: 'login' | 'logout' | 'register' | 'failed-login', userId?: string): void {
    this.info(`Auth: ${event}`, {
      userId,
      type: 'authentication'
    })
  }
}

// Factory para criar logger com contexto de request
export const createRequestLogger = (req: Request): ContextualLogger => {
  return new ContextualLogger({
    requestId: (req as any).id || Math.random().toString(36).substr(2, 9),
    userId: (req as any).user?.id,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    method: req.method,
    path: req.path
  })
}

// Logger global para uso sem contexto de request
export const globalLogger = new ContextualLogger()

// Helpers para migração gradual de console.log
export const devLog = (message: string, data?: any): void => {
  if (process.env.NODE_ENV === 'development') {
    globalLogger.debug(message, data)
  }
}

export const prodLog = {
  info: (message: string, data?: any) => globalLogger.info(message, data),
  warn: (message: string, data?: any) => globalLogger.warn(message, data),
  error: (message: string, error?: Error, data?: any) => globalLogger.error(message, error, data)
}

export default {
  logger,
  ContextualLogger,
  createRequestLogger,
  globalLogger,
  devLog,
  prodLog
}