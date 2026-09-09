import type { PreviewData } from '../../services/reporteService';

interface PreviewModalProps {
  open: boolean;
  data: PreviewData | null;
  loading: boolean;
  onClose: () => void;
}

const fmt = (v: number | '') => (v === '' ? '' : String(v));

export const PreviewModal = ({ open, data, loading, onClose }: PreviewModalProps) => {
  if (!open) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="preview-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h2>Vista Previa - Reporte Horas Extras</h2>
          <button type="button" className="ghost-button" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="preview-body">
          {loading && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text)' }}>
              Cargando vista previa...
            </div>
          )}
          {!loading && !data && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text)' }}>
              No hay datos para mostrar.
            </div>
          )}
          {!loading && data && (
            <div className="preview-content">
              <div className="preview-header-block">
                <div className="preview-header-row">
                  <div className="preview-logo-cell">
                    <div className="preview-logo-placeholder">LOGO</div>
                  </div>
                  <div className="preview-title-cell">
                    <div>PROCESO: FINANCIERO</div>
                    <div><strong>FORMATO</strong></div>
                    <div><strong>REPORTE DE HORAS EXTRAS</strong></div>
                  </div>
                  <div className="preview-meta-cell">
                    <div>CÓDIGO: FO-CT-04</div>
                    <div>VERSIÓN: 02</div>
                    <div>FECHA: {new Date().toLocaleDateString('es-CO')}</div>
                  </div>
                </div>
                <div className="preview-period-row">
                  <span className="preview-period-label">PERIODO:</span>
                  <span className="preview-period-value">{data.periodo}</span>
                  <span className="preview-company-label">COMPAÑÍA:</span>
                  <span className="preview-company-value">{data.compania}</span>
                </div>
              </div>

              <div className="preview-table-wrapper">
                <table className="preview-table">
                  <thead>
                    <tr>
                      <th rowSpan={2}>NO°</th>
                      <th rowSpan={2}>NOMBRES Y APELLIDOS</th>
                      <th rowSpan={2}>NÚMERO DE DOCUMENTO</th>
                      <th rowSpan={2}>CARGO</th>
                      <th rowSpan={2}>FECHA</th>
                      <th rowSpan={2}>HORA ENTRADA</th>
                      <th rowSpan={2}>HORA SALIDA</th>
                      <th colSpan={2}>RECARGO NOCTURNO</th>
                      <th colSpan={2}>HORAS EXTRAS</th>
                      <th colSpan={2}>HORAS DOMINICALES</th>
                      <th colSpan={2}>HORAS EXTRAS DOMINICALES</th>
                    </tr>
                    <tr>
                      <th>ORDINARIO</th>
                      <th>FESTIVO</th>
                      <th>DIURNA</th>
                      <th>NOCTURNA</th>
                      <th>DIURNA</th>
                      <th>NOCTURNA</th>
                      <th>DIURNA</th>
                      <th>NOCTURNA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.rows.length === 0 && (
                      <tr>
                        <td colSpan={15} style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                          No hay registros
                        </td>
                      </tr>
                    )}
                    {data.rows.map((row) => (
                      <tr key={`${row.cedula}-${row.fecha}`}>
                        <td className="cell-center cell-bold">{row.no}</td>
                        <td className="cell-left">{row.nombre}</td>
                        <td className="cell-center">{row.cedula}</td>
                        <td className="cell-left">{row.cargo}</td>
                        <td className="cell-center">{row.fecha}</td>
                        <td className="cell-center">{row.horaEntrada}</td>
                        <td className="cell-center">{row.horaSalida}</td>
                        <td className="cell-center">{fmt(row.recargoNocturnoOrdinario)}</td>
                        <td className="cell-center">{fmt(row.recargoNocturnoFestivo)}</td>
                        <td className="cell-center">{fmt(row.extraDiurna)}</td>
                        <td className="cell-center">{fmt(row.extraNocturna)}</td>
                        <td className="cell-center">{fmt(row.dominicalDiurna)}</td>
                        <td className="cell-center">{fmt(row.dominicalNocturna)}</td>
                        <td className="cell-center">{fmt(row.extraDominicalDiurna)}</td>
                        <td className="cell-center">{fmt(row.extraDominicalNocturna)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="preview-footer">
                <div className="preview-obs">
                  <strong>OBSERVACIONES:</strong>
                  <div>LOS TÉCNICOS QUE TRABAJAN HASTA LAS 19:00 SE TOMAN UNA HORA DE ALMUERZO DURANTE LA JORNADA.</div>
                </div>
                <div className="preview-signature">
                  <div><strong>ELABORADO POR:</strong> {data.elaboradoPor}</div>
                  <div><strong>CARGO:</strong> Coordinador de Telecomunicaciones</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
