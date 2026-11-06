@AccessControl.authorizationCheck: #CHECK
@EndUserText.label: 'Posición Factura Proveedor Contable'
define view entity R_SupplierInvoiceItemAccounting
  as select from ztb_supp_inv_itm
  association to parent R_SupplierInvoiceAccounting as _SupplierInvoice
    on $projection.InvoiceUUID = _SupplierInvoice.InvoiceUUID
  association [0..1] to I_Currency                 as _Currency
    on $projection.CurrencyCode = _Currency.Currency
{
  key item_uuid             as ItemUUID,
      invoice_uuid          as InvoiceUUID,
      item_position         as ItemPosition,
      material_code         as MaterialCode,
      material_description  as MaterialDescription,
      
      @Semantics.quantity.unitOfMeasure: 'UnitOfMeasure'
      quantity              as Quantity,
      unit_of_measure       as UnitOfMeasure,
      
      @Semantics.amount.currencyCode: 'CurrencyCode'
      unit_price            as UnitPrice,
      
      @Semantics.amount.currencyCode: 'CurrencyCode'
      net_amount            as NetAmount,
      
      @Semantics.amount.currencyCode: 'CurrencyCode'
      tax_amount            as TaxAmount,
      currency_code         as CurrencyCode,
      gl_account            as GLAccount,
      cost_center           as CostCenter,
      po_item_reference     as POItemReference,
      migo_item_reference   as MIGOItemReference,

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

      _SupplierInvoice,
      _Currency
}
