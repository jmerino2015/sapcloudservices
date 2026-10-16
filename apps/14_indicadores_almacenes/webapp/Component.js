sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "com/antigravity/indicadoresAlmacenes/model/models"
], function (UIComponent, Device, models) {
    "use strict";

    return UIComponent.extend("com.antigravity.indicadoresAlmacenes.Component", {

        metadata: {
            manifest: "json"
        },

        /**
         * Inicialización del componente principal Fiori.
         */
        init: function () {
            // 1. Inicializar modelos síncronamente antes de la inicialización de vistas
            this.setModel(models.createDeviceModel(), "device");
            this.setModel(models.createWmsModel(), "wms");

            // 2. Llamar al constructor de UIComponent (crea rootView y controladores)
            UIComponent.prototype.init.apply(this, arguments);

            // 3. Inicializar enrutador
            this.getRouter().initialize();
        },

        /**
         * Retorna la clase CSS de densidad de contenido adecuada para el dispositivo.
         * @returns {string} Clase CSS (sapUiSizeCompact o sapUiSizeCozy)
         */
        getContentDensityClass: function () {
            if (!this._sContentDensityClass) {
                if (Device.support.touch) {
                    this._sContentDensityClass = "sapUiSizeCozy";
                } else {
                    this._sContentDensityClass = "sapUiSizeCompact";
                }
            }
            return this._sContentDensityClass;
        },

        destroy: function () {
            UIComponent.prototype.destroy.apply(this, arguments);
        }
    });
});
