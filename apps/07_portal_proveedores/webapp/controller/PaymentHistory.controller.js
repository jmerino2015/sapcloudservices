sap.ui.define([
    "com/antigravity/portalProveedores/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "com/antigravity/portalProveedores/model/formatter"
], function (BaseController, Filter, FilterOperator, MessageToast, formatter) {
    "use strict";

    return BaseController.extend("com.antigravity.portalProveedores.controller.PaymentHistory", {

        formatter: formatter,

        onInit: function () {
            this.getRouter().getRoute("paymentHistory").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function () {
            // Refrescar
        },

        onFilterSearch: function () {
            var sQuery = this.byId("searchPay").getValue();

            var aFilters = [];
            if (sQuery) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("documentoSAP", FilterOperator.Contains, sQuery),
                        new Filter("nroDocCompensacion", FilterOperator.Contains, sQuery),
                        new Filter("nroDocRef", FilterOperator.Contains, sQuery),
                        new Filter("bancoPagador", FilterOperator.Contains, sQuery)
                    ],
                    and: false
                }));
            }

            var oTable = this.byId("tablePaymentHistory");
            if (oTable && oTable.getBinding("items")) {
                oTable.getBinding("items").filter(aFilters);
            }
        },

        onFilterReset: function () {
            this.byId("searchPay").setValue("");
            this.onFilterSearch();
        },

        onExportExcel: function () {
            MessageToast.show("Generando y descargando reporte de Historial de Pagos en Excel...");
        }

    });
});
