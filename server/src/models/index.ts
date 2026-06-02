import { Cargo } from './Cargo';
import { Persona } from './Persona';
import { RegistroAsistencia } from './RegistroAsistencia';

Cargo.hasMany(Persona, { foreignKey: 'cargoId', as: 'personas' });
Persona.belongsTo(Cargo, { foreignKey: 'cargoId', as: 'cargo' });

Persona.hasMany(RegistroAsistencia, { foreignKey: 'personaId', as: 'registros' });
RegistroAsistencia.belongsTo(Persona, { foreignKey: 'personaId', as: 'persona' });

Cargo.hasMany(RegistroAsistencia, { foreignKey: 'cargoId', as: 'registros' });
RegistroAsistencia.belongsTo(Cargo, { foreignKey: 'cargoId', as: 'cargo' });

export { Cargo, Persona, RegistroAsistencia };