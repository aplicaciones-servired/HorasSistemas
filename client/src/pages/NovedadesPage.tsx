import { RegistroForm } from '../components/forms/RegistroForm';
import { DashboardHeader } from '../components/layout/DashboardHeader';
import { RegistrosTable } from '../components/tables/RegistrosTable';
import { useDashboard } from '../hooks/useDashboard';

export const NovedadesPage = () => {
  const dashboard = useDashboard();

  return (
    <>
      <DashboardHeader
        title="Captura de novedades"
        subtitle="Registrar asistencia, consultar personas y mantener el historial de entrada y salida."
        pills={dashboard.summary}
      />

      {dashboard.status.type !== 'idle' ? (
        <section className={`status-banner status-banner--${dashboard.status.type}`} aria-live="polite">
          {dashboard.status.message}
        </section>
      ) : null}

      <section className="workspace-grid workspace-grid--single">
        <RegistroForm
          values={dashboard.registroForm}
          cargos={dashboard.cargos}
          personas={dashboard.personas}
          personaEncontrada={dashboard.foundPersona}
          lookupState={dashboard.lookupState}
          isSaving={dashboard.isSavingRegistro}
          onChange={dashboard.updateRegistroField}
          onBuscarCedula={dashboard.handleBuscarCedula}
          onSelectPersona={dashboard.handleSelectPersona}
          onSubmit={dashboard.handleGuardarRegistro}
        />
      </section>
      <RegistrosTable registros={dashboard.registros} />

      {dashboard.isLoading ? <div className="loading-banner">Cargando datos iniciales...</div> : null}
    </>
  );
};