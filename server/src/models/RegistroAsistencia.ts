import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { Cargo } from './Cargo';
import { Persona } from './Persona';

export interface RegistroAsistenciaAttributes {
  id: number;
  personaId: number;
  cargoId: number | null;
  fecha: string;
  horaEntrada: string;
  horaSalida: string;
  observacion: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type RegistroAsistenciaCreationAttributes = Optional<RegistroAsistenciaAttributes, 'id' | 'cargoId' | 'observacion'>;

export class RegistroAsistencia extends Model<RegistroAsistenciaAttributes, RegistroAsistenciaCreationAttributes> implements RegistroAsistenciaAttributes {
  declare id: number;
  declare personaId: number;
  declare cargoId: number | null;
  declare fecha: string;
  declare horaEntrada: string;
  declare horaSalida: string;
  declare observacion: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

RegistroAsistencia.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    personaId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: Persona,
        key: 'id'
      }
    },
    cargoId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: Cargo,
        key: 'id'
      }
    },
    fecha: {
      type: DataTypes.DATEONLY,
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
    observacion: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'registros_asistencia',
    indexes: [
      {
        unique: true,
        fields: ['personaId', 'fecha']
      }
    ]
  }
);