/* ============================================================
   seed_yard.js — Datos semilla para Yard Management
   ============================================================ */
'use strict';
require('dotenv').config();

async function seedYard() {
  const db = require('./index');
  await db.sequelize.authenticate();
  console.log('✅ Conexión OK — Insertando datos de Yard Management...\n');

  // Sincronizar solo los modelos de Yard para no borrar el resto
  await db.YardLocation.sync({ force: true });
  await db.YardVehicle.sync({ force: true });
  await db.YardAppointment.sync({ force: true });
  await db.YardMovement.sync({ force: true });

  // ── Yard Locations ──────────────────────────────────────────
  await db.YardLocation.bulkCreate([
    { warehouse_id: 'WH001', code: 'GATE-IN',  type: 'GATE',      description: 'Puerta Principal Entrada' },
    { warehouse_id: 'WH001', code: 'GATE-OUT', type: 'GATE',      description: 'Puerta Principal Salida' },
    { warehouse_id: 'WH001', code: 'PARK-01',  type: 'PARKING',   description: 'Estacionamiento 1' },
    { warehouse_id: 'WH001', code: 'PARK-02',  type: 'PARKING',   description: 'Estacionamiento 2' },
    { warehouse_id: 'WH001', code: 'PARK-03',  type: 'PARKING',   description: 'Estacionamiento 3' },
    { warehouse_id: 'WH001', code: 'DOOR-01',  type: 'DOCK_DOOR', description: 'Muelle Carga 1 (GI)' },
    { warehouse_id: 'WH001', code: 'DOOR-02',  type: 'DOCK_DOOR', description: 'Muelle Carga 2 (GI)' },
    { warehouse_id: 'WH001', code: 'DOOR-03',  type: 'DOCK_DOOR', description: 'Muelle Descarga 3 (GR)' },
    { warehouse_id: 'WH001', code: 'DOOR-04',  type: 'DOCK_DOOR', description: 'Muelle Descarga 4 (GR)' },
  ], { ignoreDuplicates: true });
  console.log('  ✅ Yard Locations (9)');

  // ── Yard Vehicles & Appointments ────────────────────────────
  // Un camión esperado (Cita creada pero no ha llegado)
  const v1 = await db.YardVehicle.create({
    warehouse_id: 'WH001', license_plate: 'ABC-123', carrier: 'Transportes Rápidos',
    driver_name: 'Juan Pérez', vehicle_type: 'TRUCK', status: 'EXPECTED'
  });
  await db.YardAppointment.create({
    appointment_num: 'APPT-2026-0001', warehouse_id: 'WH001', vehicle_id: v1.id,
    operation_type: 'INBOUND', planned_arrival: new Date(Date.now() + 3600000), // En 1 hora
    status: 'SCHEDULED'
  });

  // Un tráiler en patio (Check-in ya realizado, en Parking)
  const park1 = await db.YardLocation.findOne({ where: { code: 'PARK-01' } });
  if (park1) {
    const v2 = await db.YardVehicle.create({
      warehouse_id: 'WH001', license_plate: 'XYZ-987', carrier: 'Logística Sur',
      driver_name: 'Mario López', vehicle_type: 'TRAILER', status: 'IN_YARD',
      current_location_id: park1.id
    });
    park1.status = 'OCCUPIED';
    await park1.save();

    await db.YardAppointment.create({
      appointment_num: 'APPT-2026-0002', warehouse_id: 'WH001', vehicle_id: v2.id,
      operation_type: 'OUTBOUND', planned_arrival: new Date(Date.now() - 3600000),
      actual_arrival: new Date(Date.now() - 3500000), status: 'ARRIVED'
    });
  }

  // Un camión en muelle (Cargando)
  const door1 = await db.YardLocation.findOne({ where: { code: 'DOOR-01' } });
  if (door1) {
    const v3 = await db.YardVehicle.create({
      warehouse_id: 'WH001', license_plate: 'DEF-456', carrier: 'Carga Express',
      driver_name: 'Carlos Gómez', vehicle_type: 'TRUCK', status: 'AT_DOCK',
      current_location_id: door1.id
    });
    door1.status = 'OCCUPIED';
    await door1.save();

    await db.YardAppointment.create({
      appointment_num: 'APPT-2026-0003', warehouse_id: 'WH001', vehicle_id: v3.id,
      operation_type: 'OUTBOUND', planned_arrival: new Date(Date.now() - 7200000),
      actual_arrival: new Date(Date.now() - 7000000), status: 'ARRIVED'
    });
  }

  console.log('  ✅ Vehicles & Appointments (3)');
  console.log('\n🎉 Seed Yard completado exitosamente!');
  process.exit(0);
}

seedYard().catch(err => {
  console.error('\n❌ Error en seed yard:', err.message);
  process.exit(1);
});
