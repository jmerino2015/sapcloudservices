sap.ui.define([
    "com/antigravity/portalProveedoresContabilidad/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (BaseController, Filter, FilterOperator, MessageBox, MessageToast) {
    "use strict";

    return BaseController.extend("com.antigravity.portalProveedoresContabilidad.controller.PaymentsAudit", {

        onInit: function () {
            // PaymentsAudit init
        },

        onGenerateSpotTxt: function () {
            MessageBox.success(
                "Archivo de Detracciones generado exitosamente para el Banco de la Nación (SPOT):\n\n" +
                "• Nombre de Archivo: D20512839121_202611.TXT\n" +
                "• Lote: LOTE-2026-W44\n" +
                "• Total Registros: 2 Detracciones\n" +
                "• Monto Total a Depositar: S/ 48,920.00 PEN\n" +
                "• Listo para cargar en la banca por internet del Banco de la Nación."
            );
        },

        onScheduleF110: function () {
            MessageBox.confirm("¿Desea programar la propuesta de pagos masivos automática (Transacción SAP F110)?", {
                title: "Propuesta de Pagos F110",
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        MessageToast.show("Propuesta F110 ejecutada. 1 pago programado para el 15/11/2026 vía BCP.");
                    }
                }
            });
        },

        onFilterPayment: function (oEvent) {
            var sQuery = oEvent.getParameter("newValue");
            var aFilters = [];
            if (sQuery) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("proveedor", FilterOperator.Contains, sQuery),
                        new Filter("comprobante", FilterOperator.Contains, sQuery),
                        new Filter("nroOperacion", FilterOperator.Contains, sQuery)
                    ],
                    and: false
                }));
            }
            var oTable = this.byId("paymentsAuditPage").getContent()[0].getItems()[2].getContent()[0];
            if (oTable && oTable.getBinding("items")) {
                oTable.getBinding("items").filter(aFilters);
            }
        },

        onViewSpotCertificate: function (oEvent) {
            var sConstancia = oEvent.getSource().getText();
            if (sConstancia === "—" || sConstancia.includes("PENDIENTE")) {
                MessageToast.show("La constancia de depósito aún está en proceso de compensación con el Banco de la Nación.");
                return;
            }
            MessageBox.information(
                "Constancia Oficial de Depósito de Detracciones (SPOT):\n\n" +
                "• Número de Constancia: " + sConstancia + "\n" +
                "• Banco: Banco de la Nación del Perú\n" +
                "• Cuenta Corriente SPOT: 00-000-849102\n" +
                "• Estado Tributario: Acreditado en cuenta corriente del proveedor."
            );
        },

        onExportExcel: function () {
            MessageToast.show("Exportando reporte de pagos y retenciones a Excel (.xlsx)...");
        }
    });
});
