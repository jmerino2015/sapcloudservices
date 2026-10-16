// ============================================================
// SAP FIORI LAUNCHPAD - Main Application Controller
// ============================================================

const App = window.App = {
    currentView: 'launchpad',
    currentCategory: 'all',
    sidebarCollapsed: false,

    categories: {
        project: {
            id: 'project',
            label: 'Project and Process Management',
            faIcon: 'diagram-project',
            tiles: [
                {
                    id: 'my-breq',
                    title: 'My Business Requirements',
                    subtitle: 'Solution Manager 7.2',
                    faIcon: 'clipboard-check',
                    iconBg: 'linear-gradient(135deg, #0A6ED1, #0854A0)',
                    kpi: { value: '12', label: 'Reqs No Cerrados', trend: 'alert', unit: '' },
                    badge: 'Requerimientos',
                    badgeType: 'primary'
                },
                {
                    id: 'req-mgmt',
                    title: 'Requirements Management',
                    subtitle: 'Pipeline de Aprobación',
                    faIcon: 'list-check',
                    iconBg: 'linear-gradient(135deg, #008080, #005959)',
                    kpi: { value: '28', label: 'Reqs en Evaluación', trend: 'neutral', unit: '' },
                    badge: 'SolMan 7.2',
                    badgeType: 'info'
                },
                {
                    id: 'my-projects',
                    title: 'My Projects',
                    subtitle: 'Gestión de Proyectos TI',
                    faIcon: 'diagram-project',
                    iconBg: 'linear-gradient(135deg, #0A6ED1, #0051a8)',
                    kpi: { value: '6', label: 'Proyectos en Curso', trend: 'success', unit: '' },
                    badge: 'PMO TI',
                    badgeType: 'success'
                },
                {
                    id: 'proj-analytics',
                    title: 'Projects Analytics',
                    subtitle: 'Métricas de Avance & SLA',
                    faIcon: 'chart-column',
                    iconBg: 'linear-gradient(135deg, #5D36FF, #A100C2)',
                    kpi: { value: '94.2', label: 'Cumplimiento SLA', trend: 'success', unit: '%' },
                    badge: 'Analítica',
                    badgeType: 'primary'
                },
                {
                    id: 'sol-admin',
                    title: 'Solution Administration',
                    subtitle: 'Configuración & Sistemas',
                    faIcon: 'gears',
                    iconBg: 'linear-gradient(135deg, #6b21a8, #4c1d95)',
                    kpi: { value: '16', label: 'Sistemas Conectados', trend: 'neutral', unit: '' },
                    badge: 'BASIS',
                    badgeType: 'warning'
                },
                {
                    id: 'sol-doc',
                    title: 'Solution Documentation',
                    subtitle: 'Repositorio de Procesos',
                    faIcon: 'book-bookmark',
                    iconBg: 'linear-gradient(135deg, #107E3E, #0c5e2e)',
                    kpi: { value: '142', label: 'Procesos Mapeados', trend: 'success', unit: '' },
                    badge: 'BPMN',
                    badgeType: 'success'
                }
            ]
        },
        itsm: {
            id: 'itsm',
            label: 'IT Service Management (ITSM)',
            faIcon: 'headset',
            tiles: [
                {
                    id: 'incidents',
                    title: 'My Incidents',
                    subtitle: 'Mesa de Ayuda TI',
                    faIcon: 'triangle-exclamation',
                    iconBg: 'linear-gradient(135deg, #E9730C, #c45d04)',
                    kpi: { value: '4', label: 'Incidentes Abiertos', trend: 'alert', unit: '' },
                    badge: 'ITSM',
                    badgeType: 'danger'
                },
                {
                    id: 'approval-inbox',
                    title: 'Approval Inbox',
                    subtitle: 'Bandeja de Aprobaciones',
                    faIcon: 'inbox',
                    iconBg: 'linear-gradient(135deg, #DF6E0C, #b85705)',
                    kpi: { value: '5', label: 'Pendientes de Firma', trend: 'warning', unit: '' },
                    badge: 'Aprobaciones',
                    badgeType: 'warning'
                },
                {
                    id: 'change-requests',
                    title: 'Change Request Mgmt',
                    subtitle: 'ChaRM & Transportes',
                    faIcon: 'arrows-rotate',
                    iconBg: 'linear-gradient(135deg, #0A6ED1, #0854A0)',
                    kpi: { value: '6', label: 'Cambios Activos', trend: 'neutral', unit: '' },
                    badge: 'ChaRM',
                    badgeType: 'primary'
                },
                {
                    id: 'it-req',
                    title: 'IT Requirements',
                    subtitle: 'Requerimientos Técnicos',
                    faIcon: 'code',
                    iconBg: 'linear-gradient(135deg, #049DBF, #03748e)',
                    kpi: { value: '8', label: 'En Desarrollo', trend: 'info', unit: '' },
                    badge: 'TI Dev',
                    badgeType: 'info'
                }
            ]
        },
        test: {
            id: 'test',
            label: 'Test Suite',
            faIcon: 'vial',
            tiles: [
                {
                    id: 'test-mgmt',
                    title: 'Test Management',
                    subtitle: 'Planes & Escenarios',
                    faIcon: 'vial',
                    iconBg: 'linear-gradient(135deg, #049DBF, #03748e)',
                    kpi: { value: '6', label: 'Planes de Prueba', trend: 'neutral', unit: '' },
                    badge: 'QA Suite',
                    badgeType: 'info'
                },
                {
                    id: 'test-exec',
                    title: 'Test Execution',
                    subtitle: 'Manual & Automatizado',
                    faIcon: 'circle-play',
                    iconBg: 'linear-gradient(135deg, #107E3E, #0c5e2e)',
                    kpi: { value: '139', label: 'Casos Ejecutados', trend: 'success', unit: '' },
                    badge: 'Testing',
                    badgeType: 'success'
                }
            ]
        },
        jobs: {
            id: 'jobs',
            label: 'Job Management',
            faIcon: 'clock',
            tiles: [
                {
                    id: 'job-mgmt',
                    title: 'Job Overview',
                    subtitle: 'Procesamiento en Fondo',
                    faIcon: 'clock',
                    iconBg: 'linear-gradient(135deg, #6C3483, #512663)',
                    kpi: { value: '24', label: 'Jobs Programados', trend: 'neutral', unit: '' },
                    badge: 'Batch',
                    badgeType: 'info'
                },
                {
                    id: 'job-monitor',
                    title: 'Job Monitor',
                    subtitle: 'Alertas de Ejecución',
                    faIcon: 'desktop',
                    iconBg: 'linear-gradient(135deg, #BB0000, #910000)',
                    kpi: { value: '1', label: 'Job con Errores', trend: 'alert', unit: '' },
                    badge: 'Errores',
                    badgeType: 'danger'
                }
            ]
        },
        engagement: {
            id: 'engagement',
            label: 'SAP Engagement and Services',
            faIcon: 'network-wired',
            tiles: [
                {
                    id: 'sol-doc2',
                    title: 'Solution Documentation',
                    subtitle: 'Documentación Enterprise',
                    faIcon: 'folder-open',
                    iconBg: 'linear-gradient(135deg, #107E3E, #0c5e2e)',
                    kpi: { value: '38', label: 'Paquetes Enterprise', trend: 'success', unit: '' },
                    badge: 'Enterprise',
                    badgeType: 'success'
                },
                {
                    id: 'landscape',
                    title: 'Landscape Management',
                    subtitle: 'Monitoreo de Servidores',
                    faIcon: 'network-wired',
                    iconBg: 'linear-gradient(135deg, #059669, #047857)',
                    kpi: { value: '99.9', label: 'Disponibilidad Sistemas', trend: 'success', unit: '%' },
                    badge: 'Infraestructura',
                    badgeType: 'success'
                }
            ]
        }
    },

    // ── Icon Helper (SVG + FontAwesome Fallback) ─────────────
    icon(name, size = 16) {
        const icons = {
            'back': `<svg width="${size}" height="${size}" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
            'forward': `<svg width="${size}" height="${size}" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
            'add': `<svg width="${size}" height="${size}" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>`,
            'search': `<svg width="${size}" height="${size}" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 16l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
            'check': `<svg width="${size}" height="${size}" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
            'folder-doc': `<svg width="${size}" height="${size}" viewBox="0 0 24 24"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
            'filter': `<svg width="${size}" height="${size}" viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" fill="none" stroke="currentColor" stroke-width="2"/></svg>`
        };
        return icons[name] || `<i class="fas fa-${name}" style="font-size:${size}px"></i>`;
    },

    init() {
        this.renderSidebar();
        this.render();
        window.addEventListener('resize', () => {
            if (this.currentView === 'proj-analytics') this.drawDashboardCharts();
        });
    },

    goHome() {
        if (window.parent && window.parent !== window && window.parent.PortalApp) {
            window.parent.PortalApp.closeModal();
        } else {
            this.navigate('launchpad');
        }
    },

    // ── Left Sidebar Navigation Renderer (Matches user image exactly) ────────
    renderSidebar() {
        const scroll = document.getElementById('sidebarNavScroll');
        if (!scroll) return;

        const isHome = this.currentView === 'launchpad';
        const isDash = this.currentView === 'proj-analytics';
        const isKpi = this.currentView === 'req-mgmt';
        const isBreq = this.currentView === 'my-breq' || this.currentView === 'breq-detail' || this.currentView === 'create-ticket';
        const isProjects = this.currentView === 'my-projects';
        const isDoc = this.currentView === 'sol-doc' || this.currentView === 'sol-doc2';
        const isIncidents = this.currentView === 'incidents';
        const isApprovals = this.currentView === 'approval-inbox';
        const isCharm = this.currentView === 'change-requests';
        const isTest = this.currentView === 'test-mgmt' || this.currentView === 'test-exec';

        scroll.innerHTML = `
            <!-- Item: Inicio -->
            <div class="nav-item ${isHome ? 'active' : ''}" onclick="App.navigate('launchpad')" title="Inicio (Launchpad)">
                <div class="nav-item-left">
                    <i class="fas fa-house nav-item-icon"></i>
                    <span class="nav-item-text">Inicio</span>
                </div>
            </div>

            <!-- Item: Dashboard -->
            <div class="nav-item ${isDash ? 'active' : ''}" onclick="App.navigate('proj-analytics')" title="Dashboard">
                <div class="nav-item-left">
                    <i class="fas fa-gauge-high nav-item-icon"></i>
                    <span class="nav-item-text">Dashboard</span>
                </div>
            </div>

            <!-- Item: KPIs (Indicadores) -->
            <div class="nav-item ${isKpi ? 'active' : ''}" onclick="App.navigate('req-mgmt')" title="KPIs (Indicadores)">
                <div class="nav-item-left">
                    <i class="fas fa-chart-pie nav-item-icon"></i>
                    <span class="nav-item-text">KPIs (Indicadores)</span>
                </div>
            </div>

            <!-- Group: Operaciones -->
            <div class="nav-group ${this.operacionesExpanded !== false ? 'expanded' : ''}" id="grp-operaciones">
                <div class="nav-item ${isBreq || isProjects || isDoc ? 'active' : ''}" 
                     onclick="App.toggleGroup('operaciones')" 
                     title="Operaciones">
                    <div class="nav-item-left">
                        <i class="fas fa-folder-open nav-item-icon"></i>
                        <span class="nav-item-text">Operaciones</span>
                    </div>
                    <div class="nav-item-right">
                        <span class="nav-pipe">|</span>
                        <i class="fas fa-chevron-right nav-chevron"></i>
                    </div>
                </div>

                <div class="nav-sub-items" id="sub-operaciones" style="display:${this.operacionesExpanded !== false ? 'flex' : 'none'};">
                    <div class="nav-sub-item ${isBreq ? 'active' : ''}" onclick="App.navigate('my-breq')">
                        <span>Mis Requerimientos</span>
                    </div>
                    <div class="nav-sub-item ${this.currentView === 'req-mgmt' ? 'active' : ''}" onclick="App.navigate('req-mgmt')">
                        <span>Gestión de Requerimientos</span>
                    </div>
                    <div class="nav-sub-item ${isProjects ? 'active' : ''}" onclick="App.navigate('my-projects')">
                        <span>Mis Proyectos</span>
                    </div>
                    <div class="nav-sub-item ${isDoc ? 'active' : ''}" onclick="App.navigate('sol-doc')">
                        <span>Documentación de Procesos</span>
                    </div>
                </div>
            </div>

            <!-- Section Header: IT Service Management (ITSM) -->
            <div class="nav-section-header">IT Service Management (ITSM)</div>

            <!-- Active card item: Incidentes & Aprobaciones (highlighted with blue border box) -->
            <div class="nav-item ${isIncidents || isApprovals || isCharm ? 'active' : ''}" 
                 onclick="App.navigate('incidents')" 
                 title="Mis Incidentes y Aprobaciones">
                <div class="nav-item-left">
                    <i class="fas fa-triangle-exclamation nav-item-icon"></i>
                    <span class="nav-item-text">Mis Incidentes (ITSM)</span>
                </div>
                <div class="nav-item-right">
                    <span class="nav-pipe">|</span>
                    <i class="fas fa-chevron-right nav-chevron"></i>
                </div>
            </div>

            <!-- Group: Test Suite -->
            <div class="nav-group ${this.testExpanded ? 'expanded' : ''}" id="grp-test">
                <div class="nav-item ${isTest ? 'active' : ''}" onclick="App.toggleGroup('test')" title="Test Suite">
                    <div class="nav-item-left">
                        <i class="fas fa-vial nav-item-icon"></i>
                        <span class="nav-item-text">Test Suite</span>
                    </div>
                    <div class="nav-item-right">
                        <span class="nav-pipe">|</span>
                        <i class="fas fa-chevron-right nav-chevron"></i>
                    </div>
                </div>

                <div class="nav-sub-items" id="sub-test" style="display:${this.testExpanded ? 'flex' : 'none'};">
                    <div class="nav-sub-item ${this.currentView === 'test-mgmt' ? 'active' : ''}" onclick="App.navigate('test-mgmt')">
                        <span>Gestión de Pruebas</span>
                    </div>
                    <div class="nav-sub-item ${this.currentView === 'test-exec' ? 'active' : ''}" onclick="App.navigate('test-exec')">
                        <span>Ejecución de Pruebas</span>
                    </div>
                </div>
            </div>

            <!-- Group: Configuración -->
            <div class="nav-group ${this.configExpanded !== false ? 'expanded' : ''}" id="grp-config">
                <div class="nav-item" onclick="App.toggleGroup('config')" title="Configuración">
                    <div class="nav-item-left">
                        <i class="fas fa-sliders nav-item-icon"></i>
                        <span class="nav-item-text">Configuración</span>
                    </div>
                    <div class="nav-item-right">
                        <span class="nav-pipe">|</span>
                        <i class="fas fa-chevron-right nav-chevron" style="transform:rotate(90deg);"></i>
                    </div>
                </div>

                <div class="nav-sub-items" id="sub-config" style="display:${this.configExpanded !== false ? 'flex' : 'none'};">
                    <div class="nav-sub-item ${this.currentView === 'landscape' ? 'active' : ''}" onclick="App.navigate('landscape')">
                        <span>Landscape Management</span>
                    </div>
                    <div class="nav-sub-item ${this.currentView === 'job-mgmt' ? 'active' : ''}" onclick="App.navigate('job-mgmt')">
                        <span>Job Management</span>
                    </div>
                </div>
            </div>
        `;
    },

    toggleGroup(grpName) {
        if (grpName === 'operaciones') {
            this.operacionesExpanded = !(this.operacionesExpanded !== false);
        } else if (grpName === 'test') {
            this.testExpanded = !this.testExpanded;
        } else if (grpName === 'config') {
            this.configExpanded = !(this.configExpanded !== false);
        }
        this.renderSidebar();
    },

    toggleSidebar() {
        const sidebar = document.getElementById('solmanSidebar');
        if (!sidebar) return;
        this.sidebarCollapsed = !this.sidebarCollapsed;
        sidebar.classList.toggle('collapsed', this.sidebarCollapsed);
    },

    filterSidebar(query) {
        const q = (query || '').toLowerCase().trim();
        const items = document.querySelectorAll('.nav-item, .nav-sub-item');
        items.forEach(el => {
            const text = el.innerText.toLowerCase();
            el.style.display = (!q || text.includes(q)) ? 'flex' : 'none';
        });
    },

    updateSidebarActive(view) {
        document.querySelectorAll('.sidebar-nav-item').forEach(el => {
            const itemId = el.getAttribute('data-id');
            const isActive = (view === 'launchpad' && itemId === 'launchpad') ||
                             (itemId === view) ||
                             (itemId === 'my-breq' && (view === 'breq-detail' || view === 'create-ticket'));
            el.classList.toggle('active', !!isActive);
        });
    },

    navigate(view) {
        this.currentView = view;
        this.render();
        this.updateSidebarActive(view);
        const main = document.getElementById('main-content');
        if (main) main.scrollTop = 0;
        window.scrollTo(0, 0);
    },

    setCategory(cat) {
        this.currentCategory = cat;
        this.currentView = 'launchpad';
        this.render();
        this.updateSidebarActive('launchpad');
        const main = document.getElementById('main-content');
        if (main) main.scrollTop = 0;
        window.scrollTo(0, 0);
    },

    render() {
        const main = document.getElementById('main-content');
        const categoryNav = document.getElementById('category-nav');

        // Toggle category bar visibility depending on view
        if (categoryNav) {
            if (this.currentView === 'launchpad') {
                categoryNav.style.display = 'flex';
                document.querySelectorAll('.category-tab').forEach(t => {
                    t.classList.toggle('active', t.dataset.cat === this.currentCategory);
                });
            } else {
                categoryNav.style.display = 'none';
            }
        }

        switch(this.currentView) {
            case 'launchpad': main.innerHTML = this.renderTiles(); break;
            case 'my-breq': main.innerHTML = this.renderBusinessReqs(); break;
            case 'breq-detail': main.innerHTML = this.renderBreqDetail(); break;
            case 'create-ticket': main.innerHTML = this.renderCreateTicket(); break;
            case 'req-mgmt': main.innerHTML = this.renderBusinessReqs(); break;
            case 'my-projects': main.innerHTML = this.renderProjects(); break;
            case 'proj-analytics': main.innerHTML = this.renderAnalytics(); setTimeout(() => this.drawDashboardCharts(), 100); break;
            case 'sol-admin': main.innerHTML = this.renderSolAdmin(); break;
            case 'sol-doc': case 'sol-doc2': main.innerHTML = this.renderSolDoc(); break;
            case 'incidents': main.innerHTML = this.renderIncidents(); break;
            case 'approval-inbox': main.innerHTML = this.renderApprovals(); break;
            case 'change-requests': main.innerHTML = this.renderChangeRequests(); break;
            case 'it-req': main.innerHTML = this.renderITReqs(); break;
            case 'test-mgmt': case 'test-exec': main.innerHTML = this.renderTestMgmt(); break;
            case 'job-mgmt': case 'job-monitor': main.innerHTML = this.renderJobs(); break;
            case 'landscape': main.innerHTML = this.renderLandscape(); break;
            default: main.innerHTML = this.renderTiles();
        }
    },

    // ── Helper to Render Single Fiori Tile Matching Main Launchpad ──
    renderFioriTile(tile) {
        const kpiTrendClass = tile.kpi.trend === 'alert' ? 'alert' : (tile.kpi.trend === 'success' ? 'success' : (tile.kpi.trend === 'warning' ? 'warning' : ''));
        return `
            <div class="fiori-tile fiori-app-tile" onclick="App.navigate('${tile.id}')" title="${tile.title} — ${tile.subtitle}">
                <div class="tile-header">
                    <div class="app-tile-top app-tile-top-title">
                        <span class="tile-title">${tile.title}</span>
                        <div class="tile-icon-badge" style="background:${tile.iconBg || 'linear-gradient(135deg, #0A6ED1, #0854A0)'}">
                            <i class="fas fa-${tile.faIcon || 'folder'}"></i>
                        </div>
                    </div>
                    <span class="tile-subtitle">${tile.subtitle}</span>
                </div>

                <div class="tile-content-middle">
                    <div class="kpi-number-wrap">
                        <span class="kpi-number ${kpiTrendClass}">${tile.kpi.value}</span>
                        ${tile.kpi.unit ? `<span class="kpi-unit">${tile.kpi.unit}</span>` : ''}
                        ${tile.kpi.trend === 'success' ? `<span class="kpi-trend-arrow">▲</span>` : ''}
                    </div>
                    <span class="kpi-sublabel">${tile.kpi.label}</span>
                </div>

                <div class="tile-footer">
                    <div class="tile-footer-badge ${tile.badgeType || 'info'}">${tile.badge || 'SolMan'}</div>
                    <div class="app-tile-actions">
                        <button class="app-popout-btn" onclick="event.stopPropagation(); App.navigate('${tile.id}');" title="Abrir sub-aplicación">
                            <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // ── TILES (LAUNCHPAD OVERVIEW) ───────────────────────────
    renderTiles() {
        let html = `
            <div class="solman-workspace">
                <!-- Upper KPI Strip (Matches image colors and format) -->
                <div class="lp-kpi-grid">
                    <div class="lp-kpi-card" onclick="App.navigate('my-breq')" style="cursor:pointer;" title="Ver Requerimientos Pendientes">
                        <div class="lp-kpi-title">
                            <span>Req. Pendientes</span>
                        </div>
                        <div class="lp-kpi-unit">Reqs.</div>
                        <div class="lp-kpi-val orange">28</div>
                    </div>

                    <div class="lp-kpi-card" onclick="App.navigate('sol-doc')" style="cursor:pointer;" title="Ver Documentación de Procesos">
                        <div class="lp-kpi-title">
                            <span>Procesos Mapeados</span>
                        </div>
                        <div class="lp-kpi-unit">proc.</div>
                        <div class="lp-kpi-val slate">142</div>
                    </div>

                    <div class="lp-kpi-card" onclick="App.navigate('proj-analytics')" style="cursor:pointer;" title="Ver Calidad de Pruebas">
                        <div class="lp-kpi-title">
                            <span>Calidad de Pruebas</span>
                        </div>
                        <div class="lp-kpi-unit">%</div>
                        <div class="lp-kpi-val green">94</div>
                    </div>

                    <div class="lp-kpi-card" onclick="App.navigate('incidents')" style="cursor:pointer;" title="Ver Incidentes Críticos">
                        <div class="lp-kpi-title">
                            <span>Incidentes Críticos</span>
                        </div>
                        <div class="lp-kpi-unit">incid.</div>
                        <div class="lp-kpi-val orange">4</div>
                    </div>
                </div>
        `;

        if (this.currentCategory === 'all') {
            // Render all categories with clean Fiori group titles
            const catKeys = ['project', 'itsm', 'test', 'jobs', 'engagement'];
            catKeys.forEach(key => {
                const cat = this.categories[key];
                if (!cat) return;
                html += `
                    <div class="fiori-group-section">
                        <h2 class="fiori-section-title">
                            <i class="fas fa-${cat.faIcon} sapUiTinyMarginEnd" style="color:#0a6ed1; font-size:16px;"></i>
                            ${cat.label}
                        </h2>
                        <div class="fiori-tiles-container">
                            ${cat.tiles.map(tile => this.renderFioriTile(tile)).join('')}
                        </div>
                    </div>
                `;
            });
        } else {
            const cat = this.categories[this.currentCategory];
            if (cat) {
                html += `
                    <div class="fiori-group-section">
                        <h2 class="fiori-section-title">
                            <i class="fas fa-${cat.faIcon} sapUiTinyMarginEnd" style="color:#0a6ed1; font-size:16px;"></i>
                            ${cat.label}
                        </h2>
                        <div class="fiori-tiles-container">
                            ${cat.tiles.map(tile => this.renderFioriTile(tile)).join('')}
                        </div>
                    </div>
                `;
            }
        }

        html += `</div>`;
        return html;
    },

    // ── PAGE HEADER HELPER ───────────────────────────────────
    pageHeader(title, subtitle, actions = '') {
        return `<div class="page-header">
            <div class="page-header-left">
                <button class="btn-back" onclick="App.navigate('launchpad')">${this.icon('back', 18)}</button>
                <div><div class="page-title">${title}</div>${subtitle ? `<div class="page-subtitle">${subtitle}</div>` : ''}</div>
            </div>
            <div class="btn-group">${actions}</div>
        </div>`;
    },

    // ── STATUS HELPER ────────────────────────────────────────
    statusBadge(status) {
        const cls = status.toLowerCase().replace(/\s+/g, '');
        return `<span class="status-badge status-${cls}">${status}</span>`;
    },

    priorityBadge(p) {
        const cls = p.toLowerCase();
        return `<span class="priority-badge priority-${cls}"><span class="priority-indicator"></span>${p}</span>`;
    },

    // ── BUSINESS REQUIREMENTS ────────────────────────────────
    renderBusinessReqs() {
        const data = MOCK_DATA.businessRequirements;
        const notClosed = data.filter(r => r.status !== 'Closed').length;
        return `<div class="sub-app">
            ${this.pageHeader('My Business Requirements', `${notClosed} Not Closed`,
                `<button class="btn btn-primary" onclick="App.navigate('create-ticket')">${this.icon('add',16)} Create New</button>`)}
            <div class="filter-bar">
                <div class="filter-group"><span class="filter-label">Status</span>
                    <select class="filter-select" onchange="App.filterTable(this.value,'status')">
                        <option value="">All</option><option>New</option><option>In Process</option>
                        <option>In Approval</option><option>Completed</option><option>Closed</option>
                    </select></div>
                <div class="filter-group"><span class="filter-label">Priority</span>
                    <select class="filter-select" onchange="App.filterTable(this.value,'priority')">
                        <option value="">All</option><option>Critical</option><option>High</option>
                        <option>Medium</option><option>Low</option>
                    </select></div>
                <div class="filter-group"><span class="filter-label">Area</span>
                    <select class="filter-select" onchange="App.filterTable(this.value,'area')">
                        <option value="">All</option><option>FI</option><option>MM</option>
                        <option>SD</option><option>PP</option><option>HCM</option><option>QM</option><option>PM</option><option>CO</option>
                    </select></div>
                <div class="filter-group filter-search"><span class="filter-label">Search</span>
                    ${this.icon('search',14)}<input class="filter-input" placeholder="Search requirements..." onkeyup="App.searchTable(this.value)"></div>
            </div>
            <div class="data-table-container">
                <div class="data-table-toolbar"><div><span class="data-table-title">Business Requirements</span>
                    <span class="data-table-count">(${data.length})</span></div></div>
                <table class="data-table" id="breq-table"><thead><tr>
                    <th>ID</th><th>Title</th><th>Priority</th><th>Status</th>
                    <th>Requester</th><th>Date</th><th>Area</th><th>Progress</th>
                </tr></thead><tbody>
                ${data.map(r => `<tr data-status="${r.status}" data-priority="${r.priority}" data-area="${r.area}" onclick="App.selectedReq='${r.id}';App.navigate('breq-detail')">
                    <td class="col-id">${r.id}</td><td class="col-title">${r.title}</td>
                    <td>${this.priorityBadge(r.priority)}</td><td>${this.statusBadge(r.status)}</td>
                    <td>${r.requester}</td><td>${r.date}</td><td>${r.area}</td>
                    <td><div class="progress-bar" style="width:80px"><div class="progress-fill ${r.progress >= 80 ? 'positive' : r.progress >= 40 ? '' : 'warning'}" style="width:${r.progress}%"></div></div>
                    <span class="progress-text">${r.progress}%</span></td>
                </tr>`).join('')}
                </tbody></table>
            </div></div>`;
    },

    filterTable(val, field) {
        document.querySelectorAll('#breq-table tbody tr').forEach(tr => {
            if (!val) { tr.style.display = ''; return; }
            tr.style.display = tr.dataset[field] === val ? '' : 'none';
        });
    },

    searchTable(val) {
        const q = val.toLowerCase();
        document.querySelectorAll('#breq-table tbody tr').forEach(tr => {
            tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
        });
    },

    // ── BUSINESS REQ DETAIL ──────────────────────────────────
    renderBreqDetail() {
        const r = MOCK_DATA.businessRequirements.find(x => x.id === this.selectedReq);
        if (!r) return this.renderBusinessReqs();
        const statuses = ['New', 'In Process', 'In Approval', 'Completed', 'Closed'];
        const currentIdx = statuses.indexOf(r.status === 'In Process' ? 'In Process' : r.status);
        const relatedIT = MOCK_DATA.itRequirements.filter(it => it.businessReqId === r.id);

        return `<div class="sub-app detail-view">
            <div class="page-header"><div class="page-header-left">
                <button class="btn-back" onclick="App.navigate('my-breq')">${this.icon('back',18)}</button>
                <div><div class="detail-id">${r.id}</div><div class="page-title">${r.title}</div></div>
            </div><div class="btn-group">
                <button class="btn btn-secondary">Edit</button>
                <button class="btn btn-positive">Approve</button>
            </div></div>
            <div class="detail-header">
                <div class="status-pipeline">${statuses.map((s, i) => `
                    <div class="pipeline-step">
                        <div class="pipeline-node">
                            <div class="pipeline-dot ${i < currentIdx ? 'completed' : i === currentIdx ? 'active' : ''}">${i < currentIdx ? this.icon('check', 14) : ''}</div>
                            <span class="pipeline-label ${i === currentIdx ? 'active' : ''}">${s}</span>
                        </div>
                        ${i < statuses.length - 1 ? `<div class="pipeline-connector ${i < currentIdx ? 'completed' : ''}"></div>` : ''}
                    </div>`).join('')}</div>
                <div class="detail-meta">
                    <div class="detail-meta-item"><span class="detail-meta-label">Priority</span><span class="detail-meta-value">${this.priorityBadge(r.priority)}</span></div>
                    <div class="detail-meta-item"><span class="detail-meta-label">Status</span><span class="detail-meta-value">${this.statusBadge(r.status)}</span></div>
                    <div class="detail-meta-item"><span class="detail-meta-label">Requester</span><span class="detail-meta-value">${r.requester}</span></div>
                    <div class="detail-meta-item"><span class="detail-meta-label">Assigned To</span><span class="detail-meta-value">${r.assignedTo}</span></div>
                    <div class="detail-meta-item"><span class="detail-meta-label">Created</span><span class="detail-meta-value">${r.date}</span></div>
                    <div class="detail-meta-item"><span class="detail-meta-label">Due Date</span><span class="detail-meta-value">${r.dueDate}</span></div>
                    <div class="detail-meta-item"><span class="detail-meta-label">Area / Module</span><span class="detail-meta-value">${r.area}</span></div>
                    <div class="detail-meta-item"><span class="detail-meta-label">Progress</span><span class="detail-meta-value">${r.progress}%</span></div>
                </div>
            </div>
            <div class="tab-bar"><button class="tab-item active">Description</button><button class="tab-item">Related IT Requirements (${relatedIT.length})</button><button class="tab-item">Attachments</button></div>
            <div class="tab-content"><p style="line-height:1.7;color:var(--text-secondary)">${r.description}</p>
                ${relatedIT.length > 0 ? `<div class="mt-lg"><h3 style="font-size:15px;margin-bottom:12px">Related IT Requirements</h3>
                <table class="data-table"><thead><tr><th>ID</th><th>Title</th><th>Status</th><th>Developer</th><th>Transport</th></tr></thead><tbody>
                ${relatedIT.map(it => `<tr><td class="col-id">${it.id}</td><td>${it.title}</td><td>${this.statusBadge(it.status)}</td><td>${it.developer}</td><td>${it.transport || '-'}</td></tr>`).join('')}
                </tbody></table></div>` : ''}
            </div></div>`;
    },

    // ── IT REQUIREMENTS ──────────────────────────────────────
    renderITReqs() {
        const data = MOCK_DATA.itRequirements;
        return `<div class="sub-app">${this.pageHeader('IT Requirements', `${data.length} Requirements`)}
            <div class="data-table-container">
                <div class="data-table-toolbar"><span class="data-table-title">IT Requirements</span><span class="data-table-count">(${data.length})</span></div>
                <table class="data-table"><thead><tr><th>ID</th><th>Title</th><th>Business Req</th><th>Complexity</th><th>Sprint</th><th>Status</th><th>Developer</th><th>Transport</th></tr></thead><tbody>
                ${data.map(r => `<tr><td class="col-id">${r.id}</td><td>${r.title}</td><td class="text-link" onclick="App.selectedReq='${r.businessReqId}';App.navigate('breq-detail')">${r.businessReqId}</td><td>${this.priorityBadge(r.complexity)}</td><td>${r.sprint}</td><td>${this.statusBadge(r.status)}</td><td>${r.developer}</td><td>${r.transport || '-'}</td></tr>`).join('')}
                </tbody></table></div></div>`;
    },

    // ── PROJECTS ─────────────────────────────────────────────
    renderProjects() {
        const data = MOCK_DATA.projects;
        return `<div class="sub-app">${this.pageHeader('My Projects', 'Project Management')}
            <div class="data-table-container">
                <div class="data-table-toolbar"><span class="data-table-title">Projects</span><span class="data-table-count">(${data.length})</span></div>
                <table class="data-table"><thead><tr><th>ID</th><th>Project</th><th>Phase</th><th>Status</th><th>Manager</th><th>Team</th><th>Progress</th><th>Budget</th></tr></thead><tbody>
                ${data.map(p => `<tr><td class="col-id">${p.id}</td><td class="col-title">${p.title}</td><td>${p.phase}</td><td>${this.statusBadge(p.status)}</td><td>${p.manager}</td><td>${p.team}</td>
                    <td><div class="progress-bar" style="width:80px"><div class="progress-fill ${p.progress>=80?'positive':p.progress>=40?'':'warning'}" style="width:${p.progress}%"></div></div><span class="progress-text">${p.progress}%</span></td>
                    <td>$${(p.budget/1000).toFixed(0)}K</td></tr>`).join('')}
                </tbody></table></div></div>`;
    },

    // ── ANALYTICS DASHBOARD ──────────────────────────────────
    renderAnalytics() {
        const k = MOCK_DATA.kpis;
        return `<div class="sub-app">${this.pageHeader('Projects Analytics', 'Dashboard & KPIs')}
            <div class="kpi-grid">
                <div class="kpi-card" style="--kpi-color:#0A6ED1"><div class="kpi-label">Active Requirements</div><div class="kpi-value">${k.totalActive}</div><div class="kpi-trend up">▲ 20% vs last month</div></div>
                <div class="kpi-card" style="--kpi-color:#107E3E"><div class="kpi-label">In SLA</div><div class="kpi-value">${k.inSLA}<span class="kpi-unit">%</span></div><div class="kpi-trend up">▲ 5% improvement</div></div>
                <div class="kpi-card" style="--kpi-color:#E9730C"><div class="kpi-label">Avg. Resolution</div><div class="kpi-value">${k.avgResolutionDays}<span class="kpi-unit">days</span></div><div class="kpi-trend down">▼ 3 days slower</div></div>
                <div class="kpi-card" style="--kpi-color:#BB0000"><div class="kpi-label">Backlog</div><div class="kpi-value">${k.backlog}</div><div class="kpi-trend up">▲ Needs attention</div></div>
            </div>
            <div class="chart-grid">
                <div class="chart-card"><div class="chart-title">Requirements by Status</div><div class="chart-canvas-wrapper"><canvas id="chart-donut"></canvas></div></div>
                <div class="chart-card"><div class="chart-title">Requirements by Area/Module</div><div class="chart-canvas-wrapper"><canvas id="chart-bar"></canvas></div></div>
                <div class="chart-card" style="grid-column:1/-1"><div class="chart-title">Monthly Trend — Created vs Completed</div><div class="chart-canvas-wrapper"><canvas id="chart-line"></canvas></div></div>
            </div></div>`;
    },

    drawDashboardCharts() {
        const k = MOCK_DATA.kpis;
        Charts.drawDonut('chart-donut', k.statusDistribution, ['#0A6ED1','#E9730C','#8E44AD','#107E3E','#6A6D70']);
        Charts.drawBar('chart-bar', k.areaDistribution, ['#0A6ED1','#0854A0','#107E3E','#E9730C','#6C3483','#049DBF','#BB0000','#C87A1A']);
        Charts.drawLine('chart-line', k.monthlyTrend.labels, [
            { label: 'Created', data: k.monthlyTrend.created, color: '#0A6ED1' },
            { label: 'Completed', data: k.monthlyTrend.completed, color: '#107E3E' }
        ]);
    },

    // ── APPROVALS ────────────────────────────────────────────
    renderApprovals() {
        const data = MOCK_DATA.approvalItems;
        return `<div class="sub-app">${this.pageHeader('Approval Inbox', `${data.length} Pending Approvals`)}
            <div class="approval-list">${data.map(a => `
                <div class="approval-card ${a.urgency.toLowerCase()}">
                    <div class="approval-top"><div><div class="approval-type">${a.type} · ${a.refId}</div><div class="approval-title">${a.title}</div></div>${this.priorityBadge(a.urgency)}</div>
                    <div class="approval-info"><div class="approval-info-item">Requester: <strong>${a.requester}</strong></div><div class="approval-info-item">Date: <strong>${a.date}</strong></div></div>
                    <div class="approval-desc">${a.description}</div>
                    <div class="approval-actions">
                        <button class="btn btn-positive btn-sm" onclick="App.toast('Approved: ${a.title}','success')">✓ Approve</button>
                        <button class="btn btn-negative btn-sm" onclick="App.toast('Rejected: ${a.title}','error')">✕ Reject</button>
                        <button class="btn btn-ghost btn-sm">Request Info</button>
                    </div>
                </div>`).join('')}</div></div>`;
    },

    // ── CHANGE REQUESTS ──────────────────────────────────────
    renderChangeRequests() {
        const data = MOCK_DATA.changeRequests;
        return `<div class="sub-app">${this.pageHeader('Change Request Management', 'ChaRM')}
            <div class="data-table-container">
                <div class="data-table-toolbar"><span class="data-table-title">Change Requests</span><span class="data-table-count">(${data.length})</span></div>
                <table class="data-table"><thead><tr><th>ID</th><th>Description</th><th>Type</th><th>Status</th><th>Transport</th><th>Developer</th><th>Created</th><th>Landscape</th></tr></thead><tbody>
                ${data.map(c => `<tr><td class="col-id">${c.id}</td><td>${c.description}</td><td>${this.statusBadge(c.type)}</td><td>${this.statusBadge(c.status)}</td><td style="font-family:monospace;font-size:12px">${c.transport}</td><td>${c.developer}</td><td>${c.createdDate}</td><td style="font-size:11px;color:var(--text-secondary)">${c.system}</td></tr>`).join('')}
                </tbody></table></div></div>`;
    },

    // ── INCIDENTS ────────────────────────────────────────────
    renderIncidents() {
        const data = MOCK_DATA.incidents;
        return `<div class="sub-app">${this.pageHeader('My Incidents', 'IT Service Management')}
            <div class="data-table-container">
                <div class="data-table-toolbar"><span class="data-table-title">Incidents</span><span class="data-table-count">(${data.length})</span></div>
                <table class="data-table"><thead><tr><th>ID</th><th>Title</th><th>Priority</th><th>Status</th><th>Assigned To</th><th>Category</th><th>SLA</th><th>Remaining</th></tr></thead><tbody>
                ${data.map(inc => `<tr><td class="col-id">${inc.id}</td><td class="col-title">${inc.title}</td><td>${this.priorityBadge(inc.priority)}</td><td>${this.statusBadge(inc.status)}</td><td>${inc.assignedTo}</td><td>${inc.category}</td><td>${inc.sla}</td><td style="font-weight:600;color:${inc.remaining==='Closed'?'var(--sap-positive)':'var(--sap-critical)'}">${inc.remaining}</td></tr>`).join('')}
                </tbody></table></div></div>`;
    },

    // ── SOLUTION DOCUMENTATION ───────────────────────────────
    renderSolDoc() {
        const data = MOCK_DATA.solutionDoc;
        return `<div class="sub-app">${this.pageHeader('Solution Documentation', 'Business Process Hierarchy')}
            <div class="tree-view">${data.map((area, ai) => `
                <div class="tree-node">
                    <div class="tree-node-header" onclick="this.querySelector('.tree-toggle').classList.toggle('expanded');this.parentElement.querySelector('.tree-children').classList.toggle('expanded')">
                        <div class="tree-toggle">${this.icon('back',12).replace('15 18l-6-6 6-6','9 18l6-6-6-6')}</div>
                        <div class="tree-node-icon">${this.icon('folder-doc',18)}</div>
                        <div class="tree-node-name">${area.name}</div>
                        <div class="tree-node-badge">${area.processes.length} processes</div>
                    </div>
                    <div class="tree-children">${area.processes.map(proc => `
                        <div class="tree-child">
                            <div class="tree-child-name">${proc.name}</div>
                            <div class="tree-child-steps">${proc.steps.map(s => `<span class="tree-step-tag">${s}</span>`).join('')}</div>
                            ${proc.impactedReqs.length > 0 ? `<div class="tree-child-reqs">${proc.impactedReqs.map(r => `<span class="tree-req-link" onclick="event.stopPropagation();App.selectedReq='${r}';App.navigate('breq-detail')">${r}</span>`).join('')}</div>` : ''}
                        </div>`).join('')}</div>
                </div>`).join('')}</div></div>`;
    },

    // ── TEST MANAGEMENT ──────────────────────────────────────
    renderTestMgmt() {
        const data = MOCK_DATA.testPlans;
        return `<div class="sub-app">${this.pageHeader('Test Management', 'Test Suite')}
            <div class="data-table-container">
                <div class="data-table-toolbar"><span class="data-table-title">Test Plans</span><span class="data-table-count">(${data.length})</span></div>
                <table class="data-table"><thead><tr><th>ID</th><th>Name</th><th>Related Req.</th><th>Status</th><th>Tester</th><th>Passed</th><th>Failed</th><th>Pending</th><th>Progress</th></tr></thead><tbody>
                ${data.map(t => {
                    const pct = Math.round((t.passed / t.totalCases) * 100);
                    return `<tr><td class="col-id">${t.id}</td><td>${t.name}</td><td class="text-link">${t.relatedReq}</td><td>${this.statusBadge(t.status)}</td><td>${t.tester}</td>
                    <td style="color:var(--sap-positive);font-weight:600">${t.passed}</td><td style="color:var(--sap-negative);font-weight:600">${t.failed}</td><td style="color:var(--text-secondary)">${t.pending}</td>
                    <td><div class="progress-bar" style="width:100px"><div class="progress-fill ${pct>=80?'positive':pct>=40?'':'warning'}" style="width:${pct}%"></div></div><span class="progress-text">${pct}% (${t.passed}/${t.totalCases})</span></td></tr>`;
                }).join('')}</tbody></table></div></div>`;
    },

    // ── JOBS ─────────────────────────────────────────────────
    renderJobs() {
        const data = MOCK_DATA.jobs;
        return `<div class="sub-app">${this.pageHeader('Job Overview', 'Background Processing')}
            <div class="data-table-container">
                <div class="data-table-toolbar"><span class="data-table-title">Scheduled Jobs</span><span class="data-table-count">(${data.length})</span></div>
                <table class="data-table"><thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Schedule</th><th>Last Run</th><th>Status</th><th>Duration</th><th>Next Run</th></tr></thead><tbody>
                ${data.map(j => `<tr><td class="col-id">${j.id}</td><td>${j.name}</td><td>${j.type}</td><td>${j.schedule}</td><td>${j.lastRun}</td><td>${this.statusBadge(j.status)}</td><td>${j.duration}</td><td>${j.nextRun}</td></tr>`).join('')}
                </tbody></table></div></div>`;
    },

    // ── SOLUTION ADMINISTRATION ──────────────────────────────
    renderSolAdmin() {
        return `<div class="sub-app">${this.pageHeader('Solution Administration', 'System Configuration')}
            <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr)">
                <div class="kpi-card" style="--kpi-color:#0A6ED1;cursor:pointer"><div class="kpi-label">Workflow Configuration</div><div class="kpi-value" style="font-size:20px;font-weight:500">Status & Transitions</div><div class="kpi-trend">5 status types configured</div></div>
                <div class="kpi-card" style="--kpi-color:#107E3E;cursor:pointer"><div class="kpi-label">Catalogs</div><div class="kpi-value" style="font-size:20px;font-weight:500">Priorities & Areas</div><div class="kpi-trend">4 priorities, 8 areas</div></div>
                <div class="kpi-card" style="--kpi-color:#6C3483;cursor:pointer"><div class="kpi-label">Users & Roles</div><div class="kpi-value" style="font-size:20px;font-weight:500">Access Control</div><div class="kpi-trend">15 active users</div></div>
            </div>
            <div class="chart-card"><div class="chart-title">Workflow Status Configuration</div>
                <div class="status-pipeline" style="justify-content:center;padding:24px 0">
                    ${['New','In Process','In Approval','Completed','Closed'].map((s,i,a) => `<div class="pipeline-step"><div class="pipeline-node"><div class="pipeline-dot active">${this.icon('check',14)}</div><span class="pipeline-label active">${s}</span></div>${i<a.length-1?'<div class="pipeline-connector completed"></div>':''}</div>`).join('')}
                </div>
            </div></div>`;
    },

    // ── LANDSCAPE ────────────────────────────────────────────
    renderLandscape() {
        return `<div class="sub-app">${this.pageHeader('Landscape Management', 'SAP System Landscape')}
            <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr)">
                <div class="kpi-card" style="--kpi-color:#107E3E"><div class="kpi-label">DEV System</div><div class="kpi-value" style="font-size:18px;font-weight:500">S4D (100)</div><div class="kpi-trend up">Online · HANA 2.0</div></div>
                <div class="kpi-card" style="--kpi-color:#E9730C"><div class="kpi-label">QAS System</div><div class="kpi-value" style="font-size:18px;font-weight:500">S4Q (200)</div><div class="kpi-trend up">Online · HANA 2.0</div></div>
                <div class="kpi-card" style="--kpi-color:#0A6ED1"><div class="kpi-label">PRD System</div><div class="kpi-value" style="font-size:18px;font-weight:500">S4P (300)</div><div class="kpi-trend up">Online · HANA 2.0</div></div>
            </div></div>`;
    },

    // ── CREATE TICKET (SolMan Style) ──────────────────────────
    renderCreateTicket() {
        const now = new Date();
        const dateStr = now.toLocaleDateString('es-MX', {day:'2-digit',month:'2-digit',year:'numeric'});
        const timeStr = now.toLocaleTimeString('es-MX', {hour:'2-digit',minute:'2-digit',second:'2-digit'});
        const ticketNum = '900000' + String(Math.floor(Math.random()*90)+10).padStart(4,'0');

        return `<div class="sub-app ticket-form-page">
            <!-- Ticket Header Bar -->
            <div class="ticket-header-bar">
                <div style="display:flex;align-items:center;gap:12px">
                    <button class="btn-back" onclick="App.navigate('my-breq')">${this.icon('back',18)}</button>
                    <div class="ticket-header-title">Ticket <span class="ticket-header-id">${ticketNum}</span> - <span id="ticket-title-display">Nuevo Requerimiento</span></div>
                </div>
                <div style="display:flex;align-items:center;gap:8px">
                    <div class="ticket-toolbar">
                        <button class="ticket-toolbar-btn" title="Save"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M17 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V7l-4-4zm-5 16a3 3 0 110-6 3 3 0 010 6zm3-10H7V5h8v4z" fill="currentColor"/></svg></button>
                        <button class="ticket-toolbar-btn" title="Print"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7a1 1 0 110-2 1 1 0 010 2zm-1-9H6v4h12V3z" fill="currentColor"/></svg></button>
                        <button class="ticket-toolbar-btn" title="Copy"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M16 1H4a2 2 0 00-2 2v14h2V3h12V1zm3 4H8a2 2 0 00-2 2v14a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2zm0 16H8V7h11v14z" fill="currentColor"/></svg></button>
                        <button class="ticket-toolbar-btn" title="Refresh"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 4V1L8 5l4 4V6a6 6 0 11-6 6H4a8 8 0 108-8z" fill="currentColor"/></svg></button>
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="App.saveTicket()">💾 Guardar</button>
                    <button class="btn btn-positive btn-sm" onclick="App.toast('Ticket creado: ${ticketNum}','success');App.navigate('my-breq')">✓ Nuevo</button>
                </div>
            </div>

            <!-- Ticket Body Grid -->
            <div class="ticket-body">
                <!-- LEFT: Datos Generales -->
                <div class="ticket-section">
                    <div class="ticket-section-title">Datos Generales</div>
                    <div class="ticket-section-body">
                        <div class="ticket-field">
                            <div class="ticket-field-label">Tipo de Ticket</div>
                            <div class="ticket-field-value"><select class="form-select"><option selected>Requerimiento</option><option>Incidente</option><option>Cambio</option><option>Problema</option></select></div>
                        </div>
                        <div class="ticket-field">
                            <div class="ticket-field-label">Módulo</div>
                            <div class="ticket-field-value"><select class="form-select"><option>Finanzas</option><option>Materiales</option><option>Ventas</option><option>Producción</option><option>Recursos Humanos</option><option>Calidad</option><option>Mantenimiento</option><option>Controlling</option></select></div>
                        </div>
                        <div class="ticket-field">
                            <div class="ticket-field-label">Contexto Operativo</div>
                            <div class="ticket-field-value"><select class="form-select"><option>Producción</option><option>Calidad</option><option>Desarrollo</option><option>Pre-Producción</option></select></div>
                        </div>
                        <div class="ticket-field">
                            <div class="ticket-field-label">Título de Ticket</div>
                            <div class="ticket-field-value"><input class="form-input" id="ticket-title-input" value="" placeholder="Ej: MM01 Reporte Intercompany" oninput="document.getElementById('ticket-title-display').textContent=this.value||'Nuevo Requerimiento'"></div>
                        </div>
                        <div class="ticket-field">
                            <div class="ticket-field-label">Descripción</div>
                            <div class="ticket-field-value"><textarea class="form-textarea" rows="5" placeholder="Descripción detallada del requerimiento..."></textarea></div>
                        </div>
                    </div>
                </div>

                <!-- RIGHT TOP: Anexos + Datos de Proceso + Fechas -->
                <div style="display:flex;flex-direction:column;gap:var(--space-lg)">
                    <!-- Anexos -->
                    <div class="ticket-section">
                        <div class="ticket-section-title">Anexos</div>
                        <div class="ticket-section-body">
                            <table class="ticket-attach-table">
                                <thead><tr><th style="width:30px">Ico</th><th>Título</th><th>Autor</th><th>Fe.Creac.</th></tr></thead>
                                <tbody>
                                    <tr><td class="file-icon">📄</td><td style="color:var(--text-link);cursor:pointer">BANCOS_CSV22.csv</td><td>QPQ_ADMIN</td><td>${dateStr}</td></tr>
                                </tbody>
                            </table>
                            <div style="margin-top:8px">
                                <button class="btn btn-ghost btn-sm" onclick="App.toast('Archivo adjuntado','info')">📎 Adjuntar Archivo</button>
                            </div>
                        </div>
                    </div>

                    <!-- Datos de Proceso -->
                    <div class="ticket-section">
                        <div class="ticket-section-title">Datos de Proceso</div>
                        <div class="ticket-section-body">
                            <div class="ticket-field">
                                <div class="ticket-field-label">Status</div>
                                <div class="ticket-field-value">
                                    <div class="ticket-status-ind">
                                        <select class="form-select" style="flex:1"><option selected>En Estimación</option><option>En Desarrollo</option><option>En Pruebas</option><option>En Aprobación</option><option>Cerrado</option></select>
                                        <div class="ticket-status-dot"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="ticket-field">
                                <div class="ticket-field-label">Impacto</div>
                                <div class="ticket-field-value"><select class="form-select"><option>Bajo</option><option>Medio</option><option selected>Alto</option><option>Crítico</option></select></div>
                            </div>
                            <div class="ticket-field">
                                <div class="ticket-field-label">Urgencia</div>
                                <div class="ticket-field-value"><select class="form-select"><option>Baja</option><option>Media</option><option selected>Alta</option><option>Crítica</option></select></div>
                            </div>
                        </div>
                    </div>

                    <!-- Fechas -->
                    <div class="ticket-section">
                        <div class="ticket-section-title">Fechas</div>
                        <div class="ticket-section-body">
                            <div class="ticket-field">
                                <div class="ticket-field-label">Creado el</div>
                                <div class="ticket-field-value"><input class="form-input" value="${dateStr} ${timeStr}" readonly style="background:#F5F6F7;color:var(--text-secondary)"></div>
                            </div>
                            <div class="ticket-field">
                                <div class="ticket-field-label">Última Modif.</div>
                                <div class="ticket-field-value"><input class="form-input" value="00:00:00" readonly style="background:#F5F6F7;color:var(--text-secondary)"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- BOTTOM: LOG -->
                <div class="ticket-log">
                    <div class="ticket-log-title">LOG</div>
                    <div class="data-table-container">
                        <table class="data-table">
                            <thead><tr><th>Campo</th><th>Valor nuevo</th><th>Valor anterior</th><th>Modificado por</th><th>Modificado el</th></tr></thead>
                            <tbody>
                                <tr><td>Status</td><td>En Estimación</td><td>Nuevo</td><td>QPQ_ADMIN</td><td>${dateStr} ${timeStr}</td></tr>
                                <tr><td>Asignado a</td><td>Ana López</td><td>-</td><td>QPQ_ADMIN</td><td>${dateStr} ${timeStr}</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>`;
    },

    saveTicket() {
        const title = document.getElementById('ticket-title-input')?.value;
        if (!title) { this.toast('Por favor ingrese un título', 'error'); return; }
        this.toast('Ticket guardado exitosamente', 'success');
    },

    // ── TOAST ────────────────────────────────────────────────
    toast(msg, type = 'info') {
        let container = document.querySelector('.toast-container');
        if (!container) { container = document.createElement('div'); container.className = 'toast-container'; document.body.appendChild(container); }
        const t = document.createElement('div');
        t.className = `toast ${type}`;
        t.textContent = msg;
        container.appendChild(t);
        setTimeout(() => { t.style.animation = 'toastOut 0.3s ease forwards'; setTimeout(() => t.remove(), 300); }, 3000);
    }
};

window.App = App;

document.addEventListener('DOMContentLoaded', () => App.init());

