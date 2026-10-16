# 🌐 Guía de Base de Datos Pública en la Nube (SAP Clean Core)

Esta solución permite que el **Portal de Aplicaciones SAP Fiori** funcione conectado a una **Base de Datos Pública en la Nube (PostgreSQL)**, accesible 24/7 por Internet para demostraciones remotas, presenciales o despliegues en la nube.

---

## ⚡ 1. Arquitectura de Conexión Pública

```mermaid
flowchart LR
    A["Cualquier Dispositivo / Demo<br/>(Laptop, Móvil, Cloud)"] --> B["Portal SAP Fiori<br/>(Node.js / OData V4)"]
    B -->|"SSL Seguro (Puerto 5432 / 6543)"| C["Base de Datos Pública Cloud<br/>(Supabase / Neon / AWS / Render)"]
    C --> D["Tablas S/4HANA VDM<br/>(ZTB_WH_SEDE, ZTB_BINS, ZTB_FUE...)"]
```

---

## 🚀 2. Cómo Obtener una Base de Datos Pública Gratis en 2 Minutos

### Opción A: Supabase (Recomendado)
1. Ingresa a [https://supabase.com](https://supabase.com) e inicia sesión con GitHub o Google.
2. Crea un nuevo proyecto (ej. `sap-fiori-portal-db`). Elige tu región más cercana (ej. `us-east-1` o `sa-east-1`).
3. Define una contraseña segura para tu base de datos (ej. `MiClaveSap2026!`).
4. Ve a **Project Settings** (⚙️) $\longrightarrow$ **Database** $\longrightarrow$ **Connection string** $\longrightarrow$ pestaña **URI**.
5. Copia la cadena generada con el modo `Transaction Pooler` o `Direct Connection`:
   ```env
   DATABASE_URL=postgresql://postgres.xyz:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
   ```

### Opción B: Neon Serverless PostgreSQL
1. Ingresa a [https://neon.tech](https://neon.tech) y crea una cuenta gratuita.
2. Crea un proyecto. Neon te dará de inmediato una URL con SSL activo:
   ```env
   DATABASE_URL=postgresql://user:pass@ep-cool-flower.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

---

## 🔧 3. Configuración en la Aplicación

1. Abre el archivo [`.env`](file:///d:/01.%20Portal%20de%20Aplicaciones%20-%20AGV/.env) en la raíz del proyecto.
2. Pega tu cadena de conexión en la variable `DATABASE_URL`:
   ```env
   DATABASE_URL=postgresql://postgres:MiPasswordSeguro@db.supabase.co:5432/postgres?sslmode=require
   ```
3. Guarda el archivo `.env`.
4. Ejecuta en terminal:
   ```bash
   npm run db:setup
   ```
   *El conector creará automáticamente todas las tablas Clean Core (`ZTB_*`) y precargará los datos maestros de demostración.*

---

## 📱 4. Demostraciones Públicas por Internet

Para hacer las demos públicas accesibles desde cualquier navegador o smartphone en el mundo:

1. Ejecuta el archivo:
   👉 **`start-publico-google.bat`**
2. Cloudflare generará un enlace público HTTPS seguro (ej. `https://random-fiori-tunnel.trycloudflare.com`).
3. Comparte ese enlace con tus clientes. Todas las lecturas, creaciones y modificaciones se guardarán directamente en tu base de datos pública en la nube.

---

## 🛡️ 5. Tablas Persistentes Clean Core S/4HANA (Esquema ZTB_*)

| Tabla | Objeto de Negocio SAP | Módulo |
| :--- | :--- | :--- |
| `ztb_wh_sede` | Torre de Control WMS (LX03, LT23, MB51, VL06F) | WMS / Logística |
| `ztb_warehouses` | Maestro de Almacenes | SAP WM / EWM |
| `ztb_storage_types` | Tipos y Secciones de Ubicación | SAP WM / EWM |
| `ztb_bins` | Ubicaciones Físicas (Bins) | SAP WM / EWM |
| `ztb_materials` | Maestro de Materiales | SAP MM |
| `ztb_stock` | Stock por Lote y Ubicación | SAP MM-IM |
| `ztb_transfer_orders` | Órdenes de Traslado (OTs) | SAP LE-WM |
| `ztb_yard_locations` | Muelles y Bahías de Patio | Yard Management |
| `ztb_yard_vehicles` | Vehículos y Citas de Transporte | Yard Management |
| `ztb_fue_users` | Usuarios y Optimización Licencias FUE | Control FUE S/4HANA |
| `ztb_users` | Autenticación y Perfiles Launchpad | SAP Fiori Security |
