/**
 * SAP Fiori Application Controller — Monitor de Integración COMEX Grupo Roky's
 * S/4HANA Clean Core Architecture & Beagle Customs Interface
 */

const RokysApp = {
  data: [],
  kpis: {},
  activeView: 'general',
  selectedItem: null,
  filters: {
    search: '',
    status: '',
    terminal: '',
    channel: '',
    provider: ''
  },

  async init() {
    this.setupTheme();
    this.setupIframeDetection();
    await this.loadData();
    this.renderKPIs();
    this.renderTable();
    this.setupEventListeners();
  },

  setupIframeDetection() {
    if (window.self !== window.top) {
      document.body.classList.add('in-iframe');
    }
  },

  setupTheme() {
    window.addEventListener('message', (e) => {
      if (e.data && e.data.type === 'SET_THEME') {
        const isDark = e.data.theme === 'dark';
        if (isDark) {
          document.body.classList.add('dark-mode');
          document.documentElement.setAttribute('data-theme', 'dark');
        } else {
          document.body.classList.remove('dark-mode');
          document.documentElement.removeAttribute('data-theme');
        }
      }
    });
  },

  toggleTheme() {
    const isDark = document.body.classList.toggle('dark-mode');
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  },

  goHome() {
    if (window.parent && window.parent.PortalApp && window.parent.PortalApp.closeModal) {
      window.parent.PortalApp.closeModal();
    } else {
      window.location.href = '/index.html';
    }
  },

  async loadData() {
    try {
      const resp = await fetch('data.json');
      const json = await resp.json();
      this.data = json.items || [];
      this.kpis = json.kpis || {};
      this.metadata = json;
    } catch (e) {
      console.error('Error cargando data.json:', e);
    }
  },

  renderKPIs() {
    const k = this.kpis;
    const elPending = document.getElementById('kpi-pending-val');
    const elTotal = document.getElementById('kpi-total-val');
    const elCompliance = document.getElementById('kpi-compliance-val');
    const elCritical = document.getElementById('kpi-critical-val');

    if (elPending) elPending.innerText = k.transitoActivo || '14';
    if (elTotal) elTotal.innerText = k.totalOrdenes || '28';
    if (elCompliance) elCompliance.innerText = k.cumplimientoLevante || '89.3%';
    if (elCritical) elCritical.innerText = k.alertasSobreestadia || '3';
  },

  switchView(viewName) {
    this.activeView = viewName;
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const targetNav = document.getElementById(`nav-${viewName}`);
    if (targetNav) targetNav.classList.add('active');

    // Hide/show views
    const mainView = document.getElementById('view-main-table');
    const compareView = document.getElementById('view-compare-alv');

    if (viewName === 'comparativa') {
      if (mainView) mainView.style.display = 'none';
      if (compareView) compareView.style.display = 'block';
      return;
    }

    if (mainView) mainView.style.display = 'block';
    if (compareView) compareView.style.display = 'none';

    // Apply view specific filter presets
    if (viewName === 'transito') {
      this.filters.status = 'BLUE';
    } else if (viewName === 'aduanas') {
      this.filters.status = '';
    } else if (viewName === 'sobreestadia') {
      this.filters.status = 'CRITICAL';
    } else if (viewName === 'tramas') {
      this.filters.status = '';
      this.openTramaGeneralModal();
    } else {
      this.filters.status = '';
    }

    this.renderTable();
  },

  getFilteredData() {
    return this.data.filter(item => {
      // General search filter
      if (this.filters.search) {
        const q = this.filters.search.toLowerCase();
        const match = 
          item.oc.toLowerCase().includes(q) ||
          item.entrega.toLowerCase().includes(q) ||
          item.materialId.toLowerCase().includes(q) ||
          item.materialDesc.toLowerCase().includes(q) ||
          item.bl.toLowerCase().includes(q) ||
          item.nave.toLowerCase().includes(q) ||
          item.proveedorNombre.toLowerCase().includes(q) ||
          item.puerto.toLowerCase().includes(q) ||
          item.depositoTemporal.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Status filter
      if (this.filters.status) {
        if (this.filters.status === 'CRITICAL') {
          if (item.status !== 'RED' && item.status !== 'YELLOW') return false;
        } else if (item.status !== this.filters.status) {
          return false;
        }
      }

      // Terminal filter
      if (this.filters.terminal && !item.depositoTemporal.includes(this.filters.terminal)) {
        return false;
      }

      // Channel filter
      if (this.filters.channel && item.canal !== this.filters.channel) {
        return false;
      }

      // Provider filter
      if (this.filters.provider && item.proveedorId !== this.filters.provider) {
        return false;
      }

      return true;
    });
  },

  renderTable() {
    const tbody = document.getElementById('table-body');
    const countBadge = document.getElementById('table-count');
    if (!tbody) return;

    const items = this.getFilteredData();
    if (countBadge) countBadge.innerText = `${items.length} posiciones`;

    if (items.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="15" style="text-align:center; padding: 36px; color: var(--sapTextSecondary);">
            <i class="fas fa-search" style="font-size:24px; margin-bottom:8px; opacity:0.5; display:block;"></i>
            No se encontraron registros de importación para los filtros seleccionados.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = items.map((item, idx) => {
      let statusDotClass = 'green';
      let badgeClass = 'green';
      if (item.status === 'YELLOW') { statusDotClass = 'yellow'; badgeClass = 'yellow'; }
      else if (item.status === 'BLUE') { statusDotClass = 'blue'; badgeClass = 'blue'; }
      else if (item.status === 'RED') { statusDotClass = 'red'; badgeClass = 'red'; }

      let channelClass = 'verde';
      if (item.canal === 'NARANJA') channelClass = 'naranja';
      else if (item.canal === 'ROJO') channelClass = 'rojo';
      else if (item.canal === 'PENDIENTE') channelClass = 'pendiente';

      const containersCount = item.contenedores ? item.contenedores.length : 1;
      const isCriticalDemurrage = item.diasLibres <= 2;

      return `
        <tr onclick="RokysApp.showDetailModal('${item.id}')" title="Clic para ver trazabilidad completa y timeline">
          <td style="text-align:center;">
            <span class="status-dot ${statusDotClass}" title="${item.statusLabel}"></span>
          </td>
          <td><strong>${item.oc}</strong></td>
          <td style="text-align:center; color: var(--sapTextSecondary);">${item.pos}</td>
          <td><span style="font-family:monospace; font-weight:600;">${item.entrega}</span></td>
          <td>
            <button class="btn-link-action" onclick="event.stopPropagation(); RokysApp.showContainersModal('${item.id}')" title="Ver detalle de contenedores y precintos">
              <i class="fas fa-boxes-stacked"></i> ${item.cantidad} (${containersCount})
            </button>
          </td>
          <td style="text-align:center;">${item.soc}</td>
          <td style="text-align:center;">${item.orgComp}</td>
          <td>${item.fechaCread}</td>
          <td>
            <div style="font-weight:600; font-size:11.5px;">${item.proveedorNombre}</div>
            <div style="font-size:10px; color:var(--sapTextSecondary); font-family:monospace;">${item.proveedorId}</div>
          </td>
          <td>
            <div style="font-weight:600;">${item.materialDesc}</div>
            <div style="font-size:10px; color:var(--sapTextSecondary); font-family:monospace;">${item.materialId} • Grp: ${item.grpCom}</div>
          </td>
          <td>
            <span style="font-weight:600; color:#0a6ed1;">${item.bl}</span>
            <div style="font-size:10.5px; color:var(--sapTextSecondary);">${item.nave} (${item.puerto})</div>
          </td>
          <td style="text-align:center;">
            <span class="badge-channel ${channelClass}">${item.canal}</span>
          </td>
          <td>
            <div style="font-size:11.5px; font-weight:500;">${item.depositoTemporal}</div>
            <div style="font-size:10px; color:${isCriticalDemurrage ? '#bb0000; font-weight:700;' : 'var(--sapTextSecondary);'}">
              Vence: ${item.fechaVencSobreestadia} (${item.diasLibres}d libres)
            </div>
          </td>
          <td>
            <span class="badge-status ${badgeClass}">
              <i class="fas ${item.status === 'GREEN' ? 'fa-check' : item.status === 'BLUE' ? 'fa-ship' : item.status === 'RED' ? 'fa-triangle-exclamation' : 'fa-clock'}"></i>
              ${item.statusLabel}
            </span>
          </td>
          <td style="text-align:center;">
            <button class="btn-fiori btn-fiori-beagle" style="padding: 3px 8px; font-size: 11px;" onclick="event.stopPropagation(); RokysApp.showTramaModal('${item.id}')" title="Ver trama JSON/XML recibida de Beagle">
              <i class="fas fa-code"></i> Trama
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  handleSearch(val) {
    this.filters.search = val;
    this.renderTable();
  },

  applyFilters() {
    this.filters.terminal = document.getElementById('filter-terminal').value;
    this.filters.channel = document.getElementById('filter-channel').value;
    this.filters.status = document.getElementById('filter-status').value;
    this.renderTable();
  },

  resetFilters() {
    document.getElementById('filter-search').value = '';
    document.getElementById('filter-terminal').value = '';
    document.getElementById('filter-channel').value = '';
    document.getElementById('filter-status').value = '';
    this.filters = { search: '', status: '', terminal: '', channel: '', provider: '' };
    this.renderTable();
  },

  showDetailModal(id) {
    const item = this.data.find(d => d.id === id);
    if (!item) return;
    this.selectedItem = item;

    const modalTitle = document.getElementById('detail-modal-title');
    const modalBody = document.getElementById('detail-modal-body');

    modalTitle.innerHTML = `<i class="fas fa-file-invoice" style="color:#0a6ed1;"></i> Trazabilidad COMEX: OC ${item.oc} Pos. ${item.pos}`;

    let stepZarpe = 'completed';
    let stepTransito = item.status === 'BLUE' ? 'active' : 'completed';
    let stepArribo = (item.status === 'GREEN' || item.status === 'YELLOW' || item.status === 'RED') ? 'completed' : 'pending';
    let stepAduana = (item.status === 'GREEN') ? 'completed' : (item.status === 'RED' ? 'critical active' : (item.status === 'YELLOW' ? 'active' : 'pending'));
    let stepLevante = item.status === 'GREEN' ? 'completed' : 'pending';

    modalBody.innerHTML = `
      <div style="background:var(--sapCardBg); border:1px solid var(--sapBorder); border-radius:8px; padding:14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div>
          <span style="font-size:11px; color:var(--sapTextSecondary); text-transform:uppercase; font-weight:700;">Proveedor / Línea</span>
          <h4 style="margin-top:2px;">${item.proveedorNombre} (${item.proveedorId})</h4>
          <p style="font-size:12px; color:var(--sapTextSecondary); margin-top:2px;">Material: <strong>${item.materialDesc}</strong> (Cod: ${item.materialId})</p>
        </div>
        <div style="text-align:right;">
          <span class="badge-channel ${item.canal.toLowerCase()}">${item.canal}</span>
          <div style="font-size:13px; font-weight:700; margin-top:4px;">Entrega SAP: ${item.entrega}</div>
          <div style="font-size:11px; color:var(--sapTextSecondary);">DAM SUNAT: ${item.dam || 'En trámite'}</div>
        </div>
      </div>

      <!-- Stepper Tracking Visual -->
      <div class="stepper-container">
        <div class="step-item ${stepZarpe}">
          <div class="step-circle"><i class="fas fa-anchor"></i></div>
          <div class="step-label">Zarpe Origen</div>
          <div class="step-subtext">${item.puerto} (${item.fechaDespacho})</div>
        </div>
        <div style="height:2px; background:#cbd5e1; flex:1; margin: 0 4px;"></div>
        <div class="step-item ${stepTransito}">
          <div class="step-circle"><i class="fas fa-ship"></i></div>
          <div class="step-label">Tránsito Marítimo</div>
          <div class="step-subtext">${item.nave}</div>
        </div>
        <div style="height:2px; background:#cbd5e1; flex:1; margin: 0 4px;"></div>
        <div class="step-item ${stepArribo}">
          <div class="step-circle"><i class="fas fa-warehouse"></i></div>
          <div class="step-label">Arribo Callao</div>
          <div class="step-subtext">${item.depositoTemporal}</div>
        </div>
        <div style="height:2px; background:#cbd5e1; flex:1; margin: 0 4px;"></div>
        <div class="step-item ${stepAduana}">
          <div class="step-circle"><i class="fas fa-passport"></i></div>
          <div class="step-label">Canal Aduana</div>
          <div class="step-subtext">Canal ${item.canal}</div>
        </div>
        <div style="height:2px; background:#cbd5e1; flex:1; margin: 0 4px;"></div>
        <div class="step-item ${stepLevante}">
          <div class="step-circle"><i class="fas fa-check-double"></i></div>
          <div class="step-label">Levante Roky's</div>
          <div class="step-subtext">${item.fechaLevante !== '-' ? item.fechaLevante : 'Pendiente'}</div>
        </div>
      </div>

      <!-- Detail Grid -->
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin-top:8px;">
        <div style="background:#f8fafc; padding:10px; border-radius:6px; border:1px solid var(--sapBorder);">
          <span style="font-size:10.5px; color:var(--sapTextSecondary); font-weight:700;">CONOCIMIENTO EMBARQUE (B/L)</span>
          <div style="font-weight:700; font-size:13px; color:#0a6ed1;">${item.bl}</div>
          <div style="font-size:11px; margin-top:2px;">Nave: ${item.nave}</div>
        </div>
        <div style="background:#f8fafc; padding:10px; border-radius:6px; border:1px solid var(--sapBorder);">
          <span style="font-size:10.5px; color:var(--sapTextSecondary); font-weight:700;">AGENCIA DE ADUANA</span>
          <div style="font-weight:700; font-size:13px;">${item.descAgente} (${item.codAgente})</div>
          <div style="font-size:11px; margin-top:2px;">Aduana: ${item.aduana}</div>
        </div>
        <div style="background:#f8fafc; padding:10px; border-radius:6px; border:1px solid var(--sapBorder);">
          <span style="font-size:10.5px; color:var(--sapTextSecondary); font-weight:700;">CONTROL SOBREESTADÍA (DEMURRAGE)</span>
          <div style="font-weight:700; font-size:13px; color:${item.diasLibres <= 2 ? '#bb0000;' : '#107e3e;'}">${item.diasLibres} Días Libres Restantes</div>
          <div style="font-size:11px; margin-top:2px;">Fecha Límite: ${item.fechaVencSobreestadia}</div>
        </div>
      </div>

      <div style="margin-top:10px; background:#edf8f2; border-left:4px solid #107e3e; padding:10px 14px; border-radius:4px;">
        <span style="font-size:11px; font-weight:700; color:#107e3e;">ESTADO INTERFAZ SAP - BEAGLE</span>
        <p style="font-size:12px; color:#1e293b; margin-top:2px;">${item.mensajeIntegracion}</p>
      </div>
    `;

    document.getElementById('detail-modal').classList.add('open');
  },

  showContainersModal(id) {
    const item = this.data.find(d => d.id === id);
    if (!item) return;

    const modalTitle = document.getElementById('containers-modal-title');
    const modalBody = document.getElementById('containers-modal-body');

    modalTitle.innerHTML = `<i class="fas fa-boxes-stacked" style="color:#0a6ed1;"></i> Contenedores de Embarque: B/L ${item.bl} (OC ${item.oc})`;

    const containers = item.contenedores || [];
    modalBody.innerHTML = `
      <p style="font-size:12.5px; color:var(--sapTextSecondary); margin-bottom:12px;">
        Relación de unidades de transporte internacional asignadas a la entrega entrante <strong>${item.entrega}</strong> (Grupo Roky's S.A.C.):
      </p>
      <table class="fiori-table" style="width:100%;">
        <thead>
          <tr>
            <th>N° Contenedor</th>
            <th>Tipo / Medida</th>
            <th>Sello / Precinto</th>
            <th>Peso Bruto (Kg)</th>
            <th>Tara (Kg)</th>
            <th>Bultos</th>
            <th>Ubicación / Estado</th>
          </tr>
        </thead>
        <tbody>
          ${containers.map(c => `
            <tr>
              <td><strong><span style="font-family:monospace; color:#0a6ed1;">${c.numero}</span></strong></td>
              <td>${c.tipo}</td>
              <td><span style="background:#f1f5f9; padding:2px 6px; border-radius:4px; font-family:monospace; font-weight:600;">${c.sello}</span></td>
              <td>${c.pesoKg.toLocaleString()} Kg</td>
              <td>${c.taraKg.toLocaleString()} Kg</td>
              <td>${c.bultos} cjs/uds</td>
              <td><span class="badge-status green"><i class="fas fa-location-dot"></i> ${c.estado}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    document.getElementById('containers-modal').classList.add('open');
  },

  showTramaModal(id) {
    const item = this.data.find(d => d.id === id);
    if (!item) return;

    const modalTitle = document.getElementById('trama-modal-title');
    const modalBody = document.getElementById('trama-modal-body');

    modalTitle.innerHTML = `<i class="fas fa-code" style="color:#0a6ed1;"></i> Trama de Integración Beagle: OC ${item.oc} (Trx: ${item.tramaBeagle ? item.tramaBeagle.transaccionId : 'BGL-TRX-2026'})`;

    const payloadObj = item.tramaBeagle || {
      transaccionId: `BGL-TRX-${item.oc}-01`,
      timestamp: new Date().toISOString(),
      endpoint: "https://api.beaglelogistics.com/v1/tracking/push",
      httpStatus: 200,
      sociedad: item.soc,
      ordenCompra: item.oc,
      posicion: item.pos,
      inboundDelivery: item.entrega,
      bl: item.bl,
      canal: item.canal,
      dam: item.dam,
      statusMsg: item.mensajeIntegracion
    };

    modalBody.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; margin-bottom:10px; background:#f8fafc; padding:8px 12px; border-radius:6px; border:1px solid var(--sapBorder);">
        <div>
          <span style="color:var(--sapTextSecondary);">Endpoint Webhook:</span> 
          <code>${payloadObj.endpoint || 'https://api.beaglelogistics.com/v1/tracking/push'}</code>
        </div>
        <div>
          <span class="badge-status green"><i class="fas fa-check-circle"></i> HTTP 200 OK</span>
        </div>
      </div>
      <pre class="code-viewer" id="trama-code-text">${JSON.stringify(payloadObj, null, 2)}</pre>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
        <span style="font-size:11px; color:var(--sapTextSecondary);">Protocolo: RESTful JSON over HTTPS / SAP RAP OData V4 Inbound</span>
        <button class="btn-fiori btn-fiori-ghost" onclick="RokysApp.copyTramaPayload()"><i class="far fa-copy"></i> Copiar JSON</button>
      </div>
    `;

    document.getElementById('trama-modal').classList.add('open');
  },

  openTramaGeneralModal() {
    this.showTramaModal('1');
  },

  copyTramaPayload() {
    const codeEl = document.getElementById('trama-code-text');
    if (codeEl) {
      navigator.clipboard.writeText(codeEl.innerText).then(() => {
        alert('Trama copiada al portapapeles exitosamente.');
      });
    }
  },

  simulateNewBeaglePush() {
    // Generar un evento dinámico que agregue o actualice una orden en tiempo real
    const newId = (this.data.length + 1).toString();
    const newItem = {
      id: newId,
      status: "GREEN",
      statusLabel: "Levante Otorgado (Nuevo)",
      oc: "4600002999",
      pos: "10",
      entrega: "1320099999",
      soc: "1100",
      orgComp: "1100",
      fechaCread: "18.11.2026",
      proveedorId: "1600001342",
      proveedorNombre: "GUNVOR LATAM AGRO S.A.",
      materialId: "3500035865",
      materialDesc: "Insumo Especial Pollo Roky's (Cajas)",
      grpCom: "P14",
      claseDoc: "ZIMP",
      fechaDoc: "18.11.2026",
      bl: "BGL-LIVE-9901",
      cantidad: "1x40' HC",
      nave: "ROKYS VOYAGER",
      paisEmbarque: "COLOMBIA",
      puerto: "BUENAVENTURA",
      fechaDespacho: "18.11.2026",
      codAgente: "4303",
      descAgente: "BEAGLE",
      fechaArribo: "18.11.2026",
      fechaEstimada: "18.11.2026",
      canal: "VERDE",
      aduana: "118 - Callao Marítima",
      dam: "118-2026-11-998877",
      fechaPagoTrib: "18.11.2026",
      depositoTemporal: "APM TERMINALS CALLAO",
      fechaVencSobreestadia: "28.11.2026",
      diasLibres: 10,
      fechaAforo: "-",
      fechaLevante: "18.11.2026",
      fechaEntregaPlanta: "19.11.2026",
      mensajeIntegracion: "EN VIVO: Trama Webhook Beagle procesada OK (200 OK) - Ingreso autorizado",
      contenedores: [
        { numero: "ROKU-202611-9", tipo: "40' High Cube", sello: "BGL-999999", pesoKg: 24000, taraKg: 3900, bultos: 1100, estado: "En Ruta a Planta Rokys" }
      ],
      tramaBeagle: {
        transaccionId: `BGL-LIVE-${Date.now()}`,
        timestamp: new Date().toISOString(),
        endpoint: "https://api.beaglelogistics.com/v1/tracking/push",
        httpStatus: 200,
        status: "SUCCESS"
      }
    };

    this.data.unshift(newItem);
    this.kpis.totalOrdenes = (parseInt(this.kpis.totalOrdenes) + 1).toString();
    this.renderKPIs();
    this.renderTable();
    this.showTramaModal(newId);
  },

  exportToExcel() {
    const items = this.getFilteredData();
    let csv = "OC,Pos,Entrega,Sociedad,OrgCompras,FechaCread,Proveedor,Material,BL,Nave,Puerto,Canal,DepositoTemporal,DiasLibres,Levante,Estado\n";
    items.forEach(i => {
      csv += `"${i.oc}","${i.pos}","${i.entrega}","${i.soc}","${i.orgComp}","${i.fechaCread}","${i.proveedorNombre}","${i.materialDesc}","${i.bl}","${i.nave}","${i.puerto}","${i.canal}","${i.depositoTemporal}","${i.diasLibres}","${i.fechaLevante}","${i.statusLabel}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_COMEX_Rokys_Beagle_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },

  closeModal(modalId) {
    const m = document.getElementById(modalId);
    if (m) m.classList.remove('open');
  },

  toggleJoule() {
    const drawer = document.getElementById('joule-drawer');
    if (drawer) drawer.classList.toggle('open');
  },

  askJoule(question) {
    const msgContainer = document.getElementById('joule-messages');
    if (!msgContainer) return;

    // Append user message
    msgContainer.innerHTML += `
      <div class="joule-msg user">${question}</div>
    `;

    let reply = "";
    const qLower = question.toLowerCase();

    if (qLower.includes('sobreestadía') || qLower.includes('demurrage') || qLower.includes('vencimiento')) {
      reply = `Actualmente hay <strong>3 posiciones críticas</strong> con riesgo de sobreestadía en terminales portuarios:<br>
      • <strong>OC 4600002625 (Maersk Callao)</strong>: 1 día libre restante (Canal Rojo - Aforo programado).<br>
      • <strong>OC 4600002544 (DP World)</strong>: 2 días libres restantes (Canal Naranja - Revisión documentaria).<br>
      <em>Recomendación Joule:</em> Se ha alertado automáticamente al Agente Beagle (4303) para priorizar el retiro inmediato de los contenedores MRKU-449102-8 y GLDU-491028-1.`;
    } else if (qLower.includes('4600002261')) {
      reply = `La Orden de Compra <strong>4600002261</strong> (Proveedor GUNVOR LATAM) corresponde a 7 posiciones de insumos clave para Grupo Roky's (Aceite vegetal, marinadores de pollo, harina para apanado y envases térmicos).<br>
      • Estado: <strong>Levante Conforme SUNAT</strong> otorgado el 12.10.2026.<br>
      • Ubicación: Entregado en Almacén Central Roky's mediante entrega entrante 1320027811.`;
    } else if (qLower.includes('trama') || qLower.includes('beagle')) {
      reply = `La interfaz Beagle opera en protocolo <strong>RESTful JSON</strong> contra el Service Binding RAP <code>ZUI_COMEX_BEAGLE_O4</code>. El último mensaje recibido fue exitoso con código <strong>HTTP 200 OK</strong> y 0 errores de validación.`;
    } else {
      reply = `Con base en el Monitor COMEX Grupo Roky's, se registran 28 posiciones ZIMP activas con un 89.3% de efectividad de levante en puerto Callao. ¿Deseas que prepare una alerta para el equipo de compras o despachos?`;
    }

    setTimeout(() => {
      msgContainer.innerHTML += `
        <div class="joule-msg ai">${reply}</div>
      `;
      msgContainer.scrollTop = msgContainer.scrollHeight;
    }, 400);

    msgContainer.scrollTop = msgContainer.scrollHeight;
  },

  setupEventListeners() {
    // Cerrar modales con clic fuera
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('open');
        }
      });
    });

    // Enter en input de Joule
    const jouleInput = document.getElementById('joule-user-input');
    if (jouleInput) {
      jouleInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && jouleInput.value.trim()) {
          this.askJoule(jouleInput.value.trim());
          jouleInput.value = '';
        }
      });
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  RokysApp.init();
});
