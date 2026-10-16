/* ============================================================
   Route: GR — Goods Receipt (Entrada de Mercancías)
   Al confirmar genera TOs de putaway automáticamente
   ============================================================ */
'use strict';
const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { GoodsReceipt, GoodsReceiptItem, TransferOrder, TransferOrderItem,
        Material, Batch, StorageBin, AuditLog, sequelize } = require('../models');
const { Op } = require('sequelize');
const router = express.Router();
router.use(authenticate);

const GR_INCLUDES = [
  { model: GoodsReceiptItem, as: 'items', include: [
    { model: Material,   as: 'material', attributes: ['sap_code','description','base_unit'] },
    { model: Batch,      as: 'batch',    attributes: ['batch_number','expiry_date'], required: false },
    { model: StorageBin, as: 'bin',      attributes: ['bin_code'], required: false },
  ]}
];

// GET /gr
router.get('/', async (req, res, next) => {
  try {
    const { status, warehouse, page = 1, limit = 50 } = req.query;
    const where = {};
    if (status)    where.status       = status;
    if (warehouse) where.warehouse_id = warehouse;

    const { count, rows } = await GoodsReceipt.findAndCountAll({
      where, include: GR_INCLUDES,
      order: [['created_at','DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page)-1) * parseInt(limit)
    });
    res.json({ data: rows, total: count });
  } catch(e) { next(e); }
});

// GET /gr/:id
router.get('/:id', async (req, res, next) => {
  try {
    const gr = await GoodsReceipt.findByPk(req.params.id, { include: GR_INCLUDES });
    if (!gr) return res.status(404).json({ error: 'Recepción no encontrada' });
    res.json({ data: gr });
  } catch(e) { next(e); }
});

// POST /gr — crear GR
router.post('/', async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { warehouse_id, sap_po_number, receipt_type, vendor_name, delivery_note, putaway_strategy, items = [], notes } = req.body;

    // Auto-number: GR-YYYY-NNNN
    const year  = new Date().getFullYear();
    const count = await GoodsReceipt.count();
    const gr_number = `GR-${year}-${String(count+1).padStart(4,'0')}`;

    const gr = await GoodsReceipt.create({
      gr_number, warehouse_id, sap_po_number, receipt_type: receipt_type || 'PO', vendor_name,
      delivery_note, putaway_strategy: putaway_strategy || 'FEFO',
      notes, created_by: req.user.id, status: 'OPEN'
    }, { transaction: t });

    for (let i = 0; i < items.length; i++) {
      await GoodsReceiptItem.create({
        goods_receipt_id: gr.id,
        item_number: (i+1)*10,
        material_id: items[i].material_id,
        batch_id:    items[i].batch_id,
        planned_qty: items[i].planned_qty,
        received_qty:items[i].received_qty || items[i].planned_qty,
        unit:        items[i].unit,
        to_bin_id:   items[i].to_bin_id,
      }, { transaction: t });
    }
    await t.commit();
    const result = await GoodsReceipt.findByPk(gr.id, { include: GR_INCLUDES });
    res.status(201).json({ data: result });
  } catch(e) { await t.rollback(); next(e); }
});

// POST /gr/:id/confirm — confirmar GR y generar TOs de putaway
router.post('/:id/confirm', async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const gr = await GoodsReceipt.findByPk(req.params.id, { include: GR_INCLUDES, transaction: t, lock: true });
    if (!gr) { await t.rollback(); return res.status(404).json({ error: 'GR no encontrada' }); }
    if (gr.status !== 'OPEN') { await t.rollback(); return res.status(400).json({ error: `GR ya en estado ${gr.status}` }); }

    // Buscar zona GR (staging)
    const grBin = await StorageBin.findOne({ where: { warehouse_id: gr.warehouse_id, bin_type: 'STAGING' } });
    const grBinId = grBin?.id;

    // Generar TO de putaway por cada ítem
    const year  = new Date().getFullYear();
    const toBase = await TransferOrder.count();

    const toItems = [];
    for (let i = 0; i < gr.items.length; i++) {
      const item = gr.items[i];
      // Estrategia putaway: usar destino manual si existe, si no quedar en GR area
      const destBinId = item.to_bin_id || grBinId;
      toItems.push({
        item_number:  (i+1)*10,
        material_id:  item.material_id,
        batch_id:     item.batch_id,
        from_bin_id:  null,
        to_bin_id:    destBinId,
        planned_qty:  item.received_qty,
        unit:         item.unit,
        status:       'OPEN'
      });
    }

    // Crear TO de putaway
    const putawayTO = await TransferOrder.create({
      to_number:     `TO-${year}-${String(toBase+1).padStart(4,'0')}`,
      warehouse_id:  gr.warehouse_id,
      to_type:       'GR',
      reference_type:'GoodsReceipt',
      reference_id:  gr.id,
      created_by:    req.user.id,
      status:        'OPEN',
      notes:         `Putaway automático para ${gr.gr_number}`
    }, { transaction: t });

    for (const itm of toItems) {
      await TransferOrderItem.create({ transfer_order_id: putawayTO.id, ...itm }, { transaction: t });
    }

    // Confirmar GR
    await gr.update({ status: 'CONFIRMED', confirmed_by: req.user.id, confirmed_at: new Date() }, { transaction: t });

    await AuditLog.create({
      user_id: req.user.id, user_email: req.user.email,
      action: 'CONFIRM', entity_type: 'GoodsReceipt',
      entity_id: gr.id, entity_ref: gr.gr_number, ip_address: req.ip
    }, { transaction: t });

    await t.commit();
    res.json({ data: gr, toGenerated: putawayTO.to_number, message: `GR confirmada — TO de putaway ${putawayTO.to_number} generada` });
  } catch(e) { await t.rollback(); next(e); }
});

// POST /gr/:id/cancel
router.post('/:id/cancel', async (req, res, next) => {
  try {
    const gr = await GoodsReceipt.findByPk(req.params.id);
    if (!gr) return res.status(404).json({ error: 'GR no encontrada' });
    if (gr.status !== 'OPEN') return res.status(400).json({ error: 'Solo se pueden cancelar GRs abiertas' });
    await gr.update({ status: 'CANCELLED' });
    res.json({ data: gr });
  } catch(e) { next(e); }
});

module.exports = router;
