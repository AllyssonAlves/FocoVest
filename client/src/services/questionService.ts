import { Question, QuestionFilters, QuestionsResponse, QuestionResponse, QuestionStats } from '../types/question'

const API_BASE_URL = 'http://localhost:5000/api'

class QuestionService {
  private async fetchApi(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = localStorage.getItem('token')
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: { ...defaultHeaders, ...options.headers },
      ...options
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro de rede' }))
      throw new Error(error.message || 'Erro na requisição')
    }

    return response.json()
  }

  async getQuestions(filters: QuestionFilters = {}): Promise<QuestionsResponse> {
    const queryParams = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          queryParams.append(key, value.join(','))
        } else {
          queryParams.append(key, value.toString())
        }
      }
    })

    const queryString = queryParams.toString()
    return this.fetchApi(`/questions${queryString ? `?${queryString}` : ''}`)
  }

  async getQuestionById(id: string): Promise<QuestionResponse> {
    return this.fetchApi(`/questions/${id}`)
  }

  async createQuestion(questionData: Partial<Question>): Promise<QuestionResponse> {
    return this.fetchApi('/questions', {
      method: 'POST',
      body: JSON.stringify(questionData)
    })
  }

  async updateQuestion(id: string, questionData: Partial<Question>): Promise<QuestionResponse> {
    return this.fetchApi(`/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(questionData)
    })
  }

  async deleteQuestion(id: string): Promise<{ success: boolean; message: string }> {
    return this.fetchApi(`/questions/${id}`, {
      method: 'DELETE'
    })
  }

  async getQuestionStats(): Promise<{ success: boolean; data: QuestionStats }> {
    return this.fetchApi('/questions/stats/summary')
  }
}

export const questionService = new QuestionService()