sap.ui.define([], function () {
    "use strict";

    return {
        currency: function (sValue, sCurrency) {
            if (!sValue) {
                return "0.00";
            }
            var fVal = parseFloat(sValue);
            return (sCurrency || "USD") + " " + fVal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        },

        statusState: function (sStatus) {
            switch (sStatus) {
                case "CONTABILIZADO":
                    return "Success";
                case "PRE_REGISTRADO":
                    return "Warning";
                case "RECHAZADO":
                    return "Error";
                default:
                    return "None";
            }
        },

        matchState: function (sMatch) {
            switch (sMatch) {
                case "MATCHED":
                    return "Success";
                case "DISCREPANCY_PRICE":
                    return "Warning";
                case "DISCREPANCY_QTY":
                    return "Error";
                default:
                    return "None";
            }
        },

        matchText: function (sMatch) {
            switch (sMatch) {
                case "MATCHED":
                    return "Conforme (Matched)";
                case "DISCREPANCY_PRICE":
                    return "Variación Precio ±2%";
                case "DISCREPANCY_QTY":
                    return "Discrepancia Cantidad";
                default:
                    return "Pendiente de Conciliar";
            }
        },

        matchIcon: function (sMatch) {
            switch (sMatch) {
                case "MATCHED":
                    return "sap-icon://sys-enter-2";
                case "DISCREPANCY_PRICE":
                    return "sap-icon://alert";
                case "DISCREPANCY_QTY":
                    return "sap-icon://error";
                default:
                    return "sap-icon://pending";
            }
        },

        sunatState: function (sSunat) {
            if (!sSunat) return "None";
            if (sSunat.includes("ACEPTADO")) {
                return "Success";
            } else if (sSunat.includes("OBSERVADO")) {
                return "Warning";
            } else if (sSunat.includes("RECHAZADO")) {
                return "Error";
            }
            return "Information";
        }
    };
});
