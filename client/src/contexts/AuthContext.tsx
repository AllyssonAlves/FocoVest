import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react'
import UserService, { SimulationResults } from '../services/UserService'
import config from '../config/environment'
import apiUrls from '../config/apiUrls'

// Tipos
interface User {
  _id: string
  name: string
  email: string
  avatar?: string
  university?: string
  course?: string
  graduationYear?: number
  role: string
  level: number
  experience: number
  statistics: {
    totalSimulations: number
    totalQuestions: number
    correctAnswers: number
    averageScore: number
    timeSpent: number
    streakDays: number
    lastSimulationDate?: string
  }
  isEmailVerified: boolean
  createdAt: string
  updatedAt: string
}

interface LoginOptions {
  rememberMe?: boolean
  deviceInfo?: {
    userAgent?: string
    platform?: string
    language?: string
  }
}

interface AuthContextType {
  user: User | null
  token: string | null
  refreshToken: string | null
  isLoading: boolean
  isAuthenticated: boolean
  loginAttempts: number
  lastLoginAttempt: Date | null
  login: (email: string, password: string, options?: LoginOptions) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => Promise<void>
  updateStatistics: (simulationResults: SimulationResults) => Promise<void>
  refreshUser: () => Promise<void>
  refreshAuthToken: () => Promise<boolean>
  clearLoginAttempts: () => void
}

interface RegisterData {
  name: string
  email: string
  password: string
  university?: string
  course?: string
}

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider
interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [lastLoginAttempt, setLastLoginAttempt] = useState<Date | null>(null)
  const tokenValidationInterval = useRef<NodeJS.Timeout | null>(null)

  const isAuthenticated = !!user && !!token

  // Função para validar se o token ainda é válido
  const isTokenExpired = useCallback((token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      return payload.exp < currentTime
    } catch (error) {
      return true
    }
  }, [])

  // Função para renovar token
  const refreshAuthToken = useCallback(async (): Promise<boolean> => {
    try {
      const currentRefreshToken = localStorage.getItem(config.refreshTokenKey)
      if (!currentRefreshToken) {
        throw new Error('Refresh token não encontrado')
      }

      const response = await fetch(apiUrls.auth.refreshToken, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: currentRefreshToken })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Erro ao renovar token')
      }

      const { token: newToken, refreshToken: newRefreshToken } = data.data
      
      setToken(newToken)
      if (newRefreshToken) {
        setRefreshToken(newRefreshToken)
        localStorage.setItem(config.refreshTokenKey, newRefreshToken)
      }
      localStorage.setItem(config.tokenKey, newToken)

      console.log('✅ Token renovado com sucesso')
      return true
    } catch (error) {
      console.error('❌ Erro ao renovar token:', error)
      await logout()
      return false
    }
  }, [])

  // Verificar token existente no localStorage e configurar validação automática
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem(config.tokenKey)
      const savedRefreshToken = localStorage.getItem(config.refreshTokenKey)
      const savedUser = localStorage.getItem(config.userKey)

      if (savedToken && savedUser) {
        try {
          // Verificar se o token não expirou
          if (isTokenExpired(savedToken)) {
            console.log('⏰ Token expirado, tentando renovar...')
            if (savedRefreshToken) {
              setRefreshToken(savedRefreshToken)
              const renewed = await refreshAuthToken()
              if (!renewed) {
                setIsLoading(false)
                return
              }
            } else {
              console.log('❌ Refresh token não encontrado, fazendo logout')
              localStorage.clear()
              setIsLoading(false)
              return
            }
          } else {
            setToken(savedToken)
            if (savedRefreshToken) {
              setRefreshToken(savedRefreshToken)
            }
          }

          setUser(JSON.parse(savedUser))
          
          // Configurar validação automática do token
          if (tokenValidationInterval.current) {
            clearInterval(tokenValidationInterval.current)
          }
          
          tokenValidationInterval.current = setInterval(async () => {
            const currentToken = localStorage.getItem(config.tokenKey)
            if (currentToken && isTokenExpired(currentToken)) {
              await refreshAuthToken()
            }
          }, 5 * 60 * 1000) // Verificar a cada 5 minutos
          
        } catch (error) {
          console.error('Erro ao carregar dados de autenticação:', error)
          localStorage.clear()
        }
      }
      
      setIsLoading(false)
    }

    initializeAuth()

    // Cleanup
    return () => {
      if (tokenValidationInterval.current) {
        clearInterval(tokenValidationInterval.current)
      }
    }
  }, [isTokenExpired, refreshAuthToken])

  const login = async (email: string, password: string, options?: LoginOptions) => {
    try {
      setIsLoading(true)
      setLastLoginAttempt(new Date())
      
      // Preparar dados do dispositivo
      const deviceInfo = options?.deviceInfo || {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language
      }
      
      const loginData = {
        email: email.trim().toLowerCase(),
        password,
        rememberMe: options?.rememberMe || false,
        deviceInfo
      }
      
      // Em desenvolvimento, usar proxy do Vite, em produção usar URL completa
      const loginUrl = import.meta.env.DEV ? '/api/auth/login' : apiUrls.auth.login
      
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest', // CSRF protection
        },
        body: JSON.stringify(loginData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro no login')
      }

      if (data.success && data.data) {
        const { user: userData, token: userToken, refreshToken: userRefreshToken } = data.data
        
        // Resetar tentativas de login ao sucesso
        setLoginAttempts(0)
        setLastLoginAttempt(null)
        
        setUser(userData)
        setToken(userToken)
        if (userRefreshToken) {
          setRefreshToken(userRefreshToken)
        }
        
        // Salvar no localStorage
        localStorage.setItem(config.tokenKey, userToken)
        localStorage.setItem(config.userKey, JSON.stringify(userData))
        if (userRefreshToken) {
          localStorage.setItem(config.refreshTokenKey, userRefreshToken)
        }
        
        console.log('✅ Login realizado com sucesso:', userData.email)

        // Configurar validação automática do token
        if (tokenValidationInterval.current) {
          clearInterval(tokenValidationInterval.current)
        }
        
        tokenValidationInterval.current = setInterval(async () => {
          const currentToken = localStorage.getItem(config.tokenKey)
          if (currentToken && isTokenExpired(currentToken)) {
            await refreshAuthToken()
          }
        }, 5 * 60 * 1000)
        
      } else {
        throw new Error('Resposta inválida do servidor')
      }
    } catch (error: any) {
      console.error('Erro no login:', error)
      
      // Incrementar tentativas de login
      setLoginAttempts(prev => prev + 1)
      
      // Log de segurança
      if (error.message?.includes('Rate limit') || error.message?.includes('Muitas tentativas')) {
        console.warn('🚨 Rate limit atingido no login')
      }
      
      throw new Error(error.message || 'Erro no login')
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true)
      
      const response = await fetch(apiUrls.auth.register, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro no registro')
      }

      if (data.success && data.data) {
        const { user: newUser, token: userToken, refreshToken: userRefreshToken } = data.data
        
        setUser(newUser)
        setToken(userToken)
        if (userRefreshToken) {
          setRefreshToken(userRefreshToken)
        }
        
        // Salvar no localStorage
        localStorage.setItem(config.tokenKey, userToken)
        localStorage.setItem(config.userKey, JSON.stringify(newUser))
        if (userRefreshToken) {
          localStorage.setItem(config.refreshTokenKey, userRefreshToken)
        }
      } else {
        throw new Error('Resposta inválida do servidor')
      }
    } catch (error: any) {
      console.error('Erro no registro:', error)
      throw new Error(error.message || 'Erro no registro')
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      // Tentar invalidar token no servidor
      const currentToken = localStorage.getItem(config.tokenKey)
      const currentRefreshToken = localStorage.getItem(config.refreshTokenKey)
      
      if (currentToken) {
        try {
          const logoutUrl = import.meta.env.DEV ? '/api/auth/logout' : apiUrls.auth.logout
          
          await fetch(logoutUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${currentToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              refreshToken: currentRefreshToken,
              userId: user?._id 
            })
          })
          console.log('✅ Token invalidado no servidor')
        } catch (error) {
          console.warn('⚠️ Erro ao invalidar token no servidor:', error)
          // Continuar com logout local mesmo se falhar no servidor
        }
      }
    } finally {
      // Limpar estado local
      setUser(null)
      setToken(null)
      setRefreshToken(null)
      
      // Limpar localStorage
      localStorage.removeItem(config.tokenKey)
      localStorage.removeItem(config.userKey)
      localStorage.removeItem(config.refreshTokenKey)
      
      // Limpar interval de validação
      if (tokenValidationInterval.current) {
        clearInterval(tokenValidationInterval.current)
        tokenValidationInterval.current = null
      }
      
      console.log('✅ Logout realizado com sucesso')
    }
  }

  const updateStatistics = async (simulationResults: SimulationResults) => {
    try {
      console.log('📊 AuthContext: Atualizando estatísticas do usuário...')
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const result = await UserService.updateStatistics(simulationResults)
      
      // Atualizar o usuário no contexto com as novas estatísticas
      const updatedUser = {
        ...user,
        statistics: result.statistics,
        experience: result.experience,
        updatedAt: new Date().toISOString()
      }

      setUser(updatedUser)
      localStorage.setItem('focovest_user', JSON.stringify(updatedUser))
      
      console.log('✅ AuthContext: Estatísticas atualizadas no contexto')
    } catch (error) {
      console.error('❌ AuthContext: Erro ao atualizar estatísticas:', error)
      throw error
    }
  }

  const refreshUser = async () => {
    try {
      console.log('🔄 AuthContext: Recarregando dados do usuário...')
      
      const currentToken = localStorage.getItem(config.tokenKey)
      if (!currentToken) {
        throw new Error('Token não encontrado')
      }

      // Verificar se token expirou e tentar renovar
      if (isTokenExpired(currentToken)) {
        const renewed = await refreshAuthToken()
        if (!renewed) {
          throw new Error('Falha ao renovar token')
        }
      }

      const response = await fetch(apiUrls.user.profile, {
        headers: {
          'Authorization': `Bearer ${token || localStorage.getItem(config.tokenKey)}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        // Se o token for inválido, tentar renovar
        if (response.status === 401) {
          const renewed = await refreshAuthToken()
          if (renewed) {
            // Tentar novamente com novo token
            return await refreshUser()
          }
        }
        throw new Error(data.message || 'Erro ao recarregar dados')
      }

      setUser(data.data)
      localStorage.setItem(config.userKey, JSON.stringify(data.data))
      
      console.log('✅ AuthContext: Dados do usuário recarregados')
    } catch (error) {
      console.error('❌ AuthContext: Erro ao recarregar dados do usuário:', error)
      throw error
    }
  }



  // Função para limpar tentativas de login
  const clearLoginAttempts = () => {
    setLoginAttempts(0)
    setLastLoginAttempt(null)
  }

  const value: AuthContextType = {
    user,
    token,
    refreshToken,
    isLoading,
    isAuthenticated,
    loginAttempts,
    lastLoginAttempt,
    login,
    register,
    logout,
    updateStatistics,
    refreshUser,
    refreshAuthToken,
    clearLoginAttempts,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook para usar o contexto
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

export default AuthContext