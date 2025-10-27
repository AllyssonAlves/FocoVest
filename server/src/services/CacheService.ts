import { EventEmitter } from 'events'

/**
 * Interface para configuração do cache
 */
interface CacheConfig {
  defaultTTL: number // Time To Live em segundos
  maxSize: number    // Número máximo de entradas
  cleanupInterval: number // Intervalo de limpeza em segundos
}

/**
 * Interface para entrada do cache
 */
interface CacheEntry<T> {
  data: T
  createdAt: number
  ttl: number
  lastAccessed: number
  accessCount: number
}

/**
 * Interface para métricas do cache
 */
interface CacheMetrics {
  hits: number
  misses: number
  evictions: number
  entries: number
  hitRate: number
  memoryUsage: number
}

/**
 * Eventos emitidos pelo cache
 */
interface CacheEvents {
  'hit': { key: string }
  'miss': { key: string }
  'set': { key: string, ttl: number }
  'evicted': { key: string, reason: 'ttl' | 'size' | 'manual' }
  'cleared': {}
}

/**
 * Sistema de Cache em Memória Avançado para Estatísticas
 * 
 * Funcionalidades:
 * - Cache com TTL personalizável
 * - Eviction por LRU quando atingir tamanho máximo
 * - Métricas detalhadas de performance
 * - Limpeza automática de entradas expiradas
 * - Invalidação manual e por padrões
 * - Eventos para monitoramento
 */
class AdvancedCacheService extends EventEmitter {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private config: CacheConfig
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    evictions: 0,
    entries: 0,
    hitRate: 0,
    memoryUsage: 0
  }
  private cleanupTimer: NodeJS.Timeout | null = null

  constructor(config: Partial<CacheConfig> = {}) {
    super()
    
    this.config = {
      defaultTTL: 300, // 5 minutos
      maxSize: 1000,   // 1000 entradas
      cleanupInterval: 60, // 1 minuto
      ...config
    }

    this.startCleanupTimer()
    console.log('🚀 AdvancedCacheService: Cache inicializado', {
      defaultTTL: this.config.defaultTTL,
      maxSize: this.config.maxSize,
      cleanupInterval: this.config.cleanupInterval
    })
  }

  /**
   * Buscar valor do cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      this.metrics.misses++
      this.emit('miss', { key })
      this.updateMetrics()
      return null
    }

    // Verificar se expirou
    const now = Date.now()
    if (now - entry.createdAt > entry.ttl * 1000) {
      this.cache.delete(key)
      this.metrics.evictions++
      this.emit('evicted', { key, reason: 'ttl' })
      this.metrics.misses++
      this.emit('miss', { key })
      this.updateMetrics()
      return null
    }

    // Atualizar estatísticas de acesso
    entry.lastAccessed = now
    entry.accessCount++
    
    this.metrics.hits++
    this.emit('hit', { key })
    this.updateMetrics()

    return entry.data as T
  }

  /**
   * Armazenar valor no cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now()
    const entryTTL = ttl || this.config.defaultTTL

    // Verificar se precisa fazer eviction por tamanho
    if (this.cache.size >= this.config.maxSize && !this.cache.has(key)) {
      this.evictLRU()
    }

    const entry: CacheEntry<T> = {
      data,
      createdAt: now,
      ttl: entryTTL,
      lastAccessed: now,
      accessCount: 0
    }

    this.cache.set(key, entry)
    this.emit('set', { key, ttl: entryTTL })
    this.updateMetrics()
  }

  /**
   * Verificar se existe no cache
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    // Verificar se expirou
    const now = Date.now()
    if (now - entry.createdAt > entry.ttl * 1000) {
      this.cache.delete(key)
      this.metrics.evictions++
      this.emit('evicted', { key, reason: 'ttl' })
      this.updateMetrics()
      return false
    }

    return true
  }

  /**
   * Remover entrada específica
   */
  delete(key: string): boolean {
    const existed = this.cache.delete(key)
    if (existed) {
      this.emit('evicted', { key, reason: 'manual' })
      this.updateMetrics()
    }
    return existed
  }

  /**
   * Invalidar múltiplas entradas por padrão
   */
  invalidatePattern(pattern: string): number {
    const regex = new RegExp(pattern)
    let invalidated = 0

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
        this.emit('evicted', { key, reason: 'manual' })
        invalidated++
      }
    }

    this.updateMetrics()
    return invalidated
  }

  /**
   * Limpar todo o cache
   */
  clear(): void {
    this.cache.clear()
    this.metrics.evictions += this.metrics.entries
    this.emit('cleared', {})
    this.updateMetrics()
  }

  /**
   * Obter métricas do cache
   */
  getMetrics(): CacheMetrics {
    return { ...this.metrics }
  }

  /**
   * Obter ou definir valor (cache wrapper)
   */
  async getOrSet<T>(
    key: string, 
    factory: () => Promise<T>, 
    ttl?: number
  ): Promise<T> {
    // Tentar buscar do cache primeiro
    const cached = this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // Se não encontrou, executar factory e armazenar
    const data = await factory()
    this.set(key, data, ttl)
    return data
  }

  /**
   * Eviction por LRU (Least Recently Used)
   */
  private evictLRU(): void {
    let oldestKey: string | null = null
    let oldestTime = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
      this.metrics.evictions++
      this.emit('evicted', { key: oldestKey, reason: 'size' })
    }
  }

  /**
   * Limpeza automática de entradas expiradas
   */
  private cleanup(): void {
    const now = Date.now()
    let cleaned = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.createdAt > entry.ttl * 1000) {
        this.cache.delete(key)
        this.emit('evicted', { key, reason: 'ttl' })
        cleaned++
      }
    }

    if (cleaned > 0) {
      this.metrics.evictions += cleaned
      this.updateMetrics()
      console.log(`🧹 Cache: Limpeza automática removeu ${cleaned} entradas expiradas`)
    }
  }

  /**
   * Iniciar timer de limpeza automática
   */
  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.config.cleanupInterval * 1000)
  }

  /**
   * Atualizar métricas calculadas
   */
  private updateMetrics(): void {
    this.metrics.entries = this.cache.size
    const total = this.metrics.hits + this.metrics.misses
    this.metrics.hitRate = total > 0 ? (this.metrics.hits / total) * 100 : 0
    
    // Estimativa simplificada de uso de memória
    this.metrics.memoryUsage = this.cache.size * 1024 // 1KB por entrada (estimativa)
  }

  /**
   * Parar o serviço e limpar recursos
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
    this.clear()
    this.removeAllListeners()
    console.log('🛑 AdvancedCacheService: Cache destruído')
  }
}

// Instância singleton do cache
export const cacheService = new AdvancedCacheService({
  defaultTTL: 300,  // 5 minutos para estatísticas
  maxSize: 500,     // 500 entradas de cache
  cleanupInterval: 120 // Limpeza a cada 2 minutos
})

// Configurar logs estruturados de eventos de cache
import { globalLogger } from '../utils/logger'

cacheService.on('hit', ({ key }) => {
  globalLogger.cacheEvent('hit', key)
})

cacheService.on('miss', ({ key }) => {
  globalLogger.cacheEvent('miss', key)
})

cacheService.on('evicted', ({ key, reason }) => {
  globalLogger.cacheEvent('evicted', key, { reason })
})

export default AdvancedCacheService
export type { CacheConfig, CacheMetrics, CacheEvents }