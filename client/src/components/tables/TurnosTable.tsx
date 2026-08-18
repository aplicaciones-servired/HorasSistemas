import type { Turno } from '../../types/domain';

interface TurnosTableProps {
  turnos: Turno[];
  onEdit: (turno: Turno) => void;
  onDelete: (turno: Turno) => void;
}

export const TurnosTable = ({ turnos, onEdit, onDelete }: TurnosTableProps) => {
  return (
    <section className="panel panel--table">
      <div className="panel-header">
        <div>
          <span className="section-label">Listado</span>
          <h2>Turnos registrados</h2>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Entrada</th>
              <th>Salida</th>
              <th>Dominical</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {turnos.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-state">
                  Todavía no hay turnos registrados.
                </td>
              </tr>
            ) : (
              turnos.map((turno) => (
                <tr key={turno.id}>
                  <td>{turno.nombre}</td>
                  <td>{turno.horaEntrada}</td>
                  <td>{turno.horaSalida}</td>
                  <td>{turno.esDominical ? 'Sí' : 'No'}</td>
                  <td>
                    <button className="button-sm ghost-button" onClick={() => onEdit(turno)}>
                      Editar
                    </button>
                    <button className="button-sm ghost-button" onClick={() => onDelete(turno)}>
                      Eliminar
                    </button>
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
