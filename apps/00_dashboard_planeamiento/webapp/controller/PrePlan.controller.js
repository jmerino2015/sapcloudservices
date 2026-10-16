sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/ui/table/Column",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/Text"
], function (Controller, UIComponent, JSONModel, Column, Label, Input, Text) {
    "use strict";

    return Controller.extend("c4c.leadmanagement.controller.PrePlan", {
        onInit: function () {
            // Fechas de la tabla según screenshot original (20 Dic - 4 Ene)
            var aDates = [
                "20.12.2020", "21.12.2020", "22.12.2020", "23.12.2020", 
                "24.12.2020", "27.12.2020", "28.12.2020", "29.12.2020", 
                "30.12.2020", "31.12.2020", "03.01.2021", "04.01.2021"
            ];

            // Datos Base 
            var oData = {
                rows: [
                    { 
                        Material: "POWER", MrpArea: "", V: "00", A: true, BU: "M", Segment: "",
                        "20.12.2020": "3", "21.12.2020": "", "22.12.2020": "4", "23.12.2020": "",
                        "24.12.2020": "5", "27.12.2020": "6", "28.12.2020": "", "29.12.2020": "",
                        "30.12.2020": "", "31.12.2020": "", "03.01.2021": "", "04.01.2021": ""
                    }
                ]
            };

            // Rellenar filas vacías para simular visual SAP GUI
            for (var i = 0; i < 12; i++) {
                oData.rows.push({
                    Material: "", MrpArea: "", V: "00", A: true, BU: "", Segment: "",
                    "20.12.2020": "", "21.12.2020": "", "22.12.2020": "", "23.12.2020": "",
                    "24.12.2020": "", "27.12.2020": "", "28.12.2020": "", "29.12.2020": "",
                    "30.12.2020": "", "31.12.2020": "", "03.01.2021": "", "04.01.2021": ""
                });
            }

            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel, "preplan");

            // Crear columnas dinámicas basadas en el array aDates
            var oTable = this.byId("planningTable");
            
            aDates.forEach(function(sDate) {
                var oColumn = new Column({
                    width: "6rem",
                    label: new Label({ text: sDate }),
                    template: new Text({ 
                        text: "{preplan>" + sDate + "}",
                        wrapping: false
                    })
                });
                oTable.addColumn(oColumn);
            });
        },

        onNavBack: function () {
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("RouteMenu");
        },

        onCancel: function () {
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("RouteMenu");
        },

        onNavHome: function () {
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("RouteMenu");
        },

        onMenuButtonPress: function (oEvent) {
            var oSource = oEvent.getSource();
            var oRouter = UIComponent.getRouterFor(this);

            if (!this._oActionSheet) {
                this._oActionSheet = new sap.m.ActionSheet({
                    title: "Módulos de Demand Planning",
                    showCancelButton: true,
                    buttons: [
                        new sap.m.Button({
                            text: "Menú Principal (Home)",
                            icon: "sap-icon://home",
                            press: function () { oRouter.navTo("RouteMenu"); }
                        }),
                        new sap.m.Button({
                            text: "Dashboard Planeamiento",
                            icon: "sap-icon://bar-chart",
                            press: function () { oRouter.navTo("RouteDashboard"); }
                        }),
                        new sap.m.Button({
                            text: "Tabla de Pre-Planificación",
                            icon: "sap-icon://table-view",
                            press: function () { oRouter.navTo("RoutePrePlan"); }
                        }),
                        new sap.m.Button({
                            text: "Supply Chain Planning",
                            icon: "sap-icon://map-2",
                            press: function () { oRouter.navTo("RouteSupplyChain"); }
                        })
                    ]
                });
                this.getView().addDependent(this._oActionSheet);
            }
            this._oActionSheet.openBy(oSource);
        },

        onNotificationsPress: function (oEvent) {
            var oSource = oEvent.getSource();
            if (!this._oNotifPopover) {
                this._oNotifPopover = new sap.m.ResponsivePopover({
                    title: "Notificaciones Operativas",
                    contentWidth: "360px",
                    content: [
                        new sap.m.List({
                            items: [
                                new sap.m.StandardListItem({
                                    title: "Alerta de Demanda Crítica",
                                    description: "690 órdenes de venta con retraso en confirmación",
                                    info: "Alta",
                                    infoState: "Error",
                                    icon: "sap-icon://alert"
                                }),
                                new sap.m.StandardListItem({
                                    title: "Pre-Planificación Aprobada",
                                    description: "Semana Dic-Ene 2026 validada por Supply Chain Lead",
                                    info: "Hoy",
                                    infoState: "Success",
                                    icon: "sap-icon://sys-enter-2"
                                }),
                                new sap.m.StandardListItem({
                                    title: "Ocupabilidad de CD Lima",
                                    description: "Capacidad utilizada al 88.4%",
                                    info: "Aviso",
                                    infoState: "Warning",
                                    icon: "sap-icon://warehouse"
                                })
                            ]
                        })
                    ]
                });
                this.getView().addDependent(this._oNotifPopover);
            }
            this._oNotifPopover.openBy(oSource);
        },

        onProfilePress: function (oEvent) {
            var oSource = oEvent.getSource();
            if (!this._oProfilePopover) {
                this._oProfilePopover = new sap.m.ResponsivePopover({
                    title: "Perfil de Usuario SAP",
                    contentWidth: "300px",
                    content: [
                        new sap.m.VBox({
                            alignItems: "Center",
                            class: "sapUiSmallMargin",
                            items: [
                                new sap.f.Avatar({
                                    initials: "DP",
                                    displaySize: "M",
                                    class: "sapUiSmallMarginBottom"
                                }),
                                new sap.m.Title({ text: "Demand Planner Lead", level: "H4" }),
                                new sap.m.Text({ text: "demand.planning@sap-portal.com", class: "sapUiTinyMarginBottom" }),
                                new sap.m.Text({ text: "Sociedad: 1000 — JM Holding", class: "sapUiTinyMarginBottom" }),
                                new sap.m.Text({ text: "Rol: Planificación, Leads C4C & Supply Chain" })
                            ]
                        })
                    ]
                });
                this.getView().addDependent(this._oProfilePopover);
            }
            this._oProfilePopover.openBy(oSource);
        },

        onCopilotPress: function () {
            if (window.parent && window.parent !== window) {
                window.parent.postMessage({ type: "TOGGLE_JOULE" }, "*");
            }
            sap.m.MessageToast.show("SAP Joule AI Assistant sincronizado.");
        }
    });
});
