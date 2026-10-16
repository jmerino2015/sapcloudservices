sap.ui.define([
  "wm/light/controller/BaseController","sap/ui/model/json/JSONModel",
  "wm/light/service/ApiService"
], function (BaseController, JSONModel, Api) {
  "use strict";
  return BaseController.extend("wm.light.controller.Admin", {
    onInit: function () {
      this.setModel(new JSONModel({
        users: [], syncLogs: [],
        sapStatusText: "Verificando conexión…",
        sapStatusType: "Information"
      }), "admin");
      this._load();
    },
    _load: async function () {
      this.showBusy(true);
      try {
        var [users, logs, status] = await Promise.all([
          Api.getUsers().then(function(r){ return r.data || []; }).catch(function(){ return []; }),
          fetch("/api/sap/sync/log", { headers:{ Authorization:"Bearer "+sessionStorage.getItem("wm_token")} })
            .then(function(r){ return r.ok ? r.json() : { data:[] }; }).then(function(d){ return d.data||[]; }).catch(function(){ return []; }),
          Api.getSapStatus().catch(function(){ return { connected:false, error:"Sin conexión" }; })
        ]);
        var oModel = this.getModel("admin");
        oModel.setProperty("/users",    users);
        oModel.setProperty("/syncLogs", logs);
        oModel.setProperty("/sapStatusText",  status.connected
          ? "SAP conectado · Latencia: " + (status.latency||0) + "ms · Última sync: " + (status.lastSyncType||"—")
          : "Sin conexión SAP — " + (status.error||""));
        oModel.setProperty("/sapStatusType", status.connected ? "Success" : "Warning");
      } catch(e) { /* silent */ }
      finally { this.showBusy(false); }
    },
    onTabSelect: function () { /* lazy load tabs */ },
    onCreateUser: function () {
      if (!this._oUserDialog) {
        var oView = this.getView();
        sap.ui.require(["sap/m/Dialog","sap/m/Button","sap/m/Label","sap/m/Input","sap/m/Select","sap/ui/core/Item","sap/ui/layout/form/SimpleForm"], 
        function (Dialog, Button, Label, Input, Select, Item, SimpleForm) {
          this._oUserDialog = new Dialog({
            title: "Nuevo Usuario",
            contentWidth: "400px",
            content: new SimpleForm({
              layout: "ResponsiveGridLayout",
              editable: true,
              content: [
                new Label({ text: "Nombre completo" }),
                new Input("inpName", { required: true }),
                new Label({ text: "Correo electrónico" }),
                new Input("inpEmail", { type: "Email", required: true }),
                new Label({ text: "Contraseña" }),
                new Input("inpPass", { type: "Password", required: true }),
                new Label({ text: "Rol" }),
                new Select("selRole", {
                  items: [
                    new Item({ key: "admin", text: "Administrador" }),
                    new Item({ key: "supervisor", text: "Supervisor" }),
                    new Item({ key: "operator", text: "Operador" })
                  ]
                })
              ]
            }),
            beginButton: new Button({
              type: "Emphasized",
              text: "Crear",
              press: async function () {
                var oName = sap.ui.getCore().byId("inpName");
                var oEmail = sap.ui.getCore().byId("inpEmail");
                var oPass = sap.ui.getCore().byId("inpPass");
                var oRole = sap.ui.getCore().byId("selRole");

                if (!oName.getValue() || !oEmail.getValue() || oPass.getValue().length < 8) {
                  this.showError("Por favor completa todos los campos (Contraseña min. 8 caracteres).");
                  return;
                }

                this.showBusy(true);
                try {
                  await Api.createUser({
                    name: oName.getValue(),
                    email: oEmail.getValue(),
                    password: oPass.getValue(),
                    role: oRole.getSelectedKey()
                  });
                  this.showSuccess("Usuario creado exitosamente");
                  this._oUserDialog.close();
                  this._load(); // recargar
                  oName.setValue(""); oEmail.setValue(""); oPass.setValue("");
                } catch(e) {
                  this.showError(e.message);
                } finally {
                  this.showBusy(false);
                }
              }.bind(this)
            }),
            endButton: new Button({
              text: "Cancelar",
              press: function () { this._oUserDialog.close(); }.bind(this)
            })
          });
          oView.addDependent(this._oUserDialog);
          this._oUserDialog.open();
        }.bind(this));
      } else {
        this._oUserDialog.open();
      }
    },
    onTestSap: async function () {
      var oM = this.getModel("admin");
      oM.setProperty("/sapStatusType", "Information");
      oM.setProperty("/sapStatusText", "Probando conexión…");
      try {
        var r = await Api.getSapStatus();
        oM.setProperty("/sapStatusType", r.connected ? "Success" : "Error");
        oM.setProperty("/sapStatusText", r.connected ? "SAP conectado correctamente" : "Sin conexión: " + r.error);
      } catch(e) {
        oM.setProperty("/sapStatusType", "Error");
        oM.setProperty("/sapStatusText", "Error de red al probar SAP");
      }
    },

    onSapSync: async function () {
      this.showBusy(true);
      try {
        var r = await Api.runSapSync();
        this.showSuccess("Sync completada — Materiales: " + (r.materials?.count||0) + " · Lotes: " + (r.batches?.count||0));
        this._load();
      } catch(e) { this.showError(e.message); }
      finally { this.showBusy(false); }
    }
  });
});
