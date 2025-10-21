# FocoVest
FocoVest A plataforma de simulados que te prepara para o ENEM e vestibulares UVA, UECE, UFC, URCA e IFCE  Compete com outros estudantes, acompanhe seu progresso e conquiste sua vaga na universidade dos seus sonhos!
=======
# 🎯 FocoVest - Plataforma de Simulados

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6%2B-green)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

> **Plataforma completa de simulados online para preparação de vestibulares das universidades UVA, UECE, UFC, URCA e IFCE com sistema de competição e gamificação.**

## 📋 Sobre o Projeto

O **FocoVest** é uma plataforma inovadora que visa revolucionar a preparação para vestibulares através de:

- 🎮 **Gamificação**: Sistema de pontos, níveis, conquistas e rankings
- 🏆 **Competição Saudável**: Rankings gerais e por universidade
- 📊 **Analytics Avançados**: Relatórios detalhados de desempenho
- 🎯 **Simulados Adaptativos**: Questões personalizadas baseadas no desempenho
- 📱 **Interface Moderna**: Design responsivo e experiência intuitiva

### 🎓 Universidades Focadas

- **UVA** - Universidade Estadual Vale do Acaraú
- **UECE** - Universidade Estadual do Ceará  
- **UFC** - Universidade Federal do Ceará
- **URCA** - Universidade Regional do Cariri
- **IFCE** - Instituto Federal do Ceará

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 18** com TypeScript
- **Vite** para build otimizado
- **Tailwind CSS** para estilização
- **Framer Motion** para animações
- **React Query** para gerenciamento de estado
- **React Hook Form** para formulários
- **Recharts** para gráficos e relatórios

### Backend
- **Node.js** com Express.js
- **TypeScript** para tipagem estática
- **MongoDB** com Mongoose ODM
- **JWT** para autenticação
- **bcrypt** para hash de senhas
- **Helmet** e middleware de segurança

### Ferramentas de Desenvolvimento
- **ESLint** e **Prettier** para padronização de código
- **Jest** para testes unitários
- **Docker** para containerização
- **GitHub Actions** para CI/CD

## 📁 Estrutura do Projeto

```
focovest/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── hooks/          # Custom hooks
│   │   ├── store/          # Gerenciamento de estado
│   │   └── utils/          # Utilitários do frontend
│   └── public/             # Arquivos estáticos
├── server/                 # Backend Node.js
│   ├── src/
│   │   ├── controllers/    # Controladores da API
│   │   ├── models/         # Modelos do MongoDB
│   │   ├── routes/         # Rotas da API
│   │   ├── middleware/     # Middlewares personalizados
│   │   └── utils/          # Utilitários do backend
│   └── uploads/            # Arquivos enviados
├── shared/                 # Tipos e utils compartilhados
├── docs/                   # Documentação
└── docker-compose.yml      # Configuração Docker
```

## 🛠️ Instalação e Configuração

### Pré-requisitos

- **Node.js** 18+ 
- **npm** 9+
- **MongoDB** 6+ (local ou Atlas)
- **Git**

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/focovest.git
cd focovest
```

### 2. Instale as Dependências

```bash
# Instalar todas as dependências do monorepo
npm run install:all

# Ou instalar individualmente
npm install                    # Dependências raiz
npm run install:client        # Frontend
npm run install:server        # Backend  
npm run install:shared        # Shared
```

### 3. Configuração do Ambiente

Crie os arquivos `.env` necessários:

**Server (.env)**:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/focovest

# JWT
JWT_SECRET=seu-jwt-secret-super-seguro
JWT_EXPIRES_IN=7d

# Bcrypt
BCRYPT_SALT_ROUNDS=12

# Server
PORT=5000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 4. Execute o Projeto

#### Desenvolvimento (Ambos simultaneamente)
```bash
npm run dev
```

#### Ou execute separadamente:
```bash
# Backend (porta 5000)
npm run server:dev

# Frontend (porta 3000)  
npm run client:dev
```

### 5. Acesse a Aplicação

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Testes do frontend
npm run test:client

# Testes do backend
npm run test:server

# Testes com coverage
npm run test:coverage
```

## 🐳 Docker

### Desenvolvimento
```bash
npm run docker:dev
```

### Produção  
```bash
npm run docker:prod
```

## 📊 Funcionalidades Principais

### 👤 Sistema de Usuários
- [x] Cadastro e autenticação
- [x] Perfis personalizáveis
- [x] Sistema de níveis e experiência
- [x] Conquistas e badges

### 📝 Banco de Questões
- [x] Questões categorizadas por matéria
- [x] Filtros por universidade e dificuldade
- [x] Sistema de tags e busca avançada
- [x] Estatísticas de desempenho por questão

### 🎯 Simulados
- [x] Simulados gerais e por matéria
- [x] Cronômetro e controle de tempo
- [x] Correção automática
- [x] Explicações detalhadas

### 🏆 Rankings e Competição
- [x] Rankings gerais e por categoria
- [x] Batalhas entre usuários  
- [x] Ligas de competição
- [x] Sistema de pontuação

### 📈 Relatórios e Analytics
- [x] Desempenho por matéria
- [x] Evolução temporal
- [x] Comparação com outros usuários
- [x] Sugestões personalizadas de estudo

### 👨‍💼 Painel Administrativo
- [x] Gestão de questões
- [x] Moderação de conteúdo
- [x] Analytics da plataforma
- [x] Gerenciamento de usuários

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Commit
Utilizamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração de código
- `test:` Testes
- `chore:` Tarefas de manutenção

## 📋 Roadmap

- [ ] **v1.1**: Sistema de redação com correção automática
- [ ] **v1.2**: Aplicativo mobile React Native
- [ ] **v1.3**: Inteligência artificial para recomendações
- [ ] **v1.4**: Sistema de aulas ao vivo
- [ ] **v1.5**: Marketplace de questões da comunidade

## 🎨 Inspirações e Referências

- **Khan Academy**: Sistema de progressão e exercícios
- **Brilliant.org**: Gamificação e interface interativa  
- **Descomplica/Stoodi**: Foco em vestibulares brasileiros
- **Duolingo**: Sistema de conquistas e streaks

## 📄 Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👥 Equipe

- **Desenvolvedor Principal**: [Seu Nome](https://github.com/seu-usuario)
- **Design UI/UX**: [Nome do Designer](https://github.com/designer)
- **Product Manager**: [Nome do PM](https://github.com/pm)

## 📞 Suporte

- 📧 Email: contato@focovest.com.br
- 💬 Discord: [FocoVest Community](https://discord.gg/focovest)
- 📱 WhatsApp: [+55 (85) 99999-9999](https://wa.me/5585999999999)

## 🌟 Mostre seu Apoio

Se este projeto te ajudou, dê uma ⭐️!

---

<div align="center">
  <p>Feito com ❤️ para estudantes brasileiros</p>
  <p>© 2024 FocoVest. Todos os direitos reservados.</p>
</div>
>>>>>>> 59d6ceb ( FocoVest: Deploy completo com dark mode e segurança implementados)
