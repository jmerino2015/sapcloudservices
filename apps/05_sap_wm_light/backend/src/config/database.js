/* ============================================================
   Database Config — Sequelize + PostgreSQL
   ============================================================ */

'use strict';
require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'wm_light',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASS || 'postgres',
  {
    host:    process.env.DB_HOST    || 'localhost',
    port:    parseInt(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    native:  false,
    logging: process.env.NODE_ENV === 'development' ? false : false,
    dialectOptions: {
      ssl: false,
      // Needed for scram-sha-256 on local Windows installs
      keepAlive: true,
    },
    pool: { max: 10, min: 2, acquire: 30000, idle: 10000 },
    define: {
      underscored:    true,   // snake_case columns
      timestamps:     true,
      createdAt:      'created_at',
      updatedAt:      'updated_at',
    }
  }
);

module.exports = sequelize;
