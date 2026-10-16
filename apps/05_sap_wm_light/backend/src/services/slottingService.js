'use strict';
const { sequelize, Material, StorageBin, StockQuant, ProductAffinity, SlottingRecommendation, GoodsIssue, GoodsIssueItem } = require('../models');

class SlottingService {
  
  /**
   * 1. Calculate ABC Analysis based on historical Goods Issue frequency
   */
  static async calculateABC(warehouseId) {
    try {
      // Simplification: Count how many times each material was picked
      const picks = await GoodsIssueItem.findAll({
        attributes: [
          'material_id',
          [sequelize.fn('COUNT', sequelize.col('GoodsIssueItem.id')), 'pick_count']
        ],
        include: [{
          model: GoodsIssue,
          where: { warehouse_id: warehouseId, status: 'CONFIRMED' },
          attributes: []
        }],
        group: ['material_id']
      });

      // Sort by pick count descending
      picks.sort((a, b) => parseInt(b.getDataValue('pick_count')) - parseInt(a.getDataValue('pick_count')));

      const totalMaterials = picks.length;
      if (totalMaterials === 0) return;

      // Pareto Rule: Top 20% = A, Next 30% = B, Bottom 50% = C
      const cutoffA = Math.ceil(totalMaterials * 0.20);
      const cutoffB = Math.ceil(totalMaterials * 0.50);

      for (let i = 0; i < totalMaterials; i++) {
        const materialId = picks[i].getDataValue('material_id');
        const pickCount = parseInt(picks[i].getDataValue('pick_count'));
        let abc = 'C';
        if (i < cutoffA) abc = 'A';
        else if (i < cutoffB) abc = 'B';

        await Material.update({ abc_indicator: abc, pick_frequency: pickCount }, { where: { id: materialId } });
      }

      return { processed: totalMaterials };
    } catch (error) {
      console.error('Error calculating ABC:', error);
      throw error;
    }
  }

  /**
   * 2. Calculate Product Affinity
   */
  static async calculateAffinity(warehouseId) {
    try {
      // Find all completed GIs
      const gis = await GoodsIssue.findAll({
        where: { warehouse_id: warehouseId, status: 'CONFIRMED' },
        include: [{ model: GoodsIssueItem, as: 'items', attributes: ['material_id'] }]
      });

      const pairs = {};

      for (const gi of gis) {
        const items = gi.items.map(i => i.material_id);
        // Create unique pairs
        for (let i = 0; i < items.length; i++) {
          for (let j = i + 1; j < items.length; j++) {
            const m1 = Math.min(items[i], items[j]);
            const m2 = Math.max(items[i], items[j]);
            if (m1 === m2) continue;
            
            const key = `${m1}_${m2}`;
            pairs[key] = (pairs[key] || 0) + 1;
          }
        }
      }

      // Save to database
      for (const [key, score] of Object.entries(pairs)) {
        const [m1, m2] = key.split('_');
        let affinity = await ProductAffinity.findOne({
          where: { warehouse_id: warehouseId, material_id_1: m1, material_id_2: m2 }
        });

        if (affinity) {
          affinity.affinity_score = score;
          affinity.last_analyzed_at = new Date();
          await affinity.save();
        } else {
          await ProductAffinity.create({
            warehouse_id: warehouseId,
            material_id_1: m1,
            material_id_2: m2,
            affinity_score: score,
            last_analyzed_at: new Date()
          });
        }
      }

      return { pairs_processed: Object.keys(pairs).length };
    } catch (error) {
      console.error('Error calculating affinity:', error);
      throw error;
    }
  }

  /**
   * 3. Generate Slotting Recommendations
   */
  static async generateRecommendations(warehouseId) {
    try {
      // Find current stock
      const stock = await StockQuant.findAll({
        where: { warehouse_id: warehouseId, quantity: { [sequelize.Sequelize.Op.gt]: 0 } },
        include: [
          { model: Material, as: 'material' },
          { model: StorageBin, as: 'bin' }
        ]
      });

      let recommendationsGenerated = 0;

      // Clear previous pending recommendations
      await SlottingRecommendation.destroy({ where: { warehouse_id: warehouseId, status: 'PENDING' } });

      for (const quant of stock) {
        if (!quant.material || !quant.bin) continue;

        const materialAbc = quant.material.abc_indicator || 'C';
        const binClass = quant.bin.velocity_class || 'C';

        // Check if A product is in C bin
        if (materialAbc === 'A' && binClass === 'C') {
          // Find an empty or partial A bin
          const targetBin = await StorageBin.findOne({
            where: { 
              warehouse_id: warehouseId, 
              velocity_class: 'A', 
              status: 'ACTIVE',
              occupancy_pct: { [sequelize.Sequelize.Op.lt]: 100 }
            }
          });

          if (targetBin && targetBin.id !== quant.bin_id) {
            await SlottingRecommendation.create({
              warehouse_id: warehouseId,
              material_id: quant.material_id,
              batch_id: quant.batch_id,
              from_bin_id: quant.bin_id,
              to_bin_id: targetBin.id,
              quantity: quant.quantity,
              reason: 'MOVE_A_TO_FAST_BIN',
              created_by: 1 // System/Admin
            });
            recommendationsGenerated++;
          }
        }
        
        // Similar rules can be added for B products, or affinity checking
      }

      return { recommendations: recommendationsGenerated };
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }
  }
}

module.exports = SlottingService;
