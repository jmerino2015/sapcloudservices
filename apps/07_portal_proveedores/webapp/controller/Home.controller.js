sap.ui.define([
    "com/antigravity/portalProveedores/controller/BaseController"
], function (BaseController) {
    "use strict";

    return BaseController.extend("com.antigravity.portalProveedores.controller.Home", {

        onInit: function () {
        },

        onNavToPreRegister: function () {
            this.navTo("preRegister");
        },

        onNavToCreditNotes: function () {
            this.navTo("creditNotes");
        },

        onNavToInvoiceHistory: function () {
            this.navTo("invoiceHistory");
        },

        onNavToPaymentHistory: function () {
            this.navTo("paymentHistory");
        },

        onNavToAccountingInvoices: function () {
            this.navTo("accountingInvoices");
        },

        onNavToAutoRegister: function () {
            this.navTo("autoRegister");
        },

        onNavToPurchaseOrders: function () {
            this.navTo("purchaseOrders");
        },

        onNavToInvoices: function () {
            this.navTo("invoices");
        },

        onNavToDeliveries: function () {
            this.navTo("deliveries");
        },

        onNavToDocuments: function () {
            this.navTo("documents");
        }

    });
});
