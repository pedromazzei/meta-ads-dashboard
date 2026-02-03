# Meta Ads Dashboard

Dashboard para visualização de métricas de campanhas Meta Ads (Facebook/Instagram) com backend intermediário para resolver problemas de CORS.

## 🚀 Início Rápido

**Primeira vez ou após reiniciar o computador?**

Execute no terminal:
```bash
cd ~/projects/meta-ads-dashboard && ./start.sh
```

O script irá:
- ✅ Verificar Node.js instalado
- ✅ Verificar se portas 3000/3001 estão livres
- ✅ Instalar dependências (se necessário)
- ✅ Iniciar backend (porta 3001) e frontend (porta 3000)
- ✅ Abrir o dashboard automaticamente no navegador

**📖 Tutorial Completo**: Consulte o guia detalhado em `~/obsidian_vault_agencia/Meta Ads Dashboard - Tutorial de Inicialização.md` para troubleshooting, configuração de token, atalhos e mais.

## Estrutura do Projeto

```
meta-ads-dashboard/
├── backend/          # Servidor Node.js/Express
│   ├── server.js     # API que integra com Meta Marketing API
│   ├── package.json
│   └── .env.example
│
├── frontend/         # Dashboard React
│   ├── src/
│   │   ├── App.js    # Componente principal
│   │   └── index.js
│   ├── public/
│   └── package.json
│
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
