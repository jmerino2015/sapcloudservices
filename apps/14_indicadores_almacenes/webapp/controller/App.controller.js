sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("com.antigravity.indicadoresAlmacenes.controller.App", {
        onInit: function () {
            // Aplicar la clase de densidad en la vista raíz
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
        }
    });
});
