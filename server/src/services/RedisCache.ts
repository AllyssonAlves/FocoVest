import Redis from 'ioredis'
import { Request, Response, NextFunction } from 'express'
import { performance } from 'perf_hooks'

/**
 * Cliente Redis otimizado com configurações de performance
 */
class OptimizedRedisClient {
  private client: Redis
  private isConnected: boolean = false
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 10

  constructor() {
    const redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      
      // Configurações de performance
      connectTimeout: 10000,
      commandTimeout: 5000,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      
      // Pool de conexões
      family: 4,
      keepAlive: 30000, // keepAlive deve ser número (ms)
      
      // Configurações de reconexão
      retryDelayOnCluster: 100,
      enableReadyCheck: true,
      
      // Lazy connect para melhor performance
      lazyConnect: true
    }

    this.client = new Redis(redisConfig)
    this.setupEventHandlers()
  }

  private setupEventHandlers() {
    this.client.on('connect', () => {
      console.log('🔗 Conectado ao Redis')
      this.isConnected = true
      this.reconnectAttempts = 0
    })

    this.client.on('ready', () => {
      console.log('✅ Redis pronto para uso')
    })

    this.client.on('error', (error: any) => {
      console.error('❌ Erro no Redis:', error.message)
      this.isConnected = false
    })

    this.client.on('close', () => {
      console.log('🔌 Conexão Redis fechada')
      this.isConnected = false
    })

    this.client.on('reconnecting', (time: any) => {
      this.reconnectAttempts++
      console.log(`🔄 Reconectando ao Redis (tentativa ${this.reconnectAttempts}) em ${time}ms`)
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('💥 Máximo de tentativas de reconexão atingido')
        this.client.disconnect()
      }
    })
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect()
    }
  }

  async disconnect(): Promise<void> {
    await this.client.disconnect()
  }

  getClient(): Redis {
    return this.client
  }

  isReady(): boolean {
    return this.isConnected && this.client.status === 'ready'
  }
}

// Instância singleton do cliente Redis
const redisClient = new OptimizedRedisClient()

/**
 * Serviço de cache Redis otimizado
 */
export class RedisCache {
  private client: Redis
  private defaultTTL: number = 300 // 5 minutos
  private keyPrefix: string = 'focovest:'

  constructor() {
    this.client = redisClient.getClient()
  }

  private getKey(key: string): string {
    return `${this.keyPrefix}${key}`
  }

  /**
   * Buscar dados do cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      if (!redisClient.isReady()) {
        console.warn('⚠️ Redis não disponível, pulando cache')
        return null
      }

      const start = performance.now()
      const data = await this.client.get(this.getKey(key))
      const duration = performance.now() - start

      if (data) {
        console.log(`📋 Cache HIT: ${key} (${duration.toFixed(2)}ms)`)
        return JSON.parse(data)
      } else {
        console.log(`💭 Cache MISS: ${key}`)
        return null
      }
    } catch (error) {
      console.error(`❌ Erro ao buscar cache ${key}:`, error)
      return null
    }
  }

  /**
   * Armazenar dados no cache
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    try {
      if (!redisClient.isReady()) {
        console.warn('⚠️ Redis não disponível, pulando cache')
        return false
      }

      const start = performance.now()
      const serialized = JSON.stringify(value)
      const cacheTTL = ttl || this.defaultTTL

      await this.client.setex(this.getKey(key), cacheTTL, serialized)
      const duration = performance.now() - start

      console.log(`💾 Cache SET: ${key} (${duration.toFixed(2)}ms, TTL: ${cacheTTL}s)`)
      return true
    } catch (error) {
      console.error(`❌ Erro ao armazenar cache ${key}:`, error)
      return false
    }
  }

  /**
   * Buscar ou armazenar (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttl?: number
  ): Promise<T> {
    // Tentar buscar do cache primeiro
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // Se não encontrar, buscar dados e armazenar no cache
    console.log(`🔄 Executando fetcher para: ${key}`)
    const start = performance.now()
    const data = await fetcher()
    const fetchDuration = performance.now() - start

    console.log(`⚡ Fetcher executado: ${key} (${fetchDuration.toFixed(2)}ms)`)
    
    // Armazenar no cache de forma assíncrona
    this.set(key, data, ttl).catch(error => 
      console.error(`❌ Erro ao cache após fetch ${key}:`, error)
    )

    return data
  }

  /**
   * Invalidar cache por padrão
   */
  async invalidatePattern(pattern: string): Promise<number> {
    try {
      if (!redisClient.isReady()) {
        console.warn('⚠️ Redis não disponível, pulando invalidação')
        return 0
      }

      const fullPattern = this.getKey(pattern)
      const keys = await this.client.keys(fullPattern)
      
      if (keys.length === 0) {
        return 0
      }

      const start = performance.now()
      const deleted = await this.client.del(...keys)
      const duration = performance.now() - start

      console.log(`🗑️ Invalidados ${deleted} caches (padrão: ${pattern}, ${duration.toFixed(2)}ms)`)
      return deleted
    } catch (error) {
      console.error(`❌ Erro ao invalidar padrão ${pattern}:`, error)
      return 0
    }
  }

  /**
   * Deletar cache específico
   */
  async delete(key: string): Promise<boolean> {
    try {
      if (!redisClient.isReady()) {
        return false
      }

      const deleted = await this.client.del(this.getKey(key))
      console.log(`🗑️ Cache deletado: ${key}`)
      return deleted > 0
    } catch (error) {
      console.error(`❌ Erro ao deletar cache ${key}:`, error)
      return false
    }
  }

  /**
   * Incrementar contador
   */
  async increment(key: string, ttl?: number): Promise<number> {
    try {
      if (!redisClient.isReady()) {
        return 0
      }

      const fullKey = this.getKey(key)
      const value = await this.client.incr(fullKey)
      
      if (ttl && value === 1) {
        await this.client.expire(fullKey, ttl)
      }

      return value
    } catch (error) {
      console.error(`❌ Erro ao incrementar ${key}:`, error)
      return 0
    }
  }

  /**
   * Obter estatísticas do cache
   */
  async getStats(): Promise<{
    totalKeys: number
    memoryUsage: string
    hitRate: number
    isConnected: boolean
  }> {
    try {
      if (!redisClient.isReady()) {
        return {
          totalKeys: 0,
          memoryUsage: '0B',
          hitRate: 0,
          isConnected: false
        }
      }

      const info = await this.client.info('stats')
      const keyspace = await this.client.info('keyspace')
      
      // Parse das estatísticas
      const statsLines = info.split('\r\n')
      const hits = parseInt(statsLines.find((l: any) => l.startsWith('keyspace_hits:'))?.split(':')[1] || '0')
      const misses = parseInt(statsLines.find((l: any) => l.startsWith('keyspace_misses:'))?.split(':')[1] || '0')
      
      const totalKeys = keyspace.includes('db0:') ? 
        parseInt(keyspace.split('keys=')[1]?.split(',')[0] || '0') : 0

      const memory = await this.client.memory('USAGE', this.keyPrefix + '*')

      return {
        totalKeys,
        memoryUsage: this.formatBytes(memory || 0),
        hitRate: hits + misses > 0 ? (hits / (hits + misses)) * 100 : 0,
        isConnected: true
      }
    } catch (error) {
      console.error('❌ Erro ao obter stats do cache:', error)
      return {
        totalKeys: 0,
        memoryUsage: '0B',
        hitRate: 0,
        isConnected: false
      }
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + sizes[i]
  }
}

/**
 * Middleware de cache HTTP otimizado
 */
export function cacheMiddleware(
  keyGenerator?: (req: Request) => string,
  ttl: number = 300
) {
  const cache = new RedisCache()

  return async (req: Request, res: Response, next: NextFunction) => {
    // Apenas GET requests são cacheáveis
    if (req.method !== 'GET') {
      return next()
    }

    const cacheKey = keyGenerator ? 
      keyGenerator(req) : 
      `http:${req.originalUrl}:${JSON.stringify(req.query)}`

    try {
      // Tentar buscar do cache
      const cachedResponse = await cache.get<{
        data: any
        headers: Record<string, string>
        statusCode: number
      }>(cacheKey)

      if (cachedResponse) {
        // Responder com dados do cache
        res.set(cachedResponse.headers)
        res.set('X-Cache-Status', 'HIT')
        return res.status(cachedResponse.statusCode).json(cachedResponse.data)
      }

      // Interceptar a resposta para cachear
      const originalJson = res.json
      res.json = function(body: any) {
        // Armazenar no cache se resposta for bem sucedida
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cache.set(cacheKey, {
            data: body,
            headers: { 'Content-Type': 'application/json' },
            statusCode: res.statusCode
          }, ttl).catch(error => 
            console.error('❌ Erro ao cachear resposta:', error)
          )
        }

        res.set('X-Cache-Status', 'MISS')
        return originalJson.call(this, body)
      }

      next()
    } catch (error) {
      console.error('❌ Erro no middleware de cache:', error)
      next()
    }
  }
}

// Conectar Redis na inicialização
export async function initializeRedis(): Promise<void> {
  try {
    await redisClient.connect()
    console.log('🚀 Redis inicializado com sucesso')
  } catch (error) {
    console.error('❌ Falha ao inicializar Redis:', error)
    console.log('⚠️ Continuando sem cache Redis')
  }
}

// Fechar conexão Redis
export async function closeRedis(): Promise<void> {
  await redisClient.disconnect()
}

export { redisClient }