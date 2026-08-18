import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface TurnoAttributes {
  id: number;
  nombre: string;
  horaEntrada: string;
  horaSalida: string;
  esDominical: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type TurnoCreationAttributes = Optional<TurnoAttributes, 'id' | 'esDominical'>;

export class Turno extends Model<TurnoAttributes, TurnoCreationAttributes> implements TurnoAttributes {
  declare id: number;
  declare nombre: string;
  declare horaEntrada: string;
  declare horaSalida: string;
  declare esDominical: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Turno.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    horaEntrada: {
      type: DataTypes.TIME,
      allowNull: false
    },
    horaSalida: {
      type: DataTypes.TIME,
      allowNull: false
    },
    esDominical: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    sequelize,
    tableName: 'turnos'
  }
);
