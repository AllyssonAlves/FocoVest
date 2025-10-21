import mongoose, { Document } from 'mongoose';
export interface IAlternativa {
    letra: string;
    texto: string;
    correta: boolean;
}
export interface IEstatisticas {
    totalResolucoes: number;
    totalAcertos: number;
    tempoMedioResposta: number;
}
export interface IQuestao extends Document {
    universidade: 'UVA' | 'UECE' | 'UFC' | 'URCA' | 'IFCE';
    materia: string;
    assunto: string;
    enunciado: string;
    alternativas: IAlternativa[];
    tipo: 'multipla_escolha' | 'verdadeiro_falso' | 'dissertativa';
    dificuldade: 'facil' | 'medio' | 'dificil';
    ano?: number;
    fonte?: string;
    explicacao?: string;
    tags?: string[];
    verificada: boolean;
    verificadoPor?: mongoose.Types.ObjectId;
    verificadoEm?: Date;
    criadoPor?: mongoose.Types.ObjectId;
    iaGerada: boolean;
    questaoReferencia?: mongoose.Types.ObjectId;
    promptUtilizado?: string;
    estatisticas: IEstatisticas;
    createdAt: Date;
    updatedAt: Date;
    taxaAcerto: number;
    dificuldadeReal: string;
}
declare const _default: mongoose.Model<IQuestao, {}, {}, {}, mongoose.Document<unknown, {}, IQuestao, {}, {}> & IQuestao & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Questao.d.ts.map