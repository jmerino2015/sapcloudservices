---
name: rap-engineer
description: >-
  Ingeniería transaccional, lógica de negocio y exposición de servicios en ABAP RESTful Application Programming Model (RAP).
  Utiliza esta skill cuando necesites definir archivos BDEF con Draft, implementar Behavior Pools (LCL_HANDLER, LCL_SAVER),
  escribir lógica EML, determinaciones, validaciones tempranas, acciones transaccionales masivas o exponer OData V4 Service Bindings.
---

# Skill: RAP-Engineer (Lógica Transaccional & Servicios RAP Clean Core)

Esta skill proporciona las mejores prácticas y patrones de implementación para la capa de comportamiento y exposición de servicios en SAP S/4HANA y SAP BTP ABAP Environment.

---

## 1. Definición de Comportamiento (`BDEF`) con Draft

Toda aplicación transaccional en Fiori moderna implementa el contrato de Draft:

```abap
managed implementation in class zbp_r_gestionorden unique;
strict ( 2 );
with draft;

define behavior for R_GestionOrden alias Orden
persistent table ztb_orden_cab
draft table ztb_orden_cab_d
lock master
total etag LastChangedAt
authorization master ( instance )
etag master LocalLastChangedAt
{
  create;
  update;
  delete;
  association _Items { create; with draft; }

  field ( numbering : managed, readonly ) OrdenUUID;
  field ( readonly ) CreatedBy, CreatedAt, LastChangedBy, LastChangedAt, LocalLastChangedAt;
  field ( mandatory ) OrdenID, Descripcion;

  // Acciones y Determinaciones
  action ( features : instance ) aprobarOrden result [1] $self;
  determination calcularTotal on modify { field _Items.MontoItem; }
  validation validarEstado on save { field Estado; create; update; }

  draft action Edit;
  draft action Activate optimized;
  draft action Discard;
  draft action Resume;
  draft determine action Prepare {
    validation validarEstado;
  }

  mapping for ztb_orden_cab
  {
    OrdenUUID = orden_uuid;
    OrdenID = orden_id;
    Descripcion = descripcion;
    MontoTotal = monto_total;
    CurrencyCode = currency_code;
    Estado = estado;
    CreatedBy = created_by;
    CreatedAt = created_at;
    LastChangedBy = last_changed_by;
    LastChangedAt = last_changed_at;
    LocalLastChangedAt = local_last_changed_at;
  }
}
```

---

## 2. Implementación de Clases de Comportamiento (Behavior Pool)

Estructuración de tipos locales (`LCL_HANDLER` y `LCL_SAVER`) con sentencias EML:

```abap
CLASS lhc_orden DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS get_instance_authorizations FOR INSTANCE AUTHORIZATION
      IMPORTING keys REQUEST requested_authorizations FOR Orden RESULT result.

    METHODS get_instance_features FOR INSTANCE FEATURES
      IMPORTING keys REQUEST requested_features FOR Orden RESULT result.

    METHODS aprobarOrden FOR MODIFY
      IMPORTING keys FOR ACTION Orden~aprobarOrden RESULT result.

    METHODS validarEstado FOR VALIDATE ON SAVE
      IMPORTING keys FOR Orden~validarEstado.

    METHODS calcularTotal FOR DETERMINE ON MODIFY
      IMPORTING keys FOR Orden~calcularTotal.
ENDCLASS.

CLASS lhc_orden IMPLEMENTATION.

  METHOD aprobarOrden.
    " Modificar estado usando EML seguro en Local Mode
    MODIFY ENTITIES OF R_GestionOrden IN LOCAL MODE
      ENTITY Orden
        UPDATE FIELDS ( Estado )
        WITH VALUE #( FOR key IN keys ( %tky   = key-%tky
                                        Estado = 'APROBADO' ) )
      FAILED failed
      REPORTED reported.

    " Leer la entidad actualizada para retornarla
    READ ENTITIES OF R_GestionOrden IN LOCAL MODE
      ENTITY Orden
        ALL FIELDS WITH CORRESPONDING #( keys )
      RESULT DATA(ordenes).

    result = VALUE #( FOR orden IN ordenes ( %tky   = orden-%tky
                                            %param = orden ) ).
  ENDMETHOD.

  METHOD validarEstado.
    READ ENTITIES OF R_GestionOrden IN LOCAL MODE
      ENTITY Orden
        FIELDS ( Estado ) WITH CORRESPONDING #( keys )
      RESULT DATA(ordenes).

    LOOP AT ordenes INTO DATA(ls_orden).
      IF ls_orden-Estado IS INITIAL.
        APPEND VALUE #( %tky = ls_orden-%tky ) TO failed-orden.
        APPEND VALUE #( %tky = ls_orden-%tky
                        %msg = new_message_with_text(
                                 severity = if_abap_behv_message=>severity-error
                                 text     = 'El estado de la orden no puede ser inicial.' ) )
               TO reported-orden.
      ENDIF;
    ENDLOOP.
  ENDMETHOD.

  METHOD calcularTotal.
    " Recalcular montos consolidados para la franja analítica KPI
    " ...
  ENDMETHOD.

ENDCLASS.
```

---

## 3. Exposición de Servicios RAP en Protocolo OData V4

Toda exposición hacia Fiori se realiza exclusivamente en **OData V4 - UI**:

1. **Service Definition (`SRVD`):**
   ```abap
   @EndUserText.label: 'Exposición Servicio Ordenes OData V4'
   define service ZUI_GESTION_ORDEN_O4 {
     expose C_GestionOrden     as Orden;
     expose C_GestionOrdenItem as Posicion;
     expose I_Currency         as Moneda;
   }
   ```

2. **Service Binding:**
   - Tipo de Binding: `OData V4 - UI`
   - Nombre: `ZUI_GESTION_ORDEN_O4_UI`
   - Activación y publicación local o en BTP.
