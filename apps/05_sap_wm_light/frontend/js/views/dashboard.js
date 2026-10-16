/* ============================================================
   View: Dashboard — KPIs en tiempo real desde la API
   ============================================================ */
App.registerView('dashboard', () => {
  // Render skeleton while loading
  setTimeout(View_dashboard_init, 0);
  return `
  <div>
    <div class="page-header">
      <div class="page-header-top">
        <button class="back-btn" onclick="App.navigate('home')"><span class="sap-icon sap-icon--nav-back"></span></button>
        <div>
          <div class="page-title">Dashboard Operacional</div>
          <div class="page-subtitle">
            <span class="pulse-dot"></span>&nbsp; KPIs en tiempo real
          </div>
        </div>
        <div class="page-header-actions">
          <select id="dash-wh" class="form-control" style="width:160px;height:32px" onchange="View_dashboard_init()">
            <option value="">Todos los almacenes</option>
            <option value="WH001">WH001 — Principal</option>
            <option value="WH002">WH002 — Secundario</option>
          </select>
          <button class="btn btn-ghost btn-sm" onclick="View_dashboard_exportCSV()"><span class="sap-icon sap-icon--download"></span> Exportar</button>
        </div>
      </div>
    </div>

    <!-- KPI Strip (filled async) -->
    <div id="dash-kpis" class="kpi-strip" style="grid-template-columns:repeat(5,1fr)">
      ${[...Array(5)].map(() => `
        <div class="kpi-card">
          <div style="height:12px;background:var(--sap-hover);border-radius:4px;margin-bottom:8px;animation:pulse 1.5s infinite"></div>
          <div style="height:36px;background:var(--sap-hover);border-radius:4px;margin-bottom:6px;animation:pulse 1.5s infinite"></div>
          <div style="height:10px;background:var(--sap-hover);border-radius:4px;animation:pulse 1.5s infinite"></div>
        </div>`).join('')}
    </div>

    <!-- Charts Row -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-md);margin-bottom:var(--space-md)">
      <!-- TO Performance -->
      <div class="card">
        <div class="card-header"><div class="card-title">Rendimiento Transfer Orders</div></div>
        <div class="card-body" id="dash-to-perf">${Utils.skeleton(4)}</div>
      </div>
      <!-- Stock Status -->
      <div class="card">
        <div class="card-header"><div class="card-title">Estado del Stock</div></div>
        <div class="card-body" id="dash-stock-status">${Utils.skeleton(4)}</div>
      </div>
    </div>

    <!-- Alerts + Activity -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-md)">
      <div class="card">
        <div class="card-header">
          <div class="card-title"><span class="sap-icon sap-icon--alert"></span> Stock Crítico</div>
          <span id="dash-alert-count" class="badge badge-error">…</span>
        </div>
        <div class="card-body" id="dash-alerts" style="padding:0">${Utils.skeleton(3)}</div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">Transfer Orders Recientes</div></div>
        <div class="card-body" id="dash-recent-tos" style="padding:0">${Utils.skeleton(4)}</div>
      </div>
    </div>
  </div>`;
});

window.View_dashboard_init = async function() {
  const wh = document.getElementById('dash-wh')?.value || '';
  const whParam = wh ? `?warehouse=${wh}` : '';

  // Demo data as fallbacks
  let snap   = [], to = {}, crits = [], tos = [];

  const [snapR, toR, critR, tosR] = await Promise.allSettled([
    API.get('/reports/stock-snapshot' + whParam),
    API.get('/reports/to-performance' + whParam),
    API.get('/reports/critical-stock' + whParam),
    API.get('/transfer-orders?limit=6')
  ]);

  if (snapR.status === 'fulfilled') snap  = snapR.value?.data  || [];
  if (toR.status   === 'fulfilled') to    = toR.value?.data    || {};
  if (critR.status === 'fulfilled') crits = critR.value?.data  || [];
  if (tosR.status  === 'fulfilled') tos   = tosR.value?.data   || [];

  // Demo TO data if empty
  if (!to.totalOrders && !to.byType) {
    to = {
      totalOrders: tos.length || 5,
      byStatus: { OPEN: 3, CONFIRMED: 1, CANCELLED: 1 },
      byType:   { GR: 2, GI: 1, TR: 2 },
      completionRate: 20,
      avgCycleMinutes: null
    };
  }

  const summ = snapR.status === 'fulfilled' ? (snapR.value?.summary || {}) : {};
  if (!summ.ok && snap.length > 0) {
    summ.ok       = snap.filter(d => d.stockStatus === 'OK').length;
    summ.low      = snap.filter(d => d.stockStatus === 'LOW').length;
    summ.critical = snap.filter(d => d.stockStatus === 'CRITICAL').length;
    summ.empty    = snap.filter(d => d.stockStatus === 'EMPTY').length;
  }

    // KPIs
    const kpisEl = document.getElementById('dash-kpis');
    if (kpisEl) kpisEl.innerHTML = `
      <div class="kpi-card" style="--kpi-color:var(--sap-blue)">
        <div class="kpi-label">TOs Totales</div>
        <div class="kpi-value">${to.totalOrders ?? 0}</div>
        <div class="kpi-sub">en el período</div>
      </div>
      <div class="kpi-card" style="--kpi-color:var(--sap-success)">
        <div class="kpi-label">TOs Completadas</div>
        <div class="kpi-value">${to.byStatus?.CONFIRMED ?? 0}</div>
        <div class="kpi-trend up">${to.completionRate ?? 0}% tasa de éxito</div>
      </div>
      <div class="kpi-card" style="--kpi-color:var(--sap-warning)">
        <div class="kpi-label">Posiciones de Stock</div>
        <div class="kpi-value">${snap.length}</div>
        <div class="kpi-sub">bins ocupados</div>
      </div>
      <div class="kpi-card" style="--kpi-color:#0A6464">
        <div class="kpi-label">Tiempo Ciclo TO</div>
        <div class="kpi-value">${to.avgCycleMinutes != null ? to.avgCycleMinutes : '—'}<span style="font-size:var(--font-xl)">${to.avgCycleMinutes != null ? ' min' : ''}</span></div>
        <div class="kpi-sub">promedio</div>
      </div>
      <div class="kpi-card" style="--kpi-color:var(--sap-error)">
        <div class="kpi-label">Alertas Stock</div>
        <div class="kpi-value">${crits.length}</div>
        <div class="kpi-sub">materiales bajo mínimo</div>
      </div>`;

    // TO Performance chart
    const toEl = document.getElementById('dash-to-perf');
    if (toEl) {
      const byType   = to.byType   || {};
      const byStatus = to.byStatus || {};
      const typeColors = { GR:'var(--sap-success)', GI:'var(--sap-warning)', TR:'var(--sap-blue)' };
      toEl.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-lg)">
          <div>
            <div style="font-size:var(--font-xs);color:var(--sap-text-2);margin-bottom:8px;font-weight:600">POR TIPO</div>
            ${Object.entries(byType).map(([t,n]) => `
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                <span style="font-size:var(--font-sm)">${t}</span>
                <div style="display:flex;align-items:center;gap:8px">
                  <div style="width:80px;height:6px;background:var(--sap-border);border-radius:3px">
                    <div style="width:${to.totalOrders>0?Math.round(n/to.totalOrders*100):0}%;height:100%;background:${typeColors[t]||'var(--sap-blue)'};border-radius:3px"></div>
                  </div>
                  <strong style="font-size:var(--font-sm);min-width:20px">${n}</strong>
                </div>
              </div>`).join('') || '<div class="text-muted text-small">Sin datos</div>'}
          </div>
          <div>
            <div style="font-size:var(--font-xs);color:var(--sap-text-2);margin-bottom:8px;font-weight:600">POR ESTADO</div>
            ${Object.entries(byStatus).map(([s,n]) => `
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                ${Utils.badge(s)}
                <strong style="font-size:var(--font-sm)">${n}</strong>
              </div>`).join('') || '<div class="text-muted text-small">Sin datos</div>'}
          </div>
        </div>`;
    }

    // Stock status breakdown
    const ssEl = document.getElementById('dash-stock-status');
    if (ssEl) {
      const bars = [
        { label:'Normal (OK)',   val:summ.ok||0,       color:'var(--sap-success)', total:snap.length },
        { label:'Stock Bajo',    val:summ.low||0,      color:'var(--sap-warning)', total:snap.length },
        { label:'Crítico',       val:summ.critical||0, color:'var(--sap-error)',   total:snap.length },
        { label:'Vacío',         val:summ.empty||0,    color:'var(--sap-border)',  total:snap.length },
      ];
      ssEl.innerHTML = bars.map(b => `
        <div style="margin-bottom:var(--space-md)">
          <div style="display:flex;justify-content:space-between;font-size:var(--font-sm);margin-bottom:4px">
            <span>${b.label}</span>
            <strong style="color:${b.color}">${b.val}</strong>
          </div>
          <div class="progress">
            <div class="progress-bar" style="width:${b.total>0?Math.round(b.val/b.total*100):0}%;background:${b.color}"></div>
          </div>
        </div>`).join('');
    }

    // Critical alerts
    document.getElementById('dash-alert-count').textContent = crits.length;
    const alertEl = document.getElementById('dash-alerts');
    if (alertEl) alertEl.innerHTML = crits.length === 0
      ? `<div class="empty-state" style="padding:var(--space-xl)"><div class="empty-icon"><span class="sap-icon sap-icon--accept"></span></div><div class="empty-title">Sin alertas activas</div></div>`
      : crits.slice(0,5).map(c => `
          <div style="padding:var(--space-md);border-bottom:1px solid var(--sap-separator);display:flex;gap:var(--space-sm)">
            <span style="font-size:20px">${'<span class="sap-icon sap-icon--alert" style="color:'+(c.alertLevel==="CRITICAL"?"var(--sap-error)":"var(--sap-warning)")+'"></span>'}</span>
            <div style="flex:1">
              <div style="font-weight:600;font-size:var(--font-sm)">${c.sap_code} — ${c.description}</div>
              <div style="font-size:var(--font-xs);color:var(--sap-text-2)">
                Stock: ${Utils.formatNumber(c.totalQty,0)} ${c.base_unit} 
                (mín: ${Utils.formatNumber(c.min_stock,0)}) — ${c.coveragePercent}% de cobertura
              </div>
            </div>
            <button class="btn btn-ghost btn-sm" onclick="App.navigate('stock')">Ver</button>
          </div>`).join('');

    // Recent TOs
    const recentEl = document.getElementById('dash-recent-tos');
    if (recentEl) recentEl.innerHTML = tos.length === 0
      ? `<div class="empty-state" style="padding:var(--space-xl)"><div class="empty-icon"><span class="sap-icon sap-icon--table-view"></span></div><div class="empty-title">Sin TOs registradas</div></div>`
      : tos.map(t => `
          <div style="padding:var(--space-sm) var(--space-md);border-bottom:1px solid var(--sap-separator);display:flex;gap:var(--space-sm);align-items:center">
            <span style="font-size:18px">${t.to_type==='GR'?'<span class="sap-icon sap-icon--journey-arrive"></span>':t.to_type==='GI'?'<span class="sap-icon sap-icon--journey-depart"></span>':'<span class="sap-icon sap-icon--transfer"></span>'}</span>
            <div style="flex:1">
              <div style="font-size:var(--font-sm);font-weight:600">${t.to_number}</div>
              <div style="font-size:var(--font-xs);color:var(--sap-text-3)">${Utils.formatDateTime(t.created_at)}</div>
            </div>
            ${Utils.badge(t.status)}
          </div>`).join('');

};

window.View_dashboard_exportCSV = function() {
  const wh = document.getElementById('dash-wh')?.value || 'WH001';
  window.open(`/api/reports/stock-snapshot/export?warehouse=${wh}`);
};
