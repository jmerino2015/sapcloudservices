# Reglas de Desarrollo — SAP WM Light

## 1. SAPUI5 / Fiori Frontend

### Expresiones de Enlace (Expression Bindings)
* **Ternarios Completos Obligatorios:** En las vistas XML, al escribir expresiones de enlace `{= ... }` con operadores ternarios simples o anidados, **siempre** debes incluir la rama final por defecto (`: 'valor_por_defecto'`).
  * *Incorrecto:* `icon="{= ${gi>status} === 'OPEN' ? 'sap-icon://pending' : ${gi>status} === 'CONFIRMED' ? 'sap-icon://accept'}"` (Falta el `:` final, causa `SyntaxError: Expected : but instead saw )`).
  * *Correcto:* `icon="{= ${gi>status} === 'OPEN' ? 'sap-icon://pending' : ${gi>status} === 'CONFIRMED' ? 'sap-icon://accept' : 'sap-icon://decline'}"`

### Estructura y Altura del Layout en `sap.tnt.ToolPage`
* **Hijos Directos de `mainContents`:** El contenedor principal de vistas operativas `<NavContainer id="appNav">` debe permanecer como un hijo directo del elemento `<tnt:mainContents>`.
* **Evitar Colapsos de Altura:** No envuelvas el `NavContainer` dentro de layouts como `<HBox>` o `<VBox>` en `mainContents`, ya que esto colapsa la altura a `0px` en el navegador y produce una pantalla en blanco.
* **Paneles Laterales (Sidebar Drawers):** Si necesitas integrar paneles laterales dinámicos (como un chatbot o side-sheet):
  1. Define el panel lateral como un elemento hermano de `NavContainer` dentro de `<tnt:mainContents>`.
  2. Posiciona el panel lateral de forma absoluta utilizando CSS (`position: absolute; right: 0; top: 0; bottom: 0; z-index: 100`).
  3. Implementa una transición de margen en el `NavContainer` aplicando una clase dinámica (ej. `chatbot-expanded-nav` que añada `margin-right: 380px`) cuando el panel se expanda para desplazar el contenido del view activo sin tapar sus elementos interactivos.

---

## 2. Base de Datos y Semillas (Backend)

### Consistencia de Usuarios en Semillas (Seeds)
* Al cambiar el email de un usuario administrador o rol clave en `seed.js`, debes buscar y sincronizar de forma estricta todas las referencias de consulta (`User.findOne({ where: { email: '...' } })`) en:
  * Otros scripts de semilla secundarios (ej. `seed_gr_gi.js`).
  * Pruebas automáticas.
  * Mocks de interfaz y controladores estáticos.
  * De lo contrario, las consultas devolverán `null` y causarán fallos durante la recreación de transacciones de prueba.
