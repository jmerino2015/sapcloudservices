/**
 * SAP Fiori Solution Portal - Production & Local HTTP Web Server
 * 
 * Supports local execution and production deployment (Node.js, Docker, Azure, AWS, SAP BTP)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
try {
  require('dotenv').config();
} catch (e) {
  // Dotenv es opcional en entornos cloud como Render donde las variables se inyectan directamente
}

const db = require('./src/db/database');

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.properties': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

function readJsonBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  let reqUrl = decodeURIComponent(req.url.split('?')[0]);

  // Handle API Database Status Endpoint
  if (reqUrl === '/api/db/status' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    });
    const status = await db.getDbStatus();
    return res.end(JSON.stringify({ success: true, data: status }));
  }

  // Handle API Endpoints for Auth
  if (reqUrl === '/api/auth/login' && req.method === 'POST') {
    const body = await readJsonBody(req);
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    });
    try {
      const { username, password, language } = body || {};
      const user = await db.authenticateUser(username, password);
      if (user) {
        if (language) user.language = language;
        return res.end(JSON.stringify({
          success: true,
          token: `sap-jwt-${Buffer.from(user.username + ':' + Date.now()).toString('base64')}`,
          user
        }));
      }
      res.statusCode = 401;
      return res.end(JSON.stringify({
        success: false,
        error: 'Logon failed. Check user and password (SAP S/4HANA Clean Core)'
      }));
    } catch (e) {
      res.statusCode = 500;
      return res.end(JSON.stringify({ success: false, error: e.message }));
    }
  }

  if (reqUrl === '/api/auth/change-password' && req.method === 'POST') {
    const body = await readJsonBody(req);
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    });
    try {
      const { username, oldPassword, newPassword } = body || {};
      const result = await db.changeUserPassword(username, oldPassword, newPassword);
      if (!result.success) {
        res.statusCode = 400;
      }
      return res.end(JSON.stringify(result));
    } catch (e) {
      res.statusCode = 500;
      return res.end(JSON.stringify({ success: false, error: e.message }));
    }
  }

  if (reqUrl === '/api/auth/me' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    });
    return res.end(JSON.stringify({
      id: 1,
      username: 'SAPADMIN',
      name: 'Administrador Principal SAP',
      email: 'sapadmin@fiori-portal.com',
      role: 'admin',
      initials: 'SA',
      warehouses: ['WH001', 'WH002', 'WH003', 'WH004']
    }));
  }

  // Handle API Endpoints for FUE Control (Persisted in DB)
  if (reqUrl === '/api/fue') {
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    });
    if (req.method === 'GET') {
      const fueList = await db.getFueData();
      return res.end(JSON.stringify({ success: true, data: fueList }));
    } else if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const parsed = JSON.parse(body);
          if (Array.isArray(parsed.data)) {
            await db.saveFueData(parsed.data);
          }
          return res.end(JSON.stringify({ success: true, message: 'Datos guardados en base de datos correctamente' }));
        } catch (e) {
          return res.end(JSON.stringify({ success: false, error: e.message }));
        }
      });
      return;
    }
  }

  // Handle WMS Demo API Endpoints
  if (reqUrl.startsWith('/api/')) {
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });

    if (req.method === 'OPTIONS') {
      return res.end();
    }

    if (reqUrl === '/api/warehouses') {
      const data = await db.getWarehouses();
      return res.end(JSON.stringify({ success: true, data }));
    }

    if (reqUrl.includes('/storage-types')) {
      const data = await db.getStorageTypes();
      return res.end(JSON.stringify({ success: true, data }));
    }

    if (reqUrl.includes('/bins')) {
      const data = await db.getBins();
      return res.end(JSON.stringify({
        success: true,
        total: data.length,
        data
      }));
    }

    if (reqUrl === '/api/kpis' || reqUrl === '/api/wm/kpis') {
      const stockList = await db.getStock();
      const toList = await db.getTransferOrders();
      const grList = await db.getGoodsReceipts();
      const giList = await db.getGoodsIssues();
      const openTOs = toList.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
      const totalStock = stockList.reduce((acc, s) => acc + (s.qty || 0), 0);
      return res.end(JSON.stringify({
        success: true,
        data: {
          totalStock: Math.round(totalStock),
          occupancyPct: 78.4,
          openTOs: openTOs || 14,
          expiringBatches: 3,
          grToday: grList.length,
          giToday: giList.length
        }
      }));
    }

    if (reqUrl.includes('/to-performance')) {
      const toList = await db.getTransferOrders();
      const openCount = toList.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
      const confCount = toList.filter(t => t.status === 'CONFIRMED').length;
      return res.end(JSON.stringify({
        success: true,
        data: { open: openCount, confirmedToday: confCount, cancelledToday: 1, total: toList.length }
      }));
    }

    if (reqUrl.includes('/stock-alerts')) {
      const stockList = await db.getStock();
      const expiring = stockList
        .filter(s => s.expiry_date && s.expiry_date !== '—')
        .map(s => ({
          batch: s.batch_number,
          material: s.description,
          expiresAt: s.expiry_date,
          qty: s.qty
        }));
      return res.end(JSON.stringify({
        success: true,
        expiringBatches: expiring.length ? expiring : [
          { batch: 'BT202601', material: 'Cable UTP Cat6 305m', expiresAt: '2026-10-15', qty: 50 },
          { batch: 'BT202605', material: 'UPS 1500VA APC', expiresAt: '2026-11-20', qty: 12 }
        ]
      }));
    }

    if (reqUrl.startsWith('/api/transfer-orders')) {
      if (req.method === 'POST') {
        const parts = reqUrl.split('/');
        // format: /api/transfer-orders/:id/start or /confirm or /cancel
        const action = parts[parts.length - 1];
        const id = parts[parts.length - 2];
        if (action === 'start') {
          await db.updateTransferOrderStatus(id, 'IN_PROGRESS');
          return res.end(JSON.stringify({ success: true, message: 'OT iniciada' }));
        } else if (action === 'confirm') {
          await db.updateTransferOrderStatus(id, 'CONFIRMED');
          return res.end(JSON.stringify({ success: true, message: 'OT confirmada' }));
        } else if (action === 'cancel') {
          await db.updateTransferOrderStatus(id, 'CANCELLED');
          return res.end(JSON.stringify({ success: true, message: 'OT cancelada' }));
        }
      }
      const data = await db.getTransferOrders();
      return res.end(JSON.stringify({
        success: true,
        total: data.length,
        data
      }));
    }

    if (reqUrl.startsWith('/api/materials')) {
      const data = await db.getMaterials();
      return res.end(JSON.stringify({
        success: true,
        total: data.length,
        data
      }));
    }

    if (reqUrl.startsWith('/api/stock')) {
      const data = await db.getStock();
      return res.end(JSON.stringify({
        success: true,
        total: data.length,
        data
      }));
    }

    if (reqUrl.startsWith('/api/gr')) {
      if (req.method === 'POST') {
        if (reqUrl.includes('/confirm')) {
          const parts = reqUrl.split('/');
          const id = parts[parts.length - 2];
          await db.confirmGoodsReceipt(id);
          return res.end(JSON.stringify({ success: true, message: 'Entrada confirmada' }));
        }
        const body = await readJsonBody(req);
        const created = await db.createGoodsReceipt(body);
        return res.end(JSON.stringify({ success: true, data: created }));
      }
      const data = await db.getGoodsReceipts();
      return res.end(JSON.stringify({
        success: true,
        total: data.length,
        data
      }));
    }

    if (reqUrl.startsWith('/api/gi')) {
      if (req.method === 'POST') {
        if (reqUrl.includes('/confirm')) {
          const parts = reqUrl.split('/');
          const id = parts[parts.length - 2];
          await db.confirmGoodsIssue(id);
          return res.end(JSON.stringify({ success: true, message: 'Salida despachada' }));
        }
        const body = await readJsonBody(req);
        const created = await db.createGoodsIssue(body);
        return res.end(JSON.stringify({ success: true, data: created }));
      }
      const data = await db.getGoodsIssues();
      return res.end(JSON.stringify({
        success: true,
        total: data.length,
        data
      }));
    }

    if (reqUrl.startsWith('/api/inventory-counts')) {
      if (req.method === 'POST') {
        const body = await readJsonBody(req);
        const created = await db.createInventoryCount(body);
        return res.end(JSON.stringify({ success: true, data: created }));
      }
      const data = await db.getInventoryCounts();
      return res.end(JSON.stringify({
        success: true,
        total: data.length,
        data
      }));
    }

    if (reqUrl.startsWith('/api/yard')) {
      const yard = await db.getYardData();
      return res.end(JSON.stringify({
        success: true,
        data: { appointmentsToday: 8, checkedIn: 3, inDock: 2, checkedOut: 3 },
        locations: yard.locations,
        expectedVehicles: yard.expectedVehicles
      }));
    }

    if (reqUrl.startsWith('/api/movement-types')) {
      return res.end(JSON.stringify({
        success: true,
        data: [
          { id: 1, code: '101', description: 'Entrada de mercancías por pedido de compra', direction: 'IN' },
          { id: 2, code: '102', description: 'Anulación de entrada de mercancías', direction: 'OUT' },
          { id: 3, code: '201', description: 'Salida para centro de coste', direction: 'OUT' },
          { id: 4, code: '601', description: 'Salida de mercancías para entrega (Ventas)', direction: 'OUT' },
          { id: 5, code: '999', description: 'Diferencia de inventario físico WM', direction: 'ADJ' }
        ]
      }));
    }

    if (reqUrl.startsWith('/api/users')) {
      return res.end(JSON.stringify({
        success: true,
        data: [
          { id: 1, username: 'admin', name: 'Administrador SAP WM', email: 'admin@fiori-portal.com', role: 'admin', status: 'ACTIVE' },
          { id: 2, username: 'operator1', name: 'Operador Zebra RF 01', email: 'rf1@fiori-portal.com', role: 'operator', status: 'ACTIVE' }
        ]
      }));
    }

    // Endpoints para App 14 - Torre de Control WMS / Indicadores de Almacenes
    if (reqUrl.startsWith('/api/kpi-almacenes/summary')) {
      return res.end(JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        global: {
          totalSedes: 3,
          ocupabilidadPonderada: 84.9,
          paletasIngresoHoy: 416,
          pesoIngresoTNHoy: 326.8,
          paletasSalidaHoy: 459,
          pesoSalidaTNHoy: 374.5,
          otPendientesTotal: 230,
          cumplimientoVentana7a10: 91.3,
          diasSinAccidentesMax: 412,
          eriPromedio: 99.3,
          eruPromedio: 98.6,
          bpaPromedio: 96.1,
          precisionPicking: 99.6
        }
      }));
    }

    if (reqUrl.startsWith('/api/kpi-almacenes/sedes')) {
      const sedes = await db.getKpiAlmacenesSedes();
      return res.end(JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        sedes
      }));
    }

    if (reqUrl.startsWith('/api/kpi-almacenes/sync')) {
      return res.end(JSON.stringify({
        success: true,
        message: "Sincronización multi-fuente RAP OData V4 ejecutada exitosamente",
        timestamp: new Date().toISOString(),
        refreshedSources: [
          "S/4HANA MM-IM (MB51)",
          "S/4HANA LE-WM (LT23)",
          "S/4HANA LE-WM (LX03)",
          "VL06F / Drivin",
          "OneDrive / SharePoint"
        ]
      }));
    }

    // Endpoints para App 16 - Procure Core (SAP Ariba Clone / Source-to-Settle)
    if (reqUrl.startsWith('/api/procure-core')) {
      if (reqUrl === '/api/procure-core/kpis') {
        const kpis = await db.getProcureCoreKpis();
        return res.end(JSON.stringify({ success: true, data: kpis }));
      }

      if (reqUrl === '/api/procure-core/events') {
        if (req.method === 'POST') {
          const body = await readJsonBody(req);
          const result = await db.createProcureEvent(body);
          return res.end(JSON.stringify(result));
        }
        const events = await db.getProcureEvents();
        return res.end(JSON.stringify({ success: true, total: events.length, data: events }));
      }

      if (reqUrl.startsWith('/api/procure-core/events/') && req.method === 'POST') {
        const parts = reqUrl.split('/');
        const action = parts[parts.length - 1];
        const eventId = parts[parts.length - 2];
        const body = await readJsonBody(req);
        if (action === 'publish') {
          const result = await db.publishProcureEvent(eventId);
          return res.end(JSON.stringify(result));
        } else if (action === 'award') {
          const result = await db.awardProcureEvent(eventId, body.supplierName || 'Proveedor Adjudicado');
          return res.end(JSON.stringify(result));
        }
      }

      if (reqUrl === '/api/procure-core/requisitions') {
        if (req.method === 'POST') {
          const body = await readJsonBody(req);
          const result = await db.createProcureRequisition(body);
          return res.end(JSON.stringify(result));
        }
        const reqs = await db.getProcureRequisitions();
        return res.end(JSON.stringify({ success: true, total: reqs.length, data: reqs }));
      }

      if (reqUrl.startsWith('/api/procure-core/requisitions/') && req.method === 'POST') {
        const parts = reqUrl.split('/');
        const action = parts[parts.length - 1];
        const prId = parts[parts.length - 2];
        if (action === 'submit') {
          const result = await db.submitProcureRequisition(prId);
          return res.end(JSON.stringify(result));
        } else if (action === 'approve') {
          const result = await db.approveProcureRequisition(prId);
          return res.end(JSON.stringify(result));
        } else if (action === 'create-po') {
          const result = await db.createSAPPOFromPR(prId);
          return res.end(JSON.stringify(result));
        }
      }

      if (reqUrl === '/api/procure-core/invoices') {
        if (req.method === 'POST') {
          const body = await readJsonBody(req);
          const result = await db.createProcureInvoice(body);
          return res.end(JSON.stringify(result));
        }
        const invoices = await db.getProcureInvoices();
        return res.end(JSON.stringify({ success: true, total: invoices.length, data: invoices }));
      }

      if (reqUrl.startsWith('/api/procure-core/invoices/') && req.method === 'POST') {
        const parts = reqUrl.split('/');
        const action = parts[parts.length - 1];
        const invId = parts[parts.length - 2];
        const body = await readJsonBody(req);
        if (action === 'match') {
          const result = await db.execute3WayMatch(invId);
          return res.end(JSON.stringify(result));
        } else if (action === 'release-block') {
          const result = await db.releaseInvoicePaymentBlock(invId, body.justification);
          return res.end(JSON.stringify(result));
        }
      }

      if (reqUrl === '/api/procure-core/contracts') {
        if (req.method === 'POST') {
          const body = await readJsonBody(req);
          const result = await db.createProcureContract(body);
          return res.end(JSON.stringify(result));
        }
        const contracts = await db.getProcureContracts();
        return res.end(JSON.stringify({ success: true, total: contracts.length, data: contracts }));
      }

      if (reqUrl === '/api/procure-core/suppliers') {
        const suppliers = await db.getProcureSuppliers();
        return res.end(JSON.stringify({ success: true, total: suppliers.length, data: suppliers }));
      }
    }

    return res.end(JSON.stringify({ success: true, data: [] }));
  }

  if (reqUrl === '/' || reqUrl === '' || reqUrl === '/login' || reqUrl === '/logon') {
    reqUrl = '/login.html';
  } else if (reqUrl === '/portal' || reqUrl === '/home' || reqUrl === '/launchpad' || reqUrl.includes('FioriLaunchpad.html')) {
    reqUrl = '/index.html';
  }

  const filePath = path.join(PUBLIC_DIR, reqUrl);

  // Prevent directory traversal security vulnerability
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    return res.end('403 Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      return res.end('404 Not Found');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Content-Type-Options': 'nosniff'
    });

    fs.createReadStream(filePath).pipe(res);
  });
});

const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

server.listen(PORT, HOST, async () => {
  const localUrl = `http://localhost:${PORT}`;
  const networkUrl = `http://${getLocalIP()}:${PORT}`;

  console.log(`=================================================================`);
  console.log(`  🚀 SAP Fiori Solution Portal`);
  console.log(`=================================================================`);
  console.log(`  🌐 Acceso Local:      ${localUrl}`);
  console.log(`  📱 Acceso Red (Wi-Fi): ${networkUrl}`);
  console.log(`-----------------------------------------------------------------`);
  
  // Inicializar conector de base de datos pública
  await db.initDatabase();

  console.log(`-----------------------------------------------------------------`);
  console.log(`  📦 Módulos Fiori Activos (10 Servicios Integrados):`);
  console.log(`     [00] Dashboard Planeamiento & C4C`);
  console.log(`     [01] Gestión de Requerimientos SolMan 7.2`);
  console.log(`     [02] Control de FUE y Usuarios — Gestión de Roles y Perfiles`);
  console.log(`     [04] Dashboard Incidentes (SAP Joule AI)`);
  console.log(`     [05] SAP WMS - SRM FIORI (Warehouse Management)`);
  console.log(`     [07] Portal de Proveedores SAP (OCR & Notas de Crédito)`);
  console.log(`     [08] Entregas a Rendir & Viáticos (Cajas Chicas)`);
  console.log(`     [11] Gestión de Tipo de Cambio (TCURR / SUNAT)`);
  console.log(`     [12] CRM Portal de Clientes (C4C / Experience Cloud)`);
  console.log(`     [13] Libros Legales & SIRE SUNAT (Localización Perú)`);
  console.log(`=================================================================`);
});

// Auto open browser if requested via CLI flag --open
if (process.argv.includes('--open')) {
  const url = `http://localhost:${PORT}`;
  const startCmd = process.platform === 'win32' ? `start ${url}` : `open ${url}`;
  exec(startCmd);
}
