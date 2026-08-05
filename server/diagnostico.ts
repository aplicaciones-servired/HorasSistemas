import { RegistroAsistencia, Persona, Cargo } from './src/models';

const JORNADA_BASE_MIN = 440;
const MIN_DIA_INICIO = 360;
const MIN_NOCHE_INICIO = 1140;
const LIMITE_SIN_ALMUERZO_MIN = 480;
const MINUTOS_ALMUERZO = 60;

function aMinutos(v: any): number {
  if (v instanceof Date) return v.getHours() * 60 + v.getMinutes();
  const p = String(v).split(':').map(Number);
  return p[0] * 60 + (p[1] || 0);
}
function minutosDeTurno(en: any, sa: any): number[] {
  let e = aMinutos(en);
  let s = aMinutos(sa);
  let d = s - e;
  if (d <= 0) d += 24 * 60;
  const m: number[] = [];
  for (let i = 0; i < d; i++) m.push((e + i) % (24 * 60));
  return m;
}
function descontarAlmuerzo(min: number[]): number[] {
  if (min.length <= LIMITE_SIN_ALMUERZO_MIN) return min;
  const r = [...min];
  let rem = MINUTOS_ALMUERZO;
  let i = 0;
  while (rem > 0 && i < r.length) {
    const t = r[i];
    if (t >= 720 && t < 840) { r.splice(i, 1); rem--; } else i++;
  }
  while (rem > 0 && r.length > 0) { r.pop(); rem--; }
  return r;
}
function calc(min: number[], dom: boolean) {
  const h = { recOrd: 0, exDi: 0, exNoc: 0, domDi: 0, domNoc: 0, exDomDi: 0, exDomNoc: 0 };
  let c = 0;
  for (const t of min) {
    const noc = t >= MIN_NOCHE_INICIO || t < MIN_DIA_INICIO;
    if (dom) {
      const ex = c >= JORNADA_BASE_MIN;
      if (ex) { noc ? h.exDomNoc++ : h.exDomDi++; }
      else { noc ? h.domNoc++ : h.domDi++; }
    } else if (noc) {
      h.recOrd++;
    } else if (c >= 480) {
      h.exDi++;
    }
    c++;
  }
  return h;
}
const r = (n: number) => Math.round((n / 60) * 100) / 100;

(async () => {
  const regs = await RegistroAsistencia.findAll({
    include: [
      { model: Persona, as: 'persona' },
      { model: Cargo, as: 'cargo' }
    ],
    order: [['fecha', 'ASC'], ['horaEntrada', 'ASC']]
  });
  console.log('== REGISTROS REALES ==');
  console.log('id | fecha | persona | entrada | salida | dom | recargo | extraD | extraN | domDi | domNoc | exDomDi | exDomNoc');
  for (const reg of regs as any[]) {
    const min = descontarAlmuerzo(minutosDeTurno(reg.horaEntrada, reg.horaSalida));
    const h = calc(min, Boolean(reg.esDominical));
    const nom = reg.persona ? `${reg.persona.nombres ?? ''} ${reg.persona.apellidos ?? ''}`.trim() : '?';
    console.log(
      [reg.id, reg.fecha, nom, reg.horaEntrada, reg.horaSalida, reg.esDominical ? 'DOM' : 'ord',
       r(h.recOrd), r(h.exDi), r(h.exNoc), r(h.domDi), r(h.domNoc), r(h.exDomDi), r(h.exDomNoc)].join(' | ')
    );
  }

  console.log('== CASOS MUESTRA ==');
  const casos: Array<[string, string, string, boolean, string]> = [
    ['JHON', '13:30', '21:00', false, 'esperado H=2'],
    ['OSCAR', '13:00', '21:00', false, 'esperado H=2'],
    ['GEISON', '14:00', '21:00', false, 'esperado H=2'],
    ['JHON', '13:00', '20:00', false, 'esperado H=1'],
    ['OSCAR', '08:00', '20:00', true, 'esperado 7.33 + 2.67 + 1'],
    ['ANTHONY', '08:00', '19:00', true, 'esperado 7.33 + 2.67'],
    ['TURNO', '08:00', '20:00', false, 'noche siempre recargo: H=1 + extraD=2']
  ];
  for (const [nom, en, sa, dom, exp] of casos) {
    const min = descontarAlmuerzo(minutosDeTurno(en, sa));
    const h = calc(min, dom);
    console.log(`${nom} ${en}-${sa} ${dom ? 'DOM' : 'ord'} -> recargo ${r(h.recOrd)} | extraD ${r(h.exDi)} | extraN ${r(h.exNoc)} | domDi ${r(h.domDi)} | exDomD ${r(h.exDomDi)} | exDomN ${r(h.exDomNoc)}  [${exp}]`);
  }
})().catch((e) => { console.error(e); process.exit(1); });
