/**
 * Resuelve las rutas de imagen del config a módulos de astro:assets. Código de PLANTILLA.
 * Las rutas del JSON son relativas a la carpeta de assets del config activo.
 */
import type { ImageMetadata } from 'astro';
import { getSite } from './config';

const modules = import.meta.glob<{ default: ImageMetadata }>([
  '/src/assets/cliente/**/*.{jpg,jpeg,png,webp,avif,svg,JPG,JPEG,PNG,WEBP}',
  '/examples/assets/**/*.{jpg,jpeg,png,webp,avif,svg,JPG,JPEG,PNG,WEBP}',
]);

export async function resolveImage(src: string): Promise<ImageMetadata> {
  const key = `/${getSite().assetsDir}/${src.replace(/^\.?\//, '')}`;
  const load = modules[key];
  if (!load) throw new Error(`[imagen] No se encuentra "${src}" en ${getSite().assetsDir}/`);
  return (await load()).default;
}
