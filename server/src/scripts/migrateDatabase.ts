import { QueryTypes } from 'sequelize';
import { sequelize } from '../config/database';

interface ColumnRow {
  columnName: string;
}

const columnsToEnsure = [
  { table: 'personas', column: 'empresa', definition: 'VARCHAR(60) NULL' },
  { table: 'fechas_corte', column: 'empresa', definition: 'VARCHAR(60) NULL' },
  { table: 'registros_asistencia', column: 'horasExtraDiurnaOrd', definition: 'DECIMAL(5,2) NOT NULL DEFAULT 0' },
  { table: 'registros_asistencia', column: 'horasExtraNocturnaOrd', definition: 'DECIMAL(5,2) NOT NULL DEFAULT 0' }
] as const;

const migrate = async (): Promise<void> => {
  try {
    await sequelize.authenticate();

    for (const item of columnsToEnsure) {
      const columns = await sequelize.query<ColumnRow>(
        `SELECT COLUMN_NAME AS columnName
         FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = :tableName
           AND COLUMN_NAME = :columnName`,
        {
          replacements: { tableName: item.table, columnName: item.column },
          type: QueryTypes.SELECT
        }
      );

      if (columns.length === 0) {
        await sequelize.query(
          `ALTER TABLE \`${item.table}\` ADD COLUMN \`${item.column}\` ${item.definition}`
        );
        console.log(`Columna ${item.table}.${item.column} creada`);
      } else {
        console.log(`Columna ${item.table}.${item.column} ya existe`);
      }
    }

    await sequelize.close();
  } catch (error) {
    console.error('Error ejecutando migraciones de base de datos', error);
    process.exitCode = 1;
  }
};

void migrate();