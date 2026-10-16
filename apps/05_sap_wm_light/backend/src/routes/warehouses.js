/* ============================================================
   Route: Warehouses — CRUD completo con DB
   ============================================================ */
'use strict';
const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { Warehouse, StorageType, StorageSection, StorageBin, StockQuant } = require('../models');
const { Op } = require('sequelize');
const router = express.Router();
router.use(authenticate);

// POST /warehouses — crear nuevo almacén
router.post('/', authorize('admin'), async (req, res, next) => {
  try {
    const { id, name, description } = req.body;
    if (!id || !name) return res.status(400).json({ error: 'Faltan campos obligatorios' });
    const exists = await Warehouse.findByPk(id);
    if (exists) return res.status(400).json({ error: 'El almacén ya existe' });
    
    const wh = await Warehouse.create({ id, name, description, status: 'ACTIVE' });
    res.status(201).json({ data: wh });
  } catch(e) { next(e); }
});

// GET /warehouses — listar todos los almacenes del usuario
router.get('/', async (req, res, next) => {
  try {
    const warehouses = await Warehouse.findAll({
      where: { status: { [Op.ne]: 'INACTIVE' } },
      order: [['id', 'ASC']]
    });
    // Enriquecer con conteo de bins y ocupación
    const result = await Promise.all(warehouses.map(async wh => {
      const totalBins = await StorageBin.count({ where: { warehouse_id: wh.id, status: 'ACTIVE' } });
      const occupiedBins = await StockQuant.count({
        where: { warehouse_id: wh.id },
        distinct: true, col: 'bin_id'
      });
      return {
        ...wh.toJSON(),
        bins: totalBins,
        occupancy: totalBins > 0 ? Math.round((occupiedBins / totalBins) * 100) : 0
      };
    }));
    res.json({ data: result });
  } catch(e) { next(e); }
});

// GET /warehouses/:id — detalle con storage types
router.get('/:id', async (req, res, next) => {
  try {
    const wh = await Warehouse.findByPk(req.params.id, {
      include: [{ model: StorageType, as: 'storageTypes',
        include: [{ model: StorageSection, as: 'sections' }]
      }]
    });
    if (!wh) return res.status(404).json({ error: 'Almacén no encontrado' });
    res.json({ data: wh });
  } catch(e) { next(e); }
});

// GET /warehouses/:id/kpis
router.get('/:id/kpis', async (req, res, next) => {
  try {
    const whId = req.params.id;
    const [totalBins, occupiedBins, totalStock] = await Promise.all([
      StorageBin.count({ where: { warehouse_id: whId, status: 'ACTIVE' } }),
      StockQuant.count({ where: { warehouse_id: whId }, distinct: true, col: 'bin_id' }),
      StockQuant.sum('quantity', { where: { warehouse_id: whId } })
    ]);
    res.json({
      data: {
        totalBins,
        occupiedBins,
        emptyBins: totalBins - occupiedBins,
        occupancyPct: totalBins > 0 ? Math.round((occupiedBins / totalBins) * 100) : 0,
        totalStock: totalStock || 0
      }
    });
  } catch(e) { next(e); }
});

// GET /warehouses/:id/bins?type=STANDARD&section=...&search=...
router.get('/:id/bins', async (req, res, next) => {
  try {
    const { type, section, search, status } = req.query;
    const where = { warehouse_id: req.params.id };
    if (type)    where.bin_type           = type;
    if (section) where.storage_section_id = section;
    if (status)  where.status             = status;
    if (search)  where.bin_code           = { [Op.iLike]: `%${search}%` };

    const bins = await StorageBin.findAll({
      where,
      order: [['bin_code', 'ASC']]
    });

    // Enrich with current stock count
    const enriched = await Promise.all(bins.map(async b => {
      const stockPositions = await StockQuant.count({ where: { bin_id: b.id } });
      return { ...b.toJSON(), hasStock: stockPositions > 0, stockPositions };
    }));

    res.json({ data: enriched, total: enriched.length });
  } catch(e) { next(e); }
});

// POST /warehouses/:id/bins — crear bin
router.post('/:id/bins', authorize('admin','supervisor'), async (req, res, next) => {
  try {
    const bin = await StorageBin.create({ ...req.body, warehouse_id: req.params.id });
    res.status(201).json({ data: bin });
  } catch(e) { next(e); }
});

// PUT /warehouses/:id/bins/:binId — actualizar bin
router.put('/:id/bins/:binId', authorize('admin','supervisor'), async (req, res, next) => {
  try {
    const bin = await StorageBin.findOne({ where: { id: req.params.binId, warehouse_id: req.params.id } });
    if (!bin) return res.status(404).json({ error: 'Bin no encontrado' });
    await bin.update(req.body);
    res.json({ data: bin });
  } catch(e) { next(e); }
});

// GET /warehouses/:id/storage-types — tipos de almacenamiento
router.get('/:id/storage-types', async (req, res, next) => {
  try {
    const types = await StorageType.findAll({
      where: { warehouse_id: req.params.id },
      include: [{ model: StorageSection, as: 'sections' }],
      order: [['code', 'ASC']]
    });
    res.json({ data: types, total: types.length });
  } catch(e) { next(e); }
});

// GET /warehouses/:id/storage-types/:typeId/sections
router.get('/:id/storage-types/:typeId/sections', async (req, res, next) => {
  try {
    const sections = await StorageSection.findAll({
      where: { storage_type_id: req.params.typeId },
      order: [['code', 'ASC']]
    });
    res.json({ data: sections });
  } catch(e) { next(e); }
});

// POST /warehouses/:id/storage-types — crear tipo de almacenamiento
router.post('/:id/storage-types', authorize('admin'), async (req, res, next) => {
  try {
    const st = await StorageType.create({ ...req.body, warehouse_id: req.params.id });
    res.status(201).json({ data: st });
  } catch(e) { next(e); }
});

// POST /warehouses — crear almacén
router.post('/', authorize('admin'), async (req, res, next) => {
  try {
    const wh = await Warehouse.create(req.body);
    res.status(201).json({ data: wh });
  } catch(e) { next(e); }
});

// PUT /warehouses/:id
router.put('/:id', authorize('admin'), async (req, res, next) => {
  try {
    const wh = await Warehouse.findByPk(req.params.id);
    if (!wh) return res.status(404).json({ error: 'Almacén no encontrado' });
    await wh.update(req.body);
    res.json({ data: wh });
  } catch(e) { next(e); }
});

// DELETE /warehouses/:id (soft delete — set INACTIVE)
router.delete('/:id', authorize('admin'), async (req, res, next) => {
  try {
    const wh = await Warehouse.findByPk(req.params.id);
    if (!wh) return res.status(404).json({ error: 'Almacén no encontrado' });
    await wh.update({ status: 'INACTIVE' });
    res.status(204).end();
  } catch(e) { next(e); }
});

// GET /warehouses/:id/layout — Topography & Occupancy for 2D Map
router.get('/:id/layout', async (req, res, next) => {
  try {
    const { Material } = require('../models');
    
    // Get all active bins for the warehouse
    const bins = await StorageBin.findAll({
      where: { warehouse_id: req.params.id, status: 'ACTIVE' },
      order: [['row', 'ASC'], ['bay', 'ASC'], ['level', 'ASC']]
    });

    // Get all stock for this warehouse
    const stocks = await StockQuant.findAll({
      where: { warehouse_id: req.params.id },
      include: [{ model: Material, as: 'material', attributes: ['sap_code', 'description'] }]
    });

    // Group stock by bin_id
    const stockByBin = {};
    stocks.forEach(s => {
      if (!stockByBin[s.bin_id]) stockByBin[s.bin_id] = [];
      stockByBin[s.bin_id].push(s);
    });

    // Group bins by row and bay (Columns)
    const columnsMap = {};
    const rowMapping = {}; // To assign X coordinate dynamically
    let currentX = 0;

    bins.forEach(bin => {
      // Use fallback if row/bay are missing
      const r = bin.row || 'UNASSIGNED';
      const b = bin.bay || '01';
      
      if (r !== 'UNASSIGNED' && rowMapping[r] === undefined) {
        rowMapping[r] = currentX++;
      }
      
      const colId = `${r}-${b}`;
      if (!columnsMap[colId]) {
        columnsMap[colId] = {
          id: colId,
          row: r,
          bay: b,
          x: rowMapping[r] || 0,
          y: parseInt(b) || 0,
          total_bins: 0,
          occupied_bins: 0,
          levels: []
        };
      }

      const binStock = stockByBin[bin.id] || [];
      const isOccupied = binStock.length > 0;
      
      columnsMap[colId].total_bins++;
      if (isOccupied) columnsMap[colId].occupied_bins++;

      columnsMap[colId].levels.push({
        id: bin.id,
        bin_code: bin.bin_code,
        level: bin.level || '01',
        position: bin.position,
        inventory_block: bin.inventory_block,
        status: bin.status,
        has_stock: isOccupied,
        stock: binStock.map(st => ({
          sku: st.material?.sap_code,
          description: st.material?.description,
          quantity: st.quantity,
          uom: st.unit,
          batch: st.batch_id,
          stock_type: st.stock_type
        }))
      });
    });

    // Calculate overall status and occupancy for each column
    const columns = Object.values(columnsMap).map(col => {
      col.occupancy_pct = col.total_bins > 0 ? Math.round((col.occupied_bins / col.total_bins) * 100) : 0;
      
      // Determine color/status
      if (col.occupancy_pct === 0) col.status = 'EMPTY';
      else if (col.occupancy_pct >= 90) col.status = 'FULL';
      else col.status = 'PARTIAL';

      // Check if any bin is blocked
      const hasBlocked = col.levels.some(l => l.inventory_block || l.status === 'BLOCKED');
      if (hasBlocked) col.status = 'BLOCKED';

      return col;
    });

    res.json({ data: columns });
  } catch(e) { next(e); }
});

module.exports = router;
