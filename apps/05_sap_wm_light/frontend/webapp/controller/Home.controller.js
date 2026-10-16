sap.ui.define([
  "wm/light/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "wm/light/service/ApiService"
], function (BaseController, JSONModel, Api) {
  "use strict";

  return BaseController.extend("wm.light.controller.Home", {

    onInit: function () {
      this.setModel(new JSONModel({
        kpiTOs: 14, kpiTOsState: "Critical", kpiTOsColor: "Critical",
        kpiStock: 1450,
        kpiOccupancy: 78, kpiOccupancyState: "Good",
        kpiExpiring: 3, kpiExpiringState: "Critical", kpiExpiringColor: "Critical"
      }), "home");
      this._loadKpis();

      // Refresh KPIs when view is navigated back to
      sap.ui.getCore().getEventBus().subscribe("wm.light", "navigate", function(sChan, sEvt, oData) {
        if (oData && oData.route === "home") {
          this._loadKpis();
        }
      }, this);
    },

    _loadKpis: async function () {
      this.showBusy(true);
      try {
        var nTOs = 14, nExp = 3, nStock = 1450, nOcc = 78;

        try {
          var oData = await Api.getWarehouses();
          var oWH = (oData && oData.data && oData.data.length) ? oData.data[0] : null;

          if (oWH) {
            var kpisData = await Api.getKpis(oWH.id);
            if (kpisData && kpisData.data) {
              if (kpisData.data.occupancyPct) nOcc = kpisData.data.occupancyPct;
              if (kpisData.data.totalStock) nStock = kpisData.data.totalStock;
            }
          }
        } catch (_) {}

        try {
          var oPerf = await Api.getToPerf();
          if (oPerf && oPerf.data && (oPerf.data.open !== undefined || oPerf.data.total !== undefined)) {
            nTOs = oPerf.data.open || oPerf.data.total || nTOs;
          }
        } catch(_) {}
        
        try {
          var oAlerts = await Api.getAlerts();
          if (oAlerts && oAlerts.expiringBatches && oAlerts.expiringBatches.length > 0) {
            nExp = oAlerts.expiringBatches.length;
          }
        } catch(_) {}

        this.getModel("home").setData({
          kpiTOs: nTOs,
          kpiTOsState: nTOs > 50 ? "Error" : nTOs > 5 ? "Critical" : "Good",
          kpiTOsColor: nTOs > 50 ? "Error" : nTOs > 5 ? "Critical" : "Good",

          kpiStock: nStock.toLocaleString(),

          kpiOccupancy: nOcc,
          kpiOccupancyState: nOcc > 90 ? "Error" : nOcc > 80 ? "Critical" : "Good",

          kpiExpiring: nExp,
          kpiExpiringState: nExp > 0 ? "Critical" : "None",
          kpiExpiringColor: nExp > 0 ? "Critical" : "Neutral"
        });
      } catch (e) {
        if (e.message === "SESSION_EXPIRED") return;
        console.error(e);
      } finally {
        this.showBusy(false);
      }
    },

    onNavGR:        function () { this.navTo("goodsReceipt"); },
    onNavGI:        function () { this.navTo("goodsIssue"); },
    onNavTO:        function () { this.navTo("transferOrders"); },
    onNavStock:     function () { this.navTo("stock"); },
    onNavMaterials: function () { this.navTo("materials"); },
    onNavBatches:   function () { this.navTo("materials"); },
    onNavAdmin:     function () { this.navTo("admin"); },
    onNavLMS:       function () { this.navTo("lmsDashboard"); },
    onNavSlotting:  function () { this.navTo("slottingDashboard"); },
    onNavRf:        function () { this.navTo("rfMain"); }

  });
});
