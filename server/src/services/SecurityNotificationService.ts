import { Request } from 'express'
import { SessionService } from './SessionService'

export interface SecurityAlert {
  type: 'new_login' | 'suspicious_activity' | 'password_change' | 'multiple_failed_attempts'
  userId: string
  message: string
  details: any
  timestamp: Date
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export class SecurityNotificationService {
  private static alerts: SecurityAlert[] = []

  // Detectar novo dispositivo no login
  static async checkNewDeviceLogin(
    userId: string, 
    req: Request
  ): Promise<{ isNewDevice: boolean; alert?: SecurityAlert }> {
    try {
      const deviceInfo = SessionService.extractDeviceInfo(req)
      const existingSessions = await SessionService.findUserActiveSessions(userId)
      
      // Verificar se é um dispositivo/localização conhecida
      const isKnownDevice = existingSessions.some(session => {
        const device = session.deviceInfo
        return device.userAgent === deviceInfo.userAgent ||
               (device.browser === deviceInfo.browser && 
                device.os === deviceInfo.os && 
                device.ip === deviceInfo.ip)
      })

      if (!isKnownDevice) {
        const alert: SecurityAlert = {
          type: 'new_login',
          userId,
          message: `Novo login detectado de ${deviceInfo.browser} em ${deviceInfo.os} (IP: ${deviceInfo.ip})`,
          details: {
            browser: deviceInfo.browser,
            os: deviceInfo.os,
            ip: deviceInfo.ip,
            userAgent: deviceInfo.userAgent,
            timestamp: new Date()
          },
          timestamp: new Date(),
          severity: 'medium'
        }

        this.alerts.push(alert)
        console.log('🚨 Novo dispositivo detectado para usuário:', userId)
        
        return { isNewDevice: true, alert }
      }

      return { isNewDevice: false }
    } catch (error) {
      console.error('Erro ao verificar novo dispositivo:', error)
      return { isNewDevice: false }
    }
  }

  // Detectar atividade suspeita (múltiplas tentativas de login)
  static async checkSuspiciousActivity(
    userId: string,
    actionType: string,
    req: Request
  ): Promise<SecurityAlert | null> {
    try {
      // Verificar tentativas recentes do mesmo IP
      const currentTime = new Date()
      const oneHourAgo = new Date(currentTime.getTime() - 60 * 60 * 1000)
      
      const recentAlerts = this.alerts.filter(alert =>
        alert.details?.ip === req.ip &&
        alert.timestamp > oneHourAgo &&
        alert.type === 'multiple_failed_attempts'
      )

      if (recentAlerts.length >= 3) {
        const alert: SecurityAlert = {
          type: 'suspicious_activity',
          userId,
          message: `Atividade suspeita detectada: ${recentAlerts.length} tentativas falhadas na última hora`,
          details: {
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            attemptCount: recentAlerts.length,
            actionType,
            timestamp: new Date()
          },
          timestamp: new Date(),
          severity: 'high'
        }

        this.alerts.push(alert)
        console.log('🚨 Atividade suspeita detectada para usuário:', userId)
        
        return alert
      }

      return null
    } catch (error) {
      console.error('Erro ao verificar atividade suspeita:', error)
      return null
    }
  }

  // Registrar tentativa de login falhada
  static async recordFailedLogin(
    email: string,
    req: Request
  ): Promise<void> {
    try {
      const alert: SecurityAlert = {
        type: 'multiple_failed_attempts',
        userId: email, // Usando email quando não temos userId
        message: `Tentativa de login falhada para ${email}`,
        details: {
          email,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          timestamp: new Date()
        },
        timestamp: new Date(),
        severity: 'low'
      }

      this.alerts.push(alert)
      
      // Limpar alertas antigos (mais de 24h)
      this.cleanOldAlerts()
    } catch (error) {
      console.error('Erro ao registrar tentativa de login falhada:', error)
    }
  }

  // Obter alertas de segurança do usuário
  static async getUserSecurityAlerts(
    userId: string,
    limit: number = 10
  ): Promise<SecurityAlert[]> {
    try {
      return this.alerts
        .filter(alert => alert.userId === userId)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit)
    } catch (error) {
      console.error('Erro ao obter alertas de segurança:', error)
      return []
    }
  }

  // Obter estatísticas de segurança
  static async getSecurityStats(userId: string): Promise<{
    totalAlerts: number
    criticalAlerts: number
    recentAlerts: number
    lastAlert: Date | null
  }> {
    try {
      const userAlerts = this.alerts.filter(alert => alert.userId === userId)
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)
      
      return {
        totalAlerts: userAlerts.length,
        criticalAlerts: userAlerts.filter(alert => 
          alert.severity === 'critical' || alert.severity === 'high'
        ).length,
        recentAlerts: userAlerts.filter(alert => alert.timestamp > last24Hours).length,
        lastAlert: userAlerts.length > 0 
          ? new Date(Math.max(...userAlerts.map(alert => alert.timestamp.getTime())))
          : null
      }
    } catch (error) {
      console.error('Erro ao obter estatísticas de segurança:', error)
      return {
        totalAlerts: 0,
        criticalAlerts: 0,
        recentAlerts: 0,
        lastAlert: null
      }
    }
  }

  // Limpar alertas antigos
  static cleanOldAlerts(): void {
    try {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      this.alerts = this.alerts.filter(alert => alert.timestamp > oneWeekAgo)
    } catch (error) {
      console.error('Erro ao limpar alertas antigos:', error)
    }
  }

  // Marcar alerta como lido
  static async markAlertAsRead(alertIndex: number): Promise<void> {
    try {
      if (this.alerts[alertIndex]) {
        this.alerts[alertIndex].details = {
          ...this.alerts[alertIndex].details,
          read: true,
          readAt: new Date()
        }
      }
    } catch (error) {
      console.error('Erro ao marcar alerta como lido:', error)
    }
  }

  // Verificar se IP está na blacklist (simulado)
  static isIPBlacklisted(ip: string): boolean {
    // Lista básica de IPs suspeitos (em produção, usar serviço externo)
    const blacklistedIPs = [
      '192.168.1.100', // IP de exemplo
      '10.0.0.100'     // Outro exemplo
    ]
    
    return blacklistedIPs.includes(ip)
  }

  // Obter informações de geolocalização do IP (simulado)
  static getIPInfo(ip: string): { country: string; city: string; isp?: string } {
    // Em produção, usar serviço como IPInfo.io ou similar
    if (ip.startsWith('192.168') || ip.startsWith('10.0') || ip === '127.0.0.1') {
      return { country: 'BR', city: 'Local' }
    }
    
    return { country: 'Unknown', city: 'Unknown' }
  }
}