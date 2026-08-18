import type { Persona } from '../../types/domain';

interface PersonasTableProps {
  personas: Persona[];
  onEdit: (persona: Persona) => void;
  onDelete: (persona: Persona) => void;
}

export const PersonasTable = ({ personas, onEdit, onDelete }: PersonasTableProps) => {
  return (
    <section className="panel panel--table">
      <div className="panel-header">
        <div>
          <span className="section-label">Listado</span>
          <h2>Usuarios registrados</h2>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Cédula</th>
              <th>Nombre</th>
              <th>Empresa</th>
              <th>Cargo</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {personas.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-state">
                  Todavía no hay usuarios registrados.
                </td>
              </tr>
            ) : (
              personas.map((persona) => (
                <tr key={persona.id}>
                  <td>{persona.cedula}</td>
                  <td>
                    {persona.nombres} {persona.apellidos}
                  </td>
                  <td>{persona.empresa ?? '—'}</td>
                  <td>{persona.cargo?.nombre ?? 'Sin cargo'}</td>
                  <td>{persona.activo ? 'Activo' : 'Inactivo'}</td>
                  <td>
                    <button type="button" className="button-sm ghost-button" onClick={() => onEdit(persona)}>
                      Editar
                    </button>
                    <button type="button" className="button-sm danger-button" onClick={() => onDelete(persona)}>
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