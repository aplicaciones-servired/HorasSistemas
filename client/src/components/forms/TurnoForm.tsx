import type { FormEvent } from 'react';
import type { TurnoFormValues } from '../../types/domain';

interface TurnoFormProps {
  values: TurnoFormValues;
  isSaving: boolean;
  isEditing: boolean;
  onChange: <K extends keyof TurnoFormValues>(field: K, value: TurnoFormValues[K]) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
}

export const TurnoForm = ({ values, isSaving, isEditing, onChange, onSubmit, onReset }: TurnoFormProps) => {
  return (
    <section className="panel panel--side">
      <span className="section-label">Catálogo</span>
      <h2>{isEditing ? 'Editar turno' : 'Crear turno'}</h2>

      <form className="stack-form" onSubmit={onSubmit}>
        <label>
          Nombre
          <input
            value={values.nombre}
            onChange={(event) => onChange('nombre', event.target.value)}
            placeholder="Turno mañana"
          />
        </label>
        <div className="form-grid form-grid--two">
          <label>
            Hora entrada
            <input
              type="time"
              value={values.horaEntrada}
              onChange={(event) => onChange('horaEntrada', event.target.value)}
            />
          </label>
          <label>
            Hora salida
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
              className="switch-row__input"
              type="checkbox"
              checked={values.esDominical}
              onChange={(event) => onChange('esDominical', event.target.checked)}
            />
            <span className="switch-row__slider" aria-hidden="true" />
          </span>
          <span>Es dominical / festivo</span>
        </label>

        <div className="form-actions">
          <button type="button" className="ghost-button" onClick={onReset} disabled={!isEditing || isSaving}>
            Cancelar
          </button>
          <button type="submit" className="secondary-button" disabled={isSaving}>
            {isSaving ? 'Guardando...' : isEditing ? 'Actualizar turno' : 'Guardar turno'}
          </button>
        </div>
      </form>
    </section>
  );
};
