<<<<<<< HEAD
# 🚀 Deploy Guide - GitHub Pages

## 📋 Pré-requisitos

- [x] Repositório GitHub criado
- [x] Código com todas as features implementadas
- [x] Testes passando
- [x] Build de produção funcionando

## � Configuração Passo a Passo

### 1. **Preparar o Repositório**

```bash
# Navegar para o diretório do projeto
cd c:\Users\allis\Documents\SimulaFera

# Inicializar git (se ainda não foi feito)
git init

# Adicionar remote origin
git remote add origin https://github.com/SEU_USERNAME/focovest.git

# Verificar se todos os arquivos estão commitados
git add .
git commit -m "🚀 Ready for GitHub Pages deployment"
git push -u origin main
```

### 2. **Configurar GitHub Secrets**

No GitHub.com, vá em: **Settings > Secrets and variables > Actions**

Adicione estas secrets:

```
Nome: REACT_APP_API_URL
Valor: https://api.focovest.com.br

Nome: REACT_APP_ENCRYPTION_KEY  
Valor: sua-chave-super-segura-256-bits

Nome: REACT_APP_ENVIRONMENT
Valor: production
```

### 3. **Habilitar GitHub Pages**

1. Vá em **Settings > Pages**
2. Em **Source**, selecione: **GitHub Actions**
3. Salve as configurações

### 4. **Verificar Deploy**

Após push para main:
1. Vá em **Actions** para ver o workflow rodando
2. Aguarde build completar (≈ 2-3 minutos)
3. Acesse: `https://SEU_USERNAME.github.io/focovest`

## 🛠️ Comandos Úteis

### Build Local
```bash
npm run build
npm run preview
```

### Deploy Manual (se necessário)
```bash
npm run deploy
```

### Verificar Segurança
```bash
npm audit
npm run security:check
```

## 🔍 Verificação Pós-Deploy

### ✅ Checklist de Validação

- [ ] Site carrega corretamente
- [ ] Dark mode funciona
- [ ] Autenticação funciona
- [ ] Simulados carregam
- [ ] Rankings exibem dados
- [ ] Mobile responsivo
- [ ] Performance aceitável
- [ ] Headers de segurança presentes
- [ ] HTTPS habilitado
- [ ] Console sem erros

### 🧪 Testes de Produção

```javascript
// Teste no Console do Browser
console.log('🔒 Security Headers Check:')
console.log('CSP:', document.querySelector('meta[http-equiv="Content-Security-Policy"]'))
console.log('CSRF Token:', document.querySelector('meta[name="csrf-token"]'))

// Teste Dark Mode
document.documentElement.classList.toggle('dark')
```

## 🚨 Troubleshooting

### Problemas Comuns

**1. Build falha:**
```bash
# Limpar cache e reinstalar
npm ci
npm run build
```

**2. 404 em rotas:**
- Verificar se `404.html` está sendo gerado
- Confirmar configuração de SPA no workflow

**3. Environment variables não funcionam:**
- Verificar se secrets estão configuradas
- Confirmar que começam com `REACT_APP_`

**4. Performance lenta:**
```bash
# Analisar bundle
npm run build:analyze
```

## 📊 Monitoramento

### Ferramentas Recomendadas

1. **Google Analytics**: Tráfego e uso
2. **Hotjar**: Comportamento do usuário  
3. **Sentry**: Monitoramento de erros
4. **PageSpeed Insights**: Performance

### Métricas Importantes

- **Core Web Vitals**: LCP, FID, CLS
- **Performance Score**: > 90
- **SEO Score**: > 95
- **Accessibility**: > 95

## 🔄 Atualizações

### Processo de Update

1. Desenvolver feature em branch
2. Criar Pull Request
3. Review de código
4. Merge para main
5. Deploy automático
6. Verificação pós-deploy

### Rollback (se necessário)

```bash
# Reverter último commit
git revert HEAD
git push origin main
```

## 📞 Suporte

- **Documentação**: [docs/](../docs/)
- **Issues**: GitHub Issues
- **Deploy Status**: GitHub Actions
- **Performance**: [PageSpeed Insights](https://pagespeed.web.dev/)

---

**🎉 Pronto! Sua aplicação está no ar com segurança máxima!**
=======
# 🚀 Guia Completo de Deploy - FocoVest Platform

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração do Ambiente](#configuração-do-ambiente)
3. [Deploy Local (Desenvolvimento)](#deploy-local-desenvolvimento)
4. [Deploy em Produção](#deploy-em-produção)
5. [Monitoramento e Operação](#monitoramento-e-operação)
6. [Backup e Recuperação](#backup-e-recuperação)
7. [Solução de Problemas](#solução-de-problemas)
8. [Segurança](#segurança)

---

## 🔧 Pré-requisitos

### Sistema Operacional
- **Desenvolvimento**: Windows, macOS ou Linux
- **Produção**: Ubuntu 20.04+ LTS (recomendado) ou CentOS 8+

### Software Necessário

#### Desenvolvimento
```bash
# Node.js e npm
Node.js 18.x ou superior
npm 8.x ou superior

# Git
Git 2.30 ou superior
```

#### Produção
```bash
# Docker e Docker Compose
Docker 20.10 ou superior
Docker Compose 2.x ou superior

# Nginx (se não usar Docker)
Nginx 1.18 ou superior

# Certificado SSL
Certificado SSL válido para HTTPS
```

### Recursos Mínimos

#### Desenvolvimento
- **CPU**: 2 cores
>>>>>>> 376e361 (Primeiro commit do projeto FocoVest)
- **RAM**: 4GB
- **Disco**: 10GB livre

#### Produção
- **CPU**: 2 cores (4 cores recomendado)
- **RAM**: 8GB (16GB recomendado)
- **Disco**: 50GB SSD
- **Rede**: 100Mbps

---

## ⚙️ Configuração do Ambiente

### 1. Clone do Repositório

```bash
git clone https://github.com/sua-organizacao/focovest.git
cd focovest
```

### 2. Configuração das Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp server/.env.example server/.env

# Edite as configurações
nano server/.env
```

#### Variáveis Obrigatórias

```bash
# Ambiente
NODE_ENV=production

# Servidor
PORT=5000
HOST=0.0.0.0

# URLs permitidas (IMPORTANTE: Configure corretamente!)
ALLOWED_ORIGINS=https://focovest.com,https://www.focovest.com,https://app.focovest.com
FRONTEND_URL=https://app.focovest.com

# Segurança (GERAR CHAVES SEGURAS!)
JWT_SECRET=sua_chave_jwt_de_pelo_menos_32_caracteres_muito_segura
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_GENERAL_MAX=100
RATE_LIMIT_AUTH_MAX=5
RATE_LIMIT_REGISTER_MAX=3

# Para métricas em produção (opcional)
ADMIN_METRICS_TOKEN=token_super_secreto_para_metricas
```

### 3. Configuração de Segurança

#### Gerando Chaves Seguras

```bash
# JWT Secret (Node.js)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Admin Token
openssl rand -hex 32
```

---

## 💻 Deploy Local (Desenvolvimento)

### 1. Instalação das Dependências

```bash
# Instalar dependências de todos os projetos
npm install

# Ou instalar individualmente
cd server && npm install
cd ../client && npm install
cd ../shared && npm install
```

### 2. Inicialização

```bash
# Iniciar em modo de desenvolvimento (client + server)
npm run dev

# Ou iniciar apenas o servidor
npm run server:dev

# Ou iniciar apenas o cliente
npm run client:dev
```

### 3. Verificação

- **Frontend**: http://localhost:3000
- **API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health
- **Métricas**: http://localhost:5000/api/metrics

### 4. Credenciais de Teste

```
📧 joao@teste.com (senha: 123456)
📧 maria@teste.com (senha: senha123)
📧 allissonalvesvjt@gmail.com (senha: 123456)
```

---

## 🌐 Deploy em Produção

### Opção 1: Deploy com Docker (Recomendado)

#### 1. Preparação

```bash
# Clonar repositório no servidor
git clone https://github.com/sua-organizacao/focovest.git
cd focovest

# Configurar variáveis de ambiente
cp server/.env.example server/.env
nano server/.env  # Configure as variáveis de produção
```

#### 2. Deploy Automatizado

```bash
# Tornar o script executável
chmod +x deploy.sh

# Executar deploy completo
./deploy.sh
# Escolha opção 1 (Deploy completo)
```

#### 3. Deploy Manual

```bash
# Build das imagens
docker-compose -f docker-compose.prod.yml build

# Iniciar serviços
docker-compose -f docker-compose.prod.yml up -d

# Verificar status
docker-compose -f docker-compose.prod.yml ps
```

### Opção 2: Deploy Tradicional (Sem Docker)

#### 1. Preparação do Sistema

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y nginx nodejs npm git

# CentOS/RHEL
sudo yum update
sudo yum install -y nginx nodejs npm git
```

#### 2. Build da Aplicação

```bash
# Build completo
npm run build

# Ou build individual
npm run build:shared
npm run build:client
npm run build:server
```

#### 3. Configuração do Nginx

```bash
# Copiar configuração
sudo cp nginx/sites-available/focovest.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/focovest.conf /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

#### 4. Configuração do Processo (PM2)

```bash
# Instalar PM2
npm install -g pm2

# Iniciar aplicação
pm2 start server/dist/server.js --name focovest

# Configurar autostart
pm2 startup
pm2 save
```

---

## 📊 Monitoramento e Operação

### 1. Verificação de Status

#### Com Docker
```bash
# Status dos containers
docker-compose -f docker-compose.prod.yml ps

# Logs em tempo real
docker-compose -f docker-compose.prod.yml logs -f

# Logs específicos
docker-compose -f docker-compose.prod.yml logs focovest
```

#### Sem Docker
```bash
# Status do serviço
systemctl status nginx
pm2 status

# Logs
pm2 logs focovest
tail -f /var/log/nginx/focovest_access.log
```

### 2. Métricas da Aplicação

#### Endpoint de Métricas
```bash
# Health Check
curl http://localhost:5000/api/health

# Métricas detalhadas (com token)
curl -H "X-Admin-Token: SEU_ADMIN_TOKEN" http://localhost:5000/api/metrics
```

#### Métricas Importantes
- **Requests**: Total, taxa de sucesso, tempo médio de resposta
- **Usuários**: Ativos, registros, logins
- **Performance**: Uso de memória, uptime, CPU
- **Erros**: Contagem total, erros recentes

### 3. Alertas e Monitoramento

#### Configuração de Alertas Básicos

```bash
# Script de monitoramento simples
#!/bin/bash
# monitor.sh

# Verificar se a API está respondendo
if ! curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "ALERT: API não está respondendo!" | mail -s "FocoVest Down" admin@focovest.com
fi

# Verificar uso de memória
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100}')
if [ $MEMORY_USAGE -gt 90 ]; then
    echo "ALERT: Uso de memória alto: ${MEMORY_USAGE}%" | mail -s "FocoVest Memory Alert" admin@focovest.com
fi
```

```bash
# Agendar no crontab
crontab -e
# Adicionar:
# */5 * * * * /path/to/monitor.sh
```

---

## 💾 Backup e Recuperação

### 1. Backup Automatizado (Com Script)

```bash
# Usar o script de deploy
./deploy.sh
# Escolha opção 7 (Backup dos dados)
```

### 2. Backup Manual

#### Backup de Configurações
```bash
# Criar diretório de backup
mkdir -p backups/$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=backups/$(date +%Y%m%d_%H%M%S)

# Backup das configurações
tar czf $BACKUP_DIR/config.tar.gz server/.env nginx/ docker-compose.prod.yml

# Backup de logs
tar czf $BACKUP_DIR/logs.tar.gz logs/
```

#### Backup de Dados (Se usar MongoDB)
```bash
# Backup do MongoDB
docker exec focovest-mongodb mongodump --out /backup
docker cp focovest-mongodb:/backup $BACKUP_DIR/mongodb-backup
```

### 3. Estratégia de Backup Recomendada

#### Frequência
- **Configurações**: Semanal
- **Logs**: Diário
- **Dados**: Diário (quando implementar banco de dados)

#### Retenção
- **Backups diários**: 30 dias
- **Backups semanais**: 12 semanas
- **Backups mensais**: 12 meses

#### Automatização com Cron
```bash
# Backup diário às 2:00 AM
0 2 * * * /path/to/focovest/backup-daily.sh

# Limpeza de backups antigos
0 3 * * 0 find /path/to/backups -name "*.tar.gz" -mtime +30 -delete
```

---

## 🔍 Solução de Problemas

### Problemas Comuns

#### 1. Erro 500 - Internal Server Error

**Diagnóstico**:
```bash
# Verificar logs
docker-compose logs focovest
# ou
pm2 logs focovest
```

**Soluções**:
- Verificar variáveis de ambiente
- Verificar se todas as dependências estão instaladas
- Verificar espaço em disco
- Reiniciar o serviço

#### 2. Rate Limiting Muito Restritivo

**Sintomas**: Erro 429 (Too Many Requests)

**Solução**:
```bash
# Ajustar limites no .env
RATE_LIMIT_GENERAL_MAX=200
RATE_LIMIT_AUTH_MAX=10

# Reiniciar aplicação
docker-compose restart focovest
```

#### 3. CORS Error

**Sintomas**: Blocked by CORS policy

**Solução**:
```bash
# Verificar ALLOWED_ORIGINS no .env
ALLOWED_ORIGINS=https://seudominio.com,https://www.seudominio.com

# Reiniciar aplicação
```

#### 4. Alto Uso de Memória

**Diagnóstico**:
```bash
# Verificar uso de recursos
docker stats
# ou
htop
```

**Soluções**:
- Reiniciar aplicação periodicamente
- Otimizar queries
- Adicionar mais RAM
- Implementar cache

### Comandos Úteis de Debug

```bash
# Verificar portas em uso
netstat -tlnp | grep :5000

# Verificar processos
ps aux | grep node

# Verificar espaço em disco
df -h

# Verificar logs do sistema
journalctl -u nginx
journalctl -xe

# Testar conectividade
curl -I http://localhost:5000/api/health
telnet localhost 5000
```

---

## 🔒 Segurança

### 1. Práticas de Segurança Implementadas

#### Middleware de Segurança
- **Helmet**: Headers de segurança HTTP
- **CORS**: Controle de origem cruzada
- **Rate Limiting**: Proteção contra abuso
- **Input Validation**: Validação e sanitização de entrada
- **Password Hashing**: Bcrypt com salt rounds altos

#### Configurações de Segurança
- **JWT Expiration**: Tokens com expiração
- **HTTPS**: Força redirecionamento para HTTPS
- **Security Headers**: CSP, HSTS, X-Frame-Options
- **Input Sanitization**: Proteção contra XSS e injection

### 2. Checklist de Segurança para Produção

#### Antes do Deploy
- [ ] Gerar JWT_SECRET seguro (64+ caracteres)
- [ ] Configurar ALLOWED_ORIGINS corretamente
- [ ] Definir ADMIN_METRICS_TOKEN único
- [ ] Configurar certificado SSL válido
- [ ] Testar rate limiting
- [ ] Verificar headers de segurança

#### Pós-Deploy
- [ ] Verificar HTTPS funcionando
- [ ] Testar endpoints com ferramentas de segurança
- [ ] Configurar firewall (apenas portas 80, 443, 22)
- [ ] Configurar fail2ban
- [ ] Monitorar logs de segurança
- [ ] Backup das configurações

### 3. Atualizações de Segurança

#### Dependências
```bash
# Verificar vulnerabilidades
npm audit

# Corrigir vulnerabilidades
npm audit fix

# Atualizar dependências
npm update
```

#### Sistema
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade

# CentOS/RHEL
sudo yum update
```

### 4. Monitoramento de Segurança

#### Logs Importantes
- Tentativas de login falhadas
- Rate limiting ativado
- Erros de validação
- Acessos negados por CORS

#### Alertas Recomendados
- Múltiplas tentativas de login falhadas
- Rate limiting ativado frequentemente
- Erros 403/401 em massa
- Tentativas de acesso a endpoints não existentes

---

## 🆘 Suporte e Contatos

### Documentação Adicional
- **API Documentation**: `/docs/api.md`
- **Architecture**: `/docs/architecture.md`
- **Changelog**: `/CHANGELOG.md`

### Contatos
- **Desenvolvedor**: seu-email@focovest.com
- **Ops**: ops@focovest.com
- **Suporte**: suporte@focovest.com

### Links Úteis
- **Repositório**: https://github.com/sua-org/focovest
- **Issues**: https://github.com/sua-org/focovest/issues
- **Wiki**: https://github.com/sua-org/focovest/wiki

---

## 📚 Apêndices

### A. Estrutura de Arquivos
```
focovest/
├── client/                 # React Frontend
├── server/                 # Node.js Backend
├── shared/                 # Tipos compartilhados
├── nginx/                  # Configurações Nginx
├── docker-compose.prod.yml # Docker para produção
├── Dockerfile             # Imagem Docker
├── deploy.sh              # Script de deploy
└── docs/                  # Documentação
```

### B. Portas Utilizadas
- **3000**: Frontend (desenvolvimento)
- **5000**: Backend API
- **80**: HTTP (Nginx)
- **443**: HTTPS (Nginx)

### C. Variáveis de Ambiente Completas
Veja `server/.env.example` para lista completa com descrições.

---

*Última atualização: $(date +'%Y-%m-%d')*
*Versão: 1.0.0*