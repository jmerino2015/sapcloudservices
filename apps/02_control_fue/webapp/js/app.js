/* ==========================================================================
   SAP FIORI HORIZON APPLICATION MAIN COORDINATOR & CONTROLLER
   ========================================================================== */

let fueManager = null;
let currentTheme = 'morning'; // morning = Light, evening = Dark
let editingUserId = null;

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inicializar Gestor de FUE
  fueManager = new FUEManager(INITIAL_FUE_CONTRACT, INITIAL_USERS);

  // 2. Configurar Navegación de Pestañas y Eventos
  setupNavigation();
  setupThemeToggle();
  setupModalHandlers();
  setupSimulatorControls();

  // 3. Renderizar Vista Inicial (Dashboard)
  refreshUI();

  console.log("SAP Fiori Horizon - Control de Usuarios & Medición FUE Inicializado Correctamente.");
});

// Re-renderizar toda la UI cuando cambian datos o filtros
function refreshUI() {
  const metrics = fueManager.calculateMetrics();

  // Actualizar Tarjetas KPI de la Cabecera y Dashboard
  updateKPICards(metrics);

  // Actualizar Medidor FUE Visual
  updateFUEMeter(metrics);

  // Actualizar Tabla de Usuarios
  renderUserTable(fueManager);

  // Actualizar Gráficos Analíticos
  renderDashboardCharts(fueManager);

  // Actualizar Datos de Auditoría
  updateAuditReportCards(metrics);
}

// --------------------------------------------------------------------------
// 1. TARJETAS KPI & METRICAS
// --------------------------------------------------------------------------
function updateKPICards(metrics) {
  // FUE Consumido
  const elFueVal = document.getElementById('kpiFueConsumedVal');
  const elFueMax = document.getElementById('kpiFueContractMax');
  if (elFueVal) elFueVal.textContent = metrics.totalConsumedFUE.toFixed(2);
  if (elFueMax) elFueMax.textContent = `de ${metrics.contractedFUE.toFixed(1)} FUE contratados`;

  // % de Uso de Contrato
  const elFuePct = document.getElementById('kpiFuePercentageVal');
  const elFueStatusTag = document.getElementById('kpiFueStatusTag');
  if (elFuePct) elFuePct.textContent = `${metrics.usagePercentage}%`;
  
  if (elFueStatusTag) {
    elFueStatusTag.textContent = metrics.statusLabel;
    elFueStatusTag.className = `sap-status-tag ${metrics.statusState === 'normal' ? 'positive' : metrics.statusState === 'warning' ? 'critical' : 'negative'}`;
  }

  // Licencias Activas
  const elUsersActive = document.getElementById('kpiActiveUsersVal');
  if (elUsersActive) elUsersActive.textContent = metrics.totalActiveUsers;

  // Costo Mensual Estimado
  const elMonthlyCost = document.getElementById('kpiMonthlyCostVal');
  if (elMonthlyCost) elMonthlyCost.textContent = `$${metrics.totalMonthlyCost.toLocaleString()}`;

  // Oportunidad de Ahorro
  const s = metrics.savingsReport;
  const elSavingsVal = document.getElementById('kpiPotentialSavingsVal');
  if (elSavingsVal) elSavingsVal.textContent = `$${s.totalPotentialUSD.toLocaleString()} /mes`;
}

function updateFUEMeter(metrics) {
  const progressBar = document.getElementById('fueProgressBarFill');
  const progressText = document.getElementById('fueProgressPercentText');
  const valCurrent = document.getElementById('fueMeterCurrent');
  const valRemaining = document.getElementById('fueMeterRemaining');

  if (progressBar) {
    const pct = Math.min(metrics.usagePercentage, 100);
    progressBar.style.width = `${pct}%`;
    progressBar.className = `sap-progress-bar-fill ${metrics.statusState}`;
  }

  if (progressText) progressText.textContent = `${metrics.usagePercentage}% Ocupado`;
  if (valCurrent) valCurrent.textContent = `${metrics.totalConsumedFUE.toFixed(2)} FUE`;
  if (valRemaining) valRemaining.textContent = `${metrics.remainingFUE.toFixed(2)} FUE`;
}

function updateAuditReportCards(metrics) {
  const s = metrics.savingsReport;
  const elInactiveCount = document.getElementById('auditInactiveCount');
  const elInactiveUSD = document.getElementById('auditInactiveUSD');
  const elReclassCount = document.getElementById('auditReclassCount');
  const elReclassUSD = document.getElementById('auditReclassUSD');

  if (elInactiveCount) elInactiveCount.textContent = `${s.inactiveUsersCount} usuarios inactivos`;
  if (elInactiveUSD) elInactiveUSD.textContent = `$${s.recoverableInactiveCost.toLocaleString()}/mes`;
  if (elReclassCount) elReclassCount.textContent = `${s.reclassifiableUsersCount} usuarios sobredimensionados`;
  if (elReclassUSD) elReclassUSD.textContent = `$${s.reclassifiableCost.toLocaleString()}/mes`;
}

// --------------------------------------------------------------------------
// 2. NAVEGACION Y CAMBIO DE VISTAS
// --------------------------------------------------------------------------
function setupNavigation() {
  const navItems = document.querySelectorAll('.sap-nav-item');
  const views = document.querySelectorAll('.sap-view-section');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetViewId = item.getAttribute('data-view');
      if (!targetViewId) return;

      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      views.forEach(v => {
        if (v.id === targetViewId) {
          v.style.display = 'block';
        } else {
          v.style.display = 'none';
        }
      });

      // Refrescar gráficos si entra a Dashboard o Medicion
      if (targetViewId === 'dashboardView' || targetViewId === 'fueMeasurementView' || targetViewId === 'reportsView') {
        setTimeout(() => renderDashboardCharts(fueManager), 50);
      }
    });
  });

  // Alternar Colapso de Sidebar
  const btnToggleSidebar = document.getElementById('btnToggleSidebar');
  const sidebar = document.querySelector('.sap-sidebar');
  if (btnToggleSidebar && sidebar) {
    btnToggleSidebar.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
    });
  }
}

// --------------------------------------------------------------------------
// 3. CAMBIO DE TEMA SAP FIORI HORIZON (MORNING vs EVENING)
// --------------------------------------------------------------------------
function setupThemeToggle() {
  const btnTheme = document.getElementById('btnThemeToggle');
  const themeLabel = document.getElementById('themeToggleLabel');

  if (btnTheme) {
    btnTheme.addEventListener('click', () => {
      currentTheme = currentTheme === 'morning' ? 'evening' : 'morning';
      document.documentElement.setAttribute('data-theme', currentTheme);
      
      if (themeLabel) {
        themeLabel.textContent = currentTheme === 'morning' ? 'Morning Horizon' : 'Evening Horizon';
      }

      showToast(`Tema cambiado a SAP ${currentTheme === 'morning' ? 'Morning' : 'Evening'} Horizon`, 'info');
      
      // Re-renderizar gráficos para adaptar colores
      setTimeout(() => renderDashboardCharts(fueManager), 100);
    });
  }
}

// --------------------------------------------------------------------------
// 4. MOTOR DE SIMULACION WHAT-IF
// --------------------------------------------------------------------------
function setupSimulatorControls() {
  const simDev = document.getElementById('simQtyDeveloper');
  const simAdv = document.getElementById('simQtyAdvanced');
  const simCore = document.getElementById('simQtyCore');
  const simSelf = document.getElementById('simQtySelfService');

  const inputs = [simDev, simAdv, simCore, simSelf];

  inputs.forEach(input => {
    if (input) {
      input.addEventListener('input', runSimulation);
    }
  });

  const btnReset = document.getElementById('btnResetSim');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      inputs.forEach(inp => { if (inp) inp.value = 0; });
      runSimulation();
    });
  }
}

function runSimulation() {
  const deltas = {
    Developer: parseInt(document.getElementById('simQtyDeveloper')?.value || 0, 10),
    Advanced: parseInt(document.getElementById('simQtyAdvanced')?.value || 0, 10),
    Core: parseInt(document.getElementById('simQtyCore')?.value || 0, 10),
    SelfService: parseInt(document.getElementById('simQtySelfService')?.value || 0, 10)
  };

  const res = fueManager.simulateScenario(deltas);

  const elSimFue = document.getElementById('simResultFUE');
  const elSimPct = document.getElementById('simResultPct');
  const elSimCostDiff = document.getElementById('simResultCostDiff');
  const elSimStatus = document.getElementById('simResultStatus');

  if (elSimFue) elSimFue.textContent = `${res.simulatedFUE.toFixed(2)} FUE (${res.deltaFUE >= 0 ? '+' : ''}${res.deltaFUE.toFixed(2)})`;
  if (elSimPct) elSimPct.textContent = `${res.simulatedPercentage}% del Contrato`;
  
  if (elSimCostDiff) {
    const sign = res.costDiff >= 0 ? '+' : '';
    elSimCostDiff.textContent = `${sign}$${res.costDiff.toLocaleString()} USD/mes`;
    elSimCostDiff.style.color = res.costDiff > 0 ? 'var(--sapNegativeColor)' : res.costDiff < 0 ? 'var(--sapPositiveColor)' : 'inherit';
  }

  if (elSimStatus) {
    let text = "Dentro de Capacidad";
    let badgeClass = "positive";
    if (res.simStatus === "critical") { text = "CRÍTICO: Supera Contrato"; badgeClass = "negative"; }
    else if (res.simStatus === "warning") { text = "ALERTA: Próximo al Máximo"; badgeClass = "critical"; }

    elSimStatus.textContent = text;
    elSimStatus.className = `sap-status-tag ${badgeClass}`;
  }
}

// --------------------------------------------------------------------------
// 5. MODALES Y ACCIONES
// --------------------------------------------------------------------------
function setupModalHandlers() {
  // Modal de Crear / Editar Usuario
  const modalOverlay = document.getElementById('userModalOverlay');
  const btnNewUser = document.getElementById('btnOpenNewUserModal');
  const btnCloseModal = document.getElementById('btnCloseUserModal');
  const btnCancelModal = document.getElementById('btnCancelUserModal');
  const formUser = document.getElementById('formUserModal');

  if (btnNewUser) {
    btnNewUser.addEventListener('click', () => openCreateUserModal());
  }

  if (btnCloseModal) btnCloseModal.addEventListener('click', () => closeModal());
  if (btnCancelModal) btnCancelModal.addEventListener('click', () => closeModal());

  if (formUser) {
    formUser.addEventListener('submit', (e) => {
      e.preventDefault();
      saveUserData();
    });
  }

  // Acción masiva de Reclamar Licencias Inactivas
  const btnBulkReclaim = document.getElementById('btnBulkReclaimInactive');
  if (btnBulkReclaim) {
    btnBulkReclaim.addEventListener('click', () => executeBulkReclaim());
  }

  // Exportar CSV
  const btnExportCSV = document.getElementById('btnExportCSV');
  if (btnExportCSV) {
    btnExportCSV.addEventListener('click', () => {
      exportUsersReport(fueManager.users, fueManager);
      showToast("Reporte de usuarios exportado exitosamente a CSV.", "success");
    });
  }
}

function openCreateUserModal() {
  editingUserId = null;
  document.getElementById('modalTitle').textContent = 'Crear Nuevo Usuario SAP';
  document.getElementById('formUserModal').reset();
  document.getElementById('userModalOverlay').classList.add('active');
}

function openEditUserModal(userId) {
  const user = fueManager.users.find(u => u.id === userId);
  if (!user) return;

  editingUserId = userId;
  document.getElementById('modalTitle').textContent = `Editar Usuario: ${user.username}`;
  
  document.getElementById('modalFullName').value = user.fullName;
  document.getElementById('modalUsername').value = user.username;
  document.getElementById('modalEmail').value = user.email;
  document.getElementById('modalDepartment').value = user.department;
  document.getElementById('modalLicenseType').value = user.licenseType;
  document.getElementById('modalStatus').value = user.status;
  document.getElementById('modalSystem').value = user.system;

  document.getElementById('userModalOverlay').classList.add('active');
}

function closeModal() {
  document.getElementById('userModalOverlay').classList.remove('active');
}

function saveUserData() {
  const fullName = document.getElementById('modalFullName').value;
  const username = document.getElementById('modalUsername').value;
  const email = document.getElementById('modalEmail').value;
  const department = document.getElementById('modalDepartment').value;
  const licenseType = document.getElementById('modalLicenseType').value;
  const status = document.getElementById('modalStatus').value;
  const system = document.getElementById('modalSystem').value;

  if (editingUserId) {
    // Editar existente
    const u = fueManager.users.find(x => x.id === editingUserId);
    if (u) {
      u.fullName = fullName;
      u.username = username;
      u.email = email;
      u.department = department;
      u.licenseType = licenseType;
      u.status = status;
      u.system = system;

      // Si cambia de inactivo a activo, limpiar dias inactivo
      if (status === 'Active') u.daysInactive = 0;
      u.optimizationSuggested = null; // Re-evaluar
    }
    showToast(`Usuario ${username} actualizado.`, 'success');
  } else {
    // Crear nuevo
    const newId = `US-${1000 + fueManager.users.length + 1}`;
    fueManager.users.unshift({
      id: newId,
      username,
      fullName,
      email,
      department,
      costCenter: `CC-1090 (${department.substring(0, 8)})`,
      system,
      licenseType,
      status,
      lastLogin: new Date().toISOString().slice(0, 10),
      daysInactive: 0,
      assignedRoles: ["SAP_BR_STANDARD_USER"],
      optimizationSuggested: null
    });
    showToast(`Usuario ${username} creado exitosamente.`, 'success');
  }

  closeModal();
  refreshUI();
}

function executeBulkReclaim() {
  let count = 0;
  fueManager.users.forEach(u => {
    if (u.status === 'Inactive' && u.optimizationSuggested && u.optimizationSuggested.includes('Reclamar Licencia')) {
      u.licenseType = 'SelfService'; // O cambiar a desasignado
      u.optimizationSuggested = 'Licencia Reclamada';
      count++;
    }
  });

  if (count > 0) {
    showToast(`Se han liberado las licencias de ${count} usuarios inactivos.`, 'success');
    refreshUI();
  } else {
    showToast('No se encontraron licencias inactivas pendientes por liberar.', 'info');
  }
}

// --------------------------------------------------------------------------
// 6. NOTIFICACIONES TOAST (ESTILO SAP FIORI TOAST)
// --------------------------------------------------------------------------
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `sap-toast ${type}`;
  
  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  else if (type === 'warning') icon = '⚠️';
  else if (type === 'error') icon = '❌';

  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
