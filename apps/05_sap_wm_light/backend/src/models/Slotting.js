'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/* ── Product Affinity ─────────────────────────────────────── */
const ProductAffinity = sequelize.define('ProductAffinity', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  warehouse_id: { type: DataTypes.STRING(10), allowNull: false },
  material_id_1: { type: DataTypes.INTEGER, allowNull: false },
  material_id_2: { type: DataTypes.INTEGER, allowNull: false },
  affinity_score: { type: DataTypes.INTEGER, defaultValue: 0 },
  last_analyzed_at: { type: DataTypes.DATE }
}, {
  tableName: 'product_affinities',
  indexes: [
    { unique: true, fields: ['warehouse_id', 'material_id_1', 'material_id_2'] }
  ]
});

/* ── Slotting Recommendation ──────────────────────────────── */
const SlottingRecommendation = sequelize.define('SlottingRecommendation', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  warehouse_id: { type: DataTypes.STRING(10), allowNull: false },
  material_id: { type: DataTypes.INTEGER, allowNull: false },
  batch_id: { type: DataTypes.INTEGER },
  from_bin_id: { type: DataTypes.INTEGER, allowNull: false },
  to_bin_id: { type: DataTypes.INTEGER, allowNull: false },
  quantity: { type: DataTypes.DECIMAL(15,3), allowNull: false },
  reason: { type: DataTypes.STRING(100), allowNull: false }, // ej. 'MOVE_A_TO_FAST_BIN'
  status: { type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'), defaultValue: 'PENDING' },
  transfer_order_id: { type: DataTypes.INTEGER }, // TO creada si se aprueba
  created_by: { type: DataTypes.INTEGER },
  processed_by: { type: DataTypes.INTEGER },
  processed_at: { type: DataTypes.DATE }
}, {
  tableName: 'slotting_recommendations'
});

module.exports = { ProductAffinity, SlottingRecommendation };
