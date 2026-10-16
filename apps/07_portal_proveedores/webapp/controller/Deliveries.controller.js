sap.ui.define([
    "com/antigravity/portalProveedores/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (BaseController, JSONModel, MessageToast) {
    "use strict";

    return BaseController.extend("com.antigravity.portalProveedores.controller.Deliveries", {

        onInit: function () {
            this._sCurrentFilter = "All";
            this._sSearchQuery = "";
            this._initDeliveryModel();
            this.getRouter()
                .getRoute("deliveries")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            this._applyFilters();
        },

        _initDeliveryModel: function () {
            var aDeliveries = [
                {
                    delNumber: "DEL-2026-0041", carrier: "Transportes Veloz S.A.",
                    poNumber: "4500012345", date: "30/06/2026",
                    material: "ACER-304-2MM", materialDesc: "Acero Inox. 304 - 2mm",
                    quantity: "500", unit: "KG", statusKey: "Pending",
                    statusText: "Pendiente", statusState: "Warning",
                    statusIcon: "sap-icon://pending", highlight: "Warning"
                },
                {
                    delNumber: "DEL-2026-0038", carrier: "DHL Supply Chain",
                    poNumber: "4500012344", date: "12/06/2026",
                    material: "TORN-M8-20", materialDesc: "Tornillos M8 x 20mm",
                    quantity: "50", unit: "CAJ", statusKey: "Delivered",
                    statusText: "Entregada", statusState: "Success",
                    statusIcon: "sap-icon://accept", highlight: "Success"
                },
                {
                    delNumber: "DEL-2026-0035", carrier: "Estafeta Mexicana",
                    poNumber: "4500012342", date: "18/06/2026",
                    material: "VALV-2-A150", materialDesc: "Válvula compuerta 2\" ANSI 150",
                    quantity: "12", unit: "PZA", statusKey: "InTransit",
                    statusText: "En Tránsito", statusState: "Information",
                    statusIcon: "sap-icon://truck-driver", highlight: "Information"
                },
                {
                    delNumber: "DEL-2026-0030", carrier: "Fedex México",
                    poNumber: "4500012340", date: "03/06/2026",
                    material: "BOMB-CENTR-3", materialDesc: "Bomba centrífuga 3 HP",
                    quantity: "4", unit: "PZA", statusKey: "Delivered",
                    statusText: "Entregada", statusState: "Success",
                    statusIcon: "sap-icon://accept", highlight: "Success"
                },
                {
                    delNumber: "DEL-2026-0025", carrier: "Transportes Rápidos Norte",
                    poNumber: "4500012339", date: "29/05/2026",
                    material: "MANG-HIDRO-1", materialDesc: "Manguera hidráulica 1\" SAE 100R2",
                    quantity: "100", unit: "MT", statusKey: "Delivered",
                    statusText: "Entregada", statusState: "Success",
                    statusIcon: "sap-icon://accept", highlight: "Success"
                }
            ];

            var oModel = new JSONModel({
                deliveries: aDeliveries,
                allDeliveries: aDeliveries
            });
            this.setModel(oModel, "del");
        },

        _applyFilters: function () {
            var oModel = this.getModel("del");
            if (!oModel) { return; }
            var aAll = oModel.getProperty("/allDeliveries");
            var aFiltered = aAll.filter(function (oDel) {
                var bStatus = (this._sCurrentFilter === "All") || (oDel.statusKey === this._sCurrentFilter);
                var bSearch = !this._sSearchQuery ||
                    oDel.delNumber.toLowerCase().includes(this._sSearchQuery.toLowerCase()) ||
                    oDel.materialDesc.toLowerCase().includes(this._sSearchQuery.toLowerCase()) ||
                    oDel.poNumber.toLowerCase().includes(this._sSearchQuery.toLowerCase());
                return bStatus && bSearch;
            }.bind(this));
            oModel.setProperty("/deliveries", aFiltered);
        },

        onStatusFilterChange: function (oEvent) {
            this._sCurrentFilter = oEvent.getParameter("key");
            this._applyFilters();
        },

        onSearchLive: function (oEvent) {
            this._sSearchQuery = oEvent.getParameter("newValue");
            this._applyFilters();
        },

        onRefresh: function () {
            this._initDeliveryModel();
            MessageToast.show(this.getText("commonRefresh"));
        },

        onNewDelivery: function () {
            MessageToast.show(this.getText("delNewDelivery"));
        },

        onViewDelivery: function () {
            MessageToast.show(this.getText("commonView"));
        },

        onExit: function () {
            var oModel = this.getView().getModel("del");
            if (oModel) { oModel.destroy(); }
        }
    });
});
