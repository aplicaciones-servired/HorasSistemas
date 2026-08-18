import { useState, useMemo } from 'react';
import type { Persona, RegistroAsistencia, Turno } from '../../types/domain';

interface FechaCorteGridProps {
  personas: Persona[];
  registros: RegistroAsistencia[];
  turnos: Turno[];
  fechaInicio: string;
  fechaFin: string;
  completada: boolean;
  onSave: (personaId: number, fecha: string, horaEntrada: string, horaSalida: string, esDominical: boolean, existingRegistroId?: number) => void;
  onDelete: (registro: RegistroAsistencia) => void;
  isSaving: boolean;
}

interface EditCell {
  personaId: number;
  fecha: string;
}

function generateDateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const current = new Date(start + 'T00:00:00');
  const last = new Date(end + 'T00:00:00');
  while (current <= last) {
    dates.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function formatDayHeader(dateStr: string): { day: string; weekday: string } {
  const d = new Date(dateStr + 'T00:00:00');
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return {
    day: `${day}/${month}`,
    weekday: weekdays[d.getDay()]
  };
}

function formatTime(time: string): string {
  return time ? time.slice(0, 5) : '';
}

export const FechaCorteGrid = ({
  personas,
  registros,
  turnos,
  fechaInicio,
  fechaFin,
  completada,
  onSave,
  onDelete,
  isSaving
}: FechaCorteGridProps) => {
  const [editCell, setEditCell] = useState<EditCell | null>(null);
  const [entryTime, setEntryTime] = useState('');
  const [exitTime, setExitTime] = useState('');
  const [isDominical, setIsDominical] = useState(false);

  const dates = useMemo(() => generateDateRange(fechaInicio, fechaFin), [fechaInicio, fechaFin]);

  const registrosMap = useMemo(() => {
    const map = new Map<string, RegistroAsistencia>();
    for (const reg of registros) {
      map.set(`${reg.personaId}-${reg.fecha}`, reg);
    }
    return map;
  }, [registros]);

  const activePersonas = useMemo(() => personas.filter((p) => p.activo), [personas]);

  const startEdit = (personaId: number, fecha: string) => {
    if (completada) return;
    const existing = registrosMap.get(`${personaId}-${fecha}`);
    setEditCell({ personaId, fecha });
    setEntryTime(existing ? formatTime(existing.horaEntrada) : '');
    setExitTime(existing ? formatTime(existing.horaSalida) : '');
    setIsDominical(existing?.esDominical ?? false);
  };

  const cancelEdit = () => {
    setEditCell(null);
    setEntryTime('');
    setExitTime('');
    setIsDominical(false);
  };

  const saveEdit = () => {
    if (!editCell || !entryTime || !exitTime) return;
    const existing = registrosMap.get(`${editCell.personaId}-${editCell.fecha}`);
    onSave(editCell.personaId, editCell.fecha, entryTime, exitTime, isDominical, existing?.id);
    cancelEdit();
  };

  const applyTurnoToRow = (personaId: number, turno: Turno) => {
    if (completada) return;
    for (const fecha of dates) {
      const existing = registrosMap.get(`${personaId}-${fecha}`);
      onSave(personaId, fecha, turno.horaEntrada, turno.horaSalida, turno.esDominical, existing?.id);
    }
  };

  if (activePersonas.length === 0) {
    return (
      <section className="panel panel--table">
        <div className="panel-header">
          <div>
            <span className="section-label">Grid de captura</span>
            <h2>Novedades por fecha de corte</h2>
          </div>
        </div>
        <div className="empty-state" style={{ padding: '40px', textAlign: 'center' }}>
          No hay personas activas registradas. Crea personas primero en la sección de Usuarios.
        </div>
      </section>
    );
  }

  return (
    <section className="panel panel--table">
      <div className="panel-header">
        <div>
          <span className="section-label">Grid de captura</span>
          <h2>Novedades por fecha de corte</h2>
        </div>
        <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>
          {dates.length} días · {activePersonas.length} personas
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', minWidth: '100%' }}>
          <thead>
            <tr>
              <th style={{ position: 'sticky', left: 0, background: 'rgba(15,23,42,0.95)', zIndex: 2, minWidth: '180px' }}>
                Persona
              </th>
              {dates.map((d) => {
                const { day, weekday } = formatDayHeader(d);
                return (
                  <th key={d} style={{ minWidth: '100px', textAlign: 'center', padding: '6px 4px' }}>
                    <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{weekday}</div>
                    <div>{day}</div>
                  </th>
                );
              })}
              <th style={{ minWidth: '80px' }}>Turno</th>
            </tr>
          </thead>
          <tbody>
            {activePersonas.map((persona) => (
              <tr key={persona.id}>
                <td
                  style={{
                    position: 'sticky',
                    left: 0,
                    background: 'rgba(15,23,42,0.95)',
                    zIndex: 1,
                    whiteSpace: 'nowrap'
                  }}
                >
                  <div style={{ fontSize: '0.85rem' }}>
                    {persona.nombres} {persona.apellidos}
                  </div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>{persona.cedula}</div>
                </td>

                {dates.map((fecha) => {
                  const registro = registrosMap.get(`${persona.id}-${fecha}`);
                  const isEditing =
                    editCell?.personaId === persona.id && editCell?.fecha === fecha;

                  return (
                    <td
                      key={fecha}
                      style={{
                        textAlign: 'center',
                        padding: '4px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        cursor: completada ? 'default' : 'pointer',
                        background: isEditing
                          ? 'rgba(59,130,246,0.15)'
                          : registro
                            ? 'rgba(74,222,128,0.08)'
                            : 'transparent',
                        minWidth: '100px'
                      }}
                      onClick={() => !isEditing && startEdit(persona.id, fecha)}
                    >
                      {isEditing ? (
                        <div
                          style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="time"
                            value={entryTime}
                            onChange={(e) => setEntryTime(e.target.value)}
                            style={{ fontSize: '0.75rem', width: '90px', padding: '2px' }}
                          />
                          <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>→</span>
                          <input
                            type="time"
                            value={exitTime}
                            onChange={(e) => setExitTime(e.target.value)}
                            style={{ fontSize: '0.75rem', width: '90px', padding: '2px' }}
                          />
                          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem' }}>
                            <input
                              type="checkbox"
                              checked={isDominical}
                              onChange={(e) => setIsDominical(e.target.checked)}
                            />
                            Dom
                          </label>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              type="button"
                              className="primary-button"
                              onClick={saveEdit}
                              disabled={isSaving || !entryTime || !exitTime}
                              style={{ fontSize: '0.65rem', padding: '2px 8px' }}
                            >
                              {isSaving ? '...' : 'Guardar'}
                            </button>
                            <button
                              type="button"
                              className="ghost-button"
                              onClick={cancelEdit}
                              style={{ fontSize: '0.65rem', padding: '2px 8px' }}
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ) : registro ? (
                        <div style={{ fontSize: '0.75rem' }}>
                          <div style={{ color: '#4ade80' }}>
                            {formatTime(registro.horaEntrada)} → {formatTime(registro.horaSalida)}
                          </div>
                          {registro.esDominical && (
                            <span style={{ fontSize: '0.6rem', color: '#facc15' }}>Dom</span>
                          )}
                          {!completada && (
                            <button
                              type="button"
                              className="ghost-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(registro);
                              }}
                              style={{ fontSize: '0.6rem', padding: '0', marginTop: '2px' }}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ) : (
                        <span style={{ opacity: 0.2, fontSize: '0.75rem' }}>—</span>
                      )}
                    </td>
                  );
                })}

                <td style={{ padding: '4px', textAlign: 'center' }}>
                  {!completada && turnos.length > 0 && (
                    <select
                      style={{ fontSize: '0.7rem', padding: '2px', maxWidth: '80px' }}
                      value=""
                      onChange={(e) => {
                        const turno = turnos.find((t) => t.id === Number(e.target.value));
                        if (turno) applyTurnoToRow(persona.id, turno);
                      }}
                    >
                      <option value="">Turno</option>
                      {turnos.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.nombre}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
