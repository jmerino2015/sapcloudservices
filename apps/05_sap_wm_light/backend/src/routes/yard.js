/* ============================================================
   Route: Yard Management — Gestión de Patios
   ============================================================ */
'use strict';
const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { YardLocation, YardVehicle, YardAppointment, YardMovement } = require('../models');
const sequelize = require('../config/database');
const router = express.Router();

router.use(authenticate);

// ── GET /yard/dashboard ─────────────────────────────────────
// Obtiene el estado actual del patio (ubicaciones y qué vehículos tienen)
router.get('/dashboard', async (req, res, next) => {
  try {
    const locations = await YardLocation.findAll({
      include: [{
        model: YardVehicle,
        as: 'currentVehicle',
        include: [{ model: YardAppointment, as: 'appointments' }]
      }],
      order: [['type', 'ASC'], ['code', 'ASC']]
    });

    const expectedVehicles = await YardVehicle.findAll({
      where: { status: 'EXPECTED' },
      include: [{ model: YardAppointment, as: 'appointments' }]
    });

    res.json({
      locations,
      expectedVehicles
    });
  } catch(e) { next(e); }
});

// ── GET /yard/appointments ──────────────────────────────────
router.get('/appointments', async (req, res, next) => {
  try {
    const apps = await YardAppointment.findAll({
      include: [{ model: YardVehicle, as: 'vehicle' }],
      order: [['planned_arrival', 'ASC']]
    });
    res.json({ data: apps });
  } catch(e) { next(e); }
});

// ── POST /yard/appointments ─────────────────────────────────
router.post('/appointments', authorize('admin', 'supervisor'), async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { warehouse_id, license_plate, carrier, driver_name, vehicle_type, operation_type, planned_arrival, reference_doc } = req.body;

    // Buscar o crear vehículo
    let vehicle = await YardVehicle.findOne({ where: { license_plate }, transaction: t });
    if (!vehicle) {
      vehicle = await YardVehicle.create({
        warehouse_id, license_plate, carrier, driver_name, vehicle_type, status: 'EXPECTED'
      }, { transaction: t });
    } else {
      if (vehicle.status === 'CHECKED_OUT') {
        vehicle.status = 'EXPECTED';
        await vehicle.save({ transaction: t });
      }
    }

    // Auto-number para cita
    const year = new Date().getFullYear();
    const cnt = await YardAppointment.count({ transaction: t });
    const appointment_num = `APPT-${year}-${String(cnt + 1).padStart(4, '0')}`;

    const appt = await YardAppointment.create({
      appointment_num, warehouse_id, vehicle_id: vehicle.id,
      operation_type, planned_arrival, reference_doc, status: 'SCHEDULED'
    }, { transaction: t });

    await t.commit();
    res.status(201).json({ data: appt });
  } catch(e) {
    await t.rollback();
    next(e);
  }
});

// ── POST /yard/check-in ─────────────────────────────────────
router.post('/check-in', authorize('admin', 'supervisor', 'operator'), async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { appointment_id, gate_code } = req.body; // Ej. GATE-IN

    const appt = await YardAppointment.findByPk(appointment_id, {
      include: [{ model: YardVehicle, as: 'vehicle' }],
      transaction: t
    });

    if (!appt || appt.status !== 'SCHEDULED') {
      throw new Error('Cita no válida o ya procesada');
    }

    const gate = await YardLocation.findOne({ where: { code: gate_code, type: 'GATE' }, transaction: t });
    if (!gate) throw new Error('Puerta no válida');

    // Mover vehículo a la puerta
    const vehicle = appt.vehicle;
    vehicle.status = 'CHECKED_IN';
    vehicle.current_location_id = gate.id;
    await vehicle.save({ transaction: t });

    // Actualizar Cita
    appt.status = 'ARRIVED';
    appt.actual_arrival = new Date();
    await appt.save({ transaction: t });

    // Registrar Movimiento
    await YardMovement.create({
      vehicle_id: vehicle.id,
      to_location_id: gate.id,
      moved_by: req.user.id,
      notes: 'Check-In'
    }, { transaction: t });

    await t.commit();
    res.json({ message: 'Check-In exitoso', vehicle });
  } catch(e) {
    await t.rollback();
    next(e);
  }
});

// ── POST /yard/move ─────────────────────────────────────────
router.post('/move', authorize('admin', 'supervisor', 'operator'), async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { vehicle_id, to_location_id } = req.body;

    const vehicle = await YardVehicle.findByPk(vehicle_id, { transaction: t });
    if (!vehicle) throw new Error('Vehículo no encontrado');

    const toLoc = await YardLocation.findByPk(to_location_id, { transaction: t });
    if (!toLoc) throw new Error('Ubicación destino no válida');
    if (toLoc.status === 'OCCUPIED') throw new Error('La ubicación destino está ocupada');

    const fromLocId = vehicle.current_location_id;

    // Liberar origen
    if (fromLocId) {
      const fromLoc = await YardLocation.findByPk(fromLocId, { transaction: t });
      if (fromLoc && fromLoc.type !== 'GATE') {
        fromLoc.status = 'AVAILABLE';
        await fromLoc.save({ transaction: t });
      }
    }

    // Ocupar destino
    if (toLoc.type !== 'GATE') {
      toLoc.status = 'OCCUPIED';
      await toLoc.save({ transaction: t });
    }

    // Actualizar vehículo
    vehicle.current_location_id = toLoc.id;
    if (toLoc.type === 'PARKING') vehicle.status = 'IN_YARD';
    else if (toLoc.type === 'DOCK_DOOR') vehicle.status = 'AT_DOCK';
    else if (toLoc.type === 'GATE') vehicle.status = 'CHECKED_OUT'; // o pre-checkout
    
    await vehicle.save({ transaction: t });

    // Registrar Movimiento
    await YardMovement.create({
      vehicle_id: vehicle.id,
      from_location_id: fromLocId,
      to_location_id: toLoc.id,
      moved_by: req.user.id
    }, { transaction: t });

    await t.commit();
    res.json({ message: 'Movimiento registrado', vehicle });
  } catch(e) {
    await t.rollback();
    next(e);
  }
});

// ── POST /yard/check-out ────────────────────────────────────
router.post('/check-out', authorize('admin', 'supervisor', 'operator'), async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { vehicle_id, gate_code } = req.body;

    const vehicle = await YardVehicle.findByPk(vehicle_id, {
      include: [{ model: YardAppointment, as: 'appointments', where: { status: 'ARRIVED' }, required: false }],
      transaction: t
    });

    if (!vehicle) throw new Error('Vehículo no encontrado');

    const gate = await YardLocation.findOne({ where: { code: gate_code, type: 'GATE' }, transaction: t });
    if (!gate) throw new Error('Puerta no válida');

    const fromLocId = vehicle.current_location_id;

    // Liberar origen
    if (fromLocId) {
      const fromLoc = await YardLocation.findByPk(fromLocId, { transaction: t });
      if (fromLoc && fromLoc.type !== 'GATE') {
        fromLoc.status = 'AVAILABLE';
        await fromLoc.save({ transaction: t });
      }
    }

    // Actualizar Cita a COMPLETED
    if (vehicle.appointments && vehicle.appointments.length > 0) {
      const appt = vehicle.appointments[0];
      appt.status = 'COMPLETED';
      appt.actual_departure = new Date();
      await appt.save({ transaction: t });
    }

    vehicle.status = 'CHECKED_OUT';
    vehicle.current_location_id = null;
    await vehicle.save({ transaction: t });

    await YardMovement.create({
      vehicle_id: vehicle.id,
      from_location_id: fromLocId,
      to_location_id: gate.id,
      moved_by: req.user.id,
      notes: 'Check-Out'
    }, { transaction: t });

    await t.commit();
    res.json({ message: 'Check-Out exitoso' });
  } catch(e) {
    await t.rollback();
    next(e);
  }
});

module.exports = router;
