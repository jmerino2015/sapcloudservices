sap.ui.define([
    "com/antigravity/portalProveedoresContabilidad/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "com/antigravity/portalProveedoresContabilidad/model/formatter"
], function (BaseController, Filter, FilterOperator, JSONModel, MessageBox, MessageToast, formatter) {
    "use strict";

    return BaseController.extend("com.antigravity.portalProveedoresContabilidad.controller.InvoicesMatch", {

        formatter: formatter,

        onInit: function () {
            // InvoicesMatch controller init
        },

        onFilterSearch: function () {
            var sRuc = this.byId("filterRuc").getValue();
            var sRazon = this.byId("filterRazonSocial").getValue();
            var sStatus = this.byId("filterStatus").getSelectedKey();
            var sMatch = this.byId("filterMatch").getSelectedKey();

            var aFilters = [];
            if (sRuc) {
                aFilters.push(new Filter("ruc", FilterOperator.Contains, sRuc));
            }
            if (sRazon) {
                aFilters.push(new Filter("razonSocial", FilterOperator.Contains, sRazon));
            }
            if (sStatus && sStatus !== "ALL") {
                aFilters.push(new Filter("estado", FilterOperator.EQ, sStatus));
            }
            if (sMatch && sMatch !== "ALL") {
                aFilters.push(new Filter("matchStatus", FilterOperator.EQ, sMatch));
            }

            var oTable = this.byId("tableInvoices");
            var oBinding = oTable.getBinding("items");
            if (oBinding) {
                oBinding.filter(aFilters);
            }
        },

        onFilterReset: function () {
            this.byId("filterRuc").setValue("");
            this.byId("filterRazonSocial").setValue("");
            this.byId("filterStatus").setSelectedKey("ALL");
            this.byId("filterMatch").setSelectedKey("ALL");
            this.onFilterSearch();
        },

        onOpenReviewDialog: function (oEvent) {
            var oSelectedData = null;

            if (oEvent && oEvent.getSource().getBindingContext) {
                oSelectedData = oEvent.getSource().getBindingContext("app").getObject();
            } else {
                var oTable = this.byId("tableInvoices");
                var oSelectedItem = oTable.getSelectedItem();
                if (!oSelectedItem) {
                    MessageBox.warning("Seleccione una factura de la tabla para realizar la revisión contable y 3-Way Match.");
                    return;
                }
                oSelectedData = oSelectedItem.getBindingContext("app").getObject();
            }

            var oReviewModel = new JSONModel(JSON.parse(JSON.stringify(oSelectedData)));

            if (!this._oReviewDialog) {
                this._oReviewDialog = sap.ui.xmlfragment(
                    "com.antigravity.portalProveedoresContabilidad.fragment.AccountingReviewDialog",
                    this
                );
                this.getView().addDependent(this._oReviewDialog);
            }

            this._oReviewDialog.setModel(oReviewModel, "review");
            this._oReviewDialog.open();
        },

        onCloseReviewDialog: function () {
            if (this._oReviewDialog) {
                this._oReviewDialog.close();
            }
        },

        onConfirmPostToSAP: function () {
            var oReviewData = this._oReviewDialog.getModel("review").getData();

            var sDocSAP = "510" + Math.floor(1000000 + Math.random() * 9000000);
            var sDocFI = "210" + Math.floor(1000000 + Math.random() * 9000000);
            var sEjercicio = "2026";

            var oAppModel = this.getModel("app");
            var aInvoices = oAppModel.getProperty("/accountingInvoices");

            var oTarget = aInvoices.find(function (item) {
                return item.comprobante === oReviewData.comprobante;
            });

            if (oTarget) {
                oTarget.estado = "CONTABILIZADO";
                oTarget.documentoSAP = sDocSAP;
                oTarget.documentoFI = sDocFI;
                oTarget.ejercicio = sEjercicio;
                oAppModel.refresh(true);
            }

            this.onCloseReviewDialog();

            MessageBox.success(
                "Factura " + oReviewData.comprobante + " contabilizada exitosamente en SAP ERP (MIRO / FB60).\n\n" +
                "• Documento Logístico SAP MM: " + sDocSAP + "\n" +
                "• Documento Financiero SAP FI: " + sDocFI + "\n" +
                "• Ejercicio Contable: " + sEjercicio + "\n" +
                "• Proveedor: " + oReviewData.razonSocial
            );
        },

        onReconcileMatch: function () {
            var oReviewData = this._oReviewDialog.getModel("review").getData();
            var oAppModel = this.getModel("app");
            var aInvoices = oAppModel.getProperty("/accountingInvoices");

            var oTarget = aInvoices.find(function (item) {
                return item.comprobante === oReviewData.comprobante;
            });

            if (oTarget) {
                oTarget.matchStatus = "MATCHED";
                if (oTarget.items && oTarget.items.length) {
                    oTarget.items.forEach(function (i) { i.varianza = 0.00; });
                }
                oAppModel.refresh(true);
            }

            this.onCloseReviewDialog();
            MessageToast.show("3-Way Match conciliado conforme contra Orden de Compra y MIGO.");
        },

        onValidateSunatSire: function () {
            var oTable = this.byId("tableInvoices");
            var oSelectedItem = oTable.getSelectedItem();
            if (!oSelectedItem) {
                MessageBox.warning("Seleccione una factura para consultar en el padrón SUNAT SIRE.");
                return;
            }

            var oData = oSelectedItem.getBindingContext("app").getObject();
            MessageBox.information(
                "Validación SUNAT SIRE en tiempo real:\n\n" +
                "• RUC: " + oData.ruc + " (ACTIVO & HABIDO)\n" +
                "• Comprobante: " + oData.comprobante + "\n" +
                "• Estado Fiscal: ACEPTADO SIRE\n" +
                "• Firma Digital UBL 2.1: Válida y Certificada."
            );
        },

        onOpenRejectDialog: function () {
            var oTable = this.byId("tableInvoices");
            var oSelectedItem = oTable.getSelectedItem();
            if (!oSelectedItem) {
                MessageBox.warning("Seleccione una factura de la tabla para rechazar.");
                return;
            }

            var oData = oSelectedItem.getBindingContext("app").getObject();
            this._openRejectWithData(oData);
        },

        onOpenRejectDialogFromReview: function () {
            var oData = this._oReviewDialog.getModel("review").getData();
            this.onCloseReviewDialog();
            this._openRejectWithData(oData);
        },

        _openRejectWithData: function (oData) {
            var oRejectModel = new JSONModel(JSON.parse(JSON.stringify(oData)));

            if (!this._oRejectDialog) {
                this._oRejectDialog = sap.ui.xmlfragment(
                    "com.antigravity.portalProveedoresContabilidad.fragment.RejectInvoiceDialog",
                    this
                );
                this.getView().addDependent(this._oRejectDialog);
            }

            this._oRejectDialog.setModel(oRejectModel, "reject");
            this._oRejectDialog.open();
        },

        onCloseRejectDialog: function () {
            if (this._oRejectDialog) {
                this._oRejectDialog.close();
            }
        },

        onConfirmReject: function () {
            var oRejectData = this._oRejectDialog.getModel("reject").getData();
            var oAppModel = this.getModel("app");
            var aInvoices = oAppModel.getProperty("/accountingInvoices");

            var oTarget = aInvoices.find(function (item) {
                return item.comprobante === oRejectData.comprobante;
            });

            if (oTarget) {
                oTarget.estado = "RECHAZADO";
                oAppModel.refresh(true);
            }

            this.onCloseRejectDialog();
            MessageToast.show("Factura rechazada y notificación enviada al proveedor.");
        },

        onExportExcel: function () {
            MessageToast.show("Exportando reporte contable a formato Excel (.xlsx)...");
        }
    });
});
