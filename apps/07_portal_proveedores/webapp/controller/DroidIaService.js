sap.ui.define([], function () {
    "use strict";

    return {

        /**
         * Procesa la consulta en lenguaje natural contra el modelo de datos de la app
         * @param {string} sQuestion 
         * @param {sap.ui.model.Model} oAppModel 
         * @returns {string} Mensaje HTML formateado de respuesta de SAP Joule Droid
         */
        processQuery: function (sQuestion, oAppModel) {
            if (!sQuestion) {
                return "¡Hola! Soy <b>SAP Joule Droid</b>. ¿En qué puedo ayudarte hoy sobre tus facturas, órdenes de compra o pagos?";
            }

            var sQuery = sQuestion.toLowerCase().trim();

            // Consulta específica por factura F001-452 o similar
            if (sQuery.includes("f001-452") || sQuery.includes("f001") || sQuery.includes("452")) {
                return "📄 <b>Estado de Factura F001-452:</b><br/>" +
                    "• <b>Comprobante:</b> F001-452<br/>" +
                    "• <b>Proveedor:</b> SERVICIOS TECNOLÓGICOS S.A.C. (RUC 20517426726)<br/>" +
                    "• <b>Estado SAP:</b> <span style='color: #0070f2; font-weight: bold;'>PRE-REGISTRADO / EN REVISIÓN</span><br/>" +
                    "• <b>Monto Total:</b> USD 14,750.00 (IGV Incluido)<br/>" +
                    "• <b>Fecha Emisión:</b> 15/09/2026<br/>" +
                    "• <b>Orden de Compra:</b> OC-4540012337<br/>" +
                    "• <b>Fecha Est. Pago:</b> 30/09/2026<br/><br/>" +
                    "💡 <i>El comprobante se encuentra en la bandeja de verificación del área de Contabilidad.</i>";
            }

            // 1. Consultas de Facturas y Pre-Registro
            if (sQuery.includes("factura") || sQuery.includes("pre-registro") || sQuery.includes("preregistro") || sQuery.includes("comprobante") || sQuery.includes("migo") || sQuery.includes("hes")) {
                var aGoodsReceipts = oAppModel ? oAppModel.getProperty("/goodsReceipts") || [] : [];
                var aAccInvoices = oAppModel ? oAppModel.getProperty("/accountingInvoices") || [] : [];

                var iSinComprobante = aGoodsReceipts.filter(function (g) { return g.estado === "SIN_COMPROBANTE"; }).length;
                var iPreRegistradas = aAccInvoices.filter(function (i) { return i.estado === "PRE_REGISTRADO"; }).length;
                var iContabilizadas = aAccInvoices.filter(function (i) { return i.estado === "CONTABILIZADO"; }).length;

                var fMontoPendiente = 0;
                aGoodsReceipts.forEach(function (g) {
                    if (g.estado === "SIN_COMPROBANTE") {
                        fMontoPendiente += g.importe || 0;
                    }
                });

                return "🤖 <b>Resumen de Facturas — SAP Joule Droid:</b><br/><br/>" +
                    "• <b>Entradas EM/AS pendientes de pre-registro:</b> " + iSinComprobante + " posiciones (USD " + fMontoPendiente.toLocaleString("es-PE", { minimumFractionDigits: 2 }) + ")<br/>" +
                    "• <b>Facturas en revisión Contabilidad:</b> " + iPreRegistradas + " comprobante(s)<br/>" +
                    "• <b>Facturas contabilizadas en SAP:</b> " + iContabilizadas + " comprobante(s)<br/><br/>" +
                    "💡 <i>Tip: Navega al menú 'Pre-Registro Facturas' para adjuntar tus archivos XML y PDF.</i>";
            }

            // 2. Órdenes de Compra (OC)
            if (sQuery.includes("orden") || sQuery.includes("oc") || sQuery.includes("pedido") || sQuery.includes("abierta")) {
                var aOC = oAppModel ? oAppModel.getProperty("/ocHistory") || [] : [];
                return "🛒 <b>Órdenes de Compra Activas — SAP Joule Droid:</b><br/><br/>" +
                    "• <b>OC Principal Activa:</b> OC 4540012337 (Bolsas de horas consultoría SAP & Fiori)<br/>" +
                    "• <b>Estado:</b> Abierta / Recepción Parcial<br/>" +
                    "• <b>Total de Posiciones Registradas:</b> " + (aOC.length || 3) + " posiciones<br/>" +
                    "• <b>Moneda:</b> USD / PEN<br/><br/>" +
                    "💡 <i>Puedes revisar las especificaciones y entregas en el menú 'Órdenes de Compra'.</i>";
            }

            // 3. Consultas de Pagos & Retenciones
            if (sQuery.includes("pago") || sQuery.includes("banco") || sQuery.includes("reten") || sQuery.includes("detrac") || sQuery.includes("procesa")) {
                var aPayments = oAppModel ? oAppModel.getProperty("/paymentHistory") || [] : [];
                var fTotalPagado = 0;
                var fTotalDetraccion = 0;

                aPayments.forEach(function (p) {
                    fTotalPagado += p.importeDocumento || 0;
                    fTotalDetraccion += p.importeDetraccion || 0;
                });

                var sUltimoPago = aPayments.length > 0 ? aPayments[0].fechaPago + " vía " + aPayments[0].bancoPagador : "12/09/2026 vía BCP";

                return "💳 <b>Resumen de Pagos & Retenciones — SAP Joule Droid:</b><br/><br/>" +
                    "• <b>Programación de Pagos:</b> Los pagos se ejecutan los días <b>15 y 30 de cada mes</b>.<br/>" +
                    "• <b>Último pago registrado:</b> " + sUltimoPago + "<br/>" +
                    "• <b>Monto acumulado pagado:</b> USD " + (fTotalPagado > 0 ? fTotalPagado.toLocaleString("es-PE", { minimumFractionDigits: 2 }) : "48,500.00") + "<br/>" +
                    "• <b>Retenciones / Detracciones abonadas:</b> USD " + (fTotalDetraccion > 0 ? fTotalDetraccion.toLocaleString("es-PE", { minimumFractionDigits: 2 }) : "5,820.00") + "<br/><br/>" +
                    "💡 <i>Puedes descargar las constancias en el menú 'Historial de Pagos'.</i>";
            }

            // 4. Notas de Crédito & Comprobantes / OCR
            if (sQuery.includes("nota") || sQuery.includes("credito") || sQuery.includes("crédito") || sQuery.includes("xml") || sQuery.includes("ocr")) {
                return "📄 <b>Registro de Notas de Crédito & Comprobantes:</b><br/><br/>" +
                    "1. Ingresa a la sección <b>Pre-Registro Facturas</b>.<br/>" +
                    "2. Selecciona la opción <b>Cargar XML / OCR</b>.<br/>" +
                    "3. Para Notas de Crédito, adjunta el XML SUNAT asociando la factura de referencia (ej. F001-452).<br/>" +
                    "4. El sistema validará automáticamente con SUNAT el estado del comprobante y RUC.<br/><br/>" +
                    "💡 <i>Nuestra tecnología OCR extrae automáticamente serie, correlativo, fechas e importes.</i>";
            }

            // 5. Datos Proveedor / Empresa
            if (sQuery.includes("proveedor") || sQuery.includes("ruc") || sQuery.includes("empresa") || sQuery.includes("datos")) {
                var oUser = oAppModel ? oAppModel.getProperty("/user") || {} : {};
                return "🏢 <b>Perfil de Proveedor:</b><br/><br/>" +
                    "• <b>Razón Social:</b> " + (oUser.name || "SERVICIOS TECNOLÓGICOS S.A.C.") + "<br/>" +
                    "• <b>RUC / NIF:</b> " + (oUser.nif || "20517426726") + "<br/>" +
                    "• <b>Dirección Fiscal:</b> " + (oUser.address || "Av. Las Camelias 790, San Isidro, Lima") + "<br/>" +
                    "• <b>Sociedad SAP:</b> " + (oUser.sociedad || "1000 - Sociedad Principal") + "<br/>" +
                    "• <b>Estado:</b> <span style='color: #107e3e; font-weight: bold;'>PROVEEDOR HOMOLOGADO / ACTIVO</span>";
            }

            // 6. Respuesta General Inteligente
            return "🔍 <b>SAP Joule AI procesó tu consulta:</b><br/><br/>" +
                "He verificado tu consulta '<i>" + sQuestion + "</i>' en la base de datos del Portal de Proveedores para <b>tu cuenta de proveedor (RUC 20517426726)</b>.<br/>" +
                "Puedes consultar la información directamente en los módulos del menú lateral o consultarme sobre facturas específicas, OCs o fechas de pago.";
        }

    };
});
