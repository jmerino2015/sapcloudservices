/* ============================================================
   Model: LaborStandard
   LMS: Define tiempos estándar base y variable para tareas
   ============================================================ */
'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LaborStandard = sequelize.define('LaborStandard', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  warehouse_id: { type: DataTypes.STRING(10), allowNull: false },
  task_type: { 
    type: DataTypes.ENUM('PICKING', 'PUTAWAY', 'RECEPTION', 'INTERNAL_MOVE', 'INVENTORY'), 
    allowNull: false 
  },
  // Opcionales para granularidad (ej. estándar diferente por tipo de equipo o zona)
  equipment_type: { type: DataTypes.STRING(50) },
  zone: { type: DataTypes.STRING(50) },
  
  // Tiempos
  base_time_sec: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  item_time_sec: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  
  created_by: { type: DataTypes.INTEGER },
  updated_by: { type: DataTypes.INTEGER }
}, {
  tableName: 'labor_standards'
});

module.exports = LaborStandard;
