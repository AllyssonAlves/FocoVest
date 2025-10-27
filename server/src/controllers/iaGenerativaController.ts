import { Response } from 'express';
import questaoIAGenerativaService from '../services/questaoIAGenerativaService';
import questaoScrapingService from '../services/questaoScrapingService';
import { AuthRequest } from '../middleware/auth';

interface GerarQuestaoBody {
  universidade: string;
  materia: string;
  assunto?: string;
  dificuldade?: string;
  questaoReferencia?: string;
}

interface GerarLoteBody {
  universidade: string;
  materias: string[];
  quantidade: number;
  dificuldade?: string;
}

class IAGenerativaController {
  // Gerar uma questão baseada em referências
  async gerarQuestao(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { 
        universidade, 
        materia, 
        assunto, 
        dificuldade, 
        questaoReferencia 
      }: GerarQuestaoBody = req.body;

      // Validar dados obrigatórios
      if (!universidade || !materia) {
        res.status(400).json({
          success: false,
          message: 'Universidade e matéria são obrigatórios'
        });
        return;
      }

      console.log(`🤖 Iniciando geração de questão para ${universidade} - ${materia}`);

      // Gerar questão usando IA
      const questaoGerada = await questaoIAGenerativaService.gerarQuestaoBaseada({
        universidade: universidade as any,
        materia,
        assunto,
        dificuldade: dificuldade as any,
        questaoReferencia,
        usuarioId: req.user?._id?.toString()
      });

      res.status(201).json({
        success: true,
        message: 'Questão gerada com sucesso',
        data: questaoGerada
      });

    } catch (error: any) {
      console.error('❌ Erro ao gerar questão:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao gerar questão',
        error: error.message
      });
    }
  }

  // Gerar lote de questões
  async gerarLoteQuestoes(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { 
        universidade, 
        materias, 
        quantidade, 
        dificuldade 
      }: GerarLoteBody = req.body;

      // Validar dados obrigatórios
      if (!universidade || !materias || !quantidade) {
        res.status(400).json({
          success: false,
          message: 'Universidade, matérias e quantidade são obrigatórios'
        });
        return;
      }

      if (!Array.isArray(materias) || materias.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Matérias deve ser um array não vazio'
        });
        return;
      }

      if (quantidade < 1 || quantidade > 50) {
        res.status(400).json({
          success: false,
          message: 'Quantidade deve estar entre 1 e 50'
        });
        return;
      }

      console.log(`🤖 Iniciando geração de lote: ${quantidade} questões para ${universidade}`);

      // Gerar lote de questões
      const resultado = await questaoIAGenerativaService.gerarLoteQuestoes({
        universidade: universidade as any,
        materias,
        quantidade,
        dificuldade: dificuldade as any,
        usuarioId: req.user?._id?.toString()
      });

      res.status(201).json({
        success: true,
        message: `Lote de ${resultado.questoesGeradas.length} questões gerado com sucesso`,
        data: resultado
      });

    } catch (error: any) {
      console.error('❌ Erro ao gerar lote de questões:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao gerar lote de questões',
        error: error.message
      });
    }
  }

  // Executar coleta de questões (scraping)
  async executarColeta(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { universidade, ano } = req.body;

      if (!universidade) {
        res.status(400).json({
          success: false,
          message: 'Universidade é obrigatória'
        });
        return;
      }

      console.log(`🕷️  Iniciando coleta automática para ${universidade}`);

      // Executar scraping
      const resultado = await questaoScrapingService.executarColeta(
        universidade as any,
        ano
      );

      res.json({
        success: true,
        message: 'Coleta executada com sucesso',
        data: resultado
      });

    } catch (error: any) {
      console.error('❌ Erro ao executar coleta:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao executar coleta',
        error: error.message
      });
    }
  }

  // Parar coleta em andamento
  async pararColeta(req: AuthRequest, res: Response): Promise<void> {
    try {
      await questaoScrapingService.pararColeta();

      res.json({
        success: true,
        message: 'Coleta interrompida com sucesso'
      });

    } catch (error: any) {
      console.error('❌ Erro ao parar coleta:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao parar coleta',
        error: error.message
      });
    }
  }

  // Obter status do sistema de IA
  async obterStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const status = {
        iaGenerativaAtiva: true,
        coletaEmAndamento: questaoScrapingService.isColetaAtiva(),
        estatisticas: {
          questoesGeradasHoje: await this.contarQuestoesGeradasHoje(),
          questoesColetadasHoje: await this.contarQuestoesColetadasHoje(),
          totalQuestoesIA: await this.contarTotalQuestoesIA()
        },
        configuracoes: {
          modeloIA: 'gpt-4-turbo-preview',
          limiteDiario: 100,
          universidadesSuportadas: ['UVA', 'UECE', 'UFC', 'URCA', 'IFCE']
        }
      };

      res.json({
        success: true,
        data: status
      });

    } catch (error: any) {
      console.error('❌ Erro ao obter status:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao obter status',
        error: error.message
      });
    }
  }

  // Métodos auxiliares para estatísticas
  private async contarQuestoesGeradasHoje(): Promise<number> {
    try {
      const { default: Questao } = await import('../models/Questao');
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      return await Questao.countDocuments({
        iaGerada: true,
        createdAt: { $gte: hoje }
      });
    } catch (error) {
      return 0;
    }
  }

  private async contarQuestoesColetadasHoje(): Promise<number> {
    try {
      const { default: Questao } = await import('../models/Questao');
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      return await Questao.countDocuments({
        iaGerada: false,
        createdAt: { $gte: hoje }
      });
    } catch (error) {
      return 0;
    }
  }

  private async contarTotalQuestoesIA(): Promise<number> {
    try {
      const { default: Questao } = await import('../models/Questao');
      return await Questao.countDocuments({
        iaGerada: true
      });
    } catch (error) {
      return 0;
    }
  }
}

export default new IAGenerativaController();