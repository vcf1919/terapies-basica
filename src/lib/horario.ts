/** Utilidades de horario (build y JSON-LD). Código de PLANTILLA. */
import type { SiteConfig, Dia } from './schema';
import { t } from '../i18n/es';

export type DiaKey = (typeof t.dias)[number];

const SCHEMA_DAY: Record<DiaKey, string> = {
  lunes: 'Monday', martes: 'Tuesday', miercoles: 'Wednesday', jueves: 'Thursday',
  viernes: 'Friday', sabado: 'Saturday', domingo: 'Sunday',
};

/** "09:00" → "9:00" */
export const hora = (h: string) => h.replace(/^0(\d)/, '$1');

export function textoDia(d: Dia): string {
  if (d === 'cerrado') return t.estado.cerradoDia;
  return d.map(([a, c]) => `${hora(a)}–${hora(c)}`).join(' · ');
}

/** Filas para tablas de horario, agrupando días consecutivos iguales si se pide. */
export function filasHorario(h: SiteConfig['horario'], agrupar = false) {
  const filas = t.dias.map((k) => ({ keys: [k] as DiaKey[], texto: textoDia(h[k]), cerrado: h[k] === 'cerrado' }));
  if (!agrupar) return filas.map((f) => ({ ...f, etiqueta: t.diasNombre[f.keys[0]] }));
  const out: typeof filas = [];
  for (const f of filas) {
    const prev = out.at(-1);
    if (prev && prev.texto === f.texto) prev.keys.push(f.keys[0]);
    else out.push({ ...f, keys: [...f.keys] });
  }
  return out.map((f) => ({
    ...f,
    etiqueta:
      f.keys.length === 1
        ? t.diasNombre[f.keys[0]]
        : `${t.diasNombre[f.keys[0]]} – ${t.diasNombre[f.keys.at(-1)!]}`,
  }));
}

/** openingHoursSpecification de schema.org (un elemento por tramo). */
export function openingHoursSpec(h: SiteConfig['horario']) {
  const specs: Record<string, { opens: string; closes: string; days: string[] }> = {};
  for (const k of t.dias) {
    const d = h[k];
    if (d === 'cerrado') continue;
    for (const [opens, closes] of d) {
      const id = `${opens}-${closes}`;
      (specs[id] ??= { opens, closes, days: [] }).days.push(SCHEMA_DAY[k]);
    }
  }
  return Object.values(specs).map((s) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: s.days,
    opens: s.opens,
    closes: s.closes,
  }));
}

/** Datos mínimos que necesita el script de "Abierto ahora" en el navegador. */
export function horarioCliente(h: SiteConfig['horario']) {
  return {
    semana: t.dias.map((k) => (h[k] === 'cerrado' ? [] : h[k])),
    cierres: h.cierres.map((c) => c.fecha),
  };
}
