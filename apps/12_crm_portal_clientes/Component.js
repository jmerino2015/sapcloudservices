sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device",
    "sap/crm/customerportal/model/models"
], function (UIComponent, JSONModel, Device, models) {
    "use strict";

    return UIComponent.extend("sap.crm.customerportal.Component", {
        metadata: {
            manifest: "json"
        },

        init: function () {
            // Call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // Set the device model
            this.setModel(models.createDeviceModel(), "device");

            // Set main application mock data model
            var oDataModel = new JSONModel();
            oDataModel.loadData("model/mockData.json", null, false);
            this.setModel(oDataModel);

            // Register named models for specialized modules
            var oMockData = oDataModel.getData() || {};
            if (oMockData.customer) { this.setModel(new JSONModel(oMockData.customer), "customer"); }
            if (oMockData.builderConfig) { this.setModel(new JSONModel(oMockData.builderConfig), "builderConfig"); }
            if (oMockData.mobileConfig) { this.setModel(new JSONModel(oMockData.mobileConfig), "mobileConfig"); }
            if (oMockData.gamification) { this.setModel(new JSONModel(oMockData.gamification), "gamification"); }

            // Set app state / session model
            var oSessionModel = new JSONModel({
                currentUser: {
                    id: "USR-001",
                    name: "Ing. Carlos Mendoza",
                    email: "carlos.mendoza@industrialcorp.com",
                    role: "ADMIN", // ADMIN | BUYER | VIEWER
                    roleName: "Administrador de Cuenta",
                    avatar: "sap-icon://user-edit",
                    company: "Industrial Global Corp S.A.",
                    bpNumber: "BP-10004928"
                },
                roles: [
                    { key: "ADMIN", text: "Administrador de Cuenta (Control Total)", icon: "sap-icon://shield" },
                    { key: "BUYER", text: "Comprador (Ventas, Cotizaciones y Pedidos)", icon: "sap-icon://cart" },
                    { key: "VIEWER", text: "Visualizador (Solo Lectura y Consultas)", icon: "sap-icon://show" }
                ],
                permissions: {
                    canCreateQuote: true,
                    canManageUsers: true,
                    canCreateTicket: true,
                    canPayInvoices: true,
                    canSyncBP: true
                },
                cart: [],
                cartCount: 0,
                unreadNotifications: 3,
                activeNavigationKey: "dashboard",
                selectedTicket: null,
                selectedOrder: null,
                selectedInvoice: null,
                systemStatus: {
                    c4cConnected: true,
                    s4HanaConnected: true,
                    cpiLatencyMs: 142,
                    lastSyncDate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                },
                // DROID IA Copilot State
                droidState: {
                    isOpen: false,
                    isTyping: false,
                    unreadBadge: 1,
                    suggestions: [
                        { text: "📦 ¿Cuál es el estado de mi pedido 4500098231?" },
                        { text: "💳 Ver mi crédito disponible y facturas pendientes" },
                        { text: "⚡ Recomiéndame motores industriales IE4" },
                        { text: "🚨 Crear un ticket urgente de garantía" },
                        { text: "👥 ¿Cómo delegar permisos a otro usuario B2B?" }
                    ],
                    messages: [
                        {
                            sender: "DROID IA",
                            isBot: true,
                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            text: "👋 ¡Hola! Soy **DROID IA**, tu copiloto inteligente para **SAP S/4HANA & CRM**.\n\n¿Qué consulta deseas realizar?",
                            actions: [
                                { label: "📦 Estado Pedido #4500098231", query: "estado del pedido 4500098231", icon: "sap-icon://shipping-status" },
                                { label: "💳 Facturas & Crédito", query: "consultar estado de cuenta y facturas", icon: "sap-icon://receipt" },
                                { label: "⚡ Cotizar Motores IE4", query: "cotizar motor trifasico ie4", icon: "sap-icon://cart" },
                                { label: "🛠️ Ticket Garantía SR-89201", query: "estado ticket garantia 89201", icon: "sap-icon://headset" }
                            ]
                        }
                    ]
                }
            });
            this.setModel(oSessionModel, "session");

            // Enable routing
            this.getRouter().initialize();
        }
    });
});
