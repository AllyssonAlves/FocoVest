"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockUserDatabase = exports.mockUserDB = exports.MockUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const types_1 = require("../../../shared/dist/types");
class MockUserDatabase {
    constructor() {
        this.users = [];
        this.idCounter = 1;
        this.initializeSampleUsers().catch(console.error);
    }
    async generateAdditionalUsers() {
        const users = [];
        const names = ['Ana Costa', 'Carlos Lima', 'Julia Rodrigues', 'Pedro Oliveira', 'Beatriz Ferreira',
            'Marcos Souza', 'Larissa Almeida', 'Rafael Santos', 'Gabriela Silva', 'Thiago Pereira',
            'Isabella Martins', 'Lucas Araújo', 'Camila Rocha', 'Felipe Nascimento', 'Sophia Carvalho'];
        const universities = [types_1.University.UFC, types_1.University.UECE, types_1.University.UVA, types_1.University.URCA];
        const courses = ['Medicina', 'Engenharia', 'Direito', 'Administração', 'Psicologia', 'Educação Física'];
        for (let i = 0; i < 15; i++) {
            const hashedPassword = await bcryptjs_1.default.hash('123456', 12);
            const university = universities[Math.floor(Math.random() * universities.length)];
            const course = courses[Math.floor(Math.random() * courses.length)];
            const totalSimulations = Math.floor(Math.random() * 50) + 5;
            const totalQuestions = totalSimulations * 30 + Math.floor(Math.random() * 200);
            const correctRate = 0.4 + Math.random() * 0.5;
            const correctAnswers = Math.floor(totalQuestions * correctRate);
            const averageScore = Math.floor(correctRate * 100);
            const timeSpent = totalSimulations * 300 + Math.floor(Math.random() * 3600);
            const user = {
                _id: String(this.idCounter++),
                name: names[i],
                email: `user${i + 4}@teste.com`,
                password: hashedPassword,
                university,
                course,
                role: types_1.UserRole.STUDENT,
                level: Math.floor(averageScore / 20) + 1,
                experience: averageScore * 10 + Math.floor(Math.random() * 500),
                achievements: [],
                statistics: {
                    totalSimulations,
                    totalQuestions,
                    correctAnswers,
                    averageScore,
                    timeSpent,
                    streakDays: Math.floor(Math.random() * 15),
                    lastSimulationDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
                },
                isEmailVerified: true,
                createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
                updatedAt: new Date()
            };
            users.push(user);
        }
        return users;
    }
    async initializeSampleUsers() {
        try {
            console.log('🎯 MockDB: Inicializando usuários de exemplo...');
            const hashedPassword1 = await bcryptjs_1.default.hash('123456', 12);
            const testUser1 = {
                _id: String(this.idCounter++),
                name: 'João Silva',
                email: 'joao@teste.com',
                password: hashedPassword1,
                university: types_1.University.UFC,
                course: 'Engenharia',
                role: types_1.UserRole.STUDENT,
                level: 3,
                experience: 2580,
                achievements: [],
                statistics: {
                    totalSimulations: 15,
                    totalQuestions: 450,
                    correctAnswers: 315,
                    averageScore: 70,
                    timeSpent: 7200,
                    streakDays: 5,
                    lastSimulationDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
                },
                isEmailVerified: true,
                createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                updatedAt: new Date()
            };
            const hashedPassword2 = await bcryptjs_1.default.hash('senha123', 12);
            const testUser2 = {
                _id: String(this.idCounter++),
                name: 'Maria Santos',
                email: 'maria@teste.com',
                password: hashedPassword2,
                university: types_1.University.UECE,
                course: 'Medicina',
                role: types_1.UserRole.STUDENT,
                level: 4,
                experience: 3890,
                achievements: [],
                statistics: {
                    totalSimulations: 25,
                    totalQuestions: 750,
                    correctAnswers: 630,
                    averageScore: 84,
                    timeSpent: 12600,
                    streakDays: 12,
                    lastSimulationDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
                },
                isEmailVerified: true,
                createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
                updatedAt: new Date()
            };
            const hashedPassword3 = await bcryptjs_1.default.hash('123456', 12);
            const mainUser = {
                _id: String(this.idCounter++),
                name: 'Allisson Alves',
                email: 'allissonalvesvjt@gmail.com',
                password: hashedPassword3,
                university: types_1.University.UFC,
                course: 'Desenvolvimento de Software',
                role: types_1.UserRole.STUDENT,
                level: 5,
                experience: 4750,
                achievements: [],
                statistics: {
                    totalSimulations: 35,
                    totalQuestions: 1050,
                    correctAnswers: 892,
                    averageScore: 85,
                    timeSpent: 18900,
                    streakDays: 8,
                    lastSimulationDate: new Date(Date.now() - 30 * 60 * 1000).toISOString()
                },
                isEmailVerified: true,
                createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
                updatedAt: new Date()
            };
            const additionalUsers = await this.generateAdditionalUsers();
            this.users.push(testUser1, testUser2, mainUser, ...additionalUsers);
            console.log('✅ MockDB: Usuários de exemplo criados:');
            console.log('  📧 joao@teste.com (senha: 123456)');
            console.log('  📧 maria@teste.com (senha: senha123)');
            console.log('  📧 allissonalvesvjt@gmail.com (senha: 123456)');
            console.log(`👥 MockDB: Total de usuários: ${this.users.length}`);
            console.log(`📊 MockDB: Usuários por universidade:`);
            console.log(`  - UFC: ${this.users.filter(u => u.university === types_1.University.UFC).length}`);
            console.log(`  - UECE: ${this.users.filter(u => u.university === types_1.University.UECE).length}`);
            console.log(`  - UVA: ${this.users.filter(u => u.university === types_1.University.UVA).length}`);
            console.log(`  - URCA: ${this.users.filter(u => u.university === types_1.University.URCA).length}`);
        }
        catch (error) {
            console.error('❌ Erro ao inicializar usuários de exemplo:', error);
        }
    }
    async findOne(query) {
        console.log('🔍 MockDB: Buscando usuário com query:', query);
        if (query.email) {
            const user = this.users.find(u => u.email === query.email);
            console.log('🔍 MockDB: Usuário encontrado:', user ? 'SIM' : 'NÃO');
            return user || null;
        }
        if (query._id || query.id) {
            const id = query._id || query.id;
            const user = this.users.find((u) => String(u._id) === String(id));
            return user || null;
        }
        return null;
    }
    async findById(id) {
        console.log('🔍 MockDB: Buscando usuário por ID:', id);
        console.log('📋 MockDB: IDs disponíveis na busca:');
        this.users.forEach((u, index) => {
            console.log(`  - Usuário ${index}: ID="${u._id}" (tipo: ${typeof u._id}), Email: ${u.email}`);
        });
        const user = this.users.find((u) => String(u._id) === String(id));
        console.log('🔍 MockDB: Usuário encontrado:', user ? 'SIM' : 'NÃO');
        if (user) {
            console.log('✅ MockDB: Dados do usuário encontrado:', { id: user._id, email: user.email, name: user.name });
        }
        else {
            console.log('❌ MockDB: Nenhum usuário corresponde ao ID:', id);
        }
        return user || null;
    }
    async findByIdAndUpdate(id, update) {
        console.log('🔄 MockDB: Atualizando usuário ID:', id, 'com dados:', update);
        const userIndex = this.users.findIndex((u) => String(u._id) === String(id));
        if (userIndex === -1) {
            console.log('❌ MockDB: Usuário não encontrado com ID:', id);
            return null;
        }
        const oldName = this.users[userIndex].name;
        this.users[userIndex] = { ...this.users[userIndex], ...update, updatedAt: new Date() };
        console.log('✅ MockDB: Usuário atualizado - Nome anterior:', oldName, '-> Novo nome:', this.users[userIndex].name);
        return this.users[userIndex];
    }
    async save(userData) {
        console.log('💾 MockDB: Salvando usuário:', userData.email);
        const existingUser = await this.findOne({ email: userData.email });
        if (existingUser) {
            throw new Error('Email já está em uso');
        }
        let hashedPassword = userData.password;
        if (userData.password) {
            hashedPassword = await bcryptjs_1.default.hash(userData.password, 12);
        }
        const newUser = {
            _id: String(this.idCounter++),
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            avatar: userData.avatar,
            university: userData.university,
            course: userData.course,
            graduationYear: userData.graduationYear,
            role: userData.role || types_1.UserRole.STUDENT,
            level: userData.level || 1,
            experience: userData.experience || 0,
            achievements: userData.achievements || [],
            statistics: userData.statistics || {
                totalSimulations: 0,
                totalQuestions: 0,
                correctAnswers: 0,
                averageScore: 0,
                timeSpent: 0,
                streakDays: 0
            },
            isEmailVerified: userData.isEmailVerified || false,
            emailVerificationToken: userData.emailVerificationToken,
            passwordResetToken: userData.passwordResetToken,
            passwordResetExpires: userData.passwordResetExpires,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.users.push(newUser);
        console.log('✅ MockDB: Usuário salvo com ID:', newUser._id);
        console.log('👥 MockDB: Total de usuários:', this.users.length);
        return newUser;
    }
    async create(userData) {
        return this.save(userData);
    }
    getAllUsers() {
        return [...this.users];
    }
    getUserById(id) {
        return this.users.find((u) => String(u._id) === String(id)) || null;
    }
    async getAll() {
        return this.users;
    }
    async clear() {
        this.users = [];
        this.idCounter = 1;
        console.log('🗑️ MockDB: Banco de dados limpo');
    }
}
exports.MockUserDatabase = MockUserDatabase;
const MockUser = new MockUserDatabase();
exports.MockUser = MockUser;
const mockUserDB = {
    create: async (userData) => {
        return MockUser.create(userData);
    },
    findOne: async (query) => {
        return MockUser.findOne(query);
    },
    findById: async (id) => {
        return MockUser.findById(id);
    },
    findByIdAndUpdate: async (id, update) => {
        return MockUser.findByIdAndUpdate(id, update);
    },
    getAllUsers: () => {
        return MockUser.getAllUsers();
    },
    getUserById: (id) => {
        return MockUser.getUserById(id);
    }
};
exports.mockUserDB = mockUserDB;
//# sourceMappingURL=MockUserService.js.map