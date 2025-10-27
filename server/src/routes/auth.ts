import { Router, Request, Response } from 'express'
import { AuthService } from '../services/AuthService'
import { AuthRequest, requireAuth } from '../middleware/auth'
import { 
  validateRegister, 
  validateLogin, 
  handleValidationErrors 
} from '../middleware/security'
import { authRateLimit, registerRateLimit } from '../middleware/rateLimiting'
import { userActionLogger } from '../middleware/monitoring'
import { checkTokenBlacklist } from '../services/TokenBlacklistService'

const router = Router()

// POST /api/auth/register - com rate limiting específico e validação
router.post('/register', 
  registerRateLimit,
  validateRegister,
  handleValidationErrors,
  userActionLogger('registration'),
  async (req: Request, res: Response) => {
    try {
      const { name, email, password, university, course, graduationYear } = req.body
      
      const result = await AuthService.register({
        name,
        email,
        password,
        university,
        course,
        graduationYear
      })

      return res.status(201).json(result)
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      })
    }
  }
)

// POST /api/auth/login - VERSÃO OTIMIZADA
router.post('/login',
  authRateLimit, // Manter rate limiting por segurança
  async (req: Request, res: Response) => {
    const startTime = Date.now()
    
    try {
      console.log('🚀 LOGIN OTIMIZADO - Início:', {
        email: req.body.email,
        ip: req.ip,
        timestamp: new Date().toISOString()
      })

      const { email, password, rememberMe } = req.body

      // Validação básica rápida
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email e senha são obrigatórios'
        })
      }

      // Usar apenas o login básico do AuthService sem complexidades extras
      const result = await AuthService.loginBasic({ 
        email: email.toLowerCase().trim(), 
        password: password.trim(),
        rememberMe: !!rememberMe
      })

      const responseTime = Date.now() - startTime
      console.log(`🎉 LOGIN SUCESSO - ${responseTime}ms:`, {
        email: result.data?.user.email,
        userId: result.data?.user._id,
        responseTime: `${responseTime}ms`
      })

      return res.status(200).json(result)
      
    } catch (error: any) {
      const responseTime = Date.now() - startTime
      console.error('💥 ERRO NO LOGIN:', {
        error: error.message,
        responseTime: `${responseTime}ms`,
        email: req.body.email
      })
      
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      })
    }
  }
)

// POST /api/auth/verify-email
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token de verificação é obrigatório'
      })
    }
    
    const result = await AuthService.verifyEmail(token)

    return res.status(200).json(result)
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    })
  }
})

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email é obrigatório'
      })
    }
    
    const result = await AuthService.forgotPassword(email)

    return res.status(200).json(result)
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    })
  }
})

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body
    
    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token e nova senha são obrigatórios'
      })
    }
    
    const result = await AuthService.resetPassword(token, password)

    return res.status(200).json(result)
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    })
  }
})

// POST /api/auth/change-password
router.post('/change-password', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Senha atual e nova senha são obrigatórias'
      })
    }
    
    const result = await AuthService.changePassword(
      (req.user as any)._id.toString(),
      currentPassword,
      newPassword
    )

    return res.status(200).json(result)
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    })
  }
})

// GET /api/auth/me
router.get('/me', checkTokenBlacklist, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      university: user.university,
      course: user.course,
      graduationYear: user.graduationYear,
      role: user.role,
      level: user.level,
      experience: user.experience,
      statistics: user.statistics,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }

    return res.status(200).json({
      success: true,
      message: 'Dados do usuário obtidos com sucesso',
      data: { user: userResponse }
    })
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    })
  }
})

// POST /api/auth/refresh-token
router.post('/refresh-token', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token é obrigatório'
      })
    }

    const user = await AuthService.validateRefreshToken(refreshToken)
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token inválido ou expirado'
      })
    }

    const result = await AuthService.refreshToken(user)

    return res.status(200).json(result)
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    })
  }
})

// POST /api/auth/logout
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    const { refreshToken, userId } = req.body
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token é obrigatório para logout'
      })
    }

    const result = await AuthService.logout(token, refreshToken, userId)

    return res.status(200).json(result)
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

// POST /api/auth/logout-all - Logout de todos os dispositivos
router.post('/logout-all', checkTokenBlacklist, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = (req.user as any)._id.toString()
    
    const result = await AuthService.logoutAllDevices(userId)

    return res.status(200).json(result)
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

// GET /api/auth/sessions - Obter sessões ativas do usuário
router.get('/sessions', checkTokenBlacklist, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = (req.user as any)._id.toString()
    
    const result = await AuthService.getUserSessions(userId)

    return res.status(200).json(result)
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

// GET /api/auth/security-alerts - Obter alertas de segurança do usuário
router.get('/security-alerts', checkTokenBlacklist, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = (req.user as any)._id.toString()
    const limit = parseInt(req.query.limit as string) || 10
    
    const { SecurityNotificationService } = await import('../services/SecurityNotificationService')
    const alerts = await SecurityNotificationService.getUserSecurityAlerts(userId, limit)
    const stats = await SecurityNotificationService.getSecurityStats(userId)

    return res.status(200).json({
      success: true,
      data: {
        alerts,
        stats
      }
    })
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

export default router