import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  PencilIcon, 
  CheckIcon, 
  XMarkIcon,
  TrophyIcon,
  FireIcon,
  ChartBarIcon,
  ClockIcon,
  AcademicCapIcon,
  StarIcon,
  CalendarIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext'
import { useDetailedStats } from '../hooks/useDetailedStats'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const { stats: detailedStats, loading: statsLoading, error: statsError, refetch: refetchStats } = useDetailedStats()
  const [isEditingName, setIsEditingName] = useState(false)
  const [newName, setNewName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Inicializar userService corretamente
  const updateProfile = async (profileData: any) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    const token = localStorage.getItem('focovest_token')
    
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Erro ao atualizar perfil')
    }

    return await response.json()
  }

  const handleUpdateName = async () => {
    if (!newName.trim()) {
      toast.error('Nome não pode estar vazio')
      return
    }

    setIsLoading(true)
    try {
      console.log('🔄 Atualizando nome para:', newName.trim())
      await updateProfile({ name: newName.trim() })
      
      // Recarregar dados do usuário no contexto
      await refreshUser()
      
      toast.success('Nome atualizado com sucesso!')
      setIsEditingName(false)
    } catch (error: any) {
      console.error('❌ Erro ao atualizar nome:', error)
      toast.error(error.message || 'Erro ao atualizar nome')
    } finally {
      setIsLoading(false)
    }
  }

  const startEditingName = () => {
    setNewName(user?.name || '')
    setIsEditingName(true)
  }

  const cancelEditingName = () => {
    setIsEditingName(false)
    setNewName('')
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    )
  }

  // Função para obter iniciais do nome
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatPercentage = (correct: number, total: number) => {
    if (total === 0) return '0%'
    return `${Math.round((correct / total) * 100)}%`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Meu Perfil</h1>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="card text-center">
            <div className="w-24 h-24 bg-primary-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                getInitials(user.name)
              )}
            </div>
            {isEditingName ? (
              <div className="mb-4">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center"
                  placeholder="Digite seu nome"
                  disabled={isLoading}
                />
                <div className="flex justify-center space-x-2 mt-2">
                  <button
                    onClick={handleUpdateName}
                    disabled={isLoading}
                    className="p-1 text-green-600 hover:bg-green-100 rounded"
                  >
                    <CheckIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={cancelEditingName}
                    disabled={isLoading}
                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <div className="flex items-center justify-center space-x-2">
                  <h2 className="text-xl font-semibold">{user.name}</h2>
                  <button
                    onClick={startEditingName}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-gray-600">Nível {user.level} • {user.experience} XP</p>
              </div>
            )}
            {user.university && (
              <p className="text-gray-600 mt-2">
                {user.university}
                {user.course && ` • ${user.course}`}
              </p>
            )}
            <div className="mt-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                user.isEmailVerified 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {user.isEmailVerified ? '✓ Email verificado' : '⚠ Email não verificado'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <div className="card">
            <h3 className="text-xl font-semibold mb-6">Estatísticas de Desempenho</h3>
            
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              <motion.div 
                className="bg-blue-50 p-4 rounded-lg"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrophyIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Simulados realizados</p>
                    <p className="text-2xl font-bold text-blue-600">{user.statistics.totalSimulations}</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-green-50 p-4 rounded-lg"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <ChartBarIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Taxa de acerto</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatPercentage(user.statistics.correctAnswers, user.statistics.totalQuestions)}
                    </p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-purple-50 p-4 rounded-lg"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <AcademicCapIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Questões respondidas</p>
                    <p className="text-2xl font-bold text-purple-600">{user.statistics.totalQuestions}</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-orange-50 p-4 rounded-lg"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <FireIcon className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Sequência atual</p>
                    <p className="text-2xl font-bold text-orange-600">{user.statistics.streakDays} dias</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-indigo-50 p-4 rounded-lg"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <ClockIcon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tempo total de estudo</p>
                    <p className="text-xl font-bold text-indigo-600">
                      {Math.floor(user.statistics.timeSpent / 3600)}h {Math.floor((user.statistics.timeSpent % 3600) / 60)}min
                    </p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-yellow-50 p-4 rounded-lg"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <StarIcon className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pontuação média</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {user.statistics.averageScore.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Progresso do Nível */}
            <div className="mt-8 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg font-semibold">Progresso do Nível {user.level}</h4>
                <span className="text-sm text-gray-600">{user.experience} XP</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((user.experience % 1000) / 10, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{Math.floor(user.experience / 1000) * 1000} XP</span>
                <span>{Math.floor(user.experience / 1000 + 1) * 1000} XP</span>
              </div>
            </div>
          </div>
          
          {/* Análise de Performance - Dados Reais */}
          <div className="card mt-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <ChartBarIcon className="w-6 h-6 mr-2 text-blue-600" />
              Análise de Performance (Dados Reais)
              {statsLoading && (
                <div className="ml-2 w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              )}
            </h3>
            
            {statsError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-red-700 text-sm">Erro ao carregar dados: {statsError}</span>
                <button 
                  onClick={refetchStats}
                  className="ml-auto text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {detailedStats ? (
              <div className="space-y-6">
                {/* Métricas Avançadas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Análise de Evolução */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <BoltIcon className="w-5 h-5 mr-2 text-blue-600" />
                      Métricas de Eficiência
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Questões por simulado</span>
                        <span className="font-semibold text-blue-600">
                          {detailedStats.advanced.avgQuestionsPerSimulation} questões
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Tempo por questão</span>
                        <span className="font-semibold text-blue-600">
                          {detailedStats.advanced.avgTimePerQuestion}s
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Taxa de eficiência</span>
                        <span className="font-semibold text-green-600">
                          {detailedStats.advanced.efficiencyRate} acertos/h
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Frequência semanal</span>
                        <span className="font-semibold text-purple-600">
                          {detailedStats.advanced.studyFrequency} simulados
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status e Tendências */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <FireIcon className="w-5 h-5 mr-2 text-green-600" />
                      Status e Atividade
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Tendência de performance</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          detailedStats.advanced.performanceTrend === 'excellent' ? 'bg-green-100 text-green-800' :
                          detailedStats.advanced.performanceTrend === 'good' ? 'bg-blue-100 text-blue-800' :
                          detailedStats.advanced.performanceTrend === 'average' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {detailedStats.advanced.performanceTrend === 'excellent' ? '🔥 Excelente' :
                           detailedStats.advanced.performanceTrend === 'good' ? '👍 Bom' :
                           detailedStats.advanced.performanceTrend === 'average' ? '😐 Médio' : '😟 Precisa melhorar'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Dias na plataforma</span>
                        <span className="font-semibold text-gray-700">{detailedStats.advanced.daysSinceJoined} dias</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Ativo nos últimos 7 dias</span>
                        <span className={`font-semibold ${detailedStats.advanced.activeInLast7Days ? 'text-green-600' : 'text-red-600'}`}>
                          {detailedStats.advanced.activeInLast7Days ? '✅ Sim' : '❌ Não'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Consistência de estudo</span>
                        <span className="font-semibold text-blue-600">
                          {detailedStats.progress.studyConsistency.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progresso e Recomendações */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Progresso Detalhado */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <TrophyIcon className="w-5 h-5 mr-2 text-purple-600" />
                      Progresso Detalhado
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">XP para próximo nível</span>
                          <span className="font-semibold text-purple-600">{detailedStats.progress.xpToNextLevel} XP</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${Math.max(5, Math.min(95, ((1000 - detailedStats.progress.xpToNextLevel) / 1000) * 100))}%` 
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Taxa de conclusão</span>
                        <span className="font-semibold text-green-600">
                          {detailedStats.progress.completionRate}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Nível atual</span>
                        <span className="font-semibold text-blue-600">
                          Nível {detailedStats.progress.currentLevel}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Recomendações Personalizadas */}
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <InformationCircleIcon className="w-5 h-5 mr-2 text-yellow-600" />
                      Recomendações Inteligentes
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">Sugestão de estudo:</span>
                        <p className="font-medium text-gray-800 text-sm mt-1">
                          {detailedStats.recommendations.suggestedStudyTime}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Focar em:</span>
                        <div className="mt-1 space-y-1">
                          {detailedStats.recommendations.focusAreas.map((area, index) => (
                            <span key={index} className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full mr-1">
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Próxima meta:</span>
                        <p className="font-medium text-gray-800 text-sm mt-1">
                          {detailedStats.recommendations.nextGoal}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando análise detalhada...</p>
              </div>
            )}
          </div>

          {/* Informações da Conta - Dados Reais */}
          <div className="card mt-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <CalendarIcon className="w-6 h-6 mr-2 text-gray-600" />
              Informações da Conta (Dados Reais)
            </h3>
            
            {detailedStats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900">{user.email}</p>
                    <div className="flex items-center mt-1">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        detailedStats.advanced.activeInLast7Days ? 'bg-green-500' : 'bg-orange-500'
                      }`}></div>
                      <span className={`text-xs ${
                        detailedStats.advanced.activeInLast7Days ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {detailedStats.advanced.activeInLast7Days ? 'Conta ativa' : 'Precisamos de você de volta!'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Membro desde</label>
                    <p className="text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString('pt-BR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {detailedStats.advanced.daysSinceJoined} dias conosco • 
                      Nível {detailedStats.progress.currentLevel}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Status da performance</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        detailedStats.advanced.performanceTrend === 'excellent' ? 'bg-green-100 text-green-800' :
                        detailedStats.advanced.performanceTrend === 'good' ? 'bg-blue-100 text-blue-800' :
                        detailedStats.advanced.performanceTrend === 'average' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {detailedStats.advanced.performanceTrend === 'excellent' ? '🚀 Excelente' :
                         detailedStats.advanced.performanceTrend === 'good' ? '👍 Bom' :
                         detailedStats.advanced.performanceTrend === 'average' ? '😐 Médio' : '📈 Melhorando'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {user.statistics.lastSimulationDate && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Última atividade</label>
                      <p className="text-gray-900">
                        {new Date(user.statistics.lastSimulationDate).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Média de {detailedStats.advanced.studyFrequency} simulados por semana
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-600">Estatísticas de engajamento</label>
                    <div className="space-y-2 mt-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Consistência de estudo:</span>
                        <span className="font-semibold text-blue-600">
                          {detailedStats.progress.studyConsistency.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, detailedStats.progress.studyConsistency)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Taxa de conclusão:</span>
                        <span className="font-semibold text-green-600">
                          {detailedStats.progress.completionRate}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Progresso atual</label>
                    <div className="space-y-2 mt-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">XP até próximo nível:</span>
                        <span className="font-semibold text-purple-600">
                          {detailedStats.progress.xpToNextLevel} XP
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-purple-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${Math.max(5, Math.min(95, ((1000 - detailedStats.progress.xpToNextLevel) / 1000) * 100))}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-600 text-sm">Carregando informações da conta...</p>
              </div>
            )}
          </div>

          {/* Debug Info - Mostrar apenas em desenvolvimento */}
          {import.meta.env.DEV && (
            <div className="card mt-6 border-2 border-dashed border-yellow-300 bg-yellow-50">
              <h3 className="text-xl font-semibold mb-4 text-yellow-800">🔧 Debug - Dados do Usuário</h3>
              <details className="text-sm">
                <summary className="cursor-pointer font-medium text-yellow-800 mb-2">
                  Clique para ver dados brutos (apenas em desenvolvimento)
                </summary>
                <pre className="bg-white p-4 rounded border overflow-auto text-xs">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </details>
              
              <div className="mt-4 p-3 bg-white rounded border">
                <h4 className="font-semibold text-yellow-800 mb-2">Status de Captura de Dados:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Estatísticas atualizadas:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      user.statistics.totalSimulations > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.statistics.totalSimulations > 0 ? '✅ Sim' : '❌ Não'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Último simulado:</span>
                    <span className="ml-2 text-gray-600">
                      {user.statistics.lastSimulationDate 
                        ? new Date(user.statistics.lastSimulationDate).toLocaleString('pt-BR')
                        : 'Nunca'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}