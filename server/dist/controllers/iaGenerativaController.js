"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const questaoIAGenerativaService_1 = __importDefault(require("../services/questaoIAGenerativaService"));
const questaoScrapingService_1 = __importDefault(require("../services/questaoScrapingService"));
class IAGenerativaController {
    async gerarQuestao(req, res) {
        try {
            const { universidade, materia, assunto, dificuldade, questaoReferencia } = req.body;
            if (!universidade || !materia) {
                res.status(400).json({
                    success: false,
                    message: 'Universidade e matéria são obrigatórios'
                });
                return;
            }
            console.log(`🤖 Iniciando geração de questão para ${universidade} - ${materia}`);
            const questaoGerada = await questaoIAGenerativaService_1.default.gerarQuestaoBaseada({
                universidade: universidade,
                materia,
                assunto,
                dificuldade: dificuldade,
                questaoReferencia,
                usuarioId: req.user?._id?.toString()
            });
            res.status(201).json({
                success: true,
                message: 'Questão gerada com sucesso',
                data: questaoGerada
            });
        }
        catch (error) {
            console.error('❌ Erro ao gerar questão:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao gerar questão',
                error: error.message
            });
        }
    }
    async gerarLoteQuestoes(req, res) {
        try {
            const { universidade, materias, quantidade, dificuldade } = req.body;
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
            const resultado = await questaoIAGenerativaService_1.default.gerarLoteQuestoes({
                universidade: universidade,
                materias,
                quantidade,
                dificuldade: dificuldade,
                usuarioId: req.user?._id?.toString()
            });
            res.status(201).json({
                success: true,
                message: `Lote de ${resultado.questoesGeradas.length} questões gerado com sucesso`,
                data: resultado
            });
        }
        catch (error) {
            console.error('❌ Erro ao gerar lote de questões:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao gerar lote de questões',
                error: error.message
            });
        }
    }
    async executarColeta(req, res) {
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
            const resultado = await questaoScrapingService_1.default.executarColeta(universidade, ano);
            res.json({
                success: true,
                message: 'Coleta executada com sucesso',
                data: resultado
            });
        }
        catch (error) {
            console.error('❌ Erro ao executar coleta:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao executar coleta',
                error: error.message
            });
        }
    }
    async pararColeta(req, res) {
        try {
            await questaoScrapingService_1.default.pararColeta();
            res.json({
                success: true,
                message: 'Coleta interrompida com sucesso'
            });
        }
        catch (error) {
            console.error('❌ Erro ao parar coleta:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao parar coleta',
                error: error.message
            });
        }
    }
    async obterStatus(req, res) {
        try {
            const status = {
                iaGenerativaAtiva: true,
                coletaEmAndamento: questaoScrapingService_1.default.isColetaAtiva(),
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
        }
        catch (error) {
            console.error('❌ Erro ao obter status:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao obter status',
                error: error.message
            });
        }
    }
    async contarQuestoesGeradasHoje() {
        try {
            const { default: Questao } = await Promise.resolve().then(() => __importStar(require('../models/Questao')));
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            return await Questao.countDocuments({
                iaGerada: true,
                createdAt: { $gte: hoje }
            });
        }
        catch (error) {
            return 0;
        }
    }
    async contarQuestoesColetadasHoje() {
        try {
            const { default: Questao } = await Promise.resolve().then(() => __importStar(require('../models/Questao')));
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            return await Questao.countDocuments({
                iaGerada: false,
                createdAt: { $gte: hoje }
            });
        }
        catch (error) {
            return 0;
        }
    }
    async contarTotalQuestoesIA() {
        try {
            const { default: Questao } = await Promise.resolve().then(() => __importStar(require('../models/Questao')));
            return await Questao.countDocuments({
                iaGerada: true
            });
        }
        catch (error) {
            return 0;
        }
    }
}
exports.default = new IAGenerativaController();
//# sourceMappingURL=iaGenerativaController.js.map