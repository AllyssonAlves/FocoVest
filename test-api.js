// Teste simples da API
const http = require('http');

function testAPI(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(`\n=== Teste ${path} ===`);
        console.log(`Status: ${res.statusCode}`);
        console.log(`Resposta: ${data}`);
        resolve({ status: res.statusCode, data: data });
      });
    });

    req.on('error', (error) => {
      console.error(`Erro na requisição para ${path}:`, error.message);
      reject(error);
    });

    req.end();
  });
}

async function runTests() {
  try {
    console.log('🧪 Iniciando testes da API...');
    
    // Teste 1: Listar simulados
    await testAPI('/api/simulations');
    
    // Teste 2: Buscar simulado específico
    await testAPI('/api/simulations/3');
    
    console.log('\n✅ Testes concluídos!');
  } catch (error) {
    console.error('❌ Erro nos testes:', error.message);
  }
}

runTests();