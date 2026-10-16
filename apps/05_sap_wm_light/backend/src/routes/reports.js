/* ============================================================
   Route: Reports — Reportes exportables
   ============================================================ */
'use strict';
const express = require('express');
const { authenticate } = require('../middleware/auth');
const { StockQuant, StockMovement, TransferOrder, Material, Batch, StorageBin, Warehouse, sequelize } = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const router = express.Router();
router.use(authenticate);

// GET /reports/stock-snapshot?warehouse=WH001
router.get('/stock-snapshot', async (req, res, next) => {
  try {
    const { warehouse } = req.query;
    const where = warehouse ? { warehouse_id: warehouse } : {};
    const data = await StockQuant.findAll({
      where,
      include: [
        { model: Material,   as: 'material',  attributes: ['sap_code','description','base_unit','min_stock'] },
        { model: Batch,      as: 'batch',     attributes: ['batch_number','expiry_date'], required: false },
        { model: StorageBin, as: 'bin',       attributes: ['bin_code'] },
      ],
      order: [[{ model: StorageBin, as:'bin' },'bin_code','ASC']]
    });
    res.json({ data, total: data.length, generatedAt: new Date() });
  } catch(e) { next(e); }
});

// GET /reports/movements?warehouse=WH001&from=2024-01-01&to=2024-01-31
router.get('/movements', async (req, res, next) => {
  try {
    const { warehouse, from, to, type } = req.query;
    const where = {};
    if (warehouse) where.warehouse_id = warehouse;
    if (type)      where.movement_type = type;
    if (from || to) {
      where.created_at = {};
      if (from) where.created_at[Op.gte] = new Date(from);
      if (to)   where.created_at[Op.lte] = new Date(`${to}T23:59:59`);
    }
    const data = await StockMovement.findAll({
      where,
      include: [
        { model: Material,   as: 'material',  attributes: ['sap_code','description'] },
        { model: Batch,      as: 'batch',     attributes: ['batch_number'], required: false },
        { model: StorageBin, as: 'fromBin',   attributes: ['bin_code'], required: false },
        { model: StorageBin, as: 'toBin',     attributes: ['bin_code'], required: false },
      ],
      order: [['created_at','DESC']], limit: 5000
    });
    res.json({ data, total: data.length, generatedAt: new Date() });
  } catch(e) { next(e); }
});

// GET /reports/to-performance?warehouse=WH001
router.get('/to-performance', async (req, res, next) => {
  try {
    const { warehouse } = req.query;
    const where = warehouse ? { warehouse_id: warehouse } : {};

    const [total, open, confirmed, cancelled, avgTime] = await Promise.all([
      TransferOrder.count({ where }),
      TransferOrder.count({ where: { ...where, status: 'OPEN' } }),
      TransferOrder.count({ where: { ...where, status: 'CONFIRMED' } }),
      TransferOrder.count({ where: { ...where, status: 'CANCELLED' } }),
      TransferOrder.findOne({
        where: { ...where, status: 'CONFIRMED', confirmed_at: { [Op.ne]: null } },
        attributes: [
          [fn('AVG', literal("EXTRACT(EPOCH FROM (confirmed_at - created_at))/60")), 'avgMinutes']
        ],
        raw: true
      })
    ]);

    res.json({
      data: {
        total, open, confirmed, cancelled,
        completionRate: total > 0 ? Math.round((confirmed / total) * 100) : 0,
        avgCycleTimeMinutes: Math.round(parseFloat(avgTime?.avgMinutes) || 0)
      },
      generatedAt: new Date()
    });
  } catch(e) { next(e); }
});

// GET /reports/stock-alerts?warehouse=WH001
router.get('/stock-alerts', async (req, res, next) => {
  try {
    const { warehouse } = req.query;
    const where = warehouse ? { warehouse_id: warehouse } : {};

    const quants = await StockQuant.findAll({
      where,
      include: [{ model: Material, as: 'material', attributes: ['sap_code','description','base_unit','min_stock'] }]
    });

    const alerts = [];
    for (const q of quants) {
      const min = parseFloat(q.material?.min_stock || 0);
      if (min <= 0) continue;
      const qty = parseFloat(q.quantity);
      if (qty <= min * 0.05)      alerts.push({ ...q.toJSON(), alertType: 'CRITICAL', threshold: min });
      else if (qty <= min * 0.20) alerts.push({ ...q.toJSON(), alertType: 'LOW',      threshold: min });
    }

    // Lotes próximos a vencer (< 30 días)
    const soon = new Date(); soon.setDate(soon.getDate() + 30);
    const expiringBatches = await Batch.findAll({
      where: { expiry_date: { [Op.lte]: soon }, status: 'ACTIVE' },
      include: [{ model: Material, as: 'material', attributes: ['sap_code','description'] }]
    });

    res.json({ stockAlerts: alerts, expiringBatches, generatedAt: new Date() });
  } catch(e) { next(e); }
});

module.exports = router;
