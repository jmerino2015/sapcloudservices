@AccessControl.authorizationCheck: #CHECK
@EndUserText.label: 'ProcureCore: Evento Sourcing Base'
define root view entity R_ProcureEvent
  as select from ztb_procrfx
  association [0..1] to I_Currency as _Currency on $projection.CurrencyCode = _Currency.Currency
{
  key event_uuid         as EventUUID,
      event_id           as EventID,
      title              as Title,
      event_type         as EventType,
      category           as Category,
      @Semantics.amount.currencyCode: 'CurrencyCode'
      target_spend       as TargetSpend,
      @Semantics.amount.currencyCode: 'CurrencyCode'
      lowest_bid_amount  as LowestBidAmount,
      @Semantics.amount.currencyCode: 'CurrencyCode'
      projected_savings  as ProjectedSavings,
      savings_percentage as SavingsPercentage,
      currency_code      as CurrencyCode,
      status             as Status,

      // Criticality semántico Fiori Horizon
      case status
        when 'PUBLISHED' then 3 -- Warning / En Convocatoria (Naranja)
        when 'ACTIVE'    then 2 -- Crítico / Subasta en Vivo
        when 'AWARDED'   then 1 -- Positivo / Adjudicado (Verde)
        when 'CLOSED'    then 0 -- Neutral / Cerrado (Slate)
        else 0
      end                as StatusCriticality,

      supplier_count     as SupplierCount,
      bids_count         as BidsCount,
      closing_date       as ClosingDate,
      awarded_supplier   as AwardedSupplier,

      // Auditoría Temporal & ETag Clean Core
      @Semantics.user.createdBy: true
      created_by         as CreatedBy,
      @Semantics.systemDateTime.createdAt: true
      created_at         as CreatedAt,
      @Semantics.user.lastChangedBy: true
      last_changed_by    as LastChangedBy,
      @Semantics.systemDateTime.lastChangedAt: true
      last_changed_at    as LastChangedAt,
      @Semantics.systemDateTime.localInstanceLastChangedAt: true
      local_last_changed_at as LocalLastChangedAt,

      _Currency
}
