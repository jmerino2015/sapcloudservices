'use strict';
require('dotenv').config();
const { sequelize, User, Warehouse, TaskExecution, GoodsIssue, GoodsIssueItem, StorageBin, Material, LaborStandard, SlottingRecommendation } = require('./index');
const SlottingService = require('../services/slottingService');

async function seedDemoData() {
  console.log('🔄 Iniciando generación de Data Demo...');
  try {
    const wh = await Warehouse.findOne({ where: { id: 'WH001' } });
    if (!wh) throw new Error('Warehouse WH001 not found');

    const users = await User.findAll({ limit: 3 });
    if (users.length === 0) throw new Error('No users found');

    // ----------------------------------------------------
    // 1. LMS DEMO DATA (For today)
    // ----------------------------------------------------
    console.log('📦 Generando datos LMS...');
    await TaskExecution.destroy({ where: { warehouse_id: wh.id } });

    const taskTypes = ['PICKING', 'PUTAWAY', 'INTERNAL_MOVE'];
    const today = new Date();
    // Empezar hace 8 horas
    today.setHours(today.getHours() - 8);

    for (let i = 0; i < 20; i++) {
      const user = users[i % users.length];
      const taskType = taskTypes[i % taskTypes.length];
      
      const standardTimeSec = Math.round(120 + (Math.random() * 60));
      const actualTimeSec = Math.round(standardTimeSec * (0.7 + Math.random() * 0.6)); // 70% to 130% efficiency
      
      const startedAt = new Date(today);
      startedAt.setMinutes(startedAt.getMinutes() + (i * 30));
      
      const completedAt = new Date(startedAt);
      completedAt.setSeconds(completedAt.getSeconds() + actualTimeSec);

      await TaskExecution.create({
        user_id: user.id,
        warehouse_id: wh.id,
        task_type: taskType,
        reference_id: 2000 + i,
        reference_number: `TO-DEMO-${2000+i}`,
        started_at: startedAt,
        completed_at: completedAt,
        standard_time_sec: standardTimeSec,
        actual_time_sec: actualTimeSec,
        efficiency_percent: (standardTimeSec / actualTimeSec) * 100
      });
    }

    // ----------------------------------------------------
    // 2. SLOTTING DEMO DATA
    // ----------------------------------------------------
    console.log('📦 Generando datos Slotting...');
    
    // Asignar clases de bins
    const bins = await StorageBin.findAll({ where: { warehouse_id: wh.id } });
    for (let i = 0; i < bins.length; i++) {
      let vClass = 'C';
      if (i < 5) vClass = 'A';
      else if (i < 15) vClass = 'B';
      await bins[i].update({ velocity_class: vClass });
    }

    // Historial de salidas falso
    const materials = await Material.findAll();
    if (materials.length >= 2) {
      await GoodsIssueItem.destroy({ where: {} });
      await GoodsIssue.destroy({ where: { warehouse_id: wh.id } });

      for (let i = 0; i < 30; i++) {
        const gi = await GoodsIssue.create({
          gi_number: `GI-DEMO-${i}`,
          warehouse_id: wh.id,
          status: 'CONFIRMED',
          created_by: 1
        });

        // Material 0 y 1 salen mucho
        await GoodsIssueItem.create({
          goods_issue_id: gi.id, item_number: 10, material_id: materials[0].id, requested_qty: 1, picked_qty: 1
        });
        await GoodsIssueItem.create({
          goods_issue_id: gi.id, item_number: 20, material_id: materials[1].id, requested_qty: 1, picked_qty: 1
        });

        // Material 2 sale a veces
        if (i % 3 === 0 && materials[2]) {
          await GoodsIssueItem.create({
            goods_issue_id: gi.id, item_number: 30, material_id: materials[2].id, requested_qty: 1, picked_qty: 1
          });
        }
      }
    }

    // Ejecutar el motor para generar las recomendaciones YA!
    console.log('⚙️ Ejecutando motor de Slotting...');
    await SlottingService.calculateABC(wh.id);
    await SlottingService.calculateAffinity(wh.id);
    const recs = await SlottingService.generateRecommendations(wh.id);

    // Forzar algunas recomendaciones manuales si no se generaron
    if (recs.recommendations === 0 && materials.length > 0 && bins.length > 10) {
       await SlottingRecommendation.create({
          warehouse_id: wh.id,
          material_id: materials[0].id,
          batch_id: null,
          from_bin_id: bins[bins.length-1].id, // Un bin lento
          to_bin_id: bins[0].id, // Un bin A
          quantity: 10,
          reason: 'MOVE_A_TO_FAST_BIN',
          status: 'PENDING',
          created_by: 1
       });
       await SlottingRecommendation.create({
          warehouse_id: wh.id,
          material_id: materials[1].id,
          batch_id: null,
          from_bin_id: bins[bins.length-2].id,
          to_bin_id: bins[1].id,
          quantity: 25,
          reason: 'MOVE_CLOSER_TO_AFFINITY',
          status: 'PENDING',
          created_by: 1
       });
    }

    console.log('✅ Demo Data insertada correctamente!');
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    process.exit(0);
  }
}

seedDemoData();
