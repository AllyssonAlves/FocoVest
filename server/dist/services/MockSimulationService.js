"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockSimulationService = exports.mockSimulationService = void 0;
const types_1 = require("../../../shared/dist/types");
class MockSimulationService {
    constructor() {
        this.simulations = [];
        this.nextId = 1;
        this.initializeMockData();
    }
    initializeMockData() {
        this.nextId = 1;
        const mockSimulations = [
            {
                _id: this.generateId(),
                title: 'Simulado Geral - Vestibular UFC 2024',
                description: 'Simulado completo com questões das principais matérias cobradas no vestibular da UFC',
                createdBy: 'admin',
                settings: {
                    timeLimit: 180,
                    questionsCount: 30,
                    randomizeQuestions: true,
                    randomizeAlternatives: false,
                    showResultsImmediately: true,
                    allowReviewAnswers: true,
                    subjects: ['Matemática', 'Português', 'Física', 'Química', 'Biologia'],
                    universities: [types_1.University.UFC],
                    difficulty: ['easy', 'medium', 'hard']
                },
                status: 'active',
                questions: [
                    'mock_1', 'mock_2', 'mock_3', 'mock_4', 'mock_5',
                    'mock_6', 'mock_7', 'mock_8', 'mock_9', 'mock_10',
                    'mock_11', 'mock_12', 'mock_13', 'mock_14', 'mock_15',
                    'mock_16', 'mock_17', 'mock_18', 'mock_19', 'mock_20',
                    'mock_21', 'mock_22', 'mock_23', 'mock_24', 'mock_25',
                    'mock_26', 'mock_27', 'mock_28', 'mock_29', 'mock_30'
                ],
                isPublic: true,
                tags: ['vestibular', 'ufc', 'geral'],
                category: 'vestibular',
                estimatedDuration: 180,
                createdAt: new Date('2024-02-01'),
                updatedAt: new Date('2024-02-01')
            },
            {
                _id: this.generateId(),
                title: 'Matemática Intensivo - UECE',
                description: 'Foque nas questões de matemática mais difíceis da UECE',
                createdBy: 'admin',
                settings: {
                    timeLimit: 90,
                    questionsCount: 15,
                    randomizeQuestions: true,
                    randomizeAlternatives: false,
                    showResultsImmediately: true,
                    allowReviewAnswers: true,
                    subjects: ['Matemática'],
                    universities: [types_1.University.UECE],
                    difficulty: ['medium', 'hard']
                },
                status: 'active',
                questions: [
                    'mock_1', 'mock_5', 'mock_6', 'mock_7', 'mock_11',
                    'mock_12', 'mock_15', 'mock_16', 'mock_20', 'mock_21',
                    'mock_25', 'mock_26', 'mock_27', 'mock_28', 'mock_30'
                ],
                isPublic: true,
                tags: ['matemática', 'uece', 'difícil'],
                category: 'especifico',
                estimatedDuration: 90,
                createdAt: new Date('2024-02-05'),
                updatedAt: new Date('2024-02-05')
            },
            {
                _id: this.generateId(),
                title: 'Revisão Rápida - Física e Química',
                description: 'Revisão focada em conceitos fundamentais de Física e Química',
                createdBy: 'admin',
                settings: {
                    timeLimit: 60,
                    questionsCount: 10,
                    randomizeQuestions: false,
                    randomizeAlternatives: false,
                    showResultsImmediately: true,
                    allowReviewAnswers: true,
                    subjects: ['Física', 'Química'],
                    universities: [types_1.University.UVA, types_1.University.IFCE],
                    difficulty: ['easy', 'medium']
                },
                status: 'active',
                questions: [
                    'mock_3', 'mock_4', 'mock_8', 'mock_9', 'mock_13',
                    'mock_14', 'mock_17', 'mock_18', 'mock_22', 'mock_23'
                ],
                isPublic: true,
                tags: ['física', 'química', 'revisão'],
                category: 'revisao',
                estimatedDuration: 60,
                createdAt: new Date('2024-02-10'),
                updatedAt: new Date('2024-02-10')
            },
            {
                _id: this.generateId(),
                title: 'Português e Literatura - Preparatório',
                description: 'Simulado especializado em Português, Literatura e Interpretação de Texto',
                createdBy: 'admin',
                settings: {
                    timeLimit: 120,
                    questionsCount: 20,
                    randomizeQuestions: true,
                    randomizeAlternatives: false,
                    showResultsImmediately: false,
                    allowReviewAnswers: true,
                    subjects: ['Português'],
                    universities: [types_1.University.UFC, types_1.University.UECE],
                    difficulty: ['easy', 'medium', 'hard']
                },
                status: 'active',
                questions: [
                    'mock_2', 'mock_10', 'mock_19', 'mock_24', 'mock_29',
                    'mock_2', 'mock_10', 'mock_19', 'mock_24', 'mock_29',
                    'mock_2', 'mock_10', 'mock_19', 'mock_24', 'mock_29',
                    'mock_2', 'mock_10', 'mock_19', 'mock_24', 'mock_29'
                ],
                isPublic: true,
                tags: ['português', 'literatura', 'interpretação'],
                category: 'especifico',
                estimatedDuration: 120,
                createdAt: new Date('2024-02-12'),
                updatedAt: new Date('2024-02-12')
            },
            {
                _id: this.generateId(),
                title: 'Simulado Relâmpago - 30 Minutos',
                description: 'Teste rápido para praticar concentração e agilidade',
                createdBy: 'admin',
                settings: {
                    timeLimit: 30,
                    questionsCount: 8,
                    randomizeQuestions: true,
                    randomizeAlternatives: true,
                    showResultsImmediately: true,
                    allowReviewAnswers: false,
                    subjects: ['Matemática', 'Português', 'Física'],
                    difficulty: ['easy']
                },
                status: 'active',
                questions: [
                    'mock_1', 'mock_2', 'mock_3', 'mock_11', 'mock_12', 'mock_13', 'mock_21', 'mock_22'
                ],
                isPublic: true,
                tags: ['rápido', 'concentração', 'básico'],
                category: 'geral',
                estimatedDuration: 30,
                createdAt: new Date('2024-02-15'),
                updatedAt: new Date('2024-02-15')
            },
            {
                _id: this.generateId(),
                title: 'Biologia e Ciências da Natureza',
                description: 'Simulado completo focado em Biologia com questões atuais',
                createdBy: 'admin',
                settings: {
                    timeLimit: 100,
                    questionsCount: 12,
                    randomizeQuestions: false,
                    randomizeAlternatives: false,
                    showResultsImmediately: true,
                    allowReviewAnswers: true,
                    subjects: ['Biologia'],
                    universities: [types_1.University.URCA, types_1.University.UFC],
                    difficulty: ['medium', 'hard']
                },
                status: 'active',
                questions: [
                    'mock_5', 'mock_31', 'mock_32', 'mock_33', 'mock_34', 'mock_35',
                    'mock_5', 'mock_31', 'mock_32', 'mock_33', 'mock_34', 'mock_35'
                ],
                isPublic: true,
                tags: ['biologia', 'ciências', 'urca'],
                category: 'especifico',
                estimatedDuration: 100,
                createdAt: new Date('2024-02-18'),
                updatedAt: new Date('2024-02-18')
            },
            {
                _id: this.generateId(),
                title: 'ENEM 2024 - Simulado Completo',
                description: 'Simulado no formato oficial do ENEM com 180 questões divididas em duas aplicações',
                createdBy: 'admin',
                settings: {
                    timeLimit: 270,
                    questionsCount: 90,
                    randomizeQuestions: false,
                    randomizeAlternatives: false,
                    showResultsImmediately: false,
                    allowReviewAnswers: true,
                    subjects: ['Português', 'Literatura', 'História', 'Geografia', 'Filosofia', 'Sociologia', 'Inglês'],
                    universities: ['ENEM'],
                    difficulty: ['medium', 'hard']
                },
                status: 'active',
                questions: [
                    'mock_32', 'mock_33', 'mock_34', 'mock_35', 'mock_36', 'mock_37', 'mock_38', 'mock_1',
                    'mock_2', 'mock_3', 'mock_4', 'mock_5', 'mock_6', 'mock_7', 'mock_8', 'mock_9', 'mock_10', 'mock_11',
                    'mock_12', 'mock_13', 'mock_14', 'mock_15', 'mock_16', 'mock_17', 'mock_18', 'mock_19', 'mock_20', 'mock_21',
                    'mock_22', 'mock_23', 'mock_24', 'mock_25', 'mock_26', 'mock_27', 'mock_28', 'mock_29', 'mock_30', 'mock_31',
                    'mock_32', 'mock_33', 'mock_34', 'mock_35', 'mock_36', 'mock_37', 'mock_38', 'mock_1', 'mock_2', 'mock_3',
                    'mock_4', 'mock_5', 'mock_6', 'mock_7', 'mock_8', 'mock_9', 'mock_10', 'mock_11', 'mock_12', 'mock_13',
                    'mock_14', 'mock_15', 'mock_16', 'mock_17', 'mock_18', 'mock_19', 'mock_20', 'mock_21', 'mock_22', 'mock_23',
                    'mock_24', 'mock_25', 'mock_26', 'mock_27', 'mock_28', 'mock_29', 'mock_30', 'mock_31', 'mock_32', 'mock_33',
                    'mock_34', 'mock_35', 'mock_36', 'mock_37', 'mock_38', 'mock_1', 'mock_2', 'mock_3', 'mock_4', 'mock_5',
                    'mock_6', 'mock_7', 'mock_8', 'mock_9', 'mock_10', 'mock_11', 'mock_12', 'mock_13', 'mock_14', 'mock_15'
                ],
                isPublic: true,
                tags: ['enem', 'linguagens', 'humanas', 'oficial'],
                category: 'enem',
                estimatedDuration: 270,
                createdAt: new Date('2024-03-01'),
                updatedAt: new Date('2024-03-01')
            },
            {
                _id: this.generateId(),
                title: 'ENEM 2024 - Ciências da Natureza',
                description: 'Simulado focado em Ciências da Natureza e Matemática - 2º dia ENEM',
                createdBy: 'admin',
                settings: {
                    timeLimit: 300,
                    questionsCount: 90,
                    randomizeQuestions: false,
                    randomizeAlternatives: false,
                    showResultsImmediately: false,
                    allowReviewAnswers: true,
                    subjects: ['Matemática', 'Física', 'Química', 'Biologia'],
                    universities: ['ENEM'],
                    difficulty: ['medium', 'hard']
                },
                status: 'active',
                questions: [
                    'mock_32', 'mock_33', 'mock_34', 'mock_35', 'mock_36', 'mock_37', 'mock_38', 'mock_1', 'mock_3', 'mock_5',
                    'mock_7', 'mock_9', 'mock_11', 'mock_13', 'mock_15', 'mock_17', 'mock_19', 'mock_21', 'mock_23', 'mock_25',
                    'mock_27', 'mock_29', 'mock_31', 'mock_33', 'mock_35', 'mock_37', 'mock_2', 'mock_4', 'mock_6', 'mock_8',
                    'mock_10', 'mock_12', 'mock_14', 'mock_16', 'mock_18', 'mock_20', 'mock_22', 'mock_24', 'mock_26', 'mock_28',
                    'mock_30', 'mock_32', 'mock_34', 'mock_36', 'mock_38', 'mock_1', 'mock_2', 'mock_3', 'mock_4', 'mock_5',
                    'mock_6', 'mock_7', 'mock_8', 'mock_9', 'mock_10', 'mock_11', 'mock_12', 'mock_13', 'mock_14', 'mock_15',
                    'mock_16', 'mock_17', 'mock_18', 'mock_19', 'mock_20', 'mock_21', 'mock_22', 'mock_23', 'mock_24', 'mock_25',
                    'mock_26', 'mock_27', 'mock_28', 'mock_29', 'mock_30', 'mock_31', 'mock_32', 'mock_33', 'mock_34', 'mock_35',
                    'mock_36', 'mock_37', 'mock_38', 'mock_1', 'mock_3', 'mock_5', 'mock_7', 'mock_9', 'mock_11', 'mock_13',
                    'mock_15', 'mock_17', 'mock_19', 'mock_21', 'mock_23', 'mock_25', 'mock_27', 'mock_29', 'mock_31', 'mock_33'
                ],
                isPublic: true,
                tags: ['enem', 'ciências', 'matemática', 'oficial'],
                category: 'enem',
                estimatedDuration: 300,
                createdAt: new Date('2024-03-02'),
                updatedAt: new Date('2024-03-02')
            },
            {
                _id: this.generateId(),
                title: 'ENEM Express - Revisão Rápida',
                description: 'Simulado ENEM com questões selecionadas dos principais temas cobrados',
                createdBy: 'admin',
                settings: {
                    timeLimit: 120,
                    questionsCount: 45,
                    randomizeQuestions: true,
                    randomizeAlternatives: false,
                    showResultsImmediately: true,
                    allowReviewAnswers: true,
                    subjects: ['Matemática', 'Português', 'História', 'Geografia', 'Física', 'Química', 'Biologia'],
                    universities: ['ENEM'],
                    difficulty: ['medium']
                },
                status: 'active',
                questions: [
                    'mock_32', 'mock_33', 'mock_34', 'mock_35', 'mock_36', 'mock_37', 'mock_38', 'mock_1',
                    'mock_5', 'mock_10', 'mock_15', 'mock_20', 'mock_25', 'mock_30', 'mock_2', 'mock_7',
                    'mock_12', 'mock_17', 'mock_22', 'mock_27', 'mock_32', 'mock_3', 'mock_8', 'mock_13',
                    'mock_18', 'mock_23', 'mock_28', 'mock_33', 'mock_4', 'mock_9', 'mock_14', 'mock_19',
                    'mock_24', 'mock_29', 'mock_34', 'mock_6', 'mock_11', 'mock_16', 'mock_21', 'mock_26',
                    'mock_31', 'mock_36', 'mock_37', 'mock_38', 'mock_35'
                ],
                isPublic: true,
                tags: ['enem', 'revisão', 'rápido', 'temas-principais'],
                category: 'revisao',
                estimatedDuration: 120,
                createdAt: new Date('2024-03-05'),
                updatedAt: new Date('2024-03-05')
            },
            {
                _id: this.generateId(),
                title: 'ENEM - Redação e Linguagens',
                description: 'Foco nas competências de Linguagens, Códigos e suas Tecnologias',
                createdBy: 'admin',
                settings: {
                    timeLimit: 90,
                    questionsCount: 30,
                    randomizeQuestions: false,
                    randomizeAlternatives: false,
                    showResultsImmediately: true,
                    allowReviewAnswers: true,
                    subjects: ['Português', 'Literatura', 'Inglês', 'Artes'],
                    universities: ['ENEM'],
                    difficulty: ['medium', 'hard']
                },
                status: 'active',
                questions: [
                    'mock_32', 'mock_33', 'mock_34', 'mock_35', 'mock_2', 'mock_10', 'mock_19', 'mock_24',
                    'mock_29', 'mock_4', 'mock_9', 'mock_14', 'mock_21', 'mock_26', 'mock_31', 'mock_36',
                    'mock_37', 'mock_38', 'mock_1', 'mock_3', 'mock_5', 'mock_7', 'mock_11', 'mock_13',
                    'mock_15', 'mock_17', 'mock_20', 'mock_22', 'mock_25', 'mock_28'
                ],
                isPublic: true,
                tags: ['enem', 'linguagens', 'redação', 'interpretação'],
                category: 'especifico',
                estimatedDuration: 90,
                createdAt: new Date('2024-03-08'),
                updatedAt: new Date('2024-03-08')
            }
        ];
        this.simulations = mockSimulations;
        console.log(`🎯 MockDB Simulations: Inicializados ${this.simulations.length} simulados`);
        console.log(`📋 IDs disponíveis: ${this.simulations.map(s => s._id).join(', ')}`);
    }
    generateId() {
        return `${this.nextId++}`;
    }
    async getSimulations(filters = {}) {
        let filteredSimulations = this.simulations.filter(s => s.status !== 'draft');
        if (filters.category) {
            filteredSimulations = filteredSimulations.filter(s => s.category === filters.category);
        }
        if (filters.subjects && filters.subjects.length > 0) {
            filteredSimulations = filteredSimulations.filter(s => filters.subjects.some(subject => s.settings.subjects?.includes(subject)));
        }
        if (filters.universities && filters.universities.length > 0) {
            filteredSimulations = filteredSimulations.filter(s => filters.universities.some(university => s.settings.universities?.includes(university)));
        }
        if (filters.difficulty && filters.difficulty.length > 0) {
            filteredSimulations = filteredSimulations.filter(s => filters.difficulty.some(diff => s.settings.difficulty?.includes(diff)));
        }
        if (filters.status) {
            filteredSimulations = filteredSimulations.filter(s => s.status === filters.status);
        }
        if (filters.isPublic !== undefined) {
            filteredSimulations = filteredSimulations.filter(s => s.isPublic === filters.isPublic);
        }
        if (filters.createdBy) {
            filteredSimulations = filteredSimulations.filter(s => s.createdBy === filters.createdBy);
        }
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedSimulations = filteredSimulations.slice(startIndex, endIndex);
        const totalPages = Math.ceil(filteredSimulations.length / limit);
        return {
            simulations: paginatedSimulations,
            currentPage: page,
            totalPages,
            totalSimulations: filteredSimulations.length,
            hasNext: page < totalPages,
            hasPrev: page > 1
        };
    }
    async getSimulationById(id) {
        const simulation = this.simulations.find(s => s._id === id);
        if (!simulation) {
            throw new Error('Simulado não encontrado');
        }
        return simulation;
    }
    async startSimulation(simulationId, userId) {
        const simulation = await this.getSimulationById(simulationId);
        simulation.currentSession = {
            userId,
            startedAt: new Date(),
            lastActivityAt: new Date(),
            currentQuestionIndex: 0,
            userAnswers: [],
            timeRemaining: simulation.settings.timeLimit * 60,
            isPaused: false
        };
        simulation.status = 'active';
        simulation.updatedAt = new Date();
        console.log(`🎮 MockDB: Simulado iniciado: ${simulation.title} por usuário ${userId}`);
        return simulation;
    }
    async submitAnswer(simulationId, userId, questionIndex, answer) {
        const simulation = await this.getSimulationById(simulationId);
        if (!simulation.currentSession || simulation.currentSession.userId !== userId) {
            throw new Error('Sessão inválida');
        }
        const existingAnswerIndex = simulation.currentSession.userAnswers.findIndex((ua) => ua.questionId === simulation.questions[questionIndex]);
        const userAnswer = {
            questionId: simulation.questions[questionIndex],
            userAnswer: answer,
            timeSpent: 60
        };
        if (existingAnswerIndex >= 0) {
            simulation.currentSession.userAnswers[existingAnswerIndex] = userAnswer;
        }
        else {
            simulation.currentSession.userAnswers.push(userAnswer);
        }
        simulation.currentSession.lastActivityAt = new Date();
        simulation.updatedAt = new Date();
        console.log(`📝 MockDB: Resposta submetida para simulado ${simulationId}`);
        return simulation;
    }
    async completeSimulation(simulationId, userId) {
        const simulation = await this.getSimulationById(simulationId);
        if (!simulation.currentSession || simulation.currentSession.userId !== userId) {
            throw new Error('Sessão inválida');
        }
        const totalQuestions = simulation.questions.length;
        const answeredQuestions = simulation.currentSession.userAnswers.length;
        const correctAnswers = Math.floor(answeredQuestions * 0.7);
        const accuracy = (correctAnswers / totalQuestions) * 100;
        const score = Math.round(accuracy);
        const result = {
            score,
            correctAnswers,
            totalQuestions,
            accuracy,
            totalTimeSpent: (simulation.settings.timeLimit * 60) - simulation.currentSession.timeRemaining,
            averageTimePerQuestion: ((simulation.settings.timeLimit * 60) - simulation.currentSession.timeRemaining) / answeredQuestions,
            completedAt: new Date(),
            questionsBreakdown: simulation.currentSession.userAnswers
        };
        simulation.result = result;
        simulation.status = 'completed';
        simulation.currentSession = undefined;
        simulation.updatedAt = new Date();
        console.log(`🎉 MockDB: Simulado concluído: ${simulation.title} - Score: ${score}%`);
        return simulation;
    }
    async pauseSimulation(simulationId, userId) {
        const simulation = await this.getSimulationById(simulationId);
        if (!simulation.currentSession || simulation.currentSession.userId !== userId) {
            throw new Error('Sessão inválida');
        }
        simulation.currentSession.isPaused = true;
        simulation.status = 'paused';
        simulation.updatedAt = new Date();
        console.log(`⏸️ MockDB: Simulado pausado: ${simulation.title}`);
        return simulation;
    }
    async resumeSimulation(simulationId, userId) {
        const simulation = await this.getSimulationById(simulationId);
        if (!simulation.currentSession || simulation.currentSession.userId !== userId) {
            throw new Error('Sessão inválida');
        }
        simulation.currentSession.isPaused = false;
        simulation.status = 'active';
        simulation.currentSession.lastActivityAt = new Date();
        simulation.updatedAt = new Date();
        console.log(`▶️ MockDB: Simulado retomado: ${simulation.title}`);
        return simulation;
    }
    async getSimulationStats() {
        const total = this.simulations.length;
        const active = this.simulations.filter(s => s.status === 'active').length;
        const completed = this.simulations.filter(s => s.status === 'completed').length;
        const byCategory = {
            geral: this.simulations.filter(s => s.category === 'geral').length,
            especifico: this.simulations.filter(s => s.category === 'especifico').length,
            revisao: this.simulations.filter(s => s.category === 'revisao').length,
            vestibular: this.simulations.filter(s => s.category === 'vestibular').length
        };
        return {
            total,
            active,
            completed,
            byCategory
        };
    }
    async getUserSimulations(userId) {
        return this.simulations.filter(s => s.createdBy === userId ||
            (s.currentSession && s.currentSession.userId === userId) ||
            (s.result && s.result.questionsBreakdown?.length > 0));
    }
    async createSimulation(data) {
        const newSimulation = {
            _id: this.generateId(),
            title: data.title,
            description: data.description || '',
            createdBy: data.createdBy,
            settings: {
                timeLimit: data.settings.timeLimit || 60,
                questionsCount: data.settings.questionsCount || 20,
                randomizeQuestions: data.settings.randomizeQuestions ?? true,
                randomizeAlternatives: data.settings.randomizeAlternatives ?? false,
                showResultsImmediately: data.settings.showResultsImmediately ?? true,
                allowReviewAnswers: data.settings.allowReviewAnswers ?? true,
                subjects: data.settings.subjects || [],
                universities: data.settings.universities || [],
                difficulty: data.settings.difficulty || ['easy', 'medium']
            },
            status: 'draft',
            questions: [],
            isPublic: data.isPublic ?? false,
            tags: data.tags || [],
            category: data.category || 'geral',
            estimatedDuration: data.settings.timeLimit || 60,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const availableQuestions = Array.from({ length: 30 }, (_, i) => `mock_${i + 1}`);
        const selectedQuestions = availableQuestions
            .slice(0, Math.min(newSimulation.settings.questionsCount, availableQuestions.length));
        newSimulation.questions = selectedQuestions;
        this.simulations.push(newSimulation);
        console.log(`✅ MockDB: Simulado criado: ${newSimulation.title} (ID: ${newSimulation._id})`);
        console.log(`📋 Configurações:`, {
            questões: newSimulation.settings.questionsCount,
            tempo: newSimulation.settings.timeLimit + 'min',
            matérias: newSimulation.settings.subjects,
            universidades: newSimulation.settings.universities
        });
        return newSimulation;
    }
}
exports.MockSimulationService = MockSimulationService;
const mockSimulationService = new MockSimulationService();
exports.mockSimulationService = mockSimulationService;
//# sourceMappingURL=MockSimulationService.js.map