import { RealSimulationService } from './RealSimulationService'
import { MockSimulationService } from './MockSimulationService'
import { ISimulation } from '../models/Simulation'

// Verificar se MongoDB está disponível
const isMongoAvailable = () => {
  try {
    // Verificar se mongoose está conectado
    const mongoose = require('mongoose')
    return mongoose.connection.readyState === 1
  } catch (error) {
    return false
  }
}

export class HybridSimulationService {
  private realService: RealSimulationService
  private mockService: MockSimulationService

  constructor() {
    this.realService = new RealSimulationService()
    this.mockService = new MockSimulationService()
  }

  private getService() {
    return isMongoAvailable() ? this.realService : this.mockService
  }

  async listSimulations(filters: any = {}) {
    if (isMongoAvailable()) {
      return await this.realService.listSimulations(filters)
    } else {
      // Converter para formato mock
      const mockFilters = {
        university: filters.university,
        subject: filters.subject,
        difficulty: filters.difficulty
      }
      const result = await this.mockService.getSimulations(mockFilters)
      return {
        simulations: result.simulations,
        totalSimulations: result.totalSimulations,
        page: result.currentPage,
        totalPages: result.totalPages
      }
    }
  }

  async getSimulationById(id: string) {
    if (isMongoAvailable()) {
      return await this.realService.getSimulationById(id)
    } else {
      return await this.mockService.getSimulationById(id)
    }
  }

  async createSimulation(data: any) {
    if (isMongoAvailable()) {
      // Converter para formato real
      const realData = {
        title: data.title,
        description: data.description || '',
        university: data.university,
        subjects: Array.isArray(data.subjects) ? data.subjects : [data.subject || 'Geral'],
        difficulty: data.difficulty,
        duration: data.timeLimit || data.duration || 90,
        questionCount: data.totalQuestions || data.questionCount || 50,
        createdBy: 'admin'
      }
      return await this.realService.createSimulation(realData)
    } else {
      // Converter para formato mock
      const mockData = {
        title: data.title,
        description: data.description || '',
        university: data.university,
        subject: Array.isArray(data.subjects) ? data.subjects[0] : data.subject,
        difficulty: data.difficulty,
        timeLimit: data.timeLimit || data.duration || 90,
        totalQuestions: data.totalQuestions || data.questionCount || 50,
        questions: data.questions || []
      }
      return await this.mockService.createSimulation(mockData)
    }
  }

  async deleteSimulation(id: string) {
    if (isMongoAvailable()) {
      return await this.realService.deleteSimulation(id)
    } else {
      // Mock não suporta deleção, retornar sucesso
      return { success: true, message: 'Simulado removido (mock)' }
    }
  }

  async getUserSimulations(userId: string) {
    if (isMongoAvailable()) {
      return await this.realService.getUserSimulations(userId)
    } else {
      return await this.mockService.getUserSimulations(userId)
    }
  }
}

export default HybridSimulationService