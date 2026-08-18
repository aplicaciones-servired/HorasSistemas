import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface FechaCorteAttributes {
  id: number;
  fechaInicio: string;
  fechaFin: string;
  descripcion: string | null;
  completada: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type FechaCorteCreationAttributes = Optional<FechaCorteAttributes, 'id' | 'descripcion' | 'completada'>;

export class FechaCorte extends Model<FechaCorteAttributes, FechaCorteCreationAttributes> implements FechaCorteAttributes {
  declare id: number;
  declare fechaInicio: string;
  declare fechaFin: string;
  declare descripcion: string | null;
  declare completada: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

FechaCorte.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    fechaInicio: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    fechaFin: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    completada: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    sequelize,
    tableName: 'fechas_corte'
  }
);
