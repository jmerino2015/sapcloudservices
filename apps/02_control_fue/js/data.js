/* ==========================================================================
   SAP FIORI HORIZON DATA MODEL & SAMPLE DATASET
   Includes SAP Standard Reports: SLIM_DCH, S_BCE_68001393, SLIM_UCH, SUIM
   ========================================================================== */

const INITIAL_FUE_CONTRACT = {
  contractName: "SAP RISE S/4HANA Cloud Enterprise",
  contractNumber: "4509128301",
  startDate: "2024-01-01",
  endDate: "2027-12-31",
  totalContractedFUE: 150.0,
  costPerFUE: 120.0, // USD por FUE al mes
  warningThreshold: 85, // 85% alerta amarilla
  criticalThreshold: 95, // 95% alerta roja
  ratios: {
    Developer: 1.0,
    Advanced: 1.0,
    Core: 0.25,
    SelfService: 0.05
  }
};

const SAP_SYSTEMS = [
  { id: "ALL", name: "Todos los Sistemas" },
  { id: "PRD-100", name: "S/4HANA Producción (PRD-100)" },
  { id: "QAS-200", name: "S/4HANA Calidad (QAS-200)" },
  { id: "DEV-010", name: "S/4HANA Desarrollo (DEV-010)" }
];

// DATASET PRINCIPAL DE USUARIOS SAP
const INITIAL_USERS = [
  // Developer Users (1.0 FUE)
  {
    id: "US-1001",
    username: "ABAP_DEV01",
    fullName: "Carlos Mendoza",
    email: "carlos.mendoza@empresa.com",
    department: "Tecnología e Informática",
    costCenter: "CC-1090 (TI Ops)",
    system: "PRD-100",
    licenseType: "Developer",
    status: "Active",
    lockStatus: "Unlocked",
    lastLogin: "2026-09-16",
    daysInactive: 1,
    assignedRoles: ["SAP_BR_ABAP_DEVELOPER", "SAP_BR_SYSTEM_ADMIN"],
    criticalTCodes: ["SE16N", "PFCG", "SCC4", "SM30"],
    sodConflicts: ["Desarrollo ABAP + Modificación Directa Tablas (SE16N)"],
    optimizationSuggested: null
  },
  {
    id: "US-1002",
    username: "FIORI_DEV02",
    fullName: "Lucía Fernández",
    email: "lucia.fernandez@empresa.com",
    department: "Tecnología e Informática",
    costCenter: "CC-1090 (TI Ops)",
    system: "PRD-100",
    licenseType: "Developer",
    status: "Active",
    lockStatus: "Unlocked",
    lastLogin: "2026-09-17",
    daysInactive: 0,
    assignedRoles: ["SAP_BR_FIORI_DEVELOPER", "SAP_BR_CONFIGURATOR"],
    criticalTCodes: ["SE80", "SU01"],
    sodConflicts: [],
    optimizationSuggested: null
  },

  // Advanced Users (1.0 FUE)
  {
    id: "US-1003",
    username: "CFO_VALDEZ",
    fullName: "Roberto Valdez",
    email: "roberto.valdez@empresa.com",
    department: "Finanzas y Contabilidad",
    costCenter: "CC-1010 (Dirección)",
    system: "PRD-100",
    licenseType: "Advanced",
    status: "Active",
    lockStatus: "Unlocked",
    lastLogin: "2026-09-17",
    daysInactive: 0,
    assignedRoles: ["SAP_BR_CHIEF_FINANCIAL_OFFICER", "SAP_BR_GL_ACCOUNTANT"],
    criticalTCodes: ["FB01", "F110", "FB08"],
    sodConflicts: ["Crear/Editar Asiento (FB01) + Aprobar/Ejecutar Pago (F110)"],
    optimizationSuggested: null
  },
  {
    id: "US-1004",
    username: "CONT_GERENTE",
    fullName: "Ana María Silva",
    email: "ana.silva@empresa.com",
    department: "Finanzas y Contabilidad",
    costCenter: "CC-1020 (Contabilidad)",
    system: "PRD-100",
    licenseType: "Advanced",
    status: "Active",
    lockStatus: "Unlocked",
    lastLogin: "2026-09-15",
    daysInactive: 2,
    assignedRoles: ["SAP_BR_GL_ACCOUNTANT", "SAP_BR_TAX_SPECIALIST"],
    criticalTCodes: ["FB01", "FBL3N"],
    sodConflicts: [],
    optimizationSuggested: null
  },
  {
    id: "US-1005",
    username: "SUPPLY_DIR",
    fullName: "Fernando Gómez",
    email: "fernando.gomez@empresa.com",
    department: "Logística y Suministros",
    costCenter: "CC-1030 (Cadena Suministro)",
    system: "PRD-100",
    licenseType: "Advanced",
    status: "Active",
    lockStatus: "Unlocked",
    lastLogin: "2026-09-14",
    daysInactive: 3,
    assignedRoles: ["SAP_BR_PURCHASING_MANAGER", "SAP_BR_INVENTORY_MANAGER"],
    criticalTCodes: ["ME21N", "MIGO", "MIRO"],
    sodConflicts: ["Crear Pedido Compras (ME21N) + Recepción Mercancía (MIGO)"],
    optimizationSuggested: null
  },
  {
    id: "US-1006",
    username: "AUDIT_EXT01",
    fullName: "Jorge Ramírez",
    email: "jorge.ramirez@auditoria.com",
    department: "Auditoría Interna",
    costCenter: "CC-1005 (Auditoría)",
    system: "PRD-100",
    licenseType: "Advanced",
    status: "Inactive",
    lockStatus: "Locked_Incorrect_Password",
    lastLogin: "2026-05-10",
    daysInactive: 130,
    assignedRoles: ["SAP_BR_INTERNAL_AUDITOR", "SAP_BR_GL_ACCOUNTANT"],
    criticalTCodes: ["SUIM", "SM20"],
    sodConflicts: [],
    optimizationSuggested: "Reclamar Licencia (Inactivo > 90 días)"
  },
  {
    id: "US-1007",
    username: "VENTAS_GERENTE",
    fullName: "Sofia Castro",
    email: "sofia.castro@empresa.com",
    department: "Comercial y Ventas",
    costCenter: "CC-1040 (Ventas)",
    system: "PRD-100",
    licenseType: "Advanced",
    status: "Active",
    lockStatus: "Unlocked",
    lastLogin: "2026-09-16",
    daysInactive: 1,
    assignedRoles: ["SAP_BR_SALES_MANAGER", "SAP_BR_BILLING_SPECIALIST"],
    criticalTCodes: ["VA01", "VF01"],
    sodConflicts: [],
    optimizationSuggested: null
  },

  // Core Users (0.25 FUE)
  {
    id: "US-1009",
    username: "PURCHASER_01",
    fullName: "Gabriela Rios",
    email: "gabriela.rios@empresa.com",
    department: "Logística y Suministros",
    costCenter: "CC-1030 (Cadena Suministro)",
    system: "PRD-100",
    licenseType: "Core",
    status: "Active",
    lockStatus: "Unlocked",
    lastLogin: "2026-09-17",
    daysInactive: 0,
    assignedRoles: ["SAP_BR_PURCHASER"],
    criticalTCodes: ["ME21N"],
    sodConflicts: [],
    optimizationSuggested: null
  },
  {
    id: "US-1010",
    username: "WAREHOUSE_01",
    fullName: "Martin Vega",
    email: "martin.vega@empresa.com",
    department: "Logística y Suministros",
    costCenter: "CC-1035 (Almacén)",
    system: "PRD-100",
    licenseType: "Core",
    status: "Active",
    lockStatus: "Unlocked",
    lastLogin: "2026-09-16",
    daysInactive: 1,
    assignedRoles: ["SAP_BR_WAREHOUSE_CLERK"],
    criticalTCodes: ["MIGO"],
    sodConflicts: [],
    optimizationSuggested: null
  },
  {
    id: "US-1011",
    username: "ACCOUNTANT_02",
    fullName: "Patricia Bravo",
    email: "patricia.bravo@empresa.com",
    department: "Finanzas y Contabilidad",
    costCenter: "CC-1020 (Contabilidad)",
    system: "PRD-100",
    licenseType: "Advanced",
    status: "Active",
    lockStatus: "Unlocked",
    lastLogin: "2026-09-10",
    daysInactive: 7,
    assignedRoles: ["SAP_BR_ACCOUNTS_PAYABLE_CLERK"],
    criticalTCodes: ["FB60"],
    sodConflicts: [],
    optimizationSuggested: "Reclasificar a Core (Ahorro 0.75 FUE)"
  },

  // Self-Service Users (0.05 FUE)
  {
    id: "US-1014",
    username: "EMP_ALVAREZ",
    fullName: "Ricardo Álvarez",
    email: "ricardo.alvarez@empresa.com",
    department: "Operaciones y Planta",
    costCenter: "CC-1050 (Manufactura)",
    system: "PRD-100",
    licenseType: "SelfService",
    status: "Active",
    lockStatus: "Unlocked",
    lastLogin: "2026-09-17",
    daysInactive: 0,
    assignedRoles: ["SAP_BR_EMPLOYEE_LEAVE_REQ"],
    criticalTCodes: [],
    sodConflicts: [],
    optimizationSuggested: null
  },
  {
    id: "US-1016",
    username: "EMP_INACT_01",
    fullName: "Gonzalo Pineda",
    email: "gonzalo.pineda@empresa.com",
    department: "Operaciones y Planta",
    costCenter: "CC-1050 (Manufactura)",
    system: "PRD-100",
    licenseType: "Advanced",
    status: "Inactive",
    lockStatus: "Locked_Admin",
    lastLogin: "2025-11-20",
    daysInactive: 300,
    assignedRoles: ["SAP_BR_EMPLOYEE_LEAVE_REQ"],
    criticalTCodes: [],
    sodConflicts: [],
    optimizationSuggested: "Reclamar Licencia (Inactivo > 90 días & Sobrelicenciado)"
  }
];

// Generar dinámicamente usuarios adicionales
(function generateExtendedUsers() {
  const departments = [
    { name: "Finanzas y Contabilidad", cc: "CC-1020" },
    { name: "Logística y Suministros", cc: "CC-1030" },
    { name: "Comercial y Ventas", cc: "CC-1040" },
    { name: "Operaciones y Planta", cc: "CC-1050" },
    { name: "Recursos Humanos", cc: "CC-1060" },
    { name: "Tecnología e Informática", cc: "CC-1090" }
  ];

  const firstNames = ["Andrés", "Camila", "Javier", "Mariana", "Diego", "Paula", "Gabriel", "Natalia", "Esteban", "Daniela", "Felipe", "Vanessa"];
  const lastNames = ["Rojas", "Vargas", "Guerrero", "Soto", "Ibarra", "Medina", "Ortega", "Peña", "Cárdenas", "Cortés", "Molina", "Delgado"];
  const licenseTypes = ["Advanced", "Core", "SelfService", "SelfService", "Core", "SelfService"];

  let count = 1017;
  for (let i = 0; i < 45; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[(i * 3) % lastNames.length];
    const dept = departments[i % departments.length];
    const lic = licenseTypes[i % licenseTypes.length];
    const isInactive = i % 7 === 0;

    let roles = ["SAP_BR_EMPLOYEE_SELF_SERVICE"];
    let tcodes = [];
    if (lic === "Advanced") { roles = ["SAP_BR_SENIOR_FIN_ANALYST", "SAP_BR_BUSINESS_PROCESS_OWNER"]; tcodes = ["FB01", "ME21N"]; }
    else if (lic === "Core") { roles = ["SAP_BR_PURCHASER", "SAP_BR_INVENTORY_CLERK"]; tcodes = ["MIGO"]; }

    let opt = null;
    if (isInactive) {
      opt = "Reclamar Licencia (Usuario Inactivo)";
    } else if (lic === "Advanced" && i % 2 === 0) {
      opt = "Reclasificar a Core (Baja actividad)";
    }

    INITIAL_USERS.push({
      id: `US-${count++}`,
      username: `${fn.toUpperCase()}_${ln.substring(0, 3).toUpperCase()}`,
      fullName: `${fn} ${ln}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@empresa.com`,
      department: dept.name,
      costCenter: `${dept.cc} (${dept.name.split(' ')[0]})`,
      system: i % 5 === 0 ? "QAS-200" : "PRD-100",
      licenseType: lic,
      status: isInactive ? "Inactive" : "Active",
      lockStatus: isInactive ? "Locked_Admin" : "Unlocked",
      lastLogin: isInactive ? "2026-02-10" : "2026-09-16",
      daysInactive: isInactive ? 219 : (i % 4),
      assignedRoles: roles,
      criticalTCodes: tcodes,
      sodConflicts: i % 11 === 0 ? ["Acceso simultáneo a Modificación de Maestro de Proveedores (XK02) + Pagos (F110)"] : [],
      optimizationSuggested: opt
    });
  }
})();

// ==========================================================================
// 1. REPORTE ESTÁNDAR SAP: SLIM_DCH (Directory History / Historial Medición LAW)
// ==========================================================================
const DEMO_SLIM_DCH = [
  {
    measurementId: "LAW-2026-09",
    measurementDate: "2026-09-01 08:30:00",
    systemId: "PRD-100",
    sapRelease: "S/4HANA 2023 FPS02",
    totalUsersMeasured: 58,
    activeUsersCount: 52,
    totalFUEConsumed: 137.45,
    contractedFUE: 150.0,
    complianceStatus: "Normal (91.6%)",
    measuredBy: "BASIS_ADMIN01",
    statusBadge: "positive"
  },
  {
    measurementId: "LAW-2026-08",
    measurementDate: "2026-08-01 09:15:00",
    systemId: "PRD-100",
    sapRelease: "S/4HANA 2023 FPS02",
    totalUsersMeasured: 57,
    activeUsersCount: 51,
    totalFUEConsumed: 133.50,
    contractedFUE: 150.0,
    complianceStatus: "Normal (89.0%)",
    measuredBy: "BASIS_ADMIN01",
    statusBadge: "positive"
  },
  {
    measurementId: "LAW-2026-07",
    measurementDate: "2026-07-01 10:00:00",
    systemId: "PRD-100",
    sapRelease: "S/4HANA 2023 FPS02",
    totalUsersMeasured: 55,
    activeUsersCount: 49,
    totalFUEConsumed: 131.00,
    contractedFUE: 150.0,
    complianceStatus: "Normal (87.3%)",
    measuredBy: "BASIS_ADMIN01",
    statusBadge: "positive"
  },
  {
    measurementId: "LAW-2026-06",
    measurementDate: "2026-06-01 08:45:00",
    systemId: "PRD-100",
    sapRelease: "S/4HANA 2023 FPS01",
    totalUsersMeasured: 54,
    activeUsersCount: 48,
    totalFUEConsumed: 126.50,
    contractedFUE: 150.0,
    complianceStatus: "Normal (84.3%)",
    measuredBy: "AUDITOR_SAP",
    statusBadge: "positive"
  },
  {
    measurementId: "LAW-2026-05",
    measurementDate: "2026-05-01 09:30:00",
    systemId: "PRD-100",
    sapRelease: "S/4HANA 2023 FPS01",
    totalUsersMeasured: 52,
    activeUsersCount: 46,
    totalFUEConsumed: 122.00,
    contractedFUE: 150.0,
    complianceStatus: "Normal (81.3%)",
    measuredBy: "BASIS_ADMIN01",
    statusBadge: "positive"
  }
];

// ==========================================================================
// 2. REPORTE ESTÁNDAR SAP: S_BCE_68001393 (Complex User Selection / Auditoría)
// ==========================================================================
const DEMO_S_BCE_68001393 = [
  {
    username: "ABAP_DEV01",
    fullName: "Carlos Mendoza",
    department: "Tecnología e Informática",
    authorizationObject: "S_TABU_DIS",
    authFieldValue: "DICBERCLS = &NC& (Tablas Sin Grupo)",
    tcodeExecuted: "SE16N",
    riskLevel: "HIGH",
    riskDescription: "Modificación directa de tablas de base de datos en Producción",
    lastExecuted: "2026-09-16 14:22"
  },
  {
    username: "CFO_VALDEZ",
    fullName: "Roberto Valdez",
    department: "Finanzas y Contabilidad",
    authorizationObject: "F_REGU_BUK",
    authFieldValue: "ACTVT = 14 (Aprobación de Propuesta de Pago)",
    tcodeExecuted: "F110",
    riskLevel: "MEDIUM",
    riskDescription: "Permiso de ejecución y liberación de programa de pago masivo",
    lastExecuted: "2026-09-17 11:05"
  },
  {
    username: "SUPPLY_DIR",
    fullName: "Fernando Gómez",
    department: "Logística y Suministros",
    authorizationObject: "M_BEST_BSA",
    authFieldValue: "BSART = NB (Pedidos Estándar de Compra)",
    tcodeExecuted: "ME21N",
    riskLevel: "MEDIUM",
    riskDescription: "Creación de Pedidos con liberación directa sin segundo nivel",
    lastExecuted: "2026-09-14 16:40"
  },
  {
    username: "AUDIT_EXT01",
    fullName: "Jorge Ramírez",
    department: "Auditoría Interna",
    authorizationObject: "S_USER_GRP",
    authFieldValue: "CLASS = * (Todos los Grupos de Usuario)",
    tcodeExecuted: "SUIM",
    riskLevel: "HIGH",
    riskDescription: "Usuario Inactivo reteniendo privilegios elevados de Auditoría",
    lastExecuted: "2026-05-10 10:15"
  },
  {
    username: "ANDRES_ROJ",
    fullName: "Andrés Rojas",
    department: "Finanzas y Contabilidad",
    authorizationObject: "F_BKPF_BUK",
    authFieldValue: "BUKRS = 1000",
    tcodeExecuted: "FB01",
    riskLevel: "LOW",
    riskDescription: "Contabilización estándar de documentos de finanzas",
    lastExecuted: "2026-09-16 09:30"
  }
];

// ==========================================================================
// 3. REPORTE ESTÁNDAR SAP: SLIM_UCH (User Classification History / Cambios)
// ==========================================================================
const DEMO_SLIM_UCH = [
  {
    changeId: "CHG-90410",
    timestamp: "2026-09-15 11:20:00",
    username: "ACCOUNTANT_02",
    fullName: "Patricia Bravo",
    previousLicense: "Advanced (1.0 FUE)",
    newLicense: "Core (0.25 FUE)",
    fueDelta: -0.75,
    costSavingsUSD: 90.0,
    changedBy: "BASIS_ADMIN01",
    reason: "Reclasificación recomendada por baja utilización de T-Codes Advanced"
  },
  {
    changeId: "CHG-90385",
    timestamp: "2026-09-10 16:45:00",
    username: "EMP_INACT_01",
    fullName: "Gonzalo Pineda",
    previousLicense: "Advanced (1.0 FUE)",
    newLicense: "SelfService (0.05 FUE)",
    fueDelta: -0.95,
    costSavingsUSD: 114.0,
    changedBy: "LICENSE_MGR",
    reason: "Optimización por inactividad prolongada (>180 días)"
  },
  {
    changeId: "CHG-90210",
    timestamp: "2026-08-20 09:10:00",
    username: "PURCHASER_01",
    fullName: "Gabriela Rios",
    previousLicense: "SelfService (0.05 FUE)",
    newLicense: "Core (0.25 FUE)",
    fueDelta: +0.20,
    costSavingsUSD: -24.0,
    changedBy: "BASIS_ADMIN01",
    reason: "Promoción de puesto: Asignación de rol de Compradora Aprobadora"
  },
  {
    changeId: "CHG-89950",
    timestamp: "2026-07-12 14:00:00",
    username: "ABAP_DEV01",
    fullName: "Carlos Mendoza",
    previousLicense: "Advanced (1.0 FUE)",
    newLicense: "Developer (1.0 FUE)",
    fueDelta: 0.00,
    costSavingsUSD: 0.0,
    changedBy: "SAP_SECURITY",
    reason: "Asignación de Developer Key para proyectos ABAP Cloud S/4HANA"
  }
];

// ==========================================================================
// 4. REPORTE ESTÁNDAR SAP: SUIM (User Information System / Audits)
// ==========================================================================
const DEMO_SUIM = {
  rolesSummary: [
    { roleName: "SAP_BR_ABAP_DEVELOPER", description: "ABAP Developer S/4HANA", userCount: 2, riskLevel: "HIGH" },
    { roleName: "SAP_BR_CHIEF_FINANCIAL_OFFICER", description: "Director Financiero (CFO)", userCount: 1, riskLevel: "HIGH" },
    { roleName: "SAP_BR_GL_ACCOUNTANT", description: "Contador General", userCount: 8, riskLevel: "MEDIUM" },
    { roleName: "SAP_BR_PURCHASING_MANAGER", description: "Gerente de Suministros", userCount: 3, riskLevel: "MEDIUM" },
    { roleName: "SAP_BR_PURCHASER", description: "Comprador Funcional", userCount: 12, riskLevel: "LOW" },
    { roleName: "SAP_BR_EMPLOYEE_SELF_SERVICE", description: "Empleado Autoservicio", userCount: 32, riskLevel: "LOW" }
  ],
  sodRisks: [
    {
      riskId: "SOD-FIN-01",
      businessProcess: "Finanzas & Tesorería",
      conflictingRoles: ["SAP_BR_GL_ACCOUNTANT", "SAP_BR_ACCOUNTS_PAYABLE_CLERK"],
      conflictingTCodes: "FB01 (Crear Asiento) + F110 (Ejecutar Pago)",
      affectedUsers: ["CFO_VALDEZ"],
      severity: "CRITICAL"
    },
    {
      riskId: "SOD-MM-02",
      businessProcess: "Cadena de Suministro",
      conflictingRoles: ["SAP_BR_PURCHASING_MANAGER", "SAP_BR_WAREHOUSE_CLERK"],
      conflictingTCodes: "ME21N (Crear Pedido) + MIGO (Entrada Mercancías)",
      affectedUsers: ["SUPPLY_DIR"],
      severity: "HIGH"
    },
    {
      riskId: "SOD-BASIS-03",
      businessProcess: "Seguridad y Administración TI",
      conflictingRoles: ["SAP_BR_ABAP_DEVELOPER", "SAP_BR_SYSTEM_ADMIN"],
      conflictingTCodes: "SE80 (Desarrollo) + SE16N (Modificar Tablas Directas)",
      affectedUsers: ["ABAP_DEV01"],
      severity: "CRITICAL"
    }
  ]
};
