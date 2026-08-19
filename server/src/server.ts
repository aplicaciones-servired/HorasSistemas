import app from './app';
import { sequelize } from './config/database';
import './models';

const port = Number(process.env.PORT ?? '3000');

const start = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Conexion con la base de datos establecida');

    app.listen(port, '0.0.0.0', () => {
      console.log(`Servidor ejecutandose en http://0.0.0.0:${port}`);
    });
  } catch (error) {
    console.error('No se pudo iniciar el servidor', error);
    process.exit(1);
  }
};

void start();