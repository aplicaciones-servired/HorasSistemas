import ExcelJS from 'exceljs';
import { RegistroAsistencia, Persona, Cargo } from '../models';

// Reglas de cálculo (estándar laboral colombiano)
const JORNADA_BASE_MIN = 440; // 7.33 horas al día para dominicales/festivas (44 horas semanales / 6 días)
const JORNADA_BASE_ORDINARIO_MIN = 480; // 8 horas al día para jornadas ordinarias
const MIN_DIA_INICIO = 360; // 06:00 -> fin de la franja nocturna
const MIN_NOCHE_INICIO = 1140; // 19:00 -> inicio de la franja nocturna (normativa 2026)
const MINUTOS_ALMUERZO = 60; // 1 hora de almuerzo en turnos de más de 8 horas
const LIMITE_SIN_ALMUERZO_MIN = 480; // 8 horas

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

const ANCHO_COLUMNAS = [
  3.33203125, 18.83203125, 18.83203125, 29.5, 8.5, 8.5, 8.5, 8.5,
  8.1640625, 8.83203125, 8.6640625, 8.83203125, 8.6640625, 8.83203125, 8.6640625, 8.83203125, 8.6640625
];

interface HorasCalculadas {
  dominicalDiurna: number;
  dominicalNocturna: number;
  extraDominicalDiurna: number;
  extraDominicalNocturna: number;
  recargoNocturnoOrdinario: number;
  recargoNocturnoFestivo: number;
  extraDiurna: number;
  extraNocturna: number;
}

interface FilaReporte {
  nombre: string;
  cedula: string;
  cargo: string;
  fecha: string;
  horaEntrada: string;
  horaSalida: string;
  horas: HorasCalculadas;
}

function aMinutos(valor: any): number {
  if (valor instanceof Date) {
    return valor.getHours() * 60 + valor.getMinutes();
  }
  const partes = String(valor).split(':').map(Number);
  return partes[0] * 60 + (partes[1] || 0);
}

function formatoHora(valor: any): string {
  if (valor instanceof Date) {
    const hh = String(valor.getHours()).replace(/^0/, '');
    const mm = String(valor.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }
  return String(valor).slice(0, 5).replace(/^0(\d):/, '$1:');
}

function minutosDeTurno(horaEntrada: any, horaSalida: any): number[] {
  let entrada = aMinutos(horaEntrada);
  let salida = aMinutos(horaSalida);

  let duracion = salida - entrada;
  if (duracion <= 0) {
    duracion += 24 * 60; // turno que cruza medianoche
  }

  const minutos: number[] = [];
  for (let i = 0; i < duracion; i++) {
    minutos.push((entrada + i) % (24 * 60));
  }
  return minutos;
}

function descontarAlmuerzo(minutos: number[]): number[] {
  if (minutos.length <= LIMITE_SIN_ALMUERZO_MIN) return minutos;

  const restantes = [...minutos];
  let porRemover = MINUTOS_ALMUERZO;
  let indice = 0;

  // Preferir la franja de almuerzo (12:00 - 14:00)
  while (porRemover > 0 && indice < restantes.length) {
    const t = restantes[indice];
    if (t >= 720 && t < 840) {
      restantes.splice(indice, 1);
      porRemover--;
    } else {
      indice++;
    }
  }

  // Si el turno no cubre la franja completa, quitar del final
  while (porRemover > 0 && restantes.length > 0) {
    restantes.pop();
    porRemover--;
  }

  return restantes;
}

function calcularHoras(minutos: number[], esDominical: boolean): HorasCalculadas {
  const horas: HorasCalculadas = {
    dominicalDiurna: 0,
    dominicalNocturna: 0,
    extraDominicalDiurna: 0,
    extraDominicalNocturna: 0,
    recargoNocturnoOrdinario: 0,
    recargoNocturnoFestivo: 0,
    extraDiurna: 0,
    extraNocturna: 0
  };

  let contador = 0;
  for (const t of minutos) {
    const nocturna = t >= MIN_NOCHE_INICIO || t < MIN_DIA_INICIO;

    if (esDominical) {
      const esExtra = contador >= JORNADA_BASE_MIN;
      if (esExtra) {
        if (nocturna) horas.extraDominicalNocturna++;
        else horas.extraDominicalDiurna++;
      } else {
        if (nocturna) horas.dominicalNocturna++;
        else horas.dominicalDiurna++;
      }
    } else if (nocturna) {
      horas.recargoNocturnoOrdinario++;
    } else if (contador >= JORNADA_BASE_ORDINARIO_MIN) {
      horas.extraDiurna++;
    }
    contador++;
  }

  return horas;
}

function redondearHoras(minutos: number): number {
  return Math.round((minutos / 60) * 100) / 100;
}

function celdaHoras(valor: number): number | '' {
  return valor > 0 ? redondearHoras(valor) : '';
}

function formatearFecha(fecha: Date): string {
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${fecha.getFullYear()}`;
}

function formatearPeriodo(fecha: Date, conAnio: boolean): string {
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = MESES[fecha.getMonth()];
  return conAnio
    ? `${dia} de ${mes} del  ${fecha.getFullYear()}`
    : `${dia} de ${mes}`;
}

function textoCompania(): { richText: ExcelJS.RichText[] } {
  return {
    richText: [
      { font: { bold: true, size: 5, name: 'Arial' }, text: 'Grupo Empresarial Servired S.A. ' },
      { font: { bold: true, underline: true, size: 5, name: 'Arial' }, text: '\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0' },
      { font: { bold: true, size: 5, name: 'Arial' }, text: 'Grupo Empresarial Multired S.A. _' },
      { font: { bold: true, underline: true, size: 5, name: 'Arial' }, text: 'X' },
      { font: { bold: true, size: 5, name: 'Arial' }, text: '_' }
    ]
  };
}

function aplicarBordes(worksheet: ExcelJS.Worksheet, filas: number) {
  for (let r = 1; r <= filas; r++) {
    for (let c = 1; c <= 17; c++) {
      const celda = worksheet.getCell(r, c);
      celda.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    }
  }
}

export class HorasExtrasService {
  async generarExcel(registros: RegistroAsistencia[]): Promise<any> {
    const filas: FilaReporte[] = registros
      .map((registro: any) => {
        const persona: Persona | undefined = registro.persona;
        const cargo: Cargo | undefined = registro.cargo;

        const minutos = descontarAlmuerzo(
          minutosDeTurno(registro.horaEntrada, registro.horaSalida)
        );

        return {
          nombre: persona ? `${persona.nombres} ${persona.apellidos}`.trim() : '',
          cedula: persona?.cedula || '',
          cargo: cargo?.nombre || '',
          fecha: registro.fecha,
          horaEntrada: formatoHora(registro.horaEntrada),
          horaSalida: formatoHora(registro.horaSalida),
          horas: calcularHoras(minutos, Boolean(registro.esDominical))
        };
      })
      .sort((a, b) => {
        const porFecha = a.fecha.localeCompare(b.fecha);
        if (porFecha !== 0) return porFecha;
        const porEntrada = a.horaEntrada.localeCompare(b.horaEntrada);
        if (porEntrada !== 0) return porEntrada;
        return a.nombre.localeCompare(b.nombre);
      });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Table 1');

    worksheet.columns = ANCHO_COLUMNAS.map((width, i) => ({
      width,
      key: `col${i + 1}`
    }));

    const fuenteTitulo: Partial<ExcelJS.Font> = {
      bold: true,
      size: 5,
      name: 'Arial'
    };
    const fuenteDatos: Partial<ExcelJS.Font> = {
      size: 5,
      name: 'Calibri'
    };
    const fuenteValorFirma: Partial<ExcelJS.Font> = {
      size: 5,
      name: 'Arial MT'
    };

    const alinear = (ref: string, align: Partial<ExcelJS.Alignment>): void => {
      worksheet.getCell(ref).alignment = align;
    };

    // Encabezado institucional
    worksheet.mergeCells('A1:B3');
    worksheet.mergeCells('C1:O1');
    worksheet.mergeCells('C2:O2');
    worksheet.mergeCells('C3:O3');

    worksheet.getCell('C1').value = 'PROCESO: FINANCIERO';
    worksheet.getCell('C2').value = 'FORMATO';
    worksheet.getCell('C3').value = 'REPORTE DE HORAS EXTRAS';
    worksheet.getCell('P1').value = 'CÓDIGO:';
    worksheet.getCell('Q1').value = 'FO-CT-04';
    worksheet.getCell('P2').value = 'VERSIÓN:';
    worksheet.getCell('Q2').value = 2;
    worksheet.getCell('P3').value = 'FECHA:';
    worksheet.getCell('Q3').value = new Date();

    for (const ref of ['C1', 'C2', 'C3', 'P1', 'Q1', 'P2', 'P3', 'Q3']) {
      worksheet.getCell(ref).font = fuenteTitulo;
      worksheet.getCell(ref).alignment = { horizontal: 'center', vertical: 'top', wrapText: true };
    }
    worksheet.getCell('Q2').font = fuenteTitulo;
    worksheet.getCell('Q2').numFmt = '00';
    worksheet.getCell('Q2').alignment = { horizontal: 'center', vertical: 'top', shrinkToFit: true };
    worksheet.getCell('Q3').numFmt = 'd/mm/yyyy;@';
    worksheet.getCell('Q3').alignment = { horizontal: 'center', vertical: 'top', shrinkToFit: true };

    // Periodo
    worksheet.mergeCells('A4:Q4');
    worksheet.mergeCells('A5:B5');
    worksheet.mergeCells('C5:D5');
    worksheet.mergeCells('E5:F5');
    worksheet.mergeCells('G5:Q5');

    const fechas = filas.map((f) => new Date(`${f.fecha}T12:00:00`));
    const periodo = filas.length > 0
      ? `${formatearPeriodo(new Date(Math.min(...fechas.map((d) => d.getTime()))), false)} al ${formatearPeriodo(new Date(Math.max(...fechas.map((d) => d.getTime()))), true)}`
      : '';

    worksheet.getCell('A5').value = 'PERIODO:';
    worksheet.getCell('C5').value = periodo;
    worksheet.getCell('E5').value = 'COMPAÑÍA';
    worksheet.getCell('G5').value = textoCompania();

    worksheet.getCell('A5').font = fuenteTitulo;
    worksheet.getCell('C5').font = fuenteTitulo;
    worksheet.getCell('C5').alignment = { horizontal: 'left', vertical: 'top', wrapText: true, indent: 8 };
    worksheet.getCell('E5').font = fuenteTitulo;
    worksheet.getCell('E5').alignment = { horizontal: 'left', vertical: 'top', wrapText: true, indent: 3 };
    worksheet.getCell('G5').alignment = { horizontal: 'center', vertical: 'top', wrapText: true };

    worksheet.mergeCells('A6:Q6');

    // Encabezados de la tabla
    worksheet.mergeCells('H7:I7');
    worksheet.mergeCells('J7:K7');
    worksheet.mergeCells('L7:M7');
    worksheet.mergeCells('N7:O7');
    worksheet.mergeCells('P7:Q7');

    const encabezados = [
      ['A7', 'NO°'],
      ['B7', 'NOMBRES Y APELLIDOS'],
      ['C7', 'NÚMERO DE DOCUMENTO'],
      ['D7', 'CARGO'],
      ['E7', 'FECHA'],
      ['F7', 'HORA ENTRADA'],
      ['G7', 'HORA SALIDA'],
      ['H7', 'RECARGO NOCTURNO'],
      ['J7', 'HORAS EXTRAS'],
      ['L7', 'HORAS DOMINICALES'],
      ['N7', 'HORAS EXTRAS DOMINICALES'],
      ['P7', 'HORAS EXTRAS FESTIVAS']
    ];
    for (const [ref, texto] of encabezados) {
      worksheet.getCell(ref).value = texto;
      worksheet.getCell(ref).font = fuenteTitulo;
      worksheet.getCell(ref).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    }
    // Alineaciones originales de la plantilla
    alinear('F7', { horizontal: 'left', vertical: 'top', wrapText: true, indent: 1 });
    alinear('H7', { horizontal: 'left', vertical: 'top', wrapText: true, indent: 1 });
    alinear('J7', { horizontal: 'left', vertical: 'top', wrapText: true, indent: 2 });
    alinear('L7', { horizontal: 'left', vertical: 'top', wrapText: true, indent: 1 });
    alinear('N7', { horizontal: 'left', vertical: 'top', wrapText: true });
    alinear('P7', { horizontal: 'left', vertical: 'top', wrapText: true, indent: 1 });

    const subencabezados: Array<[string, string, Partial<ExcelJS.Alignment>]> = [
      ['H8', 'ORDINARIO', { horizontal: 'center' }],
      ['I8', 'FESTIVO', { horizontal: 'left', indent: 1 }],
      ['J8', 'DIURNA', { horizontal: 'left', indent: 1 }],
      ['K8', 'NOCTURNA', { horizontal: 'left' }],
      ['L8', 'DIURNA', { horizontal: 'center' }],
      ['M8', 'NOCTURNA', { horizontal: 'left' }],
      ['N8', 'DIURNA', { horizontal: 'center' }],
      ['O8', 'NOCTURNA', { horizontal: 'center' }],
      ['P8', 'DIURNA', { horizontal: 'center' }],
      ['Q8', 'NOCTURNA', { horizontal: 'center' }]
    ];
    for (const [ref, texto, align] of subencabezados) {
      worksheet.getCell(ref).value = texto;
      worksheet.getCell(ref).font = fuenteTitulo;
      worksheet.getCell(ref).alignment = { ...align, vertical: 'top', wrapText: true };
    }
    // RECARGO NOCTURNO: ORDINARIO y FESTIVO en Calibri 5, centrados vertical y horizontalmente
    worksheet.getCell('H8').font = { bold: true, size: 5, name: 'Calibri' };
    worksheet.getCell('H8').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    worksheet.getCell('I8').font = { bold: true, size: 5, name: 'Calibri' };
    worksheet.getCell('I8').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

    // Datos
    filas.forEach((fila, idx) => {
      const filaNumero = 9 + idx;
      const celda: Record<string, any> = {
        col1: idx + 1,
        col2: fila.nombre,
        col3: /^\d+$/.test(fila.cedula) ? Number(fila.cedula) : fila.cedula,
        col4: fila.cargo,
        col5: new Date(`${fila.fecha}T12:00:00`),
        col6: fila.horaEntrada,
        col7: fila.horaSalida,
        col8: celdaHoras(fila.horas.recargoNocturnoOrdinario),
        col9: celdaHoras(fila.horas.recargoNocturnoFestivo),
        col10: celdaHoras(fila.horas.extraDiurna),
        col11: celdaHoras(fila.horas.extraNocturna),
        col12: celdaHoras(fila.horas.dominicalDiurna),
        col13: celdaHoras(fila.horas.dominicalNocturna),
        col14: celdaHoras(fila.horas.extraDominicalDiurna),
        col15: celdaHoras(fila.horas.extraDominicalNocturna),
        col16: '',
        col17: ''
      };
      const filaExcel = worksheet.addRow(celda);
      filaExcel.eachCell((celdaExcel: ExcelJS.Cell) => {
        celdaExcel.font = fuenteDatos;
        celdaExcel.alignment = { horizontal: 'center', vertical: 'top', wrapText: true };
      });
      worksheet.getCell(filaNumero, 1).font = { bold: true, size: 5, name: 'Arial' };
      worksheet.getCell(filaNumero, 1).numFmt = '0';
      worksheet.getCell(filaNumero, 1).alignment = { horizontal: 'center', vertical: 'top', wrapText: true, shrinkToFit: true };
      worksheet.getCell(filaNumero, 3).numFmt = '0';
      worksheet.getCell(filaNumero, 3).alignment = { horizontal: 'center', vertical: 'top', wrapText: true, shrinkToFit: true };
      worksheet.getCell(filaNumero, 5).numFmt = 'd/mm/yyyy;@';
      worksheet.getCell(filaNumero, 5).alignment = { horizontal: 'center', vertical: 'top', wrapText: true, shrinkToFit: true };
      worksheet.getCell(filaNumero, 8).font = { size: 5, name: 'Calibri' };
      worksheet.getCell(filaNumero, 8).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      worksheet.getCell(filaNumero, 9).font = { size: 5, name: 'Calibri' };
      worksheet.getCell(filaNumero, 9).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      worksheet.getCell(filaNumero, 15).numFmt = '0';
      worksheet.getCell(filaNumero, 15).alignment = { horizontal: 'center', vertical: 'top', wrapText: true, shrinkToFit: true };
    });

    // Pie
    const ultimaFila = 8 + filas.length;
    const filaVacia = ultimaFila + 1;
    const filaObs = filaVacia + 1;
    const filaNota = filaObs + 1;
    const filaEspacio = filaNota + 1;
    const filaElab = filaEspacio + 1;

    worksheet.mergeCells(`A${filaObs}:Q${filaObs}`);
    worksheet.mergeCells(`A${filaNota}:Q${filaNota}`);
    worksheet.mergeCells(`A${filaEspacio}:Q${filaEspacio}`);
    worksheet.mergeCells(`A${filaElab}:B${filaElab}`);
    worksheet.mergeCells(`D${filaElab}:F${filaElab}`);
    worksheet.mergeCells(`G${filaElab}:Q${filaElab + 2}`);
    worksheet.mergeCells(`A${filaElab + 1}:B${filaElab + 1}`);
    worksheet.mergeCells(`D${filaElab + 1}:F${filaElab + 1}`);
    worksheet.mergeCells(`A${filaElab + 2}:B${filaElab + 2}`);
    worksheet.mergeCells(`D${filaElab + 2}:F${filaElab + 2}`);

    worksheet.getCell(`A${filaObs}`).value = 'OBSERVACIONES:';
    worksheet.getCell(`A${filaNota}`).value =
      'LOS TÉCNICOS QUE TRABAJAN HASTA LAS 20:00 SE TOMAN UNA HORA DE ALMUERZO DURANTE LA JORNADA.';
    worksheet.getCell(`A${filaElab}`).value = 'ELABORADO POR:';
    worksheet.getCell(`A${filaElab + 1}`).value = 'CARGO:';
    worksheet.getCell(`A${filaElab + 2}`).value = 'FIRMA:';

    for (const ref of [`A${filaObs}`, `A${filaNota}`, `A${filaElab + 1}`, `A${filaElab + 2}`]) {
      worksheet.getCell(ref).font = fuenteTitulo;
      worksheet.getCell(ref).alignment = { horizontal: 'center', vertical: 'top', wrapText: true };
    }
    worksheet.getCell(`A${filaElab}`).font = fuenteTitulo;
    worksheet.getCell(`A${filaElab}`).alignment = { horizontal: 'left', vertical: 'top', wrapText: true, indent: 3 };
    worksheet.getCell(`D${filaElab}`).font = fuenteValorFirma;
    worksheet.getCell(`D${filaElab}`).alignment = { horizontal: 'center', vertical: 'top', wrapText: true };
    worksheet.getCell(`D${filaElab + 1}`).font = fuenteValorFirma;
    worksheet.getCell(`D${filaElab + 1}`).alignment = { horizontal: 'left', vertical: 'top', wrapText: true, indent: 5 };

    // Bordes en toda la tabla
    aplicarBordes(worksheet, filaElab + 2);

    // Altura de filas
    worksheet.getRow(1).height = 8.85;
    worksheet.getRow(2).height = 8.85;
    worksheet.getRow(3).height = 8.85;
    worksheet.getRow(4).height = 6.6;
    worksheet.getRow(5).height = 10.7;
    worksheet.getRow(6).height = 6.6;
    worksheet.getRow(7).height = 16.5;
    worksheet.getRow(8).height = 8.85;
    for (let i = 9; i <= ultimaFila; i++) {
      worksheet.getRow(i).height = 8.85;
    }
    worksheet.getRow(filaVacia).height = 8.85;
    worksheet.getRow(filaObs).height = 8.85;
    worksheet.getRow(filaNota).height = 26.25;
    worksheet.getRow(filaEspacio).height = 6.6;
    worksheet.getRow(filaElab).height = 8.85;
    worksheet.getRow(filaElab + 1).height = 8.85;
    worksheet.getRow(filaElab + 2).height = 18;

    // Configuración de impresión
    worksheet.pageSetup = {
      orientation: 'portrait',
      fitToPage: false,
      scale: 53,
      fitToWidth: 1,
      fitToHeight: 1,
      pageOrder: 'downThenOver',
      paperSize: 9,
      margins: {
        left: 0.7,
        right: 0.7,
        top: 0.75,
        bottom: 0.75,
        header: 0.3,
        footer: 0.3
      }
    };

    // Vista del libro (zoom y vista previa de salto de página igual al original)
    worksheet.views = [
      {
        state: 'normal',
        style: 'pageBreakPreview',
        rightToLeft: false,
        activeCell: `A${filaObs}`,
        showRuler: true,
        showRowColHeaders: true,
        showGridLines: true,
        zoomScale: 150,
        zoomScaleNormal: 150
      }
    ];

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
}
