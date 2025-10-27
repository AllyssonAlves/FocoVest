/**
 * Middleware de Segurança Avançado para Express
 * Implementa múltiplas camadas de proteção contra ataques
 */

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { SecureValidator, validate } from './secureValidation';
import crypto from 'crypto';

// Interfaces
interface SecurityRequest extends Request {
  fingerprint?: string;
  rateLimitInfo?: {
    remaining: number;
    resetTime: Date;
  };
  securityLog?: {
    timestamp: Date;
    ip: string;
    userAgent: string;
    endpoint: string;
    method: string;
  };
}

interface SecurityOptions {
  enableCSRF?: boolean;
  enableRateLimit?: boolean;
  enableSlowDown?: boolean;
  enableFingerprinting?: boolean;
  trustedProxies?: string[];
  allowedOrigins?: string[];
}

// Cache para armazenar tokens CSRF
const csrfTokens = new Map<string, { token: string; timestamp: number }>();
const CSRF_TOKEN_LIFETIME = 30 * 60 * 1000; // 30 minutos

// Padrões maliciosos conhecidos
const MALICIOUS_PATTERNS = [
  // SQL Injection
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
  /(\b(OR|AND)\s+\d+\s*=\s*\d+\b)/i,
  /(;\s*--|\|\||&&)/i,
  
  // XSS
  /<script[^>]*>.*?<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe[^>]*>.*?<\/iframe>/gi,
  
  // Path Traversal
  /\.\.[\/\\]/g,
  
  // Command Injection
  /[;&|`$(){}[\]]/g
];

/**
 * Gera fingerprint único do dispositivo
 */
const generateFingerprint = (req: SecurityRequest): string => {
  const components = [
    req.ip,
    req.get('User-Agent') || '',
    req.get('Accept-Language') || '',
    req.get('Accept-Encoding') || '',
    req.get('Accept') || ''
  ];
  
  return crypto
    .createHash('sha256')
    .update(components.join('|'))
    .digest('hex')
    .substring(0, 16);
};

/**
 * Middleware de fingerprinting de dispositivo
 */
export const deviceFingerprinting = (req: SecurityRequest, res: Response, next: NextFunction) => {
  req.fingerprint = generateFingerprint(req);
  
  // Adicionar cabeçalho de fingerprint para o cliente
  res.setHeader('X-Device-Fingerprint', req.fingerprint);
  
  next();
};

/**
 * Middleware de detecção de padrões maliciosos
 */
export const maliciousPatternDetection = (req: SecurityRequest, res: Response, next: NextFunction) => {
  const checkValue = (value: string, source: string): boolean => {
    for (const pattern of MALICIOUS_PATTERNS) {
      if (pattern.test(value)) {
        console.warn(`🚨 Padrão malicioso detectado em ${source}:`, {
          pattern: pattern.toString(),
          value: value.substring(0, 100),
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          timestamp: new Date().toISOString()
        });
        
        res.status(400).json({
          error: 'Requisição contém dados suspeitos',
          code: 'MALICIOUS_PATTERN_DETECTED'
        });
        
        return true; // Padrão malicioso encontrado
      }
    }
    return false; // Nenhum padrão malicioso encontrado
  };

  // Verificar parâmetros da URL
  Object.entries(req.params).forEach(([key, value]) => {
    if (typeof value === 'string') {
      checkValue(value, `params.${key}`);
    }
  });

  // Verificar query string
  Object.entries(req.query).forEach(([key, value]) => {
    if (typeof value === 'string') {
      checkValue(value, `query.${key}`);
    }
  });

  // Verificar corpo da requisição
  if (req.body && typeof req.body === 'object') {
    const checkObject = (obj: any, prefix = 'body') => {
      Object.entries(obj).forEach(([key, value]) => {
        if (typeof value === 'string') {
          checkValue(value, `${prefix}.${key}`);
        } else if (value && typeof value === 'object') {
          checkObject(value, `${prefix}.${key}`);
        }
      });
    };
    
    checkObject(req.body);
  }

  next();
};

/**
 * Middleware de proteção CSRF
 */
export const csrfProtection = (req: SecurityRequest, res: Response, next: NextFunction) => {
  // Limpar tokens expirados
  const now = Date.now();
  for (const [key, value] of csrfTokens.entries()) {
    if (now - value.timestamp > CSRF_TOKEN_LIFETIME) {
      csrfTokens.delete(key);
    }
  }

  if (req.method === 'GET') {
    // Gerar e enviar token CSRF para requisições GET
    const token = crypto.randomBytes(32).toString('hex');
    const sessionId = req.fingerprint || req.ip || 'unknown';
    
    csrfTokens.set(sessionId, {
      token,
      timestamp: now
    });
    
    res.setHeader('X-CSRF-Token', token);
    return next();
  }

  // Verificar token CSRF para outras requisições
  const clientToken = req.get('X-CSRF-Token') || (req.body && req.body._csrf);
  const sessionId = req.fingerprint || req.ip || 'unknown';
  const storedToken = csrfTokens.get(sessionId);

  if (!clientToken || !storedToken || clientToken !== storedToken.token) {
    console.warn('🚨 Token CSRF inválido ou ausente:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });

    return res.status(403).json({
      error: 'Token CSRF inválido ou ausente',
      code: 'INVALID_CSRF_TOKEN'
    });
  }

  next();
};

/**
 * Rate limiting configurável
 */
export const createRateLimit = (options: {
  windowMs?: number;
  max?: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutos
    max: options.max || 100, // máximo de requisições por janela
    message: {
      error: options.message || 'Muitas requisições. Tente novamente mais tarde.',
      code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    handler: (req, res) => {
      console.warn('🚨 Rate limit excedido:', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        endpoint: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
      });

      res.status(429).json({
        error: 'Muitas requisições. Tente novamente mais tarde.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(options.windowMs! / 1000)
      });
    }
  });
};

/**
 * Slow down para diminuir velocidade de respostas
 */
export const createSlowDown = (options: {
  windowMs?: number;
  delayAfter?: number;
  delayMs?: number;
}): any => {
  return slowDown({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutos
    delayAfter: options.delayAfter || 50, // começar a atrasar após 50 requisições
    delayMs: options.delayMs || 100, // atraso incremental de 100ms
    maxDelayMs: 20000, // máximo de 20 segundos de atraso
  });
};

/**
 * Middleware de log de segurança
 */
export const securityLogger = (req: SecurityRequest, res: Response, next: NextFunction) => {
  req.securityLog = {
    timestamp: new Date(),
    ip: req.ip || 'unknown',
    userAgent: req.get('User-Agent') || 'Unknown',
    endpoint: req.path,
    method: req.method
  };

  // Log de requisições suspeitas
  const suspiciousPatterns = [
    /admin/i,
    /wp-admin/i,
    /phpmyadmin/i,
    /\.php$/,
    /\.asp$/,
    /\.jsp$/,
    /\/etc\/passwd/,
    /\/proc\//
  ];

  if (suspiciousPatterns.some(pattern => pattern.test(req.path))) {
    console.warn('🚨 Tentativa de acesso suspeito:', req.securityLog);
  }

  // Log de User-Agents suspeitos
  const suspiciousUserAgents = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scanner/i,
    /curl/i,
    /wget/i
  ];

  const userAgent = req.get('User-Agent') || '';
  if (suspiciousUserAgents.some(pattern => pattern.test(userAgent))) {
    console.warn('🚨 User-Agent suspeito detectado:', {
      userAgent,
      ip: req.ip,
      endpoint: req.path,
      timestamp: new Date().toISOString()
    });
  }

  next();
};

/**
 * Configuração completa de segurança
 */
export const setupSecurity = (app: any, options: SecurityOptions = {}) => {
  // Helmet para cabeçalhos de segurança
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'"],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false
  }));

  // CORS configurado
  app.use(cors({
    origin: options.allowedOrigins || process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200
  }));

  // Compressão
  app.use(compression());

  // Configurar proxy confiável se especificado
  if (options.trustedProxies?.length) {
    app.set('trust proxy', options.trustedProxies);
  }

  // Middlewares de segurança personalizados
  app.use(securityLogger);
  
  if (options.enableFingerprinting !== false) {
    app.use(deviceFingerprinting);
  }
  
  app.use(maliciousPatternDetection);
  
  if (options.enableCSRF !== false) {
    app.use(csrfProtection);
  }
  
  if (options.enableRateLimit !== false) {
    app.use(createRateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100
    }));
  }
  
  if (options.enableSlowDown !== false) {
    app.use(createSlowDown({
      windowMs: 15 * 60 * 1000,
      delayAfter: 50,
      delayMs: 100
    }));
  }
};

/**
 * Validadores comuns para formulários usando sistema seguro
 */
export const validators = {
  email: validate(
    new SecureValidator()
      .field('email').required().isEmail().maxLength(255).build()
  ),
    
  password: validate(
    new SecureValidator()
      .field('password').required().isPassword().minLength(8).maxLength(128)
      .custom((value) => {
        // Senha mais rigorosa com caractere especial
        const hasSpecial = /[@$!%*?&]/.test(value)
        return hasSpecial || 'Senha deve incluir pelo menos um caractere especial (@$!%*?&)'
      }).build()
  ),
    
  name: validate(
    new SecureValidator()
      .field('name').required().isString().minLength(2).maxLength(100)
      .matches(/^[a-zA-ZÀ-ÿ\s]+$/).build()
  ),
    
  university: validate(
    new SecureValidator()
      .field('university').optional().isString().maxLength(100)
      .matches(/^[a-zA-ZÀ-ÿ\s\-\.]+$/).build()
  )
};

/**
 * Middleware para verificar erros de validação (compatibilidade)
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  // Este middleware agora é apenas para compatibilidade
  // A validação real acontece nos middlewares validate() acima
  next();
};

export default {
  setupSecurity,
  createRateLimit,
  createSlowDown,
  csrfProtection,
  maliciousPatternDetection,
  deviceFingerprinting,
  securityLogger,
  validators,
  handleValidationErrors
};