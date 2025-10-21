const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export interface SimulationResults {
  score: number
  correctAnswers: number
  totalQuestions: number
  timeSpent: number | Record<string, number>
  answers: any[] | Record<string, string>
}

export interface UserStatistics {
  totalSimulations: number
  totalQuestions: number
  correctAnswers: number
  averageScore: number
  timeSpent: number
  streakDays: number
  lastSimulationDate?: string
}

class UserService {
  private getAuthHeaders() {
    const token = localStorage.getItem('focovest_token')
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  async updateStatistics(simulationResults: SimulationResults): Promise<{ statistics: UserStatistics; experience: number }> {
    try {
      console.log('📊 UserService: Atualizando estatísticas...', simulationResults)
      
      // Converter timeSpent para number se for um Record
      let timeSpent: number
      if (typeof simulationResults.timeSpent === 'number') {
        timeSpent = simulationResults.timeSpent
      } else {
        // Se for um Record, somar todos os valores
        timeSpent = Object.values(simulationResults.timeSpent).reduce((total, time) => total + time, 0)
      }

      const processedResults = {
        ...simulationResults,
        timeSpent
      }
      
      const response = await fetch(`${API_BASE_URL}/users/statistics`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ simulationResults: processedResults })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao atualizar estatísticas')
      }

      const result = await response.json()
      console.log('✅ UserService: Estatísticas atualizadas com sucesso')
      return result.data

    } catch (error) {
      console.error('❌ UserService: Erro ao atualizar estatísticas:', error)
      throw error
    }
  }

  async getUserProfile(): Promise<any> {
    try {
      console.log('👤 UserService: Buscando perfil do usuário...')
      
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao buscar perfil')
      }

      const result = await response.json()
      console.log('✅ UserService: Perfil carregado com sucesso')
      return result.data

    } catch (error) {
      console.error('❌ UserService: Erro ao buscar perfil:', error)
      throw error
    }
  }

  async updateProfile(profileData: any): Promise<any> {
    try {
      console.log('👤 UserService: Atualizando perfil...')
      
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(profileData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao atualizar perfil')
      }

      const result = await response.json()
      console.log('✅ UserService: Perfil atualizado com sucesso')
      return result.data

    } catch (error) {
      console.error('❌ UserService: Erro ao atualizar perfil:', error)
      throw error
    }
  }
}

export default new UserService()