sap.ui.define([
  "sap/ui/core/UIComponent",
  "sap/ui/Device",
  "wm/light/model/models"
], function (UIComponent, Device, models) {
  "use strict";

  return UIComponent.extend("wm.light.Component", {
    metadata: { manifest: "json" },

    init: function () {
      UIComponent.prototype.init.apply(this, arguments);
      this.setModel(models.createDeviceModel(), "device");
      // No router — navigation handled manually in App.controller.js
    }
  });
});
