sap.ui.define([
  "fue/control/controller/BaseController",
  "sap/m/MessageBox",
  "sap/m/MessageToast"
], function (BaseController, MessageBox, MessageToast) {
  "use strict";

  return BaseController.extend("fue.control.controller.AuditTool", {
    
    onInit: function () {
    },

    onRunUSMMAudit: function () {
      var oView = this.getView();
      oView.setBusy(true);

      setTimeout(function () {
        oView.setBusy(false);
        var oModel = this.getModel("fueModel");
        var aRecords = oModel ? oModel.getProperty("/records") || [] : [];

        var nTotalFue = oModel ? oModel.getProperty("/totalFUE") || 0 : 0;
        var nSuperUsers = aRecords.filter(function (r) { return r.RiesgoSOD === "Alto"; }).length;
        var nDuplicates = 2;

        MessageBox.information(
          "📋 Reporte de Auditoría USMM / LAW 2.0 Finalizado:\n\n" +
          "• Sistema Auditado: S4H (Mandante 100)\n" +
          "• Sociedades Analizadas: 5 (PE10, CL20, CO30, MX40, US50)\n" +
          "• Consumo Total FUE: " + nTotalFue + " FUE\n" +
          "• Superusuarios (SAP_ALL): " + nSuperUsers + " Cuentas\n" +
          "• Cuentas Duplicadas entre Sociedades: " + nDuplicates + " Cuentas\n" +
          "• Cumplimiento Normativo SAP: 96.8%\n\n" +
          "Recomendación: Ejecute 'Optimización Masiva IA' para reducir $" + (oModel ? oModel.getProperty("/potentialSavingsUSD") || 0 : 0).toLocaleString() + " USD en la factura anual.",
          { title: "Simulación Auditoría USMM SAP Completada" }
        );
      }.bind(this), 1200);
    },

    onCleanDuplicateUsers: function () {
      MessageBox.confirm("¿Desea consolidar y eliminar cuentas duplicadas entre las 5 sociedades para liberar licencias?", {
        title: "Consolidación de Cuentas Duplicadas",
        onClose: function (oAction) {
          if (oAction === MessageBox.Action.OK) {
            MessageToast.show("Cuentas duplicadas consolidadas correctamente.");
          }
        }
      });
    },

    onRevokeSuperusers: function () {
      var oModel = this.getModel("fueModel");
      var aRecords = oModel ? oModel.getProperty("/records") || [] : [];

      var nRevoked = 0;
      aRecords.forEach(function (r) {
        if (r.RiesgoSOD === "Alto" && r.UserGroup !== "BASIS") {
          r.RiesgoSOD = "Bajo";
          if (r.Roles && Array.isArray(r.Roles)) {
            r.Roles = r.Roles.filter(function (role) { return role !== "SAP_ALL"; });
          }
          r.RecomendacionIA = "✅ SAP_ALL Revocado - Rol Estándar Asignado";
          nRevoked++;
        }
      });

      this.updatePivotAndKpis(aRecords);
      MessageBox.success("Se ha revocado el perfil SAP_ALL de " + nRevoked + " usuarios no autorizados de la instalación.", {
        title: "Saneamiento de Seguridad GRC / SoD Exitoso"
      });
    }

  });
});
