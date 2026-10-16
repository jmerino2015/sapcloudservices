/* ============================================================
   WM Light — API Client (api.js)
   Wrapper for all backend REST calls with JWT auth
   ============================================================ */

'use strict';

const API = (() => {

  const BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : '/api';

  /* ── HTTP METHODS ────────────────────────────────────────── */
  async function _request(method, path, body = null) {
    const token = App.state.token;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);

    try {
      const res = await fetch(BASE_URL + path, opts);
      if (res.status === 401) { App.logout(); return null; }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
      }
      return res.status === 204 ? null : res.json();
    } catch(e) {
      console.error('API error:', e);
      throw e;
    }
  }

  const get    = (path)        => _request('GET', path);
  const post   = (path, body)  => _request('POST', path, body);
  const put    = (path, body)  => _request('PUT', path, body);
  const patch  = (path, body)  => _request('PATCH', path, body);
  const del    = (path)        => _request('DELETE', path);

  /* ── ENDPOINTS ───────────────────────────────────────────── */

  // Auth
  const Auth = {
    login:   (data) => post('/auth/login', data),
    refresh: ()     => post('/auth/refresh'),
    logout:  ()     => post('/auth/logout'),
  };

  // Warehouses
  const Warehouses = {
    list:    ()     => get('/warehouses'),
    get:     (id)   => get(`/warehouses/${id}`),
    create:  (data) => post('/warehouses', data),
    update:  (id,d) => put(`/warehouses/${id}`, d),
    delete:  (id)   => del(`/warehouses/${id}`),
    bins:    (id)   => get(`/warehouses/${id}/bins`),
    kpis:    (id)   => get(`/warehouses/${id}/kpis`),
  };

  // Materials (synced from SAP)
  const Materials = {
    list:    (params = '') => get('/materials' + (params ? '?'+params : '')),
    get:     (id)          => get(`/materials/${id}`),
    search:  (q)           => get(`/materials?search=${encodeURIComponent(q)}`),
    create:  (data)        => post('/materials', data),
    update:  (id,d)        => put(`/materials/${id}`, d),
    syncSAP: ()            => post('/sap/sync/materials'),
  };

  // Batches (synced from SAP)
  const Batches = {
    list:        (matId)    => get(`/materials/${matId}/batches`),
    listAll:     (params)   => get('/batches' + (params ? '?'+params : '')),
    get:         (id)       => get(`/batches/${id}`),
    syncSAP:     (matId)    => post(`/sap/sync/batches`, { materialId: matId }),
  };

  // Stock
  const Stock = {
    byBin:       (wh, bin)  => get(`/stock?warehouse=${wh}&bin=${bin}`),
    byMaterial:  (matId)    => get(`/stock?material=${matId}`),
    overview:    (wh)       => get(`/stock/overview?warehouse=${wh}`),
    movements:   (params)   => get('/stock/movements?' + params),
  };

  // Goods Receipt
  const GR = {
    list:    (params) => get('/gr?' + params),
    get:     (id)     => get(`/gr/${id}`),
    create:  (data)   => post('/gr', data),
    confirm: (id)     => post(`/gr/${id}/confirm`),
    cancel:  (id)     => post(`/gr/${id}/cancel`),
  };

  // Goods Issue
  const GI = {
    list:    (params) => get('/gi?' + params),
    get:     (id)     => get(`/gi/${id}`),
    create:  (data)   => post('/gi', data),
    confirm: (id)     => post(`/gi/${id}/confirm`),
    cancel:  (id)     => post(`/gi/${id}/cancel`),
  };

  // Transfer Orders
  const TO = {
    list:    (params) => get('/transfer-orders?' + params),
    get:     (id)     => get(`/transfer-orders/${id}`),
    create:  (data)   => post('/transfer-orders', data),
    confirm: (id, d)  => post(`/transfer-orders/${id}/confirm`, d),
    cancel:  (id)     => post(`/transfer-orders/${id}/cancel`),
    pending: ()       => get('/transfer-orders?status=OPEN'),
  };

  // Inventory Counting
  const Counting = {
    list:    ()       => get('/inventory-counts'),
    get:     (id)     => get(`/inventory-counts/${id}`),
    create:  (data)   => post('/inventory-counts', data),
    postCount:(id, d) => post(`/inventory-counts/${id}/count`, d),
    close:   (id)     => post(`/inventory-counts/${id}/close`),
  };

  // SAP Integration
  const SAP = {
    status:       () => get('/sap/status'),
    syncMaterials:() => post('/sap/sync/materials'),
    syncBatches:  () => post('/sap/sync/batches'),
    syncLog:      () => get('/sap/sync/log'),
    postMovement: (d) => post('/sap/movements', d),
  };

  // Structure
  const Structure = {
    storageTypes:    (wh) => get(`/warehouses/${wh}/storage-types`),
    storageSections: (wh, type) => get(`/warehouses/${wh}/storage-types/${type}/sections`),
    bins:            (wh) => get(`/warehouses/${wh}/bins`),
    createBin:       (wh, d) => post(`/warehouses/${wh}/bins`, d),
    updateBin:       (wh, binId, d) => put(`/warehouses/${wh}/bins/${binId}`, d),
  };

  // Reports
  const Reports = {
    stockSnapshot:  (wh)   => get(`/reports/stock-snapshot?warehouse=${wh}`),
    movements:      (from, to) => get(`/reports/movements?from=${from}&to=${to}`),
    toPerformance:  (wh)   => get(`/reports/to-performance?warehouse=${wh}`),
    export:         (type, params) => get(`/reports/${type}/export?${params}`),
  };

  // Users / Admin
  const Users = {
    list:    () => get('/users'),
    get:     (id) => get(`/users/${id}`),
    create:  (d)  => post('/users', d),
    update:  (id,d) => put(`/users/${id}`, d),
    deactivate: (id) => patch(`/users/${id}/deactivate`),
  };

  /* ── MOCK DATA (used while backend is not yet connected) ─── */
  const Mock = {
    warehouses: [
      { id: 'WH001', name: 'Almacén Principal', location: 'Zona Industrial Norte', status: 'ACTIVE', bins: 1200, occupancy: 73 },
      { id: 'WH002', name: 'Almacén Secundario', location: 'Zona Sur', status: 'ACTIVE', bins: 480, occupancy: 42 },
    ],
    materials: [
      { id:'MAT001', sapCode:'4500001', description:'Cable UTP Cat6 305m', type:'ROH', unit:'BOB', batch: true },
      { id:'MAT002', sapCode:'4500002', description:'Switch 24 puertos PoE', type:'FERT', unit:'EA', batch: false },
      { id:'MAT003', sapCode:'4500003', description:'Rack 42U 800mm', type:'HALB', unit:'EA', batch: false },
      { id:'MAT004', sapCode:'4500004', description:'Patch Panel 24p Cat6', type:'ROH', unit:'EA', batch: false },
      { id:'MAT005', sapCode:'4500005', description:'UPS 1500VA Line-Interac', type:'FERT', unit:'EA', batch: true },
    ],
    stockItems: [
      { bin:'A-01-01-01', material:'MAT001', description:'Cable UTP Cat6 305m', batch:'BT2024001', qty:25, unit:'BOB', status:'OK' },
      { bin:'A-01-01-02', material:'MAT002', description:'Switch 24p PoE', batch:'—', qty:8, unit:'EA', status:'OK' },
      { bin:'A-01-02-01', material:'MAT003', description:'Rack 42U 800mm', batch:'—', qty:3, unit:'EA', status:'LOW' },
      { bin:'B-02-01-01', material:'MAT004', description:'Patch Panel 24p Cat6', batch:'—', qty:40, unit:'EA', status:'OK' },
      { bin:'B-02-02-01', material:'MAT005', description:'UPS 1500VA', batch:'BT2024045', qty:2, unit:'EA', status:'CRITICAL' },
    ],
    transferOrders: [
      { id:'TO-2024-001', type:'GR', from:'GR-AREA', to:'A-01-01-01', material:'MAT001', qty:10, unit:'BOB', status:'OPEN',    created:'2024-01-15' },
      { id:'TO-2024-002', type:'GI', from:'A-01-01-02', to:'GI-AREA', material:'MAT002', qty:2, unit:'EA',  status:'OPEN',    created:'2024-01-15' },
      { id:'TO-2024-003', type:'TR', from:'A-01-02-01', to:'C-03-01-01', material:'MAT003', qty:1, unit:'EA', status:'CONFIRMED', created:'2024-01-14' },
      { id:'TO-2024-004', type:'GR', from:'GR-AREA', to:'B-02-01-01', material:'MAT004', qty:20, unit:'EA', status:'OPEN',    created:'2024-01-13' },
      { id:'TO-2024-005', type:'GI', from:'B-02-02-01', to:'GI-AREA', material:'MAT005', qty:1, unit:'EA',  status:'CANCELLED', created:'2024-01-12' },
    ]
  };

  return { get, post, put, patch, del, Auth, Warehouses, Materials, Batches, Stock, GR, GI, TO, Counting, SAP, Structure, Reports, Users, Mock };

})();
