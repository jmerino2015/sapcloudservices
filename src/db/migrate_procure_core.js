const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const seedData = require('./seed_procure_core');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  try {
    console.log('Connecting to PostgreSQL Supabase at:', process.env.DATABASE_URL.split('@')[1]);
    const connCheck = await pool.query('SELECT current_database(), current_user, version()');
    console.log('Connected successfully. Database:', connCheck.rows[0].current_database);

    // 1. Read and execute procure_core_schema.sql
    const schemaSql = fs.readFileSync(path.join(__dirname, 'procure_core_schema.sql'), 'utf8');
    console.log('Executing procure_core_schema.sql...');
    await pool.query(schemaSql);
    console.log('✅ Schema migration executed successfully in Supabase.');

    // 2. Check tables
    const tableRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name LIKE 'ztb_proc%'
      ORDER BY table_name;
    `);
    console.log('ProcureCore tables verified in Supabase:', tableRes.rows.map(r => r.table_name));

    // 3. Insert or update seed data
    console.log('Seeding initial events into ztb_procrfx...');
    for (const ev of seedData.events) {
      await pool.query(`
        INSERT INTO ztb_procrfx (
          event_uuid, event_id, title, event_type, category, target_spend, lowest_bid_amount,
          projected_savings, savings_percentage, currency_code, status, supplier_count, bids_count,
          closing_date, awarded_supplier, bids_history
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (event_id) DO UPDATE SET
          title = EXCLUDED.title,
          event_type = EXCLUDED.event_type,
          category = EXCLUDED.category,
          target_spend = EXCLUDED.target_spend,
          lowest_bid_amount = EXCLUDED.lowest_bid_amount,
          projected_savings = EXCLUDED.projected_savings,
          savings_percentage = EXCLUDED.savings_percentage,
          status = EXCLUDED.status,
          supplier_count = EXCLUDED.supplier_count,
          bids_count = EXCLUDED.bids_count,
          closing_date = EXCLUDED.closing_date,
          awarded_supplier = EXCLUDED.awarded_supplier,
          bids_history = EXCLUDED.bids_history;
      `, [
        ev.event_uuid, ev.event_id, ev.title, ev.event_type, ev.category, ev.target_spend,
        ev.lowest_bid_amount, ev.projected_savings, ev.savings_percentage, ev.currency_code,
        ev.status, ev.supplier_count, ev.bids_count, ev.closing_date, ev.awarded_supplier,
        JSON.stringify(ev.bids_history || [])
      ]);
    }
    console.log('✅ ztb_procrfx seeded.');

    console.log('Seeding initial requisitions into ztb_procpr...');
    for (const pr of seedData.requisitions) {
      await pool.query(`
        INSERT INTO ztb_procpr (
          requisition_uuid, requisition_id, description, company_code, plant, purchasing_org,
          purchasing_group, requester_name, department, total_amount, currency_code, status,
          approval_level, sap_po_number, item_count, items_json
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (requisition_id) DO UPDATE SET
          description = EXCLUDED.description,
          total_amount = EXCLUDED.total_amount,
          status = EXCLUDED.status,
          approval_level = EXCLUDED.approval_level,
          sap_po_number = EXCLUDED.sap_po_number,
          item_count = EXCLUDED.item_count,
          items_json = EXCLUDED.items_json;
      `, [
        pr.requisition_uuid, pr.requisition_id, pr.description, pr.company_code, pr.plant,
        pr.purchasing_org, pr.purchasing_group, pr.requester_name, pr.department, pr.total_amount,
        pr.currency_code, pr.status, pr.approval_level, pr.sap_po_number, pr.item_count,
        JSON.stringify(pr.items_json || [])
      ]);
    }
    console.log('✅ ztb_procpr seeded.');

    console.log('Seeding initial invoices into ztb_procinv...');
    for (const inv of seedData.invoices) {
      await pool.query(`
        INSERT INTO ztb_procinv (
          invoice_uuid, invoice_id, supplier_invoice_number, supplier_tax_id, supplier_name,
          sap_po_number, sap_gr_number, po_amount, gr_amount, invoice_amount, variance_amount,
          variance_percentage, currency_code, match_status, payment_status, payment_block_reason, due_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        ON CONFLICT (invoice_id) DO UPDATE SET
          match_status = EXCLUDED.match_status,
          payment_status = EXCLUDED.payment_status,
          variance_amount = EXCLUDED.variance_amount,
          variance_percentage = EXCLUDED.variance_percentage,
          payment_block_reason = EXCLUDED.payment_block_reason;
      `, [
        inv.invoice_uuid, inv.invoice_id, inv.supplier_invoice_number, inv.supplier_tax_id,
        inv.supplier_name, inv.sap_po_number, inv.sap_gr_number, inv.po_amount, inv.gr_amount,
        inv.invoice_amount, inv.variance_amount, inv.variance_percentage, inv.currency_code,
        inv.match_status, inv.payment_status, inv.payment_block_reason, inv.due_date
      ]);
    }
    console.log('✅ ztb_procinv seeded.');

    // Count rows
    const cEvents = await pool.query('SELECT count(*) FROM ztb_procrfx');
    const cReqs = await pool.query('SELECT count(*) FROM ztb_procpr');
    const cInvs = await pool.query('SELECT count(*) FROM ztb_procinv');
    console.log(`Current counts in Supabase: ztb_procrfx=${cEvents.rows[0].count}, ztb_procpr=${cReqs.rows[0].count}, ztb_procinv=${cInvs.rows[0].count}`);

  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await pool.end();
  }
}

migrate();
