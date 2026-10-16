sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/UIComponent"
], function (Controller, JSONModel, UIComponent) {
    "use strict";

    return Controller.extend("c4c.leadmanagement.controller.SupplyChain", {

        _mapCreated: false,

        onInit: function () {
            var oData = {
                Spots: [
                    { lat: -12.046374, lng: -77.042793, tooltip: "Lima Hub - Distribution Center", color: "#e9730c", label: "Lima (PE)" },
                    { lat: -23.550520, lng: -46.633308, tooltip: "São Paulo DC - Main Warehouse", color: "#107e3e", label: "São Paulo (BR)" },
                    { lat: 4.7110, lng: -74.072090, tooltip: "Bogotá Hub - Northern Region", color: "#bb0000", label: "Bogotá (CO)" },
                    { lat: -34.603683, lng: -58.381557, tooltip: "Buenos Aires DC - Southern Region", color: "#107e3e", label: "Buenos Aires (AR)" },
                    { lat: -33.4489, lng: -70.6693, tooltip: "Santiago Hub - Pacific Distribution", color: "#e9730c", label: "Santiago (CL)" }
                ],
                Routes: [
                    { from: [-12.046374, -77.042793], to: [-23.550520, -46.633308], color: "#bb0000" },
                    { from: [-23.550520, -46.633308], to: [-34.603683, -58.381557], color: "#107e3e" },
                    { from: [4.7110, -74.072090], to: [-12.046374, -77.042793], color: "#e9730c" },
                    { from: [-33.4489, -70.6693], to: [-34.603683, -58.381557], color: "#0854a0" },
                    { from: [4.7110, -74.072090], to: [-23.550520, -46.633308], color: "#bb0000" }
                ],
                AlertsCount: 6,
                Alerts: [
                    { title: "690", qty: "690 >", desc: "Sales Orders Confirmed Late", locId: "D_SA", locName: "DC_SA_SaoPaulo", matId: "IA01_LUXTOURBIKE", matDesc: "Deluxe Touring Bike" },
                    { title: "125", qty: "125 >", desc: "Sales Orders Confirmed Late", locId: "D_SA", locName: "DC_SA_Lima", matId: "IA01_PROFTOURBIKE", matDesc: "Professional Touring Bike" },
                    { title: "455", qty: "455 >", desc: "Unfulfilled Sales Order", locId: "D_SA", locName: "DC_SA_Bogota", matId: "IA01_LUXTOURBIKE", matDesc: "Deluxe Touring Bike" },
                    { title: "930", qty: "930 >", desc: "Unfulfilled Sales Order", locId: "D_SA", locName: "DC_SA_BuenosAires", matId: "IA01_PROFTOURBIKE", matDesc: "Professional Touring Bike" }
                ],
                ChartData: [
                    { status: "Deluxe Touring Bike", quantity: 290 },
                    { status: "IA01_LUXTOURBIKE", quantity: 455 },
                    { status: "DC_SA_Bucharest", quantity: 745 },
                    { status: "D_EU", quantity: 100 }
                ],
                SalesOrders: [
                    { orderItem: "1798 / 10\nDeluxe Touring Bike", reqDate: "05/11/2026", reqQty: "275 EA", customer: "Customer 1", totalRev: "412500.00 EUR", revRisk: "412500.00 EUR" },
                    { orderItem: "1799 / 20\nProfessional Touring Bike", reqDate: "06/11/2026", reqQty: "150 EA", customer: "Customer AR", totalRev: "300000.00 EUR", revRisk: "100000.00 EUR" },
                    { orderItem: "1800 / 30\nStandard City Bike", reqDate: "07/15/2026", reqQty: "500 EA", customer: "Customer BR", totalRev: "250000.00 EUR", revRisk: "75000.00 EUR" }
                ]
            };

            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel);
        },

        onAfterRendering: function () {
            if (this._mapCreated) {
                return;
            }

            var that = this;
            // Use a polling approach: wait for the mapArea VBox to be in the DOM
            this._retryCount = 0;
            this._pollTimer = setInterval(function () {
                that._retryCount++;
                console.log("[SupplyChain] Map init attempt #" + that._retryCount);

                var oVBox = that.byId("mapArea");
                if (!oVBox) {
                    console.log("[SupplyChain] mapArea control not found");
                    return;
                }

                var oDom = oVBox.getDomRef();
                if (!oDom) {
                    console.log("[SupplyChain] mapArea DOM ref not found");
                    return;
                }

                console.log("[SupplyChain] mapArea DOM found, id=" + oDom.id + ", w=" + oDom.offsetWidth + ", h=" + oDom.offsetHeight);

                if (!window.L) {
                    console.log("[SupplyChain] Leaflet not loaded yet");
                    return;
                }

                console.log("[SupplyChain] Leaflet loaded, creating map...");
                clearInterval(that._pollTimer);

                // Create map container div
                var mapDiv = document.createElement("div");
                mapDiv.id = "scLeafletMap_" + Date.now();
                mapDiv.style.cssText = "width:100%;height:450px;position:relative;";
                oDom.appendChild(mapDiv);

                // Give the DOM a moment to layout the new div
                setTimeout(function () {
                    console.log("[SupplyChain] mapDiv dimensions: " + mapDiv.offsetWidth + "x" + mapDiv.offsetHeight);
                    that._buildMap(mapDiv);
                }, 200);

            }, 500);

            // Stop after 20 seconds
            setTimeout(function () {
                if (that._pollTimer) {
                    clearInterval(that._pollTimer);
                    console.log("[SupplyChain] Gave up trying to init map after 20s");
                }
            }, 20000);
        },

        _buildMap: function (mapDiv) {
            if (this._mapCreated) { return; }
            this._mapCreated = true;

            var L = window.L;
            var oModel = this.getView().getModel();
            var aSpots = oModel.getProperty("/Spots");
            var aRoutes = oModel.getProperty("/Routes");

            try {
                var map = L.map(mapDiv).setView([-15, -58], 3);

                L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    maxZoom: 18,
                    attribution: "© OpenStreetMap"
                }).addTo(map);

                // Circle markers
                aSpots.forEach(function (spot) {
                    L.circleMarker([spot.lat, spot.lng], {
                        radius: 9,
                        fillColor: spot.color,
                        color: "#ffffff",
                        weight: 3,
                        opacity: 1,
                        fillOpacity: 0.9
                    }).addTo(map)
                      .bindPopup("<b>" + spot.label + "</b><br/>" + spot.tooltip);

                    // Label
                    L.marker([spot.lat, spot.lng], {
                        icon: L.divIcon({
                            className: "sc-lbl",
                            html: '<span style="font-size:11px;font-weight:bold;color:#1a1a1a;background:rgba(255,255,255,0.92);padding:2px 8px;border-radius:4px;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,0.25);">' + spot.label + '</span>',
                            iconSize: [120, 22],
                            iconAnchor: [-14, 11]
                        })
                    }).addTo(map);
                });

                // Route polylines
                aRoutes.forEach(function (route) {
                    L.polyline([route.from, route.to], {
                        color: route.color,
                        weight: 2.5,
                        opacity: 0.7,
                        dashArray: "8, 6"
                    }).addTo(map);
                });

                this._map = map;
                console.log("[SupplyChain] Map created successfully!");

                setTimeout(function () {
                    map.invalidateSize();
                }, 500);

            } catch (e) {
                console.error("[SupplyChain] Error creating map:", e);
                this._mapCreated = false;
            }
        },

        onNavBack: function () {
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("RouteMenu");
        },

        onNavHome: function () {
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("RouteMenu");
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
        },

        onAlertSelect: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("listItem");
            var oContext = oSelectedItem.getBindingContext();
            var oAlertData = oContext.getObject();

            var oModel = this.getView().getModel();
            var aChartData = oModel.getProperty("/ChartData");
            var aNewChartData = aChartData.map(function (item) {
                return { status: item.status, quantity: Math.floor(Math.random() * 800) + 100 };
            });
            oModel.setProperty("/ChartData", aNewChartData);

            if (this._map && oAlertData.locName) {
                var aSpots = oModel.getProperty("/Spots");
                var oSpot;
                if (oAlertData.locName.indexOf("SaoPaulo") > -1) { oSpot = aSpots[1]; }
                else if (oAlertData.locName.indexOf("Lima") > -1) { oSpot = aSpots[0]; }
                else if (oAlertData.locName.indexOf("Bogota") > -1) { oSpot = aSpots[2]; }
                else if (oAlertData.locName.indexOf("BuenosAires") > -1) { oSpot = aSpots[3]; }
                else if (oAlertData.locName.indexOf("Santiago") > -1) { oSpot = aSpots[4]; }
                if (oSpot) {
                    this._map.flyTo([oSpot.lat, oSpot.lng], 6, { duration: 1.5 });
                }
            }
        },

        onExit: function () {
            if (this._pollTimer) { clearInterval(this._pollTimer); }
            if (this._map) { this._map.remove(); this._map = null; }
            this._mapCreated = false;
        }
    });
});
