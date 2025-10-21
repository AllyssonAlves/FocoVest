// Script de teste completo para autenticação JWT
const axios = require('axios');

async function testCompleteAuthFlow() {
  try {
    console.log('🔑 === TESTE COMPLETO DE AUTENTICAÇÃO JWT ===\n');
    
    // Passo 1: Login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'allissonalvesvjt@gmail.com',
      password: '123456'
    });

    if (loginResponse.data.success) {
      console.log('✅ Login bem-sucedido!');
      console.log('� Usuário:', loginResponse.data.data.user.email);
      console.log('🆔 ID do usuário:', loginResponse.data.data.user._id);
      
      const token = loginResponse.data.data.token;
      console.log('🎟️ Token obtido (primeiros 50 chars):', token.substring(0, 50) + '...\n');
      
      // Passo 2: Testar endpoint com autenticação
      console.log('2️⃣ Testando endpoint de estatísticas COM autenticação...');
      
      const statsResponse = await axios.get('http://localhost:5000/api/users/detailed-stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (statsResponse.data.success) {
        console.log('✅ Estatísticas obtidas com autenticação JWT!');
        console.log('📊 Dados básicos:', {
          totalSimulations: statsResponse.data.data.basic.totalSimulations,
          averageScore: statsResponse.data.data.basic.averageScore,
          experience: statsResponse.data.data.basic.experience
        });
        console.log('\n🎯 TESTE DE AUTENTICAÇÃO JWT: SUCESSO! ✅');
      } else {
        console.log('❌ Falha ao obter estatísticas:', statsResponse.data.message);
      }
      
    } else {
      console.log('❌ Falha no login:', loginResponse.data.message);
    }
    
    // Passo 3: Testar sem token (deve falhar)
    console.log('\n3️⃣ Testando endpoint SEM autenticação (deve falhar)...');
    
    try {
      await axios.get('http://localhost:5000/api/users/detailed-stats');
      console.log('❌ ERRO: Endpoint permitiu acesso sem token!');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Correto: Endpoint bloqueou acesso sem token (401)');
      } else {
        console.log('❓ Erro inesperado:', error.message);
      }
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    if (error.response) {
      console.error('❌ Resposta do servidor:', error.response.data);
      console.error('❌ Status:', error.response.status);
    }
  }
}

testCompleteAuthFlow();