/**
 * Sistema de Monitoramento de Produção
 * Métricas, alertas e health checks avançados
 */

import { Request, Response, NextFunction } from 'express'
import { globalLogger, createRequestLogger } from '../utils/logger'
import os from 'os'

// Interface para métricas de sistema
interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical'
  uptime: number
  memory: {
    used: number
    total: number
    percentage: number
  }
  cpu: {
    usage: number
    loadAverage: number[]
  }
  disk: {
    available: boolean
  }
  database: {
    connected: boolean
    latency?: number
  }
  cache: {
    connected: boolean
    hitRate: number
  }
  timestamp: string
}

// Interface para métricas de performance
interface PerformanceMetrics {
  requests: {
    total: number
    rpm: number // Requests per minute
    averageResponseTime: number
    slowRequests: number // > 1s
    errorRate: number
  }
  users: {
    active: number
    concurrent: number
  }
  errors: {
    count: number
    recent: Array<{
      timestamp: Date
      message: string
      endpoint: string
      statusCode: number
    }>
  }
}

// Interface para alertas
interface Alert {
  id: string
  level: 'info' | 'warning' | 'error' | 'critical'
  message: string
  timestamp: Date
  resolved: boolean
  metadata?: Record<string, any>
}

class ProductionMonitor {
  private metrics: PerformanceMetrics = {
    requests: {
      total: 0,
      rpm: 0,
      averageResponseTime: 0,
      slowRequests: 0,
      errorRate: 0
    },
    users: {
      active: 0,
      concurrent: 0
    },
    errors: {
      count: 0,
      recent: []
    }
  }

  private alerts: Alert[] = []
  private requestTimes: number[] = []
  private requestTimestamps: Date[] = []
  private activeUsers = new Set<string>()
  private readonly startTime = Date.now()

  /**
   * Middleware para capturar métricas de requisições
   */
  requestMetrics = (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now()
    const requestLogger = createRequestLogger(req)
    const monitor = this // Capturar referência para usar no callback

    // Capturar usuário ativo
    const userId = (req as any).user?.id
    if (userId) {
      this.activeUsers.add(userId)
    }

    // Override res.end para capturar métricas ao finalizar
    const originalEnd = res.end.bind(res)
    res.end = function(chunk?: any, encoding?: BufferEncoding | (() => void), cb?: () => void) {
      const endTime = Date.now()
      const responseTime = endTime - startTime

      // Registrar métricas
      monitor.recordRequest(responseTime, res.statusCode, req.path)

      // Log estruturado
      requestLogger.apiRequest(req.method, req.path, res.statusCode, responseTime)

      // Alerta para requisições lentas
      if (responseTime > 2000) {
        monitor.createAlert('warning', `Slow request detected: ${req.path} took ${responseTime}ms`, {
          endpoint: req.path,
          responseTime,
          method: req.method
        })
      }

      // Chamar método original com argumentos corretos
      if (typeof encoding === 'function') {
        return originalEnd(chunk, encoding)
      } else {
        return originalEnd(chunk, encoding || 'utf8', cb)
      }
    }

    next()
  }

  /**
   * Registrar métricas de requisição
   */
  private recordRequest(responseTime: number, statusCode: number, endpoint: string) {
    this.metrics.requests.total++
    this.requestTimes.push(responseTime)
    this.requestTimestamps.push(new Date())

    // Manter apenas últimas 1000 requisições
    if (this.requestTimes.length > 1000) {
      this.requestTimes.shift()
      this.requestTimestamps.shift()
    }

    // Contar requisições lentas
    if (responseTime > 1000) {
      this.metrics.requests.slowRequests++
    }

    // Registrar erros
    if (statusCode >= 400) {
      this.metrics.errors.count++
      this.metrics.errors.recent.push({
        timestamp: new Date(),
        message: `HTTP ${statusCode}`,
        endpoint,
        statusCode
      })

      // Manter apenas últimos 100 erros
      if (this.metrics.errors.recent.length > 100) {
        this.metrics.errors.recent.shift()
      }
    }

    // Calcular RPM (últimos 60 segundos)
    const oneMinuteAgo = Date.now() - 60000
    const recentRequests = this.requestTimestamps.filter(timestamp => 
      timestamp.getTime() > oneMinuteAgo
    ).length
    this.metrics.requests.rpm = recentRequests

    // Calcular tempo médio de resposta
    this.metrics.requests.averageResponseTime = 
      this.requestTimes.reduce((sum, time) => sum + time, 0) / this.requestTimes.length

    // Calcular taxa de erro (últimas 100 requisições)
    const recent100 = Math.min(this.requestTimes.length, 100)
    const recentErrors = this.metrics.errors.recent.slice(-recent100)
    this.metrics.requests.errorRate = (recentErrors.length / recent100) * 100

    // Usuários ativos
    this.metrics.users.active = this.activeUsers.size
  }

  /**
   * Verificar saúde do sistema
   */
  async checkSystemHealth(): Promise<SystemHealth> {
    const memoryUsage = process.memoryUsage()
    const totalMemory = os.totalmem()
    const freeMemory = os.freemem()
    const usedMemory = totalMemory - freeMemory

    const health: SystemHealth = {
      status: 'healthy',
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      memory: {
        used: memoryUsage.heapUsed,
        total: memoryUsage.heapTotal,
        percentage: (usedMemory / totalMemory) * 100
      },
      cpu: {
        usage: 0, // Calculado abaixo se possível
        loadAverage: os.loadavg()
      },
      disk: {
        available: true // Simplificado
      },
      database: {
        connected: true // Mock sempre conectado
      },
      cache: {
        connected: true,
        hitRate: 0 // Pode ser calculado do CacheService
      },
      timestamp: new Date().toISOString()
    }

    // Determinar status baseado nas métricas
    if (health.memory.percentage > 90) {
      health.status = 'critical'
      this.createAlert('critical', `High memory usage: ${health.memory.percentage.toFixed(2)}%`)
    } else if (health.memory.percentage > 70) {
      health.status = 'warning'
    }

    if (this.metrics.requests.errorRate > 10) {
      health.status = 'critical'
      this.createAlert('critical', `High error rate: ${this.metrics.requests.errorRate.toFixed(2)}%`)
    }

    return health
  }

  /**
   * Criar alerta
   */
  private createAlert(level: Alert['level'], message: string, metadata?: Record<string, any>) {
    const alert: Alert = {
      id: Math.random().toString(36).substr(2, 9),
      level,
      message,
      timestamp: new Date(),
      resolved: false,
      metadata
    }

    this.alerts.push(alert)
    
    // Manter apenas últimos 50 alertas
    if (this.alerts.length > 50) {
      this.alerts.shift()
    }

    // Log do alerta
    globalLogger[level === 'critical' || level === 'error' ? 'error' : 'warn'](
      `Alert: ${message}`, 
      null,
      { level, metadata }
    )
  }

  /**
   * Obter métricas de performance
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  /**
   * Obter alertas
   */
  getAlerts(): Alert[] {
    return [...this.alerts]
  }

  /**
   * Limpar usuários inativos periodicamente
   */
  startUserCleanup() {
    setInterval(() => {
      // Limpar usuários inativos a cada 5 minutos
      this.activeUsers.clear()
    }, 5 * 60 * 1000)
  }
}

// Instância singleton
export const productionMonitor = new ProductionMonitor()

/**
 * Middleware de monitoramento para produção
 */
export const monitoringMiddleware = productionMonitor.requestMetrics

/**
 * Endpoint de health check
 */
export const healthCheckEndpoint = async (req: Request, res: Response) => {
  try {
    const health = await productionMonitor.checkSystemHealth()
    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'warning' ? 200 : 503

    res.status(statusCode).json({
      success: true,
      data: health
    })
  } catch (error) {
    globalLogger.error('Health check failed', error)
    res.status(503).json({
      success: false,
      message: 'Health check failed',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    })
  }
}

/**
 * Endpoint de métricas (protegido em produção)
 */
export const metricsEndpoint = (req: Request, res: Response): void => {
  // Proteger em produção
  if (process.env.NODE_ENV === 'production') {
    const apiKey = req.headers['x-api-key']
    if (!apiKey || apiKey !== process.env.MONITORING_API_KEY) {
      res.status(403).json({
        success: false,
        message: 'Acesso negado - API key inválida'
      })
      return
    }
  }

  const metrics = productionMonitor.getMetrics()
  const alerts = productionMonitor.getAlerts()

  res.json({
    success: true,
    data: {
      metrics,
      alerts: alerts.filter(alert => !alert.resolved),
      timestamp: new Date().toISOString()
    }
  })
}

/**
 * Inicializar monitoramento
 */
export const initializeMonitoring = () => {
  productionMonitor.startUserCleanup()
  globalLogger.info('Production monitoring initialized')
}

export default {
  productionMonitor,
  monitoringMiddleware,
  healthCheckEndpoint,
  metricsEndpoint,
  initializeMonitoring
}