interface ColetaResultado {
    questoesEncontradas: number;
    questoesSalvas: number;
    erros: string[];
    tempoExecucao: number;
}
declare class QuestaoScrapingService {
    private coletaAtiva;
    private shouldStop;
    isColetaAtiva(): boolean;
    executarColeta(universidade: string, ano?: number): Promise<ColetaResultado>;
    pararColeta(): Promise<void>;
    private coletarURCA;
    private coletarUVA;
    private coletarUECE;
    private coletarUFC;
    private coletarIFCE;
    private processarURL;
    private processarLinkQuestoes;
    private extrairQuestoesDaPagina;
    private extrairAlternativas;
    private resolverURL;
    private delay;
}
declare const _default: QuestaoScrapingService;
export default _default;
//# sourceMappingURL=questaoScrapingService.d.ts.map