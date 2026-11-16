import type { FuenteKey } from './fonts';
import type { SeccionKey } from '../lib/schema';

export type Theme = {
  id: 'salud' | 'belleza' | 'comercio';
  /** Paleta base. primario/acento/fondo se pueden sobrescribir desde el config. */
  colores: {
    fondo: string; superficie: string; superficie2: string;
    tinta: string; tintaSuave: string; linea: string;
    primario: string; acento: string;
    oscuro: string; sobreOscuro: string; sobreOscuroSuave: string;
  };
  fuentes: { titulos: FuenteKey; texto: FuenteKey };
  /** Resto de tokens (radios, sombras, tipografía, imágenes…) como custom properties. */
  tokens: Record<string, string>;
  orden: SeccionKey[];
  hero: 'fondo' | 'dividido' | 'editorial';
  servicios: 'tarjetas' | 'lista';
};
