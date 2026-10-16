/**
 * SAP Fiori Launchpad — Core Application Engine
 * Standardized Fiori Design System & Clean Core Architecture
 */

document.addEventListener('DOMContentLoaded', () => {
  PortalApp.init();
});

const PortalApp = {
  searchQuery: '',
  activeTab: 'salesorders',

  init() {
    this.renderLaunchpad();
    this.setupScrollSpy();
    this.setupKeyboardShortcuts();
    this.checkDbStatus();
  },

  /* ========================================================================
     1. RENDER COMPLETE FIORI LAUNCHPAD SECTIONS & TILES
     ======================================================================== */
  renderLaunchpad() {
    const canvas = document.getElementById('fioriCanvas');
    if (!canvas) return;

    const query = this.searchQuery.toLowerCase().trim();

    canvas.innerHTML = `
      <!-- ============================================================
           SECCIÓN 1: PEDIDOS DE VENTA (SAP S/4HANA SD)
           ============================================================ -->
      <section class="fiori-group-section" id="section-salesorders" data-section="salesorders">
        <h2 class="fiori-section-title">Pedidos de Venta</h2>

        <div class="fiori-tiles-container">

          <!-- Tile 1: Gestionar Pedidos de Venta -->
          <div class="fiori-tile" onclick="PortalApp.launchSalesOrderApp('manage')" title="Gestionar Pedidos de Venta — SAP S/4HANA">
            <div class="tile-header">
              <span class="tile-title">Gestionar Pedidos de Venta</span>
            </div>
            <div class="tile-content-middle">
              <div class="kpi-number-wrap">
                <span class="kpi-number">46.9</span>
                <span class="kpi-unit">K</span>
              </div>
              <span class="kpi-sublabel">EUR</span>
            </div>
            <div class="tile-footer">
              <i class="far fa-file-alt tile-icon-svg"></i>
            </div>
          </div>

          <!-- Tile 2: Seguimiento de Pedidos -->
          <div class="fiori-tile" onclick="PortalApp.launchSalesOrderApp('track')" title="Seguimiento de Pedidos — Trazabilidad End-to-End">
            <div class="tile-header">
              <span class="tile-title">Seguimiento de Pedidos</span>
              <span class="tile-subtitle">Trazabilidad y Estado de Entrega</span>
            </div>
            <div class="tile-content-middle"></div>
            <div class="tile-footer">
              <i class="far fa-file-lines tile-icon-svg" style="font-size:22px;"></i>
            </div>
          </div>

          <!-- Tile 3: Cumplimiento de Pedidos -->
          <div class="fiori-tile" onclick="PortalApp.launchSalesOrderApp('fulfillment')" title="Cumplimiento de Pedidos — Resolver Bloqueos e Incidencias">
            <div class="tile-header">
              <span class="tile-title">Cumplimiento de Pedidos</span>
              <span class="tile-subtitle">Resolver Bloqueos e Incidencias</span>
            </div>
            <div class="tile-content-middle">
              <div class="kpi-number-wrap">
                <span class="kpi-number">20.5</span>
                <span class="kpi-unit">K</span>
              </div>
              <span class="kpi-sublabel">EUR</span>
            </div>
            <div class="tile-footer">
              <i class="fas fa-shield-halved tile-icon-svg" style="font-size:18px;color:#bb0000;"></i>
            </div>
          </div>

          <!-- Tile 4: Posiciones de Pedido Confirmadas (Donut Micro-Chart) -->
          <div class="fiori-tile" onclick="PortalApp.launchSalesOrderApp('atp')" title="Posiciones de Pedido Confirmadas — Disponibilidad ATP HANA">
            <div class="tile-header">
              <span class="tile-title">Posiciones Confirmadas</span>
              <span class="tile-subtitle">Disponibilidad ATP HANA</span>
            </div>
            <div class="tile-content-middle">
              <div class="micro-donut-wrap">
                <svg class="micro-donut-svg" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none" stroke="#f0f2f4" stroke-width="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none" stroke="#0854a0" stroke-width="3" stroke-dasharray="88.8, 100" />
                  <text x="18" y="20.5" font-family="'72', Arial" font-size="7.5" font-weight="600" text-anchor="middle" fill="#0854a0">88.8%</text>
                </svg>
              </div>
            </div>
            <div class="tile-footer"></div>
          </div>

          <!-- Tile 5: Demora de Entrega Prevista (Micro Comparison Bars) -->
          <div class="fiori-tile" onclick="PortalApp.launchSalesOrderApp('delay')" title="Demora de Entrega Prevista — SAP HANA Machine Learning">
            <div class="tile-header">
              <span class="tile-title">Demora de Entrega Prevista</span>
            </div>
            <div class="tile-content-middle">
              <div class="delay-bars-list">
                <div class="delay-bar-row">
                  <span class="delay-bar-label">Con Retraso</span>
                  <div class="delay-bar-track"><div class="delay-bar-fill delayed"></div></div>
                  <span class="delay-bar-val">11%</span>
                </div>
                <div class="delay-bar-row">
                  <span class="delay-bar-label">Anticipado</span>
                  <div class="delay-bar-track"><div class="delay-bar-fill early"></div></div>
                  <span class="delay-bar-val">19%</span>
                </div>
                <div class="delay-bar-row">
                  <span class="delay-bar-label">A Tiempo</span>
                  <div class="delay-bar-track"><div class="delay-bar-fill ontime"></div></div>
                  <span class="delay-bar-val">70%</span>
                </div>
              </div>
            </div>
            <div class="tile-footer">
              <div class="delay-refresh-footer">
                <i class="fas fa-rotate-right" style="font-size:10px;"></i>
                <span>hace 5 minutos</span>
              </div>
            </div>
          </div>

          <!-- Tile 6: Tasa de Conversión de Ofertas -->
          <div class="fiori-tile" onclick="PortalApp.launchSalesOrderApp('conversion')" title="Tasa de Conversión de Ofertas — Trimestre Actual">
            <div class="tile-header">
              <span class="tile-title">Conversión de Ofertas</span>
              <span class="tile-subtitle">Tasa de Cierre Comercial</span>
            </div>
            <div class="tile-content-middle">
              <div class="kpi-number-wrap">
                <span class="kpi-number success">17.3</span>
                <span class="kpi-unit success">%</span>
                <span class="kpi-trend-arrow">▲</span>
              </div>
              <span class="kpi-sublabel">Trimestre Actual</span>
            </div>
            <div class="tile-footer"></div>
          </div>

        </div>

        <!-- Barra de Enlaces Rápidos Traducida -->
        <div class="fiori-links-bar">
          <a class="fiori-link-item" onclick="PortalApp.launchSalesOrderApp('create')" title="Crear Pedido de Venta en SAP">
            <span class="link-title">Crear Pedido de Venta</span>
            <span class="link-subtext">Entrada Rápida (VA01)</span>
          </a>
          <a class="fiori-link-item" onclick="PortalApp.launchSalesOrderApp('credit_block')" title="Resolver Bloqueos de Crédito">
            <span class="link-title">Cumplimiento de Pedidos</span>
            <span class="link-subtext">Resolver Bloqueo de Crédito</span>
          </a>
          <a class="fiori-link-item" onclick="PortalApp.launchSalesOrderApp('billing_block')" title="Resolver Bloqueos de Facturación">
            <span class="link-title">Cumplimiento de Pedidos</span>
            <span class="link-subtext">Resolver Bloqueo de Facturación</span>
          </a>
          <a class="fiori-link-item" onclick="PortalApp.launchSalesOrderApp('delivery_block')" title="Resolver Bloqueos de Entrega">
            <span class="link-title">Cumplimiento de Pedidos</span>
            <span class="link-subtext">Resolver Bloqueo de Entrega</span>
          </a>
        </div>
      </section>

      <!-- ============================================================
           SECTION 3: SOLUCIONES EMPRESARIALES SAP S/4HANA (CLEAN CORE)
           ============================================================ -->
      <section class="fiori-group-section" id="section-solutions" data-section="solutions">
        <h2 class="fiori-section-title">Soluciones SAP S/4HANA (Clean Core)</h2>

        <div class="fiori-tiles-container" id="enterpriseSolutionsGrid">
          ${this.renderEnterpriseApps(query)}
        </div>
      </section>
    `;

    // Filter tiles visually if query exists
    if (query) {
      this.filterTilesByQuery(query);
    }
  },

  /* ========================================================================
     2. RENDER THE 10 LIVE ENTERPRISE MODULES IN STANDARDIZED FIORI TILES
     ======================================================================== */
  renderEnterpriseApps(query) {
    if (!window.SAP_APPS_CONFIG) return '';

    return window.SAP_APPS_CONFIG.map(app => {
      const isMatch = !query || 
                      app.title.toLowerCase().includes(query) ||
                      app.subtitle.toLowerCase().includes(query) ||
                      (app.tags && app.tags.some(t => t.toLowerCase().includes(query)));

      if (query && !isMatch) return '';

      if (app.tileType === 'media' || app.id === '05' || app.id === '15') {
        const banner = app.bannerImg || (app.id === '15' ? 'img/transporte-terrestre.jpg' : 'img/wms-banner-opt.jpg');
        const badgeTxt = app.badgeText || (app.id === '15' ? 'SAP TM / S/4HANA' : 'SAP WM / S/4HANA');
        return `
          <div class="fiori-tile fiori-tile-wide fiori-wms-media-tile" onclick="PortalApp.launchApp('${app.id}', 'modal')" title="${app.title} — ${app.subtitle}">
            <div class="wms-media-banner-wrap">
              <img src="${banner}" alt="${app.title}" class="wms-media-banner-img" />
              <div class="wms-media-badge">
                <i class="fas fa-${app.faIcon}"></i>
                <span>${badgeTxt}</span>
              </div>
            </div>
            <div class="wms-media-text-box">
              <div class="wms-media-info">
                <span class="wms-media-title">${app.title}</span>
                <span class="wms-media-subtitle">${app.subtitle}</span>
              </div>
              <div class="wms-media-right">
                <div class="wms-media-kpi">
                  <span class="wms-media-kpi-val">${app.kpi.value}</span>
                  <span class="wms-media-kpi-lbl">${app.kpi.label}</span>
                </div>
                <button class="app-popout-btn wms-media-popout" onclick="event.stopPropagation(); PortalApp.launchApp('${app.id}', 'external');" title="Abrir en ventana nueva">
                  <i class="fas fa-arrow-up-right-from-square"></i>
                </button>
              </div>
            </div>
          </div>
        `;
      }

      return `
        <div class="fiori-tile fiori-app-tile" onclick="PortalApp.launchApp('${app.id}', 'modal')" title="${app.title}">
          <div class="tile-header">
            <div class="app-tile-top app-tile-top-title">
              <span class="tile-title" style="margin-top:0;">${app.title}</span>
              <i class="fas fa-${app.faIcon} app-tile-icon"></i>
            </div>
            <span class="tile-subtitle">${app.subtitle}</span>
          </div>

          <div class="tile-content-middle">
            <div class="kpi-number-wrap">
              <span class="kpi-number">${app.kpi.value}</span>
            </div>
            <span class="kpi-sublabel">${app.kpi.label}</span>
          </div>

          <div class="tile-footer">
            <div class="app-tile-actions" style="width:100%; display:flex; justify-content:flex-end;">
              <button class="app-popout-btn" onclick="event.stopPropagation(); PortalApp.launchApp('${app.id}', 'external');" title="Abrir en ventana nueva">
                <i class="fas fa-arrow-up-right-from-square"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  /* ========================================================================
     3. NAVIGATION, SCROLL SPY & TABS
     ======================================================================== */
  scrollToSection(sectionId) {
    const el = document.getElementById(sectionId);
    if (!el) return;

    const offset = 96; // 44px shell + 44px anchor + 8px margin
    const topPos = el.getBoundingClientRect().top + window.pageYOffset - offset;

    window.scrollTo({
      top: topPos,
      behavior: 'smooth'
    });

    this.setActiveTabBySection(sectionId);
  },

  setActiveTabBySection(sectionId) {
    const tabMap = {
      'section-salesorders': 'tab-salesorders',
      'section-solutions': 'tab-solutions'
    };

    const targetTabId = tabMap[sectionId];
    if (!targetTabId) return;

    document.querySelectorAll('.anchor-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.id === targetTabId);
    });
  },

  setupScrollSpy() {
    window.addEventListener('scroll', () => {
      const sections = ['section-salesorders', 'section-solutions'];
      const scrollPos = window.pageYOffset + 120;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPos) {
          this.setActiveTabBySection(sections[i]);
          break;
        }
      }
    });
  },

  /* ========================================================================
     4. SEARCH & FILTERING
     ======================================================================== */
  handleSearch(query) {
    this.searchQuery = query;
    this.renderLaunchpad();
  },

  handleModalSearch(query) {
    if (!query) return;
    const iframe = document.getElementById('modal-iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'SEARCH', query: query }, '*');
    }
    this.showToast(`🔍 Búsqueda: "${query}"`);
  },

  filterTilesByQuery(query) {
    const tiles = document.querySelectorAll('.fiori-tile');
    tiles.forEach(tile => {
      const text = tile.textContent.toLowerCase();
      tile.style.display = text.includes(query) ? 'flex' : 'none';
    });
  },

  /* ========================================================================
     5. MODAL APPLICATION LAUNCHER (IFRAME)
     ======================================================================== */
  launchSalesOrderApp(targetView) {
    const targetHash = targetView ? `#${targetView}` : '';
    const modal = document.getElementById('fiori-app-modal');
    const iframe = document.getElementById('modal-iframe');
    const titleEl = document.getElementById('modal-title');
    const spinner = document.getElementById('modal-spinner');

    if (!modal || !iframe) return;

    if (titleEl) titleEl.textContent = 'Gestión de Pedidos de Venta — SAP S/4HANA SD';
    if (spinner) spinner.style.display = 'flex';

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    const fullPath = `apps/03_gestion_pedidos_venta/index.html${targetHash}`;
    iframe.src = 'about:blank';
    setTimeout(() => {
      iframe.src = fullPath;
    }, 50);

    iframe.onload = () => {
      if (spinner) spinner.style.display = 'none';
      try {
        const doc = iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document);
        if (doc) {
          if (doc.body) doc.body.classList.add('in-iframe');
          let style = doc.getElementById('fiori-portal-embedded-cleaner');
          if (!style) {
            style = doc.createElement('style');
            style.id = 'fiori-portal-embedded-cleaner';
            style.textContent = `
              #sap-shell, .sap-shell, .sap-shell-bar { display: none !important; }
            `;
            doc.head.appendChild(style);
          }
        }
      } catch (e) {}
    };
  },

  launchApp(appId, mode) {
    const app = window.SAP_APPS_CONFIG ? window.SAP_APPS_CONFIG.find(a => a.id === appId) : null;
    if (!app) {
      this.showToast(`Iniciando módulo de ventas SAP...`);
      return;
    }

    if (mode === 'external') {
      window.open(app.path, '_blank');
      return;
    }

    const modal = document.getElementById('fiori-app-modal');
    const iframe = document.getElementById('modal-iframe');
    const titleEl = document.getElementById('modal-title');
    const spinner = document.getElementById('modal-spinner');

    if (!modal || !iframe) return;

    if (titleEl) titleEl.textContent = app.sapModule ? `${app.title} — ${app.sapModule}` : app.title;
    if (spinner) spinner.style.display = 'flex';

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    iframe.src = 'about:blank';
    setTimeout(() => {
      iframe.src = app.path;
    }, 50);

    iframe.onload = () => {
      if (spinner) spinner.style.display = 'none';

      try {
        const doc = iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document);
        if (doc) {
          if (doc.body) doc.body.classList.add('in-iframe');
          let style = doc.getElementById('fiori-portal-embedded-cleaner');
          if (!style) {
            style = doc.createElement('style');
            style.id = 'fiori-portal-embedded-cleaner';
            style.textContent = `
              /* ============================================================
                 FIORI PORTAL UNIFIED SHELL BAR ENFORCEMENT
                 Removes duplicate internal shell bars/headers inside iframe
                 ============================================================ */
              #sap-shell,
              .sap-shell,
              .sap-shell-bar,
              .shell-header,
              .fioriBlueHeader,
              .sapTNTToolHeader.fioriBlueHeader,
              .portalHeader,
              .sapTNTToolHeader.portalHeader,
              #appToolHeader,
              .fioriPortalHeader,
              #shellHeader,
              header.shell-bar,
              .tm-header,
              .sapFShellBar {
                display: none !important;
              }

              .sapTntToolPageHeader {
                display: none !important;
              }
              .sapTntToolPageContainer {
                top: 0 !important;
                height: 100% !important;
              }
              body {
                padding-top: 0 !important;
                margin-top: 0 !important;
              }
            `;
            if (doc.head) doc.head.appendChild(style);
          }
        }
      } catch (err) {
        console.warn('Modal cleaner style injection note:', err);
      }
    };
  },

  closeModal() {
    const modal = document.getElementById('fiori-app-modal');
    const iframe = document.getElementById('modal-iframe');
    const searchInput = document.getElementById('modalSearchInput');

    if (modal) modal.classList.remove('open');
    if (iframe) iframe.src = 'about:blank';
    if (searchInput) searchInput.value = '';
    document.body.style.overflow = '';
  },

  /* ========================================================================
     6. SAP JOULE AI ASSISTANT
     ======================================================================== */
  toggleJouleChat() {
    const panel = document.getElementById('jouleSidebarPanel');
    if (!panel) return;
    panel.classList.toggle('open');
  },

  clearJouleChat() {
    const scrollArea = document.getElementById('jouleMessagesScroll');
    if (scrollArea) {
      scrollArea.innerHTML = `
        <div class="joule-msg-bubble joule-bot-msg">
          <p>¡Hola! Soy <strong>SAP Joule AI</strong>. He reiniciado la sesión. ¿En qué puedo orientarte hoy?</p>
        </div>
      `;
    }
  },

  sendQuickJoule(text) {
    const input = document.getElementById('jouleInputField');
    if (input) {
      input.value = text;
      this.sendJouleMessage();
    }
  },

  sendJouleMessage() {
    const input = document.getElementById('jouleInputField');
    if (!input || !input.value.trim()) return;

    const userText = input.value.trim();
    input.value = '';

    const scrollArea = document.getElementById('jouleMessagesScroll');
    if (!scrollArea) return;

    // User Bubble
    const userBubble = document.createElement('div');
    userBubble.className = 'joule-msg-bubble joule-user-msg';
    userBubble.textContent = userText;
    scrollArea.appendChild(userBubble);
    scrollArea.scrollTop = scrollArea.scrollHeight;

    // Simulated Smart Response
    setTimeout(() => {
      const botBubble = document.createElement('div');
      botBubble.className = 'joule-msg-bubble joule-bot-msg';

      const lower = userText.toLowerCase();
      if (lower.includes('orden') || lower.includes('venta') || lower.includes('sales')) {
        botBubble.innerHTML = `
          <strong>Sales Order Analytics:</strong><br/>
          • Órdenes gestionadas: <strong>46.9 K EUR</strong><br/>
          • Items confirmados: <strong>88.8%</strong><br/>
          • Entregas a tiempo: <strong>70%</strong>, anticipadas <strong>19%</strong><br/>
          • Tasa de conversión: <strong>17.3% ▲</strong>
        `;
      } else if (lower.includes('wms') || lower.includes('almacen') || lower.includes('stock')) {
        botBubble.innerHTML = `
          <strong>Torre de Control WMS Multi-Sede:</strong><br/>
          • Ocupabilidad promedio: <strong>94.2%</strong> (CD Eucaliptos, Callao, Praderas)<br/>
          • Órdenes de Transporte (OTs): <strong>3,412</strong> ejecutadas<br/>
          • Flota Drivin: <strong>98.1%</strong> en ruta con georreferenciación.
        `;
      } else if (lower.includes('fue') || lower.includes('licencia') || lower.includes('usuario')) {
        botBubble.innerHTML = `
          <strong>Control de Licencias FUE & Usuarios:</strong><br/>
          • Consumo actual: <strong>142 FUEs</strong> certificados<br/>
          • Roles SUIM auditados bajo lineamientos Clean Core S/4HANA.
        `;
      } else {
        botBubble.innerHTML = `
          He procesado tu consulta: <em>"${userText}"</em>.<br/>
          Puedes acceder al módulo correspondiente directamente desde los mosaicos del Launchpad o continuar consultando métricas en tiempo real.
        `;
      }

      scrollArea.appendChild(botBubble);
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }, 450);
  },

  /* ========================================================================
     7. TOAST NOTIFICATIONS & DIALOGS
     ======================================================================== */
  showToast(msg) {
    const toast = document.getElementById('fioriToast');
    if (!toast) return;

    toast.textContent = msg;
    toast.classList.add('show');

    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  },

  showNotificationToast() {
    this.showToast('🔔 Tienes 3 notificaciones del sistema: 2 Órdenes aprobadas y 1 alerta de entrega.');
  },

  showUserMenu() {
    this.showToast('👤 Usuario Conectado: Donna Moore (Incentives Manager & Consultant) — SAP S/4HANA Cloud');
  },

  toggleSpaceMenu() {
    this.showToast('📁 Espacio Activo: Home (Ventas, Cadena de Suministro y Gestión de Soluciones)');
  },

  showNewsDetail() {
    this.showToast('📰 Noticia SAP: Intelligent Street Lights Power the Future of Modern Cities (SAP News August 2019)');
  },

  showLunchMenu() {
    this.showToast('🍴 Menú del Día (Campus Walldorf): Pasta al Pesto con Ensalada Mediterránea & Salmón Grillé');
  },

  showUserContact(name) {
    this.showToast(`📇 Contacto: ${name} (Incentives Manager) — Correo: donna.moore@sap.corp`);
  },

  /* ========================================================================
     8. CLOUD DATABASE MONITORING & STATUS DIALOG
     ======================================================================== */
  currentDbStatus: null,

  async checkDbStatus(showAlert = false) {
    const badge = document.getElementById('shellDbBadge');
    const label = document.getElementById('dbStatusLabel');
    if (!badge || !label) return;

    try {
      const res = await fetch('/api/db/status');
      const json = await res.json();
      if (json && json.success && json.data) {
        this.currentDbStatus = json.data;
        if (json.data.connected) {
          badge.classList.add('connected');
          label.textContent = `DB Cloud: ${json.data.host || 'Conectada'}`;
          badge.title = `Base de Datos Pública Conectada: ${json.data.provider} (${json.data.latencyMs}ms)`;
        } else {
          badge.classList.remove('connected');
          label.textContent = 'DB: Demo Local';
          badge.title = 'Operando con Dataset Demo local (DATABASE_URL no configurada en .env)';
        }

        if (this.isDbModalOpen) {
          this.renderDbStatusDialog();
        }

        if (showAlert) {
          if (json.data.connected) {
            this.showToast(`✅ Base de datos pública conectada: ${json.data.host} (${json.data.latencyMs}ms)`);
          } else {
            this.showToast('ℹ️ Conector verificado: Modo Dataset Demo local activo.');
          }
        }
      }
    } catch (e) {
      console.warn('No se pudo verificar el estado de la BD:', e);
    }
  },

  isDbModalOpen: false,

  showDbStatusModal() {
    this.isDbModalOpen = true;
    const overlay = document.getElementById('sapDbModalOverlay');
    if (overlay) overlay.style.display = 'flex';
    this.renderDbStatusDialog();
    this.checkDbStatus(false);
  },

  closeDbStatusModal() {
    this.isDbModalOpen = false;
    const overlay = document.getElementById('sapDbModalOverlay');
    if (overlay) overlay.style.display = 'none';
  },

  renderDbStatusDialog() {
    const body = document.getElementById('sapDbDialogBody');
    if (!body) return;

    const db = this.currentDbStatus || { connected: false, provider: 'Consultando...', host: 'local', latencyMs: 0 };
    const isConn = !!db.connected;

    const tablesHtml = db.tableCounts && Object.keys(db.tableCounts).length > 0
      ? Object.entries(db.tableCounts).map(([k, v]) => `
          <div class="sap-db-meta-card">
            <div class="sap-db-meta-label">${k}</div>
            <div class="sap-db-meta-val">${v} registros</div>
          </div>
        `).join('')
      : `
        <div class="sap-db-meta-card" style="grid-column: span 2;">
          <div class="sap-db-meta-label">Tablas S/4HANA Clean Core</div>
          <div class="sap-db-meta-val">ZTB_WH_SEDE, ZTB_WAREHOUSES, ZTB_BINS, ZTB_MATERIALS, ZTB_FUE</div>
        </div>
      `;

    body.innerHTML = `
      <div class="sap-db-status-banner ${isConn ? 'connected' : 'fallback'}">
        <i class="fas ${isConn ? 'fa-check-circle' : 'fa-info-circle'}" style="font-size: 20px;"></i>
        <div>
          <div style="font-size: 14px;">${isConn ? 'Base de Datos Pública Conectada y Activa' : 'Modo Dataset Demo Local (En Memoria Persistente)'}</div>
          <div style="font-size: 12px; font-weight: normal; opacity: 0.85;">
            ${isConn ? 'Las transacciones y demostraciones públicas se sincronizan en tiempo real en la nube.' : 'Puedes usar la aplicación inmediatamente o conectar tu base de datos pública de Supabase, Neon o Render.'}
          </div>
        </div>
      </div>

      <div class="sap-db-meta-grid">
        <div class="sap-db-meta-card">
          <div class="sap-db-meta-label">Proveedor / Motor</div>
          <div class="sap-db-meta-val">${db.provider || 'PostgreSQL'}</div>
        </div>
        <div class="sap-db-meta-card">
          <div class="sap-db-meta-label">Servidor / Host Cloud</div>
          <div class="sap-db-meta-val">${db.host || 'local'}</div>
        </div>
        <div class="sap-db-meta-card">
          <div class="sap-db-meta-label">Base de Datos</div>
          <div class="sap-db-meta-val">${db.database || 'postgres'}</div>
        </div>
        <div class="sap-db-meta-card">
          <div class="sap-db-meta-label">Latencia de Red</div>
          <div class="sap-db-meta-val">${isConn ? `${db.latencyMs} ms (Óptima)` : '0 ms (Local)'}</div>
        </div>
      </div>

      <div style="margin: 12px 0 6px 0; font-weight: 600; font-size: 12px; color: #6a6d70; text-transform: uppercase;">
        Estado de Tablas S/4HANA (ZTB_*)
      </div>
      <div class="sap-db-meta-grid">
        ${tablesHtml}
      </div>

      <div class="sap-db-guide-box">
        <strong>🌐 ¿Cómo conectar tu propia Base de Datos Pública en 1 minuto?</strong><br/>
        1. Crea una base de datos gratuita en <strong>Supabase</strong> (https://supabase.com) o <strong>Neon</strong> (https://neon.tech).<br/>
        2. Copia la cadena de conexión <em>(URI)</em>.<br/>
        3. Pégala en el archivo <code>.env</code> en la variable <code>DATABASE_URL=postgresql://...</code><br/>
        4. Haz clic en <strong>"Actualizar"</strong> abajo. La aplicación ejecutará las migraciones y seeders automáticamente.
      </div>
    `;
  },

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
        this.closeDbStatusModal();
        const panel = document.getElementById('jouleSidebarPanel');
        if (panel) panel.classList.remove('open');
      }
    });
  }
};
