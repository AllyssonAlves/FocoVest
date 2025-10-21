"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = exports.config = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/focovest',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'focovest-secret-key-change-in-production',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    },
    bcrypt: {
        saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12')
    },
    server: {
        port: parseInt(process.env.PORT || '5000'),
        env: process.env.NODE_ENV || 'development'
    }
};
const connectDB = async () => {
    try {
        const conn = await mongoose_1.default.connect(exports.config.mongodb.uri);
        console.log(`📦 MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        console.error('❌ MongoDB connection error:', error);
    }
};
exports.connectDB = connectDB;
//# sourceMappingURL=database.js.map