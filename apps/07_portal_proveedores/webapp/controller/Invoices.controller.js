sap.ui.define([
    "com/antigravity/portalProveedores/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment"
], function (BaseController, JSONModel, MessageToast, MessageBox, Fragment) {
    "use strict";

    return BaseController.extend("com.antigravity.portalProveedores.controller.Invoices", {

        onInit: function () {
            this._sCurrentFilter = "All";
            this._sSearchQuery = "";
            this._oNewInvoiceDialog = null;
            this._initInvoiceModel();
            this.getRouter()
                .getRoute("invoices")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            this._applyFilters();
        },

        _initInvoiceModel: function () {
            var aInvoices = [
                {
                    invNumber: "FAC-2026-0087", description: "Acero Inoxidable 304",
                    poNumber: "4500012345", invDate: "16/06/2026", dueDate: "16/07/2026",
                    amount: "285,000", amountState: "None", statusKey: "Pending",
                    statusText: "Pendiente Aprobación", statusState: "Warning",
                    statusIcon: "sap-icon://pending", highlight: "Warning"
                },
                {
                    invNumber: "FAC-2026-0081", description: "Tornillos M8",
                    poNumber: "4500012344", invDate: "13/06/2026", dueDate: "13/07/2026",
                    amount: "18,500", amountState: "Success", statusKey: "Paid",
                    statusText: "Pagada", statusState: "Success",
                    statusIcon: "sap-icon://money-bills", highlight: "Success"
                },
                {
                    invNumber: "FAC-2026-0075", description: "Cables AWG 12",
                    poNumber: "4500012343", invDate: "11/06/2026", dueDate: "11/07/2026",
                    amount: "42,750", amountState: "Error", statusKey: "Rejected",
                    statusText: "Rechazada", statusState: "Error",
                    statusIcon: "sap-icon://decline", highlight: "Error"
                },
                {
                    invNumber: "FAC-2026-0068", description: "Válvulas compuerta",
                    poNumber: "4500012342", invDate: "09/06/2026", dueDate: "09/07/2026",
                    amount: "96,200", amountState: "Success", statusKey: "Approved",
                    statusText: "Aprobada", statusState: "Success",
                    statusIcon: "sap-icon://accept", highlight: "Success"
                },
                {
                    invNumber: "FAC-2026-0060", description: "Pintura epóxica",
                    poNumber: "4500012341", invDate: "06/06/2026", dueDate: "06/07/2026",
                    amount: "34,100", amountState: "None", statusKey: "Draft",
                    statusText: "Borrador", statusState: "None",
                    statusIcon: "sap-icon://edit", highlight: "None"
                },
                {
                    invNumber: "FAC-2026-0055", description: "Bombas centrífugas",
                    poNumber: "4500012340", invDate: "03/06/2026", dueDate: "03/07/2026",
                    amount: "312,000", amountState: "Success", statusKey: "Paid",
                    statusText: "Pagada", statusState: "Success",
                    statusIcon: "sap-icon://money-bills", highlight: "Success"
                }
            ];

            var oModel = new JSONModel({
                invoices: aInvoices,
                allInvoices: aInvoices
            });
            this.setModel(oModel, "inv");
        },

        _applyFilters: function () {
            var oModel = this.getModel("inv");
            if (!oModel) { return; }
            var aAll = oModel.getProperty("/allInvoices");
            var aFiltered = aAll.filter(function (oInv) {
                var bStatus = (this._sCurrentFilter === "All") || (oInv.statusKey === this._sCurrentFilter);
                var bSearch = !this._sSearchQuery ||
                    oInv.invNumber.toLowerCase().includes(this._sSearchQuery.toLowerCase()) ||
                    oInv.poNumber.toLowerCase().includes(this._sSearchQuery.toLowerCase()) ||
                    oInv.description.toLowerCase().includes(this._sSearchQuery.toLowerCase());
                return bStatus && bSearch;
            }.bind(this));
            oModel.setProperty("/invoices", aFiltered);
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
            this._initInvoiceModel();
            MessageToast.show(this.getText("commonRefresh"));
        },

        onDownload: function () {
            MessageToast.show(this.getText("commonDownload"));
        },

        onViewInvoice: function () {
            MessageToast.show(this.getText("commonView"));
        },

        onDownloadInvoice: function () {
            MessageToast.show(this.getText("commonDownload"));
        },

        // ----------------------------------------------------------------
        // Nueva Factura — Dialog
        // ----------------------------------------------------------------
        onNewInvoice: function () {
            this._getNewInvoiceDialog().then(function (oDialog) {
                this._resetInvoiceDialog();
                oDialog.open();
            }.bind(this));
        },

        _getNewInvoiceDialog: function () {
            if (!this._oNewInvoiceDialogPromise) {
                this._oNewInvoiceDialogPromise = Fragment.load({
                    id: this.getView().getId(),
                    name: "com.antigravity.portalProveedores.fragment.NewInvoiceDialog",
                    controller: this
                }).then(function (oDialog) {
                    this.getView().addDependent(oDialog);
                    return oDialog;
                }.bind(this));
            }
            return this._oNewInvoiceDialogPromise;
        },

        _resetInvoiceDialog: function () {
            var oDialogModel = new JSONModel({
                poNumber: "",
                invNumber: "",
                invDate: "",
                amount: "",
                notes: "",
                poValueState: "None",
                invNumberValueState: "None",
                dateValueState: "None",
                amountValueState: "None",
                message: "",
                messageType: "Information",
                messageVisible: false
            });
            this.getView().setModel(oDialogModel, "invDialog");
        },

        _validateInvoiceDialog: function () {
            var oModel = this.getModel("invDialog");
            var bValid = true;

            if (!oModel.getProperty("/poNumber")) {
                oModel.setProperty("/poValueState", "Error");
                bValid = false;
            } else {
                oModel.setProperty("/poValueState", "None");
            }

            if (!oModel.getProperty("/invNumber")) {
                oModel.setProperty("/invNumberValueState", "Error");
                bValid = false;
            } else {
                oModel.setProperty("/invNumberValueState", "None");
            }

            if (!oModel.getProperty("/invDate")) {
                oModel.setProperty("/dateValueState", "Error");
                bValid = false;
            } else {
                oModel.setProperty("/dateValueState", "None");
            }

            if (!oModel.getProperty("/amount")) {
                oModel.setProperty("/amountValueState", "Error");
                bValid = false;
            } else {
                oModel.setProperty("/amountValueState", "None");
            }

            return bValid;
        },

        onSubmitInvoice: function () {
            if (!this._validateInvoiceDialog()) {
                var oModel = this.getModel("invDialog");
                oModel.setProperty("/message", this.getText("invDialogError"));
                oModel.setProperty("/messageType", "Error");
                oModel.setProperty("/messageVisible", true);
                return;
            }

            // En producción: llamada OData para crear la factura
            this._getNewInvoiceDialog().then(function (oDialog) {
                oDialog.close();
                MessageToast.show(this.getText("invDialogSuccess"));
                this._initInvoiceModel();
            }.bind(this));
        },

        onCloseInvoiceDialog: function () {
            this._getNewInvoiceDialog().then(function (oDialog) {
                oDialog.close();
            });
        },

        onExit: function () {
            var oModel = this.getView().getModel("inv");
            if (oModel) { oModel.destroy(); }
        }
    });
});
