"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Questao_1 = __importDefault(require("../models/Questao"));
class QuestaoController {
    async buscarQuestoes(req, res) {
        try {
            const { universidade, materia, assunto, dificuldade, ano, tipo, verificada, page = '1', limit = '10', texto } = req.query;
            const filtros = {};
            if (universidade)
                filtros.universidade = universidade;
            if (materia)
                filtros.materia = materia;
            if (assunto)
                filtros.assunto = assunto;
            if (dificuldade)
                filtros.dificuldade = dificuldade;
            if (ano)
                filtros.ano = parseInt(ano);
            if (tipo)
                filtros.tipo = tipo;
            if (verificada !== undefined)
                filtros.verificada = verificada === 'true';
            if (texto) {
                filtros.$or = [
                    { enunciado: { $regex: texto, $options: 'i' } },
                    { 'alternativas.texto': { $regex: texto, $options: 'i' } }
                ];
            }
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const skip = (pageNum - 1) * limitNum;
            const questoes = await Questao_1.default.find(filtros)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean();
            const total = await Questao_1.default.countDocuments(filtros);
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
        }
        catch (error) {
            console.error('Erro ao buscar questões:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }
    async obterQuestaoPorId(req, res) {
        try {
            const { id } = req.params;
            const questao = await Questao_1.default.findById(id);
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
        }
        catch (error) {
            console.error('Erro ao obter questão:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }
    async buscarParaSimulado(req, res) {
        try {
            const { universidade, materias = [], assuntos = [], dificuldade, quantidade, excluirIds = [] } = req.body;
            if (!universidade || !quantidade) {
                res.status(400).json({
                    success: false,
                    message: 'Universidade e quantidade são obrigatórios'
                });
                return;
            }
            const filtros = {
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
            const questoes = await Questao_1.default.aggregate([
                { $match: filtros },
                { $sample: { size: quantidade } }
            ]);
            res.json({
                success: true,
                data: questoes
            });
        }
        catch (error) {
            console.error('Erro ao buscar questões para simulado:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }
    async criarQuestao(req, res) {
        try {
            const dadosQuestao = req.body;
            if (!dadosQuestao.universidade || !dadosQuestao.materia || !dadosQuestao.enunciado) {
                res.status(400).json({
                    success: false,
                    message: 'Universidade, matéria e enunciado são obrigatórios'
                });
                return;
            }
            const questao = new Questao_1.default({
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
        }
        catch (error) {
            console.error('Erro ao criar questão:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }
    async atualizarQuestao(req, res) {
        try {
            const { id } = req.params;
            const dadosAtualizacao = req.body;
            const questao = await Questao_1.default.findByIdAndUpdate(id, {
                ...dadosAtualizacao,
                updatedAt: new Date()
            }, { new: true, runValidators: true });
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
        }
        catch (error) {
            console.error('Erro ao atualizar questão:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }
    async deletarQuestao(req, res) {
        try {
            const { id } = req.params;
            const questao = await Questao_1.default.findByIdAndDelete(id);
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
        }
        catch (error) {
            console.error('Erro ao deletar questão:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }
    async verificarQuestao(req, res) {
        try {
            const { id } = req.params;
            const questao = await Questao_1.default.findByIdAndUpdate(id, {
                verificada: true,
                verificadoPor: req.user?._id,
                verificadoEm: new Date()
            }, { new: true });
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
        }
        catch (error) {
            console.error('Erro ao verificar questão:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }
    async atualizarEstatisticasUso(req, res) {
        try {
            const { id } = req.params;
            const { acertou, tempoResposta } = req.body;
            const questao = await Questao_1.default.findById(id);
            if (!questao) {
                res.status(404).json({
                    success: false,
                    message: 'Questão não encontrada'
                });
                return;
            }
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
        }
        catch (error) {
            console.error('Erro ao atualizar estatísticas:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }
    async obterEstatisticas(req, res) {
        try {
            const estatisticas = await Questao_1.default.aggregate([
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
        }
        catch (error) {
            console.error('Erro ao obter estatísticas:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }
}
exports.default = new QuestaoController();
//# sourceMappingURL=questaoController.js.map