import { IQuestion, IAlternative } from '../models/Question'

export interface QuestionFilters {
  subject?: string
  university?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  topics?: string[]
  search?: string
  page?: number
  limit?: number
}

export interface QuestionResult {
  questions: IQuestion[]
  currentPage: number
  totalPages: number
  totalQuestions: number
  hasNext: boolean
  hasPrev: boolean
}

class MockQuestionService {
  private questions: IQuestion[] = []
  private nextId = 1

  constructor() {
    this.initializeMockData()
  }

  private initializeMockData() {
    // Banco de questões expandido para desenvolvimento
    const mockQuestions = [
      // ========== MATEMÁTICA - UFC ==========
      {
        _id: this.generateId(),
        title: 'Função Quadrática - Vértice da Parábola',
        statement: 'Considere a função f(x) = 2x² - 8x + 6. Determine as coordenadas do vértice da parábola que representa esta função.',
        alternatives: [
          { letter: 'A' as const, text: '(2, -2)', isCorrect: true },
          { letter: 'B' as const, text: '(-2, 2)', isCorrect: false },
          { letter: 'C' as const, text: '(4, 6)', isCorrect: false },
          { letter: 'D' as const, text: '(1, 0)', isCorrect: false },
          { letter: 'E' as const, text: '(3, -3)', isCorrect: false }
        ],
        explanation: 'Para encontrar o vértice de uma parábola da forma f(x) = ax² + bx + c, usamos xᵥ = -b/2a. Com a=2 e b=-8: xᵥ = -(-8)/(2×2) = 8/4 = 2. Substituindo em f(x): f(2) = 2(2)² - 8(2) + 6 = 8 - 16 + 6 = -2. Portanto, o vértice é (2, -2).',
        subject: 'Matemática',
        university: 'UFC',
        examYear: 2023,
        difficulty: 'medium' as const,
        topics: ['Função Quadrática', 'Geometria Analítica'],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        createdBy: 'admin' as any,
        isActive: true
      },
      {
        _id: this.generateId(),
        title: 'Progressão Aritmética - Termo Geral',
        statement: 'Em uma progressão aritmética, o primeiro termo é 5 e a razão é 3. Qual é o 20º termo desta progressão?',
        alternatives: [
          { letter: 'A' as const, text: '62', isCorrect: true },
          { letter: 'B' as const, text: '65', isCorrect: false },
          { letter: 'C' as const, text: '59', isCorrect: false },
          { letter: 'D' as const, text: '68', isCorrect: false },
          { letter: 'E' as const, text: '56', isCorrect: false }
        ],
        explanation: 'O termo geral de uma PA é aₙ = a₁ + (n-1)×r. Para o 20º termo: a₂₀ = 5 + (20-1)×3 = 5 + 19×3 = 5 + 57 = 62.',
        subject: 'Matemática',
        university: 'UFC',
        examYear: 2023,
        difficulty: 'easy' as const,
        topics: ['Progressões', 'Sequências'],
        createdAt: new Date('2024-01-16'),
        updatedAt: new Date('2024-01-16'),
        createdBy: 'admin' as any,
        isActive: true
      },
      {
        _id: this.generateId(),
        title: 'Trigonometria - Identidades Fundamentais',
        statement: 'Se sen(x) = 3/5 e x está no primeiro quadrante, qual é o valor de cos(x)?',
        alternatives: [
          { letter: 'A' as const, text: '4/5', isCorrect: true },
          { letter: 'B' as const, text: '3/4', isCorrect: false },
          { letter: 'C' as const, text: '5/4', isCorrect: false },
          { letter: 'D' as const, text: '2/5', isCorrect: false },
          { letter: 'E' as const, text: '1/5', isCorrect: false }
        ],
        explanation: 'Usando a identidade fundamental sen²(x) + cos²(x) = 1: (3/5)² + cos²(x) = 1 → 9/25 + cos²(x) = 1 → cos²(x) = 16/25 → cos(x) = ±4/5. Como x está no primeiro quadrante, cos(x) = 4/5.',
        subject: 'Matemática',
        university: 'UFC',
        examYear: 2022,
        difficulty: 'medium' as const,
        topics: ['Trigonometria', 'Identidades'],
        createdAt: new Date('2024-01-17'),
        updatedAt: new Date('2024-01-17'),
        createdBy: 'admin' as any,
        isActive: true
      },
      {
        _id: this.generateId(),
        title: 'Cálculo Diferencial - Derivada de Função Composta',
        statement: 'Calcule a derivada da função f(x) = (3x² + 2x - 1)⁵',
        alternatives: [
          { letter: 'A' as const, text: '5(3x² + 2x - 1)⁴', isCorrect: false },
          { letter: 'B' as const, text: '(6x + 2)(3x² + 2x - 1)⁴', isCorrect: false },
          { letter: 'C' as const, text: '5(6x + 2)(3x² + 2x - 1)⁴', isCorrect: true },
          { letter: 'D' as const, text: '(6x + 2)⁵', isCorrect: false }
        ],
        explanation: 'Usando a regra da cadeia: f\'(x) = 5(3x² + 2x - 1)⁴ × (6x + 2) = 5(6x + 2)(3x² + 2x - 1)⁴',
        subject: 'Matemática',
        university: 'UFC',
        examYear: 2023,
        difficulty: 'hard' as const,
        topics: ['Cálculo', 'Derivadas'],
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20'),
        createdBy: 'admin' as any,
        isActive: true
      },
      {
        _id: this.generateId(),
        title: 'Geometria Espacial - Volume do Cone',
        statement: 'Um cone circular reto tem raio da base 6 cm e altura 8 cm. Qual é o seu volume?',
        alternatives: [
          { letter: 'A' as const, text: '96π cm³', isCorrect: true },
          { letter: 'B' as const, text: '144π cm³', isCorrect: false },
          { letter: 'C' as const, text: '288π cm³', isCorrect: false },
          { letter: 'D' as const, text: '48π cm³', isCorrect: false },
          { letter: 'E' as const, text: '192π cm³', isCorrect: false }
        ],
        explanation: 'O volume do cone é V = (1/3)πr²h = (1/3)π(6)²(8) = (1/3)π(36)(8) = (1/3)(288π) = 96π cm³.',
        subject: 'Matemática',
        university: 'UFC',
        examYear: 2022,
        difficulty: 'medium' as const,
        topics: ['Geometria Espacial', 'Volume'],
        createdAt: new Date('2024-01-18'),
        updatedAt: new Date('2024-01-18'),
        createdBy: 'admin' as any,
        isActive: true
      },

      // ========== MATEMÁTICA - UECE ==========
      {
        _id: this.generateId(),
        title: 'Logaritmos - Propriedades',
        statement: 'Calcule o valor de log₂(8) + log₃(27) - log₅(125).',
        alternatives: [
          { letter: 'A' as const, text: '3', isCorrect: true },
          { letter: 'B' as const, text: '5', isCorrect: false },
          { letter: 'C' as const, text: '0', isCorrect: false },
          { letter: 'D' as const, text: '6', isCorrect: false }
        ],
        explanation: 'log₂(8) = log₂(2³) = 3; log₃(27) = log₃(3³) = 3; log₅(125) = log₅(5³) = 3. Portanto: 3 + 3 - 3 = 3.',
        subject: 'Matemática',
        university: 'UECE',
        examYear: 2023,
        difficulty: 'medium' as const,
        topics: ['Logaritmos', 'Propriedades'],
        createdAt: new Date('2024-01-19'),
        updatedAt: new Date('2024-01-19'),
        createdBy: 'admin' as any,
        isActive: true
      },
      {
        _id: this.generateId(),
        title: 'Análise Combinatória - Permutações',
        statement: 'De quantas maneiras diferentes podemos arranjar as letras da palavra LIVRO?',
        alternatives: [
          { letter: 'A' as const, text: '120', isCorrect: true },
          { letter: 'B' as const, text: '60', isCorrect: false },
          { letter: 'C' as const, text: '24', isCorrect: false },
          { letter: 'D' as const, text: '36', isCorrect: false },
          { letter: 'E' as const, text: '72', isCorrect: false }
        ],
        explanation: 'A palavra LIVRO tem 5 letras distintas. O número de permutações é 5! = 5×4×3×2×1 = 120.',
        subject: 'Matemática',
        university: 'UECE',
        examYear: 2023,
        difficulty: 'easy' as const,
        topics: ['Análise Combinatória', 'Permutações'],
        createdAt: new Date('2024-01-21'),
        updatedAt: new Date('2024-01-21'),
        createdBy: 'admin' as any,
        isActive: true
      },

      // ========== PORTUGUÊS - UECE ==========
      {
        _id: this.generateId(),
        title: 'Interpretação de Texto - Machado de Assis',
        statement: 'Leia o trecho a seguir de "Dom Casmurro" e responda: "Capitu tinha os olhos de ressaca, que traziam as pessoas de fora para dentro de si." A figura de linguagem predominante neste trecho é:',
        alternatives: [
          { letter: 'A' as const, text: 'Metáfora', isCorrect: true },
          { letter: 'B' as const, text: 'Metonímia', isCorrect: false },
          { letter: 'C' as const, text: 'Hipérbole', isCorrect: false },
          { letter: 'D' as const, text: 'Personificação', isCorrect: false }
        ],
        explanation: 'A expressão "olhos de ressaca" constitui uma metáfora, pois estabelece uma comparação implícita entre os olhos de Capitu e o movimento da ressaca do mar, sugerindo um poder de atração irresistível.',
        subject: 'Português',
        university: 'UECE',
        examYear: 2023,
        difficulty: 'easy' as const,
        topics: ['Figuras de Linguagem', 'Literatura Brasileira', 'Machado de Assis'],
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10'),
        createdBy: 'admin' as any,
        isActive: true
      },
      {
        _id: this.generateId(),
        title: 'Sintaxe - Tipos de Sujeito',
        statement: 'Na oração "Choveu muito ontem", o sujeito é classificado como:',
        alternatives: [
          { letter: 'A' as const, text: 'Sujeito oculto', isCorrect: false },
          { letter: 'B' as const, text: 'Sujeito inexistente', isCorrect: true },
          { letter: 'C' as const, text: 'Sujeito simples', isCorrect: false },
          { letter: 'D' as const, text: 'Sujeito composto', isCorrect: false },
          { letter: 'E' as const, text: 'Sujeito indeterminado', isCorrect: false }
        ],
        explanation: 'O verbo "chover" é impessoal quando se refere ao fenômeno meteorológico, não possuindo sujeito. Portanto, temos sujeito inexistente.',
        subject: 'Português',
        university: 'UECE',
        examYear: 2023,
        difficulty: 'medium' as const,
        topics: ['Sintaxe', 'Tipos de Sujeito'],
        createdAt: new Date('2024-01-22'),
        updatedAt: new Date('2024-01-22'),
        createdBy: 'admin' as any,
        isActive: true
      },
      {
        _id: this.generateId(),
        title: 'Literatura - Romantismo',
        statement: 'Qual obra é considerada o marco inicial do Romantismo no Brasil?',
        alternatives: [
          { letter: 'A' as const, text: 'O Guarani', isCorrect: false },
          { letter: 'B' as const, text: 'Suspiros Poéticos e Saudades', isCorrect: true },
          { letter: 'C' as const, text: 'Iracema', isCorrect: false },
          { letter: 'D' as const, text: 'A Moreninha', isCorrect: false },
          { letter: 'E' as const, text: 'Primeiros Cantos', isCorrect: false }
        ],
        explanation: '"Suspiros Poéticos e Saudades" (1836), de Gonçalves de Magalhães, é considerada a obra que marca o início do Romantismo brasileiro.',
        subject: 'Português',
        university: 'UECE',
        examYear: 2022,
        difficulty: 'medium' as const,
        topics: ['Literatura', 'Romantismo', 'Escolas Literárias'],
        createdAt: new Date('2024-01-23'),
        updatedAt: new Date('2024-01-23'),
        createdBy: 'admin' as any,
        isActive: true
      },

      // ========== PORTUGUÊS - UFC ==========
      {
        _id: this.generateId(),
        title: 'Concordância Verbal - Casos Especiais',
        statement: 'Assinale a alternativa em que a concordância verbal está CORRETA:',
        alternatives: [
          { letter: 'A' as const, text: 'Fazem dois anos que ele partiu.', isCorrect: false },
          { letter: 'B' as const, text: 'Houveram muitos problemas na reunião.', isCorrect: false },
          { letter: 'C' as const, text: 'Deve haver soluções para esse caso.', isCorrect: true },
          { letter: 'D' as const, text: 'Podem haver alternativas melhores.', isCorrect: false }
        ],
        explanation: 'O verbo "haver" no sentido de "existir" é impessoal e fica sempre no singular. O verbo auxiliar "deve" concorda com "haver", permanecendo no singular.',
        subject: 'Português',
        university: 'UFC',
        examYear: 2023,
        difficulty: 'hard' as const,
        topics: ['Concordância Verbal', 'Gramática'],
        createdAt: new Date('2024-01-24'),
        updatedAt: new Date('2024-01-24'),
        createdBy: 'admin' as any,
        isActive: true
      },
      {
        _id: this.generateId(),
        title: 'Interpretação de Texto - Crônica',
        statement: 'Em uma crônica, o narrador observa: "As pessoas passam apressadas, cada uma carregando seu mundo particular." Esse trecho revela:',
        alternatives: [
          { letter: 'A' as const, text: 'Crítica ao individualismo moderno', isCorrect: true },
          { letter: 'B' as const, text: 'Elogio à diversidade humana', isCorrect: false },
          { letter: 'C' as const, text: 'Descrição neutra do cotidiano', isCorrect: false },
          { letter: 'D' as const, text: 'Nostalgia do passado', isCorrect: false }
        ],
        explanation: 'O trecho sugere uma reflexão sobre o isolamento das pessoas na vida moderna, cada uma imersa em seus próprios problemas, caracterizando uma crítica ao individualismo.',
        subject: 'Português',
        university: 'UFC',
        examYear: 2023,
        difficulty: 'medium' as const,
        topics: ['Interpretação de Texto', 'Gêneros Textuais', 'Crônica'],
        createdAt: new Date('2024-01-25'),
        updatedAt: new Date('2024-01-25'),
        createdBy: 'admin' as any,
        isActive: true
      },

      // ========== FÍSICA - UVA ==========
      {
        _id: this.generateId(),
        title: 'Leis de Newton - Força e Aceleração',
        statement: 'Um bloco de massa 5 kg está sujeito a uma força resultante de 20 N. Considerando que não há atrito, qual é a aceleração do bloco?',
        alternatives: [
          { letter: 'A' as const, text: '2 m/s²', isCorrect: false },
          { letter: 'B' as const, text: '4 m/s²', isCorrect: true },
          { letter: 'C' as const, text: '10 m/s²', isCorrect: false },
          { letter: 'D' as const, text: '25 m/s²', isCorrect: false },
          { letter: 'E' as const, text: '100 m/s²', isCorrect: false }
        ],
        explanation: 'Pela Segunda Lei de Newton: F = m × a. Portanto: a = F/m = 20 N / 5 kg = 4 m/s².',
        subject: 'Física',
        university: 'UVA',
        examYear: 2022,
        difficulty: 'easy' as const,
        topics: ['Mecânica', 'Leis de Newton'],
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date('2024-01-12'),
        createdBy: 'admin' as any,
        isActive: true
      },
      {
        _id: this.generateId(),
        title: 'Cinemática - Movimento Uniformemente Variado',
        statement: 'Um carro parte do repouso e acelera uniformemente a 2 m/s². Qual será sua velocidade após 10 segundos?',
        alternatives: [
          { letter: 'A' as const, text: '20 m/s', isCorrect: true },
          { letter: 'B' as const, text: '10 m/s', isCorrect: false },
          { letter: 'C' as const, text: '5 m/s', isCorrect: false },
          { letter: 'D' as const, text: '40 m/s', isCorrect: false },
          { letter: 'E' as const, text: '100 m/s', isCorrect: false }
        ],
        explanation: 'No movimento uniformemente variado: v = v₀ + at. Como parte do repouso (v₀ = 0): v = 0 + 2×10 = 20 m/s.',
        subject: 'Física',
        university: 'UVA',
        examYear: 2023,
        difficulty: 'easy' as const,
        topics: ['Cinemática', 'MUV'],
        createdAt: new Date('2024-01-26'),
        updatedAt: new Date('2024-01-26'),
        createdBy: 'admin' as any,
        isActive: true
      },
      {
        _id: this.generateId(),
        title: 'Eletromagnetismo - Lei de Ohm',
        statement: 'Um resistor de 10 Ω é percorrido por uma corrente de 2 A. Qual é a tensão aplicada?',
        alternatives: [
          { letter: 'A' as const, text: '5 V', isCorrect: false },
          { letter: 'B' as const, text: '20 V', isCorrect: true },
          { letter: 'C' as const, text: '12 V', isCorrect: false },
          { letter: 'D' as const, text: '8 V', isCorrect: false }
        ],
        explanation: 'Pela Lei de Ohm: V = R × I = 10 Ω × 2 A = 20 V.',
        subject: 'Física',
        university: 'UVA',
        examYear: 2023,
        difficulty: 'easy' as const,
        topics: ['Eletromagnetismo', 'Lei de Ohm'],
        createdAt: new Date('2024-01-27'),
        updatedAt: new Date('2024-01-27'),
        createdBy: 'admin' as any,
        isActive: true
      },

      // ========== FÍSICA - UFC ==========
      {
        _id: this.generateId(),
        title: 'Termodinâmica - Primeira Lei',
        statement: 'Em um processo termodinâmico, um gás recebe 500 J de calor e realiza 300 J de trabalho. Qual é a variação da energia interna?',
        alternatives: [
          { letter: 'A' as const, text: '200 J', isCorrect: true },
          { letter: 'B' as const, text: '800 J', isCorrect: false },
          { letter: 'C' as const, text: '-200 J', isCorrect: false },
          { letter: 'D' as const, text: '500 J', isCorrect: false },
          { letter: 'E' as const, text: '300 J', isCorrect: false }
        ],
        explanation: 'Pela Primeira Lei da Termodinâmica: ΔU = Q - W = 500 J - 300 J = 200 J.',
        subject: 'Física',
        university: 'UFC',
        examYear: 2023,
        difficulty: 'medium' as const,
        topics: ['Termodinâmica', 'Primeira Lei'],
        createdAt: new Date('2024-01-28'),
        updatedAt: new Date('2024-01-28'),
        createdBy: 'admin' as any,
        isActive: true
      },
      {
        _id: this.generateId(),
        title: 'Óptica - Espelhos Esféricos',
        statement: 'Um objeto está a 30 cm de um espelho côncavo de distância focal 20 cm. A que distância se forma a imagem?',
        alternatives: [
          { letter: 'A' as const, text: '60 cm', isCorrect: true },
          { letter: 'B' as const, text: '40 cm', isCorrect: false },
          { letter: 'C' as const, text: '50 cm', isCorrect: false },
          { letter: 'D' as const, text: '25 cm', isCorrect: false }
        ],
        explanation: 'Usando a equação de Gauss: 1/f = 1/p + 1/p\'. Logo: 1/20 = 1/30 + 1/p\' → 1/p\' = 1/20 - 1/30 = 3/60 - 2/60 = 1/60 → p\' = 60 cm.',
        subject: 'Física',
        university: 'UFC',
        examYear: 2022,
        difficulty: 'hard' as const,
        topics: ['Óptica', 'Espelhos Esféricos'],
        createdAt: new Date('2024-01-29'),
        updatedAt: new Date('2024-01-29'),
        createdBy: 'admin' as any,
        isActive: true
      },

      // ========== QUÍMICA - IFCE ==========
      {
        _id: this.generateId(),
        title: 'Tabela Periódica - Propriedades dos Elementos',
        statement: 'Qual elemento químico possui número atômico 6 e é fundamental para a química orgânica?',
        alternatives: [
          { letter: 'A' as const, text: 'Oxigênio', isCorrect: false },
          { letter: 'B' as const, text: 'Nitrogênio', isCorrect: false },
          { letter: 'C' as const, text: 'Carbono', isCorrect: true },
          { letter: 'D' as const, text: 'Hidrogênio', isCorrect: false }
        ],
        explanation: 'O carbono (C) possui número atômico 6, ou seja, 6 prótons no núcleo. É o elemento base da química orgânica, formando cadeias carbônicas que constituem moléculas orgânicas.',
        subject: 'Química',
        university: 'IFCE',
        examYear: 2023,
        difficulty: 'easy' as const,
        topics: ['Tabela Periódica', 'Química Orgânica'],
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date('2024-01-08'),
        createdBy: 'admin' as any,
        isActive: true
      },
      {
        _id: this.generateId(),
        title: 'Ligações Químicas - Tipos de Ligação',
        statement: 'A ligação entre os átomos de sódio (Na) e cloro (Cl) no sal de cozinha (NaCl) é classificada como:',
        alternatives: [
          { letter: 'A' as const, text: 'Ligação covalente', isCorrect: false },
          { letter: 'B' as const, text: 'Ligação iônica', isCorrect: true },
          { letter: 'C' as const, text: 'Ligação metálica', isCorrect: false },
          { letter: 'D' as const, text: 'Força de Van der Waals', isCorrect: false },
          { letter: 'E' as const, text: 'Ponte de hidrogênio', isCorrect: false }
        ],
        explanation: 'A ligação entre Na (metal) e Cl (não-metal) é iônica, pois há transferência de elétrons do sódio para o cloro, formando íons Na⁺ e Cl⁻.',
        subject: 'Química',
        university: 'IFCE',
        examYear: 2023,
        difficulty: 'easy' as const,
        topics: ['Ligações Químicas', 'Ligação Iônica'],
        createdAt: new Date('2024-01-30'),
        updatedAt: new Date('2024-01-30'),
        createdBy: 'admin' as any,
        isActive: true
      },
      {
        _id: this.generateId(),
        title: 'Estequiometria - Cálculos Químicos',
        statement: 'Na reação 2H₂ + O₂ → 2H₂O, quantos moles de água são produzidos a partir de 4 moles de hidrogênio?',
        alternatives: [
          { letter: 'A' as const, text: '2 moles', isCorrect: false },
          { letter: 'B' as const, text: '4 moles', isCorrect: true },
          { letter: 'C' as const, text: '6 moles', isCorrect: false },
          { letter: 'D' as const, text: '8 moles', isCorrect: false }
        ],
        explanation: 'Pela estequiometria da reação, 2 moles de H₂ produzem 2 moles de H₂O. Portanto, 4 moles de H₂ produzem 4 moles de H₂O.',
        subject: 'Química',
        university: 'IFCE',
        examYear: 2022,
        difficulty: 'medium' as const,
        topics: ['Estequiometria', 'Cálculos Químicos'],
        createdAt: new Date('2024-01-31'),
        updatedAt: new Date('2024-01-31'),
        createdBy: 'admin' as any,
        isActive: true
      },

      // ========== QUÍMICA - UECE ==========
      {
        _id: this.generateId(),
        title: 'Química Orgânica - Nomenclatura',
        statement: 'O composto CH₃-CH₂-CH₂-OH tem como nome oficial:',
        alternatives: [
          { letter: 'A' as const, text: 'Propanol', isCorrect: true },
          { letter: 'B' as const, text: 'Butanol', isCorrect: false },
          { letter: 'C' as const, text: 'Etanol', isCorrect: false },
          { letter: 'D' as const, text: 'Metanol', isCorrect: false }
        ],
        explanation: 'O composto possui 3 carbonos na cadeia principal e um grupo hidroxila (-OH), sendo classificado como propanol (propan- + -ol).',
        subject: 'Química',
        university: 'UECE',
        examYear: 2023,
        difficulty: 'easy' as const,
        topics: ['Química Orgânica', 'Nomenclatura', 'Álcoois'],
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01'),
        createdBy: 'admin' as any,
        isActive: true
      },
      {
        _id: this.generateId(),
        title: 'Equilíbrio Químico - Princípio de Le Chatelier',
        statement: 'Na reação N₂ + 3H₂ ⇌ 2NH₃ + calor, um aumento de temperatura desloca o equilíbrio para:',
        alternatives: [
          { letter: 'A' as const, text: 'A direita (produtos)', isCorrect: false },
          { letter: 'B' as const, text: 'A esquerda (reagentes)', isCorrect: true },
          { letter: 'C' as const, text: 'Não há deslocamento', isCorrect: false },
          { letter: 'D' as const, text: 'Depende da pressão', isCorrect: false }
        ],
        explanation: 'A reação é exotérmica (libera calor). Pelo Princípio de Le Chatelier, um aumento de temperatura desloca o equilíbrio no sentido da reação endotérmica, ou seja, para a esquerda.',
        subject: 'Química',
        university: 'UECE',
        examYear: 2023,
        difficulty: 'medium' as const,
        topics: ['Equilíbrio Químico', 'Princípio de Le Chatelier'],
        createdAt: new Date('2024-02-02'),
        updatedAt: new Date('2024-02-02'),
        createdBy: 'admin' as any,
        isActive: true
      },

      // ========== BIOLOGIA - URCA ==========
      {
        _id: this.generateId(),
        title: 'Divisão Celular - Mitose e Meiose',
        statement: 'Qual processo de divisão celular é responsável pela formação dos gametas nos organismos superiores?',
        alternatives: [
          { letter: 'A' as const, text: 'Mitose', isCorrect: false },
          { letter: 'B' as const, text: 'Meiose', isCorrect: true },
          { letter: 'C' as const, text: 'Fissão binária', isCorrect: false },
          { letter: 'D' as const, text: 'Fragmentação', isCorrect: false },
          { letter: 'E' as const, text: 'Brotamento', isCorrect: false }
        ],
        explanation: 'A meiose é o processo de divisão celular que produz gametas (células reprodutivas) com metade do número de cromossomos da célula original, sendo essencial para a reprodução sexuada.',
        subject: 'Biologia',
        university: 'URCA',
        examYear: 2023,
        difficulty: 'medium' as const,
        topics: ['Citologia', 'Reprodução'],
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-05'),
        createdBy: 'admin' as any,
        isActive: true
      },
      {
        _id: this.generateId(),
        title: 'Genética - Leis de Mendel',
        statement: 'No cruzamento entre duas plantas heterozigotas para uma característica (Aa x Aa), qual é a proporção fenotípica esperada na descendência?',
        alternatives: [
          { letter: 'A' as const, text: '1:1', isCorrect: false },
          { letter: 'B' as const, text: '3:1', isCorrect: true },
          { letter: 'C' as const, text: '1:2:1', isCorrect: false },
          { letter: 'D' as const, text: '2:1', isCorrect: false },
          { letter: 'E' as const, text: '4:1', isCorrect: false }
        ],
        explanation: 'No cruzamento Aa x Aa, obtemos: 1AA : 2Aa : 1aa. Como A é dominante sobre a, a proporção fenotípica é 3 dominantes : 1 recessivo = 3:1.',
        subject: 'Biologia',
        university: 'URCA',
        examYear: 2023,
        difficulty: 'medium' as const,
        topics: ['Genética', 'Leis de Mendel'],
        createdAt: new Date('2024-02-03'),
        updatedAt: new Date('2024-02-03'),
        createdBy: 'admin' as any,
        isActive: true
      },
      {
        _id: this.generateId(),
        title: 'Ecologia - Cadeias Alimentares',
        statement: 'Em uma cadeia alimentar, os organismos que ocupam o primeiro nível trófico são sempre:',
        alternatives: [
          { letter: 'A' as const, text: 'Carnívoros', isCorrect: false },
          { letter: 'B' as const, text: 'Herbívoros', isCorrect: false },
          { letter: 'C' as const, text: 'Produtores', isCorrect: true },
          { letter: 'D' as const, text: 'Decompositores', isCorrect: false },
          { letter: 'E' as const, text: 'Onívoros', isCorrect: false }
        ],
        explanation: 'Os produtores (plantas e outros organismos autótrofos) sempre ocupam o primeiro nível trófico, pois são capazes de produzir seu próprio alimento através da fotossíntese.',
        subject: 'Biologia',
        university: 'URCA',
        examYear: 2022,
        difficulty: 'easy' as const,
        topics: ['Ecologia', 'Cadeias Alimentares'],
        createdAt: new Date('2024-02-04'),
        updatedAt: new Date('2024-02-04'),
        createdBy: 'admin' as any,
        isActive: true
      },

      // ========== BIOLOGIA - UFC ==========
      {
        _id: this.generateId(),
        title: 'Evolução - Teoria de Darwin',
        statement: 'Segundo a Teoria da Evolução de Darwin, o principal mecanismo responsável pela evolução das espécies é:',
        alternatives: [
          { letter: 'A' as const, text: 'Uso e desuso', isCorrect: false },
          { letter: 'B' as const, text: 'Seleção natural', isCorrect: true },
          { letter: 'C' as const, text: 'Herança dos caracteres adquiridos', isCorrect: false },
          { letter: 'D' as const, text: 'Catastrofismo', isCorrect: false }
        ],
        explanation: 'Darwin propôs que a seleção natural é o principal mecanismo evolutivo, onde os indivíduos mais aptos ao ambiente têm maior chance de sobreviver e reproduzir.',
        subject: 'Biologia',
        university: 'UFC',
        examYear: 2023,
        difficulty: 'easy' as const,
        topics: ['Evolução', 'Darwin', 'Seleção Natural'],
        createdAt: new Date('2024-02-05'),
        updatedAt: new Date('2024-02-05'),
        createdBy: 'admin' as any,
        isActive: true
      },
      {
        _id: this.generateId(),
        title: 'Fisiologia - Sistema Circulatório',
        statement: 'No coração humano, a válvula que separa o ventrículo esquerdo da aorta é chamada de:',
        alternatives: [
          { letter: 'A' as const, text: 'Válvula tricúspide', isCorrect: false },
          { letter: 'B' as const, text: 'Válvula bicúspide', isCorrect: false },
          { letter: 'C' as const, text: 'Válvula aórtica', isCorrect: true },
          { letter: 'D' as const, text: 'Válvula pulmonar', isCorrect: false }
        ],
        explanation: 'A válvula aórtica (ou semilunar aórtica) está localizada entre o ventrículo esquerdo e a aorta, impedindo o refluxo de sangue.',
        subject: 'Biologia',
        university: 'UFC',
        examYear: 2023,
        difficulty: 'medium' as const,
        topics: ['Fisiologia', 'Sistema Circulatório'],
        createdAt: new Date('2024-02-06'),
        updatedAt: new Date('2024-02-06'),
        createdBy: 'admin' as any,
        isActive: true
      },

      // ========== HISTÓRIA - UVA ==========
      {
        _id: this.generateId(),
        title: 'Brasil Colonial - Ciclo do Açúcar',
        statement: 'Durante o período colonial brasileiro, o ciclo do açúcar teve como principal região produtora:',
        alternatives: [
          { letter: 'A' as const, text: 'Sudeste', isCorrect: false },
          { letter: 'B' as const, text: 'Nordeste', isCorrect: true },
          { letter: 'C' as const, text: 'Sul', isCorrect: false },
          { letter: 'D' as const, text: 'Norte', isCorrect: false },
          { letter: 'E' as const, text: 'Centro-Oeste', isCorrect: false }
        ],
        explanation: 'O Nordeste brasileiro, especialmente Pernambuco e Bahia, foi a principal região produtora de açúcar durante o período colonial, devido às condições climáticas favoráveis.',
        subject: 'História',
        university: 'UVA',
        examYear: 2023,
        difficulty: 'easy' as const,
        topics: ['Brasil Colonial', 'Ciclo do Açúcar'],
        createdAt: new Date('2024-02-07'),
        updatedAt: new Date('2024-02-07'),
        createdBy: 'admin' as any,
        isActive: true
      },
      {
        _id: this.generateId(),
        title: 'Segunda Guerra Mundial - Causas',
        statement: 'O evento que marcou o início oficial da Segunda Guerra Mundial foi:',
        alternatives: [
          { letter: 'A' as const, text: 'Ataque a Pearl Harbor', isCorrect: false },
          { letter: 'B' as const, text: 'Invasão da Polônia pela Alemanha', isCorrect: true },
          { letter: 'C' as const, text: 'Invasão da França', isCorrect: false },
          { letter: 'D' as const, text: 'Batalha de Stalingrado', isCorrect: false }
        ],
        explanation: 'A invasão da Polônia pela Alemanha nazista em 1º de setembro de 1939 levou França e Reino Unido a declararem guerra à Alemanha, marcando o início oficial da Segunda Guerra Mundial.',
        subject: 'História',
        university: 'UVA',
        examYear: 2022,
        difficulty: 'easy' as const,
        topics: ['Segunda Guerra Mundial', 'História Contemporânea'],
        createdAt: new Date('2024-02-08'),
        updatedAt: new Date('2024-02-08'),
        createdBy: 'admin' as any,
        isActive: true
      },

      // ========== GEOGRAFIA - IFCE ==========
      {
        _id: this.generateId(),
        title: 'Geografia Física - Clima Brasileiro',
        statement: 'O clima predominante na região Nordeste do Brasil é:',
        alternatives: [
          { letter: 'A' as const, text: 'Equatorial', isCorrect: false },
          { letter: 'B' as const, text: 'Tropical', isCorrect: false },
          { letter: 'C' as const, text: 'Semiárido', isCorrect: true },
          { letter: 'D' as const, text: 'Subtropical', isCorrect: false },
          { letter: 'E' as const, text: 'Temperado', isCorrect: false }
        ],
        explanation: 'O clima semiárido predomina no interior do Nordeste brasileiro, caracterizado por baixa precipitação e altas temperaturas.',
        subject: 'Geografia',
        university: 'IFCE',
        examYear: 2023,
        difficulty: 'easy' as const,
        topics: ['Geografia Física', 'Clima', 'Brasil'],
        createdAt: new Date('2024-02-09'),
        updatedAt: new Date('2024-02-09'),
        createdBy: 'admin' as any,
        isActive: true
      },
      {
        _id: this.generateId(),
        title: 'Geografia Humana - Urbanização',
        statement: 'O processo de crescimento das cidades e concentração populacional urbana é chamado de:',
        alternatives: [
          { letter: 'A' as const, text: 'Metropolização', isCorrect: false },
          { letter: 'B' as const, text: 'Urbanização', isCorrect: true },
          { letter: 'C' as const, text: 'Conurbação', isCorrect: false },
          { letter: 'D' as const, text: 'Gentrificação', isCorrect: false }
        ],
        explanation: 'Urbanização é o processo pelo qual a população se concentra progressivamente nas cidades, caracterizando o crescimento urbano.',
        subject: 'Geografia',
        university: 'IFCE',
        examYear: 2023,
        difficulty: 'easy' as const,
        topics: ['Geografia Humana', 'Urbanização'],
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-02-10'),
        createdBy: 'admin' as any,
        isActive: true
      },

      // ========== QUESTÕES DO ENEM ==========
      {
        _id: this.generateId(),
        title: 'ENEM - Interpretação de Texto',
        statement: 'Leia o texto abaixo:\n\n"A internet revolucionou a forma como nos comunicamos e acessamos informações. No entanto, essa revolução também trouxe desafios relacionados à privacidade e à veracidade das informações compartilhadas."\n\nCom base no texto, é correto afirmar que:',
        alternatives: [
          { letter: 'A' as const, text: 'A internet apenas trouxe benefícios para a sociedade.', isCorrect: false },
          { letter: 'B' as const, text: 'A revolução digital não afetou nossa forma de comunicação.', isCorrect: false },
          { letter: 'C' as const, text: 'A internet transformou a comunicação, mas gerou novos desafios.', isCorrect: true },
          { letter: 'D' as const, text: 'As informações na internet são sempre verdadeiras.', isCorrect: false },
          { letter: 'E' as const, text: 'A privacidade não é uma preocupação no mundo digital.', isCorrect: false }
        ],
        explanation: 'O texto apresenta tanto aspectos positivos (revolução na comunicação e acesso à informação) quanto negativos (desafios de privacidade e veracidade) da internet.',
        subject: 'Português',
        university: 'ENEM',
        examYear: 2023,
        difficulty: 'medium' as const,
        topics: ['Interpretação de Texto', 'Tecnologia e Sociedade'],
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-03-01'),
        createdBy: 'admin' as any,
        isActive: true
      },
      {
        _id: this.generateId(),
        title: 'ENEM - Matemática Básica',
        statement: 'Em uma escola, 60% dos alunos são meninas. Se há 240 meninas na escola, qual é o total de alunos?',
        alternatives: [
          { letter: 'A' as const, text: '300 alunos', isCorrect: false },
          { letter: 'B' as const, text: '360 alunos', isCorrect: false },
          { letter: 'C' as const, text: '400 alunos', isCorrect: true },
          { letter: 'D' as const, text: '480 alunos', isCorrect: false },
          { letter: 'E' as const, text: '600 alunos', isCorrect: false }
        ],
        explanation: 'Se 240 meninas representam 60% do total, então: 240 = 0,6 × Total. Logo, Total = 240 ÷ 0,6 = 400 alunos.',
        subject: 'Matemática',
        university: 'ENEM',
        examYear: 2023,
        difficulty: 'easy' as const,
        topics: ['Porcentagem', 'Regra de Três'],
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-03-01'),
        createdBy: 'admin' as any,
        isActive: true
      },
      {
        _id: this.generateId(),
        title: 'ENEM - História do Brasil',
        statement: 'O período conhecido como "Era Vargas" (1930-1945) foi marcado por importantes transformações sociais e econômicas no Brasil. Uma das principais características desse período foi:',
        alternatives: [
          { letter: 'A' as const, text: 'A total liberdade de imprensa e expressão.', isCorrect: false },
          { letter: 'B' as const, text: 'O fortalecimento do federalismo brasileiro.', isCorrect: false },
          { letter: 'C' as const, text: 'A criação da CLT e direitos trabalhistas.', isCorrect: true },
          { letter: 'D' as const, text: 'A ausência de intervenção estatal na economia.', isCorrect: false },
          { letter: 'E' as const, text: 'O fim da escravidão no Brasil.', isCorrect: false }
        ],
        explanation: 'Durante a Era Vargas foi criada a Consolidação das Leis do Trabalho (CLT) em 1943, estabelecendo direitos trabalhistas fundamentais.',
        subject: 'História',
        university: 'ENEM',
        examYear: 2023,
        difficulty: 'medium' as const,
        topics: ['Era Vargas', 'História do Brasil', 'Direitos Trabalhistas'],
        createdAt: new Date('2024-03-02'),
        updatedAt: new Date('2024-03-02'),
        createdBy: 'admin' as any,
        isActive: true
      },
      {
        _id: this.generateId(),
        title: 'ENEM - Geografia - Meio Ambiente',
        statement: 'O efeito estufa é um fenômeno natural essencial para a manutenção da vida na Terra. Entretanto, as atividades humanas têm intensificado esse processo. O principal gás responsável pelo aumento do efeito estufa é:',
        alternatives: [
          { letter: 'A' as const, text: 'Oxigênio (O₂)', isCorrect: false },
          { letter: 'B' as const, text: 'Nitrogênio (N₂)', isCorrect: false },
          { letter: 'C' as const, text: 'Dióxido de carbono (CO₂)', isCorrect: true },
          { letter: 'D' as const, text: 'Hidrogênio (H₂)', isCorrect: false },
          { letter: 'E' as const, text: 'Hélio (He)', isCorrect: false }
        ],
        explanation: 'O CO₂ (dióxido de carbono) é o principal gás do efeito estufa produzido pelas atividades humanas, especialmente pela queima de combustíveis fósseis.',
        subject: 'Geografia',
        university: 'ENEM',
        examYear: 2023,
        difficulty: 'medium' as const,
        topics: ['Meio Ambiente', 'Efeito Estufa', 'Mudanças Climáticas'],
        createdAt: new Date('2024-03-02'),
        updatedAt: new Date('2024-03-02'),
        createdBy: 'admin' as any,
        isActive: true
      },
      {
        _id: this.generateId(),
        title: 'ENEM - Física - Cinemática',
        statement: 'Um carro parte do repouso e acelera uniformemente a 2 m/s² durante 10 segundos. A velocidade final do carro será de:',
        alternatives: [
          { letter: 'A' as const, text: '10 m/s', isCorrect: false },
          { letter: 'B' as const, text: '15 m/s', isCorrect: false },
          { letter: 'C' as const, text: '20 m/s', isCorrect: true },
          { letter: 'D' as const, text: '25 m/s', isCorrect: false },
          { letter: 'E' as const, text: '30 m/s', isCorrect: false }
        ],
        explanation: 'Usando a equação v = v₀ + at, onde v₀ = 0, a = 2 m/s² e t = 10s: v = 0 + 2×10 = 20 m/s.',
        subject: 'Física',
        university: 'ENEM',
        examYear: 2023,
        difficulty: 'medium' as const,
        topics: ['Cinemática', 'Movimento Uniformemente Variado'],
        createdAt: new Date('2024-03-03'),
        updatedAt: new Date('2024-03-03'),
        createdBy: 'admin' as any,
        isActive: true
      },
      {
        _id: this.generateId(),
        title: 'ENEM - Química - Tabela Periódica',
        statement: 'Na tabela periódica, os elementos químicos estão organizados de acordo com:',
        alternatives: [
          { letter: 'A' as const, text: 'Ordem alfabética', isCorrect: false },
          { letter: 'B' as const, text: 'Massa atômica crescente', isCorrect: false },
          { letter: 'C' as const, text: 'Número atômico crescente', isCorrect: true },
          { letter: 'D' as const, text: 'Densidade dos elementos', isCorrect: false },
          { letter: 'E' as const, text: 'Data de descoberta', isCorrect: false }
        ],
        explanation: 'A tabela periódica atual organiza os elementos químicos em ordem crescente de número atômico (número de prótons no núcleo).',
        subject: 'Química',
        university: 'ENEM',
        examYear: 2023,
        difficulty: 'easy' as const,
        topics: ['Tabela Periódica', 'Estrutura Atômica'],
        createdAt: new Date('2024-03-03'),
        updatedAt: new Date('2024-03-03'),
        createdBy: 'admin' as any,
        isActive: true
      },
      {
        _id: this.generateId(),
        title: 'ENEM - Biologia - Ecologia',
        statement: 'Em um ecossistema, os organismos que ocupam o primeiro nível trófico são denominados:',
        alternatives: [
          { letter: 'A' as const, text: 'Consumidores primários', isCorrect: false },
          { letter: 'B' as const, text: 'Consumidores secundários', isCorrect: false },
          { letter: 'C' as const, text: 'Produtores', isCorrect: true },
          { letter: 'D' as const, text: 'Decompositores', isCorrect: false },
          { letter: 'E' as const, text: 'Consumidores terciários', isCorrect: false }
        ],
        explanation: 'Os produtores (plantas, algas e algumas bactérias) ocupam o primeiro nível trófico, pois produzem seu próprio alimento através da fotossíntese ou quimiossíntese.',
        subject: 'Biologia',
        university: 'ENEM',
        examYear: 2023,
        difficulty: 'medium' as const,
        topics: ['Ecologia', 'Níveis Tróficos', 'Cadeia Alimentar'],
        createdAt: new Date('2024-03-04'),
        updatedAt: new Date('2024-03-04'),
        createdBy: 'admin' as any,
        isActive: true
      }
    ]

    this.questions = mockQuestions as any[]
    console.log(`🎯 MockDB Questions: Inicializadas ${this.questions.length} questões`)
  }

  private generateId(): string {
    return `mock_${this.nextId++}`
  }

  async getQuestions(filters: QuestionFilters = {}): Promise<QuestionResult> {
    let filteredQuestions = this.questions.filter(q => q.isActive)

    // Aplicar filtros
    if (filters.subject) {
      filteredQuestions = filteredQuestions.filter(q => q.subject === filters.subject)
    }

    if (filters.university) {
      filteredQuestions = filteredQuestions.filter(q => q.university === filters.university)
    }

    if (filters.difficulty) {
      filteredQuestions = filteredQuestions.filter(q => q.difficulty === filters.difficulty)
    }

    if (filters.topics && filters.topics.length > 0) {
      filteredQuestions = filteredQuestions.filter(q => 
        filters.topics!.some(topic => q.topics.includes(topic))
      )
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filteredQuestions = filteredQuestions.filter(q =>
        q.title.toLowerCase().includes(searchTerm) ||
        q.statement.toLowerCase().includes(searchTerm) ||
        q.explanation.toLowerCase().includes(searchTerm)
      )
    }

    // Paginação
    const page = filters.page || 1
    const limit = filters.limit || 10
    const totalQuestions = filteredQuestions.length
    const totalPages = Math.ceil(totalQuestions / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit

    const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex)

    return {
      questions: paginatedQuestions,
      currentPage: page,
      totalPages,
      totalQuestions,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  }

  async getQuestionById(id: string): Promise<IQuestion | null> {
    const question = this.questions.find(q => q._id === id && q.isActive)
    return question || null
  }

  async createQuestion(questionData: Partial<IQuestion>): Promise<IQuestion> {
    const newQuestion: IQuestion = {
      _id: this.generateId(),
      title: questionData.title || '',
      statement: questionData.statement || '',
      alternatives: questionData.alternatives || [],
      explanation: questionData.explanation || '',
      subject: questionData.subject || '',
      university: questionData.university || '',
      examYear: questionData.examYear || new Date().getFullYear(),
      difficulty: questionData.difficulty || 'medium',
      topics: questionData.topics || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: questionData.createdBy || 'unknown' as any,
      isActive: true
    } as IQuestion

    this.questions.push(newQuestion)
    return newQuestion
  }

  async updateQuestion(id: string, updates: Partial<IQuestion>, userId: string): Promise<IQuestion | null> {
    const questionIndex = this.questions.findIndex(q => q._id === id && q.isActive)
    
    if (questionIndex === -1) {
      return null
    }

    const question = this.questions[questionIndex]

    // Verificar se o usuário pode editar
    if (question.createdBy.toString() !== userId) {
      return null
    }

    Object.assign(question, updates, { updatedAt: new Date() })
    return question
  }

  async deleteQuestion(id: string, userId: string): Promise<boolean> {
    const question = this.questions.find(q => q._id === id && q.isActive)
    
    if (!question) {
      return false
    }

    // Verificar se o usuário pode deletar
    if (question.createdBy.toString() !== userId) {
      return false
    }

    question.isActive = false
    question.updatedAt = new Date()
    return true
  }

  async getQuestionStats(): Promise<any> {
    const activeQuestions = this.questions.filter(q => q.isActive)
    
    // Agrupar por matéria
    const bySubject = activeQuestions.reduce((acc, q) => {
      acc[q.subject] = (acc[q.subject] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Agrupar por universidade
    const byUniversity = activeQuestions.reduce((acc, q) => {
      acc[q.university] = (acc[q.university] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Agrupar por dificuldade
    const byDifficulty = activeQuestions.reduce((acc, q) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalQuestions: activeQuestions.length,
      bySubject: Object.entries(bySubject).map(([_id, count]) => ({ _id, count })),
      byUniversity: Object.entries(byUniversity).map(([_id, count]) => ({ _id, count })),
      byDifficulty: Object.entries(byDifficulty).map(([_id, count]) => ({ _id, count }))
    }
  }
}

export const mockQuestionService = new MockQuestionService()