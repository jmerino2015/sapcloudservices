// SAP Fiori Horizons Mockup - Interactive Logic

// --- Global Detailed Database (1-to-1 Mapping for Sidebar Items) ---
const mockDatabase = {
    // --- Configuración ---
    "config-base": {
        title: "Mantenimiento Base - Parámetros de Localización",
        headers: ["Código SAP", "Catálogo SUNAT", "Descripción del Mapeo", "Parámetro Local", "Estado"],
        data: [
            ["MP_001", "Tabla 1: Medio de Pago", "001 - Depósito en Cuenta", "Banco BCP / BBVA", "Activo"],
            ["MP_003", "Tabla 1: Medio de Pago", "003 - Transferencia de Fondos", "Transferencias Nacionales", "Activo"],
            ["DOC_001", "Tabla 10: Comprobantes", "01 - Factura Electrónica (CPE)", "Clase Documento: KR/RE", "Activo"],
            ["DOC_003", "Tabla 10: Comprobantes", "03 - Boleta de Venta", "Clase Documento: RV", "Activo"],
            ["UM_NIU", "Tabla 6: Medidas", "NIU - Unidad (Bienes)", "Unidad de Medida SAP: UN", "Activo"],
            ["WS_OSE_PROD", "Credenciales OSE", "Servicio Web OSE - Facturación", "Endpoint URL de Producción", "Conectado"]
        ],
        cards: [
            { title: "Tablas Homologadas", value: "24 / 24", desc: "100% de cumplimiento", trend: "up", icon: "fa-check" },
            { title: "Conexión OSE/SUNAT", value: "Activo", desc: "Ping exitoso hace 2 min", trend: "up", icon: "fa-signal" },
            { title: "Series Activas", value: "48 Series", desc: "CRE, CPE, FEP controlados", trend: "up", icon: "fa-list" }
        ]
    },

    // --- 3. Inventarios y Balances ---
    "lib-bal-3-1": {
        title: "Libro 3.1 Estado de Situación Financiera - Balance General",
        headers: ["Código Rubro", "Rubro Contable", "Clasificación", "Saldo Periodo Actual (S/.)", "Estado"],
        data: [
            ["1.1", "Activo Corriente - Efectivo y Equiv. de Efectivo", "Activo", "272,030.00", "Normal"],
            ["1.2", "Activo Corriente - Ctas por Cobrar Comerciales", "Activo", "206,350.00", "Normal"],
            ["1.3", "Activo Corriente - Inventarios (Kardex)", "Activo", "80,825.00", "Normal"],
            ["2.1", "Pasivo Corriente - Ctas por Pagar Comerciales", "Pasivo", "24,390.00", "Por Pagar"],
            ["2.2", "Pasivo Corriente - Otras Cuentas por Pagar", "Pasivo", "1,200.00", "Normal"],
            ["3.1", "Patrimonio - Capital Social", "Patrimonio", "500,000.00", "Normal"],
            ["3.2", "Patrimonio - Resultados Acumulados", "Patrimonio", "33,615.00", "Normal"]
        ],
        cards: [
            { title: "Total Activos", value: "S/. 559,205", desc: "Activos corrientes", trend: "up", icon: "fa-calculator" },
            { title: "Total Pasivos", value: "S/. 25,590", desc: "Obligaciones externas", trend: "down", icon: "fa-credit-card" },
            { title: "Patrimonio Neto", value: "S/. 533,615", desc: "Capital + Resultados", trend: "up", icon: "fa-chart-pie" }
        ]
    },
    "lib-bal-3-3": {
        title: "Libro 3.3 Detalle Saldo Cuenta 12 y 13 Ctas por Cobrar Comerciales - Terceros",
        headers: ["Cuenta Contable", "RUC Proveedor/Cliente", "Nombre / Razón Social", "Fecha Emisión", "Saldo Deudor (S/.)", "Estado"],
        data: [
            ["121201", "20556789012", "Distribuidora El Sol S.A.C.", "2026-06-15", "120,450.00", "Normal"],
            ["121201", "20100482931", "Corporación Aceros Arequipa", "2026-07-02", "85,900.00", "Normal"],
            ["131201", "20448822119", "Subsidiaria Logística del Norte S.A.", "2026-07-10", "0.00", "Normal"]
        ],
        cards: [
            { title: "Saldos 12 Comerciales", value: "S/. 206,350", desc: "Facturas emitidas", trend: "up", icon: "fa-arrow-trend-up" },
            { title: "Saldos 13 Relacionadas", value: "S/. 0.00", desc: "Empresas del grupo", trend: "up", icon: "fa-arrows-spin" }
        ]
    },
    "lib-bal-3-4": {
        title: "Libro 3.4 Detalle Saldo Cuenta 14 Ctas por Cobrar al Personal, a los Accionistas",
        headers: ["DNI Empleado", "Nombre y Apellidos", "Concepto de Deuda", "Fecha Préstamo", "Saldo Pendiente (S/.)", "Estado"],
        data: [
            ["45879654", "García Pérez, Carlos", "Préstamo Vacacional", "2025-12-01", "4,500.00", "Vencido"],
            ["72458963", "Mendoza Alva, Laura", "Adelanto de Sueldo", "2026-07-15", "1,200.00", "Normal"],
            ["41203657", "Sánchez Ruiz, Pedro", "Entrega a Rendir - Viajes", "2026-07-18", "800.00", "Normal"]
        ],
        cards: [
            { title: "Total Cuentas Personal", value: "S/. 6,500", desc: "Préstamos y adelantos", trend: "up", icon: "fa-users" },
            { title: "Alertas Vencidas", value: "1 Alerta", desc: "Préstamo García Pérez", trend: "down", icon: "fa-triangle-exclamation" }
        ]
    },
    "lib-bal-3-5": {
        title: "Libro 3.5 Detalle Saldo Cuenta 16 y 17 Ctas por Cobrar Diversas - Terceros",
        headers: ["Cuenta Contable", "RUC/DNI Tercero", "Descripción Operación", "Saldo Deudor (S/.)", "Estado"],
        data: [
            ["161101", "20448822119", "Reclamación a Compañía de Seguros Pacífico", "14,500.00", "En Proceso"],
            ["163101", "40589632", "Socio Minoritario - Deuda por Suscripción", "12,000.00", "Normal"],
            ["171201", "20102030405", "Garantía de Alquiler de Almacén Callao", "15,000.00", "Normal"]
        ],
        cards: [
            { title: "Cuentas Diversas 16", value: "S/. 26,500", desc: "Reclamos y suscripciones", trend: "up", icon: "fa-box-open" },
            { title: "Garantías 17", value: "S/. 15,000", desc: "Depósitos en garantía", trend: "up", icon: "fa-shield-halved" }
        ]
    },
    "lib-bal-3-6": {
        title: "Libro 3.6 Detalle Saldo Cuenta 19 Estimación de Ctas de Cobranza Dudosa",
        headers: ["Cuenta Contable", "Cliente RUC/DNI", "Razón Social / Tercero", "Monto Provisión (S/.)", "Fecha Provisión", "Estado"],
        data: [
            ["191101", "20998877665", "Comercial del Norte S.A. (Quiebra)", "18,900.00", "2025-10-15", "Provisionado"],
            ["191101", "20458712399", "Distribuidora Industrial Ica E.I.R.L.", "6,500.00", "2026-02-10", "En Cobranza Legal"]
        ],
        cards: [
            { title: "Total Cobranza Dudosa", value: "S/. 25,400", desc: "Provisión de incobrables", trend: "down", icon: "fa-face-frown" },
            { title: "Clientes Afectados", value: "2 Clientes", desc: "En proceso de litigio", trend: "down", icon: "fa-gavel" }
        ]
    },
    "lib-bal-3-9": {
        title: "Libro 3.9 Detalle Saldo Cuenta 34 Intangibles",
        headers: ["Código Intangible", "Descripción del Activo Intangible", "Fecha Registro", "Costo Histórico (S/.)", "Amortización Acum. (S/.)", "Valor Neto (S/.)"],
        data: [
            ["INT-001", "Licencias SAP S/4HANA Enterprise", "2024-01-01", "150,000.00", "60,000.00", "90,000.00"],
            ["INT-002", "Desarrollo Suite Localización Perú Fiori", "2025-06-30", "45,000.00", "9,000.00", "36,000.00"],
            ["INT-003", "Patente de Algoritmo de Conciliación", "2025-09-12", "18,000.00", "3,000.00", "15,000.00"]
        ],
        cards: [
            { title: "Costo Intangibles", value: "S/. 213,000", desc: "Valor de adquisición", trend: "up", icon: "fa-laptop-code" },
            { title: "Valor Neto en Libros", value: "S/. 141,000", desc: "Costo menos amortización", trend: "up", icon: "fa-coins" }
        ]
    },
    "lib-bal-3-12": {
        title: "Libro 3.12 Detalle Saldo Cuenta 42 y 43 Ctas por Pagar Comerciales - Terceros",
        headers: ["Cuenta Contable", "RUC Proveedor", "Razón Social", "Monto Factura (S/.)", "Fecha Vencimiento", "Estado"],
        data: [
            ["421201", "20100123456", "Servicios Eléctricos del Perú", "15,890.00", "2026-07-28", "Por Pagar"],
            ["421201", "20501020304", "Consultores Tributarios Asociados", "8,500.00", "2026-08-05", "Normal"],
            ["431201", "20448822119", "Filial Comercial del Sur S.A.C.", "0.00", "2026-07-31", "Normal"]
        ],
        cards: [
            { title: "Proveedores 42", value: "S/. 24,390", desc: "Facturas comerciales por pagar", trend: "down", icon: "fa-file-invoice-dollar" },
            { title: "Vencimientos 7 días", value: "S/. 15,890", desc: "Servicios Eléctricos", trend: "down", icon: "fa-hourglass-start" }
        ]
    },
    "lib-bal-3-13": {
        title: "Libro 3.13 Detalle Saldo Cuenta 46 y 47 Ctas por Pagar Diversas - Terceros",
        headers: ["Cuenta Contable", "Beneficiario RUC/DNI", "Descripción Obligación", "Monto Pendiente (S/.)", "Estado"],
        data: [
            ["469901", "20204060809", "Municipalidad de San Isidro - Arbitrios", "1,200.00", "Normal"],
            ["465501", "20100482931", "Corporación Aceros - Dividendos Declarados", "25,000.00", "Listo para Pago"],
            ["473101", "20501020304", "Garantías de Clientes Recibidas", "5,000.00", "Normal"]
        ],
        cards: [
            { title: "Pasivos Diversos 46", value: "S/. 26,200", desc: "Dividendos y tributos locales", trend: "down", icon: "fa-wallet" },
            { title: "Garantías Recibidas", value: "S/. 5,000", desc: "Fondo de garantía clientes", trend: "up", icon: "fa-vault" }
        ]
    },
    "lib-bal-3-15": {
        title: "Libro 3.15 Detalle Saldo Cuenta 37 y 49 Activos y Pasivo Diferidos",
        headers: ["Cuenta Contable", "Descripción del Diferido", "Monto Diferido (S/.)", "Amortización Mensual (S/.)", "Estado"],
        data: [
            ["371101", "Seguro Contra Incendios Pagado por Anticipado", "24,000.00", "2,000.00", "Activo"],
            ["491101", "Ingresos Diferidos por Arrendamiento", "12,000.00", "1,000.00", "Diferido"]
        ],
        cards: [
            { title: "Activos Diferidos 37", value: "S/. 24,000", desc: "Seguros pagados adelantados", trend: "up", icon: "fa-calendar-days" },
            { title: "Pasivos Diferidos 49", value: "S/. 12,000", desc: "Alquileres cobrados adelantados", trend: "down", icon: "fa-calendar-minus" }
        ]
    },
    "lib-bal-3-17": {
        title: "Libro 3.17 Balance de Comprobación Anual",
        headers: ["Código Cuenta", "Descripción Cuenta", "Suma Debe (S/.)", "Suma Haber (S/.)", "Saldo Deudor (S/.)", "Saldo Acreedor (S/.)"],
        data: [
            ["10", "Efectivo y Equivalentes de Efectivo", "450,000.00", "177,970.00", "272,030.00", "0.00"],
            ["12", "Cuentas por Cobrar Comerciales", "281,350.00", "75,000.00", "206,350.00", "0.00"],
            ["40", "Tributos por Pagar (IGV, Renta)", "18,000.00", "32,400.00", "0.00", "14,400.00"],
            ["42", "Cuentas por Pagar Comerciales", "35,000.00", "59,390.00", "0.00", "24,390.00"],
            ["50", "Capital Social", "0.00", "500,000.00", "0.00", "500,000.00"]
        ],
        cards: [
            { title: "Suma Debe Total", value: "S/. 784,350", desc: "Totalizado en el periodo", trend: "up", icon: "fa-calculator" },
            { title: "Suma Haber Total", value: "S/. 784,350", desc: "Balance en cuadre", trend: "up", icon: "fa-scale-balanced" }
        ]
    },
    "lib-bal-3-19": {
        title: "Libro 3.19 Estado de Cambios en el Patrimonio Neto",
        headers: ["Concepto de Patrimonio", "Capital Social", "Resultados Acumulados", "Excedente Revaluación", "Total Patrimonio (S/.)"],
        data: [
            ["Saldo Inicial al 01-Ene-2026", "500,000.00", "120,400.00", "0.00", "620,400.00"],
            ["Resultado Neto del Ejercicio", "0.00", "45,800.00", "0.00", "45,800.00"],
            ["Distribución de Dividendos", "0.00", "-25,000.00", "0.00", "-25,000.00"],
            ["Saldo Final al 31-Jul-2026", "500,000.00", "141,200.00", "0.00", "641,200.00"]
        ],
        cards: [
            { title: "Patrimonio Inicial", value: "S/. 620,400", desc: "Al inicio del ejercicio fiscal", trend: "up", icon: "fa-chart-line" },
            { title: "Patrimonio Actual", value: "S/. 641,200", desc: "Variación neta +S/. 20,800", trend: "up", icon: "fa-circle-dollar-to-slot" }
        ]
    },
    "lib-bal-3-20": {
        title: "Libro 3.20 Estado de Resultados (Pérdidas y Ganancias)",
        headers: ["Concepto / Rubro", "Periodo Actual (S/.)", "Acumulado Ejercicio (S/.)", "Porcentaje (%)"],
        data: [
            ["Ventas Netas (Ingresos Operacionales)", "100,000.00", "750,000.00", "100.00%"],
            ["Costo de Ventas (Operación)", "-60,000.00", "-450,000.00", "-60.00%"],
            ["Utilidad Bruta", "40,000.00", "300,000.00", "40.00%"],
            ["Gastos Administrativos y Ventas", "-15,000.00", "-110,000.00", "-14.67%"],
            ["Utilidad Neta antes de Impuestos", "25,000.00", "190,000.00", "25.33%"]
        ],
        cards: [
            { title: "Ventas Acumuladas", value: "S/. 750,000", desc: "Ingresos gravables SUNAT", trend: "up", icon: "fa-store" },
            { title: "Utilidad Ejercicio", value: "S/. 190,000", desc: "Margen de ganancia neto", trend: "up", icon: "fa-money-bill-trend-up" }
        ]
    },

    // --- 5. Libro Diario ---
    "diario-5-1": {
        title: "Libro 5.1 Libro Diario General Estándar",
        headers: ["Nº Asiento", "Fecha Contable", "Glosa Operación", "Cuenta", "Debe (S/.)", "Haber (S/.)", "Estado Documento"],
        data: [
            ["00001025", "2026-07-01", "Provision Venta Corriente", "121201", "118.00", "0.00", "Contabilizado"],
            ["00001025", "2026-07-01", "IGV por Pagar Ventas", "401111", "0.00", "18.00", "Contabilizado"],
            ["00001025", "2026-07-01", "Ingreso Venta de Servicios", "704101", "0.00", "100.00", "Contabilizado"],
            ["00001026", "2026-07-02", "Compra Suministros Oficina", "656101", "500.00", "0.00", "Contabilizado"],
            ["00001026", "2026-07-02", "IGV Compras Acreditable", "401112", "90.00", "0.00", "Contabilizado"],
            ["00001026", "2026-07-02", "Factura por Pagar Proveedor", "421201", "0.00", "590.00", "Contabilizado"]
        ],
        cards: [
            { title: "Asientos Periodo", value: "1,452", desc: "Asientos cargados en el mes", trend: "up", icon: "fa-book" },
            { title: "Total Debe", value: "S/. 485,690", desc: "Cuadrado con Haber", trend: "up", icon: "fa-scale-balanced" },
            { title: "Haber Periodo", value: "S/. 485,690", desc: "Diferencia de Balance S/. 0.00", trend: "up", icon: "fa-thumbs-up" }
        ]
    },
    "diario-5-3": {
        title: "Libro 5.3 Detalle del Plan de Cuentas Nacional Utilizado",
        headers: ["Código Cuenta", "Descripción Cuenta", "Tipo de Cuenta", "Nivel", "Cuenta Corporativa SAP", "Estado SUNAT"],
        data: [
            ["101101", "Caja Chica General MN", "Activo", "Subcuenta", "11000010", "Homologada"],
            ["104101", "Cuentas Corrientes BCP MN", "Activo", "Subcuenta", "11000020", "Homologada"],
            ["121201", "Facturas por Cobrar Comerciales", "Activo", "Cuenta", "12000010", "Homologada"],
            ["401111", "IGV - Débito Fiscal Ventas", "Pasivo", "Subcuenta", "21050010", "Homologada"],
            ["421201", "Facturas por Pagar Comerciales", "Pasivo", "Cuenta", "21010010", "Homologada"]
        ],
        cards: [
            { title: "Cuentas Totales Plan", value: "185 Cuentas", desc: "Mapeadas en el catálogo", trend: "up", icon: "fa-list" },
            { title: "Cuentas Homologadas", value: "185 / 185", desc: "100% de cobertura", trend: "up", icon: "fa-shield-check" }
        ]
    },

    // --- 6. Libro Mayor ---
    "mayor-6-1": {
        title: "Libro 6.1 Libro Mayor General Mensual",
        headers: ["Código Cuenta", "Nombre Cuenta", "Saldo Inicial (S/.)", "Total Cargos (S/.)", "Total Abonos (S/.)", "Saldo Final (S/.)"],
        data: [
            ["101101", "Caja Chica General", "1,500.00", "500.00", "300.00", "1,700.00"],
            ["104101", "Banco BCP Cta Corriente", "245,600.00", "120,400.00", "95,670.00", "270,330.00"],
            ["121201", "Facturas por Cobrar Terceros", "89,500.00", "118,000.00", "75,000.00", "132,500.00"],
            ["401111", "IGV Debito Fiscal (Ventas)", "0.00", "18,000.00", "32,400.00", "-14,400.00"],
            ["421201", "Facturas por Pagar Proveedores", "45,800.00", "35,000.00", "48,900.00", "59,700.00"]
        ],
        cards: [
            { title: "Cuentas Activas", value: "112 Cuentas", desc: "Con movimientos en el mes", trend: "up", icon: "fa-list-check" },
            { title: "Liquidez Bancaria", value: "S/. 270,330", desc: "Saldo neto BCP", trend: "up", icon: "fa-wallet" }
        ]
    },

    // --- 7. Activos Fijos ---
    "af-7-1": {
        title: "Libro 7.1 Detalle Activos Fijos Revaluados y No Revaluados",
        headers: ["Código Activo", "Nombre del Activo", "Fecha Adquisición", "Valor Adquisición", "Depreciación Acum.", "Método / Revaluación"],
        data: [
            ["AF_0001", "Edificio Sede San Isidro", "2019-03-12", "1,850,000.00", "370,000.00", "No Revaluado"],
            ["AF_0002", "Terreno Comercial Lima", "2018-01-15", "500,000.00", "0.00", "Revaluado (+S/.150k)"],
            ["AF_0008", "Servidor Dell PowerEdge R750", "2024-05-15", "45,000.00", "15,000.00", "No Revaluado"]
        ],
        cards: [
            { title: "Costo Activos Fijos", value: "S/. 2,395,000", desc: "Activos tangibles brutos", trend: "up", icon: "fa-building" },
            { title: "Activos Revaluados", value: "S/. 150,000", desc: "Excedente de revaluación", trend: "up", icon: "fa-circle-up" }
        ]
    },
    "af-7-3": {
        title: "Libro 7.3 Diferencia de Cambio de Activos Fijos",
        headers: ["Código Activo", "Descripción del Activo", "Moneda", "TC Adquisición", "TC Cierre", "Ajuste Diferencia de Cambio (S/.)"],
        data: [
            ["AF_0008", "Servidor Dell (Adquirido en USD)", "USD", "3.750", "3.810", "2,450.00"],
            ["AF_0009", "Licencias Oracle DB (USD)", "USD", "3.740", "3.810", "1,890.00"]
        ],
        cards: [
            { title: "Ajuste de Cambio Neto", value: "S/. 4,340", desc: "Pérdida/Ganancia por ajuste", trend: "up", icon: "fa-rotate" },
            { title: "Tasa de Cambio Cierre", value: "3.810", desc: "SUNAT al cierre de mes", trend: "up", icon: "fa-dollar-sign" }
        ]
    },
    "af-7-4": {
        title: "Libro 7.4 Detalle de Activos Fijos bajo Modalidad de Arrendamiento Financiero (Leasing)",
        headers: ["Código Activo", "Nombre del Activo", "Entidad Financiera", "Nº Contrato Leasing", "Cuotas Totales", "Monto Contrato (S/.)"],
        data: [
            ["AF_0012", "Montacargas Toyota 8FGU25", "Banco BBVA", "LEASE-2025-08", "36 Cuotas", "120,000.00"],
            ["AF_0015", "Camioneta Reparto Hyundai H1", "Banco BCP", "LEASE-2023-14", "24 Cuotas", "95,000.00"]
        ],
        cards: [
            { title: "Activos en Leasing", value: "2 Activos", desc: "Operaciones de arrendamiento", trend: "up", icon: "fa-file-signature" },
            { title: "Compromiso Leasing", value: "S/. 215,000", desc: "Total capital financiado", trend: "down", icon: "fa-hand-holding-dollar" }
        ]
    },

    // --- 13. Kardex Permanente ---
    "kardex-13-1": {
        title: "Libro 13.1 Registro de Inventario Permanente Valorizado (Kardex)",
        headers: ["ID Material", "Material / Articulo", "Entradas (Cant)", "Salidas (Cant)", "Stock Final", "Costo Unit. Promedio", "Valor Stock Total (S/.)"],
        data: [
            ["MAT-001", "Plancha de Acero 1/8x4x8", "500", "320", "180", "120.00", "21,600.00"],
            ["MAT-002", "Tubo de Cobre 3/4 LWC", "1,200", "850", "350", "45.50", "15,925.00"],
            ["MAT-005", "Viga H de Acero Estructural", "150", "60", "90", "450.00", "40,500.00"],
            ["MAT-008", "Esmalte Industrial Anticorrosivo", "300", "220", "80", "35.00", "2,800.00"]
        ],
        cards: [
            { title: "Materiales Activos", value: "4 Items", desc: "Controlados en Kardex", trend: "up", icon: "fa-boxes-stacked" },
            { title: "Valor del Inventario", value: "S/. 80,825", desc: "Método Promedio Ponderado", trend: "up", icon: "fa-circle-dollar-to-slot" },
            { title: "Rotación Mensual", value: "62 %", desc: "Salidas vs. Stock Total", trend: "up", icon: "fa-rotate" }
        ]
    },

    // --- 8. Compras RCE ---
    "sire-rce-propuesta": {
        title: "SIRE 8.1 Registro de Compras Electrónico (RCE) - Propuesta SUNAT vs. SAP",
        headers: ["Comprobante", "Proveedor RUC", "Razón Social", "Base Imp. (SAP)", "IGV (SAP)", "Base Imp. (SUNAT)", "IGV (SUNAT)", "Inconsistencia / Estado"],
        data: [
            ["FT E001-502", "20100123456", "ElectroPerú S.A.", "10,000.00", "1,800.00", "10,000.00", "1,800.00", "Coincide perfectly"],
            ["FT F002-8940", "20556789012", "Inversiones Lima S.A.", "5,000.00", "900.00", "5,000.00", "850.00", "Diferencia IGV S/. 50.00"],
            ["FT E005-1203", "20204060809", "Constructora Sur E.I.R.L.", "15,000.00", "2,700.00", "0.00", "0.00", "No existe en SUNAT (Adicionar)"],
            ["FT F012-4589", "20501020304", "Consultores SAC", "2,000.00", "360.00", "2,000.00", "360.00", "Coincide perfectly"]
        ],
        cards: [
            { title: "Propuesta SUNAT RCE", value: "3 Documentos", desc: "Encontrados en portal SUNAT", trend: "up", icon: "fa-cloud-arrow-down" },
            { title: "Inconsistencias RCE", value: "2 Alertas", desc: "Diferencia de IGV / Falta en SUNAT", trend: "down", icon: "fa-triangle-exclamation" }
        ]
    },
    "sire-rce-no-dom": {
        title: "Libro 8.2 Compras con Sujetos No Domiciliados (Extranjeros)",
        headers: ["Doc. SAP", "Proveedor Extranjero", "País / Jurisdicción", "Moneda", "Importe Operación", "IGV Retención (S/.)", "Convenio Evit. Doble Imp."],
        data: [
            ["19000045", "Oracle America Inc.", "Estados Unidos", "USD", "15,000.00", "9,890.00", "No Aplica"],
            ["19000046", "SAP Chile Limitada", "Chile", "CLP", "4,500,000.00", "6,200.00", "Convenio CDT Perú-Chile"]
        ],
        cards: [
            { title: "Compras No Domicil.", value: "2 Proveedores", desc: "Sujetos del exterior", trend: "up", icon: "fa-globe" },
            { title: "Retenciones Renta", value: "S/. 16,090", desc: "Declarar en PDT 617", trend: "down", icon: "fa-hand-holding-dollar" }
        ]
    },

    // --- 14. Ventas RVIE ---
    "sire-rvie-propuesta": {
        title: "SIRE 14.1 Registro de Ventas e Ingresos Electrónico (RVIE)",
        headers: ["Serie-Correlativo", "Cliente RUC/DNI", "Cliente Razón Social", "Valor Export. (S/.)", "Base Imponible", "IGV (S/.)", "Estado SUNAT"],
        data: [
            ["FT F001-0000125", "20304578129", "Minera Las Bambas S.A.", "0.00", "150,000.00", "27,000.00", "Aceptado"],
            ["FT F001-0000126", "20100482931", "Corporación Aceros Arequipa", "0.00", "75,000.00", "13,500.00", "Aceptado"],
            ["FT F002-0000084", "88204561009", "Codelco Chile (Exportacion)", "50,000.00", "0.00", "0.00", "Declarado - Export."],
            ["FT F001-0000127", "20556789012", "Distribuidora El Sol S.A.C.", "0.00", "12,000.00", "2,160.00", "Pendiente Envío"]
        ],
        cards: [
            { title: "Ventas Declaradas RVIE", value: "S/. 225,000", desc: "Total facturación local", trend: "up", icon: "fa-money-bill-trend-up" },
            { title: "Exportaciones RVIE", value: "S/. 50,000", desc: "Operaciones inafectas de IGV", trend: "up", icon: "fa-plane-departure" },
            { title: "IGV Ventas", value: "S/. 42,660", desc: "Débito generado", trend: "up", icon: "fa-coins" }
        ]
    },

    // --- Declaraciones PDT ---
    "pdt-0601": {
        title: "PDT 0601: Planilla Electrónica (PLAME) - Honorarios 4ta Categoría",
        headers: ["RUC Proveedor", "Razón Social / Profesional", "Nº Recibo Honorarios", "Monto Recibo (S/.)", "Tasa Retención", "Retención Renta 4ta (S/.)", "Estado"],
        data: [
            ["10458796321", "López Rivera, Andrés (Ingeniero)", "E001-152", "12,000.00", "8%", "960.00", "Listo para Carga"],
            ["10724896329", "Soto Valdivia, Monica (Abogada)", "E001-45", "6,500.00", "8%", "520.00", "Listo para Carga"],
            ["10201458963", "Bustamante Carlos, Juan (Consultor)", "E001-84", "10,000.00", "8%", "800.00", "Listo para Carga"]
        ],
        cards: [
            { title: "Total Recibos 4ta", value: "S/. 28,500", desc: "Honorarios cargados en FI", trend: "up", icon: "fa-user-tie" },
            { title: "Total Retenido 4ta", value: "S/. 2,280", desc: "A pagar en la PLAME", trend: "up", icon: "fa-money-bill-1" }
        ]
    },
    "pdt-0626": {
        title: "PDT 0626: Agentes de Retención IGV (3% de Pagos)",
        headers: ["Doc. Pago SAP", "Proveedor RUC", "Razón Social", "Fecha Pago", "Importe de Pago (S/.)", "Monto Retenido 3% (S/.)", "Comprobante Retenc. Nº"],
        data: [
            ["1500000854", "20100482931", "Corporación Aceros Arequipa", "2026-07-15", "120,000.00", "3,600.00", "R001-0001254"],
            ["1500000855", "20556789012", "Distribuidora El Sol S.A.C.", "2026-07-18", "65,000.00", "1,950.00", "R001-0001255"]
        ],
        cards: [
            { title: "Base Sujeta Retención", value: "S/. 185,000", desc: "Pagos a proveedores del mes", trend: "up", icon: "fa-arrows-rotate" },
            { title: "Retención IGV Acum.", value: "S/. 5,550", desc: "Declarar en PDT 0626", trend: "up", icon: "fa-sack-dollar" }
        ]
    },
    "pdt-0617": {
        title: "PDT 0617: Otras Retenciones (IGV y Renta)",
        headers: ["Concepto Tributario", "Base Imponible", "Tasa de Retención", "Impuesto Retenido (S/.)", "Beneficiario", "Estado de Proceso"],
        data: [
            ["Retención Renta No Domiciliados (Oracle)", "12,000.00", "30%", "3,600.00", "Oracle America Inc.", "Listo para Carga"],
            ["Retención de Dividendos (Accionistas)", "25,000.00", "5%", "1,250.00", "Accionistas Locales", "Pendiente Cálculo"]
        ],
        cards: [
            { title: "Total Retención 0617", value: "S/. 4,850", desc: "No domiciliados + Dividendos", trend: "up", icon: "fa-hand-holding-dollar" }
        ]
    },
    "pdt-0710": {
        title: "PDT 0710: Balance de Comprobación Anual SUNAT",
        headers: ["Código Cuenta", "Descripción Cuenta", "Suma Debe (S/.)", "Suma Haber (S/.)", "Saldo Deudor (S/.)", "Saldo Acreedor (S/.)"],
        data: [
            ["10", "Efectivo y Equivalentes", "2,450,000.00", "2,177,970.00", "272,030.00", "0.00"],
            ["12", "Ctas por Cobrar Comerciales", "1,281,350.00", "1,075,000.00", "206,350.00", "0.00"],
            ["42", "Ctas por Pagar Comerciales", "935,000.00", "959,390.00", "0.00", "24,390.00"]
        ],
        cards: [
            { title: "DAOT Operaciones", value: "S/. 2,850,000", desc: "Mapeado anual", trend: "up", icon: "fa-folder-tree" }
        ]
    },

    // --- Detracciones y Retenciones ---
    "detracciones-pagar": {
        title: "Monitor de Detracciones por Pagar (SPOT Banco de la Nación)",
        headers: ["Doc. SAP", "Proveedor RUC", "Razón Social", "Factura Nº", "Monto Factura", "Tasa Detracción", "Monto Detracción (S/.)", "Estado Pago"],
        data: [
            ["19000021", "20100123456", "Servicios Eléctricos del Perú", "F001-12540", "15,000.00", "12%", "1,800.00", "Pendiente Lote"],
            ["19000022", "20556789012", "Inversiones Lima S.A.", "F002-3265", "8,500.00", "10%", "850.00", "Pendiente Lote"]
        ],
        cards: [
            { title: "Detracciones por Pagar", value: "S/. 2,650", desc: "Pendiente de agrupar en Lote", trend: "down", icon: "fa-hourglass" }
        ]
    },
    "detracciones-lote": {
        title: "Configuración de Lote de Detracciones (Carga Masiva BN)",
        headers: ["ID Lote", "Fecha Creación", "Cantidad Documentos", "Total Detracción (S/.)", "Moneda", "Estado de Lote"],
        data: [
            ["LOTE-202607-0025", "2026-07-23", "2 Facturas", "2,650.00", "PEN", "Listo para Procesar"],
            ["LOTE-202607-0024", "2026-07-15", "5 Facturas", "4,890.00", "PEN", "Pagado y Procesado"]
        ],
        cards: [
            { title: "Lote Actual", value: "LOTE-0025", desc: "Agrupa 2 facturas pendientes", trend: "up", icon: "fa-layer-group" }
        ]
    },
    "detracciones-pago": {
        title: "Registro de Pago de Detracciones y Actualización de Constancia",
        headers: ["Doc. SAP", "Factura Nº", "Proveedor RUC", "Monto Detracción", "Fecha Pago BN", "Nº Constancia Depósito", "Estado Actualización"],
        data: [
            ["19000024", "F012-401", "20501020304", "850.00", "2026-07-20", "CONST-45879201", "Actualizado en SAP"],
            ["19000023", "F005-950", "20204060809", "1,000.00", "2026-07-20", "CONST-45879202", "Actualizado en SAP"]
        ],
        cards: [
            { title: "Constancias Registradas", value: "12 Constancias", desc: "Enlazadas al documento SAP", trend: "up", icon: "fa-link" }
        ]
    },
    "padrones-actualizar": {
        title: "Actualización de Padrones de SUNAT y Bloqueo Preventivo",
        headers: ["Nombre Padrón", "Fecha Publicación", "Cantidad Contribuyentes", "Formato Origen", "Estado Carga en SAP", "Última Validación"],
        data: [
            ["Padrón Contribuyentes No Habidos", "2026-07-01", "45,890", "TXT Oficial", "Cargado Exitoso", "Hace 30 min (Validado OK)"],
            ["Padrón Agentes de Retención", "2026-07-01", "12,450", "TXT Oficial", "Cargado Exitoso", "Hace 2 horas (Validado OK)"],
            ["Padrón Buenos Contribuyentes", "2026-07-01", "8,900", "TXT Oficial", "Cargado Exitoso", "Hace 2 horas (Validado OK)"]
        ],
        cards: [
            { title: "Contribuyentes Bloqueados", value: "2 RUCs", desc: "No Habidos detectados en compras", trend: "down", icon: "fa-ban" }
        ]
    },
    "retenciones-electronicas": {
        title: "Monitor de Retenciones Electrónicas Integradas con SUNAT (CRE)",
        headers: ["Doc. Pago SAP", "Proveedor RUC", "Razón Social", "Importe Pago (S/.)", "Retención (3%)", "Estado CPE", "Respuesta OSE/SUNAT"],
        data: [
            ["1500000854", "20100482931", "Corporación Aceros Arequipa", "120,000.00", "3,600.00", "Aceptado", "Comprobante R001-1254 Generado"],
            ["1500000855", "20556789012", "Distribuidora El Sol S.A.C.", "65,000.00", "1,950.00", "Aceptado", "Comprobante R001-1255 Generado"]
        ],
        cards: [
            { title: "CRE Emitidos", value: "2 Emitidos", desc: "Comprobantes de Retención Electrónicos", trend: "up", icon: "fa-paper-plane" }
        ]
    },

    // --- Bancos y Tesorería ---
    "tesoreria-pagos": {
        title: "Gestión de Pago a Proveedores (Carga de Archivo de Planilla Bancaria)",
        headers: ["Propuesta Pago", "Fecha Pago", "Banco Emisor", "Cantidad Facturas", "Monto Total (S/.)", "Tipo Formato Archivo", "Estado Generación"],
        data: [
            ["PROP-202607-01", "2026-07-24", "Banco BCP Cta Cte", "18 Facturas", "145,890.00", "BCP Telecrédito TXT", "Generado y Descargado"],
            ["PROP-202607-02", "2026-07-24", "Banco BBVA Cta Cte", "8 Facturas", "54,200.00", "BBVA Continental TXT", "Listo para Descarga"]
        ],
        cards: [
            { title: "Total Propuesta", value: "S/. 200,090", desc: "Pagos de tesorería del día", trend: "up", icon: "fa-wallet" }
        ]
    },
    "multicash-extracto": {
        title: "Extractos Bancarios (Carga y Validación de Archivos MultiCash)",
        headers: ["ID Archivo", "Fecha Carga", "Banco", "Moneda", "Saldo Inicial", "Saldo Final", "Líneas de Extracto", "Estado de Carga"],
        data: [
            ["EXT-BCP-20260723", "2026-07-23", "Banco BCP", "PEN", "125,600.00", "206,930.00", "48 Líneas", "Cargado Exitoso"],
            ["EXT-BBVA-20260723", "2026-07-23", "Banco BBVA", "PEN", "45,000.00", "45,000.00", "0 Líneas", "Sin Movimiento"]
        ],
        cards: [
            { title: "Líneas Cargadas", value: "48 Operaciones", desc: "En el periodo actual", trend: "up", icon: "fa-file-invoice" }
        ]
    },
    "conciliacion-dashboard": {
        title: "Dashboard de Conciliación Bancaria Automática (MultiCash vs. SAP)",
        headers: ["Fecha Banco", "Ref. Operación", "Descripción Transacción", "Monto Cargado (S/.)", "Monto Abonado (S/.)", "Doc. Conciliado SAP", "Estado Concil."],
        data: [
            ["2026-07-20", "OP-45879", "Abono Factura Minera Las Bambas", "0.00", "177,000.00", "1400001052 (FT 125)", "Autoconciliado"],
            ["2026-07-20", "OP-12547", "Cobro Comisión Bancaria BCP", "45.00", "0.00", "1500000412 (Gasto Bco)", "Autoconciliado"],
            ["2026-07-21", "OP-89654", "Pago Proveedor Servicios Eléctricos", "13,200.00", "0.00", "Pendiente", "Manual (Diferencia S/.180)"],
            ["2026-07-21", "OP-33251", "Depósito no Identificado Ventas", "0.00", "1,200.00", "Pendiente", "No Conciliado"]
        ],
        cards: [
            { title: "Autoconciliación (Reglas)", value: "92 %", desc: "44 de 48 líneas conciliadas", trend: "up", icon: "fa-wand-magic-sparkles" },
            { title: "Pendiente Conciliar", value: "4 Líneas", desc: "Requiere conciliación manual", trend: "down", icon: "fa-triangle-exclamation" }
        ]
    }
};

// --- DOM elements selectors ---
const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebar-toggle");
const menuItems = document.querySelectorAll(".menu-item");
const submenuItems = document.querySelectorAll(".submenu-item");
const pageTitle = document.getElementById("page-title");
const selectTipoLibro = document.getElementById("tipo-libro-select");
const btnEjecutar = document.getElementById("btn-ejecutar");
const btnValidar = document.getElementById("btn-validar");
const btnDescargar = document.getElementById("btn-descargar");
const summaryCardsContainer = document.getElementById("summary-cards");
const tableHeaders = document.getElementById("table-headers");
const tableBody = document.getElementById("table-body");
const gridTitle = document.getElementById("grid-title");

// Chatbot Elements
const chatbotDrawer = document.getElementById("chatbot-drawer");
const chatToggleHeader = document.getElementById("chat-toggle-header");
const chatClose = document.getElementById("chat-close");
const chatToggleFloating = document.getElementById("chat-toggle-floating");
const chatMessages = document.getElementById("chat-messages");
const chatInput = document.getElementById("chat-input");
const chatSendBtn = document.getElementById("chat-send-btn");

let currentPage = "config-base";

// --- Functions ---

// 1. Navigation & Content Rendering
function loadPage(pageId) {
    currentPage = pageId;
    
    const dashboardView = document.getElementById("dashboard-view");
    const standardGrid = document.querySelector(".grid-container");
    const filterBar = document.querySelector(".filter-bar");
    const summaryCards = document.querySelector(".summary-cards");

    if (pageId === "dashboard-general") {
        dashboardView.classList.remove("hidden");
        standardGrid.style.display = "none";
        filterBar.style.display = "none";
        summaryCards.style.display = "none";
        
        pageTitle.textContent = "Dashboard General de Control y Cumplimiento";
        selectTipoLibro.innerHTML = `<option value="dashboard-general">Dashboard General</option>`;
        return;
    } else {
        dashboardView.classList.add("hidden");
        standardGrid.style.display = "flex";
        filterBar.style.display = "grid";
        summaryCards.style.display = "grid";
    }

    const pageConfig = mockDatabase[pageId];
    if (!pageConfig) return;
    
    // Update Title and grid details
    pageTitle.textContent = pageConfig.title;
    gridTitle.textContent = `Registros Contables en memoria (SAP HANA) - ${pageConfig.title}`;
    
    // Set the report selector to read-only name matching the active page
    selectTipoLibro.innerHTML = `<option value="${pageId}">${pageConfig.title}</option>`;

    // Render Cards
    renderCards(pageConfig.cards);

    // Render Table Data
    renderTable(pageConfig.headers, pageConfig.data);
    
    // Adjust action button label dynamically
    if (pageId.startsWith("sire-")) {
        btnDescargar.innerHTML = `<i class="fa-solid fa-file-zipper"></i> Descargar SIRE (.ZIP)`;
    } else if (pageId.startsWith("pdt-")) {
        btnDescargar.innerHTML = `<i class="fa-solid fa-file-export"></i> Exportar PDT (.TXT)`;
    } else if (pageId === "config-base") {
        btnDescargar.innerHTML = `<i class="fa-solid fa-download"></i> Descargar Config (.TXT)`;
    } else {
        btnDescargar.innerHTML = `<i class="fa-solid fa-download"></i> Descargar PLE (.TXT)`;
    }
}

function renderCards(cards) {
    summaryCardsContainer.innerHTML = "";
    cards.forEach(card => {
        const trendClass = card.trend === "up" ? "trend-up" : "trend-down";
        const trendIcon = card.trend === "up" ? "fa-arrow-up" : "fa-arrow-down";
        
        const cardHtml = `
            <div class="card">
                <span class="card-title">${card.title}</span>
                <span class="card-value">${card.value}</span>
                <div class="card-footer ${trendClass}">
                    <i class="fa-solid ${trendIcon}"></i>
                    <span>${card.desc}</span>
                </div>
            </div>
        `;
        summaryCardsContainer.insertAdjacentHTML("beforeend", cardHtml);
    });
}

function renderTable(headers, rows) {
    // Render Headers
    tableHeaders.innerHTML = "";
    headers.forEach(header => {
        const th = document.createElement("th");
        th.textContent = header;
        tableHeaders.appendChild(th);
    });

    // Render Rows
    tableBody.innerHTML = "";
    rows.forEach(row => {
        const tr = document.createElement("tr");
        row.forEach(cellText => {
            const td = document.createElement("td");
            
            // Format status badges
            if (cellText === "Activo" || cellText === "Coincide perfectly" || cellText === "Aceptado" || cellText === "Autoconciliado" || cellText === "Conectado" || cellText === "Normal" || cellText === "Provisionado" || cellText === "Declarado - Export." || cellText === "Cargado Exitoso" || cellText === "Actualizado en SAP" || cellText === "Homologada" || cellText === "Generado y Descargado") {
                td.innerHTML = `<span class="status-badge success">${cellText}</span>`;
            } else if (cellText === "Vencido" || cellText === "Diferencia IGV S/. 50.00" || cellText === "Manual (Diferencia S/.180)" || cellText === "No existe en SUNAT (Adicionar)" || cellText === "En Cobranza Legal") {
                td.innerHTML = `<span class="status-badge error">${cellText}</span>`;
            } else if (cellText === "Por Pagar" || cellText === "Pendiente Envío" || cellText === "No Conciliado" || cellText === "Listo para Carga" || cellText === "Generado (.TXT)" || cellText === "En Proceso" || cellText === "Listo para Pago" || cellText === "Diferido" || cellText === "Pendiente Lote" || cellText === "Listo para Procesar" || cellText === "Listo para Descarga" || cellText === "Sin Saldo") {
                td.innerHTML = `<span class="status-badge warning">${cellText}</span>`;
            } else {
                td.textContent = cellText;
            }
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });
}

// 2. Download Simulation
function triggerDownload() {
    const pageConfig = mockDatabase[currentPage];
    const sociedad = document.getElementById("sociedad-select").value;
    const ejercicio = document.getElementById("ejercicio-select").value;
    const periodo = document.getElementById("periodo-select").value;
    
    // Create text structure resembling SUNAT format
    let fileContent = `=== SAP S/4HANA PERU LOCALIZATION EXPORT ===\n`;
    fileContent += `Sociedad: ${sociedad} | Ejercicio: ${ejercicio} | Periodo: ${periodo}\n`;
    fileContent += `Libro / Reporte: ${pageConfig.title}\n`;
    fileContent += `Generado el: ${new Date().toLocaleString()}\n`;
    fileContent += `============================================\n\n`;
    
    // Append headers delimited by Pipe |
    fileContent += pageConfig.headers.join(" | ") + "\n";
    fileContent += "-".repeat(60) + "\n";
    
    // Append data
    pageConfig.data.forEach(row => {
        fileContent += row.join(" | ") + "\n";
    });

    // Formulate a SUNAT standard filename
    let ruc = "20601234567";
    let fileId = "080100";
    
    if (currentPage.startsWith("lib-bal-")) {
        const parts = currentPage.split("-");
        const num1 = parts[2]; // "3"
        const num2 = parts[3]; // e.g. "1" or "12"
        const suffix = num2.padStart(2, '0');
        fileId = `03${suffix}`;
    } else if (currentPage === "diario-5-1") {
        fileId = "050100";
    } else if (currentPage === "diario-5-3") {
        fileId = "050300";
    } else if (currentPage === "mayor-6-1") {
        fileId = "060100";
    } else if (currentPage === "af-7-1") {
        fileId = "070100";
    } else if (currentPage === "af-7-3") {
        fileId = "070300";
    } else if (currentPage === "af-7-4") {
        fileId = "070400";
    } else if (currentPage === "kardex-13-1") {
        fileId = "130100";
    } else if (currentPage === "sire-rce-propuesta") {
        fileId = "080100";
    } else if (currentPage === "sire-rce-no-dom") {
        fileId = "080200";
    } else if (currentPage === "sire-rvie-propuesta") {
        fileId = "140100";
    }
    
    let filename = `LE${ruc}${ejercicio}${periodo}00${fileId}1111.TXT`;
    if (currentPage.startsWith("sire-")) {
        filename = `SIRE_${sociedad}_${ejercicio}_${periodo}_PROPUESTA.ZIP`;
    }

    // Trigger download
    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification(`Descargado con éxito: ${filename}`, "success");
}

function showNotification(message, type) {
    const toast = document.createElement("div");
    toast.style.position = "fixed";
    toast.style.bottom = "24px";
    toast.style.left = "24px";
    toast.style.backgroundColor = type === "success" ? "var(--sap-success)" : "var(--sap-primary)";
    toast.style.color = "white";
    toast.style.padding = "12px 24px";
    toast.style.borderRadius = "6px";
    toast.style.boxShadow = "var(--sap-shadow)";
    toast.style.zIndex = "1000";
    toast.style.fontSize = "13px";
    toast.style.fontWeight = "600";
    toast.style.display = "flex";
    toast.style.alignItems = "center";
    toast.style.gap = "8px";
    toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${message}`;
    
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transition = "opacity 0.5s";
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// 3. Chatbot Droid Asistente Virtual Logic
function appendChatMessage(sender, text, suggestions = null) {
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${sender}`;
    bubble.innerHTML = text;

    if (suggestions) {
        const suggestionContainer = document.createElement("div");
        suggestionContainer.className = "bot-suggested-actions";
        suggestions.forEach(act => {
            const btn = document.createElement("button");
            btn.className = "suggested-action-btn";
            btn.innerHTML = `<i class="${act.icon}"></i> ${act.text}`;
            btn.setAttribute("data-query", act.query);
            btn.addEventListener("click", () => {
                const query = btn.getAttribute("data-query");
                chatInput.value = query;
                handleUserSendMessage();
            });
            suggestionContainer.appendChild(btn);
        });
        bubble.appendChild(suggestionContainer);
    }

    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
    const indicator = document.createElement("div");
    indicator.className = "chat-bubble bot typing-indicator-container";
    indicator.id = "typing-indicator";
    indicator.innerHTML = `
        <div class="typing-indicator">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        </div>
    `;
    chatMessages.appendChild(indicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById("typing-indicator");
    if (indicator) indicator.remove();
}

function handleUserSendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    
    appendChatMessage("user", text);
    chatInput.value = "";
    
    showTypingIndicator();
    
    setTimeout(() => {
        removeTypingIndicator();
        processBotResponse(text);
    }, 1200);
}

function processBotResponse(query) {
    const q = query.toLowerCase();
    
    let botReply = "";
    let suggestions = null;

    if (q.includes("sire") || q.includes("inconsistencia") || q.includes("rce") || q.includes("compras")) {
        botReply = "He analizado la propuesta de SUNAT contra SAP S/4HANA (RCE Compras). Encontré <strong>2 inconsistencias activas</strong> para el periodo actual:<br><br>" +
                   "1. <strong>Diferencia de IGV:</strong> Factura <em>FT F002-8940</em> de Proveedor <em>Inversiones Lima S.A.</em> tiene S/. 900.00 en SAP y S/. 850.00 en SUNAT.<br>" +
                   "2. <strong>Falta en SUNAT:</strong> Factura <em>FT E005-1203</em> registrada en SAP por S/. 15,000.00 no figura en la propuesta de SUNAT.<br><br>" +
                   "¿Deseas que prepare el archivo de adiciones/reemplazos para enviarlo?";
        suggestions = [
            { text: "Navegar a 8.1 Propuesta RCE", icon: "fa-solid fa-cart-shopping", query: "Ir a Compras" }
        ];
    } else if (q.includes("detracción") || q.includes("lote") || q.includes("pago")) {
        botReply = "Actualmente en el monitor de detracciones tenemos <strong>S/. 2,650.00 pendientes de pago</strong> (2 facturas de proveedores).<br><br>" +
                   "¿Deseas agruparlas en un lote para generar el archivo de transferencia del Banco de la Nación?";
        suggestions = [
            { text: "Ver Monitor Detracciones", icon: "fa-solid fa-percentage", query: "Ir a detracciones" }
        ];
    } else if (q.includes("conciliación") || q.includes("bancos") || q.includes("extracto")) {
        botReply = "La carga del extracto MultiCash se realizó con éxito. El <strong>92% de las transacciones</strong> se conciliaron de forma automática.<br><br>" +
                   "Quedan <strong>4 partidas pendientes</strong> que requieren revisión manual, incluyendo un abono no identificado de S/. 1,200.00.";
        suggestions = [
            { text: "Ir a Reporte Conciliación", icon: "fa-solid fa-landmark", query: "Ir a conciliacion" }
        ];
    } else if (q.includes("vencimiento") || q.includes("calendario") || q.includes("sunat")) {
        botReply = "El calendario de vencimientos de SUNAT para tu RUC (que termina en dígito <strong>7</strong>) establece que el vencimiento de la declaración de libros (PLE y SIRE) vence el día <strong>18 de Agosto de 2026</strong>. Tienes 25 días restantes.";
    } else if (q.includes("ir a compras") || q.includes("compras")) {
        botReply = "Cargando el panel del Registro de Compras Electrónico (8.1 Propuesta RCE).";
        openSidebarSubmenu("submenu-sire-compras", "sire-rce-propuesta");
    } else if (q.includes("ir a conciliacion")) {
        botReply = "Cargando el Dashboard de Conciliación Bancaria.";
        openSidebarSubmenu("submenu-tesoreria", "conciliacion-dashboard");
    } else if (q.includes("ir a detracciones")) {
        botReply = "Cargando el Monitor de Detracciones por Pagar.";
        openSidebarSubmenu("submenu-detracciones", "detracciones-pagar");
    } else {
        botReply = "Entendido. Soy Droid Asistente Virtual, tu copiloto SAP y puedo ayudarte en:<br>" +
                   "• Buscar discrepancias en tus libros electrónicos.<br>" +
                   "• Generar lotes de detracciones pendientes.<br>" +
                   "• Resolver dudas sobre las normativas SIRE y PLE SUNAT.<br><br>" +
                   "Por favor, indícame qué módulo o reporte contable deseas analizar.";
    }

    appendChatMessage("bot", botReply, suggestions);
}

// Helper to open a specific sidebar category and active its child
function openSidebarSubmenu(submenuId, pageId) {
    // Open category submenu
    const submenu = document.getElementById(submenuId);
    if (submenu) submenu.classList.add("open");
    
    // Find parent menu item and add open class
    const parentMenuItem = document.querySelector(`.menu-item[data-target="${submenuId}"]`);
    if (parentMenuItem) parentMenuItem.classList.add("open");
    
    // Active the item
    document.querySelectorAll(".submenu-item, .menu-item").forEach(el => el.classList.remove("active"));
    const subItem = document.querySelector(`.submenu-item[data-page="${pageId}"]`);
    if (subItem) subItem.classList.add("active");
    
    loadPage(pageId);
}

function toggleSidebar() {
    sidebar.classList.toggle("collapsed");
}

function toggleChat(show) {
    if (show) {
        chatbotDrawer.classList.remove("collapsed");
        chatToggleFloating.classList.add("hidden");
    } else {
        chatbotDrawer.classList.add("collapsed");
        chatToggleFloating.classList.remove("hidden");
    }
}

// --- Event Listeners ---

// Sidebar collapse toggle
sidebarToggle.addEventListener("click", toggleSidebar);

// Collapsible Submenus Toggle
document.querySelectorAll(".menu-item.has-submenu").forEach(item => {
    item.addEventListener("click", (e) => {
        // Only toggle if sidebar is NOT collapsed
        if (sidebar.classList.contains("collapsed")) {
            sidebar.classList.remove("collapsed");
        }
        
        item.classList.toggle("open");
        const targetId = item.getAttribute("data-target");
        const submenu = document.getElementById(targetId);
        if (submenu) {
            submenu.classList.toggle("open");
        }
    });
});

// Click listener on submenu items
submenuItems.forEach(subItem => {
    subItem.addEventListener("click", (e) => {
        e.stopPropagation(); // Avoid triggering parent item collapse
        const pageId = subItem.getAttribute("data-page");
        
        document.querySelectorAll(".submenu-item, .menu-item").forEach(el => el.classList.remove("active"));
        subItem.classList.add("active");
        loadPage(pageId);
    });
});

// Click listener on simple menu items (not submenus)
document.querySelectorAll(".menu-item:not(.has-submenu)").forEach(item => {
    item.addEventListener("click", () => {
        const pageId = item.getAttribute("data-page");
        
        document.querySelectorAll(".submenu-item, .menu-item").forEach(el => el.classList.remove("active"));
        item.classList.add("active");
        loadPage(pageId);
    });
});

// Run Button Action
btnEjecutar.addEventListener("click", () => {
    showNotification(`Cargados datos en tiempo real para: ${mockDatabase[currentPage].title}`, "info");
});

// Validate SUNAT Action
btnValidar.addEventListener("click", () => {
    btnValidar.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Validando...`;
    btnValidar.disabled = true;
    
    setTimeout(() => {
        btnValidar.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> Validar SUNAT`;
        btnValidar.disabled = false;
        
        const rows = tableBody.querySelectorAll("tr");
        rows.forEach(row => {
            const cells = row.querySelectorAll("td");
            const lastCell = cells[cells.length - 1];
            if (lastCell) {
                lastCell.innerHTML = `<span class="status-badge success">Validado SUNAT</span>`;
            }
        });
        showNotification("Validación masiva con SUNAT completada exitosamente.", "success");
    }, 1500);
});

// Download button action
btnDescargar.addEventListener("click", triggerDownload);

// Chat Drawer opening and closing
chatToggleHeader.addEventListener("click", () => toggleChat(true));
chatClose.addEventListener("click", () => toggleChat(false));
chatToggleFloating.addEventListener("click", () => toggleChat(true));

// Chat inputs
chatSendBtn.addEventListener("click", handleUserSendMessage);
chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleUserSendMessage();
});

// --- Initial Startup ---
loadPage("dashboard-general");
toggleChat(true);
