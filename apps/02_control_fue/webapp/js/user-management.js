/* ==========================================================================
   SAP FIORI USER MANAGEMENT & LICENSE ASSIGNMENT MODULE
   ========================================================================== */

let currentSearchQuery = '';
let currentFilterStatus = 'ALL';
let currentFilterLicense = 'ALL';
let currentFilterSystem = 'ALL';
let currentFilterOptimization = 'ALL';
let currentPage = 1;
const PAGE_SIZE = 10;

function initUserManagement(fueManager) {
  renderUserTable(fueManager);
  setupTableEventListeners(fueManager);
}

function filterUsers(fueManager) {
  return fueManager.users.filter(u => {
    // 1. Filtro de Búsqueda por texto (Nombre, Username, Email, ID, Departamento)
    if (currentSearchQuery) {
      const q = currentSearchQuery.toLowerCase();
      const matchText = (
        u.fullName.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q) ||
        u.costCenter.toLowerCase().includes(q)
      );
      if (!matchText) return false;
    }

    // 2. Filtro por Estado
    if (currentFilterStatus !== 'ALL' && u.status !== currentFilterStatus) {
      return false;
    }

    // 3. Filtro por Tipo de Licencia
    if (currentFilterLicense !== 'ALL' && u.licenseType !== currentFilterLicense) {
      return false;
    }

    // 4. Filtro por Sistema SAP
    if (currentFilterSystem !== 'ALL' && u.system !== currentFilterSystem) {
      return false;
    }

    // 5. Filtro por Optimización
    if (currentFilterOptimization === 'NEED_ACTION' && !u.optimizationSuggested) {
      return false;
    }

    return true;
  });
}

function renderUserTable(fueManager) {
  const tbody = document.getElementById('userTableBody');
  const countBadge = document.getElementById('userCountBadge');
  if (!tbody) return;

  const filtered = filterUsers(fueManager);

  if (countBadge) {
    countBadge.textContent = `${filtered.length} usuarios`;
  }

  // Paginación
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  if (currentPage > totalPages) currentPage = totalPages;
  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const pageUsers = filtered.slice(startIdx, startIdx + PAGE_SIZE);

  if (pageUsers.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 32px; color: var(--sapSubTextColor);">
          <i class="sap-icon" style="font-size: 24px; display: block; margin-bottom: 8px;">🔍</i>
          No se encontraron usuarios que coincidan con los criterios de búsqueda.
        </td>
      </tr>
    `;
    updatePaginationControls(0, 0, 0);
    return;
  }

  let html = '';
  pageUsers.forEach(u => {
    const isAct = u.status === 'Active';
    const ratio = fueManager.getRatio(u.licenseType);
    const userFUE = isAct ? ratio : 0.0;
    const userCost = userFUE * fueManager.contract.costPerFUE;

    let licenseBadgeClass = 'information';
    if (u.licenseType === 'Developer') licenseBadgeClass = 'negative';
    else if (u.licenseType === 'Advanced') licenseBadgeClass = 'critical';
    else if (u.licenseType === 'Core') licenseBadgeClass = 'information';
    else if (u.licenseType === 'SelfService') licenseBadgeClass = 'positive';

    let statusBadge = isAct 
      ? `<span class="sap-status-tag positive"><span class="sap-status-dot"></span>Activo</span>`
      : `<span class="sap-status-tag negative"><span class="sap-status-dot"></span>Inactivo</span>`;

    let optTag = u.optimizationSuggested
      ? `<span class="sap-status-tag critical" style="font-size: 10.5px;" title="${u.optimizationSuggested}">⚠️ ${u.optimizationSuggested}</span>`
      : `<span style="color: var(--sapSubTextColor); font-size: 12px;">Óptimo</span>`;

    html += `
      <tr>
        <td><strong>${u.id}</strong></td>
        <td>
          <div style="font-weight: 600;">${u.fullName}</div>
          <div style="font-size: 11px; color: var(--sapSubTextColor);">${u.username} • ${u.email}</div>
        </td>
        <td>${u.department}</td>
        <td><span class="sap-status-tag ${licenseBadgeClass}">${u.licenseType}</span></td>
        <td><strong>${userFUE.toFixed(2)} FUE</strong></td>
        <td>$${userCost.toFixed(2)} /mes</td>
        <td>${statusBadge}</td>
        <td>${optTag}</td>
        <td style="text-align: right;">
          <button class="sap-btn sap-btn-ghost sap-btn-sm" onclick="openEditUserModal('${u.id}')">
            ✏️ Editar
          </button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
  updatePaginationControls(filtered.length, startIdx + 1, Math.min(startIdx + PAGE_SIZE, filtered.length));
}

function updatePaginationControls(total, from, to) {
  const info = document.getElementById('paginationInfo');
  const btnPrev = document.getElementById('btnPrevPage');
  const btnNext = document.getElementById('btnNextPage');

  if (info) info.textContent = total > 0 ? `Mostrando ${from}-${to} de ${total}` : 'Sin datos';
  if (btnPrev) btnPrev.disabled = currentPage <= 1;
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
  if (btnNext) btnNext.disabled = currentPage >= totalPages;
}

function setupTableEventListeners(fueManager) {
  const searchInput = document.getElementById('tableSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value;
      currentPage = 1;
      renderUserTable(fueManager);
    });
  }

  const selectStatus = document.getElementById('filterStatusSelect');
  if (selectStatus) {
    selectStatus.addEventListener('change', (e) => {
      currentFilterStatus = e.target.value;
      currentPage = 1;
      renderUserTable(fueManager);
    });
  }

  const selectLicense = document.getElementById('filterLicenseSelect');
  if (selectLicense) {
    selectLicense.addEventListener('change', (e) => {
      currentFilterLicense = e.target.value;
      currentPage = 1;
      renderUserTable(fueManager);
    });
  }

  const selectOpt = document.getElementById('filterOptimizationSelect');
  if (selectOpt) {
    selectOpt.addEventListener('change', (e) => {
      currentFilterOptimization = e.target.value;
      currentPage = 1;
      renderUserTable(fueManager);
    });
  }

  const btnPrev = document.getElementById('btnPrevPage');
  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderUserTable(fueManager);
      }
    });
  }

  const btnNext = document.getElementById('btnNextPage');
  if (btnNext) {
    btnNext.addEventListener('click', () => {
      currentPage++;
      renderUserTable(fueManager);
    });
  }
}
