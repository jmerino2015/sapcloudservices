/* ============================================================
   Route: Materials — CRUD + búsqueda + trigger SAP sync
   ============================================================ */
'use strict';
const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { Material, MaterialUoM, Batch, StockQuant } = require('../models');
const { Op } = require('sequelize');
const router = express.Router();
router.use(authenticate);

// GET /materials?search=cable&type=ROH&page=1&limit=50
router.get('/', async (req, res, next) => {
  try {
    const { search, type, page = 1, limit = 100 } = req.query;
    const where = { status: { [Op.ne]: 'INACTIVE' } };
    if (search) {
      where[Op.or] = [
        { sap_code:    { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (type) where.material_type = type;

    const { count, rows } = await Material.findAndCountAll({
      where,
      include: [{ model: MaterialUoM, as: 'units' }],
      order: [['sap_code', 'ASC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });
    res.json({ data: rows, total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch(e) { next(e); }
});

// GET /materials/:id
router.get('/:id', async (req, res, next) => {
  try {
    const mat = await Material.findByPk(req.params.id, {
      include: [
        { model: MaterialUoM, as: 'units' },
        { model: Batch, as: 'batches', where: { status: 'ACTIVE' }, required: false }
      ]
    });
    if (!mat) return res.status(404).json({ error: 'Material no encontrado' });

    // Stock actual de este material
    const totalStock = await StockQuant.sum('quantity', { where: { material_id: mat.id } });
    res.json({ data: { ...mat.toJSON(), totalStock: totalStock || 0 } });
  } catch(e) { next(e); }
});

// GET /materials/:id/batches
router.get('/:id/batches', async (req, res, next) => {
  try {
    const batches = await Batch.findAll({
      where: { material_id: req.params.id },
      order: [['expiry_date', 'ASC']]
    });
    res.json({ data: batches });
  } catch(e) { next(e); }
});

// POST /materials — crear manual (complemento a SAP)
router.post('/', authorize('admin', 'supervisor'), async (req, res, next) => {
  try {
    const mat = await Material.create(req.body);
    res.status(201).json({ data: mat });
  } catch(e) { next(e); }
});

// PUT /materials/:id
router.put('/:id', authorize('admin', 'supervisor'), async (req, res, next) => {
  try {
    const mat = await Material.findByPk(req.params.id);
    if (!mat) return res.status(404).json({ error: 'Material no encontrado' });
    // SAP fields are read-only from WM Light side
    const { sap_code, ...updatable } = req.body;
    await mat.update(updatable);
    res.json({ data: mat });
  } catch(e) { next(e); }
});

// POST /materials/sap-sync — trigger manual sync
router.post('/sap-sync', authorize('admin', 'supervisor'), async (req, res, next) => {
  try {
    const { syncMaterials } = require('../middleware/sapSync');
    const result = await syncMaterials();
    res.json(result);
  } catch(e) { next(e); }
});

module.exports = router;
