---
name: programar-sapui5
description: Diseña y desarrolla aplicaciones frontend estructuradas en SAPUI5 siguiendo el estándar MVC, tema sap_horizon, sistema de diseño SAP Fiori, iconos estándar (sap-icon://) y buenas prácticas del SDK de SAP. Nunca usa CSS custom, colores HEX/RGB ni fuentes externas.
---
# Skill para Programación en SAPUI5

## Cuándo usar este skill
- Cuando se requiera crear una aplicación frontend o extensión desde cero utilizando SAPUI5 o OpenUI5.
- Cuando sea necesario diseñar vistas XML y controladores JS bajo el patrón Modelo-Vista-Controlador (MVC).
- Cuando se deba configurar el descriptor de la aplicación (`manifest.json`) o configurar el sistema de enrutamiento (routing).
- Cuando se requiera implementar data binding con modelos OData, JSON o i18n.

## Inputs necesarios
- **Requisitos de la Aplicación:** Descripción de las vistas, flujos de usuario y pantallas requeridas.
- **Modelos de Datos:** Especificación de las fuentes de datos (ej. servicios OData V2/V4, payloads JSON locales).
- **Controles Clave:** Si se requiere el uso de algún control UI específico de SAPUI5 (ej. `sap.m.Table`, `sap.m.Page`, `sap.f.FlexibleColumnLayout`).

## Workflow
1) **Planificación de Vistas y Enrutamiento:** Diseñar el árbol de navegación de la aplicación y mapear cada pantalla a una vista XML y su respectiva ruta.
2) **Configuración del manifest.json:** Inicializar o actualizar el archivo de configuración declarando el enrutador (`router`), los modelos (`models`) y el servicio de origen (`dataSources`).
3) **Creación de Vistas XML (View):** Diseñar las vistas utilizando controles de la librería `sap.m` y estructurando la UI de forma declarativa.
4) **Implementación de Controladores JS (Controller):** Programar el controlador asociado a la vista, heredando de un `BaseController` para gestionar el ciclo de vida, eventos de UI y enlaces de datos.
5) **Internacionalización y Textos (i18n):** Mapear todas las cadenas de texto expuestas en la UI al archivo `i18n.properties`.
6) **Verificación de Estándares:** Validar contra la checklist de buenas prácticas SAPUI5.

---

## Instrucciones

### 1. Principios de Desarrollo y Buenas Prácticas
- **Separación de Responsabilidades (MVC):** Nunca manipules el DOM directamente utilizando jQuery o javascript vanilla (`document.getElementById`). Toda actualización visual debe realizarse mediante Data Binding o métodos del Framework.
- **Uso de BaseController:** Para simplificar el código, todos los controladores deben extender de un `BaseController.js` personalizado que exponga funciones de conveniencia como:
  - `getRouter()`
  - `getModel(sName)`
  - `setModel(oModel, sName)`
  - `getResourceBundle()`
- **Enlace de Datos (Data Binding):** Usa `{}` en propiedades de controles XML para enlazar modelos. Utiliza `{i18n>claveTexto}` para internacionalización y enlaces bidireccionales (`{/propiedad}`) cuando proceda.
- **Ciclo de Vida del Controlador:** Implementa `onInit` para suscripciones a eventos y `onExit` para limpiar oyentes de eventos globales o modelos locales, evitando fugas de memoria.

### 2. Niveles de Libertad
- **Baja Libertad (Paso exacto):** Estructura del `manifest.json`, definiciones de `Component.js` y nombres de namespaces. Deben cumplir exactamente las convenciones SAP.
- **Media Libertad (Plantillas):** Estructura de vistas XML y controladores. Se puede iterar sobre el diseño de la UI siempre que se mantenga el uso de los controles de UI5 oficiales.

### 3. Manejo de Errores
- **Error en Carga de Modelo OData:** Implementar capturas en `metadataFailed` en el `Component.js` o capturas genéricas para mostrar un mensaje de error limpio al usuario.
- **Fallas de Binding:** Si la vista no renderiza datos, verifica la ruta relativa en el binding (`{modelo>propiedad}` frente a `{modelo>/propiedad}`).

---

## Iconos — Estándar SAP UI5

### Referencia oficial
Siempre consultar y usar iconos del **SAP Icon Explorer oficial**:
🔗 https://ui5.sap.com/test-resources/sap/m/demokit/iconExplorer/webapp/index.html#/overview

### Sintaxis del protocolo `sap-icon://`
Todos los iconos SAP se referencian con el protocolo `sap-icon://` seguido del nombre del icono:

```xml
<!-- En vistas XML -->
<Button icon="sap-icon://accept" text="Aceptar" />
<Icon src="sap-icon://home" size="2rem" color="Highlight" />
<ToolbarButton icon="sap-icon://add" text="Crear" />
```

```javascript
// En controladores JS
var oButton = new sap.m.Button({
    icon: sap.ui.core.IconPool.getIconURI("accept"),
    text: "Aceptar"
});

// Forma directa (equivalente)
icon: "sap-icon://accept"
```

### Namespaces disponibles

| Namespace | Prefijo | Descripción |
|---|---|---|
| Standard SAP Icons | `sap-icon://` | Iconos generales de uso común (≈ 700) |
| SAP Icons TNT | `sap-icon://SAP-icons-TNT/` | Iconos técnicos/sistema/infraestructura |
| Business Suite | `sap-icon://BusinessSuiteInAppSymbols/` | Símbolos específicos de módulos SAP (MM, SD, FI…) |

### Iconos más usados — Referencia rápida por categoría

#### Navegación y Acción
| Icono | URI | Uso típico |
|---|---|---|
| Inicio | `sap-icon://home` | Shell Bar, launchpad |
| Atrás | `sap-icon://nav-back` | Botón retroceder |
| Adelante | `sap-icon://forward` | Navegación forward |
| Menú | `sap-icon://menu2` | Hamburger menu |
| Añadir | `sap-icon://add` | Crear nuevo registro |
| Editar | `sap-icon://edit` | Modo edición |
| Eliminar | `sap-icon://delete` | Borrar |
| Guardar | `sap-icon://save` | Grabar |
| Cancelar | `sap-icon://cancel` | Cancelar acción |
| Buscar | `sap-icon://search` | Barra de búsqueda |
| Filtrar | `sap-icon://filter` | Filter bar |
| Ordenar | `sap-icon://sort` | Ordenar tabla |
| Refrescar | `sap-icon://refresh` | Recargar datos |
| Descarga | `sap-icon://download` | Exportar/descargar |
| Subida | `sap-icon://upload` | Importar/subir |
| Copiar | `sap-icon://copy` | Copiar |
| Pegar | `sap-icon://paste` | Pegar |

#### Estado y Feedback
| Icono | URI | Uso típico |
|---|---|---|
| Aceptar / OK | `sap-icon://accept` | Confirmación positiva |
| Rechazar / Error | `sap-icon://decline` | Rechazo |
| Advertencia | `sap-icon://warning` | Estado de alerta |
| Información | `sap-icon://message-information` | Info tooltip |
| Error | `sap-icon://message-error` | Estado error |
| Éxito | `sap-icon://message-success` | Estado OK |
| Pendiente | `sap-icon://pending` | En espera |

#### Datos y Documentos
| Icono | URI | Uso típico |
|---|---|---|
| Tabla | `sap-icon://table-view` | Cambiar a vista tabla |
| Lista | `sap-icon://list` | Vista lista |
| Gráfico barras | `sap-icon://bar-chart` | KPIs, reportes |
| Gráfico líneas | `sap-icon://line-chart` | Tendencias |
| Documento | `sap-icon://document` | Adjuntos, archivos |
| Nota | `sap-icon://notes` | Observaciones |
| Adjunto | `sap-icon://attachment` | Documentos adjuntos |
| Carpeta | `sap-icon://folder` | Agrupaciones |
| Excel | `sap-icon://excel-attachment` | Exportar Excel |
| PDF | `sap-icon://pdf-attachment` | Exportar PDF |
| Código QR | `sap-icon://bar-code` | Scanner / QR |
| Impresión | `sap-icon://print` | Imprimir |

#### Usuarios y Organización
| Icono | URI | Uso típico |
|---|---|---|
| Empleado | `sap-icon://employee` | Usuario individual |
| Grupo | `sap-icon://group` | Equipo / roles |
| Manager | `sap-icon://manager` | Supervisor |
| Organización | `sap-icon://org-chart` | Jerarquía |
| Perfil | `sap-icon://person-placeholder` | Avatar usuario |
| Contacto | `sap-icon://contacts` | Directorio |

#### Logística y Almacén (WM)
| Icono | URI | Uso típico |
|---|---|---|
| Producto | `sap-icon://product` | Material / artículo |
| Inventario | `sap-icon://inventory` | Stock / inventario |
| Paquete | `sap-icon://package` | Embalaje / caja |
| Camión | `sap-icon://truck-driver` | Transporte |
| Almacén | `sap-icon://shelf` | Estantería / ubicación |
| Código barras | `sap-icon://bar-code` | Scanning |
| Escáner | `sap-icon://scan-2` | Lector físico |
| Transferencia | `sap-icon://transfer` | Traslados |
| Entrada | `sap-icon://log` | GR / Entrada |
| Peso | `sap-icon://measure` | Cantidad / UoM |
| Batch/Lote | `sap-icon://batch-payments` | Lotes |
| Fecha venc. | `sap-icon://date-time` | Fechas expiración |
| Proveedor | `sap-icon://supplier` | Vendor |
| Cliente | `sap-icon://customer` | Customer |
| Orden compra | `sap-icon://cart` | PO / Pedido |
| Factura | `sap-icon://bbyd-active-sales` | Documento comercial |

#### Configuración y Sistema
| Icono | URI | Uso típico |
|---|---|---|
| Configuración | `sap-icon://settings` | Parámetros sistema |
| Llave inglesa | `sap-icon://wrench` | Mantenimiento |
| Candado | `sap-icon://locked` | Bloqueado |
| Candado abierto | `sap-icon://unlocked` | Desbloqueado |
| Conexión | `sap-icon://connected` | Integración / SAP RFC |
| Nube | `sap-icon://cloud` | Cloud / BTP |
| Base datos | `sap-icon://database` | DB / datos |
| Log | `sap-icon://history` | Auditoría / log |
| Sincronizar | `sap-icon://synchronize` | Sync SAP |
| Notificación | `sap-icon://bell` | Alertas |
| Favorito | `sap-icon://favorite` | Marcado |
| Ayuda | `sap-icon://sys-help` | Help center |

### Uso avanzado — IconPool API
```javascript
// Verificar si un icono existe antes de usarlo
var bExists = sap.ui.core.IconPool.isIconURI("sap-icon://accept");

// Obtener URI de forma programática
var sUri = sap.ui.core.IconPool.getIconURI("warehouse");

// Registrar fuente de iconos personalizada (si tienes iconos propios)
sap.ui.core.IconPool.registerFont({
    fontFamily: "MisFontIconos",
    fontURI: sap.ui.require.toUrl("mi/namespace/fonts")
});
```

### Estilar iconos con CSS
```xml
<!-- Tamaño y color directamente en la propiedad -->
<Icon
    src="sap-icon://product"
    size="3rem"
    color="var(--sapHighlightColor)"
    class="sapUiMediumMarginEnd" />

<!-- Con clase CSS custom -->
<Icon src="sap-icon://alert" class="wmLightIconWarning" />
```
```css
/* En style.css o en fragmento -->
.wmLightIconWarning {
    color: var(--sapCriticalColor);
    font-size: 1.5rem;
}
```

### ⚠️ Reglas obligatorias de iconos
- **SIEMPRE** usar `sap-icon://nombre` — nunca imágenes PNG/SVG cuando exista el icono en el catálogo.
- **CONSULTAR** el Icon Explorer antes de decidir un icono: https://ui5.sap.com/test-resources/sap/m/demokit/iconExplorer/webapp/index.html#/overview
- **NO** usar emojis ni caracteres Unicode como sustitutos de iconos en controles UI5.
- **PREFERIR** el namespace estándar `sap-icon://` sobre los namespaces TNT o BusinessSuite salvo que el contexto lo requiera explícitamente.
- **ACCESIBILIDAD:** Siempre añadir `tooltip` o `alt` cuando el icono transmite información sin texto acompañante.

```xml
<!-- Correcto — icono accesible -->
<Button icon="sap-icon://delete" tooltip="{i18n>deleteTooltip}" />

<!-- Incorrecto — icono sin contexto para lectores de pantalla -->
<Button icon="sap-icon://delete" />
```

---

## Diseño Visual — Tema `sap_horizon` y SAP Fiori Design System

> **REGLA ABSOLUTA:** Ninguna línea de código de vista o controlador puede contener colores HEX (`#RRGGBB`), valores RGB, nombres de colores CSS (`red`, `blue`), declaraciones de fuentes externas (`font-family`, `@font-face`, `<link>` a Google Fonts) ni bloques `<style>` o atributos `style="..."` con estilos visuales. El tema `sap_horizon` inyecta automáticamente todos los valores correctos a través de los controles nativos.

### 1. Activación del tema `sap_horizon`

Declarar el tema en el `index.html` o en el `manifest.json`:

```html
<!-- index.html — carga de UI5 con tema Horizon -->
<script
    id="sap-ui-bootstrap"
    src="https://ui5.sap.com/resources/sap-ui-core.js"
    data-sap-ui-theme="sap_horizon"
    data-sap-ui-libs="sap.m,sap.f,sap.ui.layout"
    data-sap-ui-compatVersion="edge"
    data-sap-ui-async="true"
    data-sap-ui-resourceroots='{"mi.namespace": "./webapp"}'>
</script>
```

```json
// manifest.json — sección "sap.ui"
"sap.ui": {
    "technology": "UI5",
    "deviceTypes": { "desktop": true, "tablet": true, "phone": true },
    "fullWidth": false
}
// El tema se gestiona desde el bootstrap; no se declara en manifest.
```

### 2. Tipografía — Control `<Title>` y `<Text>`

Nunca declarar fuentes externas. Usar los controles nativos que heredan automáticamente la fuente oficial **"72"** de SAP:

```xml
<!-- ✅ CORRECTO — tipografía automática vía control nativo -->
<Title text="{i18n>pageTitle}" titleStyle="H1" />
<Title text="{i18n>sectionTitle}" titleStyle="H3" wrapping="true" />
<Text text="{i18n>description}" />
<Label text="{i18n>fieldLabel}" />

<!-- ❌ PROHIBIDO — nunca declarar fuentes -->
<!-- <Text text="..." style="font-family: 'Roboto'; font-size: 16px;" /> -->
<!-- <link href="https://fonts.googleapis.com/css?family=Roboto" /> -->
```

| Control | `titleStyle` | Resultado automático en Horizon |
|---|---|---|
| `<Title>` | `H1` | 3rem · 300 weight · color heading |
| `<Title>` | `H2` | 2.25rem · 300 weight |
| `<Title>` | `H3` | 1.5rem · 400 weight |
| `<Title>` | `H4` | 1.25rem · 400 weight |
| `<Title>` | `H5` | 1rem · 600 weight |
| `<Title>` | `H6` | 0.875rem · 600 weight |
| `<Text>` | — | 0.875rem · color body text |
| `<Label>` | — | 0.75rem · uppercase · color label |

### 3. Colores — Solo propiedades semánticas nativas

Nunca usar HEX ni RGB. Usar las propiedades `state`, `type`, `valueState`, `status` que el control mapea internamente al color correcto del tema:

```xml
<!-- ✅ CORRECTO — color vía propiedad semántica -->

<!-- Botones: propiedad 'type' -->
<Button text="Confirmar"  type="Emphasized" />
<Button text="Guardar"    type="Default" />
<Button text="Eliminar"   type="Reject" />
<Button text="Aprobar"    type="Accept" />
<Button text="Transparente" type="Transparent" />

<!-- ObjectStatus / estados de negocio: propiedad 'state' -->
<ObjectStatus
    text="En proceso"
    state="Warning"
    icon="sap-icon://warning" />
<ObjectStatus
    text="Completado"
    state="Success"
    icon="sap-icon://accept" />
<ObjectStatus
    text="Error"
    state="Error"
    icon="sap-icon://message-error" />
<ObjectStatus
    text="Pendiente"
    state="None" />

<!-- Input / campos de formulario: propiedad 'valueState' -->
<Input
    value="{/campo}"
    valueState="Error"
    valueStateText="{i18n>campoRequerido}" />
<Input
    value="{/cantidad}"
    valueState="Warning"
    valueStateText="{i18n>cantidadBaja}" />

<!-- MessageStrip: propiedad 'type' -->
<MessageStrip
    text="{i18n>infoMessage}"
    type="Information"
    showIcon="true" />
<MessageStrip
    text="{i18n>errorMessage}"
    type="Error"
    showIcon="true" />

<!-- ❌ PROHIBIDO — nunca colores inline -->
<!-- <Text text="Stock bajo" style="color: #FF0000;" /> -->
<!-- <Icon src="sap-icon://warning" color="#F0AB00" /> -->
```

#### Tabla completa de valores semánticos

| Propiedad | Valores válidos | Control afectado |
|---|---|---|
| `type` | `Default` · `Emphasized` · `Accept` · `Reject` · `Transparent` · `Attention` | `Button`, `ToolbarButton` |
| `state` | `None` · `Success` · `Warning` · `Error` · `Information` | `ObjectStatus`, `FormattedText`, `Title` |
| `valueState` | `None` · `Success` · `Warning` · `Error` · `Information` | `Input`, `Select`, `DatePicker`, `ComboBox` |
| `type` | `None` · `Positive` · `Critical` · `Negative` · `Indication01`–`08` | `ObjectNumber` |
| `type` | `Success` · `Warning` · `Error` · `Information` | `MessageStrip`, `MessageBox` |
| `status` | `None` · `Success` · `Warning` · `Error` | `GenericTag` |
| `state` | `Positive` · `Critical` · `Negative` · `Neutral` | `ProgressIndicator` |
| `highlight` | `None` · `Success` · `Warning` · `Error` · `Information` | `ColumnListItem` (fila de tabla) |

### 4. Controles de layout nativos (sin CSS de posicionamiento)

Usar los contenedores de SAPUI5 en lugar de `<div>` con estilos CSS de layout:

```xml
<!-- ✅ CORRECTO —  layout con controles nativos -->
<f:Card xmlns:f="sap.f">
    <f:header>
        <card:Header
            xmlns:card="sap.f.cards"
            title="{i18n>cardTitle}"
            subtitle="{i18n>cardSubtitle}"
            iconSrc="sap-icon://product" />
    </f:header>
    <f:content>
        <VBox class="sapUiSmallMargin">
            <Title text="{i18n>section}" titleStyle="H5" />
            <Text text="{material>description}" />
        </VBox>
    </f:content>
</f:Card>

<!-- Grid de tarjetas con CSSGrid -->
<cssgrid:CSSGrid
    xmlns:cssgrid="sap.ui.layout.cssgrid"
    gridTemplateColumns="repeat(auto-fill, minmax(20rem, 1fr))"
    gridGap="1rem">
    <!-- Tarjetas aquí -->
</cssgrid:CSSGrid>

<!-- Formulario: SimpleForm o Form nativo -->
<f:SimpleForm
    xmlns:f="sap.ui.layout.form"
    layout="ResponsiveGridLayout"
    editable="true"
    labelSpanM="4">
    <f:content>
        <Label text="{i18n>material}" />
        <Input value="{/materialCode}" />
        <Label text="{i18n>cantidad}" />
        <Input value="{/qty}" type="Number" />
    </f:content>
</f:SimpleForm>

<!-- ❌ PROHIBIDO —  layout con divs y CSS -->
<!-- <html:div style="display:flex; gap:16px;"> -->
<!-- <html:div class="mi-grid-custom"> -->
```

### 5. Clases de utilidad temáticas permitidas

Si se necesita un ajuste de espaciado o visibilidad, usar **únicamente** las clases de utilidad de SAPUI5. No crear clases CSS propias para valores de diseño:

#### Espaciado (Margin)
```
sapUiTinyMargin          →  0.25rem en los 4 lados
sapUiSmallMargin         →  0.5rem en los 4 lados
sapUiMediumMargin        →  1rem en los 4 lados
sapUiLargeMargin         →  2rem en los 4 lados
sapUiTinyMarginTop       →  solo margen superior
sapUiSmallMarginBegin    →  solo margen izquierdo (RTL-aware)
sapUiSmallMarginEnd      →  solo margen derecho (RTL-aware)
sapUiNoMargin            →  elimina márgenes
```

#### Espaciado (Padding)
```
sapUiTinyPadding         →  0.25rem
sapUiSmallPadding        →  0.5rem
sapUiMediumPadding       →  1rem
sapUiLargePadding        →  2rem
sapUiNoPadding           →  elimina padding
sapUiResponsivePadding   →  padding adaptativo según tamaño de pantalla
```

#### Ancho y visibilidad
```
sapUiSizeCompact         →  modo compacto (filas de tabla más pequeñas)
sapUiForceWidthAuto      →  width: auto
sapMHideOnPhone          →  ocultar en móvil
sapMHideOnDesktop        →  ocultar en escritorio
```

#### Colores de texto temáticos (solo cuando no existe propiedad `state`)
```
sapThemeHighlight-asColor          →  color de acento/highlight del tema
sapThemePositive-asColor           →  color verde Success del tema
sapThemeNegative-asColor           →  color rojo Error del tema
sapThemeCritical-asColor           →  color amarillo Warning del tema
sapThemeNeutral-asColor            →  color neutro del tema
```

```xml
<!-- Uso correcto de clases temáticas -->
<Text
    text="{i18n>stockCritico}"
    class="sapThemeNegative-asColor sapUiSmallMarginTop" />
```

### 6. Checklist de validación — Diseño Visual

Antes de entregar código de cualquier vista XML, verificar **todos** estos puntos:

- [ ] ¿El `index.html` tiene `data-sap-ui-theme="sap_horizon"`?
- [ ] ¿Se usa `<Title titleStyle="H1..H6">` en lugar de `<h1>` HTML o estilos de fuente?
- [ ] ¿Todos los colores de estado usan `state=`, `type=` o `valueState=` en lugar de HEX?
- [ ] ¿Ningún control tiene `style="color:..."`, `style="font-size:..."` ni `style="background:..."`?
- [ ] ¿Las clases CSS custom (si existen) son **solo** de la lista de utilidades SAPUI5?
- [ ] ¿Se usa `sap-icon://` para todos los iconos (ningún emoji ni PNG)?
- [ ] ¿Todos los iconos sin texto tienen propiedad `tooltip`?
- [ ] ¿El layout usa controles nativos (`VBox`, `HBox`, `f:Card`, `SimpleForm`, `CSSGrid`) en lugar de `<div>` con estilos?
- [ ] ¿No hay ningún `<link>` a Google Fonts ni `font-family` declarado en CSS?
- [ ] ¿Los textos de la UI están todos en `i18n.properties` (sin strings hardcodeadas)?

### 7. Estándar de Integración — Asistente Inteligente SAP Joule AI

Toda aplicación del ecosistema SAP debe incluir el asistente de Inteligencia Artificial **SAP Joule** siguiendo estrictamente la arquitectura estándar aprobada:

#### 7.1 Principios de Diseño e Interfaz
1. **Estado Inicial Minimizado (Oculto por Defecto):**
   - El asistente NUNCA debe abrirse automáticamente al cargar la aplicación.
   - En el `onInit` del controlador se inicializa `oAppModel.setProperty("/chatbotExpanded", false)`.
   - La visibilidad en el XML usa binding estricto: `visible="{= ${app>/chatbotExpanded} === true }"`.
2. **Panel Lateral Fijo a la Derecha (Docked Side Panel):**
   - No utilizar Popovers flotantes. Renderizar un contenedor `<VBox id="chatbotSidebar" width="390px" visible="{= ${app>/chatbotExpanded} === true }" class="chatbotSidebarPanel">` dentro de `<tnt:mainContents>`.
   - El `<NavContainer id="appNav">` debe aplicar la clase `chatbot-expanded-nav` (`margin-right: 390px`) cuando esté abierto para ajustar el contenido principal sin solapamiento.
3. **Sin Botón Flotante Inferior:**
   - Queda estrictamente prohibido incluir botones flotantes (`position: fixed; bottom: 2rem`) en la esquina inferior derecha.
   - El despliegue/cierre se realiza exclusivamente desde el botón de la barra superior de la app (`tnt:ToolHeader`) usando `icon="sap-icon://customer-and-contacts"`.
4. **Caja de Entrada Ampliada (`portalIaInputContainer`):**
   - El pie de página del chat integra un `<Input>` que abarca el 100% del ancho con estilo de bordes redondeados (`border-radius: 24px`), borde azul Fiori y un botón circular de envío (`sap-icon://paper-plane`).
5. **Estructura Interna y Chips de Consulta:**
   - Cabecera en azul oscuro SAP (`#1b2a3d`) con título formal `SAP Joule <Modulo>`, ícono de contacto, botón de reinicio de chat (`refresh`) y botón de cierre (`decline`).
   - Sección de Chips (sugerencias rápidas) arriba de la lista desplazable de mensajes.

---

## Output (formato exacto)

Cuando se solicite código para aplicaciones SAPUI5, devuelve la siguiente estructura:

### 1. Estructura de Archivos Propuesta
```text
webapp/
├── controller/
│   ├── BaseController.js
│   └── Main.controller.js
├── view/
│   └── Main.view.xml
├── i18n/
│   └── i18n.properties
├── Component.js
└── manifest.json
```

### 2. Contenido de Vistas (XML)
El XML debe estar formateado con indentaciones claras y declarando los namespaces correctos:
```xml
<mvc:View
    controllerName="my.namespace.controller.Main"
    xmlns:mvc="sap.ui.core.mvc"
    xmlns="sap.m">
    <Page id="page" title="{i18n>title}">
        <content>
            <!-- Controles aquí -->
        </content>
    </Page>
</mvc:View>
```

### 3. Contenido de Controladores (JavaScript)
Los controladores deben definirse utilizando `sap.ui.define`:
```javascript
sap.ui.define([
    "my/namespace/controller/BaseController"
], function (BaseController) {
    "use strict";

    return BaseController.extend("my.namespace.controller.Main", {
        onInit: function () {
            // Inicialización
        }
    });
});
```
