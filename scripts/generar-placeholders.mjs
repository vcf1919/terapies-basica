/**
 * Genera imágenes de placeholder (abstractas, con grano) para los ejemplos.
 * Uso: npm run placeholders
 * Sustitúyelas por fotos reales/libres antes de enseñar una demo.
 * Código de PLANTILLA.
 */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const PALETAS = {
  salud: { bg: ['#e9f0ee', '#cfe0db'], tonos: ['#175d5a', '#7fc3b2', '#f3f6f5', '#a7c4bd', '#2f7a72'], piel: '#c9a892' },
  belleza: { bg: ['#efe6da', '#d9c6b1'], tonos: ['#6e3b2a', '#c49a74', '#f6efe6', '#a9785a', '#3b2720'], piel: '#c79a7c' },
  comercio: { bg: ['#f4eedf', '#e5d8bd'], tonos: ['#1f4d3a', '#f0b23e', '#fbf8f2', '#5f8b4c', '#c4632f'], piel: '#c69a78' },
};

function rng(seed) {
  let s = [...seed].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

const grain = (id, o = 0.09) => `
  <filter id="g${id}" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"/>
    <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${o} 0"/>
  </filter>`;

function escena(w, h, pal, seed) {
  const r = rng(seed);
  const pick = () => pal.tonos[Math.floor(r() * pal.tonos.length)];
  let shapes = '';
  // "habitación": suelo + pared con luz de ventana
  const horizon = h * (0.55 + r() * 0.2);
  shapes += `<rect x="0" y="${horizon}" width="${w}" height="${h - horizon}" fill="${pal.bg[1]}" opacity=".9"/>`;
  shapes += `<rect x="${w * (0.08 + r() * 0.5)}" y="${h * 0.08}" width="${w * (0.18 + r() * 0.2)}" height="${horizon * 0.75}" fill="#fff" opacity=".55" filter="url(#b1)"/>`;
  for (let i = 0; i < 5; i++) {
    const cx = r() * w, cy = h * (0.3 + r() * 0.65), rx = w * (0.08 + r() * 0.22), ry = rx * (0.5 + r());
    shapes += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${pick()}" opacity="${0.35 + r() * 0.5}" filter="url(#b2)"/>`;
  }
  // objeto nítido en primer plano (rectángulo redondeado)
  const ow = w * (0.12 + r() * 0.16), oh = h * (0.18 + r() * 0.25);
  shapes += `<rect x="${w * (0.15 + r() * 0.6)}" y="${horizon - oh * 0.7}" width="${ow}" height="${oh}" rx="${ow * 0.12}" fill="${pick()}" opacity=".92" filter="url(#b0)"/>`;
  return shapes;
}

function retrato(w, h, pal, seed) {
  const r = rng(seed);
  const ropa = pal.tonos[Math.floor(r() * 2)];
  const cx = w * (0.45 + r() * 0.1);
  return `
    <ellipse cx="${cx}" cy="${h * 1.02}" rx="${w * 0.42}" ry="${h * 0.36}" fill="${ropa}" filter="url(#b0)"/>
    <rect x="${cx - w * 0.07}" y="${h * 0.48}" width="${w * 0.14}" height="${h * 0.2}" rx="${w * 0.05}" fill="${pal.piel}" filter="url(#b0)"/>
    <ellipse cx="${cx}" cy="${h * 0.4}" rx="${w * 0.16}" ry="${h * 0.15}" fill="${pal.piel}" filter="url(#b0)"/>
    <ellipse cx="${cx - w * 0.02}" cy="${h * 0.3}" rx="${w * 0.18}" ry="${h * 0.1}" fill="${pal.tonos[4]}" opacity=".85" filter="url(#b0)"/>`;
}

async function imagen(file, w, h, pal, seed, tipo = 'escena') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${pal.bg[0]}"/><stop offset="1" stop-color="${pal.bg[1]}"/></linearGradient>
      <filter id="b0" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="${w * 0.004}"/></filter>
      <filter id="b1" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="${w * 0.03}"/></filter>
      <filter id="b2" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="${w * 0.06}"/></filter>
      <radialGradient id="v" cx=".5" cy=".45" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></radialGradient>
      ${grain(1)}
    </defs>
    <rect width="100%" height="100%" fill="url(#bg)"/>
    ${tipo === 'retrato' ? `<ellipse cx="${w * 0.7}" cy="${h * 0.25}" rx="${w * 0.4}" ry="${h * 0.3}" fill="#fff" opacity=".5" filter="url(#b2)"/>` + retrato(w, h, pal, seed) : escena(w, h, pal, seed)}
    <rect width="100%" height="100%" fill="url(#v)"/>
    <rect width="100%" height="100%" filter="url(#g1)"/>
  </svg>`;
  await sharp(Buffer.from(svg)).jpeg({ quality: 82, mozjpeg: true }).toFile(file);
}

function logo(nombre, sub, color, fuente, extra = '') {
  const w = 40 + nombre.length * 19;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="64" viewBox="0 0 ${w} 64" fill="${color}">
  ${extra}
  <text x="0" y="36" font-family="${fuente}" font-size="34" font-weight="600" letter-spacing="-1">${nombre}</text>
  <text x="1" y="56" font-family="Helvetica, Arial, sans-serif" font-size="11" letter-spacing="3.2" opacity=".75">${sub}</text>
</svg>`;
}

const EJEMPLOS = {
  salud: { nombre: 'Vora', sub: 'CLÍNICA DENTAL', fuente: 'Helvetica, Arial, sans-serif', equipo: 3, galeria: 6, productos: 0 },
  belleza: { nombre: 'Olivera', sub: 'ESTUDI DE BELLESA', fuente: 'Didot, Georgia, serif', equipo: 3, galeria: 6, productos: 0 },
  comercio: { nombre: 'Verdal', sub: 'PLANTES I FLORS', fuente: 'Helvetica, Arial, sans-serif', equipo: 2, galeria: 6, productos: 6 },
};

for (const [id, e] of Object.entries(EJEMPLOS)) {
  const pal = PALETAS[id];
  const dir = path.resolve('examples/assets', id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'logo.svg'), logo(e.nombre, e.sub, pal.tonos[id === 'belleza' ? 4 : 0], e.fuente));
  fs.writeFileSync(path.join(dir, 'logo-claro.svg'), logo(e.nombre, e.sub, '#f6f2ec', e.fuente));
  await imagen(path.join(dir, 'hero.jpg'), 2000, 1500, pal, id + 'hero');
  await imagen(path.join(dir, 'sobre.jpg'), 1200, 1500, pal, id + 'sobre');
  await imagen(path.join(dir, 'og.jpg'), 1200, 630, pal, id + 'og');
  for (let i = 1; i <= e.equipo; i++) await imagen(path.join(dir, `equipo-${i}.jpg`), 900, 1125, pal, id + 'eq' + i, 'retrato');
  for (let i = 1; i <= e.galeria; i++) await imagen(path.join(dir, `galeria-${i}.jpg`), 1600, i % 2 ? 1200 : 1600, pal, id + 'gal' + i);
  for (let i = 1; i <= e.productos; i++) await imagen(path.join(dir, `producto-${i}.jpg`), 1000, 1000, pal, id + 'prod' + i);
  console.log(`✔ examples/assets/${id}`);
}
