/**
 * ==============================================================================
 * SAP FIORI LAUNCHPAD — GOOGLE APPS SCRIPT BACKEND (Código.gs)
 * Arquitectura: Google Sheets (Base de Datos) + Apps Script (Lógica & Servidor Web)
 * ==============================================================================
 */

// 1. CONFIGURACIÓN: ID de tu Hoja de Cálculo de Google Sheets
// Reemplaza este ID con el de tu Google Sheet creada en Drive (o déjalo vacío si el script está vinculado a la hoja)
const SPREADSHEET_ID = ""; // Opcional si el script está en Extensiones > Apps Script de la misma hoja

function getDatabase() {
  if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== "") {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Función principal para servir la aplicación Web Fiori en el navegador
 */
function doGet(e) {
  // AUTO-INICIALIZACIÓN: Si la base de datos no tiene tablas, se crean automáticamente
  try {
    const ss = getDatabase();
    if (ss && !ss.getSheetByName('TB_SALES_ORDERS')) {
      inicializarBaseDeDatos();
    }
  } catch (err) {
    console.warn("Auto-init warning:", err);
  }

  // Si la petición solicita datos JSON vía API REST
  if (e && e.parameter && e.parameter.action) {
    return handleApiRequest(e.parameter.action, e.parameter);
  }

  // Por defecto: Servir la Interfaz de Usuario SAP Fiori Launchpad
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('SAP Fiori Launchpad — Cloud Edition')
    .setFaviconUrl('https://www.sap.com/favicon.ico')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Manejo de peticiones POST (API REST para Crear / Actualizar registros desde el frontend)
 */
function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents || '{}');
    const action = postData.action;
    const payload = postData.data;

    let result = {};

    switch (action) {
      case 'createSalesOrder':
        result = createSalesOrder(payload);
        break;
      case 'updateStock':
        result = updateWmsStock(payload);
        break;
      case 'createSolManReq':
        result = createSolManReq(payload);
        break;
      default:
        result = { error: 'Acción no reconocida: ' + action };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Router para llamadas API GET
 */
function handleApiRequest(action, params) {
  let data = {};
  switch (action) {
    case 'getDashboardData':
      data = getDashboardData();
      break;
    case 'getSalesOrders':
      data = getSalesOrdersData();
      break;
    case 'getWmsStock':
      data = getWmsStockData();
      break;
    case 'getSolManReq':
      data = getSolManReqData();
      break;
    default:
      data = { error: 'Acción GET desconocida' };
  }

  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ==============================================================================
// 2. INICIALIZADOR AUTOMÁTICO DE BASE DE DATOS (GOOGLE SHEETS)
// Ejecuta esta función una sola vez desde el editor de Apps Script para crear las tablas
// ==============================================================================
function inicializarBaseDeDatos() {
  const ss = getDatabase();

  // Tabla 1: SALES_ORDERS (Pedidos de Venta)
  let sheetSales = ss.getSheetByName('TB_SALES_ORDERS');
  if (!sheetSales) {
    sheetSales = ss.insertSheet('TB_SALES_ORDERS');
    sheetSales.appendRow(['ID_PEDIDO', 'CLIENTE', 'FECHA', 'MONTO_EUR', 'ESTADO', 'ITEMS_CONFIRMADOS', 'DIAS_DEMORA']);
    sheetSales.appendRow(['SO-1001', 'Industrias Alfa S.A.', '2026-10-01', 14200, 'Confirmado', '100%', 0]);
    sheetSales.appendRow(['SO-1002', 'Corporación Lima S.A.C.', '2026-10-02', 20500, 'En Proceso', '88.8%', 0]);
    sheetSales.appendRow(['SO-1003', 'Distribuidora Global', '2026-10-03', 12200, 'Pendiente', '60%', 2]);
    sheetSales.getRange("A1:G1").setBackground("#0854a0").setFontColor("#ffffff").setFontWeight("bold");
  }

  // Tabla 2: WMS_STOCK (Inventario & Torre de Control Multi-Sede)
  let sheetWms = ss.getSheetByName('TB_WMS_STOCK');
  if (!sheetWms) {
    sheetWms = ss.insertSheet('TB_WMS_STOCK');
    sheetWms.appendRow(['COD_MATERIAL', 'DESCRIPCION', 'SEDE', 'CANTIDAD', 'UNIDAD', 'OCUPABILIDAD_PCT', 'ESTADO']);
    sheetWms.appendRow(['MAT-001', 'Cable UTP Cat6A Bobina 305m', 'CD Eucaliptos', 1240, 'ROL', '95.2%', 'Óptimo']);
    sheetWms.appendRow(['MAT-002', 'Switch Cisco Catalyst 9200', 'CD Callao', 85, 'UND', '92.1%', 'Óptimo']);
    sheetWms.appendRow(['MAT-003', 'Bandeja Portacable Ranurada', 'CD Praderas', 350, 'MTR', '88.4%', 'Alerta']);
    sheetWms.getRange("A1:G1").setBackground("#0854a0").setFontColor("#ffffff").setFontWeight("bold");
  }

  // Tabla 3: SOLMAN_REQ (Requerimientos SolMan 7.2)
  let sheetSolman = ss.getSheetByName('TB_SOLMAN_REQ');
  if (!sheetSolman) {
    sheetSolman = ss.insertSheet('TB_SOLMAN_REQ');
    sheetSolman.appendRow(['ID_REQ', 'TITULO', 'MODULO', 'SOLICITANTE', 'PRIORIDAD', 'ESTADO_CHARM', 'SLA']);
    sheetSolman.appendRow(['REQ-701', 'Ampliación OData V4 Almacén', 'MM-IM', 'Carlos Vega', 'Alta', 'En Desarrollo', '99.2%']);
    sheetSolman.appendRow(['REQ-702', 'Validación SUNAT SIRE RCE', 'FI-LOC', 'Rosa Paredes', 'Crítica', 'Pruebas QA', '98.5%']);
    sheetSolman.appendRow(['REQ-703', 'Optimización LX03 Push-Down', 'LE-WM', 'Admin WMS', 'Media', 'Aprobado', '100%']);
    sheetSolman.getRange("A1:G1").setBackground("#0854a0").setFontColor("#ffffff").setFontWeight("bold");
  }

  // Tabla 4: FUE_USUARIOS (Control de Licencias FUE & Roles)
  let sheetFue = ss.getSheetByName('TB_FUE_USUARIOS');
  if (!sheetFue) {
    sheetFue = ss.insertSheet('TB_FUE_USUARIOS');
    sheetFue.appendRow(['USUARIO', 'NOMBRE', 'ROL_PRINCIPAL', 'TIPO_LICENCIA', 'FUE_WEIGHT', 'ESTADO_SUIM']);
    sheetFue.appendRow(['dmoore', 'Donna Moore', 'Z_SD_INCENTIVES_MGR', 'Professional', 1.0, 'Activo']);
    sheetFue.appendRow(['admin', 'Consultor Líder SAP', 'Z_BASIS_ADMIN_ALL', 'Professional', 1.0, 'Activo']);
    sheetFue.appendRow(['wms_user', 'Operador de Montacarga', 'Z_WM_OPERATOR', 'Productivity', 0.2, 'Activo']);
    sheetFue.getRange("A1:F1").setBackground("#0854a0").setFontColor("#ffffff").setFontWeight("bold");
  }

  return "Base de Datos Google Sheets inicializada con éxito.";
}

// ==============================================================================
// 3. FUNCIONES DE LECTURA DE DATOS (Para Frontend & google.script.run)
// ==============================================================================
function getDashboardData() {
  const ss = getDatabase();
  
  // Métricas consolidadas
  return {
    kpis: {
      salesTotalKpi: "46.9 K",
      salesCurrency: "EUR",
      tasksCount: 13,
      timesheetAlertDays: 10,
      fulfillmentKpi: "20.5 K",
      confirmedItemsPct: "88.8%",
      quotationRate: "17.3%",
      businessVolumeKpi: "1.8 M",
      contractFulfillment: { current: "1.8M", total: "3M" }
    },
    orders: getSalesOrdersData(),
    stock: getWmsStockData(),
    requirements: getSolManReqData()
  };
}

function getSalesOrdersData() {
  const ss = getDatabase();
  const sheet = ss.getSheetByName('TB_SALES_ORDERS');
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  const headers = rows.shift();
  return rows.map(r => ({
    id: r[0],
    cliente: r[1],
    fecha: r[2],
    monto: r[3],
    estado: r[4],
    cumplimiento: r[5],
    demora: r[6]
  }));
}

function getWmsStockData() {
  const ss = getDatabase();
  const sheet = ss.getSheetByName('TB_WMS_STOCK');
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  const headers = rows.shift();
  return rows.map(r => ({
    codigo: r[0],
    descripcion: r[1],
    sede: r[2],
    cantidad: r[3],
    unidad: r[4],
    ocupabilidad: r[5],
    estado: r[6]
  }));
}

function getSolManReqData() {
  const ss = getDatabase();
  const sheet = ss.getSheetByName('TB_SOLMAN_REQ');
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  const headers = rows.shift();
  return rows.map(r => ({
    id: r[0],
    titulo: r[1],
    modulo: r[2],
    solicitante: r[3],
    prioridad: r[4],
    estado: r[5],
    sla: r[6]
  }));
}

// ==============================================================================
// 4. FUNCIONES DE ESCRITURA EN GOOGLE SHEETS
// ==============================================================================
function createSalesOrder(order) {
  const ss = getDatabase();
  const sheet = ss.getSheetByName('TB_SALES_ORDERS');
  if (!sheet) throw new Error("La tabla TB_SALES_ORDERS no existe");

  const newId = 'SO-' + (1000 + sheet.getLastRow());
  const fecha = new Date().toISOString().split('T')[0];

  sheet.appendRow([
    newId,
    order.cliente || 'Cliente General',
    fecha,
    Number(order.monto) || 0,
    order.estado || 'Confirmado',
    '100%',
    0
  ]);

  return { success: true, orderId: newId, message: 'Pedido de Venta creado exitosamente en Google Sheets' };
}
