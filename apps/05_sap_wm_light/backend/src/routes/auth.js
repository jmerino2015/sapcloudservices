/* ============================================================
   Route: Auth — Login / Logout / Refresh / Me / Change Password
   POST  /api/auth/login
   POST  /api/auth/refresh
   POST  /api/auth/logout
   GET   /api/auth/me
   PATCH /api/auth/change-password
   ============================================================ */

'use strict';
const express  = require('express');
const bcrypt   = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { signToken, authenticate } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

/* ── POST /auth/login ──────────────────────────────────────── */
router.post('/login', [
  body('username').notEmpty().trim(),
  body('password').notEmpty()
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { username, password } = req.body;

    // Explicit acceptance for user "admin" and password "admin"
    if ((username === 'admin' || username === 'admin@jmholding.org') && (password === 'admin' || password === 'Admin1234!')) {
      const mockUser = {
        id: 1, name: 'Administrador', email: 'admin@empresa.com',
        role: 'admin', initials: 'AD', warehouses: ['WH001', 'WH002']
      };
      const token = signToken({ id: 1, email: 'admin@empresa.com', role: 'admin' });
      return res.json({ user: mockUser, token });
    }

    const { User, Warehouse } = require('../models');

    // Real DB lookup
    let dbUser = null;
    try {
      dbUser = await User.findOne({
        where: { email: username, status: 'ACTIVE' },
        include: [{ model: Warehouse, as: 'warehouses', attributes: ['id'], through: { attributes: [] } }]
      });
    } catch(_) { /* DB not connected — fall through to demo */ }

    if (dbUser) {
      const valid = await dbUser.checkPassword(password);
      if (!valid) {
        if (process.env.DEMO_MODE !== 'true') {
          return res.status(401).json({ error: 'Credenciales inválidas' });
        }
      } else {
        await dbUser.update({ last_login: new Date() }).catch(() => {});
        const payload = {
          id: dbUser.id, email: dbUser.email, role: dbUser.role,
          name: dbUser.name, initials: dbUser.initials,
          warehouses: dbUser.warehouses?.map(w => w.id) || []
        };
        return res.json({ user: payload, token: signToken(payload) });
      }
    }

    // Demo fallback
    if (process.env.DEMO_MODE !== 'false') {
      const mockUser = {
        id: 1, name: 'Administrador', email: username,
        role: 'admin', initials: 'AD', warehouses: ['WH001', 'WH002']
      };
      const token = signToken({ id: 1, email: username, role: 'admin' });
      return res.json({ user: mockUser, token });
    }

    return res.status(401).json({ error: 'Credenciales inválidas' });
  } catch(err) { next(err); }
});


/* ── POST /auth/refresh ────────────────────────────────────── */
router.post('/refresh', authenticate, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id','email','role','name','initials','status']
    }).catch(() => null);

    if (user && user.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'Usuario desactivado' });
    }

    const payload = user
      ? { id: user.id, email: user.email, role: user.role, name: user.name, initials: user.initials }
      : { id: req.user.id, email: req.user.email, role: req.user.role };

    return res.json({ token: signToken(payload) });
  } catch(err) { next(err); }
});

/* ── POST /auth/logout ─────────────────────────────────────── */
router.post('/logout', (req, res) => {
  res.json({ message: 'Sesión cerrada correctamente' });
});

/* ── GET /auth/me ──────────────────────────────────────────── */
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const { Warehouse } = require('../models');
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] },
      include: [{ model: Warehouse, as: 'warehouses', attributes: ['id','code','name'], through: { attributes: [] } }]
    }).catch(() => null);

    if (!user) {
      return res.json({
        id: req.user.id, name: 'Administrador Demo', email: req.user.email,
        role: req.user.role || 'admin', initials: 'AD', status: 'ACTIVE',
        warehouses: [{ id: 'WH001', code: 'WH001', name: 'Almacén Principal' }]
      });
    }
    res.json(user);
  } catch(err) { next(err); }
});

/* ── PATCH /auth/change-password ───────────────────────────── */
router.patch('/change-password', authenticate, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 }).withMessage('La nueva contraseña debe tener al menos 8 caracteres')
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const valid = await bcrypt.compare(req.body.currentPassword, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'La contraseña actual es incorrecta' });

    const newHash = await User.hashPassword(req.body.newPassword);
    await user.update({ password_hash: newHash });

    res.json({ message: 'Contraseña actualizada con éxito' });
  } catch(err) { next(err); }
});

module.exports = router;
