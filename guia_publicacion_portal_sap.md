# 🚀 Guía de Publicación & Demostración para Clientes — Portal de Soluciones SAP Fiori

---

## 📦 1. Entregable Listo para Publicar y Compartir

Se ha generado el paquete comprimido autónomo listo para su entrega o despliegue:
* **Archivo:** `Portal_de_Soluciones_SAP_Fiori.zip`
* **Ubicación local:** `Portal_de_Soluciones_SAP_Fiori.zip`

---

## ⚡ 2. Cómo Ejecutar la Demo en 1 Clic (Local / Presencial con Cliente)

1. Extrae el archivo ZIP en cualquier laptop o servidor (o abre la carpeta actual del proyecto).
2. Haz **doble clic** en el archivo:
   👉 **`start-portal.bat`**
3. El script iniciará automáticamente el servidor HTTP local y **abrirá el navegador de inmediato** en el **Launchpad Principal SAP Fiori**:
   🌐 `http://localhost:8080/index.html`

---

## 🌐 3. Opciones de Publicación Web (Para Demo Remota o Producción)

Si deseas publicar la aplicación en un enlace Web accesible por el cliente desde cualquier lugar:

### Opción A: Despliegue Express Gratis (Vercel / Netlify / Render)
1. Descomprime el ZIP o sube la carpeta a un repositorio GitHub.
2. Conecta tu cuenta con Vercel o Netlify.
3. Selecciona la carpeta y haz clic en **Deploy**. Tendrás un enlace del tipo:
   `https://portal-sap-fiori-droid.vercel.app`

### Opción B: Servidor de la Empresa / Servidor Web (Node.js / IIS / Apache / Nginx)
* **Node.js (Cualquier SO):** Ejecuta `node server.js` en el servidor y configura la redirección de puerto 8080.
* **IIS (Windows Server):** Copia los archivos extraídos en `C:\inetpub\wwwroot\portal-fiori` y crea una aplicación web orientada a `index.html`.

### Opción C: SAP Business Technology Platform (SAP BTP)
1. Importa las carpetas de `apps/` en SAP Business Application Studio (BAS).
2. Ejecuta `mbt build` para generar el archivo MTAR de la solución.
3. Despliega con `cf deploy` en la subcuenta de SAP BTP Cloud Foundry.

---

## 📱 4. Funcionalidades Clave Incluidas en el Paquete Demo

### 1. 📑 Entregas a Rendir & Cajas Chicas (`apps/08_entregas_a_rendir`)
* **Flujo de Proceso Visual Dinámico (10 Pasos FI):** Diagrama interactivo con nodos conectados en tiempo real.
* **Escáner DROID OCR con PDFs Pre-cargados:** Extracción inteligente de RUC, IGV, Montos, Sociedad y Nota de Ingreso MIGO.
* **Dashboard KPIs de Gestión:** Métricas de tiempo de cierre, monto rendido, saldos y validación SUNAT.
* **Extensión por Criticidad (Req. N° 3):** Desembolso express para situaciones urgentes en Cajas Chicas.
* **Liquidación PV SD (Req. N° 4):** Compensación de ventas con Cuenta Puente FI (104102).
* **Simulador Modo Celular:** Interfaz responsive para demostraciones en Smartphone.

### 2. 🏢 Portal de Proveedores (`apps/07_portal_proveedores`)
* **DROID IA (Asistente Virtual):** Cuadro de consulta de **ancho completo ($100\%$)** y lectura inteligente de facturas, órdenes y pagos.
* **Pre-Registro de Facturas con OCR:** Lectura de comprobantes XML/PDF y precarga de sellos de almacén/tienda.
* **Notas de Crédito (Req. N° 1):** Gestión de Devolución de Stock (Mercadería) y Ajuste de Importe.

### 3. 🛒 Resto de Aplicaciones Fiori del Portal
* Portal Comercial, Control FUE, SAP PM Mobile, Logística e Inventario, SAP WMS - SRM FIORI y Registro de Asistencia.
