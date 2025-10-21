#!/bin/bash

# 🚀 Script de Deploy Automatizado para GitHub Pages
# Usage: ./scripts/deploy.sh

set -e  # Sair se qualquer comando falhar

echo "🚀 Iniciando processo de deploy para GitHub Pages..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Verificar se estamos na pasta correta
if [ ! -f "package.json" ]; then
    error "package.json não encontrado. Execute este script na raiz do projeto."
fi

# Verificar se Git está configurado
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    error "Este não é um repositório Git. Execute 'git init' primeiro."
fi

# Verificar se há mudanças não commitadas
if [ -n "$(git status --porcelain)" ]; then
    warn "Há mudanças não commitadas. Commitando automaticamente..."
    git add .
    git commit -m "🚀 Auto-commit before deploy"
fi

log "1/8 Verificando dependências..."
if [ ! -d "node_modules" ]; then
    log "Instalando dependências..."
    npm ci
fi

log "2/8 Executando auditoria de segurança..."
npm audit --audit-level high || warn "Vulnerabilidades encontradas, mas continuando..."

log "3/8 Executando testes..."
npm test -- --passWithNoTests --watchAll=false || error "Testes falharam"

log "4/8 Executando lint..."
npm run lint || warn "Problemas de lint encontrados, mas continuando..."

log "5/8 Verificando tipos TypeScript..."
npx tsc --noEmit || error "Erros de tipo encontrados"

log "6/8 Gerando build de produção..."
npm run build || error "Build falhou"

log "7/8 Verificando build..."
if [ ! -d "dist" ]; then
    error "Pasta dist não foi criada"
fi

# Verificar se arquivos essenciais existem
ESSENTIAL_FILES=("dist/index.html" "dist/assets")
for file in "${ESSENTIAL_FILES[@]}"; do
    if [ ! -e "$file" ]; then
        error "Arquivo essencial não encontrado: $file"
    fi
done

log "8/8 Fazendo push para GitHub..."
git push origin main || error "Push falhou"

success "✅ Deploy iniciado com sucesso!"
echo ""
echo "🔗 Acompanhe o progresso em:"
echo "   GitHub Actions: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^.]*\).*/\1/')/actions"
echo ""
echo "📱 Sua aplicação estará disponível em:"
echo "   https://$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^/]*\)\/\([^.]*\).*/\1.github.io\/\2/')/"
echo ""
echo "⏱️  O deploy geralmente leva 2-3 minutos para completar."
echo ""
success "🎉 Deploy concluído!"