sap.ui.define([
    "sap/crm/customerportal/controller/BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/ResponsivePopover",
    "sap/m/List",
    "sap/m/StandardListItem",
    "sap/m/Button",
    "sap/m/Dialog",
    "sap/m/Input",
    "sap/m/VBox",
    "sap/m/HBox",
    "sap/m/FlexItemData",
    "sap/m/Text",
    "sap/m/Title",
    "sap/m/ObjectStatus",
    "sap/m/FormattedText",
    "sap/m/ScrollContainer",
    "sap/ui/core/Icon",
    "sap/ui/core/HTML"
], function (
    BaseController, MessageToast, MessageBox, ResponsivePopover,
    List, StandardListItem, Button, Dialog, Input, VBox, HBox,
    FlexItemData, Text, Title, ObjectStatus, FormattedText, ScrollContainer,
    Icon, HTML
) {
    "use strict";

    return BaseController.extend("sap.crm.customerportal.controller.App", {

        onInit: function () {
            var oRouter = this.getRouter();
            oRouter.attachRouteMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            var sRouteName = oEvent.getParameter("name") || "dashboard";
            var oSessionModel = this.getModel("session");
            if (oSessionModel) {
                oSessionModel.setProperty("/activeNavigationKey", sRouteName);
            }
        },

        onToggleSideNav: function () {
            var oToolPage = this.byId("toolPage");
            var bSideExpanded = oToolPage.getSideExpanded();
            oToolPage.setSideExpanded(!bSideExpanded);
        },

        onSideNavItemSelect: function (oEvent) {
            var oItem = oEvent.getParameter("item");
            var sKey = oItem.getKey();
            if (sKey) {
                this.getRouter().navTo(sKey);
            }
        },

        onRoleChange: function (oEvent) {
            var sNewRole = oEvent.getParameter("selectedItem").getKey();
            var oSessionModel = this.getModel("session");

            var oRoleMap = {
                "ADMIN": {
                    roleName: "Administrador de Cuenta",
                    avatar: "sap-icon://user-edit",
                    permissions: {
                        canCreateQuote: true,
                        canManageUsers: true,
                        canCreateTicket: true,
                        canPayInvoices: true,
                        canSyncBP: true
                    }
                },
                "BUYER": {
                    roleName: "Comprador Autorizado",
                    avatar: "sap-icon://cart",
                    permissions: {
                        canCreateQuote: true,
                        canManageUsers: false,
                        canCreateTicket: true,
                        canPayInvoices: false,
                        canSyncBP: false
                    }
                },
                "VIEWER": {
                    roleName: "Visualizador (Solo Lectura)",
                    avatar: "sap-icon://show",
                    permissions: {
                        canCreateQuote: false,
                        canManageUsers: false,
                        canCreateTicket: false,
                        canPayInvoices: false,
                        canSyncBP: false
                    }
                }
            };

            var oConfig = oRoleMap[sNewRole] || oRoleMap["ADMIN"];
            oSessionModel.setProperty("/currentUser/role", sNewRole);
            oSessionModel.setProperty("/currentUser/roleName", oConfig.roleName);
            oSessionModel.setProperty("/currentUser/avatar", oConfig.avatar);
            oSessionModel.setProperty("/permissions", oConfig.permissions);

            this.recordActivity("Cambio de Rol Jerárquico B2B a: " + oConfig.roleName, "Seguridad & Onboarding", "IdentityRoleCollection");
            MessageToast.show("Perfil actualizado: " + oConfig.roleName + ".\nPermisos reconfigurados.");
        },

        onOpenNotifications: function (oEvent) {
            var oButton = oEvent.getSource();
            if (!this._oNotificationPopover) {
                var oList = new List({
                    items: [
                        new StandardListItem({
                            title: "Pedido 4500098231 Despachado",
                            description: "Guía Starken TRK-CL-9082310-X en tránsito",
                            icon: "sap-icon://shipping-status",
                            info: "Hace 2h",
                            infoState: "Information"
                        }),
                        new StandardListItem({
                            title: "Actualización Ticket SR-89201",
                            description: "El agente Marcos Rivera autorizó retiro RMA de garantía",
                            icon: "sap-icon://headset",
                            info: "Hace 4h",
                            infoState: "Success"
                        }),
                        new StandardListItem({
                            title: "Nueva Factura F-S4H-2026-00891",
                            description: "Emitida por SAP S/4HANA por $22,450 USD",
                            icon: "sap-icon://receipt",
                            info: "Ayer",
                            infoState: "Warning"
                        })
                    ]
                });

                this._oNotificationPopover = new ResponsivePopover({
                    title: "Centro de Notificaciones SAP",
                    placement: "Bottom",
                    contentWidth: "360px",
                    content: [oList],
                    endButton: new Button({
                        text: "Marcar leídas",
                        press: function () {
                            this.getModel("session").setProperty("/unreadNotifications", 0);
                            this._oNotificationPopover.close();
                            MessageToast.show("Todas las notificaciones marcadas como leídas");
                        }.bind(this)
                    })
                });
                this.getView().addDependent(this._oNotificationPopover);
            }

            this._oNotificationPopover.openBy(oButton);
        },

        onOpenUserProfile: function (oEvent) {
            var oSession = this.getModel("session").getProperty("/currentUser");

            MessageBox.information(
                "Usuario: " + oSession.name + "\n" +
                "Empresa: " + oSession.company + "\n" +
                "Nº Business Partner: " + oSession.bpNumber + "\n" +
                "Rol Actual: " + oSession.roleName + "\n" +
                "Autenticación: SAP Cloud Identity Services (SSO Activo)",
                { title: "Ficha de Sesión SAP B2B" }
            );
        },

        onOpenIntegrationSummary: function () {
            this.getRouter().navTo("integration");
        },

        onOpenHelpDialog: function () {
            MessageBox.show(
                "Portal de Clientes B2B/B2C para autogestión omnicanal integrado en tiempo real con SAP Service Cloud, SAP S/4HANA y orquestado mediante SAP BTP Integration Suite.",
                {
                    icon: MessageBox.Icon.INFORMATION,
                    title: "Acerca del Portal SAP",
                    actions: [MessageBox.Action.OK]
                }
            );
        },

        /* ================================================================== */
        /* STRUCTURED DROID IA COPILOT INTERACTION ENGINE                     */
        /* ================================================================== */

        onOpenDroidDialog: function () {
            if (this._oDroidDialog) {
                this._oDroidDialog.open();
                this._renderDroidMessages();
                return;
            }

            // Scroll container for conversation with generous height and clean background
            this._oDroidScroll = new ScrollContainer({
                height: "470px",
                vertical: true,
                horizontal: false,
                class: "droidChatContainer"
            });

            // Full-width Input across the entire popup width
            this._oDroidInput = new Input({
                placeholder: "Escribe tu consulta aquí... (ej. ¿Cuál es el estado de mi pedido 4500098231? o mostrar crédito disponible)",
                width: "100%",
                layoutData: new FlexItemData({ growFactor: 1 }),
                submit: function () {
                    this._onSendDroidQuery();
                }.bind(this)
            });

            var oInputBar = new HBox({
                width: "100%",
                alignItems: "Center",
                class: "droidInputBarFull sapUiSmallMarginTop",
                items: [
                    this._oDroidInput,
                    new Button({
                        text: "Enviar",
                        icon: "sap-icon://paper-plane",
                        type: "Emphasized",
                        class: "sapUiTinyMarginBegin",
                        press: function () {
                            this._onSendDroidQuery();
                        }.bind(this)
                    })
                ]
            });

            this._oDroidDialog = new Dialog({
                title: "DROID IA - Copiloto Inteligente SAP",
                icon: "sap-icon://da",
                contentWidth: "860px",
                contentHeight: "600px",
                resizable: true,
                draggable: true,
                content: [
                    new VBox({
                        class: "sapUiSmallMargin",
                        items: [
                            this._oDroidScroll,
                            oInputBar
                        ]
                    })
                ],
                beginButton: new Button({
                    text: "Reiniciar Conversación",
                    icon: "sap-icon://refresh",
                    press: function () {
                        this._resetDroidHistory();
                    }.bind(this)
                }),
                endButton: new Button({
                    text: "Cerrar",
                    press: function () {
                        this._oDroidDialog.close();
                    }.bind(this)
                })
            });

            this.getView().addDependent(this._oDroidDialog);
            this._oDroidDialog.open();
            this._renderDroidMessages();

            this.recordActivity("Apertura de sesión con asistente DROID IA", "Inteligencia Artificial", "AIAssistantSession");
        },

        _renderDroidMessages: function () {
            if (!this._oDroidScroll) { return; }
            this._oDroidScroll.removeAllContent();

            var aMessages = this.getModel("session").getProperty("/droidState/messages") || [];
            var oBox = new VBox();

            aMessages.forEach(function (msg) {
                var sCardClass = msg.isBot ? "droidMessageCard droidMessageBot" : "droidMessageCard droidMessageUser";
                var sSenderName = msg.isBot ? "🤖 DROID IA (Copiloto SAP)" : "👤 " + (msg.sender || "Tú");

                var aCardItems = [
                    new HBox({
                        justifyContent: "SpaceBetween",
                        alignItems: "Center",
                        items: [
                            new Text({ text: sSenderName, class: "sapUiBoldText" }),
                            new HBox({
                                alignItems: "Center",
                                items: [
                                    msg.categoryTag ? new ObjectStatus({ text: msg.categoryTag, state: "Information", class: "sapUiTinyMarginEnd" }) : new Text({ text: "" }),
                                    new Text({ text: " • " + msg.timestamp, class: "sapUiTinyText sapUiLightText sapUiTinyMarginBegin" })
                                ]
                            })
                        ]
                    }),
                    new FormattedText({
                        htmlText: this._formatMarkdownToHtml(msg.text),
                        class: "sapUiTinyMarginTopBottom"
                    })
                ];

                // Render Rich Structured Card (HTML) if present
                if (msg.structuredHtml) {
                    aCardItems.push(new HTML({ content: msg.structuredHtml }));
                }

                // Render Action Buttons Row
                if (msg.actions && msg.actions.length > 0) {
                    var oActionRow = new HBox({
                        wrap: "Wrap",
                        class: "sapUiSmallMarginTop"
                    });
                    msg.actions.forEach(function (act) {
                        oActionRow.addItem(new Button({
                            text: act.label,
                            icon: act.icon || "sap-icon://action",
                            type: act.primary ? "Emphasized" : "Ghost",
                            class: "sapUiTinyMarginEnd sapUiTinyMarginBottom",
                            press: function () {
                                if (act.navRoute) {
                                    this._oDroidDialog.close();
                                    this.getRouter().navTo(act.navRoute, act.navQuery ? { query: act.navQuery } : {});
                                } else if (act.query) {
                                    this._processDroidUserQuery(act.query);
                                }
                            }.bind(this)
                        }));
                    }.bind(this));
                    aCardItems.push(oActionRow);
                }

                var oCard = new VBox({
                    class: sCardClass,
                    items: aCardItems
                });

                oBox.addItem(oCard);
            }.bind(this));

            this._oDroidScroll.addContent(oBox);

            // Smooth scroll to bottom
            setTimeout(function () {
                var oDom = this._oDroidScroll.getDomRef();
                if (oDom) {
                    oDom.scrollTop = oDom.scrollHeight;
                }
            }.bind(this), 100);
        },

        _formatMarkdownToHtml: function (sText) {
            if (!sText) { return ""; }
            return sText
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`([^`]+)`/g, '<code style="background:#eaedf0; padding:2px 5px; border-radius:3px; font-weight:bold; color:#0854a0;">$1</code>')
                .replace(/\n/g, '<br/>');
        },

        _onSendDroidQuery: function () {
            var sVal = this._oDroidInput.getValue();
            if (!sVal || sVal.trim() === "") { return; }
            this._oDroidInput.setValue("");
            this._processDroidUserQuery(sVal.trim());
        },

        _processDroidUserQuery: function (sQuery) {
            var oSessionModel = this.getModel("session");
            var aMessages = oSessionModel.getProperty("/droidState/messages") || [];
            var sTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            // Push User Message
            aMessages.push({
                sender: oSessionModel.getProperty("/currentUser/name"),
                isBot: false,
                timestamp: sTime,
                text: sQuery
            });

            oSessionModel.setProperty("/droidState/messages", aMessages);
            this._renderDroidMessages();

            // Simulate AI Engine Response
            setTimeout(function () {
                var oResponse = this._generateStructuredAIResponse(sQuery);
                aMessages.push({
                    sender: "DROID IA",
                    isBot: true,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    categoryTag: oResponse.categoryTag,
                    text: oResponse.text,
                    structuredHtml: oResponse.structuredHtml,
                    actions: oResponse.actions
                });

                oSessionModel.setProperty("/droidState/messages", aMessages);
                this._renderDroidMessages();

                this.recordActivity("Consulta respondida por DROID IA: " + sQuery.substring(0, 40), "Inteligencia Artificial", "AIChatInteraction");
            }.bind(this), 500);
        },

        /**
         * Structured NLP Response Builder with Clean Cards and Data Tables
         */
        _generateStructuredAIResponse: function (sInput) {
            var sTerm = sInput.toLowerCase();
            var oModel = this.getModel();

            // ===============================================================
            // 1. ORDER TRACKING / DESPACHO DE PEDIDOS S/4HANA
            // ===============================================================
            if (sTerm.includes("pedido") || sTerm.includes("orden") || sTerm.includes("despacho") || sTerm.includes("4500098231") || sTerm.includes("4500098304") || sTerm.includes("4500098115") || sTerm.includes("tracking") || sTerm.includes("guia") || sTerm.includes("starken")) {
                var aOrders = oModel.getProperty("/salesOrders") || [];
                var oOrder = aOrders[0];
                if (sTerm.includes("4500098304")) { oOrder = aOrders[2] || aOrders[0]; }
                if (sTerm.includes("4500098115")) { oOrder = aOrders[1] || aOrders[0]; }

                var sStepperHtml = 
                    '<div class="droidMiniStepper">' +
                        '<div class="droidMiniStep ' + (oOrder.statusStepIndex >= 0 ? "droidMiniStepCompleted" : "") + '"><span class="droidMiniStepDot"></span>1. Creado</div>' +
                        '<div class="droidMiniStep ' + (oOrder.statusStepIndex >= 1 ? (oOrder.statusStepIndex === 1 ? "droidMiniStepActive" : "droidMiniStepCompleted") : "") + '"><span class="droidMiniStepDot"></span>2. Bodega / Picking</div>' +
                        '<div class="droidMiniStep ' + (oOrder.statusStepIndex >= 2 ? (oOrder.statusStepIndex === 2 ? "droidMiniStepActive" : "droidMiniStepCompleted") : "") + '"><span class="droidMiniStepDot"></span>3. Despachado</div>' +
                        '<div class="droidMiniStep ' + (oOrder.statusStepIndex >= 3 ? "droidMiniStepCompleted" : "") + '"><span class="droidMiniStepDot"></span>4. Entregado</div>' +
                    '</div>';

                var sItemsRows = "";
                oOrder.items.forEach(function (it) {
                    sItemsRows += '<tr><td style="padding:4px 8px; border-bottom:1px solid #f0f0f0;"><strong>' + it.sku + '</strong></td><td style="padding:4px 8px; border-bottom:1px solid #f0f0f0;">' + it.description + '</td><td style="padding:4px 8px; text-align:center; border-bottom:1px solid #f0f0f0;">' + it.qty + ' ' + it.unit + '</td><td style="padding:4px 8px; text-align:right; font-weight:bold; border-bottom:1px solid #f0f0f0;">$' + it.total.toLocaleString() + ' USD</td></tr>';
                });

                var sStructuredHtml = 
                    '<div class="droidStructuredCard">' +
                        '<div class="droidStructuredHeader">' +
                            '<div><strong>Pedido SAP S/4HANA #' + oOrder.orderNumber + '</strong><br/><span style="font-size:11px; color:#666;">Fecha creación: ' + oOrder.orderDate + '</span></div>' +
                            '<span style="background:#0854a0; color:#fff; padding:3px 8px; border-radius:4px; font-weight:bold; font-size:12px;">' + oOrder.statusText + '</span>' +
                        '</div>' +
                        sStepperHtml +
                        '<div class="droidDataGrid">' +
                            '<div class="droidDataField"><div class="droidDataFieldLabel">Transportista</div><div class="droidDataFieldValue">' + oOrder.carrier + '</div></div>' +
                            '<div class="droidDataField"><div class="droidDataFieldLabel">Nº Guía / Tracking</div><div class="droidDataFieldValue">' + oOrder.trackingCode + '</div></div>' +
                            '<div class="droidDataField"><div class="droidDataFieldLabel">Entrega Estimada</div><div class="droidDataFieldValue" style="color:#0854a0;">' + oOrder.deliveryDate + '</div></div>' +
                            '<div class="droidDataField"><div class="droidDataFieldLabel">Total Facturable</div><div class="droidDataFieldValue">$' + oOrder.totalGross.toLocaleString() + ' USD</div></div>' +
                        '</div>' +
                        '<div style="margin-top:10px; font-size:12px; font-weight:bold; color:#333;">Posiciones del Pedido:</div>' +
                        '<table style="width:100%; border-collapse:collapse; font-size:12px; margin-top:4px;">' +
                            '<thead><tr style="background:#f8fafc; color:#555;"><th style="padding:4px 8px; text-align:left;">SKU</th><th style="padding:4px 8px; text-align:left;">Descripción</th><th style="padding:4px 8px; text-align:center;">Cant.</th><th style="padding:4px 8px; text-align:right;">Subtotal</th></tr></thead>' +
                            '<tbody>' + sItemsRows + '</tbody>' +
                        '</table>' +
                    '</div>';

                return {
                    categoryTag: "SAP S/4HANA Logistics",
                    text: "He consultado el registro en **SAP S/4HANA Cloud**. La orden se encuentra actualmente con guía de transporte emitida y en ruta hacia tu planta.",
                    structuredHtml: sStructuredHtml,
                    actions: [
                        { label: "Ver en Módulo de Pedidos", icon: "sap-icon://shipping-status", primary: true, navRoute: "sales", navQuery: { tab: "orders" } },
                        { label: "Rastrear con Starken / Transportista", icon: "sap-icon://map", query: "abrir geolocalizacion de transporte" }
                    ]
                };
            }

            // ===============================================================
            // 2. INVOICES / ESTADO DE CUENTA / FINANZAS
            // ===============================================================
            if (sTerm.includes("factura") || sTerm.includes("saldo") || sTerm.includes("credito") || sTerm.includes("crédito") || sTerm.includes("deuda") || sTerm.includes("pagar") || sTerm.includes("financ")) {
                var oCust = oModel.getProperty("/customer");
                var aInvoices = oModel.getProperty("/invoices") || [];

                var sInvRows = "";
                aInvoices.forEach(function (inv) {
                    var sBadgeColor = inv.status === "PAGADA" ? "#107e3e" : (inv.status === "PENDIENTE" ? "#e9730c" : "#bb0000");
                    sInvRows += '<tr>' +
                        '<td style="padding:5px 8px; border-bottom:1px solid #f0f0f0;"><strong>' + inv.invoiceNumber + '</strong></td>' +
                        '<td style="padding:5px 8px; border-bottom:1px solid #f0f0f0;">' + inv.salesOrderRef + '</td>' +
                        '<td style="padding:5px 8px; border-bottom:1px solid #f0f0f0;">' + inv.dueDate + '</td>' +
                        '<td style="padding:5px 8px; text-align:right; font-weight:bold; border-bottom:1px solid #f0f0f0;">$' + inv.grossTotal.toLocaleString() + ' USD</td>' +
                        '<td style="padding:5px 8px; text-align:center; border-bottom:1px solid #f0f0f0;"><span style="background:' + sBadgeColor + '; color:#fff; padding:2px 6px; border-radius:3px; font-size:11px;">' + inv.status + '</span></td>' +
                    '</tr>';
                });

                var sFinanceHtml = 
                    '<div class="droidStructuredCard">' +
                        '<div class="droidStructuredHeader">' +
                            '<div><strong>Estado Financiero & Facturación</strong><br/><span style="font-size:11px; color:#666;">Business Partner: ' + oCust.bpNumber + ' (' + oCust.name + ')</span></div>' +
                            '<span style="background:#107e3e; color:#fff; padding:3px 8px; border-radius:4px; font-weight:bold; font-size:12px;">Línea Aprobada</span>' +
                        '</div>' +
                        '<div class="droidDataGrid">' +
                            '<div class="droidDataField"><div class="droidDataFieldLabel">Línea de Crédito</div><div class="droidDataFieldValue">$' + oCust.creditLimit.toLocaleString() + ' USD</div></div>' +
                            '<div class="droidDataField"><div class="droidDataFieldLabel">Crédito Disponible</div><div class="droidDataFieldValue" style="color:#107e3e;">$' + oCust.creditAvailable.toLocaleString() + ' USD</div></div>' +
                            '<div class="droidDataField"><div class="droidDataFieldLabel">Total Facturado Activo</div><div class="droidDataFieldValue" style="color:#e9730c;">$27,066.00 USD</div></div>' +
                            '<div class="droidDataField"><div class="droidDataFieldLabel">Facturas Vencidas</div><div class="droidDataFieldValue" style="color:#bb0000;">1 ($4,616.00 USD)</div></div>' +
                        '</div>' +
                        '<div style="margin-top:12px; font-size:12px; font-weight:bold; color:#333;">Comprobantes Emitidos en SAP S/4HANA:</div>' +
                        '<table style="width:100%; border-collapse:collapse; font-size:12px; margin-top:4px;">' +
                            '<thead><tr style="background:#f8fafc; color:#555;"><th style="padding:5px 8px; text-align:left;">Nº Factura</th><th style="padding:5px 8px; text-align:left;">Ref. Pedido</th><th style="padding:5px 8px; text-align:left;">Vencimiento</th><th style="padding:5px 8px; text-align:right;">Total Bruto</th><th style="padding:5px 8px; text-align:center;">Estado</th></tr></thead>' +
                            '<tbody>' + sInvRows + '</tbody>' +
                        '</table>' +
                    '</div>';

                return {
                    categoryTag: "S/4HANA Finance",
                    text: "He consolidado tu **Estado de Cuenta** en tiempo real. Cuentas con **$171,550.00 USD** de saldo disponible.",
                    structuredHtml: sFinanceHtml,
                    actions: [
                        { label: "Ir a Facturación y Descargar PDF", icon: "sap-icon://receipt", primary: true, navRoute: "sales", navQuery: { tab: "invoices" } },
                        { label: "Ver Factura Vencida F-00619", query: "detalle de factura vencida 00619" }
                    ]
                };
            }

            // ===============================================================
            // 3. CATALOG & COTIZACIONES
            // ===============================================================
            if (sTerm.includes("cotiz") || sTerm.includes("motor") || sTerm.includes("valv") || sTerm.includes("válv") || sTerm.includes("precio") || sTerm.includes("catalogo") || sTerm.includes("catálogo") || sTerm.includes("comprar") || sTerm.includes("producto") || sTerm.includes("skf") || sTerm.includes("rodamiento")) {
                var aProducts = oModel.getProperty("/products") || [];

                var sProdRows = "";
                aProducts.slice(0, 3).forEach(function (prd) {
                    sProdRows += '<div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #f0f0f0;">' +
                        '<div>' +
                            '<strong style="color:#0854a0;">' + prd.sku + '</strong> - ' + prd.name + '<br/>' +
                            '<span style="font-size:11px; color:#666;">' + prd.categoryName + ' | Despacho: ' + prd.leadTimeDays + ' días</span>' +
                        '</div>' +
                        '<div style="text-align:right;">' +
                            '<span style="font-size:14px; font-weight:bold; color:#107e3e;">$' + prd.unitPrice.toLocaleString() + ' ' + prd.currency + '</span><br/>' +
                            '<span style="font-size:11px; background:#e8f5e9; color:#107e3e; padding:1px 6px; border-radius:3px;">Stock: ' + prd.stock + ' un.</span>' +
                        '</div>' +
                    '</div>';
                });

                var sCatalogHtml = 
                    '<div class="droidStructuredCard">' +
                        '<div class="droidStructuredHeader">' +
                            '<div><strong>Catálogo Industrial & Solicitud de Cotizaciones</strong><br/><span style="font-size:11px; color:#666;">Conectado a la Lista Maestra de Precios y Oportunidades</span></div>' +
                            '<span style="background:#5b21b6; color:#fff; padding:3px 8px; border-radius:4px; font-weight:bold; font-size:12px;">Precios de Lista</span>' +
                        '</div>' +
                        sProdRows +
                        '<div style="margin-top:10px; padding:8px; background:#f0f7ff; border-radius:4px; font-size:11px; color:#0854a0;">' +
                            '💡 Puedes seleccionar cantidades y presionar <strong>"Solicitar Cotización"</strong> para que tu ejecutiva Valentina Morales aplique descuentos por volumen.' +
                        '</div>' +
                    '</div>';

                return {
                    categoryTag: "SAP Sales & Quotes",
                    text: "Aquí tienes los productos más solicitados disponibles para cotización inmediata en **SAP Sales**:",
                    structuredHtml: sCatalogHtml,
                    actions: [
                        { label: "Abrir Catálogo Completo", icon: "sap-icon://product", primary: true, navRoute: "sales", navQuery: { tab: "catalog" } },
                        { label: "Ver Mis Cotizaciones Activas", query: "ver cotizaciones comerciales" }
                    ]
                };
            }

            // ===============================================================
            // 4. TICKETS & SLAS EN SERVICE CLOUD
            // ===============================================================
            if (sTerm.includes("ticket") || sTerm.includes("reclamo") || sTerm.includes("garant") || sTerm.includes("garantía") || sTerm.includes("rma") || sTerm.includes("soporte") || sTerm.includes("falla") || sTerm.includes("sla")) {
                var aTickets = oModel.getProperty("/tickets") || [];

                var sTicketCards = "";
                aTickets.forEach(function (tk) {
                    var sSlaColor = tk.slaStatus === "ON_TIME" ? "#107e3e" : (tk.slaStatus === "WARNING" ? "#e9730c" : "#bb0000");
                    sTicketCards += '<div style="background:#f8fafc; border:1px solid #edf2f7; border-radius:6px; padding:8px 12px; margin-bottom:8px;">' +
                        '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                            '<strong>' + tk.ticketId + ' - ' + tk.typeName + '</strong>' +
                            '<span style="background:' + sSlaColor + '; color:#fff; padding:2px 6px; border-radius:3px; font-size:11px; font-weight:bold;">' + tk.slaStatusText + '</span>' +
                        '</div>' +
                        '<div style="font-size:12px; color:#333; margin:4px 0;">' + tk.subject + '</div>' +
                        '<div style="display:flex; justify-content:space-between; font-size:11px; color:#666;">' +
                            '<span>Especialista: <strong>' + tk.assignedAgent + '</strong></span>' +
                            '<span>Cola: ' + tk.queue + '</span>' +
                        '</div>' +
                    '</div>';
                });

                var sTicketHtml = 
                    '<div class="droidStructuredCard">' +
                        '<div class="droidStructuredHeader">' +
                            '<div><strong>Centro de Atención Service Cloud</strong><br/><span style="font-size:11px; color:#666;">Seguimiento de Acuerdos de Nivel de Servicio (SLA)</span></div>' +
                            '<span style="background:#0854a0; color:#fff; padding:3px 8px; border-radius:4px; font-weight:bold; font-size:12px;">3 Casos Activos</span>' +
                        '</div>' +
                        sTicketCards +
                        '<div style="padding:6px 10px; background:#fff7ed; border-left:4px solid #e9730c; font-size:11px; color:#9a3412;">' +
                            '⚠️ <strong>Atención:</strong> El caso <code>SR-89201</code> requiere respuesta en menos de 4.5 horas para cumplir el SLA contractual.' +
                        '</div>' +
                    '</div>';

                return {
                    categoryTag: "SAP Service & SLAs",
                    text: "He sincronizado el estado de tus casos en **Service Cloud**:",
                    structuredHtml: sTicketHtml,
                    actions: [
                        { label: "Crear Nuevo Reclamo / Ticket", icon: "sap-icon://add-contact", primary: true, navRoute: "service", navQuery: { tab: "create" } },
                        { label: "Ver Chat de Casos y SLAs", icon: "sap-icon://headset", navRoute: "service", navQuery: { tab: "myTickets" } }
                    ]
                };
            }

            // ===============================================================
            // 5. B2B / IDENTIDAD / ROLES / PERMISOS
            // ===============================================================
            if (sTerm.includes("usuario") || sTerm.includes("invitar") || sTerm.includes("rol") || sTerm.includes("permiso") || sTerm.includes("b2b") || sTerm.includes("delegar") || sTerm.includes("equipo")) {
                var sB2bHtml = 
                    '<div class="droidStructuredCard">' +
                        '<div class="droidStructuredHeader">' +
                            '<div><strong>Jerarquía y Permisos de Cuenta B2B</strong><br/><span style="font-size:11px; color:#666;">Autenticación SAP Cloud Identity Services (SSO)</span></div>' +
                            '<span style="background:#0854a0; color:#fff; padding:3px 8px; border-radius:4px; font-weight:bold; font-size:12px;">Modo Delegado</span>' +
                        '</div>' +
                        '<div class="droidDataGrid">' +
                            '<div class="droidDataField"><div class="droidDataFieldLabel">👑 Admin de Cuenta</div><div class="droidDataFieldValue">Control Total + SOAP Sync</div></div>' +
                            '<div class="droidDataField"><div class="droidDataFieldLabel">🛒 Comprador</div><div class="droidDataFieldValue">Cotizaciones + Pedidos</div></div>' +
                            '<div class="droidDataField"><div class="droidDataFieldLabel">👁️ Visualizador</div><div class="droidDataFieldValue">Solo Consulta de Documentos</div></div>' +
                        '</div>' +
                    '</div>';

                return {
                    categoryTag: "Identity & B2B Hierarchy",
                    text: "Como **Administrador de Cuenta**, puedes invitar colaboradores de tu empresa y delegarles permisos específicos:",
                    structuredHtml: sB2bHtml,
                    actions: [
                        { label: "Administrar Equipo B2B", icon: "sap-icon://user-settings", primary: true, navRoute: "profile", navQuery: { tab: "team" } }
                    ]
                };
            }

            // ===============================================================
            // DEFAULT STRUCTURED INTRO CARD
            // ===============================================================
            var sDefaultHtml = 
                '<div class="droidStructuredCard">' +
                    '<div class="droidStructuredHeader">' +
                        '<div><strong>Asistente Virtual DROID IA</strong><br/><span style="font-size:11px; color:#666;">Selecciona una acción recomendada para visualizar la información de forma estructurada</span></div>' +
                    '</div>' +
                    '<div class="droidDataGrid">' +
                        '<div class="droidDataField"><div class="droidDataFieldLabel">🚚 Logística</div><div class="droidDataFieldValue">Rastreo de Pedidos S/4</div></div>' +
                        '<div class="droidDataField"><div class="droidDataFieldLabel">💳 Finanzas</div><div class="droidDataFieldValue">Facturas y Crédito BP</div></div>' +
                        '<div class="droidDataField"><div class="droidDataFieldLabel">⚡ Ventas</div><div class="droidDataFieldValue">Cotizaciones Oficiales</div></div>' +
                        '<div class="droidDataField"><div class="droidDataFieldLabel">🛠️ Soporte</div><div class="droidDataFieldValue">Tickets y SLAs</div></div>' +
                    '</div>' +
                '</div>';

            return {
                categoryTag: "SAP Copilot",
                text: "Estoy listo para responder tus consultas estructuradas en tiempo real. Puedes escribir tu duda o seleccionar una de las sugerencias:",
                structuredHtml: sDefaultHtml,
                actions: [
                    { label: "📦 Rastrear Pedido #4500098231", icon: "sap-icon://shipping-status", primary: true, query: "estado del pedido 4500098231" },
                    { label: "💳 Ver Facturas y Saldo", icon: "sap-icon://receipt", query: "consultar estado de cuenta y facturas" },
                    { label: "⚡ Cotizar Motores IE4", icon: "sap-icon://cart", query: "cotizar motor trifasico ie4" },
                    { label: "🛠️ Revisar SLAs de Casos", icon: "sap-icon://headset", query: "estado ticket garantia 89201" }
                ]
            };
        },

        _resetDroidHistory: function () {
            var oSessionModel = this.getModel("session");
            oSessionModel.setProperty("/droidState/messages", [
                {
                    sender: "DROID IA",
                    isBot: true,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    categoryTag: "SAP Copilot",
                    text: "👋 ¡Conversación reiniciada!\n\nSoy **DROID IA**, tu copiloto inteligente para **SAP S/4HANA & CRM**. ¿Qué consulta deseas realizar?",
                    actions: [
                        { label: "📦 Estado Pedido #4500098231", icon: "sap-icon://shipping-status", primary: true, query: "estado del pedido 4500098231" },
                        { label: "💳 Facturas y Crédito", icon: "sap-icon://receipt", query: "consultar estado de cuenta y facturas" },
                        { label: "⚡ Cotizar Motores IE4", icon: "sap-icon://cart", query: "cotizar motor trifasico ie4" },
                        { label: "🛠️ Ticket Garantía SR-89201", icon: "sap-icon://headset", query: "estado ticket garantia 89201" }
                    ]
                }
            ]);
            this._renderDroidMessages();
            MessageToast.show("Conversación reiniciada");
        }
    });
});
