import User, { IUser } from '../models/User'
import { MockUser, mockUserDB } from './MockUserService'
import { generateToken, verifyToken } from '../middleware/auth'
import { createError } from '../middleware/errorHandler'
import { University, UserRole } from '../../../shared/dist/types'
import { tokenBlacklistService } from './TokenBlacklistService'
import { SessionService, DeviceInfo } from './SessionService'
import { SecurityNotificationService } from './SecurityNotificationService'
import jwt from 'jsonwebtoken'
import { Request } from 'express'

// Verificar se MongoDB está disponível
const isMongoAvailable = () => {
  try {
    // Verificar se mongoose está conectado
    const mongoose = require('mongoose')
    return mongoose.connection.readyState === 1
  } catch (error) {
    return false
  }
}

export interface RegisterData {
  name: string
  email: string
  password: string
  university?: University
  course?: string
  graduationYear?: number
}

export interface LoginData {
  email: string
  password: string
  rememberMe?: boolean
  deviceInfo?: Partial<DeviceInfo>
}

export interface AuthResponse {
  success: boolean
  message: string
  data?: {
    user: Partial<IUser>
    token: string
    refreshToken?: string
    expiresIn?: number
  }
}

export class AuthService {
  static async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const UserModel = isMongoAvailable() ? User : MockUser
      
      console.log('📝 AuthService: Iniciando registro para:', data.email)
      console.log('🔧 AuthService: Usando', isMongoAvailable() ? 'MongoDB' : 'MockDB')
      
      // Verificar se o email já existe
      const existingUser = await UserModel.findOne({ email: data.email.toLowerCase() })
      
      if (existingUser) {
        console.log('❌ AuthService: Email já existe:', data.email)
        throw createError('Email já está em uso', 400)
      }

      // Validar dados
      if (!data.name || data.name.trim().length < 2) {
        throw createError('Nome deve ter pelo menos 2 caracteres', 400)
      }

      if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) {
        throw createError('Email deve ter um formato válido', 400)
      }

      if (!data.password || data.password.length < 8) {
        throw createError('Senha deve ter pelo menos 8 caracteres', 400)
      }

      // Validar ano de graduação se fornecido
      if (data.graduationYear) {
        const currentYear = new Date().getFullYear()
        if (data.graduationYear < currentYear || data.graduationYear > currentYear + 10) {
          throw createError('Ano de graduação deve estar entre o ano atual e 10 anos no futuro', 400)
        }
      }

      console.log('✅ AuthService: Dados validados, criando usuário...')

      // Criar usuário
      const userData = {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        password: data.password,
        university: data.university,
        course: data.course?.trim(),
        graduationYear: data.graduationYear,
        role: UserRole.STUDENT,
        isEmailVerified: true // Para teste, considerar como verificado
      }

      let user: IUser
      
      if (isMongoAvailable()) {
        user = new User(userData)
        const emailVerificationToken = user.generateEmailVerificationToken()
        await user.save()
        console.log(`Email verification token for ${user.email}: ${emailVerificationToken}`)
      } else {
        user = await MockUser.create(userData) as IUser
        console.log('✅ AuthService: Usuário criado no MockDB')
      }

      // Gerar JWT token e refresh token
      const token = generateToken(user)
      const refreshToken = this.generateRefreshToken(user)
      console.log('🔑 AuthService: Tokens JWT e refresh gerados')

      // Remover senha da resposta
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

      console.log('🎉 AuthService: Registro concluído com sucesso!')
      
      return {
        success: true,
        message: 'Usuário registrado com sucesso.',
        data: {
          user: userResponse,
          token,
          refreshToken,
          expiresIn: 24 * 60 * 60 // 24 horas em segundos
        }
      }

    } catch (error: any) {
      console.log('❌ AuthService: Erro no registro:', error.message)
      if (error.code === 11000) {
        throw createError('Email já está em uso', 400)
      }
      throw error
    }
  }

  static async login(data: LoginData, req?: Request): Promise<AuthResponse> {
    try {
      const UserModel = isMongoAvailable() ? User : MockUser
      
      console.log('🔑 AuthService: Iniciando login para:', data.email)
      console.log('🔧 AuthService: Usando', isMongoAvailable() ? 'MongoDB' : 'MockDB')

      if (!data.email || !data.password) {
        throw createError('Email e senha são obrigatórios', 400)
      }

      // Buscar usuário
      let user: IUser | null
      
      if (isMongoAvailable()) {
        user = await User.findOne({ 
          email: data.email.toLowerCase() 
        }).select('+password')
      } else {
        user = await MockUser.findOne({ 
          email: data.email.toLowerCase() 
        })
      }

      if (!user) {
        console.log('❌ AuthService: Usuário não encontrado:', data.email)
        throw createError('Email ou senha incorretos', 401)
      }

      console.log('✅ AuthService: Usuário encontrado, verificando senha...')

      // Verificar senha
      let isPasswordValid: boolean
      
      if (isMongoAvailable()) {
        isPasswordValid = await (user as any).comparePassword(data.password)
      } else {
        // Para MockUser, usar bcrypt diretamente
        const bcrypt = require('bcryptjs')
        isPasswordValid = await bcrypt.compare(data.password, user.password)
      }
      
      if (!isPasswordValid) {
        console.log('❌ AuthService: Senha incorreta para:', data.email)
        throw createError('Email ou senha incorretos', 401)
      }

      console.log('✅ AuthService: Senha correta, gerando tokens...')
      console.log('🔑 AuthService: Dados do usuário para token:', { 
        id: user._id, 
        email: user.email, 
        tipo_id: typeof user._id 
      })

      // Gerar JWT token e refresh token
      const token = generateToken(user)
      const refreshToken = this.generateRefreshToken(user)
      console.log('🎟️  AuthService: Tokens gerados para userId:', user._id)

      // Criar sessão se informações do dispositivo estiverem disponíveis
      if (req) {
        const deviceInfo = data.deviceInfo || SessionService.extractDeviceInfo(req)
        const userId = (user._id as any).toString()
        await SessionService.createSession(userId, deviceInfo, refreshToken)
        console.log('📱 AuthService: Sessão criada para dispositivo')

        // Verificar se é um novo dispositivo e criar alerta de segurança
        const { isNewDevice, alert } = await SecurityNotificationService.checkNewDeviceLogin(
          userId, 
          req
        )
        
        if (isNewDevice && alert) {
          console.log('🔔 Novo dispositivo detectado, alerta de segurança criado')
        }
      }
      
      // Atualizar último login
      if (isMongoAvailable()) {
        (user as any).lastLoginAt = new Date()
        await (user as any).save()
      } else {
        // Para MockUser, atualizar via findByIdAndUpdate
        const userId = (user._id as any).toString()
        await mockUserDB.findByIdAndUpdate(userId, { lastLoginAt: new Date() })
      }

      // Remover senha da resposta
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

      console.log('🎉 AuthService: Login realizado com sucesso!')

      return {
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          user: userResponse,
          token,
          refreshToken,
          expiresIn: data.rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60 // 30 dias se "lembrar" ou 24 horas
        }
      }

    } catch (error: any) {
      console.log('❌ AuthService: Erro no login:', error.message)
      
      // Registrar tentativa de login falhada se for erro de autenticação
      if (req && (error.message?.includes('incorretos') || error.message?.includes('não encontrado'))) {
        await SecurityNotificationService.recordFailedLogin(data.email, req)
      }
      
      throw error
    }
  }

  // Versão otimizada do login sem complexidades extras
  static async loginBasic(data: { email: string; password: string; rememberMe?: boolean }): Promise<AuthResponse> {
    try {
      console.log('⚡ AuthService.loginBasic: Início para:', data.email)
      
      if (!data.email || !data.password) {
        throw createError('Email e senha são obrigatórios', 400)
      }

      // Buscar usuário (sempre usar MockDB para desenvolvimento otimizado)
      const user = await MockUser.findOne({ 
        email: data.email.toLowerCase() 
      })

      if (!user) {
        console.log('❌ AuthService.loginBasic: Usuário não encontrado:', data.email)
        throw createError('Email ou senha incorretos', 401)
      }

      // Verificar senha
      const bcrypt = require('bcryptjs')
      const isPasswordValid = await bcrypt.compare(data.password, user.password)
      
      if (!isPasswordValid) {
        console.log('❌ AuthService.loginBasic: Senha incorreta para:', data.email)
        throw createError('Email ou senha incorretos', 401)
      }

      console.log('✅ AuthService.loginBasic: Autenticação bem-sucedida')

      // Gerar token
      const token = generateToken(user)
      
      // Atualizar último login de forma assíncrona (não bloquear resposta)
      setImmediate(async () => {
        try {
          const userId = (user._id as any).toString()
          await mockUserDB.findByIdAndUpdate(userId, { lastLoginAt: new Date() })
        } catch (error) {
          console.log('⚠️ Erro ao atualizar último login:', error)
        }
      })

      // Resposta otimizada
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
        statistics: user.statistics,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }

      console.log('🎉 AuthService.loginBasic: Login concluído com sucesso!')

      return {
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          user: userResponse,
          token,
          expiresIn: data.rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60
        }
      }

    } catch (error: any) {
      console.log('❌ AuthService.loginBasic: Erro:', error.message)
      throw error
    }
  }

  static async verifyEmail(token: string): Promise<AuthResponse> {
    try {
      const user = await User.findOne({ 
        emailVerificationToken: token 
      }).select('+emailVerificationToken')

      if (!user) {
        throw createError('Token de verificação inválido', 400)
      }

      user.isEmailVerified = true
      user.emailVerificationToken = undefined
      await user.save()

      return {
        success: true,
        message: 'Email verificado com sucesso'
      }

    } catch (error: any) {
      throw error
    }
  }

  static async forgotPassword(email: string): Promise<AuthResponse> {
    try {
      const user = await User.findOne({ email: email.toLowerCase() })

      if (!user) {
        // Por segurança, não revelar se o email existe
        return {
          success: true,
          message: 'Se o email existir, você receberá instruções para redefinir sua senha'
        }
      }

      const resetToken = user.generatePasswordResetToken()
      await user.save()

      // TODO: Enviar email com token de reset
      console.log(`Password reset token for ${user.email}: ${resetToken}`)

      return {
        success: true,
        message: 'Se o email existir, você receberá instruções para redefinir sua senha'
      }

    } catch (error: any) {
      throw error
    }
  }

  static async resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
    try {
      if (!newPassword || newPassword.length < 8) {
        throw createError('Nova senha deve ter pelo menos 8 caracteres', 400)
      }

      const user = await User.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: new Date() }
      }).select('+passwordResetToken +passwordResetExpires')

      if (!user) {
        throw createError('Token de redefinição inválido ou expirado', 400)
      }

      user.password = newPassword
      user.passwordResetToken = undefined
      user.passwordResetExpires = undefined
      await user.save()

      return {
        success: true,
        message: 'Senha redefinida com sucesso'
      }

    } catch (error: any) {
      throw error
    }
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<AuthResponse> {
    try {
      const UserModel = isMongoAvailable() ? User : MockUser

      if (!newPassword || newPassword.length < 8) {
        throw createError('Nova senha deve ter pelo menos 8 caracteres', 400)
      }

      let user: IUser | null

      if (isMongoAvailable()) {
        user = await User.findById(userId).select('+password')
      } else {
        user = await MockUser.findById(userId)
      }

      if (!user) {
        throw createError('Usuário não encontrado', 404)
      }

      // Verificar senha atual
      let isCurrentPasswordValid: boolean
      
      if (isMongoAvailable()) {
        isCurrentPasswordValid = await (user as any).comparePassword(currentPassword)
      } else {
        const bcrypt = require('bcryptjs')
        isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
      }
      
      if (!isCurrentPasswordValid) {
        throw createError('Senha atual incorreta', 400)
      }

      user.password = newPassword
      await user.save()

      return {
        success: true,
        message: 'Senha alterada com sucesso'
      }

    } catch (error: any) {
      throw error
    }
  }

  static async refreshToken(user: IUser, oldToken?: string): Promise<AuthResponse> {
    try {
      // Se há token antigo, adiciona à blacklist
      if (oldToken) {
        try {
          const decoded = jwt.decode(oldToken) as any
          if (decoded && decoded.exp) {
            const expiresAt = new Date(decoded.exp * 1000)
            tokenBlacklistService.blacklistToken(
              oldToken, 
              (user._id as any).toString(), 
              expiresAt, 
              'logout'
            )
          }
        } catch (error) {
          console.log('⚠️ Erro ao decodificar token antigo:', error)
        }
      }

      // Gera novo token
      const token = generateToken(user)
      const refreshToken = this.generateRefreshToken(user)

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

      return {
        success: true,
        message: 'Token renovado com sucesso',
        data: {
          user: userResponse,
          token,
          refreshToken,
          expiresIn: 24 * 60 * 60 // 24 horas em segundos
        }
      }

    } catch (error: any) {
      throw error
    }
  }

  static async logout(
    token: string, 
    refreshToken?: string, 
    userId?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Decodifica o token para obter informações
      const decoded = jwt.decode(token) as any
      
      if (decoded && decoded.exp) {
        const expiresAt = new Date(decoded.exp * 1000)
        const userIdFromToken = decoded.userId || userId
        
        // Adiciona o access token à blacklist
        tokenBlacklistService.blacklistToken(
          token, 
          userIdFromToken, 
          expiresAt, 
          'logout'
        )

        // Invalida a sessão específica se refresh token for fornecido
        if (refreshToken) {
          await SessionService.invalidateSessionByRefreshToken(refreshToken)
          console.log('🔄 Sessão invalidada via refresh token')
        }
      }

      return {
        success: true,
        message: 'Logout realizado com sucesso'
      }

    } catch (error: any) {
      console.log('⚠️ Erro no logout:', error)
      return {
        success: true,
        message: 'Logout realizado com sucesso'
      }
    }
  }

  static async logoutAllDevices(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Invalidar todas as sessões do usuário
      await SessionService.invalidateAllUserSessions(userId)
      
      // Adicionar todos os tokens à blacklist
      tokenBlacklistService.blacklistAllUserTokens(userId, 'security')
      
      console.log('🚪 Logout de todos os dispositivos para usuário:', userId)

      return {
        success: true,
        message: 'Logout realizado em todos os dispositivos'
      }

    } catch (error: any) {
      console.log('⚠️ Erro no logout de todos os dispositivos:', error)
      return {
        success: false,
        message: 'Erro ao fazer logout de todos os dispositivos'
      }
    }
  }

  static async getUserSessions(userId: string): Promise<{
    success: boolean;
    data?: {
      activeSessions: any[];
      stats: {
        activeSessions: number;
        totalDevices: number;
        lastActivity: Date | null;
      };
    };
  }> {
    try {
      const sessions = await SessionService.findUserActiveSessions(userId)
      const stats = await SessionService.getSessionStats(userId)

      return {
        success: true,
        data: {
          activeSessions: sessions.map(session => ({
            deviceId: session.deviceInfo.id,
            browser: session.deviceInfo.browser,
            os: session.deviceInfo.os,
            ip: session.deviceInfo.ip,
            lastActivity: session.deviceInfo.lastActivity,
            createdAt: session.deviceInfo.createdAt
          })),
          stats
        }
      }

    } catch (error: any) {
      console.log('⚠️ Erro ao obter sessões do usuário:', error)
      return {
        success: false
      }
    }
  }

  static async validateRefreshToken(refreshToken: string): Promise<IUser | null> {
    try {
      const decoded = verifyToken(refreshToken) as any
      
      if (!decoded || !decoded.userId) {
        return null
      }

      const UserModel = isMongoAvailable() ? User : MockUser
      const user = await UserModel.findById(decoded.userId)

      return user
    } catch (error) {
      return null
    }
  }

  private static generateRefreshToken(user: IUser): string {
    const JWT_SECRET = process.env.JWT_SECRET || 'focovest-secret-key-2024'
    
    return jwt.sign(
      { 
        userId: user._id,
        type: 'refresh'
      },
      JWT_SECRET,
      { expiresIn: '30d' } // Refresh token válido por 30 dias
    )
  }

  static async securityLogout(userId: string, reason: string = 'Atividade suspeita'): Promise<void> {
    try {
      // Invalida todos os tokens do usuário
      tokenBlacklistService.blacklistAllUserTokens(userId, 'security')
      
      console.log(`🚨 Logout de segurança executado para usuário ${userId}: ${reason}`)
    } catch (error: any) {
      console.error('❌ Erro no logout de segurança:', error)
    }
  }
}