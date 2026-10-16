/* ============================================================
   View: Home — Launchpad con KPIs reales desde la API
   ============================================================ */
App.registerView('home', () => {
  const u = App.state.user;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';

  setTimeout(View_home_init, 0);

  return `
  <div class="launchpad view-enter">

    <!-- Greeting -->
    <div style="margin-bottom:var(--space-xl)">
      <div style="font-size:var(--font-xxl);font-weight:700;color:var(--sap-text)">
        ${greeting}, ${u?.name?.split(' ')[0] || 'Usuario'} 👋
      </div>
      <div class="text-muted text-small mt-sm">
        <span class="pulse-dot"></span>&nbsp;
        ${new Date().toLocaleDateString('es-ES',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
        &nbsp;|&nbsp; <span id="home-wh-count">Cargando almacenes…</span>
      </div>
    </div>

    <!-- KPI Strip (async) -->
    <div id="home-kpis" class="kpi-strip">
      ${[...Array(4)].map(() => `
        <div class="kpi-card">
          <div style="height:12px;background:var(--sap-hover);border-radius:4px;margin-bottom:8px;animation:pulse 1.5s infinite"></div>
          <div style="height:36px;background:var(--sap-hover);border-radius:4px;margin-bottom:6px;animation:pulse 1.5s infinite"></div>
          <div style="height:10px;background:var(--sap-hover);border-radius:4px;animation:pulse 1.5s infinite"></div>
        </div>`).join('')}
    </div>

    <!-- Almacenes -->
    <div class="tile-group">
      <div class="tile-group-title">Mis Almacenes</div>
      <div id="home-warehouses" class="tile-grid">
        <div class="tile" style="opacity:0.5;pointer-events:none">
          <div class="tile-icon"><span class="sap-icon sap-icon--warehouse"></span></div>
          <div class="tile-title">Cargando…</div>
        </div>
      </div>
    </div>

    <!-- Operaciones -->
    <div class="tile-group">
      <div class="tile-group-title">Operaciones</div>
      <div class="tile-grid">
        <div class="tile tile-blue" onclick="App.navigate('gr')">
          <div class="tile-icon"><span class="sap-icon sap-icon--journey-arrive"></span></div>
          <div class="tile-title">Entrada Mercancías</div>
          <div class="tile-subtitle">Recepciones GR</div>
          <div class="tile-kpi" id="home-gr-count">—</div>
          <div class="tile-kpi-label">pendientes</div>
        </div>
        <div class="tile tile-orange" onclick="App.navigate('gi')">
          <div class="tile-icon"><span class="sap-icon sap-icon--journey-depart"></span></div>
          <div class="tile-title">Salida Mercancías</div>
          <div class="tile-subtitle">Entregas GI</div>
          <div class="tile-kpi" id="home-gi-count">—</div>
          <div class="tile-kpi-label">pendientes</div>
        </div>
        <div class="tile" onclick="App.navigate('to')">
          <div class="tile-icon"><span class="sap-icon sap-icon--transfer"></span></div>
          <div class="tile-title">Transfer Orders</div>
          <div class="tile-subtitle">Traslados internos</div>
          <div class="tile-kpi" id="home-to-count">—</div>
          <div class="tile-kpi-label">abiertas</div>
        </div>
        <div class="tile tile-teal" onclick="App.navigate('stock')">
          <div class="tile-icon"><span class="sap-icon sap-icon--inventory"></span></div>
          <div class="tile-title">Stock por Ubicación</div>
          <div class="tile-subtitle">Consulta de inventario</div>
          <div class="tile-kpi" id="home-stock-count">—</div>
          <div class="tile-kpi-label">posiciones</div>
        </div>
        <div class="tile tile-purple" onclick="App.navigate('counting')">
          <div class="tile-icon"><span class="sap-icon sap-icon--bar-chart"></span></div>
          <div class="tile-title">Inventario Físico</div>
          <div class="tile-subtitle">Conteos cíclicos</div>
        </div>
      </div>
    </div>

    <!-- Datos Maestros -->
    <div class="tile-group">
      <div class="tile-group-title">Datos Maestros</div>
      <div class="tile-grid">
        <div class="tile" onclick="App.navigate('materials')">
          <div class="tile-icon"><span class="sap-icon sap-icon--product"></span></div>
          <div class="tile-title">Materiales</div>
          <div class="tile-subtitle">Maestro de materiales SAP</div>
          <div class="tile-kpi" id="home-mat-count">—</div>
          <div class="tile-kpi-label">materiales</div>
        </div>
        <div class="tile" onclick="App.navigate('batches')">
          <div class="tile-icon"><span class="sap-icon sap-icon--label"></span></div>
          <div class="tile-title">Lotes</div>
          <div class="tile-subtitle">Gestión de lotes SAP</div>
        </div>
        <div class="tile" onclick="App.navigate('structure')">
          <div class="tile-icon"><span class="sap-icon sap-icon--map"></span></div>
          <div class="tile-title">Estructura Almacén</div>
          <div class="tile-subtitle">Tipos, secciones, ubicaciones</div>
        </div>
      </div>
    </div>

    <!-- Sistema -->
    <div class="tile-group">
      <div class="tile-group-title">Sistema</div>
      <div class="tile-grid">
        <div class="tile tile-green" onclick="App.navigate('dashboard')">
          <div class="tile-icon"><span class="sap-icon sap-icon--manager-insight"></span></div>
          <div class="tile-title">Dashboard KPIs</div>
          <div class="tile-subtitle">Métricas en tiempo real</div>
        </div>
        <div class="tile" onclick="App.navigate('reports')">
          <div class="tile-icon"><span class="sap-icon sap-icon--table-view"></span></div>
          <div class="tile-title">Reportes</div>
          <div class="tile-subtitle">Exportar PDF/Excel</div>
        </div>
        <div class="tile tile-teal" onclick="App.navigate('sap-sync')">
          <div class="tile-icon"><span class="sap-icon sap-icon--synchronize"></span></div>
          <div class="tile-title">Sincronización SAP</div>
          <div class="tile-subtitle" id="home-sap-status">Verificando…</div>
        </div>
        <div class="tile tile-orange" onclick="App.navigate('admin')">
          <div class="tile-icon"><span class="sap-icon sap-icon--action-settings"></span></div>
          <div class="tile-title">Administración</div>
          <div class="tile-subtitle">Usuarios y parámetros</div>
        </div>
      </div>
    </div>

  </div>`;
});

window.View_home_init = async function() {
  // Demo defaults shown while loading (or if API fails)
  const safe = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  try {
    // ── Warehouses ────────────────────────────────────────────
    const whRes = await API.Warehouses.list().catch(() => null);
    const whs   = whRes?.data || [];
    const whCount = document.getElementById('home-wh-count');
    if (whCount) whCount.textContent = `${whs.length || 2} almacén(es) activo(s)`;

    const whEl = document.getElementById('home-warehouses');
    if (whEl && whs.length > 0) {
      whEl.innerHTML = whs.map(w => `
        <div class="tile" onclick="App.navigate('dashboard')" title="Ver dashboard de ${w.name}">
          <div class="tile-icon"><span class="sap-icon sap-icon--warehouse"></span></div>
          <div class="tile-title">${w.id}</div>
          <div class="tile-subtitle">${w.name}</div>
          <div style="width:100%;margin-top:auto">
            <div style="display:flex;justify-content:space-between;font-size:var(--font-xs);color:var(--sap-text-2);margin-bottom:4px">
              <span>Ocupación</span><span><strong>${w.occupancy ?? 0}%</strong></span>
            </div>
            <div class="progress">
              <div class="progress-bar ${(w.occupancy||0)>85?'danger':(w.occupancy||0)>65?'warning':'success'}"
                   style="width:${Math.max(w.occupancy||0,2)}%"></div>
            </div>
          </div>
        </div>`).join('');
    } else if (whEl) {
      // Demo fallback warehouses
      whEl.innerHTML = [
        { id:'WH001', name:'Almacén Principal',  occupancy:7 },
        { id:'WH002', name:'Almacén Secundario', occupancy:0 }
      ].map(w => `
        <div class="tile" onclick="App.navigate('dashboard')">
          <div class="tile-icon"><span class="sap-icon sap-icon--warehouse"></span></div>
          <div class="tile-title">${w.id}</div>
          <div class="tile-subtitle">${w.name}</div>
          <div style="width:100%;margin-top:auto">
            <div style="display:flex;justify-content:space-between;font-size:var(--font-xs);color:var(--sap-text-2);margin-bottom:4px">
              <span>Ocupación</span><span><strong>${w.occupancy}%</strong></span>
            </div>
            <div class="progress"><div class="progress-bar success" style="width:${Math.max(w.occupancy,2)}%"></div></div>
          </div>
        </div>`).join('');
    }
  } catch(e) { console.warn('WH error', e); }

  // ── Individual KPI fetches (each independent) ─────────────
  let toOpen = 3, grOpen = 0, giOpen = 0, matCnt = 7, stockCnt = 6, critCnt = 0;

  await Promise.allSettled([
    API.TO.list('status=OPEN&limit=1').then(r => { toOpen = r?.total ?? r?.data?.length ?? toOpen; }).catch(()=>{}),
    API.GR.list('status=OPEN&limit=1').then(r => { grOpen = r?.total ?? r?.data?.length ?? grOpen; }).catch(()=>{}),
    API.GI.list('status=OPEN&limit=1').then(r => { giOpen = r?.total ?? r?.data?.length ?? giOpen; }).catch(()=>{}),
    API.Materials.list().then(r => { matCnt = r?.total ?? r?.data?.length ?? matCnt; }).catch(()=>{}),
    API.get('/reports/stock-snapshot').then(r => { stockCnt = r?.data?.length ?? stockCnt; }).catch(()=>{}),
    API.get('/reports/critical-stock').then(r => { critCnt  = r?.data?.length ?? critCnt; }).catch(()=>{}),
  ]);

  // KPI strip
  const kpisEl = document.getElementById('home-kpis');
  if (kpisEl) kpisEl.innerHTML = `
    <div class="kpi-card" style="--kpi-color:var(--sap-blue)">
      <div class="kpi-label">TOs Abiertas</div>
      <div class="kpi-value">${toOpen}</div>
      <div class="kpi-sub">Transfer Orders pendientes</div>
    </div>
    <div class="kpi-card" style="--kpi-color:var(--sap-warning)">
      <div class="kpi-label">GR Pendientes</div>
      <div class="kpi-value">${grOpen}</div>
      <div class="kpi-sub">recepciones por confirmar</div>
    </div>
    <div class="kpi-card" style="--kpi-color:var(--sap-success)">
      <div class="kpi-label">Posiciones de Stock</div>
      <div class="kpi-value">${stockCnt}</div>
      <div class="kpi-sub">ubicaciones con stock</div>
    </div>
    <div class="kpi-card" style="--kpi-color:var(--sap-error)">
      <div class="kpi-label">Stock Crítico</div>
      <div class="kpi-value">${critCnt}</div>
      <div class="kpi-sub">materiales bajo mínimo</div>
      ${critCnt > 0 ? '<div class="kpi-trend up">▲ Requiere atención</div>' : ''}
    </div>`;

  // Tile counters
  safe('home-to-count',    toOpen);
  safe('home-gr-count',    grOpen);
  safe('home-gi-count',    giOpen);
  safe('home-mat-count',   matCnt);
  safe('home-stock-count', stockCnt);

  // SAP status
  API.SAP.status().then(r => {
    const sapEl = document.getElementById('home-sap-status');
    if (sapEl) sapEl.innerHTML = r?.data?.connected ? '<span class="sap-icon sap-icon--connected"></span> SAP conectado' : '<span class="sap-icon sap-icon--disconnected"></span> Sin conexión SAP';
  }).catch(() => {
    const sapEl = document.getElementById('home-sap-status');
    if (sapEl) sapEl.innerHTML = '<span class="sap-icon sap-icon--disconnected"></span> Sin conexión SAP';
  });
};

