import { Router, Request, Response } from 'express'
import { AuthService } from '../services/AuthService'
import { AuthRequest, requireAuth } from '../middleware/auth'
import { 
  validateRegister, 
  validateLogin, 
  handleValidationErrors 
} from '../middleware/security'
import { registerRateLimit } from '../middleware/rateLimiting'
import { userActionLogger } from '../middleware/monitoring'

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

// POST /api/auth/login - com validação
router.post('/login',
  validateLogin,
  handleValidationErrors,
  userActionLogger('login'),
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body
      
      const result = await AuthService.login({ email, password })

      return res.status(200).json(result)
    } catch (error: any) {
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
router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
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
router.post('/refresh-token', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const result = await AuthService.refreshToken(req.user!)

    return res.status(200).json(result)
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    })
  }
})

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  try {
    // Para logout, no caso de JWT, é principalmente no cliente
    // Aqui podemos implementar blacklist de tokens se necessário
    return res.status(200).json({
      success: true,
      message: 'Logout realizado com sucesso'
    })
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

export default router