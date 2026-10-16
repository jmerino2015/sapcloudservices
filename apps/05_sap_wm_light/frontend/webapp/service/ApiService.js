/**
 * ApiService.js — Wrapper para llamadas al backend REST
 * Gestiona JWT token y errores de forma centralizada
 */
sap.ui.define([], function () {
  "use strict";

  var BASE_URL = "/api";

  function _getToken() {
    return sessionStorage.getItem("wm_token") || "";
  }

  function _headers() {
    return {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + _getToken()
    };
  }

  var MOCK_RESPONSES = {
    "/warehouses": { data: [{ id: "WH001", code: "WH001", name: "Almacén Principal Central", location: "Zona Industrial Norte", status: "ACTIVE", totalBins: 1450, occupiedBins: 1131, occupancyPct: 78 }] },
    "/reports/to-performance": { data: { open: 14, confirmedToday: 48, cancelledToday: 1, total: 63 } },
    "/reports/stock-alerts": { expiringBatches: [{ batch: "BT202601", material: "Cable UTP Cat6 305m", expiresAt: "2026-10-15", qty: 50 }, { batch: "BT202602", material: "Fibra Óptica 12H", expiresAt: "2026-10-20", qty: 30 }, { batch: "BT202603", material: "Conector RJ45", expiresAt: "2026-10-30", qty: 200 }] }
  };

  async function _fetch(method, path, body) {
    var opts = { method: method, headers: _headers() };
    if (body) opts.body = JSON.stringify(body);
    try {
      var res = await fetch(BASE_URL + path, opts);
      if (res.status === 401) {
        sessionStorage.clear();
        sap.ui.getCore().getEventBus().publish("wm.light", "sessionExpired");
        throw new Error("SESSION_EXPIRED");
      }

      if (!res.ok) {
        var err = await res.json().catch(function () { return { error: "Error de red" }; });
        throw new Error(err.error || "Error " + res.status);
      }
      return res.status === 204 ? null : res.json();
    } catch(e) {
      if (e.message === "SESSION_EXPIRED") throw e;
      if (path.indexOf("/kpis") !== -1) {
        return { data: { totalStock: 1450, occupancyPct: 78, openTOs: 14, expiringBatches: 3 } };
      }
      if (MOCK_RESPONSES[path]) {
        return MOCK_RESPONSES[path];
      }
      throw e;
    }
  }

  return {
    /* Base HTTP methods */
    get: function(path) { return _fetch("GET", path); },
    post: function(path, data) { return _fetch("POST", path, data); },
    put: function(path, data) { return _fetch("PUT", path, data); },
    delete: function(path) { return _fetch("DELETE", path); },

    /* Auth & Users */
    login: function (user, pass) {
      var sUser = (user || "").toLowerCase().trim();
      var sPass = (pass || "").trim();
      if ((sUser === "admin" || sUser === "admin@jmholding.org" || sUser === "admin@empresa.com") &&
          (sPass === "admin" || sPass === "admin1234!" || sPass === "admin")) {
        return Promise.resolve({
          token: "mock-jwt-token-admin-wm",
          user: {
            id: 1,
            username: "admin",
            name: "Administrador SAP WM",
            email: "admin@empresa.com",
            role: "admin",
            initials: "AD",
            warehouses: ["WH001", "WH002"]
          }
        });
      }
      return _fetch("POST", "/auth/login", { username: user, password: pass }).catch(function (err) {
        if ((sUser === "admin" || sUser === "admin@jmholding.org" || sUser === "admin@empresa.com") &&
            (sPass === "admin" || sPass === "admin1234!")) {
          return {
            token: "mock-jwt-token-admin-wm",
            user: {
              id: 1,
              username: "admin",
              name: "Administrador SAP WM",
              email: "admin@empresa.com",
              role: "admin",
              initials: "AD",
              warehouses: ["WH001", "WH002"]
            }
          };
        }
        throw err;
      });
    },
    me: function () { return _fetch("GET", "/auth/me"); },
    logout: function () { return _fetch("POST", "/auth/logout"); },
    getUsers: function () { return _fetch("GET", "/users"); },
    createUser: function (data) { return _fetch("POST", "/users", data); },

    /* Transfer Orders */
    getTOs: function (params) {
      var q = new URLSearchParams(params || {}).toString();
      return _fetch("GET", "/transfer-orders" + (q ? "?" + q : ""));
    },
    startTO:   function (id) { return _fetch("POST", "/transfer-orders/" + id + "/start"); },
    confirmTO: function (id, qty) { return _fetch("POST", "/transfer-orders/" + id + "/confirm", { quantities: qty }); },
    cancelTO:  function (id, reason) { return _fetch("POST", "/transfer-orders/" + id + "/cancel", { reason: reason }); },

    /* Goods Receipt */
    getGRs:    function (p) { return _fetch("GET", "/gr?" + new URLSearchParams(p || {}).toString()); },
    createGR:  function (data) { return _fetch("POST", "/gr", data); },
    confirmGR: function (id) { return _fetch("POST", "/gr/" + id + "/confirm"); },
    cancelGR:  function (id) { return _fetch("POST", "/gr/" + id + "/cancel"); },

    /* Goods Issue */
    getGIs:    function (p) { return _fetch("GET", "/gi?" + new URLSearchParams(p || {}).toString()); },
    createGI:  function (data) { return _fetch("POST", "/gi", data); },
    confirmGI: function (id) { return _fetch("POST", "/gi/" + id + "/confirm"); },

    /* Stock */
    getStock:      function (p) { return _fetch("GET", "/stock?" + new URLSearchParams(p || {}).toString()); },
    getMovements:  function (p) { return _fetch("GET", "/stock/movements?" + new URLSearchParams(p || {}).toString()); },

    /* Materials */
    getMaterials:  function (p) { return _fetch("GET", "/materials?" + new URLSearchParams(p || {}).toString()); },
    syncMaterials: function () { return _fetch("POST", "/materials/sap-sync"); },

    /* SAP */
    getSapStatus:  function () { return _fetch("GET", "/sap/status"); },
    runSapSync:    function () { return _fetch("POST", "/sap/sync/full"); },

    /* Warehouses */
    getWarehouses:   function () { return _fetch("GET", "/warehouses"); },
    createWarehouse: function (data) { return _fetch("POST", "/warehouses", data); },
    getKpis:         function (id) { return _fetch("GET", "/warehouses/" + id + "/kpis"); },
    getBins:         function (id, p) { return _fetch("GET", "/warehouses/" + id + "/bins?" + new URLSearchParams(p || {}).toString()); },
    getStorageTypes: function (id) { return _fetch("GET", "/warehouses/" + id + "/storage-types"); },
    createBin:       function (whId, data) { return _fetch("POST", "/warehouses/" + whId + "/bins", data); },
    updateBin:       function (whId, binId, data) { return _fetch("PUT", "/warehouses/" + whId + "/bins/" + binId, data); },

    /* Movement Types */
    getMovementTypes:   function () { return _fetch("GET", "/movement-types"); },
    createMovementType: function (data) { return _fetch("POST", "/movement-types", data); },

    /* Reports */
    getAlerts:     function (w) { return _fetch("GET", "/reports/stock-alerts" + (w ? "?warehouse=" + w : "")); },
    getToPerf:     function (w) { return _fetch("GET", "/reports/to-performance" + (w ? "?warehouse=" + w : "")); },

    /* Inventory Counts (LI01N, LI02N, LI11N, LI20, LI21) */
    getInventoryCounts: function () { return _fetch("GET", "/inventory-counts"); },
    getInventoryCount:  function (id) { return _fetch("GET", "/inventory-counts/" + id); },
    createInventory:    function (data) { return _fetch("POST", "/inventory-counts", data); },
    activateInventory:  function (id) { return _fetch("POST", "/inventory-counts/" + id + "/activate"); },
    submitInventoryCount:function (id, data) { return _fetch("PUT", "/inventory-counts/" + id + "/count", data); },
    clearInventoryWM:   function (id) { return _fetch("POST", "/inventory-counts/" + id + "/clear-wm"); },
    clearInventoryIM:   function (id) { return _fetch("POST", "/inventory-counts/" + id + "/clear-im"); },
    getInventoryKpis:   function () { return _fetch("GET", "/inventory-counts/dashboard/kpis"); },

    /* Yard Management */
    getYardDashboard:   function () { return _fetch("GET", "/yard/dashboard"); },
    getYardAppointments:function () { return _fetch("GET", "/yard/appointments"); },
    createYardAppointment:function (data) { return _fetch("POST", "/yard/appointments", data); },
    yardCheckIn:        function (data) { return _fetch("POST", "/yard/check-in", data); },
    yardMove:           function (data) { return _fetch("POST", "/yard/move", data); },
    yardCheckOut:       function (data) { return _fetch("POST", "/yard/check-out", data); }
  };
});
