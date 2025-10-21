"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = void 0;
const types_1 = require("../../../shared/dist/types");
const adminMiddleware = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Acesso negado. Faça login primeiro.'
        });
        return;
    }
    if (req.user.role !== types_1.UserRole.ADMIN) {
        res.status(403).json({
            success: false,
            message: 'Acesso negado. Apenas administradores podem realizar esta ação.'
        });
        return;
    }
    next();
};
exports.adminMiddleware = adminMiddleware;
//# sourceMappingURL=admin.js.map