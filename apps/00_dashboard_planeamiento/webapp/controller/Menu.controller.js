sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/UIComponent",
    "sap/m/ActionSheet",
    "sap/m/Button",
    "sap/m/ResponsivePopover",
    "sap/m/List",
    "sap/m/StandardListItem",
    "sap/m/VBox",
    "sap/m/HBox",
    "sap/m/Text",
    "sap/m/Title",
    "sap/f/Avatar"
], function (Controller, MessageToast, UIComponent, ActionSheet, Button, ResponsivePopover, List, StandardListItem, VBox, HBox, Text, Title, Avatar) {
    "use strict";

    return Controller.extend("c4c.leadmanagement.controller.Menu", {
        onInit: function () {
        },

        onDevTilePress: function (oEvent) {
            MessageToast.show("Esta funcionalidad se encuentra en construcción.");
        },

        onPrePlanPress: function (oEvent) {
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("RoutePrePlan");
        },

        onNavToDashboard: function (oEvent) {
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("RouteDashboard");
        },

        onNavToSupplyChain: function (oEvent) {
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("RouteSupplyChain");
        },

        /* ========================================================================
           SHELL BAR FUNCTIONALITIES
           ======================================================================== */
        onNavHome: function () {
            MessageToast.show("Inicio de Demand Planning");
        },

        onMenuButtonPress: function (oEvent) {
            var oSource = oEvent.getSource();
            var oRouter = UIComponent.getRouterFor(this);

            if (!this._oActionSheet) {
                this._oActionSheet = new ActionSheet({
                    title: "Módulos de Demand Planning",
                    showCancelButton: true,
                    buttons: [
                        new Button({
                            text: "Menú Principal (Home)",
                            icon: "sap-icon://home",
                            press: function () { oRouter.navTo("RouteMenu"); }
                        }),
                        new Button({
                            text: "Dashboard Planeamiento",
                            icon: "sap-icon://bar-chart",
                            press: function () { oRouter.navTo("RouteDashboard"); }
                        }),
                        new Button({
                            text: "Tabla de Pre-Planificación",
                            icon: "sap-icon://table-view",
                            press: function () { oRouter.navTo("RoutePrePlan"); }
                        }),
                        new Button({
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
                this._oNotifPopover = new ResponsivePopover({
                    title: "Notificaciones Operativas",
                    contentWidth: "360px",
                    content: [
                        new List({
                            items: [
                                new StandardListItem({
                                    title: "Alerta de Demanda Crítica",
                                    description: "690 órdenes de venta con retraso en confirmación",
                                    info: "Alta",
                                    infoState: "Error",
                                    icon: "sap-icon://alert"
                                }),
                                new StandardListItem({
                                    title: "Pre-Planificación Aprobada",
                                    description: "Semana Dic-Ene 2026 validada por Supply Chain Lead",
                                    info: "Hoy",
                                    infoState: "Success",
                                    icon: "sap-icon://sys-enter-2"
                                }),
                                new StandardListItem({
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
                this._oProfilePopover = new ResponsivePopover({
                    title: "Perfil de Usuario SAP",
                    contentWidth: "300px",
                    content: [
                        new VBox({
                            alignItems: "Center",
                            class: "sapUiSmallMargin",
                            items: [
                                new Avatar({
                                    initials: "DP",
                                    displaySize: "M",
                                    class: "sapUiSmallMarginBottom"
                                }),
                                new Title({ text: "Demand Planner Lead", level: "H4" }),
                                new Text({ text: "demand.planning@sap-portal.com", class: "sapUiTinyMarginBottom" }),
                                new Text({ text: "Sociedad: 1000 — JM Holding", class: "sapUiTinyMarginBottom" }),
                                new Text({ text: "Rol: Planificación, Leads C4C & Supply Chain" })
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
            MessageToast.show("SAP Joule AI Assistant sincronizado.");
        },

        onSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("query") || "";
            MessageToast.show("Buscando en Demand Planning: " + (sQuery || "todos los módulos"));
        }
    });
});
