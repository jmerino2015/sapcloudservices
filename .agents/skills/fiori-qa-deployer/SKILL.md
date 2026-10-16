---
name: fiori-qa-deployer
description: >-
  Gobernanza Clean Core, pruebas automatizadas (ABAP Unit, OPA5, QUnit), inspección estática ATC,
  auditoría de consistencia visual Fiori Horizon (SideNavigation, KPI Strip) y despliegue a producción.
  Utiliza esta skill cuando necesites auditar código con perfiles ABAP Cloud, crear suites de pruebas unitarias y de integración,
  validar uniformidad UX/UI en aplicaciones Fiori, configurar el SAP Fiori Launchpad (Semantic Objects, Catalogs, Roles) o gestionar despliegues vía gCTS y SAP BTP HTML5 Repo.
---

# Skill: Fiori-QA-Deployer (Calidad, Pruebas, Consistencia UX & Despliegue Clean Core)

Esta skill define los controles de calidad técnica, auditoría de consistencia de interfaz de usuario y procedimientos de despliegue para garantizar la conformidad con las directrices de Clean Core en SAP S/4HANA y SAP BTP.

---

## 1. Verificación Estática con ABAP Test Cockpit (ATC)

Todo desarrollo backend debe superar la variante de verificación **ABAP Cloud / Clean Core**:

- **Perfil de Verificación:** `ABAP_CLOUD_DEVELOPMENT_DEFAULT`
- **Reglas Críticas:**
  - `NO_UNRELEASED_API`: No utilizar funciones, clases o tablas no liberadas bajo contrato C1.
  - `NO_DIRECT_DB_MODIFICATION`: Modificaciones a tablas estándar deben realizarse vía Business Object Interface (BOI) o RAP EML, nunca mediante `UPDATE` o `INSERT` directo.
  - `NO_OBSOLETE_STATEMENTS`: Prohibido el uso de `CALL FUNCTION 'ENQUEUE_*'`, `COMMIT WORK` explícito dentro de behavior pools, o `MOVE-CORRESPONDING` sin control de tipo.

---

## 2. Checklist de Auditoría de Consistencia Visual y UX Fiori Horizon

Antes de autorizar el despliegue o entrega de cualquier subaplicación del Portal, el auditor de QA debe verificar:

| Punto de Control | Estándar Obligatorio | Verificación |
| :--- | :--- | :--- |
| **Barra Lateral Izquierda** | Formato `sap.tnt.SideNavigation`: Fondo blanco `#ffffff`, borde derecho `1px solid #eaedf1`, ancho `230px`. | ✅ / ❌ |
| **Elemento Activo en Sidebar** | Recuadro azul Fiori Horizon (`border: 1.5px solid #0a6ed1; border-radius: 6px; background: #ffffff; color: #0a6ed1;`). | ✅ / ❌ |
| **Iconografía en Sidebar** | Iconos outline Slate `#475569` (activo en `#0a6ed1`). **Cero emojis** en menús o botones. | ✅ / ❌ |
| **Agrupadores Expandibles** | Separador y chevron `\|  >`, con rotación a 90° (`v`) al expandirse. | ✅ / ❌ |
| **Pie de Barra Lateral** | Item `Administración` anclado al fondo con `border-top: 1px solid #eaedf1`. | ✅ / ❌ |
| **Franja Superior de KPIs** | 4 tarjetas uniformes con métrica de color funcional: Naranja `#e06a3b` (pendientes), Slate `#1e293b` (total base), Verde `#107e3e` (cumplimiento %), Naranja `#e06a3b` (críticos). | ✅ / ❌ |
| **Cabecera Shell Bar** | Fondo `#1d2d3e`, Logo SAP, botón `< Home` con handler `goHome()`, buscador y acciones. | ✅ / ❌ |
| **Modo Iframe vs Standalone** | Regla `body.in-iframe` para ocultar la cabecera embebida cuando se visualiza en modal. | ✅ / ❌ |
| **Sincronización de Temas** | Soporte de mensajes `postMessage` (`SET_THEME`) para alternar `sap_horizon` y `sap_horizon_dark`. | ✅ / ❌ |

---

## 3. Pruebas Unitarias Transaccionales (ABAP Unit con Test Doubles)

Aislamiento de base de datos y verificación de operaciones RAP:

```abap
CLASS ltcl_orden_unit DEFINITION FINAL FOR TESTING
  DURATION SHORT
  RISK LEVEL HARMLESS.

  PRIVATE SECTION.
    CLASS-DATA:
      environment TYPE REF TO if_caching_test_environment.

    CLASS-METHODS:
      class_setup,
      class_teardown.

    METHODS:
      test_crear_orden_draft FOR TESTING,
      test_aprobar_orden FOR TESTING.
ENDCLASS.

CLASS ltcl_orden_unit IMPLEMENTATION.

  METHOD class_setup.
    cl_cds_test_environment=>create(
      i_for_entities = VALUE #( ( entity_name = 'R_GESTIONORDEN' ) ) ).
  ENDMETHOD.

  METHOD class_teardown.
    cl_cds_test_environment=>destroy_all( ).
  ENDMETHOD.

  METHOD test_crear_orden_draft.
    MODIFY ENTITIES OF R_GestionOrden
      ENTITY Orden
        CREATE FIELDS ( OrdenID Descripcion Estado )
        WITH VALUE #( ( %cid        = 'CID_01'
                        OrdenID     = 'ORD-2026-001'
                        Descripcion = 'Orden de Prueba de QA'
                        Estado      = 'PENDIENTE' ) )
      MAPPED   DATA(mapped)
      FAILED   DATA(failed)
      REPORTED DATA(reported).

    cl_abap_unit_assert=>assert_initial( failed-orden ).
    cl_abap_unit_assert=>assert_not_initial( mapped-orden ).
  ENDMETHOD.

  METHOD test_aprobar_orden.
    " Ejecutar acción de negocio y verificar resultado
    " ...
  ENDMETHOD.

ENDCLASS.
```

---

## 4. Matriz de Configuración SAP Fiori Launchpad (FLP)

Para el pase a producción, documentar y registrar los siguientes parámetros en el Launchpad App Manager:

| Parámetro FLP | Valor Ejemplo | Descripción |
| :--- | :--- | :--- |
| **Semantic Object** | `GestionOrdenes` | Objeto de negocio para navegación basada en intención. |
| **Action** | `manage` / `display` | Acción a ejecutar sobre el objeto semántico. |
| **Application Type** | `SAPUI5 Fiori App` / `Fiori Elements` | Tipo de componente web a instanciar. |
| **SAPUI5 Component ID** | `com.empresa.gestionordenes` | ID declarado en el `manifest.json`. |
| **Business Catalog** | `SAP_BR_OPERACIONES_BC` | Catálogo de negocio donde se publica el Tile. |
| **Business Role (PFCG)** | `Z_BR_OPERACIONES_MGR` | Rol de autorizaciones asignado al usuario final. |

---

## 5. Pruebas Automatizadas de Interfaz (OPA5 & QUnit)

Validación de flujos de navegación en frontend:

```javascript
sap.ui.define([
  "sap/ui/test/Opa5",
  "sap/ui/test/opaQunit"
], function (Opa5, opaTest) {
  "use strict";

  QUnit.module("Navegación Fiori Horizon");

  opaTest("Debe alternar entre vistas desde la barra lateral SideNavigation", function (Given, When, Then) {
    Given.iStartMyApp();

    When.onTheSidebar.iClickNavItem("dashboard");
    Then.onTheDashboard.iShouldSeeTheKpiStripWithFourCards();

    When.onTheSidebar.iClickNavItem("orderlist");
    Then.onTheOrderList.iShouldSeeTheTable();

    Given.iTeardownMyApp();
  });
});
```
