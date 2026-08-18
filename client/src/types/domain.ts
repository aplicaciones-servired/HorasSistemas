export interface Cargo {
  id: number;
  nombre: string;
  descripcion: string | null;
}

export interface Persona {
  id: number;
  cedula: string;
  nombres: string;
  apellidos: string;
  empresa: string | null;
  cargoId: number | null;
  activo: boolean;
  cargo?: Cargo | null;
}

export interface RegistroAsistencia {
  id: number;
  personaId: number;
  cargoId: number | null;
  fecha: string;
  horaEntrada: string;
  horaSalida: string;
  observacion: string | null;
  esDominical: boolean;
  persona?: Persona | null;
  cargo?: Cargo | null;
}

export interface RegistroFormValues {
  cedula: string;
  nombres: string;
  apellidos: string;
  empresa: string;
  cargoId: string;
  fecha: string;
  fechas: string[];
  horaEntrada: string;
  horaSalida: string;
  observacion: string;
  esDominical: boolean;
}

export interface CargoFormValues {
  nombre: string;
  descripcion: string;
}

export interface PersonaFormValues {
  cedula: string;
  nombres: string;
  apellidos: string;
  empresa: string;
  cargoId: string;
  activo: boolean;
}

export type StatusType = 'idle' | 'info' | 'success' | 'error';

export type LookupState = 'idle' | 'loading' | 'found' | 'not-found' | 'error';

export interface Turno {
  id: number;
  nombre: string;
  horaEntrada: string;
  horaSalida: string;
  esDominical: boolean;
}

export interface TurnoFormValues {
  nombre: string;
  horaEntrada: string;
  horaSalida: string;
  esDominical: boolean;
}