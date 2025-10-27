import { Request, Response, NextFunction } from 'express'
import morgan from 'morgan'
import { globalLogger, createRequestLogger } from '../utils/logger'

// Interface para métricas do sistema
interface SystemMetrics {
  requests: {
    total: number
    success: number
    error: number
    byEndpoint: Map<string, number>
    byMethod: Map<string, number>
    responseTime: number[]
  }
  users: {
    activeUsers: Set<string>
    registrations: number
    logins: number
  }
  performance: {
    memoryUsage: NodeJS.MemoryUsage
    uptime: number
    cpuUsage: NodeJS.CpuUsage | null
  }
  errors: {
    count: number
    recent: Array<{
      timestamp: Date
      error: string
      endpoint: string
      userId?: string
    }>
  }
}

// Sistema de métricas em memória
class MetricsSystem {
  private metrics: SystemMetrics = {
    requests: {
      total: 0,
      success: 0,
      error: 0,
      byEndpoint: new Map(),
      byMethod: new Map(),
      responseTime: []
    },
    users: {
      activeUsers: new Set(),
      registrations: 0,
      logins: 0
    },
    performance: {
      memoryUsage: process.memoryUsage(),
      uptime: 0,
      cpuUsage: null
    },
    errors: {
      count: 0,
      recent: []
    }
  }

  private startTime = Date.now()

  // Registrar requisição
  recordRequest(req: Request, statusCode: number, responseTime: number) {
    this.metrics.requests.total++
    
    if (statusCode >= 200 && statusCode < 400) {
      this.metrics.requests.success++
    } else {
      this.metrics.requests.error++
    }

    // Contadores por endpoint e método
    const endpoint = req.route?.path || req.path
    const method = req.method
    
    this.metrics.requests.byEndpoint.set(
      endpoint,
      (this.metrics.requests.byEndpoint.get(endpoint) || 0) + 1
    )
    
    this.metrics.requests.byMethod.set(
      method,
      (this.metrics.requests.byMethod.get(method) || 0) + 1
    )

    // Tempo de resposta (manter últimas 1000)
    this.metrics.requests.responseTime.push(responseTime)
    if (this.metrics.requests.responseTime.length > 1000) {
      this.metrics.requests.responseTime.shift()
    }

    // Atualizar métricas de performance
    this.updatePerformanceMetrics()
  }

  // Registrar usuário ativo
  recordActiveUser(userId: string) {
    this.metrics.users.activeUsers.add(userId)
    
    // Limpar usuários ativos antigos (implementar TTL se necessário)
    setTimeout(() => {
      this.metrics.users.activeUsers.delete(userId)
    }, 30 * 60 * 1000) // 30 minutos
  }

  // Registrar ação de usuário
  recordUserAction(action: 'registration' | 'login') {
    if (action === 'registration') {
      this.metrics.users.registrations++
    } else if (action === 'login') {
      this.metrics.users.logins++
    }
  }

  // Registrar erro
  recordError(error: string, endpoint: string, userId?: string) {
    this.metrics.errors.count++
    this.metrics.errors.recent.push({
      timestamp: new Date(),
      error: error.substring(0, 200), // Limitar tamanho
      endpoint,
      userId
    })

    // Manter apenas últimos 100 erros
    if (this.metrics.errors.recent.length > 100) {
      this.metrics.errors.recent.shift()
    }
  }

  // Atualizar métricas de performance
  private updatePerformanceMetrics() {
    this.metrics.performance.memoryUsage = process.memoryUsage()
    this.metrics.performance.uptime = Date.now() - this.startTime
    
    if (process.cpuUsage) {
      this.metrics.performance.cpuUsage = process.cpuUsage()
    }
  }

  // Obter métricas formatadas
  getMetrics() {
    this.updatePerformanceMetrics()
    
    const responseTimeArray = this.metrics.requests.responseTime
    const avgResponseTime = responseTimeArray.length > 0 
      ? responseTimeArray.reduce((a, b) => a + b, 0) / responseTimeArray.length 
      : 0

    return {
      timestamp: new Date().toISOString(),
      uptime: this.metrics.performance.uptime,
      requests: {
        total: this.metrics.requests.total,
        success: this.metrics.requests.success,
        error: this.metrics.requests.error,
        successRate: this.metrics.requests.total > 0 
          ? (this.metrics.requests.success / this.metrics.requests.total * 100).toFixed(2) + '%'
          : '0%',
        avgResponseTime: Math.round(avgResponseTime) + 'ms',
        topEndpoints: Array.from(this.metrics.requests.byEndpoint.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10),
        methodDistribution: Object.fromEntries(this.metrics.requests.byMethod)
      },
      users: {
        activeNow: this.metrics.users.activeUsers.size,
        totalRegistrations: this.metrics.users.registrations,
        totalLogins: this.metrics.users.logins
      },
      performance: {
        memoryUsage: {
          rss: Math.round(this.metrics.performance.memoryUsage.rss / 1024 / 1024) + 'MB',
          heapUsed: Math.round(this.metrics.performance.memoryUsage.heapUsed / 1024 / 1024) + 'MB',
          heapTotal: Math.round(this.metrics.performance.memoryUsage.heapTotal / 1024 / 1024) + 'MB'
        },
        uptime: Math.round(this.metrics.performance.uptime / 1000) + 's'
      },
      errors: {
        total: this.metrics.errors.count,
        recent: this.metrics.errors.recent.slice(-10) // Últimos 10 erros
      }
    }
  }

  // Resetar métricas (útil para testes)
  reset() {
    this.metrics = {
      requests: {
        total: 0,
        success: 0,
        error: 0,
        byEndpoint: new Map(),
        byMethod: new Map(),
        responseTime: []
      },
      users: {
        activeUsers: new Set(),
        registrations: 0,
        logins: 0
      },
      performance: {
        memoryUsage: process.memoryUsage(),
        uptime: 0,
        cpuUsage: null
      },
      errors: {
        count: 0,
        recent: []
      }
    }
    this.startTime = Date.now()
  }
}

// Instância global do sistema de métricas
export const metricsSystem = new MetricsSystem()

// Middleware de logging personalizado
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now()

  // Override do res.json para capturar quando a resposta é enviada
  const originalJson = res.json
  res.json = function(body: any) {
    const responseTime = Date.now() - startTime
    
    // Registrar métricas
    metricsSystem.recordRequest(req, res.statusCode, responseTime)
    
    // Log estruturado da requisição
    const requestLogger = createRequestLogger(req)
    requestLogger.apiRequest(req.method, req.path, res.statusCode, responseTime)

    return originalJson.call(this, body)
  }

  next()
}

// Configuração do Morgan para logs em produção
export const morganLogger = morgan(
  process.env.NODE_ENV === 'production' 
    ? 'combined' // Formato Apache combined para produção
    : 'dev',     // Formato colorido para desenvolvimento
  {
    // Filtrar logs de health check em produção
    skip: (req: Request) => {
      return process.env.NODE_ENV === 'production' && req.path === '/api/health'
    }
  }
)

// Middleware para registrar ações de usuário
export const userActionLogger = (action: 'registration' | 'login') => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Override do res.json para registrar quando a ação for bem-sucedida
    const originalJson = res.json
    res.json = function(body: any) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        metricsSystem.recordUserAction(action)
        
        // Registrar usuário ativo se houver ID
        const userId = body?.user?.id || body?.data?.user?.id
        if (userId) {
          metricsSystem.recordActiveUser(userId)
        }
      }
      return originalJson.call(this, body)
    }
    next()
  }
}

// Middleware para registrar erros
export const errorLogger = (error: Error, req: Request, res: Response, next: NextFunction) => {
  // Registrar erro no sistema de métricas
  const userId = (req as any).user?.id
  metricsSystem.recordError(error.message, req.path, userId)
  
  // Log estruturado do erro
  const requestLogger = createRequestLogger(req)
  requestLogger.error(`Error in ${req.method} ${req.path}`, error, {
    userId,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  })
  
  next(error)
}

// Endpoint para métricas (protegido)
export const metricsEndpoint = (req: Request, res: Response) => {
  // Em produção, adicionar autenticação administrativa
  if (process.env.NODE_ENV === 'production') {
    const adminToken = req.headers['x-admin-token']
    if (!adminToken || adminToken !== process.env.ADMIN_METRICS_TOKEN) {
      return res.status(403).json({ error: 'Acesso negado' })
    }
  }

  const metrics = metricsSystem.getMetrics()
  return res.json(metrics)
}

// Middleware de limpeza periódica (executar a cada hora)
setInterval(() => {
  // Limpar métricas antigas se necessário
  const metrics = metricsSystem.getMetrics()
  
  // Log de métricas horárias
  globalLogger.info('Hourly System Metrics', {
    requests: metrics.requests.total,
    activeUsers: metrics.users.activeNow,
    errors: metrics.errors.total,
    memoryUsage: metrics.performance.memoryUsage.heapUsed,
    type: 'system-metrics'
  })
}, 60 * 60 * 1000) // 1 hora