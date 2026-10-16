/* ============================================================
   Route: Stock — consultas de inventario por ubicación
   ============================================================ */
'use strict';
const express = require('express');
const { authenticate } = require('../middleware/auth');
const { StockQuant, StockMovement, Material, Batch, StorageBin, Warehouse } = require('../models');
const { Op } = require('sequelize');
const router = express.Router();
router.use(authenticate);

const INCLUDES = [
  { model: Material,   as: 'material',  attributes: ['sap_code','description','base_unit','min_stock'] },
  { model: Batch,      as: 'batch',     attributes: ['batch_number','expiry_date','status'], required: false },
  { model: StorageBin, as: 'bin',       attributes: ['bin_code','bin_type','status'] },
];

// GET /stock?warehouse=WH001&bin=A-01-01-01&material=4500001
router.get('/', async (req, res, next) => {
  try {
    const { warehouse, bin, material, stockType } = req.query;
    const where = {};
    if (warehouse) where.warehouse_id = warehouse;
    if (stockType)  where.stock_type = stockType;

    // Join conditions
    const binWhere = bin ? { bin_code: { [Op.iLike]: `%${bin}%` } } : {};
    const matWhere = material ? {
      [Op.or]: [
        { sap_code:    { [Op.iLike]: `%${material}%` } },
        { description: { [Op.iLike]: `%${material}%` } }
      ]
    } : {};

    const quants = await StockQuant.findAll({
      where,
      include: [
        { model: Material,   as: 'material',  where: matWhere,  attributes: ['sap_code','description','base_unit','min_stock'] },
        { model: Batch,      as: 'batch',     attributes: ['batch_number','expiry_date','status'], required: false },
        { model: StorageBin, as: 'bin',       where: binWhere,  attributes: ['bin_code','bin_type','status'] },
      ],
      order: [[{ model: StorageBin, as: 'bin' }, 'bin_code', 'ASC']]
    });

    // Enrich with stock status
    const result = quants.map(q => {
      const json = q.toJSON();
      const minStock = json.material?.min_stock || 0;
      json.stockStatus = json.quantity <= 0 ? 'EMPTY'
        : minStock > 0 && json.quantity <= minStock * 0.05 ? 'CRITICAL'
        : minStock > 0 && json.quantity <= minStock * 0.20 ? 'LOW'
        : 'OK';
      return json;
    });

    res.json({ data: result, total: result.length });
  } catch(e) { next(e); }
});

// GET /stock/overview?warehouse=WH001 — KPIs rápidos
router.get('/overview', async (req, res, next) => {
  try {
    const { warehouse } = req.query;
    const where = warehouse ? { warehouse_id: warehouse } : {};
    const [totalQuants, critical, low] = await Promise.all([
      StockQuant.count({ where }),
      StockQuant.findAll({
        where: { ...where, quantity: { [Op.gt]: 0 } },
        include: [{ model: Material, as: 'material', attributes: ['min_stock'] }]
      }),
      StockQuant.sum('quantity', { where })
    ]);
    res.json({ data: { totalPositions: totalQuants, totalStock: low || 0 } });
  } catch(e) { next(e); }
});

// GET /stock/movements?warehouse=WH001&from=2024-01-01&to=2024-01-31&material=...
router.get('/movements', async (req, res, next) => {
  try {
    const { warehouse, from, to, material, limit = 100 } = req.query;
    const where = {};
    if (warehouse) where.warehouse_id = warehouse;
    if (from || to) {
      where.created_at = {};
      if (from) where.created_at[Op.gte] = new Date(from);
      if (to)   where.created_at[Op.lte] = new Date(to + 'T23:59:59');
    }

    const movements = await StockMovement.findAll({
      where,
      include: [
        { model: Material,   as: 'material',  where: material ? { sap_code: { [Op.iLike]: `%${material}%` } } : {}, required: !!material, attributes: ['sap_code','description'] },
        { model: Batch,      as: 'batch',     attributes: ['batch_number'], required: false },
        { model: StorageBin, as: 'fromBin',   attributes: ['bin_code'],    required: false },
        { model: StorageBin, as: 'toBin',     attributes: ['bin_code'],    required: false },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit)
    });
    res.json({ data: movements });
  } catch(e) { next(e); }
});

module.exports = router;
