@AccessControl.authorizationCheck: #CHECK
@EndUserText.label: 'ProcureCore: Requisición Guided Buying Base'
define root view entity R_ProcureRequisition
  as select from ztb_procpr
  association [0..1] to I_Currency as _Currency on $projection.CurrencyCode = _Currency.Currency
{
  key requisition_uuid as RequisitionUUID,
      requisition_id   as RequisitionID,
      description      as Description,
      company_code     as CompanyCode,
      plant            as Plant,
      purchasing_org   as PurchasingOrg,
      purchasing_group as PurchasingGroup,
      requester_name   as RequesterName,
      department       as Department,

      @Semantics.amount.currencyCode: 'CurrencyCode'
      total_amount     as TotalAmount,
      currency_code    as CurrencyCode,
      status           as Status,

      // Criticality funcional para Estado de Requisición
      case status
        when 'PENDING_APPROVAL' then 3 -- Warning / Pendiente (Naranja)
        when 'APPROVED'         then 1 -- Positivo / Aprobado (Verde)
        when 'PO_CREATED'       then 1 -- Positivo / Pedido Generado (Verde)
        when 'REJECTED'         then 1 -- Gestionado
        else 0
      end              as StatusCriticality,

      approval_level   as ApprovalLevel,
      sap_po_number    as SapPoNumber,
      item_count       as ItemCount,
      items_json       as ItemsJson,

      // Auditoría Temporal & ETag Clean Core
      @Semantics.user.createdBy: true
      created_by       as CreatedBy,
      @Semantics.systemDateTime.createdAt: true
      created_at       as CreatedAt,
      @Semantics.user.lastChangedBy: true
      last_changed_by  as LastChangedBy,
      @Semantics.systemDateTime.lastChangedAt: true
      last_changed_at  as LastChangedAt,
      @Semantics.systemDateTime.localInstanceLastChangedAt: true
      local_last_changed_at as LocalLastChangedAt,

      _Currency
}
