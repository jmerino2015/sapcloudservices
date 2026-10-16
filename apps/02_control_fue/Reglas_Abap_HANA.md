\# Reglas de Desarrollo SAP ABAP \- SAP HANA 2025 & CDS

Como consultor especialista con más de 15 años de experiencia, estas son las reglas de oro para desarrollos de alta envergadura en la versión 2025\.

\#\# 1\. Paradigma Code-to-Data (Pushdown)  
\* \*\*Minimización de Movimiento de Datos:\*\* La lógica de cálculo debe ejecutarse en la base de datos, no en el servidor de aplicaciones.  
\* \*\*SQLScript:\*\* Utilizar procedimientos almacenados para cálculos complejos que superen las capacidades del Open SQL.  
\* \*\*Operaciones de Conjunto:\*\* Prohibido el uso de loops (\`LOOP AT\`) para cálculos que pueden resolverse con sentencias SQL agregadas.

\#\# 2\. Modelado de Datos con CDS (Core Data Services)  
\* \*\*Semántica Rica:\*\* Definir entidades y vistas con anotaciones adecuadas para facilitar el consumo por capas superiores.  
\* \*\*Asociaciones vs Joins:\*\* Priorizar el uso de asociaciones ("Lazy Joining") para optimizar el rendimiento en tiempo de ejecución.  
\* \*\*Vistas de Consumo:\*\* Crear vistas específicas para la exposición de servicios OData hacia SAPUI5/Fiori.

\#\# 3\. Integración y Conectividad  
\* \*\*BAPIs Modernizadas:\*\* Mantener el uso de BAPIs para asegurar la integridad de los procesos de negocio en actualizaciones masivas.  
\* \*\*RESTful ABAP Programming (RAP):\*\* Implementar el modelo RAP para nuevos desarrollos, aprovechando OData v4.  
\* \*\*APIs Externas:\*\* Utilizar clases de consumo HTTP optimizadas para la integración con sistemas de terceros.

\#\# 4\. Arquitectura y Rendimiento en HANA  
\* \*\*Almacenamiento Columnar:\*\* Diseñar estructuras pensando en la eficiencia del motor de columnas de HANA.  
\* \*\*Eliminación de Agregados:\*\* No crear tablas de sumas/totales; calcular agregados en tiempo real mediante vistas CDS.  
\* \*\*Seguridad:\*\* Implementar \*Privilegios Analíticos\* para control de acceso a nivel de fila directamente en la base de datos.

\#\# 5\. Ciclo de Vida y Calidad  
\* \*\*Modularización:\*\* Separar estrictamente las capas de persistencia, lógica de negocio y presentación.  
\* \*\*ATC (ABAP Test Cockpit):\*\* Ejecutar chequeos de variante HANA para asegurar que el código ABAP sea compatible y eficiente en la base de datos.  
