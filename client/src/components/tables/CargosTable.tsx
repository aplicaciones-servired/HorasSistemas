import type { Cargo } from '../../types/domain';

interface CargosTableProps {
  cargos: Cargo[];
}

export const CargosTable = ({ cargos }: CargosTableProps) => {
  return (
    <section className="panel panel--table">
      <div className="panel-header">
        <div>
          <span className="section-label">Listado</span>
          <h2>Cargos registrados</h2>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            {cargos.length === 0 ? (
              <tr>
                <td colSpan={2} className="empty-state">
                  Todavía no hay cargos registrados.
                </td>
              </tr>
            ) : (
              cargos.map((cargo) => (
                <tr key={cargo.id}>
                  <td>{cargo.nombre}</td>
                  <td>{cargo.descripcion ?? '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};