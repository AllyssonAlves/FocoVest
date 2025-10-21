// Define MockQuestion interface for compatibility
interface MockQuestion {
  id: number
  text: string
  options: string[]
  correctAnswer: number
  subject: string
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  university: 'UFC' | 'UECE' | 'UVA' | 'URCA' | 'ENEM'
}

// Interfaces para geração de questões
interface UniversityExamPattern {
  university: 'UFC' | 'UECE' | 'UVA' | 'URCA' | 'ENEM'
  subjects: string[]
  questionStyle: 'objective' | 'discursive' | 'mixed'
  difficultyDistribution: {
    easy: number
    medium: number
    hard: number
  }
  commonTopics: string[]
  examCharacteristics: {
    averageQuestionLength: number
    contextualQuestions: boolean
    interdisciplinaryQuestions: boolean
    currentEventsIntegration: boolean
  }
}

interface QuestionTemplate {
  id: string
  university: string
  subject: string
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  template: string
  variables: Record<string, string[]>
  explanation: string
  tags: string[]
}

interface GeneratedQuestion {
  question: string
  alternatives: string[]
  correctAnswer: number
  explanation: string
  subject: string
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  university: string
  confidence: number
  generationMethod: 'template' | 'ai_pattern' | 'hybrid'
}

export class AIQuestionGeneratorService {
  private readonly UNIVERSITY_PATTERNS: Record<string, UniversityExamPattern> = {
    UFC: {
      university: 'UFC',
      subjects: ['Matemática', 'Física', 'Química', 'Biologia', 'História', 'Geografia', 'Português', 'Literatura'],
      questionStyle: 'objective',
      difficultyDistribution: { easy: 0.3, medium: 0.5, hard: 0.2 },
      commonTopics: [
        'Função Quadrática', 'Trigonometria', 'Mecânica', 'Eletromagnetismo',
        'Química Orgânica', 'Genética', 'Brasil República', 'Interpretação de Texto'
      ],
      examCharacteristics: {
        averageQuestionLength: 150,
        contextualQuestions: true,
        interdisciplinaryQuestions: true,
        currentEventsIntegration: false
      }
    },
    UECE: {
      university: 'UECE',
      subjects: ['Matemática', 'Física', 'Química', 'Biologia', 'História', 'Geografia', 'Português'],
      questionStyle: 'objective',
      difficultyDistribution: { easy: 0.25, medium: 0.55, hard: 0.2 },
      commonTopics: [
        'Análise Combinatória', 'Geometria Analítica', 'Termodinâmica', 
        'Soluções', 'Ecologia', 'Ceará Colonial', 'Redação'
      ],
      examCharacteristics: {
        averageQuestionLength: 120,
        contextualQuestions: true,
        interdisciplinaryQuestions: false,
        currentEventsIntegration: true
      }
    },
    UVA: {
      university: 'UVA',
      subjects: ['Matemática', 'Física', 'Química', 'Biologia', 'História', 'Português', 'Inglês'],
      questionStyle: 'mixed',
      difficultyDistribution: { easy: 0.4, medium: 0.4, hard: 0.2 },
      commonTopics: [
        'Logaritmos', 'Estatística', 'Ondas', 'Ácidos e Bases',
        'Citologia', 'História Regional', 'Gramática'
      ],
      examCharacteristics: {
        averageQuestionLength: 100,
        contextualQuestions: false,
        interdisciplinaryQuestions: false,
        currentEventsIntegration: false
      }
    },
    URCA: {
      university: 'URCA',
      subjects: ['Matemática', 'Física', 'Química', 'Biologia', 'História', 'Geografia', 'Português'],
      questionStyle: 'objective',
      difficultyDistribution: { easy: 0.35, medium: 0.45, hard: 0.2 },
      commonTopics: [
        'Geometria Plana', 'Cinemática', 'Química Inorgânica',
        'Botânica', 'Cariri na História', 'Sintaxe'
      ],
      examCharacteristics: {
        averageQuestionLength: 110,
        contextualQuestions: true,
        interdisciplinaryQuestions: false,
        currentEventsIntegration: true
      }
    },
    ENEM: {
      university: 'ENEM',
      subjects: ['Matemática', 'Ciências da Natureza', 'Ciências Humanas', 'Linguagens', 'Redação'],
      questionStyle: 'objective',
      difficultyDistribution: { easy: 0.3, medium: 0.5, hard: 0.2 },
      commonTopics: [
        'Matemática Financeira', 'Estatística', 'Meio Ambiente', 'Direitos Humanos',
        'Tecnologia', 'Globalização', 'Interpretação de Texto', 'Gêneros Textuais'
      ],
      examCharacteristics: {
        averageQuestionLength: 200,
        contextualQuestions: true,
        interdisciplinaryQuestions: true,
        currentEventsIntegration: true
      }
    }
  }

  private readonly QUESTION_TEMPLATES: QuestionTemplate[] = [
    {
      id: 'math_func_quad_001',
      university: 'UFC',
      subject: 'Matemática',
      topic: 'Função Quadrática',
      difficulty: 'medium',
      template: 'Considere a função f(x) = {coef_a}x² + {coef_b}x + {coef_c}. O valor de x para o qual f(x) é {extremo} é:',
      variables: {
        coef_a: ['2', '3', '-1', '-2', '4'],
        coef_b: ['-4', '6', '-8', '10', '0'],
        coef_c: ['1', '-3', '5', '-7', '2'],
        extremo: ['mínimo', 'máximo']
      },
      explanation: 'Para encontrar o extremo de uma função quadrática, usamos x = -b/2a.',
      tags: ['função', 'extremo', 'vértice', 'parabola']
    },
    {
      id: 'phys_cinem_001',
      university: 'UECE',
      subject: 'Física',
      topic: 'Cinemática',
      difficulty: 'easy',
      template: 'Um corpo se move com velocidade constante de {velocidade} m/s. Em {tempo} segundos, ele percorrerá uma distância de:',
      variables: {
        velocidade: ['10', '15', '20', '25', '30'],
        tempo: ['5', '8', '10', '12', '15']
      },
      explanation: 'Em movimento uniforme, a distância é calculada por: d = v × t',
      tags: ['movimento uniforme', 'velocidade', 'tempo', 'distância']
    },
    {
      id: 'chem_stoic_001',
      university: 'UVA',
      subject: 'Química',
      topic: 'Estequiometria',
      difficulty: 'medium',
      template: 'Na reação {reacao}, quando {qtd_reagente} mol de {reagente} reage completamente, produz quantos mols de {produto}?',
      variables: {
        reacao: ['2H₂ + O₂ → 2H₂O', 'N₂ + 3H₂ → 2NH₃', 'CaCO₃ → CaO + CO₂'],
        qtd_reagente: ['1', '2', '0.5', '3', '1.5'],
        reagente: ['H₂', 'N₂', 'CaCO₃'],
        produto: ['H₂O', 'NH₃', 'CO₂']
      },
      explanation: 'Use os coeficientes estequiométricos para relacionar quantidades de reagentes e produtos.',
      tags: ['estequiometria', 'mol', 'reação química', 'proporção']
    },
    {
      id: 'bio_genetic_001',
      university: 'URCA',
      subject: 'Biologia',
      topic: 'Genética',
      difficulty: 'hard',
      template: 'Em um cruzamento entre indivíduos heterozigotos ({genotype}), a probabilidade de obter descendentes com fenótipo {phenotype} é:',
      variables: {
        genotype: ['Aa', 'Bb', 'Cc', 'Dd'],
        phenotype: ['dominante', 'recessivo']
      },
      explanation: 'Em cruzamentos Aa x Aa, a proporção é 1:2:1 (AA:Aa:aa), resultando em 3:1 fenotipicamente.',
      tags: ['genética', 'heterozigoto', 'cruzamento', 'probabilidade']
    },
    {
      id: 'port_interp_001',
      university: 'ENEM',
      subject: 'Português',
      topic: 'Interpretação de Texto',
      difficulty: 'medium',
      template: 'Leia o texto: "{texto}". A ideia principal do texto é que:',
      variables: {
        texto: [
          'A tecnologia tem transformado a forma como nos comunicamos, mas também criou novos desafios sociais.',
          'O meio ambiente sofre constantemente com ações humanas, exigindo medidas urgentes de preservação.',
          'A educação é fundamental para o desenvolvimento de uma sociedade mais justa e igualitária.'
        ]
      },
      explanation: 'Para identificar a ideia principal, procure o tema central que perpassa todo o texto.',
      tags: ['interpretação', 'ideia principal', 'compreensão', 'texto']
    }
  ]

  // Análise de padrões das questões existentes
  async analyzeExistingQuestions(): Promise<{
    subjectDistribution: Record<string, number>
    difficultyDistribution: Record<string, number>
    topicFrequency: Record<string, number>
    averageAlternatives: number
  }> {
    console.log('📊 AI: Analisando padrões das questões existentes...')
    
    // Simular análise de base de dados de questões
    const analysis = {
      subjectDistribution: {
        'Matemática': 0.25,
        'Física': 0.15,
        'Química': 0.15,
        'Biologia': 0.15,
        'Português': 0.15,
        'História': 0.10,
        'Geografia': 0.05
      },
      difficultyDistribution: {
        'easy': 0.30,
        'medium': 0.50,
        'hard': 0.20
      },
      topicFrequency: {
        'Função Quadrática': 12,
        'Cinemática': 10,
        'Estequiometria': 8,
        'Genética': 9,
        'Interpretação de Texto': 15,
        'Trigonometria': 7,
        'Eletromagnetismo': 6
      },
      averageAlternatives: 5
    }

    console.log('✅ AI: Análise de padrões concluída')
    return analysis
  }

  // Geração de questão baseada em template
  private generateFromTemplate(template: QuestionTemplate, university?: string): GeneratedQuestion {
    console.log('🎲 AI: Gerando questão do template:', template.id)
    
    let question = template.template
    const usedVariables: Record<string, string> = {}

    // Substituir variáveis no template
    for (const [key, values] of Object.entries(template.variables)) {
      const randomValue = values[Math.floor(Math.random() * values.length)]
      usedVariables[key] = randomValue
      question = question.replace(`{${key}}`, randomValue)
    }

    // Gerar alternativas baseadas no tipo de questão
    const alternatives = this.generateAlternatives(template, usedVariables)
    const correctAnswer = Math.floor(Math.random() * alternatives.length)

    return {
      question,
      alternatives,
      correctAnswer,
      explanation: template.explanation,
      subject: template.subject,
      topic: template.topic,
      difficulty: template.difficulty,
      university: university || template.university,
      confidence: 0.85,
      generationMethod: 'template'
    }
  }

  // Geração de alternativas inteligentes
  private generateAlternatives(template: QuestionTemplate, variables: Record<string, string>): string[] {
    const alternatives: string[] = []
    
    switch (template.subject) {
      case 'Matemática':
        alternatives.push('15', '20', '25', '30', '35')
        break
      case 'Física':
        alternatives.push('100 m', '150 m', '200 m', '250 m', '300 m')
        break
      case 'Química':
        alternatives.push('1 mol', '2 mol', '3 mol', '4 mol', '5 mol')
        break
      case 'Biologia':
        alternatives.push('25%', '50%', '75%', '100%', '0%')
        break
      case 'Português':
        alternatives.push(
          'A tecnologia é prejudicial',
          'A comunicação mudou com a tecnologia',
          'Os desafios sociais são inevitáveis',
          'A tecnologia resolve todos os problemas',
          'A comunicação é dispensável'
        )
        break
      default:
        alternatives.push('Alternativa A', 'Alternativa B', 'Alternativa C', 'Alternativa D', 'Alternativa E')
    }

    return alternatives
  }

  // Geração com padrões de IA
  async generateFromAIPattern(
    subject: string,
    topic: string,
    difficulty: 'easy' | 'medium' | 'hard',
    university?: string
  ): Promise<GeneratedQuestion> {
    console.log('🧠 AI: Gerando questão com padrões de IA para:', { subject, topic, difficulty, university })
    
    const universityPattern = university ? this.UNIVERSITY_PATTERNS[university] : this.UNIVERSITY_PATTERNS.UFC
    
    // Algoritmo simplificado de geração baseada em padrões
    const baseQuestion = await this.generateContextualQuestion(subject, topic, difficulty, universityPattern)
    
    return {
      ...baseQuestion,
      university: university || 'UFC',
      confidence: 0.75,
      generationMethod: 'ai_pattern'
    }
  }

  // Geração de questão contextualizada
  private async generateContextualQuestion(
    subject: string,
    topic: string,
    difficulty: 'easy' | 'medium' | 'hard',
    pattern: UniversityExamPattern
  ): Promise<Omit<GeneratedQuestion, 'university' | 'confidence' | 'generationMethod'>> {
    
    const contexts: { [key: string]: string[] } = {
      'Matemática': [
        'Uma empresa precisa calcular...',
        'Um estudante está analisando dados...',
        'Em uma pesquisa científica...',
        'Durante um projeto de construção...'
      ],
      'Física': [
        'Um experimento de laboratório...',
        'Na análise de um fenômeno natural...',
        'Durante um estudo sobre movimento...',
        'Em uma aplicação tecnológica...'
      ],
      'Química': [
        'Em um processo industrial...',
        'Durante uma reação em laboratório...',
        'Na análise de uma substância...',
        'Em um estudo sobre materiais...'
      ]
    }

    const context = contexts[subject]?.[Math.floor(Math.random() * contexts[subject].length)] || 'Em um contexto acadêmico...'
    
    return {
      question: `${context} relacionado a ${topic}. ${this.generateSpecificQuestion(subject, topic, difficulty)}`,
      alternatives: this.generateSmartAlternatives(subject, topic, difficulty),
      correctAnswer: Math.floor(Math.random() * 5),
      explanation: `Esta questão aborda conceitos fundamentais de ${topic} em ${subject}.`,
      subject,
      topic,
      difficulty
    }
  }

  // Geração de questão específica por matéria
  private generateSpecificQuestion(subject: string, topic: string, difficulty: 'easy' | 'medium' | 'hard'): string {
    const templates: { [key: string]: { [key: string]: string } } = {
      'Matemática': {
        'Função Quadrática': 'Qual é o vértice da parábola representada pela função?',
        'Trigonometria': 'Calcule o valor da expressão trigonométrica.',
        'Logaritmos': 'Determine o valor do logaritmo.'
      },
      'Física': {
        'Cinemática': 'Calcule a velocidade final do objeto.',
        'Dinâmica': 'Determine a força resultante no sistema.',
        'Eletromagnetismo': 'Calcule o campo elétrico na região.'
      },
      'Química': {
        'Estequiometria': 'Quantos mols de produto são formados?',
        'Equilíbrio Químico': 'Calcule a constante de equilíbrio.',
        'Química Orgânica': 'Identifique o composto orgânico.'
      }
    }

    return templates[subject]?.[topic] || `Analise o problema relacionado a ${topic}.`
  }

  // Geração inteligente de alternativas
  private generateSmartAlternatives(subject: string, topic: string, difficulty: 'easy' | 'medium' | 'hard'): string[] {
    const baseAlternatives = ['A', 'B', 'C', 'D', 'E']
    
    // Personalizar baseado no contexto
    switch (subject) {
      case 'Matemática':
        return ['12', '18', '24', '30', '36']
      case 'Física':
        return ['5 m/s', '10 m/s', '15 m/s', '20 m/s', '25 m/s']
      case 'Química':
        return ['0,5 mol', '1,0 mol', '1,5 mol', '2,0 mol', '2,5 mol']
      default:
        return baseAlternatives
    }
  }

  // Método principal de geração
  async generateQuestion(
    subject: string,
    topic?: string,
    difficulty?: 'easy' | 'medium' | 'hard',
    university?: string,
    method: 'template' | 'ai_pattern' | 'hybrid' = 'hybrid'
  ): Promise<GeneratedQuestion> {
    console.log('🎯 AI: Gerando nova questão:', { subject, topic, difficulty, university, method })
    
    const finalDifficulty = difficulty || this.selectRandomDifficulty(university)
    const finalTopic = topic || this.selectRandomTopic(subject, university)

    let question: GeneratedQuestion

    switch (method) {
      case 'template':
        const template = this.selectTemplate(subject, finalTopic, university)
        question = this.generateFromTemplate(template, university)
        break
      
      case 'ai_pattern':
        question = await this.generateFromAIPattern(subject, finalTopic, finalDifficulty, university)
        break
      
      case 'hybrid':
      default:
        // Decidir aleatoriamente entre template e IA
        if (Math.random() > 0.5 && this.hasTemplate(subject, finalTopic)) {
          const template = this.selectTemplate(subject, finalTopic, university)
          question = this.generateFromTemplate(template, university)
        } else {
          question = await this.generateFromAIPattern(subject, finalTopic, finalDifficulty, university)
        }
        break
    }

    console.log('✅ AI: Questão gerada com sucesso:', {
      subject: question.subject,
      topic: question.topic,
      confidence: question.confidence,
      method: question.generationMethod
    })

    return question
  }

  // Métodos auxiliares
  private selectRandomDifficulty(university?: string): 'easy' | 'medium' | 'hard' {
    const pattern = university ? this.UNIVERSITY_PATTERNS[university] : this.UNIVERSITY_PATTERNS.UFC
    const rand = Math.random()
    
    if (rand < pattern.difficultyDistribution.easy) return 'easy'
    if (rand < pattern.difficultyDistribution.easy + pattern.difficultyDistribution.medium) return 'medium'
    return 'hard'
  }

  private selectRandomTopic(subject: string, university?: string): string {
    const pattern = university ? this.UNIVERSITY_PATTERNS[university] : this.UNIVERSITY_PATTERNS.UFC
    const subjectTopics = pattern.commonTopics.filter(topic => 
      this.getTopicSubject(topic) === subject
    )
    
    return subjectTopics[Math.floor(Math.random() * subjectTopics.length)] || 'Tópico Geral'
  }

  private getTopicSubject(topic: string): string {
    const topicMap: Record<string, string> = {
      'Função Quadrática': 'Matemática',
      'Trigonometria': 'Matemática',
      'Logaritmos': 'Matemática',
      'Cinemática': 'Física',
      'Eletromagnetismo': 'Física',
      'Estequiometria': 'Química',
      'Genética': 'Biologia',
      'Interpretação de Texto': 'Português'
    }
    
    return topicMap[topic] || 'Matemática'
  }

  private hasTemplate(subject: string, topic: string): boolean {
    return this.QUESTION_TEMPLATES.some(t => t.subject === subject && t.topic === topic)
  }

  private selectTemplate(subject: string, topic: string, university?: string): QuestionTemplate {
    const candidates = this.QUESTION_TEMPLATES.filter(t => 
      t.subject === subject && 
      (t.topic === topic || !topic) &&
      (!university || t.university === university)
    )
    
    return candidates[Math.floor(Math.random() * candidates.length)] || this.QUESTION_TEMPLATES[0]
  }

  // Geração em lote
  async generateQuestionBatch(
    count: number,
    criteria: {
      subjects?: string[]
      difficulties?: ('easy' | 'medium' | 'hard')[]
      universities?: string[]
    } = {}
  ): Promise<GeneratedQuestion[]> {
    console.log('📦 AI: Gerando lote de questões:', { count, criteria })
    
    const questions: GeneratedQuestion[] = []
    const subjects = criteria.subjects || ['Matemática', 'Física', 'Química', 'Biologia', 'Português']
    const difficulties = criteria.difficulties || ['easy', 'medium', 'hard']
    const universities = criteria.universities || ['UFC', 'UECE', 'UVA', 'URCA']

    for (let i = 0; i < count; i++) {
      const subject = subjects[Math.floor(Math.random() * subjects.length)]
      const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)]
      const university = universities[Math.floor(Math.random() * universities.length)]
      
      try {
        const question = await this.generateQuestion(subject, undefined, difficulty, university)
        questions.push(question)
      } catch (error) {
        console.error('❌ Erro ao gerar questão:', error)
      }
    }

    console.log('✅ AI: Lote de questões gerado:', questions.length, 'questões')
    return questions
  }
}

// Singleton instance
export const aiQuestionGenerator = new AIQuestionGeneratorService()