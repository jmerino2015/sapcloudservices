sap.ui.define([], function () {
    "use strict";

    return {

        /**
         * Formatea importes numéricos a dos decimales con separador de miles
         * @param {number|string} vValue 
         * @returns {string}
         */
        currency: function (vValue) {
            if (vValue === null || vValue === undefined || vValue === "") {
                return "0.00";
            }
            var fVal = parseFloat(vValue);
            return fVal.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        },

        /**
         * Retorna el estado semántico (Success, Warning, Error, Information, None) según el código de estado
         * @param {string} sStatus 
         * @returns {string}
         */
        statusState: function (sStatus) {
            switch (sStatus) {
                case "CONTABILIZADO":
                case "APROBADA":
                case "PAGADO":
                case "ACEPTADO":
                case "COMPROBANTE_REGISTRADO":
                    return "Success";
                case "PRE_REGISTRADO":
                case "PENDIENTE":
                case "EN_TRANSITO":
                case "SIN_COMPROBANTE":
                    return "Warning";
                case "RECHAZADO":
                case "RECHAZADA":
                case "CANCELADO":
                    return "Error";
                default:
                    return "None";
            }
        },

        /**
         * Retorna el texto legible del estado
         * @param {string} sStatus 
         * @returns {string}
         */
        statusText: function (sStatus) {
            switch (sStatus) {
                case "CONTABILIZADO":
                    return "Contabilizada en SAP";
                case "PRE_REGISTRADO":
                    return "Pre-Registrado";
                case "SIN_COMPROBANTE":
                    return "Sin Comprobante";
                case "COMPROBANTE_REGISTRADO":
                    return "Con Comprobante";
                case "APROBADA":
                    return "Aprobada";
                case "RECHAZADO":
                case "RECHAZADA":
                    return "Rechazada";
                case "PAGADO":
                    return "Pagado";
                case "PENDIENTE":
                    return "Pendiente Pago";
                default:
                    return sStatus || "";
            }
        },

        /**
         * Formatea cadenas de fecha AAAAMMDD o ISO a DD/MM/AAAA
         * @param {string} sDate 
         * @returns {string}
         */
        formatDate: function (sDate) {
            if (!sDate) {
                return "";
            }
            if (sDate.length === 8 && !isNaN(sDate)) {
                return sDate.substring(6, 8) + "/" + sDate.substring(4, 6) + "/" + sDate.substring(0, 4);
            }
            return sDate;
        }

    };
});
