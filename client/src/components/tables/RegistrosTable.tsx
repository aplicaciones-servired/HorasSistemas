import type { RegistroAsistencia } from '../../types/domain';

interface RegistrosTableProps {
  registros: RegistroAsistencia[];
  onEdit: (registro: RegistroAsistencia) => void;
  onDelete: (registro: RegistroAsistencia) => void;
}

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`));

export const RegistrosTable = ({ registros, onEdit, onDelete }: RegistrosTableProps) => {
  return (
    <section className="panel panel--table">
      <div className="panel-header">
        <div>
          <span className="section-label">Actividad reciente</span>
          <h2>Registros guardados</h2>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Persona</th>
              <th>Cargo</th>
              <th>Entrada</th>
              <th>Salida</th>
              <th>Observación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {registros.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-state">
                  Todavía no hay registros guardados.
                </td>
              </tr>
            ) : (
              registros.map((registro) => (
                <tr key={registro.id}>
                  <td>{formatDate(registro.fecha)}</td>
                  <td>
                    {registro.persona?.nombres ?? 'Sin datos'} {registro.persona?.apellidos ?? ''}
                  </td>
                  <td>{registro.cargo?.nombre ?? 'Sin cargo'}</td>
                  <td>{registro.horaEntrada}</td>
                  <td>{registro.horaSalida}</td>
                  <td>{registro.observacion ?? '—'}</td>
                  <td>
                    <span className="table-actions">
                      <button type="button" className="button-sm ghost-button" onClick={() => onEdit(registro)}>
                        Editar
                      </button>
                      <button type="button" className="button-sm danger-button" onClick={() => onDelete(registro)}>
                        Eliminar
                      </button>
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
