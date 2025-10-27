// Configurações de ambiente para o cliente
interface Config {
  apiUrl: string
  tokenKey: string
  refreshTokenKey: string
  userKey: string
  tokenExpiration: number // em millisegundos
  refreshBeforeExpiry: number // renovar X ms antes de expirar
}

const config: Config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  tokenKey: 'focovest_token',
  refreshTokenKey: 'focovest_refresh_token', 
  userKey: 'focovest_user',
  tokenExpiration: 60 * 60 * 1000, // 1 hora
  refreshBeforeExpiry: 5 * 60 * 1000, // 5 minutos antes
}

export default config