sap.ui.define([
    "com/antigravity/portalProveedores/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (BaseController, JSONModel, MessageToast) {
    "use strict";

    return BaseController.extend("com.antigravity.portalProveedores.controller.PurchaseOrderDetail", {

        onInit: function () {
            this.getRouter()
                .getRoute("purchaseOrderDetail")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            var sPOId = oEvent.getParameter("arguments").poId;
            this._loadPODetail(sPOId);
        },

        _loadPODetail: function (sPOId) {
            // Datos de ejemplo — en producción: OData read por clave
            var oDetailData = {
                poNumber: sPOId,
                supplier: "Proveedor Industrial S.A. de C.V.",
                date: "15/06/2026",
                deliveryDate: "30/06/2026",
                totalAmount: "285,000",
                amountState: "None",
                statusText: "Abierta",
                statusState: "Information",
                statusIcon: "sap-icon://pending",
                notes: "Favor de coordinar la entrega con el almacén central. " +
                    "Contactar al responsable de recepción con 24 horas de anticipación. " +
                    "Se requiere guía de remisión firmada y sellada.",
                items: [
                    {
                        itemNumber: "10",
                        materialCode: "ACER-304-2MM",
                        materialDesc: "Acero Inoxidable 304, espesor 2mm, lámina 1.2x2.4m",
                        quantity: "300",
                        delivered: "300",
                        unit: "KG",
                        unitPrice: "285.00",
                        totalPrice: "85,500",
                        deliveredHighlight: "Success",
                        deliveredState: "Success"
                    },
                    {
                        itemNumber: "20",
                        materialCode: "ACER-304-3MM",
                        materialDesc: "Acero Inoxidable 304, espesor 3mm, lámina 1.2x2.4m",
                        quantity: "200",
                        delivered: "100",
                        unit: "KG",
                        unitPrice: "310.00",
                        totalPrice: "62,000",
                        deliveredHighlight: "Warning",
                        deliveredState: "Warning"
                    },
                    {
                        itemNumber: "30",
                        materialCode: "ACER-316-2MM",
                        materialDesc: "Acero Inoxidable 316, espesor 2mm, lámina 1x2m",
                        quantity: "450",
                        delivered: "0",
                        unit: "KG",
                        unitPrice: "304.44",
                        totalPrice: "137,000",
                        deliveredHighlight: "Error",
                        deliveredState: "Error"
                    }
                ]
            };

            var oModel = new JSONModel(oDetailData);
            this.setModel(oModel, "poDetail");
        },

        onCreateInvoice: function () {
            this.navTo("invoices");
            MessageToast.show(this.getText("invDialogTitle"));
        },

        onCreateDelivery: function () {
            this.navTo("deliveries");
            MessageToast.show(this.getText("delNewDelivery"));
        },

        onDownload: function () {
            MessageToast.show(this.getText("commonDownload"));
        },

        onExit: function () {
            var oModel = this.getView().getModel("poDetail");
            if (oModel) {
                oModel.destroy();
            }
        }
    });
});
