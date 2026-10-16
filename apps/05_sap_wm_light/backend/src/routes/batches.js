/* ============================================================
   Route: Batches — Gestión de lotes sincronizados desde SAP
   ============================================================ */
'use strict';
const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { Batch, Material, StockQuant } = require('../models');
const { Op } = require('sequelize');
const router = express.Router();
router.use(authenticate);

// GET /batches?material=4500001&status=ACTIVE
router.get('/', async (req, res, next) => {
  try {
    const { material, status, expiring_days, page = 1, limit = 100 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (expiring_days) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() + parseInt(expiring_days));
      where.expiry_date = { [Op.lte]: cutoff };
    }
    const matWhere = material
      ? { [Op.or]: [{ sap_code: { [Op.iLike]: `%${material}%` } }, { description: { [Op.iLike]: `%${material}%` } }] }
      : {};

    const { count, rows } = await Batch.findAndCountAll({
      where,
      include: [{ model: Material, as: 'material', where: matWhere, attributes: ['sap_code','description','base_unit'] }],
      order: [['expiry_date', 'ASC NULLS LAST']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });
    res.json({ data: rows, total: count });
  } catch(e) { next(e); }
});

// GET /batches/:id
router.get('/:id', async (req, res, next) => {
  try {
    const batch = await Batch.findByPk(req.params.id, {
      include: [{ model: Material, as: 'material' }]
    });
    if (!batch) return res.status(404).json({ error: 'Lote no encontrado' });
    const stock = await StockQuant.sum('quantity', { where: { batch_id: batch.id } });
    res.json({ data: { ...batch.toJSON(), totalStock: stock || 0 } });
  } catch(e) { next(e); }
});

// POST /batches/sap-sync — sync manual
router.post('/sap-sync', authorize('admin', 'supervisor'), async (req, res, next) => {
  try {
    const { syncBatches } = require('../middleware/sapSync');
    const result = await syncBatches();
    res.json(result);
  } catch(e) { next(e); }
});

module.exports = router;
