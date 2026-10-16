/* ============================================================
   Models: TransferOrder + Items
   Cubre GR, GI y traslados internos
   ============================================================ */
'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/* ── TransferOrder ────────────────────────────────────────── */
const TransferOrder = sequelize.define('TransferOrder', {
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  to_number:      { type: DataTypes.STRING(20), unique: true },   // TO-2024-001
  warehouse_id:   { type: DataTypes.STRING(10), allowNull: false },
  to_type:        { type: DataTypes.ENUM('GR','GI','TR'), allowNull: false },

  // Reference document
  reference_type: { type: DataTypes.STRING(30) },   // 'GoodsReceipt', 'GoodsIssue', 'Manual'
  reference_id:   { type: DataTypes.INTEGER },
  sap_reference:  { type: DataTypes.STRING(20) },   // SAP PO/SO/delivery doc number

  status:         { type: DataTypes.ENUM('OPEN','IN_PROGRESS','CONFIRMED','CANCELLED'), defaultValue: 'OPEN' },
  priority:       { type: DataTypes.INTEGER, defaultValue: 5 },    // 1=highest

  // LMS Fields
  started_at:     { type: DataTypes.DATE },
  standard_time_sec: { type: DataTypes.INTEGER },

  created_by:     { type: DataTypes.INTEGER },
  confirmed_by:   { type: DataTypes.INTEGER },
  confirmed_at:   { type: DataTypes.DATE },
  cancelled_by:   { type: DataTypes.INTEGER },
  cancelled_at:   { type: DataTypes.DATE },
  cancel_reason:  { type: DataTypes.TEXT },
  notes:          { type: DataTypes.TEXT },
}, {
  tableName: 'transfer_orders',
  hooks: {
    beforeCreate: async (to) => {
      if (!to.to_number) {
        const year = new Date().getFullYear();
        const count = await TransferOrder.count({ where: sequelize.where(
          sequelize.fn('date_part', 'year', sequelize.col('created_at')), year
        )});
        to.to_number = `TO-${year}-${String(count + 1).padStart(4, '0')}`;
      }
    }
  }
});

/* ── TransferOrderItem ────────────────────────────────────── */
const TransferOrderItem = sequelize.define('TransferOrderItem', {
  id:              { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  transfer_order_id: { type: DataTypes.INTEGER, allowNull: false },
  item_number:     { type: DataTypes.INTEGER, allowNull: false },
  material_id:     { type: DataTypes.INTEGER, allowNull: false },
  batch_id:        { type: DataTypes.INTEGER },
  from_bin_id:     { type: DataTypes.INTEGER },
  to_bin_id:       { type: DataTypes.INTEGER, allowNull: false },
  planned_qty:     { type: DataTypes.DECIMAL(15,3), allowNull: false },
  confirmed_qty:   { type: DataTypes.DECIMAL(15,3), defaultValue: 0 },
  unit:            { type: DataTypes.STRING(6), allowNull: false },
  status:          { type: DataTypes.ENUM('OPEN','PARTIAL','COMPLETED','CANCELLED'), defaultValue: 'OPEN' },
}, { tableName: 'transfer_order_items' });

/* ── GoodsReceipt ─────────────────────────────────────────── */
const GoodsReceipt = sequelize.define('GoodsReceipt', {
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  gr_number:      { type: DataTypes.STRING(20), unique: true },   // GR-2024-001
  warehouse_id:   { type: DataTypes.STRING(10), allowNull: false },
  sap_po_number:  { type: DataTypes.STRING(20) },   // SAP Purchase Order / Doc Reference
  receipt_type:   { type: DataTypes.ENUM('PO','TRANSFER','PRODUCTION'), defaultValue: 'PO', allowNull: false },
  vendor_name:    { type: DataTypes.STRING(200) },
  delivery_note:  { type: DataTypes.STRING(50) },
  putaway_strategy: { type: DataTypes.ENUM('FEFO','FIFO','LIFO','MANUAL'), defaultValue: 'FEFO' },
  status:         { type: DataTypes.ENUM('OPEN','CONFIRMED','CANCELLED'), defaultValue: 'OPEN' },
  confirmed_by:   { type: DataTypes.INTEGER },
  confirmed_at:   { type: DataTypes.DATE },
  sap_mat_doc:    { type: DataTypes.STRING(20) },   // SAP material document after posting
  notes:          { type: DataTypes.TEXT },
  created_by:     { type: DataTypes.INTEGER },
}, { tableName: 'goods_receipts' });

const GoodsReceiptItem = sequelize.define('GoodsReceiptItem', {
  id:              { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  goods_receipt_id:{ type: DataTypes.INTEGER, allowNull: false },
  item_number:     { type: DataTypes.INTEGER, allowNull: false },
  material_id:     { type: DataTypes.INTEGER, allowNull: false },
  batch_id:        { type: DataTypes.INTEGER },
  planned_qty:     { type: DataTypes.DECIMAL(15,3) },
  received_qty:    { type: DataTypes.DECIMAL(15,3) },
  unit:            { type: DataTypes.STRING(6) },
  to_bin_id:       { type: DataTypes.INTEGER },    // destination bin (manual or auto)
}, { tableName: 'goods_receipt_items' });

/* ── GoodsIssue ───────────────────────────────────────────── */
const GoodsIssue = sequelize.define('GoodsIssue', {
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  gi_number:      { type: DataTypes.STRING(20), unique: true },    // GI-2024-001
  warehouse_id:   { type: DataTypes.STRING(10), allowNull: false },
  sap_so_number:  { type: DataTypes.STRING(20) },   // SAP Sales Order / Doc Reference
  issue_type:     { type: DataTypes.ENUM('SO', 'TRANSFER', 'SUBCONTRACTING'), defaultValue: 'SO', allowNull: false },
  customer_name:  { type: DataTypes.STRING(200) },
  delivery_number:{ type: DataTypes.STRING(20) },
  picking_strategy: { type: DataTypes.ENUM('FEFO','FIFO','LIFO','MANUAL'), defaultValue: 'FEFO' },
  status:         { type: DataTypes.ENUM('OPEN','PICKING','CONFIRMED','CANCELLED'), defaultValue: 'OPEN' },
  confirmed_by:   { type: DataTypes.INTEGER },
  confirmed_at:   { type: DataTypes.DATE },
  sap_mat_doc:    { type: DataTypes.STRING(20) },
  notes:          { type: DataTypes.TEXT },
  created_by:     { type: DataTypes.INTEGER },
}, { tableName: 'goods_issues' });

const GoodsIssueItem = sequelize.define('GoodsIssueItem', {
  id:              { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  goods_issue_id:  { type: DataTypes.INTEGER, allowNull: false },
  item_number:     { type: DataTypes.INTEGER, allowNull: false },
  material_id:     { type: DataTypes.INTEGER, allowNull: false },
  batch_id:        { type: DataTypes.INTEGER },
  requested_qty:   { type: DataTypes.DECIMAL(15,3) },
  picked_qty:      { type: DataTypes.DECIMAL(15,3), defaultValue: 0 },
  unit:            { type: DataTypes.STRING(6) },
  from_bin_id:     { type: DataTypes.INTEGER },   // determined by picking strategy
}, { tableName: 'goods_issue_items' });

/* ── ASSOCIATIONS ─────────────────────────────────────────── */
TransferOrder.hasMany(TransferOrderItem, { foreignKey: 'transfer_order_id', as: 'items' });
TransferOrderItem.belongsTo(TransferOrder, { foreignKey: 'transfer_order_id' });

GoodsReceipt.hasMany(GoodsReceiptItem, { foreignKey: 'goods_receipt_id', as: 'items' });
GoodsReceiptItem.belongsTo(GoodsReceipt, { foreignKey: 'goods_receipt_id' });

GoodsIssue.hasMany(GoodsIssueItem, { foreignKey: 'goods_issue_id', as: 'items' });
GoodsIssueItem.belongsTo(GoodsIssue, { foreignKey: 'goods_issue_id' });

module.exports = { TransferOrder, TransferOrderItem, GoodsReceipt, GoodsReceiptItem, GoodsIssue, GoodsIssueItem };
