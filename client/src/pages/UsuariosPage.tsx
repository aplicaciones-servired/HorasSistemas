import { DashboardHeader } from '../components/layout/DashboardHeader';
import { PersonaForm } from '../components/forms/PersonaForm';
import { PersonasTable } from '../components/tables/PersonasTable';
import { StatusToaster } from '../components/toast/StatusToaster';
import { useDashboard } from '../hooks/useDashboard';

export const UsuariosPage = () => {
  const dashboard = useDashboard();

  return (
    <>
      <DashboardHeader
        title="Usuarios"
        subtitle="Crear, editar y consultar personas registradas en el sistema."
        pills={[
          { label: 'Usuarios', value: dashboard.personas.length },
          { label: 'Cargos', value: dashboard.cargos.length }
        ]}
      />

      <StatusToaster status={dashboard.status} />

      <section className="workspace-grid workspace-grid--single">
        <PersonaForm
          values={dashboard.personaForm}
          cargos={dashboard.cargos}
          isSaving={dashboard.isSavingPersona}
          editingId={dashboard.editingPersonaId}
          onChange={dashboard.updatePersonaField}
          onSubmit={dashboard.handleGuardarPersona}
          onCancelEdit={dashboard.resetPersonaForm}
        />

        <PersonasTable personas={dashboard.personas} onEdit={dashboard.loadPersonaForEdit} />
      </section>

      {dashboard.isLoading ? <div className="loading-banner">Cargando usuarios...</div> : null}
    </>
  );
};