const pptxgen = require('pptxgenjs');

let pres = new pptxgen();
pres.author = 'Consultoría SAP';
pres.company = 'Consultoría SAP';
pres.title = 'SAP WM Fiori - Logística 4.0';
pres.layout = 'LAYOUT_16x9';

pres.defineSlideMaster({
  title: 'MASTER_DARK',
  background: { color: '1E1610' },
});

pres.defineSlideMaster({
  title: 'MASTER_LIGHT',
  background: { color: 'FCFAF7' },
});

// SLIDE 1
let slide1 = pres.addSlide({ masterName: 'MASTER_DARK' });
slide1.addText('La Evolución de la Gestión de Almacenes con SAP WM Fiori', { x: 1, y: 2, w: '80%', color: 'E75B00', fontSize: 36, bold: true });
slide1.addText('Logística 4.0: Inteligencia, Velocidad y Trazabilidad Total', { x: 1, y: 3.5, w: '80%', color: 'FCFAF7', fontSize: 24 });
slide1.addShape(pres.ShapeType.line, { x: 1, y: 4.5, w: 8, h: 0, line: { color: 'FF7A00', width: 3 } });

// SLIDE 2
let slide2 = pres.addSlide({ masterName: 'MASTER_LIGHT' });
slide2.addText('Transformación Operativa (El Desafío vs Nuestra Solución)', { x: 0.5, y: 0.5, w: '90%', color: 'E75B00', fontSize: 28, bold: true });
slide2.addText('EL DESAFÍO (AS-IS)', { x: 0.5, y: 1.5, w: '40%', color: '2D2825', fontSize: 18, bold: true });
slide2.addText('73% de datos no se usan en sistemas fragmentados', { x: 0.5, y: 2, w: '40%', color: '2D2825', fontSize: 24, bold: true });
slide2.addText('• Decisiones Lentas: Dependencia de reportes obsoletos.\n• Recorridos Erráticos: Tiempos muertos en recolección.', { x: 0.5, y: 3, w: '40%', color: '2D2825', fontSize: 16, bullet: true });

slide2.addText('LA SOLUCIÓN (TO-BE)', { x: 5, y: 1.5, w: '40%', color: 'E75B00', fontSize: 18, bold: true });
slide2.addText('100% de Excelencia Digital con SAP', { x: 5, y: 2, w: '40%', color: 'E75B00', fontSize: 24, bold: true });
slide2.addText('• Control en Tiempo Real: Interfaz Fiori intuitiva.\n• Smart Routing Automático: -30% del tiempo de picking.', { x: 5, y: 3, w: '40%', color: '2D2825', fontSize: 16, bullet: true });

// SLIDE 3
let slide3 = pres.addSlide({ masterName: 'MASTER_LIGHT' });
slide3.addText('Arquitectura y Ecosistema Logístico (Clean Core)', { x: 0.5, y: 0.5, w: '90%', color: 'E75B00', fontSize: 28, bold: true });
slide3.addText('• Despliegue Estratégico Clean Core: S/4HANA como núcleo.\n• Interconexión Inteligente Enterprise: IoT, Zebra, SICK.\n• Operador Logístico a Primer Nivel (3PL): Visibilidad multiplanta.', { x: 0.5, y: 2, w: '80%', color: '2D2825', fontSize: 18, bullet: true });

// SLIDE 4
let slide4 = pres.addSlide({ masterName: 'MASTER_LIGHT' });
slide4.addText('Inteligencia Logística en Tiempo Real', { x: 0.5, y: 0.5, w: '90%', color: 'E75B00', fontSize: 28, bold: true });
slide4.addText('KPIs: Ocupación | OTIF | Perfect Order Rate', { x: 0.5, y: 1.5, w: '90%', color: 'E75B00', fontSize: 20, bold: true });
slide4.addText('• Dashboards Predicitivos: Analítica Drill-down.\n• Interactividad Avanzada (IA): Consultas en lenguaje natural.\n• Monitoreo Cíclico Ininterrumpido: Inventarios ciegos.', { x: 0.5, y: 2.5, w: '80%', color: '2D2825', fontSize: 18, bullet: true });

// SLIDE 5
let slide5 = pres.addSlide({ masterName: 'MASTER_LIGHT' });
slide5.addText('Operaciones de Alto Rendimiento', { x: 0.5, y: 0.5, w: '90%', color: 'E75B00', fontSize: 28, bold: true });
slide5.addText('-30% en tiempos de Picking', { x: 0.5, y: 1.5, w: '90%', color: 'E75B00', fontSize: 32, bold: true });
slide5.addText('• Slotting Dinámico y Validación Z: Control de capacidad.\n• Extracción Masiva y Picking Fraccionado: Reducción de recorridos.\n• Alertas Preventivas Automáticas: SLED, control de caducidad.', { x: 0.5, y: 2.5, w: '80%', color: '2D2825', fontSize: 18, bullet: true });

// SLIDE 6
let slide6 = pres.addSlide({ masterName: 'MASTER_LIGHT' });
slide6.addText('Escalabilidad Omnicanal y E-Commerce', { x: 0.5, y: 0.5, w: '90%', color: 'E75B00', fontSize: 28, bold: true });
slide6.addText('Una sola fuente de verdad desde la bodega hasta la última milla', { x: 0.5, y: 1.5, w: '90%', color: 'E75B00', fontSize: 20, bold: true });
slide6.addText('• Flexibilidad B2B Total: Despachos y Crossdocking.\n• Velocidad de Última Milla: Integración con Courier.\n• Escalabilidad Sin Límites: Administrable desde Front-End.', { x: 0.5, y: 2.5, w: '80%', color: '2D2825', fontSize: 18, bullet: true });

// SLIDE 7
let slide7 = pres.addSlide({ masterName: 'MASTER_LIGHT' });
slide7.addText('Metodología y Adopción Acelerada', { x: 0.5, y: 0.5, w: '90%', color: 'E75B00', fontSize: 28, bold: true });
slide7.addText('Descubrimiento -> Preparación -> Exploración -> Realización -> Go Live', { x: 0.5, y: 1.5, w: '90%', color: 'E75B00', fontSize: 16, bold: true });
slide7.addText('• Implementación Segura y Acelerada: SAP Activate (8-10 semanas).\n• Curva de Aprendizaje Nula: Interfaz Fiori 100% responsiva.\n• Soporte y Garantía Operativa: Hypercare especializado.', { x: 0.5, y: 2.5, w: '80%', color: '2D2825', fontSize: 18, bullet: true });

// SLIDE 8
let slide8 = pres.addSlide({ masterName: 'MASTER_DARK' });
slide8.addText('Da el salto tecnológico hacia la Logística Autónoma.', { x: 0.5, y: 2, w: '90%', color: 'E75B00', fontSize: 32, bold: true, align: 'center' });
slide8.addText('Unifica toda tu información, optimiza tus recursos y domina tu distribución de principio a fin.', { x: 0.5, y: 3.5, w: '90%', color: 'FCFAF7', fontSize: 20, align: 'center' });
slide8.addText('AGENDA TU DEMO INTERACTIVA\ncontacto@consultoria.com', { x: 0.5, y: 5, w: '90%', color: 'FF7A00', fontSize: 18, bold: true, align: 'center' });

pres.writeFile({ fileName: 'Presentacion_Comercial_SAP_WM.pptx' }).then(fileName => {
    console.log(`PPTX generado exitosamente: ${fileName}`);
});
