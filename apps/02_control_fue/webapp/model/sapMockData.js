/**
 * SAP User Management & License Cost Simulation Dataset
 * Single SAP HANA Installation (System S4H / Client 100)
 * 5 Sociedades: PE10 (Perú), CL20 (Chile), CO30 (Colombia), MX40 (México), US50 (USA)
 */

(function (root, factory) {
  if (typeof sap !== "undefined" && sap.ui && sap.ui.define) {
    sap.ui.define([], factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.SAPMockData = factory();
  }
}(this, function () {
  "use strict";

  var LICENSE_TYPES = {
    'Developer':       { fue: 1.00, annualCostUSD: 4500, monthlyCostUSD: 375.00, desc: "Desarrollo ABAP, HANA Studio & Extensiones BTP" },
    'Advanced':        { fue: 1.00, annualCostUSD: 3200, monthlyCostUSD: 266.67, desc: "Acceso Completo Enterprise Management S/4HANA" },
    'Core':            { fue: 0.20, annualCostUSD: 800,  monthlyCostUSD: 66.67,  desc: "Usuario Operativo Estándar (MM, SD, FI, PP)" },
    'Self Service':    { fue: 0.05, annualCostUSD: 180,  monthlyCostUSD: 15.00,  desc: "Aprobaciones, Requerimientos & Horas (ESS)" },
    'Indirect Access': { fue: 0.02, annualCostUSD: 50,   monthlyCostUSD: 4.17,   desc: "Acceso Digital / Consumo API B2B / IoT" }
  };

  var SOCIEDADES = [
    { code: "PE10", name: "PE10 - Corporación Perú S.A.C.", country: "Perú 🇵🇪", currency: "PEN / USD", budgetUSD: 120000, contractedFUE: 40 },
    { code: "CL20", name: "CL20 - Corporación Chile SpA", country: "Chile 🇨🇱", currency: "CLP / USD", budgetUSD: 95000, contractedFUE: 30 },
    { code: "CO30", name: "CO30 - Corporación Colombia S.A.S.", country: "Colombia 🇨🇴", currency: "COP / USD", budgetUSD: 85000, contractedFUE: 25 },
    { code: "MX40", name: "MX40 - Corporación México S.A. de C.V.", country: "México 🇲🇽", currency: "MXN / USD", budgetUSD: 110000, contractedFUE: 35 },
    { code: "US50", name: "US50 - Corporación USA Inc.", country: "USA 🇺🇸", currency: "USD", budgetUSD: 140000, contractedFUE: 45 }
  ];

  var INITIAL_USERS = [
    // --- PE10 (Perú) ---
    {
      id: 1, Periodo: "Septiembre 2026", Usuarios: "ADMIN_BASIS_PE", NombreCompleto: "Carlos Alberto Mendoza", Email: "cmendoza@empresa.com",
      Empresa: "PE10 - Corporación Perú S.A.C.", Sociedad: "PE10", Departamento: "TI & BASIS Administration", TipoFue: "Developer", Fue: 1.00,
      EstadoUsuario: "Activo", UserGroup: "BASIS", UltimoLogon: "2026-09-15 08:30", DiasInactivo: 0, RiesgoSOD: "Alto",
      Roles: ["SAP_ALL", "Z_BC_BASIS_ADMIN", "Z_HANA_ADMIN"], RecomendacionIA: "⚠️ Superusuario SAP_ALL asignado", RequiereOptimizacion: false
    },
    {
      id: 2, Periodo: "Septiembre 2026", Usuarios: "CFO_PERU", NombreCompleto: "Rosa María Benavides", Email: "rbenavides@empresa.com",
      Empresa: "PE10 - Corporación Perú S.A.C.", Sociedad: "PE10", Departamento: "Dirección Financiera", TipoFue: "Advanced", Fue: 1.00,
      EstadoUsuario: "Activo", UserGroup: "FIN_MGMT", UltimoLogon: "2026-09-14 17:45", DiasInactivo: 1, RiesgoSOD: "Ninguno",
      Roles: ["Z_FI_CFO_EXECUTIVE", "Z_CO_CONTROLLING_DIR"], RecomendacionIA: "Licencia Óptima", RequiereOptimizacion: false
    },
    {
      id: 3, Periodo: "Septiembre 2026", Usuarios: "JPEREZ_FI", NombreCompleto: "Juan Pérez García", Email: "jperez@empresa.com",
      Empresa: "PE10 - Corporación Perú S.A.C.", Sociedad: "PE10", Departamento: "Contabilidad FI/CO", TipoFue: "Advanced", Fue: 1.00,
      EstadoUsuario: "Inactivo (>90d)", UserGroup: "FIN_GL", UltimoLogon: "2026-05-10 10:15", DiasInactivo: 128, RiesgoSOD: "Ninguno",
      Roles: ["Z_FI_ACCOUNTANT_LEAD"], RecomendacionIA: "💡 Reasignar a Self Service (Inactivo 128d - Ahorro $3,020/año)", RequiereOptimizacion: true
    },
    {
      id: 4, Periodo: "Septiembre 2026", Usuarios: "MRAMOS_MM", NombreCompleto: "Miguel Ramos Flores", Email: "mramos@empresa.com",
      Empresa: "PE10 - Corporación Perú S.A.C.", Sociedad: "PE10", Departamento: "Logística y Almacenes", TipoFue: "Core", Fue: 0.20,
      EstadoUsuario: "Activo", UserGroup: "LOG_MM", UltimoLogon: "2026-09-15 07:50", DiasInactivo: 0, RiesgoSOD: "Ninguno",
      Roles: ["Z_MM_BUYER_OPERATIVE", "Z_WM_STOCK_VIEW"], RecomendacionIA: "Licencia Óptima", RequiereOptimizacion: false
    },
    {
      id: 5, Periodo: "Septiembre 2026", Usuarios: "LFLORES_SD", NombreCompleto: "Lucía Flores Quispe", Email: "lflores@empresa.com",
      Empresa: "PE10 - Corporación Perú S.A.C.", Sociedad: "PE10", Departamento: "Ventas SD", TipoFue: "Core", Fue: 0.20,
      EstadoUsuario: "Activo", UserGroup: "SD_SALES", UltimoLogon: "2026-09-14 16:10", DiasInactivo: 1, RiesgoSOD: "Bajo",
      Roles: ["Z_SD_SALES_REPRESENTATIVE"], RecomendacionIA: "Licencia Óptima", RequiereOptimizacion: false
    },
    {
      id: 6, Periodo: "Septiembre 2026", Usuarios: "AHIDALGO_HR", NombreCompleto: "Ana Hidalgo Velez", Email: "ahidalgo@empresa.com",
      Empresa: "PE10 - Corporación Perú S.A.C.", Sociedad: "PE10", Departamento: "Recursos Humanos", TipoFue: "Self Service", Fue: 0.05,
      EstadoUsuario: "Activo", UserGroup: "HR_ESS", UltimoLogon: "2026-09-12 11:30", DiasInactivo: 3, RiesgoSOD: "Ninguno",
      Roles: ["Z_HR_ESS_EMPLOYEE"], RecomendacionIA: "Licencia Óptima", RequiereOptimizacion: false
    },
    {
      id: 7, Periodo: "Septiembre 2026", Usuarios: "DEVELOPER_ABAP01", NombreCompleto: "Renzo Castro Huamán", Email: "rcastro@empresa.com",
      Empresa: "PE10 - Corporación Perú S.A.C.", Sociedad: "PE10", Departamento: "TI & ABAP Factory", TipoFue: "Developer", Fue: 1.00,
      EstadoUsuario: "Activo", UserGroup: "DEV_TEAM", UltimoLogon: "2026-09-15 09:00", DiasInactivo: 0, RiesgoSOD: "Medio",
      Roles: ["Z_BC_ABAP_DEVELOPER", "Z_BC_DEBUG_CHANGE"], RecomendacionIA: "Licencia Óptima", RequiereOptimizacion: false
    },
    {
      id: 8, Periodo: "Septiembre 2026", Usuarios: "SYSTEM_SUNAT_API", NombreCompleto: "Interface SUNAT TCURR", Email: "api-peru@empresa.com",
      Empresa: "PE10 - Corporación Perú S.A.C.", Sociedad: "PE10", Departamento: "Integraciones B2B", TipoFue: "Indirect Access", Fue: 0.02,
      EstadoUsuario: "Activo", UserGroup: "BATCH_SYS", UltimoLogon: "2026-09-15 06:00", DiasInactivo: 0, RiesgoSOD: "Ninguno",
      Roles: ["Z_API_SUNAT_INTEGRATION"], RecomendacionIA: "Licencia Óptima", RequiereOptimizacion: false
    },
    {
      id: 9, Periodo: "Septiembre 2026", Usuarios: "VCASTILLO_PE", NombreCompleto: "Víctor Castillo Luna", Email: "vcastillo@empresa.com",
      Empresa: "PE10 - Corporación Perú S.A.C.", Sociedad: "PE10", Departamento: "Compras & Proveedores", TipoFue: "Advanced", Fue: 1.00,
      EstadoUsuario: "Bloqueado", UserGroup: "LOG_MM", UltimoLogon: "2026-06-01 14:00", DiasInactivo: 106, RiesgoSOD: "Alto",
      Roles: ["Z_MM_PURCHASING_MANAGER", "Z_FI_AP_PAYMENTS"], RecomendacionIA: "⚠️ Usuario Bloqueado: Liberar Licencia Advanced ($3,200/año)", RequiereOptimizacion: true
    },
    {
      id: 10, Periodo: "Septiembre 2026", Usuarios: "KRODRIGUEZ_PE", NombreCompleto: "Karen Rodríguez Silva", Email: "krodriguez@empresa.com",
      Empresa: "PE10 - Corporación Perú S.A.C.", Sociedad: "PE10", Departamento: "Tesorería", TipoFue: "Core", Fue: 0.20,
      EstadoUsuario: "Activo", UserGroup: "FIN_GL", UltimoLogon: "2026-09-14 15:20", DiasInactivo: 1, RiesgoSOD: "Ninguno",
      Roles: ["Z_FI_TREASURY_CLERK"], RecomendacionIA: "Licencia Óptima", RequiereOptimizacion: false
    },

    // --- CL20 (Chile) ---
    {
      id: 11, Periodo: "Septiembre 2026", Usuarios: "GERENTE_CL", NombreCompleto: "Gonzalo Valenzuela Tapia", Email: "gvalenzuela@empresa.com",
      Empresa: "CL20 - Corporación Chile SpA", Sociedad: "CL20", Departamento: "Gerencia General", TipoFue: "Advanced", Fue: 1.00,
      EstadoUsuario: "Activo", UserGroup: "SUPER", UltimoLogon: "2026-09-14 18:00", DiasInactivo: 1, RiesgoSOD: "Ninguno",
      Roles: ["Z_CL_EXECUTIVE_ALL"], RecomendacionIA: "Licencia Óptima", RequiereOptimizacion: false
    },
    {
      id: 12, Periodo: "Septiembre 2026", Usuarios: "LSILVA_FIN", NombreCompleto: "Loreto Silva Morales", Email: "lsilva@empresa.com",
      Empresa: "CL20 - Corporación Chile SpA", Sociedad: "CL20", Departamento: "Finanzas & Impuestos SII", TipoFue: "Advanced", Fue: 1.00,
      EstadoUsuario: "Activo", UserGroup: "FIN_GL", UltimoLogon: "2026-09-15 08:15", DiasInactivo: 0, RiesgoSOD: "Medio",
      Roles: ["Z_FI_CHILE_TAX_LEAD", "Z_FI_AP_CLERK"], RecomendacionIA: "Licencia Óptima", RequiereOptimizacion: false
    },
    {
      id: 13, Periodo: "Septiembre 2026", Usuarios: "FMONTT_LOG", NombreCompleto: "Felipe Montt Larraín", Email: "fmontt@empresa.com",
      Empresa: "CL20 - Corporación Chile SpA", Sociedad: "CL20", Departamento: "Cadena de Suministro", TipoFue: "Advanced", Fue: 1.00,
      EstadoUsuario: "Inactivo (>90d)", UserGroup: "LOG_MM", UltimoLogon: "2026-04-12 09:30", DiasInactivo: 156, RiesgoSOD: "Ninguno",
      Roles: ["Z_MM_SUPPLY_CHAIN_MGR"], RecomendacionIA: "💡 Reasignar a Self Service (Inactivo 156d - Ahorro $3,020/año)", RequiereOptimizacion: true
    },
    {
      id: 14, Periodo: "Septiembre 2026", Usuarios: "CSEPULVEDA_SD", NombreCompleto: "Claudia Sepúlveda Rojas", Email: "csepulveda@empresa.com",
      Empresa: "CL20 - Corporación Chile SpA", Sociedad: "CL20", Departamento: "Ventas & Facturación", TipoFue: "Core", Fue: 0.20,
      EstadoUsuario: "Activo", UserGroup: "SD_SALES", UltimoLogon: "2026-09-15 08:50", DiasInactivo: 0, RiesgoSOD: "Ninguno",
      Roles: ["Z_SD_SALES_CLERK_CL"], RecomendacionIA: "Licencia Óptima", RequiereOptimizacion: false
    },
    {
      id: 15, Periodo: "Septiembre 2026", Usuarios: "PBRAVO_WM", NombreCompleto: "Patricio Bravo Muñoz", Email: "pbravo@empresa.com",
      Empresa: "CL20 - Corporación Chile SpA", Sociedad: "CL20", Departamento: "Almacén Santiago", TipoFue: "Core", Fue: 0.20,
      EstadoUsuario: "Activo", UserGroup: "LOG_WM", UltimoLogon: "2026-09-14 14:00", DiasInactivo: 1, RiesgoSOD: "Ninguno",
      Roles: ["Z_WM_OPERATOR_CL"], RecomendacionIA: "Licencia Óptima", RequiereOptimizacion: false
    },
    {
      id: 16, Periodo: "Septiembre 2026", Usuarios: "MCONTRERAS_HR", NombreCompleto: "Marcelo Contreras Pinto", Email: "mcontreras@empresa.com",
      Empresa: "CL20 - Corporación Chile SpA", Sociedad: "CL20", Departamento: "Recursos Humanos", TipoFue: "Self Service", Fue: 0.05,
      EstadoUsuario: "Activo", UserGroup: "HR_ESS", UltimoLogon: "2026-09-10 11:00", DiasInactivo: 5, RiesgoSOD: "Ninguno",
      Roles: ["Z_HR_ESS_EMPLOYEE"], RecomendacionIA: "Licencia Óptima", RequiereOptimizacion: false
    },
    {
      id: 17, Periodo: "Septiembre 2026", Usuarios: "DEV_FIORI_CL", NombreCompleto: "Sebastián Reyes Vera", Email: "sreyes@empresa.com",
      Empresa: "CL20 - Corporación Chile SpA", Sociedad: "CL20", Departamento: "TI & Fiori Apps", TipoFue: "Developer", Fue: 1.00,
      EstadoUsuario: "Activo", UserGroup: "DEV_TEAM", UltimoLogon: "2026-09-15 08:40", DiasInactivo: 0, RiesgoSOD: "Bajo",
      Roles: ["Z_BC_FIORI_DEVELOPER"], RecomendacionIA: "Licencia Óptima", RequiereOptimizacion: false
    },
    {
      id: 18, Periodo: "Septiembre 2026", Usuarios: "SYSTEM_SII_CL", NombreCompleto: "Interface SII Boletas CL", Email: "sii-chile@empresa.com",
      Empresa: "CL20 - Corporación Chile SpA", Sociedad: "CL20", Departamento: "Integraciones B2B", TipoFue: "Indirect Access", Fue: 0.02,
      EstadoUsuario: "Activo", UserGroup: "BATCH_SYS", UltimoLogon: "2026-09-15 05:30", DiasInactivo: 0, RiesgoSOD: "Ninguno",
      Roles: ["Z_API_SII_CHILE"], RecomendacionIA: "Licencia Óptima", RequiereOptimizacion: false
    },

    // --- CO30 (Colombia) ---
    {
      id: 19, Periodo: "Septiembre 2026", Usuarios: "DIRECTOR_CO", NombreCompleto: "Gabriel José Restrepo", Email: "grestrepo@empresa.com",
      Empresa: "CO30 - Corporación Colombia S.A.S.", Sociedad: "CO30", Departamento: "Dirección Operativa", TipoFue: "Advanced", Fue: 1.00,
      EstadoUsuario: "Activo", UserGroup: "SUPER", UltimoLogon: "2026-09-14 16:30", DiasInactivo: 1, RiesgoSOD: "Ninguno",
      Roles: ["Z_CO_DIRECTOR_EXEC"], RecomendacionIA: "Licencia Óptima", RequiereOptimizacion: false
    },
    {
      id: 20, Periodo: "Septiembre 2026", Usuarios: "AGOMEZ_FI_CO", NombreCompleto: "Alejandra Gómez Osorio", Email: "agomez@empresa.com",
      Empresa: "CO30 - Corporación Colombia S.A.S.", Sociedad: "CO30", Departamento: "Contabilidad & Impuestos DIAN", TipoFue: "Advanced", Fue: 1.00,
      EstadoUsuario: "Activo", UserGroup: "FIN_GL", UltimoLogon: "2026-09-15 08:25", DiasInactivo: 0, RiesgoSOD: "Alto",
      Roles: ["Z_FI_ACCOUNTING_MGR", "Z_FI_PAYMENTS_RELEASE"], RecomendacionIA: "⚠️ Conflicto SOD: Crea proveedores y aprueba pagos", RequiereOptimizacion: false
    },
    {
      id: 21, Periodo: "Septiembre 2026", Usuarios: "DOSPINA_MM", NombreCompleto: "Diego Ospina Morales", Email: "dospina@empresa.com",
      Empresa: "CO30 - Corporación Colombia S.A.S.", Sociedad: "CO30", Departamento: "Compras & Inventarios", TipoFue: "Advanced", Fue: 1.00,
      EstadoUsuario: "Inactivo (>90d)", UserGroup: "LOG_MM", UltimoLogon: "2026-03-20 11:20", DiasInactivo: 179, RiesgoSOD: "Ninguno",
      Roles: ["Z_MM_PURCHASING_LEAD"], RecomendacionIA: "💡 Reasignar a Self Service (Inactivo 179d - Ahorro $3,020/año)", RequiereOptimizacion: true
    },
    {
      id: 22, Periodo: "Septiembre 2026", Usuarios: "NVARGAS_SD", NombreCompleto: "Natalia Vargas Jaramillo", Email: "nvargas@empresa.com",
      Empresa: "CO30 - Corporación Colombia S.A.S.", Sociedad: "CO30", Departamento: "Comercial Bogotá", TipoFue: "Core", Fue: 0.20,
      EstadoUsuario: "Activo", UserGroup: "SD_SALES", UltimoLogon: "2026-09-15 07:40", DiasInactivo: 0, RiesgoSOD: "Ninguno",
      Roles: ["Z_SD_SALES_REP_CO"], RecomendacionIA: "Licencia Óptima", RequiereOptimizacion: false
    },
    {
      id: 23, Periodo: "Septiembre 2026", Usuarios: "JSUAREZ_WM", NombreCompleto: "Jorge Suárez Bermúdez", Email: "jsuarez@empresa.com",
      Empresa: "CO30 - Corporación Colombia S.A.S.", Sociedad: "CO30", Departamento: "Bodega Medellín", TipoFue: "Core", Fue: 0.20,
      EstadoUsuario: "Activo", UserGroup: "LOG_WM", UltimoLogon: "2026-09-14 13:10", DiasInactivo: 1, RiesgoSOD: "Ninguno",
      Roles: ["Z_WM_CLERK_CO"], RecomendacionIA: "Licencia Óptima", RequiereOptimizacion: false
    },
    {
      id: 24, Periodo: "Septiembre 2026", Usuarios: "SYSTEM_DIAN_CO", NombreCompleto: "Interface DIAN Factura Elec", Email: "dian-colombia@empresa.com",
      Empresa: "CO30 - Corporación Colombia S.A.S.", Sociedad: "CO30", Departamento: "Integraciones B2B", TipoFue: "Indirect Access", Fue: 0.02,
      EstadoUsuario: "Activo", UserGroup: "BATCH_SYS", UltimoLogon: "2026-09-15 04:00", DiasInactivo: 0, RiesgoSOD: "Ninguno",
      Roles: ["Z_API_DIAN_ELECTRONIC"], RecomendacionIA: "Licencia Óptima", RequiereOptimizacion: false
    },

    // --- MX40 (México) ---
    {
      id: 25, Periodo: "Septiembre 2026", Usuarios: "VP_MEXICO", NombreCompleto: "Alejandro Villaseñor Garza", Email: "avillasenor@empresa.com",
      Empresa: "MX40 - Corporación México S.A. de C.V.", Sociedad: "MX40", Departamento: "Dirección México", TipoFue: "Advanced", Fue: 1.00,
      EstadoUsuario: "Activo", UserGroup: "SUPER", UltimoLogon: "2026-09-14 19:10", DiasInactivo: 1, RiesgoSOD: "Ninguno",
      Roles: ["Z_MX_EXECUTIVE_LEAD"], RecomendacionIA: "Licencia Óptima", RequiereOptimizacion: false
    },
    {
      id: 26, Periodo: "Septiembre 2026", Usuarios: "MARCHUNDIA_FI", NombreCompleto: "Mariana Archundia Ramos", Email: "marchundia@empresa.com",
      Empresa: "MX40 - Corporación México S.A. de C.V.", Sociedad: "MX40", Departamento: "Contabilidad & SAT CFDI", TipoFue: "Advanced", Fue: 1.00,
      EstadoUsuario: "Activo", UserGroup: "FIN_GL", UltimoLogon: "2026-09-15 08:05", DiasInactivo: 0, RiesgoSOD: "Bajo",
      Roles: ["Z_FI_MEXICO_SAT_LEAD"], RecomendacionIA: "Licencia Óptima", RequiereOptimizacion: false
    },
    {
      id: 27, Periodo: "Septiembre 2026", Usuarios: "RHERNANDEZ_MM", NombreCompleto: "Roberto Hernández Trejo", Email: "rhernandez@empresa.com",
      Empresa: "MX40 - Corporación México S.A. de C.V.", Sociedad: "MX40", Departamento: "Abastecimiento CDMX", TipoFue: "Advanced", Fue: 1.00,
      EstadoUsuario: "Bloqueado", UserGroup: "LOG_MM", UltimoLogon: "2026-05-15 11:00", DiasInactivo: 123, RiesgoSOD: "Ninguno",
      Roles: ["Z_MM_PURCHASING_MX"], RecomendacionIA: "⚠️ Usuario Bloqueado: Liberar Licencia Advanced ($3,200/año)", RequiereOptimizacion: true
    },
    {
      id: 28, Periodo: "Septiembre 2026", Usuarios: "SNAVARRO_SD", NombreCompleto: "Sofia Navarro Domínguez", Email: "snavarro@empresa.com",
      Empresa: "MX40 - Corporación México S.A. de C.V.", Sociedad: "MX40", Departamento: "Ventas Monterrey", TipoFue: "Core", Fue: 0.20,
      EstadoUsuario: "Activo", UserGroup: "SD_SALES", UltimoLogon: "2026-09-15 08:35", DiasInactivo: 0, RiesgoSOD: "Ninguno",
      Roles: ["Z_SD_SALES_EXPERT_MX"], RecomendacionIA: "Licencia Óptima", RequiereOptimizacion: false
    },
    {
      id: 29, Periodo: "Septiembre 2026", Usuarios: "JALVAREZ_WM", NombreCompleto: "José Luis Álvarez Ortega", Email: "jalvarez@empresa.com",
      Empresa: "MX40 - Corporación México S.A. de C.V.", Sociedad: "MX40", Departamento: "Cedis Toluca", TipoFue: "Core", Fue: 0.20,
      EstadoUsuario: "Activo", UserGroup: "LOG_WM", UltimoLogon: "2026-09-14 15:00", DiasInactivo: 1, RiesgoSOD: "Ninguno",
      Roles: ["Z_WM_SUPERVISOR_MX"], RecomendacionIA: "Licencia Óptima", RequiereOptimizacion: false
    },
    {
      id: 30, Periodo: "Septiembre 2026", Usuarios: "DEV_BASIS_MX", NombreCompleto: "Fernando Morales Ibarra", Email: "fmorales@empresa.com",
      Empresa: "MX40 - Corporación México S.A. de C.V.", Sociedad: "MX40", Departamento: "TI Systems", TipoFue: "Developer", Fue: 1.00,
      EstadoUsuario: "Activo", UserGroup: "BASIS", UltimoLogon: "2026-09-15 08:45", DiasInactivo: 0, RiesgoSOD: "Alto",
      Roles: ["SAP_ALL", "Z_BC_BASIS_MX"], RecomendacionIA: "⚠️ Superusuario SAP_ALL asignado", RequiereOptimizacion: false
    },
    {
      id: 31, Periodo: "Septiembre 2026", Usuarios: "SYSTEM_SAT_MX", NombreCompleto: "Interface SAT Timbrado CFDI", Email: "sat-mexico@empresa.com",
      Empresa: "MX40 - Corporación México S.A. de C.V.", Sociedad: "MX40", Departamento: "Integraciones B2B", TipoFue: "Indirect Access", Fue: 0.02,
      EstadoUsuario: "Activo", UserGroup: "BATCH_SYS", UltimoLogon: "2026-09-15 06:15", DiasInactivo: 0, RiesgoSOD: "Ninguno",
      Roles: ["Z_API_SAT_TIMBRADO"], RecomendacionIA: "Licencia Óptima", RequiereOptimizacion: false
    },

    // --- US50 (USA) ---
    {
      id: 32, Periodo: "Septiembre 2026", Usuarios: "PRESIDENT_US", NombreCompleto: "David K. Miller", Email: "dmiller@empresa.com",
      Empresa: "US50 - Corporación USA Inc.", Sociedad: "US50", Departamento: "Corporate Executive", TipoFue: "Advanced", Fue: 1.00,
      EstadoUsuario: "Activo", UserGroup: "SUPER", UltimoLogon: "2026-09-14 17:00", DiasInactivo: 1, RiesgoSOD: "Ninguno",
      Roles: ["Z_US_CORPORATE_EXEC"], RecomendacionIA: "Licencia Óptima", RequiereOptimizacion: false
    },
    {
      id: 33, Periodo: "Septiembre 2026", Usuarios: "SMITH_FIN_US", NombreCompleto: "Jennifer Smith Taylor", Email: "jsmith@empresa.com",
      Empresa: "US50 - Corporación USA Inc.", Sociedad: "US50", Departamento: "US Finance & US GAAP", TipoFue: "Advanced", Fue: 1.00,
      EstadoUsuario: "Activo", UserGroup: "FIN_GL", UltimoLogon: "2026-09-15 08:10", DiasInactivo: 0, RiesgoSOD: "Ninguno",
      Roles: ["Z_FI_US_CONTROLLER"], RecomendacionIA: "Licencia Óptima", RequiereOptimizacion: false
    },
    {
      id: 34, Periodo: "Septiembre 2026", Usuarios: "RJOHNSON_LOG", NombreCompleto: "Robert Johnson Davis", Email: "rjohnson@empresa.com",
      Empresa: "US50 - Corporación USA Inc.", Sociedad: "US50", Departamento: "Miami Logistics Hub", TipoFue: "Advanced", Fue: 1.00,
      EstadoUsuario: "Inactivo (>90d)", UserGroup: "LOG_MM", UltimoLogon: "2026-04-05 15:30", DiasInactivo: 163, RiesgoSOD: "Ninguno",
      Roles: ["Z_MM_US_LOGISTICS_DIR"], RecomendacionIA: "💡 Reasignar a Self Service (Inactivo 163d - Ahorro $3,020/año)", RequiereOptimizacion: true
    },
    {
      id: 35, Periodo: "Septiembre 2026", Usuarios: "EWILLIAMS_SD", NombreCompleto: "Emily Williams Clark", Email: "ewilliams@empresa.com",
      Empresa: "US50 - Corporación USA Inc.", Sociedad: "US50", Departamento: "US Commercial Division", TipoFue: "Core", Fue: 0.20,
      EstadoUsuario: "Activo", UserGroup: "SD_SALES", UltimoLogon: "2026-09-15 08:20", DiasInactivo: 0, RiesgoSOD: "Ninguno",
      Roles: ["Z_SD_US_SALES_REP"], RecomendacionIA: "Licencia Óptima", RequiereOptimizacion: false
    },
    {
      id: 36, Periodo: "Septiembre 2026", Usuarios: "DEV_BTPS4_US", NombreCompleto: "Andrew B. Brown", Email: "abrown@empresa.com",
      Empresa: "US50 - Corporación USA Inc.", Sociedad: "US50", Departamento: "BTP & Cloud Engineering", TipoFue: "Developer", Fue: 1.00,
      EstadoUsuario: "Activo", UserGroup: "DEV_TEAM", UltimoLogon: "2026-09-15 08:55", DiasInactivo: 0, RiesgoSOD: "Medio",
      Roles: ["Z_BC_BTP_DEVELOPER_LEAD"], RecomendacionIA: "Licencia Óptima", RequiereOptimizacion: false
    },
    {
      id: 37, Periodo: "Septiembre 2026", Usuarios: "SYSTEM_FEDEX_US", NombreCompleto: "Interface FedEx Logistics API", Email: "fedex-api@empresa.com",
      Empresa: "US50 - Corporación USA Inc.", Sociedad: "US50", Departamento: "Integraciones B2B", TipoFue: "Indirect Access", Fue: 0.02,
      EstadoUsuario: "Activo", UserGroup: "BATCH_SYS", UltimoLogon: "2026-09-15 03:00", DiasInactivo: 0, RiesgoSOD: "Ninguno",
      Roles: ["Z_API_FEDEX_TRACKING"], RecomendacionIA: "Licencia Óptima", RequiereOptimizacion: false
    },
    {
      id: 38, Periodo: "Septiembre 2026", Usuarios: "HBARKER_US", NombreCompleto: "Hannah Barker", Email: "hbarker@empresa.com",
      Empresa: "US50 - Corporación USA Inc.", Sociedad: "US50", Departamento: "Human Resources US", TipoFue: "Self Service", Fue: 0.05,
      EstadoUsuario: "Activo", UserGroup: "HR_ESS", UltimoLogon: "2026-09-11 10:00", DiasInactivo: 4, RiesgoSOD: "Ninguno",
      Roles: ["Z_HR_ESS_EMPLOYEE"], RecomendacionIA: "Licencia Óptima", RequiereOptimizacion: false
    }
  ];

  return {
    LICENSE_TYPES: LICENSE_TYPES,
    SOCIEDADES: SOCIEDADES,
    INITIAL_USERS: INITIAL_USERS
  };

}));
