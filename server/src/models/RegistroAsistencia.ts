import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { Cargo } from './Cargo';
import { Persona } from './Persona';
import { FechaCorte } from './FechaCorte';

export interface RegistroAsistenciaAttributes {
  id: number;
  personaId: number;
  cargoId: number | null;
  fechaCorteId: number | null;
  fecha: string;
  horaEntrada: string;
  horaSalida: string;
  observacion: string | null;
  esDominical: boolean;
  horasExtraDiurnaOrd: number;
  horasExtraNocturnaOrd: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type RegistroAsistenciaCreationAttributes = Optional<RegistroAsistenciaAttributes, 'id' | 'cargoId' | 'fechaCorteId' | 'observacion' | 'esDominical' | 'horasExtraDiurnaOrd' | 'horasExtraNocturnaOrd'>;

export class RegistroAsistencia extends Model<RegistroAsistenciaAttributes, RegistroAsistenciaCreationAttributes> implements RegistroAsistenciaAttributes {
  declare id: number;
  declare personaId: number;
  declare cargoId: number | null;
  declare fechaCorteId: number | null;
  declare fecha: string;
  declare horaEntrada: string;
  declare horaSalida: string;
  declare observacion: string | null;
  declare esDominical: boolean;
  declare horasExtraDiurnaOrd: number;
  declare horasExtraNocturnaOrd: number;
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
    fechaCorteId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: FechaCorte,
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
    },
    esDominical: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    horasExtraDiurnaOrd: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0
    },
    horasExtraNocturnaOrd: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0
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