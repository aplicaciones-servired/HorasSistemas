import { RegistroAsistencia, Persona, Cargo } from '../models';

interface NominaRow {
  cedula: string;
  nombres: string;
  apellidos: string;
  cargo: string;
  horasTrabajadas: number;
  horasDominicales: number;
  horasNetas: number;
  valorHora: number;
  salarioTotal: number;
}

export class NominaService {
  // Valor por hora (puede ser configurado por cargo en el futuro)
  private readonly VALOR_HORA_BASE = 20000; // COP

  private calcularHoras(horaEntrada: string, horaSalida: string): number {
    try {
      const [entH, entM] = horaEntrada.split(':').map(Number);
      const [salH, salM] = horaSalida.split(':').map(Number);
      
      const entradaMinutos = entH * 60 + entM;
      const salidaMinutos = salH * 60 + salM;
      
      let diferencia = salidaMinutos - entradaMinutos;
      if (diferencia < 0) {
        diferencia += 24 * 60; // Si sale después de medianoche
      }
      
      return Math.round((diferencia / 60) * 100) / 100; // Redondear a 2 decimales
    } catch {
      return 0;
    }
  }

  async generarNomina(): Promise<NominaRow[]> {
    const registros = await RegistroAsistencia.findAll({
      include: [
        { model: Persona, as: 'persona' },
        { model: Cargo, as: 'cargo' }
      ],
      order: [['personaId', 'ASC']]
    });

    // Agrupar por persona
    const porPersona = new Map<number, any[]>();
    
    registros.forEach((registro: any) => {
      if (!porPersona.has(registro.personaId)) {
        porPersona.set(registro.personaId, []);
      }
      porPersona.get(registro.personaId)!.push(registro);
    });

    // Calcular nómina por persona
    const nomina: NominaRow[] = [];

    porPersona.forEach((registrosPersona: any[], personaId: number) => {
      if (registrosPersona.length === 0) return;

      const persona = registrosPersona[0].persona;
      const cargo = registrosPersona[0].cargo;
      const valorHora = this.VALOR_HORA_BASE;

      let horasTotales = 0;
      let horasDominicales = 0;

      registrosPersona.forEach((registro: any) => {
        const horas = this.calcularHoras(registro.horaEntrada, registro.horaSalida);
        
        if (registro.esDominical) {
          horasDominicales += horas;
        } else {
          horasTotales += horas;
        }
      });

      const horasNetas = horasTotales;
      const salarioTotal = horasNetas * valorHora;

      nomina.push({
        cedula: persona.cedula,
        nombres: persona.nombres,
        apellidos: persona.apellidos,
        cargo: cargo?.nombre || 'N/A',
        horasTrabajadas: Math.round(horasTotales * 100) / 100,
        horasDominicales: Math.round(horasDominicales * 100) / 100,
        horasNetas: Math.round(horasNetas * 100) / 100,
        valorHora,
        salarioTotal: Math.round(salarioTotal)
      });
    });

    return nomina;
  }
}
