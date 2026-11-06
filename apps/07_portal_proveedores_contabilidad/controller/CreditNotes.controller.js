sap.ui.define([
    "com/antigravity/portalProveedoresContabilidad/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (BaseController, Filter, FilterOperator, MessageBox, MessageToast) {
    "use strict";

    return BaseController.extend("com.antigravity.portalProveedoresContabilidad.controller.CreditNotes", {

        onInit: function () {
            // CreditNotes init
        },

        onOpenNewNcDialog: function () {
            MessageBox.information(
                "Asistente de Registro de Nota de Crédito Electrónica:\n\n" +
                "1. Seleccione la factura contabilizada a la que se aplicará el descuento.\n" +
                "2. Cargue el archivo XML UBL 2.1 emitido por el proveedor.\n" +
                "3. El sistema verificará automáticamente el motivo SUNAT (Tipo 01 al 10).\n" +
                "4. Se generará un documento contable de abono clase KG en SAP ERP."
            );
        },

        onApplyNcCompensation: function () {
            var oTable = this.byId("tableNC");
            var oSelectedItem = oTable.getSelectedItem();
            var oAppModel = this.getModel("app");
            var aNC = oAppModel.getProperty("/creditNotes");

            var oPending = aNC.find(function (n) { return n.estado === "PENDIENTE_APLICAR"; });
            if (oPending) {
                oPending.estado = "APLICADA";
                oPending.docCompensacion = "5200000103";
                oAppModel.refresh(true);

                MessageBox.success(
                    "Nota de Crédito " + oPending.comprobanteNC + " compensada exitosamente en SAP ERP:\n\n" +
                    "• Documento de Compensación: 5200000103\n" +
                    "• Factura Afecta: " + oPending.facturaAfecta + "\n" +
                    "• Monto Reducido de Cartera: $ " + oPending.importe + " USD\n" +
                    "• La varianza de precio ha sido subsanada."
                );
            } else {
                MessageToast.show("Todas las notas de crédito de la lista ya se encuentran aplicadas en SAP.");
            }
        },

        onFilterNC: function (oEvent) {
            var sQuery = oEvent.getParameter("newValue");
            var aFilters = [];
            if (sQuery) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("comprobanteNC", FilterOperator.Contains, sQuery),
                        new Filter("facturaAfecta", FilterOperator.Contains, sQuery),
                        new Filter("proveedor", FilterOperator.Contains, sQuery)
                    ],
                    and: false
                }));
            }
            var oTable = this.byId("tableNC");
            var oBinding = oTable.getBinding("items");
            if (oBinding) {
                oBinding.filter(aFilters);
            }
        },

        onExportExcel: function () {
            MessageToast.show("Exportando registro de notas de crédito a Excel...");
        }
    });
});
