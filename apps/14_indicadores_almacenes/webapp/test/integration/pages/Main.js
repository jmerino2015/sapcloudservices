sap.ui.define([
    "sap/ui/test/Opa5",
    "sap/ui/test/actions/Press",
    "sap/ui/test/matchers/PropertyStrictEquals"
], function (Opa5, Press, PropertyStrictEquals) {
    "use strict";

    var sViewName = "Main";

    Opa5.createPageObjects({
        onTheMainPage: {

            actions: {
                iToggleSideNav: function () {
                    return this.waitFor({
                        id: "btnToggleNav",
                        viewName: sViewName,
                        actions: new Press(),
                        errorMessage: "No se encontró el botón de alternancia de menú lateral 'btnToggleNav'"
                    });
                },

                iSelectSideNavItem: function (sKey) {
                    return this.waitFor({
                        id: "sideNav",
                        viewName: sViewName,
                        actions: function (oSideNav) {
                            var aItems = oSideNav.getItem().getItems();
                            var oTarget = aItems.filter(function (oItem) {
                                return oItem.getKey() === sKey;
                            })[0];
                            if (oTarget) {
                                oSideNav.setSelectedKey(sKey);
                                oSideNav.fireItemSelect({ item: oTarget });
                            }
                        },
                        errorMessage: "No se pudo seleccionar el ítem de SideNavigation con key: " + sKey
                    });
                },

                iSelectViewOption: function (sOptionKey) {
                    return this.waitFor({
                        id: "viewModeSelector",
                        viewName: sViewName,
                        actions: function (oSegmentedBtn) {
                            oSegmentedBtn.setSelectedKey(sOptionKey);
                            oSegmentedBtn.fireSelectionChange({
                                item: oSegmentedBtn.getItems().filter(function (oItem) {
                                    return oItem.getKey() === sOptionKey;
                                })[0]
                            });
                        },
                        errorMessage: "No se pudo seleccionar la opción de vista: " + sOptionKey
                    });
                },

                iSelectSede: function (sSedeKey) {
                    return this.waitFor({
                        id: "selectSedeOperativa",
                        viewName: sViewName,
                        actions: function (oSelect) {
                            oSelect.setSelectedKey(sSedeKey);
                            oSelect.fireChange({
                                selectedItem: oSelect.getSelectedItem()
                            });
                        },
                        errorMessage: "No se pudo cambiar la sede a: " + sSedeKey
                    });
                },

                iPressSyncNowButton: function () {
                    return this.waitFor({
                        id: "btnSyncNow",
                        viewName: sViewName,
                        actions: new Press(),
                        errorMessage: "No se encontró o no se pudo presionar el botón 'btnSyncNow'"
                    });
                },

                iChangeSyncInterval: function (sIntervalKey) {
                    return this.waitFor({
                        id: "selectSyncInterval",
                        viewName: sViewName,
                        actions: function (oSelect) {
                            oSelect.setSelectedKey(sIntervalKey);
                            oSelect.fireChange({
                                selectedItem: oSelect.getSelectedItem()
                            });
                        },
                        errorMessage: "No se pudo modificar el intervalo de sincronización"
                    });
                }
            },

            assertions: {
                iShouldSeeTheToolPage: function () {
                    return this.waitFor({
                        id: "toolPage",
                        viewName: sViewName,
                        success: function () {
                            Opa5.assert.ok(true, "El control ToolPage con arquitectura TNT está instanciado y visible");
                        },
                        errorMessage: "No se encontró el control ToolPage"
                    });
                },

                iShouldSeeTheHeaderToolbar: function () {
                    return this.waitFor({
                        controlType: "sap.m.Title",
                        viewName: sViewName,
                        matchers: new PropertyStrictEquals({
                            name: "text",
                            value: "Torre de Control WMS"
                        }),
                        success: function () {
                            Opa5.assert.ok(true, "El encabezado oficial ToolHeader de la Torre de Control WMS está visible");
                        },
                        errorMessage: "El título de cabecera no se visualizó correctamente"
                    });
                },

                iShouldSeeTheSideNav: function () {
                    return this.waitFor({
                        id: "sideNav",
                        viewName: sViewName,
                        success: function (oSideNav) {
                            Opa5.assert.ok(oSideNav.getVisible(), "El menú lateral SideNavigation está visible y activo");
                        },
                        errorMessage: "El SideNavigation no está disponible"
                    });
                },

                iShouldSeeTheSegmentedButton: function () {
                    return this.waitFor({
                        id: "viewModeSelector",
                        viewName: sViewName,
                        success: function (oSegmentedButton) {
                            Opa5.assert.strictEqual(
                                oSegmentedButton.getItems().length,
                                4,
                                "El SegmentedButton contiene exactamente las 4 opciones de visualización requeridas"
                            );
                        },
                        errorMessage: "No se encontró el selector de 4 opciones SegmentedButton"
                    });
                },

                iShouldSeeContainerVisible: function (sContainerId) {
                    return this.waitFor({
                        id: sContainerId,
                        viewName: sViewName,
                        matchers: new PropertyStrictEquals({
                            name: "visible",
                            value: true
                        }),
                        success: function () {
                            Opa5.assert.ok(true, "El contenedor " + sContainerId + " está visible en la vista actual");
                        },
                        errorMessage: "El contenedor " + sContainerId + " no está visible"
                    });
                },

                iShouldSeeSedeSelected: function (sExpectedSedeKey) {
                    return this.waitFor({
                        id: "selectSedeOperativa",
                        viewName: sViewName,
                        success: function (oSelect) {
                            Opa5.assert.strictEqual(
                                oSelect.getSelectedKey(),
                                sExpectedSedeKey,
                                "La sede activa en el selector coincide con: " + sExpectedSedeKey
                            );
                        },
                        errorMessage: "La sede activa no coincide con la esperada"
                    });
                },

                iShouldSeeCountdownRunning: function () {
                    return this.waitFor({
                        id: "txtCountdown",
                        viewName: sViewName,
                        success: function (oText) {
                            Opa5.assert.ok(
                                oText.getText().length > 0,
                                "El badge visual del temporizador regresivo muestra el tiempo restante (" + oText.getText() + ")"
                            );
                        },
                        errorMessage: "El contador regresivo no está visible"
                    });
                }
            }

        }
    });
});
