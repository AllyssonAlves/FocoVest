import { IUser } from '../models/User'
import bcrypt from 'bcryptjs'
import { University, UserRole } from '../../../shared/dist/types'

// Mock database em memória para desenvolvimento sem MongoDB
class MockUserDatabase {
  private users: any[] = []
  private idCounter = 1

  constructor() {
    // Inicializar com usuários de exemplo para desenvolvimento
    this.initializeSampleUsers().catch(console.error)
  }

  private async generateAdditionalUsers() {
    const users = []
    const names = ['Ana Costa', 'Carlos Lima', 'Julia Rodrigues', 'Pedro Oliveira', 'Beatriz Ferreira', 
                  'Marcos Souza', 'Larissa Almeida', 'Rafael Santos', 'Gabriela Silva', 'Thiago Pereira',
                  'Isabella Martins', 'Lucas Araújo', 'Camila Rocha', 'Felipe Nascimento', 'Sophia Carvalho']
    
    const universities = [University.UFC, University.UECE, University.UVA, University.URCA]
    const courses = ['Medicina', 'Engenharia', 'Direito', 'Administração', 'Psicologia', 'Educação Física']
    
    for (let i = 0; i < 15; i++) {
      const hashedPassword = await bcrypt.hash('123456', 12)
      const university = universities[Math.floor(Math.random() * universities.length)]
      const course = courses[Math.floor(Math.random() * courses.length)]
      
      // Gerar estatísticas variadas
      const totalSimulations = Math.floor(Math.random() * 50) + 5 // 5-55
      const totalQuestions = totalSimulations * 30 + Math.floor(Math.random() * 200) // Variação
      const correctRate = 0.4 + Math.random() * 0.5 // 40% a 90%
      const correctAnswers = Math.floor(totalQuestions * correctRate)
      const averageScore = Math.floor(correctRate * 100)
      const timeSpent = totalSimulations * 300 + Math.floor(Math.random() * 3600) // ~5 min por sim + variação
      
      const user = {
        _id: String(this.idCounter++),
        name: names[i],
        email: `user${i + 4}@teste.com`,
        password: hashedPassword,
        university,
        course,
        role: UserRole.STUDENT,
        level: Math.floor(averageScore / 20) + 1, // Nível baseado na performance
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
      }
      
      users.push(user)
    }
    
    return users
  }

  private async initializeSampleUsers() {
    try {
      console.log('🎯 MockDB: Inicializando usuários de exemplo...')
      
      // Usuário de teste 1
      const hashedPassword1 = await bcrypt.hash('123456', 12)
      const testUser1 = {
        _id: String(this.idCounter++),
        name: 'João Silva',
        email: 'joao@teste.com',
        password: hashedPassword1,
        university: University.UFC,
        course: 'Engenharia',
        role: UserRole.STUDENT,
        level: 3,
        experience: 2580,
        achievements: [],
        statistics: {
          totalSimulations: 15,
          totalQuestions: 450,
          correctAnswers: 315,
          averageScore: 70,
          timeSpent: 7200, // 2 horas em segundos
          streakDays: 5,
          lastSimulationDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // ontem
        },
        isEmailVerified: true,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 dias atrás
        updatedAt: new Date()
      }

      // Usuário de teste 2
      const hashedPassword2 = await bcrypt.hash('senha123', 12)
      const testUser2 = {
        _id: String(this.idCounter++),
        name: 'Maria Santos',
        email: 'maria@teste.com',
        password: hashedPassword2,
        university: University.UECE,
        course: 'Medicina',
        role: UserRole.STUDENT,
        level: 4,
        experience: 3890,
        achievements: [],
        statistics: {
          totalSimulations: 25,
          totalQuestions: 750,
          correctAnswers: 630,
          averageScore: 84,
          timeSpent: 12600, // 3.5 horas em segundos
          streakDays: 12,
          lastSimulationDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 horas atrás
        },
        isEmailVerified: true,
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 dias atrás
        updatedAt: new Date()
      }

      // Usuário principal (desenvolvedor)
      const hashedPassword3 = await bcrypt.hash('123456', 12)
      const mainUser = {
        _id: String(this.idCounter++),
        name: 'Allisson Alves',
        email: 'allissonalvesvjt@gmail.com',
        password: hashedPassword3,
        university: University.UFC,
        course: 'Desenvolvimento de Software',
        role: UserRole.STUDENT,
        level: 5,
        experience: 4750,
        achievements: [],
        statistics: {
          totalSimulations: 35,
          totalQuestions: 1050,
          correctAnswers: 892,
          averageScore: 85,
          timeSpent: 18900, // 5.25 horas em segundos
          streakDays: 8,
          lastSimulationDate: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutos atrás
        },
        isEmailVerified: true,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 dias atrás
        updatedAt: new Date()
      }

      // Adicionar mais usuários para comparação
      const additionalUsers = await this.generateAdditionalUsers()
      
      this.users.push(testUser1, testUser2, mainUser, ...additionalUsers)
      console.log('✅ MockDB: Usuários de exemplo criados:')
      console.log('  📧 joao@teste.com (senha: 123456)')
      console.log('  📧 maria@teste.com (senha: senha123)')
      console.log('  📧 allissonalvesvjt@gmail.com (senha: 123456)')
      console.log(`👥 MockDB: Total de usuários: ${this.users.length}`)
      console.log(`📊 MockDB: Usuários por universidade:`)
      console.log(`  - UFC: ${this.users.filter(u => u.university === University.UFC).length}`)
      console.log(`  - UECE: ${this.users.filter(u => u.university === University.UECE).length}`)
      console.log(`  - UVA: ${this.users.filter(u => u.university === University.UVA).length}`)
      console.log(`  - URCA: ${this.users.filter(u => u.university === University.URCA).length}`)
      
    } catch (error) {
      console.error('❌ Erro ao inicializar usuários de exemplo:', error)
    }
  }

  async findOne(query: any): Promise<any> {
    console.log('🔍 MockDB: Buscando usuário com query:', query)
    
    if (query.email) {
      const user = this.users.find(u => u.email === query.email)
      console.log('🔍 MockDB: Usuário encontrado:', user ? 'SIM' : 'NÃO')
      return user || null
    }
    
    if (query._id || query.id) {
      const id = query._id || query.id
      const user = this.users.find((u: any) => String(u._id) === String(id))
      return user || null
    }
    
    return null
  }

  async findById(id: string): Promise<any> {
    console.log('🔍 MockDB: Buscando usuário por ID:', id)
    console.log('📋 MockDB: IDs disponíveis na busca:')
    this.users.forEach((u, index) => {
      console.log(`  - Usuário ${index}: ID="${u._id}" (tipo: ${typeof u._id}), Email: ${u.email}`)
    })
    
    const user = this.users.find((u: any) => String(u._id) === String(id))
    console.log('🔍 MockDB: Usuário encontrado:', user ? 'SIM' : 'NÃO')
    if (user) {
      console.log('✅ MockDB: Dados do usuário encontrado:', { id: user._id, email: user.email, name: user.name })
    } else {
      console.log('❌ MockDB: Nenhum usuário corresponde ao ID:', id)
    }
    return user || null
  }

  async findByIdAndUpdate(id: string, update: any): Promise<any> {
    console.log('🔄 MockDB: Atualizando usuário ID:', id, 'com dados:', update)
    const userIndex = this.users.findIndex((u: any) => String(u._id) === String(id))
    
    if (userIndex === -1) {
      console.log('❌ MockDB: Usuário não encontrado com ID:', id)
      return null
    }
    
    const oldName = this.users[userIndex].name
    this.users[userIndex] = { ...this.users[userIndex], ...update, updatedAt: new Date() }
    console.log('✅ MockDB: Usuário atualizado - Nome anterior:', oldName, '-> Novo nome:', this.users[userIndex].name)
    return this.users[userIndex]
  }

  async save(userData: any): Promise<any> {
    console.log('💾 MockDB: Salvando usuário:', userData.email)
    
    // Verificar se usuário já existe
    const existingUser = await this.findOne({ email: userData.email })
    if (existingUser) {
      throw new Error('Email já está em uso')
    }

    // Hash da senha se fornecida
    let hashedPassword = userData.password
    if (userData.password) {
      hashedPassword = await bcrypt.hash(userData.password, 12)
    }

    // Criar novo usuário
    const newUser = {
      _id: String(this.idCounter++),
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      avatar: userData.avatar,
      university: userData.university,
      course: userData.course,
      graduationYear: userData.graduationYear,
      role: userData.role || UserRole.STUDENT,
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
    }

    this.users.push(newUser)
    console.log('✅ MockDB: Usuário salvo com ID:', newUser._id)
    console.log('👥 MockDB: Total de usuários:', this.users.length)
    
    return newUser
  }

  async create(userData: any): Promise<any> {
    return this.save(userData)
  }

  // Métodos para ranking
  getAllUsers(): any[] {
    return [...this.users] // Retorna cópia para evitar mutação
  }

  getUserById(id: string): any | null {
    return this.users.find((u: any) => String(u._id) === String(id)) || null
  }

  async getAll(): Promise<any[]> {
    return this.users
  }

  async clear(): Promise<void> {
    this.users = []
    this.idCounter = 1
    console.log('🗑️ MockDB: Banco de dados limpo')
  }
}

// Instância singleton
const MockUser = new MockUserDatabase()

// Função de compatibilidade para criar usuários
const mockUserDB = {
  create: async (userData: any) => {
    return MockUser.create(userData)
  },
  findOne: async (query: any) => {
    return MockUser.findOne(query)
  },
  findById: async (id: string) => {
    return MockUser.findById(id)
  },
  findByIdAndUpdate: async (id: string, update: any) => {
    return MockUser.findByIdAndUpdate(id, update)
  },
  getAllUsers: () => {
    return MockUser.getAllUsers()
  },
  getUserById: (id: string) => {
    return MockUser.getUserById(id)
  }
}

export { MockUser, mockUserDB, MockUserDatabase }