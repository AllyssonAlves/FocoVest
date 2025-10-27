import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  MapPin, 
  Clock,
  AlertTriangle,
  RefreshCw,
  Shield
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface DeviceSession {
  deviceId: string
  browser: string
  os: string
  ip: string
  lastActivity: string
  createdAt: string
}

interface SessionStats {
  activeSessions: number
  totalDevices: number
  lastActivity: Date | null
}

interface SessionData {
  activeSessions: DeviceSession[]
  stats: SessionStats
}

export default function SecurityPage() {
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { token } = useAuth()

  const fetchSessions = async () => {
    try {
      setError(null)
      const response = await fetch('/api/auth/sessions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      
      if (result.success) {
        setSessionData(result.data)
      } else {
        setError('Erro ao carregar sessões ativas')
      }
    } catch (err) {
      setError('Erro de conexão')
      console.error('Erro ao buscar sessões:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchSessions()
    }
  }, [token])

  const getDeviceIcon = (deviceType: string, os: string) => {
    if (os.toLowerCase().includes('android') || os.toLowerCase().includes('ios')) {
      return Smartphone
    }
    if (os.toLowerCase().includes('ipad') || deviceType.toLowerCase().includes('tablet')) {
      return Tablet
    }
    return Monitor
  }

  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Agora mesmo'
    if (diffMins < 60) return `${diffMins} min atrás`
    if (diffHours < 24) return `${diffHours}h atrás`
    if (diffDays < 7) return `${diffDays} dias atrás`
    return date.toLocaleDateString('pt-BR')
  }



  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button 
            onClick={fetchSessions}
            className="btn-primary"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-8 h-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Segurança da Conta
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie suas sessões ativas e mantenha sua conta segura
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md"
          >
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Monitor className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sessões Ativas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {sessionData?.stats.activeSessions || 0}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md"
          >
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Smartphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Dispositivos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {sessionData?.stats.totalDevices || 0}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md"
          >
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Última Atividade</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {sessionData?.stats.lastActivity 
                    ? formatLastActivity(sessionData.stats.lastActivity.toString())
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Actions */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={fetchSessions}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Atualizar</span>
            </button>
          </div>
        </div>

        {/* Active Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
        >
          <div className="p-6 border-b dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Sessões Ativas
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Dispositivos onde você está conectado atualmente
            </p>
          </div>

          <div className="divide-y dark:divide-gray-700">
            {sessionData?.activeSessions.map((session, index) => {
              const DeviceIcon = getDeviceIcon('', session.os)
              
              return (
                <motion.div
                  key={session.deviceId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <DeviceIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {session.browser} em {session.os}
                        </h3>
                        
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{session.ip}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>Ativo {formatLastActivity(session.lastActivity)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}

            {(!sessionData?.activeSessions || sessionData.activeSessions.length === 0) && (
              <div className="p-12 text-center">
                <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Nenhuma sessão ativa encontrada
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}