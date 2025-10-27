import express from 'express'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { mockSimulationService } from '../services/MockSimulationService'

const router = express.Router()

// GET /api/simulations - Listar simulados
router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    const filters = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 12,
      university: req.query.university as any,
      subject: req.query.subject as string,
      difficulty: req.query.difficulty as any
    }

    const result = await mockSimulationService.getSimulations(filters)
    return res.json(result)
  } catch (error: any) {
    console.error('❌ Erro ao buscar simulados:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// GET /api/simulations/:id - Buscar simulado por ID
router.get('/:id', async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params
    console.log('🔍 Buscando simulado com ID:', id)
    const simulation = await mockSimulationService.getSimulationById(id)
    
    if (!simulation) {
      return res.status(404).json({ error: 'Simulado não encontrado' })
    }

    console.log('✅ Simulado encontrado:', simulation.title)
    return res.json({ data: simulation })
  } catch (error: any) {
    console.error('❌ Erro ao buscar simulado:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// GET /api/simulations/my - Simulados do usuário atual
router.get('/my', requireAuth, async (req: AuthRequest, res: express.Response) => {
  try {
    const userId = req.user?._id?.toString()
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não encontrado' })
    }

    const userSimulations = await mockSimulationService.getUserSimulations(userId)
    return res.json({ data: userSimulations })
  } catch (error: any) {
    console.error('❌ Erro ao buscar simulados do usuário:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// POST /api/simulations - Criar novo simulado
router.post('/', requireAuth, async (req: AuthRequest, res: express.Response) => {
  try {
    const userId = req.user?._id?.toString()
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não encontrado' })
    }

    const simulationData = {
      ...req.body,
      createdBy: userId
    }

    console.log('🎯 Criando novo simulado:', simulationData.title)
    
    // TODO: Implementar criação no MockSimulationService
    const newSimulation = await mockSimulationService.createSimulation(simulationData)
    
    return res.status(201).json({
      success: true,
      data: newSimulation,
      message: 'Simulado criado com sucesso'
    })
  } catch (error: any) {
    console.error('❌ Erro ao criar simulado:', error)
    return res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      message: error.message 
    })
  }
})

export default router