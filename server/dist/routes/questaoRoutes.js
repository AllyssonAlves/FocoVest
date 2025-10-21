"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const questaoController_1 = __importDefault(require("../controllers/questaoController"));
const auth_1 = require("../middleware/auth");
const admin_1 = require("../middleware/admin");
const router = express_1.default.Router();
router.get('/', questaoController_1.default.buscarQuestoes);
router.get('/estatisticas', questaoController_1.default.obterEstatisticas);
router.get('/:id', questaoController_1.default.obterQuestaoPorId);
router.post('/simulado', auth_1.authenticateToken, questaoController_1.default.buscarParaSimulado);
router.put('/:id/estatisticas', auth_1.authenticateToken, questaoController_1.default.atualizarEstatisticasUso);
router.post('/', auth_1.authenticateToken, admin_1.adminMiddleware, questaoController_1.default.criarQuestao);
router.put('/:id', auth_1.authenticateToken, admin_1.adminMiddleware, questaoController_1.default.atualizarQuestao);
router.delete('/:id', auth_1.authenticateToken, admin_1.adminMiddleware, questaoController_1.default.deletarQuestao);
router.put('/:id/verificar', auth_1.authenticateToken, admin_1.adminMiddleware, questaoController_1.default.verificarQuestao);
exports.default = router;
//# sourceMappingURL=questaoRoutes.js.map