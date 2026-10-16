/* global QUnit */
sap.ui.define([
    "com/antigravity/indicadoresAlmacenes/controller/Main.controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/mvc/View",
    "sap/ui/thirdparty/sinon",
    "sap/ui/thirdparty/sinon-qunit"
], function (MainController, JSONModel, View, sinon) {
    "use strict";

    QUnit.module("Main Controller - Pruebas Unitarias de Arquitectura TNT & Estado WMS", {
        beforeEach: function () {
            this.oController = new MainController();

            // Mock del modelo WMS con propiedades TNT ToolPage
            this.oWmsModel = new JSONModel({
                sideExpanded: true,
                sideNavExpanded: true,
                selectedSede: "ALL",
                selectedOption: "opcion1",
                syncSettings: {
                    interval: 15,
                    lastUpdate: "02/10/2026 10:00:00"
                },
                sedes: {
                    "ALL": { SedeId: "ALL", SedeNombre: "Consolidado", TotalPositions: 37500, OccupancyRate: 87.2 },
                    "CD_EUCALIPTOS": { SedeId: "CD_EUCALIPTOS", SedeNombre: "CD Eucaliptos", TotalPositions: 12500, OccupancyRate: 89.0 },
                    "CD_CALLAO": { SedeId: "CD_CALLAO", SedeNombre: "CD Callao", TotalPositions: 9800, OccupancyRate: 91.5 },
                    "CD_PRADERAS": { SedeId: "CD_PRADERAS", SedeNombre: "CD Praderas", TotalPositions: 15200, OccupancyRate: 83.0 }
                },
                currentKpi: {
                    SedeId: "ALL",
                    TotalPositions: 37500,
                    PalletsInToday: 1630,
                    PalletsOutToday: 1805
                }
            });

            // Mock de recursos i18n
            this.oI18nModel = new JSONModel();
            this.oResourceBundle = {
                getText: function (sKey, aArgs) {
                    if (sKey === "filterAppliedMsg") {
                        return "Filtro aplicado para la sede: " + (aArgs ? aArgs[0] : "");
                    }
                    if (sKey === "syncSuccessMsg") {
                        return "Sincronización exitosa";
                    }
                    return sKey;
                }
            };
            this.oI18nModel.getResourceBundle = function () {
                return this.oResourceBundle;
            }.bind(this);

            // Mocks de controles UI para byId
            this.mControls = {};

            // Mock de ToolPage
            this.mControls["toolPage"] = {
                getSideExpanded: function () {
                    return this.oWmsModel.getProperty("/sideNavExpanded");
                }.bind(this),
                setSideExpanded: function (bExpanded) {
                    this.oWmsModel.setProperty("/sideNavExpanded", bExpanded);
                }.bind(this)
            };

            // Mock de SideNavigation
            this.mControls["sideNav"] = {
                setSelectedKey: sinon.stub()
            };

            // Mock de viewSectionTitle
            this.mControls["viewSectionTitle"] = {
                setText: sinon.stub()
            };

            // Mock de la Vista
            this.oViewStub = {
                getModel: function (sName) {
                    if (sName === "wms") {
                        return this.oWmsModel;
                    }
                    if (sName === "i18n") {
                        return this.oI18nModel;
                    }
                    return null;
                }.bind(this),
                byId: function (sId) {
                    return this.mControls[sId] || null;
                }.bind(this)
            };

            sinon.stub(this.oController, "getView").returns(this.oViewStub);
        },

        afterEach: function () {
            this.oController.onExit();
            this.oController.destroy();
            this.oWmsModel.destroy();
            this.oI18nModel.destroy();
        }
    });

    QUnit.test("1. onInit: Inicialización de estados por defecto ToolPage y WMS", function (assert) {
        this.oController.onInit();

        assert.strictEqual(
            this.oWmsModel.getProperty("/selectedOption"),
            "opcion1",
            "La vista por defecto debe ser 'opcion1' (Centro de Control Operativo)"
        );
        assert.strictEqual(
            this.oWmsModel.getProperty("/selectedSede"),
            "ALL",
            "La sede por defecto debe ser 'ALL' (Consolidado Corporativo)"
        );
        assert.strictEqual(
            this.oWmsModel.getProperty("/sideNavExpanded"),
            true,
            "El menú lateral SideNavigation debe iniciar expandido"
        );
    });

    QUnit.test("2. onToggleSideNav: Colapsa y expande el SideNavigation (patrón WMS Light)", function (assert) {
        this.oController.onInit();
        assert.strictEqual(this.oWmsModel.getProperty("/sideNavExpanded"), true);

        // Colapsar
        this.oController.onToggleSideNav();
        assert.strictEqual(
            this.oWmsModel.getProperty("/sideNavExpanded"),
            false,
            "El SideNavigation debe alternar a colapsado (false)"
        );

        // Expandir de nuevo
        this.oController.onToggleSideNav();
        assert.strictEqual(
            this.oWmsModel.getProperty("/sideNavExpanded"),
            true,
            "El SideNavigation debe alternar a expandido (true)"
        );
    });

    QUnit.test("3. onNavSelect: Navegación de opciones desde el SideNavigation", function (assert) {
        var aOptions = ["opcion1", "opcion2", "opcion3", "opcion4"];

        aOptions.forEach(function (sOption) {
            var oMockEvent = {
                getParameter: function (sParam) {
                    if (sParam === "item") {
                        return {
                            getKey: function () {
                                return sOption;
                            }
                        };
                    }
                    return null;
                }
            };

            this.oController.onNavSelect(oMockEvent);

            assert.strictEqual(
                this.oWmsModel.getProperty("/selectedOption"),
                sOption,
                "SideNavigation conmuta correctamente a la opción: " + sOption
            );
        }.bind(this));
    });

    QUnit.test("4. onSelectSede: Cambio de sede actualiza currentKpi reactivamente", function (assert) {
        var oMockEvent = {
            getSource: function () {
                return {
                    getSelectedKey: function () {
                        return "CD_EUCALIPTOS";
                    }
                };
            }
        };

        sinon.stub(this.oController, "_filterTablesBySede");

        this.oController.onSelectSede(oMockEvent);

        assert.strictEqual(
            this.oWmsModel.getProperty("/selectedSede"),
            "CD_EUCALIPTOS",
            "La propiedad selectedSede debe ser CD_EUCALIPTOS"
        );
        var oCurrentKpi = this.oWmsModel.getProperty("/currentKpi");
        assert.strictEqual(
            oCurrentKpi.SedeId,
            "CD_EUCALIPTOS",
            "El objeto currentKpi debe actualizarse con la información de CD_EUCALIPTOS"
        );
        assert.strictEqual(
            oCurrentKpi.TotalPositions,
            12500,
            "TotalPositions debe reflejar la capacidad de 12500"
        );
        assert.ok(
            this.oController._filterTablesBySede.calledWith("CD_EUCALIPTOS"),
            "Debe invocar _filterTablesBySede con el ID de sede seleccionado"
        );
    });

    QUnit.test("5. onSelectViewOption: Conmutación mediante SegmentedButton y sincronización con SideNav", function (assert) {
        var oMockEvent = {
            getParameter: function (sParam) {
                if (sParam === "item") {
                    return {
                        getKey: function () {
                            return "opcion3";
                        }
                    };
                }
                return null;
            }
        };

        this.oController.onSelectViewOption(oMockEvent);

        assert.strictEqual(
            this.oWmsModel.getProperty("/selectedOption"),
            "opcion3",
            "selectedOption debe cambiar a opcion3"
        );
        assert.ok(
            this.mControls["sideNav"].setSelectedKey.calledWith("opcion3"),
            "SideNavigation debe sincronizarse a la clave 'opcion3'"
        );
    });

    QUnit.test("6. onChangeSyncInterval: Ajuste de frecuencia de sincronización", function (assert) {
        var oMockEvent = {
            getSource: function () {
                return {
                    getSelectedKey: function () {
                        return "30";
                    }
                };
            }
        };

        this.oController.onChangeSyncInterval(oMockEvent);

        assert.strictEqual(
            this.oWmsModel.getProperty("/syncSettings/interval"),
            30,
            "El intervalo de sincronización debe actualizarse a 30 minutos"
        );
        assert.strictEqual(
            this.oController._nRemainingSeconds,
            1800,
            "El contador de segundos restantes debe inicializarse en 1800 (30 min * 60)"
        );
    });

    QUnit.test("7. onSyncNow: Disparo de sincronización y actualización de timestamp", function (assert) {
        var done = assert.async();
        var sInitialTimestamp = this.oWmsModel.getProperty("/syncSettings/lastUpdate");

        this.oController.onSyncNow(false);

        // Esperar timeout de simulación (500ms)
        setTimeout(function () {
            var sNewTimestamp = this.oWmsModel.getProperty("/syncSettings/lastUpdate");
            assert.notStrictEqual(
                sNewTimestamp,
                sInitialTimestamp,
                "El timestamp de última sincronización debe haber sido actualizado"
            );
            done();
        }.bind(this), 650);
    });

    QUnit.test("8. onExit: Limpieza correcta de timers en destrucción de controlador", function (assert) {
        this.oController.onInit();
        assert.ok(this.oController._nCountdownIntervalId, "El timer de cuenta regresiva debe estar instanciado");

        this.oController.onExit();
        assert.strictEqual(
            this.oController._nCountdownIntervalId,
            null,
            "El timer de cuenta regresiva debe ser cancelado y quedar en null tras onExit"
        );
    });
});
