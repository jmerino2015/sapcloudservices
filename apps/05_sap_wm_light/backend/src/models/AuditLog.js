/* ============================================================
   Model: SapSyncLog — Log de sincronizaciones SAP
   ============================================================ */
'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SapSyncLog = sequelize.define('SapSyncLog', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  sync_type:    { type: DataTypes.ENUM('MATERIALS','BATCHES','FULL'), allowNull: false },
  status:       { type: DataTypes.ENUM('RUNNING','SUCCESS','PARTIAL','ERROR'), defaultValue: 'RUNNING' },
  records_synced: { type: DataTypes.INTEGER, defaultValue: 0 },
  records_failed: { type: DataTypes.INTEGER, defaultValue: 0 },
  duration_ms:  { type: DataTypes.INTEGER },
  triggered_by: { type: DataTypes.STRING(20), defaultValue: 'scheduler' },  // 'scheduler' | userId
  error_detail: { type: DataTypes.TEXT },
  started_at:   { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  finished_at:  { type: DataTypes.DATE },
}, { tableName: 'sap_sync_logs', updatedAt: false });

/* ── AuditLog — log de todas las operaciones de usuario ────── */
const AuditLog = sequelize.define('AuditLog', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:      { type: DataTypes.INTEGER },
  user_email:   { type: DataTypes.STRING(150) },
  action:       { type: DataTypes.STRING(30), allowNull: false },   // CREATE, UPDATE, DELETE, CONFIRM, CANCEL
  entity_type:  { type: DataTypes.STRING(50) },                     // GoodsReceipt, TransferOrder...
  entity_id:    { type: DataTypes.INTEGER },
  entity_ref:   { type: DataTypes.STRING(30) },                     // GR-2024-001
  old_values:   { type: DataTypes.JSONB },
  new_values:   { type: DataTypes.JSONB },
  ip_address:   { type: DataTypes.STRING(45) },
  user_agent:   { type: DataTypes.STRING(300) },
}, { tableName: 'audit_logs', updatedAt: false });

module.exports = { SapSyncLog, AuditLog };
