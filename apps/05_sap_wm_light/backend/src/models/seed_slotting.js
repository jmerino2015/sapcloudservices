'use strict';
require('dotenv').config();
const { sequelize, Material, StorageBin, GoodsIssue, GoodsIssueItem, Warehouse } = require('./index');

async function seedSlotting() {
  console.log('🔄 Iniciando Seed Slotting...');
  try {
    const wh = await Warehouse.findOne({ where: { id: 'WH001' } });
    if (!wh) throw new Error('Warehouse WH001 not found');

    // 1. Assign Velocity Classes to Bins (First 10 A, next 20 B, rest C)
    const bins = await StorageBin.findAll({ where: { warehouse_id: wh.id } });
    for (let i = 0; i < bins.length; i++) {
      let vClass = 'C';
      if (i < 10) vClass = 'A';
      else if (i < 30) vClass = 'B';
      await bins[i].update({ velocity_class: vClass });
    }
    console.log('✅ Bins clasificados');

    // 2. Simulate historical Goods Issues for ABC and Affinity
    const materials = await Material.findAll();
    if (materials.length >= 2) {
      // Create some fake Goods Issues
      for (let i = 0; i < 20; i++) {
        const gi = await GoodsIssue.create({
          gi_number: `GI-SIM-${i}`,
          warehouse_id: wh.id,
          status: 'CONFIRMED',
          created_by: 1
        });

        // Add item 0 and 1 frequently together (Affinity)
        await GoodsIssueItem.create({
          goods_issue_id: gi.id,
          item_number: 10,
          material_id: materials[0].id,
          requested_qty: 1,
          picked_qty: 1
        });

        // 80% of the time, they are picked together
        if (Math.random() < 0.8) {
          await GoodsIssueItem.create({
            goods_issue_id: gi.id,
            item_number: 20,
            material_id: materials[1].id,
            requested_qty: 1,
            picked_qty: 1
          });
        }
      }
      console.log('✅ Historial de salidas (GI) simulado');
    }

  } catch (err) {
    console.error('❌ Error en Seed Slotting:', err);
  } finally {
    process.exit(0);
  }
}

seedSlotting();
