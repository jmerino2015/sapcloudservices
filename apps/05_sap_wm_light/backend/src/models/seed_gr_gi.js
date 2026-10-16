'use strict';
require('dotenv').config();

async function seed() {
  const db = require('./index');
  await db.sequelize.authenticate();
  console.log('✅ Conexión OK — Insertando GR y GI de prueba...\n');

  const admin = await db.User.findOne({ where: { email: 'admin@jmholding.org' } });
  const wh = await db.Warehouse.findOne({ where: { id: 'WH001' } });
  
  const m1 = await db.Material.findOne({ where: { sap_code: '4500001' } });
  const m2 = await db.Material.findOne({ where: { sap_code: '4500002' } });
  const b1 = await db.Batch.findOne({ where: { batch_number: 'BT2024001' } });

  const grBin = await db.StorageBin.findOne({ where: { warehouse_id: 'WH001', bin_type: 'STAGING', bin_code: 'GR-001' } });
  const giBin = await db.StorageBin.findOne({ where: { warehouse_id: 'WH001', bin_type: 'STAGING', bin_code: 'GI-001' } });

  if (!admin || !wh || !m1 || !m2 || !grBin || !giBin) {
    console.log('Faltan datos base (Usuario, WH, Material, Bin). Ejecuta npm run seed primero.');
    process.exit(1);
  }

  // ── Goods Receipts ──────────────────────────────────────────
  const grData = [
    { gr_number: 'GR-2024-0001', warehouse_id: wh.id, sap_po_number: 'PO-45001', vendor_name: 'Tech Supplier S.A.', status: 'CONFIRMED', created_by: admin.id },
    { gr_number: 'GR-2024-0002', warehouse_id: wh.id, sap_po_number: 'PO-45002', vendor_name: 'Global Electronics', status: 'OPEN', created_by: admin.id },
    { gr_number: 'GR-2024-0003', warehouse_id: wh.id, sap_po_number: 'PO-45003', vendor_name: 'Cables & Redes Ltda.', status: 'CANCELLED', created_by: admin.id }
  ];

  await db.GoodsReceipt.bulkCreate(grData, { ignoreDuplicates: true });
  
  const gr1 = await db.GoodsReceipt.findOne({ where: { gr_number: 'GR-2024-0001' } });
  const gr2 = await db.GoodsReceipt.findOne({ where: { gr_number: 'GR-2024-0002' } });

  if (gr1) {
    await db.GoodsReceiptItem.bulkCreate([
      { goods_receipt_id: gr1.id, item_number: 10, material_id: m1.id, batch_id: b1 ? b1.id : null, planned_qty: 100, received_qty: 100, unit: 'BOB', to_bin_id: grBin.id },
      { goods_receipt_id: gr1.id, item_number: 20, material_id: m2.id, planned_qty: 50, received_qty: 50, unit: 'EA', to_bin_id: grBin.id }
    ], { ignoreDuplicates: true });
  }

  if (gr2) {
    await db.GoodsReceiptItem.bulkCreate([
      { goods_receipt_id: gr2.id, item_number: 10, material_id: m1.id, planned_qty: 200, received_qty: 0, unit: 'BOB', to_bin_id: grBin.id }
    ], { ignoreDuplicates: true });
  }

  console.log('  ✅ Goods Receipts creados (3)');

  // ── Goods Issues ────────────────────────────────────────────
  const giData = [
    { gi_number: 'GI-2024-0001', warehouse_id: wh.id, sap_so_number: 'SO-10001', customer_name: 'Cliente Mayorista', status: 'CONFIRMED', created_by: admin.id },
    { gi_number: 'GI-2024-0002', warehouse_id: wh.id, sap_so_number: 'SO-10002', customer_name: 'Distribuidor Zona Sur', status: 'OPEN', created_by: admin.id },
  ];

  await db.GoodsIssue.bulkCreate(giData, { ignoreDuplicates: true });

  const gi1 = await db.GoodsIssue.findOne({ where: { gi_number: 'GI-2024-0001' } });
  const gi2 = await db.GoodsIssue.findOne({ where: { gi_number: 'GI-2024-0002' } });

  if (gi1) {
    await db.GoodsIssueItem.bulkCreate([
      { goods_issue_id: gi1.id, item_number: 10, material_id: m2.id, planned_qty: 10, issued_qty: 10, unit: 'EA', from_bin_id: giBin.id }
    ], { ignoreDuplicates: true });
  }

  if (gi2) {
    await db.GoodsIssueItem.bulkCreate([
      { goods_issue_id: gi2.id, item_number: 10, material_id: m1.id, planned_qty: 5, issued_qty: 0, unit: 'BOB', from_bin_id: giBin.id }
    ], { ignoreDuplicates: true });
  }

  console.log('  ✅ Goods Issues creados (2)');

  console.log('\n🎉 Datos de GR y GI insertados exitosamente!');
  process.exit(0);
}

seed().catch(err => {
  console.error('\n❌ Error en seed GR/GI:', err.message);
  process.exit(1);
});
