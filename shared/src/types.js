"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AchievementCategory = exports.RankingPeriod = exports.SimulationType = exports.Difficulty = exports.Subject = exports.University = void 0;
var University;
(function (University) {
    University["UVA"] = "UVA";
    University["UECE"] = "UECE";
    University["UFC"] = "UFC";
    University["URCA"] = "URCA";
    University["IFCE"] = "IFCE";
})(University || (exports.University = University = {}));
var Subject;
(function (Subject) {
    Subject["MATHEMATICS"] = "MATHEMATICS";
    Subject["PORTUGUESE"] = "PORTUGUESE";
    Subject["LITERATURE"] = "LITERATURE";
    Subject["PHYSICS"] = "PHYSICS";
    Subject["CHEMISTRY"] = "CHEMISTRY";
    Subject["BIOLOGY"] = "BIOLOGY";
    Subject["HISTORY"] = "HISTORY";
    Subject["GEOGRAPHY"] = "GEOGRAPHY";
    Subject["PHILOSOPHY"] = "PHILOSOPHY";
    Subject["SOCIOLOGY"] = "SOCIOLOGY";
    Subject["ENGLISH"] = "ENGLISH";
    Subject["SPANISH"] = "SPANISH";
    Subject["ARTS"] = "ARTS";
    Subject["PHYSICAL_EDUCATION"] = "PHYSICAL_EDUCATION";
})(Subject || (exports.Subject = Subject = {}));
var Difficulty;
(function (Difficulty) {
    Difficulty["EASY"] = "EASY";
    Difficulty["MEDIUM"] = "MEDIUM";
    Difficulty["HARD"] = "HARD";
    Difficulty["EXPERT"] = "EXPERT";
})(Difficulty || (exports.Difficulty = Difficulty = {}));
var SimulationType;
(function (SimulationType) {
    SimulationType["GENERAL"] = "GENERAL";
    SimulationType["SUBJECT_SPECIFIC"] = "SUBJECT_SPECIFIC";
    SimulationType["UNIVERSITY_SPECIFIC"] = "UNIVERSITY_SPECIFIC";
    SimulationType["CUSTOM"] = "CUSTOM";
    SimulationType["ADAPTIVE"] = "ADAPTIVE";
})(SimulationType || (exports.SimulationType = SimulationType = {}));
var RankingPeriod;
(function (RankingPeriod) {
    RankingPeriod["DAILY"] = "DAILY";
    RankingPeriod["WEEKLY"] = "WEEKLY";
    RankingPeriod["MONTHLY"] = "MONTHLY";
    RankingPeriod["ALL_TIME"] = "ALL_TIME";
})(RankingPeriod || (exports.RankingPeriod = RankingPeriod = {}));
var AchievementCategory;
(function (AchievementCategory) {
    AchievementCategory["SIMULATION"] = "SIMULATION";
    AchievementCategory["ACCURACY"] = "ACCURACY";
    AchievementCategory["STREAK"] = "STREAK";
    AchievementCategory["TIME"] = "TIME";
    AchievementCategory["SOCIAL"] = "SOCIAL";
    AchievementCategory["SPECIAL"] = "SPECIAL";
})(AchievementCategory || (exports.AchievementCategory = AchievementCategory = {}));
//# sourceMappingURL=types.js.map