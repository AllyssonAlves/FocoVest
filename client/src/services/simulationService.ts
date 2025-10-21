import {
  Simulation,
  SimulationFilters,
  SimulationsResponse,
  CreateSimulationData,
  SimulationSession,
  SimulationResult,
  ApiResponse,
  SimulationStats
} from '@shared/simulation'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

class SimulationService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('authToken')
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }))
        throw new Error(errorData.message || `Erro ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Erro na requisição:', error)
      throw error
    }
  }

  // Listar simulados com filtros e paginação
  async getSimulations(filters: SimulationFilters = {}): Promise<SimulationsResponse> {
    const queryParams = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => queryParams.append(key, item.toString()))
        } else {
          queryParams.append(key, value.toString())
        }
      }
    })

    const endpoint = `/simulations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return this.request<SimulationsResponse>(endpoint)
  }

  // Obter simulado específico por ID
  async getSimulationById(id: string): Promise<ApiResponse<Simulation>> {
    return this.request<ApiResponse<Simulation>>(`/simulations/${id}`)
  }

  // Criar novo simulado
  async createSimulation(data: CreateSimulationData): Promise<ApiResponse<Simulation>> {
    return this.request<ApiResponse<Simulation>>('/simulations', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Atualizar simulado existente
  async updateSimulation(id: string, data: Partial<CreateSimulationData>): Promise<ApiResponse<Simulation>> {
    return this.request<ApiResponse<Simulation>>(`/simulations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Deletar simulado
  async deleteSimulation(id: string): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/simulations/${id}`, {
      method: 'DELETE',
    })
  }

  // Iniciar simulado
  async startSimulation(id: string): Promise<ApiResponse<SimulationSession>> {
    return this.request<ApiResponse<SimulationSession>>(`/simulations/${id}/start`, {
      method: 'POST',
    })
  }

  // Pausar simulado
  async pauseSimulation(id: string): Promise<ApiResponse<SimulationSession>> {
    return this.request<ApiResponse<SimulationSession>>(`/simulations/${id}/pause`, {
      method: 'POST',
    })
  }

  // Continuar simulado pausado
  async resumeSimulation(id: string): Promise<ApiResponse<SimulationSession>> {
    return this.request<ApiResponse<SimulationSession>>(`/simulations/${id}/resume`, {
      method: 'POST',
    })
  }

  // Finalizar simulado
  async completeSimulation(id: string): Promise<ApiResponse<SimulationResult>> {
    return this.request<ApiResponse<SimulationResult>>(`/simulations/${id}/complete`, {
      method: 'POST',
    })
  }

  // Submeter resposta para uma questão
  async submitAnswer(
    simulationId: string, 
    questionId: string, 
    answer: string
  ): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/simulations/${simulationId}/questions/${questionId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ answer }),
    })
  }

  // Obter sessão atual do simulado
  async getCurrentSession(id: string): Promise<ApiResponse<SimulationSession | null>> {
    return this.request<ApiResponse<SimulationSession | null>>(`/simulations/${id}/session`)
  }

  // Obter resultado do simulado
  async getSimulationResult(id: string): Promise<ApiResponse<SimulationResult | null>> {
    return this.request<ApiResponse<SimulationResult | null>>(`/simulations/${id}/result`)
  }

  // Obter estatísticas dos simulados do usuário
  async getUserStats(): Promise<ApiResponse<SimulationStats>> {
    return this.request<ApiResponse<SimulationStats>>('/simulations/stats')
  }

  // Métodos utilitários para frontend
  
  // Verificar se usuário pode acessar simulado
  isSimulationAccessible(simulation: Simulation, currentUserId?: string): boolean {
    return simulation.isPublic || simulation.createdBy === currentUserId
  }

  // Calcular tempo decorrido em formato legível
  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    } else {
      return `${remainingSeconds}s`
    }
  }

  // Calcular progresso do simulado
  calculateProgress(currentQuestionIndex: number, totalQuestions: number): number {
    if (totalQuestions === 0) return 0
    return Math.round((currentQuestionIndex / totalQuestions) * 100)
  }

  // Verificar se simulado está expirado
  isSimulationExpired(session: SimulationSession, timeLimit: number): boolean {
    const elapsed = Date.now() - new Date(session.startedAt).getTime()
    const timeLimitMs = timeLimit * 60 * 1000 // converter minutos para milissegundos
    return elapsed >= timeLimitMs
  }

  // Obter tempo restante em segundos
  getTimeRemaining(session: SimulationSession, timeLimit: number): number {
    const elapsed = Date.now() - new Date(session.startedAt).getTime()
    const timeLimitMs = timeLimit * 60 * 1000
    const remaining = Math.max(0, timeLimitMs - elapsed)
    return Math.floor(remaining / 1000)
  }

  // Validar dados de criação de simulado
  validateSimulationData(data: CreateSimulationData): string[] {
    const errors: string[] = []

    if (!data.title || data.title.trim().length < 3) {
      errors.push('Título deve ter pelo menos 3 caracteres')
    }

    if (data.settings.timeLimit < 1 || data.settings.timeLimit > 300) {
      errors.push('Tempo limite deve estar entre 1 e 300 minutos')
    }

    if (data.settings.questionsCount < 1 || data.settings.questionsCount > 100) {
      errors.push('Número de questões deve estar entre 1 e 100')
    }

    if (!['geral', 'especifico', 'revisao', 'vestibular'].includes(data.category)) {
      errors.push('Categoria inválida')
    }

    return errors
  }

  // Cache local para melhorar performance
  private cache = new Map<string, { data: any; timestamp: number }>()
  private CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as T
    }
    return null
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  // Versão com cache para listagem de simulados
  async getSimulationsWithCache(filters: SimulationFilters = {}): Promise<SimulationsResponse> {
    const cacheKey = `simulations_${JSON.stringify(filters)}`
    const cached = this.getCachedData<SimulationsResponse>(cacheKey)
    
    if (cached) {
      return cached
    }

    const result = await this.getSimulations(filters)
    this.setCachedData(cacheKey, result)
    return result
  }

  // Limpar cache
  clearCache(): void {
    this.cache.clear()
  }
}

// Instância singleton do serviço
export const simulationService = new SimulationService()
export default simulationService