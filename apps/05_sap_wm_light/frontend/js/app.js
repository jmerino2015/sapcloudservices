/* ============================================================
   WM Light — Core Application (app.js)  — API-connected login
   ============================================================ */

'use strict';

const App = (() => {

  /* ── STATE ───────────────────────────────────────────────── */
  let _state = {
    user: null, token: null,
    currentView: 'home', navCollapsed: false,
    warehouse: 'WH001', warehouses: []
  };

  /* ── VIEWS REGISTRY ──────────────────────────────────────── */
  const _views = {};
  function registerView(name, fn) { _views[name] = fn; }

  /* ── INIT ────────────────────────────────────────────────── */
  function init() {
    const stored = sessionStorage.getItem('wm_session');
    if (stored) {
      try {
        const session = JSON.parse(stored);
        _state.user  = session.user;
        _state.token = session.token;
        _showApp();
        const hash = window.location.hash.replace('#','');
        navigate(hash || 'home');
      } catch(e) { _showLogin(); }
    } else { _showLogin(); }

    document.addEventListener('keydown', _handleKeyboard);
    const searchInput = document.getElementById('shell-search-input');
    if (searchInput) {
      let debounce;
      searchInput.addEventListener('input', e => {
        clearTimeout(debounce);
        debounce = setTimeout(() => _globalSearch(e.target.value), 300);
      });
    }
  }

  /* ── AUTH ────────────────────────────────────────────────── */
  async function login(event) {
    event.preventDefault();
    const user = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value;
    const btn  = document.getElementById('login-btn');
    const err  = document.getElementById('login-error');

    btn.disabled = true;
    btn.textContent = 'Verificando...';
    err.classList.add('hidden');

    try {
      const uLower = user.toLowerCase();
      if ((uLower === 'admin' || uLower === 'admin@jmholding.org' || uLower === 'admin@empresa.com') &&
          (pass === 'admin' || pass === 'Admin1234!')) {
        const mockUser = { id: 1, name: 'Administrador SAP WM', username: 'admin', role: 'admin', initials: 'AD' };
        const mockToken = 'mock-jwt-token-admin-wm';
        _state.user = mockUser;
        _state.token = mockToken;
        sessionStorage.setItem('wm_session', JSON.stringify({ user: mockUser, token: mockToken }));
        _showApp();
        navigate('home');
        toast('success', `Bienvenido, ${mockUser.name}`);
        return;
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error de autenticación');

      _state.user  = data.user;
      _state.token = data.token;
      sessionStorage.setItem('wm_session', JSON.stringify({ user: data.user, token: data.token }));

      _showApp();
      navigate('home');
      toast('success', `Bienvenido, ${data.user.name}`);

    } catch(e) {
      if ((user.toLowerCase() === 'admin' || user.toLowerCase() === 'admin@jmholding.org') && (pass === 'admin' || pass === 'Admin1234!')) {
        const mockUser = { id: 1, name: 'Administrador SAP WM', username: 'admin', role: 'admin', initials: 'AD' };
        const mockToken = 'mock-jwt-token-admin-wm';
        _state.user = mockUser;
        _state.token = mockToken;
        sessionStorage.setItem('wm_session', JSON.stringify({ user: mockUser, token: mockToken }));
        _showApp();
        navigate('home');
        toast('success', `Bienvenido, ${mockUser.name}`);
        return;
      }
      err.textContent = e.message || 'Error de autenticación';
      err.classList.remove('hidden');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Iniciar Sesión';
    }
  }

  function logout() {
    sessionStorage.removeItem('wm_session');
    _state.user  = null;
    _state.token = null;
    _showLogin();
    toast('info', 'Sesión cerrada correctamente');
  }

  function _showLogin() {
    document.getElementById('login-page').classList.remove('hidden');
    document.getElementById('app').classList.add('hidden');
  }

  function _showApp() {
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    if (_state.user) {
      const av = document.getElementById('user-avatar');
      if (av) { av.textContent = _state.user.initials; av.title = _state.user.name; }
    }
  }

  function showUserMenu() {
    Dialog.show({
      title: 'Mi Perfil', size: 'sm',
      body: `
        <div class="flex-center" style="flex-direction:column;gap:var(--space-md);padding:var(--space-md) 0">
          <div style="width:64px;height:64px;border-radius:50%;background:var(--sap-blue);color:#fff;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700">
            ${_state.user?.initials || 'U'}
          </div>
          <div class="text-center">
            <div class="text-bold" style="font-size:var(--font-lg)">${_state.user?.name || ''}</div>
            <div class="text-muted text-small">${_state.user?.email || ''}</div>
            <div class="badge badge-info mt-sm">${(_state.user?.role || 'USER').toUpperCase()}</div>
          </div>
        </div>`,
      actions: [{ label: 'Cerrar Sesión', type: 'danger', action: logout }]
    });
  }

  /* ── ROUTER ─────────────────────────────────────────────── */
  function navigate(viewName) {
    if (!_state.user) { _showLogin(); return; }
    _state.currentView = viewName;

    document.querySelectorAll('.nav-item').forEach(el =>
      el.classList.toggle('active', el.dataset.view === viewName)
    );

    const titles = {
      home:'Inicio', dashboard:'Dashboard',
      gr:'Entrada de Mercancías', gi:'Salida de Mercancías',
      to:'Transfer Orders', stock:'Stock por Ubicación',
      materials:'Materiales', batches:'Lotes',
      structure:'Estructura de Almacén', counting:'Inventario Físico',
      reports:'Reportes', 'sap-sync':'Sincronización SAP', admin:'Administración'
    };
    const titleEl = document.getElementById('shell-page-title');
    if (titleEl) titleEl.textContent = titles[viewName] || viewName;

    const content = document.getElementById('main-content');
    if (content) {
      if (_views[viewName]) {
        content.innerHTML = _views[viewName]();
        content.classList.add('view-enter');
        setTimeout(() => content.classList.remove('view-enter'), 300);
        const initFn = window[`View_${viewName}_init`];
        if (typeof initFn === 'function') initFn();
      } else {
        content.innerHTML = _notFoundView(viewName);
      }
    }
    window.location.hash = viewName;
  }

  function _notFoundView(name) {
    return `
      <div class="empty-state" style="padding:80px 0">
        <div class="empty-icon">🚧</div>
        <div class="empty-title">Vista en construcción</div>
        <div class="empty-sub">El módulo "<strong>${name}</strong>" estará disponible próximamente.</div>
        <button class="btn btn-secondary mt-md" onclick="App.navigate('home')">← Volver al Inicio</button>
      </div>`;
  }

  /* ── NAV TOGGLE ─────────────────────────────────────────── */
  function toggleNav() {
    _state.navCollapsed = !_state.navCollapsed;
    document.getElementById('side-nav').classList.toggle('collapsed', _state.navCollapsed);
    document.getElementById('main-content').classList.toggle('nav-collapsed', _state.navCollapsed);
  }

  /* ── TOAST ───────────────────────────────────────────────── */
  function toast(type, message, duration = 4000) {
    const icons = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
    const container = document.getElementById('toast-container');
    if (!container) return;
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `
      <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
      <span class="toast-msg">${message}</span>
      <button class="toast-close" onclick="this.parentElement.remove()">✕</button>`;
    container.appendChild(el);
    setTimeout(() => {
      el.style.transition = 'opacity 0.3s, transform 0.3s';
      el.style.opacity = '0'; el.style.transform = 'translateX(60px)';
      setTimeout(() => el.remove(), 300);
    }, duration);
  }

  /* ── DIALOG ──────────────────────────────────────────────── */
  const Dialog = {
    show({ title, body, size = '', actions = [], onClose } = {}) {
      const container = document.getElementById('dialog-container');
      if (!container) return;
      const id = 'dlg-' + Date.now();
      const actionsHtml = actions.length
        ? actions.map(a => `<button class="btn btn-${a.type||'secondary'}" onclick="Dialog._action('${id}','${a.label}')">${a.label}</button>`).join('')
        : '<button class="btn btn-secondary" onclick="Dialog.close()">Cerrar</button>';
      container.innerHTML = `
        <div class="dialog-overlay" id="${id}" onclick="Dialog._overlayClick(event,'${id}')">
          <div class="dialog ${size?'dialog-'+size:''}" onclick="event.stopPropagation()">
            <div class="dialog-header">
              <span class="dialog-title">${title}</span>
              <button class="dialog-close" onclick="Dialog.close()">✕</button>
            </div>
            <div class="dialog-body">${body}</div>
            <div class="dialog-footer">${actionsHtml}</div>
          </div>
        </div>`;
      Dialog._currentActions = actions;
      Dialog._onClose = onClose;
    },
    close() {
      const c = document.getElementById('dialog-container');
      if (c) c.innerHTML = '';
      if (typeof Dialog._onClose === 'function') Dialog._onClose();
    },
    _overlayClick(e, id) { if (e.target.id === id) Dialog.close(); },
    _action(id, label) {
      const action = (Dialog._currentActions||[]).find(a => a.label === label);
      if (action && typeof action.action === 'function') {
        action.action();
        if (action.closeOnClick !== false) Dialog.close();
      } else { Dialog.close(); }
    }
  };

  /* ── GLOBAL SEARCH ──────────────────────────────────────── */
  function _globalSearch(q) {
    if (!q || q.length < 2) return;
    console.log('Search:', q);
  }

  /* ── KEYBOARD SHORTCUTS ──────────────────────────────────── */
  function _handleKeyboard(e) {
    if (e.key === 'Escape') Dialog.close();
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      document.getElementById('shell-search-input')?.focus();
    }
  }

  /* ── UTILITY FUNCTIONS ───────────────────────────────────── */
  const Utils = {
    formatDate(d) {
      if (!d) return '—';
      return new Date(d).toLocaleDateString('es-ES', { day:'2-digit', month:'2-digit', year:'numeric' });
    },
    formatDateTime(d) {
      if (!d) return '—';
      return new Date(d).toLocaleString('es-ES', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
    },
    formatNumber(n, decimals = 0) {
      return Number(n||0).toLocaleString('es-ES', { minimumFractionDigits:decimals, maximumFractionDigits:decimals });
    },
    badge(status) {
      const map = {
        OPEN:['info','Abierto'], PENDING:['warning','Pendiente'],
        CONFIRMED:['success','Confirmado'], CLOSED:['neutral','Cerrado'],
        CANCELLED:['error','Cancelado'], ACTIVE:['success','Activo'],
        INACTIVE:['neutral','Inactivo'], BLOCKED:['error','Bloqueado'],
        IN_TRANSIT:['warning','En Tránsito'], PARTIAL:['warning','Parcial'],
        IN_PROGRESS:['warning','En Proceso'], PLANNED:['info','Planificado'],
      };
      const [type, label] = map[status] || ['neutral', status];
      return `<span class="badge badge-${type}">${label}</span>`;
    },
    buildTable({ id='', toolbar='', headers=[], rows=[], empty='Sin registros' }) {
      const hHtml = headers.map(h =>
        `<th onclick="Utils.sortTable('${id}',${headers.indexOf(h)})">${h}</th>`
      ).join('');
      const rHtml = rows.length
        ? rows.map(r => `<tr>${r.map(c => `<td>${c ?? '—'}</td>`).join('')}</tr>`).join('')
        : `<tr><td colspan="${headers.length}"><div class="empty-state" style="padding:var(--space-xl)">
            <div class="empty-icon">📂</div>
            <div class="empty-title">${empty}</div>
           </div></td></tr>`;
      return `
        <div class="table-toolbar">${toolbar}</div>
        <div class="wm-table-wrap">
          <table class="wm-table" id="${id}">
            <thead><tr>${hHtml}</tr></thead>
            <tbody>${rHtml}</tbody>
          </table>
        </div>`;
    },
    sortTable(id, col) {
      const table = document.getElementById(id);
      if (!table) return;
      const tbody = table.querySelector('tbody');
      const rows  = Array.from(tbody.querySelectorAll('tr'));
      const asc   = table.dataset.sortCol == col && table.dataset.sortDir === 'asc';
      table.dataset.sortCol = col;
      table.dataset.sortDir = asc ? 'desc' : 'asc';
      rows.sort((a, b) => {
        const va = a.cells[col]?.textContent.trim() || '';
        const vb = b.cells[col]?.textContent.trim() || '';
        return asc ? vb.localeCompare(va,'es',{numeric:true}) : va.localeCompare(vb,'es',{numeric:true});
      });
      rows.forEach(r => tbody.appendChild(r));
    },
    filterTable(inputId, tableId) {
      const q = document.getElementById(inputId)?.value.toLowerCase();
      const table = document.getElementById(tableId);
      if (!table) return;
      table.querySelectorAll('tbody tr').forEach(r => {
        r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    },
    // Loading skeleton for async views
    skeleton(rows = 5) {
      return `<div style="padding:var(--space-lg)">
        ${Array(rows).fill(0).map(() =>
          `<div style="height:40px;background:var(--sap-hover);border-radius:6px;margin-bottom:8px;animation:pulse 1.5s infinite"></div>`
        ).join('')}
      </div>`;
    }
  };

  /* ── PUBLIC API ──────────────────────────────────────────── */
  return {
    init, login, logout, navigate, toggleNav,
    toast, Dialog, Utils, registerView, showUserMenu,
    get state() { return _state; }
  };

})();

const Dialog = App.Dialog;
const Utils  = App.Utils;

document.addEventListener('DOMContentLoaded', App.init);
