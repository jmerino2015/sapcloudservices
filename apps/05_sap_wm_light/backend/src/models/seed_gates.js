const db = require('./index');

async function run() {
  await db.sequelize.authenticate();
  console.log('Database connected');

  const gates = [
    { warehouse_id: 'WH001', code: 'GATE-01', type: 'GATE', status: 'AVAILABLE', description: 'Puerta Principal Entrada' },
    { warehouse_id: 'WH001', code: 'GATE-02', type: 'GATE', status: 'AVAILABLE', description: 'Puerta Secundaria Entrada' },
    { warehouse_id: 'WH001', code: 'GATE-03', type: 'GATE', status: 'AVAILABLE', description: 'Puerta Auxiliar Inbound' },
    { warehouse_id: 'WH001', code: 'GATE-04', type: 'GATE', status: 'AVAILABLE', description: 'Puerta Principal Salida' },
    { warehouse_id: 'WH001', code: 'GATE-05', type: 'GATE', status: 'AVAILABLE', description: 'Puerta de Emergencia / Respaldo' }
  ];

  for (const gate of gates) {
    const [record, created] = await db.YardLocation.findOrCreate({
      where: { warehouse_id: gate.warehouse_id, code: gate.code },
      defaults: gate
    });
    if (created) {
      console.log(`Created gate ${gate.code}`);
    } else {
      console.log(`Gate ${gate.code} already exists`);
    }
  }

  console.log('Completed');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
