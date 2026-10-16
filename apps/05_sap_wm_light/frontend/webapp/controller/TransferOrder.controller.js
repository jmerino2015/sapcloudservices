sap.ui.define([
  "wm/light/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/MessageBox",
  "wm/light/service/ApiService"
], function (BaseController, JSONModel, Filter, FilterOperator, MessageBox, Api) {
  "use strict";

  return BaseController.extend("wm.light.controller.TransferOrder", {

    onInit: function () {
      this.setModel(new JSONModel({ items: [], total: 0 }), "to");
      this._sCurrentFilter = "ALL";
      this._load();
    },

    _load: async function () {
      this.showBusy(true);
      try {
        var p = this._sCurrentFilter !== "ALL" ? { status: this._sCurrentFilter } : {};
        var oData = await Api.getTOs(p);
        this.getModel("to").setData({ items: oData.items || oData.data || [], total: oData.total || 0 });
      } catch (e) {
        if (e.message === "SESSION_EXPIRED") return;
        console.error("Error loading TOs:", e);
        this.showError("Error al cargar Órdenes de Traslado");
      } finally {
        this.showBusy(false);
      }
    },

    onFilterChange: function (oEvent) {
      this._sCurrentFilter = oEvent.getParameter("item").getKey();
      this._load();
    },

    onSearch: function (oEvent) {
      var sQuery = oEvent.getParameter("newValue") || oEvent.getParameter("query") || "";
      var oBinding = this.byId("toTable").getBinding("items");
      var aFilters = sQuery
        ? [new Filter({ filters: [
            new Filter("to_number", FilterOperator.Contains, sQuery),
            new Filter("to_type",   FilterOperator.Contains, sQuery)
          ], and: false })]
        : [];
      oBinding.filter(aFilters);
    },

    onRefresh: function () { this._load(); },

    onCreateTO: async function () {
      if (!this._oCreateTODialog) {
        var oView = this.getView();
        sap.ui.require(["sap/m/Dialog","sap/m/Button","sap/m/Label","sap/m/Input","sap/m/Select","sap/ui/core/Item","sap/ui/layout/form/SimpleForm","sap/ui/core/Title"], 
        function (Dialog, Button, Label, Input, Select, Item, SimpleForm, Title) {
          
          this._oCreateTODialog = new Dialog({
            title: "Crear orden de transporte: Imagen inicial",
            contentWidth: "800px",
            content: new SimpleForm({
              layout: "ResponsiveGridLayout",
              labelSpanXL: 4, labelSpanL: 4, labelSpanM: 4, labelSpanS: 4,
              emptySpanXL: 0, emptySpanL: 0, emptySpanM: 0, emptySpanS: 0,
              columnsXL: 2, columnsL: 2, columnsM: 1,
              content: [
                new Label({ text: "Número de almacén" }),
                new Select("selWh", {
                  forceSelection: false,
                  items: {
                    path: "wh>/warehouses",
                    template: new Item({ key: "{wh>id}", text: "{wh>id} - {wh>name}" })
                  }
                }),
                
                new Title({ text: "Datos de posición" }),
                new Label({ text: "Cl.movimiento" }),
                new Input({ required: true }),
                new Label({ text: "Material" }),
                new Input({ required: true }),
                
                new Label({ text: "Cantidad solicitada" }),
                new Input({ required: true }),
                new Label({ text: "Tipo un.almacén" }),
                new Input(),
                
                new Label({ text: "Centro/Almacén" }),
                new Input({ required: true }),
                
                new Label({ text: "Lote" }),
                new Input(),
                new Label({ text: "Stock especial" }),
                new Input()
              ]
            }),
            beginButton: new Button({
              type: "Emphasized",
              text: "Continuar",
              press: function () {
                this.showSuccess("Funcionalidad de grabación en desarrollo");
                this._oCreateTODialog.close();
              }.bind(this)
            }),
            endButton: new Button({
              text: "Cancelar",
              press: function () { this._oCreateTODialog.close(); }.bind(this)
            })
          });
          
          this._oCreateTODialog.setModel(new sap.ui.model.json.JSONModel({ warehouses: [] }), "wh");
          oView.addDependent(this._oCreateTODialog);
          
          this._oCreateTODialog.open();
          this._loadWarehouses();
        }.bind(this));
      } else {
        this._oCreateTODialog.open();
        this._loadWarehouses();
      }
    },

    _loadWarehouses: async function() {
      if (!this._oCreateTODialog) return;
      try {
        var r = await Api.getWarehouses();
        this._oCreateTODialog.getModel("wh").setProperty("/warehouses", r.data || []);
      } catch (e) {
        console.error("No se pudieron cargar los almacenes", e);
      }
    },

    onTODetail: function (oEvent) {
      var sId = oEvent.getSource().getBindingContext("to").getProperty("id");
      // TODO: Open detail panel
      this.showSuccess("Detalle TO: " + sId);
    },

    onStartTO: function (oEvent) {
      var oBtn = oEvent.getSource();
      var sId  = oBtn.data("id") || oBtn.getBindingContext("to").getProperty("id");
      MessageBox.confirm("¿Desea iniciar esta tarea (medición LMS)?", {
        onClose: async function (sAction) {
          if (sAction !== MessageBox.Action.OK) return;
          this.showBusy(true);
          try {
            var oResult = await Api.startTO(sId);
            this.showSuccess("Tarea " + oResult.data.to_number + " iniciada.");
            this._load();
          } catch (e) {
            this.showError(e.message);
          } finally {
            this.showBusy(false);
          }
        }.bind(this)
      });
    },

    onConfirmTO: function (oEvent) {
      var oBtn = oEvent.getSource();
      var sId  = oBtn.data("id") || oBtn.getBindingContext("to").getProperty("id");
      MessageBox.confirm(this.getText("msgConfirmDelete"), {
        onClose: async function (sAction) {
          if (sAction !== MessageBox.Action.OK) return;
          this.showBusy(true);
          try {
            var oResult = await Api.confirmTO(sId);
            this.showSuccess(this.getText("toConfirmSuccess", [oResult.data.to_number]));
            this._load();
          } catch (e) {
            this.showError(e.message);
          } finally {
            this.showBusy(false);
          }
        }.bind(this)
      });
    },

    onCancelTO: function (oEvent) {
      var oBtn = oEvent.getSource();
      var sId  = oBtn.data("id") || oBtn.getBindingContext("to").getProperty("id");
      MessageBox.warning(this.getText("msgConfirmCancel"), {
        onClose: async function (sAction) {
          if (sAction !== MessageBox.Action.OK) return;
          try {
            await Api.cancelTO(sId, "Cancelado por usuario");
            this.showSuccess(this.getText("toCancelSuccess", [sId]));
            this._load();
          } catch (e) {
            this.showError(e.message);
          }
        }.bind(this)
      });
    },

  });
});
