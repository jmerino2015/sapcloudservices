sap.ui.define([
    "com/antigravity/portalProveedores/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (BaseController, JSONModel, MessageToast, MessageBox) {
    "use strict";

    return BaseController.extend("com.antigravity.portalProveedores.controller.Documents", {

        onInit: function () {
            this._sSearchQuery = "";
            this._initDocModel();
            this.getRouter()
                .getRoute("documents")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            this._applyFilters();
        },

        _initDocModel: function () {
            var aDocs = [
                {
                    name: "Constancia de Situación Fiscal 2026.pdf",
                    category: "Documentos Fiscales",
                    type: "PDF", typeIcon: "sap-icon://pdf-attachment", typeState: "None",
                    date: "01/01/2026", size: "1.2 MB"
                },
                {
                    name: "Acta Constitutiva - Empresa SA de CV.pdf",
                    category: "Documentos Legales",
                    type: "PDF", typeIcon: "sap-icon://pdf-attachment", typeState: "None",
                    date: "15/03/2020", size: "3.8 MB"
                },
                {
                    name: "Cotización_Acero_Inox_Jun2026.xlsx",
                    category: "Cotizaciones",
                    type: "Excel", typeIcon: "sap-icon://excel-attachment", typeState: "Success",
                    date: "10/06/2026", size: "542 KB"
                },
                {
                    name: "Certificado_Calidad_ISO9001_2025.pdf",
                    category: "Certificaciones",
                    type: "PDF", typeIcon: "sap-icon://pdf-attachment", typeState: "None",
                    date: "15/01/2025", size: "2.1 MB"
                },
                {
                    name: "Datos_Bancarios_Actualización.pdf",
                    category: "Información Bancaria",
                    type: "PDF", typeIcon: "sap-icon://pdf-attachment", typeState: "None",
                    date: "20/04/2026", size: "485 KB"
                },
                {
                    name: "Lista_Precios_Materiales_2026.xlsx",
                    category: "Listas de Precios",
                    type: "Excel", typeIcon: "sap-icon://excel-attachment", typeState: "Success",
                    date: "05/01/2026", size: "1.8 MB"
                },
                {
                    name: "Ficha_Tecnica_Acero304.pdf",
                    category: "Fichas Técnicas",
                    type: "PDF", typeIcon: "sap-icon://pdf-attachment", typeState: "None",
                    date: "12/02/2026", size: "756 KB"
                },
                {
                    name: "Seguro_Responsabilidad_Civil_2026.pdf",
                    category: "Seguros",
                    type: "PDF", typeIcon: "sap-icon://pdf-attachment", typeState: "None",
                    date: "01/01/2026", size: "1.4 MB"
                }
            ];

            var oModel = new JSONModel({
                documents: aDocs,
                allDocuments: aDocs
            });
            this.setModel(oModel, "doc");
        },

        _applyFilters: function () {
            var oModel = this.getModel("doc");
            if (!oModel) { return; }
            var aAll = oModel.getProperty("/allDocuments");
            var aFiltered = aAll.filter(function (oDoc) {
                return !this._sSearchQuery ||
                    oDoc.name.toLowerCase().includes(this._sSearchQuery.toLowerCase()) ||
                    oDoc.category.toLowerCase().includes(this._sSearchQuery.toLowerCase()) ||
                    oDoc.type.toLowerCase().includes(this._sSearchQuery.toLowerCase());
            }.bind(this));
            oModel.setProperty("/documents", aFiltered);
        },

        onSearchLive: function (oEvent) {
            this._sSearchQuery = oEvent.getParameter("newValue");
            this._applyFilters();
        },

        onRefresh: function () {
            this._initDocModel();
            MessageToast.show(this.getText("commonRefresh"));
        },

        onFileSelected: function (oEvent) {
            var sFileName = oEvent.getParameter("newValue");
            if (sFileName) {
                MessageToast.show(this.getText("docUploadSuccess"));
            }
        },

        onDownloadDoc: function () {
            MessageToast.show(this.getText("commonDownload"));
        },

        onDeleteDoc: function (oEvent) {
            var oItem = oEvent.getSource().getParent().getParent();
            var oCtx = oItem.getBindingContext("doc");
            var sDocName = oCtx.getProperty("name");

            MessageBox.confirm(this.getText("docDeleteConfirm"), {
                title: this.getText("docDeleteConfirmTitle"),
                actions: [
                    this.getText("docDeleteYes"),
                    this.getText("docDeleteNo")
                ],
                emphasizedAction: this.getText("docDeleteNo"),
                onClose: function (sAction) {
                    if (sAction === this.getText("docDeleteYes")) {
                        var oModel = this.getModel("doc");
                        var aAll = oModel.getProperty("/allDocuments");
                        var aFiltered = aAll.filter(function (oDoc) {
                            return oDoc.name !== sDocName;
                        });
                        oModel.setProperty("/allDocuments", aFiltered);
                        oModel.setProperty("/documents", aFiltered);
                        MessageToast.show(this.getText("docDeleteSuccess"));
                    }
                }.bind(this)
            });
        },

        onExit: function () {
            var oModel = this.getView().getModel("doc");
            if (oModel) { oModel.destroy(); }
        }
    });
});
