import type { FormEvent } from 'react';
import type { Cargo, PersonaFormValues } from '../../types/domain';

interface PersonaFormProps {
  values: PersonaFormValues;
  cargos: Cargo[];
  isSaving: boolean;
  editingId: number | null;
  onChange: <K extends keyof PersonaFormValues>(field: K, value: PersonaFormValues[K]) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancelEdit: () => void;
}

export const PersonaForm = ({
  values,
  cargos,
  isSaving,
  editingId,
  onChange,
  onSubmit,
  onCancelEdit
}: PersonaFormProps) => {
  return (
    <section className="panel panel--side">
      <span className="section-label">Usuarios</span>
      <h2>{editingId ? 'Editar usuario' : 'Crear usuario'}</h2>

      <form className="stack-form" onSubmit={onSubmit}>
        <div className="form-grid form-grid--two">
          <label>
            Cédula
            <input
              value={values.cedula}
              onChange={(event) => onChange('cedula', event.target.value)}
              placeholder="10203040"
            />
          </label>
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
        </div>

        <label>
          Nombres
          <input
            value={values.nombres}
            onChange={(event) => onChange('nombres', event.target.value)}
            placeholder="Juan Carlos"
          />
        </label>

        <label>
          Apellidos
          <input
            value={values.apellidos}
            onChange={(event) => onChange('apellidos', event.target.value)}
            placeholder="Pérez Gómez"
          />
        </label>

        <label>
          Empresa
          <select
            value={values.empresa}
            onChange={(event) => onChange('empresa', event.target.value)}
          >
            <option value="">Selecciona una empresa</option>
            <option value="Servired">Servired</option>
            <option value="Multired">Multired</option>
          </select>
        </label>

        <label className="switch-row">
          <span className="switch-row__control">
            <input
              id={`activo-${editingId ?? 'new'}`}
              className="switch-row__input"
              type="checkbox"
              checked={values.activo}
              onChange={(event) => onChange('activo', event.target.checked)}
              aria-checked={values.activo}
            />
            <span className="switch-row__slider" aria-hidden="true" />
          </span>
          <span>Usuario activo</span>
        </label>

        <div className="form-actions">
          <button type="button" className="ghost-button" onClick={onCancelEdit} disabled={!editingId}>
            Limpiar
          </button>
          <button type="submit" className="secondary-button" disabled={isSaving}>
            {isSaving ? 'Guardando...' : editingId ? 'Actualizar usuario' : 'Guardar usuario'}
          </button>
        </div>
      </form>
    </section>
  );
};