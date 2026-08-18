import { useEffect, useState, type FormEvent } from 'react';
import { DashboardHeader } from '../components/layout/DashboardHeader';
import { TurnoForm } from '../components/forms/TurnoForm';
import { TurnosTable } from '../components/tables/TurnosTable';
import { StatusToaster } from '../components/toast/StatusToaster';
import { listTurnos, createTurno, updateTurno, deleteTurno } from '../services/turnoService';
import { getApiErrorMessage } from '../services/api';
import type { Turno, TurnoFormValues, StatusType } from '../types/domain';

const initialForm: TurnoFormValues = {
  nombre: '',
  horaEntrada: '',
  horaSalida: '',
  esDominical: false
};

export const TurnosPage = () => {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [form, setForm] = useState<TurnoFormValues>(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [status, setStatus] = useState<{ type: StatusType; message: string }>({ type: 'idle', message: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const refresh = async () => {
    setIsLoading(true);
    try {
      const data = await listTurnos();
      setTurnos(data);
    } catch (error) {
      setStatus({ type: 'error', message: getApiErrorMessage(error, 'No se pudieron cargar los turnos') });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const updateField = <K extends keyof TurnoFormValues>(field: K, value: TurnoFormValues[K]) => {
    setStatus((current) => (current.type === 'success' ? current : { type: 'idle', message: '' }));
    setForm((current) => ({ ...current, [field]: value }));
  };

  const loadForEdit = (turno: Turno) => {
    setEditingId(turno.id);
    setForm({
      nombre: turno.nombre,
      horaEntrada: turno.horaEntrada,
      horaSalida: turno.horaSalida,
      esDominical: turno.esDominical
    });
    setStatus({ type: 'info', message: 'Turno cargado para edición.' });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      if (editingId) {
        await updateTurno(editingId, form);
        setStatus({ type: 'success', message: 'Turno actualizado correctamente.' });
      } else {
        await createTurno(form);
        setStatus({ type: 'success', message: 'Turno creado correctamente.' });
      }
      resetForm();
      await refresh();
    } catch (error) {
      setStatus({ type: 'error', message: getApiErrorMessage(error, 'No se pudo guardar el turno') });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (turno: Turno) => {
    const confirmado = window.confirm(`¿Eliminar el turno "${turno.nombre}"?`);
    if (!confirmado) return;

    try {
      await deleteTurno(turno.id);
      setStatus({ type: 'success', message: 'Turno eliminado correctamente.' });
      await refresh();
    } catch (error) {
      setStatus({ type: 'error', message: getApiErrorMessage(error, 'No se pudo eliminar el turno') });
    }
  };

  return (
    <>
      <DashboardHeader
        title="Turnos"
        subtitle="Crear y gestionar los turnos rápidos para el registro de asistencia."
        pills={[{ label: 'Turnos', value: turnos.length }]}
      />

      <StatusToaster status={status} />

      <section className="workspace-grid workspace-grid--single">
        <TurnoForm
          values={form}
          isSaving={isSaving}
          isEditing={editingId !== null}
          onChange={updateField}
          onSubmit={handleSubmit}
          onReset={resetForm}
        />

        <TurnosTable turnos={turnos} onEdit={loadForEdit} onDelete={handleDelete} />
      </section>

      {isLoading ? <div className="loading-banner">Cargando turnos...</div> : null}
    </>
  );
};
