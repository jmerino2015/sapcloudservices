CLASS zcl_test_kpi_almacen DEFINITION
  PUBLIC
  FINAL
  CREATE PUBLIC
  FOR TESTING
  DURATION SHORT
  RISK LEVEL HARMLESS.

  PUBLIC SECTION.
  PROTECTED SECTION.
  PRIVATE SECTION.
ENDCLASS.

CLASS zcl_test_kpi_almacen IMPLEMENTATION.
ENDCLASS.

/* ======================================================================
   LOCAL TEST CLASS: ltcl_kpi_almacen_test
   Suite de Pruebas Unitarias ABAP Unit con Aislamiento de Base de Datos
   Torre de Control WMS Multi-Sede (CD Eucaliptos, CD Callao, CD Praderas)
   Principio Clean Core - ABAP Cloud & RAP Test Doubles
   ====================================================================== */
CLASS ltcl_kpi_almacen_test DEFINITION FINAL
  FOR TESTING
  DURATION SHORT
  RISK LEVEL HARMLESS.

  PRIVATE SECTION.
    CLASS-DATA:
      go_cds_test_env TYPE REF TO if_cds_test_environment,
      go_sql_test_env TYPE REF TO if_osql_test_environment.

    CLASS-METHODS:
      class_setup,
      class_teardown.

    METHODS:
      setup,
      teardown,

      // 1. Pruebas Transaccionales de Creación y Ciclo de Vida Draft
      test_create_draft_and_activate FOR TESTING RAISING cx_static_check,

      // 2. Pruebas de Determinación: Ocupabilidad de Posiciones (LX03)
      test_calcular_ocupabilidad     FOR TESTING RAISING cx_static_check,

      // 3. Pruebas de Determinación: Totales de Órdenes de Transporte (LT23)
      test_calcular_totales_ot       FOR TESTING RAISING cx_static_check,

      // 4. Pruebas de Determinación: Ocupabilidad y Criticidad por Familia
      test_calcular_ocup_familia     FOR TESTING RAISING cx_static_check,

      // 5. Pruebas de Validación: Capacidad de Almacén (Casos Error y Aprobado)
      test_validar_capacidad_cero    FOR TESTING RAISING cx_static_check,
      test_validar_capacidad_neg     FOR TESTING RAISING cx_static_check,
      test_validar_sobrecupo_error   FOR TESTING RAISING cx_static_check,
      test_validar_capacidad_ok      FOR TESTING RAISING cx_static_check,

      // 6. Pruebas de Acción: Sincronización Multi-Fuente de KPIs
      test_sincronizar_kpis_action   FOR TESTING RAISING cx_static_check.

ENDCLASS.

CLASS ltcl_kpi_almacen_test IMPLEMENTATION.

  METHOD class_setup.
    // Inicialización del entorno de pruebas con dobles de prueba para CDS View Entities y persistencia
    go_cds_test_env = cl_cds_test_environment=>create_for_multiple_cds(
      i_for_entities = VALUE #(
        ( 'R_KPIALMACENSEDE' )
        ( 'R_KPIALMACENFAMILIA' )
        ( 'R_KPIALMACENUNIDADTRANSPORTE' )
      )
    ).
    go_cds_test_env->enable_double_redirection( ).
  ENDMETHOD.

  METHOD class_teardown.
    // Destrucción del entorno de pruebas y limpieza de recursos
    IF go_cds_test_env IS BOUND.
      go_cds_test_env->destroy( ).
    ENDIF.
  ENDMETHOD.

  METHOD setup.
    // Limpieza de datos dobles antes de cada caso de prueba
    go_cds_test_env->clear_doubles( ).
  ENDMETHOD.

  METHOD teardown.
    // Rollback de buffers transaccionales EML
    ROLLBACK ENTITIES.
  ENDMETHOD.

  /* ======================================================================
     TEST CASE 1: Creación de Entidad Raíz en Draft y Activación
     ====================================================================== */
  METHOD test_create_draft_and_activate.
    DATA: lt_create TYPE TABLE FOR CREATE r_kpialmacensede\\KpiAlmacenSede,
          lt_activate TYPE TABLE FOR ACTION r_kpialmacensede\\KpiAlmacenSede~Activate.

    // 1. Preparar datos para creación de borrador (Draft)
    lt_create = VALUE #( (
      %cid                       = 'CID_DRAFT_01'
      %is_draft                  = if_abap_behv=>mk-on
      SedeId                     = 'CD_EUCALIPTOS'
      SedeNombre                 = 'CD Eucaliptos - Almacén Central'
      CentroSap                  = '1010'
      AlmacenSap                 = '0010'
      TotalPositions             = 15000
      OccupiedPositions          = 12000
      WeightUnit                 = 'TN'
      PercentageUnit             = '%'
      OpenOtPicking              = 30
      OpenOtReceiving            = 10
      OpenOtPutaway              = 20
      OpenOtDispatch             = 15
      %control-SedeId            = if_abap_behv=>mk-on
      %control-SedeNombre        = if_abap_behv=>mk-on
      %control-CentroSap         = if_abap_behv=>mk-on
      %control-AlmacenSap        = if_abap_behv=>mk-on
      %control-TotalPositions    = if_abap_behv=>mk-on
      %control-OccupiedPositions = if_abap_behv=>mk-on
      %control-WeightUnit        = if_abap_behv=>mk-on
      %control-PercentageUnit    = if_abap_behv=>mk-on
      %control-OpenOtPicking     = if_abap_behv=>mk-on
      %control-OpenOtReceiving   = if_abap_behv=>mk-on
      %control-OpenOtPutaway     = if_abap_behv=>mk-on
      %control-OpenOtDispatch    = if_abap_behv=>mk-on
    ) ).

    // Ejecutar EML CREATE en modo local
    MODIFY ENTITIES OF r_kpialmacensede IN LOCAL MODE
      ENTITY KpiAlmacenSede
      CREATE FROM lt_create
      MAPPED DATA(ls_mapped_create)
      FAILED DATA(ls_failed_create)
      REPORTED DATA(ls_reported_create).

    // Aserciones de creación del Draft
    cl_abap_unit_assert=>assert_initial(
      act = ls_failed_create-kpialmacensede
      msg = 'La creación del registro Draft de sede no debería fallar'
    ).
    cl_abap_unit_assert=>assert_not_initial(
      act = ls_mapped_create-kpialmacensede
      msg = 'Debe generarse un registro mapeado para el Draft creado'
    ).

    // 2. Activar el borrador (Draft Action Activate)
    lt_activate = VALUE #( (
      %tky = ls_mapped_create-kpialmacensede[ 1 ]-%tky
    ) ).

    MODIFY ENTITIES OF r_kpialmacensede IN LOCAL MODE
      ENTITY KpiAlmacenSede
      EXECUTE Activate FROM lt_activate
      MAPPED DATA(ls_mapped_act)
      FAILED DATA(ls_failed_act)
      REPORTED DATA(ls_reported_act).

    cl_abap_unit_assert=>assert_initial(
      act = ls_failed_act-kpialmacensede
      msg = 'La activación del Draft de la sede no debería presentar fallos'
    ).
  ENDMETHOD.

  /* ======================================================================
     TEST CASE 2: Determinación de Ocupabilidad (calcularOcupabilidad)
     ====================================================================== */
  METHOD test_calcular_ocupabilidad.
    DATA lt_create TYPE TABLE FOR CREATE r_kpialmacensede\\KpiAlmacenSede.

    // Capacidad: 15,200 totales, 13,984 ocupadas -> Esperado: 1,216 libres, 92.00%
    lt_create = VALUE #( (
      %cid                       = 'CID_OCUP_01'
      %is_draft                  = if_abap_behv=>mk-off
      SedeId                     = 'CD_EUCALIPTOS'
      SedeNombre                 = 'CD Eucaliptos'
      CentroSap                  = '1010'
      TotalPositions             = 15200
      OccupiedPositions          = 13984
      %control-SedeId            = if_abap_behv=>mk-on
      %control-SedeNombre        = if_abap_behv=>mk-on
      %control-CentroSap         = if_abap_behv=>mk-on
      %control-TotalPositions    = if_abap_behv=>mk-on
      %control-OccupiedPositions = if_abap_behv=>mk-on
    ) ).

    MODIFY ENTITIES OF r_kpialmacensede IN LOCAL MODE
      ENTITY KpiAlmacenSede
      CREATE FROM lt_create
      MAPPED DATA(ls_mapped)
      FAILED DATA(ls_failed).

    cl_abap_unit_assert=>assert_initial( act = ls_failed-kpialmacensede ).

    // Leer la entidad creada para verificar los campos calculados por la determinación
    READ ENTITIES OF r_kpialmacensede IN LOCAL MODE
      ENTITY KpiAlmacenSede
      FIELDS ( FreePositions OccupancyRate )
      WITH CORRESPONDING #( ls_mapped-kpialmacensede )
      RESULT DATA(lt_read).

    cl_abap_unit_assert=>assert_not_initial( act = lt_read ).
    DATA(ls_read) = lt_read[ 1 ].

    cl_abap_unit_assert=>assert_equals(
      act = ls_read-FreePositions
      exp = 1216
      msg = 'Posiciones libres incorrectas: Total (15200) - Ocupadas (13984) debe ser 1216'
    ).

    cl_abap_unit_assert=>assert_equals(
      act = ls_read-OccupancyRate
      exp = CONV p( '92.00' )
      msg = 'Porcentaje de ocupabilidad calculado incorrecto, esperado 92.00%'
    ).
  ENDMETHOD.

  /* ======================================================================
     TEST CASE 3: Determinación de Totales de OT (calcularTotalesOT)
     ====================================================================== */
  METHOD test_calcular_totales_ot.
    DATA lt_create TYPE TABLE FOR CREATE r_kpialmacensede\\KpiAlmacenSede.

    // OTs: Picking(48) + Recepción(12) + Ubicación(25) + Despacho(18) = Total(103)
    lt_create = VALUE #( (
      %cid                     = 'CID_OT_01'
      %is_draft                = if_abap_behv=>mk-off
      SedeId                   = 'CD_CALLAO'
      TotalPositions           = 10000
      OccupiedPositions        = 8000
      OpenOtPicking            = 48
      OpenOtReceiving          = 12
      OpenOtPutaway            = 25
      OpenOtDispatch           = 18
      %control-SedeId          = if_abap_behv=>mk-on
      %control-TotalPositions  = if_abap_behv=>mk-on
      %control-OpenOtPicking   = if_abap_behv=>mk-on
      %control-OpenOtReceiving = if_abap_behv=>mk-on
      %control-OpenOtPutaway   = if_abap_behv=>mk-on
      %control-OpenOtDispatch  = if_abap_behv=>mk-on
    ) ).

    MODIFY ENTITIES OF r_kpialmacensede IN LOCAL MODE
      ENTITY KpiAlmacenSede
      CREATE FROM lt_create
      MAPPED DATA(ls_mapped)
      FAILED DATA(ls_failed).

    cl_abap_unit_assert=>assert_initial( act = ls_failed-kpialmacensede ).

    // Leer la entidad y comprobar la determinación de la sumatoria
    READ ENTITIES OF r_kpialmacensede IN LOCAL MODE
      ENTITY KpiAlmacenSede
      FIELDS ( TotalOpenOt )
      WITH CORRESPONDING #( ls_mapped-kpialmacensede )
      RESULT DATA(lt_read).

    cl_abap_unit_assert=>assert_not_initial( act = lt_read ).
    DATA(ls_read) = lt_read[ 1 ].

    cl_abap_unit_assert=>assert_equals(
      act = ls_read-TotalOpenOt
      exp = 103
      msg = 'El total de órdenes de transporte pendientes debe ser 103 (48+12+25+18)'
    ).
  ENDMETHOD.

  /* ======================================================================
     TEST CASE 4: Determinación de Ocupabilidad y Criticidad de Familia
     ====================================================================== */
  METHOD test_calcular_ocup_familia.
    // 1. Crear sede padre
    DATA lt_create_sede TYPE TABLE FOR CREATE r_kpialmacensede\\KpiAlmacenSede.
    lt_create_sede = VALUE #( (
      %cid                    = 'CID_SEDE_F'
      SedeId                  = 'CD_EUCALIPTOS'
      TotalPositions          = 10000
      %control-SedeId         = if_abap_behv=>mk-on
      %control-TotalPositions = if_abap_behv=>mk-on
    ) ).

    MODIFY ENTITIES OF r_kpialmacensede IN LOCAL MODE
      ENTITY KpiAlmacenSede
      CREATE FROM lt_create_sede
      MAPPED DATA(ls_mapped_sede).

    // 2. Crear familias hijas con distintos rangos de criticidad:
    // FAM-01: 2400 total, 2260 ocupadas -> 94.16% >= 90% (Criticidad 1: Rojo)
    // FAM-02: 5500 total, 4840 ocupadas -> 88.00% (Criticidad 2: Amarillo)
    // FAM-03: 3500 total, 2730 ocupadas -> 78.00% < 80% (Criticidad 3: Verde)
    DATA lt_create_fam TYPE TABLE FOR CREATE r_kpialmacensede\\KpiAlmacenSede\_Familias.
    lt_create_fam = VALUE #( (
      %cid_ref = 'CID_SEDE_F'
      %target  = VALUE #(
        (
          %cid                       = 'CID_FAM_CRIT1'
          FamiliaId                  = 'FAM-FRIO'
          FamiliaNombre              = 'Cadena de Frío'
          TotalPositions             = 2400
          OccupiedPositions          = 2260
          %control-FamiliaId         = if_abap_behv=>mk-on
          %control-FamiliaNombre     = if_abap_behv=>mk-on
          %control-TotalPositions    = if_abap_behv=>mk-on
          %control-OccupiedPositions = if_abap_behv=>mk-on
        )
        (
          %cid                       = 'CID_FAM_CRIT2'
          FamiliaId                  = 'FAM-SELE'
          FamiliaNombre              = 'Racks Selectivos'
          TotalPositions             = 5500
          OccupiedPositions          = 4840
          %control-FamiliaId         = if_abap_behv=>mk-on
          %control-FamiliaNombre     = if_abap_behv=>mk-on
          %control-TotalPositions    = if_abap_behv=>mk-on
          %control-OccupiedPositions = if_abap_behv=>mk-on
        )
        (
          %cid                       = 'CID_FAM_CRIT3'
          FamiliaId                  = 'FAM-FARM'
          FamiliaNombre              = 'Farmacéuticos'
          TotalPositions             = 3500
          OccupiedPositions          = 2730
          %control-FamiliaId         = if_abap_behv=>mk-on
          %control-FamiliaNombre     = if_abap_behv=>mk-on
          %control-TotalPositions    = if_abap_behv=>mk-on
          %control-OccupiedPositions = if_abap_behv=>mk-on
        )
      )
    ) ).

    MODIFY ENTITIES OF r_kpialmacensede IN LOCAL MODE
      ENTITY KpiAlmacenSede
      CREATE BY \_Familias FROM lt_create_fam
      MAPPED DATA(ls_mapped_fam)
      FAILED DATA(ls_failed_fam).

    cl_abap_unit_assert=>assert_initial( act = ls_failed_fam-kpialmacenfamilia ).

    // Leer las familias y verificar la asignación del semáforo CriticalityCode
    READ ENTITIES OF r_kpialmacensede IN LOCAL MODE
      ENTITY KpiAlmacenFamilia
      FIELDS ( FamiliaId OccupancyRate CriticalityCode )
      WITH CORRESPONDING #( ls_mapped_fam-kpialmacenfamilia )
      RESULT DATA(lt_fam_read).

    cl_abap_unit_assert=>assert_equals( act = lines( lt_fam_read ) exp = 3 ).

    // Validación Semáforo Rojo
    DATA(ls_fam1) = lt_fam_read[ FamiliaId = 'FAM-FRIO' ].
    cl_abap_unit_assert=>assert_equals(
      act = ls_fam1-CriticalityCode
      exp = 1
      msg = 'Familia Frío >=90% debe tener criticidad 1 (Rojo)'
    ).

    // Validación Semáforo Amarillo
    DATA(ls_fam2) = lt_fam_read[ FamiliaId = 'FAM-SELE' ].
    cl_abap_unit_assert=>assert_equals(
      act = ls_fam2-CriticalityCode
      exp = 2
      msg = 'Familia Racks 80-90% debe tener criticidad 2 (Amarillo)'
    ).

    // Validación Semáforo Verde
    DATA(ls_fam3) = lt_fam_read[ FamiliaId = 'FAM-FARM' ].
    cl_abap_unit_assert=>assert_equals(
      act = ls_fam3-CriticalityCode
      exp = 3
      msg = 'Familia Farmacéuticos <80% debe tener criticidad 3 (Verde)'
    ).
  ENDMETHOD.

  /* ======================================================================
     TEST CASE 5A: Validación de Capacidad - Error TotalPositions <= 0
     ====================================================================== */
  METHOD test_validar_capacidad_cero.
    DATA lt_create TYPE TABLE FOR CREATE r_kpialmacensede\\KpiAlmacenSede.

    // Capacidad inválida: TotalPositions = 0
    lt_create = VALUE #( (
      %cid                    = 'CID_ERR_ZERO'
      SedeId                  = 'CD_TEST_01'
      TotalPositions          = 0
      OccupiedPositions       = 10
      %control-SedeId         = if_abap_behv=>mk-on
      %control-TotalPositions = if_abap_behv=>mk-on
    ) ).

    MODIFY ENTITIES OF r_kpialmacensede IN LOCAL MODE
      ENTITY KpiAlmacenSede
      CREATE FROM lt_create
      MAPPED DATA(ls_mapped)
      FAILED DATA(ls_failed)
      REPORTED DATA(ls_reported).

    // En RAP on save / prepare, la validación debe marcar failed
    cl_abap_unit_assert=>assert_not_initial(
      act = ls_failed-kpialmacensede
      msg = 'Debe fallar cuando TotalPositions es menor o igual a cero'
    ).
    cl_abap_unit_assert=>assert_not_initial(
      act = ls_reported-kpialmacensede
      msg = 'Debe reportar mensaje explicativo de error de capacidad'
    ).
  ENDMETHOD.

  /* ======================================================================
     TEST CASE 5B: Validación de Capacidad - Error OccupiedPositions < 0
     ====================================================================== */
  METHOD test_validar_capacidad_neg.
    DATA lt_create TYPE TABLE FOR CREATE r_kpialmacensede\\KpiAlmacenSede.

    // Ocupadas inválidas: valor negativo
    lt_create = VALUE #( (
      %cid                       = 'CID_ERR_NEG'
      SedeId                     = 'CD_TEST_02'
      TotalPositions             = 5000
      OccupiedPositions          = -150
      %control-SedeId            = if_abap_behv=>mk-on
      %control-TotalPositions    = if_abap_behv=>mk-on
      %control-OccupiedPositions = if_abap_behv=>mk-on
    ) ).

    MODIFY ENTITIES OF r_kpialmacensede IN LOCAL MODE
      ENTITY KpiAlmacenSede
      CREATE FROM lt_create
      MAPPED DATA(ls_mapped)
      FAILED DATA(ls_failed)
      REPORTED DATA(ls_reported).

    cl_abap_unit_assert=>assert_not_initial(
      act = ls_failed-kpialmacensede
      msg = 'Debe fallar cuando OccupiedPositions es negativa'
    ).
  ENDMETHOD.

  /* ======================================================================
     TEST CASE 5C: Validación de Capacidad - Error Sobrecupo Físico
     ====================================================================== */
  METHOD test_validar_sobrecupo_error.
    DATA lt_create TYPE TABLE FOR CREATE r_kpialmacensede\\KpiAlmacenSede.

    // Sobrecupo: 6,000 ocupadas en almacén de 5,000
    lt_create = VALUE #( (
      %cid                       = 'CID_ERR_OVER'
      SedeId                     = 'CD_TEST_03'
      TotalPositions             = 5000
      OccupiedPositions          = 6000
      %control-SedeId            = if_abap_behv=>mk-on
      %control-TotalPositions    = if_abap_behv=>mk-on
      %control-OccupiedPositions = if_abap_behv=>mk-on
    ) ).

    MODIFY ENTITIES OF r_kpialmacensede IN LOCAL MODE
      ENTITY KpiAlmacenSede
      CREATE FROM lt_create
      MAPPED DATA(ls_mapped)
      FAILED DATA(ls_failed)
      REPORTED DATA(ls_reported).

    cl_abap_unit_assert=>assert_not_initial(
      act = ls_failed-kpialmacensede
      msg = 'Debe rechazar la persistencia cuando las ocupadas superan el total físico'
    ).
  ENDMETHOD.

  /* ======================================================================
     TEST CASE 5D: Validación de Capacidad - Caso Aprobado
     ====================================================================== */
  METHOD test_validar_capacidad_ok.
    DATA lt_create TYPE TABLE FOR CREATE r_kpialmacensede\\KpiAlmacenSede.

    // Consistente: 8,400 totales, 6,216 ocupadas
    lt_create = VALUE #( (
      %cid                       = 'CID_VAL_OK'
      SedeId                     = 'CD_PRADERAS'
      TotalPositions             = 8400
      OccupiedPositions          = 6216
      %control-SedeId            = if_abap_behv=>mk-on
      %control-TotalPositions    = if_abap_behv=>mk-on
      %control-OccupiedPositions = if_abap_behv=>mk-on
    ) ).

    MODIFY ENTITIES OF r_kpialmacensede IN LOCAL MODE
      ENTITY KpiAlmacenSede
      CREATE FROM lt_create
      MAPPED DATA(ls_mapped)
      FAILED DATA(ls_failed).

    cl_abap_unit_assert=>assert_initial(
      act = ls_failed-kpialmacensede
      msg = 'Los datos consistentes no deben arrojar errores de validación'
    ).
  ENDMETHOD.

  /* ======================================================================
     TEST CASE 6: Ejecución de Acción sincronizarKpis
     ====================================================================== */
  METHOD test_sincronizar_kpis_action.
    // 1. Crear registro base de la sede
    DATA lt_create TYPE TABLE FOR CREATE r_kpialmacensede\\KpiAlmacenSede.
    lt_create = VALUE #( (
      %cid                    = 'CID_SYNC_01'
      SedeId                  = 'CD_EUCALIPTOS'
      TotalPositions          = 1000
      %control-SedeId         = if_abap_behv=>mk-on
      %control-TotalPositions = if_abap_behv=>mk-on
    ) ).

    MODIFY ENTITIES OF r_kpialmacensede IN LOCAL MODE
      ENTITY KpiAlmacenSede
      CREATE FROM lt_create
      MAPPED DATA(ls_mapped).

    // 2. Invocar acción bound sincronizarKpis con parámetros
    DATA lt_action TYPE TABLE FOR ACTION r_kpialmacensede\\KpiAlmacenSede~sincronizarKpis.
    lt_action = VALUE #( (
      %tky = ls_mapped-kpialmacensede[ 1 ]-%tky
      %param = VALUE #(
        frecuencia_min   = 15
        incluir_mb51     = abap_true
        incluir_lt23     = abap_true
        incluir_lx03     = abap_true
        incluir_onedrive = abap_true
        comentario       = 'Test Unitario ABAP Unit Sincronización WMS'
      )
    ) ).

    MODIFY ENTITIES OF r_kpialmacensede IN LOCAL MODE
      ENTITY KpiAlmacenSede
      EXECUTE sincronizarKpis FROM lt_action
      RESULT DATA(lt_result)
      FAILED DATA(ls_failed_act)
      REPORTED DATA(ls_reported_act).

    // Aserciones sobre la acción
    cl_abap_unit_assert=>assert_initial(
      act = ls_failed_act-kpialmacensede
      msg = 'La acción sincronizarKpis debe ejecutarse con éxito'
    ).
    cl_abap_unit_assert=>assert_not_initial(
      act = lt_result
      msg = 'La acción debe retornar el registro actualizado en el result'
    ).

    DATA(ls_res) = lt_result[ 1 ].
    cl_abap_unit_assert=>assert_equals(
      act = ls_res-%param-SedeId
      exp = 'CD_EUCALIPTOS'
      msg = 'La sede retornada en el resultado debe ser CD_EUCALIPTOS'
    ).
    cl_abap_unit_assert=>assert_equals(
      act = ls_res-%param-TotalPositions
      exp = 15200
      msg = 'TotalPositions debe actualizarse al valor simulado de MB51/LX03 (15200)'
    ).
    cl_abap_unit_assert=>assert_equals(
      act = ls_res-%param-OccupancyRate
      exp = CONV p( '92.00' )
      msg = 'OccupancyRate debe ser 92.00% tras la sincronización'
    ).
    cl_abap_unit_assert=>assert_not_initial(
      act = ls_reported_act-kpialmacensede
      msg = 'Debe generarse un mensaje informativo de éxito en reported'
    ).
  ENDMETHOD.

ENDCLASS.
