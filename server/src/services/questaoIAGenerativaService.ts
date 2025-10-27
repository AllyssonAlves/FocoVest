import OpenAI from 'openai';
import Questao, { IQuestao } from '../models/Questao';

// Configurar OpenAI (será configurado via variável de ambiente)
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

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

class QuestaoIAGenerativaService {
  
  // Gerar uma questão baseada em referências
  async gerarQuestaoBaseada(params: GerarQuestaoParams): Promise<IQuestao> {
    if (!openai) {
      throw new Error('OpenAI não configurado. Configure OPENAI_API_KEY no arquivo .env');
    }

    try {
      console.log(`🤖 Gerando questão para ${params.universidade} - ${params.materia}`);

      // Buscar questões de referência
      const questoesReferencia = await this.buscarQuestoesReferencia(params);
      
      // Gerar prompt baseado nas referências
      const prompt = await this.construirPrompt(params, questoesReferencia);
      
      // Gerar questão usando OpenAI
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

      // Parsear e validar a questão gerada
      const questaoGerada = await this.parsearQuestaoGerada(questaoTexto, params);
      
      // Salvar no banco de dados
      const questao = new Questao({
        ...questaoGerada,
        universidade: params.universidade,
        criadoPor: params.usuarioId,
        iaGerada: true,
        questaoReferencia: params.questaoReferencia,
        promptUtilizado: prompt,
        verificada: false // Questões geradas por IA precisam ser verificadas
      });

      await questao.save();
      
      console.log(`✅ Questão gerada com sucesso: ${questao._id}`);
      return questao;

    } catch (error: any) {
      console.error('❌ Erro ao gerar questão:', error);
      throw new Error(`Erro ao gerar questão: ${error.message}`);
    }
  }

  // Gerar lote de questões
  async gerarLoteQuestoes(params: GerarLoteParams): Promise<ResultadoLote> {
    const inicioTempo = Date.now();
    const questoesGeradas: IQuestao[] = [];
    const erros: string[] = [];

    console.log(`🤖 Iniciando geração de lote: ${params.quantidade} questões`);

    for (let i = 0; i < params.quantidade; i++) {
      try {
        // Selecionar matéria aleatória do array
        const materia = params.materias[Math.floor(Math.random() * params.materias.length)];
        
        const questao = await this.gerarQuestaoBaseada({
          universidade: params.universidade,
          materia,
          dificuldade: params.dificuldade,
          usuarioId: params.usuarioId
        });

        questoesGeradas.push(questao);
        console.log(`✅ Questão ${i + 1}/${params.quantidade} gerada`);

        // Delay entre gerações para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error: any) {
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

  // Buscar questões de referência para inspiração
  private async buscarQuestoesReferencia(params: GerarQuestaoParams): Promise<IQuestao[]> {
    try {
      const filtros: any = {
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

      // Buscar até 3 questões de referência
      const questoes = await Questao.find(filtros)
        .limit(3)
        .sort({ 'estatisticas.totalResolucoes': -1 })
        .lean();

      return questoes as any[];
    } catch (error) {
      console.warn('⚠️ Não foi possível buscar questões de referência:', error);
      return [];
    }
  }

  // Construir prompt para a IA
  private async construirPrompt(params: GerarQuestaoParams, referencias: IQuestao[]): Promise<string> {
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

  // Parsear questão gerada pela IA
  private async parsearQuestaoGerada(textoIA: string, params: GerarQuestaoParams): Promise<any> {
    try {
      // Extrair JSON do texto
      const jsonMatch = textoIA.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Formato de resposta inválido da IA');
      }

      const questaoData = JSON.parse(jsonMatch[0]);

      // Validar estrutura
      if (!questaoData.enunciado || !questaoData.alternativas || !Array.isArray(questaoData.alternativas)) {
        throw new Error('Estrutura de questão inválida');
      }

      if (questaoData.alternativas.length !== 5) {
        throw new Error('Questão deve ter exatamente 5 alternativas');
      }

      // Verificar se tem exatamente uma alternativa correta
      const corretas = questaoData.alternativas.filter((alt: any) => alt.correta);
      if (corretas.length !== 1) {
        throw new Error('Questão deve ter exatamente uma alternativa correta');
      }

      return questaoData;

    } catch (error: any) {
      console.error('❌ Erro ao parsear questão:', error);
      throw new Error(`Erro ao processar questão gerada: ${error.message}`);
    }
  }

  // Validar questão gerada
  async validarQuestaoGerada(questao: IQuestao): Promise<boolean> {
    try {
      // Verificações básicas
      if (!questao.enunciado || questao.enunciado.length < 10) {
        return false;
      }

      if (!questao.alternativas || questao.alternativas.length !== 5) {
        return false;
      }

      // Verificar alternativas corretas
      const corretas = questao.alternativas.filter(alt => alt.correta);
      if (corretas.length !== 1) {
        return false;
      }

      // Verificar se não é muito similar a questões existentes
      const similares = await this.buscarQuestoesSimilares(questao);
      if (similares.length > 0) {
        console.warn('⚠️ Questão pode ser muito similar a existentes');
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Erro ao validar questão:', error);
      return false;
    }
  }

  // Buscar questões similares
  private async buscarQuestoesSimilares(questao: IQuestao): Promise<IQuestao[]> {
    try {
      // Busca por palavras-chave no enunciado
      const palavrasChave = questao.enunciado
        .toLowerCase()
        .split(' ')
        .filter(palavra => palavra.length > 4)
        .slice(0, 3);

      if (palavrasChave.length === 0) return [];

      const regex = new RegExp(palavrasChave.join('|'), 'i');

      const similares = await Questao.find({
        universidade: questao.universidade,
        materia: questao.materia,
        enunciado: { $regex: regex }
      }).limit(5) as IQuestao[];

      return similares;
    } catch (error) {
      console.error('❌ Erro ao buscar questões similares:', error);
      return [];
    }
  }
}

export default new QuestaoIAGenerativaService();