@EndUserText.label: 'Parámetros para Sincronización de KPIs WMS'
define abstract entity ZA_ParamSincronizar
{
  @EndUserText.label: 'Frecuencia de Refresco (min)'
  @Consumption.valueHelpDefinition: [{
    entity: { name: 'I_GenericValueHelp', element: 'Value' }
  }]
  frecuencia_min    : abap.int2;       // 15 o 30 minutos

  @EndUserText.label: 'Incluir Movimientos MB51 (MM-IM)'
  incluir_mb51      : abap_boolean;

  @EndUserText.label: 'Incluir Órdenes de Transporte LT23 (LE-WM)'
  incluir_lt23      : abap_boolean;

  @EndUserText.label: 'Incluir Ocupación de Bins LX03 (LE-WM)'
  incluir_lx03      : abap_boolean;

  @EndUserText.label: 'Incluir Fuente Externa OneDrive / Excel'
  incluir_onedrive  : abap_boolean;

  @EndUserText.label: 'Comentario u Observación de Ejecución'
  comentario        : abap.char(100);
}
