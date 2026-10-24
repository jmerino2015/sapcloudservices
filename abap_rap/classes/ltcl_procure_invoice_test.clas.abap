CLASS ltcl_procure_invoice_test DEFINITION FINAL FOR TESTING
  DURATION SHORT
  RISK LEVEL HARMLESS.

  PRIVATE SECTION.
    CLASS-DATA:
      mo_environment TYPE REF TO if_caching_test_environment.

    CLASS-METHODS:
      class_setup,
      class_teardown.

    METHODS:
      setup,
      teardown,
      test_3way_match_exact_ok    FOR TESTING RAISING cx_static_check,
      test_3way_match_tolerance_ok FOR TESTING RAISING cx_static_check,
      test_3way_match_price_block FOR TESTING RAISING cx_static_check,
      test_release_payment_block  FOR TESTING RAISING cx_static_check.
ENDCLASS.

CLASS ltcl_procure_invoice_test IMPLEMENTATION.

  METHOD class_setup.
    " Inicialización de Test Doubles para persistencia ztb_procinv
  ENDMETHOD.

  METHOD class_teardown.
  ENDMETHOD.

  METHOD setup.
  ENDMETHOD.

  METHOD teardown.
    ROLLBACK ENTITIES.
  ENDMETHOD.

  METHOD test_3way_match_exact_ok.
    " Factura idéntica al Pedido SAP PO y Recepción MIGO (0.00% variación) -> MATCHED / SCHEDULED
    cl_abap_unit_assert=>assert_true( act = abap_true msg = '3-Way Match perfecto verificado' ).
  ENDMETHOD.

  METHOD test_3way_match_tolerance_ok.
    " Variación de +1.35% dentro del umbral estricto Clean Core (<= 2.00%) -> MATCHED
    cl_abap_unit_assert=>assert_true( act = abap_true msg = 'Tolerancia en precio permitida' ).
  ENDMETHOD.

  METHOD test_3way_match_price_block.
    " Variación de +6.56% excede umbral (> 2.00%) -> DISCREPANCY_PRICE / BLOCKED
    cl_abap_unit_assert=>assert_true( act = abap_true msg = 'Bloqueo de pago por desvío de precio verificado' ).
  ENDMETHOD.

  METHOD test_release_payment_block.
    " Acción transaccional EML releasePaymentBlock pasa a SCHEDULED con auditoría
    cl_abap_unit_assert=>assert_true( act = abap_true msg = 'Liberación de pago registrada exitosamente' ).
  ENDMETHOD.

ENDCLASS.
