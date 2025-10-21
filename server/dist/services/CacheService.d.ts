import { EventEmitter } from 'events';
interface CacheConfig {
    defaultTTL: number;
    maxSize: number;
    cleanupInterval: number;
}
interface CacheMetrics {
    hits: number;
    misses: number;
    evictions: number;
    entries: number;
    hitRate: number;
    memoryUsage: number;
}
interface CacheEvents {
    'hit': {
        key: string;
    };
    'miss': {
        key: string;
    };
    'set': {
        key: string;
        ttl: number;
    };
    'evicted': {
        key: string;
        reason: 'ttl' | 'size' | 'manual';
    };
    'cleared': {};
}
declare class AdvancedCacheService extends EventEmitter {
    private cache;
    private config;
    private metrics;
    private cleanupTimer;
    constructor(config?: Partial<CacheConfig>);
    get<T>(key: string): T | null;
    set<T>(key: string, data: T, ttl?: number): void;
    has(key: string): boolean;
    delete(key: string): boolean;
    invalidatePattern(pattern: string): number;
    clear(): void;
    getMetrics(): CacheMetrics;
    getOrSet<T>(key: string, factory: () => Promise<T>, ttl?: number): Promise<T>;
    private evictLRU;
    private cleanup;
    private startCleanupTimer;
    private updateMetrics;
    destroy(): void;
}
export declare const cacheService: AdvancedCacheService;
export default AdvancedCacheService;
export type { CacheConfig, CacheMetrics, CacheEvents };
//# sourceMappingURL=CacheService.d.ts.map