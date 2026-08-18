import { useState } from 'react';
import type { FechaCorte, FechaCorteFormValues } from '../../types/domain';

interface FechaCorteSelectorProps {
  fechasCorte: FechaCorte[];
  selectedId: number | null;
  isLoading: boolean;
  isSaving: boolean;
  onSelect: (id: number | null) => void;
  onCreate: (values: FechaCorteFormValues) => void;
  onDelete: (id: number) => void;
  onFinalizar: (id: number) => void;
}

const today = new Date().toISOString().slice(0, 10);

export const FechaCorteSelector = ({
  fechasCorte,
  selectedId,
  isLoading,
  isSaving,
  onSelect,
  onCreate,
  onDelete,
  onFinalizar
}: FechaCorteSelectorProps) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FechaCorteFormValues>({
    fechaInicio: today,
    fechaFin: today,
    descripcion: ''
  });

  const selected = fechasCorte.find((f) => f.id === selectedId) ?? null;

  const handleCreate = () => {
    if (!form.fechaInicio || !form.fechaFin) return;
    onCreate(form);
    setForm({ fechaInicio: today, fechaFin: today, descripcion: '' });
    setShowForm(false);
  };

  return (
    <section className="panel panel--main">
      <div className="panel-header">
        <div>
          <span className="section-label">Fecha de corte</span>
          <h2>Seleccionar período de corte</h2>
        </div>
        {!selected?.completada && (
          <button
            type="button"
            className="ghost-button"
            onClick={() => setShowForm(!showForm)}
            disabled={isSaving}
          >
            {showForm ? 'Cancelar' : '+ Nueva fecha de corte'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="form-grid form-grid--three" style={{ padding: '0 0 16px', gap: '12px', alignItems: 'end' }}>
          <label>
            Fecha inicio
            <input
              type="date"
              value={form.fechaInicio}
              onChange={(e) => setForm((prev) => ({ ...prev, fechaInicio: e.target.value }))}
            />
          </label>
          <label>
            Fecha fin
            <input
              type="date"
              value={form.fechaFin}
              onChange={(e) => setForm((prev) => ({ ...prev, fechaFin: e.target.value }))}
            />
          </label>
          <label>
            Descripción (opcional)
            <input
              value={form.descripcion}
              onChange={(e) => setForm((prev) => ({ ...prev, descripcion: e.target.value }))}
              placeholder="Ej: Corte quincenal agosto"
            />
          </label>
          <button type="button" className="primary-button" onClick={handleCreate} disabled={isSaving}>
            {isSaving ? 'Creando...' : 'Crear fecha de corte'}
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <label style={{ flex: 1, minWidth: '200px' }}>
          Fecha de corte activa
          <select
            value={selectedId ?? ''}
            onChange={(e) => onSelect(e.target.value ? Number(e.target.value) : null)}
            disabled={isLoading}
          >
            <option value="">Sin fecha de corte seleccionada</option>
            {fechasCorte.map((fc) => (
              <option key={fc.id} value={fc.id}>
                {fc.fechaInicio} — {fc.fechaFin}
                {fc.descripcion ? ` (${fc.descripcion})` : ''}
                {fc.completada ? ' ✓ Finalizada' : ''}
              </option>
            ))}
          </select>
        </label>

        {selected && !selected.completada && (
          <>
            <button
              type="button"
              className="danger-button"
              onClick={() => onDelete(selected.id)}
              disabled={isSaving}
              style={{ alignSelf: 'end', marginBottom: '2px' }}
            >
              Eliminar
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={() => onFinalizar(selected.id)}
              disabled={isSaving}
              style={{ alignSelf: 'end', marginBottom: '2px' }}
            >
              Finalizar fecha de corte
            </button>
          </>
        )}

        {selected?.completada && (
          <button
            type="button"
            className="primary-button"
            onClick={() => onFinalizar(selected.id)}
            disabled={isSaving}
            style={{ alignSelf: 'end', marginBottom: '2px' }}
          >
            {isSaving ? 'Generando...' : 'Regenerar Excel'}
          </button>
        )}
      </div>
    </section>
  );
};
