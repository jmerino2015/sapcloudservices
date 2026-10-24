@EndUserText.label: 'ProcureCore: Consumo Guided Buying Requisitions'
@AccessControl.authorizationCheck: #CHECK
@Metadata.allowExtensions: true
@Search.searchable: true
define root view entity C_ProcureRequisition
  provider contract transactional_query
  as projection on R_ProcureRequisition
{
  key RequisitionUUID,
      @Search.defaultSearchElement: true
      @Search.fuzzinessThreshold: 0.8
      RequisitionID,
      @Search.defaultSearchElement: true
      @Search.fuzzinessThreshold: 0.8
      Description,
      CompanyCode,
      Plant,
      PurchasingOrg,
      PurchasingGroup,
      RequesterName,
      Department,
      TotalAmount,
      CurrencyCode,
      Status,
      StatusCriticality,
      ApprovalLevel,
      SAPPoNumber,
      ItemCount,
      ItemsJson,
      LocalLastChangedAt,

      _Currency
}
