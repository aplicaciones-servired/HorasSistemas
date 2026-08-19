import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { createCargo, listCargos } from '../services/cargoService';
import { getApiErrorMessage } from '../services/api';
import { fechaCorteService, type FechaCortePayload } from '../services/fechaCorteService';
import {
  createPersona,
  deletePersona,
  findPersonaByCedula,
  listPersonas,
  updatePersona,
  type PersonaPayload
} from '../services/personaService';
import { createRegistro, deleteRegistro, listRegistros, updateRegistro, type RegistroPayload } from '../services/registroService';
import { listTurnos } from '../services/turnoService';
import { useConfirm } from '../components/toast/useConfirm';
import type {
  Cargo,
  CargoFormValues,
  FechaCorte,
  FechaCorteFormValues,
  LookupState,
  Persona,
  PersonaFormValues,
  RegistroAsistencia,
  RegistroFormValues,
  StatusType,
  Turno
} from '../types/domain';

const today = new Date().toISOString().slice(0, 10);

const initialRegistroForm: RegistroFormValues = {
  cedula: '',
  nombres: '',
  apellidos: '',
  empresa: '',
  cargoId: '',
  fecha: today,
  fechas: [today],
  horaEntrada: '',
  horaSalida: '',
  observacion: '',
  esDominical: false
};

const initialCargoForm: CargoFormValues = {
  nombre: '',
  descripcion: ''
};

const initialPersonaForm: PersonaFormValues = {
  cedula: '',
  nombres: '',
  apellidos: '',
  empresa: '',
  cargoId: '',
  activo: true
};

export const useDashboard = () => {
  const { confirm } = useConfirm();
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [registros, setRegistros] = useState<RegistroAsistencia[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [registroForm, setRegistroForm] = useState<RegistroFormValues>(initialRegistroForm);
  const [cargoForm, setCargoForm] = useState<CargoFormValues>(initialCargoForm);
  const [personaForm, setPersonaForm] = useState<PersonaFormValues>(initialPersonaForm);
  const [editingPersonaId, setEditingPersonaId] = useState<number | null>(null);
  const [editingRegistroId, setEditingRegistroId] = useState<number | null>(null);
  const [status, setStatus] = useState<{ type: StatusType; message: string }>({ type: 'idle', message: '' });
  const [lookupState, setLookupState] = useState<LookupState>('idle');
  const [foundPersona, setFoundPersona] = useState<Persona | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingRegistro, setIsSavingRegistro] = useState(false);
  const [isDeletingRegistro, setIsDeletingRegistro] = useState(false);
  const [isSavingCargo, setIsSavingCargo] = useState(false);
  const [isSavingPersona, setIsSavingPersona] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const [fechasCorte, setFechasCorte] = useState<FechaCorte[]>([]);
  const [selectedFechaCorteId, setSelectedFechaCorteId] = useState<number | null>(null);
  const [registrosFechaCorte, setRegistrosFechaCorte] = useState<RegistroAsistencia[]>([]);
  const [isSavingFechaCorte, setIsSavingFechaCorte] = useState(false);
  const [empresaFilter, setEmpresaFilter] = useState<string>('');

  const selectedFechaCorte = fechasCorte.find((f) => f.id === selectedFechaCorteId) ?? null;

  const clearTransientStatus = (): void => {
    setStatus((current) => (current.type === 'success' ? current : { type: 'idle', message: '' }));
  };

  const refreshData = async (empresa?: string): Promise<void> => {
    setIsLoading(true);
    try {
      const [nextCargos, nextPersonas, nextRegistros, nextTurnos, nextFechasCorte] = await Promise.all([
        listCargos(),
        listPersonas(),
        listRegistros(),
        listTurnos(),
        fechaCorteService.list(empresa)
      ]);

      setCargos(Array.isArray(nextCargos) ? nextCargos : []);
      setPersonas(Array.isArray(nextPersonas) ? nextPersonas : []);
      setRegistros(Array.isArray(nextRegistros) ? nextRegistros : []);
      setTurnos(Array.isArray(nextTurnos) ? nextTurnos : []);
      setFechasCorte(Array.isArray(nextFechasCorte) ? nextFechasCorte : []);
      setLastRefresh(new Date());
    } catch (error) {
      setStatus({ type: 'error', message: getApiErrorMessage(error, 'No se pudo cargar la información inicial') });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshData(empresaFilter || undefined);
  }, [empresaFilter]);

  const refreshRegistrosFechaCorte = async (): Promise<void> => {
    if (!selectedFechaCorteId) {
      setRegistrosFechaCorte([]);
      return;
    }
    try {
      const regs = await fechaCorteService.listRegistros(selectedFechaCorteId);
      setRegistrosFechaCorte(Array.isArray(regs) ? regs : []);
    } catch (error) {
      setStatus({ type: 'error', message: getApiErrorMessage(error, 'No se pudieron cargar los registros de la fecha de corte') });
    }
  };

  useEffect(() => {
    void refreshRegistrosFechaCorte();
  }, [selectedFechaCorteId]);

  const handleCreateFechaCorte = async (values: FechaCorteFormValues): Promise<void> => {
    setIsSavingFechaCorte(true);
    try {
      await fechaCorteService.create(values);
      setStatus({ type: 'success', message: 'Fecha de corte creada correctamente.' });
      await refreshData();
    } catch (error) {
      setStatus({ type: 'error', message: getApiErrorMessage(error, 'No se pudo crear la fecha de corte') });
    } finally {
      setIsSavingFechaCorte(false);
    }
  };

  const handleDeleteFechaCorte = async (id: number): Promise<void> => {
    const confirmado = await confirm('¿Eliminar esta fecha de corte?');
    if (!confirmado) return;

    setIsSavingFechaCorte(true);
    try {
      await fechaCorteService.remove(id);
      if (selectedFechaCorteId === id) {
        setSelectedFechaCorteId(null);
        setRegistrosFechaCorte([]);
      }
      setStatus({ type: 'success', message: 'Fecha de corte eliminada correctamente.' });
      await refreshData();
    } catch (error) {
      setStatus({ type: 'error', message: getApiErrorMessage(error, 'No se pudo eliminar la fecha de corte') });
    } finally {
      setIsSavingFechaCorte(false);
    }
  };

  const handleFinalizarFechaCorte = async (id: number, empresa?: string): Promise<void> => {
    const fc = fechasCorte.find((f) => f.id === id);
    const mensaje = fc?.completada
      ? `¿Regenerar el Excel para esta fecha de corte${empresa ? ` (${empresa})` : ''}?`
      : `¿Finalizar esta fecha de corte${empresa ? ` (${empresa})` : ''}? Se generará el archivo Excel.`;
    const confirmado = await confirm(mensaje);
    if (!confirmado) return;

    setIsSavingFechaCorte(true);
    try {
      const blob = await fechaCorteService.finalizar(id, empresa);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      const fc = fechasCorte.find((f) => f.id === id);
      const empresaLabel = empresa ? `_${empresa}` : '';
      const filename = fc
        ? `Novedades_nomina_jamundi${empresaLabel}_${fc.fechaInicio}_${fc.fechaFin}.xlsx`
        : `Novedades_nomina_jamundi${empresaLabel}.xlsx`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      if (empresa) {
        setStatus({ type: 'success', message: `Excel descargado y correo enviado a destinatarios de ${empresa}.` });
      } else {
        setStatus({ type: 'success', message: 'Fecha de corte finalizada y Excel descargado.' });
      }
      await refreshData();
    } catch (error) {
      setStatus({ type: 'error', message: getApiErrorMessage(error, 'No se pudo finalizar la fecha de corte') });
    } finally {
      setIsSavingFechaCorte(false);
    }
  };

  const handleGuardarRegistroGrid = async (
    personaId: number,
    fecha: string,
    horaEntrada: string,
    horaSalida: string,
    esDominical: boolean,
    existingRegistroId?: number
  ): Promise<void> => {
    if (!selectedFechaCorteId) return;
    setIsSavingFechaCorte(true);
    try {
      const persona = personas.find((p) => p.id === personaId);
      const cargoId = persona?.cargoId ?? null;

      if (existingRegistroId) {
        await updateRegistro(existingRegistroId, {
          personaId,
          cargoId,
          fechaCorteId: selectedFechaCorteId,
          fecha,
          horaEntrada,
          horaSalida,
          observacion: null,
          esDominical
        });
      } else {
        await createRegistro({
          personaId,
          cargoId,
          fechaCorteId: selectedFechaCorteId,
          fecha,
          horaEntrada,
          horaSalida,
          observacion: null,
          esDominical
        });
      }
      await refreshRegistrosFechaCorte();
    } catch (error) {
      setStatus({ type: 'error', message: getApiErrorMessage(error, 'No se pudo guardar el registro') });
    } finally {
      setIsSavingFechaCorte(false);
    }
  };

  const updateRegistroField = <K extends keyof RegistroFormValues>(field: K, value: RegistroFormValues[K]): void => {
    clearTransientStatus();

    setRegistroForm((current) => ({
      ...current,
      [field]: value
    }));

    if (field === 'cedula') {
      setFoundPersona(null);
      setLookupState('idle');
    }
  };

  const handleSelectPersona = (personaId: number | null): void => {
    clearTransientStatus();

    if (!personaId) {
      setFoundPersona(null);
      setLookupState('idle');
      setRegistroForm((current) => ({
        ...current,
        cedula: '',
        nombres: '',
        apellidos: '',
        empresa: '',
        cargoId: ''
      }));
      return;
    }

    const persona = personas.find((item) => item.id === personaId) ?? null;

    if (!persona) {
      setFoundPersona(null);
      setLookupState('idle');
      return;
    }

    setFoundPersona(persona);
    setLookupState('found');
    setRegistroForm((current) => ({
      ...current,
      cedula: persona.cedula,
      nombres: persona.nombres,
      apellidos: persona.apellidos,
      empresa: persona.empresa ?? '',
      cargoId: persona.cargoId ? String(persona.cargoId) : ''
    }));
    setStatus({ type: 'info', message: 'Usuario seleccionado de los registrados.' });
  };

  const updateCargoField = <K extends keyof CargoFormValues>(field: K, value: CargoFormValues[K]): void => {
    clearTransientStatus();
    setCargoForm((current) => ({
      ...current,
      [field]: value
    }));
  };

  const updatePersonaField = <K extends keyof PersonaFormValues>(field: K, value: PersonaFormValues[K]): void => {
    clearTransientStatus();
    setPersonaForm((current) => ({
      ...current,
      [field]: value
    }));
  };

  const loadPersonaForEdit = (persona: Persona): void => {
    setEditingPersonaId(persona.id);
    setPersonaForm({
      cedula: persona.cedula,
      nombres: persona.nombres,
      apellidos: persona.apellidos,
      empresa: persona.empresa ?? '',
      cargoId: persona.cargoId ? String(persona.cargoId) : '',
      activo: persona.activo
    });
    setStatus({ type: 'info', message: 'Usuario cargado para edición.' });
  };

  const resetPersonaForm = (): void => {
    setEditingPersonaId(null);
    setPersonaForm(initialPersonaForm);
  };

  const loadRegistroForEdit = (registro: RegistroAsistencia): void => {
    const persona = registro.persona ?? null;
    setEditingRegistroId(registro.id);
    setFoundPersona(persona);
    setLookupState(persona ? 'found' : 'idle');
    setRegistroForm({
      cedula: persona?.cedula ?? '',
      nombres: persona?.nombres ?? '',
      apellidos: persona?.apellidos ?? '',
      empresa: persona?.empresa ?? '',
      cargoId: registro.cargoId ? String(registro.cargoId) : '',
      fecha: registro.fecha,
      fechas: [registro.fecha],
      horaEntrada: registro.horaEntrada,
      horaSalida: registro.horaSalida,
      observacion: registro.observacion ?? '',
      esDominical: registro.esDominical
    });
    setStatus({ type: 'info', message: 'Registro cargado para edición.' });
  };

  const resetRegistroForm = (): void => {
    setEditingRegistroId(null);
    setFoundPersona(null);
    setLookupState('idle');
    setRegistroForm(initialRegistroForm);
  };

  const handleBuscarCedula = async (): Promise<void> => {
    const cedula = registroForm.cedula.trim();

    if (!cedula) {
      setLookupState('idle');
      setStatus({ type: 'info', message: 'Escribe una cédula para buscar primero.' });
      return;
    }

    setLookupState('loading');

    try {
      const persona = await findPersonaByCedula(cedula);
      setFoundPersona(persona);
      setLookupState('found');

      setRegistroForm((current) => ({
        ...current,
        nombres: persona.nombres,
        apellidos: persona.apellidos,
        empresa: persona.empresa ?? '',
        cargoId: persona.cargoId ? String(persona.cargoId) : current.cargoId
      }));

      setStatus({ type: 'success', message: 'Persona encontrada y cargada en el formulario.' });
    } catch {
      setFoundPersona(null);
      setLookupState('not-found');
      setStatus({ type: 'info', message: 'No existe la cédula. Puedes registrar la persona desde este mismo formulario.' });
    }
  };

  const buildPersonaPayload = (values: RegistroFormValues): PersonaPayload => ({
    cedula: values.cedula.trim(),
    nombres: values.nombres.trim(),
    apellidos: values.apellidos.trim(),
    empresa: values.empresa?.trim() || null,
    cargoId: values.cargoId ? Number(values.cargoId) : null,
    activo: true
  });

  const buildRegistroPayload = (personaId: number, values: RegistroFormValues): RegistroPayload => ({
    personaId,
    cargoId: values.cargoId ? Number(values.cargoId) : null,
    fechaCorteId: selectedFechaCorteId,
    fecha: values.fecha,
    horaEntrada: values.horaEntrada,
    horaSalida: values.horaSalida,
    observacion: values.observacion.trim() ? values.observacion.trim() : null,
    esDominical: values.esDominical
  });

  const handleGuardarRegistro = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setIsSavingRegistro(true);

    try {
      const personaPayload = buildPersonaPayload(registroForm);

      let persona = foundPersona;

      if (!persona) {
        try {
          persona = await findPersonaByCedula(personaPayload.cedula);
        } catch {
          persona = null;
        }
      }

      if (persona) {
        persona = await updatePersona(persona.id, personaPayload);
      } else {
        persona = await createPersona(personaPayload);
      }

      const fechas = registroForm.fechas.length > 0 ? registroForm.fechas : [registroForm.fecha];

      if (editingRegistroId) {
        const registroPayload = buildRegistroPayload(persona.id, registroForm);
        registroPayload.fecha = registroForm.fecha;
        await updateRegistro(editingRegistroId, registroPayload);
        setStatus({ type: 'success', message: 'Registro actualizado correctamente.' });
        resetRegistroForm();
      } else {
        let created = 0;
        let updated = 0;

        for (const fecha of fechas) {
          const registroPayload = buildRegistroPayload(persona.id, registroForm);
          registroPayload.fecha = fecha;

          const existingRegistro = registros.find(
            (registro) => registro.personaId === persona!.id && registro.fecha === fecha
          );

          if (existingRegistro) {
            await updateRegistro(existingRegistro.id, registroPayload);
            updated++;
          } else {
            await createRegistro(registroPayload);
            created++;
          }
        }

        setFoundPersona(persona);
        setLookupState('found');

        const total = fechas.length;
        if (total === 1) {
          setStatus({
            type: 'success',
            message: created === 1 ? 'Registro guardado correctamente.' : 'Registro actualizado correctamente.'
          });
        } else {
          setStatus({
            type: 'success',
            message: `${total} registros procesados (${created} creados, ${updated} actualizados).`
          });
        }

        setRegistroForm((current) => ({
          ...current,
          fechas: [],
          horaEntrada: '',
          horaSalida: '',
          observacion: ''
        }));
      }

      await refreshData();
      if (selectedFechaCorteId) {
        await refreshRegistrosFechaCorte();
      }
    } catch (error) {
      setStatus({ type: 'error', message: getApiErrorMessage(error, 'No se pudo guardar el registro') });
    } finally {
      setIsSavingRegistro(false);
    }
  };

  const handleEliminarRegistro = async (registro: RegistroAsistencia): Promise<void> => {
    const nombre = registro.persona
      ? `${registro.persona.nombres} ${registro.persona.apellidos}`.trim()
      : `#${registro.id}`;
    const confirmado = await confirm(`¿Eliminar la novedad de ${nombre} del ${registro.fecha}?`);

    if (!confirmado) return;

    setIsDeletingRegistro(true);

    try {
      await deleteRegistro(registro.id);
      setStatus({ type: 'success', message: 'Registro eliminado correctamente.' });
      await refreshData();
      if (selectedFechaCorteId) {
        await refreshRegistrosFechaCorte();
      }
    } catch (error) {
      setStatus({ type: 'error', message: getApiErrorMessage(error, 'No se pudo eliminar el registro') });
    } finally {
      setIsDeletingRegistro(false);
    }
  };

  const handleEliminarPersona = async (persona: Persona): Promise<void> => {
    const nombre = `${persona.nombres} ${persona.apellidos}`.trim();
    const confirmado = await confirm(
      `¿Eliminar al usuario ${nombre} (cédula ${persona.cedula})?\n\nEsto eliminará también todos sus registros de asistencia.`
    );

    if (!confirmado) return;

    try {
      await deletePersona(persona.id);
      setStatus({ type: 'success', message: `Usuario ${nombre} eliminado correctamente.` });
      setFoundPersona(null);
      setLookupState('idle');
      setRegistroForm((current) => ({
        ...current,
        cedula: '',
        nombres: '',
        apellidos: '',
        cargoId: ''
      }));
      await refreshData();
    } catch (error) {
      setStatus({ type: 'error', message: getApiErrorMessage(error, 'No se pudo eliminar el usuario') });
    }
  };

  const handleGuardarCargo = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setIsSavingCargo(true);

    try {
      await createCargo(cargoForm);
      setCargoForm(initialCargoForm);
      setStatus({ type: 'success', message: 'Cargo creado correctamente.' });
      await refreshData();
    } catch (error) {
      setStatus({ type: 'error', message: getApiErrorMessage(error, 'No se pudo guardar el cargo') });
    } finally {
      setIsSavingCargo(false);
    }
  };

  const handleGuardarPersona = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setIsSavingPersona(true);

    try {
      const payload: PersonaPayload = {
        cedula: personaForm.cedula.trim(),
        nombres: personaForm.nombres.trim(),
        apellidos: personaForm.apellidos.trim(),
        empresa: personaForm.empresa.trim() || null,
        cargoId: personaForm.cargoId ? Number(personaForm.cargoId) : null,
        activo: personaForm.activo
      };

      if (editingPersonaId) {
        await updatePersona(editingPersonaId, payload);
        setStatus({ type: 'success', message: 'Usuario actualizado correctamente.' });
      } else {
        await createPersona(payload);
        setStatus({ type: 'success', message: 'Usuario creado correctamente.' });
      }

      resetPersonaForm();
      await refreshData();
    } catch (error) {
      setStatus({ type: 'error', message: getApiErrorMessage(error, 'No se pudo guardar el usuario') });
    } finally {
      setIsSavingPersona(false);
    }
  };

  const summary = useMemo(
    () => [
      { label: 'Cargos activos', value: cargos.length },
      { label: 'Personas registradas', value: personas.length },
      { label: 'Novedades guardadas', value: registros.length },
      {
        label: 'Última sincronización',
        value: lastRefresh ? lastRefresh.toLocaleString('es-CO') : 'Pendiente'
      }
    ],
    [cargos.length, lastRefresh, personas.length, registros.length]
  );

  return {
    cargos,
    personas,
    registros,
    turnos,
    registroForm,
    cargoForm,
    personaForm,
    editingPersonaId,
    editingRegistroId,
    status,
    lookupState,
    foundPersona,
    isLoading,
    isSavingRegistro,
    isDeletingRegistro,
    isSavingCargo,
    isSavingPersona,
    summary,
    fechasCorte,
    selectedFechaCorte,
    selectedFechaCorteId,
    registrosFechaCorte,
    isSavingFechaCorte,
    empresaFilter,
    setEmpresaFilter,
    setStatus,
    updateRegistroField,
    updateCargoField,
    updatePersonaField,
    handleBuscarCedula,
    handleGuardarRegistro,
    handleEliminarRegistro,
    handleEliminarPersona,
    handleGuardarCargo,
    handleGuardarPersona,
    handleSelectPersona,
    loadPersonaForEdit,
    loadRegistroForEdit,
    resetPersonaForm,
    resetRegistroForm,
    refreshData,
    setSelectedFechaCorteId,
    handleCreateFechaCorte,
    handleDeleteFechaCorte,
    handleFinalizarFechaCorte,
    handleGuardarRegistroGrid
  };
};