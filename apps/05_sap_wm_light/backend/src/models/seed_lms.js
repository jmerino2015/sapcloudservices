'use strict';
require('dotenv').config();
const { sequelize, LaborStandard, TaskExecution, User, Warehouse } = require('./index');

async function seedLms() {
  console.log('🔄 Iniciando Seed LMS...');
  
  try {
    // 1. Obtener almacén principal
    const wh = await Warehouse.findOne({ where: { id: 'WH001' } });
    if (!wh) throw new Error('Almacén WH001 no encontrado. Ejecuta el seed general primero.');

    // 2. Crear Estándares de Trabajo
    console.log('📦 Creando Labor Standards...');
    const standards = [
      { warehouse_id: wh.id, task_type: 'PICKING', base_time_sec: 120, item_time_sec: 30 },
      { warehouse_id: wh.id, task_type: 'PUTAWAY', base_time_sec: 90, item_time_sec: 25 },
      { warehouse_id: wh.id, task_type: 'INTERNAL_MOVE', base_time_sec: 60, item_time_sec: 15 },
      { warehouse_id: wh.id, task_type: 'RECEPTION', base_time_sec: 300, item_time_sec: 45 },
      { warehouse_id: wh.id, task_type: 'INVENTORY', base_time_sec: 180, item_time_sec: 60 }
    ];

    for (const std of standards) {
      await LaborStandard.findOrCreate({
        where: { warehouse_id: wh.id, task_type: std.task_type },
        defaults: std
      });
    }

    // 3. Obtener un par de usuarios para simular
    const users = await User.findAll({ limit: 3 });
    if (users.length === 0) throw new Error('No hay usuarios para simular. Ejecuta el seed general primero.');

    console.log('⏱️ Simulando Task Executions históricas (hoy)...');
    
    // Función para generar tiempo aleatorio cerca del estándar
    const generateRandomActualTime = (standardTime) => {
      // Variación entre 80% y 130% del estándar
      const factor = 0.8 + (Math.random() * 0.5); 
      return Math.round(standardTime * factor);
    };

    const taskTypes = ['PICKING', 'PUTAWAY', 'INTERNAL_MOVE'];
    const today = new Date();
    today.setHours(today.getHours() - 8); // Start 8 hours ago

    for (let i = 0; i < 15; i++) {
      const user = users[i % users.length];
      const taskType = taskTypes[i % taskTypes.length];
      
      const std = standards.find(s => s.task_type === taskType);
      const items = Math.floor(Math.random() * 5) + 1;
      const standardTimeSec = std.base_time_sec + (std.item_time_sec * items);
      
      const actualTimeSec = generateRandomActualTime(standardTimeSec);
      
      const startedAt = new Date(today);
      startedAt.setMinutes(startedAt.getMinutes() + (i * 30));
      
      const completedAt = new Date(startedAt);
      completedAt.setSeconds(completedAt.getSeconds() + actualTimeSec);

      await TaskExecution.create({
        user_id: user.id,
        warehouse_id: wh.id,
        task_type: taskType,
        reference_id: 1000 + i,
        reference_number: `TO-SIM-${1000+i}`,
        started_at: startedAt,
        completed_at: completedAt,
        standard_time_sec: standardTimeSec,
        actual_time_sec: actualTimeSec,
        efficiency_percent: (standardTimeSec / actualTimeSec) * 100
      });
    }

    console.log('✅ Seed LMS completado con éxito!');
  } catch (error) {
    console.error('❌ Error en Seed LMS:', error);
  } finally {
    process.exit(0);
  }
}

seedLms();
