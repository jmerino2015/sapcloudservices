/**
 * PROCURE CORE - Enterprise Seed Dataset (Ariba S2S Clone)
 */
module.exports = {
  events: [
    {
      event_uuid: 'a1000000-0000-0000-0000-000000000001',
      event_id: 'RFX-2026-001',
      title: 'Renovación de Infraestructura Cloud y Servidores Hiperconvergentes Dell/HPE',
      event_type: 'RFP',
      category: 'IT & Hardware',
      target_spend: 250000.00,
      lowest_bid_amount: 215000.00,
      projected_savings: 35000.00,
      savings_percentage: 14.00,
      currency_code: 'USD',
      status: 'PUBLISHED',
      supplier_count: 5,
      bids_count: 14,
      closing_date: '2026-11-15',
      awarded_supplier: null,
      bids_history: [
        { supplier: 'Dell Technologies', bid: 215000.00, time: '2026-10-22 14:30', rank: 1 },
        { supplier: 'Hewlett Packard Enterprise', bid: 228000.00, time: '2026-10-21 11:15', rank: 2 },
        { supplier: 'Lenovo Data Center', bid: 235000.00, time: '2026-10-20 09:40', rank: 3 }
      ]
    },
    {
      event_uuid: 'a1000000-0000-0000-0000-000000000002',
      event_id: 'RFX-2026-002',
      title: 'Suministro Anual de Rodamientos Industriales y Repuestos MRO SKF/FAG',
      event_type: 'REVERSE_AUCTION',
      category: 'MRO & Repuestos',
      target_spend: 180000.00,
      lowest_bid_amount: 147500.00,
      projected_savings: 32500.00,
      savings_percentage: 18.06,
      currency_code: 'USD',
      status: 'ACTIVE',
      supplier_count: 6,
      bids_count: 28,
      closing_date: '2026-10-30',
      awarded_supplier: null,
      bids_history: [
        { supplier: 'SKF del Perú S.A.', bid: 147500.00, time: 'Hace 3 min', rank: 1 },
        { supplier: 'Schaeffler FAG Andina', bid: 152000.00, time: 'Hace 8 min', rank: 2 },
        { supplier: 'Timken Industrial', bid: 159000.00, time: 'Hace 15 min', rank: 3 }
      ]
    },
    {
      event_uuid: 'a1000000-0000-0000-0000-000000000003',
      event_id: 'RFX-2026-003',
      title: 'Servicio Corporativo de Transporte y Distribución Troncal Lima - Arequipa',
      event_type: 'RFQ',
      category: 'Logística & Fletes',
      target_spend: 420000.00,
      lowest_bid_amount: 368000.00,
      projected_savings: 52000.00,
      savings_percentage: 12.38,
      currency_code: 'USD',
      status: 'AWARDED',
      supplier_count: 4,
      bids_count: 9,
      closing_date: '2026-10-15',
      awarded_supplier: 'TransCarga Logística Andina S.A.C.',
      bids_history: [
        { supplier: 'TransCarga Logística Andina', bid: 368000.00, time: '2026-10-14', rank: 1, awarded: true },
        { supplier: 'Ransa Comercial', bid: 385000.00, time: '2026-10-13', rank: 2 },
        { supplier: 'Dinet Operador Logístico', bid: 399000.00, time: '2026-10-12', rank: 3 }
      ]
    },
    {
      event_uuid: 'a1000000-0000-0000-0000-000000000004',
      event_id: 'RFX-2026-004',
      title: 'Auditoría Forense y Servicios de Consultoría en Ciberseguridad ISO 27001',
      event_type: 'RFP',
      category: 'Servicios Profesionales',
      target_spend: 95000.00,
      lowest_bid_amount: 88000.00,
      projected_savings: 7000.00,
      savings_percentage: 7.37,
      currency_code: 'USD',
      status: 'CLOSED',
      supplier_count: 3,
      bids_count: 6,
      closing_date: '2026-10-10',
      awarded_supplier: 'CyberShield Advisory Group',
      bids_history: []
    }
  ],

  requisitions: [
    {
      requisition_uuid: 'b1000000-0000-0000-0000-000000000001',
      requisition_id: 'PR-2026-101',
      description: 'Adquisición de 45 Laptops Dell Latitude 5540 para Fuerza de Ventas',
      company_code: '1000',
      plant: '1010',
      purchasing_org: '1000',
      purchasing_group: '001',
      requester_name: 'Carlos Mendoza',
      department: 'Ventas & Marketing',
      total_amount: 67500.00,
      currency_code: 'USD',
      status: 'PENDING_APPROVAL',
      approval_level: 1,
      sap_po_number: null,
      item_count: 45,
      items_json: [{ item: 10, material: 'DELL-LAT-5540', desc: 'Laptop Dell Latitude 5540 Core i7 32GB 1TB SSD', qty: 45, unit: 'EA', price: 1500.00 }]
    },
    {
      requisition_uuid: 'b1000000-0000-0000-0000-000000000002',
      requisition_id: 'PR-2026-102',
      description: 'Reemplazo de Switches Cisco Catalyst Core 9300 en Almacén Lurín',
      company_code: '1000',
      plant: '1020',
      purchasing_org: '1000',
      purchasing_group: '001',
      requester_name: 'Elena Silva',
      department: 'Infraestructura TI',
      total_amount: 38400.00,
      currency_code: 'USD',
      status: 'APPROVED',
      approval_level: 2,
      sap_po_number: null,
      item_count: 4,
      items_json: [{ item: 10, material: 'CS-CAT-9300-48P', desc: 'Switch Cisco Catalyst 9300 48 Puertos PoE+ Stack', qty: 4, unit: 'EA', price: 9600.00 }]
    },
    {
      requisition_uuid: 'b1000000-0000-0000-0000-000000000003',
      requisition_id: 'PR-2026-103',
      description: 'Lote de Montacargas Eléctricos Linde E20PH con Baterías de Litio',
      company_code: '1000',
      plant: '1010',
      purchasing_org: '1000',
      purchasing_group: '002',
      requester_name: 'Jorge Benavides',
      department: 'Operaciones Logísticas',
      total_amount: 145000.00,
      currency_code: 'USD',
      status: 'PO_CREATED',
      approval_level: 2,
      sap_po_number: '4500098421',
      item_count: 2,
      items_json: [{ item: 10, material: 'LINDE-E20PH-LI', desc: 'Montacargas Eléctrico Linde E20PH 2.0TN Mástil Triplex', qty: 2, unit: 'EA', price: 72500.00 }]
    }
  ],

  invoices: [
    {
      invoice_uuid: 'c1000000-0000-0000-0000-000000000001',
      invoice_id: 'INV-2026-801',
      supplier_invoice_number: 'F001-0008472',
      supplier_tax_id: '20519284711',
      supplier_name: 'Dell Technologies Perú S.A.',
      sap_po_number: '4500098420',
      sap_gr_number: '5000038101',
      po_amount: 52000.00,
      gr_amount: 52000.00,
      invoice_amount: 52000.00,
      variance_amount: 0.00,
      variance_percentage: 0.00,
      currency_code: 'USD',
      match_status: 'MATCHED',
      payment_status: 'SCHEDULED',
      payment_block_reason: '3-Way Match perfecto (Factura = Recepción MIGO = Pedido SAP)',
      due_date: '2026-11-20'
    },
    {
      invoice_uuid: 'c1000000-0000-0000-0000-000000000002',
      invoice_id: 'INV-2026-802',
      supplier_invoice_number: 'E001-0001294',
      supplier_tax_id: '20100482910',
      supplier_name: 'SKF del Perú S.A.',
      sap_po_number: '4500098310',
      sap_gr_number: '5000038090',
      po_amount: 18500.00,
      gr_amount: 18500.00,
      invoice_amount: 18750.00,
      variance_amount: 250.00,
      variance_percentage: 1.35,
      currency_code: 'USD',
      match_status: 'MATCHED',
      payment_status: 'SCHEDULED',
      payment_block_reason: 'Variación de precio +1.35% dentro de tolerancia permitida (±2%)',
      due_date: '2026-11-12'
    },
    {
      invoice_uuid: 'c1000000-0000-0000-0000-000000000003',
      invoice_id: 'INV-2026-803',
      supplier_invoice_number: 'F003-0092182',
      supplier_tax_id: '20601928419',
      supplier_name: 'TransCarga Logística Andina S.A.C.',
      sap_po_number: '4500098255',
      sap_gr_number: '5000037981',
      po_amount: 32000.00,
      gr_amount: 32000.00,
      invoice_amount: 34100.00,
      variance_amount: 2100.00,
      variance_percentage: 6.56,
      currency_code: 'USD',
      match_status: 'DISCREPANCY_PRICE',
      payment_status: 'BLOCKED',
      payment_block_reason: 'Discrepancia en Precio (+6.56% > ±2% límite de tolerancia Clean Core)',
      due_date: '2026-11-05'
    },
    {
      invoice_uuid: 'c1000000-0000-0000-0000-000000000004',
      invoice_id: 'INV-2026-804',
      supplier_invoice_number: 'F002-0044192',
      supplier_tax_id: '20491827401',
      supplier_name: 'Suministros Industriales del Pacífico S.A.',
      sap_po_number: '4500098190',
      sap_gr_number: '5000037800',
      po_amount: 24000.00,
      gr_amount: 21000.00,
      invoice_amount: 24000.00,
      variance_amount: 3000.00,
      variance_percentage: 14.28,
      currency_code: 'USD',
      match_status: 'DISCREPANCY_QTY',
      payment_status: 'BLOCKED',
      payment_block_reason: 'Discrepancia de Cantidad: Factura factura 100% pero recepción física (MIGO) fue parcial (87.5%)',
      due_date: '2026-11-02'
    }
  ],

  contracts: [
    {
      contract_id: 'CTR-2026-001',
      title: 'Acuerdo Marco de Hardware y Servicios Cloud 2026-2028',
      supplier: 'Dell Technologies Perú S.A.',
      target_value: 1200000.00,
      released_value: 785000.00,
      remaining_value: 415000.00,
      compliance_rate: 98.5,
      valid_to: '2028-12-31',
      status: 'ACTIVE'
    },
    {
      contract_id: 'CTR-2026-002',
      title: 'Contrato de Suministro de Repuestos y Mantenimiento de Flota WMS',
      supplier: 'Linde Material Handling Andina',
      target_value: 650000.00,
      released_value: 390000.00,
      remaining_value: 260000.00,
      compliance_rate: 95.0,
      valid_to: '2027-06-30',
      status: 'ACTIVE'
    },
    {
      contract_id: 'CTR-2026-003',
      title: 'Servicios Logísticos y Operación de Almacenes Cross-Docking',
      supplier: 'TransCarga Logística Andina S.A.C.',
      target_value: 1800000.00,
      released_value: 1720000.00,
      remaining_value: 80000.00,
      compliance_rate: 91.2,
      valid_to: '2026-12-31',
      status: 'RENEWAL_ALERT'
    }
  ],

  suppliers_slp: [
    {
      supplier_id: 'VEND-1001',
      name: 'Dell Technologies Perú S.A.',
      tax_id: '20519284711',
      tier: 'Strategic Tier 1',
      score: 96.4,
      on_time: 98.2,
      quality: 99.1,
      esg: 'A+',
      spend: 785000.00,
      status: 'PREFERRED'
    },
    {
      supplier_id: 'VEND-1002',
      name: 'SKF del Perú S.A.',
      tax_id: '20100482910',
      tier: 'Preferred Tier 2',
      score: 92.8,
      on_time: 94.5,
      quality: 96.0,
      esg: 'A',
      spend: 245000.00,
      status: 'QUALIFIED'
    },
    {
      supplier_id: 'VEND-1003',
      name: 'TransCarga Logística Andina S.A.C.',
      tax_id: '20601928419',
      tier: 'Preferred Tier 2',
      score: 88.5,
      on_time: 89.0,
      quality: 92.0,
      esg: 'B',
      spend: 520000.00,
      status: 'QUALIFIED'
    },
    {
      supplier_id: 'VEND-1004',
      name: 'Suministros Industriales del Pacífico S.A.',
      tax_id: '20491827401',
      tier: 'Standard Tier 3',
      score: 79.2,
      on_time: 81.0,
      quality: 85.0,
      esg: 'B-',
      spend: 145000.00,
      status: 'UNDER_REVIEW'
    }
  ]
};
