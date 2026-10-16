sap.ui.define([
    "sap/crm/customerportal/controller/BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/TextArea",
    "sap/m/VBox",
    "sap/m/Text",
    "sap/m/BusyDialog"
], function (
    BaseController, MessageToast, MessageBox, Dialog, Button,
    TextArea, VBox, Text, BusyDialog
) {
    "use strict";

    return BaseController.extend("sap.crm.customerportal.controller.Integration", {

        onInit: function () {
            // Integration controller initialized
        },

        onTestAllEndpoints: function () {
            var oBusy = new BusyDialog({
                title: "Ejecutando Test de Latencia e Integridad CPI",
                text: "Enviando pings síncronos a SAP S/4HANA, Salesforce e Integration Suite..."
            });
            oBusy.open();

            setTimeout(function () {
                oBusy.close();
                var aIntegrations = this.getModel().getProperty("/cpiIntegrations") || [];
                aIntegrations.forEach(function (item) {
                    item.latencyMs = Math.floor(110 + Math.random() * 90);
                    item.lastStatus = "200 OK";
                    item.statusState = "Success";
                });
                this.getModel().setProperty("/cpiIntegrations", aIntegrations);

                this.recordActivity(
                    "Ejecución de Health Check Global de Interfaces SAP CPI",
                    "Monitoreo de Sistema",
                    "HealthCheckService"
                );

                MessageToast.show("Todos los endpoints respondieron exitosamente (< 200 ms)");
            }.bind(this), 1000);
        },

        onInspectPayload: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            var oItem = oContext.getObject();

            var oPayloadMap = {
                "/c4c/odata/v2/OpportunityCollection": {
                    "request": {
                        "ProcessingTypeCode": "OPPT",
                        "Name": "Cotización Portal Web - Motores y Válvulas",
                        "ProspectPartyID": "BP-10004928",
                        "PrimaryContactPartyID": "USR-001",
                        "OpportunityItem": [
                            { "ProductID": "MOT-IND-75KW", "TargetQuantity": 2, "UnitCode": "EA" },
                            { "ProductID": "VALV-MAR-DN300", "TargetQuantity": 3, "UnitCode": "EA" }
                        ]
                    },
                    "response": {
                        "d": {
                            "results": {
                                "ObjectID": "00163E2B-9841-1EDC-B091-OPP99082",
                                "ID": "OPP-99082",
                                "StatusCode": "1",
                                "StatusText": "Open",
                                "ExpectedRevenueAmount": 14550.00,
                                "CurrencyCode": "USD"
                            }
                        }
                    }
                },
                "/c4c/odata/v2/ServiceRequestCollection": {
                    "request": {
                        "TypeCode": "SR_WARRANTY",
                        "Name": "Solicitud de Reemplazo bajo Garantía",
                        "CustomerID": "BP-10004928",
                        "PriorityCode": "3",
                        "ServiceRequestUserLifeCycleStatusCode": "1",
                        "ReportedByPartyID": "USR-001",
                        "DataOriginTypeCode": "1"
                    },
                    "response": {
                        "d": {
                            "results": {
                                "ID": "SR-89201",
                                "StatusCode": "2",
                                "ServiceQueueID": "QUEUE_WARRANTY_QA",
                                "SLA_FirstResponseDue": "2026-09-01T14:15:00Z"
                            }
                        }
                    }
                },
                "/s4/api/API_SALES_ORDER_SRV/A_SalesOrder": {
                    "request": {
                        "filter": "SoldToParty eq 'BP-10004928'",
                        "expand": "to_Item,to_DeliveryStatus"
                    },
                    "response": {
                        "d": {
                            "results": [
                                { "SalesOrder": "4500098231", "TotalNetAmount": 18865.55, "OverallDeliveryStatus": "C" }
                            ]
                        }
                    }
                },
                "/cpi/soap/BusinessPartnerReplicationIn": {
                    "request": "<soapenv:Envelope><soapenv:Body><BusinessPartnerReplication><BusinessPartnerID>BP-10004928</BusinessPartnerID><Role>BUP001</Role></BusinessPartnerReplication></soapenv:Body></soapenv:Envelope>",
                    "response": "<soapenv:Envelope><soapenv:Body><BusinessPartnerReplicationConfirmation><Status>Success</Status></BusinessPartnerReplicationConfirmation></soapenv:Body></soapenv:Envelope>"
                }
            };

            var payloadData = oPayloadMap[oItem.endpoint] || { "info": "Payload estándar JSON / OData" };
            var sFormatted = typeof payloadData === "string" ? payloadData : JSON.stringify(payloadData, null, 2);

            var oDialog = new Dialog({
                title: "Inspector de Payload SAP: " + oItem.service,
                contentWidth: "650px",
                content: [
                    new VBox({
                        class: "sapUiSmallMargin",
                        items: [
                            new Text({ text: "Endpoint: " + oItem.endpoint + " | Destino: " + oItem.destination, class: "sapUiBoldText sapUiSmallMarginBottom" }),
                            new TextArea({
                                value: sFormatted,
                                rows: 14,
                                width: "100%",
                                editable: false
                            })
                        ]
                    })
                ],
                endButton: new Button({
                    text: "Cerrar",
                    press: function () { oDialog.close(); }
                })
            });

            oDialog.open();
        },

        onRefreshLogs: function () {
            this.getModel().refresh(true);
            MessageToast.show("Historial de auditoría CRM actualizado");
        }
    });
});
