// Utilitário para URLs de API consistentes
import config from './environment'

/**
 * Gera URLs de API de forma consistente
 * @param endpoint - O endpoint sem o prefixo /api (ex: 'auth/login', 'users/profile')
 * @returns URL completa (ex: 'http://localhost:5000/api/auth/login')
 */
export const createApiUrl = (endpoint: string): string => {
  // Remove barras iniciais do endpoint se existirem
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  
  // Garante que não haja duplicação de /api
  const baseUrl = config.apiUrl.endsWith('/api') 
    ? config.apiUrl.slice(0, -4) 
    : config.apiUrl
  
  return `${baseUrl}/api/${cleanEndpoint}`
}

/**
 * URLs de autenticação predefinidas
 */
export const authEndpoints = {
  login: createApiUrl('auth/login'),
  register: createApiUrl('auth/register'),
  logout: createApiUrl('auth/logout'),
  refreshToken: createApiUrl('auth/refresh-token'),
  me: createApiUrl('auth/me'),
  forgotPassword: createApiUrl('auth/forgot-password'),
  resetPassword: createApiUrl('auth/reset-password'),
  changePassword: createApiUrl('auth/change-password')
}

/**
 * URLs de usuário predefinidas
 */
export const userEndpoints = {
  profile: createApiUrl('users/profile'),
  detailedStats: createApiUrl('users/detailed-stats'),
  updateStats: createApiUrl('users/statistics')
}

/**
 * URLs de simulações predefinidas
 */
export const simulationEndpoints = {
  list: createApiUrl('simulations'),
  create: createApiUrl('simulations'),
  results: createApiUrl('simulations/results'),
  history: createApiUrl('simulations/history')
}

/**
 * URLs de questões predefinidas  
 */
export const questionEndpoints = {
  list: createApiUrl('questions'),
  create: createApiUrl('questions'),
  byId: (id: string) => createApiUrl(`questions/${id}`)
}

/**
 * URLs de ranking predefinidas
 */
export const rankingEndpoints = {
  global: createApiUrl('rankings/global'),
  byUniversity: createApiUrl('rankings/university')
}

export default {
  createApiUrl,
  auth: authEndpoints,
  user: userEndpoints,
  simulation: simulationEndpoints,
  question: questionEndpoints,
  ranking: rankingEndpoints
}