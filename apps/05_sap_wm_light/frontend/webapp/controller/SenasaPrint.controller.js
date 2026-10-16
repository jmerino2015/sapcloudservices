sap.ui.define([
  "wm/light/controller/BaseController",
  "sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
  "use strict";

  return BaseController.extend("wm.light.controller.SenasaPrint", {
    onInit: function () {
      var oData = {
        producto: "Mandarina",
        variedad: "Murcott",
        origen: "ER07-001-CB",
        fecha: "01/11/23 18:03",
        condicion: "Tratamiento",
        lote: "140687-2",
        serie: "079 de 158"
      };
      
      var oModel = new JSONModel(oData);
      this.getView().setModel(oModel, "senasaModel");

      this.getView().addEventDelegate({
        onAfterRendering: this._renderLabel.bind(this)
      });
    },

    onLiveChange: function () {
      this._renderLabel();
    },

    _renderLabel: function () {
      var oData = this.getView().getModel("senasaModel").getData();
      
      // Update text fields
      document.getElementById("lblSenasaProd") && (document.getElementById("lblSenasaProd").innerText = oData.producto);
      document.getElementById("lblSenasaVar") && (document.getElementById("lblSenasaVar").innerText = oData.variedad);
      document.getElementById("lblSenasaOrig") && (document.getElementById("lblSenasaOrig").innerText = oData.origen);
      document.getElementById("lblSenasaFec") && (document.getElementById("lblSenasaFec").innerText = oData.fecha);
      document.getElementById("lblSenasaCond") && (document.getElementById("lblSenasaCond").innerText = oData.condicion);
      document.getElementById("lblSenasaLote") && (document.getElementById("lblSenasaLote").innerText = oData.lote);
      document.getElementById("lblSenasaSer") && (document.getElementById("lblSenasaSer").innerText = oData.serie);

      // Generate QR Code
      var qrContainer = document.getElementById("senasaQrCode");
      if (window.QRCode && qrContainer) {
        qrContainer.innerHTML = ""; // clear previous
        var qrText = oData.origen + " | " + oData.lote + " | " + oData.serie;
        new QRCode(qrContainer, {
          text: qrText,
          width: 150,
          height: 150,
          colorDark : "#333333",
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
