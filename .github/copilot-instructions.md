# Instruções do Copilot - FocoVest Platform

## Visão Geral do Projeto
FocoVest é uma plataforma de simulados online voltada para preparação de vestibulares das universidades UVA, UECE, UFC, URCA e IFCE. A plataforma promove competição saudável entre usuários através de rankings e gamificação.

## Tecnologias Utilizadas
- **Frontend**: React.js + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js + Express.js + TypeScript
- **Banco de Dados**: MongoDB + Mongoose
- **Autenticação**: JWT + bcrypt
- **Testes**: Jest + React Testing Library
- **Deployment**: Docker + Nginx

## Funcionalidades Principais
### Sistema de Usuários
- Cadastro e login de estudantes
- Perfis de usuário com estatísticas
- Sistema de níveis e conquistas

### Simulados
- Banco de questões das universidades alvo
- Simulados cronometrados por matéria ou geral
- Correção automática com explanações
- Simulados adaptativos baseados no desempenho

### Competição e Gamificação
- Rankings gerais e por universidade
- Sistema de pontuação por desempenho
- Batalhas entre usuários
- Conquistas e badges
- Liga de competição semanal/mensal

### Relatórios e Analytics
- Desempenho por matéria e assunto
- Evolução temporal do aprendizado
- Comparação com outros usuários
- Sugestões de estudo personalizadas
- Análise de erros mais comuns

### Administração
- Painel administrativo para gestão de questões
- Moderação de conteúdo
- Analytics da plataforma
- Gerenciamento de usuários

## Estrutura de Pastas
```
focovest/
├── client/                 # React Frontend
├── server/                 # Node.js Backend  
├── shared/                 # Tipos/utils compartilhados
├── docs/                   # Documentação
└── docker-compose.yml      # Containers Docker
```

## Diretrizes de Desenvolvimento
- Usar TypeScript em todo o código
- Implementar testes unitários e de integração
- Seguir princípios de Clean Architecture
- Documentar APIs com Swagger/OpenAPI
- Usar conventional commits
- Priorizar performance e UX responsivo
- Implementar SEO e acessibilidade

## Referências de Inspiração
- Khan Academy: Sistema de progressão e exercícios
- Brilliant.org: Gamificação e interface interativa  
- Descomplica/Stoodi: Foco em vestibulares brasileiros
- Duolingo: Sistema de conquistas e streaks