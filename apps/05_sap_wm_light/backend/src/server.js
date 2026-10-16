/* ============================================================
   WM Light — Backend Server (server.js)
   Node.js + Express REST API
   ============================================================ */

'use strict';
require('dotenv').config();

const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const morgan      = require('morgan');
const compression = require('compression');
const rateLimit   = require('express-rate-limit');
const path        = require('path');

const app = express();

/* ── MIDDLEWARE ─────────────────────────────────────────────── */
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

/* ── RATE LIMITING ──────────────────────────────────────────── */
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 500,
  message: { error: 'Demasiadas solicitudes, intente más tarde' }
}));

/* ── STATIC (Serve frontend always) ────────────────────────── */
app.use(express.static(path.join(__dirname, '../../frontend')));

/* ── API ROUTES ─────────────────────────────────────────────── */
app.use('/api/auth',            require('./routes/auth'));
app.use('/api/warehouses',      require('./routes/warehouses'));
app.use('/api/materials',       require('./routes/materials'));
app.use('/api/batches',         require('./routes/batches'));
app.use('/api/stock',           require('./routes/stock'));
app.use('/api/transfer-orders', require('./routes/transferOrders'));
app.use('/api/gr',              require('./routes/gr'));
app.use('/api/gi',              require('./routes/gi'));
app.use('/api/inventory-counts',require('./routes/inventoryCounts'));
app.use('/api/users',           require('./routes/users'));
app.use('/api/sap',             require('./routes/sap'));
app.use('/api/reports',         require('./routes/reports'));
app.use('/api/movement-types',  require('./routes/movementTypes'));
app.use('/api/yard',            require('./routes/yard'));
app.use('/api/lms',             require('./routes/lms'));
app.use('/api/slotting',        require('./routes/slotting'));

/* ── HEALTH CHECK ───────────────────────────────────────────── */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', timestamp: new Date().toISOString() });
});

/* ── SPA FALLBACK ───────────────────────────────────────────── */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

/* ── ERROR HANDLER ──────────────────────────────────────────── */
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

/* ── START ──────────────────────────────────────────────────── */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ WM Light API running on port ${PORT} [${process.env.NODE_ENV}]`);
});

// Start SAP sync scheduler
require('./middleware/sapSync');

module.exports = app;
