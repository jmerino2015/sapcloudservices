sap.ui.define([
    "com/antigravity/portalProveedores/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "com/antigravity/portalProveedores/model/formatter"
], function (BaseController, Filter, FilterOperator, MessageToast, MessageBox, formatter) {
    "use strict";

    return BaseController.extend("com.antigravity.portalProveedores.controller.InvoiceHistory", {

        formatter: formatter,

        onInit: function () {
            this.getRouter().getRoute("invoiceHistory").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function () {
            // Refrescar
        },

        onFilterSearch: function () {
            var sQuery = this.byId("searchInvComp").getValue();
            var sTab = this.byId("iconTabBarHistory").getSelectedKey();

            var aFilters = [];
            if (sQuery) {
                if (sTab === "OC") {
                    aFilters.push(new Filter({
                        filters: [
                            new Filter("oc", FilterOperator.Contains, sQuery),
                            new Filter("material", FilterOperator.Contains, sQuery)
                        ],
                        and: false
                    }));
                } else {
                    aFilters.push(new Filter({
                        filters: [
                            new Filter("comprobante", FilterOperator.Contains, sQuery),
                            new Filter("docContable", FilterOperator.Contains, sQuery),
                            new Filter("oc", FilterOperator.Contains, sQuery)
                        ],
                        and: false
                    }));
                }
            }

            var oTable = sTab === "OC" ? this.byId("tableOCHist") : this.byId("tableInvoicesHist");
            if (oTable && oTable.getBinding("items")) {
                oTable.getBinding("items").filter(aFilters);
            }
        },

        onFilterReset: function () {
            this.byId("searchInvComp").setValue("");
            this.onFilterSearch();
        },

        onViewInvoiceDetail: function (oEvent) {
            var oContextData = oEvent.getSource().getBindingContext("app").getObject();
            var oDetailModel = new sap.ui.model.json.JSONModel(oContextData);

            if (!this._oHistDetailDialog) {
                this._oHistDetailDialog = sap.ui.xmlfragment(
                    "com.antigravity.portalProveedores.fragment.InvoiceHistoryDetailDialog",
                    this
                );
                this.getView().addDependent(this._oHistDetailDialog);
            }

            this._oHistDetailDialog.setModel(oDetailModel, "detail");
            this._oHistDetailDialog.open();
        },

        onViewOCDetail: function (oEvent) {
            var oContextData = oEvent.getSource().getBindingContext("app").getObject();
            MessageBox.information(
                "Detalle Orden de Compra: " + oContextData.oc + "\n" +
                "Posición: " + oContextData.pos + "\n" +
                "Material: " + oContextData.material + "\n" +
                "Fecha Entrega: " + oContextData.fechaEntregaProg + "\n" +
                "Valor de Venta: " + oContextData.valorVenta + " " + oContextData.moneda,
                { title: "Detalle de OC" }
            );
        },

        onCloseDetailDialog: function () {
            if (this._oHistDetailDialog) {
                this._oHistDetailDialog.close();
            }
        },

        onExportExcel: function () {
            MessageToast.show("Exportando reporte a Excel...");
        }

    });
});
