sap.ui.define([
  "fue/control/controller/BaseController",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/MessageBox",
  "sap/m/Dialog",
  "sap/m/Button",
  "sap/m/Label",
  "sap/m/Input",
  "sap/m/Select",
  "sap/m/Text",
  "sap/m/VBox",
  "sap/m/HBox",
  "sap/m/ObjectStatus",
  "sap/ui/core/Item",
  "sap/ui/layout/form/SimpleForm"
], function (BaseController, Filter, FilterOperator, MessageBox, Dialog, Button, Label, Input, Select, Text, VBox, HBox, ObjectStatus, Item, SimpleForm) {
  "use strict";

  return BaseController.extend("fue.control.controller.FUEList", {
    
    onInit: function () {
    },

    onSearch: function () {
      var sQuery = this.byId("searchUser") ? this.byId("searchUser").getValue() : "";
      var sCompany = this.byId("filterCompany") ? this.byId("filterCompany").getSelectedKey() : "";
      var sType = this.byId("filterType") ? this.byId("filterType").getSelectedKey() : "";
      var sStatus = this.byId("filterStatus") ? this.byId("filterStatus").getSelectedKey() : "";
      var sSod = this.byId("filterSod") ? this.byId("filterSod").getSelectedKey() : "";
      
      var aFilters = [];
      
      if (sQuery) {
        aFilters.push(new Filter({
          filters: [
            new Filter("Usuarios", FilterOperator.Contains, sQuery),
            new Filter("NombreCompleto", FilterOperator.Contains, sQuery),
            new Filter("Email", FilterOperator.Contains, sQuery),
            new Filter("Departamento", FilterOperator.Contains, sQuery)
          ],
          and: false
        }));
      }
      
      if (sCompany) {
        aFilters.push(new Filter("Sociedad", FilterOperator.EQ, sCompany));
      }
      
      if (sType) {
        aFilters.push(new Filter("TipoFue", FilterOperator.EQ, sType));
      }

      if (sStatus) {
        aFilters.push(new Filter("EstadoUsuario", FilterOperator.EQ, sStatus));
      }

      if (sSod) {
        aFilters.push(new Filter("RiesgoSOD", FilterOperator.EQ, sSod));
      }
      
      var oTable = this.byId("fueTable");
      if (oTable) {
        var oBinding = oTable.getBinding("items");
        if (oBinding) {
          oBinding.filter(aFilters);
        }
      }
    },

    onResetFilters: function () {
      if (this.byId("searchUser")) this.byId("searchUser").setValue("");
      if (this.byId("filterCompany")) this.byId("filterCompany").setSelectedKey("");
      if (this.byId("filterType")) this.byId("filterType").setSelectedKey("");
      if (this.byId("filterStatus")) this.byId("filterStatus").setSelectedKey("");
      if (this.byId("filterSod")) this.byId("filterSod").setSelectedKey("");
      this.onSearch();
    },

    onLoadLocalFile: function () {
      var oView = this.getView();
      oView.setBusy(true);

      fetch('/api/fue')
        .then(function (res) { return res.json(); })
        .then(function (res) {
          oView.setBusy(false);
          if (res.success && res.data) {
            this.updatePivotAndKpis(res.data);
            this.showSuccess("Datos de las 5 Sociedades cargados desde el servidor.");
            this.onSearch();
          } else {
            this.updatePivotAndKpis();
            this.showSuccess("Datos simulados cargados correctamente.");
          }
        }.bind(this))
        .catch(function (err) {
          oView.setBusy(false);
          this.updatePivotAndKpis();
          this.showSuccess("Datos simulados cargados correctamente (Modo Offline).");
        }.bind(this));
    },

    onSaveLocalFile: function () {
      var oModel = this.getModel("fueModel");
      var aRecords = oModel ? oModel.getProperty("/records") || [] : [];
      var oView = this.getView();
      
      oView.setBusy(true);

      fetch('/api/fue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: aRecords })
      })
      .then(function (res) { return res.json(); })
      .then(function (res) {
        oView.setBusy(false);
        if (res.success) {
          this.showSuccess("Registros de usuarios SAP guardados con éxito en la ruta del proyecto.");
        } else {
          this.showError("Error al guardar: " + res.error);
        }
      }.bind(this))
      .catch(function (err) {
        oView.setBusy(false);
        this.showSuccess("Cambios guardados en memoria local.");
      }.bind(this));
    },

    onImportExcel: function (oEvent) {
      var oFileUploader = this.byId("fileUploader");
      var oFile = oEvent.getParameter("files")[0];
      if (!oFile) return;
      
      this.getView().setBusy(true);

      var oReader = new FileReader();
      oReader.onload = function (e) {
        try {
          var data = new Uint8Array(e.target.result);
          /* global XLSX */
          var workbook = XLSX.read(data, { type: 'array' });
          var sheetName = workbook.SheetNames[0];
          var sheet = workbook.Sheets[sheetName];
          var rawData = XLSX.utils.sheet_to_json(sheet);
          
          if (rawData.length === 0) {
            throw new Error("El archivo no contiene registros válidos.");
          }
          
          var aMapped = rawData.map(function (row, idx) {
            var sCompany = row['Empresa'] || row['Sociedad'] || 'PE10';
            var sSocCode = "PE10";
            if (sCompany.indexOf("PE10") !== -1 || sCompany.indexOf("PERU") !== -1) sSocCode = "PE10";
            else if (sCompany.indexOf("CL20") !== -1 || sCompany.indexOf("CHILE") !== -1) sSocCode = "CL20";
            else if (sCompany.indexOf("CO30") !== -1 || sCompany.indexOf("COLOMBIA") !== -1) sSocCode = "CO30";
            else if (sCompany.indexOf("MX40") !== -1 || sCompany.indexOf("MEXICO") !== -1) sSocCode = "MX40";
            else if (sCompany.indexOf("US50") !== -1 || sCompany.indexOf("USA") !== -1) sSocCode = "US50";

            return {
              id: idx + 1,
              Periodo: row['Periodo'] || 'Septiembre 2026',
              Usuarios: row['Usuarios'] || row['Usuario (SU01)'] || ('USER_' + (idx + 1)),
              NombreCompleto: row['Nombre completo'] || row['Nombre Completo'] || 'Usuario SAP',
              Email: row['Email'] || '',
              Empresa: sCompany,
              Sociedad: sSocCode,
              Departamento: row['Departamento'] || 'Operaciones',
              TipoFue: row['Tipo FUE'] || row['TipoFue'] || 'Advanced',
              Fue: typeof row['FUE'] === 'number' ? row['FUE'] : parseFloat(row['FUE']) || 1.0,
              EstadoUsuario: row['Estado Usuario'] || 'Activo',
              UltimoLogon: row['Último Logon'] || '2026-09-15 08:00',
              RiesgoSOD: row['Riesgo SOD'] || 'Ninguno'
            };
          });

          this.updatePivotAndKpis(aMapped);
          this.getView().setBusy(false);
          this.showSuccess("Se cargaron " + aMapped.length + " usuarios desde el archivo Excel.");
          oFileUploader.clear();
          this.onSearch();
        } catch (err) {
          this.getView().setBusy(false);
          this.showError("Error al importar Excel: " + err.message);
          oFileUploader.clear();
        }
      }.bind(this);

      oReader.readAsArrayBuffer(oFile);
    },

    onViewUserDetail: function (oEvent) {
      var oItem = oEvent.getSource().getParent().getParent();
      var oContext = oItem.getBindingContext("fueModel");
      var oRecord = oContext.getObject();

      var oRolesForm = new SimpleForm({
        editable: false,
        layout: "ResponsiveLayout",
        content: [
          new Label({ text: "ID Usuario SAP (SU01)" }),
          new Text({ text: oRecord.Usuarios + " (Mandante 100)" }),

          new Label({ text: "Nombre Completo" }),
          new Text({ text: oRecord.NombreCompleto }),

          new Label({ text: "Email Corporativo" }),
          new Text({ text: oRecord.Email || "Sin email asignado" }),

          new Label({ text: "Sociedad SAP (Bukrs)" }),
          new Text({ text: oRecord.Empresa }),

          new Label({ text: "Departamento / Área" }),
          new Text({ text: oRecord.Departamento || "No asignado" }),

          new Label({ text: "Grupo de Usuarios" }),
          new Text({ text: oRecord.UserGroup || "STANDARD" }),

          new Label({ text: "Tipo de Licencia S/4HANA" }),
          new Text({ text: oRecord.TipoFue + " (" + oRecord.Fue + " FUE)" }),

          new Label({ text: "Costo Anual Asignado" }),
          new Text({ text: "$" + (oRecord.CostoAnualUSD || 0).toLocaleString() + " USD / año ($" + (oRecord.CostoMensualUSD || 0) + " USD/mes)" }),

          new Label({ text: "Estado de Usuario" }),
          new ObjectStatus({
            text: oRecord.EstadoUsuario,
            state: oRecord.EstadoUsuario === "Activo" ? "Success" : (oRecord.EstadoUsuario === "Bloqueado" ? "Error" : "Warning")
          }),

          new Label({ text: "Último Logon SAP" }),
          new Text({ text: oRecord.UltimoLogon || "Desconocido" }),

          new Label({ text: "Análisis Riesgo SoD" }),
          new ObjectStatus({
            text: oRecord.RiesgoSOD || "Ninguno",
            state: oRecord.RiesgoSOD === "Alto" ? "Error" : (oRecord.RiesgoSOD === "Medio" ? "Critical" : "Success")
          }),

          new Label({ text: "Diagnóstico IA" }),
          new Text({ text: oRecord.RecomendacionIA || "Licencia Óptima" }),

          new Label({ text: "Roles SAP Asignados" }),
          new Text({ text: (oRecord.Roles && oRecord.Roles.length) ? oRecord.Roles.join(", ") : "Z_USER_STANDARD_ROLES" })
        ]
      });

      var oDialog = new Dialog({
        title: "Ficha SU01 & Diagnóstico de Licencia: " + oRecord.Usuarios,
        contentWidth: "550px",
        content: [oRolesForm],
        beginButton: new Button({
          text: oRecord.EstadoUsuario === "Bloqueado" ? "Desbloquear Usuario" : "Bloquear Usuario",
          type: oRecord.EstadoUsuario === "Bloqueado" ? "Accept" : "Reject",
          press: function () {
            this._toggleUserLockStatus(oRecord);
            oDialog.close();
            oDialog.destroy();
          }.bind(this)
        }),
        endButton: new Button({
          text: "Cerrar",
          press: function () {
            oDialog.close();
            oDialog.destroy();
          }
        })
      });

      this.getView().addDependent(oDialog);
      oDialog.open();
    },

    _toggleUserLockStatus: function (oRecord) {
      var oModel = this.getModel("fueModel");
      var aRecords = oModel ? oModel.getProperty("/records") || [] : [];

      var idx = aRecords.findIndex(function (r) { return r.id === oRecord.id; });
      if (idx !== -1) {
        if (aRecords[idx].EstadoUsuario === "Bloqueado") {
          aRecords[idx].EstadoUsuario = "Activo";
          aRecords[idx].RecomendacionIA = "Licencia Reactivada";
          aRecords[idx].RequiereOptimizacion = false;
          this.showSuccess("Usuario " + oRecord.Usuarios + " desbloqueado.");
        } else {
          aRecords[idx].EstadoUsuario = "Bloqueado";
          aRecords[idx].RecomendacionIA = "⚠️ Usuario Bloqueado: Liberar Licencia";
          aRecords[idx].RequiereOptimizacion = true;
          this.showSuccess("Usuario " + oRecord.Usuarios + " bloqueado.");
        }
        this.updatePivotAndKpis(aRecords);
        this.onSearch();
      }
    },

    onDeleteRecord: function (oEvent) {
      var oItem = oEvent.getSource().getParent().getParent();
      var oContext = oItem.getBindingContext("fueModel");
      var oRecord = oContext.getObject();

      MessageBox.confirm("¿Estás seguro de eliminar el usuario SAP '" + oRecord.Usuarios + "'?", {
        title: "Confirmar eliminación de usuario",
        onClose: function (oAction) {
          if (oAction === MessageBox.Action.OK) {
            var oModel = this.getModel("fueModel");
            var aRecords = oModel ? oModel.getProperty("/records") || [] : [];
            var aNewRecords = aRecords.filter(function (r) { return r.id !== oRecord.id; });
            this.updatePivotAndKpis(aNewRecords);
            this.showSuccess("Usuario eliminado.");
            this.onSearch();
          }
        }.bind(this)
      });
    },

    onAddRecord: function () {
      this._openRecordDialog(null, false);
    },

    onEditRecord: function (oEvent) {
      var oItem = oEvent.getSource().getParent().getParent();
      var oContext = oItem.getBindingContext("fueModel");
      var oRecord = oContext.getObject();
      this._openRecordDialog(oRecord, true);
    },

    _openRecordDialog: function (oRecord, bEdit) {
      var oModel = this.getModel("fueModel");
      var aRecords = oModel ? oModel.getProperty("/records") || [] : [];
      var oCurrentRecord = oRecord || {
        Periodo: "Septiembre 2026",
        Usuarios: "",
        NombreCompleto: "",
        Email: "",
        Empresa: "PE10 - Corporación Perú S.A.C.",
        Sociedad: "PE10",
        Departamento: "Finanzas",
        TipoFue: "Advanced",
        Fue: 1.0,
        EstadoUsuario: "Activo",
        RiesgoSOD: "Ninguno"
      };

      var oInpUser = new Input({ value: oCurrentRecord.Usuarios, editable: !bEdit });
      var oInpName = new Input({ value: oCurrentRecord.NombreCompleto });
      var oInpEmail = new Input({ value: oCurrentRecord.Email });
      var oInpDept = new Input({ value: oCurrentRecord.Departamento });

      var oSelCompany = new Select({
        selectedKey: oCurrentRecord.Sociedad,
        items: [
          new Item({ key: "PE10", text: "PE10 - Corporación Perú S.A.C. 🇵🇪" }),
          new Item({ key: "CL20", text: "CL20 - Corporación Chile SpA 🇨🇱" }),
          new Item({ key: "CO30", text: "CO30 - Corporación Colombia S.A.S. 🇨🇴" }),
          new Item({ key: "MX40", text: "MX40 - Corporación México S.A. de C.V. 🇲🇽" }),
          new Item({ key: "US50", text: "US50 - Corporación USA Inc. 🇺🇸" })
        ]
      });

      var oInpFueVal = new Input({ value: String(oCurrentRecord.Fue) });

      var oSelType = new Select({
        selectedKey: oCurrentRecord.TipoFue,
        change: function (oEvent) {
          var sType = oEvent.getParameter("selectedItem").getKey();
          if (sType === "Developer") oInpFueVal.setValue("1");
          else if (sType === "Advanced") oInpFueVal.setValue("1");
          else if (sType === "Core") oInpFueVal.setValue("0.2");
          else if (sType === "Self Service") oInpFueVal.setValue("0.05");
          else if (sType === "Indirect Access") oInpFueVal.setValue("0.02");
        },
        items: [
          new Item({ key: "Developer", text: "Developer (1.0 FUE - $4,500/año)" }),
          new Item({ key: "Advanced", text: "Advanced (1.0 FUE - $3,200/año)" }),
          new Item({ key: "Core", text: "Core (0.2 FUE - $800/año)" }),
          new Item({ key: "Self Service", text: "Self Service (0.05 FUE - $180/año)" }),
          new Item({ key: "Indirect Access", text: "Indirect Access (0.02 FUE - $50/año)" })
        ]
      });

      var oSelStatus = new Select({
        selectedKey: oCurrentRecord.EstadoUsuario,
        items: [
          new Item({ key: "Activo", text: "Activo" }),
          new Item({ key: "Inactivo (>90d)", text: "Inactivo (>90 días sin logon)" }),
          new Item({ key: "Bloqueado", text: "Bloqueado por Admin" })
        ]
      });

      var oDialog = new Dialog({
        title: bEdit ? "Editar Usuario SAP: " + oCurrentRecord.Usuarios : "Crear Nuevo Usuario SAP (SU01)",
        contentWidth: "480px",
        content: [
          new SimpleForm({
            editable: true,
            layout: "ResponsiveLayout",
            content: [
              new Label({ text: "Usuario SAP (SU01 ID)", required: true }),
              oInpUser,

              new Label({ text: "Nombre Completo", required: true }),
              oInpName,

              new Label({ text: "Email Corporativo" }),
              oInpEmail,

              new Label({ text: "Sociedad SAP (Bukrs)", required: true }),
              oSelCompany,

              new Label({ text: "Departamento / Área" }),
              oInpDept,

              new Label({ text: "Tipo de Licencia S/4HANA", required: true }),
              oSelType,

              new Label({ text: "Equivalente FUE" }),
              oInpFueVal,

              new Label({ text: "Estado del Usuario" }),
              oSelStatus
            ]
          })
        ],
        beginButton: new Button({
          text: "Guardar",
          type: "Accept",
          press: function () {
            var sUserVal = oInpUser.getValue().trim().toUpperCase();
            var sNameVal = oInpName.getValue().trim();
            var sEmailVal = oInpEmail.getValue().trim();
            var sSocVal = oSelCompany.getSelectedKey();
            var sDeptVal = oInpDept.getValue().trim();
            var sTypeVal = oSelType.getSelectedKey();
            var nFueVal = parseFloat(oInpFueVal.getValue().trim()) || 1.0;
            var sStatusVal = oSelStatus.getSelectedKey();

            if (!sUserVal || !sNameVal) {
              MessageBox.warning("Por favor ingresa el ID de Usuario y Nombre Completo.");
              return;
            }

            var sCompanyName = "PE10 - Corporación Perú S.A.C.";
            if (sSocVal === "CL20") sCompanyName = "CL20 - Corporación Chile SpA";
            else if (sSocVal === "CO30") sCompanyName = "CO30 - Corporación Colombia S.A.S.";
            else if (sSocVal === "MX40") sCompanyName = "MX40 - Corporación México S.A. de C.V.";
            else if (sSocVal === "US50") sCompanyName = "US50 - Corporación USA Inc.";

            if (bEdit) {
              var idx = aRecords.findIndex(function (r) { return r.id === oCurrentRecord.id; });
              if (idx !== -1) {
                aRecords[idx].NombreCompleto = sNameVal;
                aRecords[idx].Email = sEmailVal;
                aRecords[idx].Sociedad = sSocVal;
                aRecords[idx].Empresa = sCompanyName;
                aRecords[idx].Departamento = sDeptVal;
                aRecords[idx].TipoFue = sTypeVal;
                aRecords[idx].Fue = nFueVal;
                aRecords[idx].EstadoUsuario = sStatusVal;
              }
            } else {
              var maxId = aRecords.reduce(function (max, r) { return r.id > max ? r.id : max; }, 0);
              aRecords.push({
                id: maxId + 1,
                Periodo: "Septiembre 2026",
                Usuarios: sUserVal,
                NombreCompleto: sNameVal,
                Email: sEmailVal,
                Sociedad: sSocVal,
                Empresa: sCompanyName,
                Departamento: sDeptVal || "Operaciones",
                TipoFue: sTypeVal,
                Fue: nFueVal,
                EstadoUsuario: sStatusVal,
                UltimoLogon: "2026-09-15 09:00",
                RiesgoSOD: "Ninguno",
                Roles: ["Z_USER_STANDARD_ROLES"]
              });
            }

            this.updatePivotAndKpis(aRecords);
            this.showSuccess(bEdit ? "Usuario actualizado." : "Usuario SAP " + sUserVal + " creado.");
            this.onSearch();
            oDialog.close();
            oDialog.destroy();
          }.bind(this)
        }),
        endButton: new Button({
          text: "Cancelar",
          press: function () {
            oDialog.close();
            oDialog.destroy();
          }
        })
      });

      this.getView().addDependent(oDialog);
      oDialog.open();
    }

  });
});
