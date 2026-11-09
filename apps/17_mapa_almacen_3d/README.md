# 🏭 SAP WMS — Gemelo Digital 3D de Almacén (SAP Fiori Horizon)

Aplicación empresarial interactiva en 3D para la **gestión visual de almacenes**, estanterías industriales, semáforo de vencimiento por lotes y ocupación de nichos, desarrollada con los estándares oficiales de **SAP Fiori Horizon** (*Morning* y *Evening Horizon*) y potenciada por **SAP Joule AI**.

---

## 📸 1. Funcionalidades Clave

Basado en la funcionalidad mostrada en el software de referencia:
1. **Nave Industrial y Racks 3D en Tiempo Real**:
   - 10 pasillos (**Pasillo A** a **Pasillo J**) con letreros industriales en cabecera.
   - 26 columnas y 4 niveles por estantería (1.200 nichos / 2.400 paletas).
   - Zona de **Stage (12 m)** con demarcación de seguridad amarilla.
   - Muelles de **Recepción** (`R1`, `R2`, `R3`) y **Despacho** (`D1`, `D2`, `D3`).
2. **Semáforo Inteligente de Vencimiento**:
   - 🔴 **Vencido** (Rojo): Lotes cuya fecha de vencimiento ya expiró.
   - 🟠 **Crítico** (Naranja): Lotes que vencen dentro del umbral crítico (configurable, ej. &le; 30 días).
   - 🟡 **Por Vencer** (Amarillo): Lotes que vencen en el umbral preventivo (configurable, ej. &le; 90 días).
   - 🟢 **Vigente** (Verde): Lotes en perfecto estado operativo.
   - 🔵 **Sin Fecha** (Azul): Materiales no perecibles (repuestos, insumos, hardware).
   - ⚪ **Vacío** (Gris transparente): Nichos desocupados listos para almacenar paletas de entrada.
3. **Modos de Visualización y Cámaras**:
   - `General`: Vista panorámica 3D isométrica con rotación libre orbital.
   - `Planta`: Vista cenital 2D/3D desde arriba tipo plano de distribución.
   - `Stage y puertas`: Enfoque directo a la zona de muelles R1-R3 y D1-D3.
   - `Entrar al pasillo`: Modo primera persona navegando dentro del pasillo con selector rápido de pasillos A-J.
4. **Interacción y Detalle de Nicho**:
   - **Tooltip flotante en tiempo real**: al pasar el cursor sobre un nicho muestra `Ubicación · Producto · Estado` (ej. `H-01-3 · Jabón líquido 500 ml · Crítico`).
   - **Panel lateral de Nicho**: al hacer clic en un nicho se despliega su ficha completa con SKU, número de lote, stock, fecha de vencimiento, días restantes y botones de acción rápida SAP (Crear OT de traslado, Bloquear lote en SAP S/4HANA).
5. **Carga y Descarga de Excel (SheetJS)**:
   - Botón **Cargar Excel**: importa archivos `.xlsx` o `.csv` reales de inventario y actualiza el 3D al instante.
   - Botón **Datos de Ejemplo**: restaura los 1.200 nichos y 2.400 paletas de prueba.
   - Enlace **Formato del Excel**: descarga la plantilla oficial de inventario lista para completar.
6. **Filtros Dinámicos**:
   - Botón **Solo alertas** (aísla y resalta solo los nichos vencidos y críticos, atenuando los demás).
   - Selector por **Pasillo** (A - J) y por **Nivel** (1 - 4).
   - Buscador inteligente en tiempo real por Producto, SKU, Lote o Ubicación.
7. **Copiloto SAP Joule AI**:
   - Asistente en lenguaje natural con gradiente oficial (`#5D36FF` a `#A100C2`).
   - Permite consultar existencias, aislar lotes críticos, consultar ocupación o dirigir la cámara por comando conversacional.

---

## 🚀 2. Ejecución Rápida

### Opción A: Con el ejecutable por lotes (Windows)
Haz doble clic en:
```bash
start.bat
```
Esto levantará el servidor Node.js y abrirá automáticamente la aplicación en `http://localhost:3000`.

### Opción B: Por línea de comandos
```bash
npm install
npm start
```

---

## 🏛️ 3. Despliegue en SAP Fiori Launchpad

La aplicación incluye el descriptor estándar [`manifest.json`](manifest.json) para integrarse en:
- **SAP BTP Cloud Foundry / Work Zone**
- **SAP S/4HANA On-Premise Launchpad**

### Sincronización de Temas Multi-Iframe (`postMessage`)
Cuando el portal SAP Fiori alterna entre **Morning Horizon** y **Evening Horizon**, emite:
```javascript
iframe.contentWindow.postMessage({ type: 'SET_THEME', theme: 'dark' /* or 'light' */ }, '*');
```
La aplicación escucha este evento y ajusta dinámicamente la paleta CSS Fiori y el fondo WebGL 3D sin recargar la página.

---

## 📁 4. Estructura del Proyecto

```
04. Mapa de almacen en 3d/
│
├── index.html                           # Aplicación principal Fiori 3D
├── server.js                            # Servidor Express y APIs REST
├── start.bat                            # Lanzador rápido de un clic
├── package.json                         # Dependencias y scripts npm
├── manifest.json                        # Descriptor oficial SAP Fiori UI5
│
├── css/
│   └── fiori-3d-warehouse.css           # Estilos Fiori Horizon (Morning/Evening)
│
├── js/
│   ├── warehouse-3d.js                  # Motor 3D Three.js, racks, cámaras y raycasting
│   ├── warehouse-data.js                # Gestor de 1.200 nichos, inventarios y semáforo
│   ├── excel-handler.js                 # Importación/Exportación SheetJS (.xlsx)
│   ├── joule-assistant.js               # Asistente virtual inteligente SAP Joule
│   └── app.js                           # Controlador general y sincronización UI
│
├── assets/                              # Librerías para ejecución 100% offline
│   ├── three.min.js                     # Motor Three.js WebGL
│   ├── OrbitControls.js                 # Controles de órbita y navegación
│   └── xlsx.full.min.js                 # Motor de procesamiento de hojas de cálculo
│
└── template/
    └── Plantilla_Inventario_Almacen_3D.xlsx # Plantilla Excel descargable
```
