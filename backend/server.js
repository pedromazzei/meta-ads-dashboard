const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuração da Meta API
const META_API_VERSION = 'v24.0';
const META_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

// Endpoint para buscar insights de uma conta
app.post('/api/meta/insights', async (req, res) => {
  try {
    const { accountId, fields, startDate, endDate, token } = req.body;

    // Validação básica
    if (!accountId || !fields || !startDate || !endDate) {
      return res.status(400).json({
        error: 'Parâmetros obrigatórios: accountId, fields, startDate, endDate'
      });
    }

    // Usa o token do body ou do .env (fallback)
    const accessToken = token || process.env.META_ACCESS_TOKEN;

    if (!accessToken) {
      return res.status(401).json({
        error: 'Token de acesso não fornecido'
      });
    }

    // Monta a URL da API do Meta
    const timeRange = JSON.stringify({ since: startDate, until: endDate });
    const url = `${META_BASE_URL}/${accountId}/insights`;

    // Faz a requisição para a Meta API
    const response = await axios.get(url, {
      params: {
        fields,
        time_range: timeRange,
        access_token: accessToken
      }
    });

    // Retorna os dados
    res.json(response.data);

  } catch (error) {
    console.error('Erro ao buscar dados do Meta:', error.response?.data || error.message);

    // Retorna erro formatado
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error?.message || 'Erro ao buscar dados do Meta',
      details: error.response?.data || error.message
    });
  }
});

// Endpoint para buscar múltiplas contas em paralelo
app.post('/api/meta/insights/batch', async (req, res) => {
  try {
    const { accounts, fields, startDate, endDate, token } = req.body;

    if (!accounts || !Array.isArray(accounts) || accounts.length === 0) {
      return res.status(400).json({
        error: 'Parâmetro "accounts" deve ser um array com ao menos uma conta'
      });
    }

    const accessToken = token || process.env.META_ACCESS_TOKEN;

    if (!accessToken) {
      return res.status(401).json({
        error: 'Token de acesso não fornecido'
      });
    }

    // Faz todas as requisições em paralelo
    const timeRange = JSON.stringify({ since: startDate, until: endDate });

    const promises = accounts.map(async (account) => {
      try {
        const url = `${META_BASE_URL}/${account.id}/insights`;
        const response = await axios.get(url, {
          params: {
            fields,
            time_range: timeRange,
            access_token: accessToken
          }
        });

        return {
          accountId: account.id,
          accountName: account.name,
          data: response.data,
          success: true
        };
      } catch (error) {
        return {
          accountId: account.id,
          accountName: account.name,
          error: error.response?.data?.error?.message || error.message,
          success: false
        };
      }
    });

    const results = await Promise.all(promises);
    res.json({ results });

  } catch (error) {
    console.error('Erro no batch:', error.message);
    res.status(500).json({
      error: 'Erro ao processar requisições em lote',
      details: error.message
    });
  }
});

// Endpoint para buscar campanhas de uma conta específica
app.post('/api/meta/campaigns', async (req, res) => {
  try {
    const { accountId, fields, startDate, endDate, token } = req.body;

    if (!accountId || !fields || !startDate || !endDate) {
      return res.status(400).json({
        error: 'Parâmetros obrigatórios: accountId, fields, startDate, endDate'
      });
    }

    const accessToken = token || process.env.META_ACCESS_TOKEN;

    if (!accessToken) {
      return res.status(401).json({
        error: 'Token de acesso não fornecido'
      });
    }

    const timeRange = JSON.stringify({ since: startDate, until: endDate });

    // Busca todas as campanhas da conta
    const campaignsUrl = `${META_BASE_URL}/${accountId}/campaigns`;
    const campaignsResponse = await axios.get(campaignsUrl, {
      params: {
        fields: 'id,name,status',
        limit: 100,
        access_token: accessToken
      }
    });

    // Filtra apenas campanhas ACTIVE
    const allCampaigns = campaignsResponse.data.data || [];
    const activeCampaigns = allCampaigns.filter(c => c.status === 'ACTIVE');

    // Para cada campanha ativa, busca os insights
    const campaignsWithInsights = await Promise.all(
      activeCampaigns.map(async (campaign) => {
        try {
          const insightsUrl = `${META_BASE_URL}/${campaign.id}/insights`;
          const insightsResponse = await axios.get(insightsUrl, {
            params: {
              fields,
              time_range: timeRange,
              access_token: accessToken
            }
          });

          const insights = insightsResponse.data.data || [];

          // Só retorna se tiver dados no período
          if (insights.length > 0) {
            return {
              id: campaign.id,
              name: campaign.name,
              status: campaign.status,
              insights: insights,
              success: true
            };
          }

          return null;
        } catch (error) {
          // Ignora erros de campanhas sem dados
          console.error(`Erro ao buscar insights da campanha ${campaign.name}:`, error.message);
          return null;
        }
      })
    );

    // Filtra campanhas nulas (sem dados ou com erro)
    const validCampaigns = campaignsWithInsights.filter(c => c !== null);

    res.json({ campaigns: validCampaigns });

  } catch (error) {
    console.error('Erro ao buscar campanhas:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error?.message || 'Erro ao buscar campanhas',
      details: error.response?.data || error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: META_API_VERSION
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
  console.log(`📊 Meta API versão: ${META_API_VERSION}`);
});
