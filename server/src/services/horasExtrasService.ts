import ExcelJS from "exceljs";
import path from "path";
import fs from "fs";
import { RegistroAsistencia, Persona, Cargo } from "../models";

// Reglas de cálculo (estándar laboral colombiano)
const JORNADA_BASE_MIN = 440; // 7.33 horas al día para dominicales/festivas (44 horas semanales / 6 días)
const JORNADA_BASE_ORDINARIO_MIN = 480; // 8 horas al día para jornadas ordinarias
const MIN_DIA_INICIO = 360; // 06:00 -> fin de la franja nocturna
const MIN_NOCHE_INICIO = 1140; // 19:00 -> inicio de la franja nocturna (normativa 2026)
const MINUTOS_ALMUERZO = 60; // 1 hora de almuerzo en turnos de más de 8 horas
const LIMITE_SIN_ALMUERZO_MIN = 480; // 8 horas

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const ANCHO_COLUMNAS = [
  4.33, 24.5, 24.5, 38.35, 11.05, 11.05, 11.05, 11.05, 10.61,
  11.48, 11.26, 11.48, 11.26, 11.48, 11.26,
  11.48, 11.26,
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
  empresa: string;
  fecha: string;
  horaEntrada: string;
  horaSalida: string;
  esDominical: boolean;
  horas: HorasCalculadas;
}

function aMinutos(valor: any): number {
  if (valor instanceof Date) {
    return valor.getHours() * 60 + valor.getMinutes();
  }
  const partes = String(valor).split(":").map(Number);
  return partes[0] * 60 + (partes[1] || 0);
}

function formatoHora(valor: any): string {
  if (valor instanceof Date) {
    const hh = String(valor.getHours()).replace(/^0/, "");
    const mm = String(valor.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  }
  return String(valor)
    .slice(0, 5)
    .replace(/^0(\d):/, "$1:");
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

function calcularHoras(
  minutos: number[],
  esDominical: boolean,
): HorasCalculadas {
  const horas: HorasCalculadas = {
    dominicalDiurna: 0,
    dominicalNocturna: 0,
    extraDominicalDiurna: 0,
    extraDominicalNocturna: 0,
    recargoNocturnoOrdinario: 0,
    recargoNocturnoFestivo: 0,
    extraDiurna: 0,
    extraNocturna: 0,
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

function celdaHoras(valor: number): number | "" {
  return valor > 0 ? redondearHoras(valor) : "";
}

function formatearFecha(fecha: Date): string {
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}/${fecha.getFullYear()}`;
}

function formatearPeriodo(fecha: Date, conAnio: boolean): string {
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = MESES[fecha.getMonth()];
  return conAnio
    ? `${dia} de ${mes} del  ${fecha.getFullYear()}`
    : `${dia} de ${mes}`;
}

function textoCompania(empresa?: string): { richText: ExcelJS.RichText[] } {
  if (empresa === 'Servired') {
    return {
      richText: [
        {
          font: { bold: true, size: 8, name: "Arial" },
          text: "Grupo Empresarial Servired S.A.",
        },
      ],
    };
  }
  if (empresa === 'Multired') {
    return {
      richText: [
        {
          font: { bold: true, size: 8, name: "Arial" },
          text: "Grupo Empresarial Multired S.A.",
        },
      ],
    };
  }
  return {
    richText: [
      {
        font: { bold: true, size: 8, name: "Arial" },
        text: "Grupo Empresarial Servired S.A. ",
      },
      {
        font: { bold: true, underline: true, size: 8, name: "Arial" },
        text: "\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0",
      },
      {
        font: { bold: true, size: 8, name: "Arial" },
        text: "Grupo Empresarial Multired S.A. _",
      },
      {
        font: { bold: true, underline: true, size: 8, name: "Arial" },
        text: "X",
      },
    ],
  };
}

function aplicarBordes(worksheet: ExcelJS.Worksheet, filas: number) {
  for (let r = 1; r <= filas; r++) {
    for (let c = 1; c <= 17; c++) {
      const celda = worksheet.getCell(r, c);
      celda.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    }
  }
}

export class HorasExtrasService {
  async generarExcel(registros: RegistroAsistencia[], empresa?: string): Promise<any> {
    let registrosFiltrados = registros;
    if (empresa) {
      registrosFiltrados = registros.filter((r: any) => {
        const persona: Persona | undefined = r.persona;
        return persona?.empresa === empresa;
      });
    }

    const filas: FilaReporte[] = registrosFiltrados
      .map((registro: any) => {
        const persona: Persona | undefined = registro.persona;
        const cargo: Cargo | undefined = registro.cargo;

        const minutos = descontarAlmuerzo(
          minutosDeTurno(registro.horaEntrada, registro.horaSalida),
        );

        const horas = calcularHoras(minutos, Boolean(registro.esDominical));
        horas.extraDiurna += (Number(registro.horasExtraDiurnaOrd) || 0) * 60;
        horas.extraNocturna += (Number(registro.horasExtraNocturnaOrd) || 0) * 60;

        return {
          nombre: persona
            ? `${persona.nombres} ${persona.apellidos}`.trim()
            : "",
          cedula: persona?.cedula || "",
          cargo: cargo?.nombre || "",
          empresa: persona?.empresa || "",
          fecha: registro.fecha,
          horaEntrada: formatoHora(registro.horaEntrada),
          horaSalida: formatoHora(registro.horaSalida),
          esDominical: Boolean(registro.esDominical),
          horas,
        };
      })
      .sort((a, b) => {
        // 1. Dominicales/festivos primero
        if (a.esDominical !== b.esDominical) return a.esDominical ? -1 : 1;
        // 2. Por nombre
        const porNombre = a.nombre.localeCompare(b.nombre);
        if (porNombre !== 0) return porNombre;
        // 3. Por fecha
        const porFecha = a.fecha.localeCompare(b.fecha);
        if (porFecha !== 0) return porFecha;
        // 4. Por hora de entrada
        return a.horaEntrada.localeCompare(b.horaEntrada);
      });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Table 1");

    worksheet.columns = ANCHO_COLUMNAS.map((width, i) => ({
      width,
      key: `col${i + 1}`,
    }));

    const fuenteTitulo: Partial<ExcelJS.Font> = {
      bold: true,
      size: 8,
      name: "Arial",
    };
    const fuenteDatos: Partial<ExcelJS.Font> = {
      size: 8,
      name: "Calibri",
    };
    const fuenteValorFirma: Partial<ExcelJS.Font> = {
      size: 8,
      name: "Arial MT",
    };

    const colorGrupoUno = "FFB7E1CD";
    const colorGrupoDos = "FFD9E2F3";
    const colorGrupoTres = "FFF7E7A3";
    const colorGrupoCuatro = "FFF7D7B5";
    const colorGrupoCinco = "FFD9F0F1";
    const colorGris = "FFB3B3B3";

    const pintarGrupo = (refs: string[], color: string): void => {
      refs.forEach((ref) => {
        worksheet.getCell(ref).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: color },
        };
      });
    };

    const alinear = (ref: string, align: Partial<ExcelJS.Alignment>): void => {
      worksheet.getCell(ref).alignment = align;
    };

    // Encabezado institucional
    worksheet.mergeCells("A1:B3");
    worksheet.mergeCells("C1:O1");
    worksheet.mergeCells("C2:O2");
    worksheet.mergeCells("C3:O3");

    worksheet.getCell("C1").value = "PROCESO: FINANCIERO";
    worksheet.getCell("C2").value = "FORMATO";
    worksheet.getCell("C3").value = "REPORTE DE HORAS EXTRAS";
    worksheet.getCell("P1").value = "CÓDIGO:";
    worksheet.getCell("Q1").value = "FO-CT-04";
    worksheet.getCell("P2").value = "VERSIÓN:";
    worksheet.getCell("Q2").value = 2;
    worksheet.getCell("P3").value = "FECHA:";
    worksheet.getCell("Q3").value = new Date();

    for (const ref of ["C1", "C2", "C3", "P1", "Q1", "P2", "P3", "Q3"]) {
      worksheet.getCell(ref).font = fuenteTitulo;
      worksheet.getCell(ref).alignment = {
        horizontal: "center",
        vertical: "top",
        wrapText: true,
      };
    }
    worksheet.getCell("Q2").font = fuenteTitulo;
    worksheet.getCell("Q2").numFmt = "00";
    worksheet.getCell("Q2").alignment = {
      horizontal: "center",
      vertical: "top",
      shrinkToFit: true,
    };
    worksheet.getCell("Q3").numFmt = "d/mm/yyyy;@";
    worksheet.getCell("Q3").alignment = {
      horizontal: "center",
      vertical: "top",
      shrinkToFit: true,
    };

    // Periodo
    worksheet.mergeCells("A4:Q4");
    worksheet.mergeCells("A5:B5");
    worksheet.mergeCells("C5:D5");
    worksheet.mergeCells("E5:F5");
    worksheet.mergeCells("G5:Q5");

    const fechas = filas.map((f) => new Date(`${f.fecha}T12:00:00`));
    const periodo =
      filas.length > 0
        ? `${formatearPeriodo(new Date(fechas.reduce((min, d) => Math.min(min, d.getTime()), Infinity)), false)} al ${formatearPeriodo(new Date(fechas.reduce((max, d) => Math.max(max, d.getTime()), -Infinity)), true)}`
        : "";

    worksheet.getCell("A5").value = "PERIODO:";
    worksheet.getCell("C5").value = periodo;
    worksheet.getCell("E5").value = "COMPAÑÍA";
    worksheet.getCell("G5").value = textoCompania(empresa);

    worksheet.getCell("A5").font = fuenteTitulo;
    worksheet.getCell("C5").font = fuenteTitulo;
    worksheet.getCell("C5").alignment = {
      horizontal: "left",
      vertical: "top",
      wrapText: true,
      indent: 8,
    };
    worksheet.getCell("E5").font = fuenteTitulo;
    worksheet.getCell("E5").alignment = {
      horizontal: "left",
      vertical: "top",
      wrapText: true,
      indent: 3,
    };
    worksheet.getCell("G5").alignment = {
      horizontal: "center",
      vertical: "top",
      wrapText: true,
    };

    worksheet.getCell("A5").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: colorGris },
    };
    worksheet.getCell("E5").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: colorGris },
    };
    worksheet.getCell("C5").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFFFFFF" },
    };
    worksheet.getCell("G5").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFFFFFF" },
    };

    worksheet.mergeCells("A6:Q6");

    // Encabezados de la tabla
    worksheet.mergeCells("H7:I7");
    worksheet.mergeCells("J7:K7");
    worksheet.mergeCells("L7:M7");
    worksheet.mergeCells("N7:O7");
    worksheet.mergeCells("P7:Q7");

    const encabezados = [
      ["A7", "NO°"],
      ["B7", "NOMBRES Y APELLIDOS"],
      ["C7", "NÚMERO DE DOCUMENTO"],
      ["D7", "CARGO"],
      ["E7", "FECHA"],
      ["F7", "HORA ENTRADA"],
      ["G7", "HORA SALIDA"],
      ["H7", "RECARGO NOCTURNO"],
      ["J7", "HORAS EXTRAS"],
      ["L7", "HORAS DOMINICALES"],
      ["N7", "HORAS EXTRAS DOMINICALES"],
      ["P7", "HORAS EXTRAS FESTIVAS"],
    ];
    for (const [ref, texto] of encabezados) {
      worksheet.getCell(ref).value = texto;
      worksheet.getCell(ref).font = fuenteTitulo;
      worksheet.getCell(ref).alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };
      worksheet.getCell(ref).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: colorGris },
      };
    }
    // Alineaciones originales de la plantilla
    alinear("F7", {
      horizontal: "left",
      vertical: "top",
      wrapText: true,
      indent: 1,
    });
    alinear("H7", {
      horizontal: "left",
      vertical: "top",
      wrapText: true,
      indent: 1,
    });
    alinear("J7", {
      horizontal: "left",
      vertical: "top",
      wrapText: true,
      indent: 2,
    });
    alinear("L7", {
      horizontal: "left",
      vertical: "top",
      wrapText: true,
      indent: 1,
    });
    alinear("N7", { horizontal: "left", vertical: "top", wrapText: true });
    alinear("P7", {
      horizontal: "left",
      vertical: "top",
      wrapText: true,
      indent: 1,
    });

    const subencabezados: Array<[string, string, Partial<ExcelJS.Alignment>]> =
      [
        ["H8", "ORDINARIO", { horizontal: "center" }],
        ["I8", "FESTIVO", { horizontal: "left", indent: 1 }],
        ["J8", "DIURNA", { horizontal: "left", indent: 1 }],
        ["K8", "NOCTURNA", { horizontal: "left" }],
        ["L8", "DIURNA", { horizontal: "center" }],
        ["M8", "NOCTURNA", { horizontal: "left" }],
        ["N8", "DIURNA", { horizontal: "center" }],
        ["O8", "NOCTURNA", { horizontal: "center" }],
        ["P8", "DIURNA", { horizontal: "center" }],
        ["Q8", "NOCTURNA", { horizontal: "center" }],
      ];
    for (const [ref, texto, align] of subencabezados) {
      worksheet.getCell(ref).value = texto;
      worksheet.getCell(ref).font = fuenteTitulo;
      worksheet.getCell(ref).alignment = {
        ...align,
        vertical: "top",
        wrapText: true,
      };
    }

    // RECARGO NOCTURNO: ORDINARIO y FESTIVO en Calibri 8, centrados vertical y horizontalmente
    worksheet.getCell("H8").font = { bold: true, size: 8, name: "Calibri" };
    worksheet.getCell("H8").alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };
    worksheet.getCell("I8").font = { bold: true, size: 8, name: "Calibri" };
    worksheet.getCell("I8").alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };

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
        col16: "",
        col17: "",
      };
      const filaExcel = worksheet.addRow(celda);
      filaExcel.eachCell((celdaExcel: ExcelJS.Cell) => {
        celdaExcel.font = fuenteDatos;
        celdaExcel.alignment = {
          horizontal: "center",
          vertical: "top",
          wrapText: true,
        };
      });
      worksheet.getCell(filaNumero, 1).font = {
        bold: true,
        size: 8,
        name: "Arial",
      };
      worksheet.getCell(filaNumero, 1).numFmt = "0";
      worksheet.getCell(filaNumero, 1).alignment = {
        horizontal: "center",
        vertical: "top",
        wrapText: true,
        shrinkToFit: true,
      };
      worksheet.getCell(filaNumero, 3).numFmt = "0";
      worksheet.getCell(filaNumero, 3).alignment = {
        horizontal: "center",
        vertical: "top",
        wrapText: true,
        shrinkToFit: true,
      };
      worksheet.getCell(filaNumero, 5).numFmt = "d/mm/yyyy;@";
      worksheet.getCell(filaNumero, 5).alignment = {
        horizontal: "center",
        vertical: "top",
        wrapText: true,
        shrinkToFit: true,
      };
      worksheet.getCell(filaNumero, 8).font = { size: 8, name: "Calibri" };
      worksheet.getCell(filaNumero, 8).alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };
      worksheet.getCell(filaNumero, 9).font = { size: 8, name: "Calibri" };
      worksheet.getCell(filaNumero, 9).alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };
      worksheet.getCell(filaNumero, 15).numFmt = "0";
      worksheet.getCell(filaNumero, 15).alignment = {
        horizontal: "center",
        vertical: "top",
        wrapText: true,
        shrinkToFit: true,
      };
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

    worksheet.getCell(`A${filaObs}`).value = "OBSERVACIONES:";
    worksheet.getCell(`A${filaNota}`).value =
      "LOS TÉCNICOS QUE TRABAJAN HASTA LAS 19:00 SE TOMAN UNA HORA DE ALMUERZO DURANTE LA JORNADA.";
    worksheet.getCell(`A${filaElab}`).value = "ELABORADO POR:";
    worksheet.getCell(`A${filaElab + 1}`).value = "CARGO:";
    worksheet.getCell(`A${filaElab + 2}`).value = "FIRMA:";

    [
      `A${filaObs}`,
      `A${filaElab}`,
      `A${filaElab + 1}`,
      `A${filaElab + 2}`,
      `C${filaElab}`,
      `C${filaElab + 1}`,
      `C${filaElab + 2}`,
    ].forEach((ref) => {
      worksheet.getCell(ref).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: colorGris },
      };
    });

    for (const ref of [
      `A${filaObs}`,
      `A${filaNota}`,
      `A${filaElab + 1}`,
      `A${filaElab + 2}`,
    ]) {
      worksheet.getCell(ref).font = fuenteTitulo;
      worksheet.getCell(ref).alignment = {
        horizontal: "center",
        vertical: "top",
        wrapText: true,
      };
    }
    worksheet.getCell(`A${filaElab}`).font = fuenteTitulo;
    worksheet.getCell(`A${filaElab}`).alignment = {
      horizontal: "left",
      vertical: "top",
      wrapText: true,
      indent: 3,
    };
    worksheet.getCell(`D${filaElab}`).font = fuenteValorFirma;
    worksheet.getCell(`D${filaElab}`).alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };
    worksheet.getCell(`D${filaElab + 1}`).font = fuenteValorFirma;
    worksheet.getCell(`D${filaElab + 1}`).alignment = {
      horizontal: "center",
      vertical: "top",
      wrapText: true,
    };

    // Insertar logo de la empresa en el encabezado (A1:B3)
    const logoPath = path.resolve(
      __dirname,
      "../../assets/LOGO.png",
    );
    if (fs.existsSync(logoPath)) {
      const logoId = workbook.addImage({
        filename: logoPath,
        extension: "png",
      });
      worksheet.addImage(logoId, {
        tl: { col: 0, row: 0.3 },
        ext: { width: 140, height: 52 },
      });
    }

    // Insertar firma según empresa
    const isMultired = empresa === "Multired";
    const firmaFileName = isMultired ? "FIRMA_MULTIRED.jpeg" : "FIRMA.png";
    const firmaExt = isMultired ? "jpeg" : "png";
    const firmaPath = path.resolve(
      __dirname,
      "../../assets/" + firmaFileName,
    );
    if (fs.existsSync(firmaPath)) {
      const firmaId = workbook.addImage({
        filename: firmaPath,
        extension: firmaExt,
      });
      worksheet.addImage(firmaId, {
        tl: { col: 3.5, row: filaElab - 1.5 },
        ext: { width: 200, height: 200 },
      });
    }

    worksheet.getCell(`D${filaElab}`).value = isMultired
      ? "Diego Giraldo Garcia"
      : "Antony Hubeimar Chavez Lopez";
    worksheet.getCell(`D${filaElab + 1}`).value =
      "Coordinador de Telecomunicaciones";
    worksheet.getCell(`D${filaElab + 1}`).alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };
    // Bordes en toda la tabla
    aplicarBordes(worksheet, filaElab + 2);

    // Altura de filas
    worksheet.getRow(1).height = 28;
    worksheet.getRow(2).height = 28;
    worksheet.getRow(3).height = 28;
    worksheet.getRow(4).height = 10;
    worksheet.getRow(5).height = 16;
    worksheet.getRow(6).height = 10;
    worksheet.getRow(7).height = 25;
    worksheet.getRow(8).height = 13;
    for (let i = 9; i <= ultimaFila; i++) {
      worksheet.getRow(i).height = 13;
    }
    worksheet.getRow(filaVacia).height = 13;
    worksheet.getRow(filaObs).height = 13;
    worksheet.getRow(filaNota).height = 40;
    worksheet.getRow(filaEspacio).height = 10;
    worksheet.getRow(filaElab).height = 36;
    worksheet.getRow(filaElab + 1).height = 36;
    worksheet.getRow(filaElab + 2).height = 36;

    // Configuración de impresión
    worksheet.pageSetup = {
      orientation: "portrait",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      pageOrder: "downThenOver",
      paperSize: 9,
      margins: {
        left: 0.5,
        right: 0.5,
        top: 0.5,
        bottom: 0.5,
        header: 0.3,
        footer: 0.3,
      },
    };

    // Vista del libro
    worksheet.views = [
      {
        state: "normal",
        rightToLeft: false,
        activeCell: `A${filaObs}`,
        showRuler: true,
        showRowColHeaders: true,
        showGridLines: true,
        zoomScale: 100,
        zoomScaleNormal: 100,
      },
    ];

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
}
