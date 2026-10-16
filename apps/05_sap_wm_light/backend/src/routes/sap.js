/* ============================================================
   Route: SAP — Estado de conexión, sync y confirmaciones
   ============================================================ */
'use strict';
const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { SapSyncLog } = require('../models');
const router = express.Router();
router.use(authenticate);

// GET /sap/status — estado de conexión SAP
router.get('/status', async (req, res, next) => {
  try {
    const sap = require('../middleware/sapConnector');
    const result = await sap.ping();
    const lastSync = await SapSyncLog.findOne({
      where: { status: 'SUCCESS' }, order: [['finished_at','DESC']]
    });
    res.json({
      connected: result.connected,
      latency:   result.latency || null,
      error:     result.error   || null,
      lastSync:  lastSync?.finished_at || null,
      lastSyncType: lastSync?.sync_type || null,
    });
  } catch(e) { next(e); }
});

// GET /sap/sync/log — historial de sincronizaciones
router.get('/sync/log', async (req, res, next) => {
  try {
    const logs = await SapSyncLog.findAll({
      order: [['started_at','DESC']], limit: 50
    });
    res.json({ data: logs });
  } catch(e) { next(e); }
});

// POST /sap/sync/materials — sync manual de materiales
router.post('/sync/materials', authorize('admin','supervisor'), async (req, res, next) => {
  try {
    const { syncMaterials } = require('../middleware/sapSync');
    const result = await syncMaterials();
    res.json(result);
  } catch(e) { next(e); }
});

// POST /sap/sync/batches — sync manual de lotes
router.post('/sync/batches', authorize('admin','supervisor'), async (req, res, next) => {
  try {
    const { syncBatches } = require('../middleware/sapSync');
    const result = await syncBatches();
    res.json(result);
  } catch(e) { next(e); }
});

// POST /sap/sync/full — sync completa
router.post('/sync/full', authorize('admin'), async (req, res, next) => {
  try {
    const { runSync } = require('../middleware/sapSync');
    const result = await runSync();
    res.json(result);
  } catch(e) { next(e); }
});

// POST /sap/movements — confirmar movimiento en SAP
router.post('/movements', authorize('admin','supervisor'), async (req, res, next) => {
  try {
    const sap = require('../middleware/sapConnector');
    const result = await sap.postGoodsMovement(req.body);
    res.json(result);
  } catch(e) { next(e); }
});

module.exports = router;
