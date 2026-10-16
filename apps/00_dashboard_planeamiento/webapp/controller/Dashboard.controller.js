sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/viz/ui5/format/ChartFormatter",
    "sap/viz/ui5/api/env/Format",
    "sap/ui/core/UIComponent",
    "sap/ui/core/routing/History"
], function (Controller, JSONModel, ChartFormatter, Format, UIComponent, History) {
    "use strict";

    return Controller.extend("c4c.leadmanagement.controller.Dashboard", {
        onInit: function () {
            // Setup Formatters for Charts
            Format.numericFormatter(ChartFormatter.getInstance());
            var formatPattern = ChartFormatter.DefaultPattern;

            var oData = {
                frescura: [
                    { fecha: "17-dic", valor: 18.4 },
                    { fecha: "22-dic", valor: 15.7 },
                    { fecha: "29-dic", valor: 15.1 },
                    { fecha: "05-ene", valor: 15.5 },
                    { fecha: "12-ene", valor: 14.0 },
                    { fecha: "19-ene", valor: 12.7 },
                    { fecha: "26-ene", valor: 13.3 },
                    { fecha: "02-feb", valor: 14.2 }
                ],
                inventario: [
                    { fecha: "Dec 21", produccion: 47000, vencidos: 2000, inventario: 50000, max: 60000, min: 40000 },
                    { fecha: "Dec 28", produccion: 38000, vencidos: 1000, inventario: 45000, max: 60000, min: 40000 },
                    { fecha: "Jan 04", produccion: 42000, vencidos: 3000, inventario: 42000, max: 60000, min: 40000 },
                    { fecha: "Jan 11", produccion: 54000, vencidos: 2000, inventario: 48000, max: 60000, min: 40000 },
                    { fecha: "Jan 18", produccion: 57000, vencidos: 1500, inventario: 55000, max: 60000, min: 40000 },
                    { fecha: "Jan 25", produccion: 47000, vencidos: 2500, inventario: 60000, max: 60000, min: 40000 },
                    { fecha: "Feb 01", produccion: 45000, vencidos: 1000, inventario: 56000, max: 60000, min: 40000 }
                ],
                demanda: [
                    { fecha: "Dec 21", demanda: 0.1, ventas: 0.2, vencimiento: 0.05 },
                    { fecha: "Dec 28", demanda: 0.0, ventas: 5.0, vencimiento: 0.1 },
                    { fecha: "Jan 04", demanda: 0.0, ventas: 6.0, vencimiento: 0.0 },
                    { fecha: "Jan 11", demanda: 7.1, ventas: 6.5, vencimiento: 0.2 },
                    { fecha: "Jan 18", demanda: 7.1, ventas: 7.0, vencimiento: 0.1 },
                    { fecha: "Jan 25", demanda: 7.1, ventas: 6.8, vencimiento: 0.05 },
                    { fecha: "Feb 01", demanda: 7.1, ventas: 7.1, vencimiento: 0.1 }
                ],
                cobertura: [
                    { fecha: "Dec 21", lotes: 15, coberturaVal: 17, max: 14, min: 8 },
                    { fecha: "Dec 28", lotes: 12, coberturaVal: 13, max: 14, min: 8 },
                    { fecha: "Jan 04", lotes: 10, coberturaVal: 11, max: 14, min: 8 },
                    { fecha: "Jan 11", lotes: 9, coberturaVal: 10, max: 14, min: 8 },
                    { fecha: "Jan 18", lotes: 12, coberturaVal: 12, max: 14, min: 8 },
                    { fecha: "Jan 25", lotes: 14, coberturaVal: 15, max: 14, min: 8 },
                    { fecha: "Feb 01", lotes: 12, coberturaVal: 12, max: 14, min: 8 }
                ]
            };

            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel, "dashboard");

            this._setupCharts();
        },

        _setupCharts: function() {
            var oVizFrescura = this.getView().byId("vizFrescura");
            oVizFrescura.setVizProperties({
                plotArea: {
                    dataLabel: { visible: true },
                    colorPalette: ["#1e40af"] // Dark blue bars
                },
                title: { visible: false }
            });

            var oVizInventario = this.getView().byId("vizInventario");
            oVizInventario.setVizProperties({
                plotArea: {
                    dataShape: {
                        primaryAxis: ["bar", "line", "line", "line", "line"]
                    },
                    dataLabel: { visible: true }
                },
                title: { visible: false }
            });

            var oVizDemanda = this.getView().byId("vizDemanda");
            oVizDemanda.setVizProperties({
                plotArea: {
                    dataLabel: { visible: true }
                },
                title: { visible: false }
            });

            var oVizCobertura = this.getView().byId("vizCobertura");
            oVizCobertura.setVizProperties({
                plotArea: {
                    dataShape: {
                        primaryAxis: ["bar", "line", "line", "line"]
                    },
                    dataLabel: { visible: true }
                },
                title: { visible: false }
            });
        },

        onReset: function(oEvent) {
            // Logic for reset filter bar
        },

        onSearch: function(oEvent) {
            // Logic for search execution
        },

        onNavBack: function () {
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("RouteMenu", {}, true);
        },

        onNavHome: function () {
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("RouteMenu", {}, true);
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
