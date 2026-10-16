sap.ui.define([
  "fue/control/controller/BaseController"
], function (BaseController) {
  "use strict";

  return BaseController.extend("fue.control.controller.Home", {
    
    onNavToDashboard: function () {
      sap.ui.getCore().getEventBus().publish("fue.control", "navigate", { route: "dashboard" });
    },

    onNavToFUEList: function () {
      sap.ui.getCore().getEventBus().publish("fue.control", "navigate", { route: "fueList" });
    },

    onNavToAuditTool: function () {
      sap.ui.getCore().getEventBus().publish("fue.control", "navigate", { route: "auditTool" });
    }

  });
});
