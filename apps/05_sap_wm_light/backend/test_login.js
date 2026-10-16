const path = require('path');
const db = require('./src/models');
const bcrypt = require('bcryptjs');

async function test() {
  await db.sequelize.authenticate();
  console.log('Database connected!');

  const user = await db.User.findOne({ where: { email: 'admin@jmholding.org' } });
  if (!user) {
    console.log('User not found!');
    return;
  }
  console.log('User found:', user.email);

  const valid = await user.checkPassword('Admin1234!');
  console.log('Password "Admin1234!" valid?', valid);
  
  const validOld = await user.checkPassword('admin');
  console.log('Password "admin" valid?', validOld);
}

test().catch(err => {
  console.error(err);
}).finally(() => {
  process.exit(0);
});
