const express = require('express');
const router = express.Router();
const { sequelize, LaborStandard, TaskExecution, User } = require('../models');
const { authenticate } = require('../middleware/auth'); // assuming standard auth middleware

// Require Authentication for all LMS routes
router.use(authenticate);

// ==========================================
// LMS Dashboard Metrics
// ==========================================

// Get overall warehouse efficiency today
router.get('/dashboard/efficiency', async (req, res) => {
  try {
    const warehouseId = req.user.current_warehouse || req.query.warehouse_id || 'WH001';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const executions = await TaskExecution.findAll({
      where: {
        warehouse_id: warehouseId,
        completed_at: { [sequelize.Sequelize.Op.gte]: today }
      }
    });

    let totalStandard = 0;
    let totalActual = 0;
    executions.forEach(exec => {
      totalStandard += exec.standard_time_sec;
      totalActual += exec.actual_time_sec;
    });

    let overallEfficiency = 0;
    if (totalActual > 0) {
      overallEfficiency = (totalStandard / totalActual) * 100;
    }

    res.json({
      efficiency_percent: overallEfficiency.toFixed(2),
      total_tasks: executions.length,
      total_standard_sec: totalStandard,
      total_actual_sec: totalActual
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error calculating dashboard efficiency' });
  }
});

// Get operator leaderboard for today
router.get('/dashboard/leaderboard', async (req, res) => {
  try {
    const warehouseId = req.user.current_warehouse || req.query.warehouse_id || 'WH001';
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const leaderboardData = await TaskExecution.findAll({
      attributes: [
        'user_id',
        [sequelize.fn('COUNT', sequelize.col('TaskExecution.id')), 'task_count'],
        [sequelize.fn('SUM', sequelize.col('standard_time_sec')), 'total_standard_sec'],
        [sequelize.fn('SUM', sequelize.col('actual_time_sec')), 'total_actual_sec'],
      ],
      where: {
        warehouse_id: warehouseId,
        completed_at: { [sequelize.Sequelize.Op.gte]: today }
      },
      group: ['user_id', 'user.id', 'user.name', 'user.email'],
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }]
    });

    const formattedLeaderboard = leaderboardData.map(item => {
      const actual = parseFloat(item.getDataValue('total_actual_sec'));
      const std = parseFloat(item.getDataValue('total_standard_sec'));
      const efficiency = actual > 0 ? (std / actual) * 100 : 0;
      
      return {
        user: item.user,
        task_count: parseInt(item.getDataValue('task_count')),
        efficiency_percent: efficiency.toFixed(2)
      };
    });

    // Sort by highest efficiency
    formattedLeaderboard.sort((a, b) => parseFloat(b.efficiency_percent) - parseFloat(a.efficiency_percent));

    res.json(formattedLeaderboard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching leaderboard' });
  }
});


// ==========================================
// Labor Standards Management
// ==========================================

// Get all standards
router.get('/standards', async (req, res) => {
  try {
    const warehouseId = req.user.current_warehouse || req.query.warehouse_id;
    const standards = await LaborStandard.findAll({ where: { warehouse_id: warehouseId } });
    res.json(standards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching standards' });
  }
});

// Create or update standard
router.post('/standards', async (req, res) => {
  try {
    const warehouseId = req.user.current_warehouse || req.body.warehouse_id;
    const { task_type, base_time_sec, item_time_sec } = req.body;

    let standard = await LaborStandard.findOne({
      where: { warehouse_id: warehouseId, task_type }
    });

    if (standard) {
      standard.base_time_sec = base_time_sec;
      standard.item_time_sec = item_time_sec;
      standard.updated_by = req.user.id;
      await standard.save();
    } else {
      standard = await LaborStandard.create({
        warehouse_id: warehouseId,
        task_type,
        base_time_sec,
        item_time_sec,
        created_by: req.user.id
      });
    }

    res.json(standard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error saving standard' });
  }
});

module.exports = router;
