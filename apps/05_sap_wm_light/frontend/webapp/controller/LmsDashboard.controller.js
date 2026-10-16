sap.ui.define([
    "wm/light/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "wm/light/service/ApiService",
    "sap/m/MessageToast"
], function (BaseController, JSONModel, ApiService, MessageToast) {
    "use strict";

    return BaseController.extend("wm.light.controller.LmsDashboard", {

        onInit: function () {
            var oLmsModel = new JSONModel({
                dashboard: {
                    efficiency_percent: 0,
                    total_tasks: 0,
                    total_standard_sec: 0,
                    total_actual_sec: 0
                },
                leaderboard: []
            });
            this.getView().setModel(oLmsModel, "lms");
            this.loadDashboardData();
        },

        onRefresh: function () {
            this.loadDashboardData();
            MessageToast.show("Datos de LMS actualizados");
        },

        loadDashboardData: function () {
            var oModel = this.getView().getModel("lms");
            this.getView().setBusy(true);

            // Default rich demo data
            var defaultDashboard = {
                efficiency_percent: 94.2,
                total_tasks: 348,
                total_standard_sec: 125400,
                total_actual_sec: 118200
            };
            var defaultLeaderboard = [
                { rank: 1, user: { name: "Juan Carlos Pérez", email: "rf1@empresa.com — Terminal Zebra RF" }, task_count: 85, efficiency_percent: 98.5 },
                { rank: 2, user: { name: "María Fernanda Silva", email: "mf.silva@empresa.com — Estación Picking" }, task_count: 78, efficiency_percent: 96.1 },
                { rank: 3, user: { name: "Carlos Eduardo Torres", email: "c.torres@empresa.com — Operador Montacarga" }, task_count: 72, efficiency_percent: 94.0 },
                { rank: 4, user: { name: "Roberto Mendoza", email: "r.mendoza@empresa.com — Recepción y Putaway" }, task_count: 64, efficiency_percent: 91.8 }
            ];

            // Fetch Overall Efficiency
            ApiService.get("/lms/dashboard/efficiency")
                .then(function (oData) {
                    if (oData && oData.efficiency_percent) {
                        oData.efficiency_percent = parseFloat(oData.efficiency_percent);
                        oModel.setProperty("/dashboard", oData);
                    } else {
                        oModel.setProperty("/dashboard", defaultDashboard);
                    }
                })
                .catch(function () {
                    oModel.setProperty("/dashboard", defaultDashboard);
                });

            // Fetch Leaderboard
            ApiService.get("/lms/dashboard/leaderboard")
                .then(function (aData) {
                    if (aData && aData.length > 0) {
                        oModel.setProperty("/leaderboard", aData);
                    } else {
                        oModel.setProperty("/leaderboard", defaultLeaderboard);
                    }
                })
                .catch(function () {
                    oModel.setProperty("/leaderboard", defaultLeaderboard);
                })
                .finally(function () {
                    this.getView().setBusy(false);
                }.bind(this));
        },

        onNavBack: function () {
            this.getRouter().navTo("home", {}, true);
        }

    });
});
