sap.ui.define([
  "wm/light/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "wm/light/service/ApiService",
  "sap/m/Dialog",
  "sap/m/Button",
  "sap/m/Label",
  "sap/m/Input",
  "sap/ui/layout/form/SimpleForm"
], function (BaseController, JSONModel, Api, Dialog, Button, Label, Input, SimpleForm) {
  "use strict";

  return BaseController.extend("wm.light.controller.ConfigWarehouse", {

    onInit: function () {
      this.setModel(new JSONModel({ warehouses: [] }), "config");
      this._load();
    },

    _load: async function () {
      this.showBusy(true);
      try {
        var oData = await Api.getWarehouses();
        this.getModel("config").setProperty("/warehouses", oData.data || []);
      } catch (e) {
        if (e.message !== "SESSION_EXPIRED") {
          this.showError(e.message || "Error al cargar almacenes");
        }
      } finally {
        this.showBusy(false);
      }
    },

    onRefresh: function () {
      this._load();
    },

    onCreateWarehouse: function () {
      if (!this._oDialog) {
        var oView = this.getView();
        this._oDialog = new Dialog({
          title: "Nuevo Número de Almacén",
          contentWidth: "400px",
          content: new SimpleForm({
            layout: "ResponsiveGridLayout",
            editable: true,
            content: [
              new Label({ text: "Número de almacén", required: true }),
              new Input("inpWhId", { maxLength: 3, placeholder: "Ej. 001" }),
              new Label({ text: "Descripción", required: true }),
              new Input("inpWhDesc", { maxLength: 25, placeholder: "Descripción breve" })
            ]
          }),
          beginButton: new Button({
            type: "Emphasized",
            text: "Guardar",
            press: async function () {
              var oId = sap.ui.getCore().byId("inpWhId");
              var oDesc = sap.ui.getCore().byId("inpWhDesc");
              var sId = oId.getValue().trim();
              var sDesc = oDesc.getValue().trim();

              if (!sId || !sDesc) {
                this.showError("Completa todos los campos");
                return;
              }

              this.showBusy(true);
              try {
                // El ID en SAP WM a veces es de 3 letras, pero le ponemos prefijo WH internamente o lo dejamos tal cual.
                // Como pidieron char(3), lo dejaremos tal cual.
                await Api.createWarehouse({ id: sId.toUpperCase(), name: sDesc });
                this.showSuccess("Almacén guardado exitosamente");
                this._oDialog.close();
                this._load();
                oId.setValue("");
                oDesc.setValue("");
              } catch (e) {
                this.showError(e.message || "Error al guardar");
              } finally {
                this.showBusy(false);
              }
            }.bind(this)
          }),
          endButton: new Button({
            text: "Cancelar",
            press: function () { this._oDialog.close(); }.bind(this)
          })
        });
        oView.addDependent(this._oDialog);
      }
      this._oDialog.open();
    },

    onEditWarehouse: function () {
      this.showSuccess("Edición próximamente");
    }

  });
});
