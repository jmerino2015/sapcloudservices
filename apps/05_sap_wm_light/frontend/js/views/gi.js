/* ============================================================
   View: GI — Salida de Mercancías (Goods Issue)
   ============================================================ */

App.registerView('gi', () => {
  const giList = [
    { id:'GI-2024-001', so:'5000001234', customer:'Cliente Beta S.A.',  items:2, status:'OPEN',     date:'2024-01-15' },
    { id:'GI-2024-002', so:'5000001235', customer:'Distribuidora Norte', items:4, status:'CONFIRMED', date:'2024-01-14' },
    { id:'GI-2024-003', so:'—',          customer:'Consumo interno',      items:1, status:'CONFIRMED', date:'2024-01-13' },
  ];

  const rows = giList.map(gi => [
    `<a href="#" class="text-blue text-bold">${gi.id}</a>`,
    gi.so !== '—' ? `<span class="badge badge-info">${gi.so}</span>` : '—',
    gi.customer,
    gi.items + ' pos.',
    Utils.badge(gi.status),
    Utils.formatDate(gi.date),
    gi.status === 'OPEN'
      ? `<button class="btn btn-primary btn-sm" onclick="App.toast('info','Iniciando picking...')">▶ Picking</button>`
      : `<button class="btn btn-ghost btn-sm">Ver</button>`
  ]);

  return `
  <div>
    <div class="page-header">
      <div class="page-header-top">
        <button class="back-btn" onclick="App.navigate('home')">←</button>
        <div>
          <div class="page-title">Salida de Mercancías</div>
          <div class="page-subtitle">Gestión de GI — Estrategia de picking: FEFO</div>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-primary" onclick="View_gi_new()">+ Nueva Salida</button>
        </div>
      </div>
    </div>
    ${Utils.buildTable({
      id: 'gi-table',
      toolbar: `
        <span class="table-toolbar-title">Salidas de Mercancías</span>
        <span class="table-toolbar-count">${giList.length}</span>
        <div class="table-search"><span class="icon">🔍</span>
          <input type="text" placeholder="Buscar GI..." oninput="Utils.filterTable(this.id,'gi-table')" id="gi-search" />
        </div>
        <div class="table-spacer"></div>
        <button class="btn btn-primary btn-sm" onclick="View_gi_new()">+ Nueva Salida</button>`,
      headers: ['GI Número','Pedido Ventas','Destinatario','Posiciones','Estado','Fecha','Acción'],
      rows,
      empty: 'No hay salidas registradas'
    })}
  </div>`;
});

window.View_gi_new = function() {
  App.Dialog.show({
    title: 'Nueva Salida de Mercancías',
    size: 'lg',
    body: `
      <div class="form-row">
        <div class="form-field">
          <label class="form-label">Referencia</label>
          <select class="form-control">
            <option>Contra Pedido de Ventas SAP</option>
            <option>Sin referencia / Consumo interno</option>
          </select>
        </div>
        <div class="form-field">
          <label class="form-label">N° Pedido de Ventas</label>
          <input class="form-control" placeholder="Ej: 5000001234" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-field">
          <label class="form-label required">Almacén origen</label>
          <select class="form-control">
            <option>WH001 — Almacén Principal</option>
            <option>WH002 — Almacén Secundario</option>
          </select>
        </div>
        <div class="form-field">
          <label class="form-label">Estrategia de picking</label>
          <select class="form-control">
            <option>FEFO (Fecha Expiración)</option>
            <option>FIFO (Primera Entrada)</option>
            <option>LIFO (Última Entrada)</option>
            <option>Manual</option>
          </select>
        </div>
      </div>
      <div class="form-field mt-md">
        <label class="form-label required">Material</label>
        <div class="input-group">
          <input class="form-control" placeholder="Código SAP o descripción..." />
          <button class="btn btn-secondary">Buscar</button>
        </div>
      </div>
      <div class="form-row mt-sm">
        <div class="form-field">
          <label class="form-label required">Cantidad solicitada</label>
          <input class="form-control" type="number" placeholder="0" />
        </div>
        <div class="form-field">
          <label class="form-label">UM</label>
          <select class="form-control"><option>EA</option><option>BOB</option><option>KG</option></select>
        </div>
      </div>`,
    actions: [
      { label: 'Generar Picking', type: 'primary', action: () => {
          App.toast('success', 'GI creada — TO de picking generada con estrategia FEFO');
          App.navigate('gi');
        }
      },
      { label: 'Cancelar', type: 'ghost' }
    ]
  });
};
