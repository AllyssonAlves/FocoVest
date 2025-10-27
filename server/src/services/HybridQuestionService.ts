import { RealQuestionService } from './RealQuestionService'
import { mockQuestionService } from './MockQuestionService'

// Verificar se MongoDB está disponível
const isMongoAvailable = () => {
  try {
    const mongoose = require('mongoose')
    return mongoose.connection.readyState === 1
  } catch (error) {
    return false
  }
}

export class HybridQuestionService {
  private realService: RealQuestionService
  private mockService: typeof mockQuestionService

  constructor() {
    this.realService = new RealQuestionService()
    this.mockService = mockQuestionService
  }

  async getQuestions(filters: any = {}, page: number = 1, limit: number = 20) {
    if (isMongoAvailable()) {
      return await this.realService.getQuestions(filters, page, limit)
    } else {
      // Mock service só aceita filters
      return await this.mockService.getQuestions(filters)
    }
  }

  async getQuestionById(id: string) {
    if (isMongoAvailable()) {
      return await this.realService.getQuestionById(id)
    } else {
      return await this.mockService.getQuestionById(id)
    }
  }

  async createQuestion(data: any) {
    if (isMongoAvailable()) {
      // Converter para formato real
      const realData = {
        title: data.title,
        enunciado: data.enunciado,
        alternativas: data.alternativas,
        gabarito: data.gabarito,
        explanation: data.explanation,
        subject: data.subject,
        difficulty: data.difficulty,
        university: data.university,
        topics: data.topics || [],
        year: data.year,
        createdBy: data.createdBy || 'admin'
      }
      return await this.realService.createQuestion(realData)
    } else {
      return await this.mockService.createQuestion(data)
    }
  }

  async updateQuestion(id: string, data: any, userId: string) {
    if (isMongoAvailable()) {
      return await this.realService.updateQuestion(id, data, userId)
    } else {
      return await this.mockService.updateQuestion(id, data, userId)
    }
  }

  async deleteQuestion(id: string, userId?: string) {
    if (isMongoAvailable()) {
      return await this.realService.deleteQuestion(id)
    } else {
      return await this.mockService.deleteQuestion(id, userId || 'admin')
    }
  }

  async getQuestionStats() {
    if (isMongoAvailable()) {
      return await this.realService.getQuestionStats()
    } else {
      return await this.mockService.getQuestionStats()
    }
  }

  async getRandomQuestions(filters: any, count: number = 10) {
    if (isMongoAvailable()) {
      return await this.realService.getRandomQuestions(filters, count)
    } else {
      // Mock service não tem getRandomQuestions, usar getQuestions com shuffle
      const result = await this.mockService.getQuestions(filters)
      const shuffled = result.questions.sort(() => Math.random() - 0.5)
      return shuffled.slice(0, count)
    }
  }
}

export default HybridQuestionService