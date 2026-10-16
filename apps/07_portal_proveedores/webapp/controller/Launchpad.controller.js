sap.ui.define([
    "com/antigravity/portalProveedores/controller/BaseController",
    "sap/m/MessageToast"
], function (BaseController, MessageToast) {
    "use strict";

    return BaseController.extend("com.antigravity.portalProveedores.controller.Launchpad", {

        onInit: function () {
        },

        onNavToProviderPortal: function () {
            MessageToast.show("Ingresando al Portal de Proveedores...");
            this.navTo("home");
        },

        onNavToExpensePortal: function () {
            MessageToast.show("Ingresando al Portal de Gastos a Rendir...");
            this.navTo("expenses");
        },

        onLogout: function () {
            MessageToast.show("Sesión cerrada correctamente.");
            this.navTo("login");
        }

    });
});
