"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statisticsCacheService = void 0;
const CacheService_1 = require("./CacheService");
const MockUserService_1 = require("./MockUserService");
class StatisticsCacheService {
    async getGlobalStatistics() {
        const key = 'global_statistics';
        return await CacheService_1.cacheService.getOrSet(key, async () => {
            console.log('📊 StatisticsCache: Calculando estatísticas globais...');
            const users = await MockUserService_1.mockUserDB.getAllUsers();
            let totalSimulations = 0;
            let totalQuestions = 0;
            let totalCorrectAnswers = 0;
            let totalStudyTime = 0;
            let activeUsersLast7Days = 0;
            let activeUsersLast30Days = 0;
            const now = new Date();
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            for (const user of users) {
                const stats = user.statistics || {};
                totalSimulations += stats.totalSimulations || 0;
                totalQuestions += stats.totalQuestions || 0;
                totalCorrectAnswers += stats.correctAnswers || 0;
                totalStudyTime += stats.timeSpent || 0;
                if (stats.lastSimulationDate) {
                    const lastActivity = new Date(stats.lastSimulationDate);
                    if (lastActivity >= sevenDaysAgo)
                        activeUsersLast7Days++;
                    if (lastActivity >= thirtyDaysAgo)
                        activeUsersLast30Days++;
                }
            }
            const averageGlobalScore = totalQuestions > 0
                ? (totalCorrectAnswers / totalQuestions) * 100
                : 0;
            const globalStats = {
                totalUsers: users.length,
                totalSimulations,
                totalQuestions,
                averageGlobalScore: Math.round(averageGlobalScore * 100) / 100,
                totalStudyTime: Math.round(totalStudyTime / 60),
                activeUsersLast7Days,
                activeUsersLast30Days,
                calculatedAt: new Date().toISOString()
            };
            console.log('✅ StatisticsCache: Estatísticas globais calculadas', globalStats);
            return globalStats;
        }, StatisticsCacheService.GLOBAL_STATS_TTL);
    }
    async getRankingStatistics() {
        const key = 'ranking_statistics';
        return await CacheService_1.cacheService.getOrSet(key, async () => {
            console.log('🏆 StatisticsCache: Calculando estatísticas de ranking...');
            const users = await MockUserService_1.mockUserDB.getAllUsers();
            const topPerformers = users
                .map((user) => ({
                userId: user._id,
                name: user.name,
                email: user.email,
                averageScore: user.statistics?.averageScore || 0,
                totalSimulations: user.statistics?.totalSimulations || 0,
                position: 0
            }))
                .filter((user) => user.totalSimulations > 0)
                .sort((a, b) => {
                if (Math.abs(a.averageScore - b.averageScore) < 0.1) {
                    return b.totalSimulations - a.totalSimulations;
                }
                return b.averageScore - a.averageScore;
            })
                .slice(0, 10)
                .map((user, index) => ({ ...user, position: index + 1 }));
            const universityRankings = {};
            const usersByUniversity = {};
            for (const user of users) {
                const university = user.university || 'Não informada';
                if (!usersByUniversity[university]) {
                    usersByUniversity[university] = [];
                }
                usersByUniversity[university].push(user);
            }
            for (const [university, universityUsers] of Object.entries(usersByUniversity)) {
                universityRankings[university] = universityUsers
                    .map((user) => ({
                    userId: user._id,
                    name: user.name,
                    averageScore: user.statistics?.averageScore || 0,
                    totalSimulations: user.statistics?.totalSimulations || 0
                }))
                    .filter((user) => user.totalSimulations > 0)
                    .sort((a, b) => b.averageScore - a.averageScore)
                    .slice(0, 5);
            }
            const rankingStats = {
                topPerformers,
                universityRankings,
                calculatedAt: new Date().toISOString()
            };
            console.log('✅ StatisticsCache: Estatísticas de ranking calculadas', {
                topPerformersCount: topPerformers.length,
                universitiesCount: Object.keys(universityRankings).length
            });
            return rankingStats;
        }, StatisticsCacheService.RANKING_STATS_TTL);
    }
    async getUserDetailedStatistics(userId) {
        const key = `user_detailed_stats:${userId}`;
        return await CacheService_1.cacheService.getOrSet(key, async () => {
            console.log(`👤 StatisticsCache: Calculando estatísticas detalhadas para usuário ${userId}...`);
            const user = await MockUserService_1.mockUserDB.findById(userId);
            if (!user) {
                console.log(`❌ StatisticsCache: Usuário ${userId} não encontrado`);
                return null;
            }
            const stats = user.statistics || {
                totalSimulations: 0,
                totalQuestions: 0,
                correctAnswers: 0,
                averageScore: 0,
                timeSpent: 0,
                streakDays: 0
            };
            const now = new Date();
            const createdAt = new Date(user.createdAt);
            const daysSinceJoined = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
            const avgQuestionsPerSimulation = stats.totalSimulations > 0
                ? Math.round(stats.totalQuestions / stats.totalSimulations)
                : 0;
            const avgTimePerQuestion = stats.totalQuestions > 0
                ? Math.round(stats.timeSpent / stats.totalQuestions)
                : 0;
            const efficiencyRate = stats.timeSpent > 0
                ? Number(((stats.correctAnswers / (stats.timeSpent / 3600)).toFixed(2)))
                : 0;
            const studyFrequency = stats.totalSimulations && daysSinceJoined > 0
                ? Number(((stats.totalSimulations / daysSinceJoined) * 7).toFixed(1))
                : 0;
            let performanceTrend = 'stable';
            if (stats.averageScore >= 85)
                performanceTrend = 'excellent';
            else if (stats.averageScore >= 70)
                performanceTrend = 'good';
            else if (stats.averageScore >= 50)
                performanceTrend = 'average';
            else
                performanceTrend = 'needs_improvement';
            const last7Days = stats.lastSimulationDate ?
                (now.getTime() - new Date(stats.lastSimulationDate).getTime()) / (1000 * 60 * 60 * 24) <= 7 : false;
            const last30Days = stats.lastSimulationDate ?
                (now.getTime() - new Date(stats.lastSimulationDate).getTime()) / (1000 * 60 * 60 * 24) <= 30 : false;
            const currentLevel = user.level || 1;
            const currentXP = user.experience || 0;
            const maxLevelXP = currentLevel * 200;
            const currentLevelXP = currentXP % maxLevelXP;
            const xpToNextLevel = maxLevelXP - currentLevelXP;
            const completionRate = stats.totalQuestions > 0
                ? Number(((stats.correctAnswers / stats.totalQuestions) * 100).toFixed(1))
                : 0;
            const studyConsistency = stats.streakDays > 0
                ? Math.min(100, (stats.streakDays / 30) * 100)
                : 0;
            const suggestedStudyTime = stats.averageScore < 70 ? 'Aumente o tempo de estudo' :
                stats.averageScore < 85 ? 'Mantenha o ritmo atual' :
                    'Excelente performance!';
            const focusAreas = stats.averageScore < 60 ? ['Revisar conceitos básicos', 'Fazer mais simulados'] :
                stats.averageScore < 80 ? ['Praticar questões específicas', 'Revisar erros'] :
                    ['Manter consistência', 'Focar em questões avançadas'];
            const nextGoal = stats.totalSimulations < 10 ? 'Complete 10 simulados' :
                stats.averageScore < 70 ? 'Alcance 70% de aproveitamento' :
                    stats.streakDays < 7 ? 'Mantenha 7 dias consecutivos' :
                        'Mantenha a excelência!';
            const detailedStats = {
                userId: user._id,
                basic: stats,
                advanced: {
                    avgQuestionsPerSimulation,
                    avgTimePerQuestion,
                    efficiencyRate,
                    studyFrequency,
                    performanceTrend,
                    daysSinceJoined,
                    activeInLast7Days: last7Days,
                    activeInLast30Days: last30Days
                },
                progress: {
                    currentLevel,
                    experience: currentXP,
                    xpToNextLevel,
                    completionRate,
                    studyConsistency
                },
                recommendations: {
                    suggestedStudyTime,
                    focusAreas,
                    nextGoal
                },
                calculatedAt: new Date().toISOString()
            };
            console.log(`✅ StatisticsCache: Estatísticas detalhadas calculadas para ${user.name}`);
            return detailedStats;
        }, StatisticsCacheService.USER_STATS_TTL);
    }
    invalidateUserCache(userId) {
        const patterns = [
            `user_detailed_stats:${userId}`,
            'global_statistics',
            'ranking_statistics'
        ];
        patterns.forEach(pattern => {
            CacheService_1.cacheService.delete(pattern);
        });
        console.log(`🗑️  StatisticsCache: Cache invalidado para usuário ${userId}`);
    }
    invalidateAllCache() {
        CacheService_1.cacheService.invalidatePattern('.*_statistics.*');
        CacheService_1.cacheService.invalidatePattern('user_detailed_stats:.*');
        console.log('🧹 StatisticsCache: Todo cache de estatísticas invalidado');
    }
    getCacheMetrics() {
        return CacheService_1.cacheService.getMetrics();
    }
    async warmupCache() {
        console.log('🔥 StatisticsCache: Iniciando warm-up do cache...');
        try {
            await Promise.all([
                this.getGlobalStatistics(),
                this.getRankingStatistics()
            ]);
            const users = await MockUserService_1.mockUserDB.getAllUsers();
            const topUsers = users
                .sort((a, b) => (b.statistics?.averageScore || 0) - (a.statistics?.averageScore || 0))
                .slice(0, 5);
            await Promise.all(topUsers.map((user) => this.getUserDetailedStatistics(user._id)));
            console.log('✅ StatisticsCache: Warm-up concluído com sucesso');
        }
        catch (error) {
            console.error('❌ StatisticsCache: Erro no warm-up do cache:', error);
        }
    }
}
StatisticsCacheService.GLOBAL_STATS_TTL = 600;
StatisticsCacheService.RANKING_STATS_TTL = 300;
StatisticsCacheService.USER_STATS_TTL = 180;
StatisticsCacheService.AGGREGATED_STATS_TTL = 900;
exports.statisticsCacheService = new StatisticsCacheService();
exports.default = StatisticsCacheService;
//# sourceMappingURL=StatisticsCacheService.js.map