sap.ui.define([
    "sap/crm/customerportal/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text",
    "sap/m/VBox",
    "sap/m/HBox",
    "sap/m/Table",
    "sap/m/Column",
    "sap/m/ColumnListItem",
    "sap/m/Title",
    "sap/m/ObjectStatus",
    "sap/m/ObjectHeader",
    "sap/m/ObjectAttribute",
    "sap/ui/core/HTML"
], function (
    BaseController, Filter, FilterOperator, MessageToast, MessageBox,
    Dialog, Button, Text, VBox, HBox, Table, Column, ColumnListItem,
    Title, ObjectStatus, ObjectHeader, ObjectAttribute, HTML
) {
    "use strict";

    return BaseController.extend("sap.crm.customerportal.controller.Sales", {

        onInit: function () {
            var oRouter = this.getRouter();
            oRouter.getRoute("sales").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            var oArgs = oEvent.getParameter("arguments");
            var oQuery = oArgs["?query"];
            if (oQuery && oQuery.tab) {
                var oTabBar = this.byId("salesIconTabBar");
                if (oTabBar) {
                    oTabBar.setSelectedKey(oQuery.tab);
                }
            }
        },

        onTabSelect: function (oEvent) {
            var sKey = oEvent.getParameter("key");
            this.recordActivity("Navegación a pestaña de Ventas: " + sKey, "Ventas & Comercio", "NavigationLog");
        },

        /* =========================================================== */
        /* PRODUCT CATALOG & LIVE FILTERS                              */
        /* =========================================================== */

        onSearchProduct: function () {
            this._applyCatalogFilters();
        },

        onFilterCategory: function () {
            this._applyCatalogFilters();
        },

        _applyCatalogFilters: function () {
            var sQuery = (this.byId("catalogSearch").getValue() || "").toLowerCase();
            var sCategory = this.byId("categoryFilter").getSelectedKey();
            var aFilters = [];

            if (sCategory && sCategory !== "CAT-ALL") {
                aFilters.push(new Filter("category", FilterOperator.EQ, sCategory));
            }

            if (sQuery) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("name", FilterOperator.Contains, sQuery),
                        new Filter("sku", FilterOperator.Contains, sQuery),
                        new Filter("description", FilterOperator.Contains, sQuery)
                    ],
                    and: false
                }));
            }

            var oTable = this.byId("productsTable");
            if (oTable) {
                var oBinding = oTable.getBinding("items");
                if (oBinding) {
                    oBinding.filter(aFilters);
                }
            }
        },

        onAddProductFromTable: function (oEvent) {
            var oBtn = oEvent.getSource();
            var oContext = oBtn.getBindingContext();
            if (!oContext) { return; }
            var oProduct = oContext.getObject();

            var oItem = oBtn.getParent();
            var aCells = oItem.getCells ? oItem.getCells() : [];
            var oStepInput = aCells.find(function (c) { return c && typeof c.getValue === "function"; });
            var iQty = oStepInput ? oStepInput.getValue() : (oProduct.minOrder || 1);

            this._addToCart(oProduct, iQty);
        },

        onAddProductCardToCart: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            if (!oContext) { return; }
            var oProduct = oContext.getObject();

            var oParent = oEvent.getSource().getParent();
            var aItems = oParent.getItems();
            var oStepInput = aItems[0];
            var iQty = (oStepInput && typeof oStepInput.getValue === "function") ? oStepInput.getValue() : (oProduct.minOrder || 1);

            this._addToCart(oProduct, iQty);
        },

        _addToCart: function (product, iQty) {
            var oSessionModel = this.getModel("session");
            var aCart = oSessionModel.getProperty("/cart") || [];
            
            var oExisting = aCart.find(function (item) { return item.id === product.id; });
            if (oExisting) {
                oExisting.qty += iQty;
                oExisting.total = oExisting.qty * oExisting.unitPrice;
            } else {
                aCart.push({
                    id: product.id,
                    sku: product.sku,
                    name: product.name,
                    qty: iQty,
                    unitPrice: product.unitPrice,
                    currency: product.currency,
                    total: iQty * product.unitPrice
                });
            }

            var iTotalItems = aCart.reduce(function (sum, item) { return sum + item.qty; }, 0);
            oSessionModel.setProperty("/cart", aCart);
            oSessionModel.setProperty("/cartCount", iTotalItems);

            MessageToast.show("Agregado " + iQty + "x " + product.sku + " al carrito de cotización");
        },

        onOpenCartDialog: function () {
            var oSessionModel = this.getModel("session");
            var aCart = oSessionModel.getProperty("/cart") || [];

            if (aCart.length === 0) {
                MessageBox.information("Tu carrito de cotización está vacío. Selecciona productos del catálogo para solicitar cotización oficial.");
                return;
            }

            var fTotal = aCart.reduce(function (sum, it) { return sum + it.total; }, 0);

            var oCartTable = new Table({
                items: aCart.map(function (item, idx) {
                    return new ColumnListItem({
                        cells: [
                            new Text({ text: item.sku, class: "sapUiBoldText" }),
                            new Text({ text: item.name }),
                            new Text({ text: item.qty + " un." }),
                            new Text({ text: this.formatCurrency(item.unitPrice, item.currency) }),
                            new Text({ text: this.formatCurrency(item.total, item.currency), class: "sapUiBoldText" }),
                            new Button({
                                icon: "sap-icon://delete",
                                type: "Reject",
                                press: function () {
                                    aCart.splice(idx, 1);
                                    var iTotalItems = aCart.reduce(function (sum, i) { return sum + i.qty; }, 0);
                                    oSessionModel.setProperty("/cart", aCart);
                                    oSessionModel.setProperty("/cartCount", iTotalItems);
                                    oCartDialog.close();
                                    this.onOpenCartDialog();
                                }.bind(this)
                            })
                        ]
                    });
                }.bind(this)),
                columns: [
                    new Column({ header: new Text({ text: "SKU", design: "Bold" }) }),
                    new Column({ header: new Text({ text: "Descripción" }) }),
                    new Column({ header: new Text({ text: "Cantidad" }), hAlign: "Center" }),
                    new Column({ header: new Text({ text: "Precio Unit." }), hAlign: "End" }),
                    new Column({ header: new Text({ text: "Subtotal" }), hAlign: "End" }),
                    new Column({ header: new Text({ text: "Acción" }), hAlign: "Center", width: "60px" })
                ]
            });

            var oCartDialog = new Dialog({
                title: "Solicitud de Cotización Oficial",
                contentWidth: "750px",
                content: [
                    new VBox({
                        class: "sapUiSmallMargin",
                        items: [
                            new Text({
                                text: "Esta acción detonará la creación automática de un Sales Lead y Quote en el Sistema de Ventas asignado a tu ejecutivo de cuenta.",
                                class: "sapUiSmallMarginBottom sapUiLightText"
                            }),
                            oCartTable,
                            new HBox({
                                justifyContent: "End",
                                alignItems: "Center",
                                class: "sapUiMediumMarginTop",
                                items: [
                                    new Text({ text: "Total Estimado de Cotización: ", class: "sapUiBoldText sapUiSmallMarginEnd" }),
                                    new Title({ text: this.formatCurrency(fTotal, "USD"), level: "H2", class: "sapUiPositiveElement" })
                                ]
                            })
                        ]
                    })
                ],
                beginButton: new Button({
                    text: "Crear Cotización",
                    type: "Emphasized",
                    icon: "sap-icon://lead",
                    press: function () {
                        oCartDialog.close();
                        this._executeQuoteCreation(aCart, fTotal);
                    }.bind(this)
                }),
                endButton: new Button({
                    text: "Continuar Seleccionando",
                    press: function () {
                        oCartDialog.close();
                    }
                })
            });

            oCartDialog.open();
        },

        _executeQuoteCreation: function (aCartItems, fTotal) {
            var oModel = this.getModel();
            var oSession = this.getModel("session").getProperty("/currentUser");
            var iQuoteNum = Math.floor(100 + Math.random() * 900);
            var sQuoteId = "COT-2026-00" + iQuoteNum;
            var sOppId = "OPP-" + (99000 + iQuoteNum);

            var oNewQuote = {
                quoteId: sQuoteId,
                c4cOpportunityId: sOppId,
                date: new Date().toISOString().substring(0, 10),
                validUntil: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().substring(0, 10),
                status: "En Revisión por Ejecutivo Comercial",
                statusState: "Information",
                totalAmount: fTotal,
                currency: "USD",
                requestedBy: oSession.name,
                itemsCount: aCartItems.length,
                items: aCartItems
            };

            var aQuotes = oModel.getProperty("/quotes") || [];
            aQuotes.unshift(oNewQuote);
            oModel.setProperty("/quotes", aQuotes);

            // Clear session cart
            this.getModel("session").setProperty("/cart", []);
            this.getModel("session").setProperty("/cartCount", 0);

            // Record CRM interaction
            this.recordActivity(
                "Creación de Cotización " + sQuoteId + " (" + sOppId + ") por " + this.formatCurrency(fTotal, "USD"),
                "Ventas & Oportunidad",
                "OpportunityCollection"
            );

            MessageBox.success(
                "¡Cotización oficial generada con éxito!\n\n" +
                "Nº Cotización: " + sQuoteId + "\n" +
                "Nº Oportunidad: " + sOppId + "\n" +
                "Monto Total: " + this.formatCurrency(fTotal, "USD") + "\n" +
                "Ejecutivo asignado: Valentina Morales\n" +
                "Tu ejecutivo ha recibido la notificación y se contactará para validar condiciones de descuento por volumen.",
                {
                    title: "Cotización de Venta Creada"
                }
            );
        },

        onOpenQuotesHistoryDialog: function () {
            var aQuotes = this.getModel().getProperty("/quotes") || [];

            var oTable = new Table({
                items: aQuotes.map(function (q) {
                    return new ColumnListItem({
                        cells: [
                            new Text({ text: q.quoteId, class: "sapUiBoldText" }),
                            new Text({ text: q.c4cOpportunityId }),
                            new Text({ text: q.date }),
                            new Text({ text: q.validUntil }),
                            new ObjectStatus({ text: q.status, state: q.statusState }),
                            new Text({ text: this.formatCurrency(q.totalAmount, q.currency), class: "sapUiBoldText" })
                        ]
                    });
                }.bind(this)),
                columns: [
                    new Column({ header: new Text({ text: "Nº Cotización", design: "Bold" }) }),
                    new Column({ header: new Text({ text: "ID Oportunidad" }) }),
                    new Column({ header: new Text({ text: "Fecha Emisión" }) }),
                    new Column({ header: new Text({ text: "Válida Hasta" }) }),
                    new Column({ header: new Text({ text: "Estado" }) }),
                    new Column({ header: new Text({ text: "Monto Total" }), hAlign: "End" })
                ]
            });

            var oDialog = new Dialog({
                title: "Historial de Cotizaciones Oficiales",
                contentWidth: "800px",
                content: [oTable],
                endButton: new Button({
                    text: "Cerrar",
                    press: function () { oDialog.close(); }
                })
            });

            oDialog.open();
        },

        /* =========================================================== */
        /* B2B COMMERCE & QUICK REORDER PACKS                          */
        /* =========================================================== */

        onReorderPack1: function () {
            var aPackItems = [
                { id: "PRD-1009", sku: "ROD-ESF-SKF22320", name: "Rodamiento SKF 22320", qty: 8, unitPrice: 380.00, currency: "USD", total: 3040.00 },
                { id: "PRD-1017", sku: "KIT-SELL-HYD90", name: "Kit Sellos Vitón", qty: 5, unitPrice: 195.00, currency: "USD", total: 975.00 },
                { id: "PRD-1015", sku: "SRV-ALIN-LASER", name: "Alineación Láser", qty: 2, unitPrice: 1200.00, currency: "USD", total: 2400.00 }
            ];

            var oSessionModel = this.getModel("session");
            var aCart = oSessionModel.getProperty("/cart") || [];
            aCart = aCart.concat(aPackItems);

            var iTotalItems = aCart.reduce(function (sum, item) { return sum + item.qty; }, 0);
            oSessionModel.setProperty("/cart", aCart);
            oSessionModel.setProperty("/cartCount", iTotalItems);

            this.recordActivity("Reorden rápido B2B: Pack Mantenimiento Planta Chancado ($6,415 USD)", "B2B Commerce", "QuickOrder");
            MessageToast.show("Pack de Mantenimiento cargado al carrito de cotización (15 posiciones)");
        },

        onReorderPack2: function () {
            var aPackItems = [
                { id: "PRD-1004", sku: "VALV-MAR-DN300", name: "Válvula Mariposa DN300", qty: 6, unitPrice: 1620.00, currency: "USD", total: 9720.00 }
            ];

            var oSessionModel = this.getModel("session");
            var aCart = oSessionModel.getProperty("/cart") || [];
            aCart = aCart.concat(aPackItems);

            var iTotalItems = aCart.reduce(function (sum, item) { return sum + item.qty; }, 0);
            oSessionModel.setProperty("/cart", aCart);
            oSessionModel.setProperty("/cartCount", iTotalItems);

            this.recordActivity("Reorden rápido B2B: Reposición Válvulas Línea B ($9,720 USD)", "B2B Commerce", "QuickOrder");
            MessageToast.show("Pack de Válvulas cargado al carrito de cotización (6 unidades)");
        },

        onProcessMassOrder: function () {
            var sVal = this.byId("txtMassOrder").getValue();
            if (!sVal) {
                MessageBox.error("Por favor ingresa al menos una línea con SKU y cantidad.");
                return;
            }

            var aLines = sVal.split('\n');
            var aProducts = this.getModel().getProperty("/products") || [];
            var aAdded = [];

            aLines.forEach(function (line) {
                var parts = line.split(',');
                if (parts.length >= 2) {
                    var sSku = parts[0].trim().toUpperCase();
                    var iQty = parseInt(parts[1].trim(), 10) || 1;
                    var oProd = aProducts.find(function (p) { return p.sku.toUpperCase() === sSku; });
                    if (oProd) {
                        aAdded.push({
                            id: oProd.id,
                            sku: oProd.sku,
                            name: oProd.name,
                            qty: iQty,
                            unitPrice: oProd.unitPrice,
                            currency: oProd.currency,
                            total: iQty * oProd.unitPrice
                        });
                    }
                }
            });

            if (aAdded.length === 0) {
                MessageBox.error("No se encontraron SKUs válidos en el texto ingresado.");
                return;
            }

            var oSessionModel = this.getModel("session");
            var aCart = oSessionModel.getProperty("/cart") || [];
            aCart = aCart.concat(aAdded);

            var iTotalItems = aCart.reduce(function (sum, item) { return sum + item.qty; }, 0);
            oSessionModel.setProperty("/cart", aCart);
            oSessionModel.setProperty("/cartCount", iTotalItems);

            this.recordActivity("Carga Masiva B2B por matriz de SKUs (" + aAdded.length + " productos)", "B2B Commerce", "MassUploadOrder");

            MessageBox.success("¡" + aAdded.length + " productos procesados y cargados exitosamente al carrito con descuentos por volumen aplicados!");
        },

        /* =========================================================== */
        /* ORDER TRACKING (SAP S/4HANA)                                */
        /* =========================================================== */

        onSearchOrder: function (oEvent) {
            var sQuery = oEvent.getParameter("newValue");
            var oBinding = this.byId("ordersTable").getBinding("items");
            if (sQuery) {
                var oFilter = new Filter("orderNumber", FilterOperator.Contains, sQuery);
                oBinding.filter([oFilter]);
            } else {
                oBinding.filter([]);
            }
        },

        onViewOrderDetail: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            if (!oContext) {
                oContext = this.byId("ordersTable").getSelectedItem().getBindingContext();
            }
            var oOrder = oContext.getObject();

            this.recordActivity("Consulta de Seguimiento de Pedido S/4: #" + oOrder.orderNumber, "Ventas & Logística", "SalesOrderRead");

            var aSteps = [
                { label: "1. Creado en S/4HANA", icon: "sap-icon://create", active: oOrder.statusStepIndex >= 0 },
                { label: "2. En Preparación / CD", icon: "sap-icon://inventory", active: oOrder.statusStepIndex >= 1 },
                { label: "3. Despachado con Guía", icon: "sap-icon://shipping-status", active: oOrder.statusStepIndex >= 2 },
                { label: "4. Entregado Conforme", icon: "sap-icon://accept", active: oOrder.statusStepIndex >= 3 }
            ];

            var sStepperHtml = '<div class="processStepContainer">';
            aSteps.forEach(function (st) {
                var sCls = st.active ? "stepCompleted" : "";
                if (st.active && oOrder.statusStepIndex === aSteps.indexOf(st)) { sCls = "stepActive"; }
                sStepperHtml += '<div class="processStep ' + sCls + '">';
                sStepperHtml += '<div class="stepIconCircle"><span class="sapUiIcon ' + (st.active ? 'sapUiPositiveElement' : '') + '">' + (st.active ? '✓' : '○') + '</span></div>';
                sStepperHtml += '<div style="font-size: 12px; font-weight: bold;">' + st.label + '</div>';
                sStepperHtml += '</div>';
            });
            sStepperHtml += '</div>';

            var oDetailDialog = new Dialog({
                title: "Seguimiento Detallado de Pedido #" + oOrder.orderNumber + " (SAP S/4HANA)",
                contentWidth: "750px",
                content: [
                    new VBox({
                        class: "sapUiSmallMargin",
                        items: [
                            new ObjectHeader({
                                title: "Pedido de Venta: " + oOrder.orderNumber,
                                number: this.formatCurrency(oOrder.totalGross, oOrder.currency),
                                numberUnit: "Total Facturable",
                                intro: "Transportista: " + oOrder.carrier + " | Guía: " + oOrder.trackingCode,
                                statuses: [
                                    new ObjectStatus({
                                        text: oOrder.statusText,
                                        state: this.formatOrderStatusState(oOrder.status),
                                        icon: this.formatOrderStatusIcon(oOrder.status)
                                    })
                                ],
                                attributes: [
                                    new ObjectAttribute({ title: "Fecha de Creación S/4", text: oOrder.orderDate }),
                                    new ObjectAttribute({ title: "Fecha de Entrega Estimada", text: oOrder.deliveryDate }),
                                    new ObjectAttribute({ title: "Dirección de Despacho", text: oOrder.deliveryAddress })
                                ]
                            }),
                            new HTML({ content: sStepperHtml }),
                            new Title({ text: "Posiciones del Pedido", level: "H4", class: "sapUiSmallMarginTopBottom" }),
                            new Table({
                                items: oOrder.items.map(function (pos) {
                                    return new ColumnListItem({
                                        cells: [
                                            new Text({ text: pos.pos }),
                                            new Text({ text: pos.sku, class: "sapUiBoldText" }),
                                            new Text({ text: pos.description }),
                                            new Text({ text: pos.qty + " " + pos.unit, class: "sapUiBoldText" }),
                                            new Text({ text: this.formatCurrency(pos.unitPrice, oOrder.currency) }),
                                            new Text({ text: this.formatCurrency(pos.total, oOrder.currency), class: "sapUiBoldText" }),
                                            new ObjectStatus({ text: pos.itemStatus, state: "Success" })
                                        ]
                                    });
                                }.bind(this)),
                                columns: [
                                    new Column({ header: new Text({ text: "Pos" }), width: "40px" }),
                                    new Column({ header: new Text({ text: "SKU", design: "Bold" }) }),
                                    new Column({ header: new Text({ text: "Descripción" }) }),
                                    new Column({ header: new Text({ text: "Cantidad" }), hAlign: "Center" }),
                                    new Column({ header: new Text({ text: "Precio Unit." }), hAlign: "End" }),
                                    new Column({ header: new Text({ text: "Subtotal" }), hAlign: "End" }),
                                    new Column({ header: new Text({ text: "Estado" }) })
                                ]
                            })
                        ]
                    })
                ],
                beginButton: new Button({
                    text: "Rastrear en Starken / Transportista",
                    icon: "sap-icon://map",
                    type: "Emphasized",
                    press: function () {
                        MessageToast.show("Abriendo portal de geolocalización de guía " + oOrder.trackingCode);
                    }
                }),
                endButton: new Button({
                    text: "Cerrar",
                    press: function () { oDetailDialog.close(); }
                })
            });

            oDetailDialog.open();
        },

        /* =========================================================== */
        /* INVOICE & DIGITAL PDF VIEWER                                */
        /* =========================================================== */

        onPreviewInvoicePdf: function (oEvent) {
            var oInv = oEvent.getSource().getBindingContext().getObject();
            var oCustomer = this.getModel().getProperty("/customer");

            this.recordActivity("Descarga / Previsualización de Factura Digital " + oInv.invoiceNumber, "Ventas & Facturación", "CustomerInteractionLog");

            var sItemsHtml = "";
            oInv.items.forEach(function (it) {
                sItemsHtml += '<tr>';
                sItemsHtml += '<td>' + it.description + '</td>';
                sItemsHtml += '<td style="text-align: right; font-weight: bold;">$' + it.amount.toLocaleString("es-CL", { minimumFractionDigits: 2 }) + ' USD</td>';
                sItemsHtml += '</tr>';
            });

            var sPdfHtml = 
                '<div class="invoicePdfSheet">' +
                    '<div class="invoicePdfHeader">' +
                        '<div style="display: flex; justify-content: space-between; align-items: center;">' +
                            '<div>' +
                                '<h2 style="color: #0854a0; margin: 0;">SAP S/4HANA Cloud ERP</h2>' +
                                '<p style="margin: 2px 0; font-size: 12px; color: #666;">Facturación Electrónica B2B Oficial - DTE Folio: ' + oInv.xmlDteFolio + '</p>' +
                            '</div>' +
                            '<div style="text-align: right; border: 2px solid #0854a0; padding: 10px 18px; border-radius: 4px;">' +
                                '<div style="font-weight: bold; color: #0854a0;">FACTURA ELECTRÓNICA</div>' +
                                '<div style="font-size: 16px; font-weight: bold; margin-top: 4px;">' + oInv.invoiceNumber + '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div style="display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 13px;">' +
                        '<div>' +
                            '<strong>Señores:</strong> ' + oCustomer.name + '<br>' +
                            '<strong>RUT / Tax ID:</strong> ' + oCustomer.taxId + '<br>' +
                            '<strong>Dirección:</strong> ' + oCustomer.addresses[0].street + ', ' + oCustomer.addresses[0].city + '<br>' +
                            '<strong>Nº Business Partner:</strong> ' + oCustomer.bpNumber +
                        '</div>' +
                        '<div style="text-align: right;">' +
                            '<strong>Fecha Emisión:</strong> ' + oInv.issueDate + '<br>' +
                            '<strong>Fecha Vencimiento:</strong> ' + oInv.dueDate + '<br>' +
                            '<strong>Orden de Venta S/4:</strong> #' + oInv.salesOrderRef + '<br>' +
                            '<strong>Condición:</strong> ' + oInv.paymentTerms +
                        '</div>' +
                    '</div>' +
                    '<table class="invoicePdfTable">' +
                        '<thead>' +
                            '<tr>' +
                                '<th>Descripción del Bien o Servicio</th>' +
                                '<th style="text-align: right;">Total Neto</th>' +
                            '</tr>' +
                        '</thead>' +
                        '<tbody>' +
                            sItemsHtml +
                        '</tbody>' +
                    '</table>' +
                    '<div style="display: flex; justify-content: flex-end; margin-top: 15px;">' +
                        '<div style="width: 280px; font-size: 13px;">' +
                            '<div style="display: flex; justify-content: space-between; padding: 4px 0;"><span>Subtotal Neto:</span> <strong>$' + oInv.netAmount.toLocaleString("es-CL", { minimumFractionDigits: 2 }) + ' USD</strong></div>' +
                            '<div style="display: flex; justify-content: space-between; padding: 4px 0;"><span>IVA (19%):</span> <strong>$' + oInv.taxAmount.toLocaleString("es-CL", { minimumFractionDigits: 2 }) + ' USD</strong></div>' +
                            '<div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 16px; border-top: 2px solid #0854a0; color: #0854a0;">' +
                                '<strong>TOTAL BRUTO:</strong> <strong>$' + oInv.grossTotal.toLocaleString("es-CL", { minimumFractionDigits: 2 }) + ' USD</strong>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div style="margin-top: 30px; padding: 10px; background: #f0f7fc; border-left: 4px solid #0854a0; font-size: 11px; color: #333;">' +
                        'Documento tributario electrónico generado mediante SAP S/4HANA Cloud y firmado digitalmente según la normativa vigente.' +
                    '</div>' +
                '</div>';

            var oPdfDialog = new Dialog({
                title: "Visor de Factura Digital Legal (PDF)",
                contentWidth: "850px",
                content: [
                    new HTML({ content: sPdfHtml })
                ],
                beginButton: new Button({
                    text: "Descargar PDF Firmado",
                    icon: "sap-icon://pdf-attachment",
                    type: "Emphasized",
                    press: function () {
                        MessageToast.show("Descargando " + oInv.invoiceNumber + ".pdf con firma digital...");
                    }
                }),
                endButton: new Button({
                    text: "Cerrar",
                    press: function () { oPdfDialog.close(); }
                })
            });

            oPdfDialog.open();
        },

        onExportInvoices: function () {
            MessageToast.show("Generando archivo Excel con el estado de cuenta consolidado...");
        }
    });
});
