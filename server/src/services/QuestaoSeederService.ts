/**
 * Serviço para Popular Banco de Dados com Questões Reais
 * Migração de dados mock para dados persistentes
 */

import Questao, { IQuestao } from '../models/Questao';
import { University } from '../../../shared/dist/types';

interface QuestaoSeed {
  title: string;
  enunciado: string;
  alternativas: Array<{
    letra: string;
    texto: string;
    correta: boolean;
  }>;
  gabarito: string;
  explanation: string;
  subject: string;
  university: University;
  examYear: number;
  difficulty: 'easy' | 'medium' | 'hard';
  topics: string[];
}

export class QuestaoSeederService {
  /**
   * Popular banco com questões reais das universidades alvo
   */
  static async seedRealQuestions(): Promise<void> {
    console.log('🌱 Iniciando população do banco com questões reais...');

    const questoesSeed: QuestaoSeed[] = await this.getQuestoesReais();
    
    let created = 0;
    let skipped = 0;

    for (const questaoData of questoesSeed) {
      try {
        // Verificar se questão já existe
        const existing = await Questao.findOne({
          enunciado: questaoData.enunciado,
          university: questaoData.university
        });

        if (existing) {
          skipped++;
          continue;
        }

        const questao = new Questao({
          ...questaoData,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'system' as any,
          estatisticas: {
            totalResolucoes: 0,
            acertos: 0,
            tempoMedioResolucao: 0,
            dificuldadeCalculada: this.mapDifficultyToNumber(questaoData.difficulty)
          }
        });

        await questao.save();
        created++;

        if (created % 10 === 0) {
          console.log(`✅ Criadas ${created} questões...`);
        }

      } catch (error) {
        console.error(`❌ Erro ao criar questão: ${questaoData.title}`, error);
      }
    }

    console.log(`🎉 Seeding concluído: ${created} questões criadas, ${skipped} ignoradas`);
  }

  /**
   * Retorna questões reais organizadas por universidade
   */
  private static async getQuestoesReais(): Promise<QuestaoSeed[]> {
    return [
      // ===============================
      // QUESTÕES UFC - MATEMÁTICA
      // ===============================
      {
        title: 'Função Quadrática - Vértice da Parábola',
        enunciado: 'Seja f(x) = 2x² - 8x + 6. Determine as coordenadas do vértice da parábola que representa o gráfico dessa função.',
        alternativas: [
          { letra: 'A', texto: '(2, -2)', correta: true },
          { letra: 'B', texto: '(2, 2)', correta: false },
          { letra: 'C', texto: '(-2, 2)', correta: false },
          { letra: 'D', texto: '(4, -2)', correta: false },
          { letra: 'E', texto: '(-2, -2)', correta: false }
        ],
        gabarito: 'A',
        explanation: 'Para uma função quadrática f(x) = ax² + bx + c, as coordenadas do vértice são: xv = -b/(2a) = -(-8)/(2·2) = 8/4 = 2; yv = f(2) = 2(2)² - 8(2) + 6 = 8 - 16 + 6 = -2. Portanto, o vértice é (2, -2).',
        subject: 'Matemática',
        university: University.UFC,
        examYear: 2023,
        difficulty: 'medium',
        topics: ['Função Quadrática', 'Geometria Analítica']
      },

      {
        title: 'Progressão Aritmética - Soma dos Termos',
        enunciado: 'Em uma progressão aritmética, o primeiro termo é 3 e a razão é 4. Qual é a soma dos primeiros 15 termos dessa progressão?',
        alternativas: [
          { letra: 'A', texto: '420', correta: false },
          { letra: 'B', texto: '465', correta: true },
          { letra: 'C', texto: '480', correta: false },
          { letra: 'D', texto: '495', correta: false },
          { letra: 'E', texto: '510', correta: false }
        ],
        gabarito: 'B',
        explanation: 'Em uma PA com a₁ = 3, r = 4 e n = 15: Sn = n(a₁ + an)/2. Primeiro encontramos a15 = a₁ + (n-1)r = 3 + 14·4 = 3 + 56 = 59. Então S15 = 15(3 + 59)/2 = 15·62/2 = 15·31 = 465.',
        subject: 'Matemática',
        university: University.UFC,
        examYear: 2023,
        difficulty: 'medium',
        topics: ['Progressão Aritmética', 'Sequências']
      },

      // ===============================
      // QUESTÕES UECE - FÍSICA
      // ===============================
      {
        title: 'Cinemática - Movimento Uniformemente Variado',
        enunciado: 'Um móvel parte do repouso e acelera uniformemente a 2 m/s². Qual será sua velocidade após percorrer 50 metros?',
        alternativas: [
          { letra: 'A', texto: '10 m/s', correta: false },
          { letra: 'B', texto: '14,1 m/s', correta: true },
          { letra: 'C', texto: '20 m/s', correta: false },
          { letra: 'D', texto: '25 m/s', correta: false }
        ],
        gabarito: 'B',
        explanation: 'Usando a equação de Torricelli: v² = v₀² + 2aΔs. Como parte do repouso, v₀ = 0: v² = 0 + 2·2·50 = 200. Portanto, v = √200 = √(100·2) = 10√2 ≈ 14,1 m/s.',
        subject: 'Física',
        university: University.UECE,
        examYear: 2023,
        difficulty: 'medium',
        topics: ['Cinemática', 'Movimento Uniformemente Variado']
      },

      {
        title: 'Óptica Geométrica - Lei de Snell',
        enunciado: 'Um raio de luz passa do ar (n = 1,0) para a água (n = 1,33) com ângulo de incidência de 60°. Qual é o ângulo de refração?',
        alternativas: [
          { letra: 'A', texto: '40,6°', correta: true },
          { letra: 'B', texto: '45°', correta: false },
          { letra: 'C', texto: '50°', correta: false },
          { letra: 'D', texto: '30°', correta: false }
        ],
        gabarito: 'A',
        explanation: 'Pela Lei de Snell: n₁·sen(θ₁) = n₂·sen(θ₂). Então: 1,0·sen(60°) = 1,33·sen(θ₂). Logo: sen(θ₂) = sen(60°)/1,33 = (√3/2)/1,33 ≈ 0,65. Portanto: θ₂ = arcsen(0,65) ≈ 40,6°.',
        subject: 'Física',
        university: University.UECE,
        examYear: 2023,
        difficulty: 'hard',
        topics: ['Óptica', 'Refração da Luz']
      },

      // ===============================
      // QUESTÕES UVA - QUÍMICA
      // ===============================
      {
        title: 'Química Orgânica - Nomenclatura de Alcanos',
        enunciado: 'Qual é o nome oficial (IUPAC) do composto orgânico com fórmula molecular C₅H₁₂ que apresenta uma ramificação metil?',
        alternativas: [
          { letra: 'A', texto: '2-metilbutano', correta: true },
          { letra: 'B', texto: '3-metilbutano', correta: false },
          { letra: 'C', texto: '2-etilpropano', correta: false },
          { letra: 'D', texto: 'pentano', correta: false },
          { letra: 'E', texto: '2-metilpentano', correta: false }
        ],
        gabarito: 'A',
        explanation: 'Com C₅H₁₂ e uma ramificação metil, temos uma cadeia principal de 4 carbonos (butano) com um grupo metil na posição 2. O nome correto é 2-metilbutano.',
        subject: 'Química',
        university: University.UVA,
        examYear: 2023,
        difficulty: 'easy',
        topics: ['Química Orgânica', 'Nomenclatura', 'Alcanos']
      },

      // ===============================
      // QUESTÕES URCA - BIOLOGIA
      // ===============================
      {
        title: 'Citologia - Estruturas Celulares',
        enunciado: 'Qual organela celular é responsável pela síntese de proteínas destinadas ao sistema endomembranar?',
        alternativas: [
          { letra: 'A', texto: 'Ribossomos livres', correta: false },
          { letra: 'B', texto: 'Ribossomos do retículo endoplasmático rugoso', correta: true },
          { letra: 'C', texto: 'Mitocôndrias', correta: false },
          { letra: 'D', texto: 'Complexo de Golgi', correta: false },
          { letra: 'E', texto: 'Peroxissomos', correta: false }
        ],
        gabarito: 'B',
        explanation: 'Os ribossomos associados ao retículo endoplasmático rugoso (RER) são responsáveis pela síntese de proteínas que serão processadas no sistema endomembranar (RER, Golgi) ou secretadas.',
        subject: 'Biologia',
        university: University.URCA,
        examYear: 2023,
        difficulty: 'medium',
        topics: ['Citologia', 'Organelas', 'Síntese de Proteínas']
      },

      // ===============================
      // QUESTÕES IFCE - MATEMÁTICA APLICADA
      // ===============================
      {
        title: 'Estatística - Medidas de Tendência Central',
        enunciado: 'Em uma amostra de dados: 10, 12, 15, 18, 20, 22, 25. Qual é a mediana desses valores?',
        alternativas: [
          { letra: 'A', texto: '15', correta: false },
          { letra: 'B', texto: '17,4', correta: false },
          { letra: 'C', texto: '18', correta: true },
          { letra: 'D', texto: '20', correta: false },
          { letra: 'E', texto: '22', correta: false }
        ],
        gabarito: 'C',
        explanation: 'A mediana é o valor central quando os dados estão ordenados. Com 7 valores, a mediana é o 4º valor: 10, 12, 15, [18], 20, 22, 25. Portanto, a mediana é 18.',
        subject: 'Matemática',
        university: University.IFCE,
        examYear: 2023,
        difficulty: 'easy',
        topics: ['Estatística', 'Medidas de Tendência Central']
      },

      {
        title: 'Geometria Analítica - Distância entre Pontos',
        enunciado: 'Calcule a distância entre os pontos A(2, 3) e B(6, 6) no plano cartesiano.',
        alternativas: [
          { letra: 'A', texto: '4', correta: false },
          { letra: 'B', texto: '5', correta: true },
          { letra: 'C', texto: '6', correta: false },
          { letra: 'D', texto: '7', correta: false },
          { letra: 'E', texto: '8', correta: false }
        ],
        gabarito: 'B',
        explanation: 'Usando a fórmula da distância: d = √[(x₂-x₁)² + (y₂-y₁)²] = √[(6-2)² + (6-3)²] = √[4² + 3²] = √[16 + 9] = √25 = 5.',
        subject: 'Matemática',
        university: University.IFCE,
        examYear: 2023,
        difficulty: 'easy',
        topics: ['Geometria Analítica', 'Distância entre Pontos']
      },

      // ===============================
      // QUESTÕES INTERDISCIPLINARES
      // ===============================
      {
        title: 'História do Brasil - República Velha',
        enunciado: 'A política do "café com leite" durante a República Velha (1889-1930) representou:',
        alternativas: [
          { letra: 'A', texto: 'A alternância no poder entre São Paulo e Minas Gerais', correta: true },
          { letra: 'B', texto: 'Um acordo comercial entre Brasil e Argentina', correta: false },
          { letra: 'C', texto: 'A abolição da escravatura', correta: false },
          { letra: 'D', texto: 'A industrialização do Nordeste', correta: false },
          { letra: 'E', texto: 'A criação do Partido Republicano', correta: false }
        ],
        gabarito: 'A',
        explanation: 'A política do "café com leite" foi um acordo político informal entre as oligarquias paulista (café) e mineira (leite/economia mista) para se alternarem na presidência da República durante a República Velha.',
        subject: 'História',
        university: University.UFC,
        examYear: 2023,
        difficulty: 'easy',
        topics: ['República Velha', 'Política Brasileira', 'Oligarquias']
      },

      {
        title: 'Língua Portuguesa - Interpretação de Texto',
        enunciado: 'No período "Embora chovesse muito, saímos para o passeio", a oração subordinada adverbial expressa ideia de:',
        alternativas: [
          { letra: 'A', texto: 'Causa', correta: false },
          { letra: 'B', texto: 'Consequência', correta: false },
          { letra: 'C', texto: 'Concessão', correta: true },
          { letra: 'D', texto: 'Condição', correta: false },
          { letra: 'E', texto: 'Tempo', correta: false }
        ],
        gabarito: 'C',
        explanation: 'A conjunção "embora" introduz uma oração subordinada adverbial concessiva, indicando que a ação principal (sair para o passeio) aconteceu apesar da circunstância adversa (chuva).',
        subject: 'Português',
        university: University.UECE,
        examYear: 2023,
        difficulty: 'medium',
        topics: ['Sintaxe', 'Orações Subordinadas', 'Conjunções']
      }
    ];
  }

  /**
   * Mapear dificuldade string para número
   */
  private static mapDifficultyToNumber(difficulty: string): number {
    const map: Record<string, number> = {
      'easy': 1,
      'medium': 2,
      'hard': 3
    };
    return map[difficulty] || 2;
  }

  /**
   * Verificar se o banco já tem questões suficientes
   */
  static async checkIfSeedingNeeded(): Promise<boolean> {
    const count = await Questao.countDocuments();
    console.log(`📊 Questões existentes no banco: ${count}`);
    return count < 10; // Fazer seed se tiver menos de 10 questões
  }

  /**
   * Limpar todas as questões (usar com cuidado!)
   */
  static async clearAllQuestions(): Promise<void> {
    const result = await Questao.deleteMany({});
    console.log(`🗑️ ${result.deletedCount} questões removidas do banco`);
  }

  /**
   * Estatísticas do banco
   */
  static async getStats(): Promise<void> {
    const stats = await Questao.aggregate([
      {
        $group: {
          _id: {
            university: '$university',
            subject: '$subject'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.university': 1, '_id.subject': 1 }
      }
    ]);

    console.log('📊 Estatísticas do banco de questões:');
    stats.forEach(stat => {
      console.log(`  ${stat._id.university} - ${stat._id.subject}: ${stat.count} questões`);
    });

    const total = await Questao.countDocuments();
    console.log(`📈 Total: ${total} questões`);
  }
}

export default QuestaoSeederService;