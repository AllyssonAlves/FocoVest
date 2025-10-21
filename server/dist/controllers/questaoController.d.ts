import { Request, Response } from 'express';
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
declare class QuestaoController {
    buscarQuestoes(req: Request<{}, {}, {}, BuscarQuestoesQuery>, res: Response): Promise<void>;
    obterQuestaoPorId(req: Request, res: Response): Promise<void>;
    buscarParaSimulado(req: AuthRequest, res: Response): Promise<void>;
    criarQuestao(req: AuthRequest, res: Response): Promise<void>;
    atualizarQuestao(req: AuthRequest, res: Response): Promise<void>;
    deletarQuestao(req: AuthRequest, res: Response): Promise<void>;
    verificarQuestao(req: AuthRequest, res: Response): Promise<void>;
    atualizarEstatisticasUso(req: AuthRequest, res: Response): Promise<void>;
    obterEstatisticas(req: Request, res: Response): Promise<void>;
}
declare const _default: QuestaoController;
export default _default;
//# sourceMappingURL=questaoController.d.ts.map