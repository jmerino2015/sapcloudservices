/* ============================================================
   Models: Material + Batch  (sincronizados desde SAP)
   ============================================================ */
'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/* ── Material ─────────────────────────────────────────────── */
const Material = sequelize.define('Material', {
  id:              { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  sap_code:        { type: DataTypes.STRING(18), allowNull: false, unique: true },   // 18 chars max SAP
  description:     { type: DataTypes.STRING(255), allowNull: false },
  material_type:   { type: DataTypes.STRING(4) },   // ROH, FERT, HALB, HIBE
  industry_sector: { type: DataTypes.STRING(1) },
  base_unit:       { type: DataTypes.STRING(6), allowNull: false },  // EA, KG, BOB...
  weight_unit:     { type: DataTypes.STRING(3), defaultValue: 'KG' },
  gross_weight:    { type: DataTypes.DECIMAL(15,3) },
  net_weight:      { type: DataTypes.DECIMAL(15,3) },
  batch_managed:   { type: DataTypes.BOOLEAN, defaultValue: false },
  serial_managed:  { type: DataTypes.BOOLEAN, defaultValue: false },
  hazardous:       { type: DataTypes.BOOLEAN, defaultValue: false },
  storage_conditions: { type: DataTypes.STRING(4) },   // SAP storage condition
  min_stock:       { type: DataTypes.DECIMAL(15,3), defaultValue: 0 },
  max_stock:       { type: DataTypes.DECIMAL(15,3) },
  status:          { type: DataTypes.ENUM('ACTIVE','INACTIVE','BLOCKED'), defaultValue: 'ACTIVE' },
  // Slotting Optimization Fields
  abc_indicator:   { type: DataTypes.ENUM('A','B','C'), defaultValue: 'C' },
  pick_frequency:  { type: DataTypes.INTEGER, defaultValue: 0 },
  sap_sync_at:     { type: DataTypes.DATE },   // last SAP sync timestamp
}, { tableName: 'materials' });

/* ── MaterialUoM (alternative units) ─────────────────────── */
const MaterialUoM = sequelize.define('MaterialUoM', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  material_id: { type: DataTypes.INTEGER, allowNull: false },
  alt_unit:    { type: DataTypes.STRING(6), allowNull: false },
  numerator:   { type: DataTypes.DECIMAL(15,5), allowNull: false },   // factor to base
  denominator: { type: DataTypes.DECIMAL(15,5), allowNull: false },
}, { tableName: 'material_uom', timestamps: false });

/* ── Batch ────────────────────────────────────────────────── */
const Batch = sequelize.define('Batch', {
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  material_id:    { type: DataTypes.INTEGER, allowNull: false },
  batch_number:   { type: DataTypes.STRING(20), allowNull: false },   // SAP batch
  manufacture_date: { type: DataTypes.DATEONLY },
  expiry_date:    { type: DataTypes.DATEONLY },
  vendor_batch:   { type: DataTypes.STRING(30) },   // proveedor batch no.
  classification: { type: DataTypes.JSONB },         // SAP batch characteristics
  status:         { type: DataTypes.ENUM('ACTIVE','BLOCKED','EXPIRED','CANCELLED'), defaultValue: 'ACTIVE' },
  sap_sync_at:    { type: DataTypes.DATE },
}, {
  tableName: 'batches',
  indexes: [{ unique: true, fields: ['material_id', 'batch_number'] }]
});

/* ── ASSOCIATIONS ─────────────────────────────────────────── */
Material.hasMany(MaterialUoM, { foreignKey: 'material_id', as: 'units' });
MaterialUoM.belongsTo(Material, { foreignKey: 'material_id' });

Material.hasMany(Batch, { foreignKey: 'material_id', as: 'batches' });
Batch.belongsTo(Material, { foreignKey: 'material_id', as: 'material' });

module.exports = { Material, MaterialUoM, Batch };
