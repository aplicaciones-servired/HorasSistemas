import type { FormEvent } from 'react';
import type { Cargo, LookupState, Persona, RegistroFormValues } from '../../types/domain';
import '../../index.css';

interface RegistroFormProps {
  values: RegistroFormValues;
  cargos: Cargo[];
  personas: Persona[];
  personaEncontrada: Persona | null;
  lookupState: LookupState;
  isSaving: boolean;
  onChange: <K extends keyof RegistroFormValues>(field: K, value: RegistroFormValues[K]) => void;
  onBuscarCedula: () => void;
  onSelectPersona: (personaId: number | null) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export const RegistroForm = ({
  values,
  cargos,
  personas,
  personaEncontrada,
  lookupState,
  isSaving,
  onChange,
  onBuscarCedula,
  onSelectPersona,
  onSubmit
}: RegistroFormProps) => {
  return (
    <section className="panel panel--main">
      <div className="panel-header">
        <div>
          <span className="section-label">Entrada de datos</span>
          <h2>Registrar asistencia</h2>
        </div>
        <button type="button" className="ghost-button" onClick={onBuscarCedula}>
          Buscar cédula
        </button>
      </div>

      <form className="stack-form" onSubmit={onSubmit}>
        <div className="form-grid form-grid--three">
          <label>
            Usuario existente
            <select
              value={personaEncontrada ? personaEncontrada.id : ''}
              onChange={(event) => onSelectPersona(event.target.value ? Number(event.target.value) : null)}
            >
              <option value="">Selecciona un usuario o deja manual</option>
              {personas.map((persona) => (
                <option key={persona.id} value={persona.id}>
                  {persona.cedula} — {persona.nombres} {persona.apellidos}
                </option>
              ))}
            </select>
          </label>
          <label>
            Cédula
            <input
              value={values.cedula}
              onChange={(event) => onChange('cedula', event.target.value)}
              placeholder="10203040"
            />
          </label>
          <label>
            Nombres
            <input
              value={values.nombres}
              onChange={(event) => onChange('nombres', event.target.value)}
              placeholder="Juan Carlos"
            />
          </label>
        </div>

        <div className="form-grid form-grid--three">
          <label>
            Cargo
            <select value={values.cargoId} onChange={(event) => onChange('cargoId', event.target.value)}>
              <option value="">Selecciona un cargo</option>
              {cargos.map((cargo) => (
                <option key={cargo.id} value={cargo.id}>
                  {cargo.nombre}
                </option>
              ))}
            </select>
          </label>
          <label>
            Fecha
            <input type="date" value={values.fecha} onChange={(event) => onChange('fecha', event.target.value)} />
          </label>
          <div className="lookup-box">
            <span className="">Estado de búsqueda</span>
            <strong data-state={lookupState}>
              {lookupState === 'loading' && 'Buscando...'}
              {lookupState === 'found' && 'Encontrada'}
              {lookupState === 'not-found' && 'No existe'}
              {lookupState === 'error' && 'Error'}
              {lookupState === 'idle' && 'Pendiente'}
            </strong>
          </div>
        </div>

        <div className="form-grid form-grid--two">
          <label>
            Hora de entrada
            <input
              type="time"
              value={values.horaEntrada}
              onChange={(event) => onChange('horaEntrada', event.target.value)}
            />
          </label>
          <label>
            Hora de salida
            <input
              type="time"
              value={values.horaSalida}
              onChange={(event) => onChange('horaSalida', event.target.value)}
            />
          </label>
        </div>

        <label>
          Observación
          <textarea
            rows={4}
            value={values.observacion}
            onChange={(event) => onChange('observacion', event.target.value)}
            placeholder="Anotaciones adicionales o novedades"
          />
        </label>

        {personaEncontrada ? (
          <div className="person-chip">
            <span>Persona cargada</span>
            <strong>
              {personaEncontrada.nombres} {personaEncontrada.apellidos}
            </strong>
            <small>Cédula {personaEncontrada.cedula}</small>
          </div>
        ) : null}

        <div className="form-actions">
          <p className="helper-text">
            Si la cédula no existe, el sistema crea la persona y luego guarda la novedad.
          </p>
          <button type="submit" className="primary-button" disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar novedad'}
          </button>
        </div>
      </form>
    </section>
  );
};