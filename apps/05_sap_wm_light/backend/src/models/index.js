/* ============================================================
   Models Index — Registra todos los modelos y asociaciones
   ============================================================ */
'use strict';
const sequelize = require('../config/database');

// Import all models
const User                = require('./User');
const { Warehouse, StorageType, StorageSection, StorageBin, UserWarehouse } = require('./Warehouse');
const { Material, MaterialUoM, Batch }  = require('./Material');
const { StockQuant, StockMovement }     = require('./Stock');
const { TransferOrder, TransferOrderItem, GoodsReceipt, GoodsReceiptItem, GoodsIssue, GoodsIssueItem } = require('./TransferOrder');
const { InventoryCount, InventoryCountBin, InventoryCountItem } = require('./InventoryCount');
const { YardLocation, YardVehicle, YardAppointment, YardMovement } = require('./Yard');
const { SapSyncLog, AuditLog }          = require('./AuditLog');
const MovementType                      = require('./MovementType');
const LaborStandard                     = require('./LaborStandard');
const TaskExecution                     = require('./TaskExecution');
const { ProductAffinity, SlottingRecommendation } = require('./Slotting');

/* ── Cross-model associations ─────────────────────────────── */

// User ↔ Warehouse (M2M)
User.belongsToMany(Warehouse, { through: UserWarehouse, foreignKey: 'user_id', as: 'warehouses' });
Warehouse.belongsToMany(User, { through: UserWarehouse, foreignKey: 'warehouse_id', as: 'users' });

// StockQuant associations
StockQuant.belongsTo(Warehouse,  { foreignKey: 'warehouse_id' });
StockQuant.belongsTo(StorageBin, { foreignKey: 'bin_id', as: 'bin' });
StockQuant.belongsTo(Material,   { foreignKey: 'material_id', as: 'material' });
StockQuant.belongsTo(Batch,      { foreignKey: 'batch_id', as: 'batch' });

// StockMovement associations
StockMovement.belongsTo(Material,   { foreignKey: 'material_id', as: 'material' });
StockMovement.belongsTo(Batch,      { foreignKey: 'batch_id', as: 'batch' });
StockMovement.belongsTo(StorageBin, { foreignKey: 'from_bin_id', as: 'fromBin' });
StockMovement.belongsTo(StorageBin, { foreignKey: 'to_bin_id', as: 'toBin' });
StockMovement.belongsTo(User,       { foreignKey: 'user_id', as: 'user' });

// TransferOrder associations
TransferOrder.belongsTo(Warehouse, { foreignKey: 'warehouse_id' });
TransferOrder.belongsTo(User,      { foreignKey: 'created_by', as: 'creator' });
TransferOrder.belongsTo(User,      { foreignKey: 'confirmed_by', as: 'confirmedBy' });
TransferOrderItem.belongsTo(Material,   { foreignKey: 'material_id', as: 'material' });
TransferOrderItem.belongsTo(Batch,      { foreignKey: 'batch_id', as: 'batch' });
TransferOrderItem.belongsTo(StorageBin, { foreignKey: 'from_bin_id', as: 'fromBin' });
TransferOrderItem.belongsTo(StorageBin, { foreignKey: 'to_bin_id', as: 'toBin' });

// GR associations
GoodsReceipt.belongsTo(Warehouse, { foreignKey: 'warehouse_id' });
GoodsReceipt.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
GoodsReceiptItem.belongsTo(Material,   { foreignKey: 'material_id', as: 'material' });
GoodsReceiptItem.belongsTo(Batch,      { foreignKey: 'batch_id', as: 'batch' });
GoodsReceiptItem.belongsTo(StorageBin, { foreignKey: 'to_bin_id', as: 'bin' });

// GI associations
GoodsIssue.belongsTo(Warehouse, { foreignKey: 'warehouse_id' });
GoodsIssue.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
GoodsIssueItem.belongsTo(Material,   { foreignKey: 'material_id', as: 'material' });
GoodsIssueItem.belongsTo(Batch,      { foreignKey: 'batch_id', as: 'batch' });
GoodsIssueItem.belongsTo(StorageBin, { foreignKey: 'from_bin_id', as: 'bin' });

// InventoryCount associations
InventoryCount.belongsTo(Warehouse, { foreignKey: 'warehouse_id' });
InventoryCount.belongsTo(User, { foreignKey: 'responsible_id', as: 'responsible' });
InventoryCountBin.belongsTo(StorageBin, { foreignKey: 'bin_id', as: 'bin' });
InventoryCountItem.belongsTo(Material,   { foreignKey: 'material_id', as: 'material' });
InventoryCountItem.belongsTo(Batch,      { foreignKey: 'batch_id', as: 'batch' });

// TaskExecution associations
TaskExecution.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Slotting associations
SlottingRecommendation.belongsTo(Material, { foreignKey: 'material_id', as: 'material' });
SlottingRecommendation.belongsTo(StorageBin, { foreignKey: 'from_bin_id', as: 'fromBin' });
SlottingRecommendation.belongsTo(StorageBin, { foreignKey: 'to_bin_id', as: 'toBin' });
ProductAffinity.belongsTo(Material, { foreignKey: 'material_id_1', as: 'material1' });
ProductAffinity.belongsTo(Material, { foreignKey: 'material_id_2', as: 'material2' });

module.exports = {
  sequelize,
  User,
  Warehouse, StorageType, StorageSection, StorageBin, UserWarehouse,
  Material, MaterialUoM, Batch,
  StockQuant, StockMovement,
  TransferOrder, TransferOrderItem,
  GoodsReceipt, GoodsReceiptItem,
  GoodsIssue, GoodsIssueItem,
  InventoryCount, InventoryCountBin, InventoryCountItem,
  YardLocation, YardVehicle, YardAppointment, YardMovement,
  SapSyncLog, AuditLog,
  LaborStandard, TaskExecution,
  ProductAffinity, SlottingRecommendation,
};
