sap.ui.define([
  "wm/light/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter","sap/ui/model/FilterOperator",
  "wm/light/service/ApiService"
], function (BaseController, JSONModel, Filter, FilterOperator, Api) {
  "use strict";
  return BaseController.extend("wm.light.controller.Materials", {
    onInit: function () {
      this.setModel(new JSONModel({ items: [], total: 0 }), "mat");
      this._load();
    },
    _load: async function () {
      this.showBusy(true);
      try {
        var oData = await Api.getMaterials();
        this.getModel("mat").setData({ items: oData.items || oData.data || [], total: oData.total || 0 });
      } catch (e) {
        if (e.message === "SESSION_EXPIRED") return;
        this.showError("Error al cargar Materiales");
      } finally {
        this.showBusy(false);
      }
    },
    onSearch: function (oEvent) {
      var sQ = oEvent.getParameter("newValue") || oEvent.getParameter("query") || "";
      var oB = this.byId("matTable").getBinding("items");
      oB.filter(sQ ? [new Filter({ filters: [
        new Filter("sap_code", FilterOperator.Contains, sQ),
        new Filter("description", FilterOperator.Contains, sQ)
      ], and: false })] : []);
    },
    onRefresh: function () { this._load(); },
    onSapSync: async function () {
      this.showBusy(true);
      try {
        var r = await Api.syncMaterials();
        this.showSuccess(this.getText("materialsSyncSuccess", [r.count || 0]));
        this._load();
      } catch (e) { this.showError(this.getText("materialsSyncError")); }
      finally { this.showBusy(false); }
    }
  });
});
