sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
], function (JSONModel, Device) {
    "use strict";

    return {
        createDeviceModel: function () {
            var oModel = new JSONModel(Device);
            oModel.setDefaultBindingMode("OneWay");
            return oModel;
        },

        createUIModel: function () {
            var oModel = new JSONModel({
                isBusy: false,
                delay: 0,
                editMode: false,
                selectedCount: 0,
                filterCount: 0
            });
            return oModel;
        }
    };
});
