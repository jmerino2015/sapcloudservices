sap.ui.define([
    "sap/crm/customerportal/controller/BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/BusyDialog"
], function (BaseController, MessageToast, MessageBox, BusyDialog) {
    "use strict";

    return BaseController.extend("sap.crm.customerportal.controller.Builder", {

        onInit: function () {
            // Builder initialized
        },

        onTabSelect: function (oEvent) {
            var sKey = oEvent.getParameter("key");
            this.recordActivity("Navegación a Experience Builder: " + sKey, "Experience Cloud", "BuilderNav");
        },

        onPublishExperience: function () {
            var oBusy = new BusyDialog({
                title: "Publicando Portal en Experience Cloud",
                text: "Compilando Lightning Web Components (LWC) y desplegando en SAP BTP / CDN..."
            });
            oBusy.open();

            setTimeout(function () {
                oBusy.close();
                this.recordActivity("Publicación de nueva versión de Experiencia Digital", "Experience Cloud", "ExperienceBuilderPublish");
                MessageBox.success("¡Experiencia digital publicada exitosamente!\n\nLos cambios en componentes y audiencias ya están visibles para todos los clientes y socios comerciales.");
            }.bind(this), 1200);
        },

        onToggleComponentVisibility: function (oEvent) {
            var bState = oEvent.getParameter("state");
            MessageToast.show("Componente " + (bState ? "habilitado" : "ocultado") + " en el lienzo de experiencia.");
        },

        onSelectTemplate: function () {
            MessageToast.show("Plantilla activada. Componentes reconfigurados.");
        },

        onBuildMobileApp: function () {
            MessageBox.success("Compilación nativa iniciada en Mobile Publisher.\n\nPaquetes generados:\n• iOS: IPA firmado para TestFlight / App Store\n• Android: AAB optimizado para Google Play Store", { title: "Mobile Publisher Build" });
        },

        onTestPushNotification: function () {
            MessageToast.show("🔔 Notificación push de prueba enviada al dispositivo móvil.");
        }
    });
});
