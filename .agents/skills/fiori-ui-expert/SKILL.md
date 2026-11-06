---
name: fiori-ui-expert
description: >-
  Diseño e ingeniería de frontend empresarial para SAP Fiori Elements y SAPUI5 moderno (ES6+, MVC).
  Utiliza esta skill cuando necesites configurar Floorplans de Fiori Elements (List Report, Object Page, FCL),
  desarrollar aplicaciones SAPUI5 Freestyle modulares, crear Controller Extensions o configurar manifest.json,
  modelos OData V4, enrutamiento, temas Horizon, Shell Bar, sap.tnt.SideNavigation e infografía de KPIs unificada.
---

# Skill: Fiori-UI-Expert (Fiori Elements, SAPUI5 Moderno & Fiori Horizon UI Standard)

Esta skill define la arquitectura, componentes, patrones visuales y estándares corporativos para el desarrollo y diseño de interfaces SAP Fiori Horizon integradas con servicios RAP OData V4 bajo principios Clean Core.

---

## 1. Estándar de Barra Lateral Izquierda (`sap.tnt.SideNavigation`)

Toda aplicación o sub-aplicación del portal debe implementar la barra de navegación lateral siguiendo las directrices exactas de **SAP Fiori Horizon `sap.tnt.SideNavigation`**:

### Especificaciones de Diseño
* **Fondo y Dimensiones:** Blanco puro (`#ffffff`), borde derecho sutil (`1px solid #eaedf1`), ancho estándar de `230px` (o `240px`).
* **Tipografía:** `'72'`, `'Inter'`, `-apple-system`, `13px` a `13.5px`, peso normal 500.
* **Elemento Activo (Selected State):**
  Recuadro azul característico de SAP Horizon (sin fondo sólido):
  ```css
  .nav-item.active, .sap-nav-item.active, .menu-item.active {
    border: 1.5px solid #0a6ed1 !important;
    border-radius: 6px;
    background-color: #ffffff !important;
    color: #0a6ed1 !important;
    font-weight: 600;
    box-shadow: 0 1px 3px rgba(10, 110, 209, 0.08);
  }
  .nav-item.active .nav-icon {
    color: #0a6ed1 !important;
  }
  ```
* **Iconografía:**
  * Uso exclusivo de iconos outline corporativos (SAP Icon Pool o FontAwesome 6 outline: `#475569` / `#334155`).
  * **Prohibido terminantemente** el uso de emojis informales (`📊`, `📐`, `👥`, `📜`, etc.) en menús o botones.
* **Agrupadores Expandibles:**
  * Indicador vertical y chevron alineados a la derecha (`|  >`).
  * Al desplegarse, el chevron rota suavemente 90° hacia abajo (`v`).
  ```html
  <li class="nav-group-header" onclick="App.toggleGroup('grp-id', this)">
    <div class="group-left">
      <i class="fas fa-boxes-stacked nav-icon"></i>
      <span class="nav-text">Operaciones</span>
    </div>
    <div class="group-right">
      <span class="group-pipe">|</span>
      <i class="fas fa-chevron-right group-chevron rotated"></i>
    </div>
  </li>
  ```
* **Sub-items Anidados:** Sangría izquierda de `28px` a `32px` con tamaño de fuente `12.5px`.
* **Pie Fijo Inferior (`sidebar-fixed-bottom`):**
  * Pinned al fondo mediante separador `border-top: 1px solid #eaedf1`.
  * Contiene el acceso a **Administración / Configuración**.

---

## 2. Franja Superior de 4 Tarjetas KPI (Infografía Cromática Unificada)

En todos los tableros analíticos y vistas principales, la franja de tarjetas KPI debe implementar el patrón estándar de 4 métricas con código de color funcional:

```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ KPI 1 (Naranja) │ │ KPI 2 (Slate)   │ │ KPI 3 (Verde)   │ │ KPI 4 (Naranja) │
│  Pendientes /   │ │ Total Volumen / │ │ Cumplimiento /  │ │ Alertas /       │
│  En Proceso     │ │ Base Instalada  │ │ Eficiencia %    │ │ Críticos        │
│    Ej: 14 / 28  │ │   Ej: 1,450     │ │     Ej: 78%     │ │    Ej: 3 / 4    │
└─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘
```

1. **KPI 1 (Naranja / Coral `#e06a3b`):** Tareas pendientes, OTs abiertas, órdenes en verificación.
2. **KPI 2 (Dark Slate `#1e293b`):** Volumen global de datos, ubicaciones totales, stock, usuarios registrados.
3. **KPI 3 (Verde Positivo `#107e3e`):** Porcentaje de ocupabilidad, calidad de pruebas, SLA o cumplimiento.
4. **KPI 4 (Naranja / Coral `#e06a3b`):** Lotes por vencer, incidentes abiertos, excepciones de control.

### Estilo de Tarjetas Fiori Horizon
```css
.kpi-card, .sap-kpi-card {
  background: #ffffff;
  border: 1px solid #eaedf1;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.kpi-value-orange { color: #e06a3b !important; font-size: 28px; font-weight: 800; }
.kpi-value-slate  { color: #1e293b !important; font-size: 28px; font-weight: 800; }
.kpi-value-green  { color: #107e3e !important; font-size: 28px; font-weight: 800; }
```

---

## 3. Cabecera Corporativa (Shell Bar) y Navegación

* **Shell Bar (`#1d2d3e`):**
  * Logo oficial de SAP (`sap-logo.svg`).
  * Botón interactivo `< Home` (`.modal-back-btn` o `.shell-nav-home-btn`) con llamada a la función `goHome()`.
  * Título oficial de la solución en mayúsculas sobrias (`SAP SD - PEDIDOS DE VENTA FIORI`).
  * Buscador global con placeholder `Buscar en Launchpad...`.
  * Botones de acción derecha: Asistente SAP Joule AI, Campana con badge contador de notificaciones, Engranaje de configuración y Avatar circular de usuario (DM).

### Patrón Universal `goHome()`
```javascript
function goHome() {
  if (window.parent && window.parent.PortalApp && typeof window.parent.PortalApp.closeModal === 'function') {
    window.parent.PortalApp.closeModal();
  } else {
    window.location.href = '../../index.html'; // Retorno al Launchpad raíz
  }
}

// Ocultar cabecera propia cuando la aplicación corre dentro del modal iframe del portal
if (window.self !== window.top) {
  document.body.classList.add('in-iframe');
}
```

---

## 4. Configuración de `manifest.json` para OData V4

```json
{
  "_version": "1.49.0",
  "sap.app": {
    "id": "com.empresa.gestionordenes",
    "type": "application",
    "i18n": "i18n/i18n.properties",
    "title": "{{appTitle}}",
    "description": "{{appDescription}}",
    "dataSources": {
      "mainService": {
        "uri": "/sap/opu/odata4/sap/zui_gestion_orden_o4/srvd/sap/zui_gestion_orden_o4_ui/0001/",
        "type": "OData",
        "settings": {
          "odataVersion": "4.0"
        }
      }
    }
  },
  "sap.ui5": {
    "models": {
      "i18n": {
        "type": "sap.ui.model.resource.ResourceModel",
        "settings": {
          "bundleName": "com.empresa.gestionordenes.i18n.i18n"
        }
      },
      "": {
        "dataSource": "mainService",
        "preload": true,
        "settings": {
          "synchronizationMode": "None",
          "operationMode": "Server",
          "autoExpandSelect": true,
          "earlyRequests": true
        }
      }
    },
    "routing": {
      "config": {
        "routerClass": "sap.f.routing.Router",
        "viewType": "XML",
        "viewPath": "com.empresa.gestionordenes.view",
        "controlId": "appRoot",
        "controlAggregation": "pages",
        "async": true
      },
      "routes": [
        {
          "name": "RouteList",
          "pattern": ":?query:",
          "target": "TargetList"
        },
        {
          "name": "RouteDetail",
          "pattern": "Orden({key}):?query:",
          "target": "TargetDetail"
        }
      ],
      "targets": {
        "TargetList": {
          "viewName": "ListReport",
          "viewId": "ListReport"
        },
        "TargetDetail": {
          "viewName": "ObjectPage",
          "viewId": "ObjectPage"
        }
      }
    }
  }
}
```

---

## 5. Selección de Floorplans: Fiori Elements vs. SAPUI5 Freestyle

| Requerimiento | Enfoque Recomendado | Justificación |
| :--- | :--- | :--- |
| CRUD transaccional estándar (Listas, Filtros, Edición Draft) | **Fiori Elements (List Report + Object Page)** | Impulsado 100% por anotaciones OData V4 / MDE. Menor TCO y mantenimiento cero de vistas. |
| Dashboard ejecutivo con analítica personalizada y KPI tiles | **Fiori Elements (Overview Page) o Freestyle** | Si requiere integración con mapas o librerías externas (Leaflet, D3, Chart.js), usar Freestyle. |
| Flujos de aprobación masiva con wizard o componentes visuales | **Freestyle o Fiori Elements + Controller Extension** | Mantener el piso estándar y extender únicamente la acción o sección particular. |

---

## 6. Integración Frontend con Backend en la Nube (Render & Supabase)

1. **Servicio Centralizado `ApiService.js`:**
   - Todas las llamadas REST/OData se direccionan de forma relativa a `/api/` (ej. `/api/gr`, `/api/gi`, `/api/inventory-counts`, `/api/transfer-orders`).
   - Esto garantiza portabilidad total: funciona de forma idéntica en localhost (`http://localhost:8080`), en red local (`http://192.168.x.x:8080`) y en la nube pública (`https://sapcloudservices.onrender.com`).
2. **Actualización Reactiva de UI:**
   - Tras ejecutar una acción (como confirmar entrada de mercancías, iniciar OT o registrar conteo de inventario), refrescar inmediatamente el modelo local (`sap.ui.model.json.JSONModel`) o consultar nuevamente el endpoint correspondiente.
3. **Manejo de Respuestas Enriquecidas:**
   - La API pública retorna colecciones estándar `{ success: true, total: N, data: [...] }`. Los controladores de vistas deben vincular `data` directamente a tablas (`sap.m.Table` o `sap.ui.table.Table`) y utilizar `total` en los contadores de pestaña (`sap.m.IconTabFilter` count).

---

## 7. Regla Crítica de Parseo en SAPUI5 XMLViews (Prohibición de Raw HTML)

> [!CAUTION]
> **PROHIBICIÓN ESTRICTA DE RAW HTML EN VISTAS Y FRAGMENTOS SAPUI5:**
> Nunca colocar etiquetas HTML crudas (`<div>`, `<span>`, `<p>`, `<a>`, `<table>`) dentro de un `<mvc:View>` o `<core:FragmentDefinition>` a menos que se declare explícitamente el namespace de XHTML (`xmlns:xhtml="http://www.w3.org/1999/xhtml"` y `<xhtml:div>`).
> 
> Si se escribe `<div>` con el namespace por defecto `xmlns="sap.m"`, el cargador de módulos de SAPUI5 intentará resolver `sap/m/div.js`, lo que provocará un error fatal en tiempo de ejecución:
> ```
> Error: failed to load 'sap/m/div.js' from ... /sap/m/div.js: 404 Not Found
> ```
> 
> **Solución Estándar:**
> - Reemplazar `<div class="...">` por `<VBox class="...">` o `<HBox class="...">`.
> - Reemplazar `<span class="...">Texto</span>` por `<Text class="..." text="Texto"/>` o `<Label class="..." text="Texto"/>`.
> - Si se requiere inyectar HTML complejo no estructurado, utilizar el control nativo `<core:HTML content="&lt;div&gt;...&lt;/div&gt;"/>`.

---

## 8. Caso de Referencia: Portal Proveedores Contabilidad & 3-Way Match (`apps/07_portal_proveedores_contabilidad`)

Esta sub-aplicación implementa el estándar completo Fiori Horizon para back-office financiero:

### 8.1. Matriz de 7 Vistas Modulares & Enrutamiento
1. **`Dashboard` (`view/Dashboard.view.xml`):**
   - Franja superior de 4 KPIs Fiori Horizon con controles `sap.m.HBox` / `sap.m.VBox` puros:
     * KPI 1 (Naranja `#e06a3b`): Facturas pendientes de contabilización.
     * KPI 2 (Slate `#1e293b`): Gasto total procesado en USD.
     * KPI 3 (Verde `#107e3e`): Efectividad 3-Way Match (% de coincidencia automática).
     * KPI 4 (Naranja `#e06a3b`): Comprobantes observados SUNAT / desvíos de precio.
   - Gráficos de comparativa mensual de gasto y distribución de estados en tarjeta Horizon.
2. **`InvoicesMatch` (`view/InvoicesMatch.view.xml`):**
   - Bandeja operativa 3-Way Match (Factura vs PO vs MIGO).
   - Filtros avanzados desplegables por RUC, razón social, estado contable y estado 3-Way Match.
   - Acciones de cabecera: `Revisión 3-Way Match & Contabilizar`, `Validar SUNAT SIRE`, `Rechazar Factura`, `Exportar Excel`.
3. **`SunatSire` (`view/SunatSire.view.xml`):** Auditoría fiscal de validez electrónica (CPE, firma digital y estado en padrón SIRE).
4. **`SapPosting` (`view/SapPosting.view.xml`):** Auditoría de documentos contabilizados en SAP MM (MIRO) y SAP FI (FB60) con trazabilidad a pedidos y recepciones.
5. **`PaymentsAudit` (`view/PaymentsAudit.view.xml`):** Monitoreo de calendario de pagos, constancias de depósito de detracción SPOT (Banco de la Nación) y retenciones IGV.
6. **`CreditNotes` (`view/CreditNotes.view.xml`):** Gestión y conciliación de Notas de Crédito (tipo 07) y Débito (tipo 08).
7. **`Settings` (`view/Settings.view.xml`):** Parámetros de tolerancia 3-Way Match (±2% en precio, ±0% en cantidad), cuentas de mayor por defecto y límites de aprobación.

### 8.2. Diálogos Modales de Negocio (Fragments)
* **`AccountingReviewDialog.fragment.xml`:**
  - Diálogo a pantalla dividida (Split Panel) que muestra simultáneamente la carátula formal con sello de recepción contable (`RECEIVED`), los datos del pedido SAP PO, la recepción MIGO, la matriz de items comparada con tolerancias y el visor de sintaxis XML UBL 2.1.
* **`RejectInvoiceDialog.fragment.xml`:**
  - Diálogo con selector de motivo estandarizado (Discrepancia en Precio, Error de RUC, Falta de Guía MIGO, Observación SUNAT SIRE) y campo de texto libre para notificación automática al proveedor.


