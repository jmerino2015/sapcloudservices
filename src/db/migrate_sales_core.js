const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  try {
    console.log('Running Sales Core schema migration...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'sales_core_schema.sql'), 'utf8');
    await pool.query(schemaSql);
    console.log('✅ Sales Core schema applied.');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await pool.end();
  }
}

migrate();
