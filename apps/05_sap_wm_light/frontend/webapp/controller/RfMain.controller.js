sap.ui.define([
  "wm/light/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "wm/light/service/ApiService"
], function (BaseController, JSONModel, Api) {
  "use strict";

  return BaseController.extend("wm.light.controller.RfMain", {
    onInit: function () {
      var oData = {
        state: "LM01", // LM01, SCAN_OT, CONFIRM_OT, SUCCESS, SCAN_DELIVERY, INTERNAL_TRANSFER
        title: "LM01 - Menú",
        subTitle: "Confirmar Orden Transp.",
        time: this._getTime(),
        menuInput: "",
        otInput: "",
        destInput: "",
        deliveryInput: "",
        internalSrc: "",
        internalMat: "",
        internalDest: "",
        message: "",
        currentOt: null,
        // Demo DB
        demoOts: {
          "1000234": { id: "1000234", material: "MAT-998822", qty: 50, uom: "PZ", srcBin: "A-01-01", destBin: "B-05-12" },
          "1000235": { id: "1000235", material: "MAT-112233", qty: 10, uom: "CJ", srcBin: "C-10-02", destBin: "D-01-01" },
          "DEL-8000123": { id: "8000123", material: "MAT-556677", qty: 100, uom: "PZ", srcBin: "P-01-01", destBin: "MUELLE-1" }
        }
      };
      
      var oModel = new JSONModel(oData);
      this.getView().setModel(oModel, "rfModel");

      // Update time every minute
      setInterval(function() {
        if(this.getView() && this.getView().getModel("rfModel")) {
          this.getView().getModel("rfModel").setProperty("/time", this._getTime());
        }
      }.bind(this), 60000);
    },

    _getTime: function() {
      var d = new Date();
      return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
    },

    onMenuLiveChange: function(oEvent) {
      // Auto submit removed to allow 2 digit input
    },

    onMenuSubmit: function() {
      var oModel = this.getView().getModel("rfModel");
      var opt = oModel.getProperty("/menuInput");
      
      oModel.setProperty("/message", "");
      oModel.setProperty("/menuInput", "");

      if (opt === "01" || opt === "1") {
        // System Guided - Auto loads an OT
        oModel.setProperty("/currentOt", oModel.getProperty("/demoOts/1000234"));
        oModel.setProperty("/state", "CONFIRM_OT");
        oModel.setProperty("/title", "System Guided");
      } 
      else if (opt === "02" || opt === "2" || opt === "03" || opt === "3") {
        // Manual / Inbound
        oModel.setProperty("/state", "SCAN_OT");
        oModel.setProperty("/title", opt === "03" || opt === "3" ? "Inbound Process" : "Manual Selection");
        oModel.setProperty("/subTitle", "Escanear OT (Ej: 1000234)");
      }
      else if (opt === "04" || opt === "4") {
        // Outbound
        oModel.setProperty("/state", "SCAN_DELIVERY");
        oModel.setProperty("/title", "Outbound Process");
      }
      else if (opt === "05" || opt === "5") {
        // Internal
        oModel.setProperty("/state", "INTERNAL_TRANSFER");
        oModel.setProperty("/title", "Internal Process");
        oModel.setProperty("/internalSrc", "");
        oModel.setProperty("/internalMat", "");
        oModel.setProperty("/internalDest", "");
      }
      else if (opt === "06" || opt === "6") {
        // Inventarios
        oModel.setProperty("/state", "INVENTARIO_LIST");
        oModel.setProperty("/title", "Inventario Físico");
        this._loadActiveInventories();
      }
    },

    onMenuItemPress: function(oEvent) {
      var sText = oEvent.getSource().getText();
      var sCode = sText.substring(0, 2);
      var oModel = this.getView().getModel("rfModel");
      oModel.setProperty("/menuInput", sCode);
      this.onMenuSubmit();
    },

    onOtSubmit: function() {
      var oModel = this.getView().getModel("rfModel");
      var otNumber = oModel.getProperty("/otInput");
      var db = oModel.getProperty("/demoOts");
      
      if (db[otNumber]) {
        oModel.setProperty("/currentOt", db[otNumber]);
        oModel.setProperty("/state", "CONFIRM_OT");
        oModel.setProperty("/message", "");
        oModel.setProperty("/otInput", "");
      } else {
        oModel.setProperty("/message", "OT no encontrada.");
      }
    },

    onDestSubmit: function() {
      var oModel = this.getView().getModel("rfModel");
      var dest = oModel.getProperty("/destInput");
      var current = oModel.getProperty("/currentOt");

      if (dest === current.destBin) {
        // Success
        oModel.setProperty("/state", "SUCCESS");
        oModel.setProperty("/message", "");
        oModel.setProperty("/destInput", "");
        
        setTimeout(function() {
          this.onF1Press(); // Go back to scan after 2 seconds
        }.bind(this), 2000);
      } else {
        oModel.setProperty("/message", "Ubic. Destino incorrecta.");
      }
    },

    onDeliverySubmit: function() {
      var oModel = this.getView().getModel("rfModel");
      var delivery = oModel.getProperty("/deliveryInput");
      var db = oModel.getProperty("/demoOts");
      var key = "DEL-" + delivery;

      if (db[key]) {
        oModel.setProperty("/currentOt", db[key]);
        oModel.setProperty("/state", "CONFIRM_OT");
        oModel.setProperty("/message", "");
        oModel.setProperty("/deliveryInput", "");
      } else {
        oModel.setProperty("/message", "Entrega no encontrada.");
      }
    },

    onInternalSubmit: function() {
      var oModel = this.getView().getModel("rfModel");
      var src = oModel.getProperty("/internalSrc");
      var mat = oModel.getProperty("/internalMat");
      var dest = oModel.getProperty("/internalDest");

      if (src && mat && dest) {
        oModel.setProperty("/state", "SUCCESS");
        oModel.setProperty("/message", "");
        
        setTimeout(function() {
          this.onF1Press(); // Go back to menu
        }.bind(this), 2000);
      } else {
        oModel.setProperty("/message", "Llene todos los campos.");
      }
    },

    _loadActiveInventories: async function() {
      var oModel = this.getView().getModel("rfModel");
      oModel.setProperty("/message", "");
      this.showBusy(true);
      try {
        var res = await Api.getInventoryCounts();
        // Filtrar documentos que no estén cerrados (ej: PLANNED, ACTIVE, IN_PROGRESS, COUNTED)
        var list = (res.data || []).filter(function(doc) {
          return doc.status !== 'CLEARED_IM' && doc.status !== 'CLEARED_WM';
        });
        oModel.setProperty("/inventories", list);
      } catch(e) {
        oModel.setProperty("/message", "Error al cargar inventarios: " + e.message);
      } finally {
        this.showBusy(false);
      }
    },

    onRefreshInventories: function() {
      this._loadActiveInventories();
    },

    onSelectInventory: async function(oEvent) {
      var oItem = oEvent.getSource().getBindingContext("rfModel").getObject();
      var oModel = this.getView().getModel("rfModel");
      
      oModel.setProperty("/message", "");
      this.showBusy(true);
      try {
        if (oItem.status === 'PLANNED') {
          // Activar primero
          await Api.activateInventory(oItem.id);
        }
        await this._loadInventoryDetails(oItem.id);
      } catch(e) {
        oModel.setProperty("/message", "Error: " + e.message);
        this.showBusy(false);
      }
    },

    _loadInventoryDetails: async function(id) {
      var oModel = this.getView().getModel("rfModel");
      try {
        var res = await Api.getInventoryCount(id);
        var doc = res.data;
        oModel.setProperty("/activeDoc", doc);

        // Encontrar primer bin pendiente
        var nextBin = null;
        var nextBinIndex = -1;
        
        if (doc && doc.bins) {
          for (var i = 0; i < doc.bins.length; i++) {
            if (doc.bins[i].status === 'PENDING') {
              nextBin = doc.bins[i];
              nextBinIndex = i + 1;
              break;
            }
          }
        }

        if (nextBin) {
          oModel.setProperty("/currentBin", nextBin);
          oModel.setProperty("/activeBinIndex", nextBinIndex);
          oModel.setProperty("/state", "INVENTARIO_COUNT");
        } else {
          // Todos contados
          this.showSuccess("Documento completado.");
          oModel.setProperty("/state", "INVENTARIO_LIST");
          oModel.setProperty("/title", "Inventario Físico");
          this._loadActiveInventories();
        }
      } catch(e) {
        oModel.setProperty("/message", "Error cargando detalle: " + e.message);
      } finally {
        this.showBusy(false);
      }
    },

    onConfirmBinCount: function() {
      var oModel = this.getView().getModel("rfModel");
      var activeDoc = oModel.getProperty("/activeDoc");
      var currentBin = oModel.getProperty("/currentBin");
      
      var items = currentBin.items || [];
      
      // Validar que se hayan ingresado cantidades
      var missing = false;
      var counts = items.map(function(item) {
        if (item.counted_qty === undefined || item.counted_qty === null || item.counted_qty === "") {
          missing = true;
        }
        return {
          id: item.id,
          counted_qty: parseFloat(item.counted_qty || 0)
        };
      });

      if (missing) {
        oModel.setProperty("/message", "Por favor ingrese cantidad.");
        return;
      }

      oModel.setProperty("/message", "");
      this.showBusy(true);
      
      Api.submitInventoryCount(activeDoc.id, { counts: [{
        inventory_count_bin_id: currentBin.id,
        items: counts
      }]})
      .then(function() {
        this.showSuccess("Conteo registrado.");
        this._loadInventoryDetails(activeDoc.id);
      }.bind(this))
      .catch(function(err) {
        oModel.setProperty("/message", "Error: " + err.message);
        this.showBusy(false);
      }.bind(this));
    },

    onConfirmEmptyBin: function() {
      var oModel = this.getView().getModel("rfModel");
      var activeDoc = oModel.getProperty("/activeDoc");
      var currentBin = oModel.getProperty("/currentBin");

      oModel.setProperty("/message", "");
      this.showBusy(true);

      Api.submitInventoryCount(activeDoc.id, { counts: [{
        inventory_count_bin_id: currentBin.id,
        items: []
      }]})
      .then(function() {
        this.showSuccess("Bin confirmado vacío.");
        this._loadInventoryDetails(activeDoc.id);
      }.bind(this))
      .catch(function(err) {
        oModel.setProperty("/message", "Error: " + err.message);
        this.showBusy(false);
      }.bind(this));
    },

    onBackToInvList: function() {
      var oModel = this.getView().getModel("rfModel");
      oModel.setProperty("/state", "INVENTARIO_LIST");
      oModel.setProperty("/title", "Inventario Físico");
      this._loadActiveInventories();
    },

    onF1Press: function() {
      var oModel = this.getView().getModel("rfModel");
      var state = oModel.getProperty("/state");
      oModel.setProperty("/message", "");
      
      if (state === "SUCCESS" || state === "SCAN_OT" || state === "SCAN_DELIVERY" || state === "INTERNAL_TRANSFER" || state === "INVENTARIO_LIST") {
        oModel.setProperty("/state", "LM01");
        oModel.setProperty("/title", "LM01 - Menú");
      } else if (state === "INVENTARIO_COUNT") {
        oModel.setProperty("/state", "INVENTARIO_LIST");
        oModel.setProperty("/title", "Inventario Físico");
        this._loadActiveInventories();
      } else if (state === "CONFIRM_OT") {
        var prevTitle = oModel.getProperty("/title");
        if (prevTitle === "Outbound Process") {
          oModel.setProperty("/state", "SCAN_DELIVERY");
        } else if (prevTitle === "System Guided") {
          oModel.setProperty("/state", "LM01");
          oModel.setProperty("/title", "LM01 - Menú");
        } else {
          oModel.setProperty("/state", "SCAN_OT");
        }
      }
    },

    onF4Press: function() {
      var state = this.getView().getModel("rfModel").getProperty("/state");
      if(state === "CONFIRM_OT") {
        this.onDestSubmit();
      } else if (state === "INTERNAL_TRANSFER") {
        this.onInternalSubmit();
      } else if (state === "INVENTARIO_COUNT") {
        this.onConfirmBinCount();
      }
    },

    onEnterPress: function() {
      var state = this.getView().getModel("rfModel").getProperty("/state");
      if (state === "LM01") this.onMenuSubmit();
      else if (state === "SCAN_OT") this.onOtSubmit();
      else if (state === "SCAN_DELIVERY") this.onDeliverySubmit();
      else if (state === "CONFIRM_OT") this.onDestSubmit();
      else if (state === "INTERNAL_TRANSFER") this.onInternalSubmit();
      else if (state === "INVENTARIO_COUNT") this.onConfirmBinCount();
    },

    onClearPress: function() {
      var oModel = this.getView().getModel("rfModel");
      var state = oModel.getProperty("/state");
      if (state === "LM01") oModel.setProperty("/menuInput", "");
      else if (state === "SCAN_OT") oModel.setProperty("/otInput", "");
      else if (state === "SCAN_DELIVERY") oModel.setProperty("/deliveryInput", "");
      else if (state === "CONFIRM_OT") oModel.setProperty("/destInput", "");
      else if (state === "INTERNAL_TRANSFER") {
        oModel.setProperty("/internalSrc", "");
        oModel.setProperty("/internalMat", "");
        oModel.setProperty("/internalDest", "");
      } else if (state === "INVENTARIO_COUNT") {
        var currentBin = oModel.getProperty("/currentBin");
        if (currentBin && currentBin.items) {
          currentBin.items.forEach(function(item) {
            item.counted_qty = "";
          });
          oModel.setProperty("/currentBin", currentBin);
        }
      }
    }
  });
});
