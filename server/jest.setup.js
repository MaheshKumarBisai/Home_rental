const sequelize = require('./config/database');

beforeAll(async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('Test database synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing test database:', error);
    process.exit(1);
  }
});

afterAll(async () => {
  await sequelize.close();
});
