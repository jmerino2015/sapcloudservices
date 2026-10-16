sap.ui.define([
  "wm/light/controller/BaseController",
  "sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
  "use strict";

  return BaseController.extend("wm.light.controller.LabelPrint", {
    onInit: function () {
      var oData = {
        productName: "INSUMO GENÉRICO",
        fromCompany: "Logística Central S.A.",
        fromAddress: "Av. Las Américas 123",
        fromCity: "Bogotá",
        fromZip: "110111",
        toCompany: "Distribuidora del Norte",
        toAddress: "Calle 45 #12-89",
        toCity: "Medellín",
        toZip: "050012",
        itemNo: "MAT-998822",
        instruction: "Entregar por puerta lateral 2",
        important: "Manejar con cuidado. Contiene líquido.",
        barcodeValue: "LGT-77339944"
      };
      
      var oModel = new JSONModel(oData);
      this.getView().setModel(oModel, "labelModel");

      // Attach to view rendered to draw initial barcode and QR
      this.getView().addEventDelegate({
        onAfterRendering: this._renderLabel.bind(this)
      });
    },

    onLiveChange: function () {
      this._renderLabel();
    },

    _renderLabel: function () {
      var oData = this.getView().getModel("labelModel").getData();
      
      // Update text fields
      document.getElementById("lblProduct") && (document.getElementById("lblProduct").innerText = oData.productName);
      
      document.getElementById("lblFromCompany") && (document.getElementById("lblFromCompany").innerText = oData.fromCompany);
      document.getElementById("lblFromAddress") && (document.getElementById("lblFromAddress").innerText = oData.fromAddress);
      document.getElementById("lblFromCity") && (document.getElementById("lblFromCity").innerText = oData.fromCity);
      document.getElementById("lblFromZip") && (document.getElementById("lblFromZip").innerText = oData.fromZip);

      document.getElementById("lblToCompany") && (document.getElementById("lblToCompany").innerText = oData.toCompany);
      document.getElementById("lblToAddress") && (document.getElementById("lblToAddress").innerText = oData.toAddress);
      document.getElementById("lblToCity") && (document.getElementById("lblToCity").innerText = oData.toCity);
      document.getElementById("lblToZip") && (document.getElementById("lblToZip").innerText = oData.toZip);

      document.getElementById("lblItem") && (document.getElementById("lblItem").innerText = oData.itemNo);
      document.getElementById("lblInstr") && (document.getElementById("lblInstr").innerText = oData.instruction);
      document.getElementById("lblImportant") && (document.getElementById("lblImportant").innerText = oData.important);

      // Generate Barcode
      if (window.JsBarcode && document.getElementById("barcodeImage") && oData.barcodeValue) {
        try {
          JsBarcode("#barcodeImage", oData.barcodeValue, {
            format: "CODE128",
            displayValue: true,
            fontSize: 16,
            height: 70,
            margin: 0
          });
        } catch (e) { console.error("Barcode generation failed", e); }
      }

      // Generate QR Code
      var qrContainer = document.getElementById("qrCodeContainer");
      if (window.QRCode && qrContainer) {
        qrContainer.innerHTML = ""; // clear previous
        var qrText = oData.toCompany + " | " + oData.itemNo + " | " + oData.barcodeValue;
        new QRCode(qrContainer, {
          text: qrText,
          width: 140,
          height: 140,
          colorDark : "#000000",
          colorLight : "#ffffff",
          correctLevel : QRCode.CorrectLevel.L
        });
      }
    },

    onPrint: function () {
      window.print();
    }
  });
});
