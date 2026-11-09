---
name: cds-architect
description: >-
  Modelado semántico de datos y Virtual Data Model (VDM) para SAP S/4HANA y SAP BTP bajo el principio Clean Core.
  Utiliza esta skill cuando necesites diseñar CDS View Entities (R_*, I_*, C_*), Metadata Extensions (.mde),
  optimizar queries con push-down HANA, o configurar anotaciones semánticas, de auditoría, ETag y DataPoints para franjas KPI.
---

# Skill: CDS-Architect (Modelado Semántico & VDM Clean Core)

Esta skill contiene las directrices, estándares y patrones de código para el modelado de datos en arquitecturas ABAP RESTful Application Programming Model (RAP) y SAP BTP.

---

## 1. Jerarquía Virtual Data Model (VDM)

Sigue estrictamente la nomenclatura estandarizada de SAP:

1. **Vistas Base / Root (`R_*`):**
   - Definen la entidad raíz o composición sobre tablas persistentes propias.
   - Declaran el control de concurrencia y auditoría temporal.
   ```sql
   @AccessControl.authorizationCheck: #CHECK
   @EndUserText.label: 'Entidad Raíz de Orden de Gestión'
   define root view entity R_GestionOrden
     as select from ztb_orden_cab
     composition [0..*] of R_GestionOrdenItem as _Items
     association [0..1] to I_Currency         as _Currency on $projection.CurrencyCode = _Currency.Currency
   {
     key orden_uuid           as OrdenUUID,
         orden_id             as OrdenID,
         descripcion          as Descripcion,
         @Semantics.amount.currencyCode: 'CurrencyCode'
         monto_total          as MontoTotal,
         currency_code        as CurrencyCode,
         estado               as Estado,
         
         // Campos obligatorios de Auditoría & ETag
         @Semantics.user.createdBy: true
         created_by           as CreatedBy,
         @Semantics.systemDateTime.createdAt: true
         created_at           as CreatedAt,
         @Semantics.user.lastChangedBy: true
         last_changed_by      as LastChangedBy,
         @Semantics.systemDateTime.lastChangedAt: true
         last_changed_at      as LastChangedAt,
         @Semantics.systemDateTime.localInstanceLastChangedAt: true
         local_last_changed_at as LocalLastChangedAt,

         _Items,
         _Currency
   }
   ```

2. **Vistas de Interfaz (`I_*`):**
   - Exponen datos reutilizables y neutrales para consumo cruzado.
   - Sin proyecciones transaccionales directas.

3. **Vistas de Consumo / Proyección (`C_*`):**
   - Proyección dedicada para el servicio RAP y consumo Fiori.
   - Habilita la vinculación de Metadata Extensions (`@Metadata.allowExtensions: true`).
   ```sql
   @EndUserText.label: 'Proyección de Consumo para Orden'
   @AccessControl.authorizationCheck: #CHECK
   @Metadata.allowExtensions: true
   @Search.searchable: true
   define root view entity C_GestionOrden
     provider contract transactional_query
     as projection on R_GestionOrden
   {
     key OrdenUUID,
         @Search.defaultSearchElement: true
         @Search.fuzzinessThreshold: 0.8
         OrdenID,
         Descripcion,
         MontoTotal,
         CurrencyCode,
         Estado,
         LocalLastChangedAt,
         
         _Items : redirected to composition child C_GestionOrdenItem,
         _Currency
   }
   ```

---

## 2. Desacoplamiento de Anotaciones UI (Metadata Extensions `.mde`)

**Regla de oro:** Cero anotaciones `@UI.*` en las definiciones DDL de vistas CDS. Todas deben residir en archivos `.mde`.

```sql
@Metadata.layer: #CUSTOMER
annotate view C_GestionOrden with
{
  @UI.facet: [
    { id: 'GeneralInfo',
      type: #COLLECTION,
      label: 'Información General',
      position: 10 },
    { id: 'HeaderData',
      parentId: 'GeneralInfo',
      type: #IDENTIFICATION_REFERENCE,
      label: 'Detalles de Cabecera',
      position: 10 },
    { id: 'LineItems',
      type: #LINEITEM_REFERENCE,
      label: 'Posiciones de la Orden',
      position: 20,
      targetElement: '_Items' }
  ]

  @UI.identification: [ { position: 10, label: 'ID Orden' } ]
  @UI.lineItem: [ { position: 10, label: 'ID Orden', importance: #HIGH } ]
  @UI.selectionField: [ { position: 10 } ]
  OrdenID;

  @UI.identification: [ { position: 20, label: 'Descripción' } ]
  @UI.lineItem: [ { position: 20, label: 'Descripción' } ]
  Descripcion;

  @UI.lineItem: [ { position: 30, label: 'Monto Total' } ]
  @UI.dataPoint: { title: 'Monto Total', criticalityCalculation: { improvementDirection: #MAXIMIZE } }
  MontoTotal;

  @UI.lineItem: [ { position: 40, label: 'Estado', criticality: 'EstadoCriticality' } ]
  @UI.selectionField: [ { position: 20 } ]
  Estado;
}
```

---

## 3. Soporte Semántico para Franjas KPI Fiori Horizon

Al modelar vistas de consumo que alimentan tarjetas analíticas superiores (KPI Strip), se deben definir dataPoints semánticos vinculados al catálogo cromático funcional:
* **Métrica de Pendientes / En Riesgo (Criticality #3 / Naranja):** Cantidad de OTs abiertas, pedidos bloqueados, documentos pendientes.
* **Métrica de Base Instalada / Volumen (Criticality #0 / Dark Slate):** Total de posiciones stock, usuarios activos, almacenes.
* **Métrica de Eficiencia / Cumplimiento (Criticality #1 / Verde):** Porcentaje de ocupabilidad, OTIF, SLA de entrega.
* **Métrica de Alertas Críticas (Criticality #2 / Naranja):** Lotes por vencer, incidentes con prioridad alta.

---

## 4. Optimización SQL Push-Down en SAP HANA

* **Asociaciones On-Demand:** Evitar joins `LEFT OUTER JOIN` pesados innecesarios; usar `association` lazy que se resuelven únicamente cuando el campo o targetElement es solicitado en la consulta OData.
* **Filtros Push-down:** Aprovechar `@Search.defaultSearchElement` y condiciones calculadas dentro del SELECT CDS para evitar procesamiento en memoria del servidor de aplicaciones.

---

## 5. Persistencia Híbrida Clean Core: Mapeo DDL a PostgreSQL (Supabase)

Para soportar despliegues cloud híbridos o prototipado ágil manteniendo cumplimiento 100% Clean Core con S/4HANA:

1. **Nomenclatura Estricta:** Todas las tablas de persistencia utilizan el prefijo `ztb_*` con nombres en singular o plural estandarizado:
   * `ztb_materials` (Maestro MM)
   * `ztb_bins` (Ubicaciones WM)
   * `ztb_stock` (Stock por Lote MM-IM)
   * `ztb_transfer_orders` (Órdenes de Traslado WM)
   * `ztb_goods_receipts` (Entradas MIGO)
   * `ztb_goods_issues` (Salidas VL02N)
   * `ztb_inventory_counts` (Inventario Físico LI01N)
   * `ztb_wh_sede` (Torre de Control de Almacenes)
   * `ztb_fue_users` (Optimización FUE)
   * `ztb_supp_inv_acc` (Facturas Proveedores Contabilidad / Cuentas por Pagar)
   * `ztb_supp_inv_itm` (Líneas de Detalle / Items Factura Proveedor)
2. **Campos Semánticos y de Auditoría Requeridos:**
   * Llaves de negocio unívocas (`sap_code`, `bin_code`, `gr_number`, `gi_number`, `to_number`, `invoice_uuid`, `invoice_num`).
   * Columnas temporales con zona horaria (`created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`).
   * Tipos JSONB para estructuras anidadas o variantes sin romper la 1ra forma normal de cabeceras (`items JSONB`, `appointments JSONB`).
3. **Idempotencia de Esquemas:** Todo script DDL (`schema.sql`) debe utilizar cláusulas `CREATE TABLE IF NOT EXISTS` para permitir re-ejecuciones seguras en frío durante el ciclo de vida CI/CD.

---

## 6. Caso de Referencia Clean Core: Modelo VDM Cuentas por Pagar & 3-Way Match

### 6.1. Entidad Raíz Base (`R_SupplierInvoiceAccounting`)
```sql
@AccessControl.authorizationCheck: #CHECK
@EndUserText.label: 'Factura Proveedor Contabilidad & 3-Way Matching'
define root view entity R_SupplierInvoiceAccounting
  as select from ztb_supp_inv_acc
  composition [0..*] of R_SupplierInvoiceItemAccounting as _Items
  association [0..1] to I_Currency                      as _Currency on $projection.Currency = _Currency.Currency
{
  key invoice_uuid          as InvoiceUUID,
      invoice_number        as InvoiceNumber,
      supplier_ruc          as SupplierRUC,
      supplier_name         as SupplierName,
      po_reference          as POReference,
      migo_reference        as MIGOReference,
      issue_date            as IssueDate,
      due_date              as DueDate,
      @Semantics.amount.currencyCode: 'Currency'
      subtotal_amount       as SubtotalAmount,
      @Semantics.amount.currencyCode: 'Currency'
      tax_igv_amount        as TaxIGVAmount,
      @Semantics.amount.currencyCode: 'Currency'
      total_amount          as TotalAmount,
      currency              as Currency,
      sunat_sire_status     as SunatSireStatus,
      sunat_sire_obs        as SunatSireObs,
      three_way_match_status as ThreeWayMatchStatus,
      price_variance_pct    as PriceVariancePct,
      qty_variance_pct      as QtyVariancePct,
      accounting_status     as AccountingStatus,
      sap_fi_document       as SapFIDocument,
      sap_mm_document       as SapMMDocument,
      xml_file_name         as XmlFileName,
      pdf_file_name         as PdfFileName,
      has_detraction        as HasDetraction,
      @Semantics.amount.currencyCode: 'Currency'
      detraction_amount     as DetractionAmount,
      detraction_constancy  as DetractionConstancy,
      has_retention         as HasRetention,

      // Auditoría Técnica Clean Core
      @Semantics.user.createdBy: true
      created_by            as CreatedBy,
      @Semantics.systemDateTime.createdAt: true
      created_at            as CreatedAt,
      @Semantics.user.lastChangedBy: true
      last_changed_by       as LastChangedBy,
      @Semantics.systemDateTime.lastChangedAt: true
      last_changed_at       as LastChangedAt,
      @Semantics.systemDateTime.localInstanceLastChangedAt: true
      local_last_changed_at as LocalLastChangedAt,

      _Items,
      _Currency
}
```

### 6.2. Metadata Extension (`C_SupplierInvoiceAccounting.mde`) con DataPoints KPI
```sql
@Metadata.layer: #CUSTOMER
annotate view C_SupplierInvoiceAccounting with
{
  @UI.facet: [
    { id: 'KpiPending', position: 10, type: #DATAPOINT_REFERENCE, targetQualifier: 'KpiPendingPosting' },
    { id: 'KpiSpend',   position: 20, type: #DATAPOINT_REFERENCE, targetQualifier: 'KpiTotalSpend' },
    { id: 'KpiEfficiency', position: 30, type: #DATAPOINT_REFERENCE, targetQualifier: 'KpiThreeWayEfficiency' },
    { id: 'KpiObserved', position: 40, type: #DATAPOINT_REFERENCE, targetQualifier: 'KpiObservedInvoices' }
  ]

  @UI.dataPoint: { qualifier: 'KpiPendingPosting', title: 'Facturas Pendientes', criticality: #CRITICAL }
  TotalAmount;

  @UI.dataPoint: { qualifier: 'KpiTotalSpend', title: 'Gasto Total USD', criticality: #NEUTRAL }
  SubtotalAmount;

  @UI.dataPoint: { qualifier: 'KpiThreeWayEfficiency', title: 'Efectividad 3-Way Match', criticality: #POSITIVE }
  ThreeWayMatchStatus;

  @UI.dataPoint: { qualifier: 'KpiObservedInvoices', title: 'Observadas SUNAT/Precio', criticality: #NEGATIVE }
  SunatSireStatus;
}
```

---

## 7. Caso de Referencia Clean Core: Modelo VDM Gemelo Digital 3D de Almacén (`R_WarehouseNiche3D`)

### 7.1. Entidad Espacial Base (`R_WarehouseNiche3D`)
Modela las coordenadas volumétricas, ocupación de estanterías y fechas de vencimiento de lotes para el renderizado WebGL 3D:

```sql
@AccessControl.authorizationCheck: #CHECK
@EndUserText.label: 'Nicho Volumétrico de Almacén 3D'
define root view entity R_WarehouseNiche3D
  as select from ztb_wms_niches_3d
  association [0..1] to I_Material as _Material on $projection.MaterialID = _Material.Material
{
  key niche_uuid        as NicheUUID,
      niche_code        as NicheCode,        // Ej: 'H-01-3'
      aisle_id          as AisleID,          // Pasillos 'A' a 'J'
      column_idx        as ColumnIndex,      // 1 a 26
      level_idx         as LevelIndex,       // 1 a 4
      pallet_pos        as PalletPosition,   // 1 o 2 (hasta 2.400 paletas)
      zone_type         as ZoneType,         // 'RACK', 'STAGE_12M', 'DOCK_RECEPTION', 'DOCK_DISPATCH'
      dock_id           as DockID,           // 'R1'-'R3', 'D1'-'D3'

      material_id       as MaterialID,
      material_desc     as MaterialDesc,
      batch_number      as BatchNumber,
      
      @Semantics.quantity.unitOfMeasure: 'BaseUnit'
      stock_qty         as StockQty,
      base_unit         as BaseUnit,

      // Semáforo de Vencimiento de Lotes
      @Semantics.businessDate.at: true
      expiration_date   as ExpirationDate,
      days_to_expiry    as DaysToExpiry,
      traffic_light     as TrafficLightStatus, // 'EXPIRED', 'CRITICAL', 'WARNING', 'ACTIVE', 'NO_EXPIRY', 'EMPTY'

      // Auditoría Técnica Clean Core
      @Semantics.systemDateTime.localInstanceLastChangedAt: true
      local_last_changed_at as LocalLastChangedAt,

      _Material
}
```

### 7.2. Semántica de DataPoints para Consola 3D
* **`KpiOccupancy3D` (Verde `#107e3e`):** Porcentaje de ocupación sobre 1.200 nichos / 2.400 paletas.
* **`KpiExpiredBatches` (Rojo `#bb0000` / Criticality #1):** Nichos con lote vencido expirado.
* **`KpiCriticalBatches` (Naranja `#e06a3b` / Criticality #2):** Nichos que vencen dentro de los 30 días.
* **`KpiEmptyNiches` (Slate `#1e293b`):** Nichos transparentes vacíos listos para putaway MIGO.


