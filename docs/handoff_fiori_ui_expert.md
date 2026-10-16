# Handoff Técnico: Capa Transaccional y de Servicios RAP (OData V4)
## Aplicación: Indicadores de Almacenes — Torre de Control WMS Multi-Sede
### Sedes: CD Eucaliptos, CD Callao, CD Praderas

---

## 1. Resumen Ejecutivo de la Capa RAP & Clean Core

Se ha implementado la capa transaccional completa bajo el modelo **ABAP RESTful Application Programming Model (RAP)** y el principio **Clean Core** para SAP S/4HANA y SAP BTP ABAP Environment. 

### Características Clave:
- **Modelo de Comportamiento:** `managed with draft` con directiva estricta `strict ( 2 )`.
- **Control de Concurrencia:** Optimistic Concurrency Control vía ETag Master (`LocalLastChangedAt`) y Total ETag (`LastChangedAt`).
- **Control de Bloqueos:** `lock master` en raíz y `lock dependent by _Sede` en entidades hijas.
- **Autorización:** `authorization master ( instance )` para filtrado y protección por sede operativa.
- **Protocolo de Exposición:** **OData V4 - UI**, optimizado para SAP Fiori Elements y aplicaciones Freestyle UI5.

---

## 2. Inventario de Artefactos RAP Creados

| Tipo de Objeto | Nombre del Archivo | Descripción |
| :--- | :--- | :--- |
| **BDEF Raíz** | `src/rap/R_KpiAlmacenSede.bdef` | Definición de comportamiento administrado con Draft, acciones, determinaciones y validaciones. |
| **BDEF Proyección** | `src/rap/C_KpiAlmacenSede.bdef` | Proyección de consumo transaccional con `use draft` y `use etag`. |
| **Behavior Pool (Global)** | `src/rap/zbp_r_kpialmacensede.clas.abap` | Clase global Behavior Pool para la entidad raíz `R_KpiAlmacenSede`. |
| **Behavior Pool (Local)** | `src/rap/zbp_r_kpialmacensede.clas.locals_imp.abap` | Implementación de `LCL_HANDLER` (EML, autorizaciones, acciones, determinaciones, validaciones) y `LCL_SAVER`. |
| **Parámetro Acción** | `src/cds/ZA_ParamSincronizar.ddls` | Entidad abstracta para parámetros de entrada de la acción `sincronizarKpis`. |
| **Tabla Draft Sede** | `src/db/ztb_wh_sede_d.tabl` | Tabla de persistencia temporal para Draft de la entidad raíz. |
| **Tabla Draft Familia** | `src/db/ztb_wh_fam_d.tabl` | Tabla de persistencia Draft para ocupabilidad por familias. |
| **Tabla Draft Transporte**| `src/db/ztb_wh_tra_d.tabl` | Tabla de persistencia Draft para unidades de transporte Drivin/VL06F. |
| **Service Definition** | `src/srv/ZUI_KPI_ALMACEN_O4.srvd` | Exposición de entidades `C_KpiAlmacenSede`, `C_KpiAlmacenFamilia` y `C_KpiAlmacenUnidadTransporte`. |
| **Service Binding** | `src/srv/ZUI_KPI_ALMACEN_O4_BIND.srvb` | Service Binding OData V4 - UI en estado `ACTIVE`. |

---

## 3. Endpoints del Servicio OData V4

- **Service Root URL:**
  ```text
  /sap/opu/odata4/sap/zui_kpi_almacen_o4/srvd/sap/zui_kpi_almacen_o4/0001/
  ```
- **Documento de Metadatos ($metadata):**
  ```text
  /sap/opu/odata4/sap/zui_kpi_almacen_o4/srvd/sap/zui_kpi_almacen_o4/0001/$metadata
  ```

### Entidades y Colecciones (EntitySets):
1. **Entidad Raíz:** `KpiAlmacenSede`
   - Clave: `SedeId` (ej. `'CD_EUCALIPTOS'`, `'CD_CALLAO'`, `'CD_PRADERAS'`)
   - Navegación a Familias: `_Familias` (`KpiAlmacenSede(SedeId='...')/_Familias`)
   - Navegación a Transportes: `_Transportes` (`KpiAlmacenSede(SedeId='...')/_Transportes`)
2. **Entidad Hija 1:** `KpiAlmacenFamilia`
   - Clave compuesta: `SedeId`, `FamiliaId`
3. **Entidad Hija 2:** `KpiAlmacenTransporte`
   - Clave compuesta: `SedeId`, `TransportUnitId`

---

## 4. Operaciones EML y Acciones OData Disponibles

### 4.1. Acción Bound: `sincronizarKpis`
- **Ruta OData:** 
  `POST /sap/opu/odata4/sap/zui_kpi_almacen_o4/srvd/sap/zui_kpi_almacen_o4/0001/KpiAlmacenSede(SedeId='CD_EUCALIPTOS',IsActiveEntity=true)/com.sap.gateway.srvd.zui_kpi_almacen_o4.v0001.sincronizarKpis`
- **Propósito:** Orquesta el refresco programado cada 15 o 30 minutos desde:
  - **S/4HANA MM-IM (MB51):** Paletas de ingreso/salida y peso en toneladas.
  - **S/4HANA LE-WM (LT23):** OTs pendientes (Picking, Recepción, Ubicación, Despacho).
  - **S/4HANA LE-WM (LX03):** Mapa de bins totales, ocupados y disponibles.
  - **Microsoft OneDrive / SharePoint:** ERI, ERU, BPA, Precisión de Picking, OTIF, 5S y Días sin accidentes.
  - **Drivin / VL06F:** Cumplimiento de ventana horaria 7:00 - 10:00 AM y estados de camiones.
- **Estructura del Payload JSON de entrada:**
  ```json
  {
    "frecuencia_min": 15,
    "incluir_mb51": true,
    "incluir_lt23": true,
    "incluir_lx03": true,
    "incluir_onedrive": true,
    "comentario": "Sincronización periódica automática Torre de Control"
  }
  ```
- **Respuesta:** Objeto `KpiAlmacenSede` actualizado en tiempo real junto con mensaje informativo en el encabezado `sap-messages`.

---

## 5. Lógica de Negocio Transaccional Implementada

### 5.1. Determinaciones Automáticas (`on modify`)
1. **`calcularOcupabilidad`**:
   - `FreePositions = TotalPositions - OccupiedPositions`
   - `OccupancyRate = (OccupiedPositions / TotalPositions) * 100`
2. **`calcularTotalesOT`**:
   - `TotalOpenOt = OpenOtPicking + OpenOtReceiving + OpenOtPutaway + OpenOtDispatch`
3. **`calcularOcupFamilia`**:
   - Calcula porcentaje por familia y asigna automáticamente `CriticalityCode`:
     - **1 (Crítico/Rojo):** $\ge 90\%$
     - **2 (Alerta/Amarillo):** $80\% - 89.99\%$
     - **3 (Óptimo/Verde):** $< 80\%$

### 5.2. Validaciones Tempranas (`on save` y Draft Prepare)
1. **`validarCapacidadAlmacen`**:
   - $\text{TotalPositions} > 0$ (Evita divisiones entre cero y datos nulos).
   - $\text{OccupiedPositions} \ge 0$ (Bloquea valores negativos inconsistentes).
   - $\text{OccupiedPositions} \le \text{TotalPositions}$ (Impide registrar sobrecupos físicos erróneos).
   - Genera mensajes específicos en `reported-kpialmacensede` vinculados al campo (`%element-OccupiedPositions`) e indexa en `failed-kpialmacensede`.

---

## 6. Mapeo de Criticidad y Formato para la UI Fiori

| Métrica | Umbral Verde (3) | Umbral Amarillo (2) | Umbral Rojo (1) | Visualización Fiori Sugerida |
| :--- | :--- | :--- | :--- | :--- |
| **Ocupabilidad Global** | $< 80\%$ | $80\% - 89.9\%$ | $\ge 90\%$ | Radial Microchart / Bullet |
| **OTs Pendientes** | $< 40$ | $40 - 80$ | $> 80$ | KPI Header DataPoint |
| **Cumplimiento Ventana 7-10 AM** | $\ge 90\%$ | $80\% - 89.9\%$ | $< 80\%$ | Progress Bar / Column Microchart |
| **OTIF & Precisión Picking** | $\ge 98\%$ | $95\% - 97.9\%$ | $< 95\%$ | Harvey Ball / Smart KPI Tag |
| **5S Score** | $\ge 95\%$ | $90\% - 94.9\%$ | $< 90\%$ | Rating Indicator |

---

## 7. Próximos Pasos para `fiori_ui_expert`
1. Consumir el servicio OData V4 mediante el modelo ODataModel V4 (`sap.ui.model.odata.v4.ODataModel`).
2. Configurar la vista principal con selector Multi-Sede (`CD Eucaliptos`, `CD Callao`, `CD Praderas`) y filtro de actualización (15 min / 30 min / Manual).
3. Habilitar el botón de cabecera *"Sincronizar KPIs"* mapeado a la acción bound `sincronizarKpis`.
4. Utilizar las anotaciones CDS ya provistas en `C_KpiAlmacenSede.mde` para renderizar el Object Page, Microcharts y tablas anidadas de Familias y Transportes.
