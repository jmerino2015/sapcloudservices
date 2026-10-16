# Handoff Técnico: Capa Frontend SAP Fiori / SAPUI5 (Versión Homologada v2.0)
## Aplicación: Indicadores de Almacenes — Torre de Control WMS Multi-Sede
### Módulo: `apps/14_indicadores_almacenes/webapp/`
### Fecha de Homologación: 15/10/2026
### Directivas: `.agents/skills/fiori-ui-expert/SKILL.md` y `.agents/agents/fiori_ui_expert/agent.md`
### Destinatario: `fiori_qa_deployer`

---

## 1. Cumplimiento Estricto de las Directivas de UI Fiori Horizon

Se han implementado y verificado las 4 directivas obligatorias consolidadas en el proyecto:

### 1.1. Barra Lateral Izquierda (`sap.tnt.SideNavigation`)
- **Fondo:** Blanco puro (`#ffffff`) en modo claro y `#1d232a` en modo oscuro.
- **Borde Derecho:** `1px solid #eaedf1` (borde sutil y limpio).
- **Ancho:** `230px` estándar.
- **Elemento Activo (Selected State):** Recuadro azul distintivo Horizon sin fondo sólido:
  ```css
  border: 1.5px solid #0a6ed1 !important;
  border-radius: 6px !important;
  background-color: #ffffff !important;
  color: #0a6ed1 !important;
  font-weight: 600 !important;
  box-shadow: 0 1px 3px rgba(10, 110, 209, 0.08) !important;
  ```
- **Iconografía:** Outline Slate (`#475569`, activo `#0a6ed1`). **Cero emojis en menús**.
- **Agrupadores Expandibles:** Soporte nativo para agrupadores de sedes y operaciones.
- **Pie Fijo Inferior (`tnt:fixedItem`):** Acceso permanente a **Administración** con `border-top: 1px solid #eaedf1`.

### 1.2. Franja Superior de 4 Tarjetas KPI (Infografía Cromática Unificada)
Ubicada en `Opcion1ControlOperativo.fragment.xml` en tarjetas blancas con borde `#eaedf1` y `border-radius: 12px`:
1. **KPI 1: Naranja / Coral (`#e06a3b`):** Tareas pendientes y OTs abiertas de almacén (LT23).
2. **KPI 2: Dark Slate (`#1e293b`):** Volumen global de datos y capacidad total de posiciones bins (LX03).
3. **KPI 3: Verde Positivo (`#107e3e`):** Porcentaje de ocupabilidad y eficiencia operativa.
4. **KPI 4: Naranja / Coral (`#e06a3b`):** Unidades de despacho en alerta o pendientes de salida (VL06F/Drivin).

### 1.3. Shell Bar Unificada Corporativa
- **Fondo:** Dark Slate `#1d2d3e`.
- **Logo Oficial SAP:** Badge corporativo SAP azul con tipografía bold.
- **Botón `< Home`:** Botón transparente interactivo con handler universal `onGoHome()` que invoca `parent.PortalApp.closeModal()` o redirige al Launchpad raíz (`../../index.html`).
- **Título en Mayúsculas Sobrias:** `TORRE DE CONTROL WMS`.
- **Buscador Global:** `SearchField` integrado para filtrado rápido en caliente.

### 1.4. Soporte Modal vs Standalone
- **Detección `in-iframe`:** `if (window.self !== window.top) document.body.classList.add('in-iframe');`
- **Adaptabilidad Visual:** Ocultamiento automático del botón `< Home` cuando se ejecuta en el visor modal del Portal para evitar redundancia con el header del Shell maestro.
- **Sincronización de Temas:** Listener `postMessage` para `SET_THEME` (`sap_horizon` <-> `sap_horizon_dark`).

---

## 2. Inventario de Archivos Homologados

| Archivo | Responsabilidad | Conforme |
|---|---|:---:|
| `webapp/index.html` | Bootstrap UI5, detección `in-iframe`, listener `postMessage` | **SI** |
| `webapp/manifest.json` | Modelos OData V4, enrutamiento, librerías `sap.tnt`, `sap.m`, `sap.f` | **SI** |
| `webapp/view/Main.view.xml` | Shell Bar `#1d2d3e`, `< Home`, SideNav `230px`, pie `Administración` | **SI** |
| `webapp/controller/Main.controller.js` | Handler `onGoHome()`, búsqueda global, sincronización ToolPage | **SI** |
| `webapp/css/style.css` | Directivas cromáticas (`#e06a3b`, `#1e293b`, `#107e3e`), SideNav `230px` | **SI** |
| `webapp/view/fragments/Opcion1ControlOperativo.fragment.xml` | 4 KPI Cards cromáticas, productividad, OTs y despacho | **SI** |
| `webapp/view/fragments/Opcion2FlujoOperacion.fragment.xml` | Chevrons minimalistas, alertas sobrias sin botones sólidos | **SI** |
| `webapp/view/fragments/Opcion3DashboardExcepcion.fragment.xml` | 5 Badges de auditoría, bitácora de excepciones | **SI** |
| `webapp/view/fragments/Opcion4VistaIntegral.fragment.xml` | Matriz multi-sede, días sin accidentes, exportación CSV | **SI** |

---

## 3. Guía de Pruebas QA para `fiori_qa_deployer`

1. **Prueba Standalone:**
   - Abrir `apps/14_indicadores_almacenes/webapp/index.html`.
   - Verificar la presencia de la Shell Bar `#1d2d3e`, el botón `< Home` y el logo oficial SAP.
   - Probar el menú lateral de 230px con fondo blanco y recuadro azul activo `#0a6ed1`.
   - Verificar la franja superior de 4 KPIs con secuencia cromática: Naranja -> Slate -> Verde -> Naranja.
2. **Prueba Modal Portal (Launchpad):**
   - Abrir `index.html` del portal raíz y pulsar el tile 14.
   - Verificar que `body.in-iframe` oculta el botón `< Home` redundante.
   - Probar la alternancia de tema Morning / Evening Horizon y confirmar la reacción en tiempo real.
