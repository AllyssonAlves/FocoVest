import express from 'express'
import compression from 'compression'
import { connectDB } from './config/database'
import { errorHandler } from './middleware/errorHandler'

// Security middleware imports
import cors from 'cors'
import { getCorsOptions } from './middleware/corsConfig'
import { 
  generalRateLimit,
  authRateLimit,
  registerRateLimit,
  simulationRateLimit
} from './middleware/rateLimiting'
import { 
  securityMiddleware,
  validateRegister,
  validateLogin,
  validateSimulationCreation,
  handleValidationErrors
} from './middleware/security'

// Advanced security middleware
import {
  setupSecurity,
  deviceFingerprinting,
  maliciousPatternDetection,
  csrfProtection,
  securityLogger
} from './middleware/advancedSecurity'

// Production monitoring
import { 
  monitoringMiddleware, 
  healthCheckEndpoint, 
  initializeMonitoring 
} from './middleware/productionMonitoring'

// Monitoring middleware imports
import {
  requestLogger,
  morganLogger,
  userActionLogger,
  errorLogger,
  metricsEndpoint
} from './middleware/monitoring'

// Routes
import authRoutes from './routes/auth'
import userRoutes from './routes/users'
import questionRoutes from './routes/questions'
import simulationRoutes from './routes/simulations'
import rankingRoutes from './routes/rankings'
import aiRoutes from './routes/ai'

// Cache service
import { statisticsCacheService } from './services/StatisticsCacheService'

const app = express()

// Production monitoring (primeiro para capturar todas as métricas)
if (process.env.NODE_ENV === 'production') {
  app.use(monitoringMiddleware)
}

// Logging middleware
app.use(morganLogger)
app.use(requestLogger)

// Advanced security setup
setupSecurity(app, {
  enableCSRF: false, // Desabilitado temporariamente para desenvolvimento
  enableRateLimit: false, // Usaremos os rate limits existentes
  enableSlowDown: true,
  enableFingerprinting: true,
  allowedOrigins: ['http://localhost:3000', 'http://localhost:5173']
})

// Additional security middlewares
app.use(securityLogger)
app.use(deviceFingerprinting)
app.use(maliciousPatternDetection)

// Security & Performance middleware
app.use(securityMiddleware)
app.use(compression())
app.use(cors(getCorsOptions()))

// Rate limiting - aplicar limite geral primeiro
app.use(generalRateLimit)

// Body parsing com limites de segurança
app.use(express.json({ 
  limit: '5mb',
  strict: true
}))
app.use(express.urlencoded({ 
  extended: true, 
  limit: '5mb',
  parameterLimit: 100
}))

// Routes with specific rate limiting
app.use('/api/auth', authRateLimit, authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/questions', questionRoutes)
app.use('/api/simulations', simulationRateLimit, simulationRoutes)
app.use('/api/rankings', rankingRoutes)
app.use('/api/ai', aiRoutes)

// Health check e monitoramento
app.get('/api/health', healthCheckEndpoint)
app.get('/api/health/simple', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  })
})

// Métricas de monitoramento (usar o endpoint existente)
app.get('/api/monitoring/metrics', metricsEndpoint)

// Métricas do sistema (para monitoramento)
app.get('/api/metrics', metricsEndpoint)

// Error handling
app.use(errorLogger)  // Registrar erros no sistema de métricas
app.use(errorHandler)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

const PORT = process.env.PORT || 5000

// Start server
const startServer = async () => {
  try {
    // Rodando com MockDB apenas - não conectar ao MongoDB
    console.warn('⚠️  Rodando em modo de desenvolvimento com MockDB')
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
      console.log(`🌐 API available at http://localhost:${PORT}/api`)
      console.log(`🎯 Use as credenciais de teste:`)
      console.log(`  📧 joao@teste.com (senha: 123456)`)
      console.log(`  📧 maria@teste.com (senha: senha123)`)
      
      // Inicializar sistemas em background
      if (process.env.NODE_ENV !== 'test') {
        // Cache de estatísticas
        statisticsCacheService.warmupCache({ 
          background: true, 
          limit: process.env.NODE_ENV === 'production' ? 5 : 2 
        })
        
        // Sistema de monitoramento
        if (process.env.NODE_ENV === 'production') {
          initializeMonitoring()
        }
      }
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

export default app