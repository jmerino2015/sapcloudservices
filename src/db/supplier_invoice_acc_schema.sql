-- ==============================================================================
-- Tabla ZTB_SUPP_INV_ACC: Cabecera de Facturas Contables & 3-Way Matching
-- ==============================================================================
CREATE TABLE IF NOT EXISTS ztb_supp_inv_acc (
    invoice_uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_ruc VARCHAR(20) NOT NULL,
    supplier_name VARCHAR(150) NOT NULL,
    purchase_order VARCHAR(20) NOT NULL,
    entry_sheet_migo VARCHAR(20),
    gross_amount NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    currency_code VARCHAR(5) NOT NULL DEFAULT 'USD',
    tax_amount NUMERIC(15,2) DEFAULT 0.00,
    detraction_amount NUMERIC(15,2) DEFAULT 0.00,
    retention_amount NUMERIC(15,2) DEFAULT 0.00,
    net_payable_amount NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    fiscal_status VARCHAR(30) NOT NULL DEFAULT 'PRE_REGISTRADO',
    sap_doc_mm VARCHAR(20),
    sap_doc_fi VARCHAR(20),
    fiscal_year NUMERIC(4,0) DEFAULT 2026,
    posting_date DATE DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    receipt_stamp_detected BOOLEAN DEFAULT FALSE,
    sunat_status VARCHAR(30) DEFAULT 'ACEPTADO',
    three_way_match_status VARCHAR(30) DEFAULT 'PENDIENTE',
    match_variance_amount NUMERIC(15,2) DEFAULT 0.00,
    observation_notes TEXT,
    created_by VARCHAR(50) DEFAULT 'SAPADMIN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_changed_by VARCHAR(50) DEFAULT 'SAPADMIN',
    last_changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    local_last_changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Draft Table para Cabecera
CREATE TABLE IF NOT EXISTS ztb_supp_inva_d (
    draft_uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_uuid UUID,
    invoice_number VARCHAR(50),
    supplier_ruc VARCHAR(20),
    supplier_name VARCHAR(150),
    purchase_order VARCHAR(20),
    entry_sheet_migo VARCHAR(20),
    gross_amount NUMERIC(15,2),
    currency_code VARCHAR(5),
    tax_amount NUMERIC(15,2),
    detraction_amount NUMERIC(15,2),
    retention_amount NUMERIC(15,2),
    net_payable_amount NUMERIC(15,2),
    fiscal_status VARCHAR(30),
    sap_doc_mm VARCHAR(20),
    sap_doc_fi VARCHAR(20),
    fiscal_year NUMERIC(4,0),
    posting_date DATE,
    due_date DATE,
    receipt_stamp_detected BOOLEAN,
    sunat_status VARCHAR(30),
    three_way_match_status VARCHAR(30),
    match_variance_amount NUMERIC(15,2),
    observation_notes TEXT,
    has_active_entity BOOLEAN DEFAULT FALSE,
    draft_entity_creation_date_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    draft_entity_last_change_date_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla ZTB_SUPP_INV_ITM: Posiciones de Factura
CREATE TABLE IF NOT EXISTS ztb_supp_inv_itm (
    item_uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_uuid UUID NOT NULL REFERENCES ztb_supp_inv_acc(invoice_uuid) ON DELETE CASCADE,
    item_position INTEGER NOT NULL,
    material_code VARCHAR(40) NOT NULL,
    material_description VARCHAR(150) NOT NULL,
    quantity NUMERIC(13,3) NOT NULL DEFAULT 1.000,
    unit_of_measure VARCHAR(10) NOT NULL DEFAULT 'UN',
    unit_price NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    net_amount NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(15,2) DEFAULT 0.00,
    currency_code VARCHAR(5) NOT NULL DEFAULT 'USD',
    gl_account VARCHAR(20) NOT NULL,
    cost_center VARCHAR(20),
    po_item_reference INTEGER DEFAULT 10,
    migo_item_reference INTEGER DEFAULT 1,
    created_by VARCHAR(50) DEFAULT 'SAPADMIN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_changed_by VARCHAR(50) DEFAULT 'SAPADMIN',
    last_changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    local_last_changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Draft Table para Posiciones
CREATE TABLE IF NOT EXISTS ztb_supp_invi_d (
    draft_uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_draft_uuid UUID,
    item_uuid UUID,
    invoice_uuid UUID,
    item_position INTEGER,
    material_code VARCHAR(40),
    material_description VARCHAR(150),
    quantity NUMERIC(13,3),
    unit_of_measure VARCHAR(10),
    unit_price NUMERIC(15,2),
    net_amount NUMERIC(15,2),
    tax_amount NUMERIC(15,2),
    currency_code VARCHAR(5),
    gl_account VARCHAR(20),
    cost_center VARCHAR(20),
    po_item_reference INTEGER,
    migo_item_reference INTEGER,
    has_active_entity BOOLEAN DEFAULT FALSE,
    draft_entity_creation_date_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    draft_entity_last_change_date_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices Push-down
CREATE INDEX IF NOT EXISTS idx_supp_inv_fiscal_status ON ztb_supp_inv_acc(fiscal_status);
CREATE INDEX IF NOT EXISTS idx_supp_inv_match_status  ON ztb_supp_inv_acc(three_way_match_status);
CREATE INDEX IF NOT EXISTS idx_supp_inv_ruc           ON ztb_supp_inv_acc(supplier_ruc);
CREATE INDEX IF NOT EXISTS idx_supp_inv_po            ON ztb_supp_inv_acc(purchase_order);
CREATE INDEX IF NOT EXISTS idx_supp_inv_itm_inv       ON ztb_supp_inv_itm(invoice_uuid);
