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

    // Verificar si las tablas maestras necesitan seed
    const checkSedes = await pool.query('SELECT COUNT(*) FROM ztb_wh_sede');
    const checkFue = await pool.query('SELECT COUNT(*) FROM ztb_fue_users');
    if (parseInt(checkSedes.rows[0].count, 10) === 0 || parseInt(checkFue.rows[0].count, 10) === 0) {
      console.log('[DB] 📥 Insertando registros demo en tablas vacías...');
      await seedAllTables();
      console.log('[DB] ✨ Registros demo sincronizados exitosamente.');
    }

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
  for (const st of seedData.storage_types) {
    await pool.query(`
      INSERT INTO ztb_storage_types (type_code, description, sections)
      VALUES ($1, $2, $3)
    `, [st.type_code, st.description, JSON.stringify(st.sections)]);
  }

  // 4. Bins
  for (const b of seedData.bins) {
    await pool.query(`
      INSERT INTO ztb_bins (id, bin_code, bin_type, storage_type_id, storage_section_id, max_weight, max_volume, status, has_stock, stock_qty, warehouse_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (id) DO NOTHING
    `, [b.id, b.bin_code, b.bin_type, b.storage_type_id, b.storage_section_id, b.max_weight, b.max_volume, b.status, b.has_stock, b.stock_qty, b.warehouse_id]);
  }

  // 5. Materiales
  for (const m of seedData.materials) {
    await pool.query(`
      INSERT INTO ztb_materials (id, sap_code, description, type, base_unit, stock_total, batch_managed)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO NOTHING
    `, [m.id, m.sap_code, m.description, m.type, m.base_unit, m.stock_total, m.batch_managed]);
  }

  // 6. Stock
  for (const st of seedData.stock) {
    await pool.query(`
      INSERT INTO ztb_stock (bin_code, sap_code, description, batch_number, qty, unit, status, expiry_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [st.bin_code, st.sap_code, st.description, st.batch_number, st.qty, st.unit, st.status, st.expiry_date]);
  }

  // 7. Transfer Orders
  for (const to of seedData.transfer_orders) {
    await pool.query(`
      INSERT INTO ztb_transfer_orders (to_number, to_type, from_bin, to_bin, material_code, material_desc, planned_qty, unit, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (to_number) DO NOTHING
    `, [to.to_number, to.to_type, to.from_bin, to.to_bin, to.material_code, to.material_desc, to.planned_qty, to.unit, to.status, to.created_at]);
  }

  // 8. Yard Locations
  for (const yl of seedData.yard_locations) {
    await pool.query(`
      INSERT INTO ztb_yard_locations (code, description, status, type, current_vehicle)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (code) DO NOTHING
    `, [yl.code, yl.description, yl.status, yl.type, JSON.stringify(yl.current_vehicle)]);
  }

  // 9. Yard Vehicles
  for (const yv of seedData.yard_vehicles) {
    await pool.query(`
      INSERT INTO ztb_yard_vehicles (license_plate, carrier, status, appointments)
      VALUES ($1, $2, $3, $4)
    `, [yv.license_plate, yv.carrier, yv.status, JSON.stringify(yv.appointments)]);
  }

  // 10. FUE Users
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
}

async function refreshTableCounts() {
  if (!pool || !isConnected) return;
  try {
    const tables = ['ztb_wh_sede', 'ztb_warehouses', 'ztb_bins', 'ztb_materials', 'ztb_stock', 'ztb_transfer_orders', 'ztb_yard_locations', 'ztb_fue_users'];
    const counts = {};
    for (const t of tables) {
      const res = await pool.query(`SELECT COUNT(*) FROM ${t}`);
      counts[t] = parseInt(res.rows[0].count, 10);
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

module.exports = {
  initDatabase,
  getDbStatus,
  getWarehouses,
  getStorageTypes,
  getBins,
  getMaterials,
  getStock,
  getTransferOrders,
  getKpiAlmacenesSedes,
  getYardData,
  getFueData,
  saveFueData,
  seedAllTables
};
