sap.ui.define([
    "com/antigravity/portalProveedores/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment"
], function (BaseController, JSONModel, MessageToast, MessageBox, Fragment) {
    "use strict";

    return BaseController.extend("com.antigravity.portalProveedores.controller.CreditNotes", {

        onInit: function () {
            BaseController.prototype.onInit.apply(this, arguments);
        },

        onOpenCreditNoteDialog: function () {
            var oNcFormModel = new JSONModel({
                tipoNc: "DEVOLUCION_STOCK",
                ordenCompra: "4540012337",
                notaDevolucion: "DEV-2026-00412",
                parteIngresoOriginal: "5000432288",
                sociedad: "P202 Superdeporte Plus Perú SAC",
                folioNc: "FC01-0004921",
                motivo: "Devolución por defecto de fábrica en lote de mercadería",
                selloTienda: "SELLO_RECEPCION_TIENDA_OK",
                montoNeto: "1250.00",
                igv: "225.00",
                montoTotal: "1475.00",
                moneda: "USD",
                samplePdfName: "Nota_Credito_FC01-0004921_Devolucion.pdf (380 KB)",
                selectedSamplePdf: "PDF_1",
                ocrExecuted: false,
                ocrStatusText: "",
                ocrStatusType: "None"
            });

            var that = this;
            if (!this._oNcDialog) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "com.antigravity.portalProveedores.fragment.CreditNoteDialog",
                    controller: this
                }).then(function (oDialog) {
                    that._oNcDialog = oDialog;
                    that.getView().addDependent(that._oNcDialog);
                    that._oNcDialog.setModel(oNcFormModel, "ncForm");
                    that._oNcDialog.open();
                });
            } else {
                this._oNcDialog.setModel(oNcFormModel, "ncForm");
                this._oNcDialog.open();
            }
        },

        onSamplePdfChange: function (oEvent) {
            if (!this._oNcDialog) return;
            var oNcModel = this._oNcDialog.getModel("ncForm");
            var sKey = oEvent.getParameter("selectedItem").getKey();
            oNcModel.setProperty("/selectedSamplePdf", sKey);
            oNcModel.setProperty("/ocrExecuted", false);
            oNcModel.setProperty("/ocrStatusText", "");
            oNcModel.setProperty("/ocrStatusType", "None");

            if (sKey === "PDF_1") {
                oNcModel.setProperty("/samplePdfName", "Nota_Credito_FC01-0004921_Devolucion.pdf (380 KB)");
            } else if (sKey === "PDF_2") {
                oNcModel.setProperty("/samplePdfName", "Nota_Credito_FC02-0001842_Ajuste.pdf (295 KB)");
            }
        },

        onCloseCreditNoteDialog: function () {
            if (this._oNcDialog) {
                this._oNcDialog.close();
            }
        },

        onSimulateOcrNc: function () {
            if (!this._oNcDialog) return;
            var oNcModel = this._oNcDialog.getModel("ncForm");
            var sPdfKey = oNcModel.getProperty("/selectedSamplePdf") || "PDF_1";

            if (sPdfKey === "PDF_1") {
                oNcModel.setProperty("/sociedad", "P202 Superdeporte Plus Perú SAC");
                oNcModel.setProperty("/folioNc", "FC01-0004921");
                oNcModel.setProperty("/tipoNc", "DEVOLUCION_STOCK");
                oNcModel.setProperty("/ordenCompra", "4540012337");
                oNcModel.setProperty("/notaDevolucion", "DEV-2026-00412");
                oNcModel.setProperty("/motivo", "Devolución por falla de calidad en lote de mercadería");
                oNcModel.setProperty("/montoNeto", "1250.00");
                oNcModel.setProperty("/igv", "225.00");
                oNcModel.setProperty("/montoTotal", "1475.00");
                oNcModel.setProperty("/selloTienda", "SELLO_ALMACEN_TIENDA_VALIDADO");
                oNcModel.setProperty("/ocrStatusText", "✅ OCR Exitoso (Nota_Credito_FC01-0004921.pdf): Lectura realizada. Devolución DEV-2026-00412 | OC 4540012337 | Total USD 1,475.00 | Sello Tienda OK.");
            } else {
                oNcModel.setProperty("/sociedad", "P101 Droid Perú SAC");
                oNcModel.setProperty("/folioNc", "FC02-0001842");
                oNcModel.setProperty("/tipoNc", "AJUSTE_IMPORTE");
                oNcModel.setProperty("/ordenCompra", "4540012338");
                oNcModel.setProperty("/notaDevolucion", "DEV-2026-00890");
                oNcModel.setProperty("/motivo", "Ajuste comercial por descuento acumulado por volumen");
                oNcModel.setProperty("/montoNeto", "800.00");
                oNcModel.setProperty("/igv", "144.00");
                oNcModel.setProperty("/montoTotal", "944.00");
                oNcModel.setProperty("/selloTienda", "SELLO_CONTABILIDAD_P101_OK");
                oNcModel.setProperty("/ocrStatusText", "✅ OCR Exitoso (Nota_Credito_FC02-0001842.pdf): Lectura realizada. Ajuste Importe | OC 4540012338 | Total USD 944.00 | Sello OK.");
            }

            oNcModel.setProperty("/ocrStatusType", "Success");
            oNcModel.setProperty("/ocrExecuted", true);

            MessageToast.show("🔍 DROID OCR: Campos de la Nota de Crédito precargados y validados automáticamente.");
        },

        onSaveCreditNote: function () {
            if (!this._oNcDialog) return;
            var oFormData = this._oNcDialog.getModel("ncForm").getData();
            var sNewNcId = "NC-2026-00" + Math.floor(3 + Math.random() * 90);

            var oAppModel = this.getOwnerComponent().getModel("app");
            var aNcList = oAppModel.getProperty("/creditNotes") || [];

            aNcList.unshift({
                id: sNewNcId,
                folioNc: oFormData.folioNc,
                tipoNc: oFormData.tipoNc,
                tipoNcNombre: oFormData.tipoNc === "DEVOLUCION_STOCK" ? "01 - Devolución de Stock (Mercadería)" : "02 - Ajuste de Importe",
                ordenCompra: oFormData.ordenCompra,
                notaDevolucion: oFormData.notaDevolucion,
                parteIngresoOriginal: oFormData.parteIngresoOriginal,
                fecha: new Date().toLocaleDateString("es-PE"),
                proveedor: "20517426726 - SERVICIOS TECNOLÓGICOS S.A.C.",
                sociedad: oFormData.sociedad,
                motivo: oFormData.motivo,
                montoNeto: parseFloat(oFormData.montoNeto),
                igv: parseFloat(oFormData.igv),
                montoTotal: parseFloat(oFormData.montoTotal),
                moneda: oFormData.moneda || "USD",
                asientoSap: "SAP-NC-5000" + Math.floor(1000 + Math.random() * 9000),
                estado: "CONTABILIZADO"
            });

            oAppModel.refresh(true);
            this.onCloseCreditNoteDialog();

            MessageBox.success(
                "¡Nota de Crédito " + oFormData.folioNc + " Registrada en SAP S/4HANA!\n\n" +
                "• Modalidad: Devolución de Stock & Importe (Req. N° 1)\n" +
                "• Nota Devolución Compras: " + oFormData.notaDevolucion + "\n" +
                "• Orden de Compra: " + oFormData.ordenCompra + "\n" +
                "• Asiento Contable SAP: SAP-NC-50001892"
            );
        }
    });
});
