import express from 'express';
import questaoController from '../controllers/questaoController';
import { authenticateToken } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';

const router = express.Router();

// Rotas públicas (para busca de questões)
router.get('/', questaoController.buscarQuestoes);
router.get('/estatisticas', questaoController.obterEstatisticas);
router.get('/:id', questaoController.obterQuestaoPorId);

// Rotas para simulados (requer autenticação)
router.post('/simulado', authenticateToken, questaoController.buscarParaSimulado);
router.put('/:id/estatisticas', authenticateToken, questaoController.atualizarEstatisticasUso);

// Rotas administrativas (requer admin)
router.post('/', authenticateToken, adminMiddleware, questaoController.criarQuestao);
router.put('/:id', authenticateToken, adminMiddleware, questaoController.atualizarQuestao);
router.delete('/:id', authenticateToken, adminMiddleware, questaoController.deletarQuestao);
router.put('/:id/verificar', authenticateToken, adminMiddleware, questaoController.verificarQuestao);

export default router;