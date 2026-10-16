/* ============================================================
   Model: Yard Management (Gestión de Patios)
   Tablas: YardLocation, YardVehicle, YardAppointment, YardMovement
   ============================================================ */
'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/* ── YardLocation (Ubicaciones Físicas del Patio) ─────────── */
const YardLocation = sequelize.define('YardLocation', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  warehouse_id: { type: DataTypes.STRING(10), allowNull: false },
  code:         { type: DataTypes.STRING(20), allowNull: false, unique: true }, // Ej: DOOR-01, PARKING-A, GATE-IN
  type:         { type: DataTypes.ENUM('GATE','PARKING','DOCK_DOOR'), allowNull: false },
  status:       { type: DataTypes.ENUM('AVAILABLE','OCCUPIED','OUT_OF_SERVICE'), defaultValue: 'AVAILABLE' },
  description:  { type: DataTypes.STRING(100) },
}, { tableName: 'yard_locations' });

/* ── YardVehicle (Camiones / Tráileres / Vehículos) ───────── */
const YardVehicle = sequelize.define('YardVehicle', {
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  warehouse_id:   { type: DataTypes.STRING(10), allowNull: false },
  license_plate:  { type: DataTypes.STRING(20), allowNull: false },
  carrier:        { type: DataTypes.STRING(100) },  // Empresa transportista
  driver_name:    { type: DataTypes.STRING(100) },
  driver_phone:   { type: DataTypes.STRING(50) },
  vehicle_type:   { type: DataTypes.ENUM('TRUCK','TRAILER','VAN'), defaultValue: 'TRUCK' },
  status:         { type: DataTypes.ENUM('EXPECTED','CHECKED_IN','IN_YARD','AT_DOCK','CHECKED_OUT'), defaultValue: 'EXPECTED' },
  current_location_id: { type: DataTypes.INTEGER }, // Dónde está estacionado actualmente
}, { tableName: 'yard_vehicles' });

/* ── YardAppointment (Citas Programadas) ──────────────────── */
const YardAppointment = sequelize.define('YardAppointment', {
  id:               { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  appointment_num:  { type: DataTypes.STRING(20), unique: true }, // APPT-2026-0001
  warehouse_id:     { type: DataTypes.STRING(10), allowNull: false },
  vehicle_id:       { type: DataTypes.INTEGER, allowNull: false },
  operation_type:   { type: DataTypes.ENUM('INBOUND','OUTBOUND'), allowNull: false },
  planned_arrival:  { type: DataTypes.DATE, allowNull: false },
  actual_arrival:   { type: DataTypes.DATE },
  actual_departure: { type: DataTypes.DATE },
  reference_doc:    { type: DataTypes.STRING(50) }, // ID de GR o GI asociado
  status:           { type: DataTypes.ENUM('SCHEDULED','ARRIVED','COMPLETED','CANCELLED'), defaultValue: 'SCHEDULED' },
  notes:            { type: DataTypes.TEXT }
}, { tableName: 'yard_appointments' });

/* ── YardMovement (Historial de Movimientos en el Patio) ──── */
const YardMovement = sequelize.define('YardMovement', {
  id:               { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  vehicle_id:       { type: DataTypes.INTEGER, allowNull: false },
  from_location_id: { type: DataTypes.INTEGER }, // Puede ser nulo si es entrada
  to_location_id:   { type: DataTypes.INTEGER }, // Puede ser nulo si es salida
  moved_by:         { type: DataTypes.INTEGER }, // ID de usuario
  moved_at:         { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  notes:            { type: DataTypes.TEXT }
}, { tableName: 'yard_movements', timestamps: false });

/* ── RELATIONS ────────────────────────────────────────────── */
// Ubicación <-> Vehículo (Dónde está estacionado actualmente)
YardLocation.hasOne(YardVehicle, { foreignKey: 'current_location_id', as: 'currentVehicle' });
YardVehicle.belongsTo(YardLocation, { foreignKey: 'current_location_id', as: 'currentLocation' });

// Cita <-> Vehículo
YardVehicle.hasMany(YardAppointment, { foreignKey: 'vehicle_id', as: 'appointments' });
YardAppointment.belongsTo(YardVehicle, { foreignKey: 'vehicle_id', as: 'vehicle' });

// Movimientos <-> Vehículo y Ubicaciones
YardVehicle.hasMany(YardMovement, { foreignKey: 'vehicle_id', as: 'movements' });
YardMovement.belongsTo(YardVehicle, { foreignKey: 'vehicle_id', as: 'vehicle' });

YardMovement.belongsTo(YardLocation, { foreignKey: 'from_location_id', as: 'fromLocation' });
YardMovement.belongsTo(YardLocation, { foreignKey: 'to_location_id', as: 'toLocation' });

module.exports = {
  YardLocation,
  YardVehicle,
  YardAppointment,
  YardMovement
};
