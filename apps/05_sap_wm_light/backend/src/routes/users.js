/* ============================================================
   Route: Users — Gestión de usuarios y roles
   ============================================================ */
'use strict';
const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { User, Warehouse, UserWarehouse } = require('../models');
const { body, validationResult } = require('express-validator');
const router = express.Router();
router.use(authenticate, authorize('admin'));

// GET /users
router.get('/', async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password_hash'] },
      include: [{ model: Warehouse, as: 'warehouses', attributes: ['id','name'], through: { attributes: [] } }],
      order: [['name','ASC']]
    });
    res.json({ data: users });
  } catch(e) { next(e); }
});

// GET /users/:id
router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password_hash'] },
      include: [{ model: Warehouse, as: 'warehouses', through: { attributes: [] } }]
    });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ data: user });
  } catch(e) { next(e); }
});

// POST /users — crear usuario
router.post('/', [
  body('name').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('role').isIn(['admin','supervisor','operator'])
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { name, email, password, role, warehouses = [] } = req.body;
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ error: 'El email ya está registrado' });

    const password_hash = await User.hashPassword(password);
    const initials = name.split(' ').map(w => w[0]).join('').slice(0,3).toUpperCase();
    const user = await User.create({ name, email, password_hash, role, initials, status: 'ACTIVE' });

    // Asignar almacenes
    if (warehouses.length) {
      await UserWarehouse.bulkCreate(warehouses.map(wh => ({ user_id: user.id, warehouse_id: wh })));
    }
    const { password_hash: _, ...safe } = user.toJSON();
    res.status(201).json({ data: safe });
  } catch(e) { next(e); }
});

// PUT /users/:id
router.put('/:id', async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    const { password, warehouses, ...fields } = req.body;
    if (password) fields.password_hash = await User.hashPassword(password);
    await user.update(fields);
    if (warehouses) {
      await UserWarehouse.destroy({ where: { user_id: user.id } });
      await UserWarehouse.bulkCreate(warehouses.map(wh => ({ user_id: user.id, warehouse_id: wh })));
    }
    const updated = await User.findByPk(user.id, { attributes: { exclude: ['password_hash'] } });
    res.json({ data: updated });
  } catch(e) { next(e); }
});

// PATCH /users/:id/deactivate
router.patch('/:id/deactivate', async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    if (user.id === req.user.id) return res.status(400).json({ error: 'No puedes desactivarte a ti mismo' });
    await user.update({ status: 'INACTIVE' });
    res.json({ message: 'Usuario desactivado' });
  } catch(e) { next(e); }
});

module.exports = router;
