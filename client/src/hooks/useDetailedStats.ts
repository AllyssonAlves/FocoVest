import { useState, useEffect } from 'react'

interface DetailedStats {
  basic: {
    totalSimulations: number
    totalQuestions: number
    correctAnswers: number
    averageScore: number
    timeSpent: number
    streakDays: number
    lastSimulationDate?: string
  }
  advanced: {
    avgQuestionsPerSimulation: number
    avgTimePerQuestion: number
    efficiencyRate: number
    studyFrequency: number
    performanceTrend: string
    daysSinceJoined: number
    activeInLast7Days: boolean
    activeInLast30Days: boolean
  }
  progress: {
    currentLevel: number
    experience: number
    xpToNextLevel: number
    completionRate: number
    studyConsistency: number
  }
  recommendations: {
    suggestedStudyTime: string
    focusAreas: string[]
    nextGoal: string
  }
}

export function useDetailedStats() {
  const [stats, setStats] = useState<DetailedStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDetailedStats = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const token = localStorage.getItem('focovest_token')
      if (!token) {
        throw new Error('Token não encontrado')
      }

      const response = await fetch('http://localhost:5000/api/users/detailed-stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao buscar estatísticas detalhadas')
      }

      setStats(data.data)
    } catch (err: any) {
      setError(err.message)
      console.error('Erro ao buscar estatísticas detalhadas:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDetailedStats()
  }, [])

  return {
    stats,
    loading,
    error,
    refetch: fetchDetailedStats
  }
}