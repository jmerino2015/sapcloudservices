# 📋 Guía Paso a Paso: Publicación del Portal SAP Fiori en Google Drive + Google Sheets

Esta guía detalla el procedimiento exacto para implementar la arquitectura de 5 capas mostrada en el diagrama:

```
[1. Google Drive] ➔ [2. Google Sheets DB] ➔ [3. Google Apps Script Backend] ➔ [4. Frontend Fiori] ➔ [5. Usuario Final]
```

---

## 🚀 PASO 1: Crear la Base de Datos en Google Drive (Google Sheets)

1. Abre tu navegador e ingresa a [Google Drive](https://drive.google.com).
2. Haz clic en **Nuevo (+)** ➔ **Hojas de cálculo de Google** (Google Sheets).
3. Nombra la hoja como:
   `SAP_FIORI_DATABASE`

---

## ⚙️ PASO 2: Abrir el Editor de Backend (Google Apps Script)

1. Dentro de tu Google Sheet (`SAP_FIORI_DATABASE`), ve al menú superior:
   👉 **Extensiones** ➔ **Apps Script**
2. Se abrirá una nueva pestaña con el entorno de desarrollo de Google Apps Script.
3. En el panel izquierdo verás un archivo llamado `Código.gs` (o `Code.gs`).

---

## 💻 PASO 3: Pegar el Código del Backend (`Código.gs`)

1. Borra el contenido que viene por defecto en `Código.gs`.
2. Abre el archivo generado en tu proyecto local:
   📁 `google_suite/Codigo.gs`
3. Copia todo su contenido y pégalo en el editor de Apps Script.
4. Haz clic en el ícono de **Guardar** (disquete 💾) o presiona `Ctrl + S`.
5. En la barra superior, en la lista desplegable de funciones, selecciona:
   👉 **`inicializarBaseDeDatos`**
6. Haz clic en **Ejecutar** (botón ▶️):
   - Google te pedirá autorizar los permisos de lectura/escritura en tu hoja. Haz clic en *Revisar permisos* ➔ selecciona tu cuenta ➔ *Avanzado* ➔ *Ir a proyecto (no seguro)* ➔ *Permitir*.
7. ¡Listo! Vuelve a tu Google Sheet y verás creadas automáticamente las 4 tablas con sus datos:
   - `TB_SALES_ORDERS` (Pedidos de venta, montos EUR, cumplimiento)
   - `TB_WMS_STOCK` (Stock físico multi-sede, ocupabilidad)
   - `TB_SOLMAN_REQ` (Requerimientos y tickets SolMan 7.2)
   - `TB_FUE_USUARIOS` (Control de licencias y usuarios FUE)

---

## 🎨 PASO 4: Crear el Frontend (`Index.html`)

1. En el editor de Google Apps Script, en el menú lateral izquierdo haz clic en el botón **(+)** junto a *Archivos*.
2. Selecciona **HTML**.
3. Nómbralo exactamente:
   `Index` *(Google le añade la extensión .html automáticamente)*.
4. Borra el código inicial de `Index.html`.
5. Abre el archivo de tu proyecto local:
   📁 `google_suite/Index.html`
6. Copia todo su contenido y pégalo en el archivo `Index.html` de Google Apps Script.
7. Guarda los cambios (`Ctrl + S`).

---

## 🌐 PASO 5: Desplegar la Aplicación Web (Hosting en Google)

1. En la esquina superior derecha del editor de Apps Script, haz clic en el botón azul:
   👉 **Implementar** ➔ **Nueva implementación** (o *Deploy* ➔ *New deployment*).
2. Haz clic en el ícono de engranaje (⚙️) a la izquierda de *Seleccionar tipo* y elige:
   👉 **Aplicación web**.
3. Llena los campos de configuración:
   * **Descripción:** `SAP Fiori Launchpad - Producción`
   * **Ejecutar como:** `Yo (tu_correo@gmail.com)`
   * **Quién tiene acceso:** `Cualquier persona` *(para que cualquier cliente o dispositivo pueda entrar sin restricciones)*.
4. Haz clic en el botón azul **Implementar**.
5. Se generará una URL pública oficial de Google, del tipo:
   🔗 **`https://script.google.com/macros/s/AKfycb.../exec`**

---

## 📱 PASO 6: Acceso del Usuario Final

- Copia la URL generada y ábrela en cualquier navegador (Google Chrome, Edge, Safari o desde un teléfono móvil).
- Al hacer clic en **"+ Crear Pedido (Sheets DB)"**, los nuevos pedidos se guardarán **directamente en tiempo real en tu Google Sheets de Google Drive**.
- Los KPIs, pedidos y stock se leerán de forma dinámica desde tu hoja de cálculo.
