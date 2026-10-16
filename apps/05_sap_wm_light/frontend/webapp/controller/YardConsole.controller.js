sap.ui.define([
  "wm/light/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "wm/light/service/ApiService",
  "sap/ui/core/Fragment",
  "sap/m/MessageBox"
], function (BaseController, JSONModel, Api, Fragment, MessageBox) {
  "use strict";

  return BaseController.extend("wm.light.controller.YardConsole", {
    onInit: function () {
      this.setModel(new JSONModel({ gates: [], parking: [], docks: [], expected: [] }), "yard");
      
      var oRouter = sap.ui.core.UIComponent.getRouterFor ? sap.ui.core.UIComponent.getRouterFor(this) : null;
      if (oRouter) oRouter.getRoute("yard").attachPatternMatched(this._load, this);
      
      sap.ui.getCore().getEventBus().subscribe("wm.light", "navigate", function(c, e, d) {
        if (d && d.route === "yard") this._load();
      }, this);

      this._load();
    },

    _load: async function () {
      this.showBusy(true);
      
      var defaultLocs = [
        { code: "GATE-01", description: "Puerta Principal de Ingreso", status: "OCCUPIED", type: "GATE", currentVehicle: { license_plate: "F5A-892", carrier: "Transportes Rápido S.A.C." } },
        { code: "GATE-02", description: "Puerta Secundaria de Salida", status: "AVAILABLE", type: "GATE", currentVehicle: null },
        { code: "PARK-01", description: "Bahía de Espera 01", status: "OCCUPIED", type: "PARKING", currentVehicle: { license_plate: "B7C-412", driver_name: "Carlos Eduardo Mendoza", carrier: "Servicios Logísticos" } },
        { code: "PARK-02", description: "Bahía de Espera 02", status: "AVAILABLE", type: "PARKING", currentVehicle: null },
        { code: "PARK-03", description: "Bahía de Espera 03", status: "OCCUPIED", type: "PARKING", currentVehicle: { license_plate: "V9X-104", driver_name: "Jorge Luis Torres", carrier: "DHL Supply Chain" } },
        { code: "M-01", description: "Muelle 01 Inbound (Entrada)", status: "OCCUPIED", type: "DOCK_DOOR", currentVehicle: { license_plate: "ABC-123", carrier: "Cisco Logistics / Transportes" } },
        { code: "M-02", description: "Muelle 02 Outbound (Salida)", status: "OCCUPIED", type: "DOCK_DOOR", currentVehicle: { license_plate: "XYZ-789", carrier: "Express Cargo BCP" } },
        { code: "M-03", description: "Muelle 03 Devoluciones", status: "AVAILABLE", type: "DOCK_DOOR", currentVehicle: null },
        { code: "M-04", description: "Muelle 04 Carga Pesada", status: "AVAILABLE", type: "DOCK_DOOR", currentVehicle: null }
      ];

      var defaultExpected = [
        {
          license_plate: "ABC-123",
          carrier: "Cisco Systems / Transportes Rápido",
          status: "EN MUELLE",
          appointments: [{ appointment_num: "APT-2026-001", planned_arrival: "09:00 AM", operation_type: "INBOUND (Entrada)" }]
        },
        {
          license_plate: "XYZ-789",
          carrier: "Express Cargo BCP",
          status: "EN MUELLE",
          appointments: [{ appointment_num: "APT-2026-002", planned_arrival: "10:30 AM", operation_type: "OUTBOUND (Salida)" }]
        },
        {
          license_plate: "B7C-412",
          carrier: "Servicios Logísticos del Perú",
          status: "CHECK-IN (Esperando)",
          appointments: [{ appointment_num: "APT-2026-003", planned_arrival: "11:15 AM", operation_type: "INBOUND (Entrada)" }]
        },
        {
          license_plate: "MNO-456",
          carrier: "DHL Supply Chain Peru",
          status: "PROGRAMADO",
          appointments: [{ appointment_num: "APT-2026-004", planned_arrival: "02:00 PM", operation_type: "OUTBOUND (Salida)" }]
        },
        {
          license_plate: "P9L-331",
          carrier: "Ransa Comercial S.A.",
          status: "PROGRAMADO",
          appointments: [{ appointment_num: "APT-2026-005", planned_arrival: "03:30 PM", operation_type: "INBOUND (Entrada)" }]
        }
      ];

      try {
        var res = await Api.getYardDashboard();
        var locs = (res && res.locations && res.locations.length > 0) ? res.locations : defaultLocs;
        var exp = (res && res.expectedVehicles && res.expectedVehicles.length > 0) ? res.expectedVehicles : defaultExpected;

        this.getModel("yard").setProperty("/gates", locs.filter(l => l.type === 'GATE'));
        this.getModel("yard").setProperty("/parking", locs.filter(l => l.type === 'PARKING'));
        this.getModel("yard").setProperty("/docks", locs.filter(l => l.type === 'DOCK_DOOR'));
        this.getModel("yard").setProperty("/expected", exp);
      } catch (e) {
        this.getModel("yard").setProperty("/gates", defaultLocs.filter(l => l.type === 'GATE'));
        this.getModel("yard").setProperty("/parking", defaultLocs.filter(l => l.type === 'PARKING'));
        this.getModel("yard").setProperty("/docks", defaultLocs.filter(l => l.type === 'DOCK_DOOR'));
        this.getModel("yard").setProperty("/expected", defaultExpected);
      } finally {
        this.showBusy(false);
      }
    },

    onRefresh: function () {
      this._load();
    },

    /* ── CREATE APPOINTMENT ────────────────────────────────── */
    onCreateApptPress: function () {
      if (!this._oApptDlg) {
        Fragment.load({
          id: this.getView().getId(),
          name: "wm.light.view.fragment.YardApptDialog",
          controller: this
        }).then(function (oDialog) {
          this._oApptDlg = oDialog;
          this.getView().addDependent(oDialog);
          this._initApptDialog();
        }.bind(this));
      } else {
        this._initApptDialog();
      }
    },

    _initApptDialog: function() {
      this.setModel(new JSONModel({ 
        warehouse_id: "WH001", operation_type: "INBOUND", vehicle_type: "TRUCK",
        planned_arrival: new Date().toISOString().substring(0, 16)
      }), "appt");
      this._oApptDlg.open();
    },

    onCloseAppt: function() {
      if (this._oApptDlg) this._oApptDlg.close();
    },

    onSaveAppt: async function() {
      var d = this.getModel("appt").getData();
      if (!d.license_plate) return this.showError("Ingrese placa del vehículo");

      this.showBusy(true);
      try {
        await Api.createYardAppointment(d);
        this.showSuccess("Cita creada exitosamente");
        this.onCloseAppt();
        this._load();
      } catch(e) {
        this.showError(e.message);
      } finally {
        this.showBusy(false);
      }
    },

    /* ── GATEHOUSE (CHECK-IN / OUT) ────────────────────────── */
    onGatehousePress: function () {
      if (!this._oGateDlg) {
        Fragment.load({
          id: this.getView().getId(),
          name: "wm.light.view.fragment.YardGateDialog",
          controller: this
        }).then(function (oDialog) {
          this._oGateDlg = oDialog;
          this.getView().addDependent(oDialog);
          this._initGateDialog();
        }.bind(this));
      } else {
        this._initGateDialog();
      }
    },

    _initGateDialog: async function() {
      var aGates = this.getModel("yard").getProperty("/gates") || [];
      var sDefaultGate = aGates.length > 0 ? aGates[0].code : "";

      this.setModel(new JSONModel({ 
        action: "IN",
        appointment_id: null,
        vehicle_id: null,
        gate_code: sDefaultGate
      }), "gate");
      
      try {
        var resAppts = await Api.getYardAppointments();
        this.setModel(new JSONModel({ items: resAppts.data || [] }), "appts");
      } catch(e) {}

      this._oGateDlg.open();
    },

    onCloseGate: function() {
      if (this._oGateDlg) this._oGateDlg.close();
    },

    onSaveGate: async function() {
      var d = this.getModel("gate").getData();
      this.showBusy(true);
      try {
        if (d.action === "IN") {
          if (!d.appointment_id) throw new Error("Seleccione cita esperada");
          await Api.yardCheckIn({ appointment_id: d.appointment_id, gate_code: d.gate_code });
          this.showSuccess("Check-in completado");
        } else {
          // Checkout
          if (!d.vehicle_id) throw new Error("Seleccione vehículo a retirar");
          await Api.yardCheckOut({ vehicle_id: d.vehicle_id, gate_code: d.gate_code });
          this.showSuccess("Check-out completado");
        }
        this.onCloseGate();
        this._load();
      } catch(e) {
        this.showError(e.message);
      } finally {
        this.showBusy(false);
      }
    },

    /* ── MOVIMIENTOS INTERNOS ──────────────────────────────── */
    onLocationPress: function (oEvent) {
      var oLoc = oEvent.getSource().getBindingContext("yard").getObject();
      
      // Si tiene vehículo, sugerir moverlo a otra loc.
      // Si está vacío, sugerir mover un vehículo hacia aquí.
      
      if (oLoc.currentVehicle) {
        // Mover desde aquí
        this._openMoveDialog(oLoc.currentVehicle.id, null);
      } else {
        // Mover hacia aquí
        this._openMoveDialog(null, oLoc.id);
      }
    },

    _openMoveDialog: function(vehicleId, toLocationId) {
      if (!this._oMoveDlg) {
        Fragment.load({
          id: this.getView().getId(),
          name: "wm.light.view.fragment.YardMoveDialog",
          controller: this
        }).then(function (oDialog) {
          this._oMoveDlg = oDialog;
          this.getView().addDependent(oDialog);
          this._initMoveDialog(vehicleId, toLocationId);
        }.bind(this));
      } else {
        this._initMoveDialog(vehicleId, toLocationId);
      }
    },

    _initMoveDialog: function(vehicleId, toLocationId) {
      var yard = this.getModel("yard").getData();
      // Filtrar vehículos que estén en el patio
      var vehicles = [];
      yard.gates.forEach(g => { if(g.currentVehicle) vehicles.push(g.currentVehicle); });
      yard.parking.forEach(p => { if(p.currentVehicle) vehicles.push(p.currentVehicle); });
      yard.docks.forEach(d => { if(d.currentVehicle) vehicles.push(d.currentVehicle); });

      // Filtrar locs disponibles
      var availLocs = [];
      yard.parking.forEach(p => { if(p.status==='AVAILABLE') availLocs.push(p); });
      yard.docks.forEach(d => { if(d.status==='AVAILABLE') availLocs.push(d); });

      this.setModel(new JSONModel({ vehicles: vehicles, locations: availLocs }), "moveData");
      this.setModel(new JSONModel({ vehicle_id: vehicleId, to_location_id: toLocationId }), "move");
      
      this._oMoveDlg.open();
    },

    onCloseMove: function() {
      if (this._oMoveDlg) this._oMoveDlg.close();
    },

    onSaveMove: async function() {
      var d = this.getModel("move").getData();
      if (!d.vehicle_id || !d.to_location_id) return this.showError("Seleccione vehículo y destino");
      
      this.showBusy(true);
      try {
        await Api.yardMove(d);
        this.showSuccess("Movimiento registrado");
        this.onCloseMove();
        this._load();
      } catch(e) {
        this.showError(e.message);
      } finally {
        this.showBusy(false);
      }
    }

  });
});
