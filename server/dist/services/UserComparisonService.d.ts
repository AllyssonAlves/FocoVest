interface UserRankingPosition {
    globalPosition: number;
    totalUsers: number;
    globalPercentile: number;
    universityPosition?: number;
    totalUniversityUsers?: number;
    universityPercentile?: number;
    coursePosition?: number;
    totalCourseUsers?: number;
    coursePercentile?: number;
}
interface MetricComparison {
    metric: string;
    userValue: number;
    average: number;
    median: number;
    percentile: number;
    rank: number;
    totalUsers: number;
    betterThanPercent: number;
    category: 'excellent' | 'above_average' | 'average' | 'below_average' | 'needs_improvement';
}
interface ComparativeInsight {
    type: 'achievement' | 'improvement' | 'encouragement' | 'goal';
    title: string;
    description: string;
    metric?: string;
    value?: number;
    comparison?: string;
    icon: string;
}
interface UserComparison {
    user: {
        id: string;
        name: string;
        university?: string;
        course?: string;
    };
    rankingPositions: UserRankingPosition;
    metricComparisons: MetricComparison[];
    insights: ComparativeInsight[];
    similarUsers: Array<{
        id: string;
        name: string;
        university?: string;
        similarity: number;
        performance: 'better' | 'similar' | 'worse';
    }>;
    goals: Array<{
        metric: string;
        current: number;
        target: number;
        percentileTarget: number;
        timeEstimate?: string;
    }>;
    calculatedAt: string;
}
declare class UserComparisonService {
    private static readonly CACHE_TTL;
    getUserComparison(userId: string): Promise<UserComparison | null>;
    private prepareComparisonData;
    private calculateRankingPositions;
    private calculateMetricComparisons;
    private generateInsights;
    private findSimilarUsers;
    private generateGoals;
    private estimateTimeToGoal;
    invalidateUserComparison(userId: string): void;
    invalidateAllComparisons(): void;
}
export declare const userComparisonService: UserComparisonService;
export default UserComparisonService;
export type { UserComparison, UserRankingPosition, MetricComparison, ComparativeInsight };
//# sourceMappingURL=UserComparisonService.d.ts.map