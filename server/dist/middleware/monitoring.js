"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metricsEndpoint = exports.errorLogger = exports.userActionLogger = exports.morganLogger = exports.requestLogger = exports.metricsSystem = void 0;
const morgan_1 = __importDefault(require("morgan"));
const logger_1 = require("../utils/logger");
class MetricsSystem {
    constructor() {
        this.metrics = {
            requests: {
                total: 0,
                success: 0,
                error: 0,
                byEndpoint: new Map(),
                byMethod: new Map(),
                responseTime: []
            },
            users: {
                activeUsers: new Set(),
                registrations: 0,
                logins: 0
            },
            performance: {
                memoryUsage: process.memoryUsage(),
                uptime: 0,
                cpuUsage: null
            },
            errors: {
                count: 0,
                recent: []
            }
        };
        this.startTime = Date.now();
    }
    recordRequest(req, statusCode, responseTime) {
        this.metrics.requests.total++;
        if (statusCode >= 200 && statusCode < 400) {
            this.metrics.requests.success++;
        }
        else {
            this.metrics.requests.error++;
        }
        const endpoint = req.route?.path || req.path;
        const method = req.method;
        this.metrics.requests.byEndpoint.set(endpoint, (this.metrics.requests.byEndpoint.get(endpoint) || 0) + 1);
        this.metrics.requests.byMethod.set(method, (this.metrics.requests.byMethod.get(method) || 0) + 1);
        this.metrics.requests.responseTime.push(responseTime);
        if (this.metrics.requests.responseTime.length > 1000) {
            this.metrics.requests.responseTime.shift();
        }
        this.updatePerformanceMetrics();
    }
    recordActiveUser(userId) {
        this.metrics.users.activeUsers.add(userId);
        setTimeout(() => {
            this.metrics.users.activeUsers.delete(userId);
        }, 30 * 60 * 1000);
    }
    recordUserAction(action) {
        if (action === 'registration') {
            this.metrics.users.registrations++;
        }
        else if (action === 'login') {
            this.metrics.users.logins++;
        }
    }
    recordError(error, endpoint, userId) {
        this.metrics.errors.count++;
        this.metrics.errors.recent.push({
            timestamp: new Date(),
            error: error.substring(0, 200),
            endpoint,
            userId
        });
        if (this.metrics.errors.recent.length > 100) {
            this.metrics.errors.recent.shift();
        }
    }
    updatePerformanceMetrics() {
        this.metrics.performance.memoryUsage = process.memoryUsage();
        this.metrics.performance.uptime = Date.now() - this.startTime;
        if (process.cpuUsage) {
            this.metrics.performance.cpuUsage = process.cpuUsage();
        }
    }
    getMetrics() {
        this.updatePerformanceMetrics();
        const responseTimeArray = this.metrics.requests.responseTime;
        const avgResponseTime = responseTimeArray.length > 0
            ? responseTimeArray.reduce((a, b) => a + b, 0) / responseTimeArray.length
            : 0;
        return {
            timestamp: new Date().toISOString(),
            uptime: this.metrics.performance.uptime,
            requests: {
                total: this.metrics.requests.total,
                success: this.metrics.requests.success,
                error: this.metrics.requests.error,
                successRate: this.metrics.requests.total > 0
                    ? (this.metrics.requests.success / this.metrics.requests.total * 100).toFixed(2) + '%'
                    : '0%',
                avgResponseTime: Math.round(avgResponseTime) + 'ms',
                topEndpoints: Array.from(this.metrics.requests.byEndpoint.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10),
                methodDistribution: Object.fromEntries(this.metrics.requests.byMethod)
            },
            users: {
                activeNow: this.metrics.users.activeUsers.size,
                totalRegistrations: this.metrics.users.registrations,
                totalLogins: this.metrics.users.logins
            },
            performance: {
                memoryUsage: {
                    rss: Math.round(this.metrics.performance.memoryUsage.rss / 1024 / 1024) + 'MB',
                    heapUsed: Math.round(this.metrics.performance.memoryUsage.heapUsed / 1024 / 1024) + 'MB',
                    heapTotal: Math.round(this.metrics.performance.memoryUsage.heapTotal / 1024 / 1024) + 'MB'
                },
                uptime: Math.round(this.metrics.performance.uptime / 1000) + 's'
            },
            errors: {
                total: this.metrics.errors.count,
                recent: this.metrics.errors.recent.slice(-10)
            }
        };
    }
    reset() {
        this.metrics = {
            requests: {
                total: 0,
                success: 0,
                error: 0,
                byEndpoint: new Map(),
                byMethod: new Map(),
                responseTime: []
            },
            users: {
                activeUsers: new Set(),
                registrations: 0,
                logins: 0
            },
            performance: {
                memoryUsage: process.memoryUsage(),
                uptime: 0,
                cpuUsage: null
            },
            errors: {
                count: 0,
                recent: []
            }
        };
        this.startTime = Date.now();
    }
}
exports.metricsSystem = new MetricsSystem();
const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    const originalJson = res.json;
    res.json = function (body) {
        const responseTime = Date.now() - startTime;
        exports.metricsSystem.recordRequest(req, res.statusCode, responseTime);
        const requestLogger = (0, logger_1.createRequestLogger)(req);
        requestLogger.apiRequest(req.method, req.path, res.statusCode, responseTime);
        return originalJson.call(this, body);
    };
    next();
};
exports.requestLogger = requestLogger;
exports.morganLogger = (0, morgan_1.default)(process.env.NODE_ENV === 'production'
    ? 'combined'
    : 'dev', {
    skip: (req) => {
        return process.env.NODE_ENV === 'production' && req.path === '/api/health';
    }
});
const userActionLogger = (action) => {
    return (req, res, next) => {
        const originalJson = res.json;
        res.json = function (body) {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                exports.metricsSystem.recordUserAction(action);
                const userId = body?.user?.id || body?.data?.user?.id;
                if (userId) {
                    exports.metricsSystem.recordActiveUser(userId);
                }
            }
            return originalJson.call(this, body);
        };
        next();
    };
};
exports.userActionLogger = userActionLogger;
const errorLogger = (error, req, res, next) => {
    const userId = req.user?.id;
    exports.metricsSystem.recordError(error.message, req.path, userId);
    const requestLogger = (0, logger_1.createRequestLogger)(req);
    requestLogger.error(`Error in ${req.method} ${req.path}`, error, {
        userId,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    next(error);
};
exports.errorLogger = errorLogger;
const metricsEndpoint = (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        const adminToken = req.headers['x-admin-token'];
        if (!adminToken || adminToken !== process.env.ADMIN_METRICS_TOKEN) {
            return res.status(403).json({ error: 'Acesso negado' });
        }
    }
    const metrics = exports.metricsSystem.getMetrics();
    return res.json(metrics);
};
exports.metricsEndpoint = metricsEndpoint;
setInterval(() => {
    const metrics = exports.metricsSystem.getMetrics();
    logger_1.globalLogger.info('Hourly System Metrics', {
        requests: metrics.requests.total,
        activeUsers: metrics.users.activeNow,
        errors: metrics.errors.total,
        memoryUsage: metrics.performance.memoryUsage.heapUsed,
        type: 'system-metrics'
    });
}, 60 * 60 * 1000);
//# sourceMappingURL=monitoring.js.map