import { useState, useEffect, useCallback } from 'react'

interface UserComparisonData {
  user: {
    id: string
    name: string
    university?: string
    course?: string
  }
  rankingPositions: {
    globalPosition: number
    totalUsers: number
    globalPercentile: number
    universityPosition?: number
    totalUniversityUsers?: number
    universityPercentile?: number
  }
  metricComparisons: Array<{
    metric: string
    userValue: number
    average: number
    median: number
    percentile: number
    rank: number
    totalUsers: number
    betterThanPercent: number
    category: 'excellent' | 'above_average' | 'average' | 'below_average' | 'needs_improvement'
  }>
  insights: Array<{
    type: 'achievement' | 'improvement' | 'encouragement' | 'goal'
    title: string
    description: string
    metric?: string
    value?: number
    icon: string
  }>
  similarUsers: Array<{
    id: string
    name: string
    university?: string
    similarity: number
    performance: 'better' | 'similar' | 'worse'
  }>
  goals: Array<{
    metric: string
    current: number
    target: number
    percentileTarget: number
    timeEstimate?: string
  }>
  calculatedAt: string
}

interface UseUserComparisonReturn {
  data: UserComparisonData | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  clearCache: () => Promise<void>
}

export function useUserComparison(): UseUserComparisonReturn {
  const [data, setData] = useState<UserComparisonData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  const fetchComparison = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('token')
      if (!token) {
        setError('Token de autenticação não encontrado')
        return
      }

      const response = await fetch('/api/users/comparison', {
        headers: getAuthHeaders()
      })

      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        setError(result.message || 'Erro ao carregar dados de comparação')
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor')
      console.error('Erro ao buscar comparação:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const clearCache = useCallback(async () => {
    try {
      const response = await fetch('/api/users/comparison-cache', {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      const result = await response.json()

      if (result.success) {
        // Recarregar dados após limpar cache
        await fetchComparison()
      } else {
        console.warn('Erro ao limpar cache:', result.message)
      }
    } catch (err) {
      console.error('Erro ao limpar cache:', err)
    }
  }, [fetchComparison])

  useEffect(() => {
    fetchComparison()
  }, [fetchComparison])

  return {
    data,
    loading,
    error,
    refetch: fetchComparison,
    clearCache
  }
}

// Hook para dados específicos de ranking
export function useUserRanking() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRanking = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('token')
      if (!token) {
        setError('Token de autenticação não encontrado')
        return
      }

      const response = await fetch('/api/users/ranking-position', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        setError(result.message || 'Erro ao carregar ranking')
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor')
      console.error('Erro ao buscar ranking:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRanking()
  }, [fetchRanking])

  return {
    data,
    loading,
    error,
    refetch: fetchRanking
  }
}

// Hook para dados específicos de percentis
export function useUserPercentiles() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPercentiles = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('token')
      if (!token) {
        setError('Token de autenticação não encontrado')
        return
      }

      const response = await fetch('/api/users/percentile-comparison', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        setError(result.message || 'Erro ao carregar percentis')
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor')
      console.error('Erro ao buscar percentis:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPercentiles()
  }, [fetchPercentiles])

  return {
    data,
    loading,
    error,
    refetch: fetchPercentiles
  }
}