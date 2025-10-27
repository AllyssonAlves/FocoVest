# 📊 Sistema de Monitoramento de Produção - FocoVest

## Visão Geral
Sistema completo de monitoramento, métricas e alertas para ambiente de produção.

## Funcionalidades Implementadas

### 🔍 Monitoramento de Requisições
- **Métricas em tempo real**: RPM, tempo de resposta médio, taxa de erro
- **Detecção de requisições lentas**: Alertas automáticos para requests > 2s
- **Tracking de usuários ativos**: Contagem de usuários únicos por período
- **Logging estruturado**: Winston com contexto de requisição

### 🏥 Health Checks Avançados
- **Status do sistema**: CPU, memória, disco, banco de dados
- **Alertas automáticos**: Critical/Warning baseado em thresholds
- **Endpoint público**: `/api/health` para load balancers
- **Endpoint simples**: `/api/health/simple` para verificações básicas

### 📈 Sistema de Métricas
- **Endpoint protegido**: `/api/monitoring/metrics` com API key
- **Métricas de performance**: Tempo de resposta, throughput, erros
- **Alertas contextuais**: Sistema de notificações com níveis de severidade
- **Retenção inteligente**: Limpeza automática de dados antigos

### 🛡️ Segurança e Performance
- **Rate limiting inteligente**: Baseado em métricas de uso
- **Detecção de anomalias**: Padrões suspeitos de tráfego
- **Cache otimizado**: Warmup não-bloqueante com timeout
- **Logs estruturados**: Substituição completa de console.log

## Configuração

### Variáveis de Ambiente
```bash
# Monitoramento
ENABLE_CACHE_WARMUP=true
MONITORING_API_KEY=sua_chave_api_de_monitoramento_aqui
ADMIN_METRICS_TOKEN=seu_token_admin_para_metricas_aqui
```

### Endpoints Disponíveis
- `GET /api/health` - Health check completo
- `GET /api/health/simple` - Health check básico  
- `GET /api/monitoring/metrics` - Métricas detalhadas (requer API key)

## Uso em Desenvolvimento vs Produção

### Desenvolvimento
- Monitoramento simplificado
- Logs no console com cores
- Cache warmup reduzido (2 usuários)
- Servidor rápido disponível: `npm run dev:fast`

### Produção
- Monitoramento completo ativado
- Logs em arquivos estruturados
- Cache warmup completo (5 usuários)
- Proteção de endpoints sensíveis

## Alertas Implementados

### ⚠️ Warning
- Requisições lentas (> 2 segundos)
- Uso de memória > 70%
- Taxa de erro > 5%

### 🚨 Critical
- Uso de memória > 90%
- Taxa de erro > 10%
- Sistema indisponível

## Integração

O sistema é automaticamente inicializado no startup do servidor:
- Em desenvolvimento: logs no console
- Em produção: monitoramento completo + logs em arquivo
- Background jobs: limpeza de usuários inativos a cada 5 minutos

## Benefícios

1. **Visibilidade completa** do sistema em produção
2. **Detecção proativa** de problemas de performance
3. **Logs estruturados** para debugging eficiente
4. **Alertas contextuais** para resposta rápida a incidentes
5. **Métricas históricas** para análise de tendências
6. **Zero impact** no desenvolvimento com servidor rápido