import { useState, useCallback } from "react";

const CLIENTS = [
  { id: "act_1544803246834285", name: "Dr. Pedro Faria" },
  { id: "act_1392801848000733", name: "Chiarini & Oliveira" },
  { id: "act_3253690104912621", name: "Dra. Carmem Mazzei" },
  { id: "act_1844723015652043", name: "Dra. Giuliana Martins" },
];

const FIELDS = [
  "spend",
  "impressions",
  "reach",
  "outbound_clicks",
  "ctr",
  "actions{action_type,value}",
  "cost_per_action_type{action_type,value}",
].join(",");

// URL do backend local
const API_URL = "http://localhost:3001";

const fmt = (v, pre = "", dec = 2) =>
  v != null && !isNaN(v) ? `${pre}${Number(v).toFixed(dec)}` : "—";

const fmtInt = (v) => (v != null ? Number(v).toLocaleString("pt-BR") : "—");

function KPICard({ label, value }) {
  return (
    <div style={{ background: "#1e1e2e", borderRadius: 10, padding: "16px 18px", border: "1px solid #313244", minWidth: 130 }}>
      <div style={{ color: "#a6adc8", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{label}</div>
      <div style={{ color: "#cdd6f4", fontSize: 21, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

// Soma todos os dias retornados pela API em um único objeto agregado
function aggregateData(dataArray) {
  const agg = { spend: 0, impressions: 0, reach: 0, outbound_clicks: 0, ctr: 0, actions: {}, ctr_count: 0 };
  for (const day of dataArray) {
    agg.spend += parseFloat(day.spend || 0);
    agg.impressions += parseInt(day.impressions || 0);
    agg.reach += parseInt(day.reach || 0);
    agg.outbound_clicks += parseInt((day.outbound_clicks && day.outbound_clicks[0]?.value) || 0);
    if (day.ctr) { agg.ctr += parseFloat(day.ctr); agg.ctr_count++; }
    if (day.actions) {
      for (const act of day.actions) {
        agg.actions[act.action_type] = (agg.actions[act.action_type] || 0) + parseInt(act.value || 0);
      }
    }
  }
  agg.ctr = agg.ctr_count > 0 ? agg.ctr / agg.ctr_count : 0;
  return agg;
}

function getMsgCount(agg) {
  // Usa a métrica oficial do Meta Ads para "Conversas Iniciadas"
  // Esta é a métrica padrão exibida no Gerenciador de Anúncios
  const conversationStarted = agg.actions["onsite_conversion.messaging_conversation_started_7d"];

  if (conversationStarted) {
    return conversationStarted;
  }

  // Fallback para outros tipos de conversão caso não tenha a métrica de mensagem
  if (agg.actions["lead"]) {
    return agg.actions["lead"];
  }

  return 0;
}

function CampaignRow({ campaign, data }) {
  if (!data) return null;

  const cpm = data.impressions > 0 ? (data.spend / data.impressions) * 1000 : null;
  const msgs = getMsgCount(data);
  const costPerMsg = msgs > 0 ? data.spend / msgs : null;

  return (
    <div style={{ background: "#11111b", borderRadius: 8, padding: 16, marginBottom: 8, border: "1px solid #45475a" }}>
      <div style={{ color: "#a6adc8", fontSize: 14, fontWeight: 500, marginBottom: 10 }}>{campaign.name}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 }}>
        <KPICard label="Valor Usado" value={fmt(data.spend, "R$ ")} />
        <KPICard label="CPM" value={fmt(cpm, "R$ ")} />
        <KPICard label="Alcance" value={fmtInt(data.reach)} />
        <KPICard label="Cliques de Saída" value={fmtInt(data.outbound_clicks)} />
        <KPICard label="CTR" value={`${fmt(data.ctr, "", 2)}%`} />
        <KPICard label="Conversas Iniciadas" value={fmtInt(msgs)} />
        <KPICard label="Custo por Conversa" value={fmt(costPerMsg, "R$ ")} />
      </div>
    </div>
  );
}

function ClientRow({ client, data, loading, rawError, token, startDate, endDate }) {
  const [showCampaigns, setShowCampaigns] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    setLoadingCampaigns(true);
    try {
      const response = await fetch(`${API_URL}/api/meta/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: client.id,
          fields: FIELDS,
          startDate,
          endDate,
          token
        })
      });

      const json = await response.json();

      if (response.ok && json.campaigns) {
        setCampaigns(json.campaigns);
      }
    } catch (error) {
      console.error('Erro ao buscar campanhas:', error);
    }
    setLoadingCampaigns(false);
  }, [client.id, token, startDate, endDate]);

  const toggleCampaigns = () => {
    if (!showCampaigns && campaigns.length === 0) {
      fetchCampaigns();
    }
    setShowCampaigns(!showCampaigns);
  };

  if (loading) return (
    <div style={{ background: "#181825", borderRadius: 10, border: "1px solid #313244", padding: 20, marginBottom: 12 }}>
      <div style={{ color: "#a6adc8", marginBottom: 8 }}>{client.name}</div>
      <div style={{ color: "#585b70", fontSize: 13 }}>Buscando dados...</div>
    </div>
  );

  if (!data) return (
    <div style={{ background: "#181825", borderRadius: 10, border: "1px solid #45475a", padding: 20, marginBottom: 12 }}>
      <div style={{ color: "#a6adc8", marginBottom: 4 }}>{client.name}</div>
      <div style={{ color: "#f38ba8", fontSize: 13 }}>Erro na busca</div>
      {rawError && <div style={{ color: "#585b70", fontSize: 11, marginTop: 4, wordBreak: "break-all" }}>{rawError}</div>}
    </div>
  );

  const cpm = data.impressions > 0 ? (data.spend / data.impressions) * 1000 : null;
  const msgs = getMsgCount(data);
  const costPerMsg = msgs > 0 ? data.spend / msgs : null;

  return (
    <div style={{ background: "#181825", borderRadius: 10, border: "1px solid #313244", padding: 20, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ color: "#cdd6f4", fontSize: 16, fontWeight: 600 }}>{client.name}</div>
        <button
          onClick={toggleCampaigns}
          style={{
            padding: "6px 14px",
            background: "#313244",
            color: "#cdd6f4",
            border: "1px solid #45475a",
            borderRadius: 6,
            fontSize: 12,
            cursor: "pointer",
            fontWeight: 500
          }}
        >
          {showCampaigns ? "Ocultar Campanhas" : "Ver Campanhas"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10, marginBottom: showCampaigns ? 16 : 0 }}>
        <KPICard label="Valor Usado" value={fmt(data.spend, "R$ ")} />
        <KPICard label="CPM" value={fmt(cpm, "R$ ")} />
        <KPICard label="Alcance" value={fmtInt(data.reach)} />
        <KPICard label="Cliques de Saída" value={fmtInt(data.outbound_clicks)} />
        <KPICard label="CTR" value={`${fmt(data.ctr, "", 2)}%`} />
        <KPICard label="Conversas Iniciadas" value={fmtInt(msgs)} />
        <KPICard label="Custo por Conversa" value={fmt(costPerMsg, "R$ ")} />
      </div>

      {showCampaigns && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #313244" }}>
          <div style={{ color: "#a6adc8", fontSize: 12, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
            Campanhas Ativas no Período
          </div>
          {loadingCampaigns && (
            <div style={{ color: "#585b70", fontSize: 13 }}>Carregando campanhas...</div>
          )}
          {!loadingCampaigns && campaigns.length === 0 && (
            <div style={{ color: "#585b70", fontSize: 13 }}>Nenhuma campanha ativa com dados neste período</div>
          )}
          {!loadingCampaigns && campaigns.map(campaign => {
            const aggData = aggregateData(campaign.insights);
            return <CampaignRow key={campaign.id} campaign={campaign} data={aggData} />;
          })}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState("");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 7);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [clientData, setClientData] = useState({});
  const [clientErrors, setClientErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [globalError, setGlobalError] = useState("");

  const fetchAll = useCallback(async () => {
    if (!token.trim()) { setGlobalError("Cole seu Access Token primeiro."); return; }
    setLoading(true);
    setGlobalError("");
    setFetched(true);

    try {
      // Usa o endpoint batch do backend
      const response = await fetch(`${API_URL}/api/meta/insights/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accounts: CLIENTS,
          fields: FIELDS,
          startDate,
          endDate,
          token: token.trim()
        })
      });

      const json = await response.json();

      if (!response.ok) {
        setGlobalError(json.error || 'Erro ao buscar dados');
        setLoading(false);
        return;
      }

      // Processa os resultados
      const results = {};
      const errors = {};

      for (const result of json.results) {
        if (result.success && result.data?.data?.length > 0) {
          results[result.accountId] = aggregateData(result.data.data);
        } else {
          results[result.accountId] = null;
          errors[result.accountId] = result.error || "Sem dados retornados pela API para esse período.";
        }
      }

      setClientData(results);
      setClientErrors(errors);

    } catch (error) {
      setGlobalError(`Erro ao conectar com o backend: ${error.message}`);
    }

    setLoading(false);
  }, [token, startDate, endDate]);

  // Totais
  const totals = { spend: 0, reach: 0, msgs: 0 };
  for (const c of CLIENTS) {
    const d = clientData[c.id];
    if (d) {
      totals.spend += d.spend;
      totals.reach += d.reach;
      totals.msgs += getMsgCount(d);
    }
  }
  const totalCostPerMsg = totals.msgs > 0 ? totals.spend / totals.msgs : null;

  return (
    <div style={{ background: "#11111b", minHeight: "100vh", color: "#cdd6f4", fontFamily: "'Segoe UI', sans-serif", padding: 24 }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#cba6f7", marginBottom: 4 }}>Dashboard — Clientes Advogados</h1>
        <p style={{ color: "#585b70", fontSize: 13, marginBottom: 20 }}>Campanhas de Conversa por Mensagem · Meta Ads · API v24.0</p>

        {/* Token */}
        <div style={{ background: "#1e1e2e", borderRadius: 10, border: "1px solid #313244", padding: 16, marginBottom: 16 }}>
          <label style={{ fontSize: 11, color: "#a6adc8", textTransform: "uppercase", letterSpacing: 1 }}>Access Token</label>
          <input
            type="password"
            value={token}
            onChange={e => setToken(e.target.value)}
            placeholder="Cole seu token aqui..."
            style={{ display: "block", width: "100%", marginTop: 6, padding: "10px 12px", background: "#181825", border: "1px solid #45475a", borderRadius: 6, color: "#cdd6f4", fontSize: 14, boxSizing: "border-box" }}
          />
        </div>

        {/* Datas + Botão */}
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 20 }}>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={{ fontSize: 11, color: "#a6adc8", textTransform: "uppercase", letterSpacing: 1 }}>Início</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              style={{ display: "block", width: "100%", marginTop: 4, padding: "10px 12px", background: "#1e1e2e", border: "1px solid #313244", borderRadius: 6, color: "#cdd6f4", fontSize: 14, boxSizing: "border-box" }} />
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={{ fontSize: 11, color: "#a6adc8", textTransform: "uppercase", letterSpacing: 1 }}>Fim</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              style={{ display: "block", width: "100%", marginTop: 4, padding: "10px 12px", background: "#1e1e2e", border: "1px solid #313244", borderRadius: 6, color: "#cdd6f4", fontSize: 14, boxSizing: "border-box" }} />
          </div>
          <button onClick={fetchAll} disabled={loading}
            style={{ padding: "10px 24px", background: loading ? "#45475a" : "#cba6f7", color: "#11111b", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Buscando..." : "Buscar Dados"}
          </button>
        </div>

        {globalError && <div style={{ background: "#3b1f2b", border: "1px solid #f38ba8", borderRadius: 8, padding: "10px 14px", color: "#f38ba8", fontSize: 13, marginBottom: 16 }}>{globalError}</div>}

        {/* Visão Geral */}
        {fetched && !loading && (
          <div style={{ background: "#181825", borderRadius: 10, border: "1px solid #45475a", padding: 18, marginBottom: 20 }}>
            <div style={{ color: "#a6adc8", fontSize: 12, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Visão Geral — Todos os Clientes</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
              <KPICard label="Total Investido" value={fmt(totals.spend, "R$ ")} />
              <KPICard label="Alcance Total" value={fmtInt(totals.reach)} />
              <KPICard label="Conversas Totais" value={fmtInt(totals.msgs)} />
              <KPICard label="Custo Médio/Conversa" value={fmt(totalCostPerMsg, "R$ ")} />
            </div>
          </div>
        )}

        {/* Por Cliente */}
        {fetched && CLIENTS.map(c => (
          <ClientRow
            key={c.id}
            client={c}
            data={clientData[c.id]}
            loading={loading}
            rawError={clientErrors[c.id]}
            token={token}
            startDate={startDate}
            endDate={endDate}
          />
        ))}

        {!fetched && (
          <div style={{ textAlign: "center", color: "#585b70", marginTop: 60, fontSize: 14 }}>
            Cole seu Access Token e clique em "Buscar Dados" para carregar os dados das campanhas.
          </div>
        )}
      </div>
    </div>
  );
}
