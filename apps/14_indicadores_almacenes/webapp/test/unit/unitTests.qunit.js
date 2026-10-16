/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
    "use strict";

    sap.ui.require([
        "com/antigravity/indicadoresAlmacenes/test/unit/controller/Main.controller.qunit"
    ], function () {
        QUnit.start();
    });
});
