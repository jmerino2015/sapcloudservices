sap.ui.define([
    "com/antigravity/portalProveedoresContabilidad/controller/BaseController"
], function (BaseController) {
    "use strict";

    return BaseController.extend("com.antigravity.portalProveedoresContabilidad.controller.Dashboard", {

        onInit: function () {
            var that = this;
            window._navToInvoices = function () {
                that.onNavToInvoices();
            };
        },

        onNavToInvoices: function () {
            this.navTo("invoicesMatch");
        },

        onNavToSunatSire: function () {
            this.navTo("sunatSire");
        },

        onNavToSapPosting: function () {
            this.navTo("sapPosting");
        },

        onNavToPaymentsAudit: function () {
            this.navTo("paymentsAudit");
        }
    });
});
