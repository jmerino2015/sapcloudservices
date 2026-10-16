/* ============================================================
   Middleware: SAP Sync Scheduler
   Usa OData connector + modelos Sequelize
   ============================================================ */
'use strict';
const cron = require('node-cron');

const CRON_EXPRESSION = process.env.SAP_SYNC_CRON || '0 */6 * * *';

async function syncMaterials() {
  const sap = require('./sapConnector');
  const { Material, SapSyncLog } = require('../models');
  const log = await SapSyncLog.create({ sync_type: 'MATERIALS', triggered_by: 'scheduler' });
  const t0 = Date.now();
  try {
    const sapMaterials = await sap.getMaterials();
    for (const m of sapMaterials) {
      await Material.upsert({ ...m, sap_sync_at: new Date() });
    }
    await log.update({ status:'SUCCESS', records_synced: sapMaterials.length, duration_ms: Date.now()-t0, finished_at: new Date() });
    console.log(`[SAP Sync] ${sapMaterials.length} materiales sincronizados`);
    return { count: sapMaterials.length, status: 'ok' };
  } catch(err) {
    await log.update({ status:'ERROR', error_detail: err.message, duration_ms: Date.now()-t0, finished_at: new Date() });
    console.error('[SAP Sync] Error materiales:', err.message);
    return { count: 0, status: 'error', error: err.message };
  }
}

async function syncBatches() {
  const sap = require('./sapConnector');
  const { Material, Batch, SapSyncLog } = require('../models');
  const log = await SapSyncLog.create({ sync_type: 'BATCHES', triggered_by: 'scheduler' });
  const t0 = Date.now();
  try {
    const sapBatches = await sap.getBatches();
    let count = 0;
    for (const b of sapBatches) {
      const mat = await Material.findOne({ where: { sap_code: b.sap_code } });
      if (!mat) continue;
      await Batch.upsert({ ...b, material_id: mat.id, sap_sync_at: new Date() });
      count++;
    }
    await log.update({ status:'SUCCESS', records_synced: count, duration_ms: Date.now()-t0, finished_at: new Date() });
    console.log(`[SAP Sync] ${count} lotes sincronizados`);
    return { count, status: 'ok' };
  } catch(err) {
    await log.update({ status:'ERROR', error_detail: err.message, duration_ms: Date.now()-t0, finished_at: new Date() });
    console.error('[SAP Sync] Error lotes:', err.message);
    return { count: 0, status: 'error', error: err.message };
  }
}

async function runSync() {
  const matResult   = await syncMaterials();
  const batchResult = await syncBatches();
  return { materials: matResult, batches: batchResult };
}

if (process.env.NODE_ENV !== 'test') {
  cron.schedule(CRON_EXPRESSION, () => {
    console.log(`[SAP Sync] Ejecutando sync programada (${CRON_EXPRESSION})`);
    runSync();
  });
  console.log(`[SAP Sync] Scheduler activo — Cron: ${CRON_EXPRESSION}`);
}

module.exports = { runSync, syncMaterials, syncBatches };
