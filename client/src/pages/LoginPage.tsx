import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading, isAuthenticated, loginAttempts, clearLoginAttempts } = useAuth()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [showPassword, setShowPassword] = useState(false)

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Validações básicas
      if (!formData.email.trim()) {
        toast.error('Email é obrigatório')
        return
      }
      
      if (!formData.password) {
        toast.error('Senha é obrigatória')
        return
      }
      
      // Alertar sobre muitas tentativas
      if (loginAttempts >= 3) {
        toast('Muitas tentativas de login. Aguarde alguns minutos.', { icon: '⚠️' })
      }
      
      // Coletar informações do dispositivo para segurança
      const getDeviceInfo = () => {
        const userAgent = navigator.userAgent
        let browser = 'Unknown'
        let os = 'Unknown'
        
        // Detectar browser
        if (userAgent.includes('Chrome')) browser = 'Chrome'
        else if (userAgent.includes('Firefox')) browser = 'Firefox'
        else if (userAgent.includes('Safari')) browser = 'Safari'
        else if (userAgent.includes('Edge')) browser = 'Edge'
        else if (userAgent.includes('Opera')) browser = 'Opera'
        
        // Detectar OS
        if (userAgent.includes('Windows')) os = 'Windows'
        else if (userAgent.includes('Mac')) os = 'macOS'
        else if (userAgent.includes('Linux')) os = 'Linux'
        else if (userAgent.includes('Android')) os = 'Android'
        else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS'
        
        return {
          userAgent,
          platform: navigator.platform,
          language: navigator.language,
          browser,
          os,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          cookieEnabled: navigator.cookieEnabled,
          onlineStatus: navigator.onLine
        }
      }

      const loginOptions = {
        rememberMe: formData.rememberMe,
        deviceInfo: getDeviceInfo()
      }
      
      await login(formData.email, formData.password, loginOptions)
      clearLoginAttempts() // Limpar tentativas no sucesso
      toast.success('Login realizado com sucesso!')
      navigate('/dashboard')
    } catch (error: any) {
      console.error('Erro no login:', error)
      
      if (error.message?.includes('Rate limit') || error.message?.includes('Muitas tentativas')) {
        toast.error('Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.')
      } else if (error.message?.includes('incorretos')) {
        toast.error('Email ou senha incorretos')
      } else {
        toast.error(error.message || 'Erro no login. Tente novamente.')
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-md w-full"
      >
        <div className="card">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Bem-vindo de volta!
            </h1>
            <p className="text-gray-600">
              Entre na sua conta para continuar estudando
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  id="login-email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="seu@email.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input pl-10 pr-10"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="remember-me" className="flex items-center">
                <input
                  type="checkbox"
                  id="remember-me"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Lembrar de mim</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Esqueceu a senha?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Não tem uma conta?{' '}
              <Link
                to="/register"
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}