"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheService = void 0;
const events_1 = require("events");
class AdvancedCacheService extends events_1.EventEmitter {
    constructor(config = {}) {
        super();
        this.cache = new Map();
        this.metrics = {
            hits: 0,
            misses: 0,
            evictions: 0,
            entries: 0,
            hitRate: 0,
            memoryUsage: 0
        };
        this.cleanupTimer = null;
        this.config = {
            defaultTTL: 300,
            maxSize: 1000,
            cleanupInterval: 60,
            ...config
        };
        this.startCleanupTimer();
        console.log('🚀 AdvancedCacheService: Cache inicializado', {
            defaultTTL: this.config.defaultTTL,
            maxSize: this.config.maxSize,
            cleanupInterval: this.config.cleanupInterval
        });
    }
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            this.metrics.misses++;
            this.emit('miss', { key });
            this.updateMetrics();
            return null;
        }
        const now = Date.now();
        if (now - entry.createdAt > entry.ttl * 1000) {
            this.cache.delete(key);
            this.metrics.evictions++;
            this.emit('evicted', { key, reason: 'ttl' });
            this.metrics.misses++;
            this.emit('miss', { key });
            this.updateMetrics();
            return null;
        }
        entry.lastAccessed = now;
        entry.accessCount++;
        this.metrics.hits++;
        this.emit('hit', { key });
        this.updateMetrics();
        return entry.data;
    }
    set(key, data, ttl) {
        const now = Date.now();
        const entryTTL = ttl || this.config.defaultTTL;
        if (this.cache.size >= this.config.maxSize && !this.cache.has(key)) {
            this.evictLRU();
        }
        const entry = {
            data,
            createdAt: now,
            ttl: entryTTL,
            lastAccessed: now,
            accessCount: 0
        };
        this.cache.set(key, entry);
        this.emit('set', { key, ttl: entryTTL });
        this.updateMetrics();
    }
    has(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return false;
        const now = Date.now();
        if (now - entry.createdAt > entry.ttl * 1000) {
            this.cache.delete(key);
            this.metrics.evictions++;
            this.emit('evicted', { key, reason: 'ttl' });
            this.updateMetrics();
            return false;
        }
        return true;
    }
    delete(key) {
        const existed = this.cache.delete(key);
        if (existed) {
            this.emit('evicted', { key, reason: 'manual' });
            this.updateMetrics();
        }
        return existed;
    }
    invalidatePattern(pattern) {
        const regex = new RegExp(pattern);
        let invalidated = 0;
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.cache.delete(key);
                this.emit('evicted', { key, reason: 'manual' });
                invalidated++;
            }
        }
        this.updateMetrics();
        return invalidated;
    }
    clear() {
        this.cache.clear();
        this.metrics.evictions += this.metrics.entries;
        this.emit('cleared', {});
        this.updateMetrics();
    }
    getMetrics() {
        return { ...this.metrics };
    }
    async getOrSet(key, factory, ttl) {
        const cached = this.get(key);
        if (cached !== null) {
            return cached;
        }
        const data = await factory();
        this.set(key, data, ttl);
        return data;
    }
    evictLRU() {
        let oldestKey = null;
        let oldestTime = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (entry.lastAccessed < oldestTime) {
                oldestTime = entry.lastAccessed;
                oldestKey = key;
            }
        }
        if (oldestKey) {
            this.cache.delete(oldestKey);
            this.metrics.evictions++;
            this.emit('evicted', { key: oldestKey, reason: 'size' });
        }
    }
    cleanup() {
        const now = Date.now();
        let cleaned = 0;
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.createdAt > entry.ttl * 1000) {
                this.cache.delete(key);
                this.emit('evicted', { key, reason: 'ttl' });
                cleaned++;
            }
        }
        if (cleaned > 0) {
            this.metrics.evictions += cleaned;
            this.updateMetrics();
            console.log(`🧹 Cache: Limpeza automática removeu ${cleaned} entradas expiradas`);
        }
    }
    startCleanupTimer() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
        }
        this.cleanupTimer = setInterval(() => {
            this.cleanup();
        }, this.config.cleanupInterval * 1000);
    }
    updateMetrics() {
        this.metrics.entries = this.cache.size;
        const total = this.metrics.hits + this.metrics.misses;
        this.metrics.hitRate = total > 0 ? (this.metrics.hits / total) * 100 : 0;
        this.metrics.memoryUsage = this.cache.size * 1024;
    }
    destroy() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }
        this.clear();
        this.removeAllListeners();
        console.log('🛑 AdvancedCacheService: Cache destruído');
    }
}
exports.cacheService = new AdvancedCacheService({
    defaultTTL: 300,
    maxSize: 500,
    cleanupInterval: 120
});
const logger_1 = require("../utils/logger");
exports.cacheService.on('hit', ({ key }) => {
    logger_1.globalLogger.cacheEvent('hit', key);
});
exports.cacheService.on('miss', ({ key }) => {
    logger_1.globalLogger.cacheEvent('miss', key);
});
exports.cacheService.on('evicted', ({ key, reason }) => {
    logger_1.globalLogger.cacheEvent('evicted', key, { reason });
});
exports.default = AdvancedCacheService;
//# sourceMappingURL=CacheService.js.map