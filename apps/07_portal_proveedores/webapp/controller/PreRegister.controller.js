sap.ui.define([
    "com/antigravity/portalProveedores/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "com/antigravity/portalProveedores/model/formatter"
], function (BaseController, Filter, FilterOperator, MessageBox, MessageToast, Fragment, formatter) {
    "use strict";

    return BaseController.extend("com.antigravity.portalProveedores.controller.PreRegister", {

        formatter: formatter,

        onInit: function () {
            var oRouter = this.getRouter();
            if (oRouter) {
                var oRoute = oRouter.getRoute("preRegister");
                if (oRoute) {
                    oRoute.attachPatternMatched(this._onObjectMatched, this);
                }
            }
        },

        _onObjectMatched: function () {
            var oTable = this.byId("tableEMAS");
            if (oTable && oTable.getBinding("items")) {
                oTable.getBinding("items").filter([]);
            }
        },

        onFilterSearch: function () {
            var sQuery = this.byId("searchEMAS") ? this.byId("searchEMAS").getValue() : "";
            var sStatus = this.byId("selectStatus") ? this.byId("selectStatus").getSelectedKey() : "ALL";

            var aFilters = [];
            if (sQuery) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("parteIngreso", FilterOperator.Contains, sQuery),
                        new Filter("hojaEntrada", FilterOperator.Contains, sQuery),
                        new Filter("ordenCompra", FilterOperator.Contains, sQuery),
                        new Filter("descripcion", FilterOperator.Contains, sQuery),
                        new Filter("comprobante", FilterOperator.Contains, sQuery)
                    ],
                    and: false
                }));
            }

            if (sStatus && sStatus !== "ALL") {
                aFilters.push(new Filter("estado", FilterOperator.EQ, sStatus));
            }

            var oTable = this.byId("tableEMAS");
            if (oTable) {
                var oBinding = oTable.getBinding("items");
                if (oBinding) {
                    oBinding.filter(aFilters);
                }
            }
        },

        onFilterReset: function () {
            if (this.byId("searchEMAS")) this.byId("searchEMAS").setValue("");
            if (this.byId("selectStatus")) this.byId("selectStatus").setSelectedKey("ALL");
            this.onFilterSearch();
        },

        onOpenPreRegisterDialog: function () {
            var oTable = this.byId("tableEMAS");
            var aSelectedItems = oTable ? oTable.getSelectedItems() : [];

            if (aSelectedItems.length === 0) {
                MessageBox.warning("Por favor seleccione al menos una Entrada de Mercadería o Hoja de Entrada (EM/AS).");
                return;
            }

            var bAlreadyRegistered = false;
            var sComprobanteExistente = "";
            var aSelectedData = [];

            aSelectedItems.forEach(function (oItem) {
                var oContextData = oItem.getBindingContext("app").getObject();
                aSelectedData.push(oContextData);
                if (oContextData.comprobante && oContextData.comprobante !== "") {
                    bAlreadyRegistered = true;
                    sComprobanteExistente = oContextData.comprobante;
                }
            });

            if (bAlreadyRegistered) {
                MessageBox.error("No se puede pre-registrar, ya tiene asociado el comprobante " + sComprobanteExistente);
                return;
            }

            var fTotalImporte = 0;
            aSelectedData.forEach(function (d) {
                fTotalImporte += d.importe || 0;
            });
            var fTotalIGV = fTotalImporte * 0.18;
            var fTotalConIGV = fTotalImporte + fTotalIGV;

            var oDialogModel = new sap.ui.model.json.JSONModel({
                sociedad: "P202 Superdeporte Plus Perú SAC",
                serie: "0F001",
                correlativo: "0063045",
                claseDoc: "01 - Factura",
                fechaCont: "27/02/2026",
                fechaEmision: new Date().toLocaleDateString("es-PE"),
                condicionPago: "30 Días",
                selloTienda: "SELLO_ALMACEN_TIENDA_VALIDADO",
                detraccion: "NONE",
                impuesto: "C1 - 18%",
                importeNeto: fTotalImporte.toFixed(2),
                importeIGV: fTotalIGV.toFixed(2),
                importeTotal: fTotalConIGV.toFixed(2),
                moneda: (aSelectedData[0] && aSelectedData[0].moneda) ? aSelectedData[0].moneda : "USD",
                selectedItems: aSelectedData,
                attachedXmlName: "",
                attachedPdfName: "",
                samplePdfName: "Factura_F001-0063045_Superdeporte.pdf (512 KB)",
                selectedSamplePdf: "PDF_1",
                ocrExecuted: false,
                ocrStatusText: "",
                ocrStatusType: "None",
                xmlUploaded: false
            });

            var that = this;
            if (!this._oPreRegDialog) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "com.antigravity.portalProveedores.fragment.PreRegisterDialog",
                    controller: this
                }).then(function (oDialog) {
                    that._oPreRegDialog = oDialog;
                    that.getView().addDependent(that._oPreRegDialog);
                    that._oPreRegDialog.setModel(oDialogModel, "dialog");
                    that._oPreRegDialog.open();
                });
            } else {
                this._oPreRegDialog.setModel(oDialogModel, "dialog");
                this._oPreRegDialog.open();
            }
        },

        onSamplePdfChange: function (oEvent) {
            if (!this._oPreRegDialog) return;
            var oDialogModel = this._oPreRegDialog.getModel("dialog");
            var sKey = oEvent.getParameter("selectedItem").getKey();
            oDialogModel.setProperty("/selectedSamplePdf", sKey);
            oDialogModel.setProperty("/ocrExecuted", false);
            oDialogModel.setProperty("/ocrStatusText", "");
            oDialogModel.setProperty("/ocrStatusType", "None");

            if (sKey === "PDF_1") {
                oDialogModel.setProperty("/samplePdfName", "Factura_F001-0063045_Superdeporte.pdf (512 KB)");
            } else if (sKey === "PDF_2") {
                oDialogModel.setProperty("/samplePdfName", "Factura_Electronica_F002-0098412_Droid.pdf (410 KB)");
            } else if (sKey === "PDF_3") {
                oDialogModel.setProperty("/samplePdfName", "Guia_Remision_GR01-004120.pdf (290 KB)");
            }
        },

        onClosePreRegDialog: function () {
            if (this._oPreRegDialog) {
                this._oPreRegDialog.close();
            }
        },

        // Req N° 2 BPD: Lectura automática (OCR) de documentos adjuntos
        onSimulateOcrPreRegister: function () {
            if (!this._oPreRegDialog) return;
            var oDialogModel = this._oPreRegDialog.getModel("dialog");
            var sPdfKey = oDialogModel.getProperty("/selectedSamplePdf") || "PDF_1";

            if (sPdfKey === "PDF_1") {
                oDialogModel.setProperty("/sociedad", "P202 Superdeporte Plus Perú SAC");
                oDialogModel.setProperty("/serie", "0F001");
                oDialogModel.setProperty("/correlativo", "0063045");
                oDialogModel.setProperty("/claseDoc", "01 - Factura");
                oDialogModel.setProperty("/selloTienda", "SELLO_RECEPCION_ALMACEN_P202_VALIDADO");
                oDialogModel.setProperty("/importeNeto", "8500.00");
                oDialogModel.setProperty("/importeIGV", "1530.00");
                oDialogModel.setProperty("/importeTotal", "10030.00");
                oDialogModel.setProperty("/moneda", "PEN");
                oDialogModel.setProperty("/ocrStatusText", "✅ DROID OCR (Factura_F001-0063045.pdf): Lectura realizada con éxito. Folio SUNAT F001-0063045 | Sociedad P202 | Neto S/ 8,500.00 | IGV S/ 1,530.00 | Total S/ 10,030.00 | Sello Almacén OK.");
            } else if (sPdfKey === "PDF_2") {
                oDialogModel.setProperty("/sociedad", "P101 Droid Perú SAC");
                oDialogModel.setProperty("/serie", "F002");
                oDialogModel.setProperty("/correlativo", "0098412");
                oDialogModel.setProperty("/claseDoc", "01 - Factura");
                oDialogModel.setProperty("/selloTienda", "SELLO_RECEPCION_ALMACEN_P101_VALIDADO");
                oDialogModel.setProperty("/importeNeto", "4200.00");
                oDialogModel.setProperty("/importeIGV", "756.00");
                oDialogModel.setProperty("/importeTotal", "4956.00");
                oDialogModel.setProperty("/moneda", "USD");
                oDialogModel.setProperty("/ocrStatusText", "✅ DROID OCR (Factura_Electronica_F002-0098412.pdf): Lectura realizada con éxito. Folio SUNAT F002-0098412 | Sociedad P101 | Neto USD 4,200.00 | IGV USD 756.00 | Total USD 4,956.00 | Sello Almacén OK.");
            } else {
                oDialogModel.setProperty("/sociedad", "P202 Superdeporte Plus Perú SAC");
                oDialogModel.setProperty("/serie", "0F001");
                oDialogModel.setProperty("/correlativo", "0041200");
                oDialogModel.setProperty("/claseDoc", "01 - Factura");
                oDialogModel.setProperty("/selloTienda", "SELLO_RECEPCION_TIENDA_LIMA");
                oDialogModel.setProperty("/importeNeto", "1200.00");
                oDialogModel.setProperty("/importeIGV", "216.00");
                oDialogModel.setProperty("/importeTotal", "1416.00");
                oDialogModel.setProperty("/moneda", "PEN");
                oDialogModel.setProperty("/ocrStatusText", "✅ DROID OCR (Guia_Remision_GR01-004120.pdf): Lectura realizada con éxito. Folio SUNAT F001-0041200 | Sociedad P202 | Neto S/ 1,200.00 | IGV S/ 216.00 | Total S/ 1,416.00.");
            }

            oDialogModel.setProperty("/ocrStatusType", "Success");
            oDialogModel.setProperty("/ocrExecuted", true);

            MessageToast.show("🔍 DROID OCR: Documento pre-cargado escaneado y campos precargados automáticamente.");
        },

        onSimulateXmlUpload: function () {
            if (!this._oPreRegDialog) return;
            var oDialogModel = this._oPreRegDialog.getModel("dialog");
            oDialogModel.setProperty("/attachedXmlName", "20517426726-FA-F001-000630451.xml");
            oDialogModel.setProperty("/attachedPdfName", "20517426726-FA-F001-000630451.pdf");
            oDialogModel.setProperty("/xmlUploaded", true);
            oDialogModel.setProperty("/serie", "0F001");
            oDialogModel.setProperty("/correlativo", "0063045");
            oDialogModel.setProperty("/importeTotal", "11016.39");
            oDialogModel.setProperty("/importeIGV", "1680.47");
            oDialogModel.setProperty("/moneda", "PEN");

            var that = this;
            if (!this._oXmlLogDialog) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "com.antigravity.portalProveedores.fragment.XmlLogDialog",
                    controller: this
                }).then(function (oDialog) {
                    that._oXmlLogDialog = oDialog;
                    that.getView().addDependent(that._oXmlLogDialog);
                    that._oXmlLogDialog.open();
                });
            } else {
                this._oXmlLogDialog.open();
            }
        },

        onCloseXmlLogDialog: function () {
            if (this._oXmlLogDialog) {
                this._oXmlLogDialog.close();
            }
        },

        onSavePreRegisterInvoice: function () {
            if (!this._oPreRegDialog) return;
            var oDialogModel = this._oPreRegDialog.getModel("dialog");
            var oDialogData = oDialogModel.getData();

            var sComprobanteNro = "01-" + oDialogData.serie + "-" + oDialogData.correlativo;
            var sCorrelativoSCP = "P" + Math.floor(1000000000 + Math.random() * 9000000000);

            var oAppModel = this.getView().getModel("app");
            var aGoodsReceipts = oAppModel.getProperty("/goodsReceipts") || [];
            var aAccountingQueue = oAppModel.getProperty("/accountingInvoices") || [];

            oDialogData.selectedItems.forEach(function (selItem) {
                var oFound = aGoodsReceipts.find(function (g) {
                    return g.parteIngreso === selItem.parteIngreso && g.posParte === selItem.posParte;
                });
                if (oFound) {
                    oFound.comprobante = sComprobanteNro;
                    oFound.correlativoSCP = sCorrelativoSCP;
                    oFound.estado = "COMPROBANTE_REGISTRADO";
                }
            });

            aAccountingQueue.unshift({
                ruc: oAppModel.getProperty("/user/nif"),
                razonSocial: oAppModel.getProperty("/user/name"),
                comprobante: sComprobanteNro,
                oc: oDialogData.selectedItems[0] ? oDialogData.selectedItems[0].ordenCompra : "4540012337",
                monto: parseFloat(oDialogData.importeTotal),
                moneda: oDialogData.moneda,
                fechaPreReg: new Date().toLocaleDateString("es-PE"),
                xmlStatus: "VALIDO_SUNAT",
                estado: "PENDIENTE_CONTABILIZAR"
            });

            oAppModel.refresh(true);
            this.onClosePreRegDialog();
            MessageToast.show(" Factura " + sComprobanteNro + " Pre-Registrada con éxito. Código SCP: " + sCorrelativoSCP);
        },

        onViewOC: function (oEvent) {
            var sPO = oEvent.getSource().getText();
            if (sPO) {
                this.navTo("purchaseOrderDetail", { poId: sPO });
            }
        },

        onExportExcel: function () {
            MessageToast.show("Exportando reporte de Pre-Registro a Excel...");
        }
    });
});
