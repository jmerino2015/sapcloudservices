sap.ui.define([
    "wm/light/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/Popover",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text",
    "sap/m/VBox",
    "sap/m/HBox",
    "sap/m/ScrollContainer",
    "sap/m/List",
    "sap/m/CustomListItem",
    "wm/light/service/ApiService"
], function (BaseController, JSONModel, MessageToast, Popover, Dialog, Button, Text, VBox, HBox, ScrollContainer, List, CustomListItem, ApiService) {
    "use strict";

    return BaseController.extend("wm.light.controller.Layout2D", {

        onInit: function () {
            this.loadLayoutData();
            this._popover = null;
        },

        loadLayoutData: function () {
            var sWarehouseId = "WH001";
            sap.ui.core.BusyIndicator.show(0);
            
            var defaultLayout = this._generateDefaultLayout();

            ApiService.get("/warehouses/" + sWarehouseId + "/layout")
                .then(function (oData) {
                    sap.ui.core.BusyIndicator.hide();
                    if (oData && oData.data && oData.data.length > 0) {
                        this.renderMap(oData.data);
                        this._layoutData = oData.data;
                    } else {
                        this.renderMap(defaultLayout);
                        this._layoutData = defaultLayout;
                    }
                }.bind(this))
                .catch(function (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    this.renderMap(defaultLayout);
                    this._layoutData = defaultLayout;
                }.bind(this));
        },

        _generateDefaultLayout: function () {
            var cols = [];
            var statuses = ['FULL', 'PARTIAL', 'FULL', 'EMPTY', 'PARTIAL', 'FULL', 'PARTIAL', 'EMPTY', 'FULL', 'BLOCKED'];
            var materials = [
                { sku: "4500001", desc: "Cable UTP Cat6 305m Belden", qty: 25, uom: "BOB" },
                { sku: "4500002", desc: "Switch 24p PoE Cisco Catalyst", qty: 8, uom: "EA" },
                { sku: "4500003", desc: "Rack 42U 800mm Panduit High-Bay", qty: 3, uom: "EA" },
                { sku: "4500004", desc: "Patch Panel 24p Cat6 Nexxt", qty: 40, uom: "EA" },
                { sku: "4500005", desc: "UPS 1500VA APC Line-Interactive", qty: 5, uom: "EA" }
            ];
            var colIndex = 0;
            for (var x = 0; x < 8; x++) {
                for (var y = 1; y <= 10; y++) {
                    var rowChar = String.fromCharCode(65 + x);
                    var colId = rowChar + "-0" + Math.ceil(y/2) + "-" + (y < 10 ? "0" + y : y);
                    var st = statuses[colIndex % statuses.length];
                    var mat = materials[colIndex % materials.length];
                    colIndex++;
                    var occPct = st === 'FULL' ? 100 : st === 'PARTIAL' ? (35 + (colIndex * 7) % 55) : 0;
                    cols.push({
                        id: colId,
                        x: x,
                        y: y,
                        row: rowChar,
                        status: st,
                        occupancy_pct: occPct,
                        occupied_bins: st === 'FULL' ? 4 : st === 'PARTIAL' ? 2 : 0,
                        total_bins: 4,
                        levels: [
                            { level: 1, bin_code: colId + "-01", status: st, has_stock: st !== 'EMPTY', stock: [{ sku: mat.sku, description: mat.desc, quantity: mat.qty, uom: mat.uom }] },
                            { level: 2, bin_code: colId + "-02", status: st, has_stock: st !== 'EMPTY', stock: [{ sku: mat.sku, description: mat.desc, quantity: Math.ceil(mat.qty/2), uom: mat.uom }] },
                            { level: 3, bin_code: colId + "-03", status: st, has_stock: st === 'FULL', stock: [{ sku: mat.sku, description: mat.desc, quantity: mat.qty, uom: mat.uom }] },
                            { level: 4, bin_code: colId + "-04", status: st, has_stock: st === 'FULL', stock: [{ sku: mat.sku, description: mat.desc, quantity: mat.qty, uom: mat.uom }] }
                        ]
                    });
                }
            }
            return cols;
        },

        renderMap: function (aColumns) {
            if (!aColumns || aColumns.length === 0) return;

            var kpi = { total: 0, empty: 0, partial: 0, full: 0, blocked: 0 };
            var maxX = 0;
            var maxY = 0;

            aColumns.forEach(function(col) {
                if (col.x > maxX) maxX = col.x;
                if (col.y > maxY) maxY = col.y;
                kpi.total++;
                if (col.status === 'EMPTY') kpi.empty++;
                else if (col.status === 'PARTIAL') kpi.partial++;
                else if (col.status === 'FULL') kpi.full++;
                else if (col.status === 'BLOCKED') kpi.blocked++;
            });

            this.byId("kpiTotal").setText(kpi.total);
            this.byId("kpiEmpty").setText(kpi.empty);
            this.byId("kpiPartial").setText(kpi.partial);
            this.byId("kpiFull").setText(kpi.full);
            this.byId("kpiBlocked").setText(kpi.blocked);

            var sStyles = "<style>" +
                ".warehouse-map-container { width: 100%; min-width: 1200px; padding: 20px; box-sizing: border-box; font-family: '72', Arial, Helvetica, sans-serif; }" +
                ".warehouse-border { border: 4px solid #7f8c8d; border-radius: 8px; padding: 15px; position: relative; background: #eef2f5; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }" +
                ".transit-space { text-align: center; font-weight: bold; color: #7f8c8d; letter-spacing: 4px; padding: 10px; font-size: 14px; text-transform: uppercase; }" +
                ".zones-top { display: flex; justify-content: space-between; margin-bottom: 30px; gap: 20px; }" +
                ".zone-box { flex: 1; background: #ffffff; border: 2px dashed #bdc3c7; border-radius: 8px; padding: 20px; text-align: center; font-weight: bold; color: #2c3e50; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; }" +
                ".zone-icon { font-size: 32px; }" +
                ".zones-middle { display: flex; gap: 30px; }" +
                ".racks-area { flex: 3; display: flex; flex-direction: column; gap: 40px; position: relative; }" +
                ".cross-docking-area { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 3px solid #34495e; border-radius: 20px; background: repeating-linear-gradient(45deg, #ecf0f1, #ecf0f1 10px, #bdc3c7 10px, #bdc3c7 20px); font-size: 20px; font-weight: bold; color: #2c3e50; padding: 40px; text-align: center; min-height: 300px; }" +
                ".aisle-label { position: absolute; left: -40px; color: #7f8c8d; font-weight: bold; transform: rotate(-90deg); letter-spacing: 2px; font-size: 12px; }" +
                ".layout-grid { display: grid; gap: 8px; justify-content: start; }" +
                ".rack-column { width: 45px; height: 45px; border-radius: 4px; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; color: #fff; text-shadow: 0px 1px 2px rgba(0,0,0,0.5); box-shadow: 0 2px 4px rgba(0,0,0,0.2); }" +
                ".rack-column:hover { transform: scale(1.15); box-shadow: 0 6px 12px rgba(0,0,0,0.3); z-index: 2; border: 2px solid white; }" +
                ".rack-EMPTY { background: linear-gradient(135deg, #2ecc71, #27ae60); }" +
                ".rack-PARTIAL { background: linear-gradient(135deg, #f1c40f, #f39c12); }" +
                ".rack-FULL { background: linear-gradient(135deg, #e74c3c, #c0392b); }" +
                ".rack-BLOCKED { background: linear-gradient(135deg, #95a5a6, #7f8c8d); }" +
                ".rack-class-a { border-bottom: 4px solid #2ecc71; }" +
                ".rack-class-b { border-bottom: 4px solid #3498db; }" +
                ".rack-class-c { border-bottom: 4px solid #e74c3c; }" +
                ".col-id-text { margin-bottom: 1px; font-size: 9px; }" +
                ".col-pct-text { font-size: 10px; }" +
                ".legend-box { width: 16px; height: 16px; border-radius: 4px; display: inline-block; }" +
                ".legend-empty { background-color: #2ecc71; border: 1px solid #27ae60; }" +
                ".legend-partial { background-color: #f1c40f; border: 1px solid #f39c12; }" +
                ".legend-full { background-color: #e74c3c; border: 1px solid #c0392b; }" +
                ".legend-blocked { background-color: #95a5a6; border: 1px solid #7f8c8d; }" +
                ".kpi-card { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 15px 25px; flex-grow: 1; min-width: 150px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }" +
                ".kpi-card-empty { border-bottom: 4px solid #2ecc71; }" +
                ".kpi-card-partial { border-bottom: 4px solid #f1c40f; }" +
                ".kpi-card-full { border-bottom: 4px solid #e74c3c; }" +
                ".kpi-card-blocked { border-bottom: 4px solid #95a5a6; }" +
                ".kpi-label { font-size: 14px; color: #666; margin-bottom: 5px; }" +
                ".kpi-value { font-size: 28px; font-weight: bold; color: #333; }" +
                "</style>";

            // Build Top Zones
            var getIcon = function(sName) {
                var oIconInfo = sap.ui.core.IconPool.getIconInfo("sap-icon://" + sName);
                return oIconInfo ? "<span style=\"font-family: 'SAP-icons'; font-size: 32px;\">" + oIconInfo.content + "</span>" : "";
            };

            var sHtml = "<div class='warehouse-map-container'><div class='warehouse-border'>";
            sHtml += "<div class='transit-space'>ESPACIO DE TRÁNSITO SEGURO</div>";
            
            // Live Management Icons in transit space (using cart and cart-approval)
            sHtml += "<div class='live-forklift' style='top: 20px; left: 150px; animation-delay: 0s;'>" + getIcon("cart") + "</div>";
            sHtml += "<div class='live-worker' style='top: 15px; left: 400px; animation-delay: -5s;'>" + getIcon("cart-approval") + "</div>";
            sHtml += "<div class='live-forklift' style='bottom: 20px; right: 250px; animation-delay: -10s;'>" + getIcon("cart") + "</div>";

            sHtml += "<div class='zones-middle'>";
            
            // Build Racks Grid
            sHtml += "<div class='racks-area'>";
            
            var gridRows = "";
            var aisleCount = 0;
            var aisleLabelsHtml = "";
            for (var i = 0; i <= maxX; i++) {
                gridRows += "60px ";
                if ((i + 1) % 2 === 0 && i !== maxX) {
                    gridRows += "40px "; // 40px horizontal aisle
                    aisleCount++;
                    var aisleLetter = String.fromCharCode(64 + aisleCount); // A, B, C...
                    var currentAisleRow = (i + 1) + aisleCount; 
                    aisleLabelsHtml += "<div style='grid-column: 1 / -1; grid-row: " + currentAisleRow + "; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: bold; color: #7f8c8d; letter-spacing: 5px; background: #eef2f5; border-radius: 4px; border-top: 2px dashed #bdc3c7; border-bottom: 2px dashed #bdc3c7; margin: 2px 0; position: relative;'>PASILLO " + aisleLetter + "";
                    // Insert cart icons moving in aisles
                    if (aisleCount % 2 !== 0) {
                        aisleLabelsHtml += "<div class='live-worker' style='left: 10%; bottom: 8px; font-size: 20px; animation-duration: " + (12 + aisleCount) + "s;'>" + getIcon("cart-approval") + "</div>";
                    } else {
                        aisleLabelsHtml += "<div class='live-forklift' style='left: 20%; bottom: 6px; font-size: 24px; animation-name: moveHorizontal; animation-duration: " + (18 + aisleCount) + "s;'>" + getIcon("cart") + "</div>";
                    }
                    aisleLabelsHtml += "</div>";
                }
            }

            sHtml += "<div class='layout-grid' style='grid-template-columns: repeat(" + (maxY + 1) + ", 60px); grid-template-rows: " + gridRows + ";'>";
            
            aColumns.forEach(function(col) {
                var actualGridCol = col.y; 
                var baseRow = col.x + 1; 
                var aislesBefore = Math.floor(col.x / 2);
                var actualGridRow = baseRow + aislesBefore;
                
                var rackClass = "rack-class-c";
                if (col.row >= 'A' && col.row <= 'C') rackClass = "rack-class-a";
                else if (col.row >= 'D' && col.row <= 'F') rackClass = "rack-class-b";

                sHtml += "<div class='rack-column rack-" + col.status + " " + rackClass + "' " +
                         "style='grid-column: " + actualGridCol + "; grid-row: " + actualGridRow + ";' " +
                         "data-colid='" + col.id + "' " +
                         "onmouseover='window._handleMapHover(event, this)' " +
                         "onmouseout='window._handleMapOut(event, this)' " +
                         "onclick='window._handleMapClick(event, this)'>" +
                         "<span class='col-id-text'>" + col.id + "</span>" +
                         "<span class='col-pct-text'>" + col.occupancy_pct + "%</span>" +
                         "</div>";
            });
            
            sHtml += aisleLabelsHtml; // Append aisle labels
            sHtml += "</div>"; // end layout-grid
            sHtml += "</div>"; // end racks-area

            // Center Areas (Picking & Packing)
            sHtml += "<div class='center-areas'>";
            
            // Picking Area
            sHtml += "<div class='picking-area'>";
            sHtml += "<div class='packing-icon' style='color: #f39c12;'>" + getIcon("hand-with-box") + "</div>";
            sHtml += "<div class='packing-text'>ZONA DE PICKING</div>";
            sHtml += "<div style='margin-top: 15px; color: #d35400; font-size: 14px;'>Selección y Recolección</div>";
            sHtml += "</div>"; // end picking-area
            
            // Packing Area
            sHtml += "<div class='packing-area'>";
            sHtml += "<div class='packing-icon'>" + getIcon("product") + "</div>";
            sHtml += "<div class='packing-text'>ZONA DE PACKING</div>";
            sHtml += "<div style='margin-top: 30px; background: white; border: 2px dashed #2980b9; color: #2980b9; padding: 20px; border-radius: 8px; font-size: 16px; font-weight: bold; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.05); width: 80%;'><div style='font-size: 40px; margin-bottom: 10px;'>" + getIcon("qr-code") + "</div>Estación de Preparación<br><small style='font-weight: normal; margin-top: 5px;'>(Etiquetado / Transporte)</small></div>";
            sHtml += "</div>"; // end packing-area
            
            sHtml += "</div>"; // end center-areas

            // Docks Area (Right)
            sHtml += "<div class='docks-area'>";
            for (var d = 1; d <= 5; d++) {
                sHtml += "<div style='background: white; border: 2px solid #2980b9; color: #2980b9; padding: 18px; border-radius: 8px; font-size: 16px; font-weight: bold; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.05); transition: all 0.2s; cursor: pointer;' onmouseover='this.style.background=\"#2980b9\"; this.style.color=\"white\";' onmouseout='this.style.background=\"white\"; this.style.color=\"#2980b9\";'><span style='font-size: 24px; margin-right: 10px;'>" + getIcon("shipping-status") + "</span> Muelle de Atención " + d + "</div>";
            }
            sHtml += "</div>"; // end docks-area
            
            sHtml += "</div>"; // end zones-middle
            sHtml += "<div class='transit-space' style='margin-top: 20px;'>ESPACIO DE TRÁNSITO SEGURO</div>";
            sHtml += "</div></div>";

            var oHtmlControl = this.byId("layoutMapHtml");
            oHtmlControl.setContent(sHtml);

            // Bind global handlers for pure HTML elements to UI5 controller
            var that = this;
            window._handleMapHover = function(e, elem) { that.onColumnHover(e, elem); };
            window._handleMapOut = function(e, elem) { that.onColumnOut(e, elem); };
            window._handleMapClick = function(e, elem) { that.onColumnClick(e, elem); };
        },

        onColumnHover: function (oEvent, oElement) {
            var sColId = oElement.getAttribute("data-colid");
            var colData = this._layoutData.find(c => c.id === sColId);
            if (!colData) return;

            if (!this._popover) {
                this._popover = new Popover({
                    showHeader: false,
                    placement: "Right",
                    contentWidth: "250px"
                });
                this._popover.addStyleClass("sapUiContentPadding");
                this.getView().addDependent(this._popover);
            }

            var sContent = "<b>" + colData.id + "</b><br/>";
            sContent += "Estado: <b>" + colData.status + "</b><br/>";
            sContent += "Ocupación: <b>" + colData.occupancy_pct + "%</b> (" + colData.occupied_bins + "/" + colData.total_bins + " niveles)<br/><hr style='margin:5px 0; border:0; border-top:1px solid #ccc;'/>";
            
            var stockSummary = [];
            colData.levels.forEach(function(l) {
                l.stock.forEach(function(st) {
                    if (st.sku) {
                        stockSummary.push(st.quantity + " " + st.uom + " " + st.sku);
                    }
                });
            });

            if (stockSummary.length === 0) {
                sContent += "<i>Sin material asignado</i>";
            } else {
                var unique = [...new Set(stockSummary)];
                sContent += "<div style='font-size:12px; line-height:1.2;'>" + unique.slice(0, 3).join("<br/>") + (unique.length > 3 ? "<br/><i>+" + (unique.length - 3) + " más...</i>" : "") + "</div>";
            }

            this._popover.removeAllContent();
            this._popover.addContent(new sap.ui.core.HTML({ content: "<div style='font-family: Arial, sans-serif;'>" + sContent + "</div>" }));
            
            this._popover.openBy(oElement);
        },

        onColumnOut: function (oEvent, oElement) {
            if (this._popover && this._popover.isOpen()) {
                setTimeout(() => { this._popover.close(); }, 100);
            }
        },

        onColumnClick: function (oEvent, oElement) {
            var sColId = oElement.getAttribute("data-colid");
            var colData = this._layoutData.find(c => c.id === sColId);
            if (!colData) return;

            if (this._popover) this._popover.close();

            if (!this._levelsDialog) {
                this._levelsDialog = new Dialog({
                    title: "Detalle de Bahía",
                    contentWidth: "400px",
                    contentHeight: "400px",
                    endButton: new Button({
                        text: "Cerrar",
                        press: function () {
                            this._levelsDialog.close();
                        }.bind(this)
                    })
                });
                this.getView().addDependent(this._levelsDialog);
            }

            this._levelsDialog.setTitle("Vista Z-Axis: " + colData.id);
            this._levelsDialog.removeAllContent();

            var aLevels = [].concat(colData.levels).reverse();
            var oVBox = new VBox({ renderType: "Bare" });
            
            aLevels.forEach(function(lvl) {
                var sColor = "#2ecc71"; 
                if (lvl.status === "BLOCKED" || lvl.inventory_block) sColor = "#95a5a6";
                else if (lvl.has_stock) sColor = "#e74c3c"; 

                var sStockText = lvl.has_stock ? lvl.stock.map(s => s.quantity + "x " + s.sku).join(", ") : "Vacío";

                var oLvlBox = new HBox({
                    alignItems: "Center",
                    height: "80px",
                    items: [
                        new VBox({
                            width: "60px",
                            height: "60px",
                            alignItems: "Center",
                            justifyContent: "Center",
                            items: [ new Text({ text: "L" + lvl.level }) ]
                        }).addStyleClass("sapUiSmallMarginEnd").addCustomData(new sap.ui.core.CustomData({ key: "bgColor", value: sColor, writeToDom: true })),
                        new VBox({
                            items: [
                                new Text({ text: lvl.bin_code }).addStyleClass("sapUiTinyMarginBottom sapMTitleStyleH4"),
                                new Text({ text: sStockText })
                            ]
                        })
                    ]
                }).addStyleClass("sapUiSmallMargin");
                
                oLvlBox.getItems()[0].addEventDelegate({
                    onAfterRendering: function(e) {
                        e.srcControl.getDomRef().style.backgroundColor = sColor;
                        e.srcControl.getDomRef().style.color = "white";
                        e.srcControl.getDomRef().style.borderRadius = "4px";
                    }
                });

                oVBox.addItem(oLvlBox);
            });

            var oScroll = new ScrollContainer({ height: "100%", vertical: true, content: [oVBox] });
            this._levelsDialog.addContent(oScroll);
            this._levelsDialog.open();
        }

    });
});

