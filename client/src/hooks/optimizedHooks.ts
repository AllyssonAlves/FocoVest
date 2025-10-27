import { useState, useEffect, useCallback, useMemo } from 'react'

/**
 * Hook para gerenciamento de cache local otimizado
 */
export function useOptimizedCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300000 // 5 minutos padrão
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<number>(0)

  // Verificar se o cache ainda é válido
  const isStale = useMemo(() => {
    return Date.now() - lastFetch > ttl
  }, [lastFetch, ttl])

  const fetchData = useCallback(async (force = false) => {
    if (loading) return // Evitar múltiplas requisições

    // Se não forçado e cache válido, usar dados em cache
    if (!force && data && !isStale) {
      return data
    }

    setLoading(true)
    setError(null)

    try {
      console.log(`🔄 Buscando dados para cache: ${key}`)
      const result = await fetcher()
      setData(result)
      setLastFetch(Date.now())
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      console.error(`❌ Erro no cache ${key}:`, errorMessage)
    } finally {
      setLoading(false)
    }
  }, [key, fetcher, data, isStale, loading])

  // Buscar dados automaticamente na montagem
  useEffect(() => {
    if (!data || isStale) {
      fetchData()
    }
  }, [fetchData, data, isStale])

  const refresh = useCallback(() => fetchData(true), [fetchData])
  
  const clear = useCallback(() => {
    setData(null)
    setLastFetch(0)
    setError(null)
  }, [])

  return {
    data,
    loading,
    error,
    refresh,
    clear,
    isStale
  }
}

/**
 * Hook para debounce otimizado
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook para paginação otimizada
 */
export function useOptimizedPagination<T>(
  items: T[],
  itemsPerPage: number = 10
) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = useMemo(() => 
    Math.ceil(items.length / itemsPerPage), 
    [items.length, itemsPerPage]
  )

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    return items.slice(start, end)
  }, [items, currentPage, itemsPerPage])

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }, [totalPages])

  const nextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages))
  }, [totalPages])

  const prevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
  }, [])

  // Resetar para primeira página quando items mudam
  useEffect(() => {
    setCurrentPage(1)
  }, [items.length])

  return {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1
  }
}

/**
 * Hook para busca otimizada com debounce
 */
export function useOptimizedSearch<T>(
  items: T[],
  searchFields: (keyof T)[],
  delay: number = 300
) {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, delay)

  const filteredItems = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return items

    const lowercaseSearch = debouncedSearchTerm.toLowerCase()
    
    return items.filter(item => 
      searchFields.some(field => {
        const value = item[field]
        return typeof value === 'string' && 
               value.toLowerCase().includes(lowercaseSearch)
      })
    )
  }, [items, searchFields, debouncedSearchTerm])

  return {
    searchTerm,
    setSearchTerm,
    filteredItems,
    isSearching: searchTerm !== debouncedSearchTerm
  }
}

/**
 * Hook para gerenciar estado de loading de múltiplas operações
 */
export function useMultipleLoading() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: loading
    }))
  }, [])

  const isLoading = useCallback((key?: string) => {
    if (key) return loadingStates[key] || false
    return Object.values(loadingStates).some(Boolean)
  }, [loadingStates])

  const clearLoading = useCallback((key?: string) => {
    if (key) {
      setLoadingStates(prev => {
        const newState = { ...prev }
        delete newState[key]
        return newState
      })
    } else {
      setLoadingStates({})
    }
  }, [])

  return {
    setLoading,
    isLoading,
    clearLoading,
    loadingStates
  }
}

/**
 * Hook para intersection observer otimizado (lazy loading)
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)

  const elementRef = useCallback((element: Element | null) => {
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true)
        }
      },
      {
        threshold: 0.1,
        ...options
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [hasIntersected, options])

  return {
    elementRef,
    isIntersecting,
    hasIntersected
  }
}

/**
 * Hook para otimizar re-renders com comparação profunda
 */
export function useDeepMemo<T>(factory: () => T, deps: any[]): T {
  const [ref, setRef] = useState<{ deps: any[]; value: T } | null>(null);

  if (!ref || !deepEqual(ref.deps, deps)) {
    const newRef = { deps, value: factory() };
    setRef(newRef);
    return newRef.value;
  }

  return ref.value;
}

// Função auxiliar para comparação profunda
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;
  
  if (typeof a !== 'object') return a === b;
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }
  
  return true;
}

/**
 * Hook para performance de lista grande
 */
export function useListOptimization<T>(
  items: T[],
  chunkSize: number = 20
) {
  const [visibleChunks, setVisibleChunks] = useState(1)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const visibleItems = useMemo(() => 
    items.slice(0, visibleChunks * chunkSize),
    [items, visibleChunks, chunkSize]
  )

  const hasMore = visibleItems.length < items.length

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return

    setIsLoadingMore(true)
    
    // Simular delay de loading para UX
    await new Promise(resolve => setTimeout(resolve, 100))
    
    setVisibleChunks(prev => prev + 1)
    setIsLoadingMore(false)
  }, [isLoadingMore, hasMore])

  const reset = useCallback(() => {
    setVisibleChunks(1)
    setIsLoadingMore(false)
  }, [])

  // Resetar quando items mudam
  useEffect(() => {
    reset()
  }, [items.length, reset])

  return {
    visibleItems,
    hasMore,
    isLoadingMore,
    loadMore,
    reset,
    progress: (visibleItems.length / items.length) * 100
  }
}