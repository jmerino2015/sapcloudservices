sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent"
], function (Controller, UIComponent) {
    "use strict";

    return Controller.extend("c4c.leadmanagement.controller.Login", {
        onInit: function () {
        },

        onLoginPress: function () {
            // Mock Login Validation (User + Password)
            var oUserInput = this.getView().byId("userInput");
            var oPassInput = this.getView().byId("passInput");
            
            if (oUserInput && oPassInput) {
                var sUser = oUserInput.getValue();
                var sPass = oPassInput.getValue();
                if (sUser && sPass) {
                    var oRouter = UIComponent.getRouterFor(this);
                    oRouter.navTo("RouteMenu");
                }
            }
        }
    });
});
