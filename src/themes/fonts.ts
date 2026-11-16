/**
 * Tipografías autoalojadas (subconjunto latino, fuentes variables). Código de PLANTILLA.
 * Solo se cargan en el navegador las dos que usa el sitio.
 */
import schibsted from '@fontsource-variable/schibsted-grotesk/files/schibsted-grotesk-latin-wght-normal.woff2?url';
import hanken from '@fontsource-variable/hanken-grotesk/files/hanken-grotesk-latin-wght-normal.woff2?url';
import bodoni from '@fontsource-variable/bodoni-moda/files/bodoni-moda-latin-opsz-normal.woff2?url';
import bodoniItalic from '@fontsource-variable/bodoni-moda/files/bodoni-moda-latin-opsz-italic.woff2?url';
import instrument from '@fontsource-variable/instrument-sans/files/instrument-sans-latin-wght-normal.woff2?url';
import familjen from '@fontsource-variable/familjen-grotesk/files/familjen-grotesk-latin-wght-normal.woff2?url';
import onest from '@fontsource-variable/onest/files/onest-latin-wght-normal.woff2?url';
import newsreader from '@fontsource-variable/newsreader/files/newsreader-latin-opsz-normal.woff2?url';
import newsreaderItalic from '@fontsource-variable/newsreader/files/newsreader-latin-opsz-italic.woff2?url';
import literata from '@fontsource-variable/literata/files/literata-latin-opsz-normal.woff2?url';
import type { FUENTES } from '../lib/schema';

export type FuenteKey = (typeof FUENTES)[number];

type Fuente = {
  family: string;
  url: string;
  italic?: string;
  weight: string; // rango variable
  fallback: string;
};

const SANS = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
const SERIF = 'ui-serif, Georgia, "Times New Roman", serif';

export const fuentes: Record<FuenteKey, Fuente> = {
  'schibsted-grotesk': { family: 'Schibsted Grotesk', url: schibsted, weight: '400 900', fallback: SANS },
  'hanken-grotesk': { family: 'Hanken Grotesk', url: hanken, weight: '100 900', fallback: SANS },
  'bodoni-moda': { family: 'Bodoni Moda', url: bodoni, italic: bodoniItalic, weight: '400 900', fallback: SERIF },
  'instrument-sans': { family: 'Instrument Sans', url: instrument, weight: '400 700', fallback: SANS },
  'familjen-grotesk': { family: 'Familjen Grotesk', url: familjen, weight: '400 700', fallback: SANS },
  onest: { family: 'Onest', url: onest, weight: '100 900', fallback: SANS },
  newsreader: { family: 'Newsreader', url: newsreader, italic: newsreaderItalic, weight: '200 800', fallback: SERIF },
  literata: { family: 'Literata', url: literata, weight: '200 900', fallback: SERIF },
};

export function fontFaceCss(keys: FuenteKey[]) {
  return [...new Set(keys)]
    .flatMap((k) => {
      const f = fuentes[k];
      const face = (url: string, style: string) =>
        `@font-face{font-family:"${f.family}";font-style:${style};font-display:swap;font-weight:${f.weight};src:url(${url}) format("woff2-variations"),url(${url}) format("woff2");unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;}`;
      return [face(f.url, 'normal'), f.italic ? face(f.italic, 'italic') : ''];
    })
    .join('');
}

export const stack = (k: FuenteKey) => `"${fuentes[k].family}", ${fuentes[k].fallback}`;
