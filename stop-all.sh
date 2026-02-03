#!/bin/bash

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🛑 Parando Meta Ads Dashboard...${NC}"
echo ""

# Parar containers Docker
if docker info >/dev/null 2>&1; then
  echo -e "${YELLOW}📦 Parando containers Docker...${NC}"
  docker-compose down

  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Containers parados${NC}"
  fi
  echo ""
fi

# Perguntar se quer fechar o Docker Desktop
echo -e "${YELLOW}❓ Deseja fechar o Docker Desktop para liberar RAM?${NC}"
echo -e "${YELLOW}   (Recomendado para MacBook Air M1 8GB)${NC}"
read -p "Fechar Docker Desktop? (s/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[SsYy]$ ]]; then
  echo -e "${BLUE}🐳 Fechando Docker Desktop...${NC}"
  osascript -e 'quit app "Docker"'

  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Docker Desktop fechado${NC}"
    echo -e "${GREEN}✓ RAM liberada!${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  Docker Desktop continua rodando em segundo plano${NC}"
fi

echo ""
echo -e "${GREEN}✅ Tudo parado!${NC}"
echo ""
echo -e "${YELLOW}💡 Para iniciar novamente: ./start-docker.sh${NC}"
echo ""
