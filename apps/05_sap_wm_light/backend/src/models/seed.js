/* ============================================================
   seed.js — Datos iniciales de demostración
   Uso: npm run seed
   ============================================================ */
'use strict';
require('dotenv').config();

async function seed() {
  const db = require('./index');
  await db.sequelize.authenticate();
  console.log('✅ Conexión OK — Insertando datos semilla...\n');

  // ── Usuarios ──────────────────────────────────────────────
  const bcrypt = require('bcryptjs');
  const adminHash = await bcrypt.hash('Admin1234!', 10);
  const opHash    = await bcrypt.hash('Oper1234!', 10);

  await db.User.bulkCreate([
    { name:'Administrador',   email:'admin@jmholding.org',        password_hash: adminHash, role:'admin',      initials:'AD', status:'ACTIVE' },
    { name:'Juan Pérez',      email:'jperez@wmlight.com',     password_hash: adminHash, role:'supervisor', initials:'JP', status:'ACTIVE' },
    { name:'María Gómez',     email:'mgomez@wmlight.com',     password_hash: opHash,    role:'operator',   initials:'MG', status:'ACTIVE' },
    { name:'Luis Rodríguez',  email:'lrodriguez@wmlight.com', password_hash: opHash,    role:'operator',   initials:'LR', status:'ACTIVE' },
    { name:'Ana López',       email:'alopez@wmlight.com',     password_hash: opHash,    role:'operator',   initials:'AL', status:'ACTIVE' },
  ], { ignoreDuplicates: true });
  console.log('  ✅ Usuarios (5)');

  // ── Almacenes ──────────────────────────────────────────────
  await db.Warehouse.bulkCreate([
    { id:'WH001', name:'Almacén Principal',   location:'Zona Industrial Norte, Bogotá', status:'ACTIVE' },
    { id:'WH002', name:'Almacén Secundario',  location:'Zona Sur, Bogotá',              status:'ACTIVE' },
  ], { ignoreDuplicates: true });
  console.log('  ✅ Almacenes (2)');

  // ── Storage Types ──────────────────────────────────────────
  await db.StorageType.bulkCreate([
    { warehouse_id:'WH001', code:'HB', name:'Almacenaje en Bloque' },
    { warehouse_id:'WH001', code:'GR', name:'Zona de Recepción (GR)' },
    { warehouse_id:'WH001', code:'GI', name:'Zona de Expedición (GI)' },
    { warehouse_id:'WH002', code:'HB', name:'Almacenaje en Bloque' },
    { warehouse_id:'WH002', code:'GR', name:'Zona de Recepción (GR)' },
  ], { ignoreDuplicates: true });
  console.log('  ✅ Tipos de almacenaje (5)');

  // ── Storage Sections ───────────────────────────────────────
  const hb1 = await db.StorageType.findOne({ where: { warehouse_id:'WH001', code:'HB' } });
  if (hb1) {
    await db.StorageSection.bulkCreate([
      { storage_type_id: hb1.id, code:'A', name:'Zona A — Alta rotación' },
      { storage_type_id: hb1.id, code:'B', name:'Zona B — Media rotación' },
      { storage_type_id: hb1.id, code:'C', name:'Zona C — Baja rotación' },
    ], { ignoreDuplicates: true });
    console.log('  ✅ Secciones de almacenaje (3)');
  }

  // ── Storage Bins (72 ubicaciones WH001 + 24 staging) ──────
  const gr1  = await db.StorageType.findOne({ where: { warehouse_id:'WH001', code:'GR' } });
  const gi1  = await db.StorageType.findOne({ where: { warehouse_id:'WH001', code:'GI' } });
  const bins = [];

  const zoneRows = {
    'A': await db.StorageSection.findOne({ where: { storage_type_id: hb1?.id, code:'A' } }),
    'B': await db.StorageSection.findOne({ where: { storage_type_id: hb1?.id, code:'B' } }),
    'C': await db.StorageSection.findOne({ where: { storage_type_id: hb1?.id, code:'C' } }),
  };

  const rowsToCreate = ['A','B','C','D','E','F','G','H','I','J'];
  if (hb1) {
    for (const row of rowsToCreate) {
      // Find or create section (fallback to 'A' if not explicitly defined)
      const secId = zoneRows[row]?.id || zoneRows['A']?.id;
      for (let bay = 1; bay <= 10; bay++) {
        for (let level = 1; level <= 4; level++) {
          for (let pos = 1; pos <= 2; pos++) {
            bins.push({
              warehouse_id:       'WH001',
              storage_type_id:    hb1.id,
              storage_section_id: secId,
              bin_code:  `${row}-${String(bay).padStart(2,'0')}-0${level}-0${pos}`,
              row, bay: String(bay).padStart(2,'0'),
              level: String(level).padStart(2,'0'),
              position: String(pos).padStart(2,'0'),
              max_weight: 1000, status: 'ACTIVE', bin_type: 'STANDARD'
            });
          }
        }
      }
    }
  }
  // Staging bins GR
  if (gr1) {
    for (let i = 1; i <= 4; i++) {
      bins.push({ warehouse_id:'WH001', storage_type_id: gr1.id, bin_code:`GR-00${i}`, bin_type:'STAGING', status:'ACTIVE', max_weight:2000 });
    }
  }
  // Staging bins GI
  if (gi1) {
    for (let i = 1; i <= 4; i++) {
      bins.push({ warehouse_id:'WH001', storage_type_id: gi1.id, bin_code:`GI-00${i}`, bin_type:'STAGING', status:'ACTIVE', max_weight:2000 });
    }
  }

  // WH002 bins
  const hb2 = await db.StorageType.findOne({ where: { warehouse_id:'WH002', code:'HB' } });
  if (hb2) {
    for (let bay = 1; bay <= 4; bay++) {
      for (let level = 1; level <= 3; level++) {
        bins.push({ warehouse_id:'WH002', storage_type_id: hb2.id,
          bin_code:`A-0${bay}-0${level}-01`, row:'A', bay:String(bay).padStart(2,'0'),
          level:String(level).padStart(2,'0'), position:'01', max_weight:1000, status:'ACTIVE', bin_type:'STANDARD' });
      }
    }
  }

  await db.StorageBin.bulkCreate(bins, { ignoreDuplicates: true });
  console.log(`  ✅ Ubicaciones (${bins.length} bins)`);

  // ── Materiales ─────────────────────────────────────────────
  await db.Material.bulkCreate([
    { sap_code:'4500001', description:'Cable UTP Cat6 305m',           material_type:'ROH',  base_unit:'BOB', batch_managed:true,  min_stock:5,  status:'ACTIVE' },
    { sap_code:'4500002', description:'Switch 24 puertos PoE',         material_type:'FERT', base_unit:'EA',  batch_managed:false, min_stock:2,  status:'ACTIVE' },
    { sap_code:'4500003', description:'Rack 42U 800mm',                material_type:'HALB', base_unit:'EA',  batch_managed:false, min_stock:5,  status:'ACTIVE' },
    { sap_code:'4500004', description:'Patch Panel 24p Cat6',          material_type:'ROH',  base_unit:'EA',  batch_managed:false, min_stock:10, status:'ACTIVE' },
    { sap_code:'4500005', description:'UPS 1500VA Line-Interactiva',   material_type:'FERT', base_unit:'EA',  batch_managed:true,  min_stock:5,  status:'ACTIVE' },
    { sap_code:'4500006', description:'Cable de Fibra Óptica SM 12h',  material_type:'ROH',  base_unit:'M',   batch_managed:false, min_stock:100,status:'ACTIVE' },
    { sap_code:'4500007', description:'Bandeja de Fibra Óptica 24p',   material_type:'ROH',  base_unit:'EA',  batch_managed:false, min_stock:3,  status:'ACTIVE' },
  ], { ignoreDuplicates: true });
  console.log('  ✅ Materiales (7)');

  // ── Lotes ──────────────────────────────────────────────────
  const mat1 = await db.Material.findOne({ where: { sap_code:'4500001' } });
  const mat5 = await db.Material.findOne({ where: { sap_code:'4500005' } });
  if (mat1 && mat5) {
    await db.Batch.bulkCreate([
      { material_id: mat1.id, batch_number:'BT2024001', manufacture_date:'2023-06-01', expiry_date:'2026-06-01', status:'ACTIVE' },
      { material_id: mat1.id, batch_number:'BT2024012', manufacture_date:'2024-01-10', expiry_date:'2027-01-10', status:'ACTIVE' },
      { material_id: mat5.id, batch_number:'BT2024045', manufacture_date:'2023-09-15', expiry_date:'2026-09-15', status:'ACTIVE' },
    ], { ignoreDuplicates: true });
    console.log('  ✅ Lotes (3)');
  }

  // ── Stock inicial ──────────────────────────────────────────
  const b1 = await db.StorageBin.findOne({ where: { warehouse_id:'WH001', bin_code:'A-01-01-01' } });
  const b2 = await db.StorageBin.findOne({ where: { warehouse_id:'WH001', bin_code:'A-01-01-02' } });
  const b3 = await db.StorageBin.findOne({ where: { warehouse_id:'WH001', bin_code:'A-01-02-01' } });
  const b4 = await db.StorageBin.findOne({ where: { warehouse_id:'WH001', bin_code:'B-02-01-01' } });
  const b5 = await db.StorageBin.findOne({ where: { warehouse_id:'WH001', bin_code:'B-02-02-01' } });
  const b6 = await db.StorageBin.findOne({ where: { warehouse_id:'WH001', bin_code:'C-03-01-01' } });

  const mat2 = await db.Material.findOne({ where: { sap_code:'4500002' } });
  const mat3 = await db.Material.findOne({ where: { sap_code:'4500003' } });
  const mat4 = await db.Material.findOne({ where: { sap_code:'4500004' } });
  const mat6 = await db.Material.findOne({ where: { sap_code:'4500006' } });
  const bt1  = await db.Batch.findOne({ where: { batch_number:'BT2024001' } });
  const bt45 = await db.Batch.findOne({ where: { batch_number:'BT2024045' } });

  const stockData = [];
  if (b1 && mat1 && bt1)  stockData.push({ warehouse_id:'WH001', bin_id:b1.id, material_id:mat1.id, batch_id:bt1.id,  quantity:25, unit:'BOB', stock_type:'UNRESTRICTED' });
  if (b2 && mat2)          stockData.push({ warehouse_id:'WH001', bin_id:b2.id, material_id:mat2.id, quantity:8,  unit:'EA',  stock_type:'UNRESTRICTED' });
  if (b3 && mat3)          stockData.push({ warehouse_id:'WH001', bin_id:b3.id, material_id:mat3.id, quantity:3,  unit:'EA',  stock_type:'UNRESTRICTED' });
  if (b4 && mat4)          stockData.push({ warehouse_id:'WH001', bin_id:b4.id, material_id:mat4.id, quantity:40, unit:'EA',  stock_type:'UNRESTRICTED' });
  if (b5 && mat5 && bt45)  stockData.push({ warehouse_id:'WH001', bin_id:b5.id, material_id:mat5.id, batch_id:bt45.id, quantity:2, unit:'EA', stock_type:'UNRESTRICTED' });
  if (b6 && mat6)          stockData.push({ warehouse_id:'WH001', bin_id:b6.id, material_id:mat6.id, quantity:500, unit:'M',  stock_type:'UNRESTRICTED' });

  if (stockData.length > 0) {
    await db.StockQuant.bulkCreate(stockData, { ignoreDuplicates: true });
    console.log(`  ✅ Stock inicial base (${stockData.length} posiciones)`);
  }

  // Randomly populate stock for large warehouse look
  const allHbBins = await db.StorageBin.findAll({ where: { warehouse_id:'WH001', storage_type_id: hb1.id } });
  const allMats = await db.Material.findAll();
  const randomStock = [];

  // Populate ~20% of bins heavily, 30% partially, 50% empty
  for (let i = 0; i < allHbBins.length; i++) {
    const bin = allHbBins[i];
    const r = Math.random();
    
    if (r < 0.20) {
      // Heavy stock (Full or almost full)
      const m1 = allMats[Math.floor(Math.random() * allMats.length)];
      const m2 = allMats[Math.floor(Math.random() * allMats.length)];
      randomStock.push({ warehouse_id:'WH001', material_id: m1.id, batch_id: (m1.batch_managed ? bt1?.id : null), bin_id: bin.id, quantity: 50 + Math.floor(Math.random() * 50), unit: m1.base_unit, stock_type:'UNRESTRICTED' });
      randomStock.push({ warehouse_id:'WH001', material_id: m2.id, batch_id: (m2.batch_managed ? bt1?.id : null), bin_id: bin.id, quantity: 20 + Math.floor(Math.random() * 20), unit: m2.base_unit, stock_type:'UNRESTRICTED' });
    } else if (r < 0.50) {
      // Partial stock
      const m = allMats[Math.floor(Math.random() * allMats.length)];
      randomStock.push({ warehouse_id:'WH001', material_id: m.id, batch_id: (m.batch_managed ? bt1?.id : null), bin_id: bin.id, quantity: 1 + Math.floor(Math.random() * 10), unit: m.base_unit, stock_type:'UNRESTRICTED' });
    }
  }

  if (randomStock.length > 0) {
    await db.StockQuant.bulkCreate(randomStock, { ignoreDuplicates: true });
    console.log(`  ✅ Stock generado aleatoriamente (${randomStock.length} posiciones)`);
  }
  // ── Transfer Orders de ejemplo ─────────────────────────────
  const admin = await db.User.findOne({ where: { email:'admin@jmholding.org' } });
  const toData = [
    { to_number:'TO-2024-001', warehouse_id:'WH001', to_type:'GR', reference_type:'Manual', status:'OPEN',      created_by: admin?.id, notes:'Putaway ejemplo GR' },
    { to_number:'TO-2024-002', warehouse_id:'WH001', to_type:'GI', reference_type:'Manual', status:'OPEN',      created_by: admin?.id, notes:'Picking ejemplo GI' },
    { to_number:'TO-2024-003', warehouse_id:'WH001', to_type:'TR', reference_type:'Manual', status:'CONFIRMED', created_by: admin?.id, notes:'Traslado interno' },
    { to_number:'TO-2024-004', warehouse_id:'WH001', to_type:'GR', reference_type:'Manual', status:'OPEN',      created_by: admin?.id, notes:'Putaway segunda recepción' },
    { to_number:'TO-2024-005', warehouse_id:'WH001', to_type:'GI', reference_type:'Manual', status:'CANCELLED', created_by: admin?.id, notes:'Cancelada por error' },
  ];
  await db.TransferOrder.bulkCreate(toData, { ignoreDuplicates: true });
  console.log('  ✅ Transfer Orders de ejemplo (5)');

  // ── LMS: Labor Standards & Executions ──────────────────────
  const op1 = await db.User.findOne({ where: { email:'mgomez@wmlight.com' } });
  const op2 = await db.User.findOne({ where: { email:'lrodriguez@wmlight.com' } });
  const lsData = [
    { warehouse_id: 'WH001', task_type: 'PICKING', base_time_sec: 120, item_time_sec: 30 },
    { warehouse_id: 'WH001', task_type: 'PUTAWAY', base_time_sec: 150, item_time_sec: 40 }
  ];
  await db.LaborStandard.bulkCreate(lsData, { ignoreDuplicates: true });
  const lmsData = [];
  for(let i=0; i<50; i++) {
    const isPick = i % 2 === 0;
    const stdTime = isPick ? 180 : 230;
    const actualTime = Math.floor(Math.random() * 200) + 100;
    lmsData.push({
      warehouse_id: 'WH001',
      task_type: isPick ? 'PICKING' : 'PUTAWAY',
      user_id: i % 2 === 0 ? op1?.id : op2?.id,
      standard_time_sec: stdTime,
      actual_time_sec: actualTime,
      started_at: new Date(),
      completed_at: new Date()
    });
  }
  await db.TaskExecution.bulkCreate(lmsData);
  console.log('  ✅ Datos LMS (50 ejecuciones)');

  // ── Yard Management ─────────────────────────────────────────
  const yardLocs = [
    { warehouse_id: 'WH001', code: 'DOCK-01', type: 'DOCK_DOOR', status: 'AVAILABLE' },
    { warehouse_id: 'WH001', code: 'DOCK-02', type: 'DOCK_DOOR', status: 'OCCUPIED' },
    { warehouse_id: 'WH001', code: 'PARKING-A', type: 'PARKING', status: 'AVAILABLE' },
    { warehouse_id: 'WH001', code: 'GATE-01', type: 'GATE', status: 'AVAILABLE', description: 'Puerta Principal Entrada' },
    { warehouse_id: 'WH001', code: 'GATE-02', type: 'GATE', status: 'AVAILABLE', description: 'Puerta Secundaria Entrada' },
    { warehouse_id: 'WH001', code: 'GATE-03', type: 'GATE', status: 'AVAILABLE', description: 'Puerta Auxiliar Inbound' },
    { warehouse_id: 'WH001', code: 'GATE-04', type: 'GATE', status: 'AVAILABLE', description: 'Puerta Principal Salida' },
    { warehouse_id: 'WH001', code: 'GATE-05', type: 'GATE', status: 'AVAILABLE', description: 'Puerta de Emergencia / Respaldo' }
  ];
  await db.YardLocation.bulkCreate(yardLocs, { ignoreDuplicates: true });
  const d2 = await db.YardLocation.findOne({ where: { code: 'DOCK-02' } });
  const yardVehicles = [
    { warehouse_id: 'WH001', license_plate: 'ABC-1234', carrier: 'FedEx', status: 'AT_DOCK', current_location_id: d2?.id },
    { warehouse_id: 'WH001', license_plate: 'XYZ-9876', carrier: 'DHL', status: 'EXPECTED' }
  ];
  await db.YardVehicle.bulkCreate(yardVehicles, { ignoreDuplicates: true });
  console.log('  ✅ Datos Yard (Ubicaciones y Vehículos)');

  // ── Slotting Inteligente ────────────────────────────────────
  const slottingData = [
    { warehouse_id: 'WH001', material_id: mat1?.id, from_bin_id: b6?.id, to_bin_id: b1?.id, quantity: 10, reason: 'Alta Rotación', score: 95, status: 'PENDING' },
    { warehouse_id: 'WH001', material_id: mat2?.id, from_bin_id: b1?.id, to_bin_id: b6?.id, quantity: 5, reason: 'Baja Rotación', score: 80, status: 'PENDING' }
  ];
  await db.SlottingRecommendation.bulkCreate(slottingData, { ignoreDuplicates: true });
  console.log('  ✅ Datos Slotting (Recomendaciones)');

  // ── Goods Receipt / Goods Issue ──────────────────────────────
  const grData = [
    { gr_number: 'GR-2024-001', warehouse_id: 'WH001', receipt_type: 'PO', vendor_name: 'Proveedor A', status: 'CONFIRMED', sap_po_number: '4500000101', delivery_note: 'DN-9901', putaway_strategy: 'FEFO', created_at: new Date(Date.now() - 86400000) },
    { gr_number: 'GR-2024-002', warehouse_id: 'WH001', receipt_type: 'PO', vendor_name: 'Proveedor GlobalCorp', status: 'OPEN', sap_po_number: '4500000102', delivery_note: 'DN-9902', putaway_strategy: 'FIFO', created_at: new Date() },
    { gr_number: 'GR-2024-003', warehouse_id: 'WH001', receipt_type: 'PO', vendor_name: 'Logistics Partner', status: 'CONFIRMED', sap_po_number: '4500000103', delivery_note: 'DN-9903', putaway_strategy: 'FEFO', created_at: new Date(Date.now() - 172800000) },
    { gr_number: 'GR-2024-004', warehouse_id: 'WH001', receipt_type: 'PO', vendor_name: 'Tech Supplies Inc.', status: 'CANCELLED', sap_po_number: '4500000104', delivery_note: 'DN-9904', putaway_strategy: 'MANUAL', created_at: new Date() },
    { gr_number: 'GR-2024-005', warehouse_id: 'WH001', receipt_type: 'TRANSFER', vendor_name: 'Almacén Central (WH002)', status: 'OPEN', sap_po_number: 'TR-2026-009', delivery_note: 'DN-9905', putaway_strategy: 'FEFO', created_at: new Date() },
    { gr_number: 'GR-2024-006', warehouse_id: 'WH001', receipt_type: 'PO', vendor_name: 'Importaciones del Norte', status: 'CONFIRMED', sap_po_number: '4500000106', delivery_note: 'DN-9906', putaway_strategy: 'LIFO', created_at: new Date(Date.now() - 400000000) },
    { gr_number: 'GR-2024-007', warehouse_id: 'WH001', receipt_type: 'PRODUCTION', vendor_name: 'Línea de Ensamble B', status: 'OPEN', sap_po_number: 'OP-2026-888', delivery_note: 'DN-9907', putaway_strategy: 'FIFO', created_at: new Date() }
  ];
  const grs = await db.GoodsReceipt.bulkCreate(grData, { ignoreDuplicates: true, returning: true });
  
  // Agregar Items a la primera GR para más realismo
  if (grs && grs.length > 0 && mat1 && mat2) {
    const gr1 = await db.GoodsReceipt.findOne({ where: { gr_number: 'GR-2024-001' } });
    const gr2 = await db.GoodsReceipt.findOne({ where: { gr_number: 'GR-2024-002' } });
    if (gr1) {
      await db.GoodsReceiptItem.bulkCreate([
        { goods_receipt_id: gr1.id, item_number: 10, material_id: mat1.id, planned_qty: 100, received_qty: 100, unit: 'EA', to_bin_id: b1?.id },
        { goods_receipt_id: gr1.id, item_number: 20, material_id: mat2.id, planned_qty: 50, received_qty: 50, unit: 'EA', to_bin_id: b2?.id }
      ]);
    }
    if (gr2) {
      await db.GoodsReceiptItem.bulkCreate([
        { goods_receipt_id: gr2.id, item_number: 10, material_id: mat3.id, planned_qty: 200, received_qty: 0, unit: 'EA' }
      ]);
    }
  }
  const giData = [
    { gi_number: 'GI-2024-001', warehouse_id: 'WH001', issue_type: 'SO', customer_name: 'Cliente B', status: 'CONFIRMED', sap_so_number: '5000000101', delivery_number: 'DEL-9901' },
    { gi_number: 'GI-2024-002', warehouse_id: 'WH001', issue_type: 'TRANSFER', customer_name: 'Almacén Secundario WH002', status: 'OPEN', sap_so_number: 'TR-2026-002', delivery_number: 'DEL-9902' },
    { gi_number: 'GI-2024-003', warehouse_id: 'WH001', issue_type: 'SUBCONTRACTING', customer_name: 'Maquiladora del Norte S.A.', status: 'OPEN', sap_so_number: 'MQ-2026-003', delivery_number: 'DEL-9903' }
  ];
  const gis = await db.GoodsIssue.bulkCreate(giData, { ignoreDuplicates: true, returning: true });
  
  if (gis && gis.length > 0 && mat2 && mat4) {
    const gi2 = await db.GoodsIssue.findOne({ where: { gi_number: 'GI-2024-002' } });
    const gi3 = await db.GoodsIssue.findOne({ where: { gi_number: 'GI-2024-003' } });
    if (gi2) {
      await db.GoodsIssueItem.bulkCreate([
        { goods_issue_id: gi2.id, item_number: 10, material_id: mat2.id, requested_qty: 2, unit: 'EA' }
      ], { ignoreDuplicates: true });
    }
    if (gi3) {
      await db.GoodsIssueItem.bulkCreate([
        { goods_issue_id: gi3.id, item_number: 10, material_id: mat4.id, requested_qty: 5, unit: 'EA' }
      ], { ignoreDuplicates: true });
    }
  }

  console.log('  ✅ Datos GR / GI');

  console.log('\n🎉 Seed completado exitosamente!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Usuario admin:      admin@jmholding.org');
  console.log('  Contraseña admin:   Admin1234!');
  console.log('  Usuario supervisor: jperez@wmlight.com');
  console.log('  Contraseña op:      Oper1234!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  process.exit(0);
}

seed().catch(err => {
  console.error('\n❌ Error en seed:', err.message);
  console.error(err.stack);
  process.exit(1);
});
