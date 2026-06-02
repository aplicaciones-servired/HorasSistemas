import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface CargoAttributes {
  id: number;
  nombre: string;
  descripcion: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CargoCreationAttributes = Optional<CargoAttributes, 'id' | 'descripcion'>;

export class Cargo extends Model<CargoAttributes, CargoCreationAttributes> implements CargoAttributes {
  declare id: number;
  declare nombre: string;
  declare descripcion: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Cargo.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'cargos'
  }
);