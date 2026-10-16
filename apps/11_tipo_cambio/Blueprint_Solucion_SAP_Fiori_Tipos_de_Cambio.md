# BLUEPRINT ARQUITECTÓNICO Y PMO: SOLUCIÓN SAP FIORI DE GESTIÓN DE TIPOS DE CAMBIO Y VALORIZACIÓN SCM (MM/SD/FI)
**Rol:** Consultor SAP Funcional SCM (ECC 7.7 & S/4HANA) | PMO & Arquitecto Fiori  
**Alcance:** Integración Financiera, Automatización de Mercados, Gobierno de Datos Logísticos y Prototipado UX

---

## 1. RESUMEN EJECUTIVO Y MARCO DE REFERENCIA PMO
La correcta gestión de los tipos de cambio (`TCURR` / `OB08`) en entornos SAP multisociedad y multi-país (con énfasis en Latinoamérica) no es exclusiva de las áreas de Finanzas; representa un pilar crítico de control en la cadena de abastecimiento y valoración de inventarios (módulo MM). Desviaciones, paridades incorrectas (`OBBS`) o la ausencia de tasas regulatorias locales (como `ZSUN` o `ZBAN`) provocan fallos en cadena al ejecutar operaciones logísticas diarias:
*   **Entradas de Mercancías (`MIGO`):** Generan diferencias de cambio indeseadas en la valoración de stocks.
*   **Verificación de Facturas (`MIRO`):** Bloqueos de pagos por discrepancias cambiarias frente a órdenes de compra.
*   **Esquemas de Cálculo de Precios (ej. `ZM0000` con IGV y `ZM0002` para importaciones con aranceles y fletes multidivisa):** Distorsión de márgenes y costos de reposición.

Este documento consolida la arquitectura técnica, la parametrización de base, los flujos de procesos y el diseño funcional de una **Aplicación Nativa SAP Fiori** para el control integral de divisas, diseñada para ser presentada como maqueta funcional (*Mockup*) ante clientes corporativos.

---

## 2. ARQUITECTURA DE CONFIGURACIÓN BASE SAP (CORE BACKEND)
Para que el Front-End Fiori y las interfaces de mercado operen de manera armónica, el motor NetWeaver exige la siguiente parametrización estándar (vía transacción `SPRO`):

### 2.1. Tipos de Cotización (`OB07` / Tabla `TCURV`)
*   `M`: Cotización media estándar para conversiones generales de contabilidad general (FI/CO).
*   `G` / `B`: Cotizaciones bancarias de compra y venta.
*   `ZSUN` (Ej. Perú) / `ZBAN`: Tipos de cotización regulatorios obligatorios para asegurar que los pedidos de compras (`ME21N`) y esquemas de precios recojan la tasa legal de la entidad tributaria oficial y no una tasa comercial genérica.

### 2.2. Factores de Conversión y Mandantes (`OBBS` / Tabla `TCURF`)
*   Mantenimiento de relaciones de proporción (1:1 o 1:1000) para evitar desbordamientos aritméticos en monedas con alta fluctuación.
*   Control estricto en la transacción `OY04` sobre las posiciones decimales de las monedas (`TCURX`), evitando errores de redondeo en documentos logísticos históricos.

---

## 3. ARQUITECTURA DE SOLUCIONES DE MERCADO Y PROVEEDORES
Ante el riesgo operativo de la carga manual diaria en la `OB08`, el mercado global ofrece alternativas que se pueden acoplar al ecosistema SAP mediante BTP o conectores certificados:

1.  **SAP Market Rates Management (Refinitiv Option):** Servicio SaaS en SAP BTP que automatiza la obtención y carga directa de cotizaciones en S/4HANA o ECC.
2.  **OANDA Exchange Rates API & SAP Connector:** Conector certificado de alta velocidad para NetWeaver que inserta tasas spot e históricas auditadas directamente en `TCURR`.
3.  **Integración Vía SAP Integration Suite (CPI) con Bancos Centrales:** Arquitectura híbrida orientada a Latinoamérica para consumir automáticamente los Web Services oficiales de reguladores (SUNAT, Banxico, BCRA, DIAN) e inyectarlos mediante la BAPI `BAPI_EXCHANGERATE_CREATE`.
4.  **Plataformas de Tesorería (TMS) - Kyriba / Serrala:** Soluciones avanzadas para gestión de riesgos de cambio (*hedging*) y conciliación bancaria multidivisa.

---

## 4. DISEÑO DE LA APLICACIÓN SAP FIORI (FRONT-END & UX)

La solución se concibe como una aplicación **SAP Fiori Elements / Analytical List Page** integrada en el SAP Fiori Launchpad, consumiendo servicios OData expuestos desde el backend S/4HANA o ECC.

### 4.1. Estructura del Dashboard Fiori
```
+-----------------------------------------------------------------------------------+
| SAP FIORI LAUNCHPAD: CONTROL CENTRAL DE TIPOS DE CAMBIO Y VALORIZACIÓN SCM       |
+-----------------------------------------------------------------------------------+
| [ KPI 1: Estado de Sincronización ] [ KPI 2: Desviación vs Mercado ] [ Alertas ]    |
|        100% Actualizado                       +0.02% (Óptimo)             0 Bloqueos|
+-----------------------------------------------------------------------------------+
| FILTROS GLOBAL : [ Sociedad ] [ Tipo Cotización (M, ZSUN) ] [ Rango Fechas ]      |
+-----------------------------------------------------------------------------------+
| SECCIÓN 1: MONITOR Y GESTIÓN DE COTIZACIONES DIARIAS (Smart Table - Editable Grid)|
|  - Moneda Origen | Moneda Destino | Tipo | Compra | Venta | Medio | Estado Sync   |
+-----------------------------------------------------------------------------------+
| SECCIÓN 2: SIMULADOR DE IMPACTO EN ESQUEMAS DE COMPRAS (MM)                       |
|  * Evaluación de afectación en Esquemas ZM0000 (Nacional) e Importaciones ZM0002  |
+-----------------------------------------------------------------------------------+
```

---

## 5. CÓDIGO FUENTE MARKDOWN PARA GENERACIÓN Y PROTOTIPADO (UI5 / XML VIEW)

El siguiente bloque de código define la estructura técnica en formato XML y JSON para la implementación del prototipo front-end:

### 5.1. Manifest.json Configuration Fragment
```json
{
  "sap.app": {
    "id": "com.droidconsulting.scm.fxmanager",
    "type": "application",
    "title": "Gestión Inteligente de Tipos de Cambio y Divisas SCM",
    "description": "Aplicación Fiori para el monitoreo, ingesta y simulación de tipos de cambio en módulos MM/SD/FI",
    "applicationVersion": { "version": "1.0.0" },
    "dataSources": {
      "mainService": {
        "uri": "/sap/opu/odata/sap/Z_SCM_FX_MANAGER_SRV/",
        "type": "OData",
        "settings": { "localUri": "localService/metadata.xml" }
      }
    }
  },
  "sap.ui5": {
    "dependencies": {
      "libs": {
        "sap.m": {},
        "sap.ui.core": {},
        "sap.ui.comp": {},
        "sap.f": {}
      }
    },
    "models": {
      "": {
        "dataSource": "mainService",
        "preload": true
      }
    }
  }
}
```

### 5.2. Main View XML Layout (`View.view.xml`)
```xml
<mvc:View
    controllerName="com.droidconsulting.scm.fxmanager.controller.Main"
    xmlns:mvc="sap.ui.core.mvc"
    xmlns="sap.m"
    xmlns:f="sap.f"
    xmlns:card="sap.f.cards"
    xmlns:core="sap.ui.core"
    xmlns:smartTable="sap.ui.comp.smarttable">

    <f:DynamicPage id="page" headerExpanded="true">
        <f:title>
            <f:DynamicPageTitle>
                <f:heading>
                    <Title text="Monitoreo y Gobierno de Tipos de Cambio (TCURR)" wrapping="true"/>
                </f:heading>
                <f:actions>
                    <Button icon="sap-icon://synchronize" press="onSyncMarketRates" text="Sincronizar con Proveedor (BTP/CPI)" type="Emphasized"/>
                    <Button icon="sap-icon://simulate" press="onSimulatePricing" text="Simular Impacto Logístico"/>
                </f:actions>
            </f:DynamicPageTitle>
        </f:title>

        <f:header>
            <f:DynamicPageHeader pinnable="true">
                <f:content>
                    <HBox justifyContent="SpaceAround" wrap="Wrap">
                        <card:Card width="300px" class="sapUiTinyMargin">
                            <card:header>
                                <card:CardHeader title="Estado de Tasas Hoy" subtitle="Actualización Automática TCURR" icon="sap-icon://Checkmark"/>
                            </card:header>
                            <card:content>
                                <VBox class="sapUiMediumMargin">
                                    <Title level="H2" state="Success" text="100% Sincronizado"/>
                                    <Text text="Última ejecución: Hoy a las 06:00 AM (ISO/API Local)"/>
                                </VBox>
                            </card:content>
                        </card:Card>

                        <card:Card width="300px" class="sapUiTinyMargin">
                            <card:header>
                                <card:CardHeader title="Desviación Cambiaria" subtitle="vs. Tasa Promedio del Día" icon="sap-icon://line-chart"/>
                            </card:header>
                            <card:content>
                                <VBox class="sapUiMediumMargin">
                                    <Title level="H2" state="Information" text="+0.02% (Controlado)"/>
                                    <Text text="Sin impacto crítico en esquemas ZM0000 / ZM0002"/>
                                </VBox>
                            </card:content>
                        </card:Card>

                        <card:Card width="300px" class="sapUiTinyMargin">
                            <card:header>
                                <card:CardHeader title="Bloqueos Logísticos MIGO" subtitle="Errores por Faltantes OB08" icon="sap-icon://alert"/>
                            </card:header>
                            <card:content>
                                <VBox class="sapUiMediumMargin">
                                    <Title level="H2" state="Success" text="0 Alertas"/>
                                    <Text text="Procesos de Compras operando con normalidad"/>
                                </VBox>
                            </card:content>
                        </card:Card>
                    </HBox>
                </f:content>
            </f:DynamicPageHeader>
        </f:header>

        <f:content>
            <VBox class="sapUiMediumMargin">
                <smartTable:SmartTable
                    id="smartTableFX"
                    entitySet="ExchangeRateSet"
                    tableType="ResponsiveTable"
                    useExportToExcel="true"
                    useVariantManagement="true"
                    useTablePersonalisation="true"
                    header="Cotizaciones Activas en Sistema (Tabla TCURR)"
                    showRowCount="true"
                    persistencyKey="SmartTableFXPKey">
                    <Table alternateRowColors="true" id="tableFX" mode="MultiSelect">
                        <columns>
                            <Column><Text text="Moneda Origen (FCURR)"/></Column>
                            <Column><Text text="Moneda Destino (TCURR)"/></Column>
                            <Column><Text text="Tipo Cotización (KURST)"/></Column>
                            <Column><Text text="Fecha Validez"/></Column>
                            <Column><Text text="Tasa Directa / Compra"/></Column>
                            <Column><Text text="Tasa Indirecta / Venta"/></Column>
                            <Column><Text text="Estado de Validación"/></Column>
                        </columns>
                        <items>
                            <ColumnListItem>
                                <cells>
                                    <ObjectIdentifier title="USD"/>
                                    <Text text="PEN"/>
                                    <ObjectStatus state="Warning" text="ZSUN (Oficial)"/>
                                    <Text text="08.09.2026"/>
                                    <Input editable="true" value="3.7540"/>
                                    <Input editable="true" value="3.7580"/>
                                    <ObjectStatus icon="sap-icon://status-completed" state="Success" text="Válido"/>
                                </cells>
                            </ColumnListItem>
                            <ColumnListItem>
                                <cells>
                                    <ObjectIdentifier title="EUR"/>
                                    <Text text="PEN"/>
                                    <ObjectStatus state="Information" text="M (Media)"/>
                                    <Text text="08.09.2026"/>
                                    <Input editable="true" value="4.1200"/>
                                    <Input editable="true" value="4.1250"/>
                                    <ObjectStatus icon="sap-icon://status-completed" state="Success" text="Válido"/>
                                </cells>
                            </ColumnListItem>
                        </items>
                    </Table>
                </smartTable:SmartTable>
            </VBox>
        </f:content>
    </f:DynamicPage>
</mvc:View>
```

---

## 6. GESTIÓN TÉCNICA, DEBUGGING Y RESOLUCIÓN DE INCIDENCIAS
Como consultor especialista en depuración avanzada en ECC 7.7 y S/4HANA, se establecen los puntos de control clave ante incidencias logísticas:

1.  **Punto de Interrupción en Kernel:** Colocar un *Break-Point* en la función estándar `READ_EXCHANGE_RATE`. Permite auditar en tiempo de ejecución los parámetros de fecha de valoración, moneda origen, moneda destino y el Tipo de Cotización (`KURST`) que el motor logístico invoca al crear pedidos (`ME21N`) o recepciones de mercancías (`MIGO`).
2.  **Monitoreo de Errores de Inserción:** Revisar el log de la transacción `SLG1` (objeto de log de tipos de cambio) y la cola RFC (`SM58`) para detectar fallos en la ejecución de la BAPI `BAPI_EXCHANGERATE_CREATE`.
