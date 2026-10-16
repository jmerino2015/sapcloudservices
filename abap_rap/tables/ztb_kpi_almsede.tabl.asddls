@EndUserText.label : 'Tabla Persistente de Indicadores WMS Multi-Sede'
@AbapCatalog.enhancement.category : #NOT_EXTENSIBLE
@AbapCatalog.tableCategory : #TRANSPARENT
@AbapCatalog.deliveryClass : #A
@AbapCatalog.dataMaintenance : #RESTRICTED
define table ztb_kpi_almsede {
  key client               : abap.clnt not null;
  key kpi_uuid             : sysuuid_x16 not null;
  sede_id                  : abap.char(10);        // 'CD_EUCALIPTOS', 'CD_CALLAO', 'CD_PRADERAS'
  nombre_sede              : abap.char(60);
  centro                   : abap.char(4);         // WERKS
  almacen                  : abap.char(4);         // LGORT
  numero_almacen           : abap.char(3);         // LGNUM (001, 002, etc.)
  fecha_kpi                : abap.dats;
  hora_kpi                 : abap.tims;
  
  // Métricas de Capacidad y Ocupabilidad (LX03)
  capacidad_total          : abap.int4;
  posiciones_ocupadas      : abap.int4;
  posiciones_disponibles   : abap.int4;
  porcentaje_ocupabilidad  : abap.dec(5,2);
  estado_ocupabilidad      : abap.char(1);         // 'G', 'Y', 'R'
  
  // Métricas de Órdenes de Transporte (LT23)
  total_ot_creadas         : abap.int4;
  total_ot_confirmadas     : abap.int4;
  total_ot_pendientes      : abap.int4;
  porcentaje_eficacia_ot   : abap.dec(5,2);
  
  // Métricas de Movimientos de Mercancías (MB51)
  total_movimientos        : abap.int4;
  entradas_mercancia       : abap.int4;
  salidas_mercancia        : abap.int4;
  transferencias_internas  : abap.int4;
  
  // Parámetros Operativos & Integración OneDrive
  frecuencia_refresco_min  : abap.int2;            // 15 o 30
  ultima_sincronizacion    : abap.utclong;
  estado_sincronizacion    : abap.char(20);        // SUCCESS, FAILED, IN_PROGRESS
  fuente_origen            : abap.char(40);
  critico_flag             : abap_boolean;
  
  // Auditoría Técnica Clean Core / ETag
  created_by               : abp_creation_user;
  created_at               : abp_creation_utclong;
  last_changed_by          : abp_locinst_lastchange_user;
  last_changed_at          : abp_lastchange_utclong;
  local_last_changed_at    : abp_locinst_lastchange_utclong;
}
