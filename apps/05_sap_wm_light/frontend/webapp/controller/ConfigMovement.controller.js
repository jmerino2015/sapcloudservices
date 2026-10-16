sap.ui.define([
  "wm/light/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "wm/light/service/ApiService",
  "sap/m/Dialog",
  "sap/m/Button",
  "sap/m/Label",
  "sap/m/Input",
  "sap/m/Select",
  "sap/ui/core/Item",
  "sap/ui/layout/form/SimpleForm"
], function (BaseController, JSONModel, Api, Dialog, Button, Label, Input, Select, Item, SimpleForm) {
  "use strict";

  return BaseController.extend("wm.light.controller.ConfigMovement", {

    onInit: function () {
      this.setModel(new JSONModel({ movements: [] }), "configMove");
      this._load();
    },

    _load: async function () {
      this.showBusy(true);
      try {
        var oData = await Api.getMovementTypes();
        this.getModel("configMove").setProperty("/movements", oData.data || []);
      } catch (e) {
        if (e.message !== "SESSION_EXPIRED") {
          this.showError(e.message || "Error al cargar clases de movimiento");
        }
      } finally {
        this.showBusy(false);
      }
    },

    onNewMovement: function () {
      if (!this._oDialog) {
        var oView = this.getView();
        this._oDialog = new Dialog({
          title: "Nueva Clase de Movimiento",
          contentWidth: "400px",
          content: new SimpleForm({
            layout: "ResponsiveGridLayout",
            editable: true,
            content: [
              new Label({ text: "Clase (ID)", required: true }),
              new Input("inpMovId", { maxLength: 3, placeholder: "Ej. 101" }),
              new Label({ text: "Descripción", required: true }),
              new Input("inpMovDesc", { maxLength: 100, placeholder: "Descripción breve" }),
              new Label({ text: "Tipo", required: true }),
              new Select("selMovType", {
                items: [
                  new Item({ key: "Inbound", text: "Entrada (Inbound)" }),
                  new Item({ key: "Outbound", text: "Salida (Outbound)" }),
                  new Item({ key: "Internal", text: "Traslado (Internal)" })
                ]
              })
            ]
          }),
          beginButton: new Button({
            type: "Emphasized",
            text: "Guardar",
            press: async function () {
              var oId = sap.ui.getCore().byId("inpMovId");
              var oDesc = sap.ui.getCore().byId("inpMovDesc");
              var oType = sap.ui.getCore().byId("selMovType");
              
              var sId = oId.getValue().trim();
              var sDesc = oDesc.getValue().trim();
              var sType = oType.getSelectedKey();

              if (!sId || !sDesc) {
                this.showError("Completa todos los campos");
                return;
              }

              // Determine visual state based on type
              var sState = "Information";
              if (sType === "Inbound") sState = "Success";
              else if (sType === "Outbound") sState = "Warning";

              this.showBusy(true);
              try {
                await Api.createMovementType({ id: sId, description: sDesc, type: sType, state: sState });
                this.showSuccess("Clase de movimiento guardada");
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

    onEditMovement: function () {
      this.showSuccess("Edición próximamente");
    }

  });
});
