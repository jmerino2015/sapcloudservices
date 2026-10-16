sap.ui.define([
  "wm/light/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "wm/light/service/ApiService",
  "sap/ui/core/Fragment"
], function (BaseController, JSONModel, Filter, FilterOperator, Api, Fragment) {
  "use strict";

  return BaseController.extend("wm.light.controller.Locations", {

    onInit: function () {
      this.setModel(new JSONModel({ items: [], total: 0 }), "loc");
      this.setModel(new JSONModel({ items: [] }), "wh");
      this.setModel(new JSONModel({ types: [] }), "st");
      this.setModel(new JSONModel({}), "dlg");
      this._sWarehouse = "";
      this._loadWarehouses();
    },

    _loadWarehouses: async function () {
      this.showBusy(true);
      try {
        var oData = await Api.getWarehouses();
        var aWh = oData.data || [];
        this.getModel("wh").setData({ items: aWh });
        
        if (aWh.length > 0) {
          this._sWarehouse = aWh[0].id;
          this.byId("whSelect").setSelectedKey(this._sWarehouse);
          this._loadBins();
          this._loadStorageTypes();
        } else {
          this.showBusy(false);
        }
      } catch (e) {
        this.showBusy(false);
        if (e.message === "SESSION_EXPIRED") return;
        this.showError("Error al cargar almacenes");
      }
    },

    _loadBins: async function () {
      if (!this._sWarehouse) return;
      this.showBusy(true);
      try {
        var oData = await Api.getBins(this._sWarehouse);
        this.getModel("loc").setData({ items: oData.data || [], total: oData.total || 0 });
      } catch (e) {
        if (e.message === "SESSION_EXPIRED") return;
        this.showError("Error al cargar ubicaciones");
      } finally {
        this.showBusy(false);
      }
    },

    _loadStorageTypes: async function () {
      if (!this._sWarehouse) return;
      try {
        var oData = await Api.getStorageTypes(this._sWarehouse);
        this.getModel("st").setData({ types: oData.data || [] });
      } catch (e) {
        console.error("Error loading storage types", e);
      }
    },

    onWarehouseChange: function (oEvent) {
      this._sWarehouse = oEvent.getParameter("selectedItem").getKey();
      this._loadBins();
      this._loadStorageTypes();
    },

    onSearch: function (oEvent) {
      var sQuery = oEvent.getParameter("newValue") || oEvent.getParameter("query") || "";
      var oBinding = this.byId("locationsTable").getBinding("items");
      var aFilters = sQuery ? [new Filter({
        filters: [
          new Filter("bin_code", FilterOperator.Contains, sQuery),
          new Filter("bin_type", FilterOperator.Contains, sQuery)
        ],
        and: false
      })] : [];
      oBinding.filter(aFilters);
    },

    onRefresh: function () { 
      this._loadBins(); 
    },

    /* --- Bin Dialog (Create/Edit) --- */

    _openDialog: function (oData) {
      var oView = this.getView();
      this.getModel("dlg").setData(oData);

      if (!this._oDialog) {
        Fragment.load({
          id: oView.getId(),
          name: "wm.light.view.BinDialog",
          controller: this
        }).then(function (oDialog) {
          this._oDialog = oDialog;
          oView.addDependent(oDialog);
          oDialog.open();
        }.bind(this));
      } else {
        this._oDialog.open();
      }
    },

    onCreate: function () {
      if (!this._sWarehouse) {
        this.showError("Seleccione un almacén primero");
        return;
      }
      var aTypes = this.getModel("st").getProperty("/types") || [];
      var nTypeId = aTypes.length > 0 ? aTypes[0].id : null;
      var aSections = (aTypes.length > 0 && aTypes[0].sections) ? aTypes[0].sections : [];
      var nSecId = aSections.length > 0 ? aSections[0].id : null;

      this._openDialog({
        title: this.getText("locationsDialogTitleCreate"),
        isEdit: false,
        bin_code: "",
        bin_type: "STANDARD",
        storage_type_id: nTypeId,
        storage_section_id: nSecId,
        currentSections: aSections,
        max_weight: 0,
        max_volume: 0,
        status: "ACTIVE"
      });
    },

    onEdit: function (oEvent) {
      var oContext = oEvent.getSource().getBindingContext("loc");
      var oBin = Object.assign({}, oContext.getObject());
      
      var aTypes = this.getModel("st").getProperty("/types") || [];
      var oType = aTypes.find(function(t) { return t.id === oBin.storage_type_id; });
      var aSections = oType && oType.sections ? oType.sections : [];

      this._openDialog({
        title: this.getText("locationsDialogTitleEdit"),
        isEdit: true,
        id: oBin.id,
        bin_code: oBin.bin_code,
        bin_type: oBin.bin_type || "STANDARD",
        storage_type_id: oBin.storage_type_id,
        storage_section_id: oBin.storage_section_id,
        currentSections: aSections,
        max_weight: oBin.max_weight || 0,
        max_volume: oBin.max_volume || 0,
        status: oBin.status || "ACTIVE"
      });
    },

    onTypeChange: function(oEvent) {
      var sKey = parseInt(oEvent.getParameter("selectedItem").getKey(), 10);
      var aTypes = this.getModel("st").getProperty("/types") || [];
      var oType = aTypes.find(function(t) { return t.id === sKey; });
      if (oType && oType.sections && oType.sections.length > 0) {
        this.getModel("dlg").setProperty("/currentSections", oType.sections);
        this.getModel("dlg").setProperty("/storage_section_id", oType.sections[0].id);
      } else {
        this.getModel("dlg").setProperty("/currentSections", []);
        this.getModel("dlg").setProperty("/storage_section_id", null);
      }
    },

    onSaveBin: async function () {
      var oData = this.getModel("dlg").getData();
      
      if (!oData.bin_code || !oData.storage_type_id || !oData.storage_section_id) {
        this.showError("Complete todos los campos obligatorios");
        return;
      }

      var payload = {
        bin_code: oData.bin_code,
        bin_type: oData.bin_type,
        storage_type_id: parseInt(oData.storage_type_id, 10),
        storage_section_id: parseInt(oData.storage_section_id, 10),
        max_weight: parseFloat(oData.max_weight) || null,
        max_volume: parseFloat(oData.max_volume) || null,
        status: oData.status
      };

      this._oDialog.setBusy(true);
      try {
        if (oData.isEdit) {
          await Api.updateBin(this._sWarehouse, oData.id, payload);
          this.showSuccess("Ubicación actualizada correctamente");
        } else {
          await Api.createBin(this._sWarehouse, payload);
          this.showSuccess("Ubicación creada correctamente");
        }
        this._oDialog.close();
        this._loadBins();
      } catch (e) {
        this.showError(e.message || "Error al guardar ubicación");
      } finally {
        this._oDialog.setBusy(false);
      }
    },

    onCancelBin: function () {
      if (this._oDialog) {
        this._oDialog.close();
      }
    }

  });
});
