sap.ui.define([
    "wm/light/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "wm/light/service/ApiService",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (BaseController, JSONModel, ApiService, MessageToast, MessageBox) {
    "use strict";

    return BaseController.extend("wm.light.controller.SlottingDashboard", {

        onInit: function () {
            var oSlottingModel = new JSONModel({
                recommendations: []
            });
            this.getView().setModel(oSlottingModel, "slotting");
            this.loadRecommendations();
        },

        onRefresh: function () {
            this.loadRecommendations();
        },

        loadRecommendations: function () {
            var oModel = this.getView().getModel("slotting");
            this.getView().setBusy(true);

            var defaultRecs = [
                { id: 1, material_code: "4500001", material_desc: "Cable UTP Cat6 305m", current_bin: "C-03-01-01", recommended_bin: "A-01-01-01", abc_classification: "A", reason: "Alta rotación (Fast Mover) — Mover a zona frontal de acceso rápido", estimated_saving_min: 45, status: "PENDING" },
                { id: 2, material_code: "4500002", material_desc: "Switch 24 puertos PoE Cisco", current_bin: "B-02-02-01", recommended_bin: "B-02-01-01", abc_classification: "A", reason: "Optimización ergonómica a nivel de cintura para picking ágil", estimated_saving_min: 30, status: "PENDING" },
                { id: 3, material_code: "4500005", material_desc: "UPS 1500VA APC Line-Interactive", current_bin: "A-01-01-02", recommended_bin: "A-01-02-01", abc_classification: "C", reason: "Baja rotación (Slow Mover) — Reubicar a rack de almacenamiento masivo", estimated_saving_min: 15, status: "PENDING" }
            ];

            ApiService.get("/slotting/recommendations")
                .then(function (aData) {
                    if (aData && aData.length > 0) {
                        oModel.setProperty("/recommendations", aData);
                    } else {
                        oModel.setProperty("/recommendations", defaultRecs);
                    }
                })
                .catch(function () {
                    oModel.setProperty("/recommendations", defaultRecs);
                })
                .finally(function () {
                    this.getView().setBusy(false);
                }.bind(this));
        },

        onRunEngine: function () {
            MessageBox.confirm("¿Ejecutar el motor de Slotting Inteligente? Esto analizará el histórico y generará nuevas recomendaciones.", {
                title: "Ejecutar Slotting",
                onClose: async function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        this.getView().setBusy(true);
                        try {
                            var res = await ApiService.post("/slotting/run-analysis", {});
                            MessageToast.show(res.message);
                            this.loadRecommendations();
                        } catch (e) {
                            this.showError(e.message);
                        } finally {
                            this.getView().setBusy(false);
                        }
                    }
                }.bind(this)
            });
        },

        onApproveRec: async function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("slotting");
            var sId = oContext.getProperty("id");
            
            this.getView().setBusy(true);
            try {
                var res = await ApiService.post("/slotting/recommendations/" + sId + "/approve");
                MessageToast.show(res.message + " (" + res.to_number + ")");
                this.loadRecommendations();
            } catch (e) {
                this.showError(e.message);
            } finally {
                this.getView().setBusy(false);
            }
        },

        onRejectRec: async function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("slotting");
            var sId = oContext.getProperty("id");
            
            try {
                await ApiService.post("/slotting/recommendations/" + sId + "/reject");
                MessageToast.show("Recomendación rechazada");
                this.loadRecommendations();
            } catch (e) {
                this.showError(e.message);
            }
        },

        onNavBack: function () {
            this.getRouter().navTo("home", {}, true);
        }

    });
});
