/**
 * Sales Core Service - CRM & C4C Suite
 * Clean Core Architecture: Hybrid Supabase PostgreSQL & In-Memory Fallback
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

let poolRef = null;
let isConnectedRef = () => false;

// Fallback in-memory state
let inMemoryState = {
  accounts: [
    {
      account_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      account_number: 'ACC-1001',
      name: 'Industrial Global Corp S.A.',
      industry: 'Manufactura y Minería',
      address: 'Av. Los Parques Industriales 4500',
      city: 'Santiago',
      country: 'Chile',
      created_at: new Date().toISOString()
    },
    {
      account_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
      account_number: 'ACC-1002',
      name: 'Compañía Minera del Norte S.A.',
      industry: 'Minería',
      address: 'Ruta 5 Norte Km 14',
      city: 'Antofagasta',
      country: 'Chile',
      created_at: new Date().toISOString()
    },
    {
      account_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
      account_number: 'ACC-1003',
      name: 'Distribuidora Andina de Energía',
      industry: 'Energía & Utilities',
      address: 'Av. Andrés Bello 2711',
      city: 'Santiago',
      country: 'Chile',
      created_at: new Date().toISOString()
    }
  ],
  contacts: [
    {
      contact_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11',
      account_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      first_name: 'Carlos',
      last_name: 'Mendoza',
      email: 'carlos.mendoza@industrialcorp.com',
      phone: '+56 9 8765 4321',
      role: 'Director de Operaciones',
      created_at: new Date().toISOString()
    },
    {
      contact_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b12',
      account_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
      first_name: 'Marcela',
      last_name: 'Ríos',
      email: 'm.rios@mineranorte.cl',
      phone: '+56 9 7654 3210',
      role: 'Gerente de Abastecimiento',
      created_at: new Date().toISOString()
    }
  ],
  leads: [
    {
      lead_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11',
      account_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      source: 'Feria Industrial EXPONOR 2026',
      status: 'QUALIFIED',
      rating: 5,
      created_at: new Date().toISOString()
    },
    {
      lead_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c12',
      account_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
      source: 'Portal Web SAP C4C',
      status: 'NEW',
      rating: 4,
      created_at: new Date().toISOString()
    }
  ],
  opportunities: [
    {
      opportunity_id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d11',
      account_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      title: 'Renovación de Motores Trifásicos IE4 Planta 2',
      stage: 'NEGOTIATION',
      probability: 75.0,
      expected_amount: 145000.0,
      currency_code: 'USD',
      close_date: '2026-12-15',
      created_at: new Date().toISOString()
    },
    {
      opportunity_id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d12',
      account_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
      title: 'Contrato de Mantenimiento Preventivo Servomotores',
      stage: 'QUALIFICATION',
      probability: 40.0,
      expected_amount: 85000.0,
      currency_code: 'USD',
      close_date: '2027-01-30',
      created_at: new Date().toISOString()
    }
  ],
  sales_quotes: [
    {
      quote_id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e11',
      quote_number: 'QT-2026-0045',
      status: 'APPROVED',
      total_amount: 48500.0,
      currency_code: 'USD',
      valid_until: '2026-11-30',
      created_at: new Date().toISOString()
    }
  ],
  service_tickets: [
    {
      ticket_id: 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f11',
      priority: 'HIGH',
      status: 'OPEN',
      subject: 'Falla en sensor térmico Motor 450kW',
      description: 'Disparo de alarma por sobretemperatura en bobinado Fase B.',
      opened_at: new Date().toISOString()
    },
    {
      ticket_id: 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f12',
      priority: 'MEDIUM',
      status: 'IN_PROCESS',
      subject: 'Calibración de Variador de Frecuencia Sinamics',
      description: 'Ajuste de rampa de aceleración y parámetros de torque.',
      opened_at: new Date().toISOString()
    }
  ],
  products: [
    {
      product_id: '10eebc99-9c0b-4ef8-bb6d-6bb9bd380111',
      product_code: 'SKU-MOT-IE4-01',
      name: 'Motor Trifásico Premium IE4 55kW',
      description: 'Alta eficiencia energética para servicio pesado industrial',
      price: 3450.0,
      currency_code: 'USD'
    },
    {
      product_id: '10eebc99-9c0b-4ef8-bb6d-6bb9bd380112',
      product_code: 'SKU-DRV-SIN-02',
      name: 'Variador de Frecuencia Vectorial 75kW',
      description: 'Control de par preciso con módulo PROFINET/Ethernet integrado',
      price: 5200.0,
      currency_code: 'USD'
    }
  ]
};

function initService(pool, isConnectedFn) {
  poolRef = pool;
  isConnectedRef = isConnectedFn;
}

// Helper to seed demo data into Supabase if empty
async function autoMigrateAndSeedSalesCore() {
  if (!poolRef || !isConnectedRef()) return;

  try {
    const schemaPath = path.join(__dirname, 'sales_core_schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf8');
      await poolRef.query(sql);
      console.log('[SalesCore] ✅ Esquema de tablas verificado/creado en Supabase.');
    }

    // Seed products
    for (const p of inMemoryState.products) {
      await poolRef.query(`
        INSERT INTO products (product_id, product_code, name, description, price, currency_code)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (product_code) DO NOTHING
      `, [p.product_id, p.product_code, p.name, p.description, p.price, p.currency_code]);
    }

    // Seed accounts
    for (const a of inMemoryState.accounts) {
      await poolRef.query(`
        INSERT INTO accounts (account_id, account_number, name, industry, address, city, country)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (account_number) DO NOTHING
      `, [a.account_id, a.account_number, a.name, a.industry, a.address, a.city, a.country]);
    }

    // Seed contacts
    for (const c of inMemoryState.contacts) {
      await poolRef.query(`
        INSERT INTO contacts (contact_id, account_id, first_name, last_name, email, phone, role)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (email) DO NOTHING
      `, [c.contact_id, c.account_id, c.first_name, c.last_name, c.email, c.phone, c.role]);
    }

    // Seed leads
    const leadsCount = await poolRef.query('SELECT COUNT(*) FROM leads');
    if (parseInt(leadsCount.rows[0].count, 10) === 0) {
      for (const l of inMemoryState.leads) {
        await poolRef.query(`
          INSERT INTO leads (lead_id, account_id, source, status, rating)
          VALUES ($1, $2, $3, $4, $5)
        `, [l.lead_id, l.account_id, l.source, l.status, l.rating]);
      }
    }

    // Seed opportunities
    const oppsCount = await poolRef.query('SELECT COUNT(*) FROM opportunities');
    if (parseInt(oppsCount.rows[0].count, 10) === 0) {
      for (const o of inMemoryState.opportunities) {
        await poolRef.query(`
          INSERT INTO opportunities (opportunity_id, account_id, title, stage, probability, expected_amount, currency_code, close_date)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [o.opportunity_id, o.account_id, o.title, o.stage, o.probability, o.expected_amount, o.currency_code, o.close_date]);
      }
    }

    // Seed sales_quotes
    for (const q of inMemoryState.sales_quotes) {
      await poolRef.query(`
        INSERT INTO sales_quotes (quote_id, quote_number, status, total_amount, currency_code, valid_until)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (quote_number) DO NOTHING
      `, [q.quote_id, q.quote_number, q.status, q.total_amount, q.currency_code, q.valid_until]);
    }

    // Seed service_tickets
    const ticketsCount = await poolRef.query('SELECT COUNT(*) FROM service_tickets');
    if (parseInt(ticketsCount.rows[0].count, 10) === 0) {
      for (const t of inMemoryState.service_tickets) {
        await poolRef.query(`
          INSERT INTO service_tickets (ticket_id, priority, status, subject, description)
          VALUES ($1, $2, $3, $4, $5)
        `, [t.ticket_id, t.priority, t.status, t.subject, t.description]);
      }
    }

    console.log('[SalesCore] ✨ Datos semilla sincronizados en Supabase.');
  } catch (err) {
    console.error('[SalesCore] ⚠️ Error en autoMigrateAndSeedSalesCore:', err.message);
  }
}

/*** KPI ANALYTICS ***/
async function getSalesCoreKpis() {
  if (poolRef && isConnectedRef()) {
    try {
      const accRes = await poolRef.query('SELECT COUNT(*) FROM accounts');
      const leadRes = await poolRef.query('SELECT COUNT(*) FROM leads');
      const oppRes = await poolRef.query('SELECT COUNT(*), COALESCE(SUM(expected_amount), 0) as total FROM opportunities');
      const ticketRes = await poolRef.query("SELECT COUNT(*) FROM service_tickets WHERE status != 'CLOSED'");

      const openTickets = parseInt(ticketRes.rows[0].count, 10);
      const totalAccounts = parseInt(accRes.rows[0].count, 10);
      const oppTotalAmount = parseFloat(oppRes.rows[0].total || 0);

      return {
        kpi1: {
          value: openTickets.toString(),
          label: "Tickets Abiertos",
          sublabel: "1 Alerta de SLA",
          color: "#e06a3b",
          trend: "critical"
        },
        kpi2: {
          value: totalAccounts.toString(),
          label: "Cuentas B2B Activas",
          sublabel: "Base Clientes VIP",
          color: "#1e293b",
          trend: "neutral"
        },
        kpi3: {
          value: `$${(oppTotalAmount / 1000).toFixed(1)}K`,
          label: "Pipeline Comercial",
          sublabel: `${oppRes.rows[0].count} Oportunidades`,
          color: "#107e3e",
          trend: "good"
        },
        kpi4: {
          value: leadRes.rows[0].count.toString(),
          label: "Leads Calificados C4C",
          sublabel: "Feria & Web",
          color: "#e06a3b",
          trend: "up"
        }
      };
    } catch (e) {
      console.warn('[SalesCore] Error query KPIs, fallback en memoria:', e.message);
    }
  }

  return {
    kpi1: { value: "2", label: "Tickets Abiertos", sublabel: "1 Alerta de SLA", color: "#e06a3b", trend: "critical" },
    kpi2: { value: inMemoryState.accounts.length.toString(), label: "Cuentas B2B Activas", sublabel: "Base Clientes VIP", color: "#1e293b", trend: "neutral" },
    kpi3: { value: "$230.0K", label: "Pipeline Comercial", sublabel: "2 Oportunidades", color: "#107e3e", trend: "good" },
    kpi4: { value: inMemoryState.leads.length.toString(), label: "Leads Calificados C4C", sublabel: "Feria & Web", color: "#e06a3b", trend: "up" }
  };
}

/*** ACCOUNTS CRUD ***/
async function getAccounts() {
  if (poolRef && isConnectedRef()) {
    try {
      const res = await poolRef.query('SELECT * FROM accounts ORDER BY created_at DESC');
      return { success: true, total: res.rowCount, data: res.rows };
    } catch (e) {
      console.warn('[SalesCore] Error getAccounts DB, fallback memoria');
    }
  }
  return { success: true, total: inMemoryState.accounts.length, data: inMemoryState.accounts };
}

async function createAccount(payload) {
  const { account_number, name, industry, address, city, country } = payload;
  const newAcc = {
    account_id: 'acc-' + Date.now(),
    account_number: account_number || 'ACC-' + Math.floor(1000 + Math.random() * 9000),
    name: name || 'Nueva Cuenta B2B',
    industry: industry || 'Manufactura',
    address: address || '',
    city: city || 'Santiago',
    country: country || 'Chile',
    created_at: new Date().toISOString()
  };

  if (poolRef && isConnectedRef()) {
    try {
      const res = await poolRef.query(
        `INSERT INTO accounts (account_number, name, industry, address, city, country)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [newAcc.account_number, newAcc.name, newAcc.industry, newAcc.address, newAcc.city, newAcc.country]
      );
      return { success: true, data: res.rows[0] };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  inMemoryState.accounts.unshift(newAcc);
  return { success: true, data: newAcc };
}

/*** CONTACTS CRUD ***/
async function getContacts() {
  if (poolRef && isConnectedRef()) {
    try {
      const res = await poolRef.query('SELECT * FROM contacts ORDER BY created_at DESC');
      return { success: true, total: res.rowCount, data: res.rows };
    } catch (e) {
      console.warn('[SalesCore] Error getContacts DB, fallback memoria');
    }
  }
  return { success: true, total: inMemoryState.contacts.length, data: inMemoryState.contacts };
}

async function createContact(payload) {
  const { account_id, first_name, last_name, email, phone, role } = payload;
  const newContact = {
    contact_id: 'cnt-' + Date.now(),
    account_id,
    first_name,
    last_name,
    email,
    phone,
    role: role || 'Contacto Comercial',
    created_at: new Date().toISOString()
  };

  if (poolRef && isConnectedRef()) {
    try {
      const res = await poolRef.query(
        `INSERT INTO contacts (account_id, first_name, last_name, email, phone, role)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [account_id, first_name, last_name, email, phone, role]
      );
      return { success: true, data: res.rows[0] };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  inMemoryState.contacts.unshift(newContact);
  return { success: true, data: newContact };
}

/*** LEADS CRUD ***/
async function getLeads() {
  if (poolRef && isConnectedRef()) {
    try {
      const res = await poolRef.query('SELECT * FROM leads ORDER BY created_at DESC');
      return { success: true, total: res.rowCount, data: res.rows };
    } catch (e) {
      console.warn('[SalesCore] Error getLeads DB, fallback memoria');
    }
  }
  return { success: true, total: inMemoryState.leads.length, data: inMemoryState.leads };
}

async function createLead(payload) {
  const { account_id, source, status, rating } = payload;
  const newLead = {
    lead_id: 'lead-' + Date.now(),
    account_id,
    source: source || 'Portal Web C4C',
    status: status || 'NEW',
    rating: rating || 3,
    created_at: new Date().toISOString()
  };

  if (poolRef && isConnectedRef()) {
    try {
      const res = await poolRef.query(
        `INSERT INTO leads (account_id, source, status, rating)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [account_id, newLead.source, newLead.status, newLead.rating]
      );
      return { success: true, data: res.rows[0] };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  inMemoryState.leads.unshift(newLead);
  return { success: true, data: newLead };
}

/*** OPPORTUNITIES CRUD ***/
async function getOpportunities() {
  if (poolRef && isConnectedRef()) {
    try {
      const res = await poolRef.query('SELECT * FROM opportunities ORDER BY created_at DESC');
      return { success: true, total: res.rowCount, data: res.rows };
    } catch (e) {
      console.warn('[SalesCore] Error getOpportunities DB, fallback memoria');
    }
  }
  return { success: true, total: inMemoryState.opportunities.length, data: inMemoryState.opportunities };
}

async function createOpportunity(payload) {
  const { lead_id, account_id, title, stage, probability, expected_amount, currency_code, close_date } = payload;
  const newOpp = {
    opportunity_id: 'opp-' + Date.now(),
    lead_id,
    account_id,
    title: title || 'Nueva Oportunidad de Venta',
    stage: stage || 'QUALIFICATION',
    probability: probability || 20,
    expected_amount: expected_amount || 0,
    currency_code: currency_code || 'USD',
    close_date: close_date || null,
    created_at: new Date().toISOString()
  };

  if (poolRef && isConnectedRef()) {
    try {
      const res = await poolRef.query(
        `INSERT INTO opportunities (lead_id, account_id, title, stage, probability, expected_amount, currency_code, close_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [lead_id, account_id, newOpp.title, newOpp.stage, newOpp.probability, newOpp.expected_amount, newOpp.currency_code, newOpp.close_date]
      );
      return { success: true, data: res.rows[0] };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  inMemoryState.opportunities.unshift(newOpp);
  return { success: true, data: newOpp };
}

/*** EXPORTS ***/
module.exports = {
  initService,
  autoMigrateAndSeedSalesCore,
  getSalesCoreKpis,
  getAccounts,
  createAccount,
  getContacts,
  createContact,
  getLeads,
  createLead,
  getOpportunities,
  createOpportunity
};
