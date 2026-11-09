/**
 * SAP WMS 3D Digital Twin - Main Application Controller
 * Coordina la UI Fiori, el motor 3D Three.js, el gestor de datos y el asistente Joule.
 */

(function () {
  'use strict';

  let dataManager = null;
  let viewer3d = null;
  let excelHandler = null;
  let jouleAssistant = null;

  // Estado activo de la interfaz
  const state = {
    currentTheme: 'light',
    activeView: 'general',
    statusFilter: 'all', // 'all', 'alerts_only', 'vencido', 'critico', etc.
    aisleFilter: 'all',
    levelFilter: 'all',
    searchQuery: '',
    selectedAisleInWalk: 'F'
  };

  document.addEventListener('DOMContentLoaded', () => {
    initApp();
  });

  function initApp() {
    // Si la app está embebida en un iframe del portal Fiori, ocultar la shell bar duplicada
    if (window.self !== window.top) {
      document.body.classList.add('in-iframe');
    }

    // 1. Inicializar Gestor de Datos
    dataManager = new window.WarehouseDataManager();
    dataManager.generateSampleWarehouse();

    // 2. Inicializar Visor 3D Three.js
    const container = document.getElementById('viewport-3d-container');
    viewer3d = new window.Warehouse3DViewer(container, dataManager, (selectedNiche) => {
      openNicheDetailDrawer(selectedNiche);
    });

    // 3. Inicializar Gestor de Excel
    excelHandler = new window.ExcelWarehouseHandler(dataManager, (summary) => {
      viewer3d.buildRacksAndPallets();
      updateUIStats(summary);
      showNotification('Datos de almacén cargados correctamente desde Excel', 'success');
    });

    // 4. Controlador de UI público para Joule
    const uiController = {
      setFilterState: (status) => {
        applyStatusFilter(status);
      },
      selectNiche: (id) => {
        viewer3d.selectNiche(id);
      }
    };

    // 5. Inicializar Asistente Joule
    jouleAssistant = new window.JouleWarehouseAssistant(dataManager, viewer3d, uiController);

    // 6. Configurar Event Listeners de la Interfaz Fiori
    setupHeaderViewButtons();
    setupAisleNavigationChips();
    setupDataActions();
    setupStatusLegendInteractions();
    setupThresholdInputs();
    setupDropdownFilters();
    setupSearchInput();
    setupThemeToggle();
    setupFioriIframeSync();
    setupNicheDrawerEvents();
    setupKeyboardShortcuts();

    // 7. Refrescar estadísticas en pantalla
    updateUIStats(dataManager.getWarehouseSummary());
  }

  /* ==========================================================================
     Botones de Vista de Cámara del Encabezado
     ========================================================================== */
  function setupHeaderViewButtons() {
    const viewButtons = document.querySelectorAll('.view-btn');
    const aisleNavigatorBar = document.getElementById('aisle-navigator-bar');

    viewButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        viewButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const mode = btn.getAttribute('data-view');
        state.activeView = mode;

        if (mode === 'pasillo') {
          aisleNavigatorBar.style.display = 'flex';
          viewer3d.setCameraView('pasillo', state.selectedAisleInWalk);
        } else {
          aisleNavigatorBar.style.display = 'none';
          viewer3d.setCameraView(mode);
        }
      });
    });
  }

  /* ==========================================================================
     Navegador de Pasillos Flotante (Modo 'Entrar al Pasillo')
     ========================================================================== */
  function setupAisleNavigationChips() {
    const chips = document.querySelectorAll('.aisle-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        const aisle = chip.getAttribute('data-aisle');
        state.selectedAisleInWalk = aisle;
        viewer3d.setCameraView('pasillo', aisle);
      });
    });
  }

  /* ==========================================================================
     Acciones de Datos (Excel, Ejemplo, Plantilla)
     ========================================================================== */
  function setupDataActions() {
    const btnSample = document.getElementById('btn-sample-data');
    const btnSampleTop = document.getElementById('btn-sample-data-top');
    const btnUpload = document.getElementById('btn-upload-excel');
    const fileInput = document.getElementById('excel-file-input');
    const linkTemplate = document.getElementById('link-download-template');

    // Botones de cargar datos de ejemplo
    const loadSample = () => {
      dataManager.generateSampleWarehouse();
      viewer3d.buildRacksAndPallets();
      updateUIStats(dataManager.getWarehouseSummary());
      showNotification('1.200 nichos de ejemplo restaurados', 'info');
    };

    if (btnSample) btnSample.addEventListener('click', loadSample);
    if (btnSampleTop) btnSampleTop.addEventListener('click', loadSample);

    // Botón Cargar Excel
    if (btnUpload && fileInput) {
      btnUpload.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          excelHandler.handleFileUpload(file)
            .catch(err => {
              alert('Error al leer el archivo Excel: ' + err.message);
            });
          fileInput.value = '';
        }
      });
    }

    // Enlace Descargar Plantilla
    if (linkTemplate) {
      linkTemplate.addEventListener('click', (e) => {
        e.preventDefault();
        excelHandler.downloadExcelTemplate();
      });
    }
  }

  /* ==========================================================================
     Semáforo de Estado por Vencimiento
     ========================================================================== */
  function setupStatusLegendInteractions() {
    const legendItems = document.querySelectorAll('.status-legend-item');
    const btnSoloAlertas = document.getElementById('btn-solo-alertas');
    const btnVerTodo = document.getElementById('btn-ver-todo');

    // Clic en fila individual de la leyenda (ej. solo Vencido o solo Crítico)
    legendItems.forEach(item => {
      item.addEventListener('click', () => {
        const status = item.getAttribute('data-status');
        legendItems.forEach(i => i.classList.remove('active'));

        if (state.statusFilter === status) {
          // Deseleccionar y ver todo
          state.statusFilter = 'all';
          btnVerTodo.classList.add('active');
          btnSoloAlertas.classList.remove('active');
        } else {
          state.statusFilter = status;
          item.classList.add('active');
          btnVerTodo.classList.remove('active');
          btnSoloAlertas.classList.remove('active');
        }

        applyActiveFilters();
      });
    });

    // Botón "Solo alertas"
    if (btnSoloAlertas) {
      btnSoloAlertas.addEventListener('click', () => {
        applyStatusFilter('alerts_only');
      });
    }

    // Botón "Ver todo"
    if (btnVerTodo) {
      btnVerTodo.addEventListener('click', () => {
        applyStatusFilter('all');
      });
    }
  }

  function applyStatusFilter(filterType) {
    state.statusFilter = filterType;
    const btnSoloAlertas = document.getElementById('btn-solo-alertas');
    const btnVerTodo = document.getElementById('btn-ver-todo');
    const legendItems = document.querySelectorAll('.status-legend-item');

    legendItems.forEach(i => i.classList.remove('active'));

    if (filterType === 'alerts_only') {
      btnSoloAlertas.classList.add('active');
      btnVerTodo.classList.remove('active');
    } else if (filterType === 'all') {
      btnVerTodo.classList.add('active');
      btnSoloAlertas.classList.remove('active');
    }

    applyActiveFilters();
  }

  /* ==========================================================================
     Inputs de Umbrales de Días (30 días crítico / 90 días por vencer)
     ========================================================================== */
  function setupThresholdInputs() {
    const inputCritico = document.getElementById('input-threshold-critico');
    const inputPorVencer = document.getElementById('input-threshold-por-vencer');

    const handleThresholdChange = () => {
      const c = parseInt(inputCritico.value, 10) || 30;
      const pv = parseInt(inputPorVencer.value, 10) || 90;

      const summary = dataManager.recalculateAll(c, pv);
      viewer3d.updateNicheColors();
      updateUIStats(summary);
    };

    if (inputCritico) inputCritico.addEventListener('change', handleThresholdChange);
    if (inputPorVencer) inputPorVencer.addEventListener('change', handleThresholdChange);
  }

  /* ==========================================================================
     Filtros Desplegables (Pasillo y Nivel)
     ========================================================================== */
  function setupDropdownFilters() {
    const selectPasillo = document.getElementById('select-filter-pasillo');
    const selectNivel = document.getElementById('select-filter-nivel');

    if (selectPasillo) {
      selectPasillo.addEventListener('change', (e) => {
        state.aisleFilter = e.target.value;
        applyActiveFilters();
      });
    }

    if (selectNivel) {
      selectNivel.addEventListener('change', (e) => {
        state.levelFilter = e.target.value;
        applyActiveFilters();
      });
    }
  }

  /* ==========================================================================
     Buscador Inteligente de Producto / SKU / Lote / Ubicación
     ========================================================================== */
  function setupSearchInput() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    let debounceTimer = null;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        state.searchQuery = e.target.value;
        applyActiveFilters();

        // Si hay una coincidencia exacta de nicho (ej. A-01-2), enfocarlo
        if (state.searchQuery.trim()) {
          const results = dataManager.search(state.searchQuery.trim());
          if (results.length === 1) {
            viewer3d.selectNiche(results[0].nicheId);
          }
        }
      }, 250);
    });
  }

  function applyActiveFilters() {
    viewer3d.applyFilters({
      statusFilter: state.statusFilter,
      aisleFilter: state.aisleFilter,
      levelFilter: state.levelFilter,
      searchQuery: state.searchQuery
    });
  }

  /* ==========================================================================
     Actualización de Estadísticas y Contadores en Pantalla
     ========================================================================== */
  function updateUIStats(summary) {
    if (!summary) return;

    // Actualizar contadores del semáforo
    document.getElementById('count-vencido').textContent = summary.counts.vencido;
    document.getElementById('count-critico').textContent = summary.counts.critico;
    document.getElementById('count-por_vencer').textContent = summary.counts.por_vencer;
    document.getElementById('count-vigente').textContent = summary.counts.vigente;
    document.getElementById('count-sin_fecha').textContent = summary.counts.sin_fecha;
    document.getElementById('count-vacio').textContent = summary.counts.vacio;

    // Actualizar ocupación
    const textOccupancy = `${summary.ocupados.toLocaleString()} de ${summary.totalNichos.toLocaleString()} nichos ocupados (${summary.ocupacionPct}%)`;
    const elemOccupancy = document.getElementById('occupancy-summary-text');
    if (elemOccupancy) elemOccupancy.textContent = textOccupancy;

    const barFill = document.getElementById('occupancy-bar-fill');
    if (barFill) barFill.style.width = `${summary.ocupacionPct}%`;

    // Ticker superior
    const ticker = document.getElementById('shell-specs-ticker');
    if (ticker) {
      ticker.textContent = `10 pasillos · 26 columnas · 4 niveles · ${summary.totalNichos.toLocaleString()} nichos · 2.400 paletas · nave 65.4 x 43 m · inck 10.2 m`;
    }
  }

  /* ==========================================================================
     Panel Lateral de Detalle de Nicho Seleccionado
     ========================================================================== */
  function openNicheDetailDrawer(niche) {
    const drawer = document.getElementById('niche-detail-drawer');
    if (!drawer || !niche) return;

    document.getElementById('drawer-niche-id').textContent = niche.id;
    document.getElementById('drawer-niche-desc').textContent = `Pasillo ${niche.pasillo} · Columna ${niche.columna} · Nivel ${niche.nivel}`;

    const itemsContainer = document.getElementById('drawer-items-list');
    itemsContainer.innerHTML = '';

    if (!niche.items || niche.items.length === 0) {
      itemsContainer.innerHTML = `
        <div class="item-card">
          <div class="item-card-title">Nicho Vacío / Disponible</div>
          <p style="font-size:12px; color:var(--sap-text-secondary); margin-top:6px;">
            Este nicho cuenta con capacidad para 2 paletas europeas estándar (1.20 x 0.80 m).
          </p>
          <button class="sap-btn-secondary" style="width:100%; margin-top:12px;" onclick="alert('Iniciando orden de entrada a ${niche.id}...')">
            📥 Asignar Paleta de Entrada (MIGO)
          </button>
        </div>
      `;
    } else {
      niche.items.forEach(item => {
        const evalRes = dataManager.evaluateItemStatus(item);
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
          <div class="item-card-title">${item.nombre}</div>
          <span class="item-status-pill status-${evalRes.status}">${evalRes.statusLabel}</span>
          <div class="item-grid">
            <div>
              <div class="item-field-label">SKU / Material</div>
              <div class="item-field-val">${item.sku}</div>
            </div>
            <div>
              <div class="item-field-label">Stock en Nicho</div>
              <div class="item-field-val">${item.stock} ${item.unidad}</div>
            </div>
            <div>
              <div class="item-field-label">Número de Lote</div>
              <div class="item-field-val">${item.lote}</div>
            </div>
            <div>
              <div class="item-field-label">Fecha Vencimiento</div>
              <div class="item-field-val">${item.fechaVencimiento || 'Sin caducidad'}</div>
            </div>
          </div>
          <div style="display:flex; gap:6px; margin-top:12px;">
            <button class="sap-btn-secondary" style="flex:1;" onclick="alert('Generando Orden de Transporte (LT01) para lote ${item.lote}...')">
              🔄 Crear OT
            </button>
            <button class="sap-btn-secondary" style="flex:1;" onclick="alert('Bloqueando lote ${item.lote} en SAP S/4HANA...')">
              🚫 Bloquear
            </button>
          </div>
        `;
        itemsContainer.appendChild(card);
      });
    }

    drawer.classList.add('open');
  }

  function setupNicheDrawerEvents() {
    const btnClose = document.getElementById('btn-close-niche-drawer');
    if (btnClose) {
      btnClose.addEventListener('click', () => {
        const drawer = document.getElementById('niche-detail-drawer');
        if (drawer) drawer.classList.remove('open');
        if (viewer3d && viewer3d.selectionBox) {
          viewer3d.selectionBox.visible = false;
        }
      });
    }
  }

  /* ==========================================================================
     Soporte de Temas SAP Fiori Horizon (Morning vs Evening Horizon)
     ========================================================================== */
  function setupThemeToggle() {
    const themeBtn = document.getElementById('btn-theme-toggle');
    if (!themeBtn) return;

    themeBtn.addEventListener('click', () => {
      const isCurrentlyDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const newTheme = isCurrentlyDark ? 'light' : 'dark';
      applyTheme(newTheme);
    });
  }

  function applyTheme(theme) {
    state.currentTheme = theme;
    const isDark = (theme === 'dark' || theme === 'evening' || theme === 'sap_horizon_dark');
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');

    const themeBtn = document.getElementById('btn-theme-toggle');
    if (themeBtn) {
      themeBtn.innerHTML = isDark ? '🌙' : '☀️';
      themeBtn.title = isDark ? 'Cambiar a Morning Horizon' : 'Cambiar a Evening Horizon';
    }

    if (viewer3d) {
      viewer3d.applyTheme(theme);
    }
  }

  /* Sincronización postMessage para SAP Fiori Launchpad iframe */
  function setupFioriIframeSync() {
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SET_THEME') {
        applyTheme(event.data.theme);
      }
    });
  }

  /* Atajos de Teclado */
  function setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'Escape') {
        const drawer = document.getElementById('niche-detail-drawer');
        if (drawer) drawer.classList.remove('open');
        if (jouleAssistant) jouleAssistant.close();
      } else if (e.key === '1') {
        document.querySelector('.view-btn[data-view="general"]')?.click();
      } else if (e.key === '2') {
        document.querySelector('.view-btn[data-view="planta"]')?.click();
      } else if (e.key === '3') {
        document.querySelector('.view-btn[data-view="stage"]')?.click();
      } else if (e.key === '4') {
        document.querySelector('.view-btn[data-view="pasillo"]')?.click();
      } else if (e.key === 'ArrowRight' && state.activeView === 'pasillo') {
        viewer3d.navigateAisle('next');
      } else if (e.key === 'ArrowLeft' && state.activeView === 'pasillo') {
        viewer3d.navigateAisle('prev');
      }
    });
  }

  function showNotification(msg, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 64px;
      left: 50%;
      transform: translateX(-50%);
      background: #182029;
      color: #fff;
      padding: 8px 18px;
      border-radius: 20px;
      font-size: 12.5px;
      font-weight: 600;
      z-index: 9999;
      box-shadow: 0 4px 14px rgba(0,0,0,0.25);
      border: 1px solid rgba(255,255,255,0.15);
      animation: fadeIn 0.2s ease;
    `;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2800);
  }
})();
