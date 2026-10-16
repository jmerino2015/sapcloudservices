/* ============================================================
   Model: Stock — Quants por bin/material/lote
   ============================================================ */
'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/* ── StockQuant — una línea de stock en una ubicación ──────── */
const StockQuant = sequelize.define('StockQuant', {
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  warehouse_id:   { type: DataTypes.STRING(10), allowNull: false },
  bin_id:         { type: DataTypes.INTEGER, allowNull: false },
  material_id:    { type: DataTypes.INTEGER, allowNull: false },
  batch_id:       { type: DataTypes.INTEGER },              // null if not batch managed
  quantity:       { type: DataTypes.DECIMAL(15,3), allowNull: false, defaultValue: 0 },
  unit:           { type: DataTypes.STRING(6), allowNull: false },
  quantity_base:  { type: DataTypes.DECIMAL(15,3), defaultValue: 0 },  // in base UoM
  stock_type:     { type: DataTypes.ENUM('UNRESTRICTED','BLOCKED','QUALITY_INSPECTION','TRANSIT'), defaultValue: 'UNRESTRICTED' },
  reserved_qty:   { type: DataTypes.DECIMAL(15,3), defaultValue: 0 },
  available_qty:  {
    type: DataTypes.VIRTUAL,
    get() { return parseFloat(this.quantity || 0) - parseFloat(this.reserved_qty || 0); }
  },
}, {
  tableName: 'stock_quants',
  indexes: [
    { fields: ['warehouse_id', 'bin_id', 'material_id', 'batch_id', 'stock_type'] }
  ]
});

/* ── StockMovement — historial de movimientos ───────────────── */
const StockMovement = sequelize.define('StockMovement', {
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  warehouse_id:   { type: DataTypes.STRING(10), allowNull: false },
  material_id:    { type: DataTypes.INTEGER, allowNull: false },
  batch_id:       { type: DataTypes.INTEGER },
  from_bin_id:    { type: DataTypes.INTEGER },
  to_bin_id:      { type: DataTypes.INTEGER },
  quantity:       { type: DataTypes.DECIMAL(15,3), allowNull: false },
  unit:           { type: DataTypes.STRING(6) },
  movement_type:  { type: DataTypes.ENUM('GR','GI','TR','INV_ADJ'), allowNull: false },
  reference_type: { type: DataTypes.STRING(20) },  // 'GoodsReceipt', 'GoodsIssue', 'TransferOrder'
  reference_id:   { type: DataTypes.INTEGER },
  user_id:        { type: DataTypes.INTEGER },
  notes:          { type: DataTypes.TEXT },
  sap_posted:     { type: DataTypes.BOOLEAN, defaultValue: false },
  sap_document:   { type: DataTypes.STRING(20) },  // SAP material document
}, { tableName: 'stock_movements' });

module.exports = { StockQuant, StockMovement };
