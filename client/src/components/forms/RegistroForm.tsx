import type { FormEvent } from 'react';
import type { Cargo, LookupState, Persona, RegistroFormValues, Turno } from '../../types/domain';
import { CalendarMultiDate } from '../ui/CalendarMultiDate';
import '../../index.css';

interface RegistroFormProps {
  values: RegistroFormValues;
  cargos: Cargo[];
  personas: Persona[];
  turnos: Turno[];
  personaEncontrada: Persona | null;
  lookupState: LookupState;
  isSaving: boolean;
  isEditing: boolean;
  onChange: <K extends keyof RegistroFormValues>(field: K, value: RegistroFormValues[K]) => void;
  onBuscarCedula: () => void;
  onSelectPersona: (personaId: number | null) => void;
  onReset: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDeletePersona: (persona: Persona) => void;
}

export const RegistroForm = ({
  values,
  cargos,
  personas,
  turnos,
  personaEncontrada,
  lookupState,
  isSaving,
  isEditing,
  onChange,
  onBuscarCedula,
  onSelectPersona,
  onReset,
  onSubmit,
  onDeletePersona
}: RegistroFormProps) => {
  return (
    <section className="panel panel--main">
      <div className="panel-header">
        <div>
          <span className="section-label">Entrada de datos</span>
          <h2>{isEditing ? 'Editar novedad' : 'Registrar asistencia'}</h2>
        </div>
        <button type="button" className="ghost-button" onClick={onBuscarCedula}>
          Buscar cédula
        </button>
      </div>

      <form className="stack-form" onSubmit={onSubmit}>
        <div className="formgrid form-grid--three">
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
              onBlur={() => {
                if (!personaEncontrada && values.cedula.trim()) {
                  onBuscarCedula();
                }
              }}
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
            <select
              value={values.cargoId}
              onChange={(event) => onChange('cargoId', event.target.value)}
              disabled={!!personaEncontrada}
            >
              <option value="">Selecciona un cargo</option>
              {cargos.map((cargo) => (
                <option key={cargo.id} value={cargo.id}>
                  {cargo.nombre}
                </option>
              ))}
            </select>
          </label>
          <label>
            Empresa
            <input
              value={values.empresa}
              onChange={(event) => onChange('empresa', event.target.value)}
              placeholder="Nombre de la empresa"
              disabled={!!personaEncontrada}
            />
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

        <div>
          <span className="cal-label-title">Fechas de asistencia</span>
          <CalendarMultiDate
            selected={values.fechas}
            onChange={(fechas) => onChange('fechas', fechas)}
          />
        </div>

        <div className="quick-shifts">
          <span className="quick-shifts__label">Turnos rápidos</span>
          {turnos.map((turno) => (
            <button
              key={turno.id}
              type="button"
              className="ghost-button"
              onClick={() => {
                onChange('horaEntrada', turno.horaEntrada);
                onChange('horaSalida', turno.horaSalida);
                if (turno.esDominical) {
                  onChange('esDominical', true);
                }
              }}
            >
              {turno.nombre}
            </button>
          ))}
          {turnos.length === 0 && (
            <span style={{ opacity: 0.5, fontSize: '0.75rem' }}>No hay turnos creados</span>
          )}
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

        <label className="switch-row">
          <span className="switch-row__control">
            <input
              id={`dominical-${values.fecha}`}
              className="switch-row__input"
              type="checkbox"
              checked={values.esDominical}
              onChange={(event) => onChange('esDominical', event.target.checked)}
              aria-checked={values.esDominical}
            />
            <span className="switch-row__slider" aria-hidden="true" />
          </span>
          <span>Es dominical o festivo</span>
        </label>

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
            <div className="person-chip__header">
              <div>
                <span>Persona cargada</span>
                <strong>
                  {personaEncontrada.nombres} {personaEncontrada.apellidos}
                </strong>
                <small>Cédula {personaEncontrada.cedula}</small>
              </div>
              <button
                type="button"
                className="button-sm danger-button"
                onClick={() => onDeletePersona(personaEncontrada)}
              >
                Eliminar usuario
              </button>
            </div>
          </div>
        ) : null}

        <div className="form-actions">
          <p className="helper-text">
            {isEditing
              ? 'Editando la novedad seleccionada.'
              : values.fechas.length > 1
                ? `Se crearán ${values.fechas.length} registros, uno por cada fecha seleccionada.`
                : 'Si la cédula no existe, el sistema crea la persona y luego guarda la novedad.'}
          </p>
          <button type="button" className="ghost-button" onClick={onReset} disabled={!isEditing || isSaving}>
            Cancelar edición
          </button>
          <button type="submit" className="primary-button" disabled={isSaving || values.fechas.length === 0}>
            {isSaving ? 'Guardando...' : isEditing ? 'Actualizar novedad' : values.fechas.length > 1 ? `Guardar ${values.fechas.length} registros` : 'Guardar novedad'}
          </button>
        </div>
      </form>
    </section>
  );
};
