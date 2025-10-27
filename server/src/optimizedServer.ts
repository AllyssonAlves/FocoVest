import express from 'express'
import cors from 'cors'
import { mockUserDB, MockUser } from './services/MockUserService'
import { generateToken } from './middleware/auth'
import bcrypt from 'bcryptjs'

const app = express()
const port = 5000

// Middleware básico
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))

// Rate limiting simples (em memória)
const loginAttempts = new Map<string, { count: number, lastAttempt: Date }>()

const isRateLimited = (ip: string): boolean => {
  const attempts = loginAttempts.get(ip)
  if (!attempts) return false
  
  const now = new Date()
  const timeDiff = now.getTime() - attempts.lastAttempt.getTime()
  
  // Reset após 15 minutos
  if (timeDiff > 15 * 60 * 1000) {
    loginAttempts.delete(ip)
    return false
  }
  
  return attempts.count >= 5
}

const recordLoginAttempt = (ip: string, success: boolean) => {
  const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: new Date() }
  
  if (success) {
    loginAttempts.delete(ip) // Limpar tentativas em caso de sucesso
  } else {
    attempts.count++
    attempts.lastAttempt = new Date()
    loginAttempts.set(ip, attempts)
  }
}

// Endpoint de login otimizado
app.post('/api/auth/login', async (req, res) => {
  const startTime = Date.now()
  const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1'
  
  try {
    console.log('🚀 LOGIN OTIMIZADO - Início:', {
      email: req.body.email,
      ip: clientIp,
      timestamp: new Date().toISOString()
    })

    // Verificar rate limiting
    if (isRateLimited(clientIp)) {
      console.log('⛔ Rate limit atingido para IP:', clientIp)
      recordLoginAttempt(clientIp, false)
      return res.status(429).json({
        success: false,
        message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
      })
    }

    const { email, password } = req.body

    // Validação básica
    if (!email || !password) {
      recordLoginAttempt(clientIp, false)
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      })
    }

    console.log('🔍 Buscando usuário:', email)

    // Buscar usuário (otimizado)
    const user = await MockUser.findOne({ 
      email: email.toLowerCase() 
    })

    if (!user) {
      console.log('❌ Usuário não encontrado:', email)
      recordLoginAttempt(clientIp, false)
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      })
    }

    console.log('✅ Usuário encontrado, verificando senha...')

    // Verificar senha (otimizado)
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      console.log('❌ Senha incorreta para:', email)
      recordLoginAttempt(clientIp, false)
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      })
    }

    console.log('🎯 Senha correta, gerando token...')

    // Gerar token (otimizado)
    const token = generateToken(user)

    // Atualizar último login de forma assíncrona (não bloquear resposta)
    setImmediate(async () => {
      try {
        await mockUserDB.findByIdAndUpdate(user._id.toString(), { 
          lastLoginAt: new Date() 
        })
        console.log('📝 Último login atualizado para:', user.email)
      } catch (error) {
        console.log('⚠️ Erro ao atualizar último login:', error)
      }
    })

    // Resposta otimizada (sem dados desnecessários)
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      university: user.university,
      course: user.course,
      role: user.role,
      level: user.level,
      experience: user.experience,
      statistics: user.statistics
    }

    recordLoginAttempt(clientIp, true)
    
    const responseTime = Date.now() - startTime
    console.log(`🎉 LOGIN SUCESSO - ${responseTime}ms:`, {
      email: user.email,
      userId: user._id,
      responseTime: `${responseTime}ms`
    })

    return res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: userResponse,
        token,
        expiresIn: 24 * 60 * 60 // 24 horas
      }
    })

  } catch (error: any) {
    const responseTime = Date.now() - startTime
    console.error('💥 ERRO NO LOGIN:', {
      error: error.message,
      stack: error.stack,
      responseTime: `${responseTime}ms`
    })
    
    recordLoginAttempt(clientIp, false)

    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

// Endpoint de verificação de saúde
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  })
})

// Endpoint de usuários (para debug)
app.get('/api/users', async (req, res) => {
  try {
    const users = mockUserDB.getAllUsers().map(user => {
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    })
    res.json({
      success: true,
      data: users
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar usuários'
    })
  }
})

// Middleware de erro global
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('💥 Erro global:', error)
  
  if (!res.headersSent) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

// Inicializar servidor
const startServer = async () => {
  try {
    console.log('🔧 Inicializando MockDB...')
    
    // O MockDB já se inicializa automaticamente no construtor
    console.log('✅ MockDB inicializado com sucesso')
    console.log('👥 Usuários disponíveis:')
    console.log('  📧 joao@teste.com (senha: 123456)')
    console.log('  📧 maria@teste.com (senha: senha123)')
    
    app.listen(port, () => {
      console.log('🚀 SERVIDOR OTIMIZADO RODANDO!')
      console.log(`📊 Porta: ${port}`)
      console.log(`🌐 API: http://localhost:${port}/api`)
      console.log(`💚 Health: http://localhost:${port}/api/health`)
      console.log(`👤 Users: http://localhost:${port}/api/users`)
      console.log('⚡ Otimizações aplicadas:')
      console.log('  - Login simplificado (sem SessionService)')
      console.log('  - Rate limiting em memória')
      console.log('  - Atualizações assíncronas')
      console.log('  - Middleware mínimo')
      console.log('  - Logs de performance')
    })

  } catch (error) {
    console.error('💥 Erro ao inicializar servidor:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Recebido SIGTERM, finalizando servidor...')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('🛑 Recebido SIGINT, finalizando servidor...')
  process.exit(0)
})

startServer()