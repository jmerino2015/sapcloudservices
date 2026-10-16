sap.ui.define([
    "com/antigravity/portalProveedores/controller/BaseController",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (BaseController, MessageBox, MessageToast) {
    "use strict";

    return BaseController.extend("com.antigravity.portalProveedores.controller.AutoRegister", {

        onInit: function () {
            this.getRouter().getRoute("autoRegister").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function () {
            var oModel = new sap.ui.model.json.JSONModel({
                nif: "",
                razonSocial: "",
                email: "",
                tipoEmisor: "ELECTRONICO",
                nombres: "",
                apellidos: "",
                phone: "",
                password: "",
                passwordConfirm: ""
            });
            this.getView().setModel(oModel);
        },

        onRegisterPress: function () {
            var oData = this.getView().getModel().getData();

            if (!oData.nif || !oData.email || !oData.password) {
                MessageBox.error("Por favor complete los campos obligatorios (*)");
                return;
            }

            if (oData.password !== oData.passwordConfirm) {
                MessageBox.error("Las contraseñas ingresadas no coinciden.");
                return;
            }

            var sMsg = this.getText("autoRegSuccessMsg", [oData.email]);
            MessageBox.success(sMsg, {
                title: this.getText("autoRegSuccessTitle"),
                onClose: function () {
                    this.navTo("home");
                }.bind(this)
            });
        }

    });
});
