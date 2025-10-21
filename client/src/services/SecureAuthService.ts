import CryptoJS from 'crypto-js'
import { sanitizeInput, isValidJWTFormat, loginRateLimiter } from '../utils/security'

interface AuthResponse {
  success: boolean
  data?: any
  message?: string
  rateLimited?: boolean
  remainingTime?: number
}

class SecureAuthService {
  private readonly tokenKey = 'focovest_token'
  private readonly refreshKey = 'focovest_refresh_token'
  private readonly encryptionKey = process.env.REACT_APP_ENCRYPTION_KEY || 'fallback-key-change-in-production'

  // Criptografia de dados sensíveis
  private encrypt(text: string): string {
    return CryptoJS.AES.encrypt(text, this.encryptionKey).toString()
  }

  private decrypt(ciphertext: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, this.encryptionKey)
      return bytes.toString(CryptoJS.enc.Utf8)
    } catch {
      return ''
    }
  }

  // Armazenamento seguro de tokens
  secureSetToken(token: string): void {
    if (!isValidJWTFormat(token)) {
      throw new Error('Token format is invalid')
    }
    
    const encryptedToken = this.encrypt(token)
    localStorage.setItem(this.tokenKey, encryptedToken)
  }

  secureGetToken(): string | null {
    try {
      const encryptedToken = localStorage.getItem(this.tokenKey)
      if (!encryptedToken) return null
      
      const token = this.decrypt(encryptedToken)
      return isValidJWTFormat(token) ? token : null
    } catch {
      this.clearTokens()
      return null
    }
  }

  // Login seguro com rate limiting
  async secureLogin(email: string, password: string): Promise<AuthResponse> {
    // Sanitizar entrada
    const sanitizedEmail = sanitizeInput(email).toLowerCase()
    const identifier = this.getIdentifier(sanitizedEmail)

    // Verificar rate limiting
    if (!loginRateLimiter.isAllowed(identifier)) {
      const remainingTime = loginRateLimiter.getRemainingTime(identifier)
      return {
        success: false,
        message: 'Muitas tentativas de login. Tente novamente mais tarde.',
        rateLimited: true,
        remainingTime: Math.ceil(remainingTime / 1000 / 60) // em minutos
      }
    }

    try {
      // Hash da senha antes de enviar (adicional à segurança do servidor)
      const hashedPassword = CryptoJS.SHA256(password).toString()

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest' // CSRF protection
        },
        body: JSON.stringify({
          email: sanitizedEmail,
          password: hashedPassword,
          timestamp: Date.now() // Previne replay attacks
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        this.secureSetToken(data.token)
        if (data.refreshToken) {
          this.setRefreshToken(data.refreshToken)
        }
        return { success: true, data: data.user }
      }

      return { success: false, message: data.message || 'Erro no login' }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: 'Erro de conexão' }
    }
  }

  // Logout seguro
  secureLogout(): void {
    this.clearTokens()
    // Invalidar sessão no servidor se possível
    this.invalidateServerSession()
  }

  private async invalidateServerSession(): Promise<void> {
    try {
      const token = this.secureGetToken()
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      }
    } catch (error) {
      console.error('Error invalidating server session:', error)
    }
  }

  // Verificação de token
  async verifyToken(): Promise<boolean> {
    const token = this.secureGetToken()
    if (!token) return false

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        this.clearTokens()
        return false
      }

      return true
    } catch {
      this.clearTokens()
      return false
    }
  }

  // Refresh token
  private setRefreshToken(refreshToken: string): void {
    const encrypted = this.encrypt(refreshToken)
    localStorage.setItem(this.refreshKey, encrypted)
  }

  private getRefreshToken(): string | null {
    try {
      const encrypted = localStorage.getItem(this.refreshKey)
      return encrypted ? this.decrypt(encrypted) : null
    } catch {
      return null
    }
  }

  async refreshAccessToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) return false

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        this.secureSetToken(data.token)
        return true
      }

      this.clearTokens()
      return false
    } catch {
      this.clearTokens()
      return false
    }
  }

  // Utilitários
  private clearTokens(): void {
    localStorage.removeItem(this.tokenKey)
    localStorage.removeItem(this.refreshKey)
  }

  private getIdentifier(email: string): string {
    // Combina email com IP (se disponível) para rate limiting
    return CryptoJS.MD5(email + (navigator.userAgent || '')).toString()
  }

  // Validação de sessão ativa
  isSessionValid(): boolean {
    const token = this.secureGetToken()
    if (!token) return false

    try {
      // Verificação básica de expiração do JWT
      const payload = JSON.parse(atob(token.split('.')[1]))
      const now = Math.floor(Date.now() / 1000)
      return payload.exp > now
    } catch {
      this.clearTokens()
      return false
    }
  }

  // Headers seguros para requisições
  getSecureHeaders(): Record<string, string> {
    const token = this.secureGetToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }
}

export default new SecureAuthService()