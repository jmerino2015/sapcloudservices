sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel"
], function (Controller, Filter, FilterOperator, MessageToast, MessageBox, Fragment, JSONModel) {
    "use strict";

    return Controller.extend("com.droidconsulting.entregasRendir.controller.Main", {

        onInit: function () {
        },

        statusState: function (sStatus) {
            switch (sStatus) {
                case "COMPENSADO_CERRADO":
                case "CONTABILIZADO":
                case "FIRMADO_VALIDADO":
                case "OPERATIVA":
                case "COMPLETADO":
                case "APROBADO_EXPRESS":
                    return "Success";
                case "EN_RENDICION":
                case "EN_APROBACION":
                case "EN_REVISION":
                case "REPOSICION_SOLICITADA":
                case "EXTENSION_SOLICITADA":
                    return "Warning";
                case "BORRADOR":
                    return "None";
                case "REEMBOLSADO":
                case "PAGO_TESORERIA":
                    return "Information";
                default:
                    return "None";
            }
        },

        stepHighlight: function (sStatus) {
            if (sStatus === "COMPLETED") return "Success";
            if (sStatus === "IN_PROGRESS") return "Warning";
            return "None";
        },

        onToggleMobileDemo: function () {
            var oAppModel = this.getView().getModel("app");
            var bCurrent = oAppModel.getProperty("/isMobileDemo") || false;
            oAppModel.setProperty("/isMobileDemo", !bCurrent);
            MessageToast.show(!bCurrent ? "📱 Modo Celular (Demo Mobile) Activado" : "💻 Modo Escritorio Activado");
        },

        onNavToMenu: function () {
            var oAppModel = this.getView().getModel("app");
            oAppModel.setProperty("/activeSubProcess", "MENU");
            MessageToast.show("Menú Principal de Sub-Procesos");
        },

        onSelectSubProcess: function (oEvent) {
            var oCard = oEvent.getSource();
            var sKey = oCard.data("processKey");
            if (sKey) {
                var oModel = this.getView().getModel("app");
                oModel.setProperty("/activeSubProcess", sKey);
                MessageToast.show("Vista Activa: " + this._getSubProcessName(sKey));
            }
        },

        _getSubProcessName: function (sKey) {
            switch (sKey) {
                case "DASHBOARD": return "Dashboard de Indicadores 📊";
                case "ENTREGAS": return "Entregas a rendir";
                case "VIAJES": return "Viajes y viáticos";
                case "CAJA_CHICA": return "Cajas chicas";
                case "KILOMETRAJE": return "Gastos de kilometraje";
                case "FIRMA_DIGITAL": return "Firma Digital ✨";
                case "PV_SD_BRIDGE": return "Liquidación PV SD & Cuenta Puente 🏬";
                default: return sKey;
            }
        },

        // ── 1. Avance Operativo Directo (10 Pasos) ─────────────────────────────
        onAdvanceStep: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("app");
            if (!oContext) return;

            var oClaim = oContext.getObject();
            var iCurrent = oClaim.currentStep || 1;

            if (iCurrent >= 10) {
                MessageBox.information("La solicitud " + oClaim.id + " ya se encuentra en el Paso 10 (Compensado & Cerrado en SAP FI).");
                return;
            }

            var iNextStep = iCurrent + 1;
            this._executeStepLogic(oClaim, iNextStep);

            var oAppModel = this.getView().getModel("app");
            oAppModel.refresh(true);
        },

        _executeStepLogic: function (oClaim, iStep) {
            oClaim.currentStep = iStep;

            switch (iStep) {
                case 2:
                    oClaim.codigoFI = "ACR-400" + Math.floor(100 + Math.random() * 900);
                    oClaim.stepLabel = "Paso 2/10 - Código FI Asignado (" + oClaim.codigoFI + ")";
                    oClaim.estado = "EN_APROBACION";
                    MessageToast.show("Paso 2 Ejecutado: Código FI " + oClaim.codigoFI + " generado para " + oClaim.id);
                    break;
                case 3:
                    oClaim.stepLabel = "Paso 3/10 - Aprobación de Orden de Pago OP";
                    oClaim.estado = "OP_APROBADA";
                    MessageToast.show("Paso 3 Ejecutado: Orden de Pago Aprobada por Jefatura.");
                    break;
                case 4:
                    oClaim.pagoTesoreria = "TES-88" + Math.floor(1000 + Math.random() * 9000);
                    oClaim.stepLabel = "Paso 4/10 - Desembolso efectuado por Tesorería";
                    oClaim.estado = "PAGO_TESORERIA";
                    MessageToast.show("Paso 4 Ejecutado: Pago N° " + oClaim.pagoTesoreria + " realizado por Tesorería.");
                    break;
                case 5:
                    oClaim.stepLabel = "Paso 5/10 - Rendición con comprobantes XML/PDF";
                    oClaim.estado = "EN_RENDICION";
                    MessageToast.show("Paso 5 Ejecutado: Comprobantes adjuntados por el Empleado.");
                    break;
                case 6:
                    oClaim.stepLabel = "Paso 6/10 - Aprobación de Rendición de Gastos";
                    oClaim.estado = "RENDICION_APROBADA";
                    MessageToast.show("Paso 6 Ejecutado: Rendición Aprobada por la Jefatura.");
                    break;
                case 7:
                    oClaim.sunatStatus = "ACEPTADO_SUNAT";
                    oClaim.stepLabel = "Paso 7/10 - Comprobante Validado en SUNAT";
                    oClaim.estado = "VALIDADO_SUNAT";
                    MessageToast.show("Paso 7 Ejecutado: Comprobante verificado con Web Service SUNAT (Estado ACEPTADO).");
                    break;
                case 8:
                    oClaim.sapDoc = "SAP-1000" + Math.floor(400000 + Math.random() * 90000);
                    oClaim.stepLabel = "Paso 8/10 - Asiento Contable Registrado en SAP (MIGO " + (oClaim.notaIngreso || "NI-2026-00941") + ")";
                    oClaim.estado = "CONTABILIZADO";
                    MessageToast.show("Paso 8 Ejecutado: Asiento en SAP S/4HANA N° " + oClaim.sapDoc + " con Nota Ingreso MIGO.");
                    break;
                case 9:
                    oClaim.stepLabel = "Paso 9/10 - Liquidación de Documentos (Saldo S/ 0.00)";
                    oClaim.estado = "LIQUIDADO";
                    MessageToast.show("Paso 9 Ejecutado: Liquidación contable procesada sin observaciones.");
                    break;
                case 10:
                    oClaim.compensacionStatus = "COMPENSADO_FI";
                    oClaim.stepLabel = "Paso 10/10 - Compensación & Cierre Definitivo FI";
                    oClaim.estado = "COMPENSADO_CERRADO";
                    MessageBox.success("¡Flujo Completo Finalizado!\nSolicitud " + oClaim.id + " compensada y cerrada en SAP FI.");
                    break;
            }
        },

        // ── 2. Modal de Gestión Operativa (10 Pasos) ───────────────────────────
        onOpenProcessFlowDialog: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("app");
            var oClaim = oContext ? oContext.getObject() : null;
            if (!oClaim) return;

            this._currentSelectedClaim = oClaim;
            this._buildFlowDialogModel(oClaim);
        },

        _buildFlowDialogModel: function (oClaim) {
            var iCurrent = oClaim.currentStep || 1;

            var aSteps = [
                { stepNum: 1, title: "1. Creación de Solicitud OP", actor: "Empleado", status: iCurrent > 1 ? "COMPLETED" : (iCurrent === 1 ? "IN_PROGRESS" : "PENDING"), statusText: iCurrent > 1 ? "Completado" : (iCurrent === 1 ? "Acción Requerida" : "Pendiente"), details: "OP Registrada: " + (oClaim.opNumero || "OP-99201") },
                { stepNum: 2, title: "2. Código Deudor/Acreedor FI", actor: "Contabilidad", status: iCurrent > 2 ? "COMPLETED" : (iCurrent === 2 ? "IN_PROGRESS" : "PENDING"), statusText: iCurrent > 2 ? "Completado" : (iCurrent === 2 ? "Acción Requerida" : "Pendiente"), details: "Código FI: " + (oClaim.codigoFI || "Sin Asignar") },
                { stepNum: 3, title: "3. Aprobación de Orden OP", actor: "Aprobador", status: iCurrent > 3 ? "COMPLETED" : (iCurrent === 3 ? "IN_PROGRESS" : "PENDING"), statusText: iCurrent > 3 ? "Completado" : (iCurrent === 3 ? "Acción Requerida" : "Pendiente"), details: "Aprobación Jefatura Directa" },
                { stepNum: 4, title: "4. Pago / Desembolso OP", actor: "Tesorería", status: iCurrent > 4 ? "COMPLETED" : (iCurrent === 4 ? "IN_PROGRESS" : "PENDING"), statusText: iCurrent > 4 ? "Completado" : (iCurrent === 4 ? "Acción Requerida" : "Pendiente"), details: "Pago Tesorería: " + (oClaim.pagoTesoreria || "Pendiente") },
                { stepNum: 5, title: "5. Rendición con Comprobantes", actor: "Empleado", status: iCurrent > 5 ? "COMPLETED" : (iCurrent === 5 ? "IN_PROGRESS" : "PENDING"), statusText: iCurrent > 5 ? "Completado" : (iCurrent === 5 ? "Acción Requerida" : "Pendiente"), details: "Adjuntos Facturas XML/PDF" },
                { stepNum: 6, title: "6. Aprobación de Rendición", actor: "Aprobador", status: iCurrent > 6 ? "COMPLETED" : (iCurrent === 6 ? "IN_PROGRESS" : "PENDING"), statusText: iCurrent > 6 ? "Completado" : (iCurrent === 6 ? "Acción Requerida" : "Pendiente"), details: "Revisión y Conformidad Gasto" },
                { stepNum: 7, title: "7. Validación SUNAT", actor: "Contabilidad/SUNAT", status: iCurrent > 7 ? "COMPLETED" : (iCurrent === 7 ? "IN_PROGRESS" : "PENDING"), statusText: iCurrent > 7 ? "Completado" : (iCurrent === 7 ? "Acción Requerida" : "Pendiente"), details: "Estado SUNAT: " + (oClaim.sunatStatus || "Pendiente") },
                { stepNum: 8, title: "8. Contabilización SAP", actor: "Contabilidad", status: iCurrent > 8 ? "COMPLETED" : (iCurrent === 8 ? "IN_PROGRESS" : "PENDING"), statusText: iCurrent > 8 ? "Completado" : (iCurrent === 8 ? "Acción Requerida" : "Pendiente"), details: "Asiento SAP FI: " + (oClaim.sapDoc || "Pendiente") + " | Ref MIGO: " + (oClaim.notaIngreso || "NI-2026-00941") },
                { stepNum: 9, title: "9. Liquidación de Documentos", actor: "Contabilidad", status: iCurrent > 9 ? "COMPLETED" : (iCurrent === 9 ? "IN_PROGRESS" : "PENDING"), statusText: iCurrent > 9 ? "Completado" : (iCurrent === 9 ? "Acción Requerida" : "Pendiente"), details: "Calculo Saldos (Saldo S/ 0.00)" },
                { stepNum: 10, title: "10. Compensación & Cierre FI", actor: "Contabilidad", status: iCurrent === 10 ? "COMPLETED" : "PENDING", statusText: iCurrent === 10 ? "Cerrado & Compensado" : "Pendiente", details: "Cierre de Expediente FI SAP" }
            ];

            var oFlowModel = new JSONModel({
                id: oClaim.id,
                motivo: oClaim.motivo,
                solicitante: oClaim.solicitante,
                ceco: oClaim.ceco,
                monto: oClaim.monto,
                moneda: oClaim.moneda,
                notaIngreso: oClaim.notaIngreso || "NI-2026-00941",
                currentStep: iCurrent,
                stepLabel: oClaim.stepLabel,
                percent: iCurrent * 10,
                steps: aSteps
            });

            var that = this;
            if (!this._oFlowDialog) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "com.droidconsulting.entregasRendir.fragment.ProcessFlowDialog",
                    controller: this
                }).then(function (oDialog) {
                    that._oFlowDialog = oDialog;
                    that.getView().addDependent(that._oFlowDialog);
                    that._oFlowDialog.setModel(oFlowModel, "flowDetail");
                    that._oFlowDialog.open();
                });
            } else {
                this._oFlowDialog.setModel(oFlowModel, "flowDetail");
                this._oFlowDialog.open();
            }
        },

        onExecuteNextStepFromDialog: function () {
            if (!this._currentSelectedClaim) return;

            var iCurrent = this._currentSelectedClaim.currentStep || 1;
            if (iCurrent >= 10) {
                MessageBox.information("El flujo de 10 pasos ya fue completado totalmente.");
                return;
            }

            var iNextStep = iCurrent + 1;
            this._executeStepLogic(this._currentSelectedClaim, iNextStep);

            var oAppModel = this.getView().getModel("app");
            oAppModel.refresh(true);

            // Rebuild dialog view
            this._buildFlowDialogModel(this._currentSelectedClaim);
        },

        onCloseFlowDialog: function () {
            if (this._oFlowDialog) {
                this._oFlowDialog.close();
            }
        },

        // ── 3. Dialog Form Nueva Rendición ──────────────────────────────────────
        onOpenNewClaimDialog: function () {
            var oClaimFormModel = new JSONModel({
                solicitante: "Carlos Mendoza (Consultor SAP FI)",
                codigoAcreedorFI: "ACR-400192 (Acreedor FI Empleado)",
                ceco: "CC-1002",
                sociedad: "1000",
                motivo: "Viaje Técnico Inspección Planta Arequipa",
                notaIngreso: "NI-2026-00941 (Mercadería SAP MIGO)",
                tipoDoc: "01",
                rucProveedor: "20517426726",
                razonSocialProveedor: "SERVICIOS EMPRESARIALES S.A.C.",
                serie: "F001",
                correlativo: "0042910",
                monto: "1850.00",
                igv: "282.20",
                moneda: "PEN",
                samplePdfName: "Factura_Electronica_F001-0042910.pdf (342 KB)",
                selectedSamplePdf: "PDF_1",
                ocrExecuted: false,
                ocrStatusText: "",
                ocrStatusType: "None"
            });

            var that = this;
            if (!this._oNewClaimDialog) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "com.droidconsulting.entregasRendir.fragment.NewClaimDialog",
                    controller: this
                }).then(function (oDialog) {
                    that._oNewClaimDialog = oDialog;
                    that.getView().addDependent(that._oNewClaimDialog);
                    that._oNewClaimDialog.setModel(oClaimFormModel, "claimForm");
                    that._oNewClaimDialog.open();
                });
            } else {
                this._oNewClaimDialog.setModel(oClaimFormModel, "claimForm");
                this._oNewClaimDialog.open();
            }
        },

        onSamplePdfChange: function (oEvent) {
            if (!this._oNewClaimDialog) return;
            var oFormModel = this._oNewClaimDialog.getModel("claimForm");
            var sKey = oEvent.getParameter("selectedItem").getKey();
            oFormModel.setProperty("/selectedSamplePdf", sKey);
            oFormModel.setProperty("/ocrExecuted", false);
            oFormModel.setProperty("/ocrStatusText", "");
            oFormModel.setProperty("/ocrStatusType", "None");

            if (sKey === "PDF_1") {
                oFormModel.setProperty("/samplePdfName", "Factura_Electronica_F001-0042910.pdf (342 KB)");
            } else if (sKey === "PDF_2") {
                oFormModel.setProperty("/samplePdfName", "Factura_Proveedor_F002-0081290_Servicios.pdf (410 KB)");
            } else if (sKey === "PDF_3") {
                oFormModel.setProperty("/samplePdfName", "Boleta_Movilidad_B001-004120.pdf (185 KB)");
            }
        },

        onCloseNewClaimDialog: function () {
            if (this._oNewClaimDialog) {
                this._oNewClaimDialog.close();
            }
        },

        onSaveNewClaim: function () {
            if (!this._oNewClaimDialog) return;
            var oFormModel = this._oNewClaimDialog.getModel("claimForm");
            var oFormData = oFormModel.getData();

            var sNewId = "EAR-2026-00" + Math.floor(7 + Math.random() * 90);
            var oAppModel = this.getView().getModel("app");
            var aClaims = oAppModel.getProperty("/claims") || [];

            aClaims.unshift({
                id: sNewId,
                fecha: new Date().toLocaleDateString("es-PE"),
                solicitante: oFormData.solicitante.split(" (")[0],
                motivo: oFormData.motivo,
                ceco: oFormData.ceco,
                sociedad: oFormData.sociedad,
                notaIngreso: oFormData.notaIngreso,
                monto: parseFloat(oFormData.monto),
                moneda: oFormData.moneda,
                currentStep: 1,
                stepLabel: "Paso 1/10 - Creación Solicitud OP",
                codigoFI: "PENDIENTE",
                opNumero: "OP-" + Math.floor(99200 + Math.random() * 800),
                pagoTesoreria: "-",
                sunatStatus: "-",
                sapDoc: "-",
                compensacionStatus: "-",
                estado: "BORRADOR"
            });

            oAppModel.refresh(true);
            this.onCloseNewClaimDialog();
            MessageToast.show("¡Solicitud " + sNewId + " registrada exitosamente en el Paso 1 (OP)!");
        },

        // ── 4. Lectura OCR de Comprobantes (Req. N° 6) ──────────────────────────
        onSimulateOCRScan: function () {
            if (!this._oNewClaimDialog) return;
            var oFormModel = this._oNewClaimDialog.getModel("claimForm");
            var sPdfKey = oFormModel.getProperty("/selectedSamplePdf") || "PDF_1";

            if (sPdfKey === "PDF_1") {
                oFormModel.setProperty("/sociedad", "1000");
                oFormModel.setProperty("/rucProveedor", "20517426726");
                oFormModel.setProperty("/razonSocialProveedor", "SERVICIOS EMPRESARIALES S.A.C.");
                oFormModel.setProperty("/tipoDoc", "01");
                oFormModel.setProperty("/serie", "F001");
                oFormModel.setProperty("/correlativo", "0042910");
                oFormModel.setProperty("/monto", "1850.00");
                oFormModel.setProperty("/igv", "282.20");
                oFormModel.setProperty("/moneda", "PEN");
                oFormModel.setProperty("/notaIngreso", "NI-2026-00941 / Guía SUNAT 001-008492");
                oFormModel.setProperty("/ocrStatusText", "✅ Lectura OCR Exitosa (Factura_Electronica_F001-0042910.pdf): RUC 20517426726 | SERVICIOS EMPRESARIALES S.A.C. | Total S/ 1,850.00 | Sociedad 1000");
            } else if (sPdfKey === "PDF_2") {
                oFormModel.setProperty("/sociedad", "2000");
                oFormModel.setProperty("/rucProveedor", "20601234567");
                oFormModel.setProperty("/razonSocialProveedor", "SERVICIOS INTEGRALES S.A.C.");
                oFormModel.setProperty("/tipoDoc", "01");
                oFormModel.setProperty("/serie", "F002");
                oFormModel.setProperty("/correlativo", "0081290");
                oFormModel.setProperty("/monto", "3450.00");
                oFormModel.setProperty("/igv", "526.27");
                oFormModel.setProperty("/moneda", "PEN");
                oFormModel.setProperty("/notaIngreso", "NI-2026-01205 / Guía SUNAT 002-001245");
                oFormModel.setProperty("/ocrStatusText", "✅ Lectura OCR Exitosa (Factura_Proveedor_F002-0081290.pdf): RUC 20601234567 | SERVICIOS INTEGRALES S.A.C. | Total S/ 3,450.00 | Sociedad 2000");
            } else {
                oFormModel.setProperty("/sociedad", "1000");
                oFormModel.setProperty("/rucProveedor", "20459876543");
                oFormModel.setProperty("/razonSocialProveedor", "TRANSPORTES URBANOS LIMA S.A.C.");
                oFormModel.setProperty("/tipoDoc", "03");
                oFormModel.setProperty("/serie", "B001");
                oFormModel.setProperty("/correlativo", "004120");
                oFormModel.setProperty("/monto", "240.00");
                oFormModel.setProperty("/igv", "0.00");
                oFormModel.setProperty("/moneda", "PEN");
                oFormModel.setProperty("/notaIngreso", "N/A - Boleta Movilidad");
                oFormModel.setProperty("/ocrStatusText", "✅ Lectura OCR Exitosa (Boleta_Movilidad_B001-004120.pdf): RUC 20459876543 | TRANSPORTES URBANOS LIMA S.A.C. | Total S/ 240.00 | Sociedad 1000");
            }

            oFormModel.setProperty("/ocrStatusType", "Success");
            oFormModel.setProperty("/ocrExecuted", true);

            MessageToast.show("🔍 Escáner OCR Inteligente: Documento PDF pre-cargado leído y campos completados automáticamente.");
        },

        // ── 5. Extensión Esporádica de Caja Chica por Criticidad (Req. N° 3) ───
        onOpenCriticalExtensionDialog: function () {
            var oCriticalModel = new JSONModel({
                cajaId: "CCH-S01-084",
                saldoActual: "S/ 1,240.50",
                montoExtension: "1500.00",
                criticidad: "CRITICA",
                motivoJustificacion: "Compra urgente de repuesto crítico para línea de producción en Planta Lurin (Aprobación Abreviada Parametrizable)"
            });

            var that = this;
            if (!this._oCriticalDialog) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "com.droidconsulting.entregasRendir.fragment.CriticalExtensionDialog",
                    controller: this
                }).then(function (oDialog) {
                    that._oCriticalDialog = oDialog;
                    that.getView().addDependent(that._oCriticalDialog);
                    that._oCriticalDialog.setModel(oCriticalModel, "criticalForm");
                    that._oCriticalDialog.open();
                });
            } else {
                this._oCriticalDialog.setModel(oCriticalModel, "criticalForm");
                this._oCriticalDialog.open();
            }
        },

        onCriticalCajaChange: function (oEvent) {
            var sKey = oEvent.getParameter("selectedItem").getKey();
            var oFormModel = this._oCriticalDialog.getModel("criticalForm");
            if (sKey === "CCH-S01-084") oFormModel.setProperty("/saldoActual", "S/ 1,240.50");
            else if (sKey === "CCH-S02-042") oFormModel.setProperty("/saldoActual", "S/ 420.00");
            else oFormModel.setProperty("/saldoActual", "S/ 1,890.00");
        },

        onCloseCriticalExtensionDialog: function () {
            if (this._oCriticalDialog) {
                this._oCriticalDialog.close();
            }
        },

        onSaveCriticalExtension: function () {
            if (!this._oCriticalDialog) return;
            var oFormData = this._oCriticalDialog.getModel("criticalForm").getData();
            var sExtId = "EXT-CRIT-2026-0" + Math.floor(1 + Math.random() * 9);

            var oAppModel = this.getView().getModel("app");
            var aExts = oAppModel.getProperty("/criticalExtensions") || [];
            aExts.unshift({
                id: sExtId,
                cajaId: oFormData.cajaId,
                monto: parseFloat(oFormData.montoExtension),
                criticidad: oFormData.criticidad,
                motivo: oFormData.motivoJustificacion,
                fecha: new Date().toLocaleDateString("es-PE"),
                estado: "APROBADO_EXPRESS"
            });
            oAppModel.refresh(true);

            this.onCloseCriticalExtensionDialog();
            MessageBox.success("¡Extensión Esporádica por Criticidad " + sExtId + " Autorizada!\n\nDesembolso único de S/ " + oFormData.montoExtension + " habilitado para la " + oFormData.cajaId + " previa carga de gastos.");
        },

        // ── 6. Liquidación de Puntos de Venta (PV SD) & Cuenta Puente (Req. N° 4)
        onProcessPvBridgeSettlement: function () {
            MessageBox.confirm(
                "¿Desea ejecutar la liquidación automática de ventas del día del Punto de Venta (PV SD) hacia la Cuenta Puente FI (104102) de Caja Chica?",
                {
                    title: "Liquidación PV SD & Compensación Caja Chica",
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {
                            MessageBox.success(
                                "¡Liquidación PV SD & Cuenta Puente Procesada en SAP S/4HANA!\n\n" +
                                "• Venta del Día PV SD: S/ 4,850.00\n" +
                                "• Asiento Cuenta Puente FI: 104102 - Fondo Fijo PV\n" +
                                "• Estado Compensación SAP: COMPENSADO (PV de SD ➔ Caja Chica Portal)"
                            );
                        }
                    }
                }
            );
        },

        onSearchClaims: function (oEvent) {
            var sQuery = oEvent.getParameter("newValue");
            var aFilters = [];
            if (sQuery) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("id", FilterOperator.Contains, sQuery),
                        new Filter("solicitante", FilterOperator.Contains, sQuery),
                        new Filter("motivo", FilterOperator.Contains, sQuery)
                    ],
                    and: false
                }));
            }
            this.byId("tableClaims").getBinding("items").filter(aFilters);
        },

        onNavToLaunchpad: function () {
            if (window.parent && window.parent.PortalApp) {
                window.parent.PortalApp.closeModal();
            } else {
                window.location.href = "../../index.html";
            }
        }
    });
});
