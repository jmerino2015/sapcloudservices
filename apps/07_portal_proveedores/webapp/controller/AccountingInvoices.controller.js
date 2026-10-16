sap.ui.define([
    "com/antigravity/portalProveedores/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "com/antigravity/portalProveedores/model/formatter"
], function (BaseController, Filter, FilterOperator, MessageBox, MessageToast, formatter) {
    "use strict";

    return BaseController.extend("com.antigravity.portalProveedores.controller.AccountingInvoices", {

        formatter: formatter,

        onInit: function () {
            this.getRouter().getRoute("accountingInvoices").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function () {
            // Refrescar
        },

        onFilterSearch: function () {
            var sQuery = this.byId("accSearch").getValue();
            var sStatus = this.byId("accSelectStatus").getSelectedKey();

            var aFilters = [];
            if (sQuery) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("ruc", FilterOperator.Contains, sQuery),
                        new Filter("razonSocial", FilterOperator.Contains, sQuery),
                        new Filter("comprobante", FilterOperator.Contains, sQuery),
                        new Filter("oc", FilterOperator.Contains, sQuery),
                        new Filter("correlativoSCP", FilterOperator.Contains, sQuery)
                    ],
                    and: false
                }));
            }

            if (sStatus && sStatus !== "ALL") {
                aFilters.push(new Filter("estado", FilterOperator.EQ, sStatus));
            }

            var oTable = this.byId("tableAccInvoices");
            var oBinding = oTable.getBinding("items");
            oBinding.filter(aFilters);
        },

        onFilterReset: function () {
            this.byId("accSearch").setValue("");
            this.byId("accSelectStatus").setSelectedKey("ALL");
            this.onFilterSearch();
        },

        onOpenReviewDialog: function (oEvent) {
            var oSelectedData = null;

            if (oEvent && oEvent.getSource().getBindingContext) {
                oSelectedData = oEvent.getSource().getBindingContext("app").getObject();
            } else {
                var oTable = this.byId("tableAccInvoices");
                var oSelectedItem = oTable.getSelectedItem();
                if (!oSelectedItem) {
                    MessageBox.warning("Por favor seleccione una factura de la lista para revisar.");
                    return;
                }
                oSelectedData = oSelectedItem.getBindingContext("app").getObject();
            }

            var oReviewModel = new sap.ui.model.json.JSONModel(JSON.parse(JSON.stringify(oSelectedData)));

            if (!this._oReviewDialog) {
                this._oReviewDialog = sap.ui.xmlfragment(
                    "com.antigravity.portalProveedores.fragment.AccountingReviewDialog",
                    this
                );
                this.getView().addDependent(this._oReviewDialog);
            }

            this._oReviewDialog.setModel(oReviewModel, "review");
            this._oReviewDialog.open();
        },

        onPostInvoiceToSAP: function () {
            var oReviewData = this._oReviewDialog.getModel("review").getData();

            var sDocSAP = "510" + Math.floor(1000000 + Math.random() * 9000000);
            var sDocFI = "210" + Math.floor(1000000 + Math.random() * 9000000);
            var sEjercicio = "2024";

            var oAppModel = this.getView().getModel("app");
            var aAccountingInvoices = oAppModel.getProperty("/accountingInvoices");

            var oTarget = aAccountingInvoices.find(function (item) {
                return item.comprobante === oReviewData.comprobante;
            });

            if (oTarget) {
                oTarget.estado = "CONTABILIZADO";
                oTarget.documentoSAP = sDocSAP;
                oTarget.documentoFI = sDocFI;
                oTarget.ejercicio = sEjercicio;
                oTarget.fechaContabilizacion = oReviewData.fechaContabilizacion;
                oTarget.detraccion = oReviewData.detraccion;
                oTarget.retencion = oReviewData.retencion;
                oTarget.glosaRecepcion = oReviewData.glosaRecepcion;
                oTarget.glosaFactura = oReviewData.glosaFactura;
            }

            oAppModel.refresh(true);
            this._oReviewDialog.close();

            // Mensaje de Éxito exacto de SEIDOR (Página 28 de Anexo 6)
            var sMsg = "Se guardó correctamente\nDocumento SAP: " + sDocSAP + "\nDocumento FI: " + sDocFI + "\nEjercicio: " + sEjercicio;
            MessageBox.success(sMsg, {
                title: "Éxito Contabilización SAP",
                onClose: function () {
                    this.onFilterSearch();
                }.bind(this)
            });
        },

        onCloseReviewDialog: function () {
            if (this._oReviewDialog) {
                this._oReviewDialog.close();
            }
        },

        onOpenRejectDialog: function () {
            var oTable = this.byId("tableAccInvoices");
            var oSelectedItem = oTable.getSelectedItem();

            if (!oSelectedItem) {
                MessageBox.warning("Por favor seleccione la factura que desea rechazar.");
                return;
            }

            var oSelectedData = oSelectedItem.getBindingContext("app").getObject();
            var oRejectModel = new sap.ui.model.json.JSONModel({
                comprobante: oSelectedData.comprobante,
                comment: ""
            });

            if (!this._oRejectDialog) {
                this._oRejectDialog = sap.ui.xmlfragment(
                    "com.antigravity.portalProveedores.fragment.RejectionDialog",
                    this
                );
                this.getView().addDependent(this._oRejectDialog);
            }

            this._oRejectDialog.setModel(oRejectModel, "reject");
            this._oRejectDialog.open();
        },

        onConfirmRejectInvoice: function () {
            var oRejectData = this._oRejectDialog.getModel("reject").getData();

            if (!oRejectData.comment || oRejectData.comment.trim() === "") {
                MessageBox.error("Por favor ingrese el motivo del rechazo.");
                return;
            }

            var oAppModel = this.getView().getModel("app");
            var aAccountingInvoices = oAppModel.getProperty("/accountingInvoices");
            var aGoodsReceipts = oAppModel.getProperty("/goodsReceipts");

            var oTargetAcc = aAccountingInvoices.find(function (i) {
                return i.comprobante === oRejectData.comprobante;
            });
            if (oTargetAcc) {
                oTargetAcc.estado = "RECHAZADO";
                oTargetAcc.motivoRechazo = oRejectData.comment;
                oTargetAcc.fechaRechazo = new Date().toLocaleDateString("es-PE");
            }

            // Actualizar también en Goods Receipts para vista del proveedor
            aGoodsReceipts.forEach(function (g) {
                if (g.comprobante === oRejectData.comprobante) {
                    g.estado = "RECHAZADO";
                    g.motivoRechazo = oRejectData.comment;
                    g.fechaRechazo = new Date().toLocaleDateString("es-PE");
                }
            });

            oAppModel.refresh(true);
            this._oRejectDialog.close();

            MessageToast.show("La factura " + oRejectData.comprobante + " ha sido rechazada.");
            this.onFilterSearch();
        },

        onCloseRejectDialog: function () {
            if (this._oRejectDialog) {
                this._oRejectDialog.close();
            }
        },

        onExportExcel: function () {
            MessageToast.show("Exportando datos a Excel...");
        }

    });
});
