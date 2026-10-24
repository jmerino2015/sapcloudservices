@AccessControl.authorizationCheck: #CHECK
@EndUserText.label: 'ProcureCore: Smart Invoicing & 3-Way Match Base'
define root view entity R_ProcureInvoice
  as select from ztb_procinv
  association [0..1] to I_Currency as _Currency on $projection.CurrencyCode = _Currency.Currency
{
  key invoice_uuid            as InvoiceUUID,
      invoice_id              as InvoiceID,
      supplier_invoice_number as SupplierInvoiceNumber,
      supplier_tax_id         as SupplierTaxID,
      supplier_name           as SupplierName,
      sap_po_number           as SapPoNumber,
      sap_gr_number           as SapGrNumber,

      @Semantics.amount.currencyCode: 'CurrencyCode'
      po_amount               as PoAmount,
      @Semantics.amount.currencyCode: 'CurrencyCode'
      gr_amount               as GrAmount,
      @Semantics.amount.currencyCode: 'CurrencyCode'
      invoice_amount          as InvoiceAmount,
      @Semantics.amount.currencyCode: 'CurrencyCode'
      variance_amount         as VarianceAmount,
      variance_percentage     as VariancePercentage,
      currency_code           as CurrencyCode,
      match_status            as MatchStatus,

      // Criticality funcional para 3-Way Matching Fiori Horizon
      case match_status
        when 'MATCHED'           then 1 -- Positivo / Touchless 3-Way OK (Verde #107e3e)
        when 'DISCREPANCY_PRICE' then 3 -- Warning / Discrepancia Precio (Naranja #e06a3b)
        when 'DISCREPANCY_QTY'   then 3 -- Warning / Discrepancia Cantidad (Naranja #e06a3b)
        when 'REJECTED'          then 2 -- Crítico / Rechazado
        else 0                          -- Neutral / En Proceso (Slate)
      end                     as MatchCriticality,

      payment_status          as PaymentStatus,

      case payment_status
        when 'SCHEDULED' then 1 -- Verde
        when 'BLOCKED'   then 2 -- Naranja
        when 'PAID'      then 1 -- Verde
        else 0
      end                     as PaymentCriticality,

      payment_block_reason    as PaymentBlockReason,
      due_date                as DueDate,

      // Auditoría Temporal & ETag Clean Core
      @Semantics.user.createdBy: true
      created_by              as CreatedBy,
      @Semantics.systemDateTime.createdAt: true
      created_at              as CreatedAt,
      @Semantics.user.lastChangedBy: true
      last_changed_by         as LastChangedBy,
      @Semantics.systemDateTime.lastChangedAt: true
      last_changed_at         as LastChangedAt,
      @Semantics.systemDateTime.localInstanceLastChangedAt: true
      local_last_changed_at   as LocalLastChangedAt,

      _Currency
}
