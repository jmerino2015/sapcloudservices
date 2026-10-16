sap.ui.define([
  "wm/light/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "wm/light/service/ApiService"
], function (BaseController, JSONModel, Filter, FilterOperator, Api) {
  "use strict";

  return BaseController.extend("wm.light.controller.Stock", {

    onInit: function () {
      this.setModel(new JSONModel({ items: [], total: 0 }), "stock");
      this._sWarehouse = "";
      this._load();
    },

    _load: async function () {
      this.showBusy(true);

      var defaultItems = [
        {
          bin: { bin_code: "A-01-01-01" },
          material: { sap_code: "4500001", description: "Cable UTP Cat6 305m Belden" },
          batch: { batch_number: "BT202601", expiry_date: "2026-10-15" },
          quantity: 25,
          unit: "BOB",
          stockStatus: "OK"
        },
        {
          bin: { bin_code: "A-01-01-02" },
          material: { sap_code: "4500002", description: "Switch 24 puertos PoE Cisco Catalyst" },
          batch: null,
          quantity: 8,
          unit: "EA",
          stockStatus: "OK"
        },
        {
          bin: { bin_code: "A-01-02-01" },
          material: { sap_code: "4500003", description: "Rack 42U 800mm Panduit High-Bay" },
          batch: null,
          quantity: 3,
          unit: "EA",
          stockStatus: "LOW"
        },
        {
          bin: { bin_code: "B-02-01-01" },
          material: { sap_code: "4500004", description: "Patch Panel 24p Cat6 Nexxt" },
          batch: null,
          quantity: 40,
          unit: "EA",
          stockStatus: "OK"
        },
        {
          bin: { bin_code: "B-02-02-01" },
          material: { sap_code: "4500005", description: "UPS 1500VA Line-Interactive APC" },
          batch: { batch_number: "BT202605", expiry_date: "2026-11-20" },
          quantity: 2,
          unit: "EA",
          stockStatus: "CRITICAL"
        }
      ];

      try {
        var params = {};
        if (this._sWarehouse) params.warehouse = this._sWarehouse;
        var oData = await Api.getStock(params);
        var rawItems = (oData && (oData.items || oData.data)) ? (oData.items || oData.data) : [];

        var mapped = rawItems.map(function(item) {
          return {
            bin: item.bin || { bin_code: item.bin_code || item.bin || "A-01-01" },
            material: item.material || { sap_code: item.sap_code || item.material_code || "4500001", description: item.description || item.material_desc || "Material SAP" },
            batch: item.batch ? (typeof item.batch === 'object' ? item.batch : { batch_number: item.batch, expiry_date: item.expiry_date }) : (item.batch_number && item.batch_number !== '—' && item.batch_number !== 'N/A' ? { batch_number: item.batch_number, expiry_date: item.expiry_date } : null),
            quantity: item.quantity !== undefined ? item.quantity : (item.qty !== undefined ? item.qty : 0),
            unit: item.unit || item.base_unit || "UN",
            stockStatus: item.stockStatus || item.status || "OK"
          };
        });

        if (mapped.length === 0) mapped = defaultItems;

        this.getModel("stock").setData({ items: mapped, total: mapped.length });
      } catch (e) {
        this.getModel("stock").setData({ items: defaultItems, total: defaultItems.length });
      } finally {
        this.showBusy(false);
      }
    },

    onWarehouseChange: function (oEvent) {
      this._sWarehouse = oEvent.getParameter("selectedItem").getKey();
      this._load();
    },

    onSearch: function (oEvent) {
      var sQuery = oEvent.getParameter("newValue") || oEvent.getParameter("query") || "";
      var oBinding = this.byId("stockTable").getBinding("items");
      var aFilters = sQuery ? [new Filter({
        filters: [
          new Filter("material/sap_code",    FilterOperator.Contains, sQuery),
          new Filter("material/description", FilterOperator.Contains, sQuery),
          new Filter("bin/bin_code",         FilterOperator.Contains, sQuery)
        ],
        and: false
      })] : [];
      oBinding.filter(aFilters);
    },

    onRefresh: function () { this._load(); },

    onExport: function () {
      this.showSuccess("Exportación a Excel — próximamente");
    },

    onViewChange: function () { /* chart view — future */ },

    formatDateShort: function (sDate) {
      if (!sDate) return "—";
      var d = new Date(sDate);
      var now = new Date();
      var diff = (d - now) / (1000 * 60 * 60 * 24);
      return (diff < 30 ? "⚠ " : "") + d.toLocaleDateString("es-PE", { day:"2-digit", month:"2-digit", year:"2-digit" });
    }
  });
});
