import { CargoForm } from '../components/forms/CargoForm';
import { DashboardHeader } from '../components/layout/DashboardHeader';
import { CargosTable } from '../components/tables/CargosTable';
import { useDashboard } from '../hooks/useDashboard';

export const CargosPage = () => {
  const dashboard = useDashboard();

  return (
    <>
      <DashboardHeader
        title="Cargos"
        subtitle="Crear y mantener los cargos que luego se asignan a usuarios y novedades."
        pills={[
          { label: 'Cargos', value: dashboard.cargos.length },
          { label: 'Usuarios', value: dashboard.personas.length }
        ]}
      />

      {dashboard.status.type !== 'idle' ? (
        <section className={`status-banner status-banner--${dashboard.status.type}`} aria-live="polite">
          {dashboard.status.message}
        </section>
      ) : null}

      <section className="workspace-grid workspace-grid--single">
        <CargoForm
          values={dashboard.cargoForm}
          isSaving={dashboard.isSavingCargo}
          onChange={dashboard.updateCargoField}
          onSubmit={dashboard.handleGuardarCargo}
        />

        <CargosTable cargos={dashboard.cargos} />
      </section>

      {dashboard.isLoading ? <div className="loading-banner">Cargando cargos...</div> : null}
    </>
  );
};