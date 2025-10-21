"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiRecommendationService = exports.AIRecommendationService = void 0;
const MockUserService_1 = require("./MockUserService");
class AIRecommendationService {
    constructor() {
        this.LEARNING_PATTERNS_CACHE = new Map();
        this.ERROR_PATTERNS_CACHE = new Map();
    }
    async analyzeErrorPatterns(userId) {
        console.log('🧠 AI: Analisando padrões de erro para usuário:', userId);
        const cacheKey = `error_patterns_${userId}`;
        if (this.ERROR_PATTERNS_CACHE.has(cacheKey)) {
            console.log('📊 AI: Usando padrões de erro em cache');
            return this.ERROR_PATTERNS_CACHE.get(cacheKey);
        }
        const errorPatterns = [
            {
                subject: 'Matemática',
                topic: 'Funções Quadráticas',
                frequency: 8,
                lastOccurrence: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                difficulty: 'hard',
                similarQuestions: ['func_quad_001', 'func_quad_003', 'func_quad_007']
            },
            {
                subject: 'Física',
                topic: 'Cinemática',
                frequency: 5,
                lastOccurrence: new Date(Date.now() - 24 * 60 * 60 * 1000),
                difficulty: 'medium',
                similarQuestions: ['cinem_002', 'cinem_005', 'cinem_009']
            },
            {
                subject: 'Química',
                topic: 'Estequiometria',
                frequency: 6,
                lastOccurrence: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                difficulty: 'medium',
                similarQuestions: ['estoq_001', 'estoq_004', 'estoq_008']
            },
            {
                subject: 'Português',
                topic: 'Interpretação de Texto',
                frequency: 4,
                lastOccurrence: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                difficulty: 'easy',
                similarQuestions: ['interp_003', 'interp_007', 'interp_012']
            }
        ];
        this.ERROR_PATTERNS_CACHE.set(cacheKey, errorPatterns);
        console.log('✅ AI: Padrões de erro analisados:', errorPatterns.length, 'padrões encontrados');
        return errorPatterns;
    }
    async analyzeStudyPatterns(userId) {
        console.log('📈 AI: Analisando padrões de estudo para usuário:', userId);
        const cacheKey = `study_pattern_${userId}`;
        if (this.LEARNING_PATTERNS_CACHE.has(cacheKey)) {
            console.log('📊 AI: Usando padrões de estudo em cache');
            return this.LEARNING_PATTERNS_CACHE.get(cacheKey);
        }
        const studyPattern = {
            userId,
            preferredTimeSlots: [8, 9, 14, 15, 19, 20],
            averageSessionDuration: 45,
            mostProductiveHours: [9, 15, 20],
            consistencyScore: 0.75,
            weeklyPattern: [0.6, 0.8, 0.9, 0.7, 0.8, 0.4, 0.3]
        };
        this.LEARNING_PATTERNS_CACHE.set(cacheKey, studyPattern);
        console.log('✅ AI: Padrões de estudo analisados para usuário:', userId);
        return studyPattern;
    }
    async analyzeSubjectPerformance(userId) {
        console.log('📚 AI: Analisando performance por matéria para usuário:', userId);
        const user = await MockUserService_1.mockUserDB.findById(userId);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }
        const errorPatterns = await this.analyzeErrorPatterns(userId);
        const subjects = [
            {
                subject: 'Matemática',
                performance: 65,
                improvement: -5,
                weakPoints: ['Funções Quadráticas', 'Logaritmos', 'Trigonometria'],
                strongPoints: ['Álgebra Básica', 'Geometria Plana'],
                priority: 'high',
                recommendedStudyTime: 120
            },
            {
                subject: 'Física',
                performance: 72,
                improvement: 3,
                weakPoints: ['Cinemática', 'Dinâmica'],
                strongPoints: ['Óptica', 'Ondas'],
                priority: 'medium',
                recommendedStudyTime: 90
            },
            {
                subject: 'Química',
                performance: 68,
                improvement: -2,
                weakPoints: ['Estequiometria', 'Equilíbrio Químico'],
                strongPoints: ['Estrutura Atômica', 'Tabela Periódica'],
                priority: 'high',
                recommendedStudyTime: 105
            },
            {
                subject: 'Português',
                performance: 78,
                improvement: 7,
                weakPoints: ['Interpretação de Texto'],
                strongPoints: ['Gramática', 'Literatura'],
                priority: 'low',
                recommendedStudyTime: 60
            },
            {
                subject: 'História',
                performance: 74,
                improvement: 1,
                weakPoints: ['História do Brasil Republicano'],
                strongPoints: ['História Antiga', 'História Medieval'],
                priority: 'medium',
                recommendedStudyTime: 75
            }
        ];
        console.log('✅ AI: Performance por matéria analisada:', subjects.length, 'matérias');
        return subjects;
    }
    async generateRecommendations(userId) {
        console.log('🎯 AI: Gerando recomendações personalizadas para usuário:', userId);
        const [errorPatterns, studyPattern, subjectAnalysis] = await Promise.all([
            this.analyzeErrorPatterns(userId),
            this.analyzeStudyPatterns(userId),
            this.analyzeSubjectPerformance(userId)
        ]);
        const recommendations = [];
        const highFrequencyErrors = errorPatterns.filter(p => p.frequency >= 6);
        if (highFrequencyErrors.length > 0) {
            recommendations.push({
                type: 'question_practice',
                priority: 'urgent',
                title: 'Foque nos seus pontos fracos',
                description: `Você tem errado frequentemente em ${highFrequencyErrors[0].subject} - ${highFrequencyErrors[0].topic}`,
                actionItems: [
                    `Pratique 10 questões específicas sobre ${highFrequencyErrors[0].topic}`,
                    'Revise a teoria fundamental do tópico',
                    'Faça exercícios progressivos de dificuldade'
                ],
                estimatedTime: 60,
                expectedImprovement: 15,
                reasoning: `Detectamos ${highFrequencyErrors[0].frequency} erros recentes neste tópico. Foco direcionado pode melhorar sua performance em 15%.`
            });
        }
        const bestHours = studyPattern.mostProductiveHours;
        recommendations.push({
            type: 'study_schedule',
            priority: 'high',
            title: 'Otimize seus horários de estudo',
            description: `Seus melhores horários são ${bestHours.join('h, ')}h`,
            actionItems: [
                `Concentre estudos de matérias difíceis entre ${bestHours[0]}h-${bestHours[0] + 1}h`,
                `Use ${bestHours[1]}h para revisões`,
                'Evite estudos pesados após 22h'
            ],
            estimatedTime: 0,
            expectedImprovement: 10,
            reasoning: 'Análise de seus padrões mostram maior eficiência nestes horários.'
        });
        const highPrioritySubjects = subjectAnalysis.filter(s => s.priority === 'high');
        if (highPrioritySubjects.length > 0) {
            recommendations.push({
                type: 'subject_focus',
                priority: 'high',
                title: 'Priorize estas matérias',
                description: `${highPrioritySubjects.map(s => s.subject).join(' e ')} precisam de atenção urgente`,
                actionItems: highPrioritySubjects.map(s => `Dedique ${Math.floor(s.recommendedStudyTime / 60)}h semanais para ${s.subject}`),
                estimatedTime: highPrioritySubjects.reduce((acc, s) => acc + s.recommendedStudyTime, 0),
                expectedImprovement: 20,
                reasoning: 'Estas matérias têm performance abaixo do esperado e alto impacto no resultado final.'
            });
        }
        const improvingSubjects = subjectAnalysis.filter(s => s.improvement > 0);
        if (improvingSubjects.length > 0) {
            recommendations.push({
                type: 'review_material',
                priority: 'medium',
                title: 'Mantenha o progresso',
                description: `Continue o bom trabalho em ${improvingSubjects[0].subject}`,
                actionItems: [
                    'Faça revisões regulares para manter o nível',
                    'Aprofunde nos pontos fortes',
                    'Teste conhecimentos com simulados'
                ],
                estimatedTime: 30,
                expectedImprovement: 5,
                reasoning: `Performance em ${improvingSubjects[0].subject} melhorou ${improvingSubjects[0].improvement}%. Manter consistência é crucial.`
            });
        }
        console.log('✅ AI: Recomendações geradas:', recommendations.length);
        return recommendations;
    }
    async generateStudySchedule(userId) {
        console.log('📅 AI: Gerando cronograma personalizado para usuário:', userId);
        const [studyPattern, subjectAnalysis] = await Promise.all([
            this.analyzeStudyPatterns(userId),
            this.analyzeSubjectPerformance(userId)
        ]);
        const schedule = {
            optimalStudyTimes: studyPattern.mostProductiveHours.map((hour, index) => ({
                hour,
                duration: index === 0 ? 60 : 45,
                subjects: subjectAnalysis
                    .filter(s => s.priority === 'high')
                    .slice(index, index + 2)
                    .map(s => s.subject),
                effectiveness: 0.85 - (index * 0.1)
            })),
            weeklyPlan: [
                {
                    day: 'Segunda',
                    sessions: [
                        { time: '09:00', subject: 'Matemática', duration: 60, type: 'new_content' },
                        { time: '15:00', subject: 'Física', duration: 45, type: 'practice' },
                        { time: '20:00', subject: 'Revisão', duration: 30, type: 'review' }
                    ]
                },
                {
                    day: 'Terça',
                    sessions: [
                        { time: '09:00', subject: 'Química', duration: 60, type: 'new_content' },
                        { time: '15:00', subject: 'Português', duration: 45, type: 'practice' },
                        { time: '20:00', subject: 'Matemática', duration: 30, type: 'review' }
                    ]
                }
            ],
            adaptiveBreaks: [
                { duration: 5, frequency: 25, type: 'short' },
                { duration: 15, frequency: 60, type: 'medium' },
                { duration: 60, frequency: 180, type: 'long' }
            ]
        };
        console.log('✅ AI: Cronograma personalizado gerado');
        return schedule;
    }
    async predictPerformance(userId, timeframe) {
        console.log('🔮 AI: Analisando performance preditiva para:', timeframe);
        const [studyPattern, subjectAnalysis] = await Promise.all([
            this.analyzeStudyPatterns(userId),
            this.analyzeSubjectPerformance(userId)
        ]);
        const baseImprovement = studyPattern.consistencyScore * 10;
        const subjectFactor = subjectAnalysis.reduce((acc, s) => acc + s.improvement, 0) / subjectAnalysis.length;
        const timeMultiplier = timeframe === 'week' ? 0.3 : timeframe === 'month' ? 1 : 3.5;
        const expectedImprovement = (baseImprovement + subjectFactor) * timeMultiplier;
        return {
            expectedImprovement: Math.max(0, expectedImprovement),
            confidenceLevel: studyPattern.consistencyScore * 0.8 + 0.2,
            criticalFactors: [
                'Consistência nos estudos',
                'Foco em pontos fracos',
                'Manutenção de horários otimais'
            ],
            recommendations: [
                'Mantenha regularidade nos estudos',
                'Priorize matérias com baixa performance',
                'Use intervalos regulares durante estudos'
            ]
        };
    }
    clearCache() {
        this.LEARNING_PATTERNS_CACHE.clear();
        this.ERROR_PATTERNS_CACHE.clear();
        console.log('🧹 AI: Cache de padrões limpo');
    }
}
exports.AIRecommendationService = AIRecommendationService;
exports.aiRecommendationService = new AIRecommendationService();
//# sourceMappingURL=AIRecommendationService.js.map