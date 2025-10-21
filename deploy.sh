#!/bin/bash

# FocoVest Deploy Script
# Este script automatiza o processo de deploy da aplicação

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

# Verificar se está no diretório correto
if [ ! -f "docker-compose.prod.yml" ]; then
    error "docker-compose.prod.yml não encontrado. Execute este script no diretório raiz do projeto."
    exit 1
fi

# Verificar se Docker e Docker Compose estão instalados
if ! command -v docker &> /dev/null; then
    error "Docker não está instalado. Por favor, instale o Docker primeiro."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro."
    exit 1
fi

# Verificar se arquivo .env existe
if [ ! -f "server/.env" ]; then
    warn "Arquivo .env não encontrado. Criando a partir do .env.example..."
    cp server/.env.example server/.env
    warn "⚠️  IMPORTANTE: Configure as variáveis de ambiente em server/.env antes de continuar!"
    read -p "Pressione Enter para continuar após configurar o .env..."
fi

# Menu de opções
echo -e "${BLUE}"
echo "========================================"
echo "       FocoVest Deploy Script"
echo "========================================"
echo -e "${NC}"

echo "Escolha uma opção:"
echo "1. Deploy completo (primeira vez)"
echo "2. Atualizar aplicação"
echo "3. Ver logs"
echo "4. Parar aplicação"
echo "5. Restart aplicação"
echo "6. Limpar containers e volumes"
echo "7. Backup dos dados"
echo "8. Health check"
echo "9. Ver métricas"
echo "0. Sair"

read -p "Digite sua opção (0-9): " option

case $option in
    1)
        log "Iniciando deploy completo..."
        
        # Verificar configurações
        log "Verificando configurações..."
        if grep -q "sua_chave_jwt_super_secreta" server/.env; then
            error "JWT_SECRET ainda está com valor padrão. Configure uma chave segura!"
            exit 1
        fi
        
        # Build das imagens
        log "Fazendo build das imagens Docker..."
        docker-compose -f docker-compose.prod.yml build --no-cache
        
        # Criar rede se não existir
        docker network create focovest-network 2>/dev/null || true
        
        # Iniciar serviços
        log "Iniciando serviços..."
        docker-compose -f docker-compose.prod.yml up -d
        
        # Aguardar inicialização
        log "Aguardando inicialização dos serviços..."
        sleep 30
        
        # Health check
        if curl -f http://localhost/api/health &>/dev/null; then
            log "✅ Deploy realizado com sucesso!"
            log "🌐 Aplicação disponível em: http://localhost"
            log "📊 Métricas: http://localhost/api/metrics"
        else
            error "❌ Falha no health check. Verifique os logs."
            docker-compose -f docker-compose.prod.yml logs --tail=50
        fi
        ;;
        
    2)
        log "Atualizando aplicação..."
        
        # Rebuild apenas da aplicação
        docker-compose -f docker-compose.prod.yml build focovest
        
        # Rolling update
        docker-compose -f docker-compose.prod.yml up -d focovest
        
        log "✅ Aplicação atualizada!"
        ;;
        
    3)
        log "Exibindo logs..."
        echo "Escolha o serviço:"
        echo "1. Todos"
        echo "2. FocoVest App"
        echo "3. Nginx"
        read -p "Opção: " log_option
        
        case $log_option in
            1) docker-compose -f docker-compose.prod.yml logs -f ;;
            2) docker-compose -f docker-compose.prod.yml logs -f focovest ;;
            3) docker-compose -f docker-compose.prod.yml logs -f nginx ;;
            *) docker-compose -f docker-compose.prod.yml logs -f ;;
        esac
        ;;
        
    4)
        log "Parando aplicação..."
        docker-compose -f docker-compose.prod.yml down
        log "✅ Aplicação parada!"
        ;;
        
    5)
        log "Reiniciando aplicação..."
        docker-compose -f docker-compose.prod.yml restart
        log "✅ Aplicação reiniciada!"
        ;;
        
    6)
        warn "⚠️  Esta operação irá remover todos os containers e volumes!"
        read -p "Tem certeza? (y/N): " confirm
        if [[ $confirm == [yY] ]]; then
            log "Parando e removendo containers..."
            docker-compose -f docker-compose.prod.yml down -v --remove-orphans
            
            log "Removendo imagens não utilizadas..."
            docker image prune -f
            
            log "✅ Limpeza concluída!"
        else
            log "Operação cancelada."
        fi
        ;;
        
    7)
        log "Criando backup dos dados..."
        backup_dir="backups/$(date +'%Y%m%d_%H%M%S')"
        mkdir -p "$backup_dir"
        
        # Backup de volumes Docker (se existirem)
        if docker volume ls | grep focovest &>/dev/null; then
            docker run --rm -v focovest_mongodb-data:/data -v $(pwd)/$backup_dir:/backup alpine tar czf /backup/mongodb-data.tar.gz -C /data .
            log "Backup do MongoDB criado em: $backup_dir/mongodb-data.tar.gz"
        fi
        
        # Backup de logs
        if [ -d "logs" ]; then
            tar czf "$backup_dir/logs.tar.gz" logs/
            log "Backup dos logs criado em: $backup_dir/logs.tar.gz"
        fi
        
        # Backup de configurações
        tar czf "$backup_dir/config.tar.gz" server/.env nginx/ docker-compose.prod.yml
        log "Backup das configurações criado em: $backup_dir/config.tar.gz"
        
        log "✅ Backup completo em: $backup_dir"
        ;;
        
    8)
        log "Executando health check..."
        
        # Verificar se containers estão rodando
        if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
            log "✅ Containers estão rodando"
        else
            error "❌ Alguns containers não estão rodando"
            docker-compose -f docker-compose.prod.yml ps
        fi
        
        # Verificar API
        if curl -f http://localhost/api/health &>/dev/null; then
            log "✅ API está respondendo"
            
            # Mostrar informações do health check
            echo "Health Check Response:"
            curl -s http://localhost/api/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost/api/health
        else
            error "❌ API não está respondendo"
        fi
        ;;
        
    9)
        log "Obtendo métricas do sistema..."
        
        if curl -f http://localhost/api/metrics &>/dev/null; then
            echo "Métricas do Sistema:"
            curl -s http://localhost/api/metrics | python3 -m json.tool 2>/dev/null || curl -s http://localhost/api/metrics
        else
            warn "Métricas não disponíveis. Verifique se a aplicação está rodando."
        fi
        ;;
        
    0)
        log "Saindo..."
        exit 0
        ;;
        
    *)
        error "Opção inválida!"
        exit 1
        ;;
esac