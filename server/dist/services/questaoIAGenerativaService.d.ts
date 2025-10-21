import { IQuestao } from '../models/Questao';
interface GerarQuestaoParams {
    universidade: string;
    materia: string;
    assunto?: string;
    dificuldade?: string;
    questaoReferencia?: string;
    usuarioId?: string;
}
interface GerarLoteParams {
    universidade: string;
    materias: string[];
    quantidade: number;
    dificuldade?: string;
    usuarioId?: string;
}
interface ResultadoLote {
    questoesGeradas: IQuestao[];
    erros: string[];
    tempoTotal: number;
}
declare class QuestaoIAGenerativaService {
    gerarQuestaoBaseada(params: GerarQuestaoParams): Promise<IQuestao>;
    gerarLoteQuestoes(params: GerarLoteParams): Promise<ResultadoLote>;
    private buscarQuestoesReferencia;
    private construirPrompt;
    private parsearQuestaoGerada;
    validarQuestaoGerada(questao: IQuestao): Promise<boolean>;
    private buscarQuestoesSimilares;
}
declare const _default: QuestaoIAGenerativaService;
export default _default;
//# sourceMappingURL=questaoIAGenerativaService.d.ts.map