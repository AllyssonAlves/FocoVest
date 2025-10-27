"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const advancedSecurity_1 = require("./middleware/advancedSecurity");
const secureValidation_1 = require("./middleware/secureValidation");
const AuthService_1 = require("./services/AuthService");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/focovest';
(0, advancedSecurity_1.setupSecurity)(app, {
    enableCSRF: true,
    enableRateLimit: true,
    enableSlowDown: true,
    enableFingerprinting: true,
    allowedOrigins: [
        'http://localhost:3000',
        'https://focovest.com',
        ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
    ],
    trustedProxies: ['127.0.0.1', '::1']
});
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
const authRateLimit = (0, advancedSecurity_1.createRateLimit)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Muitas tentativas de autenticação. Tente novamente em 15 minutos.'
});
const registerRateLimit = (0, advancedSecurity_1.createRateLimit)({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: 'Muitos registros. Tente novamente em 1 hora.'
});
app.post('/api/auth/login', authRateLimit, [advancedSecurity_1.validators.email, advancedSecurity_1.validators.password], advancedSecurity_1.handleValidationErrors, async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('🔐 Tentativa de login:', {
            email,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString(),
            fingerprint: req.fingerprint
        });
        const authResult = await AuthService_1.AuthService.login({ email, password });
        if (authResult.success && authResult.data) {
            console.log('✅ Login realizado com sucesso:', {
                email,
                userId: authResult.data.user._id,
                timestamp: new Date().toISOString()
            });
            return res.json({
                success: true,
                token: authResult.data.token,
                user: authResult.data.user,
                expiresIn: 24 * 60 * 60 * 1000
            });
        }
        else {
            console.warn('🚨 Login falhado:', {
                email,
                error: authResult.message,
                ip: req.ip,
                timestamp: new Date().toISOString()
            });
            return res.status(401).json({
                error: 'Email ou senha incorretos',
                code: 'INVALID_CREDENTIALS'
            });
        }
    }
    catch (error) {
        console.error('❌ Erro no login:', error);
        return res.status(500).json({
            error: 'Erro interno do servidor',
            code: 'INTERNAL_ERROR'
        });
    }
});
app.post('/api/auth/register', registerRateLimit, [
    advancedSecurity_1.validators.email,
    advancedSecurity_1.validators.password,
    advancedSecurity_1.validators.name,
    advancedSecurity_1.validators.university
], advancedSecurity_1.handleValidationErrors, async (req, res) => {
    try {
        const { email, password, name, university } = req.body;
        console.log('📝 Tentativa de registro:', {
            email,
            name,
            university,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString(),
            fingerprint: req.fingerprint
        });
        const registerResult = await AuthService_1.AuthService.register({
            email,
            password,
            name,
            university
        });
        if (registerResult.success && registerResult.data) {
            console.log('✅ Usuário registrado com sucesso:', {
                userId: registerResult.data.user._id,
                email: registerResult.data.user.email,
                timestamp: new Date().toISOString()
            });
            return res.status(201).json({
                success: true,
                message: 'Usuário criado com sucesso',
                user: registerResult.data.user,
                token: registerResult.data.token
            });
        }
        else {
            return res.status(400).json({
                error: registerResult.message || 'Erro ao criar usuário',
                code: 'REGISTRATION_FAILED'
            });
        }
    }
    catch (error) {
        console.error('❌ Erro no registro:', error);
        return res.status(500).json({
            error: 'Erro interno do servidor',
            code: 'INTERNAL_ERROR'
        });
    }
});
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                error: 'Token de acesso requerido',
                code: 'TOKEN_REQUIRED'
            });
        }
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        const User = require('./models/User').default;
        const MockUser = require('./services/MockUserService').MockUser;
        const UserModel = process.env.NODE_ENV === 'production' ? User : MockUser;
        const user = await UserModel.findById(decoded.id);
        if (!user) {
            return res.status(403).json({
                error: 'Token inválido - usuário não encontrado',
                code: 'INVALID_TOKEN'
            });
        }
        req.user = {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            university: user.university
        };
        next();
    }
    catch (error) {
        console.error('❌ Erro na autenticação do token:', error);
        return res.status(403).json({
            error: 'Token inválido',
            code: 'INVALID_TOKEN'
        });
    }
};
app.get('/api/auth/validate', authenticateToken, (req, res) => {
    res.json({
        valid: true,
        user: req.user
    });
});
app.post('/api/auth/logout', authenticateToken, (req, res) => {
    console.log('🚪 Logout realizado:', {
        userId: req.user.id,
        ip: req.ip,
        timestamp: new Date().toISOString()
    });
    res.json({
        success: true,
        message: 'Logout realizado com sucesso'
    });
});
app.get('/api/users/profile', authenticateToken, async (req, res) => {
    try {
        const User = require('./models/User').default;
        const MockUser = require('./services/MockUserService').MockUser;
        const UserModel = process.env.NODE_ENV === 'production' ? User : MockUser;
        const user = await UserModel.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                error: 'Usuário não encontrado',
                code: 'USER_NOT_FOUND'
            });
        }
        const userProfile = {
            id: user._id,
            name: user.name,
            email: user.email,
            university: user.university || 'Não informado',
            course: user.course || 'Não informado',
            role: user.role,
            level: user.level || 1,
            experience: user.experience || 0,
            createdAt: user.createdAt,
            stats: user.statistics || {
                totalSimulations: 0,
                totalQuestions: 0,
                correctAnswers: 0,
                averageScore: 0,
                timeSpent: 0,
                streakDays: 0
            },
            achievements: user.achievements || []
        };
        res.json({
            success: true,
            user: userProfile
        });
    }
    catch (error) {
        console.error('❌ Erro ao buscar perfil:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            code: 'INTERNAL_ERROR'
        });
    }
});
app.put('/api/users/profile', authenticateToken, (0, secureValidation_1.validate)(new secureValidation_1.SecureValidator()
    .field('name').optional().isString().minLength(2).maxLength(100).matches(/^[a-zA-ZÀ-ÿ\s]+$/).build()
    .field('university').optional().isString().custom((value) => {
    const valid = ['UVA', 'UECE', 'UFC', 'URCA', 'IFCE', 'ENEM'];
    return !value || valid.includes(value) || 'Universidade deve ser uma das opções válidas';
}).build()), async (req, res) => {
    const { name, university } = req.body;
    console.log('📝 Atualização de perfil:', {
        userId: req.user.id,
        changes: { name, university },
        ip: req.ip,
        timestamp: new Date().toISOString()
    });
    try {
        const User = require('./models/User').default;
        const MockUser = require('./services/MockUserService').MockUser;
        const UserModel = process.env.NODE_ENV === 'production' ? User : MockUser;
        const updateData = {};
        if (name)
            updateData.name = name;
        if (university)
            updateData.university = university;
        updateData.updatedAt = new Date();
        const updatedUser = await UserModel.findByIdAndUpdate(req.user.id, updateData, { new: true });
        if (!updatedUser) {
            return res.status(404).json({
                error: 'Usuário não encontrado',
                code: 'USER_NOT_FOUND'
            });
        }
        res.json({
            success: true,
            message: 'Perfil atualizado com sucesso',
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                university: updatedUser.university,
                role: updatedUser.role
            }
        });
    }
    catch (error) {
        console.error('❌ Erro ao atualizar perfil:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            code: 'INTERNAL_ERROR'
        });
    }
});
app.get('/api/system/info', (req, res) => {
    res.json({
        name: 'FocoVest API',
        version: '1.0.0',
        status: 'active',
        security: {
            csrf: true,
            rateLimit: true,
            fingerprinting: true,
            validation: true,
            logging: true
        },
        timestamp: new Date().toISOString()
    });
});
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});
app.use((error, req, res, next) => {
    console.error('❌ Erro não tratado:', {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        timestamp: new Date().toISOString()
    });
    res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
    });
});
app.use('*', (req, res) => {
    console.warn('🚨 Rota não encontrada:', {
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });
    res.status(404).json({
        error: 'Rota não encontrada',
        code: 'ROUTE_NOT_FOUND',
        path: req.originalUrl
    });
});
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('✅ Conectado ao MongoDB');
    }
    catch (error) {
        console.error('❌ Erro ao conectar ao MongoDB:', error);
    }
};
const startServer = async () => {
    try {
        await connectDB().catch(() => {
            console.warn('⚠️ Funcionando sem banco de dados (modo demonstração)');
        });
        app.listen(PORT, () => {
            console.log('\n🚀 Servidor FocoVest iniciado com sucesso!');
            console.log(`📍 Porta: ${PORT}`);
            console.log(`🌐 URL: http://localhost:${PORT}`);
            console.log('🔒 Segurança: Ativada');
            console.log('📊 Monitoramento: Ativado');
            console.log('⏰ Timestamp:', new Date().toISOString());
            console.log('\n📋 Rotas disponíveis:');
            console.log('  POST /api/auth/login - Autenticação');
            console.log('  POST /api/auth/register - Registro');
            console.log('  GET  /api/auth/validate - Validar token');
            console.log('  POST /api/auth/logout - Logout');
            console.log('  GET  /api/system/info - Informações do sistema');
            console.log('  GET  /api/health - Status de saúde');
            console.log('\n🔐 Recursos de segurança ativos:');
            console.log('  ✓ Rate Limiting');
            console.log('  ✓ CSRF Protection');
            console.log('  ✓ Input Validation');
            console.log('  ✓ Malicious Pattern Detection');
            console.log('  ✓ Device Fingerprinting');
            console.log('  ✓ Security Headers (Helmet)');
            console.log('  ✓ Request Logging');
            console.log('  ✓ Error Monitoring\n');
        });
        process.on('SIGTERM', () => {
            console.log('\n🛑 Recebido SIGTERM. Encerrando servidor graciosamente...');
            process.exit(0);
        });
        process.on('SIGINT', () => {
            console.log('\n🛑 Recebido SIGINT. Encerrando servidor graciosamente...');
            process.exit(0);
        });
    }
    catch (error) {
        console.error('❌ Erro ao iniciar servidor:', error);
        process.exit(1);
    }
};
startServer();
exports.default = app;
//# sourceMappingURL=secureServer.js.map