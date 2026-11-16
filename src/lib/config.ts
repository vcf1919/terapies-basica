/**
 * Carga y valida el config del cliente. Código de PLANTILLA.
 *
 * - Por defecto lee src/content/site.config.json y busca las fotos en src/assets/cliente/.
 * - Con la variable SITE_CONFIG=examples/<nombre>.json lee un ejemplo y busca sus fotos
 *   en examples/assets/<nombre>/.
 * Si algo no cuadra, lanza un error legible y el build se detiene.
 */
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { siteConfigSchema, type SiteConfig } from './schema';

z.config(z.locales.es());

const ROOT = process.cwd();
const DEFAULT_CONFIG = 'src/content/site.config.json';
const IMG_EXT = /\.(jpe?g|png|webp|avif|svg)$/i;

export class ConfigError extends Error {
  constructor(file: string, lines: string[]) {
    super(
      `\n\n✖ El archivo de configuración no es válido: ${file}\n\n` +
        lines.map((l) => `   • ${l}`).join('\n') +
        `\n\nCorrige estos campos y vuelve a lanzar el build.\n`,
    );
    this.name = 'ConfigError';
  }
}

/** Ruta del JSON activo, relativa a la raíz del proyecto. */
export function configPath(): string {
  return (process.env.SITE_CONFIG || DEFAULT_CONFIG).replace(/\\/g, '/').replace(/^\.\//, '');
}

/** Carpeta de imágenes asociada al JSON activo (relativa a la raíz, sin barra final). */
export function assetsDirFor(file: string): string {
  const m = file.match(/^examples\/([^/]+)\.json$/);
  return m ? `examples/assets/${m[1]}` : 'src/assets/cliente';
}

/** Recorre el objeto y devuelve [ruta, src] de cada imagen ({ src, alt }). */
function collectImages(node: unknown, trail: (string | number)[] = [], out: [string, string][] = []) {
  if (Array.isArray(node)) node.forEach((v, i) => collectImages(v, [...trail, i], out));
  else if (node && typeof node === 'object') {
    const o = node as Record<string, unknown>;
    if (typeof o.src === 'string' && 'alt' in o && IMG_EXT.test(o.src)) out.push([trail.join('.'), o.src]);
    for (const [k, v] of Object.entries(o)) collectImages(v, [...trail, k], out);
  }
  return out;
}

export function loadConfig(file = configPath()): { config: SiteConfig; assetsDir: string; file: string } {
  const abs = path.resolve(ROOT, file);
  if (!fs.existsSync(abs)) throw new ConfigError(file, [`No existe el archivo ${file}`]);

  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(abs, 'utf8'));
  } catch (e) {
    throw new ConfigError(file, [`JSON mal formado: ${(e as Error).message}`]);
  }

  const result = siteConfigSchema.safeParse(raw);
  if (!result.success) {
    throw new ConfigError(
      file,
      result.error.issues.map((i) => `${i.path.length ? i.path.join('.') : '(raíz)'} → ${i.message}`),
    );
  }

  const assetsDir = assetsDirFor(file);
  const missing = collectImages(result.data)
    .filter(([, src]) => !fs.existsSync(path.resolve(ROOT, assetsDir, src)))
    .map(([where, src]) => `${where}.src → no se encuentra "${src}" en ${assetsDir}/`);
  const fav = result.data.sitio.favicon;
  if (fav && !fs.existsSync(path.resolve(ROOT, 'public', fav.slice(1)))) {
    missing.push(`sitio.favicon → no se encuentra public${fav}`);
  }
  const fondo = result.data.secciones.hero?.fondo;
  if (fondo?.tipo === 'video' && !fs.existsSync(path.resolve(ROOT, 'public', fondo.src.slice(1)))) {
    missing.push(`secciones.hero.fondo.src → no se encuentra public${fondo.src}`);
  }
  if (missing.length) throw new ConfigError(file, missing);

  return { config: result.data, assetsDir, file };
}

let cached: ReturnType<typeof loadConfig> | undefined;
export function getSite() {
  return (cached ??= loadConfig());
}
