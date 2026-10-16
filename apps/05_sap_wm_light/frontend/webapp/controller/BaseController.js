sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/m/MessageBox"
], function (Controller, MessageToast, MessageBox) {
  "use strict";

  return Controller.extend("wm.light.controller.BaseController", {

    getModel: function (sName) {
      var oView = this.getView();
      if (oView && oView.getModel(sName)) {
        return oView.getModel(sName);
      }
      var oComp = this.getOwnerComponent ? this.getOwnerComponent() : null;
      return oComp ? oComp.getModel(sName) : null;
    },

    setModel: function (oModel, sName) {
      return this.getView().setModel(oModel, sName);
    },

    getRouter: function () {
      return sap.ui.core.UIComponent.getRouterFor(this);
    },

    navTo: function (sName, oParameters, bReplace) {
      // The app uses a custom internal navigation via EventBus
      sap.ui.getCore().getEventBus().publish("wm.light", "navigate", { route: sName });
    },

    getResourceBundle: function () {
      var oModel = this.getModel("i18n");
      return oModel ? oModel.getResourceBundle() : null;
    },

    getText: function (sKey, aArgs) {
      var oBundle = this.getResourceBundle();
      return oBundle ? oBundle.getText(sKey, aArgs) : sKey;
    },

    showSuccess: function (sMsg) {
      MessageToast.show(sMsg, { duration: 3000 });
    },

    showError: function (sMsg) {
      MessageBox.error(sMsg);
    },

    showBusy: function (bBusy) {
      this.getView().setBusy(bBusy);
    },

    formatDate: function (sDate) {
      if (!sDate) return "";
      return new Date(sDate).toLocaleDateString("es-PE", {
        day: "2-digit", month: "2-digit", year: "numeric"
      });
    }
  });
});
