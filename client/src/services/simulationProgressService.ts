// Tipos para persistência de simulado
export interface SimulationProgress {
  simulationId: string
  userId?: string
  startedAt: Date
  lastSavedAt: Date
  currentQuestionIndex: number
  answers: Record<string, string> // questionId -> selectedOption
  timeSpent: Record<string, number> // questionId -> seconds
  totalTimeRemaining: number
  questionTimeRemaining: number
  isPaused: boolean
  isCompleted: boolean
}

export interface AutoSaveConfig {
  intervalMs: number // Intervalo de auto-save em ms
  enableLocalStorage: boolean
  enableBackendSync: boolean
}

class SimulationProgressService {
  private config: AutoSaveConfig
  private autoSaveInterval: NodeJS.Timeout | null = null

  constructor(config: Partial<AutoSaveConfig> = {}) {
    this.config = {
      intervalMs: 5000, // 5 segundos por padrão
      enableLocalStorage: true,
      enableBackendSync: false, // Desabilitado até implementarmos o backend
      ...config
    }
  }

  // Chave para localStorage
  private getStorageKey(simulationId: string): string {
    return `focovest_simulation_${simulationId}`
  }

  // Salvar progresso no localStorage
  saveToLocalStorage(progress: SimulationProgress): void {
    if (!this.config.enableLocalStorage) return

    try {
      const key = this.getStorageKey(progress.simulationId)
      const data = {
        ...progress,
        lastSavedAt: new Date()
      }
      localStorage.setItem(key, JSON.stringify(data))
      console.log('📥 Progresso salvo localmente:', progress.simulationId)
    } catch (error) {
      console.error('❌ Erro ao salvar no localStorage:', error)
    }
  }

  // Carregar progresso do localStorage
  loadFromLocalStorage(simulationId: string): SimulationProgress | null {
    if (!this.config.enableLocalStorage) return null

    try {
      const key = this.getStorageKey(simulationId)
      const data = localStorage.getItem(key)
      
      if (!data) return null

      const progress = JSON.parse(data) as SimulationProgress
      // Converter strings de data de volta para Date objects
      progress.startedAt = new Date(progress.startedAt)
      progress.lastSavedAt = new Date(progress.lastSavedAt)

      console.log('📤 Progresso carregado localmente:', simulationId)
      return progress
    } catch (error) {
      console.error('❌ Erro ao carregar do localStorage:', error)
      return null
    }
  }

  // Remover progresso do localStorage (após completar)
  removeFromLocalStorage(simulationId: string): void {
    try {
      const key = this.getStorageKey(simulationId)
      localStorage.removeItem(key)
      console.log('🗑️ Progresso removido:', simulationId)
    } catch (error) {
      console.error('❌ Erro ao remover do localStorage:', error)
    }
  }

  // Iniciar auto-save
  startAutoSave(
    progress: SimulationProgress,
    onSave?: (progress: SimulationProgress) => void
  ): void {
    // Parar auto-save anterior se existir
    this.stopAutoSave()

    this.autoSaveInterval = setInterval(() => {
      this.saveToLocalStorage(progress)
      onSave?.(progress)
    }, this.config.intervalMs)

    console.log(`🔄 Auto-save iniciado (${this.config.intervalMs}ms)`)
  }

  // Parar auto-save
  stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval)
      this.autoSaveInterval = null
      console.log('⏹️ Auto-save parado')
    }
  }

  // Salvar progresso no backend (futuro)
  async saveToBackend(progress: SimulationProgress): Promise<void> {
    if (!this.config.enableBackendSync) return

    try {
      // TODO: Implementar chamada para o backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/simulations/${progress.simulationId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Adicionar token de autenticação
        },
        body: JSON.stringify(progress)
      })

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      console.log('☁️ Progresso sincronizado com backend')
    } catch (error) {
      console.error('❌ Erro ao sincronizar com backend:', error)
      // Fallback para localStorage em caso de erro
      this.saveToLocalStorage(progress)
    }
  }

  // Carregar progresso do backend (futuro)
  async loadFromBackend(simulationId: string): Promise<SimulationProgress | null> {
    if (!this.config.enableBackendSync) return null

    try {
      // TODO: Implementar chamada para o backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/simulations/${simulationId}/progress`, {
        headers: {
          // TODO: Adicionar token de autenticação
        }
      })

      if (!response.ok) {
        if (response.status === 404) {
          return null // Nenhum progresso encontrado
        }
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const progress = await response.json() as SimulationProgress
      progress.startedAt = new Date(progress.startedAt)
      progress.lastSavedAt = new Date(progress.lastSavedAt)

      console.log('☁️ Progresso carregado do backend')
      return progress
    } catch (error) {
      console.error('❌ Erro ao carregar do backend:', error)
      // Fallback para localStorage em caso de erro
      return this.loadFromLocalStorage(simulationId)
    }
  }

  // Listar todos os progressos salvos localmente
  listLocalProgress(): Array<{ simulationId: string; lastSavedAt: Date; isCompleted: boolean }> {
    const progressList: Array<{ simulationId: string; lastSavedAt: Date; isCompleted: boolean }> = []

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('focovest_simulation_')) {
          const data = localStorage.getItem(key)
          if (data) {
            const progress = JSON.parse(data) as SimulationProgress
            progressList.push({
              simulationId: progress.simulationId,
              lastSavedAt: new Date(progress.lastSavedAt),
              isCompleted: progress.isCompleted
            })
          }
        }
      }
    } catch (error) {
      console.error('❌ Erro ao listar progressos:', error)
    }

    return progressList.sort((a, b) => b.lastSavedAt.getTime() - a.lastSavedAt.getTime())
  }

  // Limpar progressos antigos (mais de 7 dias)
  cleanupOldProgress(maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): void {
    const now = Date.now()
    const progressList = this.listLocalProgress()

    progressList.forEach(({ simulationId, lastSavedAt, isCompleted }) => {
      const age = now - lastSavedAt.getTime()
      
      // Remover se:
      // - Está completo E tem mais de 1 dia
      // - Não está completo E tem mais de maxAgeMs
      if ((isCompleted && age > 24 * 60 * 60 * 1000) || 
          (!isCompleted && age > maxAgeMs)) {
        this.removeFromLocalStorage(simulationId)
        console.log('🧹 Progresso antigo removido:', simulationId)
      }
    })
  }
}

// Instância singleton
export const simulationProgressService = new SimulationProgressService()

// Hook para usar o serviço de progresso
export function useSimulationProgress(simulationId: string) {
  const saveProgress = (progress: SimulationProgress) => {
    simulationProgressService.saveToLocalStorage(progress)
  }

  const loadProgress = (): SimulationProgress | null => {
    return simulationProgressService.loadFromLocalStorage(simulationId)
  }

  const removeProgress = () => {
    simulationProgressService.removeFromLocalStorage(simulationId)
  }

  const startAutoSave = (progress: SimulationProgress, onSave?: (progress: SimulationProgress) => void) => {
    simulationProgressService.startAutoSave(progress, onSave)
  }

  const stopAutoSave = () => {
    simulationProgressService.stopAutoSave()
  }

  return {
    saveProgress,
    loadProgress,
    removeProgress,
    startAutoSave,
    stopAutoSave
  }
}