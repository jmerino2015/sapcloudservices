/* ============================================================
   Model: MovementType
   ============================================================ */
'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MovementType = sequelize.define('MovementType', {
  id:          { type: DataTypes.STRING(3), primaryKey: true },   // 101, 601, 999
  description: { type: DataTypes.STRING(100), allowNull: false },
  type:        { type: DataTypes.ENUM('Inbound','Outbound','Internal'), defaultValue: 'Internal' },
  state:       { type: DataTypes.STRING(20), defaultValue: 'Information' } // Success, Warning, Information
}, { tableName: 'movement_types', timestamps: false });

module.exports = MovementType;
