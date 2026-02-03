#!/bin/bash

# Cores para melhor visualização
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Iniciando Meta Ads Dashboard...${NC}"
echo ""

# Verifica se Node.js está instalado
if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ Node.js não encontrado!${NC}"
  echo -e "${YELLOW}Por favor, instale o Node.js em: https://nodejs.org/${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Node.js $(node --version) detectado${NC}"
echo ""

# Verifica se as portas estão em uso
check_port() {
  if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Porta $1 já está em uso!${NC}"
    echo -e "${YELLOW}   Executando: kill -9 \$(lsof -ti:$1)${NC}"
    kill -9 $(lsof -ti:$1) 2>/dev/null
    sleep 1
  fi
}

check_port 3000
check_port 3001

# Verifica se node_modules existem
if [ ! -d "backend/node_modules" ]; then
  echo -e "${BLUE}📦 Instalando dependências do backend...${NC}"
  cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
  echo -e "${BLUE}📦 Instalando dependências do frontend...${NC}"
  cd frontend && npm install && cd ..
fi

echo ""
echo -e "${GREEN}✅ Dependências instaladas!${NC}"
echo ""
echo -e "${BLUE}🔥 Iniciando servidores...${NC}"
echo ""
echo -e "${GREEN}Backend:${NC}  http://localhost:3001"
echo -e "${GREEN}Frontend:${NC} http://localhost:3000"
echo ""
echo -e "${YELLOW}💡 Dica: Para parar os servidores, pressione Ctrl+C${NC}"
echo -e "${YELLOW}📖 Tutorial completo: ~/obsidian_vault_agencia/Meta Ads Dashboard - Tutorial de Inicialização.md${NC}"
echo ""

# Inicia backend e frontend em paralelo
(cd backend && npm start) & (cd frontend && npm start)
