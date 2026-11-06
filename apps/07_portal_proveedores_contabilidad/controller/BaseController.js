sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, UIComponent, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("com.antigravity.portalProveedoresContabilidad.controller.BaseController", {

        getRouter: function () {
            return UIComponent.getRouterFor(this);
        },

        getModel: function (sName) {
            return this.getView().getModel(sName) || this.getOwnerComponent().getModel(sName);
        },

        setModel: function (oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        getText: function (sKey, aArgs) {
            return this.getResourceBundle().getText(sKey, aArgs);
        },

        navTo: function (sName, oParameters, bReplace) {
            this.getRouter().navTo(sName, oParameters, bReplace);
        },

        /**
         * Retorno universal al Fiori Launchpad principal
         */
        goHome: function () {
            if (window.parent && window.parent.PortalApp && typeof window.parent.PortalApp.closeModal === "function") {
                window.parent.PortalApp.closeModal();
            } else {
                window.location.href = "../../index.html";
            }
        }
    });
});
