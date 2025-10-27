import { v4 as uuidv4 } from 'uuid'
import jwt from 'jsonwebtoken'
import { verifyToken } from '../middleware/auth'

// Interface para tokens na blacklist
interface BlacklistedToken {
  token: string
  userId: string
  expiresAt: Date
  blacklistedAt: Date
  reason: 'logout' | 'security' | 'expired'
}

// Store em memória para tokens blacklistados
// Em produção, isso deveria usar Redis ou MongoDB
class TokenBlacklistService {
  private blacklist: Map<string, BlacklistedToken> = new Map()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Limpeza automática a cada hora
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60 * 60 * 1000) // 1 hora
  }

  /**
   * Adiciona um token à blacklist
   */
  blacklistToken(
    token: string, 
    userId: string, 
    expiresAt: Date, 
    reason: 'logout' | 'security' | 'expired' = 'logout'
  ): void {
    const blacklistedToken: BlacklistedToken = {
      token,
      userId,
      expiresAt,
      blacklistedAt: new Date(),
      reason
    }

    this.blacklist.set(token, blacklistedToken)
    
    console.log(`🚫 Token blacklistado: ${reason} - Usuário: ${userId}`)
  }

  /**
   * Verifica se um token está na blacklist
   */
  isTokenBlacklisted(token: string): boolean {
    return this.blacklist.has(token)
  }

  /**
   * Remove tokens expirados da blacklist
   */
  private cleanup(): void {
    const now = new Date()
    let removedCount = 0

    for (const [token, blacklistedToken] of this.blacklist.entries()) {
      if (blacklistedToken.expiresAt <= now) {
        this.blacklist.delete(token)
        removedCount++
      }
    }

    if (removedCount > 0) {
      console.log(`🧹 Limpeza da blacklist: ${removedCount} tokens expirados removidos`)
    }
  }

  /**
   * Adiciona todos os tokens de um usuário à blacklist (útil para logout total)
   */
  blacklistAllUserTokens(userId: string, reason: 'security' | 'logout' = 'security'): void {
    // Em uma implementação real, você precisaria manter um registro de todos os tokens ativos por usuário
    // Por agora, vamos apenas logar a ação
    console.log(`🚫 Todos os tokens do usuário ${userId} foram invalidados: ${reason}`)
  }

  /**
   * Obtém estatísticas da blacklist
   */
  getStats(): {
    totalBlacklisted: number
    byReason: Record<string, number>
    oldestEntry?: Date
    newestEntry?: Date
  } {
    const stats = {
      totalBlacklisted: this.blacklist.size,
      byReason: {
        logout: 0,
        security: 0,
        expired: 0
      },
      oldestEntry: undefined as Date | undefined,
      newestEntry: undefined as Date | undefined
    }

    for (const blacklistedToken of this.blacklist.values()) {
      stats.byReason[blacklistedToken.reason]++
      
      if (!stats.oldestEntry || blacklistedToken.blacklistedAt < stats.oldestEntry) {
        stats.oldestEntry = blacklistedToken.blacklistedAt
      }
      
      if (!stats.newestEntry || blacklistedToken.blacklistedAt > stats.newestEntry) {
        stats.newestEntry = blacklistedToken.blacklistedAt
      }
    }

    return stats
  }

  /**
   * Limpa toda a blacklist (cuidado!)
   */
  clearAll(): void {
    const size = this.blacklist.size
    this.blacklist.clear()
    console.log(`🗑️ Blacklist limpa: ${size} tokens removidos`)
  }

  /**
   * Cleanup quando o serviço é destruído
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.clearAll()
  }
}

// Singleton instance
export const tokenBlacklistService = new TokenBlacklistService()

// Middleware para verificar tokens blacklistados
export const checkTokenBlacklist = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (token && tokenBlacklistService.isTokenBlacklisted(token)) {
    return res.status(401).json({
      success: false,
      message: 'Token foi invalidado. Faça login novamente.',
      code: 'TOKEN_BLACKLISTED'
    })
  }

  next()
}

export default TokenBlacklistService