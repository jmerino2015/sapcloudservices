/* ============================================================
   View: Transfer Orders — Lista y gestión desde API real
   ============================================================ */
App.registerView('to', () => {
  setTimeout(View_to_init, 0);
  return `
  <div>
    <div class="page-header">
      <div class="page-header-top">
        <button class="back-btn" onclick="App.navigate('home')"><span class="sap-icon sap-icon--nav-back"></span></button>
        <div>
          <div class="page-title">Transfer Orders</div>
          <div class="page-subtitle">Gestión de traslados, entradas y salidas de mercancías</div>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-ghost" onclick="View_to_exportCSV()"><span class="sap-icon sap-icon--download"></span> Exportar</button>
          <button class="btn btn-primary" onclick="View_to_new()"><span class="sap-icon sap-icon--add"></span> Nueva TO</button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs" style="margin-bottom:0;margin-top:var(--space-md)">
        <div id="tab-all"       class="tab-item active" onclick="View_to_setFilter('')">Todas <span id="cnt-all"       class="table-toolbar-count">…</span></div>
        <div id="tab-open"      class="tab-item"        onclick="View_to_setFilter('OPEN')">Abiertas <span id="cnt-open"      class="table-toolbar-count"></span></div>
        <div id="tab-confirmed" class="tab-item"        onclick="View_to_setFilter('CONFIRMED')">Confirmadas <span id="cnt-confirmed" class="table-toolbar-count"></span></div>
        <div id="tab-cancelled" class="tab-item"        onclick="View_to_setFilter('CANCELLED')">Canceladas</div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="table-toolbar" style="margin-bottom:0">
      <span class="table-toolbar-title">Transfer Orders</span>
      <div class="table-search">
        <span class="sap-icon sap-icon--search"></span>
        <input id="to-search" type="text" placeholder="Buscar TO, material…" oninput="Utils.filterTable('to-search','to-table')" />
      </div>
      <div class="table-spacer"></div>
      <select id="to-wh" class="form-control" style="width:160px;height:28px;font-size:var(--font-sm)" onchange="View_to_init()">
        <option value="WH001">WH001 — Principal</option>
        <option value="WH002">WH002 — Secundario</option>
      </select>
    </div>

    <div id="to-table-wrap">${Utils.skeleton(6)}</div>
  </div>`;
});

let _toCurrentFilter = '';
let _toData = [];

window.View_to_init = async function() {
  const wh = document.getElementById('to-wh')?.value || 'WH001';
  try {
    const res  = await API.TO.list(`warehouse=${wh}&limit=100`);
    _toData    = res?.data || [];

    // Count tabs
    const open      = _toData.filter(t => t.status === 'OPEN').length;
    const confirmed = _toData.filter(t => t.status === 'CONFIRMED').length;
    const el = (id) => document.getElementById(id);
    if (el('cnt-all'))       el('cnt-all').textContent       = _toData.length;
    if (el('cnt-open'))      el('cnt-open').textContent      = open;
    if (el('cnt-confirmed')) el('cnt-confirmed').textContent = confirmed;

    View_to_render(_toCurrentFilter);
  } catch(e) {
    App.toast('error', 'Error cargando TOs: ' + e.message);
  }
};

window.View_to_setFilter = function(status) {
  _toCurrentFilter = status;
  document.querySelectorAll('.tabs .tab-item').forEach(el => el.classList.remove('active'));
  const map = { '':'tab-all', OPEN:'tab-open', CONFIRMED:'tab-confirmed', CANCELLED:'tab-cancelled' };
  document.getElementById(map[status])?.classList.add('active');
  View_to_render(status);
};

window.View_to_render = function(statusFilter) {
  const data = statusFilter ? _toData.filter(t => t.status === statusFilter) : _toData;
  const typeLabel = { GR:'Entrada GR', GI:'Salida GI', TR:'Traslado' };
  const typeBadge = { GR:'badge-info',  GI:'badge-warning',  TR:'badge-neutral' };

  const rows = data.map(t => [
    `<a href="#" onclick="View_to_detail(${t.id});return false" class="text-blue text-bold">${t.to_number}</a>`,
    `<span class="badge ${typeBadge[t.to_type]||'badge-neutral'}">${typeLabel[t.to_type]||t.to_type}</span>`,
    t.reference_type ? `<span style="font-size:var(--font-xs);color:var(--sap-text-2)">${t.reference_type}</span>` : '—',
    Utils.badge(t.status),
    Utils.formatDateTime(t.created_at),
    `<div class="flex gap-sm">
      ${t.status === 'OPEN'
        ? `<button class="btn btn-success btn-sm" onclick="View_to_confirm(${t.id},'${t.to_number}')"><span class="sap-icon sap-icon--accept"></span> Confirmar</button>
           <button class="btn btn-ghost btn-sm"   onclick="View_to_cancel(${t.id},'${t.to_number}')">Cancelar</button>`
        : `<button class="btn btn-ghost btn-sm" onclick="View_to_detail(${t.id})">Ver detalle</button>`}
    </div>`
  ]);

  const tableHtml = Utils.buildTable({
    id: 'to-table',
    headers: ['TO Número','Tipo','Referencia','Estado','Fecha Creación','Acciones'],
    rows,
    empty: 'No hay Transfer Orders para este filtro'
  });
  document.getElementById('to-table-wrap').innerHTML = tableHtml;
};

window.View_to_detail = async function(id) {
  App.Dialog.show({
    title: 'Detalle Transfer Order',
    size: 'lg',
    body: `<div id="to-dlg-body">${Utils.skeleton(4)}</div>`,
    actions: [{ label:'Cerrar', type:'secondary' }]
  });
  try {
    const res = await API.TO.get(id);
    const t   = res?.data || {};
    document.getElementById('to-dlg-body').innerHTML = `
      <div class="form-row">
        <div class="form-field"><label class="form-label">Número TO</label><input class="form-control" value="${t.to_number||''}" disabled /></div>
        <div class="form-field"><label class="form-label">Tipo</label><input class="form-control" value="${t.to_type||''}" disabled /></div>
        <div class="form-field"><label class="form-label">Estado</label><div class="mt-sm">${Utils.badge(t.status)}</div></div>
      </div>
      <div class="form-row">
        <div class="form-field"><label class="form-label">Almacén</label><input class="form-control" value="${t.warehouse_id||''}" disabled /></div>
        <div class="form-field"><label class="form-label">Fecha Creación</label><input class="form-control" value="${Utils.formatDateTime(t.created_at)}" disabled /></div>
        <div class="form-field"><label class="form-label">Confirmada</label><input class="form-control" value="${t.confirmed_at ? Utils.formatDateTime(t.confirmed_at) : '—'}" disabled /></div>
      </div>
      <div class="form-field"><label class="form-label">Notas</label><textarea class="form-control w-full" rows="2" disabled>${t.notes||''}</textarea></div>`;
  } catch(e) {
    document.getElementById('to-dlg-body').innerHTML = `<div class="empty-state"><div class="empty-icon"><span class="sap-icon sap-icon--error"></span></div><div class="empty-title">Error: ${e.message}</div></div>`;
  }
};

window.View_to_confirm = function(id, toNum) {
  App.Dialog.show({
    title: `Confirmar TO — ${toNum}`,
    size: 'sm',
    body: `
      <div style="text-align:center;padding:var(--space-md) 0">
        <div style="font-size:48px;margin-bottom:var(--space-md)"><span class="sap-icon sap-icon--accept" style="font-size:48px"></span></div>
        <p>¿Confirmar la ejecución de <strong>${toNum}</strong>?</p>
        <p class="text-muted text-small mt-sm">Esta acción registrará el movimiento de stock.</p>
      </div>`,
    actions: [
      { label:'Confirmar', type:'success', closeOnClick: false, action: async () => {
          try {
            await API.TO.confirm(id, {});
            App.toast('success', `<span class="sap-icon sap-icon--accept"></span> ${toNum} confirmada correctamente`);
            App.Dialog.close();
            View_to_init();
          } catch(e) {
            App.toast('error', 'Error al confirmar: ' + e.message);
          }
        }
      },
      { label:'Cancelar', type:'ghost' }
    ]
  });
};

window.View_to_cancel = function(id, toNum) {
  App.Dialog.show({
    title: `Cancelar TO — ${toNum}`,
    size: 'sm',
    body: `
      <div style="text-align:center;padding:var(--space-md) 0">
        <div style="font-size:48px;margin-bottom:var(--space-md)"><span class="sap-icon sap-icon--alert" style="font-size:48px"></span></div>
        <p>¿Cancelar la Transfer Order <strong>${toNum}</strong>?</p>
      </div>
      <div class="form-field mt-md">
        <label class="form-label required">Motivo de cancelación</label>
        <textarea class="form-control w-full" id="to-cancel-reason" placeholder="Ingrese el motivo..."></textarea>
      </div>`,
    actions: [
      { label:'Cancelar TO', type:'danger', closeOnClick: false, action: async () => {
          const reason = document.getElementById('to-cancel-reason')?.value;
          if (!reason?.trim()) { App.toast('error', 'Ingrese el motivo de cancelación'); return; }
          try {
            await API.TO.cancel(id);
            App.toast('warning', `${toNum} cancelada`);
            App.Dialog.close();
            View_to_init();
          } catch(e) {
            App.toast('error', 'Error al cancelar: ' + e.message);
          }
        }
      },
      { label:'Atrás', type:'ghost' }
    ]
  });
};

window.View_to_new = function() {
  App.Dialog.show({
    title: 'Nueva Transfer Order',
    size: 'lg',
    body: `
      <div class="form-row">
        <div class="form-field">
          <label class="form-label required">Tipo de movimiento</label>
          <select class="form-control" id="to-type">
            <option value="TR">TR — Traslado Interno</option>
            <option value="GR">GR — Entrada de Mercancías</option>
            <option value="GI">GI — Salida de Mercancías</option>
          </select>
        </div>
        <div class="form-field">
          <label class="form-label required">Almacén</label>
          <select class="form-control" id="to-wh-new">
            <option value="WH001">WH001 — Almacén Principal</option>
            <option value="WH002">WH002 — Almacén Secundario</option>
          </select>
        </div>
      </div>
      <div class="form-field mt-sm">
        <label class="form-label">Notas</label>
        <textarea class="form-control w-full" id="to-notes" rows="2" placeholder="Notas adicionales…"></textarea>
      </div>`,
    actions: [
      { label:'Crear TO', type:'primary', closeOnClick: false, action: async () => {
          const type = document.getElementById('to-type')?.value;
          const wh   = document.getElementById('to-wh-new')?.value;
          const notes= document.getElementById('to-notes')?.value;
          try {
            const res = await API.TO.create({ to_type: type, warehouse_id: wh, notes });
            App.toast('success', `<span class="sap-icon sap-icon--accept"></span> ${res?.data?.to_number || 'TO'} creada correctamente`);
            App.Dialog.close();
            View_to_init();
          } catch(e) {
            App.toast('error', 'Error al crear: ' + e.message);
          }
        }
      },
      { label:'Cancelar', type:'ghost' }
    ]
  });
};

window.View_to_exportCSV = function() {
  const wh = document.getElementById('to-wh')?.value || 'WH001';
  window.open(`/api/reports/movements/export?warehouse=${wh}`);
};
