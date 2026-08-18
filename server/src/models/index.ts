import { Cargo } from './Cargo';
import { FechaCorte } from './FechaCorte';
import { Persona } from './Persona';
import { RegistroAsistencia } from './RegistroAsistencia';
import { Turno } from './Turno';

Cargo.hasMany(Persona, { foreignKey: 'cargoId', as: 'personas' });
Persona.belongsTo(Cargo, { foreignKey: 'cargoId', as: 'cargo' });

Persona.hasMany(RegistroAsistencia, { foreignKey: 'personaId', as: 'registros' });
RegistroAsistencia.belongsTo(Persona, { foreignKey: 'personaId', as: 'persona' });

Cargo.hasMany(RegistroAsistencia, { foreignKey: 'cargoId', as: 'registros' });
RegistroAsistencia.belongsTo(Cargo, { foreignKey: 'cargoId', as: 'cargo' });

FechaCorte.hasMany(RegistroAsistencia, { foreignKey: 'fechaCorteId', as: 'registros' });
RegistroAsistencia.belongsTo(FechaCorte, { foreignKey: 'fechaCorteId', as: 'fechaCorte' });

export { Cargo, FechaCorte, Persona, RegistroAsistencia, Turno };