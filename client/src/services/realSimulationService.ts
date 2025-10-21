import { Question, SimulationConfig } from '../hooks/useSimulationSession'

// Tipo para resposta da API de questões
interface QuestionsResponse {
  success: boolean
  data: Array<{
    _id: string
    questionText: string
    alternatives: Array<{
      id: string
      text: string
    }>
    correctAnswer: string
    subject: string
    university: string
    difficulty: 'easy' | 'medium' | 'hard'
    explanation?: string
  }>
  pagination: {
    currentPage: number
    totalPages: number
    totalQuestions: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Tipo para resposta da API de simulações
interface SimulationsResponse {
  data: {
    simulations: Array<{
      _id: string
      title: string
      description?: string
      category: string
      questionsCount: number
      timeLimit: number
      questions: string[]
    }>
  }
}

class RealSimulationService {
  private baseURL: string

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  }

  // Buscar questões do backend
  async fetchQuestions(filters?: {
    subject?: string
    university?: string
    difficulty?: string
    limit?: number
  }): Promise<Question[]> {
    try {
      const params = new URLSearchParams()
      
      if (filters?.subject) params.append('subject', filters.subject)
      if (filters?.university) params.append('university', filters.university)
      if (filters?.difficulty) params.append('difficulty', filters.difficulty)
      if (filters?.limit) params.append('limit', filters.limit.toString())

      const response = await fetch(`${this.baseURL}/questions?${params}`)
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const response_data: QuestionsResponse = await response.json()
      
      // Converter formato da API para formato do componente
      return response_data.data.map((q: any) => ({
        _id: q._id,
        questionText: q.statement || q.questionText, // Usar statement se disponível
        alternatives: q.alternatives.map((alt: any) => ({
          id: alt.letter, // Converter letter para id
          text: alt.text
        })),
        correctAnswer: q.correctAnswer,
        subject: q.subject,
        university: q.university,
        difficulty: q.difficulty,
        explanation: q.explanation
      }))

    } catch (error) {
      console.error('❌ Erro ao buscar questões:', error)
      throw new Error('Falha ao carregar questões do servidor')
    }
  }

  // Buscar simulação específica do backend
  async fetchSimulation(simulationId: string): Promise<SimulationConfig> {
    try {
      const response = await fetch(`${this.baseURL}/simulations/${simulationId}`)
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      const simulation = result.data
      
      // Buscar as questões específicas do simulado
      const questions = await this.fetchQuestionsByIds(simulation.questions)

      return {
        _id: simulation._id,
        title: simulation.title,
        description: simulation.description,
        timeLimit: simulation.settings.timeLimit * 60, // Converter minutos para segundos
        questionsCount: questions.length,
        questions: questions,
        allowReview: true,
        autoSubmit: true
      }

    } catch (error) {
      console.error('❌ Erro ao buscar simulação:', error)
      throw new Error('Falha ao carregar simulação do servidor')
    }
  }

  // Buscar questões por IDs específicos
  async fetchQuestionsByIds(questionIds: string[]): Promise<Question[]> {
    try {
      console.log('🔍 Buscando questões por IDs:', questionIds)
      
      // Buscar cada questão individualmente
      const questionPromises = questionIds.map(async (id) => {
        const response = await fetch(`${this.baseURL}/questions/${id}`)
        if (!response.ok) {
          throw new Error(`Erro ao buscar questão ${id}: ${response.status}`)
        }
        return response.json()
      })

      const questionsData = await Promise.all(questionPromises)
      
      // Transformar os dados para o formato esperado
      const questions = questionsData.map((questionData: any) => ({
        _id: questionData.data._id,
        questionText: questionData.data.statement || questionData.data.questionText,
        alternatives: questionData.data.alternatives.map((alt: any) => ({
          id: alt.letter,
          text: alt.text
        })),
        correctAnswer: questionData.data.correctAnswer,
        subject: questionData.data.subject,
        university: questionData.data.university,
        difficulty: questionData.data.difficulty,
        explanation: questionData.data.explanation
      }))

      console.log('✅ Questões carregadas:', questions.length)
      return questions

    } catch (error) {
      console.error('❌ Erro ao buscar questões por IDs:', error)
      throw new Error('Falha ao carregar questões específicas')
    }
  }

  // Criar simulado personalizado
  async createCustomSimulation(config: {
    title: string
    subject?: string
    university?: string
    difficulty?: string
    questionCount: number
    timeLimit: number
  }): Promise<SimulationConfig> {
    try {
      console.log('🎯 Criando simulado personalizado:', config)

      // Buscar questões baseadas nos filtros
      const questions = await this.fetchQuestions({
        subject: config.subject,
        university: config.university,
        difficulty: config.difficulty,
        limit: config.questionCount
      })

      if (questions.length === 0) {
        throw new Error('Nenhuma questão encontrada com os filtros especificados')
      }

      // Embaralhar questões
      const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5)

      const simulation: SimulationConfig = {
        _id: `custom_${Date.now()}`,
        title: config.title,
        description: `Simulado personalizado com ${shuffledQuestions.length} questões`,
        timeLimit: config.timeLimit * 60, // Converter minutos para segundos
        questionsCount: shuffledQuestions.length,
        questions: shuffledQuestions,
        allowReview: true,
        autoSubmit: true
      }

      console.log('✅ Simulado personalizado criado:', {
        questionsFound: shuffledQuestions.length,
        timeLimit: config.timeLimit
      })

      return simulation

    } catch (error) {
      console.error('❌ Erro ao criar simulado personalizado:', error)
      throw error
    }
  }

  // Simulado rápido com questões do backend
  async createQuickSimulation(): Promise<SimulationConfig> {
    return this.createCustomSimulation({
      title: 'Simulado Rápido',
      questionCount: 10,
      timeLimit: 600 // 10 minutos
    })
  }

  // Simulado por matéria
  async createSubjectSimulation(subject: string): Promise<SimulationConfig> {
    return this.createCustomSimulation({
      title: `Simulado de ${subject}`,
      subject: subject,
      questionCount: 15,
      timeLimit: 900 // 15 minutos
    })
  }

  // Simulado por universidade
  async createUniversitySimulation(university: string): Promise<SimulationConfig> {
    return this.createCustomSimulation({
      title: `Simulado ${university.toUpperCase()}`,
      university: university,
      questionCount: 20,
      timeLimit: 1200 // 20 minutos
    })
  }

  // Listar simulações disponíveis
  async listAvailableSimulations(): Promise<Array<{
    _id: string
    title: string
    description?: string
    questionsCount: number
    timeLimit: number
    category: string
  }>> {
    try {
      const response = await fetch(`${this.baseURL}/simulations`)
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const data: SimulationsResponse = await response.json()
      
      return data.data.simulations.map(s => ({
        _id: s._id,
        title: s.title,
        description: s.description,
        questionsCount: s.questionsCount,
        timeLimit: s.timeLimit,
        category: s.category
      }))

    } catch (error) {
      console.error('❌ Erro ao listar simulações:', error)
      return []
    }
  }
}

// Instância singleton
export const realSimulationService = new RealSimulationService()

// Hook para usar o serviço
export function useRealSimulation() {
  const createQuickSimulation = async () => {
    return await realSimulationService.createQuickSimulation()
  }

  const createSubjectSimulation = async (subject: string) => {
    return await realSimulationService.createSubjectSimulation(subject)
  }

  const createUniversitySimulation = async (university: string) => {
    return await realSimulationService.createUniversitySimulation(university)
  }

  const fetchSimulation = async (simulationId: string) => {
    return await realSimulationService.fetchSimulation(simulationId)
  }

  const listSimulations = async () => {
    return await realSimulationService.listAvailableSimulations()
  }

  return {
    createQuickSimulation,
    createSubjectSimulation,
    createUniversitySimulation,
    fetchSimulation,
    listSimulations
  }
}