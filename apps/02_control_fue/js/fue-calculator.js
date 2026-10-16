/* ==========================================================================
   SAP S/4HANA FUE (FULL USER EQUIVALENT) CALCULATOR & SIMULATOR ENGINE
   ========================================================================== */

class FUEManager {
  constructor(contract, users) {
    this.contract = JSON.parse(JSON.stringify(contract));
    this.users = JSON.parse(JSON.stringify(users));
  }

  // Actualizar contrato o ratios
  updateContractSettings(newSettings) {
    this.contract = { ...this.contract, ...newSettings };
  }

  // Obtener ratio individual de FUE por tipo de licencia
  getRatio(licenseType) {
    return this.contract.ratios[licenseType] || 0;
  }

  // Obtener costo unitario individual de licencia por tipo
  getCost(licenseType) {
    return (this.contract.ratios[licenseType] || 0) * this.contract.costPerFUE;
  }

  // Calcular métricas principales del estado actual
  calculateMetrics(filteredUsers = null) {
    const userList = filteredUsers || this.users;

    let totalActiveUsers = 0;
    let totalInactiveUsers = 0;
    let totalConsumedFUE = 0;
    let totalInactiveFUE = 0;

    const breakdown = {
      Developer: { active: 0, inactive: 0, fue: 0, cost: 0 },
      Advanced: { active: 0, inactive: 0, fue: 0, cost: 0 },
      Core: { active: 0, inactive: 0, fue: 0, cost: 0 },
      SelfService: { active: 0, inactive: 0, fue: 0, cost: 0 }
    };

    userList.forEach(u => {
      const type = u.licenseType;
      const ratio = this.getRatio(type);
      const isAct = u.status === 'Active';

      if (isAct) {
        totalActiveUsers++;
        const userFue = ratio;
        totalConsumedFUE += userFue;
        
        if (breakdown[type]) {
          breakdown[type].active++;
          breakdown[type].fue += userFue;
          breakdown[type].cost += userFue * this.contract.costPerFUE;
        }
      } else {
        totalInactiveUsers++;
        totalInactiveFUE += ratio;
        if (breakdown[type]) {
          breakdown[type].inactive++;
        }
      }
    });

    // Redondear FUE a 2 decimales
    totalConsumedFUE = Math.round(totalConsumedFUE * 100) / 100;
    const contractedFUE = this.contract.totalContractedFUE;
    const usagePercentage = Math.round((totalConsumedFUE / contractedFUE) * 100 * 10) / 10;
    const remainingFUE = Math.round((contractedFUE - totalConsumedFUE) * 100) / 100;
    const totalMonthlyCost = Math.round(totalConsumedFUE * this.contract.costPerFUE);

    // Determinar Estado de Cumplimiento
    let statusState = "normal"; // normal, warning, critical
    let statusLabel = "Dentro del Límite de Contrato";
    if (usagePercentage >= this.contract.criticalThreshold) {
      statusState = "critical";
      statusLabel = "CRÍTICO: Exceso o Límite Inminente de FUE";
    } else if (usagePercentage >= this.contract.warningThreshold) {
      statusState = "warning";
      statusLabel = "ALERTA: Próximo al Límite de FUE (85%+)";
    }

    // Calcular Oportunidades de Optimización y Ahorro
    const savingsReport = this.calculateOptimizationSavings(userList);

    return {
      contractedFUE,
      totalConsumedFUE,
      remainingFUE,
      usagePercentage,
      statusState,
      statusLabel,
      totalActiveUsers,
      totalInactiveUsers,
      totalMonthlyCost,
      breakdown,
      savingsReport
    };
  }

  // Calcular ahorros potenciales por optimización y recuperación de licencias
  calculateOptimizationSavings(userList) {
    let recoverableInactiveFUE = 0;
    let recoverableInactiveCost = 0;
    let inactiveUsersCount = 0;

    let reclassifiableFUE = 0;
    let reclassifiableCost = 0;
    let reclassifiableUsersCount = 0;

    userList.forEach(u => {
      const ratio = this.getRatio(u.licenseType);
      
      // Caso 1: Usuarios inactivos con licencia asignada
      if (u.status === 'Inactive' && ratio > 0) {
        inactiveUsersCount++;
        recoverableInactiveFUE += ratio;
        recoverableInactiveCost += ratio * this.contract.costPerFUE;
      }

      // Caso 2: Usuarios Advanced sugeridos para pasar a Core
      if (u.status === 'Active' && u.optimizationSuggested && u.optimizationSuggested.includes('Reclasificar a Core')) {
        reclassifiableUsersCount++;
        const deltaFue = this.getRatio('Advanced') - this.getRatio('Core'); // 1.0 - 0.25 = 0.75 FUE
        reclassifiableFUE += deltaFue;
        reclassifiableCost += deltaFue * this.contract.costPerFUE;
      }
    });

    const totalPotentialFUE = Math.round((recoverableInactiveFUE + reclassifiableFUE) * 100) / 100;
    const totalPotentialUSD = Math.round(recoverableInactiveCost + reclassifiableCost);

    return {
      inactiveUsersCount,
      recoverableInactiveFUE: Math.round(recoverableInactiveFUE * 100) / 100,
      recoverableInactiveCost: Math.round(recoverableInactiveCost),
      reclassifiableUsersCount,
      reclassifiableFUE: Math.round(reclassifiableFUE * 100) / 100,
      reclassifiableCost: Math.round(reclassifiableCost),
      totalPotentialFUE,
      totalPotentialUSD,
      totalPotentialAnnualUSD: totalPotentialUSD * 12
    };
  }

  // Motor de Simulación What-If
  simulateScenario(deltas) {
    // deltas = { Developer: +2, Advanced: -5, Core: +10, SelfService: +20 }
    const currentMetrics = this.calculateMetrics();
    
    let simFUE = currentMetrics.totalConsumedFUE;

    Object.keys(deltas).forEach(type => {
      const deltaQty = deltas[type] || 0;
      const ratio = this.getRatio(type);
      simFUE += deltaQty * ratio;
    });

    simFUE = Math.round(simFUE * 100) / 100;
    const contracted = this.contract.totalContractedFUE;
    const simPercentage = Math.round((simFUE / contracted) * 100 * 10) / 10;
    const simRemaining = Math.round((contracted - simFUE) * 100) / 100;
    const simMonthlyCost = Math.round(simFUE * this.contract.costPerFUE);
    const costDiff = simMonthlyCost - currentMetrics.totalMonthlyCost;

    let simStatus = "normal";
    if (simPercentage >= this.contract.criticalThreshold) simStatus = "critical";
    else if (simPercentage >= this.contract.warningThreshold) simStatus = "warning";

    return {
      currentFUE: currentMetrics.totalConsumedFUE,
      simulatedFUE: simFUE,
      deltaFUE: Math.round((simFUE - currentMetrics.totalConsumedFUE) * 100) / 100,
      simulatedPercentage: simPercentage,
      simulatedRemaining: simRemaining,
      simulatedCost: simMonthlyCost,
      costDiff: costDiff,
      simStatus: simStatus
    };
  }
}
