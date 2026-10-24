@EndUserText.label: 'ProcureCore: Consumo Sourcing Events'
@AccessControl.authorizationCheck: #CHECK
@Metadata.allowExtensions: true
@Search.searchable: true
define root view entity C_ProcureEvent
  provider contract transactional_query
  as projection on R_ProcureEvent
{
  key EventUUID,
      @Search.defaultSearchElement: true
      @Search.fuzzinessThreshold: 0.8
      EventID,
      @Search.defaultSearchElement: true
      @Search.fuzzinessThreshold: 0.8
      Title,
      EventType,
      Category,
      TargetSpend,
      LowestBidAmount,
      ProjectedSavings,
      SavingsPercentage,
      CurrencyCode,
      Status,
      StatusCriticality,
      SupplierCount,
      BidsCount,
      ClosingDate,
      AwardedSupplier,
      LocalLastChangedAt,

      _Currency
}
