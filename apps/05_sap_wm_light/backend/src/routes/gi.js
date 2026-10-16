/* ============================================================
   Route: GI — Goods Issue (Salida de Mercancías)
   Picking con estrategias FEFO / FIFO / LIFO
   ============================================================ */
'use strict';
const express = require('express');
const { authenticate } = require('../middleware/auth');
const { GoodsIssue, GoodsIssueItem, TransferOrder, TransferOrderItem,
        Material, Batch, StorageBin, StockQuant, AuditLog, sequelize } = require('../models');
const { Op } = require('sequelize');
const router = express.Router();
router.use(authenticate);

const GI_INCLUDES = [
  { model: GoodsIssueItem, as: 'items', include: [
    { model: Material,   as: 'material', attributes: ['sap_code','description','base_unit'] },
    { model: Batch,      as: 'batch',    attributes: ['batch_number','expiry_date'], required: false },
    { model: StorageBin, as: 'bin',      attributes: ['bin_code'], required: false },
  ]}
];

// GET /gi
router.get('/', async (req, res, next) => {
  try {
    const { status, warehouse, page = 1, limit = 50 } = req.query;
    const where = {};
    if (status)    where.status       = status;
    if (warehouse) where.warehouse_id = warehouse;
    const { count, rows } = await GoodsIssue.findAndCountAll({
      where, include: GI_INCLUDES,
      order: [['created_at','DESC']],
      limit: parseInt(limit), offset: (parseInt(page)-1)*parseInt(limit)
    });
    res.json({ data: rows, total: count });
  } catch(e) { next(e); }
});

// GET /gi/:id
router.get('/:id', async (req, res, next) => {
  try {
    const gi = await GoodsIssue.findByPk(req.params.id, { include: GI_INCLUDES });
    if (!gi) return res.status(404).json({ error: 'GI no encontrada' });
    res.json({ data: gi });
  } catch(e) { next(e); }
});

// POST /gi — crear salida
router.post('/', async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { warehouse_id, sap_so_number, issue_type, customer_name, delivery_number,
            picking_strategy, items = [], notes } = req.body;

    const year = new Date().getFullYear();
    const cnt  = await GoodsIssue.count();
    const gi_number = `GI-${year}-${String(cnt+1).padStart(4,'0')}`;

    const gi = await GoodsIssue.create({
      gi_number, warehouse_id, sap_so_number, issue_type: issue_type || 'SO', customer_name,
      delivery_number, picking_strategy: picking_strategy || 'FEFO',
      notes, created_by: req.user.id, status: 'OPEN'
    }, { transaction: t });

    for (let i = 0; i < items.length; i++) {
      // Calcular bin fuente según estrategia picking
      const srcBinId = await _pickBin(
        warehouse_id, items[i].material_id, items[i].batch_id,
        items[i].requested_qty, picking_strategy || 'FEFO', t
      );
      await GoodsIssueItem.create({
        goods_issue_id: gi.id, item_number: (i+1)*10,
        material_id:   items[i].material_id,
        batch_id:      items[i].batch_id,
        requested_qty: items[i].requested_qty,
        unit:          items[i].unit,
        from_bin_id:   srcBinId
      }, { transaction: t });
    }

    await t.commit();
    const result = await GoodsIssue.findByPk(gi.id, { include: GI_INCLUDES });
    res.status(201).json({ data: result });
  } catch(e) { await t.rollback(); next(e); }
});

// POST /gi/:id/confirm — ejecutar picking y generar TO de salida
router.post('/:id/confirm', async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const gi = await GoodsIssue.findByPk(req.params.id, { include: GI_INCLUDES, transaction: t, lock: true });
    if (!gi) { await t.rollback(); return res.status(404).json({ error: 'GI no encontrada' }); }
    if (!['OPEN','PICKING'].includes(gi.status)) {
      await t.rollback();
      return res.status(400).json({ error: `GI ya en estado ${gi.status}` });
    }

    // Buscar GI Area (staging)
    const giBin = await StorageBin.findOne({ where: { warehouse_id: gi.warehouse_id, bin_type: 'STAGING' } });

    // Crear TO de picking
    const year = new Date().getFullYear();
    const toBase = await TransferOrder.count();
    const pickTO = await TransferOrder.create({
      to_number:    `TO-${year}-${String(toBase+1).padStart(4,'0')}`,
      warehouse_id: gi.warehouse_id, to_type: 'GI',
      reference_type: 'GoodsIssue', reference_id: gi.id,
      created_by: req.user.id, status: 'CONFIRMED',
      confirmed_by: req.user.id, confirmed_at: new Date()
    }, { transaction: t });

    for (const item of gi.items) {
      await TransferOrderItem.create({
        transfer_order_id: pickTO.id, item_number: item.item_number,
        material_id: item.material_id, batch_id: item.batch_id,
        from_bin_id: item.from_bin_id, to_bin_id: giBin?.id,
        planned_qty: item.requested_qty, confirmed_qty: item.requested_qty,
        unit: item.unit, status: 'COMPLETED'
      }, { transaction: t });

      // Reducir stock
      if (item.from_bin_id) {
        await StockQuant.decrement('quantity', {
          by: item.requested_qty,
          where: { bin_id: item.from_bin_id, material_id: item.material_id }
        }, { transaction: t });
      }
    }

    await gi.update({
      status: 'CONFIRMED', confirmed_by: req.user.id, confirmed_at: new Date()
    }, { transaction: t });

    await AuditLog.create({
      user_id: req.user.id, user_email: req.user.email,
      action: 'CONFIRM', entity_type: 'GoodsIssue',
      entity_id: gi.id, entity_ref: gi.gi_number, ip_address: req.ip
    }, { transaction: t });

    await t.commit();
    res.json({ data: gi, toGenerated: pickTO.to_number, message: `GI confirmada — TO ${pickTO.to_number}` });
  } catch(e) { await t.rollback(); next(e); }
});

// POST /gi/:id/cancel
router.post('/:id/cancel', async (req, res, next) => {
  try {
    const gi = await GoodsIssue.findByPk(req.params.id);
    if (!gi) return res.status(404).json({ error: 'GI no encontrada' });
    if (gi.status !== 'OPEN') return res.status(400).json({ error: 'Solo se pueden cancelar GIs abiertas' });
    await gi.update({ status: 'CANCELLED' });
    res.json({ data: gi });
  } catch(e) { next(e); }
});

/* ── Picking strategy helper ───────────────────────────────── */
async function _pickBin(warehouseId, materialId, batchId, qty, strategy, t) {
  const order = strategy === 'FEFO'
    ? [[{ model: Batch, as: 'batch' }, 'expiry_date', 'ASC']]
    : strategy === 'LIFO'
    ? [['created_at', 'DESC']]
    : [['created_at', 'ASC']]; // FIFO

  const quant = await StockQuant.findOne({
    where: { warehouse_id: warehouseId, material_id: materialId,
             quantity: { [Op.gte]: qty }, stock_type: 'UNRESTRICTED' },
    include: batchId
      ? [{ model: Batch, as: 'batch', where: { id: batchId } }]
      : [{ model: Batch, as: 'batch', required: false }],
    order,
    transaction: t
  });
  return quant?.bin_id || null;
}

module.exports = router;
