sap.ui.define([
  "wm/light/controller/BaseController",
  "sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
  "use strict";

  return BaseController.extend("wm.light.controller.DispatchPrint", {
    onInit: function () {
      var oData = {
        toCompany: "Company Name",
        toAddress: "Address, City\nZIP, State",
        fromCompany: "Company Name, Address, City, ZIP, State",
        lotNumber: "L89932-1",
        refNumber: "R-76500",
        shipDate: "2023-11-05",
        weight: "15.4 kg",
        instruction: "Leave at front door",
        barcode: "0000000000000"
      };
      
      var oModel = new JSONModel(oData);
      this.getView().setModel(oModel, "dispatchModel");

      this.getView().addEventDelegate({
        onAfterRendering: this._renderLabel.bind(this)
      });
    },

    onLiveChange: function () {
      this._renderLabel();
    },

    _renderLabel: function () {
      var oData = this.getView().getModel("dispatchModel").getData();
      
      document.getElementById("lblDispToComp") && (document.getElementById("lblDispToComp").innerText = oData.toCompany);
      
      // Handle multiline for address
      if (document.getElementById("lblDispToAdd")) {
        document.getElementById("lblDispToAdd").innerHTML = oData.toAddress.replace(/\n/g, "<br>");
      }

      document.getElementById("lblDispFrom") && (document.getElementById("lblDispFrom").innerText = oData.fromCompany);
      document.getElementById("lblDispLot") && (document.getElementById("lblDispLot").innerText = oData.lotNumber);
      document.getElementById("lblDispRef") && (document.getElementById("lblDispRef").innerText = oData.refNumber);
      document.getElementById("lblDispDate") && (document.getElementById("lblDispDate").innerText = oData.shipDate);
      document.getElementById("lblDispWeight") && (document.getElementById("lblDispWeight").innerText = oData.weight);
      document.getElementById("lblDispInst") && (document.getElementById("lblDispInst").innerText = oData.instruction);

      // Generate Barcode
      if (window.JsBarcode && document.getElementById("dispatchBarcodeImage") && oData.barcode) {
        try {
          JsBarcode("#dispatchBarcodeImage", oData.barcode, {
            format: "CODE128",
            displayValue: true,
            fontSize: 16,
            height: 100,
            margin: 0
          });
        } catch (e) { console.error("Barcode generation failed", e); }
      }
    },

    onPrint: function () {
      window.print();
    }
  });
});
