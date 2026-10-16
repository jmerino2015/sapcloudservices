/**
 * Script de inicialización y migración manual de base de datos pública
 */
require('dotenv').config();
const db = require('./database');

async function run() {
  console.log('🚀 Iniciando conexión e inicialización de Base de Datos Pública...');
  const success = await db.initDatabase();
  const status = await db.getDbStatus();
  console.log('\n📊 Estado del conector:');
  console.log(JSON.stringify(status, null, 2));

  if (success) {
    console.log('\n✅ Base de datos pública lista para demostraciones.');
  } else {
    console.log('\n⚠️ Nota: No se pudo conectar a la base de datos externa o no hay DATABASE_URL configurada.');
    console.log('ℹ️ Para conectarla, edita el archivo .env y agrega tu cadena de conexión:');
    console.log('   DATABASE_URL=postgresql://usuario:contraseña@servidor.com:5432/postgres?sslmode=require\n');
  }
  process.exit(0);
}

run();
