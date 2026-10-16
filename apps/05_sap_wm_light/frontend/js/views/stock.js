/* ============================================================
   View: Stock — Stock por Ubicación desde API real
   ============================================================ */
App.registerView('stock', () => {
  setTimeout(View_stock_init, 0);
  return `
  <div>
    <div class="page-header">
      <div class="page-header-top">
        <button class="back-btn" onclick="App.navigate('home')"><span class="sap-icon sap-icon--nav-back"></span></button>
        <div>
          <div class="page-title">Stock por Ubicación</div>
          <div class="page-subtitle">Inventario en tiempo real — Multi-almacén</div>
        </div>
        <div class="page-header-actions">
          <select id="stock-wh" class="form-control" style="width:160px;height:32px" onchange="View_stock_init()">
            <option value="WH001">WH001 — Principal</option>
            <option value="WH002">WH002 — Secundario</option>
          </select>
          <button class="btn btn-secondary" onclick="View_stock_heatmap()"><span class="sap-icon sap-icon--map-2"></span> Heatmap</button>
          <button class="btn btn-ghost" onclick="View_stock_export()"><span class="sap-icon sap-icon--download"></span> Exportar CSV</button>
        </div>
      </div>
    </div>

    <!-- KPI strip -->
    <div id="stock-kpis" class="kpi-strip" style="grid-template-columns:repeat(4,1fr);margin-bottom:var(--space-lg)">
      ${[...Array(4)].map(() => `<div class="kpi-card"><div style="height:60px;background:var(--sap-hover);border-radius:6px;animation:pulse 1.5s infinite"></div></div>`).join('')}
    </div>

    <!-- Filters -->
    <div class="table-toolbar" style="margin-bottom:0">
      <span class="table-toolbar-title">Stock por Ubicación</span>
      <span id="stock-count" class="table-toolbar-count">…</span>
      <div class="table-search">
        <span class="sap-icon sap-icon--search"></span>
        <input id="stock-search" type="text" placeholder="Bin, material, lote…" oninput="Utils.filterTable('stock-search','stock-table')" />
      </div>
      <div class="table-spacer"></div>
      <select id="stock-status-filter" class="form-control" style="width:130px;height:28px;font-size:var(--font-sm)" onchange="View_stock_init()">
        <option value="">Todos los estados</option>
        <option value="CRITICAL"><span class="sap-icon sap-icon--alert"></span> Crítico</option>
        <option value="LOW"><span class="sap-icon sap-icon--alert"></span> Bajo</option>
        <option value="OK"><span class="sap-icon sap-icon--accept"></span> Normal</option>
      </select>
    </div>

    <div id="stock-table-wrap">${Utils.skeleton(8)}</div>
  </div>`;
});

window.View_stock_init = async function() {
  const wh     = document.getElementById('stock-wh')?.value || 'WH001';
  const filter = document.getElementById('stock-status-filter')?.value || '';
  try {
    const res  = await API.get(`/reports/stock-snapshot?warehouse=${wh}`);
    let data   = res?.data || [];
    const summ = res?.summary || {};

    if (filter) data = data.filter(d => d.stockStatus === filter);

    // KPIs
    const kpisEl = document.getElementById('stock-kpis');
    if (kpisEl) kpisEl.innerHTML = `
      <div class="kpi-card" style="--kpi-color:var(--sap-blue)">
        <div class="kpi-label">Posiciones con stock</div>
        <div class="kpi-value">${res?.data?.length ?? 0}</div>
      </div>
      <div class="kpi-card" style="--kpi-color:var(--sap-success)">
        <div class="kpi-label">Estado normal</div>
        <div class="kpi-value">${summ.ok ?? 0}</div>
        <div class="kpi-sub">ubicaciones</div>
      </div>
      <div class="kpi-card" style="--kpi-color:var(--sap-warning)">
        <div class="kpi-label">Stock bajo</div>
        <div class="kpi-value">${summ.low ?? 0}</div>
        <div class="kpi-sub">requieren reposición</div>
      </div>
      <div class="kpi-card" style="--kpi-color:var(--sap-error)">
        <div class="kpi-label">Stock crítico</div>
        <div class="kpi-value">${summ.critical ?? 0}</div>
        <div class="kpi-sub">bajo mínimo absoluto</div>
      </div>`;

    document.getElementById('stock-count').textContent = data.length;

    const statusLabel = { OK:'Normal', LOW:'Bajo', CRITICAL:'Crítico', EMPTY:'Vacío' };
    const rows = data.map(s => [
      `<strong>${s.bin?.bin_code || '—'}</strong>`,
      s.material?.sap_code || '—',
      s.material?.description || '—',
      s.batch?.batch_number ? `<span class="badge badge-neutral">${s.batch.batch_number}</span>` : '—',
      `<strong>${Utils.formatNumber(s.quantity, 3)}</strong>`,
      s.unit || s.material?.base_unit || '—',
      `<span class="stock-indicator stock-${(s.stockStatus||'ok').toLowerCase()}">
         <span class="stock-dot"></span>${statusLabel[s.stockStatus] || s.stockStatus}
       </span>`,
      `<button class="btn btn-ghost btn-sm" onclick="View_stock_movements(${s.id},'${s.bin?.bin_code}','${s.material?.sap_code}')">Movimientos</button>`
    ]);

    const tableHtml = Utils.buildTable({
      id: 'stock-table',
      headers: ['Ubicación','Material','Descripción','Lote','Cantidad','UM','Estado','Acciones'],
      rows,
      empty: 'No hay stock registrado en este almacén'
    });

    const wrap = document.getElementById('stock-table-wrap');
    if (wrap) wrap.innerHTML = tableHtml;

  } catch(e) {
    App.toast('error', 'Error cargando stock: ' + e.message);
  }
};

window.View_stock_movements = async function(quantId, bin, mat) {
  App.Dialog.show({
    title: `Movimientos — ${bin} / ${mat}`,
    size: 'lg',
    body: `<div id="mov-dlg-body">${Utils.skeleton(5)}</div>`,
    actions: [{ label:'Cerrar', type:'secondary' }]
  });
  try {
    const wh  = document.getElementById('stock-wh')?.value || 'WH001';
    const res = await API.get(`/reports/movements?warehouse=${wh}&material=${encodeURIComponent(mat)}&limit=30`);
    const movs = res?.data || [];
    const typeLabel = { GR:'Entrada GR', GI:'Salida GI', TR:'Traslado', INV_ADJ:'Ajuste Inv.' };
    const typeClass = { GR:'badge-info', GI:'badge-warning', TR:'badge-neutral', INV_ADJ:'badge-error' };
    document.getElementById('mov-dlg-body').innerHTML = `
      <div class="wm-table-wrap">
        <table class="wm-table">
          <thead><tr><th>Fecha</th><th>Tipo</th><th>Desde</th><th>Hasta</th><th>Cantidad</th><th>UM</th></tr></thead>
          <tbody>
            ${movs.length === 0 ? `<tr><td colspan="6" style="text-align:center;color:var(--sap-text-2)">Sin movimientos registrados</td></tr>` :
              movs.map(m => `<tr>
                <td>${Utils.formatDateTime(m.created_at)}</td>
                <td><span class="badge ${typeClass[m.movement_type]||'badge-neutral'}">${typeLabel[m.movement_type]||m.movement_type}</span></td>
                <td>${m.fromBin?.bin_code || '—'}</td>
                <td>${m.toBin?.bin_code || '—'}</td>
                <td><strong>${Utils.formatNumber(m.quantity,3)}</strong></td>
                <td>${m.unit||'—'}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  } catch(e) {
    document.getElementById('mov-dlg-body').innerHTML = `<div class="empty-state"><div class="empty-icon"><span class="sap-icon sap-icon--error"></span></div><div class="empty-title">Error: ${e.message}</div></div>`;
  }
};

window.View_stock_export = function() {
  const wh = document.getElementById('stock-wh')?.value || 'WH001';
  window.open(`/api/reports/stock-snapshot/export?warehouse=${wh}`);
};

window.View_stock_heatmap = async function() {
  const wh  = document.getElementById('stock-wh')?.value || 'WH001';
  const res = await API.get(`/warehouses/${wh}/bins?status=ACTIVE`);
  const bins = res?.data || [];
  const occupied = new Set(bins.filter(b => b.hasStock).map(b => b.bin_code));
  const blocked  = new Set(bins.filter(b => b.status === 'BLOCKED').map(b => b.bin_code));

  const cells = bins.slice(0, 120).map(b => {
    const cls = b.status === 'BLOCKED' ? 'bin-blocked'
      : !b.hasStock ? 'bin-empty'
      : 'bin-mid';
    return `<div class="bin-cell ${cls}" title="${b.bin_code}"></div>`;
  }).join('');

  App.Dialog.show({
    title: `<span class="sap-icon sap-icon--map-2"></span> Heatmap — ${wh}`,
    size: 'lg',
    body: `
      <div style="margin-bottom:var(--space-md);display:flex;gap:var(--space-md);flex-wrap:wrap;align-items:center">
        <span style="font-size:var(--font-sm);color:var(--sap-text-2)">Leyenda:</span>
        <span style="display:flex;align-items:center;gap:4px;font-size:var(--font-xs)"><span style="width:14px;height:14px;background:var(--sap-border);border-radius:2px;display:inline-block"></span>Vacío</span>
        <span style="display:flex;align-items:center;gap:4px;font-size:var(--font-xs)"><span style="width:14px;height:14px;background:#5BAD5B;border-radius:2px;display:inline-block"></span>Con stock</span>
        <span style="display:flex;align-items:center;gap:4px;font-size:var(--font-xs)"><span style="width:14px;height:14px;background:repeating-linear-gradient(45deg,#BB0000 0,#BB0000 4px,#fff 4px,#fff 8px);border-radius:2px;display:inline-block"></span>Bloqueado</span>
        <span style="margin-left:auto;font-size:var(--font-sm);color:var(--sap-text-2)">${occupied.size} ocupados / ${bins.length} totales</span>
      </div>
      <div style="overflow:auto">
        <div class="bin-grid" style="grid-template-columns:repeat(12,28px);gap:4px">${cells}</div>
      </div>`,
    actions: [{ label:'Cerrar', type:'secondary' }]
  });
};
