sap.ui.define([
    "com/antigravity/portalProveedores/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (BaseController, JSONModel, MessageToast) {
    "use strict";

    return BaseController.extend("com.antigravity.portalProveedores.controller.Profile", {

        onInit: function () {
            this._initProfileModel();
            this.getRouter()
                .getRoute("profile")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            // En producción: cargar datos del proveedor autenticado desde OData
        },

        _initProfileModel: function () {
            var oModel = new JSONModel({
                companyName: "Proveedor Industrial S.A. de C.V.",
                rfc: "PIS2001058K5",
                supplierCode: "V-001234",
                category: "industrial",
                status: "Activo",
                contactName: "Ing. Carlos Mendoza García",
                email: "c.mendoza@proveedor-industrial.com.mx",
                phone: "+52 (55) 1234-5678",
                address: "Av. Industrial 1450, Col. Vallejo, Gustavo A. Madero, C.P. 07700, CDMX",
                bank: "bbva",
                account: "0123456789",
                clabe: "012345678901234567",
                editMode: false
            });
            this._oOriginalData = JSON.parse(JSON.stringify(oModel.getData()));
            this.setModel(oModel, "profile");
        },

        onEditProfile: function () {
            var oModel = this.getModel("profile");
            // Guardar copia antes de editar
            this._oOriginalData = JSON.parse(JSON.stringify(oModel.getData()));
            oModel.setProperty("/editMode", true);
        },

        onCancelEdit: function () {
            var oModel = this.getModel("profile");
            // Restaurar datos originales
            oModel.setData(this._oOriginalData);
            oModel.setProperty("/editMode", false);
        },

        onSaveProfile: function () {
            // En producción: llamada OData PATCH/PUT para actualizar el proveedor
            var oModel = this.getModel("profile");
            oModel.setProperty("/editMode", false);
            this._oOriginalData = JSON.parse(JSON.stringify(oModel.getData()));
            MessageToast.show(this.getText("profileSaveSuccess"));
        },

        onExit: function () {
            var oModel = this.getView().getModel("profile");
            if (oModel) { oModel.destroy(); }
        }
    });
});
