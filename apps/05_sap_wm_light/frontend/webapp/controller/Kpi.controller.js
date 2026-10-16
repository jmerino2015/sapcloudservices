sap.ui.define([
  "wm/light/controller/BaseController",
  "sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
  "use strict";

  return BaseController.extend("wm.light.controller.Kpi", {
    onInit: function () {
      // Mocked data for KPI Dashboard to make it visually realistic 
      // since some of these require historical or cost data not present in DB.
      var oData = {
        inbound: {
          cycleTrend: [
            { x: 0, y: 3.2, color: "Error" },
            { x: 1, y: 2.8, color: "Critical" },
            { x: 2, y: 2.5, color: "Good" },
            { x: 3, y: 2.1, color: "Good" },
            { x: 4, y: 2.4, color: "Good", show: true }
          ],
          returnsRate: 4.1,      // BulletMicroChart actual
          inventoryAccuracy: 99.2 // RadialMicroChart
        },
        outbound: {
          pickingTrend: [
            { label: "T1", value: 120, color: "Critical" },
            { label: "T2", value: 145, color: "Good" },
            { label: "T3", value: 130, color: "Good" }
          ],
          perfectOrder: 98.5,       // HarveyBall fraction
          otifData: [
            { title: "OTIF", value: 94.8, color: "Good" },
            { title: "Meta", value: 98.0, color: "Neutral" }
          ]
        },
        utilization: {
          occupancy: 82.5,          // RadialMicroChart
          costData: [
            { title: "Actual", value: 1.15, color: "Good" },
            { title: "Mes Ant.", value: 1.40, color: "Critical" }
          ]
        }
      };

      this.setModel(new JSONModel(oData), "kpi");
    },

    onTilePress: function(oEvent) {
      var sKpiId = oEvent.getSource().data("kpiId");
      
      // Pass the KPI ID via global model
      var oAppModel = this.getModel("app");
      if (oAppModel) oAppModel.setProperty("/selectedKpiId", sKpiId);
      
      sap.ui.getCore().getEventBus().publish("wm.light", "navigate", { route: "kpiDetail" });
    }
  });
});
