sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "com/droidconsulting/scm/fxmanager/model/models",
    "sap/ui/model/json/JSONModel"
], function (UIComponent, Device, models, JSONModel) {
    "use strict";

    return UIComponent.extend("com.droidconsulting.scm.fxmanager.Component", {

        metadata: {
            manifest: "json"
        },

        init: function () {
            // Call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // Set device model
            this.setModel(models.createDeviceModel(), "device");

            // Set UI model
            this.setModel(models.createUIModel(), "ui");

            // Load local mock data model
            var oMockModel = new JSONModel();
            var sMockUrl = sap.ui.require.toUrl("com/droidconsulting/scm/fxmanager/model/mockData.json");
            oMockModel.loadData(sMockUrl);
            this.setModel(oMockModel);

            // Enable routing
            this.getRouter().initialize();
        }
    });
});
