import express from 'express';
import iaGenerativaController from '../controllers/iaGenerativaController';
import { authenticateToken } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';

const router = express.Router();

// Rotas públicas (para status)
router.get('/status', iaGenerativaController.obterStatus);

// Rotas administrativas (requer autenticação e admin)
router.post('/gerar', authenticateToken, adminMiddleware, iaGenerativaController.gerarQuestao);
router.post('/gerar-lote', authenticateToken, adminMiddleware, iaGenerativaController.gerarLoteQuestoes);
router.post('/executar-coleta', authenticateToken, adminMiddleware, iaGenerativaController.executarColeta);
router.post('/parar-coleta', authenticateToken, adminMiddleware, iaGenerativaController.pararColeta);

export default router;