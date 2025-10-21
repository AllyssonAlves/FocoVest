"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userComparisonService = void 0;
const MockUserService_1 = require("./MockUserService");
const CacheService_1 = require("./CacheService");
class UserComparisonService {
    async getUserComparison(userId) {
        const cacheKey = `user_comparison:${userId}`;
        return await CacheService_1.cacheService.getOrSet(cacheKey, async () => {
            console.log(`📊 UserComparison: Calculando comparação para usuário ${userId}...`);
            const users = await MockUserService_1.mockUserDB.getAllUsers();
            const currentUser = users.find((u) => u._id === userId);
            if (!currentUser) {
                console.log(`❌ UserComparison: Usuário ${userId} não encontrado`);
                return null;
            }
            const comparisonData = this.prepareComparisonData(users);
            const userComparisonData = comparisonData.find(u => u.userId === userId);
            if (!userComparisonData) {
                return null;
            }
            const rankingPositions = this.calculateRankingPositions(userComparisonData, comparisonData);
            const metricComparisons = this.calculateMetricComparisons(userComparisonData, comparisonData);
            const insights = this.generateInsights(userComparisonData, rankingPositions, metricComparisons);
            const similarUsers = this.findSimilarUsers(userComparisonData, comparisonData);
            const goals = this.generateGoals(userComparisonData, comparisonData, metricComparisons);
            const comparison = {
                user: {
                    id: currentUser._id,
                    name: currentUser.name,
                    university: currentUser.university,
                    course: currentUser.course
                },
                rankingPositions,
                metricComparisons,
                insights,
                similarUsers,
                goals,
                calculatedAt: new Date().toISOString()
            };
            console.log(`✅ UserComparison: Comparação calculada para ${currentUser.name}`);
            return comparison;
        }, UserComparisonService.CACHE_TTL);
    }
    prepareComparisonData(users) {
        return users
            .filter((user) => user.statistics && user.statistics.totalSimulations > 0)
            .map((user) => ({
            userId: user._id,
            name: user.name,
            email: user.email,
            university: user.university,
            course: user.course,
            statistics: {
                averageScore: user.statistics?.averageScore || 0,
                totalSimulations: user.statistics?.totalSimulations || 0,
                totalQuestions: user.statistics?.totalQuestions || 0,
                correctAnswers: user.statistics?.correctAnswers || 0,
                timeSpent: user.statistics?.timeSpent || 0,
                streakDays: user.statistics?.streakDays || 0
            },
            level: user.level || 1,
            experience: user.experience || 0,
            createdAt: user.createdAt
        }));
    }
    calculateRankingPositions(user, allUsers) {
        const globalRanking = [...allUsers]
            .sort((a, b) => {
            if (Math.abs(a.statistics.averageScore - b.statistics.averageScore) < 0.1) {
                return b.statistics.totalSimulations - a.statistics.totalSimulations;
            }
            return b.statistics.averageScore - a.statistics.averageScore;
        });
        const globalPosition = globalRanking.findIndex(u => u.userId === user.userId) + 1;
        const globalPercentile = ((allUsers.length - globalPosition + 1) / allUsers.length) * 100;
        let universityPosition;
        let totalUniversityUsers;
        let universityPercentile;
        if (user.university) {
            const universityUsers = allUsers.filter(u => u.university === user.university);
            if (universityUsers.length > 1) {
                const universityRanking = [...universityUsers]
                    .sort((a, b) => b.statistics.averageScore - a.statistics.averageScore);
                universityPosition = universityRanking.findIndex(u => u.userId === user.userId) + 1;
                totalUniversityUsers = universityUsers.length;
                universityPercentile = ((universityUsers.length - universityPosition + 1) / universityUsers.length) * 100;
            }
        }
        let coursePosition;
        let totalCourseUsers;
        let coursePercentile;
        if (user.course) {
            const courseUsers = allUsers.filter(u => u.course === user.course);
            if (courseUsers.length > 1) {
                const courseRanking = [...courseUsers]
                    .sort((a, b) => b.statistics.averageScore - a.statistics.averageScore);
                coursePosition = courseRanking.findIndex(u => u.userId === user.userId) + 1;
                totalCourseUsers = courseUsers.length;
                coursePercentile = ((courseUsers.length - coursePosition + 1) / courseUsers.length) * 100;
            }
        }
        return {
            globalPosition,
            totalUsers: allUsers.length,
            globalPercentile: Math.round(globalPercentile * 10) / 10,
            universityPosition,
            totalUniversityUsers,
            universityPercentile: universityPercentile ? Math.round(universityPercentile * 10) / 10 : undefined,
            coursePosition,
            totalCourseUsers,
            coursePercentile: coursePercentile ? Math.round(coursePercentile * 10) / 10 : undefined
        };
    }
    calculateMetricComparisons(user, allUsers) {
        const metrics = [
            {
                key: 'averageScore',
                name: 'Score Médio',
                getValue: (u) => u.statistics.averageScore
            },
            {
                key: 'totalSimulations',
                name: 'Total de Simulados',
                getValue: (u) => u.statistics.totalSimulations
            },
            {
                key: 'correctAnswers',
                name: 'Questões Corretas',
                getValue: (u) => u.statistics.correctAnswers
            },
            {
                key: 'streakDays',
                name: 'Sequência de Dias',
                getValue: (u) => u.statistics.streakDays
            },
            {
                key: 'experience',
                name: 'Experiência (XP)',
                getValue: (u) => u.experience
            }
        ];
        return metrics.map(metric => {
            const values = allUsers.map(metric.getValue).sort((a, b) => a - b);
            const userValue = metric.getValue(user);
            const average = values.reduce((a, b) => a + b, 0) / values.length;
            const median = values[Math.floor(values.length / 2)];
            const rank = values.filter(v => v < userValue).length + 1;
            const percentile = (rank / values.length) * 100;
            const betterThanPercent = ((values.filter(v => v < userValue).length) / values.length) * 100;
            let category;
            if (percentile >= 90)
                category = 'excellent';
            else if (percentile >= 70)
                category = 'above_average';
            else if (percentile >= 40)
                category = 'average';
            else if (percentile >= 20)
                category = 'below_average';
            else
                category = 'needs_improvement';
            return {
                metric: metric.name,
                userValue: Math.round(userValue * 100) / 100,
                average: Math.round(average * 100) / 100,
                median: Math.round(median * 100) / 100,
                percentile: Math.round(percentile * 10) / 10,
                rank,
                totalUsers: values.length,
                betterThanPercent: Math.round(betterThanPercent * 10) / 10,
                category
            };
        });
    }
    generateInsights(user, rankings, metrics) {
        const insights = [];
        if (rankings.globalPercentile >= 80) {
            insights.push({
                type: 'achievement',
                title: 'Performance Excelente!',
                description: `Você está melhor que ${rankings.globalPercentile.toFixed(1)}% dos usuários da plataforma`,
                icon: '🏆'
            });
        }
        else if (rankings.globalPercentile >= 50) {
            insights.push({
                type: 'encouragement',
                title: 'Acima da Média',
                description: `Você está melhor que ${rankings.globalPercentile.toFixed(1)}% dos usuários. Continue assim!`,
                icon: '📈'
            });
        }
        else {
            insights.push({
                type: 'improvement',
                title: 'Espaço para Crescer',
                description: `Há margem para melhoria. Você está melhor que ${rankings.globalPercentile.toFixed(1)}% dos usuários`,
                icon: '💪'
            });
        }
        if (rankings.universityPercentile && rankings.universityPosition) {
            if (rankings.universityPercentile >= 70) {
                insights.push({
                    type: 'achievement',
                    title: `Destaque na ${user.university}`,
                    description: `Você está em ${rankings.universityPosition}º lugar entre ${rankings.totalUniversityUsers} estudantes da sua universidade`,
                    icon: '🎓'
                });
            }
        }
        const scoreMetric = metrics.find(m => m.metric === 'Score Médio');
        if (scoreMetric && scoreMetric.category === 'excellent') {
            insights.push({
                type: 'achievement',
                title: 'Score Excepcional',
                description: `Seu score médio de ${scoreMetric.userValue.toFixed(1)}% está melhor que ${scoreMetric.betterThanPercent.toFixed(1)}% dos usuários`,
                metric: 'Score Médio',
                value: scoreMetric.userValue,
                icon: '🎯'
            });
        }
        const streakMetric = metrics.find(m => m.metric === 'Sequência de Dias');
        if (streakMetric && streakMetric.userValue >= 7) {
            insights.push({
                type: 'achievement',
                title: 'Consistência Admirável',
                description: `${streakMetric.userValue} dias consecutivos de estudo - você está melhor que ${streakMetric.betterThanPercent.toFixed(1)}% dos usuários`,
                metric: 'Sequência de Dias',
                value: streakMetric.userValue,
                icon: '🔥'
            });
        }
        const weakestMetric = metrics
            .filter(m => m.category === 'below_average' || m.category === 'needs_improvement')
            .sort((a, b) => a.percentile - b.percentile)[0];
        if (weakestMetric) {
            insights.push({
                type: 'goal',
                title: 'Próximo Objetivo',
                description: `Melhorar em ${weakestMetric.metric} pode elevar sua posição geral`,
                metric: weakestMetric.metric,
                icon: '🎯'
            });
        }
        return insights;
    }
    findSimilarUsers(user, allUsers) {
        const otherUsers = allUsers.filter(u => u.userId !== user.userId);
        const similarities = otherUsers.map(otherUser => {
            const scoreRatio = Math.min(user.statistics.averageScore, otherUser.statistics.averageScore) /
                Math.max(user.statistics.averageScore, otherUser.statistics.averageScore);
            const simulationsRatio = Math.min(user.statistics.totalSimulations, otherUser.statistics.totalSimulations) /
                Math.max(user.statistics.totalSimulations, otherUser.statistics.totalSimulations);
            const experienceRatio = Math.min(user.experience, otherUser.experience) /
                Math.max(user.experience, otherUser.experience);
            const similarity = (scoreRatio * 0.5 + simulationsRatio * 0.3 + experienceRatio * 0.2) * 100;
            let performance;
            const scoreDiff = otherUser.statistics.averageScore - user.statistics.averageScore;
            if (Math.abs(scoreDiff) <= 5)
                performance = 'similar';
            else if (scoreDiff > 0)
                performance = 'better';
            else
                performance = 'worse';
            return {
                user: otherUser,
                similarity,
                performance
            };
        });
        return similarities
            .filter(s => s.similarity >= 60)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 5)
            .map(s => ({
            id: s.user.userId,
            name: s.user.name,
            university: s.user.university,
            similarity: Math.round(s.similarity * 10) / 10,
            performance: s.performance
        }));
    }
    generateGoals(user, allUsers, metrics) {
        const goals = [];
        const improvableMetrics = metrics
            .filter(m => m.percentile < 75 && (m.metric === 'Score Médio' || m.metric === 'Total de Simulados'))
            .sort((a, b) => a.percentile - b.percentile);
        if (improvableMetrics.length > 0) {
            const targetMetric = improvableMetrics[0];
            const allValues = allUsers.map(u => {
                if (targetMetric.metric === 'Score Médio')
                    return u.statistics.averageScore;
                if (targetMetric.metric === 'Total de Simulados')
                    return u.statistics.totalSimulations;
                return 0;
            }).sort((a, b) => a - b);
            const percentil75Index = Math.floor(allValues.length * 0.75);
            const target = allValues[percentil75Index];
            goals.push({
                metric: targetMetric.metric,
                current: targetMetric.userValue,
                target: Math.round(target * 100) / 100,
                percentileTarget: 75,
                timeEstimate: this.estimateTimeToGoal(targetMetric.metric, targetMetric.userValue, target)
            });
        }
        const streakMetric = metrics.find(m => m.metric === 'Sequência de Dias');
        if (streakMetric && streakMetric.userValue < 14) {
            goals.push({
                metric: 'Sequência de Dias',
                current: streakMetric.userValue,
                target: 14,
                percentileTarget: 80,
                timeEstimate: '2 semanas'
            });
        }
        return goals;
    }
    estimateTimeToGoal(metric, current, target) {
        const difference = target - current;
        if (metric === 'Score Médio') {
            if (difference <= 5)
                return '1-2 semanas';
            if (difference <= 10)
                return '3-4 semanas';
            return '1-2 meses';
        }
        if (metric === 'Total de Simulados') {
            const simuladosNeeded = Math.ceil(difference);
            if (simuladosNeeded <= 5)
                return '1 semana';
            if (simuladosNeeded <= 15)
                return '2-3 semanas';
            return '1 mês';
        }
        return 'Algumas semanas';
    }
    invalidateUserComparison(userId) {
        CacheService_1.cacheService.delete(`user_comparison:${userId}`);
        console.log(`🗑️ UserComparison: Cache invalidado para usuário ${userId}`);
    }
    invalidateAllComparisons() {
        CacheService_1.cacheService.invalidatePattern('user_comparison:.*');
        console.log('🧹 UserComparison: Todo cache de comparações invalidado');
    }
}
UserComparisonService.CACHE_TTL = 300;
exports.userComparisonService = new UserComparisonService();
exports.default = UserComparisonService;
//# sourceMappingURL=UserComparisonService.js.map