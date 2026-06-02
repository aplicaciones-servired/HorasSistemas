import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { Cargo } from './Cargo';

export interface PersonaAttributes {
  id: number;
  cedula: string;
  nombres: string;
  apellidos: string;
  cargoId: number | null;
  activo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type PersonaCreationAttributes = Optional<PersonaAttributes, 'id' | 'cargoId' | 'activo'>;

export class Persona extends Model<PersonaAttributes, PersonaCreationAttributes> implements PersonaAttributes {
  declare id: number;
  declare cedula: string;
  declare nombres: string;
  declare apellidos: string;
  declare cargoId: number | null;
  declare activo: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Persona.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    cedula: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true
    },
    nombres: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    apellidos: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    cargoId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: Cargo,
        key: 'id'
      }
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  },
  {
    sequelize,
    tableName: 'personas'
  }
);