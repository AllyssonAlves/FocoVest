/**
 * Serviço Real de Simulados - Substituição do MockSimulationService
 * Utiliza dados persistentes do MongoDB
 */

import Simulation, { ISimulation } from '../models/Simulation';
import Questao, { IQuestao } from '../models/Questao';
import { University } from '../../../shared/dist/types';

export interface SimulationFilters {
  university?: University;
  subject?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  userId?: string;
}

export interface CreateSimulationData {
  title: string;
  description: string;
  university: University;
  subjects: string[];
  duration: number;
  questionCount: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  createdBy: string;
}

export class RealSimulationService {
  /**
   * Listar simulados disponíveis
   */
  async listSimulations(filters: SimulationFilters = {}): Promise<{
    simulations: ISimulation[];
    totalSimulations: number;
    page: number;
    totalPages: number;
  }> {
    const query: any = { isActive: true };
    
    if (filters.university) {
      query.university = filters.university;
    }
    
    if (filters.subject) {
      query.subjects = { $in: [filters.subject] };
    }

    const limit = 10;
    const page = 1;
    const skip = (page - 1) * limit;

    const [simulations, total] = await Promise.all([
      Simulation.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('questions', 'title subject difficulty')
        .lean(),
      Simulation.countDocuments(query)
    ]);

    return {
      simulations: simulations as unknown as ISimulation[],
      totalSimulations: total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Buscar simulado por ID
   */
  async getSimulationById(simulationId: string): Promise<ISimulation | null> {
    const simulation = await Simulation.findById(simulationId)
      .populate({
        path: 'questions',
        select: 'title enunciado alternativas gabarito explanation subject difficulty topics'
      })
      .lean();

    return simulation as ISimulation | null;
  }

  /**
   * Criar novo simulado
   */
  async createSimulation(data: CreateSimulationData): Promise<ISimulation> {
    // Buscar questões apropriadas
    const questionsQuery: any = {
      isActive: true,
      university: data.university
    };

    if (data.subjects.length > 0) {
      questionsQuery.subject = { $in: data.subjects };
    }

    if (data.difficulty) {
      questionsQuery.difficulty = data.difficulty;
    }

    const availableQuestions = await Questao.find(questionsQuery)
      .limit(data.questionCount * 2) // Buscar mais questões para diversidade
      .lean();

    if (availableQuestions.length < data.questionCount) {
      throw new Error(`Questões insuficientes. Disponíveis: ${availableQuestions.length}, Necessárias: ${data.questionCount}`);
    }

    // Selecionar questões aleatoriamente
    const shuffled = this.shuffleArray([...availableQuestions]);
    const selectedQuestions = shuffled.slice(0, data.questionCount);

    const simulation = new Simulation({
      title: data.title,
      description: data.description,
      university: data.university,
      subjects: data.subjects,
      questions: selectedQuestions.map(q => q._id),
      duration: data.duration,
      difficulty: data.difficulty || 'medium',
      isActive: true,
      createdBy: data.createdBy,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await simulation.save();
    
    return simulation.populate({
      path: 'questions',
      select: 'title enunciado alternativas gabarito explanation subject difficulty'
    });
  }

  /**
   * Gerar simulado automático baseado em preferências
   */
  async generateAutomaticSimulation(params: {
    university: University;
    subjects?: string[];
    difficulty?: 'easy' | 'medium' | 'hard';
    questionCount?: number;
    userId: string;
  }): Promise<ISimulation> {
    const { university, subjects, difficulty, questionCount = 20, userId } = params;

    // Se não especificar matérias, pegar as principais
    const targetSubjects = subjects || ['Matemática', 'Português', 'Física', 'Química', 'Biologia'];

    const title = `Simulado Automático - ${university}`;
    const description = `Simulado gerado automaticamente com ${questionCount} questões de ${targetSubjects.join(', ')}`;

    return this.createSimulation({
      title,
      description,
      university,
      subjects: targetSubjects,
      duration: questionCount * 3, // 3 minutos por questão
      questionCount,
      difficulty,
      createdBy: userId
    });
  }

  /**
   * Buscar simulados por usuário
   */
  async getUserSimulations(userId: string): Promise<ISimulation[]> {
    const simulations = await Simulation.find({
      createdBy: userId,
      isActive: true
    })
    .sort({ createdAt: -1 })
    .populate('questions', 'title subject difficulty')
    .lean();

    return simulations as unknown as ISimulation[];
  }

  /**
   * Atualizar estatísticas do simulado
   */
  async updateSimulationStats(simulationId: string, stats: {
    totalAttempts?: number;
    averageScore?: number;
    averageTime?: number;
  }): Promise<void> {
    await Simulation.findByIdAndUpdate(
      simulationId,
      {
        $inc: {
          'statistics.totalAttempts': stats.totalAttempts || 0
        },
        $set: {
          'statistics.averageScore': stats.averageScore,
          'statistics.averageTime': stats.averageTime,
          updatedAt: new Date()
        }
      }
    );
  }

  /**
   * Deletar simulado (soft delete)
   */
  async deleteSimulation(simulationId: string): Promise<boolean> {
    const result = await Simulation.findByIdAndUpdate(
      simulationId,
      { 
        isActive: false,
        updatedAt: new Date()
      }
    );

    return !!result;
  }

  /**
   * Obter estatísticas gerais
   */
  async getGeneralStats(): Promise<{
    totalSimulations: number;
    activeSimulations: number;
    simulationsByUniversity: Array<{ university: string; count: number }>;
    simulationsBySubject: Array<{ subject: string; count: number }>;
  }> {
    const [total, active, byUniversity, bySubject] = await Promise.all([
      Simulation.countDocuments(),
      Simulation.countDocuments({ isActive: true }),
      Simulation.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$university', count: { $sum: 1 } } },
        { $project: { university: '$_id', count: 1, _id: 0 } },
        { $sort: { count: -1 } }
      ]),
      Simulation.aggregate([
        { $match: { isActive: true } },
        { $unwind: '$subjects' },
        { $group: { _id: '$subjects', count: { $sum: 1 } } },
        { $project: { subject: '$_id', count: 1, _id: 0 } },
        { $sort: { count: -1 } }
      ])
    ]);

    return {
      totalSimulations: total,
      activeSimulations: active,
      simulationsByUniversity: byUniversity,
      simulationsBySubject: bySubject
    };
  }

  /**
   * Função auxiliar para embaralhar array
   */
  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Verificar se simulado precisa de mais questões
   */
  async validateSimulationQuestions(simulationId: string): Promise<{
    isValid: boolean;
    missingQuestions: number;
    issues: string[];
  }> {
    const simulation = await Simulation.findById(simulationId)
      .populate('questions')
      .lean();

    if (!simulation) {
      return {
        isValid: false,
        missingQuestions: 0,
        issues: ['Simulado não encontrado']
      };
    }

    const issues: string[] = [];
    const expectedQuestions = 20; // Padrão
    const actualQuestions = simulation.questions?.length || 0;
    const missingQuestions = Math.max(0, expectedQuestions - actualQuestions);

    if (missingQuestions > 0) {
      issues.push(`Faltam ${missingQuestions} questões`);
    }

    if (!simulation.questions || simulation.questions.length === 0) {
      issues.push('Nenhuma questão associada');
    }

    return {
      isValid: issues.length === 0,
      missingQuestions,
      issues
    };
  }
}

export default RealSimulationService;