sap.ui.define([
    "sap/crm/customerportal/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text",
    "sap/m/VBox",
    "sap/m/HBox",
    "sap/m/Title",
    "sap/m/ObjectStatus",
    "sap/m/ObjectHeader",
    "sap/m/ObjectAttribute",
    "sap/m/FeedInput",
    "sap/m/List",
    "sap/m/FeedListItem",
    "sap/ui/core/Icon"
], function (
    BaseController, Filter, FilterOperator, MessageToast, MessageBox,
    Dialog, Button, Text, VBox, HBox, Title, ObjectStatus, ObjectHeader, ObjectAttribute,
    FeedInput, List, FeedListItem, Icon
) {
    "use strict";

    return BaseController.extend("sap.crm.customerportal.controller.Service", {

        onInit: function () {
            var oRouter = this.getRouter();
            oRouter.getRoute("service").attachPatternMatched(this._onRouteMatched, this);
            this._attachedFiles = [];
        },

        _onRouteMatched: function (oEvent) {
            var oArgs = oEvent.getParameter("arguments");
            var oQuery = oArgs["?query"];
            if (oQuery && oQuery.tab) {
                var oTabBar = this.byId("serviceIconTabBar");
                if (oTabBar) {
                    oTabBar.setSelectedKey(oQuery.tab);
                }
            }
        },

        onTabSelect: function (oEvent) {
            var sKey = oEvent.getParameter("key");
            this.recordActivity("Navegación a pestaña de Servicio: " + sKey, "Service Cloud", "NavigationLog");
        },

        onTicketTypeChange: function (oEvent) {
            var sKey = oEvent.getParameter("selectedItem").getKey();
            var oQueueInp = this.byId("inpQueue");
            var oMap = {
                "GARANTIA": "Garantías & Calidad",
                "RECLAMO": "Facturación y Cobranzas",
                "CONSULTA": "Soporte Técnico Especializado"
            };
            if (oQueueInp) {
                oQueueInp.setValue(oMap[sKey] || "Atención General");
            }
        },

        /* =========================================================== */
        /* LIVE CASE DEFLECTION ENGINE (Salesforce Experience Cloud)   */
        /* =========================================================== */

        onLiveCheckDeflection: function () {
            var sSubj = (this.byId("inpSubject").getValue() || "").toLowerCase();
            var sDesc = (this.byId("inpDescription").getValue() || "").toLowerCase();
            var sCombined = sSubj + " " + sDesc;

            var oDeflectionBox = this.byId("deflectionBox");
            var oContainer = this.byId("deflectionItemsContainer");
            if (!oDeflectionBox || !oContainer) { return; }

            if (sCombined.trim().length < 4) {
                oDeflectionBox.setVisible(false);
                return;
            }

            var aFaqs = this.getModel().getProperty("/faqs") || [];
            var aMatches = [];

            aFaqs.forEach(function (faq) {
                var bMatched = false;
                if (faq.keywords && Array.isArray(faq.keywords)) {
                    faq.keywords.forEach(function (kw) {
                        if (sCombined.includes(kw)) {
                            bMatched = true;
                        }
                    });
                }
                if (bMatched) {
                    aMatches.push(faq);
                }
            });

            if (aMatches.length > 0) {
                oContainer.removeAllItems();
                aMatches.slice(0, 2).forEach(function (faq) {
                    var oCard = new VBox({
                        class: "sapUiSmallMarginBottom fioriCardCustom",
                        items: [
                            new HBox({
                                justifyContent: "SpaceBetween",
                                alignItems: "Center",
                                items: [
                                    new Text({ text: "📄 " + faq.title, class: "sapUiBoldText" }),
                                    new ObjectStatus({ text: faq.category, state: "Information" })
                                ]
                            }),
                            new Text({ text: faq.content, class: "sapUiTinyMarginTopBottom sapUiSmallText" }),
                            new HBox({
                                class: "sapUiTinyMarginTop",
                                items: [
                                    new Button({
                                        text: "✅ ¡Esto resolvió mi problema! (Cancelar Caso)",
                                        type: "Accept",
                                        icon: "sap-icon://accept",
                                        class: "sapUiTinyMarginEnd",
                                        press: function () {
                                            this._onCaseDeflectedSuccess(faq);
                                        }.bind(this)
                                    }),
                                    new Button({
                                        text: "Leer artículo completo",
                                        type: "Transparent",
                                        icon: "sap-icon://open-command-field",
                                        press: function () {
                                            MessageBox.information(faq.content, { title: faq.title });
                                        }
                                    })
                                ]
                            })
                        ]
                    });
                    oContainer.addItem(oCard);
                }.bind(this));

                oDeflectionBox.setVisible(true);
            } else {
                oDeflectionBox.setVisible(false);
            }
        },

        _onCaseDeflectedSuccess: function (faq) {
            // Reward user with gamification points
            var oGamification = this.getModel().getProperty("/gamification");
            if (oGamification) {
                oGamification.userPoints += 50;
                this.getModel().setProperty("/gamification", oGamification);
            }

            this.recordActivity(
                "Caso Deflectado Exitosamente mediante Knowledge: " + faq.title + " (+50 pts Gamificación)",
                "Case Deflection AI",
                "ServiceCloudDeflection"
            );

            // Clear inputs
            this.byId("inpSubject").setValue("");
            this.byId("inpDescription").setValue("");
            this.byId("deflectionBox").setVisible(false);

            MessageBox.success(
                "¡Excelente! Hemos registrado la resolución automática mediante la Base de Conocimientos.\n\n" +
                "• No fue necesario generar un ticket en CRM.\n" +
                "• Has ganado +50 Puntos de Reputación en la Comunidad.\n" +
                "• Eficiencia de Autogestión: 100%",
                { title: "Case Deflection Exitoso" }
            );
        },

        onSimulateAttachment: function () {
            var aDummyFiles = ["Informe_Tecnico_Inspeccion.pdf", "Foto_Falla_Componente.jpg"];
            this._attachedFiles = aDummyFiles;
            var oTxt = this.byId("txtAttachmentCount");
            if (oTxt) {
                oTxt.setText("2 archivos adjuntados (" + aDummyFiles.join(", ") + ")");
            }
            MessageToast.show("Archivos adjuntados con éxito");
        },

        onSubmitTicket: function () {
            var sSubject = this.byId("inpSubject").getValue();
            var sDescription = this.byId("inpDescription").getValue();

            if (!sSubject || !sDescription) {
                MessageBox.error("Por favor complete el Asunto y la Descripción detallada del caso.");
                return;
            }

            var sType = this.byId("inpTicketType").getSelectedKey();
            var sPriority = this.byId("inpTicketPriority").getSelectedKey();
            var sQueue = this.byId("inpQueue").getValue();
            var sOrder = this.byId("inpRelatedOrder").getSelectedKey();
            var oSession = this.getModel("session").getProperty("/currentUser");

            var oTypeMap = {
                "GARANTIA": "Garantía de Producto",
                "RECLAMO": "Reclamo Comercial / Facturación",
                "CONSULTA": "Consulta Técnica"
            };

            var oPrioMap = {
                "URGENTE": { text: "Urgente", slaHours: 4, state: "Error" },
                "ALTA": { text: "Alta", slaHours: 12, state: "Error" },
                "MEDIA": { text: "Media", slaHours: 24, state: "Warning" },
                "BAJA": { text: "Baja", slaHours: 48, state: "Success" }
            };

            var oPrio = oPrioMap[sPriority] || oPrioMap["MEDIA"];
            var iRand = Math.floor(200 + Math.random() * 800);
            var sTicketId = "SR-89" + iRand;

            var oNewTicket = {
                ticketId: sTicketId,
                subject: sSubject,
                type: sType,
                typeName: oTypeMap[sType] || "Atención General",
                queue: sQueue,
                priority: sPriority,
                priorityText: oPrio.text,
                priorityState: oPrio.state,
                status: "En Cola de Asignación",
                statusState: "Information",
                createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
                slaMaxHours: oPrio.slaHours,
                slaRemainingHours: oPrio.slaHours,
                slaStatus: "ON_TIME",
                slaStatusText: "Dentro de SLA (" + oPrio.slaHours + "h restantes)",
                slaState: "Success",
                assignedAgent: "Asignación Automática",
                relatedOrder: sOrder,
                deflected: false,
                messages: [
                    {
                        sender: oSession.name + " (Cliente)",
                        role: "Customer",
                        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
                        text: sDescription,
                        attachments: this._attachedFiles || []
                    }
                ]
            };

            var aTickets = this.getModel().getProperty("/tickets") || [];
            aTickets.unshift(oNewTicket);
            this.getModel().setProperty("/tickets", aTickets);

            this.recordActivity(
                "Creación de Service Ticket " + sTicketId + " [" + oTypeMap[sType] + "]",
                "Service Cloud",
                "ServiceRequestCollection"
            );

            this.byId("inpSubject").setValue("");
            this.byId("inpDescription").setValue("");
            this._attachedFiles = [];
            this.byId("txtAttachmentCount").setText("Sin archivos seleccionados");
            this.byId("deflectionBox").setVisible(false);

            this.byId("serviceIconTabBar").setSelectedKey("myTickets");

            MessageBox.success(
                "¡Ticket registrado exitosamente en SAP Cloud for Customer / Service Cloud!\n\n" +
                "Nº Caso: " + sTicketId + "\n" +
                "Prioridad / SLA: " + oPrio.text + " (" + oPrio.slaHours + " Horas para primera respuesta)\n" +
                "Cola asignada: " + sQueue,
                { title: "Service Request Creado" }
            );
        },

        onSearchTicket: function (oEvent) {
            var sQuery = oEvent.getParameter("newValue");
            var oBinding = this.byId("ticketsTable").getBinding("items");
            if (sQuery) {
                var oFilter = new Filter({
                    filters: [
                        new Filter("ticketId", FilterOperator.Contains, sQuery),
                        new Filter("subject", FilterOperator.Contains, sQuery)
                    ],
                    and: false
                });
                oBinding.filter([oFilter]);
            } else {
                oBinding.filter([]);
            }
        },

        onOpenTicketTimeline: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            if (!oContext) {
                oContext = this.byId("ticketsTable").getSelectedItem().getBindingContext();
            }
            var oTicket = oContext.getObject();
            var oSession = this.getModel("session").getProperty("/currentUser");

            this.recordActivity("Apertura de Conversación Ticket " + oTicket.ticketId, "Service Cloud", "ServiceRequestCollection");

            var oFeedList = new List({
                items: oTicket.messages.map(function (msg) {
                    var bIsCustomer = msg.role === "Customer";
                    return new FeedListItem({
                        sender: msg.sender,
                        icon: bIsCustomer ? "sap-icon://customer" : "sap-icon://headset",
                        info: bIsCustomer ? "Cliente B2B" : "Especialista de Soporte",
                        timestamp: msg.timestamp,
                        text: msg.text + (msg.attachments && msg.attachments.length > 0 ? "\n\n📎 Adjuntos: " + msg.attachments.join(", ") : "")
                    });
                })
            });

            var oFeedInput = new FeedInput({
                placeholder: "Escriba una respuesta o adjunte información al especialista...",
                post: function (oPostEvent) {
                    var sText = oPostEvent.getParameter("value");
                    if (!sText) { return; }

                    var sTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
                    var oNewMsg = {
                        sender: oSession.name + " (Cliente)",
                        role: "Customer",
                        timestamp: sTimestamp,
                        text: sText,
                        attachments: []
                    };

                    oTicket.messages.push(oNewMsg);
                    this.getModel().refresh(true);

                    oFeedList.addItem(new FeedListItem({
                        sender: oNewMsg.sender,
                        icon: "sap-icon://customer",
                        info: "Cliente B2B",
                        timestamp: sTimestamp,
                        text: sText
                    }));

                    MessageToast.show("Mensaje enviado con éxito");
                }.bind(this)
            });

            var oTimelineDialog = new Dialog({
                title: "Detalle y Conversación Ticket: " + oTicket.ticketId + "",
                contentWidth: "780px",
                content: [
                    new VBox({
                        class: "sapUiSmallMargin",
                        items: [
                            new ObjectHeader({
                                title: oTicket.subject,
                                number: oTicket.ticketId,
                                intro: "Tipo: " + oTicket.typeName + " | Cola: " + oTicket.queue,
                                statuses: [
                                    new ObjectStatus({
                                        text: oTicket.slaStatusText,
                                        state: this.formatSlaState(oTicket.slaStatus),
                                        icon: "sap-icon://history"
                                    })
                                ],
                                attributes: [
                                    new ObjectAttribute({ title: "Especialista Asignado", text: oTicket.assignedAgent }),
                                    new ObjectAttribute({ title: "Pedido S/4 Asociado", text: oTicket.relatedOrder || "Sin orden asociada" })
                                ]
                            }),
                            new Title({ text: "Registro de Interacciones y Respuestas Bidireccionales", level: "H4", class: "sapUiSmallMarginTopBottom" }),
                            oFeedList,
                            new VBox({ class: "sapUiSmallMarginTop", items: [oFeedInput] })
                        ]
                    })
                ],
                endButton: new Button({
                    text: "Cerrar",
                    press: function () { oTimelineDialog.close(); }
                })
            });

            oTimelineDialog.open();
        },

        onSearchFaq: function (oEvent) {
            var sTerm = (oEvent.getParameter("newValue") || "").toLowerCase();
            var aFaqs = this.getModel().getProperty("/faqs") || [];
            var oContainer = this.byId("faqContainer");
            if (!oContainer) { return; }

            var aPanels = oContainer.getItems();
            aPanels.forEach(function (panel, idx) {
                var faq = aFaqs[idx];
                if (!faq) { return; }
                var bMatch = faq.title.toLowerCase().includes(sTerm) ||
                             faq.content.toLowerCase().includes(sTerm) ||
                             faq.category.toLowerCase().includes(sTerm);
                panel.setVisible(bMatch);
            });
        },

        onVoteUseful: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            if (oContext) {
                var oFaq = oContext.getObject();
                oFaq.usefulVotes = (oFaq.usefulVotes || 0) + 1;
                this.getModel().refresh(true);
            }
            MessageToast.show("¡Gracias por tu voto! Artículo marcado como útil.");
        },

        onVoteNotUseful: function () {
            MessageToast.show("Gracias por tus comentarios. Notificaremos al equipo editorial de Knowledge.");
        }
    });
});
