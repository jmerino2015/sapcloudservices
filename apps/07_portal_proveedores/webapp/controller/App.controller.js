sap.ui.define([
    "com/antigravity/portalProveedores/controller/BaseController",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "com/antigravity/portalProveedores/controller/DroidIaService"
], function (BaseController, MessageToast, JSONModel, DroidIaService) {
    "use strict";

    return BaseController.extend("com.antigravity.portalProveedores.controller.App", {

        onInit: function () {
            this.getView().addStyleClass(
                this.getOwnerComponent().getContentDensityClass()
            );

            var oRouter = this.getRouter();
            if (oRouter) {
                oRouter.attachRouteMatched(this._onRouteMatched, this);
            }

            // Inicializar estado del asistente minimizado por defecto
            var oAppModel = this.getOwnerComponent() ? this.getOwnerComponent().getModel("app") : this.getView().getModel("app");
            if (oAppModel) {
                oAppModel.setProperty("/chatbotExpanded", false);
            }

            // Inicializar modelo de chat SAP Joule Droid
            var oDroidIaModel = new JSONModel({
                inputMessage: "",
                messages: [this._getBotWelcomeMessage()]
            });
            this.getView().setModel(oDroidIaModel, "droidIaModel");
        },

        _getBotWelcomeMessage: function () {
            var d = new Date();
            var sTime = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
            return {
                sender: "bot",
                timestamp: sTime,
                text: "<p>¡Hola! Soy <strong>SAP Joule Droid</strong>, tu asistente virtual del portal de proveedores. Pregúntame sobre:</p>" +
                    "<p>• <strong>Estado de una factura:</strong> <em>'estado de factura F001-452'</em> o <em>'facturas pendientes'</em></p>" +
                    "<p>• <strong>Órdenes de Compra:</strong> <em>'¿Qué OCs están abiertas?'</em> o <em>'OC 4540012337'</em></p>" +
                    "<p>• <strong>Pagos & Retenciones:</strong> <em>'¿Cuándo se procesa mi pago?'</em> o <em>'resumen de pagos'</em></p>" +
                    "<p>• <strong>Notas de Crédito & Comprobantes:</strong> <em>'¿Cómo registrar una Nota de Crédito?'</em></p>"
            };
        },

        _onRouteMatched: function (oEvent) {
            var sRouteName = oEvent.getParameter("name");
            var oToolPage = this.byId("toolPage");
            var oSideNavigation = this.byId("sideNavigation");
            var oHeader = this.byId("appToolHeader");
            var oBtnDroidIa = this.byId("btnDroidIa");

            // Ocultar SideNavigation y Header si se está en Login o Launchpad para ofrecer pantalla limpia
            if (sRouteName === "login" || sRouteName === "launchpad") {
                if (oSideNavigation) {
                    oSideNavigation.setVisible(false);
                }
                if (oHeader) {
                    oHeader.setVisible(false);
                }
                if (oBtnDroidIa) {
                    oBtnDroidIa.setVisible(false);
                }
            } else {
                if (oSideNavigation) {
                    oSideNavigation.setVisible(true);
                }
                if (oHeader) {
                    oHeader.setVisible(true);
                }
                if (oBtnDroidIa) {
                    oBtnDroidIa.setVisible(true);
                }
                if (sRouteName === "purchaseOrderDetail") {
                    sRouteName = "purchaseOrders";
                }
                if (oSideNavigation) {
                    oSideNavigation.setSelectedKey(sRouteName);
                }
            }
        },

        onNavToLaunchpad: function () {
            this.navTo("launchpad");
        },

        // ── SAP Joule Droid Chatbot Logic ──────────────────────────────────────────────
        onToggleDroidIa: function () {
            var oAppModel = this.getView().getModel("app") || this.getOwnerComponent().getModel("app");
            if (oAppModel) {
                var bExpanded = !!oAppModel.getProperty("/chatbotExpanded");
                oAppModel.setProperty("/chatbotExpanded", !bExpanded);
                if (!bExpanded) {
                    this._scrollChatToBottom();
                }
            }
        },

        onCloseDroidIaPopover: function () {
            var oAppModel = this.getView().getModel("app") || this.getOwnerComponent().getModel("app");
            if (oAppModel) {
                oAppModel.setProperty("/chatbotExpanded", false);
            }
        },

        onSendDroidIaMessage: function () {
            var oDroidIaModel = this.getView().getModel("droidIaModel");
            var sMessage = oDroidIaModel.getProperty("/inputMessage");

            if (!sMessage || !sMessage.trim()) {
                return;
            }

            var aMessages = oDroidIaModel.getProperty("/messages") || [];
            var d = new Date();
            var sTime = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);

            // 1. Mensaje del usuario
            aMessages.push({
                sender: "user",
                timestamp: sTime,
                text: sMessage
            });

            oDroidIaModel.setProperty("/inputMessage", "");
            oDroidIaModel.setProperty("/messages", aMessages);
            oDroidIaModel.refresh(true);
            this._scrollChatToBottom();

            // 2. Simulación escribiendo...
            aMessages.push({
                sender: "bot",
                timestamp: sTime,
                text: "<p><i>SAP Joule Droid está escribiendo...</i></p>",
                isTyping: true
            });
            oDroidIaModel.setProperty("/messages", aMessages);
            oDroidIaModel.refresh(true);
            this._scrollChatToBottom();

            // 3. Procesar consulta real
            var oAppModel = this.getView().getModel("app");
            setTimeout(function () {
                var sBotAnswer = DroidIaService.processQuery(sMessage, oAppModel);

                aMessages = oDroidIaModel.getProperty("/messages") || [];
                aMessages = aMessages.filter(function (m) { return !m.isTyping; });

                var d2 = new Date();
                var sTime2 = ("0" + d2.getHours()).slice(-2) + ":" + ("0" + d2.getMinutes()).slice(-2);

                aMessages.push({
                    sender: "bot",
                    timestamp: sTime2,
                    text: sBotAnswer
                });

                oDroidIaModel.setProperty("/messages", aMessages);
                oDroidIaModel.refresh(true);
                this._scrollChatToBottom();
            }.bind(this), 450);
        },

        onQuickQuestion: function (oEvent) {
            var sText = oEvent.getSource().getText();
            var oDroidIaModel = this.getView().getModel("droidIaModel");
            oDroidIaModel.setProperty("/inputMessage", sText);
            this.onSendDroidIaMessage();
        },

        onClearDroidIaChat: function () {
            var oDroidIaModel = this.getView().getModel("droidIaModel");
            if (oDroidIaModel) {
                oDroidIaModel.setProperty("/messages", [this._getBotWelcomeMessage()]);
                oDroidIaModel.setProperty("/inputMessage", "");
            }
            MessageToast.show("Conversación reiniciada");
        },

        _scrollChatToBottom: function () {
            setTimeout(function () {
                var oScroll = sap.ui.getCore().byId("droidIaChatScroll") || this.byId("droidIaChatScroll");
                if (oScroll) {
                    oScroll.scrollTo(0, 99999, 100);
                }
            }.bind(this), 100);
        },

        // ── Role & Navigation ────────────────────────────────────────────────
        onRoleChange: function (oEvent) {
            var sKey = oEvent.getParameter("item").getKey();
            var oAppModel = this.getView().getModel("app");
            oAppModel.setProperty("/user/role", sKey);
            oAppModel.refresh(true);

            if (sKey === "CONTADOR") {
                MessageToast.show("Cambiado a Rol Contabilidad");
                this.navTo("accountingInvoices");
            } else {
                MessageToast.show("Cambiado a Rol Proveedor");
                this.navTo("preRegister");
            }
        },

        onSideNavigationToggleButtonPress: function () {
            var oToolPage = this.byId("toolPage");
            var bSideExpanded = oToolPage.getSideExpanded();
            this._setToggleButtonTooltip(bSideExpanded);
            oToolPage.setSideExpanded(!bSideExpanded);
        },

        _setToggleButtonTooltip: function (bLarge) {
            var oToggleButton = this.byId("sideNavigationToggleButton");
            if (oToggleButton) {
                if (bLarge) {
                    oToggleButton.setTooltip(this.getText("commonMenuExpand") || "Expandir menú");
                } else {
                    oToggleButton.setTooltip(this.getText("commonMenuCollapse") || "Colapsar menú");
                }
            }
        },

        onSideItemSelect: function (oEvent) {
            var oItem = oEvent.getParameter("item");
            var sKey = oItem.getKey();
            if (sKey) {
                this.navTo(sKey);
            }
        },

        onNavToHome: function () {
            this.navTo("home");
        },

        onNotificationsPress: function () {
            MessageToast.show(this.getText("notifTitle"));
        },

        onProfileAvatarPress: function () {
            this.navTo("profile");
        }
    });
});
