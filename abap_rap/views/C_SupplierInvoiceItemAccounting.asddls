@EndUserText.label: 'Proyección Posición Factura Contable'
@AccessControl.authorizationCheck: #CHECK
@Metadata.allowExtensions: true
@Search.searchable: true
define view entity C_SupplierInvoiceItemAccounting
  provider contract transactional_query
  as projection on R_SupplierInvoiceItemAccounting
{
  key ItemUUID,
      InvoiceUUID,
      ItemPosition,
      
      @Search.defaultSearchElement: true
      MaterialCode,
      
      @Search.defaultSearchElement: true
      @Search.fuzzinessThreshold: 0.8
      MaterialDescription,
      
      Quantity,
      UnitOfMeasure,
      UnitPrice,
      NetAmount,
      TaxAmount,
      CurrencyCode,
      GLAccount,
      CostCenter,
      POItemReference,
      MIGOItemReference,
      LocalLastChangedAt,
      
      _SupplierInvoice : redirected to parent C_SupplierInvoiceAccounting,
      _Currency
}
