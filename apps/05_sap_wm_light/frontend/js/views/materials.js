/* ============================================================
   View: Materials — Maestro de Materiales desde API real
   ============================================================ */
App.registerView('materials', () => {
  setTimeout(View_materials_init, 0);
  return `
  <div>
    <div class="page-header">
      <div class="page-header-top">
        <button class="back-btn" onclick="App.navigate('home')"><span class="sap-icon sap-icon--nav-back"></span></button>
        <div>
          <div class="page-title">Maestro de Materiales</div>
          <div class="page-subtitle" id="mat-subtitle">Cargando desde base de datos...</div>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-primary" onclick="View_mat_syncSAP()"><span class="sap-icon sap-icon--synchronize"></span> Sincronizar SAP</button>
        </div>
      </div>
    </div>

    <!-- SAP Sync Banner -->
    <div style="background:var(--sap-info-bg);border:1px solid #B8D9F8;border-radius:var(--radius-md);padding:var(--space-sm) var(--space-md);display:flex;align-items:center;gap:var(--space-sm);margin-bottom:var(--space-lg);font-size:var(--font-sm)">
      <span><span class="sap-icon sap-icon--synchronize"></span></span>
      <span>Los materiales se sincronizan automáticamente desde SAP ERP cada 6 horas.</span>
      <span id="sap-conn-badge" class="badge badge-neutral" style="margin-left:auto">Verificando…</span>
    </div>

    <!-- Toolbar + Filters -->
    <div class="table-toolbar" style="margin-bottom:0">
      <span class="table-toolbar-title">Materiales</span>
      <span id="mat-count" class="table-toolbar-count">…</span>
      <div class="table-search">
        <span class="sap-icon sap-icon--search"></span>
        <input id="mat-search" type="text" placeholder="Código SAP, descripción…" oninput="View_materials_search(this.value)" />
      </div>
      <div class="table-spacer"></div>
      <select id="mat-type-filter" class="form-control" style="width:160px;height:28px;font-size:var(--font-sm)" onchange="View_materials_init()">
        <option value="">Todos los tipos</option>
        <option value="ROH">ROH — Materia Prima</option>
        <option value="FERT">FERT — Prod. Terminado</option>
        <option value="HALB">HALB — Semiterminado</option>
        <option value="HIBE">HIBE — Consumible</option>
      </select>
    </div>

    <div id="mat-table-wrap">${Utils.skeleton(7)}</div>
  </div>`;
});

window.View_materials_init = async function() {
  const typeFilter = document.getElementById('mat-type-filter')?.value || '';
  try {
    // Check SAP status in background
    API.get('/sap/status').then(r => {
      const badge = document.getElementById('sap-conn-badge');
      if (badge) {
        badge.textContent = r?.data?.connected ? 'SAP Conectado' : 'SAP Sin conexión';
        badge.className   = `badge ${r?.data?.connected ? 'badge-success' : 'badge-neutral'}`;
      }
    });

    const params = typeFilter ? `type=${typeFilter}` : '';
    const res  = await API.Materials.list(params);
    const data = res?.data || [];

    const subtitle = document.getElementById('mat-subtitle');
    if (subtitle) {
      const syncDate = res?.lastSync ? Utils.formatDateTime(res.lastSync) : 'No disponible';
      subtitle.textContent = `${data.length} materiales — Última sync: ${syncDate}`;
    }
    document.getElementById('mat-count').textContent = data.length;

    const typeColors = { ROH:'info', FERT:'success', HALB:'warning', HIBE:'neutral' };
    const typeLabel  = { ROH:'Materia Prima', FERT:'Prod. Terminado', HALB:'Semiterminado', HIBE:'Consumible' };

    const rows = data.map(m => [
      `<a href="#" onclick="View_mat_detail(${m.id});return false" class="text-blue text-bold">${m.sap_code}</a>`,
      m.description,
      `<span class="badge badge-${typeColors[m.material_type]||'neutral'}">${typeLabel[m.material_type]||m.material_type||'—'}</span>`,
      m.base_unit,
      m.batch_managed
        ? '<span class="badge badge-success">Sí</span>'
        : '<span class="badge badge-neutral">No</span>',
      Utils.badge(m.status),
      m.min_stock > 0 ? Utils.formatNumber(m.min_stock, 0) : '—',
      `<button class="btn btn-ghost btn-sm" onclick="View_mat_detail(${m.id})">Ver detalle</button>`
    ]);

    const tableHtml = Utils.buildTable({
      id: 'mat-table',
      headers: ['Código SAP','Descripción','Tipo','UM Base','Lotes','Estado','Stock Mín.','Acciones'],
      rows,
      empty: 'No hay materiales en la base de datos'
    });
    document.getElementById('mat-table-wrap').innerHTML = tableHtml;

    // Store data for search
    window._matData = data;
  } catch(e) {
    App.toast('error', 'Error cargando materiales: ' + e.message);
  }
};

let _matSearchTimer;
window.View_materials_search = function(q) {
  clearTimeout(_matSearchTimer);
  _matSearchTimer = setTimeout(() => Utils.filterTable('mat-search','mat-table'), 200);
};

window.View_mat_detail = async function(id) {
  App.Dialog.show({
    title: 'Detalle de Material',
    size: 'lg',
    body: `<div id="mat-dlg-body">${Utils.skeleton(4)}</div>`,
    actions: [{ label:'Cerrar', type:'secondary' }]
  });
  try {
    const res = await API.Materials.get(id);
    const m   = res?.data || {};
    const stock = m.stock || [];

    document.getElementById('mat-dlg-body').innerHTML = `
      <div class="form-row">
        <div class="form-field">
          <label class="form-label">Código SAP</label>
          <input class="form-control" value="${m.sap_code||''}" disabled />
        </div>
        <div class="form-field">
          <label class="form-label">Tipo de material</label>
          <input class="form-control" value="${m.material_type||''}" disabled />
        </div>
      </div>
      <div class="form-field mb-md">
        <label class="form-label">Descripción</label>
        <input class="form-control w-full" value="${m.description||''}" disabled />
      </div>
      <div class="form-row">
        <div class="form-field">
          <label class="form-label">Unidad base</label>
          <input class="form-control" value="${m.base_unit||''}" disabled />
        </div>
        <div class="form-field">
          <label class="form-label">Gestión de lotes</label>
          <input class="form-control" value="${m.batch_managed?'Sí':'No'}" disabled />
        </div>
        <div class="form-field">
          <label class="form-label">Stock mínimo</label>
          <input class="form-control" value="${m.min_stock||0}" disabled />
        </div>
      </div>
      ${stock.length > 0 ? `
        <div class="mt-md">
          <div style="font-weight:600;font-size:var(--font-sm);margin-bottom:8px">Stock actual</div>
          <div class="wm-table-wrap" style="max-height:180px;overflow:auto">
            <table class="wm-table">
              <thead><tr><th>Bin</th><th>Lote</th><th>Cantidad</th><th>UM</th><th>Tipo</th></tr></thead>
              <tbody>${stock.map(s=>`<tr>
                <td><strong>${s.bin?.bin_code||'—'}</strong></td>
                <td>${s.batch?.batch_number||'—'}</td>
                <td>${Utils.formatNumber(s.quantity,3)}</td>
                <td>${s.unit}</td>
                <td><span class="badge badge-neutral" style="font-size:10px">${s.stock_type}</span></td>
              </tr>`).join('')}</tbody>
            </table>
          </div>
        </div>` : '<p class="text-muted text-small mt-md">Sin stock en almacén.</p>'}`;
  } catch(e) {
    document.getElementById('mat-dlg-body').innerHTML = `<div class="empty-state"><div class="empty-icon"><span class="sap-icon sap-icon--error"></span></div><div class="empty-title">Error: ${e.message}</div></div>`;
  }
};

window.View_mat_syncSAP = async function() {
  App.Dialog.show({
    title: 'Sincronizar con SAP',
    size: 'sm',
    body: `
      <div style="text-align:center;padding:var(--space-lg) 0">
        <div style="font-size:48px;margin-bottom:var(--space-md)"><span class="sap-icon sap-icon--synchronize" style="font-size:48px"></span></div>
        <p>Se sincronizarán materiales y lotes desde SAP ERP.</p>
        <p class="text-muted text-small mt-sm">Este proceso puede tardar unos segundos.</p>
      </div>`,
    actions: [
      { label:'Iniciar Sincronización', type:'primary', closeOnClick: false, action: async () => {
          App.toast('info', 'Sincronización iniciada...');
          try {
            const r = await API.SAP.syncMaterials();
            App.toast('success', `<span class="sap-icon sap-icon--accept"></span> ${r?.count || 0} materiales sincronizados desde SAP`);
          } catch(e) {
            App.toast('error', 'Error de sincronización: ' + e.message);
          }
          App.Dialog.close();
          View_materials_init();
        }
      },
      { label:'Cancelar', type:'ghost' }
    ]
  });
};
