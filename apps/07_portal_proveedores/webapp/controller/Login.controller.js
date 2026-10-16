sap.ui.define([
    "com/antigravity/portalProveedores/controller/BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (BaseController, MessageToast, MessageBox) {
    "use strict";

    return BaseController.extend("com.antigravity.portalProveedores.controller.Login", {

        onInit: function () {
        },

        onLoginPress: function () {
            var sUser = this.byId("loginUser").getValue();
            var sPass = this.byId("loginPassword").getValue();

            if (!sUser || !sPass) {
                MessageBox.error("Por favor ingrese su usuario y contraseña.");
                return;
            }

            MessageToast.show("¡Bienvenido admin! Accediendo al Portal...");
            this.navTo("launchpad");
        },

        onForgotPassword: function () {
            MessageBox.information("Se ha enviado un enlace de recuperación de contraseña a su correo corporativo.");
        },

        onGoToAutoRegister: function () {
            this.navTo("autoRegister");
        }

    });
});
