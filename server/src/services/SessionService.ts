import { Request } from 'express'
import { v4 as uuidv4 } from 'uuid'

export interface DeviceInfo {
  id: string
  userAgent: string
  ip: string
  browser: string
  os: string
  lastActivity: Date
  createdAt: Date
}

export interface UserSession {
  userId: string
  sessionId: string
  deviceInfo: DeviceInfo
  refreshToken: string
  isActive: boolean
  expiresAt: Date
}

export class SessionService {
  private static sessions: UserSession[] = []

  // Criar nova sessão
  static async createSession(
    userId: string,
    deviceInfo: Partial<DeviceInfo>,
    refreshToken: string
  ): Promise<UserSession> {
    const sessionId = uuidv4()
    const deviceId = uuidv4()
    
    const session: UserSession = {
      userId,
      sessionId,
      deviceInfo: {
        id: deviceId,
        userAgent: deviceInfo.userAgent || '',
        ip: deviceInfo.ip || '',
        browser: deviceInfo.browser || 'Unknown',
        os: deviceInfo.os || 'Unknown',
        lastActivity: new Date(),
        createdAt: new Date()
      },
      refreshToken,
      isActive: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
    }

    this.sessions.push(session)
    return session
  }

  // Buscar sessão por refresh token
  static async findSessionByRefreshToken(refreshToken: string): Promise<UserSession | null> {
    return this.sessions.find(
      session => session.refreshToken === refreshToken && session.isActive
    ) || null
  }

  // Buscar sessões ativas do usuário
  static async findUserActiveSessions(userId: string): Promise<UserSession[]> {
    return this.sessions.filter(
      session => session.userId === userId && session.isActive
    )
  }

  // Atualizar atividade da sessão
  static async updateSessionActivity(sessionId: string): Promise<void> {
    const session = this.sessions.find(s => s.sessionId === sessionId)
    if (session) {
      session.deviceInfo.lastActivity = new Date()
    }
  }

  // Invalidar sessão específica
  static async invalidateSession(sessionId: string): Promise<void> {
    const session = this.sessions.find(s => s.sessionId === sessionId)
    if (session) {
      session.isActive = false
    }
  }

  // Invalidar sessão por refresh token
  static async invalidateSessionByRefreshToken(refreshToken: string): Promise<void> {
    const session = this.sessions.find(s => s.refreshToken === refreshToken)
    if (session) {
      session.isActive = false
    }
  }

  // Invalidar todas as sessões do usuário
  static async invalidateAllUserSessions(userId: string): Promise<void> {
    this.sessions.forEach(session => {
      if (session.userId === userId) {
        session.isActive = false
      }
    })
  }

  // Invalidar todas as sessões exceto a atual
  static async invalidateOtherSessions(userId: string, currentSessionId: string): Promise<void> {
    this.sessions.forEach(session => {
      if (session.userId === userId && session.sessionId !== currentSessionId) {
        session.isActive = false
      }
    })
  }

  // Limpar sessões expiradas
  static async cleanExpiredSessions(): Promise<void> {
    const now = new Date()
    this.sessions.forEach(session => {
      if (session.expiresAt < now) {
        session.isActive = false
      }
    })
  }

  // Obter estatísticas de sessões
  static async getSessionStats(userId: string): Promise<{
    activeSessions: number
    totalDevices: number
    lastActivity: Date | null
  }> {
    const userSessions = this.sessions.filter(s => s.userId === userId && s.isActive)
    const lastActivity = userSessions.length > 0 
      ? new Date(Math.max(...userSessions.map(s => s.deviceInfo.lastActivity.getTime())))
      : null

    return {
      activeSessions: userSessions.length,
      totalDevices: userSessions.length,
      lastActivity
    }
  }

  // Obter informações do dispositivo a partir do User-Agent
  static parseUserAgent(userAgent: string): { browser: string, os: string } {
    let browser = 'Unknown'
    let os = 'Unknown'

    // Detectar browser
    if (userAgent.includes('Chrome')) browser = 'Chrome'
    else if (userAgent.includes('Firefox')) browser = 'Firefox'
    else if (userAgent.includes('Safari')) browser = 'Safari'
    else if (userAgent.includes('Edge')) browser = 'Edge'
    else if (userAgent.includes('Opera')) browser = 'Opera'

    // Detectar OS
    if (userAgent.includes('Windows')) os = 'Windows'
    else if (userAgent.includes('Mac')) os = 'macOS'
    else if (userAgent.includes('Linux')) os = 'Linux'
    else if (userAgent.includes('Android')) os = 'Android'
    else if (userAgent.includes('iOS')) os = 'iOS'

    return { browser, os }
  }

  // Extrair informações do dispositivo da request
  static extractDeviceInfo(req: Request): Partial<DeviceInfo> {
    const userAgent = req.headers['user-agent'] || ''
    const ip = req.ip || req.connection.remoteAddress || ''
    const { browser, os } = this.parseUserAgent(userAgent)

    return {
      userAgent,
      ip,
      browser,
      os
    }
  }
}