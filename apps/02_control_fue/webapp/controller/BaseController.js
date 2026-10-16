sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageBox",
  "sap/m/MessageToast",
  "fue/control/model/sapMockData"
], function (Controller, MessageBox, MessageToast, SAPMockData) {
  "use strict";

  var COST_CATALOG = {
    'Developer':       { fue: 1.00, annual: 4500, monthly: 375.00 },
    'Advanced':        { fue: 1.00, annual: 3200, monthly: 266.67 },
    'Core':            { fue: 0.20, annual: 800,  monthly: 66.67 },
    'Self Service':    { fue: 0.05, annual: 180,  monthly: 15.00 },
    'Indirect Access': { fue: 0.02, annual: 50,   monthly: 4.17 }
  };

  return Controller.extend("fue.control.controller.BaseController", {
    
    getModel: function (sName) {
      return this.getView().getModel(sName) || (this.getOwnerComponent() && this.getOwnerComponent().getModel(sName));
    },

    setModel: function (oModel, sName) {
      this.getView().setModel(oModel, sName);
    },

    getResourceBundle: function () {
      var oModel = this.getModel("i18n");
      return oModel ? oModel.getResourceBundle() : null;
    },

    getText: function (sKey, aArgs) {
      var oBundle = this.getResourceBundle();
      return oBundle ? oBundle.getText(sKey, aArgs) : sKey;
    },

    showSuccess: function (sMessage) {
      MessageToast.show(sMessage);
    },

    showError: function (sMessage) {
      MessageBox.error(sMessage);
    },

    /**
     * Main Pivot & KPI Calculation Engine for 5 Sociedades & SAP User Control
     */
    updatePivotAndKpis: function (aRecords) {
      var oModel = this.getModel("fueModel");
      if (!oModel) return;

      // Fallback to initial mock data if empty
      if (!aRecords || aRecords.length === 0) {
        var fallbackList = (SAPMockData && SAPMockData.INITIAL_USERS) ? SAPMockData.INITIAL_USERS : [];
        aRecords = JSON.parse(JSON.stringify(fallbackList));
      }

      // Enrich records with costs and FUE defaults
      aRecords.forEach(function (row) {
        var cfg = COST_CATALOG[row.TipoFue] || COST_CATALOG['Advanced'];
        if (typeof row.Fue !== 'number' || row.Fue === 0) {
          row.Fue = cfg.fue;
        }
        row.CostoAnualUSD = cfg.annual;
        row.CostoMensualUSD = cfg.monthly;

        if (!row.Sociedad && row.Empresa) {
          if (row.Empresa.indexOf("PE10") !== -1 || row.Empresa.indexOf("PERU") !== -1 || row.Empresa.indexOf("IBEROPLAST") !== -1) row.Sociedad = "PE10";
          else if (row.Empresa.indexOf("CL20") !== -1 || row.Empresa.indexOf("CHILE") !== -1) row.Sociedad = "CL20";
          else if (row.Empresa.indexOf("CO30") !== -1 || row.Empresa.indexOf("COLOMBIA") !== -1) row.Sociedad = "CO30";
          else if (row.Empresa.indexOf("MX40") !== -1 || row.Empresa.indexOf("MEXICO") !== -1) row.Sociedad = "MX40";
          else if (row.Empresa.indexOf("US50") !== -1 || row.Empresa.indexOf("USA") !== -1 || row.Empresa.indexOf("HK") !== -1) row.Sociedad = "US50";
          else row.Sociedad = "PE10";
        }

        row.AhorroPotencialUSD = 0;
        if (row.EstadoUsuario === "Inactivo (>90d)") {
          if (row.TipoFue === "Developer" || row.TipoFue === "Advanced" || row.TipoFue === "Core") {
            row.AhorroPotencialUSD = row.CostoAnualUSD - 180;
            row.RecomendacionIA = "💡 Reasignar a Self Service (Ahorro $" + row.AhorroPotencialUSD.toLocaleString() + "/año)";
            row.RequiereOptimizacion = true;
          }
        } else if (row.EstadoUsuario === "Bloqueado") {
          row.AhorroPotencialUSD = row.CostoAnualUSD;
          row.RecomendacionIA = "⚠️ Liberar Licencia de Usuario Bloqueado (Ahorro $" + row.AhorroPotencialUSD.toLocaleString() + "/año)";
          row.RequiereOptimizacion = true;
        } else if (row.RiesgoSOD === "Alto") {
          row.RecomendacionIA = "⚠️ Conflicto SoD Crítico / Superusuario";
        } else if (!row.RecomendacionIA) {
          row.RecomendacionIA = "Licencia Óptima";
        }
      });

      oModel.setProperty("/records", aRecords);
      oModel.setProperty("/optimizationRecordsOnly", aRecords.filter(function (r) { return r.RequiereOptimizacion; }));

      var nTotalFUE = 0;
      var nTotalUsers = aRecords.length;
      var nTotalCostUSD = 0;
      var nPotentialSavingsUSD = 0;
      var nActiveUsers = 0;
      var nInactiveUsers = 0;
      var nLockedUsers = 0;
      var nSodHighCount = 0;

      var nAdvancedFUE = 0, nCoreFUE = 0, nDeveloperFUE = 0, nSelfServiceFUE = 0, nIndirectFUE = 0;
      var nAdvancedCount = 0, nCoreCount = 0, nDeveloperCount = 0, nSelfServiceCount = 0, nIndirectCount = 0;

      aRecords.forEach(function (rec) {
        var val = parseFloat(rec.Fue) || 0;
        nTotalFUE += val;
        nTotalCostUSD += (rec.CostoAnualUSD || 0);
        nPotentialSavingsUSD += (rec.AhorroPotencialUSD || 0);

        if (rec.TipoFue === "Advanced") { nAdvancedFUE += val; nAdvancedCount++; }
        else if (rec.TipoFue === "Core") { nCoreFUE += val; nCoreCount++; }
        else if (rec.TipoFue === "Developer") { nDeveloperFUE += val; nDeveloperCount++; }
        else if (rec.TipoFue === "Self Service") { nSelfServiceFUE += val; nSelfServiceCount++; }
        else if (rec.TipoFue === "Indirect Access") { nIndirectFUE += val; nIndirectCount++; }

        if (rec.EstadoUsuario === "Activo") nActiveUsers++;
        else if (rec.EstadoUsuario === "Inactivo (>90d)") nInactiveUsers++;
        else if (rec.EstadoUsuario === "Bloqueado") nLockedUsers++;

        if (rec.RiesgoSOD === "Alto") nSodHighCount++;
      });

      var oSociedadesData = {
        "PE10": { code: "PE10", name: "PE10 - Perú S.A.C.", country: "Perú 🇵🇪", users: 0, fue: 0, costUSD: 0, savingsUSD: 0, budgetUSD: 120000, contractedFUE: 40, Advanced: 0, Core: 0, Developer: 0, SelfService: 0, Indirect: 0 },
        "CL20": { code: "CL20", name: "CL20 - Chile SpA", country: "Chile 🇨🇱", users: 0, fue: 0, costUSD: 0, savingsUSD: 0, budgetUSD: 95000, contractedFUE: 30, Advanced: 0, Core: 0, Developer: 0, SelfService: 0, Indirect: 0 },
        "CO30": { code: "CO30", name: "CO30 - Colombia S.A.S.", country: "Colombia 🇨🇴", users: 0, fue: 0, costUSD: 0, savingsUSD: 0, budgetUSD: 85000, contractedFUE: 25, Advanced: 0, Core: 0, Developer: 0, SelfService: 0, Indirect: 0 },
        "MX40": { code: "MX40", name: "MX40 - México S.A.", country: "México 🇲🇽", users: 0, fue: 0, costUSD: 0, savingsUSD: 0, budgetUSD: 110000, contractedFUE: 35, Advanced: 0, Core: 0, Developer: 0, SelfService: 0, Indirect: 0 },
        "US50": { code: "US50", name: "US50 - USA Inc.", country: "USA 🇺🇸", users: 0, fue: 0, costUSD: 0, savingsUSD: 0, budgetUSD: 140000, contractedFUE: 45, Advanced: 0, Core: 0, Developer: 0, SelfService: 0, Indirect: 0 }
      };

      aRecords.forEach(function (rec) {
        var socKey = rec.Sociedad || "PE10";
        if (!oSociedadesData[socKey]) socKey = "PE10";
        var target = oSociedadesData[socKey];
        var valFue = parseFloat(rec.Fue) || 0;
        target.users += 1;
        target.fue += valFue;
        target.costUSD += (rec.CostoAnualUSD || 0);
        target.savingsUSD += (rec.AhorroPotencialUSD || 0);

        if (rec.TipoFue === "Advanced") target.Advanced += valFue;
        else if (rec.TipoFue === "Core") target.Core += valFue;
        else if (rec.TipoFue === "Developer") target.Developer += valFue;
        else if (rec.TipoFue === "Self Service") target.SelfService += valFue;
        else if (rec.TipoFue === "Indirect Access") target.Indirect += valFue;
      });

      var aPivotList = [];
      var aSocKeys = ["PE10", "CL20", "CO30", "MX40", "US50"];
      var oGrandTotalRow = {
        Empresa: "Total General (5 Sociedades)",
        Sociedad: "TODAS",
        users: 0,
        Advanced: 0,
        Core: 0,
        Developer: 0,
        SelfService: 0,
        Indirect: 0,
        TotalFue: 0,
        costUSD: 0,
        savingsUSD: 0,
        isTotalRow: true
      };

      aSocKeys.forEach(function (k) {
        var sData = oSociedadesData[k];
        sData.fue = parseFloat(sData.fue.toFixed(2));
        sData.Advanced = parseFloat(sData.Advanced.toFixed(2));
        sData.Core = parseFloat(sData.Core.toFixed(2));
        sData.Developer = parseFloat(sData.Developer.toFixed(2));
        sData.SelfService = parseFloat(sData.SelfService.toFixed(2));
        sData.Indirect = parseFloat(sData.Indirect.toFixed(2));

        sData.fueUtilizationPct = Math.round((sData.fue / sData.contractedFUE) * 100);
        sData.budgetUtilizationPct = Math.round((sData.costUSD / sData.budgetUSD) * 100);
        sData.Empresa = sData.name;
        sData.TotalFue = sData.fue;
        sData.isTotalRow = false;

        oGrandTotalRow.users += sData.users;
        oGrandTotalRow.Advanced += sData.Advanced;
        oGrandTotalRow.Core += sData.Core;
        oGrandTotalRow.Developer += sData.Developer;
        oGrandTotalRow.SelfService += sData.SelfService;
        oGrandTotalRow.Indirect += sData.Indirect;
        oGrandTotalRow.TotalFue += sData.TotalFue;
        oGrandTotalRow.costUSD += sData.costUSD;
        oGrandTotalRow.savingsUSD += sData.savingsUSD;

        aPivotList.push(sData);
      });

      oGrandTotalRow.Advanced = parseFloat(oGrandTotalRow.Advanced.toFixed(2));
      oGrandTotalRow.Core = parseFloat(oGrandTotalRow.Core.toFixed(2));
      oGrandTotalRow.Developer = parseFloat(oGrandTotalRow.Developer.toFixed(2));
      oGrandTotalRow.SelfService = parseFloat(oGrandTotalRow.SelfService.toFixed(2));
      oGrandTotalRow.Indirect = parseFloat(oGrandTotalRow.Indirect.toFixed(2));
      oGrandTotalRow.TotalFue = parseFloat(oGrandTotalRow.TotalFue.toFixed(2));
      aPivotList.push(oGrandTotalRow);

      oModel.setProperty("/totalFUE", parseFloat(nTotalFUE.toFixed(2)));
      oModel.setProperty("/totalUsers", nTotalUsers);
      oModel.setProperty("/totalCostUSD", nTotalCostUSD);
      oModel.setProperty("/potentialSavingsUSD", nPotentialSavingsUSD);
      oModel.setProperty("/activeUsersCount", nActiveUsers);
      oModel.setProperty("/inactiveUsersCount", nInactiveUsers);
      oModel.setProperty("/lockedUsersCount", nLockedUsers);
      oModel.setProperty("/sodRiskHighCount", nSodHighCount);
      oModel.setProperty("/companiesCount", 5);

      oModel.setProperty("/advancedFUE", parseFloat(nAdvancedFUE.toFixed(2)));
      oModel.setProperty("/coreFUE", parseFloat(nCoreFUE.toFixed(2)));
      oModel.setProperty("/developerFUE", parseFloat(nDeveloperFUE.toFixed(2)));
      oModel.setProperty("/selfServiceFUE", parseFloat(nSelfServiceFUE.toFixed(2)));
      oModel.setProperty("/indirectFUE", parseFloat(nIndirectFUE.toFixed(2)));

      oModel.setProperty("/pivot", aPivotList);
      oModel.setProperty("/pivotRowsOnly", aPivotList.filter(function (r) { return !r.isTotalRow; }));

      var aLicenseBreakdown = [
        { type: "Developer", count: nDeveloperCount, fue: parseFloat(nDeveloperFUE.toFixed(2)), unitCostUSD: 4500, totalCostUSD: nDeveloperCount * 4500, pct: Math.round((nDeveloperCount / nTotalUsers) * 100) || 0, color: "Error" },
        { type: "Advanced", count: nAdvancedCount, fue: parseFloat(nAdvancedFUE.toFixed(2)), unitCostUSD: 3200, totalCostUSD: nAdvancedCount * 3200, pct: Math.round((nAdvancedCount / nTotalUsers) * 100) || 0, color: "Critical" },
        { type: "Core", count: nCoreCount, fue: parseFloat(nCoreFUE.toFixed(2)), unitCostUSD: 800, totalCostUSD: nCoreCount * 800, pct: Math.round((nCoreCount / nTotalUsers) * 100) || 0, color: "Good" },
        { type: "Self Service", count: nSelfServiceCount, fue: parseFloat(nSelfServiceFUE.toFixed(2)), unitCostUSD: 180, totalCostUSD: nSelfServiceCount * 180, pct: Math.round((nSelfServiceCount / nTotalUsers) * 100) || 0, color: "Neutral" },
        { type: "Indirect Access", count: nIndirectCount, fue: parseFloat(nIndirectFUE.toFixed(2)), unitCostUSD: 50, totalCostUSD: nIndirectCount * 50, pct: Math.round((nIndirectCount / nTotalUsers) * 100) || 0, color: "Good" }
      ];
      oModel.setProperty("/licenseBreakdown", aLicenseBreakdown);

      console.log("✅ FUE Engine updated successfully. Total FUE:", nTotalFUE, "Total Cost:", nTotalCostUSD, "Potential Savings:", nPotentialSavingsUSD);
    },

    onExecuteAIOptimization: function () {
      var oModel = this.getModel("fueModel");
      var aRecords = oModel ? oModel.getProperty("/records") || [] : [];

      var nUpdated = 0;
      var nSavingsGained = 0;

      aRecords.forEach(function (rec) {
        if (rec.RequiereOptimizacion) {
          if (rec.EstadoUsuario === "Inactivo (>90d)") {
            nSavingsGained += rec.AhorroPotencialUSD;
            rec.TipoFue = "Self Service";
            rec.Fue = 0.05;
            rec.CostoAnualUSD = 180;
            rec.CostoMensualUSD = 15.00;
            rec.RecomendacionIA = "✅ Reasignado a Self Service (Optimizado)";
            rec.RequiereOptimizacion = false;
            nUpdated++;
          } else if (rec.EstadoUsuario === "Bloqueado") {
            nSavingsGained += rec.AhorroPotencialUSD;
            rec.TipoFue = "Indirect Access";
            rec.Fue = 0.02;
            rec.CostoAnualUSD = 50;
            rec.CostoMensualUSD = 4.17;
            rec.RecomendacionIA = "✅ Licencia liberada por Bloqueo";
            rec.RequiereOptimizacion = false;
            nUpdated++;
          }
        }
      });

      this.updatePivotAndKpis(aRecords);

      MessageBox.success(
        "🚀 Optimización IA Completada:\n\n" +
        "• Usuarios optimizados: " + nUpdated + "\n" +
        "• Ahorro Anual Inmediato Generado: $" + nSavingsGained.toLocaleString() + " USD\n\n" +
        "Los consumos de FUE y presupuestos de las 5 sociedades han sido actualizados.",
        { title: "Optimización de Licencias Exitoso" }
      );
    },

    onDownloadExcel: function () {
      var oModel = this.getModel("fueModel");
      var aRecords = oModel ? oModel.getProperty("/records") || [] : [];
      var oView = this.getView();
      
      oView.setBusy(true);

      fetch('/api/export-excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: aRecords })
      })
      .then(function (response) {
        if (!response.ok) throw new Error('Error al generar Excel en servidor');
        return response.blob();
      })
      .then(function (blob) {
        oView.setBusy(false);
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'Resumen_FUE_5Sociedades_SAP.xlsx';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        MessageToast.show("Reporte Excel Pivot descargado con éxito.");
      })
      .catch(function (error) {
        oView.setBusy(false);
        console.warn("Server export fallback to client-side SheetJS:", error);
        this._downloadClientSideExcel(aRecords);
      }.bind(this));
    },

    _downloadClientSideExcel: function (aRecords) {
      try {
        /* global XLSX */
        if (typeof XLSX === 'undefined') {
          MessageBox.error("No se pudo exportar el archivo Excel. Revisa la conexión al servidor.");
          return;
        }
        var wsData = aRecords.map(function (row) {
          return {
            'Periodo': row.Periodo,
            'Sociedad': row.Sociedad,
            'Empresa': row.Empresa,
            'Usuario (SU01)': row.Usuarios,
            'Nombre Completo': row.NombreCompleto,
            'Email': row.Email,
            'Departamento': row.Departamento,
            'Tipo FUE': row.TipoFue,
            'Consumo FUE': row.Fue,
            'Costo Anual USD': row.CostoAnualUSD,
            'Estado Usuario': row.EstadoUsuario,
            'Último Logon': row.UltimoLogon,
            'Riesgo SOD': row.RiesgoSOD,
            'Recomendación IA': row.RecomendacionIA
          };
        });

        var wb = XLSX.utils.book_new();
        var ws = XLSX.utils.json_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, "Usuarios y Licencias FUE");
        XLSX.writeFile(wb, "Resumen_FUE_5Sociedades_SAP.xlsx");
        MessageToast.show("Reporte Excel generado y descargado correctamente.");
      } catch (err) {
        MessageBox.error("Error al exportar Excel: " + err.message);
      }
    }

  });
});
