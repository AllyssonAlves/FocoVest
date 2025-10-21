"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const iaGenerativaController_1 = __importDefault(require("../controllers/iaGenerativaController"));
const auth_1 = require("../middleware/auth");
const admin_1 = require("../middleware/admin");
const router = express_1.default.Router();
router.get('/status', iaGenerativaController_1.default.obterStatus);
router.post('/gerar', auth_1.authenticateToken, admin_1.adminMiddleware, iaGenerativaController_1.default.gerarQuestao);
router.post('/gerar-lote', auth_1.authenticateToken, admin_1.adminMiddleware, iaGenerativaController_1.default.gerarLoteQuestoes);
router.post('/executar-coleta', auth_1.authenticateToken, admin_1.adminMiddleware, iaGenerativaController_1.default.executarColeta);
router.post('/parar-coleta', auth_1.authenticateToken, admin_1.adminMiddleware, iaGenerativaController_1.default.pararColeta);
exports.default = router;
//# sourceMappingURL=iaGenerativaRoutes.js.map