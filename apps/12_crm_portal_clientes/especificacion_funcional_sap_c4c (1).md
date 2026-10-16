# Especificación Funcional SAP - Portal de Cliente (SAP C4C)

Para diseñar un portal de autogestión de clientes (Customer Portal) de alto valor comercial, integrado con la suite SAP C4C (SAP Sales & Service Cloud) y SAP S/4HANA, la especificación debe centrarse en la omnicanalidad y el autoservicio para reducir costos operativos y acelerar ventas. 

## 1. Datos del Documento

| Campo | Detalle |
| :--- | :--- |
| **Proyecto** | Implementación de Portal B2B/B2C Integrado a SAP C4C |
| **Módulos SAP** | SAP Cloud for Customer (C4C), SAP BTP, SAP ERP (S/4HANA) |
| **Objetivo** | Centralizar operaciones comerciales y de postventa en un único punto de contacto digital. |

---

## 2. Requerimientos y Procesos Funcionales (Alcance C4C)

### 2.1. Gestión de Identidad y Perfil (Customer Onboarding)
El portal debe manejar roles jerárquicos (para entornos B2B) o perfiles unificados (B2C).
* **Autenticación:** Inicio de sesión único (SSO) mediante SAP Cloud Identity Services.
* **Gestión de Jerarquías (B2B):** Creación de roles de "Administrador de Cuenta", "Comprador" y "Visualizador" para delegar permisos dentro de la empresa cliente.
* **Actualización de Datos:** Sincronización bidireccional de la ficha del cliente (Business Partner) entre el Portal, C4C y el ERP.

### 2.2. Módulo de Ventas (Sales & Commerce)
El objetivo es acelerar el embudo de conversión conectando el interés directamente con los ejecutivos en C4C.
* **Catálogo y Solicitud de Cotización:** El cliente selecciona productos y solicita precios. Esto detona la creación automática de un *Lead* o *Sales Quote* en SAP C4C.
* **Historial de Pedidos (Order Tracking):** Tablero visual para consultar estados de pedidos (Creado, En Preparación, Despachado). Requiere lectura directa a SAP S/4HANA.
* **Estado de Cuenta y Facturación:** Descarga de facturas (PDF) e historial de pagos en tiempo real.

### 2.3. Módulo de Servicio al Cliente (C4C Service)
Orientado a desviar llamadas del Call Center hacia la resolución digital.
* **Creación y Tipificación de Tickets:** Formularios dinámicos para Reclamos, Garantías o Consultas. Creación del *Service Ticket* en C4C con asignación inteligente a colas de atención.
* **Seguimiento y SLAs:** Vista de estado del ticket, semaforización de tiempos de resolución y registro de interacciones (comentarios/adjuntos bidireccionales).
* **Base de Conocimientos (Knowledge Base):** Buscador de artículos de ayuda, manuales y FAQs alimentado directamente desde la base de conocimientos de SAP C4C.

---

## 3. Matriz de Integración (Interfaces)

Para que el portal aporte valor en tiempo real, se debe orquestar mediante **SAP Cloud Platform Integration (SAP CPI/Integration Suite)**.

| Proceso (Portal) | Destino SAP | Tipo de Interfaz (API) | Frecuencia |
| :--- | :--- | :--- | :--- |
| Creación de Lead/Oportunidad | SAP C4C | OData V2/V4 (OpportunityCollection) | Tiempo Real (Síncrono) |
| Creación/Actualización de Ticket | SAP C4C | OData (ServiceRequestCollection) | Tiempo Real (Síncrono) |
| Seguimiento de Pedidos/Facturas | SAP S/4HANA | REST/SOAP (Sales Order Read) | Síncrono (Lectura bajo demanda) |
| Actualización Maestro de Clientes | C4C y S/4HANA | SOAP (BusinessPartnerReplication) | Asíncrono |

---

## 4. Criterios de Aceptación y UX
* **Diseño:** Interfaz desarrollada en Angular/React o SAP UI5 (Fiori) completamente *responsive* (adaptable a móviles).
* **Rendimiento:** Las consultas de lectura (ej. estado de tickets) deben cargar en menos de 2 segundos.
* **Trazabilidad:** Toda interacción (login, creación de cotización, visualización de documento) debe generar una actividad registrada en el historial del cliente dentro de SAP C4C para visibilidad del vendedor.
