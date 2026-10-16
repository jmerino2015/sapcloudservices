/* ============================================================
   Route: Inventory — Gestión de Toma de Inventario Físico/Cíclico
   Equivalencia SAP WM: LI01N, LI02N, LI11N, LI20, LI21
   ============================================================ */
'use strict';
const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { InventoryCount, InventoryCountBin, InventoryCountItem, StorageBin, StockQuant, StockMovement, Material, Batch } = require('../models');
const sequelize = require('../config/database');
const { Op } = require('sequelize');
const router = express.Router();

router.use(authenticate);

// Utility for generating count number
async function generateCountNumber() {
  const year = new Date().getFullYear();
  const latest = await InventoryCount.findOne({
    where: { count_number: { [Op.like]: `INV-${year}-%` } },
    order: [['id', 'DESC']]
  });
  if (!latest) return `INV-${year}-0001`;
  const num = parseInt(latest.count_number.split('-')[2], 10);
  return `INV-${year}-${String(num + 1).padStart(4, '0')}`;
}

// ── GET /inventory ──────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const counts = await InventoryCount.findAll({
      order: [['id', 'DESC']]
    });
    res.json({ data: counts });
  } catch(e) { next(e); }
});

// ── GET /inventory/:id ──────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const doc = await InventoryCount.findByPk(req.params.id, {
      include: [{
        model: InventoryCountBin, as: 'bins',
        include: [
          { model: StorageBin, as: 'bin' },
          { model: InventoryCountItem, as: 'items', include: [
            { model: Material, as: 'material' },
            { model: Batch, as: 'batch' }
          ]}
        ]
      }]
    });
    if (!doc) return res.status(404).json({ error: 'Documento no encontrado' });
    res.json({ data: doc });
  } catch(e) { next(e); }
});

// ── POST /inventory (LI01N - Crear Documento) ───────────────
router.post('/', authorize('admin', 'supervisor'), async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { warehouse_id, storage_type_id, bin_ids, count_type } = req.body;
    
    if (!warehouse_id || !bin_ids || bin_ids.length === 0) {
      throw new Error('Debe especificar almacén y ubicaciones');
    }

    const count_number = await generateCountNumber();
    const doc = await InventoryCount.create({
      count_number,
      warehouse_id,
      storage_type_id,
      count_type: count_type || 'CYCLIC',
      status: 'PLANNED',
      bins_total: bin_ids.length,
      created_by: req.user.id
    }, { transaction: t });

    const binRecords = bin_ids.map(bin_id => ({
      inventory_count_id: doc.id,
      bin_id,
      status: 'PENDING'
    }));

    await InventoryCountBin.bulkCreate(binRecords, { transaction: t });

    await t.commit();
    res.status(201).json({ data: doc });
  } catch(e) {
    await t.rollback();
    next(e);
  }
});

// ── POST /inventory/:id/activate (LI02N - Activar Doc) ──────
router.post('/:id/activate', authorize('admin', 'supervisor'), async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const doc = await InventoryCount.findByPk(req.params.id, {
      include: [{ model: InventoryCountBin, as: 'bins' }],
      transaction: t
    });

    if (!doc) throw new Error('Documento no encontrado');
    if (doc.status !== 'PLANNED') throw new Error('Solo documentos PLANNED se pueden activar');

    const binIds = doc.bins.map(b => b.bin_id);

    // 1. Validar que no estén bloqueados previamente
    const blockedBins = await StorageBin.count({
      where: { id: binIds, inventory_block: true },
      transaction: t
    });
    if (blockedBins > 0) {
      throw new Error('Una o más ubicaciones ya están bloqueadas por otro inventario');
    }

    // 2. Bloquear Ubicaciones (inventory_block = true)
    await StorageBin.update({ inventory_block: true }, {
      where: { id: binIds },
      transaction: t
    });

    // 3. Tomar snapshot del stock (LINV)
    for (const binRecord of doc.bins) {
      const quants = await StockQuant.findAll({
        where: { bin_id: binRecord.bin_id },
        transaction: t
      });

      if (quants.length > 0) {
        const itemsToCreate = quants.map(q => ({
          inventory_count_bin_id: binRecord.id,
          quant_id: q.id,
          material_id: q.material_id,
          batch_id: q.batch_id,
          system_qty: q.quantity,
          unit: q.unit,
          status: 'PENDING'
        }));
        await InventoryCountItem.bulkCreate(itemsToCreate, { transaction: t });
      } else {
        // Empty bin needs to be counted as 0
        // We do not create LINV items. The UI will just submit 0 if empty.
      }
    }

    doc.status = 'ACTIVE';
    doc.started_at = new Date();
    await doc.save({ transaction: t });

    await t.commit();
    res.json({ data: doc });
  } catch(e) {
    await t.rollback();
    next(e);
  }
});

// ── PUT /inventory/:id/count (LI11N - Ingresar Conteo) ──────
router.put('/:id/count', async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    // req.body.counts = [{ inventory_count_bin_id, items: [{ material_id, batch_id, counted_qty, unit }] }]
    const { counts } = req.body;
    
    const doc = await InventoryCount.findByPk(req.params.id, { transaction: t });
    if (!doc || doc.status !== 'ACTIVE') {
      throw new Error('El documento no está activo para conteo');
    }

    let binsCounted = doc.bins_counted;

    for (const binCount of counts) {
      const binRecord = await InventoryCountBin.findOne({
        where: { id: binCount.inventory_count_bin_id, inventory_count_id: doc.id },
        transaction: t
      });
      if (!binRecord) continue;

      // Handle items
      for (const reqItem of binCount.items) {
        if (reqItem.id) {
          // Update existing item
          await InventoryCountItem.update({
            counted_qty: reqItem.counted_qty,
            status: 'COUNTED'
          }, {
            where: { id: reqItem.id },
            transaction: t
          });
        } else {
          // New material found in bin
          await InventoryCountItem.create({
            inventory_count_bin_id: binRecord.id,
            material_id: reqItem.material_id,
            batch_id: reqItem.batch_id || null,
            system_qty: 0,
            counted_qty: reqItem.counted_qty,
            unit: reqItem.unit,
            status: 'COUNTED'
          }, { transaction: t });
        }
      }

      // If items exist in system but weren't submitted, count them as 0
      await InventoryCountItem.update({
        counted_qty: 0, status: 'COUNTED'
      }, {
        where: { inventory_count_bin_id: binRecord.id, status: 'PENDING' },
        transaction: t
      });

      binRecord.status = 'COUNTED';
      binRecord.counted_by = req.user.id;
      binRecord.counted_at = new Date();
      await binRecord.save({ transaction: t });
      binsCounted++;
    }

    doc.bins_counted = binsCounted;
    if (doc.bins_counted >= doc.bins_total) {
      doc.status = 'COUNTED';
    }
    await doc.save({ transaction: t });

    await t.commit();
    res.json({ message: 'Conteo guardado exitosamente' });
  } catch(e) {
    await t.rollback();
    next(e);
  }
});

// ── POST /inventory/:id/clear-wm (LI20 - Liquidación WM) ────
router.post('/:id/clear-wm', authorize('admin', 'supervisor'), async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const doc = await InventoryCount.findByPk(req.params.id, {
      include: [{
        model: InventoryCountBin, as: 'bins',
        include: [{ model: InventoryCountItem, as: 'items' }]
      }],
      transaction: t
    });

    if (!doc || doc.status !== 'COUNTED') {
      throw new Error('El documento debe estar totalmente contado (COUNTED)');
    }

    const VIRTUAL_WH = 'WH001'; // Fallback
    const TYPE_999_CODE = '999';

    // Asegurar que exista el Tipo 999 en el almacén
    let diffType = await sequelize.models.StorageType.findOne({
      where: { warehouse_id: doc.warehouse_id, code: TYPE_999_CODE },
      transaction: t
    });
    if (!diffType) {
      diffType = await sequelize.models.StorageType.create({
        warehouse_id: doc.warehouse_id,
        code: TYPE_999_CODE,
        name: 'Diferencias Inventario',
        allows_negative_stock: true
      }, { transaction: t });
    }
    // Asegurar bin virtual 999-DIFFERENCE
    let diffBin = await StorageBin.findOne({
      where: { warehouse_id: doc.warehouse_id, storage_type_id: diffType.id, bin_code: 'DIFF-01' },
      transaction: t
    });
    if (!diffBin) {
      diffBin = await StorageBin.create({
        warehouse_id: doc.warehouse_id,
        storage_type_id: diffType.id,
        bin_code: 'DIFF-01',
        bin_type: 'STANDARD',
        status: 'ACTIVE'
      }, { transaction: t });
    }

    for (const binRecord of doc.bins) {
      for (const item of binRecord.items) {
        const diff = parseFloat(item.counted_qty) - parseFloat(item.system_qty);
        
        if (diff !== 0) {
          // 1. Adjust Stock in physical Bin
          if (item.quant_id) {
            const q = await StockQuant.findByPk(item.quant_id, { transaction: t });
            if (q) {
              q.quantity = item.counted_qty;
              if (q.quantity <= 0) await q.destroy({ transaction: t });
              else await q.save({ transaction: t });
            }
          } else {
            if (item.counted_qty > 0) {
              await StockQuant.create({
                warehouse_id: doc.warehouse_id,
                bin_id: binRecord.bin_id,
                material_id: item.material_id,
                batch_id: item.batch_id,
                quantity: item.counted_qty,
                unit: item.unit
              }, { transaction: t });
            }
          }

          // 2. Mover la diferencia al bin 999
          const invDiffQuant = await StockQuant.findOne({
            where: {
              warehouse_id: doc.warehouse_id,
              bin_id: diffBin.id,
              material_id: item.material_id,
              batch_id: item.batch_id || null
            },
            transaction: t
          });

          // Si falta stock (diferencia negativa) = se envía la cantidad al 999 en POSITIVO (porque falta allí para cuadrar contabilidad)
          // En SAP: Diferencia negativa (pérdida) suma en 999. Diferencia positiva (ganancia) resta en 999.
          // Para simplificar: almacenamos la diferencia neta en 999 (-diff)
          const diffFor999 = -diff; 
          if (invDiffQuant) {
            invDiffQuant.quantity = parseFloat(invDiffQuant.quantity) + diffFor999;
            await invDiffQuant.save({ transaction: t });
          } else {
            await StockQuant.create({
              warehouse_id: doc.warehouse_id,
              bin_id: diffBin.id,
              material_id: item.material_id,
              batch_id: item.batch_id || null,
              quantity: diffFor999,
              unit: item.unit
            }, { transaction: t });
          }
        }
        item.status = 'CLEARED';
        await item.save({ transaction: t });
      }

      // Quitar bloqueo de la ubicación
      await StorageBin.update({ inventory_block: false }, {
        where: { id: binRecord.bin_id },
        transaction: t
      });

      binRecord.status = 'CLEARED';
      await binRecord.save({ transaction: t });
    }

    doc.status = 'CLEARED_WM';
    await doc.save({ transaction: t });

    await t.commit();
    res.json({ message: 'Liquidación WM exitosa (LI20)' });
  } catch(e) {
    await t.rollback();
    next(e);
  }
});

// ── POST /inventory/:id/clear-im (LI21 - Liquidación IM) ────
router.post('/:id/clear-im', authorize('admin'), async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const doc = await InventoryCount.findByPk(req.params.id, { transaction: t });
    if (!doc || doc.status !== 'CLEARED_WM') {
      throw new Error('Documento no válido o no liquidado en WM');
    }

    const TYPE_999_CODE = '999';
    const diffType = await sequelize.models.StorageType.findOne({
      where: { warehouse_id: doc.warehouse_id, code: TYPE_999_CODE },
      transaction: t
    });

    if (diffType) {
      // Find all quants in 999 associated with these materials (Simplified)
      // En una implementación real, se liquidan solo los materiales afectados por este documento
      // Aquí vaciaremos el 999 generando movimientos 711/712
      const bins999 = await StorageBin.findAll({
        where: { storage_type_id: diffType.id },
        transaction: t
      });
      const binIds999 = bins999.map(b => b.id);

      const quants999 = await StockQuant.findAll({
        where: { bin_id: binIds999 },
        transaction: t
      });

      for (const q of quants999) {
        if (parseFloat(q.quantity) !== 0) {
          // Generar movimiento IM
          await StockMovement.create({
            material_id: q.material_id,
            batch_id: q.batch_id,
            movement_type_id: parseFloat(q.quantity) > 0 ? 711 : 712, // 711=Pérdida (Gi), 712=Ganancia (Gr)
            quantity: Math.abs(q.quantity),
            from_bin_id: q.quantity > 0 ? q.bin_id : null,
            to_bin_id: q.quantity < 0 ? q.bin_id : null,
            reference_type: 'INV',
            reference_id: doc.count_number,
            user_id: req.user.id
          }, { transaction: t });
          
          await q.destroy({ transaction: t });
        }
      }
    }

    doc.status = 'CLEARED_IM';
    doc.closed_at = new Date();
    await doc.save({ transaction: t });

    await t.commit();
    res.json({ message: 'Liquidación IM exitosa (LI21)' });
  } catch(e) {
    await t.rollback();
    next(e);
  }
});

// ── GET /inventory/dashboard/kpis ───────────────────────────
router.get('/dashboard/kpis', async (req, res, next) => {
  try {
    const docs = await InventoryCount.findAll({
      include: [{
        model: InventoryCountBin, as: 'bins',
        include: [{ model: InventoryCountItem, as: 'items' }]
      }]
    });

    let totalItems = 0;
    let itemsWithoutDiff = 0;
    let absoluteDiffQty = 0;

    docs.forEach(d => {
      d.bins.forEach(b => {
        b.items.forEach(i => {
          totalItems++;
          const diff = Math.abs(parseFloat(i.counted_qty || 0) - parseFloat(i.system_qty || 0));
          if (diff === 0) itemsWithoutDiff++;
          absoluteDiffQty += diff;
        });
      });
    });

    res.json({
      ira: totalItems > 0 ? ((itemsWithoutDiff / totalItems) * 100).toFixed(2) : 0,
      absolute_diff: absoluteDiffQty,
      docs_active: docs.filter(d => d.status === 'ACTIVE' || d.status === 'COUNTED').length
    });
  } catch(e) { next(e); }
});

module.exports = router;
