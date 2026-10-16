# MANDATORY PROJECT DIRECTIVE: ALWAYS INITIALIZE AGENTS & SKILLS

Para este proyecto ("Portal de Soluciones SAP Fiori" y futuros desarrollos Fiori / RAP Clean Core), **SIEMPRE** deben estar activos y aplicarse de forma prioritaria los 4 sub-agentes especializados con sus respectivas skills.

---

## ⚡ REGLA DE AUTO-INICIALIZACIÓN OBLIGATORIA
En cualquier conversación o sesión de trabajo sobre este proyecto:
1. **Verificar e Inicializar Sub-Agentes:** Si los 4 sub-agentes (`cds_architect`, `rap_engineer`, `fiori_ui_expert`, `fiori_qa_deployer`) no están registrados en el entorno activo, deben ser definidos inmediatamente utilizando la herramienta `define_subagent`.
2. **Consultar y Activar sus Skills:** Siempre cargar y aplicar las directrices técnicas ubicadas en `.agents/skills/`:
   - `cds-architect`: CDS View Entities (`R_*`, `I_*`, `C_*`), Metadata Extensions (`.mde`), push-down HANA, anotaciones semánticas y DataPoints para métricas KPI.
   - `rap-engineer`: BDEF con Draft, Behavior Pools ABAP Cloud (`LCL_HANDLER`, `LCL_SAVER`), EML, determinaciones/validaciones, cálculo transaccional de KPIs y Service Bindings OData V4.
   - `fiori-ui-expert`: Floorplans de Fiori Elements, SAPUI5 Freestyle modular (MVC, ES6+, Promises), barra lateral `sap.tnt.SideNavigation`, franja cromática de 4 KPIs, Shell Bar unificado con `< Home`, `manifest.json` y temas Horizon.
   - `fiori-qa-deployer`: Auditoría estática ATC (ABAP Cloud), pruebas unitarias ABAP Unit con test doubles, checklist de consistencia visual UX Horizon, pruebas OPA5 y configuración Launchpad (FLP).

---

## 👥 MATRIZ DE AGENTES Y SKILLS DEL PROYECTO

### 1. `cds_architect` (CDS-Architect)
* **Rol:** Modelador de Datos Semánticos y Virtual Data Model (VDM).
* **Skills Obligatorias:**
  * `cds_view_entities`: Jerarquía VDM limpia (`define [root] view entity`).
  * `metadata_extensions`: Desacoplamiento total de anotaciones `@UI.*` en archivos `.mde`.
  * `hana_sql_optimization`: Asociaciones on-demand y cardinalidades precisas para push-down en HANA.
  * `semantic_annotation`: Anotaciones monetarias, cantidades, auditoría temporal, ETag y DataPoints KPI.

### 2. `rap_engineer` (RAP-Engineer)
* **Rol:** Ingeniero Transaccional de Lógica de Negocio y Servicios RAP.
* **Skills Obligatorias:**
  * `bdef_design`: BDEF `managed with draft` (o `unmanaged`), bloqueos y controles de autorización.
  * `behavior_implementation`: Implementación de Behavior Pools usando ABAP Cloud y sentencias EML.
  * `business_logic`: Validaciones tempranas, determinaciones reactivas y acciones de negocio.
  * `service_exposure`: Publicación en Service Definitions y Service Bindings en protocolo **OData V4**.

### 3. `fiori_ui_expert` (Fiori-UI-Expert)
* **Rol:** Ingeniero de Experiencia de Usuario, Fiori Elements, SAPUI5 y Estándar Fiori Horizon.
* **Skills Obligatorias:**
  * `fiori_horizon_tnt_sidebar`: Barra lateral `sap.tnt.SideNavigation` (fondo blanco `#ffffff`, marco azul activo `#0a6ed1`, iconos slate `#475569`, grupos con `|  >`, pie `Administración`, cero emojis).
  * `kpi_strip_standard`: Franja cromática de 4 KPIs: Naranja `#e06a3b` (pendientes), Slate `#1e293b` (base total), Verde `#107e3e` (cumplimiento %), Naranja `#e06a3b` (críticos).
  * `shell_bar_unification`: Cabecera corporativa `#1d2d3e`, logo oficial SAP, botón `< Home` con `goHome()`, búsqueda y acciones.
  * `fiori_elements_config`: List Report, Object Page y Flexible Column Layout guiados por metadatos.
  * `ui5_freestyle_development`: SAPUI5 Freestyle modular bajo patrón MVC asíncrono y estándares ES6+.
  * `app_configuration`: Descriptor `manifest.json`, modelos OData V4, rutas, targets y bundles `i18n`.

### 4. `fiori_qa_deployer` (Fiori-QA-Deployer)
* **Rol:** Auditor de Calidad, Clean Core, Seguridad, Consistencia Visual y Gobernanza de Despliegue.
* **Skills Obligatorias:**
  * `atc_code_analysis`: Inspección de código estático con ABAP Test Cockpit bajo perfiles ABAP Cloud.
  * `ux_horizon_consistency_audit`: Checklist de uniformidad visual (SideNavigation, KPI Strip, Shell Bar, paleta de colores).
  * `automated_testing`: Suites ABAP Unit aisladas con dobles de persistencia y pruebas OPA5 / QUnit.
  * `flp_content_management`: Launchpad App Manager (Semantic Objects, Target Mappings, Catalogs y PFCG).
  * `deployment_lifecycle`: Despliegue vía gCTS y empaquetado MTAR en SAP BTP HTML5 Repo.

---

## 🔄 PIPELINE DE HANDOFF OBLIGATORIO
Toda tarea de desarrollo o mantenimiento debe procesarse respetando la secuencia:
$$\text{CDS-Architect} \longrightarrow \text{RAP-Engineer} \longrightarrow \text{Fiori-UI-Expert} \longrightarrow \text{Fiori-QA-Deployer}$$
