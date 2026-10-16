-- ==============================================================================
-- SAP Fiori Solution Portal - Public Cloud Database Schema (PostgreSQL)
-- Standards: Clean Core, S/4HANA VDM Mirroring (ZTB_* Tables)
-- Compatible with: Supabase, Neon, AWS RDS, Render, Railway, Azure Database
-- ==============================================================================

-- 1. Tabla de Usuarios y Autenticación Fiori Launchpad
CREATE TABLE IF NOT EXISTS ztb_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'operator',
    initials VARCHAR(4) DEFAULT 'OP',
    status VARCHAR(20) DEFAULT 'ACTIVE',
    warehouses TEXT[] DEFAULT ARRAY['WH001'],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Licenciamiento y Usuarios FUE (Control FUE SAP S/4HANA)
CREATE TABLE IF NOT EXISTS ztb_fue_users (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(100),
    area VARCHAR(80),
    cargo VARCHAR(80),
    tipo_usuario_actual VARCHAR(50),
    tipo_usuario_propuesto VARCHAR(50),
    fue_actual NUMERIC(5,3) DEFAULT 0.000,
    fue_propuesto NUMERIC(5,3) DEFAULT 0.000,
    ahorro_fue NUMERIC(5,3) DEFAULT 0.000,
    actividad_30d INTEGER DEFAULT 0,
    transacciones_mes INTEGER DEFAULT 0,
    estado VARCHAR(30) DEFAULT 'En Analisis',
    justificacion TEXT,
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE ztb_fue_users ADD COLUMN IF NOT EXISTS raw_data JSONB;

-- 3. Tabla Torre de Control WMS - Sedes y KPIs Operativos
CREATE TABLE IF NOT EXISTS ztb_wh_sede (
    client VARCHAR(3) DEFAULT '100',
    sede_id VARCHAR(20) PRIMARY KEY,
    sede_nombre VARCHAR(100) NOT NULL,
    centro_sap VARCHAR(10) NOT NULL,
    almacen_sap VARCHAR(10) NOT NULL,
    posiciones_totales INTEGER DEFAULT 0,
    posiciones_ocupadas INTEGER DEFAULT 0,
    posiciones_libres INTEGER DEFAULT 0,
    porcentaje_ocupabilidad NUMERIC(5,2) DEFAULT 0.00,
    paletas_ingreso_hoy INTEGER DEFAULT 0,
    paletas_salida_hoy INTEGER DEFAULT 0,
    peso_ingreso_tn_hoy NUMERIC(10,3) DEFAULT 0.000,
    peso_salida_tn_hoy NUMERIC(10,3) DEFAULT 0.000,
    ot_pendientes_picking INTEGER DEFAULT 0,
    ot_pendientes_recepcion INTEGER DEFAULT 0,
    ot_pendientes_ubicacion INTEGER DEFAULT 0,
    ot_pendientes_despacho INTEGER DEFAULT 0,
    ot_pendientes_total INTEGER DEFAULT 0,
    unidades_programadas INTEGER DEFAULT 0,
    unidades_cargadas INTEGER DEFAULT 0,
    unidades_en_proceso INTEGER DEFAULT 0,
    unidades_pendientes INTEGER DEFAULT 0,
    cumplimiento_ventana_7_10 NUMERIC(5,2) DEFAULT 0.00,
    eri_porcentaje NUMERIC(5,2) DEFAULT 0.00,
    eru_porcentaje NUMERIC(5,2) DEFAULT 0.00,
    bpa_porcentaje NUMERIC(5,2) DEFAULT 0.00,
    precision_picking NUMERIC(5,2) DEFAULT 0.00,
    pedidos_atendidos INTEGER DEFAULT 0,
    otif_porcentaje NUMERIC(5,2) DEFAULT 0.00,
    raccs_abiertos INTEGER DEFAULT 0,
    raccs_cerrados INTEGER DEFAULT 0,
    cinco_s_score NUMERIC(5,2) DEFAULT 0.00,
    dias_sin_accidentes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Almacenes Principales SAP WM / EWM
CREATE TABLE IF NOT EXISTS ztb_warehouses (
    id VARCHAR(20) PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(150),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    total_bins INTEGER DEFAULT 0,
    occupied_bins INTEGER DEFAULT 0,
    occupancy_pct NUMERIC(5,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tipos y Secciones de Almacenamiento
CREATE TABLE IF NOT EXISTS ztb_storage_types (
    id SERIAL PRIMARY KEY,
    type_code VARCHAR(10) NOT NULL,
    description VARCHAR(100) NOT NULL,
    sections JSONB DEFAULT '[]'::jsonb
);

-- 6. Ubicaciones Físicas de Almacén (Bins)
CREATE TABLE IF NOT EXISTS ztb_bins (
    id VARCHAR(20) PRIMARY KEY,
    bin_code VARCHAR(30) UNIQUE NOT NULL,
    bin_type VARCHAR(20) DEFAULT 'STANDARD',
    storage_type_id INTEGER,
    storage_section_id INTEGER,
    max_weight NUMERIC(10,2) DEFAULT 1000.00,
    max_volume NUMERIC(10,2) DEFAULT 5.50,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    has_stock BOOLEAN DEFAULT FALSE,
    stock_qty NUMERIC(10,2) DEFAULT 0.00,
    warehouse_id VARCHAR(20) DEFAULT 'WH001',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Maestro de Materiales SAP MM
CREATE TABLE IF NOT EXISTS ztb_materials (
    id VARCHAR(20) PRIMARY KEY,
    sap_code VARCHAR(30) UNIQUE NOT NULL,
    description VARCHAR(150) NOT NULL,
    type VARCHAR(10) DEFAULT 'FERT',
    base_unit VARCHAR(10) DEFAULT 'EA',
    stock_total NUMERIC(10,2) DEFAULT 0.00,
    batch_managed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Stock Físico por Bin y Lote
CREATE TABLE IF NOT EXISTS ztb_stock (
    id SERIAL PRIMARY KEY,
    bin_code VARCHAR(30) NOT NULL,
    sap_code VARCHAR(30) NOT NULL,
    description VARCHAR(150),
    batch_number VARCHAR(30) DEFAULT '—',
    qty NUMERIC(10,2) DEFAULT 0.00,
    unit VARCHAR(10) DEFAULT 'EA',
    status VARCHAR(20) DEFAULT 'OK',
    expiry_date VARCHAR(20) DEFAULT '—',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Órdenes de Traslado (Transfer Orders LT01 / LT12)
CREATE TABLE IF NOT EXISTS ztb_transfer_orders (
    id SERIAL PRIMARY KEY,
    to_number VARCHAR(30) UNIQUE NOT NULL,
    to_type VARCHAR(10) NOT NULL, -- GR, GI, TR
    from_bin VARCHAR(30) NOT NULL,
    to_bin VARCHAR(30) NOT NULL,
    material_code VARCHAR(30) NOT NULL,
    material_desc VARCHAR(150),
    planned_qty NUMERIC(10,2) NOT NULL,
    unit VARCHAR(10) DEFAULT 'EA',
    status VARCHAR(20) DEFAULT 'OPEN', -- OPEN, IN_PROGRESS, CONFIRMED, CANCELLED
    created_at VARCHAR(30),
    confirmed_at VARCHAR(30)
);

-- 10. Gestión de Patio / Yard Management
CREATE TABLE IF NOT EXISTS ztb_yard_locations (
    code VARCHAR(20) PRIMARY KEY,
    description VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'AVAILABLE', -- AVAILABLE, OCCUPIED, BLOCKED
    type VARCHAR(20) NOT NULL, -- GATE, PARKING, DOCK_DOOR
    current_vehicle JSONB
);

CREATE TABLE IF NOT EXISTS ztb_yard_vehicles (
    id SERIAL PRIMARY KEY,
    license_plate VARCHAR(20) NOT NULL,
    carrier VARCHAR(100),
    status VARCHAR(30) DEFAULT 'PROGRAMADO',
    appointments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Entradas de Mercancía (Goods Receipts / MIGO)
CREATE TABLE IF NOT EXISTS ztb_goods_receipts (
    id SERIAL PRIMARY KEY,
    gr_number VARCHAR(30) UNIQUE NOT NULL,
    delivery_note VARCHAR(50),
    vendor_name VARCHAR(150) NOT NULL,
    sap_po_number VARCHAR(30) NOT NULL,
    receipt_type VARCHAR(20) DEFAULT 'PO',
    status VARCHAR(20) DEFAULT 'PENDING',
    warehouse_id VARCHAR(20) DEFAULT 'WH001',
    items JSONB DEFAULT '[]'::jsonb,
    created_at VARCHAR(30),
    created_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Salidas de Mercancía (Goods Issues / VL02N)
CREATE TABLE IF NOT EXISTS ztb_goods_issues (
    id SERIAL PRIMARY KEY,
    gi_number VARCHAR(30) UNIQUE NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    sap_so_number VARCHAR(30) NOT NULL,
    delivery_number VARCHAR(50) NOT NULL,
    picking_strategy VARCHAR(20) DEFAULT 'FEFO',
    status VARCHAR(20) DEFAULT 'IN_PICKING',
    warehouse_id VARCHAR(20) DEFAULT 'WH001',
    items JSONB DEFAULT '[]'::jsonb,
    created_at VARCHAR(30),
    created_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Toma de Inventario Físico (Inventory Counts / LI01N / LI20)
CREATE TABLE IF NOT EXISTS ztb_inventory_counts (
    id SERIAL PRIMARY KEY,
    count_number VARCHAR(30) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    bins_total INTEGER DEFAULT 0,
    bins_counted INTEGER DEFAULT 0,
    warehouse_id VARCHAR(20) DEFAULT 'WH001',
    created_at VARCHAR(30),
    created_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
