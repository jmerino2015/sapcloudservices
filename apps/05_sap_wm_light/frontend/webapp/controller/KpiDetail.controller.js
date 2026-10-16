sap.ui.define([
  "wm/light/controller/BaseController",
  "sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
  "use strict";

  return BaseController.extend("wm.light.controller.KpiDetail", {
    onInit: function () {
      this.setModel(new JSONModel({
        title: "Cargando detalle...",
        chartPoints: [],
        tableData: []
      }), "detail");

      // We use a global model property to pass the selected KPI ID
      // When the view is displayed, we detect it and reload.
      this.getView().addEventDelegate({
        onBeforeShow: function() {
          this._loadDemoData();
        }.bind(this)
      });
    },

    onNavBack: function () {
      sap.ui.getCore().getEventBus().publish("wm.light", "navigate", { route: "kpi" });
    },

    onRefresh: function () {
      this.showBusy(true);
      setTimeout(function() {
        this._loadDemoData();
        this.showBusy(false);
      }.bind(this), 500);
    },

    onExport: function () {
      this.showSuccess("Exportando detalle a Excel...");
    },

    onChartSelection: function (oEvent) {
      var oPoint = oEvent.getParameter("point");
      if (oPoint) {
        var sLabel = oPoint.getLabel();
        this.showSuccess("Analizando período: " + sLabel);
      }
    },

    _loadDemoData: function() {
      var sKpiId = this.getModel("app").getProperty("/selectedKpiId");
      if (!sKpiId) return;

      var oModel = this.getModel("detail");
      var sTitle = "Detalle del Indicador";
      var aPoints = [];
      var aTable = [];
      var sUnit = "";

      var getColor = function(val, meta, type) {
        if (type === "max") return val >= meta ? "Good" : (val >= meta*0.9 ? "Critical" : "Error");
        return val <= meta ? "Good" : (val <= meta*1.1 ? "Critical" : "Error"); // min is better
      };

      var getState = function(color) {
        if (color === "Good") return "Success";
        if (color === "Critical") return "Warning";
        return "Error";
      };

      if (sKpiId === "inboundCycle") {
        sTitle = "Análisis: Tiempo de Ciclo de Recepción";
        sUnit = "Horas";
        var vals = [3.8, 3.2, 3.0, 2.8, 2.5, 2.4];
        var per = ["Ene","Feb","Mar","Abr","May","Jun"];
        for(var i=0; i<6; i++) {
          var c = getColor(vals[i], 2.5, "min");
          var s = getState(c);
          aPoints.push({ label: per[i], value: vals[i], color: c, selected: i===5 });
          aTable.push({ period: per[i] + " 2026", warehouse: "WH001 - Centro Principal", metric: "T. Ciclo Promedio", value: vals[i], unit: sUnit, state: s, statusText: c==="Good"?"Óptimo":(c==="Error"?"Demorado":"En Riesgo") });
        }
      } 
      else if (sKpiId === "outboundPicking") {
        sTitle = "Análisis: Productividad de Picking";
        sUnit = "Líneas/Hr";
        var vals = [110, 115, 125, 130, 140, 145];
        var per = ["Ene","Feb","Mar","Abr","May","Jun"];
        for(var i=0; i<6; i++) {
          var c = getColor(vals[i], 135, "max");
          var s = getState(c);
          aPoints.push({ label: per[i], value: vals[i], color: c, selected: i===5 });
          aTable.push({ period: per[i] + " 2026", warehouse: "WH001 - Centro Principal", metric: "Líneas Preparadas", value: vals[i], unit: sUnit, state: s, statusText: c==="Good"?"Excelente":(c==="Error"?"Bajo Rendimiento":"Aceptable") });
        }
      }
      else {
        // Genérico para cualquier otro KPI (demo aleatorio)
        sTitle = "Reporte Detallado: " + sKpiId;
        sUnit = "%";
        var per = ["Semana 1","Semana 2","Semana 3","Semana 4","Semana 5","Semana Actual"];
        for(var i=0; i<6; i++) {
          var v = Math.floor(Math.random() * 20) + 80;
          var c = getColor(v, 90, "max");
          var s = getState(c);
          aPoints.push({ label: per[i], value: v, color: c, selected: i===5 });
          aTable.push({ period: per[i], warehouse: "Todos los almacenes", metric: "Performance Global", value: v, unit: sUnit, state: s, statusText: c==="Good"?"Dentro de Meta":"Requiere Revisión" });
        }
      }

      oModel.setProperty("/title", sTitle);
      oModel.setProperty("/chartPoints", aPoints);
      oModel.setProperty("/tableData", aTable);
    }
  });
});
