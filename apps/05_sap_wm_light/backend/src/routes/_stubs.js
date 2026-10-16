/* ============================================================
   Route stubs — All other API endpoints
   These are scaffolded and ready to implement with real DB
   ============================================================ */

'use strict';
const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');

/* ── WAREHOUSES ─────────────────────────────────────────────── */
const warehouses = express.Router();
warehouses.use(authenticate);
warehouses.get('/',            (req, res) => res.json({ data: [], message: 'TODO: list warehouses' }));
warehouses.get('/:id',         (req, res) => res.json({ data: null }));
warehouses.post('/', authorize('admin'), (req, res) => res.status(201).json({ data: req.body }));
warehouses.put('/:id', authorize('admin'), (req, res) => res.json({ data: req.body }));
warehouses.delete('/:id', authorize('admin'), (req, res) => res.status(204).end());
warehouses.get('/:id/bins',    (req, res) => res.json({ data: [] }));
warehouses.get('/:id/kpis',    (req, res) => res.json({ data: {} }));

/* ── MATERIALS ──────────────────────────────────────────────── */
const materials = express.Router();
materials.use(authenticate);
materials.get('/',    (req, res) => res.json({ data: [] }));
materials.get('/:id', (req, res) => res.json({ data: null }));
materials.post('/sap-sync', authorize('admin','supervisor'), async (req, res, next) => {
  try {
    const { syncMaterials } = require('../middleware/sapSync');
    const result = await syncMaterials();
    res.json(result);
  } catch(e) { next(e); }
});

/* ── BATCHES ────────────────────────────────────────────────── */
const batches = express.Router();
batches.use(authenticate);
batches.get('/',    (req, res) => res.json({ data: [] }));
batches.get('/:id', (req, res) => res.json({ data: null }));

/* ── STOCK ──────────────────────────────────────────────────── */
const stock = express.Router();
stock.use(authenticate);
stock.get('/',           (req, res) => res.json({ data: [] }));
stock.get('/overview',   (req, res) => res.json({ data: {} }));
stock.get('/movements',  (req, res) => res.json({ data: [] }));

/* ── TRANSFER ORDERS ────────────────────────────────────────── */
const transferOrders = express.Router();
transferOrders.use(authenticate);
transferOrders.get('/',           (req, res) => res.json({ data: [] }));
transferOrders.get('/:id',        (req, res) => res.json({ data: null }));
transferOrders.post('/',          (req, res) => res.status(201).json({ data: req.body }));
transferOrders.post('/:id/confirm', (req, res) => res.json({ success: true }));
transferOrders.post('/:id/cancel',  (req, res) => res.json({ success: true }));

/* ── GOODS RECEIPT ──────────────────────────────────────────── */
const gr = express.Router();
gr.use(authenticate);
gr.get('/',           (req, res) => res.json({ data: [] }));
gr.get('/:id',        (req, res) => res.json({ data: null }));
gr.post('/',          (req, res) => res.status(201).json({ data: req.body }));
gr.post('/:id/confirm', (req, res) => res.json({ success: true, toGenerated: 0 }));
gr.post('/:id/cancel',  (req, res) => res.json({ success: true }));

/* ── GOODS ISSUE ────────────────────────────────────────────── */
const gi = express.Router();
gi.use(authenticate);
gi.get('/',           (req, res) => res.json({ data: [] }));
gi.get('/:id',        (req, res) => res.json({ data: null }));
gi.post('/',          (req, res) => res.status(201).json({ data: req.body }));
gi.post('/:id/confirm', (req, res) => res.json({ success: true }));
gi.post('/:id/cancel',  (req, res) => res.json({ success: true }));

/* ── INVENTORY COUNTS ───────────────────────────────────────── */
const inventoryCounts = express.Router();
inventoryCounts.use(authenticate);
inventoryCounts.get('/',         (req, res) => res.json({ data: [] }));
inventoryCounts.get('/:id',      (req, res) => res.json({ data: null }));
inventoryCounts.post('/',        (req, res) => res.status(201).json({ data: req.body }));
inventoryCounts.post('/:id/count', (req, res) => res.json({ success: true }));
inventoryCounts.post('/:id/close', authorize('admin','supervisor'), (req, res) => res.json({ success: true }));

/* ── USERS ──────────────────────────────────────────────────── */
const users = express.Router();
users.use(authenticate, authorize('admin'));
users.get('/',    (req, res) => res.json({ data: [] }));
users.get('/:id', (req, res) => res.json({ data: null }));
users.post('/',   (req, res) => res.status(201).json({ data: req.body }));
users.put('/:id', (req, res) => res.json({ data: req.body }));
users.patch('/:id/deactivate', (req, res) => res.json({ success: true }));

/* ── SAP ────────────────────────────────────────────────────── */
const sap = express.Router();
sap.use(authenticate);
sap.get('/status', (req, res) => res.json({ connected: false, message: 'SAP connector not configured' }));
sap.get('/sync/log', (req, res) => res.json({ data: [] }));
sap.post('/sync/materials', authorize('admin','supervisor'), async (req, res, next) => {
  try {
    const { syncMaterials } = require('../middleware/sapSync');
    const result = await syncMaterials();
    res.json(result);
  } catch(e) { next(e); }
});
sap.post('/sync/batches', authorize('admin','supervisor'), async (req, res, next) => {
  try {
    const { syncBatches } = require('../middleware/sapSync');
    const result = await syncBatches();
    res.json(result);
  } catch(e) { next(e); }
});

/* ── REPORTS ────────────────────────────────────────────────── */
const reports = express.Router();
reports.use(authenticate);
reports.get('/stock-snapshot', (req, res) => res.json({ data: [] }));
reports.get('/movements',      (req, res) => res.json({ data: [] }));
reports.get('/to-performance', (req, res) => res.json({ data: {} }));

module.exports = { warehouses, materials, batches, stock, transferOrders, gr, gi, inventoryCounts, users, sap, reports };
