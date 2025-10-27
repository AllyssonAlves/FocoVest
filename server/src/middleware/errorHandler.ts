import { Request, Response, NextFunction } from 'express'
import { globalLogger, createRequestLogger } from '../utils/logger'

export interface ApiError extends Error {
  statusCode?: number
  isOperational?: boolean
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  // Log estruturado do erro
  const requestLogger = createRequestLogger(req)
  requestLogger.error('Application Error', err, {
    statusCode,
    path: req.path,
    method: req.method
  })

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not found - ${req.originalUrl}`) as ApiError
  error.statusCode = 404
  next(error)
}

export const createError = (message: string, statusCode: number = 500): ApiError => {
  const error = new Error(message) as ApiError
  error.statusCode = statusCode
  error.isOperational = true
  return error
}