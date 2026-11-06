sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel"
], function (UIComponent, Device, JSONModel) {
    "use strict";

    return UIComponent.extend("com.antigravity.portalProveedoresContabilidad.Component", {

        metadata: {
            manifest: "json"
        },

        init: function () {
            UIComponent.prototype.init.apply(this, arguments);

            // Modelo de dispositivo
            var oDeviceModel = new JSONModel(Device);
            oDeviceModel.setDefaultBindingMode("OneWay");
            this.setModel(oDeviceModel, "device");

            // Modelo Principal de Datos Contables (mockData.json)
            var oAppModel = new JSONModel();
            oAppModel.loadData(sap.ui.require.toUrl("com/antigravity/portalProveedoresContabilidad/model/mockData.json"), null, false);
            this.setModel(oAppModel, "app");

            // Modelo para Asistente Inteligente SAP Joule AI
            var oJouleModel = new JSONModel({
                messages: [
                    {
                        sender: "bot",
                        text: "Hola, soy <strong>SAP Joule AI Contable</strong>. Estoy monitoreando las facturas pre-registradas. Hemos detectado <strong>3 discrepancias de 3-Way Match</strong> en precios y recepciones MIGO. ¿Deseas revisarlas o simular la contabilización masiva MIRO?",
                        timestamp: "Hoy, 09:15"
                    }
                ],
                inputMessage: "",
                isTyping: false
            });
            this.setModel(oJouleModel, "jouleModel");

            // Inicializar Router
            this.getRouter().initialize();
        },

        destroy: function () {
            UIComponent.prototype.destroy.apply(this, arguments);
        },

        getContentDensityClass: function () {
            if (!this._sContentDensityClass) {
                if (Device.support.touch) {
                    this._sContentDensityClass = "sapUiSizeCozy";
                } else {
                    this._sContentDensityClass = "sapUiSizeCompact";
                }
            }
            return this._sContentDensityClass;
        }
    });
});
