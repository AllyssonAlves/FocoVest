"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const openai_1 = __importDefault(require("openai"));
const Questao_1 = __importDefault(require("../models/Questao"));
const openai = process.env.OPENAI_API_KEY ? new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY
}) : null;
class QuestaoIAGenerativaService {
    async gerarQuestaoBaseada(params) {
        if (!openai) {
            throw new Error('OpenAI não configurado. Configure OPENAI_API_KEY no arquivo .env');
        }
        try {
            console.log(`🤖 Gerando questão para ${params.universidade} - ${params.materia}`);
            const questoesReferencia = await this.buscarQuestoesReferencia(params);
            const prompt = await this.construirPrompt(params, questoesReferencia);
            const response = await openai.chat.completions.create({
                model: 'gpt-4-turbo-preview',
                messages: [
                    {
                        role: 'system',
                        content: 'Você é um especialista em criar questões de vestibular para universidades brasileiras. Suas questões devem ser precisas, bem fundamentadas e seguir o padrão das universidades solicitadas.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000
            });
            const questaoTexto = response.choices[0]?.message?.content;
            if (!questaoTexto) {
                throw new Error('Não foi possível gerar a questão');
            }
            const questaoGerada = await this.parsearQuestaoGerada(questaoTexto, params);
            const questao = new Questao_1.default({
                ...questaoGerada,
                universidade: params.universidade,
                criadoPor: params.usuarioId,
                iaGerada: true,
                questaoReferencia: params.questaoReferencia,
                promptUtilizado: prompt,
                verificada: false
            });
            await questao.save();
            console.log(`✅ Questão gerada com sucesso: ${questao._id}`);
            return questao;
        }
        catch (error) {
            console.error('❌ Erro ao gerar questão:', error);
            throw new Error(`Erro ao gerar questão: ${error.message}`);
        }
    }
    async gerarLoteQuestoes(params) {
        const inicioTempo = Date.now();
        const questoesGeradas = [];
        const erros = [];
        console.log(`🤖 Iniciando geração de lote: ${params.quantidade} questões`);
        for (let i = 0; i < params.quantidade; i++) {
            try {
                const materia = params.materias[Math.floor(Math.random() * params.materias.length)];
                const questao = await this.gerarQuestaoBaseada({
                    universidade: params.universidade,
                    materia,
                    dificuldade: params.dificuldade,
                    usuarioId: params.usuarioId
                });
                questoesGeradas.push(questao);
                console.log(`✅ Questão ${i + 1}/${params.quantidade} gerada`);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            catch (error) {
                const mensagemErro = `Erro na questão ${i + 1}: ${error.message}`;
                erros.push(mensagemErro);
                console.error(`❌ ${mensagemErro}`);
            }
        }
        const tempoTotal = Date.now() - inicioTempo;
        console.log(`🏁 Lote concluído: ${questoesGeradas.length} questões geradas, ${erros.length} erros`);
        return {
            questoesGeradas,
            erros,
            tempoTotal
        };
    }
    async buscarQuestoesReferencia(params) {
        try {
            const filtros = {
                universidade: params.universidade,
                materia: params.materia,
                verificada: true
            };
            if (params.assunto) {
                filtros.assunto = params.assunto;
            }
            if (params.dificuldade) {
                filtros.dificuldade = params.dificuldade;
            }
            const questoes = await Questao_1.default.find(filtros)
                .limit(3)
                .sort({ 'estatisticas.totalResolucoes': -1 })
                .lean();
            return questoes;
        }
        catch (error) {
            console.warn('⚠️ Não foi possível buscar questões de referência:', error);
            return [];
        }
    }
    async construirPrompt(params, referencias) {
        let prompt = `Crie uma questão de vestibular para a universidade ${params.universidade} na matéria ${params.materia}.

INSTRUÇÕES IMPORTANTES:
1. A questão deve seguir o padrão e estilo das questões desta universidade
2. Use linguagem clara e objetiva
3. Crie exatamente 5 alternativas (A, B, C, D, E)
4. Apenas UMA alternativa deve estar correta
5. Inclua uma explicação detalhada da resposta correta
6. A dificuldade deve ser: ${params.dificuldade || 'medio'}

`;
        if (params.assunto) {
            prompt += `ASSUNTO ESPECÍFICO: ${params.assunto}\n\n`;
        }
        if (referencias.length > 0) {
            prompt += `QUESTÕES DE REFERÊNCIA (use como inspiração para estilo e formato):\n\n`;
            referencias.forEach((ref, index) => {
                prompt += `--- REFERÊNCIA ${index + 1} ---\n`;
                prompt += `Matéria: ${ref.materia}\n`;
                prompt += `Assunto: ${ref.assunto}\n`;
                prompt += `Enunciado: ${ref.enunciado}\n`;
                prompt += `Alternativas:\n`;
                ref.alternativas.forEach(alt => {
                    prompt += `${alt.letra}) ${alt.texto}\n`;
                });
                prompt += `\n`;
            });
        }
        prompt += `
FORMATO DE RESPOSTA OBRIGATÓRIO (JSON):
{
  "materia": "${params.materia}",
  "assunto": "assunto específico da questão",
  "enunciado": "texto completo da questão",
  "alternativas": [
    {"letra": "A", "texto": "primeira alternativa", "correta": false},
    {"letra": "B", "texto": "segunda alternativa", "correta": true},
    {"letra": "C", "texto": "terceira alternativa", "correta": false},
    {"letra": "D", "texto": "quarta alternativa", "correta": false},
    {"letra": "E", "texto": "quinta alternativa", "correta": false}
  ],
  "tipo": "multipla_escolha",
  "dificuldade": "${params.dificuldade || 'medio'}",
  "explicacao": "explicação detalhada da resposta correta",
  "tags": ["tag1", "tag2", "tag3"]
}

RESPONDA APENAS COM O JSON, SEM TEXTO ADICIONAL.`;
        return prompt;
    }
    async parsearQuestaoGerada(textoIA, params) {
        try {
            const jsonMatch = textoIA.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Formato de resposta inválido da IA');
            }
            const questaoData = JSON.parse(jsonMatch[0]);
            if (!questaoData.enunciado || !questaoData.alternativas || !Array.isArray(questaoData.alternativas)) {
                throw new Error('Estrutura de questão inválida');
            }
            if (questaoData.alternativas.length !== 5) {
                throw new Error('Questão deve ter exatamente 5 alternativas');
            }
            const corretas = questaoData.alternativas.filter((alt) => alt.correta);
            if (corretas.length !== 1) {
                throw new Error('Questão deve ter exatamente uma alternativa correta');
            }
            return questaoData;
        }
        catch (error) {
            console.error('❌ Erro ao parsear questão:', error);
            throw new Error(`Erro ao processar questão gerada: ${error.message}`);
        }
    }
    async validarQuestaoGerada(questao) {
        try {
            if (!questao.enunciado || questao.enunciado.length < 10) {
                return false;
            }
            if (!questao.alternativas || questao.alternativas.length !== 5) {
                return false;
            }
            const corretas = questao.alternativas.filter(alt => alt.correta);
            if (corretas.length !== 1) {
                return false;
            }
            const similares = await this.buscarQuestoesSimilares(questao);
            if (similares.length > 0) {
                console.warn('⚠️ Questão pode ser muito similar a existentes');
                return false;
            }
            return true;
        }
        catch (error) {
            console.error('❌ Erro ao validar questão:', error);
            return false;
        }
    }
    async buscarQuestoesSimilares(questao) {
        try {
            const palavrasChave = questao.enunciado
                .toLowerCase()
                .split(' ')
                .filter(palavra => palavra.length > 4)
                .slice(0, 3);
            if (palavrasChave.length === 0)
                return [];
            const regex = new RegExp(palavrasChave.join('|'), 'i');
            const similares = await Questao_1.default.find({
                universidade: questao.universidade,
                materia: questao.materia,
                enunciado: { $regex: regex }
            }).limit(5);
            return similares;
        }
        catch (error) {
            console.error('❌ Erro ao buscar questões similares:', error);
            return [];
        }
    }
}
exports.default = new QuestaoIAGenerativaService();
//# sourceMappingURL=questaoIAGenerativaService.js.map