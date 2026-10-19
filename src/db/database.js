/**
 * SAP Fiori Solution Portal - Database Management & Cloud Connector
 * 
 * Supports:
 * 1. Public Cloud PostgreSQL (Supabase, Neon, AWS RDS, Render, Railway, Azure) via DATABASE_URL
 * 2. Automatic Schema Migration & Demo Data Seeding
 * 3. Graceful in-memory fallback if DATABASE_URL is not yet configured or temporarily offline
 */

try {
  require('dotenv').config();
} catch (e) {
  // Dotenv es opcional en cloud
}

let Pool = null;
try {
  Pool = require('pg').Pool;
} catch (e) {
  console.warn('[DB] ℹ️ Paquete pg no detectado; operando con dataset demo resiliente.');
}
const fs = require('fs');
const path = require('path');
const seedData = require('./seed_data');
const SAPMockData = require('../../apps/02_control_fue/webapp/model/sapMockData');

let pool = null;
let isConnected = false;
let dbInfo = {
  connected: false,
  provider: 'In-Memory Mock (Pendiente configurar DATABASE_URL)',
  host: 'local',
  database: 'mem-db',
  latencyMs: 0,
  lastChecked: null,
  error: null,
  tableCounts: {}
};

// Fallback in-memory state
let inMemoryState = {
  fueData: JSON.parse(JSON.stringify(SAPMockData.INITIAL_USERS)),
  warehouses: seedData.warehouses,
  storageTypes: seedData.storage_types,
  bins: seedData.bins,
  materials: seedData.materials,
  stock: seedData.stock,
  transferOrders: seedData.transfer_orders,
  goodsReceipts: seedData.goods_receipts || [],
  goodsIssues: seedData.goods_issues || [],
  inventoryCounts: seedData.inventory_counts || [],
  whSedes: seedData.wh_sedes,
  yardLocations: seedData.yard_locations,
  yardVehicles: seedData.yard_vehicles,
  users: seedData.users
};

async function initDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.log('[DB] ⚠️ DATABASE_URL no está definida en .env.');
    console.log('[DB] ℹ️ La aplicación operará con el Dataset Demo en memoria persistente.');
    console.log('[DB] 💡 Para conectar una Base de Datos Pública, configura DATABASE_URL en .env');
    dbInfo.provider = 'Dataset Demo Local (Sin DATABASE_URL)';
    dbInfo.connected = false;
    dbInfo.lastChecked = new Date().toISOString();
    return false;
  }

  try {
    const isLocalhost = databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1');
    const poolConfig = {
      connectionString: databaseUrl,
      ssl: isLocalhost ? false : { rejectUnauthorized: false },
      connectionTimeoutMillis: 8000,
      idleTimeoutMillis: 30000,
      max: 10
    };

    pool = new Pool(poolConfig);

    const start = Date.now();
    const client = await pool.connect();
    const res = await client.query('SELECT current_database(), current_user, version()');
    client.release();
    const latency = Date.now() - start;

    isConnected = true;
    const urlObj = new URL(databaseUrl.replace('postgresql://', 'http://').replace('postgres://', 'http://'));

    dbInfo = {
      connected: true,
      provider: 'PostgreSQL Cloud (Pública)',
      host: urlObj.hostname,
      port: urlObj.port || '5432',
      database: res.rows[0].current_database,
      dbUser: res.rows[0].current_user,
      latencyMs: latency,
      lastChecked: new Date().toISOString(),
      error: null,
      tableCounts: {}
    };

    console.log('=================================================================');
    console.log(`  🌐 BASE DE DATOS PÚBLICA CONECTADA CON ÉXITO:`);
    console.log(`     Proveedor: ${dbInfo.provider}`);
    console.log(`     Servidor:  ${dbInfo.host}:${dbInfo.port}`);
    console.log(`     BD:        ${dbInfo.database} (Usuario: ${dbInfo.dbUser})`);
    console.log(`     Latencia:  ${dbInfo.latencyMs} ms`);
    console.log('=================================================================');

    // Inicializar esquemas y datos si no existen
    await autoMigrateAndSeed();
    return true;

  } catch (err) {
    isConnected = false;
    dbInfo.connected = false;
    dbInfo.error = err.message;
    dbInfo.lastChecked = new Date().toISOString();
    console.error(`[DB] ❌ Error conectando a la base de datos pública: ${err.message}`);
    console.log('[DB] ℹ️ Activando modo de contingencia en memoria...');
    return false;
  }
}

async function autoMigrateAndSeed() {
  if (!pool || !isConnected) return;

  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf8');
      await pool.query(sql);
      console.log('[DB] ✅ Tablas maestras verificadas / creadas (ZTB_*).');
    }

    // Sincronizar registros enriquecidos de forma idempotente
    console.log('[DB] 📥 Sincronizando registros demo enriquecidos en tablas...');
    await seedAllTables();
    console.log('[DB] ✨ Registros demo sincronizados exitosamente.');

    // Actualizar conteos de tablas
    await refreshTableCounts();

  } catch (err) {
    console.error('[DB] ⚠️ Error en migración/seed:', err.message);
  }
}

async function seedAllTables() {
  if (!pool || !isConnected) return;

  // 1. Sedes
  for (const s of seedData.wh_sedes) {
    await pool.query(`
      INSERT INTO ztb_wh_sede (
        client, sede_id, sede_nombre, centro_sap, almacen_sap,
        posiciones_totales, posiciones_ocupadas, posiciones_libres, porcentaje_ocupabilidad,
        paletas_ingreso_hoy, paletas_salida_hoy, peso_ingreso_tn_hoy, peso_salida_tn_hoy,
        ot_pendientes_picking, ot_pendientes_recepcion, ot_pendientes_ubicacion, ot_pendientes_despacho, ot_pendientes_total,
        unidades_programadas, unidades_cargadas, unidades_en_proceso, unidades_pendientes, cumplimiento_ventana_7_10,
        eri_porcentaje, eru_porcentaje, bpa_porcentaje, precision_picking, pedidos_atendidos, otif_porcentaje,
        raccs_abiertos, raccs_cerrados, cinco_s_score, dias_sin_accidentes
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33)
      ON CONFLICT (sede_id) DO NOTHING
    `, [
      s.client, s.sede_id, s.sede_nombre, s.centro_sap, s.almacen_sap,
      s.posiciones_totales, s.posiciones_ocupadas, s.posiciones_libres, s.porcentaje_ocupabilidad,
      s.paletas_ingreso_hoy, s.paletas_salida_hoy, s.peso_ingreso_tn_hoy, s.peso_salida_tn_hoy,
      s.ot_pendientes_picking, s.ot_pendientes_recepcion, s.ot_pendientes_ubicacion, s.ot_pendientes_despacho, s.ot_pendientes_total,
      s.unidades_programadas, s.unidades_cargadas, s.unidades_en_proceso, s.unidades_pendientes, s.cumplimiento_ventana_7_10,
      s.eri_porcentaje, s.eru_porcentaje, s.bpa_porcentaje, s.precision_picking, s.pedidos_atendidos, s.otif_porcentaje,
      s.raccs_abiertos, s.raccs_cerrados, s.cinco_s_score, s.dias_sin_accidentes
    ]);
  }

  // 2. Almacenes
  for (const w of seedData.warehouses) {
    await pool.query(`
      INSERT INTO ztb_warehouses (id, code, name, location, status, total_bins, occupied_bins, occupancy_pct)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO NOTHING
    `, [w.id, w.code, w.name, w.location, w.status, w.total_bins, w.occupied_bins, w.occupancy_pct]);
  }

  // 3. Tipos de Almacenamiento
  const countStorageTypes = await pool.query('SELECT COUNT(*) FROM ztb_storage_types');
  if (parseInt(countStorageTypes.rows[0].count, 10) === 0) {
    for (const st of seedData.storage_types) {
      await pool.query(`
        INSERT INTO ztb_storage_types (type_code, description, sections)
        VALUES ($1, $2, $3)
      `, [st.type_code, st.description, JSON.stringify(st.sections)]);
    }
  }

  // 4. Bins
  for (const b of seedData.bins) {
    try {
      await pool.query(`
        INSERT INTO ztb_bins (id, bin_code, bin_type, storage_type_id, storage_section_id, max_weight, max_volume, status, has_stock, stock_qty, warehouse_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (bin_code) DO UPDATE SET
          status = EXCLUDED.status,
          has_stock = EXCLUDED.has_stock,
          stock_qty = EXCLUDED.stock_qty
      `, [b.id, b.bin_code, b.bin_type, b.storage_type_id, b.storage_section_id, b.max_weight, b.max_volume, b.status, b.has_stock, b.stock_qty, b.warehouse_id]);
    } catch (e) {
      // fallback ignore
    }
  }

  // 5. Materiales
  for (const m of seedData.materials) {
    try {
      await pool.query(`
        INSERT INTO ztb_materials (id, sap_code, description, type, base_unit, stock_total, batch_managed)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (sap_code) DO UPDATE SET
          description = EXCLUDED.description,
          stock_total = EXCLUDED.stock_total
      `, [m.id, m.sap_code, m.description, m.type, m.base_unit, m.stock_total, m.batch_managed]);
    } catch (e) {
      // fallback ignore
    }
  }

  // 6. Stock
  for (const st of seedData.stock) {
    try {
      const existing = await pool.query('SELECT id FROM ztb_stock WHERE bin_code = $1 AND sap_code = $2 LIMIT 1', [st.bin_code, st.sap_code]);
      if (existing.rows.length === 0) {
        await pool.query(`
          INSERT INTO ztb_stock (bin_code, sap_code, description, batch_number, qty, unit, status, expiry_date)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [st.bin_code, st.sap_code, st.description, st.batch_number, st.qty, st.unit, st.status, st.expiry_date]);
      }
    } catch (e) {
      // fallback ignore
    }
  }

  // 7. Transfer Orders
  for (const to of seedData.transfer_orders) {
    try {
      await pool.query(`
        INSERT INTO ztb_transfer_orders (to_number, to_type, from_bin, to_bin, material_code, material_desc, planned_qty, unit, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (to_number) DO NOTHING
      `, [to.to_number, to.to_type, to.from_bin, to.to_bin, to.material_code, to.material_desc, to.planned_qty, to.unit, to.status, to.created_at]);
    } catch (e) {
      // fallback ignore
    }
  }

  // 8. Yard Locations
  for (const yl of seedData.yard_locations) {
    try {
      await pool.query(`
        INSERT INTO ztb_yard_locations (code, description, status, type, current_vehicle)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (code) DO NOTHING
      `, [yl.code, yl.description, yl.status, yl.type, JSON.stringify(yl.current_vehicle)]);
    } catch (e) {
      // fallback ignore
    }
  }

  // 9. Yard Vehicles
  try {
    const countYardVeh = await pool.query('SELECT COUNT(*) FROM ztb_yard_vehicles');
    if (parseInt(countYardVeh.rows[0].count, 10) === 0) {
      for (const yv of seedData.yard_vehicles) {
        await pool.query(`
          INSERT INTO ztb_yard_vehicles (license_plate, carrier, status, appointments)
          VALUES ($1, $2, $3, $4)
        `, [yv.license_plate, yv.carrier, yv.status, JSON.stringify(yv.appointments)]);
      }
    }
  } catch (e) {
    // fallback ignore
  }

  // 10. Goods Receipts
  if (seedData.goods_receipts) {
    for (const gr of seedData.goods_receipts) {
      try {
        await pool.query(`
          INSERT INTO ztb_goods_receipts (gr_number, delivery_note, vendor_name, sap_po_number, receipt_type, status, warehouse_id, items, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (gr_number) DO NOTHING
        `, [gr.gr_number, gr.delivery_note, gr.vendor_name, gr.sap_po_number, gr.receipt_type || 'PO', gr.status || 'PENDING', gr.warehouse_id || 'WH001', JSON.stringify(gr.items || []), gr.created_at]);
      } catch (e) {
        // fallback ignore
      }
    }
  }

  // 11. Goods Issues
  if (seedData.goods_issues) {
    for (const gi of seedData.goods_issues) {
      try {
        await pool.query(`
          INSERT INTO ztb_goods_issues (gi_number, customer_name, sap_so_number, delivery_number, picking_strategy, status, warehouse_id, items, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (gi_number) DO NOTHING
        `, [gi.gi_number, gi.customer_name, gi.sap_so_number, gi.delivery_number, gi.picking_strategy || 'FEFO', gi.status || 'IN_PICKING', gi.warehouse_id || 'WH001', JSON.stringify(gi.items || []), gi.created_at]);
      } catch (e) {
        // fallback ignore
      }
    }
  }

  // 12. Inventory Counts
  if (seedData.inventory_counts) {
    for (const ic of seedData.inventory_counts) {
      try {
        await pool.query(`
          INSERT INTO ztb_inventory_counts (count_number, status, bins_total, bins_counted, warehouse_id, created_at)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (count_number) DO NOTHING
        `, [ic.count_number, ic.status || 'ACTIVE', ic.bins_total || 0, ic.bins_counted || 0, ic.warehouse_id || 'WH001', ic.created_at]);
      } catch (e) {
        // fallback ignore
      }
    }
  }

  // 13. FUE Users
  if (Array.isArray(SAPMockData.INITIAL_USERS)) {
    for (const u of SAPMockData.INITIAL_USERS) {
      const userId = String(u.id || u.Usuarios);
      const nombre = u.NombreCompleto || u.Usuarios || 'Usuario SAP';
      const area = u.Departamento || u.area || '';
      const tipoActual = u.TipoFue || u.tipoUsuarioActual || 'Core';
      const fueVal = u.Fue !== undefined ? u.Fue : 0.2;
      await pool.query(`
        INSERT INTO ztb_fue_users (
          user_id, nombre, area, cargo, tipo_usuario_actual, tipo_usuario_propuesto,
          fue_actual, fue_propuesto, ahorro_fue, actividad_30d, transacciones_mes, estado, justificacion, raw_data
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
        ON CONFLICT (user_id) DO NOTHING
      `, [
        userId, nombre, area, u.cargo || '', tipoActual, u.tipoUsuarioPropuesto || tipoActual,
        fueVal, u.fuePropuesto || fueVal, u.ahorroFUE || 0, u.actividad30d || 0, u.transaccionesMes || 0,
        u.EstadoUsuario || u.estado || 'Activo', u.justificacion || '', JSON.stringify(u)
      ]);
    }
  }

  // 14. Usuarios Fiori y Credenciales de Acceso (ztb_users)
  if (seedData.users) {
    for (const u of seedData.users) {
      try {
        await pool.query(`
          INSERT INTO ztb_users (username, password_hash, full_name, email, role, initials, status, warehouses, language)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (username) DO UPDATE SET
            password_hash = EXCLUDED.password_hash,
            full_name = EXCLUDED.full_name,
            email = EXCLUDED.email,
            role = EXCLUDED.role,
            status = EXCLUDED.status,
            language = EXCLUDED.language,
            updated_at = CURRENT_TIMESTAMP
        `, [u.username, u.password_hash, u.full_name, u.email, u.role || 'admin', u.initials || 'SA', u.status || 'ACTIVE', u.warehouses || ['WH001'], u.language || 'ES']);
      } catch (e) {
        // fallback ignore
      }
    }
  }
}

async function refreshTableCounts() {
  if (!pool || !isConnected) return;
  try {
    const tables = [
      'ztb_users', 'ztb_wh_sede', 'ztb_warehouses', 'ztb_bins', 'ztb_materials', 'ztb_stock',
      'ztb_transfer_orders', 'ztb_yard_locations', 'ztb_goods_receipts',
      'ztb_goods_issues', 'ztb_inventory_counts', 'ztb_fue_users'
    ];
    const counts = {};
    for (const t of tables) {
      try {
        const res = await pool.query(`SELECT COUNT(*) FROM ${t}`);
        counts[t] = parseInt(res.rows[0].count, 10);
      } catch (e) {
        counts[t] = 0;
      }
    }
    dbInfo.tableCounts = counts;
  } catch (e) {
    // ignore count errors
  }
}

// -------------------------------------------------------------
// OPERACIONES DE NEGOCIO (HYBRID: CLOUD DB o EN MEMORIA)
// -------------------------------------------------------------

async function getDbStatus() {
  if (pool && isConnected) {
    try {
      const start = Date.now();
      await pool.query('SELECT 1');
      dbInfo.latencyMs = Date.now() - start;
      dbInfo.lastChecked = new Date().toISOString();
      await refreshTableCounts();
    } catch (e) {
      dbInfo.connected = false;
      dbInfo.error = e.message;
    }
  }
  return dbInfo;
}

async function getWarehouses() {
  if (pool && isConnected) {
    const res = await pool.query('SELECT * FROM ztb_warehouses ORDER BY id');
    return res.rows.map(r => ({
      id: r.id,
      code: r.code,
      name: r.name,
      location: r.location,
      status: r.status,
      totalBins: r.total_bins,
      occupiedBins: r.occupied_bins,
      occupancyPct: parseFloat(r.occupancy_pct)
    }));
  }
  return inMemoryState.warehouses;
}

async function getStorageTypes() {
  if (pool && isConnected) {
    const res = await pool.query('SELECT * FROM ztb_storage_types ORDER BY id');
    return res.rows.map(r => ({
      id: r.id,
      type_code: r.type_code,
      description: r.description,
      sections: r.sections
    }));
  }
  return inMemoryState.storageTypes;
}

async function getBins() {
  if (pool && isConnected) {
    const res = await pool.query('SELECT * FROM ztb_bins ORDER BY bin_code');
    return res.rows.map(r => ({
      id: r.id,
      bin_code: r.bin_code,
      bin_type: r.bin_type,
      storage_type_id: r.storage_type_id,
      storage_section_id: r.storage_section_id,
      max_weight: parseFloat(r.max_weight),
      max_volume: parseFloat(r.max_volume),
      status: r.status,
      has_stock: r.has_stock,
      stock_qty: parseFloat(r.stock_qty),
      warehouse_id: r.warehouse_id
    }));
  }
  return inMemoryState.bins;
}

async function getMaterials() {
  if (pool && isConnected) {
    const res = await pool.query('SELECT * FROM ztb_materials ORDER BY sap_code');
    return res.rows.map(r => ({
      id: r.id,
      sap_code: r.sap_code,
      description: r.description,
      type: r.type,
      base_unit: r.base_unit,
      stock_total: parseFloat(r.stock_total),
      batch_managed: r.batch_managed
    }));
  }
  return inMemoryState.materials;
}

async function getStock() {
  if (pool && isConnected) {
    const res = await pool.query('SELECT * FROM ztb_stock ORDER BY id');
    return res.rows.map(r => ({
      bin_code: r.bin_code,
      sap_code: r.sap_code,
      description: r.description,
      batch_number: r.batch_number,
      qty: parseFloat(r.qty),
      unit: r.unit,
      status: r.status,
      expiry_date: r.expiry_date
    }));
  }
  return inMemoryState.stock;
}

async function getTransferOrders() {
  if (pool && isConnected) {
    const res = await pool.query('SELECT * FROM ztb_transfer_orders ORDER BY id');
    return res.rows.map(r => ({
      id: String(r.id),
      to_number: r.to_number,
      to_type: r.to_type,
      from_bin: r.from_bin,
      to_bin: r.to_bin,
      material_code: r.material_code,
      material_desc: r.material_desc,
      planned_qty: parseFloat(r.planned_qty),
      unit: r.unit,
      status: r.status,
      created_at: r.created_at
    }));
  }
  return inMemoryState.transferOrders;
}

async function updateTransferOrderStatus(id, status) {
  if (pool && isConnected) {
    await pool.query(`UPDATE ztb_transfer_orders SET status = $1 WHERE id = $2 OR to_number = $2`, [status, id]);
  }
  const to = inMemoryState.transferOrders.find(t => String(t.id) === String(id) || t.to_number === id);
  if (to) to.status = status;
  return true;
}

// --- GOODS RECEIPTS (MIGO / Entrada de Mercancías) ---
async function getGoodsReceipts() {
  if (pool && isConnected) {
    const res = await pool.query('SELECT * FROM ztb_goods_receipts ORDER BY id DESC');
    return res.rows.map(r => ({
      id: String(r.id),
      gr_number: r.gr_number,
      delivery_note: r.delivery_note,
      vendor_name: r.vendor_name,
      sap_po_number: r.sap_po_number,
      receipt_type: r.receipt_type,
      status: r.status,
      warehouse_id: r.warehouse_id,
      items: r.items,
      created_at: r.created_at
    }));
  }
  return inMemoryState.goodsReceipts;
}

async function createGoodsReceipt(data) {
  const grNumber = data.gr_number || `GR-2026-${String(Date.now()).slice(-4)}`;
  const dateStr = data.created_at || new Date().toISOString().split('T')[0];
  const item = {
    id: String(Date.now()),
    gr_number: grNumber,
    delivery_note: data.delivery_note || `DN-${grNumber}`,
    vendor_name: data.vendor_name || 'Proveedor SAP Homologado',
    sap_po_number: data.sap_po_number || '450009999',
    receipt_type: data.receipt_type || 'PO',
    status: data.status || 'PENDING',
    warehouse_id: data.warehouse_id || 'WH001',
    items: data.items || [],
    created_at: dateStr
  };
  inMemoryState.goodsReceipts.unshift(item);

  if (pool && isConnected) {
    const res = await pool.query(`
      INSERT INTO ztb_goods_receipts (gr_number, delivery_note, vendor_name, sap_po_number, receipt_type, status, warehouse_id, items, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `, [item.gr_number, item.delivery_note, item.vendor_name, item.sap_po_number, item.receipt_type, item.status, item.warehouse_id, JSON.stringify(item.items), item.created_at]);
    item.id = String(res.rows[0].id);
  }
  return item;
}

async function confirmGoodsReceipt(id) {
  if (pool && isConnected) {
    await pool.query(`UPDATE ztb_goods_receipts SET status = 'CONFIRMED' WHERE id = $1 OR gr_number = $1`, [id]);
  }
  const found = inMemoryState.goodsReceipts.find(g => String(g.id) === String(id) || g.gr_number === id);
  if (found) found.status = 'CONFIRMED';
  return true;
}

// --- GOODS ISSUES (VL02N / Salida de Mercancías) ---
async function getGoodsIssues() {
  if (pool && isConnected) {
    const res = await pool.query('SELECT * FROM ztb_goods_issues ORDER BY id DESC');
    return res.rows.map(r => ({
      id: String(r.id),
      gi_number: r.gi_number,
      customer_name: r.customer_name,
      sap_so_number: r.sap_so_number,
      delivery_number: r.delivery_number,
      picking_strategy: r.picking_strategy,
      status: r.status,
      warehouse_id: r.warehouse_id,
      items: r.items,
      created_at: r.created_at
    }));
  }
  return inMemoryState.goodsIssues;
}

async function createGoodsIssue(data) {
  const giNumber = data.gi_number || `GI-2026-${String(Date.now()).slice(-4)}`;
  const dateStr = data.created_at || new Date().toISOString().split('T')[0];
  const item = {
    id: String(Date.now()),
    gi_number: giNumber,
    customer_name: data.customer_name || 'Cliente Corporativo',
    sap_so_number: data.sap_so_number || '80009999',
    delivery_number: data.delivery_number || `DEL-${giNumber}`,
    picking_strategy: data.picking_strategy || 'FEFO',
    status: data.status || 'IN_PICKING',
    warehouse_id: data.warehouse_id || 'WH001',
    items: data.items || [],
    created_at: dateStr
  };
  inMemoryState.goodsIssues.unshift(item);

  if (pool && isConnected) {
    const res = await pool.query(`
      INSERT INTO ztb_goods_issues (gi_number, customer_name, sap_so_number, delivery_number, picking_strategy, status, warehouse_id, items, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `, [item.gi_number, item.customer_name, item.sap_so_number, item.delivery_number, item.picking_strategy, item.status, item.warehouse_id, JSON.stringify(item.items), item.created_at]);
    item.id = String(res.rows[0].id);
  }
  return item;
}

async function confirmGoodsIssue(id) {
  if (pool && isConnected) {
    await pool.query(`UPDATE ztb_goods_issues SET status = 'DISPATCHED' WHERE id = $1 OR gi_number = $1`, [id]);
  }
  const found = inMemoryState.goodsIssues.find(g => String(g.id) === String(id) || g.gi_number === id);
  if (found) found.status = 'DISPATCHED';
  return true;
}

// --- INVENTORY COUNTS (LI01N, LI11N, LI20) ---
async function getInventoryCounts() {
  if (pool && isConnected) {
    const res = await pool.query('SELECT * FROM ztb_inventory_counts ORDER BY id DESC');
    return res.rows.map(r => ({
      id: String(r.id),
      count_number: r.count_number,
      status: r.status,
      bins_total: r.bins_total,
      bins_counted: r.bins_counted,
      warehouse_id: r.warehouse_id,
      created_at: r.created_at
    }));
  }
  return inMemoryState.inventoryCounts;
}

async function createInventoryCount(data) {
  const countNumber = data.count_number || `INV-2026-${String(Date.now()).slice(-3)}`;
  const dateStr = data.created_at || new Date().toISOString().split('T')[0];
  const item = {
    id: String(Date.now()),
    count_number: countNumber,
    status: data.status || 'ACTIVE',
    bins_total: data.bins_total || 20,
    bins_counted: data.bins_counted || 0,
    warehouse_id: data.warehouse_id || 'WH001',
    created_at: dateStr
  };
  inMemoryState.inventoryCounts.unshift(item);

  if (pool && isConnected) {
    const res = await pool.query(`
      INSERT INTO ztb_inventory_counts (count_number, status, bins_total, bins_counted, warehouse_id, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [item.count_number, item.status, item.bins_total, item.bins_counted, item.warehouse_id, item.created_at]);
    item.id = String(res.rows[0].id);
  }
  return item;
}

async function getKpiAlmacenesSedes() {
  if (pool && isConnected) {
    const res = await pool.query('SELECT * FROM ztb_wh_sede ORDER BY sede_id');
    return res.rows.map(r => ({
      sedeId: r.sede_id,
      sedeNombre: r.sede_nombre,
      centroSap: r.centro_sap,
      almacenSap: r.almacen_sap,
      totalPositions: r.posiciones_totales,
      occupiedPositions: r.posiciones_ocupadas,
      freePositions: r.posiciones_libres,
      occupancyRate: parseFloat(r.porcentaje_ocupabilidad),
      palletsInToday: r.paletas_ingreso_hoy,
      palletsOutToday: r.paletas_salida_hoy,
      weightInTodayTN: parseFloat(r.peso_ingreso_tn_hoy),
      weightOutTodayTN: parseFloat(r.peso_salida_tn_hoy),
      openOtPicking: r.ot_pendientes_picking,
      openOtReceiving: r.ot_pendientes_recepcion,
      openOtPutaway: r.ot_pendientes_ubicacion,
      openOtDispatch: r.ot_pendientes_despacho,
      totalOpenOt: r.ot_pendientes_total,
      scheduledUnitsCount: r.unidades_programadas,
      loadedUnitsCount: r.unidades_cargadas,
      inProcessUnitsCount: r.unidades_en_proceso,
      pendingUnitsCount: r.unidades_pendientes,
      units7to10AmComplianceRate: parseFloat(r.cumplimiento_ventana_7_10),
      eriPercentage: parseFloat(r.eri_porcentaje),
      eruPercentage: parseFloat(r.eru_porcentaje),
      bpaPercentage: parseFloat(r.bpa_porcentaje),
      pickingAccuracy: parseFloat(r.precision_picking),
      ordersFulfilledCount: r.pedidos_atendidos,
      otifPercentage: parseFloat(r.otif_porcentaje),
      raccsOpenCount: r.raccs_abiertos,
      raccsClosedCount: r.raccs_cerrados,
      fiveSScore: parseFloat(r.cinco_s_score),
      daysWithoutAccidents: r.dias_sin_accidentes
    }));
  }
  return inMemoryState.whSedes;
}

async function getYardData() {
  if (pool && isConnected) {
    const resLoc = await pool.query('SELECT * FROM ztb_yard_locations ORDER BY code');
    const resVeh = await pool.query('SELECT * FROM ztb_yard_vehicles ORDER BY id');
    return {
      locations: resLoc.rows.map(r => ({
        code: r.code,
        description: r.description,
        status: r.status,
        type: r.type,
        currentVehicle: r.current_vehicle
      })),
      expectedVehicles: resVeh.rows.map(r => ({
        license_plate: r.license_plate,
        carrier: r.carrier,
        status: r.status,
        appointments: r.appointments
      }))
    };
  }
  return {
    locations: inMemoryState.yardLocations,
    expectedVehicles: inMemoryState.yardVehicles
  };
}

async function getFueData() {
  if (pool && isConnected) {
    const res = await pool.query('SELECT * FROM ztb_fue_users ORDER BY user_id');
    if (res.rows.length > 0) {
      return res.rows.map(r => r.raw_data || ({
        id: r.user_id,
        nombre: r.nombre,
        area: r.area,
        cargo: r.cargo,
        tipoUsuarioActual: r.tipo_usuario_actual,
        tipoUsuarioPropuesto: r.tipo_usuario_propuesto,
        fueActual: parseFloat(r.fue_actual),
        fuePropuesto: parseFloat(r.fue_propuesto),
        ahorroFUE: parseFloat(r.ahorro_fue),
        actividad30d: r.actividad_30d,
        transaccionesMes: r.transacciones_mes,
        estado: r.estado,
        justificacion: r.justificacion
      }));
    }
  }
  return inMemoryState.fueData;
}

async function saveFueData(data) {
  if (!Array.isArray(data)) return false;
  inMemoryState.fueData = data;

  if (pool && isConnected) {
    for (const u of data) {
      const userId = String(u.id || u.Usuarios);
      const nombre = u.NombreCompleto || u.nombre || u.Usuarios || 'Usuario SAP';
      const area = u.Departamento || u.area || '';
      const tipoActual = u.TipoFue || u.tipoUsuarioActual || 'Core';
      const fueVal = u.Fue !== undefined ? u.Fue : (u.fueActual || 0.2);
      await pool.query(`
        INSERT INTO ztb_fue_users (
          user_id, nombre, area, cargo, tipo_usuario_actual, tipo_usuario_propuesto,
          fue_actual, fue_propuesto, ahorro_fue, actividad_30d, transacciones_mes, estado, justificacion, raw_data, last_changed_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id) DO UPDATE SET
          nombre = EXCLUDED.nombre,
          area = EXCLUDED.area,
          tipo_usuario_actual = EXCLUDED.tipo_usuario_actual,
          tipo_usuario_propuesto = EXCLUDED.tipo_usuario_propuesto,
          fue_actual = EXCLUDED.fue_actual,
          fue_propuesto = EXCLUDED.fue_propuesto,
          ahorro_fue = EXCLUDED.ahorro_fue,
          estado = EXCLUDED.estado,
          justificacion = EXCLUDED.justificacion,
          raw_data = EXCLUDED.raw_data,
          last_changed_at = CURRENT_TIMESTAMP
      `, [
        userId, nombre, area, u.cargo || '', tipoActual, u.tipoUsuarioPropuesto || tipoActual,
        fueVal, u.fuePropuesto || fueVal, u.ahorroFUE || 0, u.actividad30d || 0, u.transaccionesMes || 0,
        u.EstadoUsuario || u.estado || 'Activo', u.justificacion || '', JSON.stringify(u)
      ]);
    }
  }
  return true;
}

// --- AUTENTICACIÓN Y GESTIÓN DE USUARIOS (ztb_users) ---
async function authenticateUser(username, password) {
  const uClean = (username || '').trim().toUpperCase();
  const pClean = (password || '').trim();
  if (!uClean || !pClean) return null;

  if (pool && isConnected) {
    try {
      const res = await pool.query('SELECT * FROM ztb_users WHERE UPPER(username) = $1 AND status = \'ACTIVE\' LIMIT 1', [uClean]);
      if (res.rows.length > 0) {
        const dbUser = res.rows[0];
        if (dbUser.password_hash === pClean || dbUser.password_hash === password) {
          try {
            await pool.query('UPDATE ztb_users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [dbUser.id]);
          } catch (e) {}
          return {
            id: dbUser.id,
            username: dbUser.username,
            fullName: dbUser.full_name,
            email: dbUser.email,
            role: dbUser.role,
            initials: dbUser.initials,
            language: dbUser.language || 'ES',
            warehouses: dbUser.warehouses
          };
        }
      }
    } catch (e) {
      console.error('[DB Auth] Error consultando ztb_users:', e.message);
    }
  }

  // Fallback en memoria / contingencia
  const memUsers = inMemoryState.users || seedData.users || [];
  const found = memUsers.find(u => u.username.toUpperCase() === uClean && u.status === 'ACTIVE');
  if (found && (found.password_hash === pClean || found.password_hash === password)) {
    return {
      id: 1,
      username: found.username,
      fullName: found.full_name,
      email: found.email,
      role: found.role,
      initials: found.initials,
      language: found.language || 'ES',
      warehouses: found.warehouses
    };
  }

  // Super-fallback garantizado para usuario solicitado
  if (uClean === 'SAPADMIN' && pClean === 'InicioSAP2027$') {
    return {
      id: 1,
      username: 'SAPADMIN',
      fullName: 'Administrador Principal SAP',
      email: 'sapadmin@fiori-portal.com',
      role: 'admin',
      initials: 'SA',
      language: 'ES',
      warehouses: ['WH001', 'WH002', 'WH003', 'WH004']
    };
  }

  return null;
}

async function changeUserPassword(username, oldPassword, newPassword) {
  const uClean = (username || '').trim().toUpperCase();
  const auth = await authenticateUser(uClean, oldPassword);
  if (!auth) {
    return { success: false, error: 'La contraseña actual no es correcta.' };
  }

  if (pool && isConnected) {
    try {
      await pool.query('UPDATE ztb_users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE UPPER(username) = $2', [newPassword.trim(), uClean]);
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  const memUsers = inMemoryState.users || seedData.users || [];
  const found = memUsers.find(u => u.username.toUpperCase() === uClean);
  if (found) {
    found.password_hash = newPassword.trim();
  }
  return { success: true, message: 'Contraseña actualizada exitosamente.' };
}

async function getSystemUsers() {
  if (pool && isConnected) {
    try {
      const res = await pool.query('SELECT id, username, full_name, email, role, initials, status, warehouses, language, last_login, created_at FROM ztb_users ORDER BY id');
      return res.rows;
    } catch (e) {}
  }
  return inMemoryState.users || seedData.users;
}

module.exports = {
  initDatabase,
  getDbStatus,
  getWarehouses,
  getStorageTypes,
  getBins,
  getMaterials,
  getStock,
  getTransferOrders,
  updateTransferOrderStatus,
  getGoodsReceipts,
  createGoodsReceipt,
  confirmGoodsReceipt,
  getGoodsIssues,
  createGoodsIssue,
  confirmGoodsIssue,
  getInventoryCounts,
  createInventoryCount,
  getKpiAlmacenesSedes,
  getYardData,
  getFueData,
  saveFueData,
  authenticateUser,
  changeUserPassword,
  getSystemUsers,
  seedAllTables
};
