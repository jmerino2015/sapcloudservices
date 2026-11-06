sap.ui.define([
    "com/antigravity/portalProveedoresContabilidad/controller/BaseController",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (BaseController, MessageBox, MessageToast) {
    "use strict";

    return BaseController.extend("com.antigravity.portalProveedoresContabilidad.controller.Settings", {

        onInit: function () {
            // Settings init
        },

        onSaveSettings: function () {
            MessageToast.show("Parámetros contables y tolerancias guardados exitosamente.");
            MessageBox.success(
                "Configuración Actualizada:\n\n" +
                "• Tolerancia en Precio: ±" + this.getModel("app").getProperty("/settings/priceTolerance") + "%\n" +
                "• Tolerancia en Cantidad: " + this.getModel("app").getProperty("/settings/qtyTolerance") + "%\n" +
                "• Cuenta Mayor Inventario: " + this.getModel("app").getProperty("/settings/defaultGLInventory") + "\n" +
                "• Ambiente SIRE SUNAT: " + this.getModel("app").getProperty("/settings/sireEnv") + "\n" +
                "• Ejercicio y Período Activo: 2026/11 (ABIERTO)."
            );
        }
    });
});
