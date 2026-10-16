sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
], function (Controller, JSONModel, Filter, FilterOperator) {
    "use strict";
    let BusyDialogGlobal = new sap.m.BusyDialog("glbDialogGestionLeads", { title: "En Proceso. . . " })
    return Controller.extend("c4c.leadmanagement.controller.Base", {

        showBusyDialog() {
            BusyDialogGlobal.open();
        },

        closeBusyDialog() {
            BusyDialogGlobal.close();
        },

        getRouter: function () {
            try {
                return sap.ui.core.UIComponent.getRouterFor(this)
            } catch (e) {
                console.error("Error al obtener el router:", e);
                return null;
            }
        },

        readEntity: function (odataModel, path, parameters) {
            return new Promise((resolve, reject) => {
                odataModel.read(path, {
                    filters: parameters.filters,
                    urlParameters: parameters.urlParameters,
                    success: resolve,
                    error: reject
                });
            });
        },


        /**
     * Carga prioritaria del usuario para obtener sociedad y área
     */
        _loadUsuarioSesion: async function () {
            const oUsuarioModel = this.getOwnerComponent().getModel("usuarioModel");
            const oUsuarioSesionModel = this.getOwnerComponent().getModel("usuarioSesionModel");
            const sUserId = oUsuarioSesionModel.getProperty("/userId") || "";

            const aFiltersUsuario = [
                new Filter("Accion", FilterOperator.EQ, "R"),
                new Filter("CodigoUsuario", FilterOperator.EQ, sUserId)
            ];

            try {
                // Usamos await para esperar la respuesta de OData
                const data = await this.readEntity(oUsuarioModel, "/PeReturnSet", {
                    filters: aFiltersUsuario
                });

                console.log("Usuarios obtenidos:", data);

                const findedUser = data?.results.find(user => user.CodigoUsuario === sUserId);
                console.log("Usuario encontrado para sesión:", findedUser);

                if (findedUser) {
                    const Area = findedUser.Area || "";
                    const Sociedad = findedUser.Sociedad || "";
                    const Nombre = findedUser.Nombre || "";

                    oUsuarioSesionModel.setProperty("/userArea", Area);
                    oUsuarioSesionModel.setProperty("/userSociedad", Sociedad);
                    oUsuarioSesionModel.setProperty("/userNombre", Nombre);
                }

                // Guardar modelo local si es necesario para otros combos
                const oModel = new JSONModel({ items: data.results });
                oModel.setSizeLimit(data.results.length);
                this.getOwnerComponent().setModel(oModel, "localUsuarioModel");

            } catch (err) {
                console.error("Error crítico cargando usuario de sesión", err);
            }
        },

        _applyClientSideFilter: function (sValue, oBinding, aFields) {
            let oFilter = null;

            if (sValue) {
                const sTerm = sValue.toUpperCase();
                // Crea un filtro para CADA campo que le pasemos
                const aFilters = aFields.map(field => {
                    return new Filter({
                        path: field,
                        test: function (v) {
                            return v ? String(v).toUpperCase().includes(sTerm) : false;
                        }
                    });
                });
                // Lógica OR: Si coincide con ID, O con Nombre, O con Apellido...
                oFilter = new Filter({ filters: aFilters, and: false });
            }
            oBinding.filter(oFilter ? [oFilter] : []);
        },



    });
});