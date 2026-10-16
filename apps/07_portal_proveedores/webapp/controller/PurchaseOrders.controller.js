sap.ui.define([
    "com/antigravity/portalProveedores/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast"
], function (BaseController, JSONModel, Filter, FilterOperator, MessageToast) {
    "use strict";

    return BaseController.extend("com.antigravity.portalProveedores.controller.PurchaseOrders", {

        onInit: function () {
            this._sCurrentFilter = "All";
            this._sSearchQuery = "";
            this._initPOModel();
            this.getRouter()
                .getRoute("purchaseOrders")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            this._applyFilters();
        },

        _initPOModel: function () {
            var aOrders = [
                {
                    poNumber: "4500012345", supplierRef: "REF-2026-001",
                    date: "15/06/2026", deliveryDate: "30/06/2026",
                    material: "ACER-304-2MM", materialDesc: "Acero Inoxidable 304 - 2mm",
                    quantity: "500", unit: "KG", amount: "285,000",
                    amountState: "None", statusKey: "Open",
                    statusText: "Abierta", statusState: "Information",
                    statusIcon: "sap-icon://pending", highlight: "Information"
                },
                {
                    poNumber: "4500012344", supplierRef: "REF-2026-002",
                    date: "12/06/2026", deliveryDate: "25/06/2026",
                    material: "TORN-M8-20", materialDesc: "Tornillos M8 x 20mm (caja 500)",
                    quantity: "50", unit: "CAJ", amount: "18,500",
                    amountState: "Success", statusKey: "Closed",
                    statusText: "Completada", statusState: "Success",
                    statusIcon: "sap-icon://accept", highlight: "Success"
                },
                {
                    poNumber: "4500012343", supplierRef: "REF-2026-003",
                    date: "10/06/2026", deliveryDate: "20/06/2026",
                    material: "CABLE-AWG12", materialDesc: "Cable eléctrico AWG 12 (rollo 100m)",
                    quantity: "20", unit: "ROL", amount: "42,750",
                    amountState: "Warning", statusKey: "Pending",
                    statusText: "Pendiente", statusState: "Warning",
                    statusIcon: "sap-icon://warning", highlight: "Warning"
                },
                {
                    poNumber: "4500012342", supplierRef: "REF-2026-004",
                    date: "08/06/2026", deliveryDate: "18/06/2026",
                    material: "VALV-2-A150", materialDesc: "Válvula de compuerta 2\" ANSI 150",
                    quantity: "12", unit: "PZA", amount: "96,200",
                    amountState: "None", statusKey: "Open",
                    statusText: "En proceso", statusState: "Information",
                    statusIcon: "sap-icon://synchronize", highlight: "Information"
                },
                {
                    poNumber: "4500012341", supplierRef: "REF-2026-005",
                    date: "05/06/2026", deliveryDate: "15/06/2026",
                    material: "PINT-EPOX-20", materialDesc: "Pintura epóxica anticorrosiva (20L)",
                    quantity: "30", unit: "CUB", amount: "34,100",
                    amountState: "Error", statusKey: "Pending",
                    statusText: "Con observaciones", statusState: "Warning",
                    statusIcon: "sap-icon://message-warning", highlight: "Warning"
                },
                {
                    poNumber: "4500012340", supplierRef: "REF-2026-006",
                    date: "02/06/2026", deliveryDate: "12/06/2026",
                    material: "BOMB-CENTR-3", materialDesc: "Bomba centrífuga 3 HP - 2\"",
                    quantity: "4", unit: "PZA", amount: "312,000",
                    amountState: "Success", statusKey: "Closed",
                    statusText: "Completada", statusState: "Success",
                    statusIcon: "sap-icon://accept", highlight: "Success"
                },
                {
                    poNumber: "4500012339", supplierRef: "REF-2026-007",
                    date: "28/05/2026", deliveryDate: "10/06/2026",
                    material: "MANG-HIDRO-1", materialDesc: "Manguera hidráulica 1\" SAE 100R2",
                    quantity: "100", unit: "MT", amount: "28,900",
                    amountState: "None", statusKey: "Closed",
                    statusText: "Completada", statusState: "Success",
                    statusIcon: "sap-icon://accept", highlight: "Success"
                }
            ];

            var oModel = new JSONModel({
                orders: aOrders,
                allOrders: aOrders,
                filteredCount: aOrders.length
            });
            this.setModel(oModel, "po");
        },

        _applyFilters: function () {
            var oModel = this.getModel("po");
            var aAllOrders = oModel.getProperty("/allOrders");
            var aFiltered = aAllOrders.filter(function (oOrder) {
                var bStatus = (this._sCurrentFilter === "All") || (oOrder.statusKey === this._sCurrentFilter);
                var bSearch = !this._sSearchQuery ||
                    oOrder.poNumber.toLowerCase().includes(this._sSearchQuery.toLowerCase()) ||
                    oOrder.materialDesc.toLowerCase().includes(this._sSearchQuery.toLowerCase());
                return bStatus && bSearch;
            }.bind(this));

            oModel.setProperty("/orders", aFiltered);
            oModel.setProperty("/filteredCount", aFiltered.length);
        },

        onStatusFilterChange: function (oEvent) {
            this._sCurrentFilter = oEvent.getParameter("key");
            this._applyFilters();
        },

        onSearch: function (oEvent) {
            this._sSearchQuery = oEvent.getParameter("query");
            this._applyFilters();
        },

        onSearchLive: function (oEvent) {
            this._sSearchQuery = oEvent.getParameter("newValue");
            this._applyFilters();
        },

        onRefresh: function () {
            this._initPOModel();
            MessageToast.show(this.getText("commonRefresh"));
        },

        onDownload: function () {
            MessageToast.show(this.getText("commonDownload"));
        },

        onFilterPress: function () {
            MessageToast.show(this.getText("commonFilter"));
        },

        onSelectionChange: function (oEvent) {
            // Lógica de selección si se necesita
        },

        onOrderPress: function (oEvent) {
            var oCtx = oEvent.getSource().getBindingContext("po");
            this.navTo("purchaseOrderDetail", { poId: oCtx.getProperty("poNumber") });
        },

        onOrderDetailPress: function (oEvent) {
            var oCtx = oEvent.getSource().getParent().getParent().getBindingContext("po");
            this.navTo("purchaseOrderDetail", { poId: oCtx.getProperty("poNumber") });
        },

        onDownloadOrder: function () {
            MessageToast.show(this.getText("commonDownload"));
        },

        onExit: function () {
            var oModel = this.getView().getModel("po");
            if (oModel) {
                oModel.destroy();
            }
        }
    });
});
