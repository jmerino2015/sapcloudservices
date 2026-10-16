const express = require('express');
const router = express.Router();
const { sequelize, SlottingRecommendation, TransferOrder, TransferOrderItem, Material, StorageBin } = require('../models');
const { authenticate } = require('../middleware/auth');
const SlottingService = require('../services/slottingService');

router.use(authenticate);

// Ejecutar análisis completo
router.post('/run-analysis', async (req, res) => {
  try {
    const warehouseId = req.user.current_warehouse || req.body.warehouse_id || 'WH001';
    if (!warehouseId) return res.status(400).json({ error: 'Warehouse ID required' });

    const abcResult = await SlottingService.calculateABC(warehouseId);
    const affinityResult = await SlottingService.calculateAffinity(warehouseId);
    const recResult = await SlottingService.generateRecommendations(warehouseId);

    res.json({
      message: 'Análisis de Slotting completado con éxito',
      details: {
        abc: abcResult,
        affinity: affinityResult,
        recommendations: recResult
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error ejecutando análisis de slotting' });
  }
});

// Obtener recomendaciones pendientes
router.get('/recommendations', async (req, res) => {
  try {
    const warehouseId = req.user.current_warehouse || req.query.warehouse_id || 'WH001';
    const recs = await SlottingRecommendation.findAll({
      where: { warehouse_id: warehouseId, status: 'PENDING' },
      include: [
        { model: Material, as: 'material', attributes: ['sap_code', 'description', 'abc_indicator', 'pick_frequency'] },
        { model: StorageBin, as: 'fromBin', attributes: ['bin_code', 'velocity_class'] },
        { model: StorageBin, as: 'toBin', attributes: ['bin_code', 'velocity_class'] }
      ]
    });
    res.json(recs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error obteniendo recomendaciones' });
  }
});

// Aprobar recomendación y generar Transfer Order
router.post('/recommendations/:id/approve', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const recId = req.params.id;
    const rec = await SlottingRecommendation.findByPk(recId, { transaction: t });
    
    if (!rec) { await t.rollback(); return res.status(404).json({ error: 'Recomendación no encontrada' }); }
    if (rec.status !== 'PENDING') { await t.rollback(); return res.status(400).json({ error: 'Recomendación ya fue procesada' }); }

    // Crear la TO interna (TR)
    const to = await TransferOrder.create({
      warehouse_id: rec.warehouse_id,
      to_type: 'TR',
      reference_type: 'SlottingOptimization',
      reference_id: rec.id,
      created_by: req.user.id,
      status: 'OPEN',
      notes: 'Movimiento generado por Slotting Inteligente: ' + rec.reason
    }, { transaction: t });

    await TransferOrderItem.create({
      transfer_order_id: to.id,
      item_number: 10,
      material_id: rec.material_id,
      batch_id: rec.batch_id,
      from_bin_id: rec.from_bin_id,
      to_bin_id: rec.to_bin_id,
      planned_qty: rec.quantity,
      unit: 'EA', // Default, should ideally look up base unit
      status: 'OPEN'
    }, { transaction: t });

    // Marcar recomendación como aprobada
    await rec.update({
      status: 'APPROVED',
      transfer_order_id: to.id,
      processed_by: req.user.id,
      processed_at: new Date()
    }, { transaction: t });

    await t.commit();
    res.json({ message: 'Recomendación aprobada y Orden de Traslado generada', to_number: to.to_number });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ error: 'Error aprobando recomendación' });
  }
});

// Rechazar recomendación
router.post('/recommendations/:id/reject', async (req, res) => {
  try {
    const rec = await SlottingRecommendation.findByPk(req.params.id);
    if (!rec) return res.status(404).json({ error: 'No encontrada' });
    
    await rec.update({
      status: 'REJECTED',
      processed_by: req.user.id,
      processed_at: new Date()
    });
    
    res.json({ message: 'Recomendación rechazada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al rechazar' });
  }
});

module.exports = router;
