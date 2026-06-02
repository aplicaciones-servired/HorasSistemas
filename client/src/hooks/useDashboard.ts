import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { createCargo, listCargos } from '../services/cargoService';
import { getApiErrorMessage } from '../services/api';
import {
  createPersona,
  findPersonaByCedula,
  listPersonas,
  updatePersona,
  type PersonaPayload
} from '../services/personaService';
import { createRegistro, listRegistros, updateRegistro, type RegistroPayload } from '../services/registroService';
import type {
  Cargo,
  CargoFormValues,
  LookupState,
  Persona,
  PersonaFormValues,
  RegistroAsistencia,
  RegistroFormValues,
  StatusType
} from '../types/domain';

const today = new Date().toISOString().slice(0, 10);

const initialRegistroForm: RegistroFormValues = {
  cedula: '',
  nombres: '',
  apellidos: '',
  cargoId: '',
  fecha: today,
  horaEntrada: '',
  horaSalida: '',
  observacion: ''
};

const initialCargoForm: CargoFormValues = {
  nombre: '',
  descripcion: ''
};

const initialPersonaForm: PersonaFormValues = {
  cedula: '',
  nombres: '',
  apellidos: '',
  cargoId: '',
  activo: true
};

export const useDashboard = () => {
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [registros, setRegistros] = useState<RegistroAsistencia[]>([]);
  const [registroForm, setRegistroForm] = useState<RegistroFormValues>(initialRegistroForm);
  const [cargoForm, setCargoForm] = useState<CargoFormValues>(initialCargoForm);
  const [personaForm, setPersonaForm] = useState<PersonaFormValues>(initialPersonaForm);
  const [editingPersonaId, setEditingPersonaId] = useState<number | null>(null);
  const [status, setStatus] = useState<{ type: StatusType; message: string }>({ type: 'idle', message: '' });
  const [lookupState, setLookupState] = useState<LookupState>('idle');
  const [foundPersona, setFoundPersona] = useState<Persona | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingRegistro, setIsSavingRegistro] = useState(false);
  const [isSavingCargo, setIsSavingCargo] = useState(false);
  const [isSavingPersona, setIsSavingPersona] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const clearTransientStatus = (): void => {
    setStatus((current) => (current.type === 'success' ? current : { type: 'idle', message: '' }));
  };

  const refreshData = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const [nextCargos, nextPersonas, nextRegistros] = await Promise.all([
        listCargos(),
        listPersonas(),
        listRegistros()
      ]);

      setCargos(nextCargos);
      setPersonas(nextPersonas);
      setRegistros(nextRegistros);
      setLastRefresh(new Date());
    } catch (error) {
      setStatus({ type: 'error', message: getApiErrorMessage(error, 'No se pudo cargar la información inicial') });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshData();
  }, []);

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
      cargoId: persona.cargoId ? String(persona.cargoId) : '',
      activo: persona.activo
    });
    setStatus({ type: 'info', message: 'Usuario cargado para edición.' });
  };

  const resetPersonaForm = (): void => {
    setEditingPersonaId(null);
    setPersonaForm(initialPersonaForm);
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
    cargoId: values.cargoId ? Number(values.cargoId) : null,
    activo: true
  });

  const buildRegistroPayload = (personaId: number, values: RegistroFormValues): RegistroPayload => ({
    personaId,
    cargoId: values.cargoId ? Number(values.cargoId) : null,
    fecha: values.fecha,
    horaEntrada: values.horaEntrada,
    horaSalida: values.horaSalida,
    observacion: values.observacion.trim() ? values.observacion.trim() : null
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

      const registroPayload = buildRegistroPayload(persona.id, registroForm);
      const existingRegistro = registros.find(
        (registro) => registro.personaId === persona.id && registro.fecha === registroForm.fecha
      );

      if (existingRegistro) {
        await updateRegistro(existingRegistro.id, registroPayload);
      } else {
        await createRegistro(registroPayload);
      }

      setFoundPersona(persona);
      setLookupState('found');
      setStatus({
        type: 'success',
        message: existingRegistro ? 'Registro actualizado correctamente.' : 'Registro guardado correctamente.'
      });

      setRegistroForm((current) => ({
        ...current,
        horaEntrada: '',
        horaSalida: '',
        observacion: ''
      }));

      await refreshData();
    } catch (error) {
      setStatus({ type: 'error', message: getApiErrorMessage(error, 'No se pudo guardar el registro') });
    } finally {
      setIsSavingRegistro(false);
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
    registroForm,
    cargoForm,
    personaForm,
    editingPersonaId,
    status,
    lookupState,
    foundPersona,
    isLoading,
    isSavingRegistro,
    isSavingCargo,
    isSavingPersona,
    summary,
    updateRegistroField,
    updateCargoField,
    updatePersonaField,
    handleBuscarCedula,
    handleGuardarRegistro,
    handleGuardarCargo,
    handleGuardarPersona,
    handleSelectPersona,
    loadPersonaForEdit,
    resetPersonaForm,
    refreshData
  };
};