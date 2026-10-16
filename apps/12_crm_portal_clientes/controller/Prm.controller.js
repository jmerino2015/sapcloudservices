sap.ui.define([
    "sap/crm/customerportal/controller/BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Input",
    "sap/m/Label",
    "sap/m/VBox",
    "sap/m/HBox",
    "sap/m/Text",
    "sap/m/Title",
    "sap/m/ObjectHeader",
    "sap/m/ObjectAttribute",
    "sap/m/ObjectStatus"
], function (
    BaseController, MessageToast, MessageBox, Dialog, Button,
    Input, Label, VBox, HBox, Text, Title, ObjectHeader, ObjectAttribute, ObjectStatus
) {
    "use strict";

    return BaseController.extend("sap.crm.customerportal.controller.Prm", {

        onInit: function () {
            // PRM Initialized
        },

        onTabSelect: function (oEvent) {
            var sKey = oEvent.getParameter("key");
            this.recordActivity("Navegación a módulo PRM: " + sKey, "PRM & Canales", "PartnerNavigation");
        },

        onOpenRegisterDealDialog: function () {
            var oInpDealName = new Input({ placeholder: "Ej. Suministro Equipos Minera Centinela 2026" });
            var oInpCustomer = new Input({ placeholder: "Ej. Antofagasta Minerals / Minera Centinela" });
            var oInpAmount = new Input({ placeholder: "125000", type: "Number" });
            var oInpNotes = new Input({ placeholder: "Requerimiento de 6 bombas centrífugas y 12 válvulas mariposa" });

            var oDialog = new Dialog({
                title: "Registro de Oportunidad PRM (Deal Registration)",
                contentWidth: "520px",
                content: [
                    new VBox({
                        class: "sapUiSmallMargin",
                        items: [
                            new Text({
                                text: "El registro de Deals te garantiza 90 días de exclusividad comercial y un margen preferencial protegido del 25% frente a otros canales.",
                                class: "sapUiSmallMarginBottom sapUiLightText"
                            }),
                            new Label({ text: "Nombre del Proyecto / Oportunidad", required: true }),
                            oInpDealName,
                            new Label({ text: "Cliente Final", required: true, class: "sapUiTinyMarginTop" }),
                            oInpCustomer,
                            new Label({ text: "Monto Estimado del Proyecto (USD)", required: true, class: "sapUiTinyMarginTop" }),
                            oInpAmount,
                            new Label({ text: "Productos / Notas Técnicas", class: "sapUiTinyMarginTop" }),
                            oInpNotes
                        ]
                    })
                ],
                beginButton: new Button({
                    text: "Registrar y Proteger Canal",
                    type: "Emphasized",
                    icon: "sap-icon://shield",
                    press: function () {
                        var sName = oInpDealName.getValue();
                        var sCustomer = oInpCustomer.getValue();
                        var fAmt = parseFloat(oInpAmount.getValue()) || 50000;

                        if (!sName || !sCustomer) {
                            MessageBox.error("Por favor completa el nombre de la oportunidad y el cliente final.");
                            return;
                        }

                        var aDeals = this.getModel().getProperty("/prmDeals") || [];
                        var iDealNum = 90 + aDeals.length + 1;
                        var sDealId = "DEAL-PRM-2026-0" + iDealNum;

                        var oNewDeal = {
                            dealId: sDealId,
                            dealName: sName,
                            endCustomer: sCustomer,
                            registeredBy: "Ing. Carlos Mendoza (Industrial Global Corp)",
                            estimatedAmount: fAmt,
                            partnerMargin: "25% (USD $" + (fAmt * 0.25).toLocaleString() + ")",
                            stage: "APROBADO",
                            stageText: "Aprobado (Canal Protegido)",
                            stageState: "Success",
                            exclusivityUntil: "2026-11-30",
                            channelConflict: "Sin Conflicto (Exclusividad Vigente)",
                            notes: oInpNotes.getValue() || "Registro directo desde portal PRM."
                        };

                        aDeals.unshift(oNewDeal);
                        this.getModel().setProperty("/prmDeals", aDeals);

                        this.recordActivity(
                            "Registro de Deal PRM: " + sDealId + " (" + sName + ") por $" + fAmt.toLocaleString() + " USD",
                            "PRM & Canales",
                            "DealRegistration"
                        );

                        oDialog.close();
                        MessageBox.success(
                            "¡Oportunidad registrada y canal protegido con éxito!\n\n" +
                            "Nº Deal: " + sDealId + "\n" +
                            "Cliente: " + sCustomer + "\n" +
                            "Monto Estimado: $" + fAmt.toLocaleString() + " USD\n" +
                            "Margen de Ganancia Protegido: 25% ($" + (fAmt * 0.25).toLocaleString() + " USD)\n" +
                            "Exclusividad garantizada por 90 días.",
                            { title: "Deal Registration Aprobado" }
                        );
                    }.bind(this)
                }),
                endButton: new Button({
                    text: "Cancelar",
                    press: function () { oDialog.close(); }
                })
            });

            oDialog.open();
        },

        onViewDealDetail: function (oEvent) {
            var oDeal = oEvent.getSource().getBindingContext().getObject();

            var oDetailDialog = new Dialog({
                title: "Detalle de Deal PRM: " + oDeal.dealId,
                contentWidth: "600px",
                content: [
                    new VBox({
                        class: "sapUiSmallMargin",
                        items: [
                            new ObjectHeader({
                                title: oDeal.dealName,
                                number: "$" + oDeal.estimatedAmount.toLocaleString() + " USD",
                                intro: "Cliente: " + oDeal.endCustomer,
                                statuses: [
                                    new ObjectStatus({ text: oDeal.stageText, state: oDeal.stageState })
                                ],
                                attributes: [
                                    new ObjectAttribute({ title: "Registrado por", text: oDeal.registeredBy }),
                                    new ObjectAttribute({ title: "Exclusividad de Canal Hasta", text: oDeal.exclusivityUntil }),
                                    new ObjectAttribute({ title: "Auditoría de Conflicto", text: oDeal.channelConflict })
                                ]
                            }),
                            new Text({ text: "Notas de la Oportunidad: " + oDeal.notes, class: "sapUiSmallMarginTop" })
                        ]
                    })
                ],
                endButton: new Button({
                    text: "Cerrar",
                    press: function () { oDetailDialog.close(); }
                })
            });

            oDetailDialog.open();
        },

        onCpqQuote: function (oEvent) {
            var oProduct = oEvent.getSource().getBindingContext().getObject();

            MessageBox.information(
                "Configurador CPQ Partner:\n\n" +
                "Producto: " + oProduct.name + " (" + oProduct.sku + ")\n" +
                "Precio Lista Oficial: $" + oProduct.unitPrice.toLocaleString() + " USD\n" +
                "Precio de Compra Partner (Gold): $" + oProduct.partnerPrice.toLocaleString() + " USD\n" +
                "Margen Bruto de Ganancia: 25% ($" + (oProduct.unitPrice - oProduct.partnerPrice).toLocaleString() + " USD por unidad)\n\n" +
                "La cotización CPQ ha sido vinculada al pipeline de Salesforce PRM.",
                { title: "Simulador de Margen CPQ" }
            );
        },

        onDownloadCertificate: function (oEvent) {
            var oCert = oEvent.getSource().getBindingContext().getObject();
            MessageToast.show("Descargando credencial digital PDF: " + oCert.certificateCode);
        }
    });
});
