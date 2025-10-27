# 📁 Estrutura do Projeto FocoVest (Limpo)

## 🗂️ Estrutura Geral

```
focovest/
├── 📁 .git/                    # Controle de versão Git
├── 📁 .github/                 # GitHub Actions e templates
├── 📄 .gitignore              # Arquivos ignorados pelo Git
├── 📁 client/                  # 🟦 Frontend React + TypeScript
├── 📄 COMO_RODAR.md           # 📖 Guia completo de instalação
├── 📄 deploy.sh               # Script de deploy
├── 📁 docs/                   # 📚 Documentação essencial
├── 📄 package.json            # Configuração principal do projeto
├── 📄 package-lock.json       # Lock das dependências
├── 📄 README.md               # Documentação principal
├── 📁 scripts/                # Scripts de deploy
├── 📁 server/                 # 🟩 Backend Node.js + Express
├── 📄 setup.bat              # Setup automático Windows
├── 📄 setup.sh               # Setup automático Linux/Mac
└── 📁 shared/                 # 🔗 Tipos compartilhados
```

## 🟦 Frontend (client/)

```
client/
├── 📄 package.json
├── 📄 vite.config.ts          # Configuração do Vite
├── 📄 tailwind.config.js      # Configuração do Tailwind CSS
├── 📄 tsconfig.json           # Configuração TypeScript
├── 📁 public/                 # Assets públicos
├── 📁 src/
│   ├── 📄 App.tsx             # Componente principal
│   ├── 📄 main.tsx            # Entry point
│   ├── 📁 components/         # Componentes reutilizáveis
│   │   ├── 📁 auth/           # Componentes de autenticação
│   │   ├── 📁 layout/         # Layout e navegação
│   │   └── 📁 questions/      # Componentes de questões
│   ├── 📁 contexts/           # Context API (AuthContext, etc)
│   ├── 📁 hooks/              # Custom hooks
│   ├── 📁 pages/              # Páginas da aplicação
│   ├── 📁 services/           # Serviços de API
│   ├── 📁 types/              # Definições de tipos
│   ├── 📁 utils/              # Utilitários
│   └── 📁 config/             # Configurações
```

## 🟩 Backend (server/)

```
server/
├── 📄 package.json
├── 📄 tsconfig.json           # Configuração TypeScript
├── 📁 src/
│   ├── 📄 server.ts           # Servidor principal
│   ├── 📁 config/             # Configurações (DB, etc)
│   ├── 📁 controllers/        # Controladores das rotas
│   ├── 📁 middleware/         # Middlewares (auth, security, etc)
│   ├── 📁 models/             # Modelos de dados (MongoDB/Mock)
│   ├── 📁 routes/             # Definições de rotas
│   ├── 📁 services/           # Lógica de negócio
│   ├── 📁 types/              # Tipos TypeScript
│   └── 📁 utils/              # Utilitários
└── 📁 logs/                   # Logs do sistema
```

## 🔗 Shared (shared/)

```
shared/
├── 📄 package.json
├── 📄 tsconfig.json
└── 📁 src/
    ├── 📄 types.ts            # Tipos compartilhados
    ├── 📄 constants.ts        # Constantes
    └── 📄 utils.ts            # Utilitários compartilhados
```

## 📚 Documentação (docs/)

```
docs/
├── 📄 DARK_MODE.md           # Documentação do tema escuro
├── 📄 DEPLOY.md              # Guia de deploy
├── 📄 MONITORING.md          # Monitoramento e logs
└── 📄 SECURITY.md            # Documentação de segurança
```

## 🗑️ Arquivos Removidos

### Documentação Temporária
- ❌ `ANALISE_*.md` - Análises temporárias
- ❌ `CONNECTION_*.md` - Diagnósticos de conexão
- ❌ `CORREÇÃO_*.md` - Correções específicas
- ❌ `ETAPA_*.md` - Documentação de etapas
- ❌ `MIGRACAO_*.md` - Documentação de migração
- ❌ `SECURITY_*.md` - Documentação de segurança antiga
- ❌ `SOLUÇÃO_*.md` - Documentação de soluções
- ❌ `URL_FIX_*.md` - Correções de URL
- ❌ `VSCODE_*.md` - Guias do VS Code

### Arquivos de Teste/Debug
- ❌ `test-*.js` - Scripts de teste temporários
- ❌ `*-debug.*` - Arquivos de debug
- ❌ `*-cache.*` - Arquivos de cache

### Scripts Desnecessários
- ❌ `install-performance-deps.*` - Scripts de instalação
- ❌ `dev-start.cmd` - Scripts de desenvolvimento
- ❌ `start-server.bat` - Scripts alternativos

### Servidores Alternativos
- ❌ `fastServer.ts` - Servidor alternativo
- ❌ `lightServer.ts` - Servidor leve
- ❌ `secureServer.ts` - Servidor seguro
- ❌ `simpleServer.*` - Servidor simples
- ❌ `testServer.js` - Servidor de teste

### Páginas Duplicadas/Teste
- ❌ `ApiTestPage.tsx` - Página de teste de API
- ❌ `CompactTimerPage.tsx` - Timer compacto
- ❌ `ImprovedRegisterPage.tsx` - Registro melhorado
- ❌ `RankingPageImproved.tsx` - Ranking melhorado
- ❌ `RankingPageNew.tsx` - Novo ranking
- ❌ `RouteTestPage.tsx` - Teste de rotas
- ❌ `SimulationsPage.tsx` - Simulados antigo
- ❌ `TestPage.tsx` - Página de teste
- ❌ `TimerDemoPage.tsx` - Demo do timer

### Assets/Build Antigos
- ❌ `assets/` - Build antigo
- ❌ `public/` (raiz) - Assets desnecessários
- ❌ `index.html` (raiz) - HTML desnecessário
- ❌ `robots.txt` - Arquivo de robots
- ❌ `_headers` - Headers específicos

### Docker/Deploy Antigos
- ❌ `docker-compose.prod.yml` - Docker de produção
- ❌ `Dockerfile` - Dockerfile antigo
- ❌ `nginx/` - Configuração Nginx

## ✅ Benefícios da Limpeza

1. **📉 Redução de Complexidade**: Menos arquivos para manter
2. **🚀 Performance**: Build mais rápido
3. **🧹 Clareza**: Estrutura mais clara e focada
4. **📦 Tamanho**: Projeto mais leve
5. **🔍 Navegação**: Mais fácil encontrar arquivos relevantes
6. **🛠️ Manutenção**: Menos arquivos para atualizar

## 🎯 Arquivos Essenciais Mantidos

- ✅ **README.md** - Documentação principal
- ✅ **COMO_RODAR.md** - Guia de instalação completo
- ✅ **setup.bat/sh** - Scripts de setup automático
- ✅ **package.json** - Configuração de dependências
- ✅ **src/** - Código fonte funcional
- ✅ **docs/** - Documentação essencial
- ✅ **.gitignore** - Configuração Git atualizada

O projeto agora está **limpo, organizado e focado** apenas nos arquivos essenciais! 🎉