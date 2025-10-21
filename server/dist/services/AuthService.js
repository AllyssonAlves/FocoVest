"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const User_1 = __importDefault(require("../models/User"));
const MockUserService_1 = require("./MockUserService");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const types_1 = require("../../../shared/dist/types");
const isMongoAvailable = () => {
    try {
        const mongoose = require('mongoose');
        return mongoose.connection.readyState === 1;
    }
    catch (error) {
        return false;
    }
};
class AuthService {
    static async register(data) {
        try {
            const UserModel = isMongoAvailable() ? User_1.default : MockUserService_1.MockUser;
            console.log('📝 AuthService: Iniciando registro para:', data.email);
            console.log('🔧 AuthService: Usando', isMongoAvailable() ? 'MongoDB' : 'MockDB');
            const existingUser = await UserModel.findOne({ email: data.email.toLowerCase() });
            if (existingUser) {
                console.log('❌ AuthService: Email já existe:', data.email);
                throw (0, errorHandler_1.createError)('Email já está em uso', 400);
            }
            if (!data.name || data.name.trim().length < 2) {
                throw (0, errorHandler_1.createError)('Nome deve ter pelo menos 2 caracteres', 400);
            }
            if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) {
                throw (0, errorHandler_1.createError)('Email deve ter um formato válido', 400);
            }
            if (!data.password || data.password.length < 8) {
                throw (0, errorHandler_1.createError)('Senha deve ter pelo menos 8 caracteres', 400);
            }
            if (data.graduationYear) {
                const currentYear = new Date().getFullYear();
                if (data.graduationYear < currentYear || data.graduationYear > currentYear + 10) {
                    throw (0, errorHandler_1.createError)('Ano de graduação deve estar entre o ano atual e 10 anos no futuro', 400);
                }
            }
            console.log('✅ AuthService: Dados validados, criando usuário...');
            const userData = {
                name: data.name.trim(),
                email: data.email.toLowerCase().trim(),
                password: data.password,
                university: data.university,
                course: data.course?.trim(),
                graduationYear: data.graduationYear,
                role: types_1.UserRole.STUDENT,
                isEmailVerified: true
            };
            let user;
            if (isMongoAvailable()) {
                user = new User_1.default(userData);
                const emailVerificationToken = user.generateEmailVerificationToken();
                await user.save();
                console.log(`Email verification token for ${user.email}: ${emailVerificationToken}`);
            }
            else {
                user = await MockUserService_1.MockUser.create(userData);
                console.log('✅ AuthService: Usuário criado no MockDB');
            }
            const token = (0, auth_1.generateToken)(user);
            console.log('🔑 AuthService: Token JWT gerado');
            const userResponse = {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                university: user.university,
                course: user.course,
                graduationYear: user.graduationYear,
                role: user.role,
                level: user.level,
                experience: user.experience,
                statistics: user.statistics,
                isEmailVerified: user.isEmailVerified,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            };
            console.log('🎉 AuthService: Registro concluído com sucesso!');
            return {
                success: true,
                message: 'Usuário registrado com sucesso.',
                data: {
                    user: userResponse,
                    token
                }
            };
        }
        catch (error) {
            console.log('❌ AuthService: Erro no registro:', error.message);
            if (error.code === 11000) {
                throw (0, errorHandler_1.createError)('Email já está em uso', 400);
            }
            throw error;
        }
    }
    static async login(data) {
        try {
            const UserModel = isMongoAvailable() ? User_1.default : MockUserService_1.MockUser;
            console.log('🔑 AuthService: Iniciando login para:', data.email);
            console.log('🔧 AuthService: Usando', isMongoAvailable() ? 'MongoDB' : 'MockDB');
            if (!data.email || !data.password) {
                throw (0, errorHandler_1.createError)('Email e senha são obrigatórios', 400);
            }
            let user;
            if (isMongoAvailable()) {
                user = await User_1.default.findOne({
                    email: data.email.toLowerCase()
                }).select('+password');
            }
            else {
                user = await MockUserService_1.MockUser.findOne({
                    email: data.email.toLowerCase()
                });
            }
            if (!user) {
                console.log('❌ AuthService: Usuário não encontrado:', data.email);
                throw (0, errorHandler_1.createError)('Email ou senha incorretos', 401);
            }
            console.log('✅ AuthService: Usuário encontrado, verificando senha...');
            let isPasswordValid;
            if (isMongoAvailable()) {
                isPasswordValid = await user.comparePassword(data.password);
            }
            else {
                const bcrypt = require('bcryptjs');
                isPasswordValid = await bcrypt.compare(data.password, user.password);
            }
            if (!isPasswordValid) {
                console.log('❌ AuthService: Senha incorreta para:', data.email);
                throw (0, errorHandler_1.createError)('Email ou senha incorretos', 401);
            }
            console.log('✅ AuthService: Senha correta, gerando token...');
            const token = (0, auth_1.generateToken)(user);
            const userResponse = {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                university: user.university,
                course: user.course,
                graduationYear: user.graduationYear,
                role: user.role,
                level: user.level,
                experience: user.experience,
                statistics: user.statistics,
                isEmailVerified: user.isEmailVerified,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            };
            console.log('🎉 AuthService: Login realizado com sucesso!');
            return {
                success: true,
                message: 'Login realizado com sucesso',
                data: {
                    user: userResponse,
                    token
                }
            };
        }
        catch (error) {
            console.log('❌ AuthService: Erro no login:', error.message);
            throw error;
        }
    }
    static async verifyEmail(token) {
        try {
            const user = await User_1.default.findOne({
                emailVerificationToken: token
            }).select('+emailVerificationToken');
            if (!user) {
                throw (0, errorHandler_1.createError)('Token de verificação inválido', 400);
            }
            user.isEmailVerified = true;
            user.emailVerificationToken = undefined;
            await user.save();
            return {
                success: true,
                message: 'Email verificado com sucesso'
            };
        }
        catch (error) {
            throw error;
        }
    }
    static async forgotPassword(email) {
        try {
            const user = await User_1.default.findOne({ email: email.toLowerCase() });
            if (!user) {
                return {
                    success: true,
                    message: 'Se o email existir, você receberá instruções para redefinir sua senha'
                };
            }
            const resetToken = user.generatePasswordResetToken();
            await user.save();
            console.log(`Password reset token for ${user.email}: ${resetToken}`);
            return {
                success: true,
                message: 'Se o email existir, você receberá instruções para redefinir sua senha'
            };
        }
        catch (error) {
            throw error;
        }
    }
    static async resetPassword(token, newPassword) {
        try {
            if (!newPassword || newPassword.length < 8) {
                throw (0, errorHandler_1.createError)('Nova senha deve ter pelo menos 8 caracteres', 400);
            }
            const user = await User_1.default.findOne({
                passwordResetToken: token,
                passwordResetExpires: { $gt: new Date() }
            }).select('+passwordResetToken +passwordResetExpires');
            if (!user) {
                throw (0, errorHandler_1.createError)('Token de redefinição inválido ou expirado', 400);
            }
            user.password = newPassword;
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save();
            return {
                success: true,
                message: 'Senha redefinida com sucesso'
            };
        }
        catch (error) {
            throw error;
        }
    }
    static async changePassword(userId, currentPassword, newPassword) {
        try {
            if (!newPassword || newPassword.length < 8) {
                throw (0, errorHandler_1.createError)('Nova senha deve ter pelo menos 8 caracteres', 400);
            }
            const user = await User_1.default.findById(userId).select('+password');
            if (!user) {
                throw (0, errorHandler_1.createError)('Usuário não encontrado', 404);
            }
            const isCurrentPasswordValid = await user.comparePassword(currentPassword);
            if (!isCurrentPasswordValid) {
                throw (0, errorHandler_1.createError)('Senha atual incorreta', 400);
            }
            user.password = newPassword;
            await user.save();
            return {
                success: true,
                message: 'Senha alterada com sucesso'
            };
        }
        catch (error) {
            throw error;
        }
    }
    static async refreshToken(user) {
        try {
            const token = (0, auth_1.generateToken)(user);
            const userResponse = {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                university: user.university,
                course: user.course,
                graduationYear: user.graduationYear,
                role: user.role,
                level: user.level,
                experience: user.experience,
                statistics: user.statistics,
                isEmailVerified: user.isEmailVerified,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            };
            return {
                success: true,
                message: 'Token renovado com sucesso',
                data: {
                    user: userResponse,
                    token
                }
            };
        }
        catch (error) {
            throw error;
        }
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=AuthService.js.map