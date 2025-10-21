// Teste direto do MockSimulationService
const MockSimulationService = require('./server/src/services/MockSimulationService').default;

async function testMockService() {
  try {
    console.log('🧪 Testando MockSimulationService...');
    
    const service = new MockSimulationService();
    
    // Teste 1: Listar simulados
    console.log('\n1. Testando getSimulations()...');
    const simulations = await service.getSimulations();
    console.log(`✅ Total de simulados: ${simulations.totalSimulations}`);
    console.log(`📋 IDs dos simulados: ${simulations.simulations.map(s => s._id).join(', ')}`);
    
    // Teste 2: Buscar simulado por ID
    console.log('\n2. Testando getSimulationById("3")...');
    const simulation = await service.getSimulationById('3');
    console.log(`✅ Simulado encontrado: ${simulation.title}`);
    console.log(`📋 ID: ${simulation._id}`);
    
    console.log('\n✅ Todos os testes passaram!');
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testMockService();