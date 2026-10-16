# PROPUESTA TÉCNICO-COMERCIAL
## Suite Integral de Automatización Tributaria, Localización Perú y Conectividad Bancaria Host to Web para SAP S/4HANA & SAP Fiori

---

**Cliente Destinatario:** Corporación Rokys / Dirección de Administración y Finanzas  
**Proveedor Tecnológico:** Consultoría Especializada TI (Especialistas en Ecosistemas SAP & Cloud)  
**Alcance Tecnológico:** SAP S/4HANA On-Premise / Private Cloud, SAP Fiori Horizons & SAP CPI  
**Versión de Propuesta:** 2.0 Enterprise Optimized (Reemplazo y Optimización de Brechas de Mercado)  
**Fecha de Emisión:** Septiembre 2026  

---

## 1. Resumen Ejecutivo & Enfoque de Valor

**El Contexto Actual:** Las organizaciones líderes en el sector retail, consumo masivo y cadenas de restaurantes en el Perú enfrentan un doble desafío crítico: por un lado, una fiscalización digital implacable y permanentemente actualizada por parte de la SUNAT (Sistema Integrado de Registros Electrónicos - SIRE, padrones dinámicos de No Habidos y Sujetos Sin Capacidad Operativa - SSCO, y órdenes de embargo coactivo inmediatas); por otro lado, la necesidad imperiosa de optimizar los flujos de tesorería y pagos bancarios masivos sin fricciones operativas ni reprocesos manuales.

**El Enfoque Tradicional vs. DROID:** Tradicionalmente, las consultoras del mercado proponen abordar estas exigencias mediante un conjunto fragmentado de programas a medida ("Objetos Z") desarrollados bajo metodologías desactualizadas. Este enfoque tradicional no solo incrementa drásticamente los costos de consultoría (superando cotizaciones de mercado de USD $56,000), sino que introduce una alta fragilidad técnica, nula integración con la experiencia de usuario moderna y una dependencia innecesaria de desarrollos no certificados.

**La Solución Optimizada:** La consultoría presenta una solución radicalmente superior: la **Suite Integral de Automatización Tributaria y Localización Perú para SAP S/4HANA**. En lugar de crear programas aislados, se entrega un conjunto armónico de aceleradores certificados y probados, diseñados nativamente sobre el modelo universal de datos de SAP (ACDOCA) y desplegados en interfaces modernas **SAP Fiori Horizons**. Adicionalmente, se incorpora **Asistente Virtual IA**, un copiloto con inteligencia artificial especializado en auditoría continua y resolución de consultas fiscales.

> **Impacto Cuantificable para el Negocio:**
> - **Reducción del 100%** en contingencias y multas fiscales derivadas de facturas de proveedores observados o no habidos.
> - **Automatización del 92%** en la reconciliación del SIRE (RCE y RVIE) contra los libros mayores de SAP S/4HANA.
> - **Eficiencia de tesorería:** Procesamiento desatendido de lotes de pago multibanco (BBVA, Interbank, BCP, Banbif) con aprobación multinivel y encriptación PGP.
> - **Ahorro de más del 30%** en inversión inicial y cero costo recurrente por usuario en licenciamiento cloud.

---

## 2. Comparativa Estratégica: Oferta de Mercado vs. Solución DROID

| Dimensión / Requerimiento | Enfoque Tradicional de Mercado (SEIDOR) | Solución Optimizada SAP Fiori |
| :--- | :--- | :--- |
| **Arquitectura y Código** | Múltiples desarrollos "Z" independientes y rígidos. Nomenclatura propietaria cerrada sin entrega de especificaciones funcionales completas. | Aceleradores estandarizados en SAP S/4HANA sobre Core Data Services (CDS Views), totalmente abiertos, documentados y auditables. |
| **Experiencia de Usuario** | Transacciones de pantalla plana clásica en SAP GUI (reportes ALV estándar de escritorio), sin adaptabilidad móvil ni analítica en vivo. | Experiencia de vanguardia 100% SAP Fiori Horizons. Cockpits basados en roles, cuadro de mando ejecutivo y acceso multiplataforma. |
| **Inteligencia Artificial y Copiloto** | Inexistente. La detección de inconsistencias y cruce de datos depende de la revisión manual del usuario. | Droid Asistente Virtual integrado en pantalla: copiloto de IA que audita discrepancias SIRE, responde normativas y navega al asiento contable. |
| **Conectividad Bancaria (Host to Web)** | Cobro segregado de USD \$22,500 exclusivamente por conexión de 3 bancos, excluyendo pagos individuales y sin optimizaciones de procesos FI. | Integración unificada Host to Web (BBVA, Interbank, BCP y Banbif) vía SAP CPI + PGP con flujo de aprobación configurable de 2 niveles. |
| **Libros Electrónicos y SIRE** | Desarrollo cotizado por partes (RCE separado, PLE 3.7 y 3.24 por separado, PDT 617 por separado). Exclusión explícita de varios libros. | Cobertura completa e integrada: Suite PLE 3.1 al 3.24, SIRE RCE/RVIE inteligente con diferimiento de crédito fiscal y No Domiciliados. |
| **Inversión Total Estimada** | USD \$56,600.00 (+ Impuestos) con penalidades rígidas de \$360 diarios por desviaciones atribuibles al cliente. | **USD \$38,500.00 (+ Impuestos)** en paquete integral "llave en mano", cronograma ágil de 10-12 semanas y gobernanza colaborativa. |

---

## 3. Alcance Funcional Detallado por Módulos

### Módulo I: Blindaje Fiscal y Aceleradores Normativos SUNAT
Este módulo automatiza los controles fiscales de mayor riesgo sancionatorio para la empresa, evitando la pérdida de crédito fiscal y gestionando con rigor jurídico las medidas cautelares coactivas de SUNAT:

*   **1.1 Control Preventivo de Capacidad Operativa (Padrón SSCO & No Habidos):** Carga estructurada e indexada de los padrones oficiales de SUNAT para Sujetos Sin Capacidad Operativa (SSCO) y Contribuyentes No Habidos. El sistema ejecuta una intercepción preventiva en tiempo real al momento en que un usuario ingresa una factura en Finanzas (FB60), compras logísticas (MIRO) o transacciones de pre-registro contable. Si el RUC emisor figura observado, el sistema genera de forma parametrizable una advertencia mandatoria o un bloqueo total de contabilización, protegiendo al 100% el derecho al crédito fiscal y la deducción del gasto de la compañía.
*   **1.2 Automatización de Embargos Electrónicos (Medidas Cautelares Coactivas):** Solución especializada para la consulta, declaración y retención coactiva sobre acreedores de empresas denominadas "Grandes Compradores" o "Terceros Retenedores". El sistema analiza automáticamente las propuestas de pago masivo generadas por la transacción F110, señalizando los documentos cuyo importe supere una (1) UIT. Genera de forma automática los archivos planos estructurados (.TXT) para su transmisión hacia la plataforma EXTRANET de SUNAT y procesa la regla de cálculo oficial para recibos por honorarios. Asimismo, ejecuta el bloqueo preventivo masivo o individual de las cuentas por pagar de proveedores con deuda coactiva notificada, permitiendo el desbloqueo transparente una vez que SUNAT certifique la cancelación de la medida.
*   **1.3 Validaciones Preventivas de Temporalidad de Facturas:** Módulo de verificación que audita la antigüedad de la fecha de emisión del comprobante físico o electrónico respecto a la fecha contable del sistema. Emite alertas de advertencia o bloqueo si la fecha es menor en un mes (compras generales) o si supera los tres (3) meses en compras afectas a detracción, blindando los plazos perentorios del crédito fiscal.

### Módulo II: Automatización de Retenciones (CxC) y Percepciones (CxP)
Automatiza el cálculo y tratamiento contable de los regímenes impositivos de retenciones comerciales y percepciones aplicadas a los flujos de cobro y pago:

*   **2.1 Administrador de Retenciones en Cuentas por Cobrar (CxC):** Asignación desatendida del indicador de retención (3%) en facturas generadas desde Ventas (SD) o Finanzas (FI) cuando el cliente figure como Agente de Retención según el padrón de SUNAT. Incorpora la regla de negocio crítica: La detracción prevalece sobre la retención (si la factura está sujeta a detracción, no se aplica retención comercial). Dispone de un programa ejecutable de actualización masiva de partidas abiertas ante cambios de condición tributaria del cliente. Soporta los nuevos escenarios de Facturación Electrónica (Factura gravada + IGV + crédito + retención, y notas de crédito referenciadas), contabilizando la retención al aplicar la cobranza con columnas ampliadas en la transacción FBL5N.
*   **2.2 Administrador de Percepciones en Cuentas por Pagar (CxP):** Determinación automática del indicador impositivo de percepción en facturas de compras registradas en MM (MIRO) o FI (FB60) en función a la configuración en el maestro de materiales: Agente de percepción de venta interna (2%) o Agente de hidrocarburos (1%). Garantiza la exclusión mutua entre percepción y detracción. Permite la anotación y control del certificado de percepción y provee un monitor de actualización de partidas abiertas cuando un proveedor adquiere la condición de agente.

### Módulo III: Plataforma SIRE SUNAT & Suite Completa Libros PLE
Provee cobertura 100% homologada con los estándares vigentes de SUNAT para la presentación de libros contables físicos y electrónicos:

*   **3.1 Portal SIRE Inteligente (RCE 8.1, RVIE 14.1 y No Domiciliados):** Motor de reconciliación que contrasta la propuesta oficial de compras de SUNAT (RCE 8.1) contra los registros de SAP S/4HANA. Incorpora la gestión de exclusión y diferimiento para apartar comprobantes con detracción pendiente o recibos de servicios públicos y presentarlos en el periodo tributario en que otorgan derecho al crédito fiscal. Incluye el Registro de Ventas e Ingresos Electrónico (RVIE 14.1) y un módulo de carga masiva de comprobantes de No Domiciliados (RCE 8.2) con la nueva estructura oficial de SUNAT (mayo 2026) y cálculo automático de retención de renta para el PDT 617.
*   **3.2 Suite Exhaustiva de Libros Electrónicos PLE:** Despliegue integral de todos los libros contables normados:
    - **Libro 3 Inventarios y Balances completo:** 3.1 Balance General, 3.3 Clientes 12/13, 3.4 Personal 14, 3.5 Cuentas Diversas 16/17, 3.6 Cobranza Dudosa 19, 3.7 Mercaderías y PT 20/21, 3.9 Intangibles 34, 3.12 Proveedores 42/43, 3.13 Pasivos Diversos 46/47, 3.15 Diferidos 37/49, 3.17 Comprobación, 3.19 Patrimonio, 3.20 Resultados y 3.24 Resultados Integrales.
    - **Libro 5 Diario:** 5.1 General y 5.3 Plan Contable.
    - **Libro 6 Mayor:** 6.1 Mayor General.
    - **Libro 7 Activos Fijos:** 7.1 Detalle, 7.3 Diferencia de Cambio y 7.4 Arrendamiento Financiero (Leasing).
    - **Libro 13 Kardex Permanente:** 13.1 Kardex Permanente Valorizado.
    - *Formatos:* Visualización en grilla analítica Fiori y exportación automática en archivos planos delimitados por tuberías (.TXT y .ZIP).

### Módulo IV: Conectividad Bancaria Desatendida (Host to Web)
Transforma el proceso de tesorería eliminando la manipulación manual de archivos bancarios a través de una integración segura punto a punto:

*   **4.1 Integración Multibanco B2B con Cifrado PGP:** Integración desatendida B2B basada en SAP Cloud Integration (CPI) que canaliza las propuestas de pago masivo generadas por la transacción F110 hacia los servidores SFTP de los principales bancos del país: BBVA Continental, Interbank, Banco de Crédito del Perú (BCP) y Banbif. Todas las transferencias de archivos de ida y vuelta viajan protegidas mediante algoritmos de cifrado asimétrico PGP.
*   **4.2 Operaciones de Pago Soportadas:** Pagos a proveedores nacionales bajo tres modalidades: transferencias entre cuentas del mismo banco, transferencias interbancarias (CCI diferidas e inmediatas) y emisión de cheques de gerencia, adaptando las estructuras a cada estándar bancario.
*   **4.3 Flujo de Aprobación Multinivel y Monitor de Estados:** Sistema de control con aprobador de 2 niveles antes de habilitar la transmisión del lote hacia el banco, con límites configurables por monto y jerarquía. Incluye un Monitor Z Host to Web en SAP que reporta en tiempo real el estatus de procesamiento (Enviado, Aprobado, Rechazado, Pagado) con capacidad de anulación de lote y retroalimentación contable automática.

### Módulo V: Facturación Electrónica y Guías de Remisión (SD/MM)
Optimiza la logística de distribución y emisión de comprobantes en locales y plantas:

*   **5.1 Monitor de Impresión Masiva FE y GRE:** Monitor especializado para el despacho e impresión masiva de Facturas, Boletas, Notas de Crédito, Notas de Débito y Guías de Remisión Electrónica (GRE Remitente y Transportista). Consume la representación impresa oficial (PDF con código QR) mediante los servicios web expuestos por el Operador de Servicios Electrónicos (OSE) y direcciona la impresión automáticamente al spool de las impresoras de red instaladas.
*   **5.2 Control de Series por Centro Logístico (IDCP):** Ampliación sobre la transacción estándar IDCP que filtra y muestra estrictamente las series de comprobantes asignadas al centro logístico ingresado por el usuario, imposibilitando errores de emisión cruzada entre sucursales.
*   **5.3 Tratamiento de Documentos en Contingencia:** Asignación de series exclusivas autorizadas para emisión de contingencia y procedimiento normado de sincronización posterior con el OSE para garantizar la continuidad operativa ante caídas de enlace.

### Módulo VI: Centro de Mando Fiori Horizons & Droid Asistente Virtual
La cúspide de la solución DROID: modernidad visual e inteligencia artificial aplicada al día a día contable:

*   **6.1 Dashboard Centralizado de Cumplimiento Fiscal:** Cockpit ejecutivo diseñado bajo el lenguaje visual Horizons de SAP. Proporciona en una sola pantalla: porcentaje de conciliación SIRE en tiempo real (92.3%), monitor de detracciones pendientes por pagar, alertas de proveedores No Habidos detectados, calendario interactivo con fechas límites de vencimiento SUNAT según último dígito de RUC y registro cronológico de actividad en memoria SAP HANA.
*   **6.2 Droid Asistente Virtual (Copiloto Tributario IA):** Copiloto conversacional de IA integrado en el panel lateral de SAP Fiori. Permite a los usuarios consultar discrepancias entre compras declaradas y la propuesta SUNAT, indagar sobre la aplicación de normas tributarias en lenguaje natural, disparar la conformación de lotes de detracción para el Banco de la Nación y acceder directamente al documento contable origen en SAP sin salir de la vista.

---

## 4. Metodología de Implementación & Cronograma de Despliegue

El proyecto se ejecuta bajo la metodología oficial **SAP Activate**, adaptada para despliegues ágiles de aceleradores normativos en un plazo de diez (10) a doce (12) semanas:

| Fase SAP Activate | Plazo Estimado | Actividades Principales y Entregables Clave |
| :--- | :--- | :--- |
| **Fase 1: Prepare & Explore** | Semanas 1 a 2 | Alineamiento de arquitectura y conectividad CPI/SFTP.<br>Talleres de homologación funcional con bancos (BBVA, Interbank) y OSE.<br>Revisión de plan de cuentas y matriz de parametrización.<br>*Entregable:* Documento de Diseño BPD / Matriz To-Be. |
| **Fase 2: Realize (Sprint 1)** | Semanas 3 a 6 | Despliegue de SSCO, Embargo coactivo y Retenciones CxC.<br>Configuración de Percepciones CxP en MM/MIRO y validaciones de emisión.<br>Construcción de vistas CDS y generación de libros PLE (3.1 al 3.24).<br>*Entregable:* Prototipo funcional en ambiente DEV/QAS. |
| **Fase 3: Realize (Sprint 2)** | Semanas 7 a 8 | Implementación de Host to Web con bancos (llaves PGP, SFTP y F110).<br>Configuración del monitor de impresión masiva GRE/FE y Series IDCP.<br>Pruebas unitarias de transmisión y recepción de estados de pago.<br>*Entregable:* Conectores bancarios y OSE certificados en ambiente de pruebas. |
| **Fase 4: Deploy (UAT & Training)** | Semanas 9 a 10 | Ejecución de Pruebas Integrales de Usuario (UAT).<br>Capacitación a usuarios clave de Contabilidad, Compras, Ventas y Tesorería.<br>Preparación y verificación del plan de corte y Órdenes de Transporte (OT).<br>*Entregable:* Acta formal de aprobación UAT y Manuales de Usuario. |
| **Fase 5: Run & Hipercare** | Semanas 11 a 12 | Paso a producción (Go-Live) y carga inicial de padrones SUNAT.<br>Acompañamiento en el primer cierre contable y liquidación mensual.<br>Soporte post go-live (Hipercare) y transferencia a mantenimiento continuo.<br>*Entregable:* Acta de Cierre de Proyecto y Activación de Garantía. |

---

## 5. Propuesta Económica & Equipo Consultor

### Modelo de Inversión a Precio Fijo (Lump Sum)

| Componente de Solución / Módulo | Alcance Tecnológico Incluido | Inversión (USD) |
| :--- | :--- | :---: |
| **Módulo I & II: Blindaje Fiscal e Impuestos** | SSCO, Embargo Coactivo F110, Retenciones CxC, Percepciones CxP y Validaciones. | USD \$ 9,500.00 |
| **Módulo III: SIRE y Libros PLE Completos** | SIRE RCE/RVIE inteligente, No Domiciliados (PDT 617) y Libros PLE 3.1 al 3.24. | USD \$ 8,500.00 |
| **Módulo IV: Conectividad Bancaria Host to Web** | Integración CPI multibanco (BBVA, Interbank, BCP, Banbif), PGP, F110 y doble aprobación. | USD \$ 12,000.00 |
| **Módulo V: Facturación Electrónica y GRE** | Monitor de impresión masiva OSE, Series por Centro IDCP y contingencias. | USD \$ 4,500.00 |
| **Módulo VI: Fiori Horizons & Droid Copilot** | Cockpit centralizado de control visual y Copiloto Tributario con Inteligencia Artificial. | USD \$ 4,000.00 |
| **INVERSIÓN TOTAL PAQUETE INTEGRAL DROID** | **Alcance 100% Cubierto sin Brechas ni Exclusiones** | **USD \$ 38,500.00 (+ IGV)** |

> **Ahorro Presupuestario Estratégico:** Frente a cotizaciones de mercado que alcanzan los USD \$56,600.00, la propuesta de DROID representa un ahorro de inversión directa de más de USD \$18,000.00 (32% de optimización presupuestaria), entregando además una tecnología muy superior con Fiori Horizons y Droid Copilot IA.

### Esquema de Facturación por Hitos de Éxito
- **Hito 1 (Anticipo de Inicio):** 30% a la firma del contrato comercial y emisión del Acta de Inicio de Proyecto.
- **Hito 2 (Certificación UAT):** 40% contra la aprobación formal del Acta de Pruebas Integrales de Usuario (UAT).
- **Hito 3 (Pase a PRD y Cierre):** 30% a la salida exitosa en producción (Go-Live) y entrega del dossier de documentación técnica y manuales.

### Equipo de Consultoría Senior Asignado
- **01 Consultor Senior SAP FI-CO (Especialista en Localización Tributaria Perú):** Líder técnico en parametrización contable, PLE, SIRE, SSCO, detracciones y retenciones con más de 12 años de trayectoria en proyectos S/4HANA.
- **01 Consultor Senior SAP SD-MM (Procesos Logísticos y Facturación):** Especialista en flujos de compras (MM/MIRO), ventas (SD), control de series IDCP, guías de remisión y facturación electrónica.
- **01 Consultor Especialista SAP BTP / Cloud Integration (Host to Web Bancario):** Experto en integración mediante SAP CPI, canales SFTP con bancos (BBVA, Interbank, BCP, Banbif), encriptación PGP y servicios web OSE.
- **01 Consultor Senior SAP Fiori / ABAP HANA:** Desarrollador sénior de alto desempeño en arquitectura de vistas Core Data Services (CDS Views), servicios OData y personalización Fiori Horizons.
- **01 Gerente de Proyecto DROID (Project Manager Officer - PMO):** Certificado PMP y Agile Scrum, responsable de la gobernanza, gestión de riesgos, aseguramiento de calidad y cumplimiento estricto del cronograma.

---

## 6. Gobernanza, Premisas y Garantía de Servicio

- **Accesos y Conectividad:** El cliente facilitará oportunamente dos (2) usuarios con acceso a los ambientes de Desarrollo (DEV) y Calidad (QAS) con roles funcionales y clave de desarrollo ABAP activa.
- **Canales Externos (Bancos y OSE):** El cliente dispondrá oportunamente de las credenciales de prueba y producción brindadas por las entidades bancarias (BBVA, Interbank, BCP, Banbif) y el Operador OSE para los ensayos de transmisión.
- **Modalidad de Servicio:** La consultoría se prestará bajo modalidad remota de alto rendimiento, con sesiones presenciales estratégicas en hitos clave (kick-off, talleres de diseño y salida en vivo).
- **Garantía de Servicio Post-Productivo:** El equipo consultor otorga una **Garantía de Servicio de treinta (30) días calendario** contados a partir de la firma del Acta de Go-Live. Dicha garantía cubre la corrección inmediata y sin costo de cualquier desviación funcional, inconsistencia en formatos de salida o vicio oculto sobre los componentes implementados, con un SLA de respuesta preferencial de 2 a 4 horas hábiles.
