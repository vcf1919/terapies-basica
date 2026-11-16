/** Anclas y menú a partir de las secciones activas. Código de PLANTILLA. */
import type { SiteConfig, SeccionKey } from './schema';
import { t } from '../i18n/es';

const ANCLA: Record<SeccionKey, string> = {
  hero: 'inicio', sobre: 'nosotros', servicios: 'servicios', equipo: 'equipo',
  opiniones: 'opiniones', galeria: 'galeria', proceso: 'como-trabajamos', faq: 'preguntas',
  ubicacion: 'ubicacion', ctaFinal: 'reservar',
};

export function anclaDe(cfg: SiteConfig, key: SeccionKey) {
  return cfg.secciones[key]?.id ?? ANCLA[key];
}

export function navItems(cfg: SiteConfig, orden: SeccionKey[], enInicio: boolean) {
  return orden
    .map((key) => {
      const s = cfg.secciones[key];
      if (!s || s.menu === false) return null;
      const label = s.menu ?? (t.menu as Record<string, string>)[key];
      if (!label) return null; // hero y ctaFinal no salen salvo que se pida
      return { label, href: `${enInicio ? '' : '/'}#${anclaDe(cfg, key)}` };
    })
    .filter((x): x is { label: string; href: string } => !!x);
}
