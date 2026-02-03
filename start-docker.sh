#!/bin/bash

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 Meta Ads Dashboard - Modo Docker${NC}"
echo ""

# Função para verificar se Docker está rodando
check_docker_running() {
  docker info >/dev/null 2>&1
  return $?
}

# Verificar se Docker está rodando
if ! check_docker_running; then
  echo -e "${YELLOW}⚠️  Docker Desktop não está rodando${NC}"
  echo -e "${BLUE}🚀 Iniciando Docker Desktop...${NC}"

  # Iniciar Docker Desktop
  open -a Docker

  # Aguardar Docker iniciar (timeout de 60 segundos)
  echo -e "${YELLOW}⏳ Aguardando Docker iniciar (pode demorar 30-60s)...${NC}"

  timeout=60
  elapsed=0
  while ! check_docker_running; do
    sleep 2
    elapsed=$((elapsed + 2))

    if [ $elapsed -ge $timeout ]; then
      echo -e "${RED}❌ Timeout: Docker não iniciou em 60 segundos${NC}"
      echo -e "${YELLOW}Por favor, abra o Docker Desktop manualmente e tente novamente.${NC}"
      exit 1
    fi

    printf "."
  done

  echo ""
  echo -e "${GREEN}✓ Docker Desktop iniciado!${NC}"
  echo ""
else
  echo -e "${GREEN}✓ Docker Desktop já está rodando${NC}"
  echo ""
fi

# Parar containers antigos (se existirem)
echo -e "${BLUE}🧹 Limpando containers antigos...${NC}"
docker-compose down 2>/dev/null

# Iniciar containers
echo -e "${BLUE}🚀 Iniciando containers...${NC}"
echo ""
docker-compose up -d

# Verificar se iniciaram corretamente
if [ $? -eq 0 ]; then
  echo ""
  echo -e "${GREEN}✅ Containers iniciados com sucesso!${NC}"
  echo ""
  echo -e "${GREEN}Backend:${NC}  http://localhost:3001"
  echo -e "${GREEN}Frontend:${NC} http://localhost:3000"
  echo ""
  echo -e "${YELLOW}💡 Ver logs:${NC} docker-compose logs -f"
  echo -e "${YELLOW}💡 Parar tudo:${NC} ./stop-all.sh"
  echo ""

  # Abrir navegador
  sleep 3
  open http://localhost:3000
else
  echo ""
  echo -e "${RED}❌ Erro ao iniciar containers${NC}"
  echo -e "${YELLOW}Execute 'docker-compose logs' para ver os erros${NC}"
  exit 1
fi
