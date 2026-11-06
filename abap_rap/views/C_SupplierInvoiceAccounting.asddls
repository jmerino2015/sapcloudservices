@EndUserText.label: 'Proyección Factura Proveedor Contabilidad'
@AccessControl.authorizationCheck: #CHECK
@Metadata.allowExtensions: true
@Search.searchable: true
define root view entity C_SupplierInvoiceAccounting
  provider contract transactional_query
  as projection on R_SupplierInvoiceAccounting
{
  key InvoiceUUID,
      
      @Search.defaultSearchElement: true
      @Search.fuzzinessThreshold: 0.8
      InvoiceNumber,
      
      @Search.defaultSearchElement: true
      SupplierRUC,
      
      @Search.defaultSearchElement: true
      @Search.fuzzinessThreshold: 0.7
      SupplierName,
      
      @Search.defaultSearchElement: true
      PurchaseOrder,
      
      EntrySheetMIGO,
      GrossAmount,
      CurrencyCode,
      TaxAmount,
      DetractionAmount,
      RetentionAmount,
      NetPayableAmount,
      FiscalStatus,
      FiscalStatusCriticality,
      SAPDocMM,
      SAPDocFI,
      FiscalYear,
      PostingDate,
      DueDate,
      ReceiptStampDetected,
      SunatStatus,
      SunatStatusCriticality,
      ThreeWayMatchStatus,
      ThreeWayMatchCriticality,
      MatchVarianceAmount,
      ObservationNotes,
      LocalLastChangedAt,
      
      _Items : redirected to composition child C_SupplierInvoiceItemAccounting,
      _Currency
}
