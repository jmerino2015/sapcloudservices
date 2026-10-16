/**
 * Dataset maestro de inicialización para la base de datos pública del Portal SAP Fiori
 */

module.exports = {
  users: [
    {
      username: 'admin',
      password_hash: 'admin',
      full_name: 'Administrador SAP WM',
      email: 'admin@fiori-portal.com',
      role: 'admin',
      initials: 'AD',
      status: 'ACTIVE',
      warehouses: ['WH001', 'WH002']
    },
    {
      username: 'operator1',
      password_hash: 'operator1',
      full_name: 'Operador Zebra RF 01',
      email: 'rf1@fiori-portal.com',
      role: 'operator',
      initials: 'RF',
      status: 'ACTIVE',
      warehouses: ['WH001']
    }
  ],

  warehouses: [
    { id: 'WH001', code: 'WH001', name: 'Almacén Principal Central', location: 'Zona Industrial Norte (Callao)', status: 'ACTIVE', total_bins: 1450, occupied_bins: 1131, occupancy_pct: 78.00 },
    { id: 'WH002', code: 'WH002', name: 'Almacén Secundario Sur', location: 'Zona Industrial Sur (Lurín)', status: 'ACTIVE', total_bins: 480, occupied_bins: 201, occupancy_pct: 42.00 }
  ],

  storage_types: [
    { type_code: '001', description: 'Almacenamiento en Racks High-Bay', sections: [{ id: 10, section_code: 'SEC-A' }, { id: 11, section_code: 'SEC-B' }] },
    { type_code: '002', description: 'Zona de Picking Ágil', sections: [{ id: 20, section_code: 'PICK-01' }] },
    { type_code: '999', description: 'Bin Virtual Diferencias de Inventario', sections: [{ id: 99, section_code: 'DIFF-01' }] }
  ],

  bins: [
    { id: 'BIN01', bin_code: 'A-01-01-01', bin_type: 'STANDARD', storage_type_id: 1, storage_section_id: 10, max_weight: 1000, max_volume: 5.5, status: 'ACTIVE', has_stock: true, stock_qty: 25, warehouse_id: 'WH001' },
    { id: 'BIN02', bin_code: 'A-01-01-02', bin_type: 'STANDARD', storage_type_id: 1, storage_section_id: 10, max_weight: 1000, max_volume: 5.5, status: 'ACTIVE', has_stock: true, stock_qty: 8, warehouse_id: 'WH001' },
    { id: 'BIN03', bin_code: 'A-01-02-01', bin_type: 'HEAVY', storage_type_id: 1, storage_section_id: 10, max_weight: 2500, max_volume: 12.0, status: 'ACTIVE', has_stock: true, stock_qty: 3, warehouse_id: 'WH001' },
    { id: 'BIN04', bin_code: 'B-02-01-01', bin_type: 'PICKING', storage_type_id: 2, storage_section_id: 20, max_weight: 500, max_volume: 2.0, status: 'ACTIVE', has_stock: true, stock_qty: 40, warehouse_id: 'WH001' },
    { id: 'BIN05', bin_code: 'B-02-02-01', bin_type: 'COLD', storage_type_id: 2, storage_section_id: 20, max_weight: 800, max_volume: 3.5, status: 'ACTIVE', has_stock: true, stock_qty: 2, warehouse_id: 'WH001' },
    { id: 'BIN06', bin_code: 'C-03-01-01', bin_type: 'STANDARD', storage_type_id: 1, storage_section_id: 11, max_weight: 1000, max_volume: 5.5, status: 'ACTIVE', has_stock: false, stock_qty: 0, warehouse_id: 'WH001' },
    { id: 'BIN07', bin_code: 'GR-RECEPCION', bin_type: 'STAGING', storage_type_id: 1, storage_section_id: 10, max_weight: 5000, max_volume: 50.0, status: 'ACTIVE', has_stock: true, stock_qty: 15, warehouse_id: 'WH001' },
    { id: 'BIN08', bin_code: 'GI-EXPEDICION', bin_type: 'STAGING', storage_type_id: 2, storage_section_id: 20, max_weight: 5000, max_volume: 50.0, status: 'ACTIVE', has_stock: true, stock_qty: 10, warehouse_id: 'WH001' }
  ],

  materials: [
    { id: 'MAT001', sap_code: '4500001', description: 'Cable UTP Cat6 305m Belden', type: 'ROH', base_unit: 'BOB', stock_total: 450, batch_managed: true },
    { id: 'MAT002', sap_code: '4500002', description: 'Switch 24 puertos PoE Cisco Catalyst', type: 'FERT', base_unit: 'EA', stock_total: 280, batch_managed: false },
    { id: 'MAT003', sap_code: '4500003', description: 'Rack 42U 800mm Panduit', type: 'HALB', base_unit: 'EA', stock_total: 720, batch_managed: false },
    { id: 'MAT004', sap_code: '4500004', description: 'Patch Panel 24p Cat6 Nexxt', type: 'ROH', base_unit: 'EA', stock_total: 150, batch_managed: false },
    { id: 'MAT005', sap_code: '4500005', description: 'UPS 1500VA Line-Interactive APC', type: 'FERT', base_unit: 'EA', stock_total: 95, batch_managed: true }
  ],

  stock: [
    { bin_code: 'A-01-01-01', sap_code: '4500001', description: 'Cable UTP Cat6 305m', batch_number: 'BT202601', qty: 25, unit: 'BOB', status: 'OK', expiry_date: '2026-10-15' },
    { bin_code: 'A-01-01-02', sap_code: '4500002', description: 'Switch 24p PoE Cisco', batch_number: '—', qty: 8, unit: 'EA', status: 'OK', expiry_date: '—' },
    { bin_code: 'A-01-02-01', sap_code: '4500003', description: 'Rack 42U 800mm Panduit', batch_number: '—', qty: 3, unit: 'EA', status: 'LOW', expiry_date: '—' },
    { bin_code: 'B-02-01-01', sap_code: '4500004', description: 'Patch Panel 24p Cat6', batch_number: '—', qty: 40, unit: 'EA', status: 'OK', expiry_date: '—' },
    { bin_code: 'B-02-02-01', sap_code: '4500005', description: 'UPS 1500VA APC', batch_number: 'BT202605', qty: 2, unit: 'EA', status: 'CRITICAL', expiry_date: '2026-11-20' }
  ],

  transfer_orders: [
    { to_number: 'TO-2026-001', to_type: 'GR', from_bin: 'GR-RECEPCION', to_bin: 'A-01-01-01', material_code: '4500001', material_desc: 'Cable UTP Cat6 305m', planned_qty: 25, unit: 'BOB', status: 'OPEN', created_at: '2026-09-27 08:30' },
    { to_number: 'TO-2026-002', to_type: 'GI', from_bin: 'A-01-01-02', to_bin: 'GI-EXPEDICION', material_code: '4500002', material_desc: 'Switch 24 puertos PoE', planned_qty: 8, unit: 'EA', status: 'OPEN', created_at: '2026-09-27 09:15' },
    { to_number: 'TO-2026-003', to_type: 'TR', from_bin: 'A-01-02-01', to_bin: 'C-03-01-01', material_code: '4500003', material_desc: 'Rack 42U 800mm', planned_qty: 3, unit: 'EA', status: 'CONFIRMED', created_at: '2026-09-26 14:00' },
    { to_number: 'TO-2026-004', to_type: 'GR', from_bin: 'GR-RECEPCION', to_bin: 'B-02-01-01', material_code: '4500004', material_desc: 'Patch Panel 24p Cat6', planned_qty: 40, unit: 'EA', status: 'OPEN', created_at: '2026-09-27 09:45' },
    { to_number: 'TO-2026-005', to_type: 'GI', from_bin: 'B-02-02-01', to_bin: 'GI-EXPEDICION', material_code: '4500005', material_desc: 'UPS 1500VA Line-Interactive', planned_qty: 2, unit: 'EA', status: 'IN_PROGRESS', created_at: '2026-09-27 10:00' },
    { to_number: 'TO-2026-006', to_type: 'TR', from_bin: 'B-02-01-01', to_bin: 'A-01-01-02', material_code: '4500002', material_desc: 'Switch 24 puertos PoE', planned_qty: 5, unit: 'EA', status: 'CONFIRMED', created_at: '2026-09-26 16:30' }
  ],

  wh_sedes: [
    {
      client: '100',
      sede_id: "CD_EUCALIPTOS",
      sede_nombre: "CD Eucaliptos (Lima Este)",
      centro_sap: "1010",
      almacen_sap: "0010",
      posiciones_totales: 16120,
      posiciones_ocupadas: 14250,
      posiciones_libres: 1870,
      porcentaje_ocupabilidad: 88.40,
      paletas_ingreso_hoy: 184,
      paletas_salida_hoy: 216,
      peso_ingreso_tn_hoy: 142.500,
      peso_salida_tn_hoy: 178.200,
      ot_pendientes_picking: 46,
      ot_pendientes_recepcion: 14,
      ot_pendientes_ubicacion: 28,
      ot_pendientes_despacho: 19,
      ot_pendientes_total: 107,
      unidades_programadas: 24,
      unidades_cargadas: 16,
      unidades_en_proceso: 5,
      unidades_pendientes: 2,
      cumplimiento_ventana_7_10: 91.50,
      eri_porcentaje: 99.40,
      eru_porcentaje: 98.70,
      bpa_porcentaje: 96.00,
      precision_picking: 99.80,
      pedidos_atendidos: 438,
      otif_porcentaje: 97.40,
      raccs_abiertos: 2,
      raccs_cerrados: 28,
      cinco_s_score: 94.50,
      dias_sin_accidentes: 412
    },
    {
      client: '100',
      sede_id: "CD_CALLAO",
      sede_nombre: "CD Callao (Puerto / BCT)",
      centro_sap: "1020",
      almacen_sap: "0020",
      posiciones_totales: 12800,
      posiciones_ocupadas: 11788,
      posiciones_libres: 1012,
      porcentaje_ocupabilidad: 92.10,
      paletas_ingreso_hoy: 140,
      paletas_salida_hoy: 155,
      peso_ingreso_tn_hoy: 118.000,
      peso_salida_tn_hoy: 132.500,
      ot_pendientes_picking: 32,
      ot_pendientes_recepcion: 18,
      ot_pendientes_ubicacion: 22,
      ot_pendientes_despacho: 15,
      ot_pendientes_total: 87,
      unidades_programadas: 18,
      unidades_cargadas: 11,
      unidades_en_proceso: 4,
      unidades_pendientes: 3,
      cumplimiento_ventana_7_10: 86.00,
      eri_porcentaje: 99.10,
      eru_porcentaje: 98.20,
      bpa_porcentaje: 94.50,
      precision_picking: 99.20,
      pedidos_atendidos: 312,
      otif_porcentaje: 94.80,
      raccs_abiertos: 4,
      raccs_cerrados: 22,
      cinco_s_score: 91.00,
      dias_sin_accidentes: 285
    },
    {
      client: '100',
      sede_id: "CD_PRADERAS",
      sede_nombre: "CD Praderas (Lurín Sur)",
      centro_sap: "1030",
      almacen_sap: "0030",
      posiciones_totales: 9500,
      posiciones_ocupadas: 7049,
      posiciones_libres: 2451,
      porcentaje_ocupabilidad: 74.20,
      paletas_ingreso_hoy: 92,
      paletas_salida_hoy: 88,
      peso_ingreso_tn_hoy: 66.300,
      peso_salida_tn_hoy: 63.800,
      ot_pendientes_picking: 12,
      ot_pendientes_recepcion: 8,
      ot_pendientes_ubicacion: 10,
      ot_pendientes_despacho: 6,
      ot_pendientes_total: 36,
      unidades_programadas: 12,
      unidades_cargadas: 9,
      unidades_en_proceso: 2,
      unidades_pendientes: 1,
      cumplimiento_ventana_7_10: 96.50,
      eri_porcentaje: 99.50,
      eru_porcentaje: 99.00,
      bpa_porcentaje: 97.80,
      precision_picking: 99.90,
      pedidos_atendidos: 198,
      otif_porcentaje: 98.20,
      raccs_abiertos: 0,
      raccs_cerrados: 16,
      cinco_s_score: 96.00,
      dias_sin_accidentes: 160
    }
  ],

  yard_locations: [
    { code: "GATE-01", description: "Puerta Principal de Ingreso", status: "OCCUPIED", type: "GATE", current_vehicle: { license_plate: "F5A-892", carrier: "Transportes Rápido S.A.C." } },
    { code: "GATE-02", description: "Puerta Secundaria de Salida", status: "AVAILABLE", type: "GATE", current_vehicle: null },
    { code: "PARK-01", description: "Bahía de Espera 01", status: "OCCUPIED", type: "PARKING", current_vehicle: { license_plate: "B7C-412", driver_name: "Carlos Eduardo Mendoza", carrier: "Servicios Logísticos" } },
    { code: "PARK-02", description: "Bahía de Espera 02", status: "AVAILABLE", type: "PARKING", current_vehicle: null },
    { code: "PARK-03", description: "Bahía de Espera 03", status: "OCCUPIED", type: "PARKING", current_vehicle: { license_plate: "V9X-104", driver_name: "Jorge Luis Torres", carrier: "DHL Supply Chain" } },
    { code: "M-01", description: "Muelle 01 Inbound (Entrada)", status: "OCCUPIED", type: "DOCK_DOOR", current_vehicle: { license_plate: "ABC-123", carrier: "Cisco Logistics / Transportes" } },
    { code: "M-02", description: "Muelle 02 Outbound (Salida)", status: "OCCUPIED", type: "DOCK_DOOR", current_vehicle: { license_plate: "XYZ-789", carrier: "Express Cargo BCP" } },
    { code: "M-03", description: "Muelle 03 Devoluciones", status: "AVAILABLE", type: "DOCK_DOOR", current_vehicle: null },
    { code: "M-04", description: "Muelle 04 Carga Pesada", status: "AVAILABLE", type: "DOCK_DOOR", current_vehicle: null }
  ],

  yard_vehicles: [
    {
      license_plate: "ABC-123",
      carrier: "Cisco Systems / Transportes Rápido",
      status: "EN MUELLE",
      appointments: [{ appointment_num: "APT-2026-001", planned_arrival: "09:00 AM", operation_type: "INBOUND (Entrada)" }]
    },
    {
      license_plate: "XYZ-789",
      carrier: "Express Cargo BCP",
      status: "EN MUELLE",
      appointments: [{ appointment_num: "APT-2026-002", planned_arrival: "10:30 AM", operation_type: "OUTBOUND (Salida)" }]
    },
    {
      license_plate: "B7C-412",
      carrier: "Servicios Logísticos del Perú",
      status: "CHECK-IN (Esperando)",
      appointments: [{ appointment_num: "APT-2026-003", planned_arrival: "11:15 AM", operation_type: "INBOUND (Entrada)" }]
    },
    {
      license_plate: "MNO-456",
      carrier: "DHL Supply Chain Peru",
      status: "PROGRAMADO",
      appointments: [{ appointment_num: "APT-2026-004", planned_arrival: "02:00 PM", operation_type: "OUTBOUND (Salida)" }]
    },
    {
      license_plate: "P9L-331",
      carrier: "Ransa Comercial S.A.",
      status: "PROGRAMADO",
      appointments: [{ appointment_num: "APT-2026-005", planned_arrival: "03:30 PM", operation_type: "INBOUND (Entrada)" }]
    }
  ]
};
