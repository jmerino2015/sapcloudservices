// ============================================================
// MOCK DATA - SAP Solution Manager 7.2 Requirements Management
// ============================================================

const MOCK_DATA = {

    // ── Business Requirements ──────────────────────────────────
    businessRequirements: [
        { id: 'BREQ-001', title: 'Automatización de Proceso de Compras', priority: 'High', status: 'In Process', requester: 'Carlos Mendoza', date: '2026-03-15', area: 'MM', description: 'Implementar workflow automático para aprobación de órdenes de compra mayores a $50,000 USD.', assignedTo: 'Ana López', dueDate: '2026-04-30', progress: 65 },
        { id: 'BREQ-002', title: 'Reporte de Ventas Consolidado', priority: 'Medium', status: 'New', requester: 'María García', date: '2026-03-18', area: 'SD', description: 'Crear reporte analítico que consolide ventas por región, canal y producto con drill-down.', assignedTo: 'Pedro Ramírez', dueDate: '2026-05-15', progress: 10 },
        { id: 'BREQ-003', title: 'Integración con Portal de Proveedores', priority: 'High', status: 'In Approval', requester: 'Roberto Sánchez', date: '2026-03-20', area: 'MM', description: 'Integrar SAP con portal externo de proveedores para automatizar la recepción de facturas.', assignedTo: 'Luis Torres', dueDate: '2026-05-30', progress: 40 },
        { id: 'BREQ-004', title: 'Migración de Datos Maestros HR', priority: 'Critical', status: 'In Process', requester: 'Laura Fernández', date: '2026-03-10', area: 'HCM', description: 'Migrar datos de empleados desde sistema legacy a SAP SuccessFactors.', assignedTo: 'Diego Morales', dueDate: '2026-04-20', progress: 80 },
        { id: 'BREQ-005', title: 'Dashboard Financiero Gerencial', priority: 'Medium', status: 'New', requester: 'Jorge Díaz', date: '2026-03-22', area: 'FI', description: 'Panel ejecutivo con KPIs financieros en tiempo real: P&L, Balance, Cash Flow.', assignedTo: 'Sofía Herrera', dueDate: '2026-06-01', progress: 5 },
        { id: 'BREQ-006', title: 'Optimización de Planificación MRP', priority: 'High', status: 'In Process', requester: 'Andrea Ruiz', date: '2026-03-08', area: 'PP', description: 'Mejorar algoritmo de MRP para reducir stock de seguridad en un 15%.', assignedTo: 'Miguel Castillo', dueDate: '2026-04-25', progress: 55 },
        { id: 'BREQ-007', title: 'App Fiori para Aprobación de Viajes', priority: 'Low', status: 'Completed', requester: 'Patricia Vega', date: '2026-02-15', area: 'FI-TV', description: 'Aplicación móvil Fiori para solicitar y aprobar viajes de negocio.', assignedTo: 'Alejandro Núñez', dueDate: '2026-03-30', progress: 100 },
        { id: 'BREQ-008', title: 'Control de Calidad en Recepción', priority: 'High', status: 'In Process', requester: 'Fernando Ortiz', date: '2026-03-12', area: 'QM', description: 'Implementar puntos de inspección automáticos en recepción de mercancía.', assignedTo: 'Valentina Parra', dueDate: '2026-05-10', progress: 35 },
        { id: 'BREQ-009', title: 'Facturación Electrónica CFDI 4.0', priority: 'Critical', status: 'In Approval', requester: 'Gabriela Luna', date: '2026-03-05', area: 'FI', description: 'Adecuación del proceso de facturación a la versión CFDI 4.0 del SAT.', assignedTo: 'Ricardo Vargas', dueDate: '2026-04-15', progress: 70 },
        { id: 'BREQ-010', title: 'Gestión de Activos Fijos con IoT', priority: 'Medium', status: 'New', requester: 'Daniel Reyes', date: '2026-03-25', area: 'PM', description: 'Integrar sensores IoT con módulo PM para mantenimiento predictivo.', assignedTo: 'Camila Jiménez', dueDate: '2026-06-15', progress: 0 },
        { id: 'BREQ-011', title: 'Workflow de Aprobación de Presupuesto', priority: 'High', status: 'In Process', requester: 'Martín Acosta', date: '2026-03-14', area: 'CO', description: 'Flujo de aprobación escalonado para presupuestos departamentales.', assignedTo: 'Isabella Cruz', dueDate: '2026-05-05', progress: 45 },
        { id: 'BREQ-012', title: 'Portal de Autoservicio Empleados', priority: 'Medium', status: 'Closed', requester: 'Lucía Peña', date: '2026-01-20', area: 'HCM', description: 'Portal para consulta de recibos, vacaciones y datos personales.', assignedTo: 'Sebastián Flores', dueDate: '2026-03-10', progress: 100 },
    ],

    // ── IT Requirements ────────────────────────────────────────
    itRequirements: [
        { id: 'ITREQ-001', title: 'Desarrollo BAPI para Integración Compras', businessReqId: 'BREQ-001', complexity: 'High', sprint: 'Sprint 14', status: 'In Development', developer: 'Ana López', type: 'Development', transport: 'DEVK903456' },
        { id: 'ITREQ-002', title: 'CDS View para Reporte de Ventas', businessReqId: 'BREQ-002', complexity: 'Medium', sprint: 'Sprint 15', status: 'Technical Analysis', developer: 'Pedro Ramírez', type: 'Development', transport: '' },
        { id: 'ITREQ-003', title: 'Configuración RFC Portal Proveedores', businessReqId: 'BREQ-003', complexity: 'High', sprint: 'Sprint 14', status: 'In Development', developer: 'Luis Torres', type: 'Configuration', transport: 'DEVK903461' },
        { id: 'ITREQ-004', title: 'Programa LSMW Migración HR', businessReqId: 'BREQ-004', complexity: 'Critical', sprint: 'Sprint 13', status: 'QA Testing', developer: 'Diego Morales', type: 'Development', transport: 'DEVK903447' },
        { id: 'ITREQ-005', title: 'Fiori App Dashboard FI (RAP)', businessReqId: 'BREQ-005', complexity: 'Medium', sprint: 'Sprint 16', status: 'Pending', developer: 'Sofía Herrera', type: 'Development', transport: '' },
        { id: 'ITREQ-006', title: 'Optimización SQLScript MRP', businessReqId: 'BREQ-006', complexity: 'High', sprint: 'Sprint 14', status: 'In Development', developer: 'Miguel Castillo', type: 'Development', transport: 'DEVK903459' },
        { id: 'ITREQ-007', title: 'Configuración Inspección QM', businessReqId: 'BREQ-008', complexity: 'Medium', sprint: 'Sprint 15', status: 'Technical Analysis', developer: 'Valentina Parra', type: 'Configuration', transport: '' },
        { id: 'ITREQ-008', title: 'Adecuación CFDI 4.0 - Complementos', businessReqId: 'BREQ-009', complexity: 'Critical', sprint: 'Sprint 13', status: 'QA Testing', developer: 'Ricardo Vargas', type: 'Development', transport: 'DEVK903450' },
    ],

    // ── Projects ────────────────────────────────────────────────
    projects: [
        { id: 'PRJ-001', title: 'S/4HANA Rollout - Planta Norte', status: 'Active', phase: 'Realize', manager: 'Carlos Mendoza', startDate: '2026-01-15', endDate: '2026-06-30', progress: 45, budget: 850000, spent: 382500, team: 12, risks: 3 },
        { id: 'PRJ-002', title: 'Migración SuccessFactors', status: 'Active', phase: 'Explore', manager: 'Laura Fernández', startDate: '2026-02-01', endDate: '2026-07-31', progress: 25, budget: 420000, spent: 105000, team: 6, risks: 1 },
        { id: 'PRJ-003', title: 'Integración Ariba Network', status: 'Planning', phase: 'Prepare', manager: 'Roberto Sánchez', startDate: '2026-04-01', endDate: '2026-09-30', progress: 10, budget: 300000, spent: 30000, team: 4, risks: 2 },
        { id: 'PRJ-004', title: 'BW/4HANA Analytics Platform', status: 'Active', phase: 'Realize', manager: 'Jorge Díaz', startDate: '2025-11-01', endDate: '2026-05-15', progress: 72, budget: 650000, spent: 468000, team: 8, risks: 0 },
        { id: 'PRJ-005', title: 'CFDI 4.0 - Compliance', status: 'Active', phase: 'Deploy', manager: 'Gabriela Luna', startDate: '2025-12-01', endDate: '2026-04-15', progress: 88, budget: 180000, spent: 158400, team: 5, risks: 1 },
    ],

    // ── Approval Inbox (IT Service Management) ──────────────────
    approvalItems: [
        { id: 'APR-001', type: 'Business Requirement', refId: 'BREQ-003', title: 'Integración con Portal de Proveedores', requester: 'Roberto Sánchez', date: '2026-03-28', urgency: 'High', description: 'Solicitud de aprobación para iniciar fase de desarrollo de integración con portal externo.' },
        { id: 'APR-002', type: 'Change Request', refId: 'CR-005', title: 'Transport Request DEVK903461', requester: 'Luis Torres', date: '2026-03-29', urgency: 'Medium', description: 'Aprobación de transporte de cambios de configuración RFC hacia QAS.' },
        { id: 'APR-003', type: 'Business Requirement', refId: 'BREQ-009', title: 'Facturación Electrónica CFDI 4.0', requester: 'Gabriela Luna', date: '2026-03-30', urgency: 'Critical', description: 'Aprobación urgente para pase a producción del compliance CFDI 4.0.' },
        { id: 'APR-004', type: 'Budget Approval', refId: 'PRJ-003', title: 'Presupuesto Integración Ariba', requester: 'Roberto Sánchez', date: '2026-03-27', urgency: 'Medium', description: 'Aprobación de presupuesto inicial de $300,000 USD para proyecto Ariba.' },
        { id: 'APR-005', type: 'Change Request', refId: 'CR-008', title: 'Emergency Fix - Cálculo IVA', requester: 'Ricardo Vargas', date: '2026-04-01', urgency: 'Critical', description: 'Corrección de emergencia en cálculo de IVA para nueva tasa.' },
    ],

    // ── Change Requests (ChaRM) ─────────────────────────────────
    changeRequests: [
        { id: 'CR-001', description: 'Workflow Compras Automatizado', type: 'Normal', status: 'In Development', transport: 'DEVK903456', developer: 'Ana López', createdDate: '2026-03-16', system: 'DEV → QAS → PRD' },
        { id: 'CR-002', description: 'LSMW Migración Datos HR', type: 'Normal', status: 'Testing', transport: 'DEVK903447', developer: 'Diego Morales', createdDate: '2026-03-11', system: 'DEV → QAS → PRD' },
        { id: 'CR-003', description: 'Optimización MRP SQLScript', type: 'Normal', status: 'In Development', transport: 'DEVK903459', developer: 'Miguel Castillo', createdDate: '2026-03-09', system: 'DEV → QAS → PRD' },
        { id: 'CR-004', description: 'CFDI 4.0 Complementos Pago', type: 'Urgent', status: 'To Be Deployed', transport: 'DEVK903450', developer: 'Ricardo Vargas', createdDate: '2026-03-06', system: 'DEV → QAS → PRD' },
        { id: 'CR-005', description: 'RFC Portal Proveedores', type: 'Normal', status: 'In Development', transport: 'DEVK903461', developer: 'Luis Torres', createdDate: '2026-03-21', system: 'DEV → QAS → PRD' },
        { id: 'CR-006', description: 'Emergency Fix IVA Calc', type: 'Emergency', status: 'Created', transport: 'DEVK903470', developer: 'Ricardo Vargas', createdDate: '2026-04-01', system: 'DEV → PRD' },
    ],

    // ── Test Plans ──────────────────────────────────────────────
    testPlans: [
        { id: 'TP-001', name: 'Test Plan - Workflow Compras', relatedReq: 'BREQ-001', totalCases: 24, passed: 16, failed: 2, pending: 6, tester: 'QA Team Alpha', status: 'In Progress' },
        { id: 'TP-002', name: 'Test Plan - Migración HR', relatedReq: 'BREQ-004', totalCases: 45, passed: 38, failed: 3, pending: 4, tester: 'QA Team Beta', status: 'In Progress' },
        { id: 'TP-003', name: 'Test Plan - CFDI 4.0', relatedReq: 'BREQ-009', totalCases: 32, passed: 28, failed: 1, pending: 3, tester: 'QA Team Alpha', status: 'In Progress' },
        { id: 'TP-004', name: 'Test Plan - MRP Optimization', relatedReq: 'BREQ-006', totalCases: 18, passed: 0, failed: 0, pending: 18, tester: 'QA Team Beta', status: 'Not Started' },
        { id: 'TP-005', name: 'Test Plan - Portal Proveedores', relatedReq: 'BREQ-003', totalCases: 20, passed: 0, failed: 0, pending: 20, tester: 'QA Team Alpha', status: 'Not Started' },
        { id: 'TP-006', name: 'Regression Test - FI Module', relatedReq: 'BREQ-009', totalCases: 60, passed: 55, failed: 2, pending: 3, tester: 'QA Team Beta', status: 'In Progress' },
    ],

    // ── Solution Documentation ───────────────────────────────────
    solutionDoc: [
        {
            id: 'SD-FI', name: 'Finanzas (FI)', icon: 'finance', expanded: false,
            processes: [
                { id: 'SD-FI-01', name: 'Contabilidad General', steps: ['Registro de Pólizas', 'Cierre Mensual', 'Conciliación Bancaria', 'Reportes Legales'], impactedReqs: ['BREQ-005', 'BREQ-009'] },
                { id: 'SD-FI-02', name: 'Cuentas por Pagar', steps: ['Registro de Facturas', 'Programación de Pagos', 'Compensación'], impactedReqs: ['BREQ-003'] },
                { id: 'SD-FI-03', name: 'Cuentas por Cobrar', steps: ['Facturación', 'Cobranza', 'Dunning'], impactedReqs: ['BREQ-009'] },
            ]
        },
        {
            id: 'SD-MM', name: 'Gestión de Materiales (MM)', icon: 'materials', expanded: false,
            processes: [
                { id: 'SD-MM-01', name: 'Compras', steps: ['Solicitud de Pedido', 'Orden de Compra', 'Aprobación', 'Entrada de Mercancía'], impactedReqs: ['BREQ-001'] },
                { id: 'SD-MM-02', name: 'Gestión de Inventarios', steps: ['Movimientos de Material', 'Inventario Físico', 'Valoración'], impactedReqs: [] },
                { id: 'SD-MM-03', name: 'Portal de Proveedores', steps: ['Registro', 'Licitación', 'Evaluación', 'Recepción de Facturas'], impactedReqs: ['BREQ-003'] },
            ]
        },
        {
            id: 'SD-SD', name: 'Ventas y Distribución (SD)', icon: 'sales', expanded: false,
            processes: [
                { id: 'SD-SD-01', name: 'Gestión de Pedidos', steps: ['Cotización', 'Orden de Venta', 'Entrega', 'Facturación'], impactedReqs: ['BREQ-002'] },
                { id: 'SD-SD-02', name: 'Reporting', steps: ['Ventas por Canal', 'Ventas por Región', 'Pipeline'], impactedReqs: ['BREQ-002'] },
            ]
        },
        {
            id: 'SD-PP', name: 'Planificación de Producción (PP)', icon: 'production', expanded: false,
            processes: [
                { id: 'SD-PP-01', name: 'Planificación MRP', steps: ['Ejecución MRP', 'Análisis de Necesidades', 'Órdenes Planificadas', 'Conversión'], impactedReqs: ['BREQ-006'] },
                { id: 'SD-PP-02', name: 'Órdenes de Fabricación', steps: ['Creación', 'Liberación', 'Confirmación', 'Cierre'], impactedReqs: [] },
            ]
        },
        {
            id: 'SD-HCM', name: 'Capital Humano (HCM)', icon: 'people', expanded: false,
            processes: [
                { id: 'SD-HCM-01', name: 'Administración de Personal', steps: ['Alta', 'Baja', 'Cambios Organizacionales'], impactedReqs: ['BREQ-004', 'BREQ-012'] },
                { id: 'SD-HCM-02', name: 'Nómina', steps: ['Cálculo', 'Posteo Contable', 'Recibos'], impactedReqs: ['BREQ-012'] },
                { id: 'SD-HCM-03', name: 'Gestión de Viajes', steps: ['Solicitud', 'Aprobación', 'Liquidación'], impactedReqs: ['BREQ-007'] },
            ]
        },
        {
            id: 'SD-QM', name: 'Gestión de Calidad (QM)', icon: 'quality', expanded: false,
            processes: [
                { id: 'SD-QM-01', name: 'Inspección', steps: ['Lote de Inspección', 'Registro de Resultados', 'Decisión de Empleo'], impactedReqs: ['BREQ-008'] },
            ]
        },
        {
            id: 'SD-PM', name: 'Mantenimiento de Planta (PM)', icon: 'maintenance', expanded: false,
            processes: [
                { id: 'SD-PM-01', name: 'Mantenimiento Preventivo', steps: ['Plan de Mantenimiento', 'Orden de Trabajo', 'Confirmación'], impactedReqs: ['BREQ-010'] },
                { id: 'SD-PM-02', name: 'Mantenimiento Predictivo', steps: ['Monitoreo IoT', 'Alertas', 'Intervención'], impactedReqs: ['BREQ-010'] },
            ]
        },
    ],

    // ── Job Management ──────────────────────────────────────────
    jobs: [
        { id: 'JOB-001', name: 'MRP Run - Planta Norte', schedule: 'Daily 02:00', lastRun: '2026-04-02 02:00', status: 'Success', duration: '45 min', nextRun: '2026-04-03 02:00', type: 'Background' },
        { id: 'JOB-002', name: 'CFDI - Timbrado Masivo', schedule: 'Hourly', lastRun: '2026-04-02 18:00', status: 'Success', duration: '12 min', nextRun: '2026-04-02 19:00', type: 'Background' },
        { id: 'JOB-003', name: 'Data Migration - HR Batch 5', schedule: 'On Demand', lastRun: '2026-04-01 14:30', status: 'Error', duration: '1h 23 min', nextRun: 'Manual', type: 'Migration' },
        { id: 'JOB-004', name: 'Backup - HANA Database', schedule: 'Daily 00:00', lastRun: '2026-04-02 00:00', status: 'Success', duration: '2h 10 min', nextRun: '2026-04-03 00:00', type: 'System' },
        { id: 'JOB-005', name: 'Report - Ventas Consolidado', schedule: 'Weekly Mon 06:00', lastRun: '2026-03-31 06:00', status: 'Success', duration: '18 min', nextRun: '2026-04-07 06:00', type: 'Report' },
        { id: 'JOB-006', name: 'Interface - Portal Proveedores', schedule: 'Every 15 min', lastRun: '2026-04-02 18:15', status: 'Warning', duration: '3 min', nextRun: '2026-04-02 18:30', type: 'Interface' },
    ],

    // ── Incidents (IT Service Management) ────────────────────────
    incidents: [
        { id: 'INC-001', title: 'Error en cálculo de retenciones ISR', priority: 'High', status: 'In Process', assignedTo: 'Ricardo Vargas', reportedBy: 'Gabriela Luna', date: '2026-04-01', category: 'FI', sla: '4h', remaining: '1h 30min' },
        { id: 'INC-002', title: 'Performance issue - Reporte ZSD_VENTAS', priority: 'Medium', status: 'New', assignedTo: 'Pedro Ramírez', reportedBy: 'María García', date: '2026-04-02', category: 'SD', sla: '8h', remaining: '6h' },
        { id: 'INC-003', title: 'Dump ABAP en transacción ME21N', priority: 'Critical', status: 'In Process', assignedTo: 'Ana López', reportedBy: 'Carlos Mendoza', date: '2026-04-02', category: 'MM', sla: '2h', remaining: '0h 45min' },
        { id: 'INC-004', title: 'Jobs cancelados - MRP nocturno', priority: 'High', status: 'Resolved', assignedTo: 'Miguel Castillo', reportedBy: 'Andrea Ruiz', date: '2026-03-31', category: 'PP', sla: '4h', remaining: 'Closed' },
    ],

    // ── KPI Data for Dashboard ───────────────────────────────────
    kpis: {
        totalActive: 10,
        totalClosed: 2,
        inSLA: 85,
        avgResolutionDays: 28,
        backlog: 3,
        statusDistribution: {
            'New': 3, 'In Process': 4, 'In Approval': 2, 'Completed': 1, 'Closed': 2
        },
        areaDistribution: {
            'FI': 3, 'MM': 2, 'SD': 1, 'PP': 1, 'HCM': 2, 'QM': 1, 'PM': 1, 'CO': 1
        },
        monthlyTrend: {
            labels: ['Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar'],
            created: [8, 12, 6, 10, 7, 12],
            completed: [5, 9, 8, 7, 6, 3]
        }
    }
};
