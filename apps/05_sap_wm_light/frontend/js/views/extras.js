/* ============================================================
   WM Light — Vistas secundarias (Extras)
   ============================================================ */

// ── Batches view ─────────────────────────────────────────────
App.registerView('batches', () => `
  <div>
    <div class="page-header">
      <div class="page-header-top">
        <button class="back-btn" onclick="App.navigate('home')"><span class="sap-icon sap-icon--nav-back"></span></button>
        <div>
          <div class="page-title">Gestión de Lotes</div>
          <div class="page-subtitle">Lotes sincronizados desde SAP ERP</div>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-primary" onclick="App.toast('info','Sincronizando lotes...');setTimeout(()=>App.toast('success','12 lotes sincronizados'),2000)">
            <span class="sap-icon sap-icon--synchronize"></span> Sync SAP
          </button>
        </div>
      </div>
    </div>
    ${Utils.buildTable({
      id:'batches-table',
      toolbar:'<span class="table-toolbar-title">Lotes</span><div class="table-spacer"></div><button class="btn btn-ghost btn-sm"><span class="sap-icon sap-icon--download"></span> Exportar</button>',
      headers:['Lote','Material','Descripción','Fecha fab.','Fecha venc.','Cantidad','Estado'],
      rows:[
        ['BT2024001','MAT001','Cable UTP Cat6 305m','01/06/2023','01/06/2026','25 BOB','<span class="badge badge-success">Activo</span>'],
        ['BT2024045','MAT005','UPS 1500VA','15/09/2023','15/09/2026','2 EA','<span class="badge badge-warning">Bajo</span>'],
      ],
      empty:'No hay lotes registrados'
    })}
  </div>`
);

// ── Counting view ─────────────────────────────────────────────
App.registerView('counting', () => `
  <div>
    <div class="page-header">
      <div class="page-header-top">
        <button class="back-btn" onclick="App.navigate('home')"><span class="sap-icon sap-icon--nav-back"></span></button>
        <div>
          <div class="page-title">Inventario Físico</div>
          <div class="page-subtitle">Conteos cíclicos por zona</div>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-primary" onclick="App.toast('info','Nuevo conteo cíclico (en construcción)')">
            <span class="sap-icon sap-icon--add"></span> Nuevo Conteo
          </button>
        </div>
      </div>
    </div>
    ${Utils.buildTable({
      id:'count-table',
      toolbar:'<span class="table-toolbar-title">Conteos de Inventario</span>',
      headers:['N° Conteo','Zona','Bins','Estado','Iniciado','Responsable'],
      rows:[
        ['CNT-2024-001','Zona C','48 bins','<span class="badge badge-warning">En proceso</span>','14/01/2024','alopez'],
        ['CNT-2024-002','Zona A','12 bins','<span class="badge badge-success">Cerrado</span>','10/01/2024','mgomez'],
      ],
      empty:'No hay conteos registrados'
    })}
  </div>`
);

// ── Reports view ──────────────────────────────────────────────
App.registerView('reports', () => {
  const cards = [
    { icon:'sap-icon--inventory',    title:'Snapshot de Stock',      sub:'Stock actual por ubicación',           color:'var(--sap-blue)'    },
    { icon:'sap-icon--bar-chart',    title:'KPIs Operacionales',     sub:'Throughput, fill rate, accuracy',      color:'var(--sap-success)' },
    { icon:'sap-icon--transfer',     title:'Movimientos de Stock',   sub:'Todas las transacciones del período',  color:'var(--sap-blue)'    },
    { icon:'sap-icon--synchronize',  title:'Rendimiento de TOs',     sub:'Tiempo ciclo y productividad',         color:'var(--sap-warning)' },
    { icon:'sap-icon--alert',        title:'Alertas de Stock',       sub:'Materiales bajo mínimo',               color:'var(--sap-error)'   },
    { icon:'sap-icon--table-view',   title:'Auditoría de Ops.',      sub:'Trazabilidad completa',                color:'var(--sap-blue)'    },
  ];
  return `
  <div>
    <div class="page-header">
      <div class="page-header-top">
        <button class="back-btn" onclick="App.navigate('home')"><span class="sap-icon sap-icon--nav-back"></span></button>
        <div>
          <div class="page-title">Reportes</div>
          <div class="page-subtitle">Generación y exportación de reportes WM</div>
        </div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:var(--space-md)">
      ${cards.map(r => `
        <div class="card" style="cursor:pointer"
             onmouseenter="this.style.boxShadow='0 0 0 2px var(--sap-blue),0 4px 16px rgba(0,0,0,0.1)'"
             onmouseleave="this.style.boxShadow=''"
             onclick="App.toast('info','Generando reporte...');setTimeout(()=>App.toast('success','Reporte listo'),1500)">
          <div class="card-body" style="display:flex;flex-direction:column;gap:var(--space-sm)">
            <div style="width:2.5rem;height:2.5rem;border-radius:0.5rem;background:var(--sap-blue-light);
                        display:flex;align-items:center;justify-content:center;font-size:1.25rem;color:${r.color}">
              <span class="sap-icon ${r.icon}"></span>
            </div>
            <div style="font-weight:600">${r.title}</div>
            <div class="text-muted text-small">${r.sub}</div>
            <div class="flex gap-sm mt-sm">
              <button class="btn btn-secondary btn-sm"><span class="sap-icon sap-icon--download"></span> PDF</button>
              <button class="btn btn-ghost btn-sm"><span class="sap-icon sap-icon--table-view"></span> Excel</button>
            </div>
          </div>
        </div>`).join('')}
    </div>
  </div>`;
});

// ── SAP Sync view — API real ──────────────────────────────────
App.registerView('sap-sync', () => {
  setTimeout(View_sap_init, 0);
  return `
  <div>
    <div class="page-header">
      <div class="page-header-top">
        <button class="back-btn" onclick="App.navigate('home')"><span class="sap-icon sap-icon--nav-back"></span></button>
        <div>
          <div class="page-title">Sincronización SAP ERP</div>
          <div class="page-subtitle" id="sap-subtitle">Verificando conexión con SAP…</div>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-ghost" onclick="View_sap_syncType('materials')">
            <span class="sap-icon sap-icon--product"></span> Sync Materiales
          </button>
          <button class="btn btn-ghost" onclick="View_sap_syncType('batches')">
            <span class="sap-icon sap-icon--label"></span> Sync Lotes
          </button>
          <button class="btn btn-primary" onclick="View_sap_syncFull()">
            <span class="sap-icon sap-icon--synchronize"></span> Sync Completa
          </button>
        </div>
      </div>
    </div>

    <!-- Estado conexión banner -->
    <div id="sap-conn-banner" style="
      border-radius:var(--radius-md);
      padding:var(--space-md) var(--space-lg);
      margin-bottom:var(--space-lg);
      display:flex;align-items:center;gap:var(--space-md);
      background:var(--sap-neutral-bg);border:1px solid var(--sap-border)">
      <div style="font-size:2rem"><span class="sap-icon sap-icon--synchronize"></span></div>
      <div style="flex:1">
        <div style="font-weight:700;font-size:var(--font-md)">Verificando conexión con SAP…</div>
        <div id="sap-conn-detail" class="text-muted text-small mt-xs"></div>
      </div>
      <div id="sap-conn-badge" class="badge badge-neutral">Verificando</div>
    </div>

    <!-- KPIs -->
    <div id="sap-kpis" class="kpi-strip">${Utils.skeleton(4)}</div>

    <!-- Log table -->
    <div class="table-toolbar">
      <span class="table-toolbar-title">Historial de Sincronizaciones</span>
      <span id="sap-log-count" class="table-toolbar-count">…</span>
      <div class="table-spacer"></div>
      <button class="btn btn-ghost btn-sm" onclick="View_sap_init()">
        <span class="sap-icon sap-icon--refresh"></span> Actualizar
      </button>
    </div>
    <div id="sap-log-wrap">${Utils.skeleton(5)}</div>
  </div>`;
});

// ── SAP Sync functions ────────────────────────────────────────
window.View_sap_init = async function() {
  const [statusR, logR, matR] = await Promise.allSettled([
    API.SAP.status(),
    API.get('/sap/sync/log'),
    API.Materials.list()
  ]);

  // Banner de estado
  const status  = statusR.status === 'fulfilled' ? statusR.value : {};
  const banner  = document.getElementById('sap-conn-banner');
  const badge   = document.getElementById('sap-conn-badge');
  const detail  = document.getElementById('sap-conn-detail');
  const subtitle= document.getElementById('sap-subtitle');

  if (banner) {
    const icon = banner.querySelector('.sap-icon');
    if (status.connected) {
      banner.style.background    = 'var(--sap-success-bg)';
      banner.style.borderColor   = 'var(--sap-success-border)';
      if (badge)  { badge.textContent = 'Conectado'; badge.className = 'badge badge-success'; }
      if (icon)   icon.className = 'sap-icon sap-icon--connected';
      if (detail) detail.textContent = `Latencia: ${status.latency || '—'}ms | Última sync: ${status.lastSync ? Utils.formatDateTime(status.lastSync) : 'N/A'} (${status.lastSyncType || '—'})`;
      if (subtitle) subtitle.textContent = 'SAP ERP conectado — Sistema listo para sincronización';
    } else {
      banner.style.background  = 'var(--sap-error-bg)';
      banner.style.borderColor = 'var(--sap-error-border)';
      if (badge)  { badge.textContent = 'Sin conexión'; badge.className = 'badge badge-error'; }
      if (icon)   icon.className = 'sap-icon sap-icon--disconnected';
      if (detail) detail.innerHTML = `<span style="color:var(--sap-error);font-weight:600">Error: ${status.error || 'No se puede conectar con SAP'}</span><br><span>Última sync exitosa: ${status.lastSync ? Utils.formatDateTime(status.lastSync) : 'Sin registro'}</span>`;
      if (subtitle) subtitle.textContent = 'SAP ERP sin conexión — Los datos locales están disponibles';
    }
  }

  // KPIs
  const logs   = logR.status  === 'fulfilled' ? (logR.value?.data  || []) : [];
  const mats   = matR.status  === 'fulfilled' ? (matR.value?.data  || []) : [];
  const ok     = logs.filter(l => l.status === 'SUCCESS').length;
  const err    = logs.filter(l => l.status === 'ERROR').length;
  const lastOk = logs.find(l => l.status === 'SUCCESS');

  const kpisEl = document.getElementById('sap-kpis');
  if (kpisEl) kpisEl.innerHTML = `
    <div class="kpi-card" style="--kpi-color:var(--sap-success)">
      <div class="kpi-label">Materiales en BD</div>
      <div class="kpi-value">${mats.length}</div>
      <div class="kpi-sub">registros sincronizados</div>
    </div>
    <div class="kpi-card" style="--kpi-color:var(--sap-blue)">
      <div class="kpi-label">Syncs Exitosas</div>
      <div class="kpi-value">${ok}</div>
      <div class="kpi-sub">${logs.length} en historial total</div>
    </div>
    <div class="kpi-card" style="--kpi-color:${err > 0 ? 'var(--sap-error)' : 'var(--sap-success)'}">
      <div class="kpi-label">Syncs con Error</div>
      <div class="kpi-value">${err}</div>
      <div class="kpi-sub">${err > 0 ? 'Revisar config SAP' : 'Sin errores recientes'}</div>
    </div>
    <div class="kpi-card" style="--kpi-color:var(--sap-blue)">
      <div class="kpi-label">Última Sync OK</div>
      <div class="kpi-value" style="font-size:var(--font-lg)">${lastOk ? Utils.formatDate(lastOk.finished_at) : '—'}</div>
      <div class="kpi-sub">${lastOk ? `${lastOk.sync_type} · ${lastOk.records_processed || 0} registros` : 'Sin historial'}</div>
    </div>`;

  // Tabla log
  const cntEl = document.getElementById('sap-log-count');
  if (cntEl) cntEl.textContent = logs.length;

  const typeIcon = { MATERIALS:'sap-icon--product', BATCHES:'sap-icon--label', FULL:'sap-icon--synchronize' };

  const rows = logs.map(l => [
    Utils.formatDateTime(l.started_at),
    `<span style="display:flex;gap:6px;align-items:center">
       <span class="sap-icon ${typeIcon[l.sync_type] || 'sap-icon--synchronize'}"></span>
       ${l.sync_type || '—'}
     </span>`,
    l.records_processed != null ? `<strong>${l.records_processed}</strong> registros` : '—',
    l.status === 'SUCCESS'
      ? '<span class="badge badge-success">Exitosa</span>'
      : l.status === 'ERROR'
      ? '<span class="badge badge-error">Error</span>'
      : '<span class="badge badge-warning">Parcial</span>',
    l.started_at && l.finished_at
      ? `${((new Date(l.finished_at) - new Date(l.started_at)) / 1000).toFixed(1)}s`
      : '—',
    l.initiated_by || 'Automático',
    l.error_message
      ? `<span style="color:var(--sap-error);font-size:var(--font-xs)">${String(l.error_message).substring(0,60)}…</span>`
      : '<span style="color:var(--sap-text-3)">—</span>'
  ]);

  const wrapEl = document.getElementById('sap-log-wrap');
  if (wrapEl) wrapEl.innerHTML = Utils.buildTable({
    id: 'sap-log-table',
    headers: ['Fecha/Hora','Tipo','Registros','Estado','Duración','Origen','Detalle'],
    rows,
    empty: `<div class="empty-state" style="padding:3rem">
      <div class="empty-icon"><span class="sap-icon sap-icon--synchronize"></span></div>
      <div class="empty-title">Sin historial de sincronizaciones</div>
      <div class="empty-sub">Ejecuta una sincronización manual para comenzar</div>
    </div>`
  });
};

window.View_sap_syncType = async function(type) {
  const labels = { materials:'Materiales', batches:'Lotes' };
  App.toast('info', `Sincronizando ${labels[type] || type}…`);
  try {
    const r = await API.post(`/sap/sync/${type}`, {});
    App.toast('success', `Sync ${labels[type]}: ${r.count || r.records || 0} registros procesados`);
    View_sap_init();
  } catch(e) {
    App.toast('error', `Error en sync ${type}: ${e.message}`);
  }
};

window.View_sap_syncFull = function() {
  App.Dialog.show({
    title: 'Sincronización Completa SAP',
    size: 'sm',
    body: `
      <div style="text-align:center;padding:var(--space-lg) 0">
        <div style="font-size:3rem;color:var(--sap-blue);margin-bottom:var(--space-md)">
          <span class="sap-icon sap-icon--synchronize"></span>
        </div>
        <p>Se sincronizarán <strong>materiales y lotes</strong> desde SAP ERP.</p>
        <p class="text-muted text-small mt-sm">El proceso puede tardar varios segundos.</p>
      </div>`,
    actions: [
      { label: 'Iniciar Sincronización', type: 'primary', closeOnClick: false, action: async () => {
          App.toast('info', 'Sincronización completa iniciada…');
          App.Dialog.close();
          try {
            const r = await API.post('/sap/sync/full', {});
            App.toast('success', `Sync completa: ${r.materialsCount || 0} materiales, ${r.batchesCount || 0} lotes`);
          } catch(e) {
            App.toast('error', 'Error en sync completa: ' + e.message);
          }
          View_sap_init();
        }
      },
      { label: 'Cancelar', type: 'ghost' }
    ]
  });
};
