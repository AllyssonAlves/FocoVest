# 🚀 Como Rodar o Projeto FocoVest

## 📋 Pré-requisitos

- **Node.js** versão 18 ou superior
- **npm** (vem com o Node.js)
- **Git** (para clonar o repositório)

## 🛠️ Instalação Inicial

### 1. Clonar o Repositório
```bash
git clone https://github.com/AllyssonAlves/FocoVest.git
cd FocoVest
```

### 2. Instalar Dependências
```bash
# Instalar todas as dependências (raiz, cliente, servidor e shared)
npm run install:all
```

**Ou instalar manualmente:**
```bash
npm install                    # Dependências da raiz
cd client && npm install      # Dependências do frontend
cd ../server && npm install   # Dependências do backend
cd ../shared && npm install   # Dependências compartilhadas
cd ..                         # Voltar para a raiz
```

## 🚀 Executando o Projeto

### Opção 1: Executar Tudo Junto (Recomendado)
```bash
npm run dev
```
Este comando inicia:
- 🟦 **Servidor** na porta 5000
- 🟪 **Cliente** na porta 5173

### Opção 2: Executar Separadamente

#### Terminal 1 - Servidor Backend
```bash
npm run dev:server-only
```
**Ou:**
```bash
cd server
npm run dev
```

#### Terminal 2 - Cliente Frontend  
```bash
npm run dev:client-only
```
**Ou:**
```bash
cd client  
npm run dev
```

## 🌐 Acessando a Aplicação

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## 🔑 Credenciais de Teste

O sistema roda com **MockDB** (banco em memória) e já vem com usuários pré-cadastrados:

| Email | Senha | Descrição |
|-------|--------|-----------|
| `joao@teste.com` | `123456` | Usuário de teste |
| `maria@teste.com` | `senha123` | Usuário de teste |
| `allissonalvesvjt@gmail.com` | `123456` | Admin de teste |

## 📝 Scripts Disponíveis

### Desenvolvimento
- `npm run dev` - Executa servidor + cliente
- `npm run dev:server-only` - Apenas servidor
- `npm run dev:client-only` - Apenas cliente
- `npm run dev:verbose` - Com timestamps detalhados

### Build
- `npm run build` - Build completo (shared + client + server)
- `npm run build:client` - Build apenas do frontend
- `npm run build:server` - Build apenas do backend

### Testes
- `npm run test` - Executa todos os testes
- `npm run test:client` - Testes do frontend
- `npm run test:server` - Testes do backend

### Docker
- `npm run docker:dev` - Ambiente Docker para desenvolvimento
- `npm run docker:prod` - Ambiente Docker para produção

## 🔧 Configuração de Desenvolvimento

### Portas Utilizadas
- **5000**: Servidor Backend (Express + Node.js)
- **5173**: Cliente Frontend (Vite + React)
- **24678**: Hot Module Replacement (HMR) do Vite

### Proxy Automático
O Vite está configurado para fazer proxy das requisições `/api/*` para `localhost:5000`, então:
- `http://localhost:5173/api/auth/login` → `http://localhost:5000/api/auth/login`

## 🛡️ Recursos de Segurança Implementados

- ✅ **Sistema de Sessões** por dispositivo
- ✅ **Logout Avançado** (dispositivo atual vs todos)
- ✅ **Detecção de Novos Dispositivos**
- ✅ **Rate Limiting** e proteção DDoS
- ✅ **Validação de Dados** robusta
- ✅ **CORS** configurado
- ✅ **Monitoramento** de segurança

## 🗃️ Banco de Dados

### Modo Desenvolvimento (Atual)
- Usa **MockDB** (banco em memória)
- 18 usuários de teste pré-criados
- 38 questões de exemplo
- 10 simulados de exemplo
- Dados resetam ao reiniciar o servidor

### Modo Produção (Opcional)
Para usar MongoDB real:
1. Instalar MongoDB
2. Configurar variáveis de ambiente
3. O sistema detecta automaticamente e usa MongoDB

## 🚨 Solução de Problemas

### "Failed to fetch" / Erro de Conexão
```bash
# Verificar se ambos estão rodando:
# Terminal 1:
npm run dev:server-only

# Terminal 2: 
npm run dev:client-only
```

### Porta em Uso
```bash
# Windows - Verificar porta 5000
netstat -an | findstr :5000

# Matar processo na porta 5000
npx kill-port 5000
```

### Limpar Cache
```bash
# Limpar node_modules e reinstalar
rm -rf node_modules client/node_modules server/node_modules
npm run install:all

# Limpar cache do npm
npm cache clean --force
```

## 🧪 Testando as Funcionalidades

### 1. Login Básico
- Acesse http://localhost:5173
- Use `joao@teste.com` / `123456`
- Teste opção "Lembrar de mim"

### 2. Logout Avançado
- Após login, clique no perfil (canto superior direito)
- Clique em "Sair"
- Teste as opções: "Sair deste dispositivo" vs "Sair de todos os dispositivos"

### 3. Sistema de Segurança
- Acesse http://localhost:5173/security (após login)
- Veja sessões ativas
- Gerencie dispositivos conectados

## 🔄 Atualizações e Deploy

### Atualizar Dependências
```bash
npm update
cd client && npm update
cd ../server && npm update
```

### Deploy
```bash
npm run build        # Build de produção
npm run predeploy    # Preparar deploy
npm run deploy       # Deploy para GitHub Pages
```

## 📞 Suporte

Se encontrar problemas:
1. Verifique se Node.js está instalado (`node --version`)
2. Confirme que as portas 5000 e 5173 estão livres
3. Execute `npm run install:all` novamente
4. Reinicie ambos os servidores

---

**🎯 Resultado Final**: Sistema completo rodando com autenticação avançada, segurança robusta e interface moderna!