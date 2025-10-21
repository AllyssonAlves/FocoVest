import cors from 'cors'
import { Request } from 'express'

// Lista de origins permitidas
const allowedOrigins = [
  'http://localhost:3000', // Development frontend
  'http://localhost:5173', // Vite dev server
  'https://focovest.com', // Production domain (exemplo)
  'https://www.focovest.com', // Production domain with www
  'https://focovest-platform.vercel.app', // Vercel deployment (exemplo)
  // Adicionar mais origins conforme necessário
]

// Configuração dinâmica de CORS
const corsOptions: cors.CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Permitir requests sem origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true)
    }

    // Verificar se a origin está na lista permitida
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      console.log(`🚨 CORS blocked origin: ${origin}`)
      callback(new Error('Acesso negado pela política CORS'), false)
    }
  },
  credentials: true, // Permitir cookies e headers de autenticação
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key',
    'X-User-Agent'
  ],
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset'
  ],
  optionsSuccessStatus: 200, // Para suporte a browsers legados
  preflightContinue: false,
  maxAge: 86400 // Cache do preflight por 24 horas
}

// Configuração específica para desenvolvimento
export const devCorsOptions: cors.CorsOptions = {
  origin: true, // Permitir qualquer origin em desenvolvimento
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['*'],
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset'
  ]
}

// Middleware customizado para logs de CORS
export const corsLogger = (req: Request, res: any, next: any) => {
  const origin = req.get('origin')
  if (origin && process.env.NODE_ENV === 'development') {
    console.log(`🌐 CORS request from: ${origin}`)
  }
  next()
}

// Função para obter configuração do CORS
export const getCorsOptions = (): cors.CorsOptions => {
  return process.env.NODE_ENV === 'production' ? corsOptions : devCorsOptions
}

// Configuração principal do CORS
export const corsConfig = process.env.NODE_ENV === 'production' 
  ? corsOptions 
  : devCorsOptions

export default cors(corsConfig)