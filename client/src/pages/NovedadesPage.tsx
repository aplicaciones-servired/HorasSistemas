import { RegistroForm } from '../components/forms/RegistroForm';
import { DashboardHeader } from '../components/layout/DashboardHeader';
import { RegistrosTable } from '../components/tables/RegistrosTable';
import { FechaCorteSelector } from '../components/fechasCorte/FechaCorteSelector';
import { useDashboard } from '../hooks/useDashboard';
import { StatusToaster } from '../components/toast/StatusToaster';
import { reporteService } from '../services/reporteService';
import { useState } from 'react';

export const NovedadesPage = () => {
  const dashboard = useDashboard();
  const [descargando, setDescargando] = useState(false);

  const handleDescargarHorasExtras = async () => {
    try {
      setDescargando(true);
      await reporteService.descargarHorasExtras(dashboard.selectedFechaCorteId ?? undefined);
    } catch (error) {
      console.error('Error descargando horas extras:', error);
    } finally {
      setDescargando(false);
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

      <section className="workspace-grid workspace-grid--single">
        <FechaCorteSelector
          fechasCorte={dashboard.fechasCorte}
          selectedId={dashboard.selectedFechaCorteId}
          isLoading={dashboard.isLoading}
          isSaving={dashboard.isSavingFechaCorte}
          onSelect={dashboard.setSelectedFechaCorteId}
          onCreate={dashboard.handleCreateFechaCorte}
          onDelete={dashboard.handleDeleteFechaCorte}
          onFinalizar={dashboard.handleFinalizarFechaCorte}
        />
      </section>

      {dashboard.selectedFechaCorte && (
        <section className="workspace-grid workspace-grid--single">
          <RegistroForm
            values={dashboard.registroForm}
            cargos={dashboard.cargos}
            personas={dashboard.personas}
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
            onDeletePersona={dashboard.handleEliminarPersona}
          />
        </section>
      )}

      {dashboard.selectedFechaCorteId && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', marginBottom: '10px', gap: '12px' }}>
            <button
              type="button"
              className="primary-button"
              onClick={handleDescargarHorasExtras}
              disabled={descargando || dashboard.registrosFechaCorte.length === 0}
            >
              {descargando ? 'Descargando...' : '⏰ Horas Extras'}
            </button>
          </div>

          <RegistrosTable
            registros={dashboard.registrosFechaCorte}
            onEdit={dashboard.loadRegistroForEdit}
            onDelete={dashboard.handleEliminarRegistro}
          />
        </>
      )}

      {dashboard.isLoading ? <div className="loading-banner">Cargando datos iniciales...</div> : null}
    </>
  );
};
