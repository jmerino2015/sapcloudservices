/**
 * SAP WMS 3D Digital Twin - Node.js Server
 * Sirve la aplicación Fiori Horizon 3D y expone APIs REST para integración con SAP BTP / S/4HANA.
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir archivos estáticos del proyecto
app.use(express.static(path.join(__dirname)));

// Healthcheck para SAP BTP Cloud Foundry o Kubernetes
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    module: 'SAP_WMS_3D_WAREHOUSE_MAP',
    timestamp: new Date().toISOString()
  });
});

// Endpoint informativo del catálogo WMS
app.get('/api/warehouse/info', (req, res) => {
  res.json({
    name: 'SAP WMS 3D Digital Twin',
    version: '1.0.0',
    dimensions: {
      width: 65.4,
      length: 43.0,
      height: 10.2,
      aisles: 10,
      columns: 26,
      levels: 4,
      totalNiches: 1200,
      totalPallets: 2400
    },
    standards: ['SAP Fiori Horizon', 'Morning & Evening Themes', 'SAP Joule AI']
  });
});

// Redirección por defecto a index.html (fallback SPA)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('================================================================');
  console.log(`🚀 SAP WMS - Mapa 3D de Almacén (Gemelo Digital) iniciado`);
  console.log(`🌐 Acceso local:   http://localhost:${PORT}`);
  console.log(`🎨 Fiori Horizon:  Soporta temas Claro (Morning) y Oscuro (Evening)`);
  console.log(`🤖 Joule AI:       Asistente virtual activo para consultas de stock`);
  console.log('================================================================');
});
