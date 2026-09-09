import { RegistroForm } from '../components/forms/RegistroForm';
import { DashboardHeader } from '../components/layout/DashboardHeader';
import { RegistrosTable } from '../components/tables/RegistrosTable';
import { FechaCorteSelector } from '../components/fechasCorte/FechaCorteSelector';
import { Drawer } from '../components/ui/Drawer';
import { useDashboard } from '../hooks/useDashboard';
import { useAuth } from '../components/auth/useAuth';
import { StatusToaster } from '../components/toast/StatusToaster';
import { reporteService } from '../services/reporteService';
import type { PreviewData } from '../services/reporteService';
import { PreviewModal } from '../components/ui/PreviewModal';
import { useState, useMemo } from 'react';

export const NovedadesPage = () => {
  const dashboard = useDashboard();
  const { userCompany } = useAuth();
  // const [descargando, setDescargando] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const canFilterEmpresa = userCompany === 'MultiredYServired';

  const personasFiltradas = useMemo(() => {
    if (!dashboard.empresaFilter) return dashboard.personas;
    return dashboard.personas.filter((p) => p.empresa === dashboard.empresaFilter);
  }, [dashboard.personas, dashboard.empresaFilter]);

  const drawerTitle = dashboard.editingRegistroId ? 'Editar novedad' : 'Registrar asistencia';

  // const handleDescargarHorasExtras = async () => {
  //   try {
  //     setDescargando(true);
  //     await reporteService.descargarHorasExtras(
  //       dashboard.selectedFechaCorteId ?? undefined,
  //       dashboard.empresaFilter || undefined,
  //       true
  //     );
  //     dashboard.setStatus({ type: 'success', message: 'Excel descargado correctamente.' });
  //   } catch {
  //     dashboard.setStatus({ type: 'error', message: 'Error al descargar horas extras.' });
  //   } finally {
  //     setDescargando(false);
  //   }
  // };

  const handleVistaPrevia = async () => {
    try {
      setPreviewOpen(true);
      setPreviewLoading(true);
      const data = await reporteService.obtenerVistaPrevia(
        dashboard.selectedFechaCorteId ?? undefined,
        dashboard.empresaFilter || undefined
      );
      setPreviewData(data);
    } catch {
      dashboard.setStatus({ type: 'error', message: 'Error al cargar la vista previa.' });
      setPreviewOpen(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <>
      <DashboardHeader
        title="Captura de novedades"
        subtitle="Registrar asistencia, consultar personas y mantener el historial de entrada y salida."
        pills={dashboard.summary}
      />

      <StatusToaster status={dashboard.status} />

      {canFilterEmpresa && (
        <section className="panel panel--main">
          <div className="panel-header">
            <div>
              <span className="section-label">Filtro de empresa</span>
              <h2>Seleccionar empresa</h2>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'end', flexWrap: 'wrap' }}>
            <label style={{ flex: 1, minWidth: '200px' }}>
              Empresa
              <select value={dashboard.empresaFilter} onChange={(e) => dashboard.setEmpresaFilter(e.target.value)}>
                <option value="">Todas las empresas</option>
                <option value="Servired">Servired</option>
                <option value="Multired">Multired</option>
              </select>
            </label>
            {dashboard.empresaFilter && (
              <span style={{ fontSize: '0.8rem', opacity: 0.6, alignSelf: 'end', marginBottom: '2px' }}>
                {personasFiltradas.length} personas de {dashboard.empresaFilter}
              </span>
            )}
          </div>
        </section>
      )}

      <section className="workspace-grid workspace-grid--single">
        <FechaCorteSelector
          fechasCorte={dashboard.fechasCorte}
          selectedId={dashboard.selectedFechaCorteId}
          isLoading={dashboard.isLoading}
          isSaving={dashboard.isSavingFechaCorte}
          empresaFilter={dashboard.empresaFilter}
          canFilterEmpresa={canFilterEmpresa}
          onSelect={dashboard.setSelectedFechaCorteId}
          onCreate={dashboard.handleCreateFechaCorte}
          onUpdate={dashboard.handleUpdateFechaCorte}
          onDelete={dashboard.handleDeleteFechaCorte}
          onFinalizar={(id) => dashboard.handleFinalizarFechaCorte(id, dashboard.empresaFilter || undefined)}
          onEmpresaFilterChange={dashboard.setEmpresaFilter}
        />
      </section>

      {dashboard.selectedFechaCorteId && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', marginBottom: '10px', gap: '12px' }}>
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                dashboard.resetRegistroForm();
                dashboard.openDrawer();
              }}
            >
              + Nuevo registro
            </button>
            {/* <button
              type="button"
              className="primary-button"
              onClick={handleDescargarHorasExtras}
              disabled={descargando || dashboard.registrosFechaCorte.length === 0}
            >
              {descargando ? 'Descargando...' : 'Horas Extras'}
            </button> */}
            <button
              type="button"
              className="primary-button"
              onClick={handleVistaPrevia}
              disabled={previewLoading || dashboard.registrosFechaCorte.length === 0}
            >
              {previewLoading ? 'Cargando...' : 'Vista Previa'}
            </button>
          </div>

          <RegistrosTable
            registros={dashboard.registrosFechaCorte}
            onEdit={dashboard.loadRegistroForEdit}
            onDelete={dashboard.handleEliminarRegistro}
          />
        </>
      )}

      <Drawer open={dashboard.drawerOpen} title={drawerTitle} onClose={dashboard.closeDrawer}>
        <RegistroForm
          values={dashboard.registroForm}
          cargos={dashboard.cargos}
          personas={personasFiltradas}
          turnos={dashboard.turnos}
          personaEncontrada={dashboard.foundPersona}
          lookupState={dashboard.lookupState}
          isSaving={dashboard.isSavingRegistro}
          isEditing={!!dashboard.editingRegistroId}
          onChange={dashboard.updateRegistroField}
          onBuscarCedula={dashboard.handleBuscarCedula}
          onSelectPersona={dashboard.handleSelectPersona}
          onReset={dashboard.resetRegistroForm}
          onSubmit={dashboard.handleGuardarRegistro}
        />
      </Drawer>

      <PreviewModal
        open={previewOpen}
        data={previewData}
        loading={previewLoading}
        onClose={() => { setPreviewOpen(false); setPreviewData(null); }}
      />

      {dashboard.isLoading ? <div className="loading-banner">Cargando datos iniciales...</div> : null}
    </>
  );
};
