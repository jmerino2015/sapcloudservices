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
2. **Campos Semánticos y de Auditoría Requeridos:**
   * Llaves de negocio unívocas (`sap_code`, `bin_code`, `gr_number`, `gi_number`, `to_number`).
   * Columnas temporales con zona horaria (`created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`).
   * Tipos JSONB para estructuras anidadas o variantes sin romper la 1ra forma normal de cabeceras (`items JSONB`, `appointments JSONB`).
3. **Idempotencia de Esquemas:** Todo script DDL (`schema.sql`) debe utilizar cláusulas `CREATE TABLE IF NOT EXISTS` para permitir re-ejecuciones seguras en frío durante el ciclo de vida CI/CD.

