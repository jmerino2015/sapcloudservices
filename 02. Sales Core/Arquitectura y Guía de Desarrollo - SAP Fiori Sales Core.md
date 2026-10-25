Actúa como un Arquitecto de Software Enterprise experto en soluciones CRM, SAP Cloud for Customer (C4C), SAP Fiori y Supabase (PostgreSQL).

Tu objetivo es generar un archivo Markdown (.md) técnico y estructurado de forma exhaustiva, que documente todas las funcionalidades requeridas para construir una aplicación CRM moderna basada en SAP Fiori y conectada a Supabase como backend.

El documento debe incluir la arquitectura, módulos funcionales basados en la documentación estándar de SAP C4C, el modelo de datos relacional para Supabase (tablas, columnas, tipos de datos, relaciones y datos de prueba) y la estructura UI/UX siguiendo SAP Fiori Launchpad.

Estructura requerida para el documento Markdown:

# DOCUMENTO DE ESPECIFICACIÓN TÉCNICA Y FUNCIONAL: CRM SAP FIORI CON SUPABASE

## 1. RESUMEN EJECUTIVO Y ARQUITECTURA GENERAL
- Breve descripción del proyecto (CRM completo con experiencia Fiori / UX basado en SAP C4C).
- Diagrama o explicación de arquitectura de 3 capas:
  - Frontend: SAP Fiori (UI5 / Fiori Elements).
  - Backend / Database: Supabase (Postgres, Row Level Security, Realtime, REST/GraphQL APIs).
  - Integración: Apis para integración ERP/Ariba/Sistemas Externos.

## 2. MÓDULOS Y FUNCIONALIDADES DETALLADAS (BASADO EN SAP C4C)
Detalla para cada módulo las vistas de SAP Fiori (Work Centers, List Report Pages, Object Pages) y los procesos de negocio:

### 2.1. Gestión de Cuentas y Contactos (Accounts & Contacts)
- Cuentas Corporativas e Individuales.
- Jerarquía de Cuentas, Contactos vinculados y Matriz de Relaciones.
- Vista 360° del Cliente en SAP Fiori (historial de interacciones, ventas, tickets).

### 2.2. Gestión Comercial y Ventas (Sales & Opportunity Management)
- **Leads / Prospectos:** Captura, calificación y conversión a Oportunidad.
- **Oportunidades (Opportunities):** Fases de venta, probabilidad, valor estimado, pipeline visual.
- **Cotizaciones / Ofertas (Sales Quotes):** Creación de cotizaciones, ítems, precios, flujo de aprobación.
- **Pedidos de Venta (Sales Orders):** Registro e integración con inventarios.

### 2.3. Gestión de Servicio al Cliente (Customer Service & Support)
- **Tickets de Soporte (Service Tickets):** Categorización, prioridades y SLAs (Service Level Agreements).
- **Gestión de Garantías y Contratos de Servicio.**
- **Base de Conocimiento (Knowledge Base):** Resolución de incidencias comunes.

### 2.4. Marketing y Actividades (Marketing & Activities)
- **Campañas de Marketing:** Segmentación y seguimiento de conversión.
- **Gestión de Actividades:** Tareas, llamadas, correos y visitas en terreno (Calendar & Task Views).

### 2.5. Analítica y Dashboards (Analytics & Reports)
- KPI Cards en SAP Fiori Launchpad.
- Pipeline de ventas, rendimiento por representante y tickets abiertos por prioridad.

---

## 3. MODELO DE BASE DE DATOS EN SUPABASE (POSTGRESQL)

Proporciona los scripts DDL en SQL para crear las tablas en Supabase, incluyendo claves primarias, claves foráneas, restricciones, índices y esquemas RLS (Row Level Security).

Las tablas mínimas a definir son:
1. `accounts` (Cuentas/Empresas)
2. `contacts` (Contactos)
3. `leads` (Prospectos)
4. `opportunities` (Oportunidades)
5. `opportunity_items` (Líneas de Oportunidad)
6. `sales_quotes` (Cotizaciones)
7. `sales_quote_items` (Líneas de Cotización)
8. `service_tickets` (Tickets de Soporte)
9. `activities` (Tareas, Llamadas, Reuniones)
10. `products` (Catálogo de Productos)

---

## 4. DATOS SEMILLA / DUMMY DATA (INSERT STATEMENTS)

Proporciona scripts SQL `INSERT` con datos de prueba realistas para poblar cada una de las tablas en Supabase (mínimo 3 a 5 registros por tabla) para permitir pruebas inmediatas.

---

## 5. MAPEO DE UI SAP FIORI CON SUPABASE
Describe cómo las vistas estándar de SAP Fiori (List Report, Object Page, Analytical Dashboard) consumirían las tablas de Supabase a través de consultas / vistas REST de Supabase.