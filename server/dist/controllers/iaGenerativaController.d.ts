import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
declare class IAGenerativaController {
    gerarQuestao(req: AuthRequest, res: Response): Promise<void>;
    gerarLoteQuestoes(req: AuthRequest, res: Response): Promise<void>;
    executarColeta(req: AuthRequest, res: Response): Promise<void>;
    pararColeta(req: AuthRequest, res: Response): Promise<void>;
    obterStatus(req: AuthRequest, res: Response): Promise<void>;
    private contarQuestoesGeradasHoje;
    private contarQuestoesColetadasHoje;
    private contarTotalQuestoesIA;
}
declare const _default: IAGenerativaController;
export default _default;
//# sourceMappingURL=iaGenerativaController.d.ts.map