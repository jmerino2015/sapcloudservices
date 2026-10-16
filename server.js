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
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      });
      try {
        const { username, password } = JSON.parse(body || '{}');
        const uLower = (username || '').toLowerCase();
        if ((uLower === 'admin' || uLower === 'admin@jmholding.org' || uLower === 'admin@fiori-portal.com') &&
            (password === 'admin' || password === 'Admin1234!')) {
          return res.end(JSON.stringify({
            token: 'mock-jwt-token-admin-wm',
            user: {
              id: 1,
              username: 'admin',
              name: 'Administrador SAP WM',
              email: 'admin@fiori-portal.com',
              role: 'admin',
              initials: 'AD',
              warehouses: ['WH001', 'WH002']
            }
          }));
        }
        res.statusCode = 401;
        return res.end(JSON.stringify({ error: 'Credenciales inválidas' }));
      } catch (e) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Formato JSON inválido' }));
      }
    });
    return;
  }

  if (reqUrl === '/api/auth/me' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    });
    return res.end(JSON.stringify({
      id: 1,
      username: 'admin',
      name: 'Administrador SAP WM',
      email: 'admin@fiori-portal.com',
      role: 'admin',
      initials: 'AD',
      warehouses: ['WH001', 'WH002']
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

    if (reqUrl.includes('/kpis')) {
      return res.end(JSON.stringify({
        success: true,
        data: { totalStock: 1450, occupancyPct: 78, openTOs: 14, expiringBatches: 3, grToday: 12, giToday: 8 }
      }));
    }

    if (reqUrl.includes('/to-performance')) {
      return res.end(JSON.stringify({
        success: true,
        data: { open: 14, confirmedToday: 48, cancelledToday: 1, total: 63 }
      }));
    }

    if (reqUrl.includes('/stock-alerts')) {
      return res.end(JSON.stringify({
        success: true,
        expiringBatches: [
          { batch: 'BT202601', material: 'Cable UTP Cat6 305m', expiresAt: '2026-10-15', qty: 50 },
          { batch: 'BT202602', material: 'Fibra Óptica 12H Multi-Modo', expiresAt: '2026-10-20', qty: 30 },
          { batch: 'BT202603', material: 'Conector RJ45 Amphenol', expiresAt: '2026-10-30', qty: 200 }
        ]
      }));
    }

    if (reqUrl.startsWith('/api/transfer-orders')) {
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
      return res.end(JSON.stringify({
        success: true,
        total: 3,
        data: [
          { id: '1', gr_number: 'GR-2026-001', vendor_name: 'Cisco Systems Peru S.A.C.', sap_po_number: '450009812', delivery_note: 'GR-99201', receipt_type: 'PO', status: 'CONFIRMED', created_at: '2026-09-27' },
          { id: '2', gr_number: 'GR-2026-002', vendor_name: 'Panduit Latin America', sap_po_number: '450009815', delivery_note: 'GR-99205', receipt_type: 'PO', status: 'PENDING', created_at: '2026-09-27' },
          { id: '3', gr_number: 'GR-2026-003', vendor_name: 'Schneider Electric Peru', sap_po_number: '450009820', delivery_note: 'GR-99210', receipt_type: 'PO', status: 'CONFIRMED', created_at: '2026-09-26' }
        ]
      }));
    }

    if (reqUrl.startsWith('/api/gi')) {
      return res.end(JSON.stringify({
        success: true,
        total: 3,
        data: [
          { id: '1', gi_number: 'GI-2026-001', customer_name: 'Banco de Crédito del Perú (BCP)', sap_so_number: '80004512', delivery_number: 'DEL-8000123', picking_strategy: 'FEFO', status: 'DISPATCHED', created_at: '2026-09-27' },
          { id: '2', gi_number: 'GI-2026-002', customer_name: 'Interbank Telecomunicaciones', sap_so_number: '80004518', delivery_number: 'DEL-8000129', picking_strategy: 'FIFO', status: 'IN_PICKING', created_at: '2026-09-27' },
          { id: '3', gi_number: 'GI-2026-003', customer_name: 'Minera Las Bambas S.A.', sap_so_number: '80004525', delivery_number: 'DEL-8000135', picking_strategy: 'FEFO', status: 'DISPATCHED', created_at: '2026-09-26' }
        ]
      }));
    }

    if (reqUrl.startsWith('/api/inventory-counts')) {
      return res.end(JSON.stringify({
        success: true,
        total: 3,
        data: [
          { id: '1', count_number: 'INV-2026-001', status: 'ACTIVE', bins_total: 25, bins_counted: 18, warehouse_id: 'WH001', created_at: '2026-09-27' },
          { id: '2', count_number: 'INV-2026-002', status: 'PLANNED', bins_total: 10, bins_counted: 0, warehouse_id: 'WH001', created_at: '2026-09-27' },
          { id: '3', count_number: 'INV-2026-003', status: 'COUNTED', bins_total: 15, bins_counted: 15, warehouse_id: 'WH001', created_at: '2026-09-25' }
        ]
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

    return res.end(JSON.stringify({ success: true, data: [] }));
  }

  if (reqUrl === '/' || reqUrl === '') {
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
