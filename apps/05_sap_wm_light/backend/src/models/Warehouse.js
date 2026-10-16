/* ============================================================
   Model: Warehouse
   ============================================================ */
'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Warehouse = sequelize.define('Warehouse', {
  id:          { type: DataTypes.STRING(10), primaryKey: true },   // WH001
  name:        { type: DataTypes.STRING(100), allowNull: false },
  location:    { type: DataTypes.STRING(200) },
  description: { type: DataTypes.TEXT },
  status:      { type: DataTypes.ENUM('ACTIVE','INACTIVE','BLOCKED'), defaultValue: 'ACTIVE' },
  max_weight:  { type: DataTypes.DECIMAL(12,3) },                  // kg
  timezone:    { type: DataTypes.STRING(50), defaultValue: 'America/Bogota' },
}, { tableName: 'warehouses' });

/* ── StorageType ──────────────────────────────────────────── */
const StorageType = sequelize.define('StorageType', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  warehouse_id: { type: DataTypes.STRING(10), allowNull: false },
  code:         { type: DataTypes.STRING(10), allowNull: false },   // HB, HS, GR, GI
  name:         { type: DataTypes.STRING(100) },
  description:  { type: DataTypes.TEXT },
  allows_negative_stock: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'storage_types' });

/* ── StorageSection ───────────────────────────────────────── */
const StorageSection = sequelize.define('StorageSection', {
  id:              { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  storage_type_id: { type: DataTypes.INTEGER, allowNull: false },
  code:            { type: DataTypes.STRING(10), allowNull: false },
  name:            { type: DataTypes.STRING(100) },
}, { tableName: 'storage_sections' });

/* ── StorageBin ───────────────────────────────────────────── */
const StorageBin = sequelize.define('StorageBin', {
  id:                 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  warehouse_id:       { type: DataTypes.STRING(10), allowNull: false },
  storage_type_id:    { type: DataTypes.INTEGER },
  storage_section_id: { type: DataTypes.INTEGER },
  bin_code:           { type: DataTypes.STRING(20), allowNull: false },  // A-01-01-01
  row:                { type: DataTypes.STRING(5) },
  bay:                { type: DataTypes.STRING(5) },
  level:              { type: DataTypes.STRING(5) },
  position:           { type: DataTypes.STRING(5) },
  max_weight:         { type: DataTypes.DECIMAL(12,3) },
  max_volume:         { type: DataTypes.DECIMAL(12,3) },
  bin_type:           { type: DataTypes.ENUM('STANDARD','BULK','PICKING','STAGING','BLOCKED'), defaultValue: 'STANDARD' },
  status:             { type: DataTypes.ENUM('ACTIVE','BLOCKED','INACTIVE'), defaultValue: 'ACTIVE' },
  inventory_block:    { type: DataTypes.BOOLEAN, defaultValue: false }, // LI02N block
  current_weight:     { type: DataTypes.DECIMAL(12,3), defaultValue: 0 },
  occupancy_pct:      { type: DataTypes.DECIMAL(5,2), defaultValue: 0 },
  // Slotting velocity class: A (Fast), B (Medium), C (Slow)
  velocity_class:     { type: DataTypes.ENUM('A','B','C'), defaultValue: 'C' },
}, { tableName: 'storage_bins' });

/* ── UserWarehouse (M2M) ──────────────────────────────────── */
const UserWarehouse = sequelize.define('UserWarehouse', {
  user_id:      { type: DataTypes.INTEGER, allowNull: false },
  warehouse_id: { type: DataTypes.STRING(10), allowNull: false },
}, { tableName: 'user_warehouses', timestamps: false });

/* ── ASSOCIATIONS ─────────────────────────────────────────── */
Warehouse.hasMany(StorageType,    { foreignKey: 'warehouse_id', as: 'storageTypes' });
StorageType.belongsTo(Warehouse,  { foreignKey: 'warehouse_id' });

StorageType.hasMany(StorageSection,   { foreignKey: 'storage_type_id', as: 'sections' });
StorageSection.belongsTo(StorageType, { foreignKey: 'storage_type_id' });

Warehouse.hasMany(StorageBin,    { foreignKey: 'warehouse_id', as: 'bins' });
StorageBin.belongsTo(Warehouse,  { foreignKey: 'warehouse_id' });
StorageType.hasMany(StorageBin,  { foreignKey: 'storage_type_id' });
StorageBin.belongsTo(StorageType,{ foreignKey: 'storage_type_id' });

module.exports = { Warehouse, StorageType, StorageSection, StorageBin, UserWarehouse };
