sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, JSONModel, MessageToast, MessageBox, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("com.antigravity.indicadoresAlmacenes.controller.Main", {

        /**
         * Inicialización del controlador principal.
         */
        onInit: function () {
            var oModel = this.getView().getModel("wms");
            if (oModel) {
                // Estado inicial del ToolPage y SideNavigation
                oModel.setProperty("/sideExpanded", true);
                oModel.setProperty("/sideNavExpanded", true);
                oModel.setProperty("/selectedOption", "opcion1");
                oModel.setProperty("/selectedSede", "ALL");

                // Configurar timer de cuenta regresiva
                this._initCountdownTimer();
            }

            // Registrar listener de temas Fiori Horizon
            this._setupThemeListener();
        },

        /**
         * Limpieza al destruir el controlador.
         */
        onExit: function () {
            if (this._nCountdownIntervalId) {
                clearInterval(this._nCountdownIntervalId);
                this._nCountdownIntervalId = null;
            }
        },

        /**
         * Retorno al Launchpad o cierre de modal contenedor.
         */
        goHome: function () {
            if (window.parent && window.parent.PortalApp && typeof window.parent.PortalApp.closeModal === "function") {
                window.parent.PortalApp.closeModal();
            } else {
                window.location.href = "../../../index.html";
            }
        },

        onGoHome: function () {
            this.goHome();
        },

        /* =====================================================================
           1. ARQUITECTURA TOOLPAGE & SIDENAVIGATION (PATRÓN WMS)
           ===================================================================== */

        /**
         * Alterna el estado colapsado / expandido del menú lateral.
         */
        onToggleSideNav: function () {
            var oToolPage = this.byId("toolPage");
            var bSideExpanded = oToolPage ? oToolPage.getSideExpanded() : true;
            if (oToolPage) {
                oToolPage.setSideExpanded(!bSideExpanded);
            }

            var oModel = this.getView().getModel("wms");
            if (oModel) {
                oModel.setProperty("/sideExpanded", !bSideExpanded);
                oModel.setProperty("/sideNavExpanded", !bSideExpanded);
            }
        },

        /**
         * Alias para evento itemSelect del SideNavigation.
         */
        onSideNavSelect: function (oEvent) {
            this.onNavSelect(oEvent);
        },

        /**
         * Selección de ítems en el menú lateral SideNavigation.
         */
        onNavSelect: function (oEvent) {
            var oItem = oEvent.getParameter("item");
            if (!oItem) {
                return;
            }
            var sKey = oItem.getKey();
            var oModel = this.getView().getModel("wms");

            // 1. Conmutación de las 4 opciones de visualización
            if (sKey === "opcion1" || sKey === "opcion2" || sKey === "opcion3" || sKey === "opcion4") {
                oModel.setProperty("/selectedOption", sKey);
                this._updateSectionTitle(sKey);
            }
            // 2. Selección de sede desde el menú lateral
            else if (sKey.indexOf("sede_") === 0 || sKey.indexOf("nav_sede_") === 0) {
                var sSedeKey = sKey.replace("nav_sede_", "").replace("sede_", "");
                var oSelectSede = this.byId("selectSedeOperativa");
                if (oSelectSede) {
                    oSelectSede.setSelectedKey(sSedeKey);
                }
                this._applySedeSelection(sSedeKey);

                // Mantener el item de vista seleccionado en el menú lateral
                var sCurrentOption = oModel.getProperty("/selectedOption") || "opcion1";
                var oSideNav = this.byId("sideNav");
                if (oSideNav) {
                    oSideNav.setSelectedKey(sCurrentOption);
                }
            }
            // 3. Item Administración en el pie de barra lateral
            else if (sKey === "action_admin") {
                MessageBox.information("Módulo de Administración WMS: Gestión de centros logísticos, directrices Clean Core y monitoreo de colas de transporte.", {
                    title: "Administración Torre de Control WMS"
                });
            }
            // 4. Info Clean Core
            else if (sKey === "info_clean_core") {
                MessageToast.show("Arquitectura Clean Core RAP OData V4 activa y validada.");
            }
            // 5. Acciones fijas en el footer lateral
            else if (sKey === "action_sync") {
                this.onSyncNow();
            } else if (sKey === "action_export") {
                this.onExportData();
            } else if (sKey === "action_fullscreen") {
                this.onToggleFullScreen();
            }
        },

        /**
         * Conmutación de vista mediante el SegmentedButton del subheader.
         */
        onSelectViewOption: function (oEvent) {
            var sSelectedKey = oEvent.getParameter("item").getKey();
            var oModel = this.getView().getModel("wms");
            oModel.setProperty("/selectedOption", sSelectedKey);
            this._updateSectionTitle(sSelectedKey);

            // Sincronizar SideNavigation
            var oSideNav = this.byId("sideNav");
            if (oSideNav) {
                oSideNav.setSelectedKey(sSelectedKey);
            }
        },

        /**
         * Actualiza el título dinámico de la sección activa.
         */
        _updateSectionTitle: function (sOptionKey) {
            var oTitle = this.byId("viewSectionTitle");
            if (!oTitle) {
                return;
            }
            var mTitles = {
                "opcion1": "Centro de Control Operativo",
                "opcion2": "Flujo de Operación del Día",
                "opcion3": "Dashboard por Excepción",
                "opcion4": "Vista Integral Multi-Sede"
            };
            oTitle.setText(mTitles[sOptionKey] || "Torre de Control WMS");
        },

        /* =====================================================================
           2. MANEJO DE SINCRONIZACIÓN Y COUNTDOWN TEMPORIZADO
           ===================================================================== */

        /**
         * Inicializa el temporizador de cuenta regresiva para el autorefresco.
         */
        _initCountdownTimer: function () {
            var oModel = this.getView().getModel("wms");
            var nMinutes = parseInt(oModel.getProperty("/syncSettings/interval"), 10) || 15;
            this._nRemainingSeconds = nMinutes * 60;
            this._updateCountdownVisual();

            if (this._nCountdownIntervalId) {
                clearInterval(this._nCountdownIntervalId);
            }

            if (nMinutes > 0) {
                this._nCountdownIntervalId = setInterval(this._onTick.bind(this), 1000);
            }
        },

        /**
         * Ticker ejecutado cada segundo.
         */
        _onTick: function () {
            var oModel = this.getView().getModel("wms");
            var nInterval = parseInt(oModel.getProperty("/syncSettings/interval"), 10);

            if (nInterval === 0) {
                return; // Modo manual pausado
            }

            this._nRemainingSeconds--;
            if (this._nRemainingSeconds <= 0) {
                this.onSyncNow(true);
            } else {
                this._updateCountdownVisual();
            }
        },

        /**
         * Actualiza el badge visual del temporizador regresivo.
         */
        _updateCountdownVisual: function () {
            var oTxtCountdown = this.byId("txtCountdown");
            if (!oTxtCountdown) {
                return;
            }

            var oModel = this.getView().getModel("wms");
            var nInterval = parseInt(oModel.getProperty("/syncSettings/interval"), 10);

            if (nInterval === 0) {
                oTxtCountdown.setText("Pausado");
                return;
            }

            var nMin = Math.floor(this._nRemainingSeconds / 60);
            var nSec = this._nRemainingSeconds % 60;
            var sMinFormatted = nMin < 10 ? "0" + nMin : "" + nMin;
            var sSecFormatted = nSec < 10 ? "0" + nSec : "" + nSec;

            oTxtCountdown.setText(sMinFormatted + ":" + sSecFormatted);
        },

        /**
         * Cambia el intervalo de sincronización programada (15m, 30m, Manual).
         */
        onChangeSyncInterval: function (oEvent) {
            var sKey = oEvent.getSource().getSelectedKey();
            var nMinutes = parseInt(sKey, 10);
            var oModel = this.getView().getModel("wms");
            oModel.setProperty("/syncSettings/interval", nMinutes);

            if (nMinutes > 0) {
                this._nRemainingSeconds = nMinutes * 60;
                if (!this._nCountdownIntervalId) {
                    this._nCountdownIntervalId = setInterval(this._onTick.bind(this), 1000);
                }
                MessageToast.show("Frecuencia ajustada a cada " + nMinutes + " minutos.");
            } else {
                this._nRemainingSeconds = 0;
                MessageToast.show("Sincronización configurada en modo Manual.");
            }
            this._updateCountdownVisual();
        },

        /**
         * Dispara la sincronización manual o automática en tiempo real.
         */
        onSyncNow: function (bIsAuto) {
            var that = this;
            var oModel = this.getView().getModel("wms");
            var oBtnSync = this.byId("btnSyncNow");

            if (oBtnSync) {
                oBtnSync.setBusy(true);
            }

            setTimeout(function () {
                if (oBtnSync) {
                    oBtnSync.setBusy(false);
                }

                var dNow = new Date();
                var sDate = dNow.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
                var sTime = dNow.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
                var sTimestamp = sDate + " " + sTime;

                oModel.setProperty("/syncSettings/lastUpdate", sTimestamp);
                that._applyDynamicKpiUpdates();

                var nMinutes = parseInt(oModel.getProperty("/syncSettings/interval"), 10) || 15;
                if (nMinutes > 0) {
                    that._nRemainingSeconds = nMinutes * 60;
                    that._updateCountdownVisual();
                }

                var oResourceBundle = that.getView().getModel("i18n").getResourceBundle();
                MessageToast.show(oResourceBundle.getText("syncSuccessMsg") + " (" + sTime + ")");
            }, 500);
        },

        /**
         * Introduce leves fluctuaciones realistas en los datos durante la sincronización.
         */
        _applyDynamicKpiUpdates: function () {
            var oModel = this.getView().getModel("wms");
            var oCurrentKpi = Object.assign({}, oModel.getProperty("/currentKpi"));

            var nDeltaIn = Math.floor(Math.random() * 5) - 2;
            var nDeltaOut = Math.floor(Math.random() * 5) - 1;
            oCurrentKpi.PalletsInToday = Math.max(0, oCurrentKpi.PalletsInToday + nDeltaIn);
            oCurrentKpi.PalletsOutToday = Math.max(0, oCurrentKpi.PalletsOutToday + nDeltaOut);

            oModel.setProperty("/currentKpi", oCurrentKpi);
        },

        /* =====================================================================
           3. NAVEGACIÓN Y FILTRADO POR SEDE
           ===================================================================== */

        /**
         * Selección de Sede desde el Select de la cabecera.
         */
        onSelectSede: function (oEvent) {
            var sKey = oEvent.getSource().getSelectedKey();
            this._applySedeSelection(sKey);
        },

        /**
         * Aplica la selección de sede de manera centralizada.
         */
        _applySedeSelection: function (sSedeKey) {
            var oModel = this.getView().getModel("wms");
            oModel.setProperty("/selectedSede", sSedeKey);

            var oSedeData = oModel.getProperty("/sedes/" + sSedeKey);
            if (oSedeData) {
                oModel.setProperty("/currentKpi", Object.assign({}, oSedeData));
            }

            this._filterTablesBySede(sSedeKey);

            var sSedeText = sSedeKey === "ALL" ? "Todas las Sedes" : (oSedeData ? oSedeData.SedeNombre : sSedeKey);
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            MessageToast.show(oResourceBundle.getText("filterAppliedMsg", [sSedeText]));
        },

        /**
         * Filtra tablas de unidades, familias y operarios al cambiar de sede.
         */
        _filterTablesBySede: function (sSedeKey) {
            var aSedeFilters = [];
            if (sSedeKey && sSedeKey !== "ALL") {
                aSedeFilters.push(new Filter("SedeId", FilterOperator.EQ, sSedeKey));
            }

            var oTableTransportes = this.byId("tableTransportes");
            if (oTableTransportes && oTableTransportes.getBinding("items")) {
                oTableTransportes.getBinding("items").filter(aSedeFilters);
            }

            var oTableFamilias = this.byId("tableFamilias");
            if (oTableFamilias && oTableFamilias.getBinding("items")) {
                oTableFamilias.getBinding("items").filter(aSedeFilters);
            }
        },

        /* =====================================================================
           4. BÚSQUEDA Y FILTROS EN TABLAS
           ===================================================================== */

        onSearchOperario: function (oEvent) {
            var sQuery = oEvent.getParameter("newValue");
            var aFilters = [];
            if (sQuery && sQuery.trim().length > 0) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("operario", FilterOperator.Contains, sQuery),
                        new Filter("sede", FilterOperator.Contains, sQuery),
                        new Filter("proceso", FilterOperator.Contains, sQuery)
                    ],
                    and: false
                }));
            }
            var oTable = this.byId("tableOperarios");
            if (oTable && oTable.getBinding("items")) {
                oTable.getBinding("items").filter(aFilters);
            }
        },

        onSearchTransporte: function (oEvent) {
            var sQuery = oEvent.getParameter("newValue");
            this._applyTransportFilters(sQuery, null);
        },

        onFilterStatusTransporte: function (oEvent) {
            var sStatus = oEvent.getSource().getSelectedKey();
            this._applyTransportFilters(null, sStatus);
        },

        _applyTransportFilters: function (sSearchQuery, sStatusKey) {
            var oTable = this.byId("tableTransportes");
            if (!oTable || !oTable.getBinding("items")) {
                return;
            }

            var oModel = this.getView().getModel("wms");
            var sSede = oModel.getProperty("/selectedSede");
            var aFilters = [];

            if (sSede && sSede !== "ALL") {
                aFilters.push(new Filter("SedeId", FilterOperator.EQ, sSede));
            }

            if (sSearchQuery && sSearchQuery.trim().length > 0) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("PlacaVehiculo", FilterOperator.Contains, sSearchQuery),
                        new Filter("Transportista", FilterOperator.Contains, sSearchQuery),
                        new Filter("Destino", FilterOperator.Contains, sSearchQuery)
                    ],
                    and: false
                }));
            }

            var oSelectStatus = this.byId("selectStatusTransporte");
            var sCurrentStatus = sStatusKey || (oSelectStatus ? oSelectStatus.getSelectedKey() : "ALL");
            if (sCurrentStatus && sCurrentStatus !== "ALL") {
                aFilters.push(new Filter("EstatusTransporte", FilterOperator.EQ, sCurrentStatus));
            }

            oTable.getBinding("items").filter(aFilters);
        },

        onSearchExcepcion: function (oEvent) {
            var sQuery = oEvent.getParameter("newValue");
            this._applyExceptionFilters(sQuery, null);
        },

        onFilterSeveridadExcepcion: function (oEvent) {
            var sKey = oEvent.getSource().getSelectedKey();
            this._applyExceptionFilters(null, sKey);
        },

        _applyExceptionFilters: function (sQuery, sSeveridad) {
            var oTable = this.byId("tableExcepciones");
            if (!oTable || !oTable.getBinding("items")) {
                return;
            }

            var aFilters = [];
            if (sQuery && sQuery.trim().length > 0) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("id", FilterOperator.Contains, sQuery),
                        new Filter("sede", FilterOperator.Contains, sQuery),
                        new Filter("descripcion", FilterOperator.Contains, sQuery),
                        new Filter("proceso", FilterOperator.Contains, sQuery)
                    ],
                    and: false
                }));
            }

            var oSelect = this.byId("selectSeveridadExcepcion");
            var sCurrentSev = sSeveridad || (oSelect ? oSelect.getSelectedKey() : "ALL");
            if (sCurrentSev && sCurrentSev !== "ALL") {
                aFilters.push(new Filter("severidadTexto", FilterOperator.EQ, sCurrentSev));
            }

            oTable.getBinding("items").filter(aFilters);
        },

        /* =====================================================================
           5. ACCIONES INTERACTIVAS & DIÁLOGOS
           ===================================================================== */

        onOpenUnitDetail: function (oEvent) {
            var oItem = oEvent.getSource().getParent();
            var oContext = oItem.getBindingContext("wms");
            var oData = oContext.getObject();

            MessageBox.information(
                "Unidad: " + oData.PlacaVehiculo + " (" + oData.Transportista + ")\n" +
                "Destino: " + oData.Destino + "\n" +
                "Entrega: #" + oData.DocumentoEntrega + " | Rampa: " + oData.Rampa + "\n" +
                "Salida Planificada: " + oData.HoraPlanificadaSalida + " | Salida Real: " + oData.HoraRealSalida + "\n" +
                "Demora: " + oData.DemoraMinutos + " min | Cumple 7-10 AM: " + (oData.CumpleVentana7a10 ? "SÍ" : "NO") + "\n" +
                "Carga: " + oData.BultosTotal + " Bultos (" + oData.PesoTotalTN + " TN)",
                {
                    title: "Torre de Control — Detalle de Despacho"
                }
            );
        },

        onSelectChevronStage: function (oEvent) {
            var oSource = oEvent.getSource();
            var sTitle = oSource.getHeader ? oSource.getHeader().getTitle() : "Etapa de Flujo";
            MessageToast.show("Detalle activo: " + sTitle + ". Analizando balance de línea y OTs.");
        },

        onExecuteAlertAction: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("wms");
            var oAlert = oContext.getObject();

            MessageBox.confirm(
                "¿Desea ejecutar la siguiente acción correctiva inmediata?\n\n" +
                "» Acción: " + oAlert.accionSugerida + "\n" +
                "» Sede: " + oAlert.sede + "\n" +
                "» Evento: " + oAlert.titulo,
                {
                    title: "Ejecución de Acción Correctiva WMS",
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {
                            MessageToast.show("Acción ejecutada con éxito en " + oAlert.sede + ". Notificación enviada a supervisión.");
                        }
                    }
                }
            );
        },

        onResolveException: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("wms");
            var oEx = oContext.getObject();

            MessageBox.success("La excepción " + oEx.id + " (" + oEx.codigo + ") ha sido marcada como Resuelta en S/4HANA.", {
                title: "Excepción Resuelta"
            });
        },

        onEscalateException: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("wms");
            var oEx = oContext.getObject();

            MessageBox.warning("La excepción " + oEx.id + " ha sido escalada al Gerente de Cadena de Suministro y Supervisor de " + oEx.sede + ".", {
                title: "Escalamiento Operativo"
            });
        },

        onDonutSelectionChanged: function (oEvent) {
            var oSegment = oEvent.getParameter("segment");
            if (oSegment) {
                MessageToast.show("Filtro seleccionado: " + oSegment.getLabel() + " (" + oSegment.getValue() + " camiones)");
            }
        },

        /* =====================================================================
           6. PANTALLA COMPLETA & EXPORTACIÓN
           ===================================================================== */

        onToggleFullScreen: function () {
            var oBtn = this.byId("btnToggleFullScreen");
            var oBtn4 = this.byId("btnFullScreenOpcion4");

            if (!document.fullscreenElement) {
                if (document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen();
                } else if (document.documentElement.webkitRequestFullscreen) {
                    document.documentElement.webkitRequestFullscreen();
                }
                if (oBtn) { oBtn.setIcon("sap-icon://exit-full-screen"); }
                if (oBtn4) { oBtn4.setIcon("sap-icon://exit-full-screen"); }
                MessageToast.show("Modo Torre de Control (Pantalla Completa) activado.");
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
                if (oBtn) { oBtn.setIcon("sap-icon://full-screen"); }
                if (oBtn4) { oBtn4.setIcon("sap-icon://full-screen"); }
                MessageToast.show("Modo pantalla normal restaurado.");
            }
        },

        onExportData: function () {
            var oModel = this.getView().getModel("wms");
            var aComparativa = oModel.getProperty("/comparativaSedes") || [];

            var sCsvContent = "data:text/csv;charset=utf-8,";
            sCsvContent += "Sede,Centro SAP,Responsable,Ocupabilidad (%),Posiciones Bins,Paletas Flujo,OTs Abiertas,Cumplimiento Ventana 7-10 (%),Calidad ERI (%),OTIF (%),Dias Sin Accidentes,Score 5S (%)\r\n";

            aComparativa.forEach(function (row) {
                var sLine = [
                    '"' + row.sede + '"',
                    '"' + row.centro + '"',
                    '"' + row.responsable + '"',
                    row.ocupabilidad,
                    '"' + row.posiciones + '"',
                    '"' + row.paletasFlujo + '"',
                    row.otAbiertas,
                    row.cumplimientoVentana,
                    row.calidadEri,
                    row.otif,
                    row.diasSinAccidentes,
                    row.fiveS
                ].join(",");
                sCsvContent += sLine + "\r\n";
            });

            var encodedUri = encodeURI(sCsvContent);
            var oLink = document.createElement("a");
            oLink.setAttribute("href", encodedUri);
            oLink.setAttribute("download", "Torre_Control_WMS_MultiSede_" + new Date().toISOString().slice(0, 10) + ".csv");
            document.body.appendChild(oLink);
            oLink.click();
            document.body.removeChild(oLink);

            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            MessageToast.show(oResourceBundle.getText("exportSuccessMsg"));
        },

        /* =====================================================================
           7. SOPORTE DE TEMAS HORIZON
           ===================================================================== */

        onToggleTheme: function () {
            var sCurrentTheme = sap.ui.getCore().getConfiguration().getTheme();
            var sNewTheme = (sCurrentTheme === "sap_horizon_dark") ? "sap_horizon" : "sap_horizon_dark";
            sap.ui.getCore().applyTheme(sNewTheme);
            MessageToast.show("Tema cambiado a: " + (sNewTheme === "sap_horizon_dark" ? "Evening Horizon (Oscuro)" : "Morning Horizon (Claro)"));
        },

        _setupThemeListener: function () {
            window.addEventListener("message", function (e) {
                if (e.data && e.data.type === "SET_THEME") {
                    var isDark = (e.data.theme === "dark" || e.data.theme === "sap_horizon_dark");
                    var sTheme = isDark ? "sap_horizon_dark" : "sap_horizon";
                    try {
                        sap.ui.getCore().applyTheme(sTheme);
                    } catch (err) {
                        console.warn("Error al sincronizar tema:", err);
                    }
                }
            });
        }

    });
});
