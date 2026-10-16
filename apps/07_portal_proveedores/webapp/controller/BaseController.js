sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/core/UIComponent"
], function (Controller, History, UIComponent) {
    "use strict";

    return Controller.extend("com.antigravity.portalProveedores.controller.BaseController", {

        /**
         * Retorna el router del UIComponent
         * @returns {sap.ui.core.routing.Router}
         */
        getRouter: function () {
            return UIComponent.getRouterFor(this);
        },

        /**
         * Retorna un modelo por nombre desde el view o el component
         * @param {string} [sName] Nombre del modelo
         * @returns {sap.ui.model.Model}
         */
        getModel: function (sName) {
            return this.getView().getModel(sName) || this.getOwnerComponent().getModel(sName);
        },

        /**
         * Asigna un modelo al view
         * @param {sap.ui.model.Model} oModel
         * @param {string} [sName] Nombre del modelo
         */
        setModel: function (oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

        /**
         * Retorna el ResourceBundle i18n
         * @returns {sap.base.i18n.ResourceBundle}
         */
        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        /**
         * Retorna un texto internacionalizado
         * @param {string} sKey Clave i18n
         * @param {Array} [aArgs] Parámetros del texto
         * @returns {string}
         */
        getText: function (sKey, aArgs) {
            return this.getResourceBundle().getText(sKey, aArgs);
        },

        /**
         * Navega hacia atrás o a la ruta de home si no hay historial
         */
        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getRouter().navTo("home", {}, true);
            }
        },

        /**
         * Navega a una ruta específica
         * @param {string} sRouteName Nombre de la ruta
         * @param {Object} [oParameters] Parámetros de la ruta
         */
        navTo: function (sRouteName, oParameters) {
            this.getRouter().navTo(sRouteName, oParameters || {});
        }
    });
});
