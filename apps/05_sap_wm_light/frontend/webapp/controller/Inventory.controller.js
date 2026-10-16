sap.ui.define([
  "wm/light/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "wm/light/service/ApiService",
  "sap/m/MessageBox",
  "sap/ui/core/Fragment"
], function (BaseController, JSONModel, Filter, FilterOperator, Api, MessageBox, Fragment) {
  "use strict";

  return BaseController.extend("wm.light.controller.Inventory", {
    onInit: function () {
      this.setModel(new JSONModel({ items: [] }), "inv");
      this.setModel(new JSONModel({ docs_active: 0, ira: 0, absolute_diff: 0 }), "kpi");
      
      var oRouter = sap.ui.core.UIComponent.getRouterFor ? sap.ui.core.UIComponent.getRouterFor(this) : null;
      if (oRouter) oRouter.getRoute("inventory").attachPatternMatched(this._load, this);
      
      // Global navigation listener fallback
      sap.ui.getCore().getEventBus().subscribe("wm.light", "navigate", function(c, e, d) {
        if (d && d.route === "inventory") this._load();
      }, this);

      this._load();
    },

    _load: async function () {
      this.showBusy(true);
      try {
        var res = await Api.getInventoryCounts();
        this.getModel("inv").setProperty("/items", res.data || []);
        
        var kpis = await Api.getInventoryKpis();
        this.getModel("kpi").setData(kpis);
      } catch (e) {
        if (e.message !== "SESSION_EXPIRED") this.showError(e.message);
      } finally {
        this.showBusy(false);
      }
    },

    onRefresh: function () {
      this._load();
    },

    formatProgress: function (counted, total) {
      if (!total) return 0;
      return (counted / total) * 100;
    },

    formatStatusState: function (s) {
      if (s === 'PLANNED') return 'Information';
      if (s === 'ACTIVE' || s === 'IN_PROGRESS') return 'Warning';
      if (s === 'COUNTED') return 'Success';
      if (s === 'CLEARED_WM' || s === 'CLEARED_IM') return 'None';
      return 'Error';
    },

    /* ── CREATE (LI01N) ────────────────────────────────────── */
    onCreatePress: function () {
      if (!this._oCreateDlg) {
        Fragment.load({
          id: this.getView().getId(),
          name: "wm.light.view.fragment.InvCreateDialog",
          controller: this
        }).then(function (oDialog) {
          this._oCreateDlg = oDialog;
          this.getView().addDependent(oDialog);
          this._initCreateDialog();
        }.bind(this));
      } else {
        this._initCreateDialog();
      }
    },

    _initCreateDialog: async function() {
      this.setModel(new JSONModel({ warehouse_id: "WH001", count_type: "CYCLIC", bin_ids: [] }), "create");
      this.setModel(new JSONModel({ items: [] }), "bins");
      try {
        var res = await Api.getBins("WH001", { status: 'ACTIVE' });
        this.getModel("bins").setProperty("/items", res.data || []);
        this._oCreateDlg.open();
      } catch(e) {
        this.showError("Error al cargar ubicaciones: " + e.message);
      }
    },

    onCloseCreate: function() {
      if (this._oCreateDlg) this._oCreateDlg.close();
    },

    onSaveCreate: async function() {
      var d = this.getModel("create").getData();
      if (!d.warehouse_id || !d.bin_ids || d.bin_ids.length === 0) {
        return this.showError("Seleccione al menos una ubicación");
      }
      this.showBusy(true);
      try {
        await Api.createInventory(d);
        this.showSuccess("Documento de inventario creado exitosamente");
        this.onCloseCreate();
        this._load();
      } catch(e) {
        this.showError(e.message);
      } finally {
        this.showBusy(false);
      }
    },

    /* ── ACTIVATE (LI02N) ──────────────────────────────────── */
    onActivatePress: function(oEvent) {
      var oItem = oEvent.getSource().getBindingContext("inv").getObject();
      MessageBox.confirm("¿Desea ACTIVAR el documento " + oItem.count_number + "?\n\nEsto bloqueará las ubicaciones seleccionadas para movimientos.", {
        title: "Activar Inventario (LI02N)",
        onClose: async function (sAction) {
          if (sAction === MessageBox.Action.OK) {
            this.showBusy(true);
            try {
              await Api.activateInventory(oItem.id);
              this.showSuccess("Documento activado. Las ubicaciones están ahora bloqueadas.");
              this._load();
            } catch(e) {
              this.showError(e.message);
            } finally {
              this.showBusy(false);
            }
          }
        }.bind(this)
      });
    },

    /* ── COUNT (LI11N) ─────────────────────────────────────── */
    onCountPress: async function(oEvent) {
      var oItem = oEvent.getSource().getBindingContext("inv").getObject();
      this.showBusy(true);
      try {
        var res = await Api.getInventoryCount(oItem.id);
        this.setModel(new JSONModel(res.data), "countDoc");
        
        if (!this._oCountDlg) {
          Fragment.load({
            id: this.getView().getId(),
            name: "wm.light.view.fragment.InvCountDialog",
            controller: this
          }).then(function (oDialog) {
            this._oCountDlg = oDialog;
            this.getView().addDependent(oDialog);
            oDialog.open();
          }.bind(this));
        } else {
          this._oCountDlg.open();
        }
      } catch(e) {
        this.showError(e.message);
      } finally {
        this.showBusy(false);
      }
    },

    onCloseCount: function() {
      if (this._oCountDlg) this._oCountDlg.close();
    },

    onSaveCount: async function() {
      var d = this.getModel("countDoc").getData();
      
      // Armar payload: counts: [{ inventory_count_bin_id, items: [{id, counted_qty, ...}] }]
      var counts = d.bins.map(b => ({
        inventory_count_bin_id: b.id,
        items: b.items.filter(i => i.counted_qty !== undefined && i.counted_qty !== null && i.counted_qty !== "")
      }));

      if (counts.length === 0 || counts.every(b => b.items.length === 0)) {
        return this.showError("Por favor ingrese al menos una cantidad contada.");
      }

      this.showBusy(true);
      try {
        await Api.submitInventoryCount(d.id, { counts: counts });
        this.showSuccess("Cantidades registradas exitosamente");
        this.onCloseCount();
        this._load();
      } catch(e) {
        this.showError(e.message);
      } finally {
        this.showBusy(false);
      }
    },

    /* ── CLEAR WM (LI20) ───────────────────────────────────── */
    onClearWMPress: function(oEvent) {
      var oItem = oEvent.getSource().getBindingContext("inv").getObject();
      MessageBox.confirm("¿Liquidación WM para el doc " + oItem.count_number + "?\n\nLas ubicaciones serán desbloqueadas y las diferencias enviadas al Tipo 999.", {
        title: "Liquidación WM (LI20)",
        onClose: async function (sAction) {
          if (sAction === MessageBox.Action.OK) {
            this.showBusy(true);
            try {
              await Api.clearInventoryWM(oItem.id);
              this.showSuccess("Diferencias registradas en WM");
              this._load();
            } catch(e) {
              this.showError(e.message);
            } finally {
              this.showBusy(false);
            }
          }
        }.bind(this)
      });
    },

    /* ── CLEAR IM (LI21) ───────────────────────────────────── */
    onClearIMPress: function(oEvent) {
      var oItem = oEvent.getSource().getBindingContext("inv").getObject();
      MessageBox.confirm("¿Liquidación IM para el doc " + oItem.count_number + "?\n\nSe ajustarán los stocks contables generales (Movs virtuales 711/712).", {
        title: "Liquidación IM (LI21)",
        onClose: async function (sAction) {
          if (sAction === MessageBox.Action.OK) {
            this.showBusy(true);
            try {
              await Api.clearInventoryIM(oItem.id);
              this.showSuccess("Diferencias contabilizadas en IM. Documento cerrado.");
              this._load();
            } catch(e) {
              this.showError(e.message);
            } finally {
              this.showBusy(false);
            }
          }
        }.bind(this)
      });
    }

  });
});
