#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}================================${NC}"
echo -e "${CYAN}    FOCOVEST - SETUP RÁPIDO${NC}"
echo -e "${CYAN}================================${NC}"
echo

echo -e "${BLUE}[1/4] Verificando Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado!${NC}"
    echo -e "${RED}   Por favor, instale o Node.js 18+ de: https://nodejs.org${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js encontrado! Versão: $(node --version)${NC}"

echo
echo -e "${BLUE}[2/4] Instalando dependências...${NC}"
if ! npm run install:all; then
    echo -e "${RED}❌ Erro na instalação das dependências${NC}"
    exit 1
fi

echo
echo -e "${BLUE}[3/4] Construindo projeto...${NC}"
if ! npm run build:shared; then
    echo -e "${RED}❌ Erro no build do shared${NC}"
    exit 1
fi

echo
echo -e "${BLUE}[4/4] Iniciando servidores...${NC}"
echo
echo -e "${CYAN}================================${NC}"
echo -e "${CYAN}    PROJETO FOCOVEST PRONTO!${NC}"
echo -e "${CYAN}================================${NC}"
echo
echo -e "${GREEN}🌐 Frontend: http://localhost:5173${NC}"
echo -e "${GREEN}🔧 Backend:  http://localhost:5000/api${NC}"
echo
echo -e "${YELLOW}🔑 Credenciais de teste:${NC}"
echo -e "${YELLOW}   📧 joao@teste.com (senha: 123456)${NC}"
echo -e "${YELLOW}   📧 maria@teste.com (senha: senha123)${NC}"
echo
echo -e "${PURPLE}⚠️  Mantenha este terminal aberto!${NC}"
echo -e "${PURPLE}   Pressione Ctrl+C para parar os servidores${NC}"
echo

# Iniciar os servidores
npm run dev