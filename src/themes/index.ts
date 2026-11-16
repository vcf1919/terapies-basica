/**
 * Resuelve el tema final: preset de la variante + overrides del config.
 * Código de PLANTILLA.
 */
import type { SiteConfig, SeccionKey } from '../lib/schema';
import { contraste, sobre } from '../lib/color';
import { fontFaceCss, fuentes, stack } from './fonts';
import { salud } from './salud';
import { belleza } from './belleza';
import { comercio } from './comercio';
import type { Theme } from './types';

export const themes: Record<Theme['id'], Theme> = { salud, belleza, comercio };

export function resolveTheme(cfg: SiteConfig) {
  const base = themes[cfg.tema.variante];
  const c = { ...base.colores, ...stripUndef({
    primario: cfg.tema.colores?.primario,
    acento: cfg.tema.colores?.acento,
    fondo: cfg.tema.colores?.fondo,
  }) };
  const f = { ...base.fuentes, ...stripUndef(cfg.tema.tipografias ?? {}) };

  // Avisos de contraste (no rompen el build, pero se ven en consola)
  const avisos: string[] = [];
  if (contraste(c.tinta, c.fondo) < 4.5) avisos.push(`texto sobre fondo ${c.fondo} no llega a AA`);
  if (contraste(c.primario, c.fondo) < 3) avisos.push(`el primario ${c.primario} tiene poco contraste con el fondo`);
  for (const a of avisos) console.warn(`[tema] ⚠ ${a}`);

  const vars: Record<string, string> = {
    '--color-bg': c.fondo,
    '--color-surface': c.superficie,
    '--color-surface-2': c.superficie2,
    '--color-ink': c.tinta,
    '--color-ink-soft': c.tintaSuave,
    '--color-line': c.linea,
    '--color-primary': c.primario,
    '--color-on-primary': sobre(c.primario, '#ffffff', c.tinta),
    '--color-accent': c.acento,
    '--color-on-accent': sobre(c.acento, '#ffffff', c.tinta),
    '--color-dark': c.oscuro,
    '--color-on-dark': c.sobreOscuro,
    '--color-on-dark-soft': c.sobreOscuroSuave,
    // texto en color de marca: si el primario no da AA sobre el fondo, se usa la tinta
    '--color-primary-text': contraste(c.primario, c.fondo) >= 4.5 ? c.primario : c.tinta,
    '--font-display': stack(f.titulos),
    '--font-body': stack(f.texto),
    ...base.tokens,
  };

  const orden: SeccionKey[] = (cfg.secciones.orden ?? base.orden).filter((k) => {
    const s = cfg.secciones[k];
    return s && s.activa !== false;
  });

  return {
    id: base.id,
    vars,
    css: `:root{${Object.entries(vars).map(([k, v]) => `${k}:${v}`).join(';')}}`,
    fontFaces: fontFaceCss([f.titulos, f.texto]),
    preload: [...new Set([fuentes[f.titulos].url, fuentes[f.texto].url])],
    orden,
    hero: cfg.secciones.hero?.estilo ?? base.hero,
    servicios: cfg.secciones.servicios?.estilo ?? base.servicios,
    colores: c,
  };
}

function stripUndef<T extends object>(o: T): Partial<T> {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as Partial<T>;
}

export type ResolvedTheme = ReturnType<typeof resolveTheme>;
