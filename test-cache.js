/**
 * Script de teste para o sistema de cache de estatísticas
 */

const BASE_URL = 'http://localhost:5000/api'

async function testCacheSystem() {
  console.log('🧪 Iniciando testes do sistema de cache...\n')

  try {
    // 1. Fazer login para obter token
    console.log('1. 🔐 Fazendo login...')
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'joao@teste.com',
        password: '123456'
      })
    })

    const loginData = await loginResponse.json()
    
    if (!loginData.success) {
      console.error('❌ Erro no login:', loginData.message)
      return
    }

    const token = loginData.data.token
    console.log('✅ Login realizado com sucesso')
    console.log(`🎟️  Token obtido: ${token.substring(0, 30)}...\n`)

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }

    // 2. Testar warm-up do cache
    console.log('2. 🔥 Testando warm-up do cache...')
    const warmupResponse = await fetch(`${BASE_URL}/users/cache-warmup`, {
      method: 'POST',
      headers
    })
    const warmupData = await warmupResponse.json()
    console.log('✅ Warm-up:', warmupData.message)

    // 3. Obter métricas iniciais do cache
    console.log('\n3. 📊 Obtendo métricas iniciais do cache...')
    const metricsResponse = await fetch(`${BASE_URL}/users/cache-metrics`, { headers })
    const metricsData = await metricsResponse.json()
    console.log('📈 Métricas iniciais:', metricsData.data)

    // 4. Testar estatísticas com cache (primeira chamada - MISS)
    console.log('\n4. 📉 Primeira chamada às estatísticas (esperado: MISS)...')
    const start1 = Date.now()
    const stats1Response = await fetch(`${BASE_URL}/users/detailed-stats-cached`, { headers })
    const stats1Data = await stats1Response.json()
    const time1 = Date.now() - start1
    
    if (stats1Data.success) {
      console.log(`✅ Estatísticas obtidas em ${time1}ms`)
      console.log('📊 Cache calculado em:', stats1Data.meta?.cachedAt)
    } else {
      console.log('❌ Erro ao obter estatísticas:', stats1Data.message)
    }

    // 5. Testar estatísticas com cache (segunda chamada - HIT)
    console.log('\n5. 📈 Segunda chamada às estatísticas (esperado: HIT)...')
    const start2 = Date.now()
    const stats2Response = await fetch(`${BASE_URL}/users/detailed-stats-cached`, { headers })
    const stats2Data = await stats2Response.json()
    const time2 = Date.now() - start2
    
    if (stats2Data.success) {
      console.log(`✅ Estatísticas obtidas em ${time2}ms`)
      console.log('📊 Cache calculado em:', stats2Data.meta?.cachedAt)
    }

    // 6. Comparar tempos de resposta
    console.log('\n6. ⚡ Comparação de performance:')
    console.log(`   Primeira chamada (MISS): ${time1}ms`)
    console.log(`   Segunda chamada (HIT): ${time2}ms`)
    console.log(`   Melhoria de performance: ${((time1 - time2) / time1 * 100).toFixed(1)}%`)

    // 7. Métricas finais do cache
    console.log('\n7. 📊 Métricas finais do cache...')
    const finalMetricsResponse = await fetch(`${BASE_URL}/users/cache-metrics`, { headers })
    const finalMetricsData = await finalMetricsResponse.json()
    console.log('📈 Métricas finais:', finalMetricsData.data)

    // 8. Testar invalidação do cache
    console.log('\n8. 🗑️  Testando invalidação do cache...')
    const invalidateResponse = await fetch(`${BASE_URL}/users/cache-invalidate`, {
      method: 'DELETE',
      headers
    })
    const invalidateData = await invalidateResponse.json()
    console.log('✅ Invalidação:', invalidateData.message)

    // 9. Métricas após invalidação
    console.log('\n9. 📊 Métricas após invalidação...')
    const postInvalidateMetricsResponse = await fetch(`${BASE_URL}/users/cache-metrics`, { headers })
    const postInvalidateMetricsData = await postInvalidateMetricsResponse.json()
    console.log('📈 Métricas pós-invalidação:', postInvalidateMetricsData.data)

    console.log('\n✅ Testes do sistema de cache concluídos com sucesso! 🎉')

  } catch (error) {
    console.error('❌ Erro nos testes:', error)
  }
}

// Executar testes apenas se chamado diretamente
if (require.main === module) {
  testCacheSystem()
}

module.exports = testCacheSystem