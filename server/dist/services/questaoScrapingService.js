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
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const Questao_1 = __importDefault(require("../models/Questao"));
class QuestaoScrapingService {
    constructor() {
        this.coletaAtiva = false;
        this.shouldStop = false;
    }
    isColetaAtiva() {
        return this.coletaAtiva;
    }
    async executarColeta(universidade, ano) {
        if (this.coletaAtiva) {
            throw new Error('Já existe uma coleta em andamento');
        }
        this.coletaAtiva = true;
        this.shouldStop = false;
        const inicioTempo = Date.now();
        const resultado = {
            questoesEncontradas: 0,
            questoesSalvas: 0,
            erros: [],
            tempoExecucao: 0
        };
        try {
            console.log(`🕷️ Iniciando coleta para ${universidade}${ano ? ` - ${ano}` : ''}`);
            switch (universidade.toUpperCase()) {
                case 'URCA':
                    await this.coletarURCA(resultado, ano);
                    break;
                case 'UVA':
                    await this.coletarUVA(resultado, ano);
                    break;
                case 'UECE':
                    await this.coletarUECE(resultado, ano);
                    break;
                case 'UFC':
                    await this.coletarUFC(resultado, ano);
                    break;
                case 'IFCE':
                    await this.coletarIFCE(resultado, ano);
                    break;
                default:
                    throw new Error(`Universidade ${universidade} não suportada`);
            }
            resultado.tempoExecucao = Date.now() - inicioTempo;
            console.log(`✅ Coleta concluída: ${resultado.questoesSalvas} questões salvas`);
        }
        catch (error) {
            resultado.erros.push(`Erro geral: ${error.message}`);
            console.error('❌ Erro na coleta:', error);
        }
        finally {
            this.coletaAtiva = false;
            this.shouldStop = false;
        }
        return resultado;
    }
    async pararColeta() {
        if (!this.coletaAtiva) {
            throw new Error('Nenhuma coleta em andamento');
        }
        this.shouldStop = true;
        console.log('⏹️ Parando coleta...');
    }
    async coletarURCA(resultado, ano) {
        try {
            console.log('🎯 Coletando questões da URCA...');
            const urls = [
                'https://www.urca.br/vestibular/provas-anteriores',
            ];
            for (const url of urls) {
                if (this.shouldStop)
                    break;
                try {
                    await this.processarURL(url, 'URCA', resultado);
                    await this.delay(2000);
                }
                catch (error) {
                    resultado.erros.push(`Erro ao processar ${url}: ${error.message}`);
                }
            }
        }
        catch (error) {
            resultado.erros.push(`Erro URCA: ${error.message}`);
        }
    }
    async coletarUVA(resultado, ano) {
        try {
            console.log('🎯 Coletando questões da UVA...');
            const urls = [
                'https://www.uva.br/vestibular/provas',
            ];
            for (const url of urls) {
                if (this.shouldStop)
                    break;
                try {
                    await this.processarURL(url, 'UVA', resultado);
                    await this.delay(2000);
                }
                catch (error) {
                    resultado.erros.push(`Erro ao processar ${url}: ${error.message}`);
                }
            }
        }
        catch (error) {
            resultado.erros.push(`Erro UVA: ${error.message}`);
        }
    }
    async coletarUECE(resultado, ano) {
        try {
            console.log('🎯 Coletando questões da UECE...');
            resultado.erros.push('Coleta UECE ainda não implementada');
        }
        catch (error) {
            resultado.erros.push(`Erro UECE: ${error.message}`);
        }
    }
    async coletarUFC(resultado, ano) {
        try {
            console.log('🎯 Coletando questões da UFC...');
            resultado.erros.push('Coleta UFC ainda não implementada');
        }
        catch (error) {
            resultado.erros.push(`Erro UFC: ${error.message}`);
        }
    }
    async coletarIFCE(resultado, ano) {
        try {
            console.log('🎯 Coletando questões do IFCE...');
            resultado.erros.push('Coleta IFCE ainda não implementada');
        }
        catch (error) {
            resultado.erros.push(`Erro IFCE: ${error.message}`);
        }
    }
    async processarURL(url, universidade, resultado) {
        try {
            console.log(`📄 Processando: ${url}`);
            const response = await axios_1.default.get(url, {
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            const $ = cheerio.load(response.data);
            const links = [];
            $('a').each((_, element) => {
                const href = $(element).attr('href');
                if (href && (href.includes('.pdf') || href.includes('prova') || href.includes('questao'))) {
                    const fullUrl = this.resolverURL(href, url);
                    if (fullUrl)
                        links.push(fullUrl);
                }
            });
            console.log(`🔗 Encontrados ${links.length} links para processar`);
            for (const link of links) {
                if (this.shouldStop)
                    break;
                try {
                    await this.processarLinkQuestoes(link, universidade, resultado);
                    await this.delay(1000);
                }
                catch (error) {
                    resultado.erros.push(`Erro ao processar link ${link}: ${error.message}`);
                }
            }
        }
        catch (error) {
            throw new Error(`Erro ao processar URL ${url}: ${error.message}`);
        }
    }
    async processarLinkQuestoes(link, universidade, resultado) {
        try {
            if (link.endsWith('.pdf')) {
                console.log(`📄 PDF encontrado: ${link} (processamento de PDF não implementado)`);
                return;
            }
            const response = await axios_1.default.get(link, {
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            const $ = cheerio.load(response.data);
            const questoes = await this.extrairQuestoesDaPagina($, universidade, link);
            resultado.questoesEncontradas += questoes.length;
            for (const questaoData of questoes) {
                try {
                    const questao = new Questao_1.default(questaoData);
                    await questao.save();
                    resultado.questoesSalvas++;
                    console.log(`✅ Questão salva: ${questao._id}`);
                }
                catch (error) {
                    resultado.erros.push(`Erro ao salvar questão: ${error.message}`);
                }
            }
        }
        catch (error) {
            throw new Error(`Erro ao processar link ${link}: ${error.message}`);
        }
    }
    async extrairQuestoesDaPagina($, universidade, fonte) {
        const questoes = [];
        try {
            console.log(`🔍 Tentando extrair questões de ${fonte}`);
            $('.questao, .question, .item-questao').each((_, element) => {
                try {
                    const enunciado = $(element).find('.enunciado, .texto-questao, p').first().text().trim();
                    if (enunciado && enunciado.length > 20) {
                        const questao = {
                            universidade,
                            materia: 'Geral',
                            assunto: 'Diversos',
                            enunciado,
                            alternativas: this.extrairAlternativas($, element),
                            tipo: 'multipla_escolha',
                            dificuldade: 'medio',
                            fonte,
                            iaGerada: false,
                            verificada: false
                        };
                        if (questao.alternativas.length >= 2) {
                            questoes.push(questao);
                        }
                    }
                }
                catch (error) {
                    console.warn('⚠️ Erro ao extrair questão individual:', error);
                }
            });
        }
        catch (error) {
            console.error('❌ Erro ao extrair questões da página:', error);
        }
        return questoes;
    }
    extrairAlternativas($, elemento) {
        const alternativas = [];
        const letras = ['A', 'B', 'C', 'D', 'E'];
        try {
            $(elemento).find('.alternativa, .opcao, li').each((index, alt) => {
                if (index < 5) {
                    const texto = $(alt).text().trim();
                    if (texto) {
                        alternativas.push({
                            letra: letras[index],
                            texto: texto.replace(/^[A-E]\)\s*/, ''),
                            correta: false
                        });
                    }
                }
            });
        }
        catch (error) {
            console.warn('⚠️ Erro ao extrair alternativas:', error);
        }
        return alternativas;
    }
    resolverURL(href, baseUrl) {
        try {
            if (href.startsWith('http')) {
                return href;
            }
            const base = new URL(baseUrl);
            if (href.startsWith('/')) {
                return `${base.origin}${href}`;
            }
            return `${base.origin}${base.pathname}${href}`;
        }
        catch (error) {
            return null;
        }
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.default = new QuestaoScrapingService();
//# sourceMappingURL=questaoScrapingService.js.map