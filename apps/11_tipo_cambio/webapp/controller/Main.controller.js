sap.ui.define([
    "com/droidconsulting/scm/fxmanager/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
], function (BaseController, Filter, FilterOperator, Fragment, MessageToast, MessageBox, JSONModel) {
    "use strict";

    return BaseController.extend("com.droidconsulting.scm.fxmanager.controller.Main", {

        onInit: function () {
            this._aAllRates = null;
        },

        // =========================================================================
        // FILTERING & SEARCH
        // =========================================================================
        onFilterRates: function () {
            var sCompany = this.byId("filterCompanySelect").getSelectedKey();
            var sQuotType = this.byId("filterQuotTypeSelect").getSelectedKey();
            var sFCurr = this.byId("filterFCurrCombo").getValue().toUpperCase().trim();
            var sTCurr = this.byId("filterTCurrCombo").getValue().toUpperCase().trim();
            var sStatus = this.byId("filterStatusSelect").getSelectedKey();

            var aFilters = [];

            if (sCompany && sCompany !== "ALL") {
                aFilters.push(new Filter("company", FilterOperator.EQ, sCompany));
            }
            if (sQuotType && sQuotType !== "ALL") {
                aFilters.push(new Filter("kurst", FilterOperator.EQ, sQuotType));
            }
            if (sFCurr) {
                aFilters.push(new Filter("fcurr", FilterOperator.Contains, sFCurr));
            }
            if (sTCurr) {
                aFilters.push(new Filter("tcurr", FilterOperator.Contains, sTCurr));
            }
            if (sStatus && sStatus !== "ALL") {
                aFilters.push(new Filter("status", FilterOperator.EQ, sStatus));
            }

            var oTable = this.byId("tableFX");
            var oBinding = oTable.getBinding("items");
            oBinding.filter(aFilters);
        },

        onSearchRates: function (oEvent) {
            var sQuery = oEvent.getParameter("query") || oEvent.getParameter("newValue") || "";
            var aFilters = [];

            if (sQuery) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("fcurr", FilterOperator.Contains, sQuery.toUpperCase()),
                        new Filter("tcurr", FilterOperator.Contains, sQuery.toUpperCase()),
                        new Filter("kurst", FilterOperator.Contains, sQuery.toUpperCase()),
                        new Filter("validFrom", FilterOperator.Contains, sQuery),
                        new Filter("source", FilterOperator.Contains, sQuery)
                    ],
                    and: false
                }));
            }

            var oTable = this.byId("tableFX");
            var oBinding = oTable.getBinding("items");
            oBinding.filter(aFilters);
        },

        onResetFilters: function () {
            this.byId("filterCompanySelect").setSelectedKey("ALL");
            this.byId("filterQuotTypeSelect").setSelectedKey("ALL");
            this.byId("filterFCurrCombo").setValue("");
            this.byId("filterTCurrCombo").setValue("");
            this.byId("filterStatusSelect").setSelectedKey("ALL");

            this.onFilterRates();
            this.showMessageToast("Filtros restablecidos");
        },

        onTabSelect: function (oEvent) {
            var sSelectedKey = oEvent.getParameter("key");
            if (sSelectedKey === "SIMULATOR") {
                this.onRecalculateSimulations();
            }
        },

        onSwitchToSimulatorTab: function () {
            this.byId("mainIconTabBar").setSelectedKey("SIMULATOR");
            this.onRecalculateSimulations();
        },

        // =========================================================================
        // CREATE / EDIT RATE DIALOG
        // =========================================================================
        onOpenCreateRateDialog: function () {
            var oView = this.getView();

            if (!this._pCreateRateDialog) {
                this._pCreateRateDialog = Fragment.load({
                    id: oView.getId(),
                    name: "com.droidconsulting.scm.fxmanager.view.dialogs.CreateRateDialog",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }

            this._pCreateRateDialog.then(function (oDialog) {
                oDialog.open();
            });
        },

        onCloseCreateRateDialog: function () {
            if (this._pCreateRateDialog) {
                this._pCreateRateDialog.then(function (oDialog) {
                    oDialog.close();
                });
            }
        },

        onCalculateMidRate: function () {
            var sBuy = this.byId("newRateBuy").getValue();
            var sSell = this.byId("newRateSell").getValue();

            var fBuy = parseFloat(sBuy) || 0;
            var fSell = parseFloat(sSell) || 0;

            if (fBuy > 0 && fSell > 0) {
                var fMid = (fBuy + fSell) / 2;
                this.byId("newRateMid").setValue(fMid.toFixed(4));
            }
        },

        onSaveNewRate: function () {
            var sKurst = this.byId("newKurst").getSelectedKey();
            var sFCurr = this.byId("newFCurr").getValue().toUpperCase().trim();
            var sTCurr = this.byId("newTCurr").getValue().toUpperCase().trim();
            var sValidFrom = this.byId("newValidFrom").getValue();
            var fBuy = parseFloat(this.byId("newRateBuy").getValue()) || 0;
            var fSell = parseFloat(this.byId("newRateSell").getValue()) || 0;
            var fMid = parseFloat(this.byId("newRateMid").getValue()) || ((fBuy + fSell) / 2);
            var sSource = this.byId("newSource").getValue() || "Manual Finanzas";

            if (!sFCurr || !sTCurr || fBuy <= 0 || fSell <= 0) {
                this.showMessageBoxError("Por favor complete todos los campos obligatorios con valores numéricos mayores a cero.");
                return;
            }

            var oModel = this.getModel();
            var aRates = oModel.getProperty("/ExchangeRates") || [];

            var sKurstText = sKurst;
            if (sKurst === "ZSUN") sKurstText = "ZSUN (SUNAT Oficial)";
            else if (sKurst === "M") sKurstText = "M (Media)";
            else if (sKurst === "G") sKurstText = "G (Banco Compra)";
            else if (sKurst === "B") sKurstText = "B (Banco Venta)";
            else if (sKurst === "ZBAN") sKurstText = "ZBAN (Banxico FIX)";

            var oNewRate = {
                id: "FX" + (aRates.length + 101),
                fcurr: sFCurr,
                tcurr: sTCurr,
                kurst: sKurst,
                kurstText: sKurstText,
                validFrom: sValidFrom || new Date().toISOString().substring(0, 10),
                rateBuy: fBuy,
                rateSell: fSell,
                rateMid: parseFloat(fMid.toFixed(4)),
                source: sSource,
                status: "Success",
                statusText: "Válido",
                company: "1000",
                deviation: 0.00,
                editable: true
            };

            aRates.unshift(oNewRate);
            oModel.setProperty("/ExchangeRates", aRates);

            // Add Audit Log Entry
            this._addAuditLog("JPEREZ_FIN", "TCURR", "MANUAL_CREATE",
                "Registro manual de tipo de cambio " + sFCurr + "/" + sTCurr + " (" + sKurst + "): Compra " + fBuy + ", Venta " + fSell, "Success", "BAPI_EXCHANGERATE_CREATE");

            this.showMessageToast("Cotización registrada exitosamente en TCURR");
            this.onCloseCreateRateDialog();
        },

        onInlineRateChange: function (oEvent) {
            var oItem = oEvent.getSource().getParent();
            var oContext = oItem.getBindingContext();
            var oRate = oContext.getObject();

            var fBuy = parseFloat(oRate.rateBuy) || 0;
            var fSell = parseFloat(oRate.rateSell) || 0;

            if (fBuy > 0 && fSell > 0) {
                oRate.rateMid = parseFloat(((fBuy + fSell) / 2).toFixed(4));
                this.getModel().refresh(true);
            }
        },

        onDeleteSingleRate: function (oEvent) {
            var oItem = oEvent.getSource().getParent().getParent();
            var oContext = oItem.getBindingContext();
            var oRate = oContext.getObject();
            var oModel = this.getModel();

            MessageBox.confirm("¿Desea eliminar la cotización " + oRate.fcurr + "/" + oRate.tcurr + " (" + oRate.kurst + ") de la tabla TCURR?", {
                title: "Confirmar Eliminación",
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        var aRates = oModel.getProperty("/ExchangeRates");
                        var aFiltered = aRates.filter(function (r) { return r.id !== oRate.id; });
                        oModel.setProperty("/ExchangeRates", aFiltered);
                        MessageToast.show("Cotización eliminada correctamente");
                    }
                }
            });
        },

        onDeleteSelectedRates: function () {
            var oTable = this.byId("tableFX");
            var aSelectedItems = oTable.getSelectedItems();

            if (aSelectedItems.length === 0) {
                this.showMessageToast("Por favor seleccione al menos una fila para eliminar");
                return;
            }

            var oModel = this.getModel();

            MessageBox.confirm("¿Está seguro que desea eliminar " + aSelectedItems.length + " registro(s) de tipo de cambio?", {
                title: "Eliminación Masiva",
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        var aRates = oModel.getProperty("/ExchangeRates");
                        var aSelectedIds = aSelectedItems.map(function (item) {
                            return item.getBindingContext().getObject().id;
                        });

                        var aRemaining = aRates.filter(function (r) {
                            return aSelectedIds.indexOf(r.id) === -1;
                        });

                        oModel.setProperty("/ExchangeRates", aRemaining);
                        oTable.removeSelections(true);
                        MessageToast.show(aSelectedItems.length + " registro(s) eliminado(s)");
                    }
                }
            });
        },

        // =========================================================================
        // BATCH UPLOAD DIALOG (EXCEL / CSV)
        // =========================================================================
        onOpenBatchUploadDialog: function () {
            var oView = this.getView();

            if (!this._pBatchDialog) {
                this._pBatchDialog = Fragment.load({
                    id: oView.getId(),
                    name: "com.droidconsulting.scm.fxmanager.view.dialogs.BatchUploadDialog",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }

            this._pBatchDialog.then(function (oDialog) {
                oDialog.open();
            });
        },

        onCloseBatchUploadDialog: function () {
            if (this._pBatchDialog) {
                this._pBatchDialog.then(function (oDialog) {
                    oDialog.close();
                });
            }
        },

        onFileSelected: function (oEvent) {
            var oFileUploader = oEvent.getSource();
            var oFile = oEvent.getParameter("files")[0];
            var that = this;

            if (oFile) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    var sContent = e.target.result;
                    that._processCSVContent(sContent);
                };
                reader.readAsText(oFile);
            }
        },

        _processCSVContent: function (sCSVText) {
            var aLines = sCSVText.split(/\r\n|\n/);
            this._aBatchRecords = [];

            for (var i = 1; i < aLines.length; i++) {
                var sLine = aLines[i].trim();
                if (!sLine) continue;

                var aCols = sLine.split(",");
                if (aCols.length >= 5) {
                    var sKurst = aCols[0].trim() || "ZSUN";
                    var sFCurr = aCols[1].trim().toUpperCase() || "USD";
                    var sTCurr = aCols[2].trim().toUpperCase() || "PEN";
                    var sValidFrom = aCols[3].trim() || "2026-09-08";
                    var fBuy = parseFloat(aCols[4].trim()) || 3.7500;
                    var fSell = parseFloat(aCols[5] ? aCols[5].trim() : fBuy) || fBuy;

                    this._aBatchRecords.push({
                        id: "BATCH" + (i + 100),
                        fcurr: sFCurr,
                        tcurr: sTCurr,
                        kurst: sKurst,
                        kurstText: sKurst + " (Carga Masiva)",
                        validFrom: sValidFrom,
                        rateBuy: fBuy,
                        rateSell: fSell,
                        rateMid: parseFloat(((fBuy + fSell) / 2).toFixed(4)),
                        source: "Carga Masiva CSV",
                        status: "Success",
                        statusText: "Válido",
                        company: "1000",
                        deviation: 0.00,
                        editable: true
                    });
                }
            }

            if (this._aBatchRecords.length === 0) {
                // Generate mock records for preview if file had no valid CSV structure
                this._aBatchRecords = [
                    { id: "B1", fcurr: "USD", tcurr: "PEN", kurst: "ZSUN", kurstText: "ZSUN (SUNAT)", validFrom: "2026-09-09", rateBuy: 3.7610, rateSell: 3.7650, rateMid: 3.7630, source: "Archivo Excel", status: "Success", statusText: "Válido", company: "1000", editable: true },
                    { id: "B2", fcurr: "EUR", tcurr: "PEN", kurst: "M", kurstText: "M (Media)", validFrom: "2026-09-09", rateBuy: 4.1350, rateSell: 4.1400, rateMid: 4.1375, source: "Archivo Excel", status: "Success", statusText: "Válido", company: "1000", editable: true }
                ];
            }

            this.byId("btnConfirmBatch").setEnabled(true);
            this.byId("batchMessageStrip").setText("Se identificaron " + this._aBatchRecords.length + " registro(s) válidos listos para inyección en TCURR.");
            this.byId("batchMessageStrip").setType("Success");
        },

        onExecuteBatchUpload: function () {
            if (!this._aBatchRecords || this._aBatchRecords.length === 0) return;

            var oModel = this.getModel();
            var aRates = oModel.getProperty("/ExchangeRates") || [];

            this._aBatchRecords.forEach(function (r) {
                aRates.unshift(r);
            });

            oModel.setProperty("/ExchangeRates", aRates);

            this._addAuditLog("USER_IMPORT", "TCURR", "BATCH_UPLOAD",
                "Ingesta masiva exitosa de " + this._aBatchRecords.length + " registros de tipos de cambio vía Excel/CSV.", "Success", "BAPI_EXCHANGERATE_CREATE");

            this.showMessageToast(this._aBatchRecords.length + " cotizaciones inyectadas correctamente en TCURR");
            this.onCloseBatchUploadDialog();
        },

        // =========================================================================
        // MARKET API SYNC DIALOG (SUNAT, REFINITIV, CPI)
        // =========================================================================
        onOpenSyncConfigDialog: function () {
            var oView = this.getView();

            if (!this._pSyncDialog) {
                this._pSyncDialog = Fragment.load({
                    id: oView.getId(),
                    name: "com.droidconsulting.scm.fxmanager.view.dialogs.SyncConfigDialog",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }

            this._pSyncDialog.then(function (oDialog) {
                oDialog.open();
            });
        },

        onCloseSyncConfigDialog: function () {
            if (this._pSyncDialog) {
                this._pSyncDialog.then(function (oDialog) {
                    oDialog.close();
                });
            }
        },

        onExecuteMarketSync: function () {
            var sProvider = this.byId("syncProvider").getSelectedKey();
            var oModel = this.getModel();

            var aRates = oModel.getProperty("/ExchangeRates") || [];
            var dNow = new Date().toISOString().substring(0, 10);

            // Simulate updating rates with fresh API data
            var oSunatUSD = aRates.find(function (r) { return r.fcurr === "USD" && r.tcurr === "PEN" && r.kurst === "ZSUN"; });
            if (oSunatUSD) {
                oSunatUSD.rateBuy = 3.7580;
                oSunatUSD.rateSell = 3.7620;
                oSunatUSD.rateMid = 3.7600;
                oSunatUSD.validFrom = dNow;
                oSunatUSD.source = "API SUNAT (Sincronizado)";
            }

            var oEurM = aRates.find(function (r) { return r.fcurr === "EUR" && r.tcurr === "PEN" && r.kurst === "M"; });
            if (oEurM) {
                oEurM.rateBuy = 4.1280;
                oEurM.rateSell = 4.1330;
                oEurM.rateMid = 4.1305;
                oEurM.validFrom = dNow;
                oEurM.source = sProvider + " BTP";
            }

            oModel.setProperty("/ExchangeRates", aRates);

            // Update KPI Card
            oModel.setProperty("/KPIs/syncStatus", "100% Sincronizado");
            oModel.setProperty("/KPIs/syncSubtext", "Última ejecución: " + new Date().toLocaleTimeString() + " (Proveedor: " + sProvider + ")");

            // Add SLG1 Audit log entry
            this._addAuditLog("BATCH_JOB_CPI", "TCURR", "AUTOMATED_SYNC",
                "Sincronización en tiempo real completada vía " + sProvider + ". Actualizadas tasas oficiales TCURR.", "Success", "BAPI_EXCHANGERATE_CREATE");

            this.showMessageToast("Sincronización completada exitosamente con " + sProvider);
            this.onCloseSyncConfigDialog();
        },

        // =========================================================================
        // LOGISTICS & MM COST IMPACT SIMULATOR
        // =========================================================================
        onSimulationRateChange: function (oEvent) {
            var oItem = oEvent.getSource().getParent();
            var oContext = oItem.getBindingContext();
            var oSim = oContext.getObject();

            this._recalculateSingleSimulation(oSim);
            this.getModel().refresh(true);
        },

        onRecalculateSimulations: function () {
            var oModel = this.getModel();
            var aSims = oModel.getProperty("/Simulations") || [];

            var that = this;
            aSims.forEach(function (sim) {
                that._recalculateSingleSimulation(sim);
            });

            oModel.setProperty("/Simulations", aSims);
            this.showMessageToast("Recálculo de impacto logístico actualizado para todas las OCs.");
        },

        _recalculateSingleSimulation: function (oSim) {
            var fBaseFOB = parseFloat(oSim.basePriceFOB) || 0;
            var fQuantity = parseFloat(oSim.quantity) || 1;
            var fFreight = parseFloat(oSim.freightUSD) || 0;
            var fInsurance = parseFloat(oSim.insuranceUSD) || 0;
            var fTariffPct = parseFloat(oSim.customsTariffPercent) || 0;
            var fIgvPct = parseFloat(oSim.igvPercent) || 18;

            var fRateOld = parseFloat(oSim.currentRate) || 1;
            var fRateNew = parseFloat(oSim.simulatedRate) || fRateOld;

            // Calculation Scheme ZM0002 (Import Direct) vs ZM0000 (Local)
            var fTotalFOB_USD = fBaseFOB * fQuantity;
            var fTotalCIF_USD = fTotalFOB_USD + fFreight + fInsurance;

            // Old Landed PEN
            var fCifPEN_Old = fTotalCIF_USD * fRateOld;
            var fTariffPEN_Old = fCifPEN_Old * (fTariffPct / 100);
            var fSubtotalPEN_Old = fCifPEN_Old + fTariffPEN_Old;
            var fIgvPEN_Old = fSubtotalPEN_Old * (fIgvPct / 100);
            var fLandedPEN_Old = fSubtotalPEN_Old + fIgvPEN_Old;

            // New Landed PEN
            var fCifPEN_New = fTotalCIF_USD * fRateNew;
            var fTariffPEN_New = fCifPEN_New * (fTariffPct / 100);
            var fSubtotalPEN_New = fCifPEN_New + fTariffPEN_New;
            var fIgvPEN_New = fSubtotalPEN_New * (fIgvPct / 100);
            var fLandedPEN_New = fSubtotalPEN_New + fIgvPEN_New;

            oSim.currentLandedPEN = parseFloat(fLandedPEN_Old.toFixed(2));
            oSim.simulatedLandedPEN = parseFloat(fLandedPEN_New.toFixed(2));

            var fDiff = fLandedPEN_New - fLandedPEN_Old;
            oSim.varianceAmount = parseFloat(fDiff.toFixed(2));

            var fPct = fLandedPEN_Old > 0 ? (fDiff / fLandedPEN_Old) * 100 : 0;
            oSim.variancePercent = parseFloat(fPct.toFixed(2));

            if (fPct > 1.5) {
                oSim.status = "Warning";
            } else if (fPct < 0) {
                oSim.status = "Success";
            } else {
                oSim.status = "Information";
            }
        },

        onOpenSimulationDetails: function (oEvent) {
            var oItem = oEvent.getSource().getParent().getParent();
            var oContext = oItem.getBindingContext();
            var oSim = oContext.getObject();

            // Prepare breakdown data for fragment model
            var fBaseFOB = parseFloat(oSim.basePriceFOB) * parseFloat(oSim.quantity);
            var fFreight = parseFloat(oSim.freightUSD) || 0;
            var fInsurance = parseFloat(oSim.insuranceUSD) || 0;

            var fRateOld = parseFloat(oSim.currentRate);
            var fRateNew = parseFloat(oSim.simulatedRate);

            var aConditions = [
                {
                    condCode: "PB00",
                    condName: "Precio Base FOB (Total " + oSim.quantity + " " + oSim.unit + ")",
                    amountFCurr: fBaseFOB.toFixed(2),
                    amountOldPEN: (fBaseFOB * fRateOld).toFixed(2),
                    amountNewPEN: (fBaseFOB * fRateNew).toFixed(2),
                    diffPEN: ((fBaseFOB * fRateNew) - (fBaseFOB * fRateOld)).toFixed(2)
                },
                {
                    condCode: "FRB1",
                    condName: "Flete Internacional / Nacional",
                    amountFCurr: fFreight.toFixed(2),
                    amountOldPEN: (fFreight * fRateOld).toFixed(2),
                    amountNewPEN: (fFreight * fRateNew).toFixed(2),
                    diffPEN: ((fFreight * fRateNew) - (fFreight * fRateOld)).toFixed(2)
                },
                {
                    condCode: "INS1",
                    condName: "Seguro de Transporte",
                    amountFCurr: fInsurance.toFixed(2),
                    amountOldPEN: (fInsurance * fRateOld).toFixed(2),
                    amountNewPEN: (fInsurance * fRateNew).toFixed(2),
                    diffPEN: ((fInsurance * fRateNew) - (fInsurance * fRateOld)).toFixed(2)
                },
                {
                    condCode: "ZADV",
                    condName: "Arancel de Aduana Ad-Valorem (" + oSim.customsTariffPercent + "%)",
                    amountFCurr: "-",
                    amountOldPEN: (((fBaseFOB + fFreight + fInsurance) * fRateOld) * (oSim.customsTariffPercent / 100)).toFixed(2),
                    amountNewPEN: (((fBaseFOB + fFreight + fInsurance) * fRateNew) * (oSim.customsTariffPercent / 100)).toFixed(2),
                    diffPEN: ((((fBaseFOB + fFreight + fInsurance) * fRateNew) * (oSim.customsTariffPercent / 100)) - (((fBaseFOB + fFreight + fInsurance) * fRateOld) * (oSim.customsTariffPercent / 100))).toFixed(2)
                },
                {
                    condCode: "MWST",
                    condName: "Impuesto IGV / IVA (" + oSim.igvPercent + "%)",
                    amountFCurr: "-",
                    amountOldPEN: (oSim.currentLandedPEN - ((fBaseFOB + fFreight + fInsurance) * fRateOld * (1 + oSim.customsTariffPercent / 100))).toFixed(2),
                    amountNewPEN: (oSim.simulatedLandedPEN - ((fBaseFOB + fFreight + fInsurance) * fRateNew * (1 + oSim.customsTariffPercent / 100))).toFixed(2),
                    diffPEN: ((oSim.simulatedLandedPEN - ((fBaseFOB + fFreight + fInsurance) * fRateNew * (1 + oSim.customsTariffPercent / 100))) - (oSim.currentLandedPEN - ((fBaseFOB + fFreight + fInsurance) * fRateOld * (1 + oSim.customsTariffPercent / 100)))).toFixed(2)
                }
            ];

            var oDetailModel = new JSONModel({
                poNumber: oSim.poNumber,
                material: oSim.material,
                materialDesc: oSim.materialDesc,
                vendor: oSim.vendor,
                schemeName: oSim.schemeName,
                quantity: oSim.quantity,
                unit: oSim.unit,
                fcurr: oSim.fcurr,
                currentRate: oSim.currentRate,
                simulatedRate: oSim.simulatedRate,
                currentLandedPEN: oSim.currentLandedPEN,
                simulatedLandedPEN: oSim.simulatedLandedPEN,
                varianceAmount: oSim.varianceAmount,
                variancePercent: oSim.variancePercent,
                status: oSim.status,
                pricingConditions: aConditions
            });

            var oView = this.getView();

            if (!this._pSimDetailDialog) {
                this._pSimDetailDialog = Fragment.load({
                    id: oView.getId(),
                    name: "com.droidconsulting.scm.fxmanager.view.dialogs.SimulationDetailsDialog",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }

            this._pSimDetailDialog.then(function (oDialog) {
                oDialog.setModel(oDetailModel, "simulationDetail");
                oDialog.open();
            });
        },

        onCloseSimDetailDialog: function () {
            if (this._pSimDetailDialog) {
                this._pSimDetailDialog.then(function (oDialog) {
                    oDialog.close();
                });
            }
        },

        // =========================================================================
        // EXPORT & LOG AUDIT HELPERS
        // =========================================================================
        onExportExcel: function () {
            var aRates = this.getModel().getProperty("/ExchangeRates") || [];
            var sHeader = "FCURR,TCURR,KURST,FechaValidez,TasaCompra,TasaVenta,TasaMedia,Fuente,Estado\n";

            var sCSVContent = sHeader + aRates.map(function (r) {
                return [r.fcurr, r.tcurr, r.kurst, r.validFrom, r.rateBuy, r.rateSell, r.rateMid, r.source, r.statusText].join(",");
            }).join("\n");

            var blob = new Blob([sCSVContent], { type: "text/csv;charset=utf-8;" });
            var link = document.createElement("a");
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "Reporte_Tipos_de_Cambio_TCURR.csv");
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            this.showMessageToast("Reporte descargado como Reporte_Tipos_de_Cambio_TCURR.csv");
        },

        onDownloadAuditLog: function () {
            var aLogs = this.getModel().getProperty("/AuditLogs") || [];
            var sText = aLogs.map(function (l) {
                return "[" + l.timestamp + "] [" + l.user + "] [" + l.bapi + "] " + l.details;
            }).join("\n");

            var blob = new Blob([sText], { type: "text/plain;charset=utf-8;" });
            var link = document.createElement("a");
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "SLG1_Audit_Log_Tipos_Cambio.txt");
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            this.showMessageToast("Log de auditoría descargado exitosamente");
        },

        _addAuditLog: function (sUser, sObject, sAction, sDetails, sStatus, sBapi) {
            var oModel = this.getModel();
            var aLogs = oModel.getProperty("/AuditLogs") || [];

            var dNow = new Date();
            var sFormattedDate = dNow.toISOString().substring(0, 10) + " " + dNow.toTimeString().substring(0, 8);

            aLogs.unshift({
                timestamp: sFormattedDate,
                user: sUser,
                object: sObject,
                action: sAction,
                details: sDetails,
                status: sStatus,
                bapi: sBapi
            });

            oModel.setProperty("/AuditLogs", aLogs);
        }
    });
});
