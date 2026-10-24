@EndUserText.label: 'ProcureCore: Consumo Smart Invoicing'
@AccessControl.authorizationCheck: #CHECK
@Metadata.allowExtensions: true
@Search.searchable: true
define root view entity C_ProcureInvoice
  provider contract transactional_query
  as projection on R_ProcureInvoice
{
  key InvoiceUUID,
      @Search.defaultSearchElement: true
      @Search.fuzzinessThreshold: 0.8
      InvoiceID,
      @Search.defaultSearchElement: true
      SupplierInvoiceNumber,
      @Search.defaultSearchElement: true
      SupplierTaxID,
      SupplierName,
      @Search.defaultSearchElement: true
      SapPoNumber,
      SapGrNumber,
      PoAmount,
      GrAmount,
      InvoiceAmount,
      VarianceAmount,
      VariancePercentage,
      CurrencyCode,
      MatchStatus,
      MatchCriticality,
      PaymentStatus,
      PaymentCriticality,
      PaymentBlockReason,
      DueDate,
      LocalLastChangedAt,

      _Currency
}
