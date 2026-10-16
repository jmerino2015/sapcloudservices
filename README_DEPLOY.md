# 🚀 Guía de Empaquetado y Despliegue en Servidor — Portal de Soluciones SAP Fiori

Este paquete contiene la suite completa del **Portal de Soluciones SAP Fiori** con arquitectura **Clean Core**, backend emulado en **Node.js** con APIs REST / OData V4 y las **15 soluciones integradas** listas para presentación y demo ejecutiva.

---

## 📦 Contenido del Paquete de Producción

| Componente | Descripción |
| :--- | :--- |
| **`index.html`** | Launchpad Shell principal con SAP Joule AI, temas Horizon (Morning/Evening) y visor modal. |
| **`server.js`** | Servidor HTTP de alto rendimiento (sin dependencias externas pesadas) con APIs WMS, KPIs y FUE. |
| **`apps/`** | 15 aplicaciones empresariales completas (incluyendo la nueva Torre de Control WMS multi-sede). |
| **`src/`** | Artefactos ABAP Cloud Clean Core (CDS View Entities, BDEF, Behavior Pools, MDE y Tests). |
| **`docs/`** | Informes de QA Clean Core, matrices de configuración FLP y handoffs técnicos. |
| **`Dockerfile` / `docker-compose.yml`** | Configuración lista para despliegue en contenedores Docker. |
| **`ecosystem.config.js`** | Configuración PM2 para servidores Linux/Windows con reinicio automático. |
| **`manifest.yml`** | Descriptor Cloud Foundry para despliegue directo a SAP BTP. |

---

## 🌐 OPCIÓN 1: Servidor Linux / Cloud VM (Ubuntu, Debian, AWS EC2, Azure, DigitalOcean)

### Requisitos Previos:
- Node.js v18 o superior instalado.

### Pasos:
1. **Subir y descomprimir los archivos:**
   ```bash
   # En tu servidor remoto
   mkdir -p /opt/fiori-portal
   cd /opt/fiori-portal
   unzip portal-soluciones-fiori-demo.zip
   ```

2. **Otorgar permisos de ejecución al script:**
   ```bash
   chmod +x start.sh
   ```

3. **Ejecutar directamente:**
   ```bash
   ./start.sh
   ```

4. *(Recomendado para producción)* **Ejecutar en segundo plano con PM2:**
   ```bash
   npm install -g pm2
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

La aplicación estará accesible en: `http://TU_IP_O_DOMINIO:8080`

---

## 🐳 OPCIÓN 2: Despliegue con Docker & Docker Compose (Cualquier SO)

Ideal para servidores con Docker instalado. No requiere instalar Node.js en el host.

### Con Docker Compose (Un solo comando):
```bash
docker compose up -d --build
```

### O con Docker estándar:
```bash
docker build -t sap-fiori-portal:latest .
docker run -d -p 8080:8080 --name sap-portal --restart always sap-fiori-portal:latest
```

Verificar estado:
```bash
docker ps
docker logs -f sap-fiori-solution-portal
```

---

## ☁️ OPCIÓN 3: Despliegue en SAP BTP (Cloud Foundry)

1. Iniciar sesión en Cloud Foundry CLI:
   ```bash
   cf login -a https://api.cf.<region>.hana.ondemand.com
   cf target -o <tu-organizacion> -s <tu-espacio>
   ```

2. Desplegar la aplicación:
   ```bash
   cf push
   ```

Cloud Foundry leerá automáticamente el archivo `manifest.yml` y asignará una URL pública segura (HTTPS).

---

## 🖥️ OPCIÓN 4: Servidor Windows / Entorno Local

1. Descomprimir el archivo `.zip`.
2. Hacer doble clic en **`start.bat`**.
3. El portal se abrirá en `http://localhost:8080`.

---

## 🔑 Credenciales para la Demo

- **Usuario:** `admin` (o `admin@fiori-portal.com`)
- **Contraseña:** `admin` (o `Admin1234!`)
- **Rol:** Administrador General SAP / WMS Lead

---

## 🛡️ Puertos y Firewall

Asegúrate de que el puerto **8080** (o el que configures mediante la variable de entorno `PORT`) esté habilitado en el Security Group de AWS / Firewall de Azure / UFW de Ubuntu:

```bash
# En Ubuntu con UFW
sudo ufw allow 8080/tcp
sudo ufw reload
```
