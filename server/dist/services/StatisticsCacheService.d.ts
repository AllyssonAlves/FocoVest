import { UserStatistics } from '../types/detailedStats';
interface GlobalStatsCache {
    totalUsers: number;
    totalSimulations: number;
    totalQuestions: number;
    averageGlobalScore: number;
    totalStudyTime: number;
    activeUsersLast7Days: number;
    activeUsersLast30Days: number;
    calculatedAt: string;
}
interface RankingStatsCache {
    topPerformers: Array<{
        userId: string;
        name: string;
        email: string;
        averageScore: number;
        totalSimulations: number;
        position: number;
    }>;
    universityRankings: Record<string, any[]>;
    calculatedAt: string;
}
interface DetailedUserStatsCache {
    userId: string;
    basic: UserStatistics;
    advanced: {
        avgQuestionsPerSimulation: number;
        avgTimePerQuestion: number;
        efficiencyRate: number;
        studyFrequency: number;
        performanceTrend: string;
        daysSinceJoined: number;
        activeInLast7Days: boolean;
        activeInLast30Days: boolean;
    };
    progress: {
        currentLevel: number;
        experience: number;
        xpToNextLevel: number;
        completionRate: number;
        studyConsistency: number;
    };
    recommendations: {
        suggestedStudyTime: string;
        focusAreas: string[];
        nextGoal: string;
    };
    calculatedAt: string;
}
declare class StatisticsCacheService {
    private static readonly GLOBAL_STATS_TTL;
    private static readonly RANKING_STATS_TTL;
    private static readonly USER_STATS_TTL;
    private static readonly AGGREGATED_STATS_TTL;
    getGlobalStatistics(): Promise<GlobalStatsCache>;
    getRankingStatistics(): Promise<RankingStatsCache>;
    getUserDetailedStatistics(userId: string): Promise<DetailedUserStatsCache | null>;
    invalidateUserCache(userId: string): void;
    invalidateAllCache(): void;
    getCacheMetrics(): import("./CacheService").CacheMetrics;
    warmupCache(): Promise<void>;
}
export declare const statisticsCacheService: StatisticsCacheService;
export default StatisticsCacheService;
export type { GlobalStatsCache, RankingStatsCache, DetailedUserStatsCache };
//# sourceMappingURL=StatisticsCacheService.d.ts.map