import { Request, Response } from 'express';
import Questao, { IQuestao } from '../models/Questao';
import { AuthRequest } from '../middleware/auth';

interface BuscarQuestoesQuery {
  universidade?: string;
  materia?: string;
  assunto?: string;
  dificuldade?: string;
  ano?: string;
  tipo?: string;
  verificada?: string;
  page?: string;
  limit?: string;
  texto?: string;
}

interface BuscarParaSimuladoBody {
  universidade: string;
  materias?: string[];
  assuntos?: string[];
  dificuldade?: string;
  quantidade: number;
  excluirIds?: string[];
}

class QuestaoController {
  // Buscar questões com filtros
  async buscarQuestoes(req: Request<{}, {}, {}, BuscarQuestoesQuery>, res: Response): Promise<void> {
    try {
      const {
        universidade,
        materia,
        assunto,
        dificuldade,
        ano,
        tipo,
        verificada,
        page = '1',
        limit = '10',
        texto
      } = req.query;

      // Construir filtros
      const filtros: any = {};
      
      if (universidade) filtros.universidade = universidade;
      if (materia) filtros.materia = materia;
      if (assunto) filtros.assunto = assunto;
      if (dificuldade) filtros.dificuldade = dificuldade;
      if (ano) filtros.ano = parseInt(ano);
      if (tipo) filtros.tipo = tipo;
      if (verificada !== undefined) filtros.verificada = verificada === 'true';

      // Busca por texto
      if (texto) {
        filtros.$or = [
          { enunciado: { $regex: texto, $options: 'i' } },
          { 'alternativas.texto': { $regex: texto, $options: 'i' } }
        ];
      }

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      // Buscar questões
      const questoes = await Questao.find(filtros)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();

      // Contar total
      const total = await Questao.countDocuments(filtros);

      res.json({
        success: true,
        data: {
          questoes,
          pagination: {
            currentPage: pageNum,
            totalPages: Math.ceil(total / limitNum),
            totalItems: total,
            itemsPerPage: limitNum
          }
        }
      });
    } catch (error: any) {
      console.error('Erro ao buscar questões:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Obter questão por ID
  async obterQuestaoPorId(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const questao = await Questao.findById(id);

      if (!questao) {
        res.status(404).json({
          success: false,
          message: 'Questão não encontrada'
        });
        return;
      }

      res.json({
        success: true,
        data: questao
      });
    } catch (error: any) {
      console.error('Erro ao obter questão:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Buscar questões para simulado
  async buscarParaSimulado(req: AuthRequest, res: Response): Promise<void> {
    try {
      const {
        universidade,
        materias = [],
        assuntos = [],
        dificuldade,
        quantidade,
        excluirIds = []
      } = req.body;

      if (!universidade || !quantidade) {
        res.status(400).json({
          success: false,
          message: 'Universidade e quantidade são obrigatórios'
        });
        return;
      }

      // Construir filtros
      const filtros: any = {
        universidade,
        verificada: true
      };

      if (materias.length > 0) {
        filtros.materia = { $in: materias };
      }

      if (assuntos.length > 0) {
        filtros.assunto = { $in: assuntos };
      }

      if (dificuldade) {
        filtros.dificuldade = dificuldade;
      }

      if (excluirIds.length > 0) {
        filtros._id = { $nin: excluirIds };
      }

      // Buscar questões aleatórias
      const questoes = await Questao.aggregate([
        { $match: filtros },
        { $sample: { size: quantidade } }
      ]);

      res.json({
        success: true,
        data: questoes
      });
    } catch (error: any) {
      console.error('Erro ao buscar questões para simulado:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Criar nova questão
  async criarQuestao(req: AuthRequest, res: Response): Promise<void> {
    try {
      const dadosQuestao = req.body;

      // Validar dados obrigatórios
      if (!dadosQuestao.universidade || !dadosQuestao.materia || !dadosQuestao.enunciado) {
        res.status(400).json({
          success: false,
          message: 'Universidade, matéria e enunciado são obrigatórios'
        });
        return;
      }

      // Criar questão
      const questao = new Questao({
        ...dadosQuestao,
        criadoPor: req.user?._id,
        verificada: false
      });

      await questao.save();

      res.status(201).json({
        success: true,
        message: 'Questão criada com sucesso',
        data: questao
      });
    } catch (error: any) {
      console.error('Erro ao criar questão:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Atualizar questão
  async atualizarQuestao(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const dadosAtualizacao = req.body;

      const questao = await Questao.findByIdAndUpdate(
        id,
        {
          ...dadosAtualizacao,
          updatedAt: new Date()
        },
        { new: true, runValidators: true }
      );

      if (!questao) {
        res.status(404).json({
          success: false,
          message: 'Questão não encontrada'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Questão atualizada com sucesso',
        data: questao
      });
    } catch (error: any) {
      console.error('Erro ao atualizar questão:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Deletar questão
  async deletarQuestao(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const questao = await Questao.findByIdAndDelete(id);

      if (!questao) {
        res.status(404).json({
          success: false,
          message: 'Questão não encontrada'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Questão deletada com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao deletar questão:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Verificar questão
  async verificarQuestao(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const questao = await Questao.findByIdAndUpdate(
        id,
        {
          verificada: true,
          verificadoPor: req.user?._id,
          verificadoEm: new Date()
        },
        { new: true }
      );

      if (!questao) {
        res.status(404).json({
          success: false,
          message: 'Questão não encontrada'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Questão verificada com sucesso',
        data: questao
      });
    } catch (error: any) {
      console.error('Erro ao verificar questão:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Atualizar estatísticas de uso
  async atualizarEstatisticasUso(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { acertou, tempoResposta } = req.body;

      const questao = await Questao.findById(id);

      if (!questao) {
        res.status(404).json({
          success: false,
          message: 'Questão não encontrada'
        });
        return;
      }

      // Atualizar estatísticas
      questao.estatisticas.totalResolucoes += 1;
      
      if (acertou) {
        questao.estatisticas.totalAcertos += 1;
      }

      if (tempoResposta) {
        questao.estatisticas.tempoMedioResposta = 
          (questao.estatisticas.tempoMedioResposta * (questao.estatisticas.totalResolucoes - 1) + tempoResposta) / 
          questao.estatisticas.totalResolucoes;
      }

      await questao.save();

      res.json({
        success: true,
        message: 'Estatísticas atualizadas com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao atualizar estatísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  // Obter estatísticas gerais
  async obterEstatisticas(req: Request, res: Response): Promise<void> {
    try {
      const estatisticas = await Questao.aggregate([
        {
          $group: {
            _id: null,
            totalQuestoes: { $sum: 1 },
            questoesVerificadas: {
              $sum: { $cond: [{ $eq: ['$verificada', true] }, 1, 0] }
            },
            porUniversidade: {
              $push: {
                universidade: '$universidade',
                count: 1
              }
            },
            porMateria: {
              $push: {
                materia: '$materia',
                count: 1
              }
            },
            porDificuldade: {
              $push: {
                dificuldade: '$dificuldade',
                count: 1
              }
            }
          }
        }
      ]);

      res.json({
        success: true,
        data: estatisticas[0] || {
          totalQuestoes: 0,
          questoesVerificadas: 0,
          porUniversidade: [],
          porMateria: [],
          porDificuldade: []
        }
      });
    } catch (error: any) {
      console.error('Erro ao obter estatísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }
}

export default new QuestaoController();