/* ============================================================
   Model: TaskExecution
   LMS: Registra la ejecución real de tareas y su eficiencia
   ============================================================ */
'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TaskExecution = sequelize.define('TaskExecution', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  warehouse_id: { type: DataTypes.STRING(10), allowNull: false },
  task_type: { type: DataTypes.STRING(50), allowNull: false }, // 'TRANSFER_ORDER', 'INVENTORY', etc.
  reference_id: { type: DataTypes.INTEGER }, // ID de la TO, GR, etc.
  reference_number: { type: DataTypes.STRING(50) }, // TO-2024-001
  
  started_at: { type: DataTypes.DATE, allowNull: false },
  completed_at: { type: DataTypes.DATE, allowNull: false },
  
  standard_time_sec: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  actual_time_sec: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  efficiency_percent: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 }, // Ej. 105.50 para 105.5%
  
  notes: { type: DataTypes.TEXT }
}, {
  tableName: 'task_executions',
  hooks: {
    beforeSave: (execution) => {
      // Calcular tiempo real y eficiencia si tenemos fechas y tiempo estándar
      if (execution.started_at && execution.completed_at) {
        const actualMs = new Date(execution.completed_at) - new Date(execution.started_at);
        execution.actual_time_sec = Math.round(actualMs / 1000);
        
        if (execution.standard_time_sec > 0 && execution.actual_time_sec > 0) {
          execution.efficiency_percent = (execution.standard_time_sec / execution.actual_time_sec) * 100;
        } else {
          execution.efficiency_percent = 0;
        }
      }
    }
  }
});

module.exports = TaskExecution;
