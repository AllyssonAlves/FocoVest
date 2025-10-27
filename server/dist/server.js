"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const compression_1 = __importDefault(require("compression"));
const errorHandler_1 = require("./middleware/errorHandler");
const cors_1 = __importDefault(require("cors"));
const corsConfig_1 = require("./middleware/corsConfig");
const rateLimiting_1 = require("./middleware/rateLimiting");
const security_1 = require("./middleware/security");
const advancedSecurity_1 = require("./middleware/advancedSecurity");
const productionMonitoring_1 = require("./middleware/productionMonitoring");
const monitoring_1 = require("./middleware/monitoring");
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const questions_1 = __importDefault(require("./routes/questions"));
const simulations_1 = __importDefault(require("./routes/simulations"));
const rankings_1 = __importDefault(require("./routes/rankings"));
const ai_1 = __importDefault(require("./routes/ai"));
const StatisticsCacheService_1 = require("./services/StatisticsCacheService");
const app = (0, express_1.default)();
if (process.env.NODE_ENV === 'production') {
    app.use(productionMonitoring_1.monitoringMiddleware);
}
app.use(monitoring_1.morganLogger);
app.use(monitoring_1.requestLogger);
(0, advancedSecurity_1.setupSecurity)(app, {
    enableCSRF: false,
    enableRateLimit: false,
    enableSlowDown: true,
    enableFingerprinting: true,
    allowedOrigins: ['http://localhost:3000', 'http://localhost:5173']
});
app.use(advancedSecurity_1.securityLogger);
app.use(advancedSecurity_1.deviceFingerprinting);
app.use(advancedSecurity_1.maliciousPatternDetection);
app.use(security_1.securityMiddleware);
app.use((0, compression_1.default)());
app.use((0, cors_1.default)((0, corsConfig_1.getCorsOptions)()));
app.use(rateLimiting_1.generalRateLimit);
app.use(express_1.default.json({
    limit: '5mb',
    strict: true
}));
app.use(express_1.default.urlencoded({
    extended: true,
    limit: '5mb',
    parameterLimit: 100
}));
app.use('/api/auth', rateLimiting_1.authRateLimit, auth_1.default);
app.use('/api/users', users_1.default);
app.use('/api/questions', questions_1.default);
app.use('/api/simulations', rateLimiting_1.simulationRateLimit, simulations_1.default);
app.use('/api/rankings', rankings_1.default);
app.use('/api/ai', ai_1.default);
app.get('/api/health', productionMonitoring_1.healthCheckEndpoint);
app.get('/api/health/simple', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
    });
});
app.get('/api/monitoring/metrics', monitoring_1.metricsEndpoint);
app.get('/api/metrics', monitoring_1.metricsEndpoint);
app.use(monitoring_1.errorLogger);
app.use(errorHandler_1.errorHandler);
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        console.warn('⚠️  Rodando em modo de desenvolvimento com MockDB');
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🌐 API available at http://localhost:${PORT}/api`);
            console.log(`🎯 Use as credenciais de teste:`);
            console.log(`  📧 joao@teste.com (senha: 123456)`);
            console.log(`  📧 maria@teste.com (senha: senha123)`);
            if (process.env.NODE_ENV !== 'test') {
                StatisticsCacheService_1.statisticsCacheService.warmupCache({
                    background: true,
                    limit: process.env.NODE_ENV === 'production' ? 5 : 2
                });
                if (process.env.NODE_ENV === 'production') {
                    (0, productionMonitoring_1.initializeMonitoring)();
                }
            }
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
exports.default = app;
//# sourceMappingURL=server.js.map