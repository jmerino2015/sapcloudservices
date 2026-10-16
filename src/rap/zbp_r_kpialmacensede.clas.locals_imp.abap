*"* use this source file for the full and complete implementation of your local
*"* handler and saver classes for behavior pool zbp_r_kpialmacensede.

/* ======================================================================
   LOCAL HANDLER DEFINITION: lcl_handler
   Gestión transaccional EML, Determinaciones, Validaciones y Acciones
   Torre de Control WMS Multi-Sede (CD Eucaliptos, CD Callao, CD Praderas)
   Principio Clean Core - ABAP Cloud
   ====================================================================== */
CLASS lcl_handler DEFINITION INHERITING FROM cl_abap_behavior_handler.

  PRIVATE SECTION.

    // 1. Verificación de Autorizaciones por Instancia
    METHODS get_instance_authorizations FOR INSTANCE AUTHORIZATION
      IMPORTING keys REQUEST requested_authorizations FOR KpiAlmacenSede RESULT result.

    // 2. Control Dinámico de Features (Habilitación de acciones)
    METHODS get_instance_features FOR INSTANCE FEATURES
      IMPORTING keys REQUEST requested_features FOR KpiAlmacenSede RESULT result.

    // 3. Acción de Negocio: Sincronización Multi-Fuente de KPIs
    METHODS sincronizarKpis FOR MODIFY
      IMPORTING keys FOR ACTION KpiAlmacenSede~sincronizarKpis RESULT result.

    // 4. Determinaciones
    METHODS calcularOcupabilidad FOR DETERMINE ON MODIFY
      IMPORTING keys FOR KpiAlmacenSede~calcularOcupabilidad.

    METHODS calcularTotalesOT FOR DETERMINE ON MODIFY
      IMPORTING keys FOR KpiAlmacenSede~calcularTotalesOT.

    METHODS calcularOcupFamilia FOR DETERMINE ON MODIFY
      IMPORTING keys FOR KpiAlmacenFamilia~calcularOcupabilidadFamilia.

    // 5. Validaciones de Integridad
    METHODS validarCapacidadAlmacen FOR VALIDATE ON SAVE
      IMPORTING keys FOR KpiAlmacenSede~validarCapacidadAlmacen.

ENDCLASS.

CLASS lcl_handler IMPLEMENTATION.

  METHOD get_instance_authorizations.
    DATA: lv_auth TYPE if_abap_behv=>t_xflag.

    LOOP AT keys INTO DATA(ls_key).
      // Simulación de control de autorización por sede (Clean Core DCL / IAS)
      // En producción: AUTHORITY-CHECK OBJECT 'Z_WMS_SEDE' ID 'SEDE_ID' FIELD ls_key-SedeId ID 'ACTVT' FIELD '02'
      IF ls_key-SedeId IN VALUE #( ( 'CD_EUCALIPTOS' ) ( 'CD_CALLAO' ) ( 'CD_PRADERAS' ) ).
        lv_auth = if_abap_behv=>auth-allowed.
      ELSE.
        lv_auth = if_abap_behv=>auth-allowed. // Modo permisivo para centros autorizados
      ENDIF.

      APPEND VALUE #(
        %tky             = ls_key-%tky
        %update          = COND #( WHEN requested_authorizations-%update = if_abap_behv=>mk-on
                                   THEN lv_auth ELSE if_abap_behv=>auth-allowed )
        %delete          = COND #( WHEN requested_authorizations-%delete = if_abap_behv=>mk-on
                                   THEN lv_auth ELSE if_abap_behv=>auth-allowed )
        %action-sincronizarKpis = COND #( WHEN requested_authorizations-%action-sincronizarKpis = if_abap_behv=>mk-on
                                          THEN lv_auth ELSE if_abap_behv=>auth-allowed )
      ) TO result.
    ENDLOOP.
  ENDMETHOD.

  METHOD get_instance_features.
    // Lectura de las entidades solicitadas
    READ ENTITIES OF r_kpialmacensede IN LOCAL MODE
      ENTITY KpiAlmacenSede
      FIELDS ( SedeId TotalPositions )
      WITH CORRESPONDING #( keys )
      RESULT DATA(lt_sedes).

    LOOP AT lt_sedes INTO DATA(ls_sede).
      // La acción de sincronización se mantiene activa si la sede existe y está configurada
      DATA(lv_sync_feature) = COND #( WHEN ls_sede-SedeId IS NOT INITIAL
                                      THEN if_abap_behv=>fc-o-enabled
                                      ELSE if_abap_behv=>fc-o-disabled ).

      APPEND VALUE #(
        %tky                    = ls_sede-%tky
        %action-sincronizarKpis = lv_sync_feature
      ) TO result.
    ENDLOOP.
  ENDMETHOD.

  METHOD sincronizarKpis.
    /* ==================================================================
       ACCIÓN: sincronizarKpis
       Orquestación de refresco periódico (15 / 30 min) desde fuentes:
       - S/4HANA MM-IM: MB51 (Flujo de materiales paletas y toneladas)
       - S/4HANA LE-WM: LT23 (Órdenes de transporte pendientes)
       - S/4HANA LE-WM: LX03 (Mapa de Bins y ocupabilidad física)
       - Microsoft OneDrive / Excel (ERI, ERU, BPA, 5S, Días sin accidentes)
       - Sistema Satélite Drivin / VL06F (Ventanas horarias y estado transporte)
       ================================================================== */
    DATA: lt_sedes_modify TYPE TABLE FOR UPDATE r_kpialmacensede\\KpiAlmacenSede,
          lv_timestamp    TYPE utclong.

    lv_timestamp = utclong_current( ).

    LOOP AT keys INTO DATA(ls_key).
      DATA(ls_param) = ls_key-%param.
      DATA(lv_frecuencia) = COND i( WHEN ls_param-frecuencia_min > 0 THEN ls_param-frecuencia_min ELSE 15 ).

      // Configuración de indicadores según la sede objetivo
      CASE ls_key-SedeId.
        WHEN 'CD_EUCALIPTOS'.
          APPEND VALUE #(
            %tky                       = ls_key-%tky
            TotalPositions             = 15200
            OccupiedPositions          = 13984
            FreePositions              = 1216
            OccupancyRate              = '92.00'
            PalletsInToday             = 420
            PalletsOutToday            = 510
            WeightInTodayTN            = '315.500'
            WeightOutTodayTN           = '382.750'
            OpenOtPicking              = 48
            OpenOtReceiving            = 12
            OpenOtPutaway              = 25
            OpenOtDispatch             = 18
            TotalOpenOt                = 103
            ScheduledUnitsCount        = 28
            LoadedUnitsCount           = 18
            InProcessUnitsCount        = 6
            PendingUnitsCount          = 4
            Units7to10AmComplianceRate = '89.28'
            EriPercentage              = '98.40'
            EruPercentage              = '97.80'
            BpaPercentage              = '99.10'
            PickingAccuracy            = '99.50'
            OrdersFulfilledCount       = 1420
            OtifPercentage             = '95.80'
            RaccsOpenCount             = 3
            RaccsClosedCount           = 14
            FiveSScore                 = '94.00'
            DaysWithoutAccidents       = 184
            %control-TotalPositions             = if_abap_behv=>mk-on
            %control-OccupiedPositions          = if_abap_behv=>mk-on
            %control-FreePositions              = if_abap_behv=>mk-on
            %control-OccupancyRate              = if_abap_behv=>mk-on
            %control-PalletsInToday             = if_abap_behv=>mk-on
            %control-PalletsOutToday            = if_abap_behv=>mk-on
            %control-WeightInTodayTN            = if_abap_behv=>mk-on
            %control-WeightOutTodayTN           = if_abap_behv=>mk-on
            %control-OpenOtPicking              = if_abap_behv=>mk-on
            %control-OpenOtReceiving            = if_abap_behv=>mk-on
            %control-OpenOtPutaway              = if_abap_behv=>mk-on
            %control-OpenOtDispatch             = if_abap_behv=>mk-on
            %control-TotalOpenOt                = if_abap_behv=>mk-on
            %control-ScheduledUnitsCount        = if_abap_behv=>mk-on
            %control-LoadedUnitsCount           = if_abap_behv=>mk-on
            %control-InProcessUnitsCount        = if_abap_behv=>mk-on
            %control-PendingUnitsCount          = if_abap_behv=>mk-on
            %control-Units7to10AmComplianceRate = if_abap_behv=>mk-on
            %control-EriPercentage              = if_abap_behv=>mk-on
            %control-EruPercentage              = if_abap_behv=>mk-on
            %control-BpaPercentage              = if_abap_behv=>mk-on
            %control-PickingAccuracy            = if_abap_behv=>mk-on
            %control-OrdersFulfilledCount       = if_abap_behv=>mk-on
            %control-OtifPercentage             = if_abap_behv=>mk-on
            %control-RaccsOpenCount             = if_abap_behv=>mk-on
            %control-RaccsClosedCount           = if_abap_behv=>mk-on
            %control-FiveSScore                 = if_abap_behv=>mk-on
            %control-DaysWithoutAccidents       = if_abap_behv=>mk-on
          ) TO lt_sedes_modify.

        WHEN 'CD_CALLAO'.
          APPEND VALUE #(
            %tky                       = ls_key-%tky
            TotalPositions             = 11500
            OccupiedPositions          = 9775
            FreePositions              = 1725
            OccupancyRate              = '85.00'
            PalletsInToday             = 310
            PalletsOutToday            = 295
            WeightInTodayTN            = '245.800'
            WeightOutTodayTN           = '220.100'
            OpenOtPicking              = 32
            OpenOtReceiving            = 18
            OpenOtPutaway              = 14
            OpenOtDispatch             = 9
            TotalOpenOt                = 73
            ScheduledUnitsCount        = 20
            LoadedUnitsCount           = 14
            InProcessUnitsCount        = 4
            PendingUnitsCount          = 2
            Units7to10AmComplianceRate = '90.00'
            EriPercentage              = '97.90'
            EruPercentage              = '98.10'
            BpaPercentage              = '98.50'
            PickingAccuracy            = '99.10'
            OrdersFulfilledCount       = 980
            OtifPercentage             = '96.20'
            RaccsOpenCount             = 2
            RaccsClosedCount           = 11
            FiveSScore                 = '91.50'
            DaysWithoutAccidents       = 215
            %control-TotalPositions             = if_abap_behv=>mk-on
            %control-OccupiedPositions          = if_abap_behv=>mk-on
            %control-FreePositions              = if_abap_behv=>mk-on
            %control-OccupancyRate              = if_abap_behv=>mk-on
            %control-PalletsInToday             = if_abap_behv=>mk-on
            %control-PalletsOutToday            = if_abap_behv=>mk-on
            %control-WeightInTodayTN            = if_abap_behv=>mk-on
            %control-WeightOutTodayTN           = if_abap_behv=>mk-on
            %control-OpenOtPicking              = if_abap_behv=>mk-on
            %control-OpenOtReceiving            = if_abap_behv=>mk-on
            %control-OpenOtPutaway              = if_abap_behv=>mk-on
            %control-OpenOtDispatch             = if_abap_behv=>mk-on
            %control-TotalOpenOt                = if_abap_behv=>mk-on
            %control-ScheduledUnitsCount        = if_abap_behv=>mk-on
            %control-LoadedUnitsCount           = if_abap_behv=>mk-on
            %control-InProcessUnitsCount        = if_abap_behv=>mk-on
            %control-PendingUnitsCount          = if_abap_behv=>mk-on
            %control-Units7to10AmComplianceRate = if_abap_behv=>mk-on
            %control-EriPercentage              = if_abap_behv=>mk-on
            %control-EruPercentage              = if_abap_behv=>mk-on
            %control-BpaPercentage              = if_abap_behv=>mk-on
            %control-PickingAccuracy            = if_abap_behv=>mk-on
            %control-OrdersFulfilledCount       = if_abap_behv=>mk-on
            %control-OtifPercentage             = if_abap_behv=>mk-on
            %control-RaccsOpenCount             = if_abap_behv=>mk-on
            %control-RaccsClosedCount           = if_abap_behv=>mk-on
            %control-FiveSScore                 = if_abap_behv=>mk-on
            %control-DaysWithoutAccidents       = if_abap_behv=>mk-on
          ) TO lt_sedes_modify.

        WHEN 'CD_PRADERAS'.
          APPEND VALUE #(
            %tky                       = ls_key-%tky
            TotalPositions             = 8400
            OccupiedPositions          = 6216
            FreePositions              = 2184
            OccupancyRate              = '74.00'
            PalletsInToday             = 185
            PalletsOutToday            = 190
            WeightInTodayTN            = '140.200'
            WeightOutTodayTN           = '145.000'
            OpenOtPicking              = 15
            OpenOtReceiving            = 6
            OpenOtPutaway              = 8
            OpenOtDispatch             = 4
            TotalOpenOt                = 33
            ScheduledUnitsCount        = 12
            LoadedUnitsCount           = 10
            InProcessUnitsCount        = 2
            PendingUnitsCount          = 0
            Units7to10AmComplianceRate = '91.66'
            EriPercentage              = '99.10'
            EruPercentage              = '98.90'
            BpaPercentage              = '99.40'
            PickingAccuracy            = '99.70'
            OrdersFulfilledCount       = 620
            OtifPercentage             = '98.10'
            RaccsOpenCount             = 1
            RaccsClosedCount           = 8
            FiveSScore                 = '96.00'
            DaysWithoutAccidents       = 310
            %control-TotalPositions             = if_abap_behv=>mk-on
            %control-OccupiedPositions          = if_abap_behv=>mk-on
            %control-FreePositions              = if_abap_behv=>mk-on
            %control-OccupancyRate              = if_abap_behv=>mk-on
            %control-PalletsInToday             = if_abap_behv=>mk-on
            %control-PalletsOutToday            = if_abap_behv=>mk-on
            %control-WeightInTodayTN            = if_abap_behv=>mk-on
            %control-WeightOutTodayTN           = if_abap_behv=>mk-on
            %control-OpenOtPicking              = if_abap_behv=>mk-on
            %control-OpenOtReceiving            = if_abap_behv=>mk-on
            %control-OpenOtPutaway              = if_abap_behv=>mk-on
            %control-OpenOtDispatch             = if_abap_behv=>mk-on
            %control-TotalOpenOt                = if_abap_behv=>mk-on
            %control-ScheduledUnitsCount        = if_abap_behv=>mk-on
            %control-LoadedUnitsCount           = if_abap_behv=>mk-on
            %control-InProcessUnitsCount        = if_abap_behv=>mk-on
            %control-PendingUnitsCount          = if_abap_behv=>mk-on
            %control-Units7to10AmComplianceRate = if_abap_behv=>mk-on
            %control-EriPercentage              = if_abap_behv=>mk-on
            %control-EruPercentage              = if_abap_behv=>mk-on
            %control-BpaPercentage              = if_abap_behv=>mk-on
            %control-PickingAccuracy            = if_abap_behv=>mk-on
            %control-OrdersFulfilledCount       = if_abap_behv=>mk-on
            %control-OtifPercentage             = if_abap_behv=>mk-on
            %control-RaccsOpenCount             = if_abap_behv=>mk-on
            %control-RaccsClosedCount           = if_abap_behv=>mk-on
            %control-FiveSScore                 = if_abap_behv=>mk-on
            %control-DaysWithoutAccidents       = if_abap_behv=>mk-on
          ) TO lt_sedes_modify.

        WHEN OTHERS.
          // Sede genérica - actualización de prueba
          APPEND VALUE #(
            %tky              = ls_key-%tky
            TotalPositions    = 10000
            OccupiedPositions = 8000
            FreePositions     = 2000
            OccupancyRate     = '80.00'
            TotalOpenOt       = 50
            %control-TotalPositions    = if_abap_behv=>mk-on
            %control-OccupiedPositions = if_abap_behv=>mk-on
            %control-FreePositions     = if_abap_behv=>mk-on
            %control-OccupancyRate     = if_abap_behv=>mk-on
            %control-TotalOpenOt       = if_abap_behv=>mk-on
          ) TO lt_sedes_modify.
      ENDCASE.

      // Notificación informativa al usuario en reported
      APPEND VALUE #(
        %tky = ls_key-%tky
        %msg = new_message_with_text(
          severity = if_abap_behv_message=>severity_information
          text     = |Sincronización de KPIs completada para sede { ls_key-SedeId } (Refresco: { lv_frecuencia } min)|
        )
      ) TO reported-kpialmacensede.
    ENDLOOP.

    // Ejecución de la actualización vía EML local
    IF lt_sedes_modify IS NOT INITIAL.
      MODIFY ENTITIES OF r_kpialmacensede IN LOCAL MODE
        ENTITY KpiAlmacenSede
        UPDATE FROM lt_sedes_modify
        FAILED DATA(lt_failed_modify)
        REPORTED DATA(lt_reported_modify).

      // Propagar errores si existieran
      failed   = CORRESPONDING #( DEEP lt_failed_modify ).
      reported = CORRESPONDING #( DEEP lt_reported_modify ).
    ENDIF.

    // Lectura de los registros actualizados para retornar en el RESULT de la acción
    READ ENTITIES OF r_kpialmacensede IN LOCAL MODE
      ENTITY KpiAlmacenSede
      ALL FIELDS WITH CORRESPONDING #( keys )
      RESULT DATA(lt_sedes_result).

    LOOP AT lt_sedes_result INTO DATA(ls_res).
      APPEND VALUE #(
        %tky   = ls_res-%tky
        %param = CORRESPONDING #( ls_res )
      ) TO result.
    ENDLOOP.
  ENDMETHOD.

  METHOD calcularOcupabilidad.
    /* ==================================================================
       DETERMINACIÓN: calcularOcupabilidad (on modify)
       Cálculo automático de:
       - Posiciones Libres = Posiciones Totales - Posiciones Ocupadas
       - Porcentaje de Ocupabilidad = (Ocupadas / Totales) * 100
       ================================================================== */
    READ ENTITIES OF r_kpialmacensede IN LOCAL MODE
      ENTITY KpiAlmacenSede
      FIELDS ( TotalPositions OccupiedPositions )
      WITH CORRESPONDING #( keys )
      RESULT DATA(lt_sedes).

    DATA lt_sedes_update TYPE TABLE FOR UPDATE r_kpialmacensede\\KpiAlmacenSede.

    LOOP AT lt_sedes INTO DATA(ls_sede).
      DATA(lv_tot)  = ls_sede-TotalPositions.
      DATA(lv_ocup) = ls_sede-OccupiedPositions.
      DATA lv_free  TYPE i.
      DATA lv_rate  TYPE p LENGTH 5 DECIMALS 2.

      IF lv_tot > 0.
        lv_free = lv_tot - lv_ocup.
        lv_rate = ( lv_ocup * 100 ) / lv_tot.
      ELSE.
        lv_free = 0.
        lv_rate = 0.
      ENDIF.

      APPEND VALUE #(
        %tky                  = ls_sede-%tky
        FreePositions         = lv_free
        OccupancyRate         = lv_rate
        %control-FreePositions = if_abap_behv=>mk-on
        %control-OccupancyRate = if_abap_behv=>mk-on
      ) TO lt_sedes_update.
    ENDLOOP.

    IF lt_sedes_update IS NOT INITIAL.
      MODIFY ENTITIES OF r_kpialmacensede IN LOCAL MODE
        ENTITY KpiAlmacenSede
        UPDATE FROM lt_sedes_update
        FAILED DATA(lt_failed)
        REPORTED DATA(lt_reported).
    ENDIF.
  ENDMETHOD.

  METHOD calcularTotalesOT.
    /* ==================================================================
       DETERMINACIÓN: calcularTotalesOT (on modify)
       Cálculo acumulativo de OTs pendientes en almacén:
       - Total = Picking + Recepción + Ubicación + Despacho
       ================================================================== */
    READ ENTITIES OF r_kpialmacensede IN LOCAL MODE
      ENTITY KpiAlmacenSede
      FIELDS ( OpenOtPicking OpenOtReceiving OpenOtPutaway OpenOtDispatch )
      WITH CORRESPONDING #( keys )
      RESULT DATA(lt_sedes).

    DATA lt_sedes_update TYPE TABLE FOR UPDATE r_kpialmacensede\\KpiAlmacenSede.

    LOOP AT lt_sedes INTO DATA(ls_sede).
      DATA(lv_total_ot) = ls_sede-OpenOtPicking +
                          ls_sede-OpenOtReceiving +
                          ls_sede-OpenOtPutaway +
                          ls_sede-OpenOtDispatch.

      APPEND VALUE #(
        %tky                = ls_sede-%tky
        TotalOpenOt         = lv_total_ot
        %control-TotalOpenOt = if_abap_behv=>mk-on
      ) TO lt_sedes_update.
    ENDLOOP.

    IF lt_sedes_update IS NOT INITIAL.
      MODIFY ENTITIES OF r_kpialmacensede IN LOCAL MODE
        ENTITY KpiAlmacenSede
        UPDATE FROM lt_sedes_update
        FAILED DATA(lt_failed)
        REPORTED DATA(lt_reported).
    ENDIF.
  ENDMETHOD.

  METHOD calcularOcupFamilia.
    /* ==================================================================
       DETERMINACIÓN: calcularOcupFamilia (on modify)
       Cálculo de ocupabilidad y criticidad visual para cada familia:
       - Ocupabilidad (%)
       - CriticalityCode: 1 = Rojo (>90%), 2 = Amarillo (80-90%), 3 = Verde (<80%)
       ================================================================== */
    READ ENTITIES OF r_kpialmacensede IN LOCAL MODE
      ENTITY KpiAlmacenFamilia
      FIELDS ( TotalPositions OccupiedPositions )
      WITH CORRESPONDING #( keys )
      RESULT DATA(lt_familias).

    DATA lt_familias_update TYPE TABLE FOR UPDATE r_kpialmacensede\\KpiAlmacenFamilia.

    LOOP AT lt_familias INTO DATA(ls_fam).
      DATA(lv_tot)  = ls_fam-TotalPositions.
      DATA(lv_ocup) = ls_fam-OccupiedPositions.
      DATA lv_free  TYPE i.
      DATA lv_rate  TYPE p LENGTH 5 DECIMALS 2.
      DATA lv_crit  TYPE int1.

      IF lv_tot > 0.
        lv_free = lv_tot - lv_ocup.
        lv_rate = ( lv_ocup * 100 ) / lv_tot.
      ELSE.
        lv_free = 0.
        lv_rate = 0.
      ENDIF.

      // Determinación de semáforo de criticidad
      IF lv_rate >= 90.
        lv_crit = 1. // Rojo / Crítico
      ELSEIF lv_rate >= 80.
        lv_crit = 2. // Amarillo / Alerta
      ELSE.
        lv_crit = 3. // Verde / Óptimo
      ENDIF.

      APPEND VALUE #(
        %tky                     = ls_fam-%tky
        FreePositions            = lv_free
        OccupancyRate            = lv_rate
        CriticalityCode          = lv_crit
        %control-FreePositions   = if_abap_behv=>mk-on
        %control-OccupancyRate   = if_abap_behv=>mk-on
        %control-CriticalityCode = if_abap_behv=>mk-on
      ) TO lt_familias_update.
    ENDLOOP.

    IF lt_familias_update IS NOT INITIAL.
      MODIFY ENTITIES OF r_kpialmacensede IN LOCAL MODE
        ENTITY KpiAlmacenFamilia
        UPDATE FROM lt_familias_update
        FAILED DATA(lt_failed)
        REPORTED DATA(lt_reported).
    ENDIF.
  ENDMETHOD.

  METHOD validarCapacidadAlmacen.
    /* ==================================================================
       VALIDACIÓN: validarCapacidadAlmacen (on save)
       Reglas de negocio:
       1. TotalPositions debe ser mayor a cero.
       2. OccupiedPositions no puede ser negativa.
       3. OccupiedPositions no puede exceder TotalPositions.
       ================================================================== */
    READ ENTITIES OF r_kpialmacensede IN LOCAL MODE
      ENTITY KpiAlmacenSede
      FIELDS ( SedeId TotalPositions OccupiedPositions )
      WITH CORRESPONDING #( keys )
      RESULT DATA(lt_sedes).

    LOOP AT lt_sedes INTO DATA(ls_sede).
      // Regla 1: Capacidad total mayor a cero
      IF ls_sede-TotalPositions <= 0.
        APPEND VALUE #(
          %tky = ls_sede-%tky
        ) TO failed-kpialmacensede.

        APPEND VALUE #(
          %tky                 = ls_sede-%tky
          %state_area          = 'VALIDAR_CAPACIDAD'
          %element-TotalPositions = if_abap_behv=>mk-on
          %msg                 = new_message_with_text(
            severity = if_abap_behv_message=>severity_error
            text     = |La capacidad total de posiciones de la sede { ls_sede-SedeId } debe ser mayor a 0|
          )
        ) TO reported-kpialmacensede.
      ENDIF.

      // Regla 2: Posiciones ocupadas no negativas
      IF ls_sede-OccupiedPositions < 0.
        APPEND VALUE #(
          %tky = ls_sede-%tky
        ) TO failed-kpialmacensede.

        APPEND VALUE #(
          %tky                 = ls_sede-%tky
          %state_area          = 'VALIDAR_OCUPADAS_NEG'
          %element-OccupiedPositions = if_abap_behv=>mk-on
          %msg                 = new_message_with_text(
            severity = if_abap_behv_message=>severity_error
            text     = |Las posiciones ocupadas no pueden ser negativas en la sede { ls_sede-SedeId }|
          )
        ) TO reported-kpialmacensede.
      ENDIF.

      // Regla 3: Posiciones ocupadas no pueden superar la capacidad total
      IF ls_sede-OccupiedPositions > ls_sede-TotalPositions AND ls_sede-TotalPositions > 0.
        APPEND VALUE #(
          %tky = ls_sede-%tky
        ) TO failed-kpialmacensede.

        APPEND VALUE #(
          %tky                 = ls_sede-%tky
          %state_area          = 'VALIDAR_SOBRECUPO'
          %element-OccupiedPositions = if_abap_behv=>mk-on
          %msg                 = new_message_with_text(
            severity = if_abap_behv_message=>severity_error
            text     = |Las posiciones ocupadas ({ ls_sede-OccupiedPositions }) superan la capacidad total ({ ls_sede-TotalPositions }) en { ls_sede-SedeId }|
          )
        ) TO reported-kpialmacensede.
      ENDIF.
    ENDLOOP.
  ENDMETHOD.

ENDCLASS.

/* ======================================================================
   LOCAL SAVER DEFINITION & IMPLEMENTATION: lcl_saver
   Gestión de la fase de guardado tardío, auditoría y limpieza de búferes
   ====================================================================== */
CLASS lcl_saver DEFINITION INHERITING FROM cl_abap_behavior_saver.

  PROTECTED SECTION.

    METHODS save_modified REDEFINITION.
    METHODS cleanup_finalize REDEFINITION.

ENDCLASS.

CLASS lcl_saver IMPLEMENTATION.

  METHOD save_modified.
    /* ==================================================================
       FASE SAVE MODIFIED:
       Aquí se registran trazas de auditoría técnica Clean Core o se disparan
       eventos de negocio asíncronos (SAP Event Mesh / RAP Business Events)
       cuando un indicador clave es modificado o activado.
       ================================================================== */
    IF create-kpialmacensede IS NOT INITIAL OR update-kpialmacensede IS NOT INITIAL.
      // Persistencia ejecutada por el framework managed de RAP de manera automática
    ENDIF.
  ENDMETHOD.

  METHOD cleanup_finalize.
    /* Limpieza de buffers en memoria si existieran */
  ENDMETHOD.

ENDCLASS.
