/* ============================================================
   View: Structure — Estructura de Almacén
   ============================================================ */

App.registerView('structure', () => {
  const warehouses = API.Mock.warehouses;

  return `
  <div>
    <div class="page-header">
      <div class="page-header-top">
        <button class="back-btn" onclick="App.navigate('home')">←</button>
        <div>
          <div class="page-title">Estructura de Almacén</div>
          <div class="page-subtitle">Gestión de tipos, secciones y ubicaciones (bins)</div>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-primary" onclick="View_struct_addBin()">+ Nueva Ubicación</button>
        </div>
      </div>
    </div>

    <!-- Warehouse selector cards -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:var(--space-md);margin-bottom:var(--space-lg)">
      ${warehouses.map(wh => `
        <div class="card" style="cursor:pointer;border:2px solid var(--sap-border);transition:border-color 0.2s"
             onclick="View_struct_selectWH('${wh.id}',this)"
             id="wh-card-${wh.id}">
          <div class="card-header">
            <div>
              <div class="card-title">🏭 ${wh.id}</div>
              <div class="text-muted text-small">${wh.name} — ${wh.location}</div>
            </div>
            <span class="badge badge-success">Activo</span>
          </div>
          <div class="card-body" style="padding-top:0">
            <div style="display:flex;gap:var(--space-lg);margin-top:var(--space-sm)">
              <div>
                <div style="font-size:var(--font-xxl);font-weight:700;color:var(--sap-blue)">${wh.bins}</div>
                <div class="text-muted text-small">Ubicaciones totales</div>
              </div>
              <div>
                <div style="font-size:var(--font-xxl);font-weight:700;color:var(--sap-warning)">${wh.occupancy}%</div>
                <div class="text-muted text-small">Ocupación actual</div>
              </div>
            </div>
            <div class="progress mt-sm">
              <div class="progress-bar ${wh.occupancy>80?'danger':wh.occupancy>60?'warning':'success'}"
                   style="width:${wh.occupancy}%"></div>
            </div>
          </div>
        </div>`).join('')}
    </div>

    <!-- Structure tree -->
    <div class="card" id="struct-tree-card">
      <div class="card-header">
        <div class="card-title">Estructura jerárquica — WH001</div>
        <div class="flex gap-sm">
          <button class="btn btn-ghost btn-sm">⊞ Expandir todo</button>
          <button class="btn btn-ghost btn-sm">⊟ Colapsar todo</button>
        </div>
      </div>
      <div class="card-body">
        ${_buildStructTree()}
      </div>
    </div>
  </div>`;
});

function _buildStructTree() {
  const types = [
    { id:'HB', name:'Almacenaje en bloque', sections:[
      { id:'A', name:'Sección A — Rack Convencional', bins:['A-01-01-01','A-01-01-02','A-01-02-01','A-01-02-02'] },
      { id:'B', name:'Sección B — Rack Drive-In', bins:['B-01-01-01','B-01-01-02'] }
    ]},
    { id:'GR', name:'Zona de recepción (GR Area)', sections:[
      { id:'GR', name:'GR Area', bins:['GR-AREA'] }
    ]},
    { id:'GI', name:'Zona de expedición (GI Area)', sections:[
      { id:'GI', name:'GI Area', bins:['GI-AREA'] }
    ]},
  ];

  return types.map(t => `
    <div style="margin-bottom:var(--space-md)">
      <div style="display:flex;align-items:center;gap:var(--space-sm);cursor:pointer;padding:var(--space-xs) 0;
                  font-weight:600;color:var(--sap-text)" onclick="this.nextElementSibling.classList.toggle('hidden')">
        <span>▼</span>
        <span>📁 Tipo: ${t.id} — ${t.name}</span>
        <span class="badge badge-info">${t.sections.reduce((a,s)=>a+s.bins.length,0)} bins</span>
      </div>
      <div style="margin-left:var(--space-xl)">
        ${t.sections.map(s => `
          <div style="margin-bottom:var(--space-sm)">
            <div style="display:flex;align-items:center;gap:var(--space-sm);cursor:pointer;padding:var(--space-xs) 0;
                        color:var(--sap-text-2)" onclick="this.nextElementSibling.classList.toggle('hidden')">
              <span>▼</span>
              <span>📂 Sección: ${s.id} — ${s.name}</span>
              <span class="badge badge-neutral">${s.bins.length} ubicaciones</span>
            </div>
            <div style="margin-left:var(--space-xl);display:flex;flex-wrap:wrap;gap:var(--space-xs)">
              ${s.bins.map(b => `
                <div style="padding:4px 8px;background:var(--sap-blue-light);border:1px solid #B8D9F8;
                            border-radius:var(--radius-sm);font-size:var(--font-xs);font-family:'Courier New',monospace;
                            color:var(--sap-blue);cursor:pointer;transition:background 0.2s"
                     onmouseenter="this.style.background='#C8E6FA'"
                     onmouseleave="this.style.background='var(--sap-blue-light)'"
                     onclick="View_struct_binDetail('${b}')">${b}</div>`).join('')}
            </div>
          </div>`).join('')}
      </div>
    </div>`).join('');
}

window.View_struct_selectWH = function(id, el) {
  document.querySelectorAll('[id^=wh-card-]').forEach(c => c.style.borderColor = 'var(--sap-border)');
  el.style.borderColor = 'var(--sap-blue)';
};

window.View_struct_binDetail = function(bin) {
  App.Dialog.show({
    title: `Ubicación — ${bin}`,
    size: 'sm',
    body: `
      <div class="form-row">
        <div class="form-field">
          <label class="form-label">Código de ubicación</label>
          <input class="form-control" value="${bin}" disabled />
        </div>
        <div class="form-field">
          <label class="form-label">Estado</label>
          <select class="form-control"><option>Activo</option><option>Bloqueado</option><option>Inactivo</option></select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-field">
          <label class="form-label">Capacidad máxima (kg)</label>
          <input class="form-control" type="number" value="1000" />
        </div>
        <div class="form-field">
          <label class="form-label">Tipo de almacenaje</label>
          <select class="form-control"><option>Paletizado</option><option>Picking</option><option>Bulk</option></select>
        </div>
      </div>
      <div class="form-field">
        <label class="form-label">Observaciones</label>
        <textarea class="form-control w-full" rows="2"></textarea>
      </div>`,
    actions: [
      { label: 'Guardar', type: 'primary', action: () => App.toast('success', `Bin ${bin} actualizado`) },
      { label: 'Cancelar', type: 'ghost' }
    ]
  });
};

window.View_struct_addBin = function() {
  App.toast('info', 'Función: crear nueva ubicación (en desarrollo)');
};
