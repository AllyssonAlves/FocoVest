import axios from 'axios';
import * as cheerio from 'cheerio';
import Questao from '../models/Questao';

interface ColetaResultado {
  questoesEncontradas: number;
  questoesSalvas: number;
  erros: string[];
  tempoExecucao: number;
}

class QuestaoScrapingService {
  private coletaAtiva = false;
  private shouldStop = false;

  // Verificar se coleta está ativa
  isColetaAtiva(): boolean {
    return this.coletaAtiva;
  }

  // Executar coleta de questões
  async executarColeta(universidade: string, ano?: number): Promise<ColetaResultado> {
    if (this.coletaAtiva) {
      throw new Error('Já existe uma coleta em andamento');
    }

    this.coletaAtiva = true;
    this.shouldStop = false;
    const inicioTempo = Date.now();

    const resultado: ColetaResultado = {
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

    } catch (error: any) {
      resultado.erros.push(`Erro geral: ${error.message}`);
      console.error('❌ Erro na coleta:', error);
    } finally {
      this.coletaAtiva = false;
      this.shouldStop = false;
    }

    return resultado;
  }

  // Parar coleta em andamento
  async pararColeta(): Promise<void> {
    if (!this.coletaAtiva) {
      throw new Error('Nenhuma coleta em andamento');
    }
    
    this.shouldStop = true;
    console.log('⏹️ Parando coleta...');
  }

  // Coleta específica para URCA
  private async coletarURCA(resultado: ColetaResultado, ano?: number): Promise<void> {
    try {
      console.log('🎯 Coletando questões da URCA...');
      
      // URLs dos vestibulares da URCA (exemplo - adaptar conforme necessário)
      const urls = [
        'https://www.urca.br/vestibular/provas-anteriores',
        // Adicionar mais URLs conforme necessário
      ];

      for (const url of urls) {
        if (this.shouldStop) break;

        try {
          await this.processarURL(url, 'URCA', resultado);
          await this.delay(2000); // Delay entre requests
        } catch (error: any) {
          resultado.erros.push(`Erro ao processar ${url}: ${error.message}`);
        }
      }

    } catch (error: any) {
      resultado.erros.push(`Erro URCA: ${error.message}`);
    }
  }

  // Coleta específica para UVA
  private async coletarUVA(resultado: ColetaResultado, ano?: number): Promise<void> {
    try {
      console.log('🎯 Coletando questões da UVA...');
      
      // Implementar coleta específica da UVA
      // Esta é uma implementação de exemplo - adaptar conforme o site real
      const urls = [
        'https://www.uva.br/vestibular/provas',
        // Adicionar URLs reais da UVA
      ];

      for (const url of urls) {
        if (this.shouldStop) break;
        
        try {
          await this.processarURL(url, 'UVA', resultado);
          await this.delay(2000);
        } catch (error: any) {
          resultado.erros.push(`Erro ao processar ${url}: ${error.message}`);
        }
      }

    } catch (error: any) {
      resultado.erros.push(`Erro UVA: ${error.message}`);
    }
  }

  // Coleta específica para UECE
  private async coletarUECE(resultado: ColetaResultado, ano?: number): Promise<void> {
    try {
      console.log('🎯 Coletando questões da UECE...');
      
      // Implementar coleta específica da UECE
      resultado.erros.push('Coleta UECE ainda não implementada');

    } catch (error: any) {
      resultado.erros.push(`Erro UECE: ${error.message}`);
    }
  }

  // Coleta específica para UFC
  private async coletarUFC(resultado: ColetaResultado, ano?: number): Promise<void> {
    try {
      console.log('🎯 Coletando questões da UFC...');
      
      // Implementar coleta específica da UFC
      resultado.erros.push('Coleta UFC ainda não implementada');

    } catch (error: any) {
      resultado.erros.push(`Erro UFC: ${error.message}`);
    }
  }

  // Coleta específica para IFCE
  private async coletarIFCE(resultado: ColetaResultado, ano?: number): Promise<void> {
    try {
      console.log('🎯 Coletando questões do IFCE...');
      
      // Implementar coleta específica do IFCE
      resultado.erros.push('Coleta IFCE ainda não implementada');

    } catch (error: any) {
      resultado.erros.push(`Erro IFCE: ${error.message}`);
    }
  }

  // Processar URL específica
  private async processarURL(url: string, universidade: string, resultado: ColetaResultado): Promise<void> {
    try {
      console.log(`📄 Processando: ${url}`);

      const response = await axios.get(url, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(response.data);

      // Buscar links para PDFs ou páginas de questões
      const links: string[] = [];
      
      $('a').each((_, element) => {
        const href = $(element).attr('href');
        if (href && (href.includes('.pdf') || href.includes('prova') || href.includes('questao'))) {
          const fullUrl = this.resolverURL(href, url);
          if (fullUrl) links.push(fullUrl);
        }
      });

      console.log(`🔗 Encontrados ${links.length} links para processar`);

      // Processar cada link encontrado
      for (const link of links) {
        if (this.shouldStop) break;

        try {
          await this.processarLinkQuestoes(link, universidade, resultado);
          await this.delay(1000);
        } catch (error: any) {
          resultado.erros.push(`Erro ao processar link ${link}: ${error.message}`);
        }
      }

    } catch (error: any) {
      throw new Error(`Erro ao processar URL ${url}: ${error.message}`);
    }
  }

  // Processar link específico de questões
  private async processarLinkQuestoes(link: string, universidade: string, resultado: ColetaResultado): Promise<void> {
    try {
      if (link.endsWith('.pdf')) {
        // Para PDFs, seria necessário usar uma biblioteca como pdf-parse
        console.log(`📄 PDF encontrado: ${link} (processamento de PDF não implementado)`);
        return;
      }

      // Processar página HTML
      const response = await axios.get(link, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(response.data);

      // Extrair questões da página (implementação específica por universidade)
      const questoes = await this.extrairQuestoesDaPagina($, universidade, link);
      
      resultado.questoesEncontradas += questoes.length;

      // Salvar questões no banco
      for (const questaoData of questoes) {
        try {
          const questao = new Questao(questaoData);
          await questao.save();
          resultado.questoesSalvas++;
          console.log(`✅ Questão salva: ${questao._id}`);
        } catch (error: any) {
          resultado.erros.push(`Erro ao salvar questão: ${error.message}`);
        }
      }

    } catch (error: any) {
      throw new Error(`Erro ao processar link ${link}: ${error.message}`);
    }
  }

  // Extrair questões de uma página (implementação genérica)
  private async extrairQuestoesDaPagina($: any, universidade: string, fonte: string): Promise<any[]> {
    const questoes: any[] = [];

    try {
      // Esta é uma implementação genérica - deve ser customizada para cada universidade
      console.log(`🔍 Tentando extrair questões de ${fonte}`);

      // Exemplo de extração genérica (adaptar conforme estrutura real dos sites)
      $('.questao, .question, .item-questao').each((_: any, element: any) => {
        try {
          const enunciado = $(element).find('.enunciado, .texto-questao, p').first().text().trim();
          
          if (enunciado && enunciado.length > 20) {
            const questao = {
              universidade,
              materia: 'Geral', // Seria necessário extrair ou inferir
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
        } catch (error) {
          console.warn('⚠️ Erro ao extrair questão individual:', error);
        }
      });

    } catch (error: any) {
      console.error('❌ Erro ao extrair questões da página:', error);
    }

    return questoes;
  }

  // Extrair alternativas de uma questão
  private extrairAlternativas($: any, elemento: any): any[] {
    const alternativas: any[] = [];
    const letras = ['A', 'B', 'C', 'D', 'E'];

    try {
      $(elemento).find('.alternativa, .opcao, li').each((index: any, alt: any) => {
        if (index < 5) { // Máximo 5 alternativas
          const texto = $(alt).text().trim();
          if (texto) {
            alternativas.push({
              letra: letras[index],
              texto: texto.replace(/^[A-E]\)\s*/, ''), // Remover letra se já estiver no texto
              correta: false // Será necessário determinar a correta de outra forma
            });
          }
        }
      });
    } catch (error) {
      console.warn('⚠️ Erro ao extrair alternativas:', error);
    }

    return alternativas;
  }

  // Resolver URL relativa para absoluta
  private resolverURL(href: string, baseUrl: string): string | null {
    try {
      if (href.startsWith('http')) {
        return href;
      }
      
      const base = new URL(baseUrl);
      
      if (href.startsWith('/')) {
        return `${base.origin}${href}`;
      }
      
      return `${base.origin}${base.pathname}${href}`;
    } catch (error) {
      return null;
    }
  }

  // Delay entre requests
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new QuestaoScrapingService();