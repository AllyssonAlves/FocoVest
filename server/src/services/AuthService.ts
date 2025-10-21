import User, { IUser } from '../models/User'
import { MockUser, mockUserDB } from './MockUserService'
import { generateToken } from '../middleware/auth'
import { createError } from '../middleware/errorHandler'
import { University, UserRole } from '../../../shared/dist/types'

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
}

export interface AuthResponse {
  success: boolean
  message: string
  data?: {
    user: Partial<IUser>
    token: string
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

      // Gerar JWT token
      const token = generateToken(user)
      console.log('🔑 AuthService: Token JWT gerado')

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
          token
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

  static async login(data: LoginData): Promise<AuthResponse> {
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

      console.log('✅ AuthService: Senha correta, gerando token...')
      console.log('🔑 AuthService: Dados do usuário para token:', { 
        id: user._id, 
        email: user.email, 
        tipo_id: typeof user._id 
      })

      // Gerar JWT token
      const token = generateToken(user)
      console.log('🎟️  AuthService: Token gerado com payload para userId:', user._id)

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
          token
        }
      }

    } catch (error: any) {
      console.log('❌ AuthService: Erro no login:', error.message)
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

  static async refreshToken(user: IUser): Promise<AuthResponse> {
    try {
      const token = generateToken(user)

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
          token
        }
      }

    } catch (error: any) {
      throw error
    }
  }
}