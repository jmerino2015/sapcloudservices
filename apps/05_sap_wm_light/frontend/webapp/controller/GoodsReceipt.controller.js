sap.ui.define([
  "wm/light/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/MessageBox",
  "wm/light/service/ApiService"
], function (BaseController, JSONModel, Filter, FilterOperator, MessageBox, Api) {
  "use strict";

  return BaseController.extend("wm.light.controller.GoodsReceipt", {
    onInit: function () {
      this.setModel(new JSONModel({ items: [], total: 0 }), "gr");
      this.setModel(new JSONModel({ items: [] }), "materials");
      this._load();
      this._loadMaterials();
    },

    _load: async function () {
      this.showBusy(true);
      try {
        var oData = await Api.getGRs();
        this.getModel("gr").setData({ items: oData.items || oData.data || [], total: oData.total || 0 });
      } catch (e) {
        if (e.message === "SESSION_EXPIRED") return;
        this.showError("Error al cargar Entradas de Mercancía");
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
      this.byId("grTable").getBinding("items").filter(sQ
        ? [new Filter({
            filters: [
              new Filter("gr_number", FilterOperator.Contains, sQ),
              new Filter("vendor_name", FilterOperator.Contains, sQ),
              new Filter("sap_po_number", FilterOperator.Contains, sQ)
            ],
            and: false
          })]
        : []);
    },

    onRefresh: function () {
      this._load();
    },

    onCreateGR: function () {
      this.setModel(new JSONModel({
        receipt_type: "PO",
        sap_po_number: "",
        vendor_name: "",
        delivery_note: "",
        putaway_strategy: "FEFO",
        notes: "",
        items: []
      }), "grCreate");

      if (!this._oGrDlg) {
        sap.ui.core.Fragment.load({
          id: this.getView().getId(),
          name: "wm.light.view.fragment.GrCreateDialog",
          controller: this
        }).then(function (oDialog) {
          this._oGrDlg = oDialog;
          this.getView().addDependent(oDialog);
          this._oGrDlg.open();
        }.bind(this));
      } else {
        // Reset dialog fields
        var cb = this.byId("cbMaterial");
        if (cb) cb.setSelectedKey("");
        var qty = this.byId("inputQty");
        if (qty) qty.setValue("");
        this._oGrDlg.open();
      }
    },

    onReceiptTypeChange: function (oEvent) {
      var sKey = oEvent.getParameter("item").getKey();
      var lblRefDoc = this.byId("lblRefDoc");
      var lblVendorOrigin = this.byId("lblVendorOrigin");
      
      // Update label texts dynamically for type-specific contexts
      if (sKey === "PO") {
        if (lblRefDoc) lblRefDoc.setText("Pedido de Compra (PO)");
        if (lblVendorOrigin) lblVendorOrigin.setText("Proveedor");
      } else if (sKey === "TRANSFER") {
        if (lblRefDoc) lblRefDoc.setText("Documento de Traslado");
        if (lblVendorOrigin) lblVendorOrigin.setText("Almacén Origen");
      } else if (sKey === "PRODUCTION") {
        if (lblRefDoc) lblRefDoc.setText("Orden de Producción");
        if (lblVendorOrigin) lblVendorOrigin.setText("Línea/Área Origen");
      }
    },

    onCloseGR: function () {
      if (this._oGrDlg) this._oGrDlg.close();
    },

    onAddItem: function () {
      var cb = this.byId("cbMaterial");
      var inputQty = this.byId("inputQty");
      
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
      
      var oGrCreateModel = this.getModel("grCreate");
      var aItems = oGrCreateModel.getProperty("/items") || [];
      
      // Check if material already added to list
      var bExists = aItems.some(item => String(item.material_id) === String(sMatId));
      if (bExists) {
        return this.showError("El material ya está en la lista de recepción");
      }
      
      aItems.push({
        material_id: oSelectedMat.id,
        material_desc: oSelectedMat.sap_code + " - " + oSelectedMat.description,
        planned_qty: parseFloat(sQtyVal),
        unit: oSelectedMat.base_unit || "EA"
      });
      
      oGrCreateModel.setProperty("/items", aItems);
      
      // Clean inputs
      cb.setSelectedKey("");
      inputQty.setValue("");
    },

    onRemoveItem: function (oEvent) {
      var oContext = oEvent.getSource().getBindingContext("grCreate");
      var sPath = oContext.getPath();
      var idx = parseInt(sPath.substring(sPath.lastIndexOf("/") + 1));
      
      var oGrCreateModel = this.getModel("grCreate");
      var aItems = oGrCreateModel.getProperty("/items") || [];
      aItems.splice(idx, 1);
      oGrCreateModel.setProperty("/items", aItems);
    },

    onSaveGR: async function () {
      var oData = this.getModel("grCreate").getData();
      
      if (!oData.sap_po_number) {
        return this.showError("Ingrese la referencia del documento");
      }
      if (!oData.vendor_name) {
        var sType = oData.receipt_type === "PO" ? "proveedor" : oData.receipt_type === "TRANSFER" ? "almacén de origen" : "área de producción";
        return this.showError("Ingrese el/la " + sType);
      }
      if (!oData.delivery_note) {
        return this.showError("Ingrese el número de guía o nota de entrega");
      }
      if (!oData.items || oData.items.length === 0) {
        return this.showError("Debe agregar al menos un material a recibir");
      }
      
      // Prepare payload
      var payload = {
        warehouse_id: "WH001", // Default warehouse
        sap_po_number: oData.sap_po_number,
        receipt_type: oData.receipt_type,
        vendor_name: oData.vendor_name,
        delivery_note: oData.delivery_note,
        putaway_strategy: oData.putaway_strategy,
        notes: oData.notes,
        items: oData.items.map(item => ({
          material_id: item.material_id,
          planned_qty: item.planned_qty,
          received_qty: item.planned_qty,
          unit: item.unit
        }))
      };
      
      this.showBusy(true);
      try {
        await Api.createGR(payload);
        this.showSuccess("Entrada de mercancías registrada exitosamente");
        this.onCloseGR();
        this._load();
      } catch (e) {
        this.showError(e.message || "Error al registrar la entrada de mercancías");
      } finally {
        this.showBusy(false);
      }
    },

    onConfirmGR: function (oEvent) {
      var sId = oEvent.getSource().getBindingContext("gr").getProperty("id");
      var sGrNum = oEvent.getSource().getBindingContext("gr").getProperty("gr_number");
      MessageBox.confirm("¿Confirmar recepción de mercancías para " + sGrNum + "? Esto registrará el stock y generará la Orden de Traslado (TO) de putaway automática.", {
        title: "Confirmar Ingreso",
        onClose: async function (a) {
          if (a !== MessageBox.Action.OK) return;
          this.showBusy(true);
          try {
            var r = await Api.confirmGR(sId);
            this.showSuccess("Ingreso confirmado. Se generó la Orden de Traslado (TO) " + (r.toGenerated || ""));
            this._load();
          } catch (e) {
            this.showError(e.message);
          } finally {
            this.showBusy(false);
          }
        }.bind(this)
      });
    },

    onCancelGR: async function (oEvent) {
      var sId = oEvent.getSource().getBindingContext("gr").getProperty("id");
      var sGrNum = oEvent.getSource().getBindingContext("gr").getProperty("gr_number");
      MessageBox.confirm("¿Está seguro de cancelar la recepción " + sGrNum + "?", {
        title: "Cancelar Recepción",
        onClose: async function (a) {
          if (a !== MessageBox.Action.OK) return;
          this.showBusy(true);
          try {
            await Api.cancelGR(sId);
            this.showSuccess("Recepción cancelada exitosamente");
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
