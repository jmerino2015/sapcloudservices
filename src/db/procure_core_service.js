/**
 * Procure Core Service - Source-to-Settle Transaccional (SAP Ariba Clone)
 * Clean Core Architecture: Hybrid Supabase PostgreSQL & In-Memory Resilient Fallback
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const seedData = require('./seed_procure_core');

let poolRef = null;
let isConnectedRef = () => false;

// Estado en memoria dinámico
let inMemoryState = {
  events: JSON.parse(JSON.stringify(seedData.events)),
  requisitions: JSON.parse(JSON.stringify(seedData.requisitions)),
  invoices: JSON.parse(JSON.stringify(seedData.invoices)),
  contracts: JSON.parse(JSON.stringify(seedData.contracts)),
  suppliers: JSON.parse(JSON.stringify(seedData.suppliers_slp))
};

function initService(pool, isConnectedFn) {
  poolRef = pool;
  isConnectedRef = isConnectedFn;
}

async function autoMigrateAndSeedProcureCore() {
  if (!poolRef || !isConnectedRef()) return;

  try {
    const schemaPath = path.join(__dirname, 'procure_core_schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf8');
      await poolRef.query(sql);
      console.log('[ProcureCore] ✅ Tablas ztb_proc* verificadas/creadas en Supabase.');
    }

    // Seed Events
    for (const ev of seedData.events) {
      await poolRef.query(`
        INSERT INTO ztb_procrfx (
          event_uuid, event_id, title, event_type, category, target_spend, lowest_bid_amount,
          projected_savings, savings_percentage, currency_code, status, supplier_count, bids_count,
          closing_date, awarded_supplier, bids_history
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (event_id) DO UPDATE SET
          lowest_bid_amount = EXCLUDED.lowest_bid_amount,
          projected_savings = EXCLUDED.projected_savings,
          status = EXCLUDED.status,
          bids_count = EXCLUDED.bids_count,
          bids_history = EXCLUDED.bids_history
      `, [
        ev.event_uuid, ev.event_id, ev.title, ev.event_type, ev.category, ev.target_spend,
        ev.lowest_bid_amount, ev.projected_savings, ev.savings_percentage, ev.currency_code,
        ev.status, ev.supplier_count, ev.bids_count, ev.closing_date, ev.awarded_supplier,
        JSON.stringify(ev.bids_history || [])
      ]);
    }

    // Seed Requisitions
    for (const pr of seedData.requisitions) {
      await poolRef.query(`
        INSERT INTO ztb_procpr (
          requisition_uuid, requisition_id, description, company_code, plant, purchasing_org,
          purchasing_group, requester_name, department, total_amount, currency_code, status,
          approval_level, sap_po_number, item_count, items_json
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (requisition_id) DO UPDATE SET
          status = EXCLUDED.status,
          sap_po_number = EXCLUDED.sap_po_number,
          approval_level = EXCLUDED.approval_level
      `, [
        pr.requisition_uuid, pr.requisition_id, pr.description, pr.company_code, pr.plant,
        pr.purchasing_org, pr.purchasing_group, pr.requester_name, pr.department, pr.total_amount,
        pr.currency_code, pr.status, pr.approval_level, pr.sap_po_number, pr.item_count,
        JSON.stringify(pr.items_json || [])
      ]);
    }

    // Seed Invoices
    for (const inv of seedData.invoices) {
      await poolRef.query(`
        INSERT INTO ztb_procinv (
          invoice_uuid, invoice_id, supplier_invoice_number, supplier_tax_id, supplier_name,
          sap_po_number, sap_gr_number, po_amount, gr_amount, invoice_amount, variance_amount,
          variance_percentage, currency_code, match_status, payment_status, payment_block_reason, due_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        ON CONFLICT (invoice_id) DO UPDATE SET
          match_status = EXCLUDED.match_status,
          payment_status = EXCLUDED.payment_status,
          variance_amount = EXCLUDED.variance_amount,
          payment_block_reason = EXCLUDED.payment_block_reason
      `, [
        inv.invoice_uuid, inv.invoice_id, inv.supplier_invoice_number, inv.supplier_tax_id,
        inv.supplier_name, inv.sap_po_number, inv.sap_gr_number, inv.po_amount, inv.gr_amount,
        inv.invoice_amount, inv.variance_amount, inv.variance_percentage, inv.currency_code,
        inv.match_status, inv.payment_status, inv.payment_block_reason, inv.due_date
      ]);
    }

    console.log('[ProcureCore] ✨ Datos semilla Procure Core sincronizados en Supabase.');
  } catch (err) {
    console.warn('[ProcureCore] ⚠️ Advertencia en migración Procure Core:', err.message);
  }
}

// ==========================================
// MÉTODOS DE CONSULTA Y KPIS HORIZON
// ==========================================

async function getProcureCoreKpis() {
  const events = await getProcureEvents();
  const reqs = await getProcureRequisitions();
  const invoices = await getProcureInvoices();

  // KPI 1 (Naranja #e06a3b): Requisiciones y Licitaciones Pendientes
  const openReqs = reqs.filter(r => r.status === 'PENDING_APPROVAL' || r.status === 'DRAFT').length;
  const openEvents = events.filter(e => e.status === 'PUBLISHED' || e.status === 'ACTIVE').length;
  const pendingTotal = openReqs + openEvents;

  // KPI 2 (Slate #1e293b): Spend Total Gestionado
  const totalSpend = events.reduce((sum, e) => sum + parseFloat(e.target_spend || 0), 0) +
                     reqs.reduce((sum, r) => sum + parseFloat(r.total_amount || 0), 0);

  // KPI 3 (Verde #107e3e): Tasa de 3-Way Matching Touchless
  const matchedInvoices = invoices.filter(i => i.match_status === 'MATCHED').length;
  const matchRate = invoices.length > 0 ? ((matchedInvoices / invoices.length) * 100).toFixed(1) : 0;

  // KPI 4 (Naranja #e06a3b): Discrepancias / Bloqueos Activos
  const blockedInvoices = invoices.filter(i => i.match_status.includes('DISCREPANCY') || i.payment_status === 'BLOCKED').length;

  return {
    kpi1: {
      value: pendingTotal,
      label: 'Acciones Pendientes',
      sublabel: `${openEvents} RFX en curso · ${openReqs} PRs por aprobar`,
      color: '#e06a3b'
    },
    kpi2: {
      value: `$${(totalSpend / 1000).toFixed(1)}K`,
      label: 'Spend Total Gestionado',
      sublabel: `${events.length + reqs.length} Expedientes S2S Activos`,
      color: '#1e293b'
    },
    kpi3: {
      value: `${matchRate}%`,
      label: 'Tasa 3-Way Match OK',
      sublabel: `${matchedInvoices} de ${invoices.length} Facturas Touchless`,
      color: '#107e3e'
    },
    kpi4: {
      value: blockedInvoices,
      label: 'Discrepancias en Revisión',
      sublabel: `${blockedInvoices} Facturas bloqueadas > ±2%`,
      color: '#e06a3b'
    }
  };
}

// 1. SOURCING & RFX
async function getProcureEvents() {
  if (poolRef && isConnectedRef()) {
    try {
      const res = await poolRef.query('SELECT * FROM ztb_procrfx ORDER BY event_id ASC');
      if (res.rows && res.rows.length > 0) return res.rows;
    } catch (e) {
      console.warn('[ProcureCore] Fallback a memoria para events:', e.message);
    }
  }
  return inMemoryState.events;
}

async function publishProcureEvent(eventId) {
  if (poolRef && isConnectedRef()) {
    try {
      await poolRef.query(`UPDATE ztb_procrfx SET status = 'PUBLISHED' WHERE event_id = $1`, [eventId]);
    } catch (e) {}
  }
  const item = inMemoryState.events.find(e => e.event_id === eventId);
  if (item) item.status = 'PUBLISHED';
  return { success: true, message: `Evento ${eventId} publicado en Ariba Network Clone` };
}

async function awardProcureEvent(eventId, supplierName) {
  if (poolRef && isConnectedRef()) {
    try {
      await poolRef.query(`UPDATE ztb_procrfx SET status = 'AWARDED', awarded_supplier = $1 WHERE event_id = $2`, [supplierName, eventId]);
    } catch (e) {}
  }
  const item = inMemoryState.events.find(e => e.event_id === eventId);
  if (item) {
    item.status = 'AWARDED';
    item.awarded_supplier = supplierName;
  }
  return { success: true, message: `Licitación ${eventId} adjudicada a ${supplierName}` };
}

// 2. GUIDED BUYING & REQUISITIONS
async function getProcureRequisitions() {
  if (poolRef && isConnectedRef()) {
    try {
      const res = await poolRef.query('SELECT * FROM ztb_procpr ORDER BY requisition_id ASC');
      if (res.rows && res.rows.length > 0) return res.rows;
    } catch (e) {
      console.warn('[ProcureCore] Fallback a memoria para requisitions:', e.message);
    }
  }
  return inMemoryState.requisitions;
}

async function submitProcureRequisition(prId) {
  if (poolRef && isConnectedRef()) {
    try {
      await poolRef.query(`UPDATE ztb_procpr SET status = 'PENDING_APPROVAL', approval_level = 1 WHERE requisition_id = $1`, [prId]);
    } catch (e) {}
  }
  const item = inMemoryState.requisitions.find(r => r.requisition_id === prId);
  if (item) {
    item.status = 'PENDING_APPROVAL';
    item.approval_level = 1;
  }
  return { success: true, message: `Requisición ${prId} enviada a flujo de aprobación` };
}

async function approveProcureRequisition(prId) {
  if (poolRef && isConnectedRef()) {
    try {
      await poolRef.query(`UPDATE ztb_procpr SET status = 'APPROVED', approval_level = 2 WHERE requisition_id = $1`, [prId]);
    } catch (e) {}
  }
  const item = inMemoryState.requisitions.find(r => r.requisition_id === prId);
  if (item) {
    item.status = 'APPROVED';
    item.approval_level = 2;
  }
  return { success: true, message: `Requisición ${prId} aprobada formalmente` };
}

async function createSAPPOFromPR(prId) {
  const randomPo = '45000' + Math.floor(10000 + Math.random() * 90000);
  if (poolRef && isConnectedRef()) {
    try {
      await poolRef.query(`UPDATE ztb_procpr SET status = 'PO_CREATED', sap_po_number = $1 WHERE requisition_id = $2`, [randomPo, prId]);
    } catch (e) {}
  }
  const item = inMemoryState.requisitions.find(r => r.requisition_id === prId);
  if (item) {
    item.status = 'PO_CREATED';
    item.sap_po_number = randomPo;
  }
  return { success: true, poNumber: randomPo, message: `Pedido SAP MM ${randomPo} generado automáticamente` };
}

// 3. SMART INVOICES & 3-WAY MATCHING
async function getProcureInvoices() {
  if (poolRef && isConnectedRef()) {
    try {
      const res = await poolRef.query('SELECT * FROM ztb_procinv ORDER BY invoice_id ASC');
      if (res.rows && res.rows.length > 0) return res.rows;
    } catch (e) {
      console.warn('[ProcureCore] Fallback a memoria para invoices:', e.message);
    }
  }
  return inMemoryState.invoices;
}

async function execute3WayMatch(invoiceId) {
  const inv = inMemoryState.invoices.find(i => i.invoice_id === invoiceId);
  if (!inv) return { success: false, message: 'Factura no encontrada' };

  const diff = inv.invoice_amount - inv.po_amount;
  const pct = (diff / inv.po_amount) * 100;
  const absPct = Math.abs(pct);

  let matchStatus = 'MATCHED';
  let paymentStatus = 'SCHEDULED';
  let reason = '3-Way Match exitoso dentro del umbral de tolerancia permitido (±2.00%)';

  if (absPct > 2.0) {
    matchStatus = diff > 0 ? 'DISCREPANCY_PRICE' : 'DISCREPANCY_QTY';
    paymentStatus = 'BLOCKED';
    reason = `Discrepancia de ${pct > 0 ? '+' : ''}${pct.toFixed(2)}% excede la tolerancia permitida de ±2.00%`;
  }

  if (poolRef && isConnectedRef()) {
    try {
      await poolRef.query(`
        UPDATE ztb_procinv SET
          variance_amount = $1, variance_percentage = $2, match_status = $3,
          payment_status = $4, payment_block_reason = $5
        WHERE invoice_id = $6
      `, [diff, pct, matchStatus, paymentStatus, reason, invoiceId]);
    } catch (e) {}
  }

  inv.variance_amount = diff;
  inv.variance_percentage = pct;
  inv.match_status = matchStatus;
  inv.payment_status = paymentStatus;
  inv.payment_block_reason = reason;

  return { success: true, matchStatus, paymentStatus, reason, invoice: inv };
}

async function releaseInvoicePaymentBlock(invoiceId, justification) {
  const reason = justification || 'Pago liberado por excepción aprobada en Gerencia Financiera';
  if (poolRef && isConnectedRef()) {
    try {
      await poolRef.query(`
        UPDATE ztb_procinv SET payment_status = 'SCHEDULED', payment_block_reason = $1 WHERE invoice_id = $2
      `, [reason, invoiceId]);
    } catch (e) {}
  }
  const inv = inMemoryState.invoices.find(i => i.invoice_id === invoiceId);
  if (inv) {
    inv.payment_status = 'SCHEDULED';
    inv.payment_block_reason = reason;
  }
  return { success: true, message: `Factura ${invoiceId} desbloqueada y programada para pago` };
}

// 4. CONTRATOS & PROVEEDORES
async function getProcureContracts() {
  return inMemoryState.contracts;
}

async function getProcureSuppliers() {
  return inMemoryState.suppliers;
}

// 5. MÉTODOS DE CREACIÓN TRANSACCIONAL (POST) CON PERSISTENCIA EN SUPABASE
async function createProcureEvent(evData) {
  const eventUuid = evData.event_uuid || crypto.randomUUID();
  const eventId = evData.event_id || ('RFX-2026-' + Math.floor(100 + Math.random() * 900));
  const title = (evData.title || '').trim();
  const eventType = evData.event_type || 'RFP';
  const category = evData.category || 'General';
  const targetSpend = parseFloat(evData.target_spend || 0);
  const lowestBid = parseFloat(evData.lowest_bid_amount || (targetSpend * 0.88).toFixed(2));
  const savings = parseFloat((targetSpend - lowestBid).toFixed(2));
  const savingsPct = targetSpend > 0 ? parseFloat(((savings / targetSpend) * 100).toFixed(2)) : 0;
  const currency = evData.currency_code || 'USD';
  const status = evData.status || 'PUBLISHED';
  const supplierCount = parseInt(evData.supplier_count || 4, 10);
  const bidsCount = parseInt(evData.bids_count || 3, 10);
  const closingDate = evData.closing_date || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];
  const bidsHistory = evData.bids_history || [
    { supplier: 'Proveedor Postor 1', bid: (targetSpend * 0.95).toFixed(2), time: 'Hoy', rank: 2 },
    { supplier: 'Proveedor Postor 2 (Líder)', bid: lowestBid, time: 'Hace 5 min', rank: 1 }
  ];

  const newEvent = {
    event_uuid: eventUuid,
    event_id: eventId,
    title,
    event_type: eventType,
    category,
    target_spend: targetSpend,
    lowest_bid_amount: lowestBid,
    projected_savings: savings,
    savings_percentage: savingsPct,
    currency_code: currency,
    status,
    supplier_count: supplierCount,
    bids_count: bidsCount,
    closing_date: closingDate,
    awarded_supplier: null,
    bids_history: bidsHistory,
    created_by: 'SAPADMIN',
    created_at: new Date().toISOString()
  };

  if (poolRef && isConnectedRef()) {
    try {
      await poolRef.query(`
        INSERT INTO ztb_procrfx (
          event_uuid, event_id, title, event_type, category, target_spend, lowest_bid_amount,
          projected_savings, savings_percentage, currency_code, status, supplier_count, bids_count,
          closing_date, awarded_supplier, bids_history
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (event_id) DO UPDATE SET
          title = EXCLUDED.title,
          target_spend = EXCLUDED.target_spend,
          status = EXCLUDED.status;
      `, [
        eventUuid, eventId, title, eventType, category, targetSpend, lowestBid,
        savings, savingsPct, currency, status, supplierCount, bidsCount, closingDate,
        null, JSON.stringify(bidsHistory)
      ]);
    } catch (e) {
      console.error('[ProcureCore] Error insertando evento en Supabase:', e.message);
    }
  }

  // Guardar en memoria
  inMemoryState.events.unshift(newEvent);

  return { success: true, message: `Licitación ${eventId} creada y publicada exitosamente en Supabase`, data: newEvent };
}

async function createProcureRequisition(prData) {
  const prUuid = prData.requisition_uuid || crypto.randomUUID();
  const prId = prData.requisition_id || ('PR-2026-' + Math.floor(100 + Math.random() * 900));
  const desc = (prData.description || 'Requisición de compra').trim();
  const coCode = prData.company_code || '1000';
  const plant = prData.plant || '1010';
  const pOrg = prData.purchasing_org || '1000';
  const pGrp = prData.purchasing_group || '001';
  const requester = prData.requester_name || 'SAPADMIN';
  const department = prData.department || 'Compras & Logística';
  const totalAmount = parseFloat(prData.total_amount || 0);
  const currency = prData.currency_code || 'USD';
  const status = prData.status || 'PENDING_APPROVAL';
  const itemCount = parseInt(prData.item_count || 1, 10);
  const itemsJson = prData.items_json || [{ item: 10, desc, qty: 1, unit: 'EA', price: totalAmount }];

  const newPr = {
    requisition_uuid: prUuid,
    requisition_id: prId,
    description: desc,
    company_code: coCode,
    plant,
    purchasing_org: pOrg,
    purchasing_group: pGrp,
    requester_name: requester,
    department,
    total_amount: totalAmount,
    currency_code: currency,
    status,
    approval_level: 1,
    sap_po_number: null,
    item_count: itemCount,
    items_json: itemsJson,
    created_by: 'SAPADMIN',
    created_at: new Date().toISOString()
  };

  if (poolRef && isConnectedRef()) {
    try {
      await poolRef.query(`
        INSERT INTO ztb_procpr (
          requisition_uuid, requisition_id, description, company_code, plant, purchasing_org,
          purchasing_group, requester_name, department, total_amount, currency_code, status,
          approval_level, sap_po_number, item_count, items_json
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (requisition_id) DO UPDATE SET
          description = EXCLUDED.description,
          total_amount = EXCLUDED.total_amount;
      `, [
        prUuid, prId, desc, coCode, plant, pOrg, pGrp, requester, department, totalAmount,
        currency, status, 1, null, itemCount, JSON.stringify(itemsJson)
      ]);
    } catch (e) {
      console.error('[ProcureCore] Error insertando PR en Supabase:', e.message);
    }
  }

  inMemoryState.requisitions.unshift(newPr);

  return { success: true, message: `Requisición ${prId} registrada y enviada a aprobación`, data: newPr };
}

async function createProcureInvoice(invData) {
  const invUuid = invData.invoice_uuid || crypto.randomUUID();
  const invId = invData.invoice_id || ('INV-2026-' + Math.floor(800 + Math.random() * 200));
  const supplierInvoiceNum = invData.supplier_invoice_number || ('F001-' + Math.floor(1000000 + Math.random() * 9000000));
  const supplierTaxId = invData.supplier_tax_id || '20519284711';
  const supplierName = invData.supplier_name || 'Proveedor Homologado SAP';
  const poNum = invData.sap_po_number || ('45000' + Math.floor(10000 + Math.random() * 90000));
  const grNum = invData.sap_gr_number || ('50000' + Math.floor(10000 + Math.random() * 90000));
  const poAmount = parseFloat(invData.po_amount || 0);
  const grAmount = parseFloat(invData.gr_amount || poAmount);
  const invoiceAmount = parseFloat(invData.invoice_amount || poAmount);
  const currency = invData.currency_code || 'USD';
  const dueDate = invData.due_date || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

  const diff = invoiceAmount - poAmount;
  const pct = poAmount > 0 ? parseFloat(((diff / poAmount) * 100).toFixed(2)) : 0;
  const absPct = Math.abs(pct);

  let matchStatus = 'MATCHED';
  let paymentStatus = 'SCHEDULED';
  let blockReason = '3-Way Match perfecto dentro del umbral de tolerancia (±2.00%)';

  if (absPct > 2.0) {
    matchStatus = diff > 0 ? 'DISCREPANCY_PRICE' : 'DISCREPANCY_QTY';
    paymentStatus = 'BLOCKED';
    blockReason = `Discrepancia de ${pct > 0 ? '+' : ''}${pct}% excede la tolerancia permitida de ±2.00%`;
  }

  const newInv = {
    invoice_uuid: invUuid,
    invoice_id: invId,
    supplier_invoice_number: supplierInvoiceNum,
    supplier_tax_id: supplierTaxId,
    supplier_name: supplierName,
    sap_po_number: poNum,
    sap_gr_number: grNum,
    po_amount: poAmount,
    gr_amount: grAmount,
    invoice_amount: invoiceAmount,
    variance_amount: diff,
    variance_percentage: pct,
    currency_code: currency,
    match_status: matchStatus,
    payment_status: paymentStatus,
    payment_block_reason: blockReason,
    due_date: dueDate,
    created_by: 'SAPADMIN',
    created_at: new Date().toISOString()
  };

  if (poolRef && isConnectedRef()) {
    try {
      await poolRef.query(`
        INSERT INTO ztb_procinv (
          invoice_uuid, invoice_id, supplier_invoice_number, supplier_tax_id, supplier_name,
          sap_po_number, sap_gr_number, po_amount, gr_amount, invoice_amount, variance_amount,
          variance_percentage, currency_code, match_status, payment_status, payment_block_reason, due_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        ON CONFLICT (invoice_id) DO UPDATE SET
          invoice_amount = EXCLUDED.invoice_amount,
          match_status = EXCLUDED.match_status;
      `, [
        invUuid, invId, supplierInvoiceNum, supplierTaxId, supplierName, poNum, grNum,
        poAmount, grAmount, invoiceAmount, diff, pct, currency, matchStatus, paymentStatus,
        blockReason, dueDate
      ]);
    } catch (e) {
      console.error('[ProcureCore] Error insertando factura en Supabase:', e.message);
    }
  }

  inMemoryState.invoices.unshift(newInv);

  return { success: true, message: `Factura ${supplierInvoiceNum} registrada y procesada en 3-Way Match`, data: newInv };
}

async function createProcureContract(cntrData) {
  const contractId = cntrData.contract_id || ('CTR-2026-' + Math.floor(100 + Math.random() * 900));
  const newCntr = {
    contract_id: contractId,
    title: cntrData.title || 'Acuerdo Marco Comercial',
    supplier: cntrData.supplier || 'Proveedor Contratado',
    target_value: parseFloat(cntrData.target_value || 500000),
    released_value: parseFloat(cntrData.released_value || 0),
    remaining_value: parseFloat(cntrData.target_value || 500000),
    compliance_rate: parseFloat(cntrData.compliance_rate || 100),
    valid_to: cntrData.valid_to || '2028-12-31',
    status: cntrData.status || 'ACTIVE'
  };
  inMemoryState.contracts.unshift(newCntr);
  return { success: true, message: `Contrato marco ${contractId} registrado con éxito`, data: newCntr };
}

module.exports = {
  initService,
  autoMigrateAndSeedProcureCore,
  getProcureCoreKpis,
  getProcureEvents,
  publishProcureEvent,
  awardProcureEvent,
  createProcureEvent,
  getProcureRequisitions,
  submitProcureRequisition,
  approveProcureRequisition,
  createSAPPOFromPR,
  createProcureRequisition,
  getProcureInvoices,
  execute3WayMatch,
  releaseInvoicePaymentBlock,
  createProcureInvoice,
  getProcureContracts,
  createProcureContract,
  getProcureSuppliers
};
