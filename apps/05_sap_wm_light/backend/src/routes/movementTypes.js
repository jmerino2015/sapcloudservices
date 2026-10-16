/* ============================================================
   Route: Movement Types
   ============================================================ */
'use strict';
const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const MovementType = require('../models/MovementType');
const router = express.Router();

router.use(authenticate);

// GET /movement-types
router.get('/', async (req, res, next) => {
  try {
    const types = await MovementType.findAll({ order: [['id', 'ASC']] });
    res.json({ data: types });
  } catch (e) { next(e); }
});

// POST /movement-types
router.post('/', authorize('admin', 'supervisor'), async (req, res, next) => {
  try {
    const { id, description, type, state } = req.body;
    if (!id || !description || !type) return res.status(400).json({ error: 'Faltan campos obligatorios' });
    const exists = await MovementType.findByPk(id);
    if (exists) return res.status(400).json({ error: 'La clase de movimiento ya existe' });
    
    const mt = await MovementType.create({ id, description, type, state });
    res.status(201).json({ data: mt });
  } catch (e) { next(e); }
});

module.exports = router;
