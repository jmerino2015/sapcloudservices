/* global QUnit */
sap.ui.define([
    "sap/ui/test/opaQunit",
    "com/antigravity/indicadoresAlmacenes/test/integration/pages/Main"
], function (opaTest) {
    "use strict";

    QUnit.module("Torre de Control WMS Multi-Sede — Arquitectura TNT y Flujo de Navegación");

    opaTest("1. Carga inicial: Arquitectura ToolPage, ToolHeader, SideNavigation y Opción 1 visible", function (Given, When, Then) {
        Given.iStartMyUIComponent({
            componentConfig: {
                name: "com.antigravity.indicadoresAlmacenes",
                async: true
            }
        });

        // Verificaciones de componentes TNT y Fiori Horizon
        Then.onTheMainPage.iShouldSeeTheToolPage();
        Then.onTheMainPage.iShouldSeeTheHeaderToolbar();
        Then.onTheMainPage.iShouldSeeTheSideNav();
        Then.onTheMainPage.iShouldSeeTheSegmentedButton();
        Then.onTheMainPage.iShouldSeeContainerVisible("containerOpcion1");
        Then.onTheMainPage.iShouldSeeSedeSelected("ALL");
        Then.onTheMainPage.iShouldSeeCountdownRunning();
    });

    opaTest("2. Alternar menú lateral SideNavigation (Colapsar y expandir)", function (Given, When, Then) {
        When.onTheMainPage.iToggleSideNav();
        Then.onTheMainPage.iShouldSeeTheSideNav();

        When.onTheMainPage.iToggleSideNav();
        Then.onTheMainPage.iShouldSeeTheSideNav();
    });

    opaTest("3. Navegación a Opción 2: Flujo de Operación (Chevrons y Alertas)", function (Given, When, Then) {
        When.onTheMainPage.iSelectViewOption("opcion2");

        Then.onTheMainPage.iShouldSeeContainerVisible("containerOpcion2");
    });

    opaTest("4. Navegación a Opción 3 desde el SideNavigation: Dashboard por Excepción", function (Given, When, Then) {
        When.onTheMainPage.iSelectSideNavItem("opcion3");

        Then.onTheMainPage.iShouldSeeContainerVisible("containerOpcion3");
    });

    opaTest("5. Navegación a Opción 4: Vista Integral Multi-Sede (Matriz Comparativa)", function (Given, When, Then) {
        When.onTheMainPage.iSelectViewOption("opcion4");

        Then.onTheMainPage.iShouldSeeContainerVisible("containerOpcion4");
    });

    opaTest("6. Retorno a Opción 1 y Cambio de Sede a CD Eucaliptos", function (Given, When, Then) {
        When.onTheMainPage.iSelectViewOption("opcion1");
        Then.onTheMainPage.iShouldSeeContainerVisible("containerOpcion1");

        When.onTheMainPage.iSelectSede("CD_EUCALIPTOS");
        Then.onTheMainPage.iShouldSeeSedeSelected("CD_EUCALIPTOS");
    });

    opaTest("7. Cambio de Sede a CD Callao y CD Praderas", function (Given, When, Then) {
        When.onTheMainPage.iSelectSede("CD_CALLAO");
        Then.onTheMainPage.iShouldSeeSedeSelected("CD_CALLAO");

        When.onTheMainPage.iSelectSede("CD_PRADERAS");
        Then.onTheMainPage.iShouldSeeSedeSelected("CD_PRADERAS");
    });

    opaTest("8. Ejecución de Acción 'Sincronizar Ahora' en Torre de Control", function (Given, When, Then) {
        When.onTheMainPage.iPressSyncNowButton();
        Then.onTheMainPage.iShouldSeeCountdownRunning();

        // Teardown del componente
        Then.iTeardownMyUIComponent();
    });
});
