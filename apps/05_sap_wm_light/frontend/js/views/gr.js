/* ============================================================
   View: GR — Entrada de Mercancías desde API real
   ============================================================ */
App.registerView('gr', () => {
  setTimeout(View_gr_init, 0);
  return `
  <div>
    <div class="page-header">
      <div class="page-header-top">
        <button class="back-btn" onclick="App.navigate('home')"><span class="sap-icon sap-icon--nav-back"></span></button>
        <div>
          <div class="page-title">Entrada de Mercancías</div>
          <div class="page-subtitle">Recepciones GR — Putaway automático según estrategia</div>
        </div>
        <div class="page-header-actions">
          <select id="gr-wh-filter" class="form-control" style="width:160px;height:32px" onchange="View_gr_init()">
            <option value="WH001">WH001 — Principal</option>
            <option value="WH002">WH002 — Secundario</option>
          </select>
          <button class="btn btn-primary" onclick="View_gr_new()"><span class="sap-icon sap-icon--add"></span> Nueva Recepción</button>
        </div>
      </div>
      <div class="tabs" style="margin-bottom:0;margin-top:var(--space-md)">
        <div id="gr-tab-all"       class="tab-item active" onclick="View_gr_setTab('')">Todas <span id="gr-cnt-all" class="table-toolbar-count">…</span></div>
        <div id="gr-tab-open"      class="tab-item"        onclick="View_gr_setTab('OPEN')">Pendientes <span id="gr-cnt-open" class="table-toolbar-count"></span></div>
        <div id="gr-tab-confirmed" class="tab-item"        onclick="View_gr_setTab('CONFIRMED')">Confirmadas</div>
        <div id="gr-tab-cancelled" class="tab-item"        onclick="View_gr_setTab('CANCELLED')">Canceladas</div>
      </div>
    </div>

    <div class="table-toolbar" style="margin-bottom:0">
      <span class="table-toolbar-title">Entradas de Mercancías</span>
      <div class="table-search">
        <span class="sap-icon sap-icon--search"></span>
        <input id="gr-search" type="text" placeholder="Buscar GR, proveedor, OC…" oninput="Utils.filterTable('gr-search','gr-table')" />
      </div>
    </div>

    <div id="gr-table-wrap">${Utils.skeleton(5)}</div>
  </div>`;
});

let _grData = [];
let _grTab  = '';

window.View_gr_init = async function() {
  const wh = document.getElementById('gr-wh-filter')?.value || 'WH001';
  try {
    const res = await API.GR.list(`warehouse=${wh}&limit=100`);
    _grData   = res?.data || [];
    const open = _grData.filter(g => g.status === 'OPEN').length;
    const set  = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('gr-cnt-all', _grData.length);
    set('gr-cnt-open', open);
    View_gr_render(_grTab);
  } catch(e) {
    App.toast('error', 'Error cargando GR: ' + e.message);
  }
};

window.View_gr_setTab = function(status) {
  _grTab = status;
  document.querySelectorAll('[id^="gr-tab-"]').forEach(el => el.classList.remove('active'));
  const map = { '':'gr-tab-all', OPEN:'gr-tab-open', CONFIRMED:'gr-tab-confirmed', CANCELLED:'gr-tab-cancelled' };
  document.getElementById(map[status])?.classList.add('active');
  View_gr_render(status);
};

window.View_gr_render = function(statusFilter) {
  const data = statusFilter ? _grData.filter(g => g.status === statusFilter) : _grData;
  const stratLabel = { FEFO:'FEFO', FIFO:'FIFO', MANUAL:'Manual', FIXED_BIN:'Bin Fijo' };

  const rows = data.map(gr => [
    `<a href="#" onclick="View_gr_detail(${gr.id});return false" class="text-blue text-bold">${gr.gr_number}</a>`,
    gr.po_number ? `<span class="badge badge-info">${gr.po_number}</span>` : '—',
    gr.vendor_name || '—',
    `<span class="badge badge-neutral">${stratLabel[gr.putaway_strategy]||gr.putaway_strategy||'—'}</span>`,
    gr.items_count != null ? `${gr.items_count} pos.` : '—',
    Utils.badge(gr.status),
    Utils.formatDate(gr.created_at),
    gr.status === 'OPEN'
      ? `<button class="btn btn-primary btn-sm" onclick="View_gr_confirm(${gr.id},'${gr.gr_number}')"><span class="sap-icon sap-icon--play"></span> Procesar</button>`
      : `<button class="btn btn-ghost btn-sm" onclick="View_gr_detail(${gr.id})">Ver</button>`
  ]);

  const tableHtml = Utils.buildTable({
    id: 'gr-table',
    headers: ['GR Número','Orden de Compra','Proveedor','Estrategia','Posiciones','Estado','Fecha','Acción'],
    rows,
    empty: 'No hay recepciones en este estado'
  });
  document.getElementById('gr-table-wrap').innerHTML = tableHtml;
};

window.View_gr_detail = async function(id) {
  App.Dialog.show({
    title: 'Detalle GR',
    size: 'lg',
    body: `<div id="gr-dlg-body">${Utils.skeleton(4)}</div>`,
    actions: [{ label:'Cerrar', type:'secondary' }]
  });
  try {
    const res = await API.GR.get(id);
    const gr  = res?.data || {};
    const items = gr.items || [];
    document.getElementById('gr-dlg-body').innerHTML = `
      <div class="form-row">
        <div class="form-field"><label class="form-label">Número GR</label><input class="form-control" value="${gr.gr_number||''}" disabled /></div>
        <div class="form-field"><label class="form-label">Estado</label><div class="mt-sm">${Utils.badge(gr.status)}</div></div>
        <div class="form-field"><label class="form-label">Almacén</label><input class="form-control" value="${gr.warehouse_id||''}" disabled /></div>
      </div>
      <div class="form-row">
        <div class="form-field"><label class="form-label">Proveedor</label><input class="form-control" value="${gr.vendor_name||'—'}" disabled /></div>
        <div class="form-field"><label class="form-label">OC SAP</label><input class="form-control" value="${gr.po_number||'—'}" disabled /></div>
        <div class="form-field"><label class="form-label">Estrategia</label><input class="form-control" value="${gr.putaway_strategy||'—'}" disabled /></div>
      </div>
      ${items.length > 0 ? `
        <div class="mt-md">
          <div style="font-weight:600;font-size:var(--font-sm);margin-bottom:8px">Posiciones (${items.length})</div>
          <div class="wm-table-wrap" style="max-height:200px;overflow:auto">
            <table class="wm-table">
              <thead><tr><th>Material</th><th>Lote</th><th>Qty</th><th>UM</th><th>Bin Destino</th><th>Estado</th></tr></thead>
              <tbody>${items.map(it=>`<tr>
                <td>${it.material?.sap_code||'—'} <span style="font-size:var(--font-xs);color:var(--sap-text-2)">${it.material?.description||''}</span></td>
                <td>${it.batch?.batch_number||'—'}</td>
                <td><strong>${Utils.formatNumber(it.quantity_received||it.quantity_planned,3)}</strong></td>
                <td>${it.unit||'—'}</td>
                <td>${it.destination_bin?.bin_code||'Auto'}</td>
                <td>${Utils.badge(it.status||'PENDING')}</td>
              </tr>`).join('')}</tbody>
            </table>
          </div>
        </div>` : ''}`;
  } catch(e) {
    document.getElementById('gr-dlg-body').innerHTML = `<div class="empty-state"><div class="empty-icon"><span class="sap-icon sap-icon--error"></span></div><div class="empty-title">Error: ${e.message}</div></div>`;
  }
};

window.View_gr_confirm = function(id, grNum) {
  App.Dialog.show({
    title: `Procesar Recepción — ${grNum}`,
    size: 'sm',
    body: `
      <div style="text-align:center;padding:var(--space-md) 0">
        <div style="font-size:48px"><span class="sap-icon sap-icon--journey-arrive" style="font-size:48px"></span></div>
        <p class="mt-md">¿Confirmar la recepción <strong>${grNum}</strong>?</p>
        <p class="text-muted text-small mt-sm">Se generarán Transfer Orders de putaway automáticamente.</p>
      </div>`,
    actions: [
      { label:'Confirmar Recepción', type:'primary', closeOnClick:false, action: async () => {
          try {
            const r = await API.GR.confirm(id);
            const toCount = r?.transferOrders?.length || 0;
            App.toast('success', `<span class="sap-icon sap-icon--accept"></span> ${grNum} confirmada${toCount ? ` — ${toCount} TOs de putaway generadas` : ''}`);
            App.Dialog.close();
            View_gr_init();
          } catch(e) {
            App.toast('error', 'Error: ' + e.message);
          }
        }
      },
      { label:'Cancelar', type:'ghost' }
    ]
  });
};

window.View_gr_new = function() {
  App.Dialog.show({
    title: 'Nueva Entrada de Mercancías',
    size: 'lg',
    body: `
      <div class="form-row">
        <div class="form-field">
          <label class="form-label required">Almacén destino</label>
          <select class="form-control" id="gr-wh">
            <option value="WH001">WH001 — Almacén Principal</option>
            <option value="WH002">WH002 — Almacén Secundario</option>
          </select>
        </div>
        <div class="form-field">
          <label class="form-label">Estrategia putaway</label>
          <select class="form-control" id="gr-strategy">
            <option value="FEFO">Automático (FEFO)</option>
            <option value="FIFO">Automático (FIFO)</option>
            <option value="MANUAL">Manual</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-field">
          <label class="form-label">N° Orden de Compra SAP</label>
          <input class="form-control" id="gr-po" placeholder="Ej: 4500001234 (opcional)" />
        </div>
        <div class="form-field">
          <label class="form-label">Proveedor</label>
          <input class="form-control" id="gr-vendor" placeholder="Nombre del proveedor" />
        </div>
      </div>

      <div style="border:1px solid var(--sap-border);border-radius:var(--radius-md);padding:var(--space-md);margin-top:var(--space-md)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-sm)">
          <strong>Posiciones</strong>
          <button class="btn btn-secondary btn-sm" onclick="View_gr_addLine()"><span class="sap-icon sap-icon--add"></span> Agregar línea</button>
        </div>
        <table class="wm-table" id="gr-lines-table">
          <thead><tr><th>Material SAP</th><th>Lote</th><th>Cantidad</th><th>UM</th><th></th></tr></thead>
          <tbody id="gr-lines-body">
            <tr id="gr-line-1">
              <td><input class="form-control" style="width:140px" placeholder="Ej: 4500001" id="gr-l1-mat" /></td>
              <td><input class="form-control" style="width:100px" placeholder="Lote (opcional)" id="gr-l1-batch" /></td>
              <td><input class="form-control" style="width:80px" type="number" placeholder="0" id="gr-l1-qty" /></td>
              <td><select class="form-control" style="width:70px" id="gr-l1-unit"><option>EA</option><option>BOB</option><option>KG</option><option>L</option><option>M</option></select></td>
              <td>—</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="form-field mt-md">
        <label class="form-label">Observaciones</label>
        <textarea class="form-control w-full" id="gr-notes" rows="2" placeholder="Notas de la recepción…"></textarea>
      </div>`,
    actions: [
      { label:'Registrar Recepción', type:'primary', closeOnClick:false, action: async () => {
          const wh       = document.getElementById('gr-wh')?.value;
          const strategy = document.getElementById('gr-strategy')?.value;
          const po       = document.getElementById('gr-po')?.value;
          const vendor   = document.getElementById('gr-vendor')?.value;
          const notes    = document.getElementById('gr-notes')?.value;

          // Collect lines
          const rows = document.querySelectorAll('#gr-lines-body tr');
          const items = [];
          rows.forEach(row => {
            const inputs = row.querySelectorAll('input, select');
            const matCode = inputs[0]?.value?.trim();
            const qty     = parseFloat(inputs[2]?.value);
            if (matCode && qty > 0) {
              items.push({
                material_sap_code: matCode,
                batch_number:      inputs[1]?.value?.trim() || null,
                quantity_planned:  qty,
                unit:              inputs[3]?.value || 'EA'
              });
            }
          });

          if (items.length === 0) { App.toast('error', 'Agregue al menos una posición con material y cantidad'); return; }

          try {
            const res = await API.GR.create({
              warehouse_id: wh, putaway_strategy: strategy,
              po_number: po || null, vendor_name: vendor || null,
              notes: notes || null, items
            });
            const grNum    = res?.data?.gr_number || 'GR';
            const toCount  = res?.transferOrders?.length || 0;
            App.toast('success', `<span class="sap-icon sap-icon--accept"></span> ${grNum} registrada${toCount ? ` — ${toCount} TOs de putaway generadas` : ''}`);
            App.Dialog.close();
            View_gr_init();
          } catch(e) {
            App.toast('error', 'Error al crear GR: ' + e.message);
          }
        }
      },
      { label:'Cancelar', type:'ghost' }
    ]
  });
};

window.View_gr_addLine = function() {
  const body = document.getElementById('gr-lines-body');
  if (!body) return;
  const idx = body.children.length + 1;
  const tr  = document.createElement('tr');
  tr.innerHTML = `
    <td><input class="form-control" style="width:140px" placeholder="Código SAP" /></td>
    <td><input class="form-control" style="width:100px" placeholder="Lote" /></td>
    <td><input class="form-control" style="width:80px" type="number" placeholder="0" /></td>
    <td><select class="form-control" style="width:70px"><option>EA</option><option>BOB</option><option>KG</option><option>L</option><option>M</option></select></td>
    <td><button class="btn btn-ghost btn-sm" style="color:var(--sap-error)" onclick="this.closest('tr').remove()"><span class="sap-icon sap-icon--decline"></span></button></td>`;
  body.appendChild(tr);
};
