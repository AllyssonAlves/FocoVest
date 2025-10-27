/**
 * Sistema de Validação Seguro
 * Substitui express-validator para resolver vulnerabilidades de segurança
 */

import { Request, Response, NextFunction } from 'express'

export interface ValidationRule {
  field: string
  required?: boolean
  type?: 'string' | 'email' | 'password' | 'number' | 'boolean'
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => boolean | string
}

export interface ValidationError {
  field: string
  message: string
  value?: any
}

export class SecureValidator {
  private rules: ValidationRule[] = []

  // Métodos para definir regras
  field(name: string): ValidationRuleBuilder {
    return new ValidationRuleBuilder(name, this)
  }

  addRule(rule: ValidationRule): void {
    this.rules.push(rule)
  }

  // Validar dados
  validate(data: any): ValidationError[] {
    const errors: ValidationError[] = []

    for (const rule of this.rules) {
      const value = data[rule.field]
      const error = this.validateField(rule, value)
      if (error) {
        errors.push(error)
      }
    }

    return errors
  }

  private validateField(rule: ValidationRule, value: any): ValidationError | null {
    // Verificar se é obrigatório
    if (rule.required && (value === undefined || value === null || value === '')) {
      return {
        field: rule.field,
        message: `${rule.field} é obrigatório`,
        value
      }
    }

    // Se não é obrigatório e está vazio, não validar outros aspectos
    if (!rule.required && (value === undefined || value === null || value === '')) {
      return null
    }

    // Validar tipo
    if (rule.type) {
      const typeError = this.validateType(rule.field, value, rule.type)
      if (typeError) return typeError
    }

    // Validar comprimento
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        return {
          field: rule.field,
          message: `${rule.field} deve ter pelo menos ${rule.minLength} caracteres`,
          value
        }
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        return {
          field: rule.field,
          message: `${rule.field} deve ter no máximo ${rule.maxLength} caracteres`,
          value
        }
      }
    }

    // Validar padrão regex
    if (rule.pattern && typeof value === 'string') {
      if (!rule.pattern.test(value)) {
        return {
          field: rule.field,
          message: `${rule.field} tem formato inválido`,
          value
        }
      }
    }

    // Validação customizada
    if (rule.custom) {
      const result = rule.custom(value)
      if (typeof result === 'string') {
        return {
          field: rule.field,
          message: result,
          value
        }
      } else if (result === false) {
        return {
          field: rule.field,
          message: `${rule.field} é inválido`,
          value
        }
      }
    }

    return null
  }

  private validateType(field: string, value: any, type: string): ValidationError | null {
    switch (type) {
      case 'string':
        if (typeof value !== 'string') {
          return { field, message: `${field} deve ser um texto` }
        }
        break

      case 'email':
        if (typeof value !== 'string' || !this.isValidEmail(value)) {
          return { field, message: `${field} deve ser um email válido` }
        }
        break

      case 'password':
        if (typeof value !== 'string' || !this.isValidPassword(value)) {
          return { 
            field, 
            message: `${field} deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula e número` 
          }
        }
        break

      case 'number':
        if (typeof value !== 'number' && isNaN(Number(value))) {
          return { field, message: `${field} deve ser um número` }
        }
        break

      case 'boolean':
        if (typeof value !== 'boolean') {
          return { field, message: `${field} deve ser verdadeiro ou falso` }
        }
        break
    }

    return null
  }

  private isValidEmail(email: string): boolean {
    // Regex mais segura para email, evitando vulnerabilidades do validator.js
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    
    if (!emailRegex.test(email)) return false
    if (email.length > 320) return false // RFC 5321 limit
    
    const parts = email.split('@')
    if (parts.length !== 2) return false
    
    const [localPart, domain] = parts
    if (localPart.length > 64) return false // RFC 5321 limit
    
    return true
  }

  private isValidPassword(password: string): boolean {
    if (password.length < 8) return false
    
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    
    return hasUpperCase && hasLowerCase && hasNumbers
  }
}

export class ValidationRuleBuilder {
  private rule: ValidationRule

  constructor(field: string, private validator: SecureValidator) {
    this.rule = { field }
  }

  required(): ValidationRuleBuilder {
    this.rule.required = true
    return this
  }

  optional(): ValidationRuleBuilder {
    this.rule.required = false
    return this
  }

  isEmail(): ValidationRuleBuilder {
    this.rule.type = 'email'
    return this
  }

  isPassword(): ValidationRuleBuilder {
    this.rule.type = 'password'
    return this
  }

  isString(): ValidationRuleBuilder {
    this.rule.type = 'string'
    return this
  }

  isNumber(): ValidationRuleBuilder {
    this.rule.type = 'number'
    return this
  }

  isBoolean(): ValidationRuleBuilder {
    this.rule.type = 'boolean'
    return this
  }

  minLength(length: number): ValidationRuleBuilder {
    this.rule.minLength = length
    return this
  }

  maxLength(length: number): ValidationRuleBuilder {
    this.rule.maxLength = length
    return this
  }

  matches(pattern: RegExp): ValidationRuleBuilder {
    this.rule.pattern = pattern
    return this
  }

  custom(fn: (value: any) => boolean | string): ValidationRuleBuilder {
    this.rule.custom = fn
    return this
  }

  build(): SecureValidator {
    this.validator.addRule(this.rule)
    return this.validator
  }
}

// Middleware para aplicar validações
export const validate = (validator: SecureValidator) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors = validator.validate({ ...req.body, ...req.params, ...req.query })
    
    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Dados inválidos fornecidos',
        errors: errors.map(error => ({
          field: error.field,
          message: error.message,
          value: error.value
        }))
      })
      return
    }

    next()
  }
}

// Validadores pré-definidos comuns
export const validators = {
  email: () => new SecureValidator().field('email').required().isEmail().build(),
  
  password: () => new SecureValidator().field('password').required().isPassword().build(),
  
  name: () => new SecureValidator()
    .field('name')
    .required()
    .isString()
    .minLength(2)
    .maxLength(50)
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .build(),
    
  university: () => new SecureValidator()
    .field('university')
    .required()
    .isString()
    .custom((value) => {
      const validUniversities = ['UVA', 'UECE', 'UFC', 'URCA', 'IFCE', 'ENEM']
      return validUniversities.includes(value) || 'Universidade não suportada'
    })
    .build(),

  loginData: () => new SecureValidator()
    .field('email').required().isEmail().build()
    .field('password').required().isString().minLength(1).build(),

  registerData: () => new SecureValidator()
    .field('email').required().isEmail().build()
    .field('password').required().isPassword().build()
    .field('name').required().isString().minLength(2).maxLength(50).matches(/^[a-zA-ZÀ-ÿ\s]+$/).build()
    .field('university').required().isString().custom((value) => {
      const validUniversities = ['UVA', 'UECE', 'UFC', 'URCA', 'IFCE', 'ENEM']
      return validUniversities.includes(value) || 'Universidade não suportada'
    }).build()
}

export default SecureValidator