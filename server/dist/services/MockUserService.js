"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockUserDB = exports.MockUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const types_1 = require("../../../shared/dist/types");
class MockUserDatabase {
    constructor() {
        this.users = [];
        this.idCounter = 1;
        this.initializeSampleUsers().catch(console.error);
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
                level: 1,
                experience: 0,
                achievements: [],
                statistics: {
                    totalSimulations: 0,
                    totalQuestions: 0,
                    correctAnswers: 0,
                    averageScore: 0,
                    timeSpent: 0,
                    streakDays: 0
                },
                isEmailVerified: true,
                createdAt: new Date(),
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
                level: 2,
                experience: 150,
                achievements: [],
                statistics: {
                    totalSimulations: 5,
                    totalQuestions: 50,
                    correctAnswers: 35,
                    averageScore: 70,
                    timeSpent: 3600,
                    streakDays: 3
                },
                isEmailVerified: true,
                createdAt: new Date(),
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
                level: 1,
                experience: 0,
                achievements: [],
                statistics: {
                    totalSimulations: 0,
                    totalQuestions: 0,
                    correctAnswers: 0,
                    averageScore: 0,
                    timeSpent: 0,
                    streakDays: 0
                },
                isEmailVerified: true,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            this.users.push(testUser1, testUser2, mainUser);
            console.log('✅ MockDB: Usuários de exemplo criados:');
            console.log('  📧 joao@teste.com (senha: 123456)');
            console.log('  📧 maria@teste.com (senha: senha123)');
            console.log('  📧 allissonalvesvjt@gmail.com (senha: 123456)');
            console.log('👥 MockDB: Total de usuários:', this.users.length);
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
        const user = this.users.find((u) => String(u._id) === String(id));
        console.log('🔍 MockDB: Usuário encontrado:', user ? 'SIM' : 'NÃO');
        return user || null;
    }
    async findByIdAndUpdate(id, update) {
        console.log('🔄 MockDB: Atualizando usuário ID:', id);
        const userIndex = this.users.findIndex((u) => String(u._id) === String(id));
        if (userIndex === -1) {
            return null;
        }
        this.users[userIndex] = { ...this.users[userIndex], ...update, updatedAt: new Date() };
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
    async getAll() {
        return this.users;
    }
    async clear() {
        this.users = [];
        this.idCounter = 1;
        console.log('🗑️ MockDB: Banco de dados limpo');
    }
}
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
    }
};
exports.mockUserDB = mockUserDB;
//# sourceMappingURL=MockUserService.js.map