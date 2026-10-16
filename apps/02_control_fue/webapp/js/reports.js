/* ==========================================================================
   SAP FIORI HORIZON AUDIT REPORTS & CHART VISUALIZATION MODULE
   Includes SAP Standard Reports: SLIM_DCH, S_BCE_68001393, SLIM_UCH, SUIM
   ========================================================================== */

let fueDistributionChart = null;
let fueDepartmentChart = null;
let fueTrendChart = null;

const FioriColors = {
  blue: '#0064d9',
  green: '#107e3e',
  orange: '#d97008',
  red: '#b90000',
  teal: '#0a6ed1',
  purple: '#6f42c1',
  gray: '#6a7d92'
};

// Renderizar todos los gráficos en la vista Dashboard
function renderDashboardCharts(fueManager) {
  if (typeof Chart === 'undefined') return;

  const metrics = fueManager.calculateMetrics();

  renderDistributionChart(metrics);
  renderDepartmentChart(fueManager);
  renderTrendChart(metrics.contractedFUE);

  // Renderizar también las tablas de reportes estándar SAP
  renderSlimDchTable();
  renderSBceTable();
  renderSlimUchTable();
  renderSuimViews();
}

function renderDistributionChart(metrics) {
  const ctx = document.getElementById('chartFueDistribution');
  if (!ctx) return;

  if (fueDistributionChart) fueDistributionChart.destroy();
  const b = metrics.breakdown;

  fueDistributionChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Developer (1.0 FUE)', 'Advanced (1.0 FUE)', 'Core (0.25 FUE)', 'Self-Service (0.05 FUE)'],
      datasets: [{
        data: [b.Developer.fue, b.Advanced.fue, b.Core.fue, b.SelfService.fue],
        backgroundColor: [FioriColors.purple, FioriColors.blue, FioriColors.green, FioriColors.teal],
        borderWidth: 2,
        borderColor: 'transparent'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { font: { family: '72, sans-serif', size: 12 }, padding: 16 } },
        tooltip: {
          callbacks: {
            label: function(ctx) { return `${ctx.label}: ${ctx.raw.toFixed(2)} FUE`; }
          }
        }
      },
      cutout: '70%'
    }
  });
}

function renderDepartmentChart(fueManager) {
  const ctx = document.getElementById('chartFueDepartment');
  if (!ctx) return;

  if (fueDepartmentChart) fueDepartmentChart.destroy();

  const deptMap = {};
  fueManager.users.forEach(u => {
    if (u.status === 'Active') {
      const dept = u.department || 'Otros';
      const ratio = fueManager.getRatio(u.licenseType);
      deptMap[dept] = (deptMap[dept] || 0) + ratio;
    }
  });

  const labels = Object.keys(deptMap);
  const dataValues = labels.map(k => Math.round(deptMap[k] * 100) / 100);

  fueDepartmentChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Consumo FUE Activo',
        data: dataValues,
        backgroundColor: FioriColors.blue,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { font: { family: '72, sans-serif', size: 11 } }, grid: { display: false } },
        y: { beginAtZero: true, ticks: { font: { family: '72, sans-serif', size: 11 } }, grid: { color: 'rgba(0,0,0,0.05)' } }
      }
    }
  });
}

function renderTrendChart(contractedFUE) {
  const ctx = document.getElementById('chartFueTrend');
  if (!ctx) return;

  if (fueTrendChart) fueTrendChart.destroy();

  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep (Actual)'];
  const historicalFUE = [105.5, 108.0, 112.5, 118.2, 122.0, 126.5, 131.0, 133.5, 137.45];
  const contractLimit = Array(months.length).fill(contractedFUE);

  fueTrendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [
        {
          label: 'FUE Consumido Real',
          data: historicalFUE,
          borderColor: FioriColors.blue,
          backgroundColor: 'rgba(0, 100, 217, 0.1)',
          fill: true,
          tension: 0.3,
          borderWidth: 3
        },
        {
          label: 'Límite de Contrato',
          data: contractLimit,
          borderColor: FioriColors.red,
          borderDash: [6, 6],
          borderWidth: 2,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } },
      scales: { y: { beginAtZero: false, min: 80, max: Math.ceil(contractedFUE * 1.1) } }
    }
  });
}

// ==========================================================================
// RENDERIZADO DE REPORTES ESTÁNDAR SAP
// ==========================================================================

// 1. RENDER SLIM_DCH
function renderSlimDchTable() {
  const tbody = document.getElementById('slimDchTableBody');
  if (!tbody || typeof DEMO_SLIM_DCH === 'undefined') return;

  let html = '';
  DEMO_SLIM_DCH.forEach(item => {
    html += `
      <tr>
        <td><strong>${item.measurementId}</strong></td>
        <td>${item.measurementDate}</td>
        <td><span class="sap-status-tag information">${item.systemId}</span></td>
        <td>${item.sapRelease}</td>
        <td>${item.totalUsersMeasured} (${item.activeUsersCount} activos)</td>
        <td><strong>${item.totalFUEConsumed.toFixed(2)} FUE</strong></td>
        <td><span class="sap-status-tag ${item.statusBadge}">${item.complianceStatus}</span></td>
        <td>${item.measuredBy}</td>
      </tr>
    `;
  });
  tbody.innerHTML = html;
}

// 2. RENDER S_BCE_68001393
function renderSBceTable() {
  const tbody = document.getElementById('sbceTableBody');
  if (!tbody || typeof DEMO_S_BCE_68001393 === 'undefined') return;

  let html = '';
  DEMO_S_BCE_68001393.forEach(item => {
    const badge = item.riskLevel === 'HIGH' ? 'negative' : item.riskLevel === 'MEDIUM' ? 'critical' : 'positive';
    html += `
      <tr>
        <td>
          <div style="font-weight: 700;">${item.username}</div>
          <div style="font-size: 11px; color: var(--sapSubTextColor);">${item.fullName}</div>
        </td>
        <td>${item.department}</td>
        <td><code>${item.authorizationObject}</code></td>
        <td><span class="sap-status-tag information">${item.tcodeExecuted}</span></td>
        <td><span class="sap-status-tag ${badge}">${item.riskLevel}</span></td>
        <td style="font-size: 12px;">${item.riskDescription}</td>
        <td style="font-size: 12px; color: var(--sapSubTextColor);">${item.lastExecuted}</td>
      </tr>
    `;
  });
  tbody.innerHTML = html;
}

// 3. RENDER SLIM_UCH
function renderSlimUchTable() {
  const tbody = document.getElementById('slimUchTableBody');
  if (!tbody || typeof DEMO_SLIM_UCH === 'undefined') return;

  let html = '';
  DEMO_SLIM_UCH.forEach(item => {
    const isSave = item.fueDelta <= 0;
    const badge = isSave ? 'positive' : 'critical';
    const deltaStr = isSave ? `${item.fueDelta.toFixed(2)} FUE` : `+${item.fueDelta.toFixed(2)} FUE`;

    html += `
      <tr>
        <td><strong>${item.changeId}</strong></td>
        <td style="font-size: 12px;">${item.timestamp}</td>
        <td>
          <div style="font-weight: 600;">${item.username}</div>
          <div style="font-size: 11px; color: var(--sapSubTextColor);">${item.fullName}</div>
        </td>
        <td><span class="sap-status-tag neutral">${item.previousLicense}</span></td>
        <td><span class="sap-status-tag information">${item.newLicense}</span></td>
        <td><span class="sap-status-tag ${badge}">${deltaStr}</span></td>
        <td><strong style="color: ${isSave ? 'var(--sapPositiveColor)' : 'inherit'};">$${Math.abs(item.costSavingsUSD).toFixed(2)}/mes</strong></td>
        <td>${item.reason}</td>
      </tr>
    `;
  });
  tbody.innerHTML = html;
}

// 4. RENDER SUIM VIEWS
function renderSuimViews() {
  // Roles Summary
  const tbodyRoles = document.getElementById('suimRolesTableBody');
  if (tbodyRoles && typeof DEMO_SUIM !== 'undefined') {
    let html = '';
    DEMO_SUIM.rolesSummary.forEach(r => {
      const badge = r.riskLevel === 'HIGH' ? 'negative' : r.riskLevel === 'MEDIUM' ? 'critical' : 'positive';
      html += `
        <tr>
          <td><code>${r.roleName}</code></td>
          <td>${r.description}</td>
          <td><strong>${r.userCount} usuarios</strong></td>
          <td><span class="sap-status-tag ${badge}">${r.riskLevel}</span></td>
        </tr>
      `;
    });
    tbodyRoles.innerHTML = html;
  }

  // SoD Risks Summary
  const tbodySod = document.getElementById('suimSodTableBody');
  if (tbodySod && typeof DEMO_SUIM !== 'undefined') {
    let html = '';
    DEMO_SUIM.sodRisks.forEach(s => {
      const badge = s.severity === 'CRITICAL' ? 'negative' : 'critical';
      html += `
        <tr>
          <td><strong>${s.riskId}</strong></td>
          <td>${s.businessProcess}</td>
          <td><code style="color: var(--sapNegativeColor);">${s.conflictingTCodes}</code></td>
          <td>${s.affectedUsers.join(', ')}</td>
          <td><span class="sap-status-tag ${badge}">${s.severity}</span></td>
        </tr>
      `;
    });
    tbodySod.innerHTML = html;
  }
}

// Exportar Datos a CSV
function exportToCSV(filename, rows) {
  let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
  rows.forEach(row => {
    const rowStr = row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",");
    csvContent += rowStr + "\r\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportUsersReport(users, fueManager) {
  const headers = [
    "ID Usuario", "Nombre Usuario SAP", "Nombre Completo", "Email", "Departamento",
    "Centro Costos", "Sistema SAP", "Tipo Licencia", "FUE Consumido", "Costo Mensual (USD)",
    "Estado", "Último Acceso", "Días Inactivo", "Sugerencia Optimización"
  ];

  const rows = [headers];
  users.forEach(u => {
    const ratio = fueManager.getRatio(u.licenseType);
    const isAct = u.status === 'Active';
    const fueVal = isAct ? ratio : 0;
    const costVal = fueVal * fueManager.contract.costPerFUE;

    rows.push([
      u.id, u.username, u.fullName, u.email, u.department,
      u.costCenter, u.system, u.licenseType, fueVal.toFixed(2), costVal.toFixed(2),
      u.status === 'Active' ? 'Activo' : 'Inactivo', u.lastLogin, u.daysInactive,
      u.optimizationSuggested || 'Ninguna (Óptimo)'
    ]);
  });

  const timestamp = new Date().toISOString().slice(0, 10);
  exportToCSV(`Reporte_Usuarios_Licencias_SAP_${timestamp}.csv`, rows);
}
