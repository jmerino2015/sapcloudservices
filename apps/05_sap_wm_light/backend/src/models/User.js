/* ============================================================
   Model: User
   ============================================================ */
'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:         { type: DataTypes.STRING(100), allowNull: false },
  email:        { type: DataTypes.STRING(150), allowNull: false, unique: true },
  password_hash:{ type: DataTypes.STRING(255), allowNull: false },
  role:         { type: DataTypes.ENUM('admin','supervisor','operator'), allowNull: false, defaultValue: 'operator' },
  initials:     { type: DataTypes.STRING(5) },
  status:       { type: DataTypes.ENUM('ACTIVE','INACTIVE'), defaultValue: 'ACTIVE' },
  last_login:   { type: DataTypes.DATE },
}, { tableName: 'users' });

User.prototype.checkPassword = function(plain) {
  return bcrypt.compare(plain, this.password_hash);
};
User.hashPassword = (plain) => bcrypt.hash(plain, 10);

module.exports = User;
