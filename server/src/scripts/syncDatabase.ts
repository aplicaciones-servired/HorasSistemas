import { sequelize } from '../config/database';
import '../models';

const sync = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('Base de datos sincronizada');
    process.exit(0);
  } catch (error) {
    console.error('Error sincronizando la base de datos', error);
    process.exit(1);
  }
};

void sync();