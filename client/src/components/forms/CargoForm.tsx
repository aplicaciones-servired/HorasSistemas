import type { FormEvent } from 'react';
import type { CargoFormValues } from '../../types/domain';

interface CargoFormProps {
  values: CargoFormValues;
  isSaving: boolean;
  onChange: <K extends keyof CargoFormValues>(field: K, value: CargoFormValues[K]) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export const CargoForm = ({ values, isSaving, onChange, onSubmit }: CargoFormProps) => {
  return (
    <section className="panel panel--side">
      <span className="section-label">Catálogo</span>
      <h2>Crear cargo</h2>

      <form className="stack-form" onSubmit={onSubmit}>
        <label>
          Nombre
          <input
            value={values.nombre}
            onChange={(event) => onChange('nombre', event.target.value)}
            placeholder="Auxiliar de nómina"
          />
        </label>
        <label>
          Descripción
          <textarea
            rows={4}
            value={values.descripcion}
            onChange={(event) => onChange('descripcion', event.target.value)}
            placeholder="Rol, alcance o notas del cargo"
          />
        </label>

        <button type="submit" className="secondary-button" disabled={isSaving}>
          {isSaving ? 'Guardando...' : 'Guardar cargo'}
        </button>
      </form>
    </section>
  );
};