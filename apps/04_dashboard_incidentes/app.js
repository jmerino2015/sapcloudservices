/* =====================================================
   SAP JOULE DASHBOARD - APPLICATION LOGIC
   ===================================================== */

'use strict';

// ==================== STATE ====================
let allData = [];
let filteredData = [];
let currentPage = 1;
const PAGE_SIZE = 20;
let sortField = '';
let sortDir = 'asc';
let activeTypeFilter = 'all';
let charts = {};

// ==================== COLUMN MAP ====================
// Mapping of possible Excel column names to normalized keys
const COL_MAP = {
  numero:       ['número de caso','numero de caso','numero','n° caso','caso','id','ticket','n°'],
  estado:       ['estado','status','estatus','state'],
  tipo:         ['tipos de caso','tipo de caso','tipo','type','clase'],
  fecha:        ['fecha y hora de registro','fecha de registro','fecha registro','fecha','date','fecha_registro'],
  cliente:      ['cliente','client','customer','solicitante cliente'],
  servicio:     ['servicio','service','sap servicio'],
  jerarquia:    ['jerarquía','jerarquia','hierarchy','categoria','detalle','descripcion'],
  responsable:  ['responsable','assigned to','asignado','assigned','soporte','support'],
  solicitante:  ['solicitante','requester','requestor','usuario'],
};

// ==================== STATUS COLORS ====================
// SAP Fiori Horizon official semantic colors
const STATUS_COLORS = {
  'en curso':              { hex: '#0064D9', class: 'pill-encurso' },   // SAP Information Blue
  'cerrado':               { hex: '#188918', class: 'pill-cerrado' },   // SAP Success Green
  'cancelado':             { hex: '#AA0808', class: 'pill-cancelado' }, // SAP Error Red
  'pendiente nota usuario':{ hex: '#E9730C', class: 'pill-pendiente' }, // SAP Warning Orange
  'pendiente':             { hex: '#E9730C', class: 'pill-pendiente' }, // SAP Warning Orange
};

function getStatusColor(status) {
  const key = (status || '').toLowerCase().trim();
  for (const [k, v] of Object.entries(STATUS_COLORS)) {
    if (key.includes(k)) return v;
  }
  return { hex: '#8B9AB8', class: 'pill-other' };
}

// ==================== COLUMN DETECTION ====================
function detectColumn(headers, aliases) {
  for (const alias of aliases) {
    const idx = headers.findIndex(h => h && h.toLowerCase().trim() === alias.toLowerCase().trim());
    if (idx >= 0) return idx;
  }
  // Partial match fallback
  for (const alias of aliases) {
    const idx = headers.findIndex(h => h && h.toLowerCase().includes(alias.toLowerCase()));
    if (idx >= 0) return idx;
  }
  return -1;
}

// ==================== FILE UPLOAD ====================
const fileInput  = document.getElementById('file-input');
const uploadCard = document.getElementById('upload-card');
const dropOverlay = document.getElementById('drop-overlay');

fileInput.addEventListener('change', e => {
  if (e.target.files[0]) handleFile(e.target.files[0]);
});

uploadCard.addEventListener('click', e => {
  if (e.target.tagName !== 'LABEL' && e.target.tagName !== 'INPUT') {
    fileInput.click();
  }
});

// Drag & Drop
['dragenter','dragover'].forEach(evt => {
  uploadCard.addEventListener(evt, e => {
    e.preventDefault();
    uploadCard.classList.add('drag-over');
  });
});

['dragleave','dragend'].forEach(evt => {
  uploadCard.addEventListener(evt, e => {
    uploadCard.classList.remove('drag-over');
  });
});

uploadCard.addEventListener('drop', e => {
  e.preventDefault();
  uploadCard.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});

// Global drag-and-drop on body
document.body.addEventListener('dragover', e => e.preventDefault());
document.body.addEventListener('drop', e => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});

// Reload button
document.getElementById('btn-reload').addEventListener('click', () => {
  showUploadSection();
  fileInput.value = '';
});

// ==================== FILE PROCESSING ====================
function handleFile(file) {
  showLoading();
  setTimeout(() => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array', cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, dateNF: 'DD/MM/YYYY HH:mm' });

        if (!raw || raw.length < 2) {
          hideLoading();
          alert('El archivo no contiene datos suficientes.');
          return;
        }

        // Find header row (first non-empty row)
        let headerRowIdx = 0;
        for (let i = 0; i < Math.min(5, raw.length); i++) {
          if (raw[i].some(c => c && c.toString().trim() !== '')) {
            headerRowIdx = i;
            break;
          }
        }

        const headers = raw[headerRowIdx].map(h => h ? h.toString().trim() : '');
        
        // Detect columns
        const colIdx = {};
        for (const [key, aliases] of Object.entries(COL_MAP)) {
          colIdx[key] = detectColumn(headers, aliases);
        }

        // Parse rows
        allData = [];
        for (let i = headerRowIdx + 1; i < raw.length; i++) {
          const row = raw[i];
          if (!row || row.every(c => !c || c.toString().trim() === '')) continue;

          const get = key => colIdx[key] >= 0 ? (row[colIdx[key]] || '').toString().trim() : '';

          allData.push({
            numero:      get('numero')      || `ROW-${i}`,
            estado:      get('estado'),
            tipo:        get('tipo'),
            fecha:       get('fecha'),
            cliente:     get('cliente'),
            servicio:    get('servicio'),
            jerarquia:   get('jerarquia'),
            responsable: get('responsable'),
            solicitante: get('solicitante'),
          });
        }

        filteredData = [...allData];
        hideLoading();
        showDashboard(file.name);
        renderAll();

      } catch(err) {
        hideLoading();
        console.error(err);
        alert('Error al leer el archivo: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  }, 800);
}

// ==================== UI STATE ====================
function showLoading() {
  document.getElementById('upload-section').style.display = 'none';
  document.getElementById('loading-overlay').style.display = 'flex';
  document.getElementById('dashboard-wrap').style.display = 'none';
}

function hideLoading() {
  document.getElementById('loading-overlay').style.display = 'none';
}

function showDashboard(fileName) {
  document.getElementById('upload-section').style.display = 'none';
  document.getElementById('dashboard-wrap').style.display = 'block';
  document.getElementById('file-name-display').textContent = fileName;
  document.getElementById('file-meta-display').textContent = `${allData.length} registros cargados`;
  document.getElementById('last-update-text').textContent = new Date().toLocaleString('es-AR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

function showUploadSection() {
  document.getElementById('upload-section').style.display = 'flex';
  document.getElementById('dashboard-wrap').style.display = 'none';
  // Destroy charts to free memory
  Object.values(charts).forEach(c => { if (c) c.destroy(); });
  charts = {};
}

// ==================== RENDER ALL ====================
function renderAll() {
  renderKPIs();
  renderStatusDonut(filteredData);
  renderTypeBar(filteredData);
  renderTimeline(filteredData);
  renderTable();
}

// ==================== KPI CARDS ====================
function renderKPIs() {
  const data = allData;
  const total    = data.length;
  const enCurso  = data.filter(d => normalizeStatus(d.estado) === 'encurso').length;
  const pendiente= data.filter(d => normalizeStatus(d.estado) === 'pendiente').length;
  const cerrado  = data.filter(d => normalizeStatus(d.estado) === 'cerrado').length;
  const cancelado= data.filter(d => normalizeStatus(d.estado) === 'cancelado').length;

  const pct = v => total > 0 ? ((v/total)*100).toFixed(1) + '%' : '0%';

  animateCounter('kpi-total-val',     total);
  animateCounter('kpi-encurso-val',   enCurso);
  animateCounter('kpi-pendiente-val', pendiente);
  animateCounter('kpi-cerrado-val',   cerrado);
  animateCounter('kpi-cancelado-val', cancelado);

  document.getElementById('kpi-total-trend').textContent   = total + ' casos totales';
  document.getElementById('kpi-encurso-pct').textContent   = pct(enCurso);
  document.getElementById('kpi-pendiente-pct').textContent = pct(pendiente);
  document.getElementById('kpi-cerrado-pct').textContent   = pct(cerrado);
  document.getElementById('kpi-cancelado-pct').textContent = pct(cancelado);
}

function normalizeStatus(status) {
  const s = (status || '').toLowerCase().trim();
  if (s.includes('en curso'))           return 'encurso';
  if (s.includes('pendiente'))          return 'pendiente';
  if (s.includes('cerrado'))            return 'cerrado';
  if (s.includes('cancelado'))          return 'cancelado';
  return 'otro';
}

function animateCounter(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  const duration = 900;
  const start = performance.now();
  const from = 0;
  const step = now => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(from + (target - from) * eased).toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// ==================== STATUS DONUT ====================
function getStatusGroups(data) {
  const groups = {};
  data.forEach(d => {
    const k = d.estado || 'Sin Estado';
    groups[k] = (groups[k] || 0) + 1;
  });
  return groups;
}

function renderStatusDonut(data) {
  const groups = getStatusGroups(data);
  const labels = Object.keys(groups);
  const values = Object.values(groups);
  const colors = labels.map(l => getStatusColor(l).hex);
  // SAP Fiori Horizon status palette override per label
  const sapStatusMap = {
    'en curso': '#0064D9',
    'cerrado':  '#188918',
    'cancelado':'#AA0808',
    'pendiente nota usuario': '#E9730C',
    'pendiente': '#E9730C',
  };
  labels.forEach((l, i) => {
    const key = l.toLowerCase();
    for (const [k, v] of Object.entries(sapStatusMap)) {
      if (key.includes(k)) { colors[i] = v; break; }
    }
  });
  const total = values.reduce((a, b) => a + b, 0);

  document.getElementById('donut-center-val').textContent = total.toLocaleString();

  if (charts.donut) charts.donut.destroy();

  const ctx = document.getElementById('statusDonutChart').getContext('2d');
  charts.donut = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderColor: '#FFFFFF',
        borderWidth: 2,
        hoverOffset: 8,
        hoverBorderWidth: 0,
      }]
    },
    options: {
      cutout: '68%',
      responsive: true,
      maintainAspectRatio: false,
      animation: { animateRotate: true, duration: 900 },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#FFFFFF',
          borderColor: '#D9D9D9',
          borderWidth: 1,
          padding: 12,
          titleColor: '#1D2D3E',
          bodyColor: '#475E75',
          cornerRadius: 4,
          callbacks: {
            label: ctx => ` ${ctx.label}: ${ctx.raw} (${((ctx.raw/total)*100).toFixed(1)}%)`
          }
        }
      }
    }
  });

  // Legend
  const legendEl = document.getElementById('donut-legend');
  legendEl.innerHTML = labels.map((label, i) => `
    <div class="legend-item">
      <div class="legend-dot" style="background:${colors[i]};box-shadow:0 0 6px ${colors[i]}80"></div>
      <span class="legend-label">${label}</span>
      <span class="legend-count">${values[i]}</span>
      <span class="legend-pct">${((values[i]/total)*100).toFixed(0)}%</span>
    </div>
  `).join('');
}

// ==================== TYPE BAR CHART ====================
function renderTypeBar(data) {
  const incidentes   = data.filter(d => d.tipo.toLowerCase().includes('incidente'));
  const requerimientos = data.filter(d => d.tipo.toLowerCase().includes('requeri'));

  const statuses = ['En Curso', 'Pendiente Nota Usuario', 'Cerrado', 'Cancelado'];
  const statusMap = s => {
    const k = normalizeStatus(s);
    if (k === 'encurso') return 0;
    if (k === 'pendiente') return 1;
    if (k === 'cerrado') return 2;
    if (k === 'cancelado') return 3;
    return -1;
  };

  function countByStatus(arr) {
    const c = [0,0,0,0];
    arr.forEach(d => { const i = statusMap(d.estado); if (i >= 0) c[i]++; });
    return c;
  }

  const incCounts = countByStatus(incidentes);
  const reqCounts = countByStatus(requerimientos);

  if (charts.typeBar) charts.typeBar.destroy();

  const ctx = document.getElementById('typeBarChart').getContext('2d');
  charts.typeBar = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['En Curso', 'Pendiente', 'Cerrado', 'Cancelado'],
      datasets: [
        {
          label: 'Incidentes',
          data: incCounts,
          backgroundColor: 'rgba(119,51,221,0.75)',
          borderColor: '#7733DD',
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: 'Requerimientos',
          data: reqCounts,
          backgroundColor: 'rgba(0,130,154,0.75)',
          borderColor: '#00829A',
          borderWidth: 1,
          borderRadius: 4,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      animation: { duration: 900 },
      plugins: {
        legend: {
          labels: { color: '#475E75', font: { size: 12 }, boxWidth: 12, boxHeight: 12 }
        },
        tooltip: tooltipStyle()
      },
      scales: {
        x: {
          stacked: false,
          grid: { color: 'rgba(29,45,62,0.06)' },
          ticks: { color: '#475E75', font: { size: 11 } }
        },
        y: {
          stacked: false,
          grid: { display: false },
          ticks: { color: '#475E75', font: { size: 11 } }
        }
      }
    }
  });
}

// ==================== RESPONSABLE LIST ====================
function renderResponsableList(data) {
  const counts = {};
  data.forEach(d => {
    const r = d.responsable || 'Sin Asignar';
    counts[r] = (counts[r] || 0) + 1;
  });

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const max = sorted[0]?.[1] || 1;

  // SAP Fiori accent palette
  const colors = ['#5D36FF','#A100C2','#0064D9','#188918','#E9730C','#AA0808','#7733DD','#00829A','#475E75','#CF4500'];

  const el = document.getElementById('responsable-list');
  el.innerHTML = sorted.map(([name, count], i) => `
    <div class="progress-item">
      <div class="progress-header">
        <span class="progress-label" title="${name}">${name}</span>
        <span class="progress-value">${count} casos</span>
      </div>
      <div class="progress-bar-track">
        <div class="progress-bar-fill" style="width:${(count/max*100).toFixed(1)}%;background:${colors[i % colors.length]}"></div>
      </div>
    </div>
  `).join('');
}

// ==================== TIMELINE CHART ====================
function renderTimeline(data) {
  // Group by date
  const dateCounts = {};
  data.forEach(d => {
    if (!d.fecha) return;
    // Normalize date (remove time)
    const parts = d.fecha.split(' ')[0];
    if (!parts) return;
    dateCounts[parts] = (dateCounts[parts] || 0) + 1;
  });

  // Sort dates
  const entries = Object.entries(dateCounts).sort((a, b) => {
    // Try to parse DD/MM/YYYY
    const parseDate = s => {
      const [d, m, y] = s.split('/');
      if (d && m && y) return new Date(`${y}-${m}-${d}`);
      return new Date(s);
    };
    return parseDate(a[0]) - parseDate(b[0]);
  });

  const labels = entries.map(e => e[0]);
  const values = entries.map(e => e[1]);

  if (charts.timeline) charts.timeline.destroy();

  const ctx = document.getElementById('timelineChart').getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, 0, 260);
  gradient.addColorStop(0, 'rgba(0,100,217,0.2)');
  gradient.addColorStop(1, 'rgba(0,100,217,0.01)');

  charts.timeline = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Casos registrados',
        data: values,
        fill: true,
        backgroundColor: gradient,
        borderColor: '#0064D9',
        borderWidth: 2,
        pointBackgroundColor: '#0064D9',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 7,
        tension: 0.4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1000 },
      plugins: {
        legend: { display: false },
        tooltip: tooltipStyle()
      },
      scales: {
        x: {
          grid: { color: 'rgba(29,45,62,0.06)' },
          ticks: { color: '#475E75', font: { size: 10 }, maxRotation: 45, maxTicksLimit: 15 }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(29,45,62,0.06)' },
          ticks: { color: '#475E75', font: { size: 11 }, stepSize: 1 }
        }
      }
    }
  });
}

// ==================== SERVICIO CHART ====================
function renderServicioChart(data) {
  const counts = {};
  data.forEach(d => {
    const s = (d.servicio || 'Sin Servicio').substring(0, 20);
    counts[s] = (counts[s] || 0) + 1;
  });

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 7);
  const labels = sorted.map(e => e[0]);
  const values = sorted.map(e => e[1]);

  // SAP Fiori semantic + brand colors
  const colors = ['#0064D9','#5D36FF','#A100C2','#188918','#E9730C','#00829A','#7733DD'];

  if (charts.servicio) charts.servicio.destroy();

  const ctx = document.getElementById('servicioChart').getContext('2d');
  charts.servicio = new Chart(ctx, {
    type: 'polarArea',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors.map(c => c + 'BF'),
        borderColor: colors,
        borderWidth: 1,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1000 },
      plugins: {
        legend: {
          position: 'right',
          labels: { color: '#8B9AB8', font: { size: 10 }, boxWidth: 10, padding: 8 }
        },
        tooltip: tooltipStyle()
      },
      scales: {
        r: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#5A6880', font: { size: 9 }, backdropColor: 'transparent' }
        }
      }
    }
  });
}

// ==================== TABLE ====================
function renderTable() {
  applyTableFilters();
}

function applyTableFilters() {
  const search  = (document.getElementById('table-search').value || '').toLowerCase().trim();
  const statusF = document.getElementById('status-filter').value;
  const typeF   = document.getElementById('type-filter').value;

  filteredData = allData.filter(d => {
    if (statusF && !d.estado.toLowerCase().includes(statusF.toLowerCase())) return false;
    if (typeF   && !d.tipo.toLowerCase().includes(typeF.toLowerCase())) return false;
    if (search) {
      const hay = [d.numero, d.estado, d.tipo, d.fecha, d.cliente, d.servicio, d.responsable, d.solicitante].join(' ').toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });

  currentPage = 1;
  renderTablePage();
  // Re-render charts with filtered data
  renderStatusDonut(filteredData);
  renderTypeBar(filteredData);
  renderTimeline(filteredData);
  document.getElementById('donut-center-val').textContent = filteredData.length.toLocaleString();
}

// Live search
document.getElementById('table-search').addEventListener('input', debounce(applyTableFilters, 300));

function renderTablePage() {
  const total = filteredData.length;
  const start = (currentPage - 1) * PAGE_SIZE;
  const end   = Math.min(start + PAGE_SIZE, total);
  const pageData = filteredData.slice(start, end);

  document.getElementById('table-count').textContent = `${total.toLocaleString()} registros`;
  document.getElementById('table-footer-text').textContent = `Mostrando ${start + 1}–${end} de ${total.toLocaleString()} registros`;

  const tbody = document.getElementById('table-body');
  tbody.innerHTML = pageData.map(d => {
    const sc = getStatusColor(d.estado);
    const typeClass = d.tipo.toLowerCase().includes('incidente') ? 'type-incidente' : 
                      d.tipo.toLowerCase().includes('requeri')   ? 'type-requerimiento' : '';
    return `<tr>
      <td><span class="case-num">${esc(d.numero)}</span></td>
      <td><span class="status-pill ${sc.class}">${esc(d.estado) || '—'}</span></td>
      <td><span class="type-badge ${typeClass}">${esc(d.tipo) || '—'}</span></td>
      <td>${esc(d.fecha) || '—'}</td>
      <td>${esc(d.cliente) || '—'}</td>
      <td title="${esc(d.servicio)}">${truncate(esc(d.servicio), 40)}</td>
      <td title="${esc(d.jerarquia)}">${truncate(esc(d.jerarquia), 45)}</td>
      <td>${esc(d.responsable) || '—'}</td>
      <td>${esc(d.solicitante) || '—'}</td>
    </tr>`;
  }).join('');

  renderPagination(total);
}

function renderPagination(total) {
  const pages = Math.ceil(total / PAGE_SIZE);
  const wrap  = document.getElementById('pagination-wrap');
  if (pages <= 1) { wrap.innerHTML = ''; return; }

  let html = `<button class="page-btn" onclick="goPage(${currentPage-1})" ${currentPage===1?'disabled':''}>‹</button>`;

  const range = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || (i >= currentPage - 2 && i <= currentPage + 2)) {
      range.push(i);
    } else if (range[range.length-1] !== '…') {
      range.push('…');
    }
  }

  range.forEach(p => {
    if (p === '…') {
      html += `<button class="page-btn" disabled>…</button>`;
    } else {
      html += `<button class="page-btn ${p===currentPage?'active':''}" onclick="goPage(${p})">${p}</button>`;
    }
  });

  html += `<button class="page-btn" onclick="goPage(${currentPage+1})" ${currentPage===pages?'disabled':''}>›</button>`;
  wrap.innerHTML = html;
}

function goPage(p) {
  const maxPage = Math.ceil(filteredData.length / PAGE_SIZE);
  if (p < 1 || p > maxPage) return;
  currentPage = p;
  renderTablePage();
}

// ==================== SORT ====================
function sortTable(field) {
  if (sortField === field) {
    sortDir = sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    sortField = field;
    sortDir = 'asc';
  }

  filteredData.sort((a, b) => {
    const va = (a[field] || '').toLowerCase();
    const vb = (b[field] || '').toLowerCase();
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  currentPage = 1;
  renderTablePage();
}

// ==================== CHART FILTER ====================
function filterByType(type, btn) {
  activeTypeFilter = type;
  document.querySelectorAll('.chip-btn[data-filter-type]').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  let data = allData;
  if (type !== 'all') {
    data = allData.filter(d => d.tipo.toLowerCase().includes(type.toLowerCase()));
  }

  filteredData = data;
  renderStatusDonut(data);
  renderTypeBar(data);
  renderTimeline(data);
  document.getElementById('donut-center-val').textContent = data.length.toLocaleString();
  currentPage = 1;
  renderTablePage();
}

// ==================== EXPORT ====================
function exportToExcel() {
  const headers = ['N° Caso','Estado','Tipo','Fecha Registro','Cliente','Servicio','Jerarquía','Responsable','Solicitante'];
  const rows    = filteredData.map(d => [d.numero, d.estado, d.tipo, d.fecha, d.cliente, d.servicio, d.jerarquia, d.responsable, d.solicitante]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Dashboard');

  // Style header row
  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let C = range.s.c; C <= range.e.c; C++) {
    const cellAddr = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!ws[cellAddr]) continue;
    ws[cellAddr].s = { font: { bold: true }, fill: { fgColor: { rgb: '0070F2' } } };
  }

  XLSX.writeFile(wb, `SAP_Dashboard_Incidentes_${new Date().toISOString().slice(0,10)}.xlsx`);
}

// ==================== HELPERS ====================
function esc(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function truncate(str, max) {
  if (!str) return '—';
  return str.length > max ? str.substring(0, max) + '…' : str;
}

function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function tooltipStyle() {
  return {
    backgroundColor: '#FFFFFF',
    borderColor: '#D9D9D9',
    borderWidth: 1,
    padding: 12,
    titleColor: '#1D2D3E',
    bodyColor: '#475E75',
    cornerRadius: 4,
    displayColors: true,
    boxShadow: '0 2px 8px rgba(29,45,62,0.15)',
  };
}

// ==================== CHART.JS DEFAULTS — SAP FIORI HORIZON ====================
Chart.defaults.color = '#475E75';          // SAP --sapLabelColor
Chart.defaults.font.family = "'IBM Plex Sans', '72', -apple-system, sans-serif";
Chart.defaults.font.size = 12;
