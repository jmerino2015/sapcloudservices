sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, UIComponent, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("sap.crm.customerportal.controller.BaseController", {
        
        /**
         * Convenience method for accessing the router.
         * @public
         * @returns {sap.ui.core.routing.Router} the router for this component
         */
        getRouter: function () {
            return UIComponent.getRouterFor(this);
        },

        /**
         * Convenience method for getting the view model by name.
         * @public
         * @param {string} [sName] the model name
         * @returns {sap.ui.model.Model} the model instance
         */
        getModel: function (sName) {
            return this.getView().getModel(sName) || this.getOwnerComponent().getModel(sName);
        },

        /**
         * Convenience method for setting the view model.
         * @public
         * @param {sap.ui.model.Model} oModel the model instance
         * @param {string} sName the model name
         * @returns {sap.ui.core.mvc.View} the view instance
         */
        setModel: function (oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

        /**
         * Convenience method for getting the resource bundle.
         * @public
         * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
         */
        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        /**
         * Record a user activity in the CRM Audit & Integration Log (Functional Requirement 4.0)
         * @param {string} sAction Description of the user interaction
         * @param {string} sCategory Category (Ventas, Servicio, Perfil, Onboarding)
         * @param {string} sEntity CRM/S4 OData Entity (e.g. OpportunityCollection, ServiceRequestCollection)
         */
        recordActivity: function (sAction, sCategory, sEntity) {
            var oModel = this.getModel();
            var oSessionModel = this.getModel("session");
            var sUser = oSessionModel.getProperty("/currentUser/name") || "Usuario Portal";

            var aAuditLog = oModel.getProperty("/activityAuditLog") || [];
            var oNewActivity = {
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                user: sUser,
                action: sAction,
                category: sCategory,
                c4cEntity: sEntity || "ActivityCollection",
                status: "Registrado en CRM"
            };

            aAuditLog.unshift(oNewActivity);
            oModel.setProperty("/activityAuditLog", aAuditLog);
        },

        /* =========================================================== */
        /* Formatting Helpers for SAP Fiori Look & Feel                */
        /* =========================================================== */

        formatCurrency: function (fVal, sCurrency) {
            if (fVal === null || fVal === undefined) {
                return "$0.00";
            }
            var sCurr = sCurrency || "USD";
            return new Intl.NumberFormat("es-CL", { style: "currency", currency: sCurr }).format(fVal);
        },

        formatOrderStatusState: function (sStatus) {
            switch (sStatus) {
                case "CREADO":
                    return "Information";
                case "EN_PREPARACION":
                    return "Warning";
                case "DESPACHADO":
                    return "Information";
                case "ENTREGADO":
                    return "Success";
                default:
                    return "None";
            }
        },

        formatOrderStatusIcon: function (sStatus) {
            switch (sStatus) {
                case "CREADO":
                    return "sap-icon://create";
                case "EN_PREPARACION":
                    return "sap-icon://inventory";
                case "DESPACHADO":
                    return "sap-icon://shipping-status";
                case "ENTREGADO":
                    return "sap-icon://accept";
                default:
                    return "sap-icon://order-status";
            }
        },

        formatSlaState: function (sSlaStatus) {
            switch (sSlaStatus) {
                case "ON_TIME":
                    return "Success";
                case "WARNING":
                    return "Warning";
                case "BREACHED":
                    return "Error";
                default:
                    return "None";
            }
        },

        formatPriorityState: function (sPriority) {
            switch (sPriority) {
                case "URGENTE":
                    return "Error";
                case "ALTA":
                    return "Error";
                case "MEDIA":
                    return "Warning";
                case "BAJA":
                    return "Success";
                default:
                    return "None";
            }
        },

        formatRoleBadgeState: function (sRole) {
            switch (sRole) {
                case "ADMIN":
                    return "Error";
                case "BUYER":
                    return "Information";
                case "VIEWER":
                    return "None";
                default:
                    return "None";
            }
        }
    });
});
