sap.ui.define([
    "com/antigravity/portalProveedores/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "com/antigravity/portalProveedores/model/formatter"
], function (BaseController, Filter, FilterOperator, MessageToast, MessageBox, formatter) {
    "use strict";

    return BaseController.extend("com.antigravity.portalProveedores.controller.ExpenseClaims", {

        formatter: formatter,

        onInit: function () {
            this.getRouter().getRoute("expenses").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function () {
        },

        onFilterSearch: function () {
            var sQuery = this.byId("searchExpenses").getValue();
            var sStatus = this.byId("selectExpenseStatus").getSelectedKey();

            var aFilters = [];
            if (sQuery) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("id", FilterOperator.Contains, sQuery),
                        new Filter("solicitante", FilterOperator.Contains, sQuery),
                        new Filter("motivo", FilterOperator.Contains, sQuery),
                        new Filter("ceco", FilterOperator.Contains, sQuery)
                    ],
                    and: false
                }));
            }

            if (sStatus && sStatus !== "ALL") {
                aFilters.push(new Filter("estado", FilterOperator.EQ, sStatus));
            }

            var oTable = this.byId("tableExpenseClaims");
            if (oTable && oTable.getBinding("items")) {
                oTable.getBinding("items").filter(aFilters);
            }
        },

        onFilterReset: function () {
            this.byId("searchExpenses").setValue("");
            this.byId("selectExpenseStatus").setSelectedKey("ALL");
            this.onFilterSearch();
        },

        onOpenNewClaimDialog: function () {
            var oNewClaimModel = new sap.ui.model.json.JSONModel({
                motivo: "",
                ceco: "CC-10020 - Consultoría",
                monto: "",
                moneda: "PEN",
                comprobantesCount: 1
            });

            if (!this._oClaimDialog) {
                this._oClaimDialog = sap.ui.xmlfragment(
                    "com.antigravity.portalProveedores.fragment.ExpenseClaimDialog",
                    this
                );
                this.getView().addDependent(this._oClaimDialog);
            }

            this._oClaimDialog.setModel(oNewClaimModel, "newClaim");
            this._oClaimDialog.open();
        },

        onSaveExpenseClaim: function () {
            var oClaimData = this._oClaimDialog.getModel("newClaim").getData();

            if (!oClaimData.motivo || !oClaimData.monto) {
                MessageBox.error("Por favor complete el motivo y monto del gasto.");
                return;
            }

            var sNewId = "RG-2024-00" + Math.floor(5 + Math.random() * 95);
            var oAppModel = this.getView().getModel("app");
            var aClaims = oAppModel.getProperty("/expenseClaims");

            aClaims.unshift({
                id: sNewId,
                fecha: new Date().toLocaleDateString("es-PE"),
                solicitante: "Carlos Mendoza",
                motivo: oClaimData.motivo,
                ceco: oClaimData.ceco,
                monto: parseFloat(oClaimData.monto),
                moneda: oClaimData.moneda,
                estado: "EN_APROBACION",
                comprobantesCount: oClaimData.comprobantesCount || 1
            });

            oAppModel.refresh(true);
            this._oClaimDialog.close();

            MessageBox.success("Rendición de Gastos " + sNewId + " creada exitosamente y enviada a aprobación.");
            this.onFilterSearch();
        },

        onCloseClaimDialog: function () {
            if (this._oClaimDialog) {
                this._oClaimDialog.close();
            }
        },

        onExportExcel: function () {
            MessageToast.show("Exportando rendiciones de gastos a Excel...");
        }

    });
});
