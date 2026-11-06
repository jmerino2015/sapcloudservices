sap.ui.define([
    "com/antigravity/portalProveedoresContabilidad/controller/BaseController",
    "sap/m/MessageToast"
], function (BaseController, MessageToast) {
    "use strict";

    return BaseController.extend("com.antigravity.portalProveedoresContabilidad.controller.App", {

        onInit: function () {
            this.getView().addStyleClass(
                this.getOwnerComponent().getContentDensityClass()
            );

            var oRouter = this.getRouter();
            if (oRouter) {
                oRouter.attachRouteMatched(this._onRouteMatched, this);
            }
        },

        _onRouteMatched: function (oEvent) {
            var sRouteName = oEvent.getParameter("name");
            var oSideNavigation = this.byId("sideNavigation");
            if (oSideNavigation) {
                oSideNavigation.setSelectedKey(sRouteName);
            }
        },

        onSideNavButtonPress: function () {
            var oToolPage = this.byId("toolPage");
            var bExpanded = oToolPage.getSideExpanded();
            oToolPage.setSideExpanded(!bExpanded);
        },

        onSideItemSelect: function (oEvent) {
            var oItem = oEvent.getParameter("item");
            var sKey = oItem.getKey();
            if (sKey) {
                this.navTo(sKey);
            }
        },

        onNavToHome: function () {
            this.goHome();
        },

        onGlobalSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("query");
            if (sQuery) {
                MessageToast.show("Buscando en Cuentas por Pagar: " + sQuery);
                this.navTo("invoicesMatch");
            }
        },

        onNotificationsPress: function () {
            MessageToast.show("3 Facturas observadas por discrepancia de precio pendientes de resolución.");
        },

        // SAP Joule AI Sidebar
        onToggleJouleSidebar: function () {
            var oSidebar = this.byId("jouleSidebar");
            if (oSidebar) {
                oSidebar.setVisible(!oSidebar.getVisible());
            }
        },

        onClearJouleChat: function () {
            var oJouleModel = this.getModel("jouleModel");
            if (oJouleModel) {
                oJouleModel.setProperty("/messages", [
                    {
                        sender: "bot",
                        text: "Conversación reiniciada. ¿En qué puedo asistirte con las facturas o contabilizaciones MIRO?",
                        timestamp: "Ahora"
                    }
                ]);
            }
        },

        onQuickJouleQuestion: function (oEvent) {
            var sText = oEvent.getSource().getText();
            var oJouleModel = this.getModel("jouleModel");
            oJouleModel.setProperty("/inputMessage", sText);
            this.onSendJouleMessage();
        },

        onSendJouleMessage: function () {
            var oJouleModel = this.getModel("jouleModel");
            var sInput = oJouleModel.getProperty("/inputMessage");
            if (!sInput || !sInput.trim()) {
                return;
            }

            var aMessages = oJouleModel.getProperty("/messages") || [];
            aMessages.push({
                sender: "user",
                text: sInput,
                timestamp: "Ahora"
            });
            oJouleModel.setProperty("/inputMessage", "");
            oJouleModel.setProperty("/messages", aMessages);

            setTimeout(function () {
                var sReply = "";
                var sLower = sInput.toLowerCase();
                if (sLower.includes("discrepancia") || sLower.includes("3-way")) {
                    sReply = "He analizado las 28 facturas: Se detectó una variación de +$90.00 USD en la factura <strong>F001-0089201</strong> de SUMINISTROS INDUSTRIALES. La tolerancia configurada es ±2.0%. Se sugiere solicitar Nota de Crédito o ajustar precio en la posición 10.";
                } else if (sLower.includes("sire") || sLower.includes("sunat")) {
                    sReply = "Verificación SIRE: 25 comprobantes se encuentran en estado <strong>ACEPTADO</strong> con RUC Habido y Activo. El comprobante F001-0089201 presenta una observación de validación en la serie electrónica.";
                } else if (sLower.includes("cuenta") || sLower.includes("g/l")) {
                    sReply = "Para suministros de red y cables de datos se recomienda la cuenta mayor <strong>60110000 (Compras Mercadería)</strong> y centro de costo <strong>CC-10020 (Infraestructura TI)</strong>.";
                } else {
                    sReply = "Entendido. La factura puede ser contabilizada directamente mediante el botón <strong>Contabilizar en SAP</strong> para disparar el flujo equivalente a la transacción MIRO / FB60.";
                }

                aMessages.push({
                    sender: "bot",
                    text: sReply,
                    timestamp: "Ahora"
                });
                oJouleModel.setProperty("/messages", aMessages);
            }, 500);
        }
    });
});
