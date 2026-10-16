sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device",
    "com/antigravity/indicadoresAlmacenes/model/mockData"
], function (JSONModel, Device, mockData) {
    "use strict";

    return {
        /**
         * Crea el modelo con información del dispositivo.
         * @returns {sap.ui.model.json.JSONModel} Modelo de dispositivo
         */
        createDeviceModel: function () {
            var oModel = new JSONModel(Device);
            oModel.setDefaultBindingMode("OneWay");
            return oModel;
        },

        /**
         * Crea e inicializa el modelo local de la Torre de Control WMS de forma inmediata y síncrona.
         * @returns {sap.ui.model.json.JSONModel} Modelo de la aplicación
         */
        createWmsModel: function () {
            var oData = mockData ? JSON.parse(JSON.stringify(mockData)) : {};
            var oModel = new JSONModel(oData);
            return oModel;
        }
    };
});
