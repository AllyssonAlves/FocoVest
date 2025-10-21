import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import UserService, { SimulationResults } from '../services/UserService'

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

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  updateStatistics: (simulationResults: SimulationResults) => Promise<void>
  refreshUser: () => Promise<void>
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
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user && !!token

  // Verificar token existente no localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('focovest_token')
    const savedUser = localStorage.getItem('focovest_user')

    if (savedToken && savedUser) {
      try {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Erro ao carregar dados de autenticação:', error)
        localStorage.removeItem('focovest_token')
        localStorage.removeItem('focovest_user')
      }
    }
    
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro no login')
      }

      if (data.success && data.data) {
        const { user: userData, token: userToken } = data.data
        
        setUser(userData)
        setToken(userToken)
        
        // Salvar no localStorage
        localStorage.setItem('focovest_token', userToken)
        localStorage.setItem('focovest_user', JSON.stringify(userData))
      } else {
        throw new Error('Resposta inválida do servidor')
      }
    } catch (error: any) {
      console.error('Erro no login:', error)
      throw new Error(error.message || 'Erro no login')
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true)
      
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro no registro')
      }

      if (data.success && data.data) {
        const { user: newUser, token: userToken } = data.data
        
        setUser(newUser)
        setToken(userToken)
        
        // Salvar no localStorage
        localStorage.setItem('focovest_token', userToken)
        localStorage.setItem('focovest_user', JSON.stringify(newUser))
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

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('focovest_token')
    localStorage.removeItem('focovest_user')
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
      
      if (!token) {
        throw new Error('Token não encontrado')
      }

      const response = await fetch('http://localhost:5000/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao recarregar dados')
      }

      setUser(data.data)
      localStorage.setItem('focovest_user', JSON.stringify(data.data))
      
      console.log('✅ AuthContext: Dados do usuário recarregados')
    } catch (error) {
      console.error('❌ AuthContext: Erro ao recarregar dados do usuário:', error)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateStatistics,
    refreshUser,
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