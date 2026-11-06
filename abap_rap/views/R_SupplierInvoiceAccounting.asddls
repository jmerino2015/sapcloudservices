@AccessControl.authorizationCheck: #CHECK
@EndUserText.label: 'Entidad Raíz Factura Proveedor Contabilidad'
define root view entity R_SupplierInvoiceAccounting
  as select from ztb_supp_inv_acc
  composition [0..*] of R_SupplierInvoiceItemAccounting as _Items
  association [0..1] to I_Currency                       as _Currency on $projection.CurrencyCode = _Currency.Currency
{
  key invoice_uuid          as InvoiceUUID,
      invoice_number        as InvoiceNumber,
      supplier_ruc          as SupplierRUC,
      supplier_name         as SupplierName,
      purchase_order        as PurchaseOrder,
      entry_sheet_migo      as EntrySheetMIGO,
      
      @Semantics.amount.currencyCode: 'CurrencyCode'
      gross_amount          as GrossAmount,
      currency_code         as CurrencyCode,
      
      @Semantics.amount.currencyCode: 'CurrencyCode'
      tax_amount            as TaxAmount,
      
      @Semantics.amount.currencyCode: 'CurrencyCode'
      detraction_amount     as DetractionAmount,
      
      @Semantics.amount.currencyCode: 'CurrencyCode'
      retention_amount      as RetentionAmount,
      
      @Semantics.amount.currencyCode: 'CurrencyCode'
      net_payable_amount    as NetPayableAmount,
      
      fiscal_status         as FiscalStatus,
      sap_doc_mm            as SAPDocMM,
      sap_doc_fi            as SAPDocFI,
      fiscal_year           as FiscalYear,
      posting_date          as PostingDate,
      due_date              as DueDate,
      receipt_stamp_detected as ReceiptStampDetected,
      sunat_status          as SunatStatus,
      three_way_match_status as ThreeWayMatchStatus,
      
      @Semantics.amount.currencyCode: 'CurrencyCode'
      match_variance_amount as MatchVarianceAmount,
      observation_notes     as ObservationNotes,

      case fiscal_status
        when 'CONTABILIZADO'  then 1
        when 'PRE_REGISTRADO' then 3
        when 'OBSERVADO'      then 2
        when 'RECHAZADO'      then 2
        else 0
      end                   as FiscalStatusCriticality,

      case sunat_status
        when 'ACEPTADO'       then 1
        when 'OBSERVADO'      then 2
        when 'ANULADO'        then 2
        else 3
      end                   as SunatStatusCriticality,

      case three_way_match_status
        when 'CONCILIADO'     then 1
        when 'DISCREPANCIA'   then 2
        else 3
      end                   as ThreeWayMatchCriticality,

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
