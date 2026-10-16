sap.ui.define([
    "sap/crm/customerportal/controller/BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Input",
    "sap/m/Label",
    "sap/m/Select",
    "sap/m/VBox",
    "sap/m/BusyDialog",
    "sap/ui/core/Item"
], function (
    BaseController, MessageToast, MessageBox, Dialog, Button,
    Input, Label, Select, VBox, BusyDialog, Item
) {
    "use strict";

    return BaseController.extend("sap.crm.customerportal.controller.Profile", {

        onInit: function () {
            // Profile initialized
        },

        onTabSelect: function (oEvent) {
            var sKey = oEvent.getParameter("key");
            this.recordActivity("Navegación a pestaña de Perfil: " + sKey, "Perfil & Onboarding", "NavigationLog");
        },

        onSyncBusinessPartner: function () {
            var oBusy = new BusyDialog({
                title: "Sincronizando con SAP CPI / Integration Suite",
                text: "Ejecutando replicación bidireccional SOAP (BusinessPartnerReplicationIn)..."
            });
            oBusy.open();

            setTimeout(function () {
                oBusy.close();
                var sNewDate = new Date().toISOString().replace('T', ' ').substring(0, 19);
                this.getModel().setProperty("/customer/lastSyncTimestamp", sNewDate);
                
                this.recordActivity(
                    "Sincronización Bidireccional de Ficha BP ejecutada vía CPI SOAP",
                    "Maestro de Clientes",
                    "BusinessPartnerReplication"
                );

                MessageBox.success(
                    "Ficha de Business Partner sincronizada correctamente con SAP Cloud for Customer y SAP S/4HANA ERP.\n\n" +
                    "Protocolo: SAP CPI SOAP / HTTP 202 Accepted\n" +
                    "Tiempo de respuesta: 320 ms",
                    { title: "Sincronización Exitosa" }
                );
            }.bind(this), 1200);
        },

        onOpenAddUserDialog: function () {
            var oInpName = new Input({ placeholder: "Ej. Roberto Valdés" });
            var oInpEmail = new Input({ placeholder: "r.valdes@industrialcorp.com", type: "Email" });
            var oInpPosition = new Input({ placeholder: "Ej. Jefe de Mantenimiento Planta" });
            var oSelRole = new Select({
                width: "100%",
                items: [
                    new Item({ key: "BUYER", text: "Comprador (Solicitar Cotizaciones y Pedidos)" }),
                    new Item({ key: "VIEWER", text: "Visualizador (Solo Lectura y Consultas)" }),
                    new Item({ key: "ADMIN", text: "Administrador de Cuenta (Control Total)" })
                ]
            });

            var oDialog = new Dialog({
                title: "Invitar Nuevo Usuario a la Cuenta B2B",
                contentWidth: "480px",
                content: [
                    new VBox({
                        class: "sapUiSmallMargin",
                        items: [
                            new Label({ text: "Nombre Completo", required: true }),
                            oInpName,
                            new Label({ text: "Correo Electrónico Corporativo", required: true, class: "sapUiTinyMarginTop" }),
                            oInpEmail,
                            new Label({ text: "Cargo / Función", class: "sapUiTinyMarginTop" }),
                            oInpPosition,
                            new Label({ text: "Rol Jerárquico B2B Asignado", required: true, class: "sapUiTinyMarginTop" }),
                            oSelRole
                        ]
                    })
                ],
                beginButton: new Button({
                    text: "Enviar Invitación y Habilitar",
                    type: "Emphasized",
                    press: function () {
                        var sName = oInpName.getValue();
                        var sEmail = oInpEmail.getValue();
                        if (!sName || !sEmail) {
                            MessageBox.error("Por favor complete nombre y correo electrónico.");
                            return;
                        }

                        var sRoleKey = oSelRole.getSelectedKey();
                        var oRoleNames = {
                            "ADMIN": "Administrador de Cuenta",
                            "BUYER": "Comprador",
                            "VIEWER": "Visualizador"
                        };

                        var aUsers = this.getModel().getProperty("/teamUsers") || [];
                        var sUserId = "USR-00" + (aUsers.length + 1);

                        aUsers.push({
                            id: sUserId,
                            name: sName,
                            email: sEmail,
                            phone: "+56 9 1234 5678",
                            position: oInpPosition.getValue() || "Colaborador B2B",
                            role: sRoleKey,
                            roleName: oRoleNames[sRoleKey],
                            status: "Invitación Enviada",
                            lastLogin: "-",
                            canAuthorizeQuotes: sRoleKey !== "VIEWER",
                            canManageTeam: sRoleKey === "ADMIN"
                        });

                        this.getModel().setProperty("/teamUsers", aUsers);

                        this.recordActivity(
                            "Creación de Usuario B2B: " + sName + " (" + oRoleNames[sRoleKey] + ")",
                            "Seguridad & Jerarquías",
                            "IdentityManagement"
                        );

                        oDialog.close();
                        MessageToast.show("Invitación enviada exitosamente a " + sEmail);
                    }.bind(this)
                }),
                endButton: new Button({
                    text: "Cancelar",
                    press: function () { oDialog.close(); }
                })
            });

            oDialog.open();
        },

        onEditUserRole: function (oEvent) {
            var oUser = oEvent.getSource().getBindingContext().getObject();

            var oSelRole = new Select({
                width: "100%",
                selectedKey: oUser.role,
                items: [
                    new Item({ key: "ADMIN", text: "Administrador de Cuenta (Control Total)" }),
                    new Item({ key: "BUYER", text: "Comprador Autorizado" }),
                    new Item({ key: "VIEWER", text: "Visualizador (Solo Lectura)" })
                ]
            });

            var oDialog = new Dialog({
                title: "Modificar Rol B2B: " + oUser.name,
                contentWidth: "400px",
                content: [
                    new VBox({
                        class: "sapUiSmallMargin",
                        items: [
                            new Label({ text: "Seleccione el nuevo nivel de permisos para el usuario:" }),
                            oSelRole
                        ]
                    })
                ],
                beginButton: new Button({
                    text: "Actualizar Permisos",
                    type: "Emphasized",
                    press: function () {
                        var sNewKey = oSelRole.getSelectedKey();
                        var oRoleNames = {
                            "ADMIN": "Administrador de Cuenta",
                            "BUYER": "Comprador",
                            "VIEWER": "Visualizador"
                        };

                        oUser.role = sNewKey;
                        oUser.roleName = oRoleNames[sNewKey];
                        oUser.canManageTeam = sNewKey === "ADMIN";
                        oUser.canAuthorizeQuotes = sNewKey !== "VIEWER";

                        this.getModel().refresh(true);

                        this.recordActivity(
                            "Actualización de Rol Usuario " + oUser.name + " a " + oRoleNames[sNewKey],
                            "Seguridad & Jerarquías",
                            "IdentityManagement"
                        );

                        oDialog.close();
                        MessageToast.show("Permisos de " + oUser.name + " actualizados a: " + oRoleNames[sNewKey]);
                    }.bind(this)
                }),
                endButton: new Button({
                    text: "Cancelar",
                    press: function () { oDialog.close(); }
                })
            });

            oDialog.open();
        },

        onModifyAddress: function () {
            MessageToast.show("Modificación de dirección registrada para validación en el sistema central");
        }
    });
});
