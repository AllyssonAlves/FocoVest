import Questao, { IQuestao } from '../models/Questao'
import { University, Subject, Difficulty } from '../../../shared/dist/types'

export interface QuestionFilters {
  university?: University
  subject?: Subject
  difficulty?: Difficulty
  topics?: string[]
  year?: number
}

export interface CreateQuestionData {
  title: string
  enunciado: string
  alternativas: Array<{
    id: string
    texto: string
  }>
  gabarito: string
  explanation?: string
  subject: Subject
  difficulty: Difficulty
  university: University
  topics?: string[]
  year?: number
  createdBy: string
}

export class RealQuestionService {
  /**
   * Listar questões com filtros
   */
  async getQuestions(
    filters: QuestionFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<{
    questions: IQuestao[]
    totalQuestions: number
    currentPage: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }> {
    const query: any = { isActive: true }

    if (filters.university) {
      query.university = filters.university
    }

    if (filters.subject) {
      query.subject = filters.subject
    }

    if (filters.difficulty) {
      query.difficulty = filters.difficulty
    }

    if (filters.topics && filters.topics.length > 0) {
      query.topics = { $in: filters.topics }
    }

    if (filters.year) {
      query.year = filters.year
    }

    const skip = (page - 1) * limit

    const [questions, total] = await Promise.all([
      Questao.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Questao.countDocuments(query)
    ])

    const totalPages = Math.ceil(total / limit)

    return {
      questions: questions as unknown as IQuestao[],
      totalQuestions: total,
      currentPage: page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  }

  /**
   * Buscar questão por ID
   */
  async getQuestionById(questionId: string): Promise<IQuestao | null> {
    const question = await Questao.findById(questionId).lean()
    return question as IQuestao | null
  }

  /**
   * Criar nova questão
   */
  async createQuestion(data: CreateQuestionData): Promise<IQuestao> {
    const question = new Questao({
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
      createdBy: data.createdBy,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    await question.save()
    return question.toObject() as IQuestao
  }

  /**
   * Atualizar questão
   */
  async updateQuestion(
    questionId: string,
    updateData: Partial<CreateQuestionData>,
    userId: string
  ): Promise<IQuestao | null> {
    const question = await Questao.findByIdAndUpdate(
      questionId,
      {
        ...updateData,
        updatedBy: userId,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).lean()

    return question as IQuestao | null
  }

  /**
   * Deletar questão
   */
  async deleteQuestion(questionId: string): Promise<boolean> {
    const result = await Questao.findByIdAndUpdate(
      questionId,
      { 
        isActive: false,
        deletedAt: new Date()
      }
    )

    return !!result
  }

  /**
   * Obter estatísticas das questões
   */
  async getQuestionStats(): Promise<{
    totalQuestions: number
    questionsByUniversity: Record<string, number>
    questionsBySubject: Record<string, number>
    questionsByDifficulty: Record<string, number>
  }> {
    const [
      totalQuestions,
      byUniversity,
      bySubject,
      byDifficulty
    ] = await Promise.all([
      Questao.countDocuments({ isActive: true }),
      Questao.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$university', count: { $sum: 1 } } }
      ]),
      Questao.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$subject', count: { $sum: 1 } } }
      ]),
      Questao.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$difficulty', count: { $sum: 1 } } }
      ])
    ])

    return {
      totalQuestions,
      questionsByUniversity: byUniversity.reduce((acc: any, item: any) => {
        acc[item._id] = item.count
        return acc
      }, {}),
      questionsBySubject: bySubject.reduce((acc: any, item: any) => {
        acc[item._id] = item.count
        return acc
      }, {}),
      questionsByDifficulty: byDifficulty.reduce((acc: any, item: any) => {
        acc[item._id] = item.count
        return acc
      }, {})
    }
  }

  /**
   * Buscar questões aleatórias por critérios
   */
  async getRandomQuestions(
    filters: QuestionFilters,
    count: number = 10
  ): Promise<IQuestao[]> {
    const query: any = { isActive: true }

    if (filters.university) {
      query.university = filters.university
    }

    if (filters.subject) {
      query.subject = filters.subject
    }

    if (filters.difficulty) {
      query.difficulty = filters.difficulty
    }

    if (filters.topics && filters.topics.length > 0) {
      query.topics = { $in: filters.topics }
    }

    const questions = await Questao.aggregate([
      { $match: query },
      { $sample: { size: count } }
    ])

    return questions as IQuestao[]
  }
}

export default RealQuestionService