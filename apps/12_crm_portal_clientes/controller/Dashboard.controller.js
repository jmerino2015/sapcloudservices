sap.ui.define([
    "sap/crm/customerportal/controller/BaseController"
], function (BaseController) {
    "use strict";

    return BaseController.extend("sap.crm.customerportal.controller.Dashboard", {

        onInit: function () {
            // Dashboard initialized
        },

        formatItemsCount: function (iCount) {
            return (iCount || 0) + " posiciones";
        },

        onNavToCatalog: function () {
            this.getRouter().navTo("sales", { query: { tab: "catalog" } });
        },

        onNavToOrders: function () {
            this.getRouter().navTo("sales", { query: { tab: "orders" } });
        },

        onNavToInvoices: function () {
            this.getRouter().navTo("sales", { query: { tab: "invoices" } });
        },

        onNavToTickets: function () {
            this.getRouter().navTo("service", { query: { tab: "myTickets" } });
        },

        onNavToCreateTicket: function () {
            this.getRouter().navTo("service", { query: { tab: "create" } });
        },

        onNavToFaq: function () {
            this.getRouter().navTo("service", { query: { tab: "faq" } });
        }
    });
});
