---
description: Reglas y directrices obligatorias de Clean Core y arquitectura ABAP RAP / SAP Fiori
---

# Reglas de Proyecto: Clean Core, RAP y SAP Fiori

Al trabajar en este proyecto o en futuros desarrollos de SAP Fiori, cumple con las siguientes directrices:

## 1. Clean Core & ABAP Cloud
- Toda implementación ABAP debe cumplir con el dialecto **ABAP Cloud**.
- Utiliza únicamente APIs y CDS views con contrato de liberación C1.
- No accedas directamente a tablas estándar de SAP (MARA, VBAK, BKPF, etc.) mediante sentencias nativas `SELECT` o `UPDATE`; utiliza las vistas VDM estándar liberadas (`I_Product`, `I_SalesOrder`, etc.) o Business Object Interfaces.

## 2. Modelado de Datos CDS & Metadata Extensions
- Emplea la sintaxis moderna `define [root] view entity`.
- Mantén las definiciones CDS limpias de anotaciones `@UI.*`. Toda anotación visual debe ir en archivos Metadata Extension (`.mde`).
- Configura siempre campos de auditoría (`CreatedAt`, `CreatedBy`, `LastChangedAt`, `LastChangedBy`) y el campo de concurrencia ETag (`LocalLastChangedAt`).

## 3. Comportamiento RAP & Transaccionalidad
- Toda aplicación con capacidad de edición debe implementar el contrato `managed with draft` salvo requerimientos específicos de fuentes externas (`unmanaged`).
- Separa la lógica de determinaciones (cálculo de valores por defecto o totales) de las validaciones (verificación de consistencia que puede rechazar el guardado).
- Expón los servicios mediante protocolos **OData V4**.

## 4. Frontend SAP Fiori
- Privilegia Fiori Elements cuando los requerimientos se ajusten a floorplans estándar (List Report, Object Page).
- En desarrollo SAPUI5 Freestyle, aplica arquitectura modular MVC, carga asíncrona, descriptores `manifest.json` y bundles de internacionalización `i18n`.
- Aplica el sistema de diseño visual **SAP Fiori Horizon** (Morning Horizon / Evening Horizon).

## 5. Sub-agentes Disponibles
- `cds_architect`: Para tareas de modelado semántico de datos, CDS view entities y MDE.
- `rap_engineer`: Para lógica transaccional, BDEF, EML, validaciones y servicios OData V4.
- `fiori_ui_expert`: Para vistas Fiori Elements, SAPUI5 Freestyle, manifest.json y controladores.
- `fiori_qa_deployer`: Para auditorías ATC, pruebas unitarias ABAP Unit / OPA5 y configuración de Launchpad.
