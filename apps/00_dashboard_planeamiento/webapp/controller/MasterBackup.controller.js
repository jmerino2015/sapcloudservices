sap.ui.define([
    "c4c/leadmanagement/controller/Base.controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment"
], (BaseController, JSONModel, Filter, FilterOperator, MessageToast, MessageBox, Fragment) => {
    "use strict";

    return BaseController.extend("c4c.leadmanagement.controller.Master", {

        formatter: {
            formatStatusState: function (sState) {
                switch (sState) {
                    case "Abierto": return "Warning";
                    case "Iniciado": return "Success";
                    default: return "None";
                }
            }
        },

        onInit() {
            // Modelo de Vista (Estado de controles UI)
            const oViewModel = new JSONModel({
                headerExpanded: true,  // Para el botón de Filtros
                searchVisible: false,  // Para el botón de Búsqueda
                tableCount: 0,
                // Paginación
                pageIndex: 0,       // Página actual (0, 1, 2...)
                pageSize: 10,       // Registros por página (TOP)
                pageInfo: "Pág. 1",
                enableNext: true,
                enablePrev: false,
                busy: false
            });
            this.getView().setModel(oViewModel, "view");

            // Modelo de Filtros
            const oFilterModel = new JSONModel({
                leadID: "",
                nombre: "",
                nivel: "",
                estado: ""
            });
            this.getView().setModel(oFilterModel, "filterModel");

            // Generar Datos Dummy
            /* this._generateMockData(); */

            const oTableDataModel = new JSONModel({
                leads: []
            });
            this.getOwnerComponent().setModel(oTableDataModel, "leadModel");

            // Carga inicial
            this._fetchLeads();

            // --- LÓGICA DE HOVER (Event Delegate) ---
            this.getView().addEventDelegate({
                onAfterRendering: function () {
                    // Vinculamos el evento mouseenter a las clases CSS específicas
                    this.getView().$().on("mouseenter", ".claseHoverNombre", this.onHoverName.bind(this));
                    this.getView().$().on("mouseenter", ".claseHoverPropietario", this.onHoverOwner.bind(this));
                }.bind(this)
            });
        },

        /**
         * Lógica principal de obtención de datos
         */
        _fetchLeads: function () {
            const oViewModel = this.getView().getModel("view");
            const oDataModel = this.getOwnerComponent().getModel("leadsModel"); // Modelo definido en manifest
            const oLocalModel = this.getOwnerComponent().getModel("leadModel");

            // Estado de carga
            oViewModel.setProperty("/busy", true);
            this.getView().setBusy(true);

            // 1. Calcular Paginación
            const iPageIndex = oViewModel.getProperty("/pageIndex");
            const iPageSize = oViewModel.getProperty("/pageSize");
            const iSkip = iPageIndex * iPageSize;

            // 2. Construir Filtros
            const aFilters = this._buildFilters();

            // 3. Agregar Filtros Técnicos requeridos (accion, SKIP, TOP)
            aFilters.push(new Filter("accion", FilterOperator.EQ, "R"));
            aFilters.push(new Filter("SKIP", FilterOperator.EQ, String(iSkip))); // Convertir a string si el backend lo requiere así
            aFilters.push(new Filter("TOP", FilterOperator.EQ, String(iPageSize)));

            // 4. Llamada OData
            this.readEntity(oDataModel, "/PeReturnSet", {
                filters: aFilters,
                urlParameters: {} // Aquí irían $expand si fuera necesario
            })
                .then((oData) => {
                    const aResults = oData.results || [];

                    // Actualizar modelo local
                    oLocalModel.setProperty("/leads", aResults);
                    oViewModel.setProperty("/tableCount", aResults.length);

                    // Actualizar estado de botones de paginación
                    this._updatePaginationState(aResults.length);
                })
                .catch((oError) => {
                    console.error(oError);
                    oLocalModel.setProperty("/leads", []);
                    MessageBox.error("Error al obtener los Leads del servidor.");
                })
                .finally(() => {
                    oViewModel.setProperty("/busy", false);
                    this.getView().setBusy(false);
                });
        },

        _buildFilters: function () {
            const oFilterData = this.getView().getModel("filterModel").getData();
            const aFilters = [];

            if (oFilterData.leadID) {
                aFilters.push(new Filter("LeadID", FilterOperator.EQ, oFilterData.leadID));
            }
            if (oFilterData.nombre) {
                aFilters.push(new Filter("Nombre", FilterOperator.Contains, oFilterData.nombre));
            }
            if (oFilterData.nivel) {
                aFilters.push(new Filter("NivelCalificacion", FilterOperator.EQ, oFilterData.nivel));
            }
            if (oFilterData.estado) {
                aFilters.push(new Filter("Estado", FilterOperator.EQ, oFilterData.estado));
            }
            if (oFilterData.origen) {
                aFilters.push(new Filter("Origen", FilterOperator.EQ, oFilterData.origen));
            }

            return aFilters;
        },

        _updatePaginationState: function (iResultCount) {
            const oViewModel = this.getView().getModel("view");
            const iPageIndex = oViewModel.getProperty("/pageIndex");
            const iPageSize = oViewModel.getProperty("/pageSize");

            oViewModel.setProperty("/pageInfo", `Pág. ${iPageIndex + 1}`);
            oViewModel.setProperty("/enablePrev", iPageIndex > 0);
            
            // Si trajo menos registros que el tamaño de página, es la última página
            // Nota: Esta es una inferencia simple. Idealmente el backend devolvería un "totalCount"
            oViewModel.setProperty("/enableNext", iResultCount === iPageSize);
        },

        /* getRouter: function() {
            return this.getOwnerComponent().getRouter();
        }, */

        _generateMockData: function () {
            const aLeads = [
                {
                    LeadID: "1001",
                    Nombre: "Adquisición Software ERP",
                    NombreContacto: "Juan",
                    ApellidoContacto: "Pérez",
                    Empresa: "Tech Solutions SAC",
                    NivelCalificacion: "Muy interesante",
                    Estado: "Abierto",
                    Origen: "Campaña Web",
                    Prioridad: "Urgente",
                    FechaInicio: new Date("2023-10-01"),
                    FechaFin: new Date("2023-12-31"),
                    Categoria: "Software",
                    Propietario: "Angel Villanueva",
                    PropietarioIniciales: "AV",
                    CargoPropietario: "Gerente de Ventas",
                    EmailPropietario: "angel.v@empresa.com",
                    Ciudad: "Lima",
                    Pais: "Perú",
                    Telefono: "123456",
                    Correo: "juan.perez@tech.com",
                    ValorPrevisto: 50000.00,
                    Moneda: "USD",
                    Nota: "Cliente interesado en módulos FI y CO."
                },
                {
                    LeadID: "1002",
                    Nombre: "Renovación Licencias",
                    NombreContacto: "Maria",
                    ApellidoContacto: "Gomez",
                    Empresa: "Consorcio Minero",
                    NivelCalificacion: "Interesante",
                    Estado: "Iniciado",
                    Origen: "Feria Comercial",
                    Prioridad: "Normal",
                    FechaInicio: new Date("2023-11-15"),
                    FechaFin: new Date("2024-01-30"),
                    Categoria: "Servicios",
                    Propietario: "Carlos Lopez",
                    PropietarioIniciales: "CL",
                    CargoPropietario: "Ejecutivo Comercial",
                    EmailPropietario: "carlos.l@empresa.com",
                    Ciudad: "Arequipa",
                    Pais: "Perú",
                    Telefono: "555111",
                    Correo: "m.gomez@minera.com",
                    ValorPrevisto: 12000.00,
                    Moneda: "PEN",
                    Nota: "Seguimiento quincenal."
                }
            ];

            const oModel = new JSONModel({
                leads: aLeads,
                count: aLeads.length
            });
            this.getOwnerComponent().setModel(oModel, "leadModel");
            this.getView().getModel("view").setProperty("/tableCount", aLeads.length);
        },

        // --- LÓGICA DE NAVEGACIÓN (CORREGIDA) ---
        onNavToDetalle: function (oEvent) {
            // 1. Obtener el contexto de la fila clickeada
            const oItem = oEvent.getSource();
            const oCtx = oItem.getBindingContext("leadModel");

            if (!oCtx) return;

            const oData = oCtx.getObject();

            // 2. Guardar el modelo seleccionado en el Componente (Global) para que el detalle lo lea
            const oSelectedModel = new JSONModel(oData);
            this.getOwnerComponent().setModel(oSelectedModel, "selectedLead");

            // 3. Navegar usando el nombre de la ruta definido en manifest.json
            this.getRouter().navTo("RouteDetalleLead", {
                leadId: oData.LeadID
            });
        },

        onNavToCrear: function () {
            this.getRouter().navTo("RouteCrearLead");
        },

        // --- LÓGICA MOSTRAR/OCULTAR (TOGGLES) ---
        onToggleHeader: function () {
            const oViewModel = this.getView().getModel("view");
            // Invierte el valor booleano actual
            oViewModel.setProperty("/headerExpanded", !oViewModel.getProperty("/headerExpanded"));
        },

        onToggleSearch: function () {
            const oViewModel = this.getView().getModel("view");
            const bCurrentState = oViewModel.getProperty("/searchVisible");

            oViewModel.setProperty("/searchVisible", !bCurrentState);

            // Opcional: Si se oculta, limpiar el valor del searchfield?
            // if (bCurrentState) { this.onQuickSearch(null); }
        },

        onSearch: function () {
            // Al buscar, reiniciamos a la página 0
            this.getView().getModel("view").setProperty("/pageIndex", 0);
            this._fetchLeads();
        },

        // --- BÚSQUEDA ---
        /* onSearch: function () {
            const oView = this.getView();
            const oFilterData = oView.getModel("filterModel").getData();
            const aFilters = [];

            if (oFilterData.leadID) {
                aFilters.push(new Filter("LeadID", FilterOperator.Contains, oFilterData.leadID));
            }
            if (oFilterData.nombre) {
                aFilters.push(new Filter("Nombre", FilterOperator.Contains, oFilterData.nombre));
            }
            if (oFilterData.nivel) {
                aFilters.push(new Filter("NivelCalificacion", FilterOperator.EQ, oFilterData.nivel));
            }
            if (oFilterData.estado) {
                aFilters.push(new Filter("Estado", FilterOperator.EQ, oFilterData.estado));
            }

            const oTable = oView.byId("TablaLeads");
            const oBinding = oTable.getBinding("rows");
            oBinding.filter(aFilters);

            // Actualizar contador
            // Nota: En OData real esto se hace diferente ($count), aquí es local
            // const iCount = oBinding.getLength(); 
            // this.getView().getModel("view").setProperty("/tableCount", iCount);
        }, */

        onQuickSearch: function (oEvent) {
            const sQuery = oEvent ? oEvent.getParameter("newValue") : "";
            const oTable = this.byId("TablaLeads");
            const oBinding = oTable.getBinding("rows");
            let aFilters = [];

            if (sQuery && sQuery.length > 0) {
                aFilters = new Filter({
                    filters: [
                        new Filter("Nombre", FilterOperator.Contains, sQuery),
                        new Filter("Empresa", FilterOperator.Contains, sQuery)
                    ],
                    and: false
                });
            }
            oBinding.filter(aFilters);
        },

        // --- LÓGICA DE POPOVERS (HOVER) ---

        // 1. Popover Nombre del Lead
        onHoverName: function (oEvent) {
            const sControlId = oEvent.currentTarget.id;
            const oControl = sap.ui.getCore().byId(sControlId); // Obtener control UI5 desde el ID del DOM

            if (oControl) {
                const oCtx = oControl.getBindingContext("leadModel");
                const oData = oCtx.getObject();
                this._openNamePopover(oControl, oData);
            }
        },

        _openNamePopover: function (oOpener, oData) {
            if (!this._pNamePopover) {
                this._pNamePopover = Fragment.load({
                    name: "c4c.leadmanagement.view.fragments.NamePopover", // Ruta del fragmento
                    controller: this
                }).then(oPopover => {
                    this.getView().addDependent(oPopover);
                    return oPopover;
                });
            }

            this._pNamePopover.then(oPopover => {
                // Modelo temporal solo para el popup
                const oPopModel = new JSONModel(oData);
                oPopover.setModel(oPopModel, "popoverModel");
                oPopover.openBy(oOpener);
            });
        },

        // 2. Popover Propietario
        onHoverOwner: function (oEvent) {
            const sControlId = oEvent.currentTarget.id;
            const oControl = sap.ui.getCore().byId(sControlId);

            if (oControl) {
                const oCtx = oControl.getBindingContext("leadModel");
                const oData = oCtx.getObject();
                this._openOwnerPopover(oControl, oData);
            }
        },

        _openOwnerPopover: function (oOpener, oData) {
            if (!this._pOwnerPopover) {
                this._pOwnerPopover = Fragment.load({
                    name: "c4c.leadmanagement.view.fragments.OwnerPopover",
                    controller: this
                }).then(oPopover => {
                    this.getView().addDependent(oPopover);
                    return oPopover;
                });
            }

            this._pOwnerPopover.then(oPopover => {
                const oPopModel = new JSONModel(oData);
                oPopover.setModel(oPopModel, "popoverModel");
                oPopover.openBy(oOpener);
            });
        },

        // Cerrar Popover (opcional, si hay botón cerrar)
        onCloseNamePopover: function () {
            this._pNamePopover.then(o => o.close());
        },
        onCloseOwnerPopover: function () {
            this._pOwnerPopover.then(o => o.close());
        },

        // --- ACCIONES DE PAGINACIÓN ---

        onNextPage: function () {
            const oViewModel = this.getView().getModel("view");
            const iCurrent = oViewModel.getProperty("/pageIndex");
            oViewModel.setProperty("/pageIndex", iCurrent + 1);
            this._fetchLeads();
        },

        onPrevPage: function () {
            const oViewModel = this.getView().getModel("view");
            const iCurrent = oViewModel.getProperty("/pageIndex");
            if (iCurrent > 0) {
                oViewModel.setProperty("/pageIndex", iCurrent - 1);
                this._fetchLeads();
            }
        },

    });
});