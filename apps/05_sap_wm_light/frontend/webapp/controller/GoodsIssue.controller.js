sap.ui.define([
  "wm/light/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/MessageBox",
  "wm/light/service/ApiService"
], function (BaseController, JSONModel, Filter, FilterOperator, MessageBox, Api) {
  "use strict";

  return BaseController.extend("wm.light.controller.GoodsIssue", {
    onInit: function () {
      this.setModel(new JSONModel({ items: [], total: 0 }), "gi");
      this.setModel(new JSONModel({ items: [] }), "materials");
      this.setModel(new JSONModel({ items: [] }), "materialStock");
      this._load();
      this._loadMaterials();
    },

    _load: async function () {
      this.showBusy(true);
      try {
        var oData = await Api.getGIs();
        this.getModel("gi").setData({ items: oData.items || oData.data || [], total: oData.total || 0 });
      } catch (e) {
        if (e.message === "SESSION_EXPIRED") return;
        this.showError("Error al cargar Salidas de Mercancía");
      } finally {
        this.showBusy(false);
      }
    },

    _loadMaterials: async function () {
      try {
        var res = await Api.getMaterials({ limit: 100 });
        this.getModel("materials").setProperty("/items", res.data || []);
      } catch (e) {
        console.error("Error loading materials:", e);
      }
    },

    onSearch: function (oEvent) {
      var sQ = oEvent.getParameter("newValue") || oEvent.getParameter("query") || "";
      this.byId("giTable").getBinding("items").filter(sQ
        ? [new Filter({
            filters: [
              new Filter("gi_number", FilterOperator.Contains, sQ),
              new Filter("customer_name", FilterOperator.Contains, sQ),
              new Filter("sap_so_number", FilterOperator.Contains, sQ)
            ],
            and: false
          })]
        : []);
    },

    onRefresh: function () {
      this._load();
    },

    onCreateGI: function () {
      this.setModel(new JSONModel({
        issue_type: "SO",
        sap_so_number: "",
        customer_name: "",
        delivery_number: "",
        picking_strategy: "FEFO",
        notes: "",
        items: []
      }), "giCreate");
      
      this.getModel("materialStock").setProperty("/items", []);

      if (!this._oGiDlg) {
        sap.ui.core.Fragment.load({
          id: this.getView().getId(),
          name: "wm.light.view.fragment.GiCreateDialog",
          controller: this
        }).then(function (oDialog) {
          this._oGiDlg = oDialog;
          this.getView().addDependent(oDialog);
          this._oGiDlg.open();
        }.bind(this));
      } else {
        // Reset dialog fields
        var cb = this.byId("cbGiMaterial");
        if (cb) cb.setSelectedKey("");
        var qty = this.byId("inputGiQty");
        if (qty) qty.setValue("");
        this._oGiDlg.open();
      }
    },

    onIssueTypeChange: function (oEvent) {
      var sKey = oEvent.getParameter("item").getKey();
      var lblRefDoc = this.byId("lblGiRefDoc");
      var lblCustomerDest = this.byId("lblGiCustomerDest");
      
      // Update labels based on output type context
      if (sKey === "SO") {
        if (lblRefDoc) lblRefDoc.setText("Pedido de Venta");
        if (lblCustomerDest) lblCustomerDest.setText("Cliente");
      } else if (sKey === "TRANSFER") {
        if (lblRefDoc) lblRefDoc.setText("Documento de Traslado");
        if (lblCustomerDest) lblCustomerDest.setText("Almacén Destino");
      } else if (sKey === "SUBCONTRACTING") {
        if (lblRefDoc) lblRefDoc.setText("Orden de Maquila");
        if (lblCustomerDest) lblCustomerDest.setText("Maquiladora / Destino");
      }
    },

    onMaterialChange: async function () {
      var cb = this.byId("cbGiMaterial");
      if (!cb) return;
      var sMatId = cb.getSelectedKey();
      if (!sMatId) {
        this.getModel("materialStock").setProperty("/items", []);
        return;
      }
      
      var aMaterials = this.getModel("materials").getProperty("/items") || [];
      var oSelectedMat = aMaterials.find(m => String(m.id) === String(sMatId));
      if (!oSelectedMat) return;
      
      this.showBusy(true);
      try {
        var res = await Api.getStock({ material: oSelectedMat.sap_code });
        this.getModel("materialStock").setProperty("/items", res.data || []);
      } catch (e) {
        console.error("Error loading stock for material:", e);
      } finally {
        this.showBusy(false);
      }
    },

    onCloseGI: function () {
      if (this._oGiDlg) this._oGiDlg.close();
    },

    onAddItem: function () {
      var cb = this.byId("cbGiMaterial");
      var inputQty = this.byId("inputGiQty");
      
      if (!cb || !inputQty) return;
      
      var sMatId = cb.getSelectedKey();
      var sQtyVal = inputQty.getValue();
      
      if (!sMatId) {
        return this.showError("Seleccione un material");
      }
      if (!sQtyVal || parseFloat(sQtyVal) <= 0) {
        return this.showError("Ingrese una cantidad válida mayor a 0");
      }
      
      var aMaterials = this.getModel("materials").getProperty("/items") || [];
      var oSelectedMat = aMaterials.find(m => String(m.id) === String(sMatId));
      if (!oSelectedMat) return;
      
      // Calculate total available stock in warehouse
      var aStock = this.getModel("materialStock").getProperty("/items") || [];
      var nTotalStock = aStock.reduce((acc, s) => acc + parseFloat(s.quantity || 0), 0);
      
      if (parseFloat(sQtyVal) > nTotalStock) {
        return this.showError("La cantidad solicitada supera el stock disponible en almacén (" + nTotalStock + " " + oSelectedMat.base_unit + ")");
      }
      
      var oGiCreateModel = this.getModel("giCreate");
      var aItems = oGiCreateModel.getProperty("/items") || [];
      
      // Check if material already added
      var bExists = aItems.some(item => String(item.material_id) === String(sMatId));
      if (bExists) {
        return this.showError("El material ya está en la lista de despacho");
      }
      
      aItems.push({
        material_id: oSelectedMat.id,
        material_desc: oSelectedMat.sap_code + " - " + oSelectedMat.description,
        requested_qty: parseFloat(sQtyVal),
        unit: oSelectedMat.base_unit || "EA"
      });
      
      oGiCreateModel.setProperty("/items", aItems);
      
      // Reset inputs
      cb.setSelectedKey("");
      inputQty.setValue("");
      this.getModel("materialStock").setProperty("/items", []);
    },

    onRemoveItem: function (oEvent) {
      var oContext = oEvent.getSource().getBindingContext("giCreate");
      var sPath = oContext.getPath();
      var idx = parseInt(sPath.substring(sPath.lastIndexOf("/") + 1));
      
      var oGiCreateModel = this.getModel("giCreate");
      var aItems = oGiCreateModel.getProperty("/items") || [];
      aItems.splice(idx, 1);
      oGiCreateModel.setProperty("/items", aItems);
    },

    onSaveGI: async function () {
      var oData = this.getModel("giCreate").getData();
      
      if (!oData.sap_so_number) {
        return this.showError("Ingrese la referencia del documento");
      }
      if (!oData.customer_name) {
        var sType = oData.issue_type === "SO" ? "cliente" : oData.issue_type === "TRANSFER" ? "almacén de destino" : "maquiladora/destino";
        return this.showError("Ingrese el/la " + sType);
      }
      if (!oData.delivery_number) {
        return this.showError("Ingrese el número de entrega o despacho");
      }
      if (!oData.items || oData.items.length === 0) {
        return this.showError("Debe agregar al menos un material a despachar");
      }
      
      // Prepare payload
      var payload = {
        warehouse_id: "WH001",
        sap_so_number: oData.sap_so_number,
        issue_type: oData.issue_type,
        customer_name: oData.customer_name,
        delivery_number: oData.delivery_number,
        picking_strategy: oData.picking_strategy,
        notes: oData.notes,
        items: oData.items.map(item => ({
          material_id: item.material_id,
          requested_qty: item.requested_qty,
          unit: item.unit
        }))
      };
      
      this.showBusy(true);
      try {
        await Api.createGI(payload);
        this.showSuccess("Salida de mercancías registrada exitosamente");
        this.onCloseGI();
        this._load();
      } catch (e) {
        this.showError(e.message || "Error al registrar la salida de mercancías");
      } finally {
        this.showBusy(false);
      }
    },

    onConfirmGI: function (oEvent) {
      var sId = oEvent.getSource().getBindingContext("gi").getProperty("id");
      var sGiNum = oEvent.getSource().getBindingContext("gi").getProperty("gi_number");
      
      MessageBox.confirm("¿Confirmar despacho y picking para " + sGiNum + "? Esto descontará el stock físico y creará la Orden de Traslado (TO) de picking automática.", {
        title: "Confirmar Despacho",
        onClose: async function (a) {
          if (a !== MessageBox.Action.OK) return;
          this.showBusy(true);
          try {
            var r = await Api.confirmGI(sId);
            this.showSuccess("Salida confirmada. Se generó y confirmó la Orden de Traslado " + (r.toGenerated || ""));
            this._load();
          } catch (e) {
            this.showError(e.message);
          } finally {
            this.showBusy(false);
          }
        }.bind(this)
      });
    }
  });
});
