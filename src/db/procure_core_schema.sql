-- ==============================================================================
-- PROCURE CORE (SAP Ariba Clone / Source-to-Settle) - PostgreSQL Cloud Schema
-- Tables: ztb_procrfx (Events), ztb_procpr (Requisitions), ztb_procinv (Invoices)
-- Draft Tables: ztb_procrfx_d, ztb_procpr_d, ztb_procinv_d
-- ==============================================================================

-- 1. SOURCING / RFX EVENTS (Ariba Sourcing Clone)
CREATE TABLE IF NOT EXISTS ztb_procrfx (
    event_uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(150) NOT NULL,
    event_type VARCHAR(20) NOT NULL, -- RFP, RFQ, REVERSE_AUCTION
    category VARCHAR(60) NOT NULL,   -- IT & Hardware, MRO, Logistica, Servicios
    target_spend NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    lowest_bid_amount NUMERIC(15,2) DEFAULT 0.00,
    projected_savings NUMERIC(15,2) DEFAULT 0.00,
    savings_percentage NUMERIC(5,2) DEFAULT 0.00,
    currency_code VARCHAR(5) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT, PUBLISHED, ACTIVE, AWARDED, CLOSED
    supplier_count INTEGER DEFAULT 0,
    bids_count INTEGER DEFAULT 0,
    closing_date DATE NOT NULL,
    awarded_supplier VARCHAR(120),
    bids_history JSONB DEFAULT '[]'::jsonb,
    created_by VARCHAR(50) DEFAULT 'SAPADMIN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_changed_by VARCHAR(50) DEFAULT 'SAPADMIN',
    last_changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    local_last_changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ztb_procrfx_d (
    draft_uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_uuid UUID,
    event_id VARCHAR(20),
    title VARCHAR(150),
    event_type VARCHAR(20),
    category VARCHAR(60),
    target_spend NUMERIC(15,2),
    lowest_bid_amount NUMERIC(15,2),
    projected_savings NUMERIC(15,2),
    savings_percentage NUMERIC(5,2),
    currency_code VARCHAR(5),
    status VARCHAR(20),
    supplier_count INTEGER,
    bids_count INTEGER,
    closing_date DATE,
    awarded_supplier VARCHAR(120),
    has_active_entity BOOLEAN DEFAULT FALSE,
    draft_entity_creation_date_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    draft_entity_last_change_date_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. PURCHASE REQUISITIONS (Ariba Buying / Guided Buying Clone)
CREATE TABLE IF NOT EXISTS ztb_procpr (
    requisition_uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requisition_id VARCHAR(20) UNIQUE NOT NULL,
    description VARCHAR(200) NOT NULL,
    company_code VARCHAR(10) DEFAULT '1000',
    plant VARCHAR(10) DEFAULT '1010',
    purchasing_org VARCHAR(10) DEFAULT '1000',
    purchasing_group VARCHAR(10) DEFAULT '001',
    requester_name VARCHAR(100) NOT NULL,
    department VARCHAR(80) NOT NULL,
    total_amount NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    currency_code VARCHAR(5) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT, PENDING_APPROVAL, APPROVED, REJECTED, PO_CREATED
    approval_level INTEGER DEFAULT 0,
    sap_po_number VARCHAR(20),
    item_count INTEGER DEFAULT 1,
    items_json JSONB DEFAULT '[]'::jsonb,
    created_by VARCHAR(50) DEFAULT 'SAPADMIN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_changed_by VARCHAR(50) DEFAULT 'SAPADMIN',
    last_changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    local_last_changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ztb_procpr_d (
    draft_uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requisition_uuid UUID,
    requisition_id VARCHAR(20),
    description VARCHAR(200),
    company_code VARCHAR(10),
    plant VARCHAR(10),
    purchasing_org VARCHAR(10),
    purchasing_group VARCHAR(10),
    requester_name VARCHAR(100),
    department VARCHAR(80),
    total_amount NUMERIC(15,2),
    currency_code VARCHAR(5),
    status VARCHAR(20),
    approval_level INTEGER,
    sap_po_number VARCHAR(20),
    item_count INTEGER,
    items_json JSONB,
    has_active_entity BOOLEAN DEFAULT FALSE,
    draft_entity_creation_date_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    draft_entity_last_change_date_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. INVOICES & 3-WAY MATCHING (Ariba Invoice Management Clone)
CREATE TABLE IF NOT EXISTS ztb_procinv (
    invoice_uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id VARCHAR(20) UNIQUE NOT NULL,
    supplier_invoice_number VARCHAR(50) NOT NULL,
    supplier_tax_id VARCHAR(30) NOT NULL,
    supplier_name VARCHAR(150) NOT NULL,
    sap_po_number VARCHAR(20) NOT NULL,
    sap_gr_number VARCHAR(20) NOT NULL,
    po_amount NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    gr_amount NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    invoice_amount NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    variance_amount NUMERIC(15,2) DEFAULT 0.00,
    variance_percentage NUMERIC(5,2) DEFAULT 0.00,
    currency_code VARCHAR(5) DEFAULT 'USD',
    match_status VARCHAR(30) DEFAULT 'PENDING', -- PENDING, MATCHED, DISCREPANCY_PRICE, DISCREPANCY_QTY, REJECTED
    payment_status VARCHAR(20) DEFAULT 'BLOCKED', -- BLOCKED, SCHEDULED, PAID
    payment_block_reason VARCHAR(200),
    due_date DATE NOT NULL,
    created_by VARCHAR(50) DEFAULT 'SAPADMIN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_changed_by VARCHAR(50) DEFAULT 'SAPADMIN',
    last_changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    local_last_changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ztb_procinv_d (
    draft_uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_uuid UUID,
    invoice_id VARCHAR(20),
    supplier_invoice_number VARCHAR(50),
    supplier_tax_id VARCHAR(30),
    supplier_name VARCHAR(150),
    sap_po_number VARCHAR(20),
    sap_gr_number VARCHAR(20),
    po_amount NUMERIC(15,2),
    gr_amount NUMERIC(15,2),
    invoice_amount NUMERIC(15,2),
    variance_amount NUMERIC(15,2),
    variance_percentage NUMERIC(5,2),
    currency_code VARCHAR(5),
    match_status VARCHAR(30),
    payment_status VARCHAR(20),
    payment_block_reason VARCHAR(200),
    due_date DATE,
    has_active_entity BOOLEAN DEFAULT FALSE,
    draft_entity_creation_date_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    draft_entity_last_change_date_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices de Alto Rendimiento Push-Down HANA / PostgreSQL
CREATE INDEX IF NOT EXISTS idx_procrfx_status ON ztb_procrfx(status);
CREATE INDEX IF NOT EXISTS idx_procpr_status ON ztb_procpr(status);
CREATE INDEX IF NOT EXISTS idx_procinv_match ON ztb_procinv(match_status);
CREATE INDEX IF NOT EXISTS idx_procinv_payment ON ztb_procinv(payment_status);
