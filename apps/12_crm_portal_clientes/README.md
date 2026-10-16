# SAP Fiori Customer Portal (SAP C4C & SAP S/4HANA)

Aplicación web empresarial desarrollada con la arquitectura oficial **SAPUI5 / OpenUI5**, diseñada para autogestión de clientes B2B/B2C omnicanal, conectada a **SAP Sales & Service Cloud (SAP C4C)**, **SAP S/4HANA ERP** y orquestada mediante **SAP BTP Integration Suite (CPI)**.

---

## 🚀 Look & Feel y Estándares SAP

* **Tema Visual:** SAP Fiori *Morning Horizon* (`sap_horizon`).
* **Tipografía Oficial:** SAP 72 (`font-family: "72", "72full", Arial, sans-serif`).
* **Iconografía:** Catálogo estándar oficial `sap-icon://*`.
* **Componentes UI5:** `sap.tnt.ToolPage`, `sap.m.ShellBar`, `sap.m.IconTabBar`, `sap.m.GenericTile`, `sap.m.Table`, `sap.m.FeedInput`, `sap.m.FeedListItem`, `sap.ui.layout.form.SimpleForm`, `sap.m.Dialog`, `sap.m.MessageBox`, etc.

---

## 📋 Módulos y Funcionalidades Implementadas

### 1. Shell & Navegación SAP Fiori
* **ShellBar con Selector de Rol Jerárquico B2B**:
  * Permite alternar en tiempo real entre los roles:
    * 👑 **Administrador de Cuenta**: Control total, autorización de cotizaciones, gestión de usuarios B2B y sincronización SOAP.
    * 🛒 **Comprador**: Catálogo de productos, creación de cotizaciones y tickets de soporte.
    * 👁️ **Visualizador**: Consulta en modo solo lectura de pedidos, facturas y SLAs.
* **Centro de Notificaciones**: Alertas dinámicas con badge de conteo para pedidos despachados, tickets atendidos y facturas emitidas.
* **Barra Lateral Responsive (`sap.tnt.SideNavigation`)**: Menú colapsable con accesos a todos los módulos.

### 2. Dashboard Principal
* **Ficha de Empresa & Crédito**: Razón social, Nº Business Partner, línea de crédito autorizada y crédito disponible.
* **KPIs Fiori (`sap.m.GenericTile`)**: Pedidos activos, cotizaciones C4C, tickets de servicio y facturas pendientes.
* **Accesos Rápidos**: Botones de acción inmediata para cotizar, rastrear pedidos, emitir tickets y descargar facturas.
* **Listas de Resumen**: Tablas directas de pedidos en tránsito y tickets con alerta de SLA.

### 3. Módulo de Ventas & Comercio (Sales & Commerce)
* **Catálogo & Cotizaciones C4C**:
  * Buscador en tiempo real por SKU y texto, filtro por categoría de productos.
  * Tarjetas de producto con precio de lista, stock y tiempo de despacho.
  * Selector de cantidades con `StepInput` y Carrito de Cotización flotante.
  * **Acción "Solicitar Cotización Oficial"**: Detona la creación automática de un *Lead / Sales Quote* en SAP C4C (`OpportunityCollection`), asignando un código oficial de cotización y notificando al ejecutivo de cuenta.
  * Historial de cotizaciones emitidas y sus estados de aprobación.
* **Seguimiento de Pedidos (SAP S/4HANA Order Tracking)**:
  * Listado de órdenes de venta con estados (*Creado*, *En Preparación*, *Despachado*, *Entregado*).
  * **Stepper Visual de Progreso**: Muestra el flujo de despacho en bodega, transportista (Starken, DHL) y número de guía.
  * Desglose de posiciones, cantidades y precios.
* **Estado de Cuenta & Facturas**:
  * Resumen financiero de crédito y saldo pendiente.
  * Tabla de facturas con semáforo de vencimiento (*Pagada*, *Pendiente*, *Vencida*).
  * **Visor de Factura Digital (PDF)**: Modal interactivo con diseño tributario oficial, cálculo de IVA (19%), folio DTE y opciones de descarga/impresión.

### 4. Módulo de Servicio al Cliente (SAP C4C Service Cloud)
* **Formulario Dinámico de Creación de Tickets (`ServiceRequestCollection`)**:
  * Tipificación: *Garantía de Producto (RMA)*, *Reclamo Comercial*, *Consulta Técnica*.
  * Asignación automática de colas C4C (*Garantías & Calidad*, *Facturación*, *Soporte Técnico*).
  * Prioridades con cálculo automático de SLA: *Urgente (4h)*, *Alta (12h)*, *Media (24h)*, *Baja (48h)*.
  * Vinculación con Pedidos de Venta S/4HANA y adjunto de fotografías/informes.
* **Semaforización SLA & Chat Bidireccional**:
  * Semáforos visuales (*Dentro de SLA*, *SLA por Vencer*, *SLA Vencido*).
  * **Timeline / Feed Interactivo**: Permite al cliente chatear directamente con el especialista de C4C, agregando respuestas y adjuntos en tiempo real.
* **Base de Conocimientos (Knowledge Base & FAQs)**:
  * Buscador interactivo de procedimientos y preguntas frecuentes.

### 5. Ficha de Cliente y Jerarquías B2B
* Ficha de datos maestros de Business Partner (`BP-10004928`).
* Botón **"Sincronizar con SAP C4C & ERP"** que simula la replicación bidireccional vía interfaz SOAP CPI (`BusinessPartnerReplicationIn`).
* Gestión de colaboradores de la empresa: invitar nuevos usuarios, editar roles y delegar permisos.
* Listado de direcciones y plantas de entrega.

### 6. Consola de Integración SAP CPI & Auditoría
* Monitoreo de latencia en tiempo real (< 200 ms, cumpliendo con el criterio de aceptación < 2s).
* Matriz de integración con inspección de payloads JSON / OData / SOAP.
* **Log de Auditoría C4C**: Registro en tiempo real de todas las interacciones del usuario en el portal para visibilidad del equipo comercial en C4C.

---

## 💻 Cómo Ejecutar la Aplicación

### Opción 1: Con Python (Recomendado)
Ejecutar en la terminal:
```bash
python server.py
```
O simplemente hacer doble clic en el archivo **`run_portal.bat`**. La aplicación se abrirá automáticamente en tu navegador en `http://localhost:8080`.

### Opción 2: Con cualquier servidor web local
Puedes servir la carpeta del proyecto con cualquier servidor HTTP (ej. extensión Live Server de VS Code, http-server de Node, etc.) abriendo `index.html`.
