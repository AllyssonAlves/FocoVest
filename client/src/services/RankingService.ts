const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export interface RankingUser {
  _id: string
  name: string
  university?: string
  statistics: {
    totalSimulations: number
    averageScore: number
    correctAnswers: number
    totalQuestions: number
  }
  level: number
  experience: number
  position: number
}

export interface UserRanking {
  globalPosition: number
  universityPosition?: number
  totalUsers: number
  universityUsers?: number
}

class RankingService {
  private getAuthHeaders() {
    const token = localStorage.getItem('focovest_token')
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  async getGlobalRanking(limit: number = 10): Promise<RankingUser[]> {
    try {
      console.log('🏆 RankingService: Buscando ranking global...')
      
      const response = await fetch(`${API_BASE_URL}/rankings?limit=${limit}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao buscar ranking')
      }

      const result = await response.json()
      console.log('✅ RankingService: Ranking global carregado')
      return result.data

    } catch (error) {
      console.error('❌ RankingService: Erro ao buscar ranking global:', error)
      
      // Retornar dados mock em caso de erro
      return this.getMockGlobalRanking()
    }
  }

  async getUniversityRanking(university: string, limit: number = 10): Promise<RankingUser[]> {
    try {
      console.log(`🏆 RankingService: Buscando ranking da ${university}...`)
      
      const response = await fetch(`${API_BASE_URL}/rankings/${university}?limit=${limit}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao buscar ranking da universidade')
      }

      const result = await response.json()
      console.log(`✅ RankingService: Ranking da ${university} carregado`)
      return result.data

    } catch (error) {
      console.error(`❌ RankingService: Erro ao buscar ranking da ${university}:`, error)
      
      // Retornar dados mock em caso de erro
      return this.getMockUniversityRanking(university)
    }
  }

  async getUserRanking(): Promise<UserRanking> {
    try {
      console.log('📊 RankingService: Buscando posição do usuário...')
      
      const response = await fetch(`${API_BASE_URL}/rankings/user/position`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao buscar posição do usuário')
      }

      const result = await response.json()
      console.log('✅ RankingService: Posição do usuário carregada')
      return result.data

    } catch (error) {
      console.error('❌ RankingService: Erro ao buscar posição do usuário:', error)
      
      // Retornar dados mock em caso de erro
      return this.getMockUserRanking()
    }
  }

  // Métodos mock para desenvolvimento
  private getMockGlobalRanking(): RankingUser[] {
    return [
      {
        _id: '1',
        name: 'João Silva',
        university: 'UFC',
        statistics: {
          totalSimulations: 45,
          averageScore: 92.5,
          correctAnswers: 850,
          totalQuestions: 920
        },
        level: 8,
        experience: 1200,
        position: 1
      },
      {
        _id: '2',
        name: 'Maria Santos',
        university: 'UECE',
        statistics: {
          totalSimulations: 38,
          averageScore: 89.2,
          correctAnswers: 720,
          totalQuestions: 810
        },
        level: 7,
        experience: 980,
        position: 2
      },
      {
        _id: '3',
        name: 'Carlos Oliveira',
        university: 'UVA',
        statistics: {
          totalSimulations: 42,
          averageScore: 87.8,
          correctAnswers: 680,
          totalQuestions: 775
        },
        level: 6,
        experience: 850,
        position: 3
      }
    ]
  }

  private getMockUniversityRanking(university: string): RankingUser[] {
    const baseRanking = this.getMockGlobalRanking()
    return baseRanking
      .filter(user => user.university === university)
      .map((user, index) => ({ ...user, position: index + 1 }))
  }

  private getMockUserRanking(): UserRanking {
    return {
      globalPosition: Math.floor(Math.random() * 100) + 1,
      universityPosition: Math.floor(Math.random() * 20) + 1,
      totalUsers: 1247,
      universityUsers: 156
    }
  }
}

export default new RankingService()