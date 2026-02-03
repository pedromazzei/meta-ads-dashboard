# Meta Ads Dashboard

Dashboard para visualização de métricas de campanhas Meta Ads (Facebook/Instagram) com backend intermediário para resolver problemas de CORS.

## 🚀 Início Rápido

### Opção 1: Docker Automático (Recomendado para MacBook Air) 🐳⚡

**Ideal para:** Máquinas com pouca RAM (8GB). Inicia Docker automaticamente e fecha quando terminar.

```bash
meta-docker
```

Quando terminar de usar:
```bash
meta-stop
```

**Isso irá:**
- ✅ Iniciar Docker Desktop automaticamente (se não estiver rodando)
- ✅ Subir containers em background
- ✅ Abrir navegador automaticamente
- ✅ Parar containers E fechar Docker (libera RAM!)

### Opção 2: Docker Manual 🐳

**Vantagens:** Isolado, versionado, consistente, sem conflitos de dependências.

```bash
cd ~/projects/meta-ads-dashboard
docker-compose up
```

Acesse: http://localhost:3000

Para parar: `Ctrl+C` ou `docker-compose down`

### Opção 3: Local (Script Automático)

**Primeira vez ou após reiniciar o computador?**

```bash
cd ~/projects/meta-ads-dashboard && ./start.sh
```

O script irá:
- ✅ Verificar Node.js instalado
- ✅ Verificar se portas 3000/3001 estão livres
- ✅ Instalar dependências (se necessário)
- ✅ Iniciar backend (porta 3001) e frontend (porta 3000)
- ✅ Abrir o dashboard automaticamente no navegador

### 📖 Documentação Completa

- **Tutorial Obsidian**: `~/obsidian_vault_agencia/Meta Ads Dashboard - Tutorial de Inicialização.md`
- **GitHub**: https://github.com/pedromazzei/meta-ads-dashboard
- **Versão Atual**: v1.0.0
- **Git + Docker**: Ver seções abaixo

## 💾 Gerenciamento de RAM (MacBook Air M1 8GB)

### Problema
Docker Desktop consome ~500MB-1GB de RAM rodando em segundo plano, mesmo sem containers ativos.

### Solução
Use os scripts automáticos que iniciam/param o Docker apenas quando necessário:

```bash
# Inicia Docker + Containers automaticamente
meta-docker

# Para containers E fecha Docker (libera RAM)
meta-stop
```

### Desabilitar Auto-Start do Docker

Para evitar que Docker inicie automaticamente ao ligar o Mac:

1. Abra o Docker Desktop
2. Vá em **Settings** (ícone de engrenagem)
3. Desmarque: **"Start Docker Desktop when you sign in to your computer"**
4. Clique em **Apply & Restart**

Agora o Docker só rodará quando você executar `meta-docker`!

## 🐳 Docker - Guia Rápido

### Desenvolvimento (com hot reload)
```bash
# Iniciar containers
docker-compose up

# Iniciar em background
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar containers
docker-compose down

# Reconstruir imagens (após mudanças no package.json)
docker-compose up --build
```

### Produção
```bash
docker-compose -f docker-compose.prod.yml up -d
```

**Hot Reload:** Edite arquivos localmente e veja mudanças instantaneamente no container! 🔥

## 📦 Git - Versionamento

### Comandos Básicos
```bash
# Ver status
git status

# Adicionar mudanças
git add .

# Criar commit
git commit -m "Sua mensagem"

# Enviar para GitHub
git push

# Baixar mudanças
git pull

# Ver histórico
git log --oneline
```

### Reverter Erros
```bash
# Descartar mudanças não commitadas
git checkout -- arquivo.js

# Voltar para commit anterior (mantém mudanças)
git reset HEAD~1

# Voltar para commit específico
git reset --hard abc1234
```

### Branches
```bash
# Criar branch para testar algo
git checkout -b feature/nova-feature

# Voltar para main
git checkout main

# Fazer merge da branch
git merge feature/nova-feature
```

## Estrutura do Projeto

```
meta-ads-dashboard/
├── backend/              # Servidor Node.js/Express
│   ├── server.js         # API que integra com Meta Marketing API
│   ├── package.json
│   ├── .env.example
│   ├── Dockerfile        # Produção
│   └── Dockerfile.dev    # Desenvolvimento
│
├── frontend/             # Dashboard React
│   ├── src/
│   │   ├── App.js        # Componente principal
│   │   └── index.js
│   ├── public/
│   ├── package.json
│   ├── Dockerfile        # Produção (Nginx)
│   └── Dockerfile.dev    # Desenvolvimento
│
├── docker-compose.yml    # Orquestração (dev)
├── docker-compose.prod.yml  # Orquestração (prod)
├── .gitignore
├── .dockerignore
└── README.md
```

## Como Rodar Localmente

### 1. Instalar Dependências

Abra **2 terminais** na pasta do projeto.

**Terminal 1 - Backend:**
```bash
cd backend
npm install
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
```

### 2. Configurar Token (Opcional)

Se quiser fixar o token no backend (não precisar digitar no dashboard):

```bash
cd backend
cp .env.example .env
# Edite o .env e cole seu token:
# META_ACCESS_TOKEN=seu_token_aqui
```

### 3. Iniciar os Servidores

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
> Backend rodando em http://localhost:3001

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
> Frontend abrirá automaticamente em http://localhost:3000

## Como Usar

1. Abra http://localhost:3000 no navegador
2. Cole seu **Access Token** do Meta no campo (ou deixe vazio se configurou no .env)
3. Selecione o período (data início e fim)
4. Clique em **"Buscar Dados"**
5. Aguarde o carregamento dos dados de todos os clientes

## Endpoints da API (Backend)

### POST `/api/meta/insights`
Busca insights de uma conta específica.

**Body:**
```json
{
  "accountId": "1234567890",
  "fields": "spend,impressions,reach,ctr",
  "startDate": "2026-01-01",
  "endDate": "2026-01-31",
  "token": "seu_token_aqui"
}
```

### POST `/api/meta/insights/batch`
Busca insights de múltiplas contas em paralelo (usado pelo dashboard).

**Body:**
```json
{
  "accounts": [
    { "id": "123", "name": "Cliente 1" },
    { "id": "456", "name": "Cliente 2" }
  ],
  "fields": "spend,impressions,reach",
  "startDate": "2026-01-01",
  "endDate": "2026-01-31",
  "token": "seu_token_aqui"
}
```

### GET `/health`
Health check do servidor.

## Clientes Configurados

Edite o array `CLIENTS` em `frontend/src/App.js` para adicionar/remover clientes:

```javascript
const CLIENTS = [
  { id: "1544803246834285", name: "Dr. Pedro Faria" },
  { id: "1392801848000733", name: "Chiarini & Oliveira" },
  { id: "3253690104912621", name: "Dra. Carmem Mazzei" },
  { id: "1844723015652043", name: "Dra. Giuliana Martins" },
];
```

## Métricas Exibidas

- **Valor Usado**: Total gasto (spend)
- **CPM**: Custo por mil impressões
- **Alcance**: Pessoas únicas alcançadas
- **Cliques de Saída**: Outbound clicks
- **CTR**: Click-through rate (%)
- **Conversas Iniciadas**: Ações de mensagem/lead
- **Custo por Conversa**: Spend dividido por conversas

## Tecnologias

**Backend:**
- Node.js + Express
- Axios (requisições HTTP)
- CORS habilitado
- dotenv (variáveis de ambiente)

**Frontend:**
- React 18
- Create React App
- Inline styles (Catppuccin Mocha theme)

## Próximos Passos

- [ ] Adicionar autenticação ao backend
- [ ] Cache de resultados
- [ ] Gráficos de evolução temporal
- [ ] Export para CSV/PDF
- [ ] Deploy no Vercel (frontend + backend serverless)
- [ ] Integração com outras plataformas (Google Ads, TikTok Ads)

## Troubleshooting

**Erro de CORS:**
- Certifique-se que o backend está rodando em http://localhost:3001
- Verifique se a configuração de proxy no frontend está correta

**Token inválido:**
- Gere um novo token em https://developers.facebook.com/tools/explorer/
- O token precisa ter permissões de leitura de insights

**Sem dados retornados:**
- Verifique se as contas têm campanhas ativas no período selecionado
- Confirme que o token tem acesso às contas configuradas
