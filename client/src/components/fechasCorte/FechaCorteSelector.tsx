import { useMemo, useState } from 'react';
import type { FechaCorte, FechaCorteFormValues } from '../../types/domain';

interface FechaCorteSelectorProps {
  fechasCorte: FechaCorte[];
  selectedId: number | null;
  isLoading: boolean;
  isSaving: boolean;
  empresaFilter: string;
  canFilterEmpresa: boolean;
  onSelect: (id: number | null) => void;
  onCreate: (values: FechaCorteFormValues) => void;
  onDelete: (id: number) => void;
  onFinalizar: (id: number) => void;
  onEmpresaFilterChange: (empresa: string) => void;
}

const today = new Date().toISOString().slice(0, 10);
const PAGE_SIZE = 6;

const formatDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-');
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const FechaCorteSelector = ({
  fechasCorte,
  selectedId,
  isLoading,
  isSaving,
  empresaFilter,
  canFilterEmpresa,
  onSelect,
  onCreate,
  onDelete,
  onFinalizar,
  onEmpresaFilterChange
}: FechaCorteSelectorProps) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FechaCorteFormValues>({
    fechaInicio: today,
    fechaFin: today,
    descripcion: ''
  });
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(0);

  const selected = fechasCorte.find((f) => f.id === selectedId) ?? null;

  const hasFilter = dateFrom || dateTo;

  const filtered = useMemo(() => {
    if (!hasFilter) return fechasCorte;
    return fechasCorte.filter((fc) => {
      const overlapStart = dateFrom ? fc.fechaFin >= dateFrom : true;
      const overlapEnd = dateTo ? fc.fechaInicio <= dateTo : true;
      return overlapStart && overlapEnd;
    });
  }, [fechasCorte, dateFrom, dateTo, hasFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paginated = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const selectedOnDifferentPage = selected && !paginated.some((fc) => fc.id === selectedId);

  const handleCreate = () => {
    if (!form.fechaInicio || !form.fechaFin) return;
    onCreate(form);
    setForm({ fechaInicio: today, fechaFin: today, descripcion: '' });
    setShowForm(false);
  };

  const handleClearFilter = () => {
    setDateFrom('');
    setDateTo('');
    setPage(0);
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
        <div className="fc-create-form">
          <div className="fc-create-form__row">
            <label className="fc-create-form__field">
              Fecha inicio
              <input
                type="date"
                value={form.fechaInicio}
                onChange={(e) => setForm((prev) => ({ ...prev, fechaInicio: e.target.value }))}
              />
            </label>
            <label className="fc-create-form__field">
              Fecha fin
              <input
                type="date"
                value={form.fechaFin}
                onChange={(e) => setForm((prev) => ({ ...prev, fechaFin: e.target.value }))}
              />
            </label>
            <label className="fc-create-form__field fc-create-form__field--grow">
              Descripción (opcional)
              <input
                value={form.descripcion}
                onChange={(e) => setForm((prev) => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Ej: Corte quincenal agosto"
              />
            </label>
            {canFilterEmpresa && (
              <label className="fc-create-form__field">
                Empresa
                <select
                  value={empresaFilter}
                  onChange={(e) => onEmpresaFilterChange(e.target.value)}
                >
                  <option value="">Sin empresa</option>
                  <option value="Servired">Servired</option>
                  <option value="Multired">Multired</option>
                </select>
              </label>
            )}
          </div>
          <button type="button" className="primary-button" onClick={handleCreate} disabled={isSaving}>
            {isSaving ? 'Creando...' : 'Crear fecha de corte'}
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="loading-banner">Cargando períodos...</div>
      ) : fechasCorte.length === 0 ? (
        <div className="empty-state">
          <p>No hay períodos de corte creados aún. Usa <strong>+ Nueva fecha de corte</strong> arriba para crear el primero.</p>
        </div>
      ) : (
        <>
          {fechasCorte.length > PAGE_SIZE && (
            <div className="fc-toolbar">
              <span className="fc-toolbar__label">Filtrar por rango</span>
              <div className="fc-toolbar__dates">
                <label className="fc-toolbar__field">
                  Desde
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => { setDateFrom(e.target.value); setPage(0); }}
                  />
                </label>
                <span className="fc-toolbar__sep">&mdash;</span>
                <label className="fc-toolbar__field">
                  Hasta
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => { setDateTo(e.target.value); setPage(0); }}
                  />
                </label>
              </div>
              {hasFilter && (
                <button type="button" className="ghost-button button-sm" onClick={handleClearFilter}>
                  Limpiar
                </button>
              )}
            </div>
          )}

          {selectedOnDifferentPage && (
            <div className="fc-selected-banner">
              <span>Período seleccionado:</span>
              <button
                type="button"
                className="fc-card fc-card--active fc-card--compact"
                onClick={() => {
                  const idx = filtered.findIndex((fc) => fc.id === selectedId);
                  if (idx >= 0) setPage(Math.floor(idx / PAGE_SIZE));
                }}
              >
                <div className="fc-card__dates">
                  <span className="fc-card__date">{formatDate(selected.fechaInicio)}</span>
                  <span className="fc-card__arrow">&rarr;</span>
                  <span className="fc-card__date">{formatDate(selected.fechaFin)}</span>
                </div>
                {selected.descripcion && <span className="fc-card__desc">{selected.descripcion}</span>}
              </button>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="empty-state">
              <p>No hay períodos en el rango seleccionado</p>
            </div>
          ) : (
            <>
              <div className="fc-grid">
                {paginated.map((fc) => {
                  const isActive = fc.id === selectedId;
                  return (
                    <button
                      key={fc.id}
                      type="button"
                      className={`fc-card${isActive ? ' fc-card--active' : ''}${fc.completada ? ' fc-card--done' : ''}`}
                      onClick={() => onSelect(isActive ? null : fc.id)}
                    >
                      <div className="fc-card__header">
                        <span className={`fc-card__badge${fc.completada ? ' fc-card__badge--done' : ''}`}>
                          {fc.completada ? 'Finalizada' : 'Activa'}
                        </span>
                        {fc.empresa && (
                          <span className="fc-card__empresa">{fc.empresa}</span>
                        )}
                      </div>
                      <div className="fc-card__dates">
                        <span className="fc-card__date">{formatDate(fc.fechaInicio)}</span>
                        <span className="fc-card__arrow">&rarr;</span>
                        <span className="fc-card__date">{formatDate(fc.fechaFin)}</span>
                      </div>
                      {fc.descripcion && (
                        <span className="fc-card__desc">{fc.descripcion}</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="fc-pager">
                  <button
                    type="button"
                    className="ghost-button button-sm"
                    disabled={safePage === 0}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    &lsaquo; Anterior
                  </button>
                  <span className="fc-pager__info">
                    {safePage + 1} / {totalPages} &middot; {filtered.length} período{filtered.length !== 1 ? 's' : ''}
                  </span>
                  <button
                    type="button"
                    className="ghost-button button-sm"
                    disabled={safePage >= totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Siguiente &rsaquo;
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {selected && (
        <div className="fc-actions">
          <button
            type="button"
            className="danger-button"
            onClick={() => onDelete(selected.id)}
            disabled={isSaving}
          >
            Eliminar
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={() => onFinalizar(selected.id)}
            disabled={isSaving}
          >
            {selected.completada ? 'Regenerar Excel' : 'Finalizar fecha de corte'}
          </button>
        </div>
      )}
    </section>
  );
};
