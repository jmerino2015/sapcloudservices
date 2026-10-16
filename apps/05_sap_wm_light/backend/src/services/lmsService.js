const { LaborStandard, TaskExecution, User } = require('../models');

class LmsService {
  /**
   * Calculates the standard time for a specific task
   */
  static async calculateStandardTime(warehouseId, taskType, itemCount = 1) {
    try {
      // Find the labor standard for this task type
      const standard = await LaborStandard.findOne({
        where: { warehouse_id: warehouseId, task_type: taskType }
      });

      if (!standard) {
        return 0; // If no standard is configured, default to 0
      }

      const base = standard.base_time_sec || 0;
      const variable = (standard.item_time_sec || 0) * itemCount;
      
      return Math.round(base + variable);
    } catch (error) {
      console.error('Error calculating standard time:', error);
      return 0;
    }
  }

  /**
   * Registers the completion of a task and calculates efficiency
   */
  static async recordTaskExecution(userId, warehouseId, taskType, referenceId, referenceNumber, startedAt, completedAt, standardTimeSec) {
    try {
      const execution = await TaskExecution.create({
        user_id: userId,
        warehouse_id: warehouseId,
        task_type: taskType,
        reference_id: referenceId,
        reference_number: referenceNumber,
        started_at: startedAt,
        completed_at: completedAt,
        standard_time_sec: standardTimeSec
      });
      return execution;
    } catch (error) {
      console.error('Error recording task execution:', error);
      throw error;
    }
  }
}

module.exports = LmsService;
