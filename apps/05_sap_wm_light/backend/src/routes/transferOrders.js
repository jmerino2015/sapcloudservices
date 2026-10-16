/* ============================================================
   Route: Transfer Orders — CRUD + confirm + cancel
   Incluye lógica de movimiento de stock al confirmar
   ============================================================ */
'use strict';
const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { TransferOrder, TransferOrderItem, Material, Batch, StorageBin, StockQuant, StockMovement, AuditLog } = require('../models');
const { sequelize } = require('../models');
const { Op } = require('sequelize');
const LmsService = require('../services/lmsService');
const router = express.Router();
router.use(authenticate);

const TO_INCLUDES = [
  { model: TransferOrderItem, as: 'items', include: [
    { model: Material,   as: 'material',  attributes: ['sap_code','description','base_unit'] },
    { model: Batch,      as: 'batch',     attributes: ['batch_number','expiry_date'], required: false },
    { model: StorageBin, as: 'fromBin',   attributes: ['bin_code'], required: false },
    { model: StorageBin, as: 'toBin',     attributes: ['bin_code'] },
  ]}
];

// GET /transfer-orders?status=OPEN&type=GR&warehouse=WH001
router.get('/', async (req, res, next) => {
  try {
    const { status, type, warehouse, page = 1, limit = 50 } = req.query;
    const where = {};
    if (status)    where.status       = status;
    if (type)      where.to_type      = type;
    if (warehouse) where.warehouse_id = warehouse;

    const { count, rows } = await TransferOrder.findAndCountAll({
      where,
      include: TO_INCLUDES,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });
    res.json({ data: rows, total: count });
  } catch(e) { next(e); }
});

// GET /transfer-orders/:id
router.get('/:id', async (req, res, next) => {
  try {
    const to = await TransferOrder.findByPk(req.params.id, { include: TO_INCLUDES });
    if (!to) return res.status(404).json({ error: 'Transfer Order no encontrada' });
    res.json({ data: to });
  } catch(e) { next(e); }
});

// POST /transfer-orders — crear nueva TO
router.post('/', async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { warehouse_id, to_type, reference_type, reference_id, sap_reference, items = [], notes } = req.body;

    const to = await TransferOrder.create({
      warehouse_id, to_type, reference_type, reference_id, sap_reference,
      notes, created_by: req.user.id, status: 'OPEN'
    }, { transaction: t });

    for (let i = 0; i < items.length; i++) {
      await TransferOrderItem.create({
        transfer_order_id: to.id,
        item_number: (i + 1) * 10,
        material_id: items[i].material_id,
        batch_id:    items[i].batch_id,
        from_bin_id: items[i].from_bin_id,
        to_bin_id:   items[i].to_bin_id,
        planned_qty: items[i].planned_qty,
        unit:        items[i].unit,
        status: 'OPEN'
      }, { transaction: t });
    }

    await t.commit();
    const result = await TransferOrder.findByPk(to.id, { include: TO_INCLUDES });
    res.status(201).json({ data: result });
  } catch(e) { await t.rollback(); next(e); }
});

// POST /transfer-orders/:id/start — Iniciar TO (LMS)
router.post('/:id/start', async (req, res, next) => {
  try {
    const to = await TransferOrder.findByPk(req.params.id, { include: TO_INCLUDES });
    if (!to) return res.status(404).json({ error: 'TO no encontrada' });
    if (to.status !== 'OPEN') return res.status(400).json({ error: `TO ya está en estado ${to.status}` });

    // Determinar items para LMS
    const totalItems = to.items ? to.items.length : 1;
    let taskType = 'INTERNAL_MOVE';
    if (to.to_type === 'GR') taskType = 'PUTAWAY';
    if (to.to_type === 'GI') taskType = 'PICKING';

    const standardTimeSec = await LmsService.calculateStandardTime(to.warehouse_id, taskType, totalItems);

    await to.update({
      status: 'IN_PROGRESS',
      started_at: new Date(),
      standard_time_sec: standardTimeSec
    });

    res.json({ data: to, message: 'Transfer Order iniciada' });
  } catch(e) { next(e); }
});

// POST /transfer-orders/:id/confirm — ejecutar movimiento de stock
router.post('/:id/confirm', async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const to = await TransferOrder.findByPk(req.params.id, {
      include: TO_INCLUDES, lock: true, transaction: t
    });
    if (!to) { await t.rollback(); return res.status(404).json({ error: 'TO no encontrada' }); }
    if (to.status !== 'OPEN') { await t.rollback(); return res.status(400).json({ error: `TO ya está en estado ${to.status}` }); }

    for (const item of to.items) {
      const confirmedQty = req.body.quantities?.[item.id] ?? item.planned_qty;

      // 1. Reducir stock en origen (si aplica)
      if (item.from_bin_id) {
        const fromQuant = await StockQuant.findOne({
          where: { bin_id: item.from_bin_id, material_id: item.material_id, batch_id: item.batch_id || null },
          transaction: t, lock: true
        });
        if (!fromQuant || fromQuant.quantity < confirmedQty) {
          await t.rollback();
          return res.status(400).json({ error: `Stock insuficiente en ${item.fromBin?.bin_code} para ${item.material?.sap_code}` });
        }
        await fromQuant.decrement('quantity', { by: confirmedQty, transaction: t });
        if (parseFloat(fromQuant.quantity) - confirmedQty <= 0) {
          await fromQuant.destroy({ transaction: t });
        }
      }

      // 2. Aumentar stock en destino
      const [toQuant] = await StockQuant.findOrCreate({
        where: {
          warehouse_id: to.warehouse_id,
          bin_id:       item.to_bin_id,
          material_id:  item.material_id,
          batch_id:     item.batch_id || null,
          stock_type:   'UNRESTRICTED'
        },
        defaults: { quantity: 0, unit: item.unit },
        transaction: t
      });
      await toQuant.increment('quantity', { by: confirmedQty, transaction: t });

      // 3. Registrar movimiento
      await StockMovement.create({
        warehouse_id:  to.warehouse_id,
        material_id:   item.material_id,
        batch_id:      item.batch_id,
        from_bin_id:   item.from_bin_id,
        to_bin_id:     item.to_bin_id,
        quantity:      confirmedQty,
        unit:          item.unit,
        movement_type: to.to_type,
        reference_type:'TransferOrder',
        reference_id:  to.id,
        user_id:       req.user.id
      }, { transaction: t });

      // 4. Actualizar item
      await item.update({ confirmed_qty: confirmedQty, status: 'COMPLETED' }, { transaction: t });
    }

    // 5. Cerrar TO
    const confirmedAt = new Date();
    await to.update({
      status: 'CONFIRMED',
      confirmed_by: req.user.id,
      confirmed_at: confirmedAt
    }, { transaction: t });

    // LMS: Registrar ejecución si la TO fue iniciada
    if (to.started_at) {
      let taskType = 'INTERNAL_MOVE';
      if (to.to_type === 'GR') taskType = 'PUTAWAY';
      if (to.to_type === 'GI') taskType = 'PICKING';

      await LmsService.recordTaskExecution(
        req.user.id,
        to.warehouse_id,
        taskType,
        to.id,
        to.to_number,
        to.started_at,
        confirmedAt,
        to.standard_time_sec || 0
      ).catch(err => console.error('LMS Record Error:', err)); // Non-blocking
    }

    // 6. Auditoría
    await AuditLog.create({
      user_id: req.user.id, user_email: req.user.email,
      action: 'CONFIRM', entity_type: 'TransferOrder',
      entity_id: to.id, entity_ref: to.to_number,
      ip_address: req.ip
    }, { transaction: t });

    await t.commit();
    const result = await TransferOrder.findByPk(to.id, { include: TO_INCLUDES });
    res.json({ data: result, message: 'Transfer Order confirmada y stock actualizado' });
  } catch(e) { await t.rollback(); next(e); }
});

// POST /transfer-orders/:id/cancel
router.post('/:id/cancel', async (req, res, next) => {
  try {
    const to = await TransferOrder.findByPk(req.params.id);
    if (!to) return res.status(404).json({ error: 'TO no encontrada' });
    if (!['OPEN','IN_PROGRESS'].includes(to.status)) {
      return res.status(400).json({ error: 'Solo se pueden cancelar TOs abiertas' });
    }
    await to.update({
      status: 'CANCELLED',
      cancelled_by: req.user.id,
      cancelled_at: new Date(),
      cancel_reason: req.body.reason || ''
    });
    res.json({ data: to, message: 'Transfer Order cancelada' });
  } catch(e) { next(e); }
});

module.exports = router;
