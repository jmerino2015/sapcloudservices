/* ============================================================
   migrate.js — Crea la BD si no existe y sincroniza todas las tablas
   Uso: npm run migrate
   ============================================================ */
'use strict';
require('dotenv').config();

async function createDatabaseIfNotExists() {
  const { Sequelize } = require('sequelize');
  const dbName = process.env.DB_NAME || 'wm_light';
  const dbUser = process.env.DB_USER || 'postgres';
  const dbPass = process.env.DB_PASS || 'postgres';
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = parseInt(process.env.DB_PORT) || 5432;

  // Connect to postgres (system DB) to create wm_light if needed
  const adminSeq = new Sequelize('postgres', dbUser, dbPass, {
    host: dbHost, port: dbPort, dialect: 'postgres', logging: false
  });

  try {
    await adminSeq.authenticate();
    const [results] = await adminSeq.query(
      `SELECT 1 FROM pg_database WHERE datname = '${dbName}'`
    );
    if (results.length === 0) {
      console.log(`  📦 Creando base de datos "${dbName}"...`);
      await adminSeq.query(`CREATE DATABASE "${dbName}"`);
      console.log(`  ✅ Base de datos "${dbName}" creada`);
    } else {
      console.log(`  ✅ Base de datos "${dbName}" ya existe`);
    }
  } catch(e) {
    console.warn(`  ⚠️  No se pudo verificar/crear la BD: ${e.message}`);
    console.warn('     Asegúrate que el usuario tiene permiso CREATEDB');
  } finally {
    await adminSeq.close();
  }
}

async function migrate() {
  console.log('\n🔄 WM Light — Migración de base de datos');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await createDatabaseIfNotExists();

  console.log('  🔄 Conectando a PostgreSQL...');
  const { sequelize } = require('./index');
  await sequelize.authenticate();
  console.log('  ✅ Conexión OK');

  console.log('  🔄 Sincronizando tablas...');
  await sequelize.sync({ force: true });
  console.log('  ✅ Todas las tablas sincronizadas\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ✅ Migración completada. Ejecuta "npm run seed" para datos iniciales.\n');

  process.exit(0);
}

migrate().catch(err => {
  console.error('\n❌ Error en migración:', err.message);
  console.error(err.stack);
  process.exit(1);
});
