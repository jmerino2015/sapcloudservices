sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel"
], function (UIComponent, Device, JSONModel) {
    "use strict";

    return UIComponent.extend("com.droidconsulting.entregasRendir.Component", {

        metadata: {
            manifest: "json"
        },

        init: function () {
            UIComponent.prototype.init.apply(this, arguments);

            // Device Model
            var oDeviceModel = new JSONModel(Device);
            oDeviceModel.setDefaultBindingMode("OneWay");
            this.setModel(oDeviceModel, "device");

            // Complete Mock Data Model with KPI Dashboard, BPD Requerimientos 3,4,5,6 & 10-Step Workflow
            var oData = {
                activeSubProcess: "MENU", // MENU | DASHBOARD | ENTREGAS | VIAJES | CAJA_CHICA | KILOMETRAJE | FIRMA_DIGITAL | PV_SD_BRIDGE
                entregasViewMode: "FLOW", // FLOW | LIST
                isMobileDemo: false,

                // 📊 Dashboard de Indicadores de Gestión KPIs
                dashboard: {
                    kpis: {
                        montoTotalRendido: "42,300.00",
                        solicitudesPendientes: 18,
                        montoPendiente: "14,500.00",
                        tiempoPromedioCierre: "2.4 Días",
                        cumplimientoSunat: "98.6%"
                    },
                    byCeco: [
                        { ceco: "CC-1002 - Operaciones & Servicios", monto: "18,450.00", porcentaje: 43.6, statusState: "Success" },
                        { ceco: "CC-2001 - Consultoría SAP", monto: "12,300.00", porcentaje: 29.1, statusState: "Success" },
                        { ceco: "CC-3004 - Auditoría & Finanzas", monto: "6,800.00", porcentaje: 16.1, statusState: "Warning" },
                        { ceco: "CC-1005 - Comercial & Ventas", monto: "4,750.00", porcentaje: 11.2, statusState: "Information" }
                    ],
                    byType: [
                        { tipo: "Entregas a Rendir", monto: "19,500.00", cantidad: 8, porcentaje: 46.0 },
                        { tipo: "Viajes y Viáticos", monto: "14,200.00", cantidad: 5, porcentaje: 33.5 },
                        { tipo: "Cajas Chicas", monto: "5,800.00", cantidad: 3, porcentaje: 13.7 },
                        { tipo: "Gastos Kilometraje", monto: "2,800.00", cantidad: 2, porcentaje: 6.8 }
                    ],
                    detailedMetrics: [
                        { ceco: "CC-1002 - Operaciones", solicitante: "Carlos Mendoza", anticipo: 2000.00, rendido: 1850.00, saldo: 150.00, saldoTipo: "Devolución a Empresa", estado: "COMPLETADO" },
                        { ceco: "CC-1005 - Comercial", solicitante: "Ana Gutierrez", anticipo: 1000.00, rendido: 920.50, saldo: 79.50, saldoTipo: "Devolución a Empresa", estado: "EN_REVISION" },
                        { ceco: "CC-2001 - Consultoría SAP", solicitante: "Jorge Valdivia", anticipo: 3000.00, rendido: 3400.00, saldo: -400.00, saldoTipo: "Reembolso a Empleado", estado: "REEMBOLSADO" },
                        { ceco: "CC-3004 - Auditoría", solicitante: "David Flores", anticipo: 2500.00, rendido: 2680.00, saldo: -180.00, saldoTipo: "Reembolso a Empleado", estado: "CONTABILIZADO" },
                        { ceco: "CC-1002 - Operaciones", solicitante: "María Torres", anticipo: 500.00, rendido: 450.00, saldo: 50.00, saldoTipo: "Devolución a Empresa", estado: "BORRADOR" }
                    ]
                },

                // Req N° 3: Extensiones Esporádicas de Caja Chica por Criticidad
                criticalExtensions: [
                    { id: "EXT-CRIT-2026-01", cajaId: "CCH-S01-084 (Central Lima)", monto: 1500.00, criticidad: "CRITICA", motivo: "Compra urgente repuesto crítico línea producción Lurin", fecha: "11/09/2026", estado: "APROBADO_EXPRESS" },
                    { id: "EXT-CRIT-2026-02", cajaId: "CCH-S02-042 (Planta Lurin)", monto: 800.00, criticidad: "ALTA", motivo: "Pago movilidad imprevista inspección de emergencia", fecha: "09/09/2026", estado: "APROBADO_EXPRESS" }
                ],

                // Req N° 4: Liquidación Puntos de Venta (PV SD) & Cuenta Puente FI
                posSettlements: [
                    { id: "PV-SD-2026-081", centroBeneficio: "CEBE-1002 (PV SD Principal)", ventaDia: 4850.00, cuentaPuente: "104102 - Fondo Fijo PV", fecha: "11/09/2026", compensacionSap: "COMPENSADO_PV_SD" },
                    { id: "PV-SD-2026-082", centroBeneficio: "CEBE-1005 (PV SD Sucursal)", ventaDia: 3200.00, cuentaPuente: "104102 - Fondo Fijo PV", fecha: "10/09/2026", compensacionSap: "COMPENSADO_PV_SD" }
                ],

                // 1. Sub-Proceso: Entregas a Rendir (Flujo Operativo de 10 Pasos)
                claims: [
                    {
                        id: "EAR-2026-001",
                        fecha: "10/09/2026",
                        solicitante: "Carlos Mendoza",
                        motivo: "Viaje Técnico Planta Arequipa",
                        ceco: "CC-1002",
                        sociedad: "1000",
                        notaIngreso: "NI-2026-00941 / Guía SUNAT 001-084",
                        monto: 1850.00,
                        moneda: "PEN",
                        currentStep: 5,
                        stepLabel: "Paso 5/10 - Rendición con comprobantes",
                        codigoFI: "ACR-400192",
                        opNumero: "OP-99201",
                        pagoTesoreria: "TES-882190",
                        sunatStatus: "PENDIENTE",
                        sapDoc: "-",
                        compensacionStatus: "PENDIENTE",
                        estado: "EN_RENDICION"
                    },
                    {
                        id: "EAR-2026-002",
                        fecha: "08/09/2026",
                        solicitante: "Ana Gutierrez",
                        motivo: "Comité Comercial Trujillo",
                        ceco: "CC-1005",
                        sociedad: "1000",
                        notaIngreso: "NI-2026-00812",
                        monto: 920.50,
                        moneda: "PEN",
                        currentStep: 3,
                        stepLabel: "Paso 3/10 - Aprobación Solicitud OP",
                        codigoFI: "ACR-400195",
                        opNumero: "OP-99204",
                        pagoTesoreria: "-",
                        sunatStatus: "-",
                        sapDoc: "-",
                        compensacionStatus: "-",
                        estado: "EN_APROBACION"
                    },
                    {
                        id: "EAR-2026-003",
                        fecha: "05/09/2026",
                        solicitante: "Jorge Valdivia",
                        motivo: "Capacitación Consultores SAP",
                        ceco: "CC-2001",
                        sociedad: "2000",
                        notaIngreso: "NI-2026-00740",
                        monto: 3400.00,
                        moneda: "PEN",
                        currentStep: 10,
                        stepLabel: "Paso 10/10 - Compensación & Cierre FI",
                        codigoFI: "ACR-400188",
                        opNumero: "OP-99180",
                        pagoTesoreria: "TES-881900",
                        sunatStatus: "ACEPTADO_SUNAT",
                        sapDoc: "SAP-1000489201",
                        compensacionStatus: "COMPENSADO_FI",
                        estado: "COMPENSADO_CERRADO"
                    },
                    {
                        id: "EAR-2026-004",
                        fecha: "02/09/2026",
                        solicitante: "María Torres",
                        motivo: "Inspección Almacén Lurin",
                        ceco: "CC-1002",
                        sociedad: "1000",
                        notaIngreso: "NI-2026-00620",
                        monto: 450.00,
                        moneda: "PEN",
                        currentStep: 1,
                        stepLabel: "Paso 1/10 - Solicitud OP Borrador",
                        codigoFI: "PENDIENTE",
                        opNumero: "OP-99215",
                        pagoTesoreria: "-",
                        sunatStatus: "-",
                        sapDoc: "-",
                        compensacionStatus: "-",
                        estado: "BORRADOR"
                    },
                    {
                        id: "EAR-2026-005",
                        fecha: "28/08/2026",
                        solicitante: "David Flores",
                        motivo: "Auditoría Financiera Cusco",
                        ceco: "CC-3004",
                        sociedad: "3000",
                        notaIngreso: "NI-2026-00510",
                        monto: 2680.00,
                        moneda: "PEN",
                        currentStep: 8,
                        stepLabel: "Paso 8/10 - Contabilización en SAP",
                        codigoFI: "ACR-400170",
                        opNumero: "OP-99150",
                        pagoTesoreria: "TES-881720",
                        sunatStatus: "ACEPTADO_SUNAT",
                        sapDoc: "SAP-1000488910",
                        compensacionStatus: "PENDIENTE",
                        estado: "CONTABILIZADO"
                    }
                ],

                // 2. Sub-Proceso: Viajes y Viáticos
                travels: [
                    {
                        id: "VIA-2026-101",
                        fecha: "11/09/2026",
                        viajero: "Luis Ramirez",
                        destino: "Cusco - Planta Minera",
                        totalGeneral: 1850.00,
                        currentStep: 4,
                        stepLabel: "Paso 4/10 - Pago de Viáticos Tesorería",
                        codigoFI: "ACR-400201",
                        estado: "PAGO_TESORERIA"
                    },
                    {
                        id: "VIA-2026-102",
                        fecha: "09/09/2026",
                        viajero: "Elena Morales",
                        destino: "Piura - Sucursal Norte",
                        totalGeneral: 1280.00,
                        currentStep: 6,
                        stepLabel: "Paso 6/10 - Aprobación de Rendición",
                        codigoFI: "ACR-400205",
                        estado: "EN_REVISION"
                    },
                    {
                        id: "VIA-2026-103",
                        fecha: "04/09/2026",
                        viajero: "Fernando Rios",
                        destino: "Arequipa - Sede Sur",
                        totalGeneral: 2030.00,
                        currentStep: 10,
                        stepLabel: "Paso 10/10 - Liquidado y Compensado",
                        codigoFI: "ACR-400160",
                        estado: "COMPENSADO_CERRADO"
                    }
                ],

                // 3. Sub-Proceso: Cajas Chicas
                pettyCash: [
                    {
                        id: "CCH-S01-084",
                        caja: "Caja Chica Central Lima",
                        custodio: "Rosa Chavez",
                        fondoFijo: 5000.00,
                        saldoDisponible: 1240.50,
                        currentStep: 5,
                        stepLabel: "Paso 5/10 - Carga Vales y Gastos",
                        estado: "OPERATIVA"
                    },
                    {
                        id: "CCH-S02-042",
                        caja: "Caja Chica Planta Lurin",
                        custodio: "Pedro Gomez",
                        fondoFijo: 3000.00,
                        saldoDisponible: 420.00,
                        currentStep: 8,
                        stepLabel: "Paso 8/10 - Contabilización Reposición SAP",
                        estado: "REPOSICION_SOLICITADA"
                    }
                ],

                // 4. Sub-Proceso: Gastos de Kilometraje
                mileage: [
                    {
                        id: "KM-2026-501",
                        fecha: "11/09/2026",
                        conductor: "Gonzalo Vargas",
                        ruta: "Lima Central ➔ Almacén Lurin ➔ Regreso",
                        km: 78.5,
                        totalReembolso: 107.20,
                        currentStep: 6,
                        stepLabel: "Paso 6/10 - Aprobación Ruta Jefatura",
                        estado: "EN_REVISION"
                    },
                    {
                        id: "KM-2026-502",
                        fecha: "07/09/2026",
                        conductor: "Carlos Mendoza",
                        ruta: "Planta Arequipa ➔ Cantera Yura",
                        km: 110.0,
                        totalReembolso: 152.00,
                        currentStep: 10,
                        stepLabel: "Paso 10/10 - Reembolsado & Compensado",
                        estado: "COMPENSADO_CERRADO"
                    }
                ],

                // 5. Sub-Proceso: Firma Digital
                digitalSignatures: [
                    {
                        id: "SIG-2026-901",
                        documento: "Solicitud Anticipo EAR-2026-001 (Paso 3 OP)",
                        firmante: "Gerencia de Finanzas",
                        fechaFirma: "11/09/2026 16:42",
                        hashSha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                        certificado: "ID-DIG-PERU-9921",
                        estado: "FIRMADO_VALIDADO"
                    },
                    {
                        id: "SIG-2026-902",
                        documento: "Aprobación Rendición EAR-2026-003 (Paso 6 Rendición)",
                        firmante: "Jefatura de Contabilidad",
                        fechaFirma: "10/09/2026 11:15",
                        hashSha256: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
                        certificado: "ID-DIG-PERU-4412",
                        estado: "FIRMADO_VALIDADO"
                    }
                ]
            };

            var oModel = new JSONModel(oData);
            this.setModel(oModel, "app");

            this.getRouter().initialize();
        }
    });
});
