"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const MockSimulationService_1 = require("../services/MockSimulationService");
const router = express_1.default.Router();
router.get('/', async (req, res) => {
    try {
        const filters = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 12
        };
        const result = await MockSimulationService_1.mockSimulationService.getSimulations(filters);
        return res.json(result);
    }
    catch (error) {
        console.error('❌ Erro ao buscar simulados:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🔍 Buscando simulado com ID:', id);
        const simulation = await MockSimulationService_1.mockSimulationService.getSimulationById(id);
        if (!simulation) {
            return res.status(404).json({ error: 'Simulado não encontrado' });
        }
        console.log('✅ Simulado encontrado:', simulation.title);
        return res.json({ data: simulation });
    }
    catch (error) {
        console.error('❌ Erro ao buscar simulado:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
router.get('/my', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user?._id?.toString();
        if (!userId) {
            return res.status(401).json({ error: 'Usuário não encontrado' });
        }
        const userSimulations = await MockSimulationService_1.mockSimulationService.getUserSimulations(userId);
        return res.json({ data: userSimulations });
    }
    catch (error) {
        console.error('❌ Erro ao buscar simulados do usuário:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
router.post('/', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user?._id?.toString();
        if (!userId) {
            return res.status(401).json({ error: 'Usuário não encontrado' });
        }
        const simulationData = {
            ...req.body,
            createdBy: userId
        };
        console.log('🎯 Criando novo simulado:', simulationData.title);
        const newSimulation = await MockSimulationService_1.mockSimulationService.createSimulation(simulationData);
        return res.status(201).json({
            success: true,
            data: newSimulation,
            message: 'Simulado criado com sucesso'
        });
    }
    catch (error) {
        console.error('❌ Erro ao criar simulado:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=simulations.js.map