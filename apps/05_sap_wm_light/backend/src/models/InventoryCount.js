/* ============================================================
   Model: InventoryCount — Toma de Inventarios (LINK, LINP, LINV)
   ============================================================ */
'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/* ── LINK: Cabecera del Documento de Inventario ───────────── */
const InventoryCount = sequelize.define('InventoryCount', {
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  count_number:   { type: DataTypes.STRING(20), unique: true },   // INV-2026-001
  warehouse_id:   { type: DataTypes.STRING(10), allowNull: false },
  storage_type_id:{ type: DataTypes.INTEGER },                    // Opcional, si es de un tipo en particular
  count_type:     { type: DataTypes.ENUM('FULL','CYCLIC','SPOT'), defaultValue: 'CYCLIC' },
  status:         { type: DataTypes.ENUM('PLANNED','ACTIVE','COUNTED','CLEARED_WM','CLEARED_IM','CANCELLED'), defaultValue: 'PLANNED' },
  planned_date:   { type: DataTypes.DATEONLY },
  started_at:     { type: DataTypes.DATE },
  closed_at:      { type: DataTypes.DATE },
  bins_total:     { type: DataTypes.INTEGER, defaultValue: 0 },
  bins_counted:   { type: DataTypes.INTEGER, defaultValue: 0 },
  created_by:     { type: DataTypes.INTEGER },
  responsible_id: { type: DataTypes.INTEGER },
  notes:          { type: DataTypes.TEXT },
}, { tableName: 'inventory_counts' });

/* ── LINP: Ubicaciones del Documento de Inventario ────────── */
const InventoryCountBin = sequelize.define('InventoryCountBin', {
  id:                 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  inventory_count_id: { type: DataTypes.INTEGER, allowNull: false },
  bin_id:             { type: DataTypes.INTEGER, allowNull: false }, // Ref -> StorageBin
  status:             { type: DataTypes.ENUM('PENDING','COUNTED','CLEARED'), defaultValue: 'PENDING' },
  counted_by:         { type: DataTypes.INTEGER },
  counted_at:         { type: DataTypes.DATE }
}, { tableName: 'inventory_count_bins' });

/* ── LINV: Cuantos de Inventario (Materiales en Ubicación) ── */
const InventoryCountItem = sequelize.define('InventoryCountItem', {
  id:                     { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  inventory_count_bin_id: { type: DataTypes.INTEGER, allowNull: false },
  quant_id:               { type: DataTypes.INTEGER }, // Ref -> StockQuant (si existía previamente)
  material_id:            { type: DataTypes.INTEGER, allowNull: false },
  batch_id:               { type: DataTypes.INTEGER },
  system_qty:             { type: DataTypes.DECIMAL(15,3), defaultValue: 0 },   // Cantidad congelada del sistema
  counted_qty:            { type: DataTypes.DECIMAL(15,3) },                    // Cantidad contada físicamente
  unit:                   { type: DataTypes.STRING(6) },
  status:                 { type: DataTypes.ENUM('PENDING','COUNTED','CLEARED'), defaultValue: 'PENDING' },
}, { tableName: 'inventory_count_items' });

/* ── RELATIONS ────────────────────────────────────────────── */
InventoryCount.hasMany(InventoryCountBin, { foreignKey: 'inventory_count_id', as: 'bins' });
InventoryCountBin.belongsTo(InventoryCount, { foreignKey: 'inventory_count_id' });

InventoryCountBin.hasMany(InventoryCountItem, { foreignKey: 'inventory_count_bin_id', as: 'items' });
InventoryCountItem.belongsTo(InventoryCountBin, { foreignKey: 'inventory_count_bin_id' });

module.exports = { InventoryCount, InventoryCountBin, InventoryCountItem };
